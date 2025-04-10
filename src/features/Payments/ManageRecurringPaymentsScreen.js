// src/features/Payments/ManageRecurringPaymentsScreen.js
import React, { useState, useMemo, useEffect } from 'react';

// NOTE: initialDummyRecurringPayments definition REMOVED

// Helper function to parse dates, handling potential 'Paused' or 'N/A' strings
// Basic parser, assumes YYYY-MM-DD format primarily for sorting/filtering
const parseNextDate = (dateString) => {
    if (!dateString || typeof dateString !== 'string' || ['Paused', 'N/A', 'Recalculating...', 'Pending Calculation'].includes(dateString)) {
        return null; // Return null for invalid or non-date strings
    }
    try {
        // Attempt to parse common formats like YYYY-MM-DD
        const parts = dateString.split('-');
        if (parts.length === 3) {
            const year = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
            const day = parseInt(parts[2], 10);
            if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
                const date = new Date(Date.UTC(year, month, day)); // Use UTC to avoid timezone issues for date comparison
                 if (!isNaN(date.getTime())) return date;
            }
        }
        // Fallback for other potential formats (less reliable)
        const date = new Date(dateString);
        if (!isNaN(date.getTime())) return date;

        return null; // Return null if parsing fails
    } catch (e) {
        console.error("Error parsing date:", dateString, e);
        return null;
    }
};


// --- Component ---
const ManageRecurringPaymentsScreen = ({
    onBack,
    recurringPayments = [], // Use prop, default to empty array
    onToggleRecurringStatus, // function(id, currentStatus)
    onDeleteRecurring,     // function(id)
    onEditRecurring,       // function(id) - Placeholder handler
    onSetupNewRecurring    // function() - Placeholder handler
}) => {

  // --- State --- (Keep UI control state)
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All'); // 'All', 'Active', 'Paused', 'Completed'
  const [viewMode, setViewMode] = useState('list'); // 'list', 'calendar'

  // Remove local recurringPayments state - use prop instead
  // const [recurringPayments, setRecurringPayments] = useState(initialDummyRecurringPayments);

  // --- Filtering & Sorting Logic (Uses recurringPayments prop) ---
  const filteredPayments = useMemo(() => {
    return recurringPayments // Use prop here
      .filter(payment => {
        if (statusFilter !== 'All' && payment.status !== statusFilter) return false;
        const term = searchTerm.toLowerCase();
        // Basic checks for field existence
        const nameMatch = payment.name && payment.name.toLowerCase().includes(term);
        const recipientMatch = payment.recipient && payment.recipient.toLowerCase().includes(term);
        const amountMatch = payment.amount && payment.amount.toLowerCase().includes(term);
        const fromAccountMatch = payment.fromAccount && payment.fromAccount.toLowerCase().includes(term);

        if (term && !(nameMatch || recipientMatch || amountMatch || fromAccountMatch)) return false;
        return true;
      })
      .sort((a, b) => {
          // Sort logic prioritizes active upcoming payments
          const dateA = parseNextDate(a.nextDate);
          const dateB = parseNextDate(b.nextDate);

          // Put completed/paused/invalid dates at the end
          const endStatusA = a.status === 'Completed' || a.status === 'Paused' || !dateA;
          const endStatusB = b.status === 'Completed' || b.status === 'Paused' || !dateB;

          if (endStatusA && !endStatusB) return 1;
          if (!endStatusA && endStatusB) return -1;
          if (endStatusA && endStatusB) {
              // If both at end, maybe sort by name or original order (keep 0)
              return (a.name || '').localeCompare(b.name || '');
          }

          // Sort valid dates ascending
          if (dateA && dateB) {
              if (dateA.getTime() !== dateB.getTime()) {
                 return dateA - dateB;
              }
              // If dates are same, maybe sort by name
              return (a.name || '').localeCompare(b.name || '');
          }

          return 0; // Fallback
      });
  }, [searchTerm, statusFilter, recurringPayments]); // Depend on prop

  // Calculate counts for status filters (Uses recurringPayments prop)
  const statusCounts = useMemo(() => {
      const counts = { All: recurringPayments.length, Active: 0, Paused: 0, Completed: 0 };
      recurringPayments.forEach(p => {
          if (counts[p.status] !== undefined) counts[p.status]++;
      });
       // Ensure keys exist even if count is 0
      counts.Active = counts.Active || 0;
      counts.Paused = counts.Paused || 0;
      counts.Completed = counts.Completed || 0;
      return counts;
  }, [recurringPayments]); // Depend on prop


  // --- Action Handlers ---
  const handleSearchChange = (e) => setSearchTerm(e.target.value); // OK
  const handleStatusFilterChange = (status) => setStatusFilter(status); // OK
  const handleViewToggle = (mode) => setViewMode(mode); // OK
  const handleCalendarNav = (direction) => console.log('Calendar Nav:', direction); // Placeholder OK

  // --- UPDATED: Use Callbacks ---
  const handleSetupNew = () => {
      console.log('Setup New Recurring Payment button clicked');
      if(typeof onSetupNewRecurring === 'function') {
          onSetupNewRecurring(); // Call parent handler
      } else {
          console.error("onSetupNewRecurring prop missing!");
          alert("Setup new recurring functionality unavailable.");
      }
  };
  const handleEdit = (id) => {
      console.log('Edit Recurring Payment clicked:', id);
       if(typeof onEditRecurring === 'function') {
          onEditRecurring(id); // Call parent handler
      } else {
          console.error("onEditRecurring prop missing!");
          alert("Edit recurring functionality unavailable.");
      }
  };
  const handlePauseToggle = (id, currentStatus) => {
    if (currentStatus === 'Completed') return; // Cannot toggle completed
    console.log('Pause/Play clicked for:', id, currentStatus);
     if(typeof onToggleRecurringStatus === 'function') {
          onToggleRecurringStatus(id, currentStatus); // Call parent handler
      } else {
          console.error("onToggleRecurringStatus prop missing!");
          alert("Error: Cannot change recurring payment status.");
      }
  };
  const handleDelete = (id, name) => {
    if (window.confirm(`Are you sure you want to delete the recurring payment "${name || 'Unnamed'}"? This cannot be undone.`)) {
        console.log('Deleting Recurring Payment:', id);
         if(typeof onDeleteRecurring === 'function') {
              onDeleteRecurring(id); // Call parent handler
         } else {
              console.error("onDeleteRecurring prop missing!");
              alert("Error: Delete recurring functionality unavailable.");
         }
    }
  };
  // --- END UPDATED ---

  // --- Dynamic Upcoming Schedule Logic --- Step 7 Update Schedule
  const upcomingSchedule = useMemo(() => {
      // Use the provided current date context: Wednesday, April 9, 2025
      const today = new Date(Date.UTC(2025, 3, 9)); // April 9, 2025 (Month is 0-indexed)

      const tomorrow = new Date(today);
      tomorrow.setUTCDate(today.getUTCDate() + 1);

      // Calculate next Monday based on April 9th (Wednesday=3)
      const daysUntilMonday = (1 - today.getUTCDay() + 7) % 7;
      const nextMonday = new Date(today);
      nextMonday.setUTCDate(today.getUTCDate() + daysUntilMonday);
       // If today is Monday, start from next Monday
       if (daysUntilMonday === 0) {
            nextMonday.setUTCDate(nextMonday.getUTCDate() + 7);
       }

      const nextWeekStart = new Date(nextMonday); // Start of next week (Monday)
      const nextWeekEnd = new Date(nextWeekStart);
      nextWeekEnd.setUTCDate(nextWeekStart.getUTCDate() + 6); // End of next week (Sunday)

      const schedule = { today: [], tomorrow: [], nextWeek: [] };

      recurringPayments
          .filter(p => p.status === 'Active') // Only show active payments
          .forEach(p => {
              const nextDate = parseNextDate(p.nextDate);
              if (!nextDate) return; // Skip if date is invalid or not set

              // Compare dates (already in UTC)
              if (nextDate.getTime() === today.getTime()) {
                  schedule.today.push(p);
              } else if (nextDate.getTime() === tomorrow.getTime()) {
                  schedule.tomorrow.push(p);
              } else if (nextDate >= nextWeekStart && nextDate <= nextWeekEnd) {
                  schedule.nextWeek.push(p);
              }
          });

      // Sort payments within each category by time if available, then name
      const sortByTimeThenName = (a, b) => {
            // Basic time sort (HH:MM AM/PM -> HHMM) - Needs robust parsing in real app
            const timeA = a.nextTime?.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
            const timeB = b.nextTime?.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
            let valA = 9999, valB = 9999; // Default large value if time invalid/missing
            if (timeA) {
                let hourA = parseInt(timeA[1], 10);
                if (timeA[3].toUpperCase() === 'PM' && hourA !== 12) hourA += 12;
                if (timeA[3].toUpperCase() === 'AM' && hourA === 12) hourA = 0; // Midnight case
                valA = hourA * 100 + parseInt(timeA[2], 10);
            }
             if (timeB) {
                let hourB = parseInt(timeB[1], 10);
                if (timeB[3].toUpperCase() === 'PM' && hourB !== 12) hourB += 12;
                 if (timeB[3].toUpperCase() === 'AM' && hourB === 12) hourB = 0; // Midnight case
                valB = hourB * 100 + parseInt(timeB[2], 10);
            }

            if (valA !== valB) return valA - valB;
            return (a.name || '').localeCompare(b.name || ''); // Fallback sort by name
      };
      schedule.today.sort(sortByTimeThenName);
      schedule.tomorrow.sort(sortByTimeThenName);
      schedule.nextWeek.sort(sortByTimeThenName);

      return schedule;
  }, [recurringPayments]); // Depend only on recurringPayments prop


  // --- Render Logic --- (Uses prop data and derived state)
  return (
    <div className="bg-white p-6 rounded shadow max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 border-b pb-3">
        <h1 className="text-2xl font-bold text-gray-800">Recurring Payments</h1>
        <button className="px-3 py-1 rounded text-white hover:opacity-90 bg-gray-800 text-sm" onClick={onBack}>
          Back to Dashboard
        </button>
      </div>

      {/* Status Filters and Search (uses statusCounts derived from prop) */}
      <div className="flex flex-wrap sm:flex-nowrap space-y-3 sm:space-y-0 sm:space-x-4 mb-6">
         {/* Status Buttons */}
         <div className="flex border border-gray-300 rounded overflow-hidden flex-shrink-0">
            {Object.entries(statusCounts).map(([status, count]) => (
                 <button key={status} onClick={() => handleStatusFilterChange(status)} className={`px-3 sm:px-4 py-2 text-sm border-l border-gray-300 first:border-l-0 transition-colors duration-150 ${ statusFilter === status ? 'bg-emtech-gold text-white font-medium' : 'bg-white hover:bg-gray-50' }`} > {status} ({count}) </button>
            ))}
         </div>
         {/* Search Input (unchanged) */}
         <div className="flex-grow w-full sm:w-auto"> <div className="relative"> <input type="text" className="w-full pl-10 pr-4 py-2 border rounded text-sm" placeholder="Search by name, recipient, account, amount..." value={searchTerm} onChange={handleSearchChange} /> <div className="absolute left-3 top-2.5 text-gray-400"> {/* Search Icon */} <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg> </div> </div> </div>
         {/* Setup New Button (calls updated handler) */}
         <button className="px-4 py-2 rounded text-white hover:opacity-90 bg-emtech-gold text-sm w-full sm:w-auto flex-shrink-0" onClick={handleSetupNew} > Setup New Recurring Payment </button>
       </div>

      {/* View Toggle and Calendar Nav (unchanged) */}
      <div className="flex justify-between items-center mb-4">
         <div className="flex items-center"> <h2 className="font-medium mr-4 text-gray-800">Schedule</h2> <div className="flex border border-gray-300 rounded overflow-hidden text-sm"> <button onClick={() => handleViewToggle('list')} className={`px-3 py-1 transition-colors duration-150 ${viewMode === 'list' ? 'bg-gray-200 font-medium' : 'bg-white hover:bg-gray-50'}`}> List View </button> <button onClick={() => handleViewToggle('calendar')} className={`px-3 py-1 border-l border-gray-300 transition-colors duration-150 ${viewMode === 'calendar' ? 'bg-gray-200 font-medium' : 'bg-white hover:bg-gray-50'}`}> Calendar View </button> </div> </div>
         {viewMode === 'calendar' && ( <div className="flex items-center text-sm"> <span className="text-gray-600 mr-2">April 2025</span> <button onClick={() => handleCalendarNav('prev')} className="p-1 border border-gray-300 rounded-l hover:bg-gray-50"> {/* Prev Icon */} <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg> </button> <button onClick={() => handleCalendarNav('next')} className="p-1 border-t border-b border-r border-gray-300 rounded-r hover:bg-gray-50"> {/* Next Icon */} <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg> </button> </div> )}
       </div>

      {/* Conditional View: List or Calendar */}
      {viewMode === 'list' && (
        <>
          {/* Recurring Payments Table (uses filteredPayments derived from prop) */}
          <div className="overflow-x-auto mb-6">
            <table className="min-w-full">
              <thead> <tr> <th className="py-3 px-4 border-b border-gray-200 bg-gray-50 text-left text-sm font-medium text-gray-500 uppercase">Payment Name</th> <th className="py-3 px-4 border-b border-gray-200 bg-gray-50 text-left text-sm font-medium text-gray-500 uppercase">Recipient</th> <th className="py-3 px-4 border-b border-gray-200 bg-gray-50 text-left text-sm font-medium text-gray-500 uppercase">Amount</th> <th className="py-3 px-4 border-b border-gray-200 bg-gray-50 text-left text-sm font-medium text-gray-500 uppercase">Frequency</th> <th className="py-3 px-4 border-b border-gray-200 bg-gray-50 text-left text-sm font-medium text-gray-500 uppercase">Next Payment</th> <th className="py-3 px-4 border-b border-gray-200 bg-gray-50 text-left text-sm font-medium text-gray-500 uppercase">Status</th> <th className="py-3 px-4 border-b border-gray-200 bg-gray-50 text-center text-sm font-medium text-gray-500 uppercase">Actions</th> </tr> </thead>
              <tbody>
                 {filteredPayments.length > 0 ? filteredPayments.map((payment) => (
                   <tr key={payment.id} className={`hover:bg-gray-50 ${payment.status === 'Paused' || payment.status === 'Completed' ? 'opacity-60 bg-gray-50' : ''}`}>
                     <td className="py-3 px-4 border-b border-gray-200"> <div> <p className="font-medium text-sm">{payment.name}</p> <p className="text-xs text-gray-500">From: {payment.fromAccount}</p> </div> </td>
                     <td className="py-3 px-4 border-b border-gray-200 text-sm">{payment.recipient}</td>
                     <td className="py-3 px-4 border-b border-gray-200 text-sm font-medium">{payment.amount}</td>
                     <td className="py-3 px-4 border-b border-gray-200 text-sm">{payment.frequency}</td>
                     <td className="py-3 px-4 border-b border-gray-200 text-sm"> <div> <p>{payment.nextDate}</p> {payment.nextTime && payment.status !== 'Paused' && payment.status !== 'Completed' && <p className="text-xs text-gray-500">{payment.nextTime}</p>} </div> </td>
                     <td className="py-3 px-4 border-b border-gray-200"> <span className={`px-2 py-1 text-xs rounded-full capitalize ${ payment.status === 'Active' ? 'bg-green-100 text-green-800' : payment.status === 'Paused' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-500' }`}>{payment.status}</span> </td>
                     <td className="py-3 px-4 border-b border-gray-200">
                       <div className="flex justify-center space-x-2">
                         {/* Use updated handlers */}
                         <button title="Edit" onClick={() => handleEdit(payment.id)} className="p-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50" disabled={payment.status === 'Completed'}> {/* Edit Icon */} <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg> </button>
                         <button title={payment.status === 'Active' ? 'Pause' : 'Play'} onClick={() => handlePauseToggle(payment.id, payment.status)} className={`p-1 border border-gray-300 rounded hover:bg-gray-100 ${payment.status === 'Completed' ? 'invisible' : ''}`}>
                            {payment.status === 'Active' ? /* Pause Icon */ <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> : /* Play Icon */ <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> }
                         </button>
                         <button title="Delete" onClick={() => handleDelete(payment.id, payment.name)} className="p-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50" disabled={payment.status === 'Completed'}> {/* Delete Icon */} <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg> </button>
                       </div>
                     </td>
                   </tr>
                 )) : ( <tr><td colSpan="7" className="text-center py-10 text-gray-500 italic"> No recurring payments found matching your criteria. </td></tr> )}
               </tbody>
            </table>
          </div>
          {/* Pagination (Uses recurringPayments prop length) */}
          {/* Display pagination info even if filtered list is short, based on total items */}
          {recurringPayments.length > 0 && (
              <div className="flex justify-between items-center text-sm text-gray-600">
                 <span>Total Recurring Payments: {recurringPayments.length}</span>
                 {/* Placeholder pagination controls */}
                 <div className="flex space-x-1">
                     <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 text-sm" disabled>Previous</button>
                     <span className="px-3 py-1 border border-gray-300 rounded bg-gray-100 text-sm">1</span>
                     <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 text-sm" disabled>Next</button>
                 </div>
              </div>
          )}
        </>
      )} {/* End List View */}

      {viewMode === 'calendar' && ( <div className="border rounded p-6 text-center text-gray-500 h-96 flex items-center justify-center"> Calendar View Placeholder </div> )}

      {/* --- DYNAMIC Upcoming Schedule Section --- */}
      <div className="mt-8 pt-6 border-t">
         <h2 className="font-medium mb-3 text-gray-800">Upcoming Payment Schedule</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Today */}
              <div className="bg-green-50 p-4 rounded border border-green-200">
                  <h3 className="text-sm font-medium text-green-800 mb-2">Today (Apr 9, 2025)</h3>
                  <div className="space-y-2">
                      {upcomingSchedule.today.length > 0 ? upcomingSchedule.today.map(p => (
                          <div key={`today-${p.id}`} className="bg-white p-2 rounded border border-gray-200 text-xs">
                              <p className="font-medium truncate" title={p.name}>{p.name}</p>
                              <p className="text-gray-500">{p.nextTime} - {p.amount}</p>
                          </div>
                      )) : <p className="text-sm text-gray-500 italic">Nothing scheduled for today.</p>}
                  </div>
              </div>
               {/* Tomorrow */}
              <div className="bg-gray-50 p-4 rounded border border-gray-200">
                  <h3 className="text-sm font-medium text-gray-800 mb-2">Tomorrow (Apr 10, 2025)</h3>
                  <div className="space-y-2">
                     {upcomingSchedule.tomorrow.length > 0 ? upcomingSchedule.tomorrow.map(p => (
                          <div key={`tmrw-${p.id}`} className="bg-white p-2 rounded border border-gray-200 text-xs">
                              <p className="font-medium truncate" title={p.name}>{p.name}</p>
                              <p className="text-gray-500">{p.nextTime} - {p.amount}</p>
                          </div>
                      )) : <p className="text-sm text-gray-500 italic">Nothing scheduled for tomorrow.</p>}
                  </div>
              </div>
               {/* Next Week */}
               <div className="bg-gray-50 p-4 rounded border border-gray-200">
                  <h3 className="text-sm font-medium text-gray-800 mb-2">Next Week (Apr 14-20)</h3>
                  <div className="space-y-2">
                      {upcomingSchedule.nextWeek.length > 0 ? upcomingSchedule.nextWeek.map(p => (
                          <div key={`week-${p.id}`} className="bg-white p-2 rounded border border-gray-200 text-xs">
                              <p className="font-medium truncate" title={p.name}>{p.name}</p>
                              <p className="text-gray-500">{p.nextDate} {p.nextTime} - {p.amount}</p>
                          </div>
                      )) : <p className="text-sm text-gray-500 italic">Nothing scheduled for next week.</p>}
                  </div>
              </div>
          </div>
       </div>
       {/* --- END DYNAMIC Schedule --- */}

    </div> // End main container
  );
};

export default ManageRecurringPaymentsScreen;