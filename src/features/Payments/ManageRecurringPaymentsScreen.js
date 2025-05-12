import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
    parseISO, addDays, addWeeks, addMonths, isWithinInterval, subDays,
    startOfDay, endOfDay, format as formatDate, isValid, startOfWeek, getDay, parse as parseDate,
    startOfMonth, endOfMonth,
    isAfter, isBefore
} from 'date-fns';
import enUS from 'date-fns/locale/en-US';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { getStatusClass } from '../../utils/displayUtils'; // Assuming path is correct
import RecurringPaymentModal from './RecurringPaymentModal';

// Import context hooks
import { useRecurringPayments } from '../../context/RecurringPaymentsContext';

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

// Helper function - kept for handleToggleRecurring
const calculateNextDateFromToday = (payment, startDate = new Date()) => {
    if (!payment?.frequency || !payment.startDate) return null;
    const today = startOfDay(startDate);
    try {
        let baseDate = startOfDay(parseISO(payment.startDate));
        if (!isValid(baseDate)) return null;
        let nextDate = baseDate;
        let attempts = 0;
        const maxAttempts = 500;
        while (nextDate < today && attempts < maxAttempts) {
             switch (payment.frequency?.toLowerCase().split(' ')[0]) {
                case 'daily': nextDate = addDays(nextDate, 1); break;
                case 'weekly': nextDate = addWeeks(nextDate, 1); break;
                case 'bi-weekly': nextDate = addWeeks(nextDate, 2); break;
                case 'monthly': nextDate = addMonths(nextDate, 1); break;
                case 'quarterly': nextDate = addMonths(nextDate, 3); break;
                case 'annually': nextDate = addMonths(nextDate, 12); break;
                default: return null;
             }
             attempts++;
        }
        if (nextDate >= today) return formatDate(nextDate, 'yyyy-MM-dd');
        if (attempts >= maxAttempts) { console.warn(`Max attempts reached calculating next date for payment ID: ${payment.id}`); return null; }
        return null;
    } catch (error) { console.error(`Error calculating next date for payment ID: ${payment.id}`, error); return null; }
};


const ManageRecurringPaymentsScreen = ({ onBack }) => {
    // Consume contexts
    const { recurringPayments, dispatchRecurring } = useRecurringPayments();
    // Removed useAssets call

    // Local UI state remains
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('Active');
    const [viewMode, setViewMode] = useState('list'); // Start with list view
    const [calendarView, setCalendarView] = useState('month');
    const [calendarDate, setCalendarDate] = useState(new Date());
    const calendarRef = useRef(null);
    const [isCalendarMounted, setIsCalendarMounted] = useState(false);
    const [isRecurringModalOpen, setIsRecurringModalOpen] = useState(false);
    const [editingRecurringPayment, setEditingRecurringPayment] = useState(null);

    // Log recurringPayments from context when it changes
    useEffect(() => {
        console.log('MANAGE_RECURRING: recurringPayments from context:', recurringPayments);
    }, [recurringPayments]);


    useEffect(() => {
        if (viewMode === 'calendar') { setTimeout(() => { setIsCalendarMounted(true); }, 100); }
        else { setIsCalendarMounted(false); }
    }, [viewMode]);

    // Filter for the List View (unchanged)
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


    // --- Rewritten Calendar Event Calculation with DETAILED LOGGING ---
    const calendarEvents = useMemo(() => {
        const events = [];
        // Determine the visible date range of the calendar
        // Using simple month range for now, adjust if needed for exact week/day views
        const viewStart = startOfMonth(calendarDate);
        const viewEnd = endOfMonth(calendarDate);

        // --- LOGGING ---
        console.log(`MANAGE_RECURRING: Calculating events for range: ${formatDate(viewStart, 'yyyy-MM-dd')} to ${formatDate(viewEnd, 'yyyy-MM-dd')}`);

        if (!Array.isArray(recurringPayments)) {
             console.log('MANAGE_RECURRING: recurringPayments is not an array yet.');
             return []; // Return empty if data not ready
        }

        const activePayments = recurringPayments.filter(p => p.status === 'Active');
        // --- LOGGING ---
        console.log(`MANAGE_RECURRING: Found ${activePayments.length} Active Payments for Calendar.`);

        activePayments.forEach(payment => {
            // --- LOGGING ---
            console.log(`MANAGE_RECURRING: Processing payment ID: ${payment.id}, Freq: ${payment.frequency}, Start: ${payment.startDate}`);
            try {
                if (!payment.startDate || !payment.frequency) {
                    console.log(`MANAGE_RECURRING: Skipping payment ${payment.id} due to missing start date or frequency.`);
                    return; // Skip this payment
                }

                const paymentStartDate = startOfDay(parseISO(payment.startDate));
                const isValidStart = isValid(paymentStartDate);
                 // --- LOGGING ---
                console.log(`MANAGE_RECURRING: Parsed start date for ${payment.id}: ${paymentStartDate}, Valid: ${isValidStart}`);
                if (!isValidStart) return; // Skip if start date is invalid

                const paymentEndDate = payment.endDate ? startOfDay(parseISO(payment.endDate)) : null;
                const isValidEnd = !payment.endDate || (paymentEndDate && isValid(paymentEndDate));
                if (!isValidEnd) {
                     console.log(`MANAGE_RECURRING: Skipping payment ${payment.id} due to invalid end date.`);
                     return;
                }

                let currentOccurrence = paymentStartDate;
                let iter = 0;
                const maxIter = 500; // Safety break

                while (iter < maxIter) {
                    // --- LOGGING ---
                    console.log(`MANAGE_RECURRING: [${payment.id}] Iter ${iter}, Current Occurrence: ${formatDate(currentOccurrence, 'yyyy-MM-dd')}`);

                    // Stop conditions
                    if (isAfter(currentOccurrence, viewEnd)) {
                         console.log(`MANAGE_RECURRING: [${payment.id}] Occurrence is after viewEnd. Breaking loop.`);
                         break;
                    }
                    if (paymentEndDate && isAfter(currentOccurrence, paymentEndDate)) {
                        console.log(`MANAGE_RECURRING: [${payment.id}] Occurrence is after paymentEndDate. Breaking loop.`);
                        break;
                    }

                    // Check if within view range AND on or after payment start date
                    const isInViewRange = !isBefore(currentOccurrence, viewStart); // ocorr >= viewStart
                    const isAfterPaymentStart = !isBefore(currentOccurrence, paymentStartDate); // ocorr >= paymentStart
                    // --- LOGGING ---
                     console.log(`MANAGE_RECURRING: [${payment.id}] Is occurrence >= viewStart (${formatDate(viewStart, 'yyyy-MM-dd')})? ${isInViewRange}. Is occurrence >= paymentStart (${formatDate(paymentStartDate, 'yyyy-MM-dd')})? ${isAfterPaymentStart}`);

                    if (isInViewRange && isAfterPaymentStart) {
                         // --- LOGGING ---
                         console.log(`MANAGE_RECURRING: [${payment.id}] *** Adding event for ${formatDate(currentOccurrence, 'yyyy-MM-dd')} ***`);
                         events.push({
                             id: `${payment.id}-${formatDate(currentOccurrence, 'yyyyMMdd')}`,
                             title: `${payment.name || 'Payment'} (${payment.currency} ${payment.amount?.toLocaleString()}) to ${payment.recipient}`,
                             start: currentOccurrence,
                             end: currentOccurrence,
                             allDay: true,
                             resource: payment,
                         });
                    } else {
                         // --- LOGGING ---
                         console.log(`MANAGE_RECURRING: [${payment.id}] Occurrence ${formatDate(currentOccurrence, 'yyyy-MM-dd')} skipped (not in view range or before payment start).`);
                    }

                    // Calculate the next occurrence date
                    let nextOccurrence = currentOccurrence;
                    const freqWord = payment.frequency?.toLowerCase().split(' ')[0];
                     // --- LOGGING ---
                     console.log(`MANAGE_RECURRING: [${payment.id}] Calculating next based on frequency word: "${freqWord}"`);
                    switch (freqWord) {
                        case 'daily': nextOccurrence = addDays(currentOccurrence, 1); break;
                        case 'weekly': nextOccurrence = addWeeks(currentOccurrence, 1); break;
                        case 'bi-weekly': nextOccurrence = addWeeks(currentOccurrence, 2); break;
                        case 'monthly': nextOccurrence = addMonths(currentOccurrence, 1); break;
                        case 'quarterly': nextOccurrence = addMonths(currentOccurrence, 3); break;
                        case 'annually': nextOccurrence = addMonths(currentOccurrence, 12); break;
                        default:
                             console.log(`MANAGE_RECURRING: [${payment.id}] Unknown frequency word "${freqWord}". Breaking loop.`);
                             iter = maxIter; break; // Break if unknown frequency
                    }

                    // Safety check & advance date
                    if (nextOccurrence <= currentOccurrence) {
                         console.error(`MANAGE_RECURRING: [${payment.id}] Date calculation did not advance! Prev: ${formatDate(currentOccurrence, 'yyyy-MM-dd')}, Next calc: ${formatDate(nextOccurrence, 'yyyy-MM-dd')}. Breaking loop.`);
                         iter = maxIter;
                    } else {
                        currentOccurrence = nextOccurrence;
                    }
                    iter++;
                } // End while
                if(iter >= maxIter) console.warn("MANAGE_RECURRING: Max iterations reached for payment:", payment.id);

            } catch (error) {
                console.error(`MANAGE_RECURRING: Error processing payment ${payment.id} for calendar:`, error);
            }
        }); // End forEach

        // --- LOGGING ---
        console.log(`MANAGE_RECURRING: Final generated ${events.length} calendar events.`);
        return events;
    }, [recurringPayments, calendarDate, calendarView]); // Added calendarView dependency


    // --- getNextDateDisplay Helper (unchanged) ---
     const getNextDateDisplay = (payment) => { /* ... */
        if (payment.status !== 'Active') return payment.status; if (!payment.nextDate || payment.nextDate === 'TBD' || payment.nextDate === 'N/A') return 'TBD'; try { const date = parseISO(payment.nextDate); if (!isValid(date)) return 'Invalid Date'; const datePart = formatDate(date, 'MMM d, yyyy'); const timePart = payment.nextTime ? ` ${payment.nextTime}` : ''; return `${datePart}${timePart}`; } catch { return 'Invalid Date'; }
    };

    // --- Handlers using Context Dispatch ---
    const handleToggleRecurring = (paymentId, currentStatus) => { /* ... */
        const payment = recurringPayments.find(p => p.id === paymentId); if (!payment) return; const newStatus = currentStatus === 'Active' ? 'Paused' : 'Active'; let nextDateValue = payment.nextDate; if (newStatus === 'Paused') { nextDateValue = null; } else if (newStatus === 'Active') { nextDateValue = calculateNextDateFromToday(payment); if (!nextDateValue) nextDateValue = 'TBD'; } dispatchRecurring({ type: 'TOGGLE_RECURRING_STATUS', payload: { id: paymentId, newStatus: newStatus, nextDate: nextDateValue } });
    };
    const handleDeleteRecurring = (paymentId) => { /* ... */
         const paymentToDelete = recurringPayments.find(p => p.id === paymentId); const confirmMessage = paymentToDelete ? `Are you sure you want to delete the recurring payment "${paymentToDelete.name || 'Unnamed Recurring'}"?` : `Are you sure you want to delete this recurring payment?`; if (window.confirm(confirmMessage)) { dispatchRecurring({ type: 'DELETE_RECURRING', payload: paymentId }); }
    };
    // Modal control handlers (local state)
    const handleEditRecurring = (paymentId) => { /* ... */
        const paymentToEdit = recurringPayments.find(p => p.id === paymentId); if (paymentToEdit) { setEditingRecurringPayment(paymentToEdit); setIsRecurringModalOpen(true); } else { alert("Error: Could not find recurring payment to edit."); }
    };
    const handleSetupNewRecurring = () => { /* ... */
        setEditingRecurringPayment(null); setIsRecurringModalOpen(true);
    };

    // --- REMOVED handleSaveRecurringPayment handler ---

    // Calendar navigation handlers (unchanged)
    const navigateToPrev = () => { /* ... */ if (calendarView === 'month') setCalendarDate(prev => addMonths(prev, -1)); else if (calendarView === 'week') setCalendarDate(prev => addWeeks(prev, -1)); else if (calendarView === 'day') setCalendarDate(prev => addDays(prev, -1)); };
    const navigateToNext = () => { /* ... */ if (calendarView === 'month') setCalendarDate(prev => addMonths(prev, 1)); else if (calendarView === 'week') setCalendarDate(prev => addWeeks(prev, 1)); else if (calendarView === 'day') setCalendarDate(prev => addDays(prev, 1)); };
    const navigateToToday = () => { setCalendarDate(new Date()); };
    const changeCalendarView = (newView) => { setCalendarView(newView); };
    const formattedCalendarDate = useMemo(() => { /* ... */ if (calendarView === 'month') return formatDate(calendarDate, 'MMMM yyyy'); else if (calendarView === 'week') { const start = startOfWeek(calendarDate, { locale: locales['en-US'] }); const end = addDays(start, 6); return `${formatDate(start, 'MMM d')} - ${formatDate(end, 'MMM d, yyyy')}`; } else if (calendarView === 'day') return formatDate(calendarDate, 'MMMM d, yyyy'); else if (calendarView === 'agenda') return 'Agenda'; return ''; }, [calendarDate, calendarView]);

    // --- Render Logic ---
    return (
        <div className="bg-white p-6 rounded shadow-lg max-w-7xl mx-auto">
             {/* Header */}
             <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h1 className="text-2xl font-bold text-gray-800">Manage Recurring Payments</h1>
                <button className="px-4 py-2 rounded text-white text-sm bg-gray-600 hover:bg-gray-700" onClick={onBack}> Back to Dashboard </button>
            </div>

            {/* Filters and Create Button */}
            <div className="flex flex-wrap sm:flex-nowrap gap-4 mb-4">
                 <div className="relative flex-grow w-full sm:w-auto"> <input type="text" className="w-full pl-10 pr-4 py-2 border rounded-md text-sm focus:ring-emtech-gold focus:border-emtech-gold" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /> <div className="absolute left-3 top-2.5 text-gray-400"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg></div> </div>
                <select className="p-2 border rounded-md w-full sm:w-40 text-sm bg-white focus:ring-emtech-gold focus:border-emtech-gold" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}> <option value="All">All Statuses</option> <option value="Active">Active</option> <option value="Paused">Paused</option> <option value="Completed">Completed</option> </select>
                <button className="px-5 py-2 rounded-md text-white bg-emtech-gold hover:opacity-90 text-sm w-full sm:w-auto flex-shrink-0" onClick={handleSetupNewRecurring}>Setup New</button>
            </div>

            {/* View Mode Toggle */}
            <div className="mb-6">
                <div className="flex justify-center sm:justify-start border-b">
                    <button onClick={() => setViewMode('list')} className={`px-4 py-2 text-sm font-medium focus:outline-none ${viewMode === 'list' ? 'border-b-2 border-emtech-gold text-emtech-gold' : 'text-gray-500 hover:text-gray-700'}`} > List View </button>
                    <button onClick={() => setViewMode('calendar')} className={`px-4 py-2 text-sm font-medium focus:outline-none ${viewMode === 'calendar' ? 'border-b-2 border-emtech-gold text-emtech-gold' : 'text-gray-500 hover:text-gray-700'}`} > Calendar View </button>
                </div>
            </div>

            {/* List View */}
            {viewMode === 'list' && (
                <div className="border rounded-lg overflow-hidden">
                    <h2 className="text-lg font-semibold text-gray-700 bg-gray-50 p-3 border-b">Payment List</h2>
                    {filteredListPayments.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 text-sm">
                                {/* Table Head */}
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
                                {/* Table Body */}
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
                                                    {payment.status === 'Active' && (<button onClick={() => handleToggleRecurring(payment.id, payment.status)} className="p-1 text-yellow-600 hover:text-yellow-800" title="Pause"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></button>)}
                                                    {payment.status === 'Paused' && (<button onClick={() => handleToggleRecurring(payment.id, payment.status)} className="p-1 text-green-600 hover:text-green-800" title="Play"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg></button>)}
                                                    {(payment.status === 'Active' || payment.status === 'Paused') && (<button onClick={() => handleEditRecurring(payment.id)} className="p-1 text-blue-600 hover:text-blue-800" title="Edit"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>)}
                                                    <button onClick={() => handleDeleteRecurring(payment.id)} className="p-1 text-red-600 hover:text-red-800" title="Delete"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
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

            {/* Calendar View */}
            {viewMode === 'calendar' && (
                <div className="border rounded-lg">
                    <h2 className="text-lg font-semibold text-gray-700 bg-gray-50 p-3 border-b">Upcoming Schedule Calendar</h2>
                    {/* Calendar Toolbar */}
                    <div className="flex justify-between items-center p-4 border-b bg-gray-50">
                        <div className="flex space-x-2">
                            <button onClick={navigateToPrev} className="px-3 py-1 bg-white border rounded shadow-sm hover:bg-gray-50 text-sm" > Back </button>
                            <button onClick={navigateToToday} className="px-3 py-1 bg-white border rounded shadow-sm hover:bg-gray-50 text-sm" > Today </button>
                            <button onClick={navigateToNext} className="px-3 py-1 bg-white border rounded shadow-sm hover:bg-gray-50 text-sm" > Next </button>
                        </div>
                        <div className="text-lg font-medium"> {formattedCalendarDate} </div>
                        <div className="flex space-x-2">
                            {['month', 'week', 'day', 'agenda'].map(view => (
                                <button key={view} onClick={() => changeCalendarView(view)} className={`px-3 py-1 border rounded shadow-sm text-sm ${ calendarView === view ? 'bg-emtech-gold text-white' : 'bg-white hover:bg-gray-50' }`} >
                                    {view.charAt(0).toUpperCase() + view.slice(1)}
                                 </button>
                             ))}
                         </div>
                    </div>
                    {/* Calendar Component */}
                    <div className="p-4">
                       {calendarEvents.length > 0 ? (
                           <Calendar
                                localizer={localizer}
                                events={calendarEvents} // Use newly calculated events
                                startAccessor="start"
                                endAccessor="end"
                                view={calendarView}
                                date={calendarDate}
                                onNavigate={setCalendarDate}
                                onView={setCalendarView}
                                style={{ height: 600 }}
                                eventPropGetter={(event) => ({
                                    style: {
                                        backgroundColor: '#FDBB30', // Emtech Gold
                                        borderRadius: '3px',
                                        opacity: 0.9,
                                        color: 'black',
                                        border: '0px',
                                        display: 'block'
                                    }
                                })}
                                components={{ toolbar: () => null }} // Hide default toolbar
                                ref={calendarRef}
                            />
                       ) : (
                            <p className="text-center text-gray-500 italic py-6">No upcoming 'Active' recurring payments found in the selected date range.</p>
                       )}
                    </div>
                </div>
            )}

            {/* Modal - REMOVED assets and onSave props */}
             {isRecurringModalOpen && (
                <RecurringPaymentModal
                    isOpen={isRecurringModalOpen}
                    onClose={() => { setIsRecurringModalOpen(false); setEditingRecurringPayment(null); }}
                    // onSave prop removed
                    recurringPaymentData={editingRecurringPayment} // Pass data for editing mode
                    // assets prop removed
                />
            )}
        </div>
    );
};

export default ManageRecurringPaymentsScreen;