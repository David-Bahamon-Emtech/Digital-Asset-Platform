// src/features/Payments/ManageRecurringPaymentsScreen.js
import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
    parseISO, addDays, addWeeks, addMonths, isWithinInterval,
    startOfDay, endOfDay, format as formatDate, isValid, startOfWeek, getDay, parse as parseDate
} from 'date-fns';
import enUS from 'date-fns/locale/en-US';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css'; // Ensure CSS is imported
import { getStatusClass } from '../../utils/displayUtils'; // Assuming path is correct

const locales = {
  'en-US': enUS,
};
const localizer = dateFnsLocalizer({
  format: formatDate,
  parse: parseDate,
  startOfWeek: (date) => startOfWeek(date, { locale: locales['en-US'] }),
  getDay: getDay,
  locales,
});

// APPROACH: Create a custom standalone toolbar outside the react-big-calendar
// This ensures we have direct control over the button click events
const ManageRecurringPaymentsScreen = ({
    onBack,
    recurringPayments = [],
    onToggleRecurringStatus,
    onDeleteRecurring,
    onEditRecurring,
    onSetupNewRecurring,
    assets
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('Active');
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
    
    // Calendar specific states
    const [calendarView, setCalendarView] = useState('month');
    const [calendarDate, setCalendarDate] = useState(new Date());
    const calendarRef = useRef(null);
    
    // Separate flag to handle direct click event binding
    const [isCalendarMounted, setIsCalendarMounted] = useState(false);
    
    // Set up calendar reference when view changes to calendar
    useEffect(() => {
        if (viewMode === 'calendar') {
            // Delay to ensure DOM is ready
            setTimeout(() => {
                setIsCalendarMounted(true);
            }, 100);
        } else {
            setIsCalendarMounted(false);
        }
    }, [viewMode]);

    const filteredListPayments = useMemo(() => {
        return recurringPayments.filter(p => {
            const term = searchTerm.toLowerCase();
            const nameMatch = p.name?.toLowerCase().includes(term);
            const recipientMatch = p.recipient?.toLowerCase().includes(term);
            const amountMatch = p.amount?.toString().includes(term);
            const currencyMatch = p.currency?.toLowerCase().includes(term);
            const freqMatch = p.frequency?.toLowerCase().includes(term);
            const searchMatch = !term || nameMatch || recipientMatch || amountMatch || currencyMatch || freqMatch;
            const statusMatch = statusFilter === 'All' || p.status === statusFilter;
            return searchMatch && statusMatch;
        });
    }, [recurringPayments, searchTerm, statusFilter]);

    const upcomingOccurrences = useMemo(() => {
        const occurrences = [];
        const today = startOfDay(new Date());
        const timeframeEnd = endOfDay(addDays(today, 30));
        const paymentsToConsider = recurringPayments.filter(p =>
            (statusFilter === 'All' || p.status === statusFilter) &&
            p.status === 'Active' &&
            p.nextDate && p.nextDate !== 'TBD' && p.nextDate !== 'N/A' && p.nextDate !== 'Paused'
        );

        paymentsToConsider.forEach(payment => {
            try {
                const parsedNextDate = parseISO(payment.nextDate);
                if (!isValid(parsedNextDate)) return;
                let currentOccurrenceDate = startOfDay(parsedNextDate);
                while (currentOccurrenceDate <= timeframeEnd) {
                    if (currentOccurrenceDate >= today) {
                        occurrences.push({
                            ...payment,
                            occurrenceDate: currentOccurrenceDate,
                            occurrenceId: `${payment.id}-${formatDate(currentOccurrenceDate, 'yyyyMMdd')}`
                        });
                    }
                    let nextCalcDate = currentOccurrenceDate;
                    let foundNext = false;
                    switch (payment.frequency?.toLowerCase().split(' ')[0]) {
                        case 'daily': nextCalcDate = addDays(currentOccurrenceDate, 1); foundNext = true; break;
                        case 'weekly': nextCalcDate = addWeeks(currentOccurrenceDate, 1); foundNext = true; break;
                        case 'bi-weekly': nextCalcDate = addWeeks(currentOccurrenceDate, 2); foundNext = true; break;
                        case 'monthly': nextCalcDate = addMonths(currentOccurrenceDate, 1); foundNext = true; break;
                        case 'quarterly': nextCalcDate = addMonths(currentOccurrenceDate, 3); foundNext = true; break;
                        case 'annually': nextCalcDate = addMonths(currentOccurrenceDate, 12); foundNext = true; break;
                        default: foundNext = false; break;
                    }
                     if (foundNext) { currentOccurrenceDate = nextCalcDate; }
                     else { currentOccurrenceDate = addDays(timeframeEnd, 1); }
                }
            } catch (error) { console.error(`Error processing recurring payment ${payment.id}:`, error); }
        });
        return occurrences.sort((a, b) => a.occurrenceDate - b.occurrenceDate);
    }, [recurringPayments, statusFilter]);

    const calendarEvents = useMemo(() => {
        return upcomingOccurrences.map(occurrence => ({
            id: occurrence.occurrenceId,
            title: `${occurrence.name || 'Payment'} (${occurrence.currency} ${occurrence.amount?.toLocaleString()}) to ${occurrence.recipient}`,
            start: occurrence.occurrenceDate,
            end: occurrence.occurrenceDate,
            allDay: true,
            resource: occurrence,
        }));
    }, [upcomingOccurrences]);

    const getNextDateDisplay = (payment) => {
        if (payment.status !== 'Active') return payment.status;
        if (!payment.nextDate || payment.nextDate === 'TBD' || payment.nextDate === 'N/A') return 'N/A';
        try {
            const date = parseISO(payment.nextDate);
            if (!isValid(date)) return 'Invalid Date';
            const datePart = formatDate(date, 'MMM d, yyyy');
            const timePart = payment.nextTime ? ` ${payment.nextTime}` : '';
            return `${datePart}${timePart}`;
        } catch { return 'Invalid Date'; }
    };
    
    // Custom calendar navigation functions
    const navigateToPrev = () => {
        if (calendarRef.current && calendarRef.current.getApi) {
            // For FullCalendar
            calendarRef.current.getApi().prev();
        } else {
            // Handle manually based on current view
            if (calendarView === 'month') {
                setCalendarDate(prevDate => addMonths(prevDate, -1));
            } else if (calendarView === 'week') {
                setCalendarDate(prevDate => addWeeks(prevDate, -1));
            } else if (calendarView === 'day') {
                setCalendarDate(prevDate => addDays(prevDate, -1));
            }
        }
    };
    
    const navigateToNext = () => {
        if (calendarRef.current && calendarRef.current.getApi) {
            // For FullCalendar
            calendarRef.current.getApi().next();
        } else {
            // Handle manually based on current view
            if (calendarView === 'month') {
                setCalendarDate(prevDate => addMonths(prevDate, 1));
            } else if (calendarView === 'week') {
                setCalendarDate(prevDate => addWeeks(prevDate, 1));
            } else if (calendarView === 'day') {
                setCalendarDate(prevDate => addDays(prevDate, 1));
            }
        }
    };
    
    const navigateToToday = () => {
        if (calendarRef.current && calendarRef.current.getApi) {
            // For FullCalendar
            calendarRef.current.getApi().today();
        } else {
            setCalendarDate(new Date());
        }
    };
    
    const changeCalendarView = (newView) => {
        setCalendarView(newView);
    };
    
    // Format the calendar date for display
    const formattedCalendarDate = useMemo(() => {
        if (calendarView === 'month') {
            return formatDate(calendarDate, 'MMMM yyyy');
        } else if (calendarView === 'week') {
            const start = startOfWeek(calendarDate, { locale: locales['en-US'] });
            const end = addDays(start, 6);
            return `${formatDate(start, 'MMM d')} - ${formatDate(end, 'MMM d, yyyy')}`;
        } else if (calendarView === 'day') {
            return formatDate(calendarDate, 'MMMM d, yyyy');
        } else if (calendarView === 'agenda') {
            return 'Agenda';
        }
        return '';
    }, [calendarDate, calendarView]);

    return (
        <div className="bg-white p-6 rounded shadow-lg max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h1 className="text-2xl font-bold text-gray-800">Manage Recurring Payments</h1>
                <button className="px-4 py-2 rounded text-white text-sm bg-gray-600 hover:bg-gray-700" onClick={onBack}> Back to Dashboard </button>
            </div>

            <div className="flex flex-wrap sm:flex-nowrap gap-4 mb-4">
                 <div className="relative flex-grow w-full sm:w-auto">
                    <input type="text" className="w-full pl-10 pr-4 py-2 border rounded-md text-sm focus:ring-emtech-gold focus:border-emtech-gold" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    <div className="absolute left-3 top-2.5 text-gray-400"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg></div>
                </div>
                <select className="p-2 border rounded-md w-full sm:w-40 text-sm bg-white focus:ring-emtech-gold focus:border-emtech-gold" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="All">All Statuses</option>
                    <option value="Active">Active</option>
                    <option value="Paused">Paused</option>
                    <option value="Completed">Completed</option>
                </select>
                <button className="px-5 py-2 rounded-md text-white bg-emtech-gold hover:opacity-90 text-sm w-full sm:w-auto flex-shrink-0" onClick={onSetupNewRecurring}>Setup New</button>
            </div>

            <div className="mb-6">
                <div className="flex justify-center sm:justify-start border-b">
                    <button
                        onClick={() => setViewMode('list')}
                        className={`px-4 py-2 text-sm font-medium focus:outline-none ${viewMode === 'list' ? 'border-b-2 border-emtech-gold text-emtech-gold' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        List View
                    </button>
                    <button
                        onClick={() => setViewMode('calendar')}
                        className={`px-4 py-2 text-sm font-medium focus:outline-none ${viewMode === 'calendar' ? 'border-b-2 border-emtech-gold text-emtech-gold' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Calendar View
                    </button>
                </div>
            </div>

            {viewMode === 'list' && (
                <div className="border rounded-lg overflow-hidden">
                    <h2 className="text-lg font-semibold text-gray-700 bg-gray-50 p-3 border-b">Payment List</h2>
                    {filteredListPayments.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 text-sm">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="px-4 py-2 text-left font-medium text-gray-600 uppercase tracking-wider">Name/Recipient</th>
                                        <th className="px-4 py-2 text-left font-medium text-gray-600 uppercase tracking-wider">Amount</th>
                                        <th className="px-4 py-2 text-left font-medium text-gray-600 uppercase tracking-wider">Frequency</th>
                                        <th className="px-4 py-2 text-left font-medium text-gray-600 uppercase tracking-wider">Next Payment</th>
                                        <th className="px-4 py-2 text-center font-medium text-gray-600 uppercase tracking-wider">Status</th>
                                        <th className="px-4 py-2 text-center font-medium text-gray-600 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredListPayments.map((payment) => (
                                        <tr key={payment.id}>
                                            <td className="px-4 py-2 whitespace-nowrap"><div className="font-medium text-gray-900">{payment.name || '-'}</div><div className="text-gray-500">{payment.recipient || '-'}</div></td>
                                            <td className="px-4 py-2 whitespace-nowrap text-gray-900">{payment.amount?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {payment.currency}</td>
                                            <td className="px-4 py-2 whitespace-nowrap text-gray-600">{payment.frequency || '-'}</td>
                                            <td className="px-4 py-2 whitespace-nowrap text-gray-600">{getNextDateDisplay(payment)}</td>
                                            <td className="px-4 py-2 whitespace-nowrap text-center"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(payment.status)}`}>{payment.status || 'Unknown'}</span></td>
                                            <td className="px-4 py-2 whitespace-nowrap text-center text-sm font-medium">
                                                <div className="flex justify-center items-center space-x-2">
                                                    {payment.status === 'Active' && (<button onClick={() => onToggleRecurringStatus(payment.id, payment.status)} className="p-1 text-yellow-600 hover:text-yellow-800" title="Pause"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></button>)}
                                                    {payment.status === 'Paused' && (<button onClick={() => onToggleRecurringStatus(payment.id, payment.status)} className="p-1 text-green-600 hover:text-green-800" title="Play"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg></button>)}
                                                    {(payment.status === 'Active' || payment.status === 'Paused') && (<button onClick={() => onEditRecurring(payment.id)} className="p-1 text-blue-600 hover:text-blue-800" title="Edit"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>)}
                                                    <button onClick={() => onDeleteRecurring(payment.id)} className="p-1 text-red-600 hover:text-red-800" title="Delete"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (<p className="text-center text-gray-500 italic py-6">No recurring payments found matching criteria.</p>)}
                </div>
            )}

            {viewMode === 'calendar' && (
                <div className="border rounded-lg">
                    <h2 className="text-lg font-semibold text-gray-700 bg-gray-50 p-3 border-b">Upcoming Schedule Calendar (Next 30 Days)</h2>
                    
                    {/* CUSTOM TOOLBAR: Instead of relying on react-big-calendar's toolbar */}
                    <div className="flex justify-between items-center p-4 border-b bg-gray-50">
                        <div className="flex space-x-2">
                            <button 
                                onClick={navigateToPrev}
                                className="px-3 py-1 bg-white border rounded shadow-sm hover:bg-gray-50 text-sm"
                            >
                                Back
                            </button>
                            <button 
                                onClick={navigateToToday}
                                className="px-3 py-1 bg-white border rounded shadow-sm hover:bg-gray-50 text-sm"
                            >
                                Today
                            </button>
                            <button 
                                onClick={navigateToNext}
                                className="px-3 py-1 bg-white border rounded shadow-sm hover:bg-gray-50 text-sm"
                            >
                                Next
                            </button>
                        </div>
                        
                        <div className="text-lg font-medium">
                            {formattedCalendarDate}
                        </div>
                        
                        <div className="flex space-x-2">
                            {['month', 'week', 'day', 'agenda'].map(view => (
                                <button
                                    key={view}
                                    onClick={() => changeCalendarView(view)}
                                    className={`px-3 py-1 border rounded shadow-sm text-sm ${
                                        calendarView === view 
                                            ? 'bg-emtech-gold text-white' 
                                            : 'bg-white hover:bg-gray-50'
                                    }`}
                                >
                                    {view.charAt(0).toUpperCase() + view.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    <div className="p-4">
                       {calendarEvents.length > 0 ? (
                           // Using our own states to control the calendar
                           <Calendar
                               localizer={localizer}
                               events={calendarEvents}
                               startAccessor="start"
                               endAccessor="end"
                               view={calendarView}
                               date={calendarDate}
                               onNavigate={setCalendarDate} 
                               onView={setCalendarView}
                               style={{ height: 600 }}
                               eventPropGetter={(event) => ({
                                    style: {
                                      backgroundColor: '#FDBB30',
                                      borderRadius: '3px',
                                      opacity: 0.9,
                                      color: 'black',
                                      border: '0px',
                                      display: 'block'
                                    }
                               })}
                               // Hide the toolbar since we're using our own
                               components={{
                                 toolbar: () => null
                               }}
                               ref={calendarRef}
                           />
                       ) : (
                            <p className="text-center text-gray-500 italic py-6">No upcoming recurring payments found matching criteria in the next 30 days.</p>
                       )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageRecurringPaymentsScreen;