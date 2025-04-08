// src/features/Payments/ManageRecurringPaymentsScreen.js
import React, { useState, useMemo, useEffect } from 'react'; // Added useEffect

// --- Initial Simulated Data ---
// Defined outside component so state initialization doesn't redefine it on every render
const initialDummyRecurringPayments = [
    { id: 'rec1', name: 'HSBC Monthly Settlement', recipient: 'HSBC London', fromAccount: 'USDC Treasury Wallet', amount: '2,500,000 USDC', frequency: 'Monthly (1st)', nextDate: '2025-05-01', nextTime: '3:00 PM UTC', status: 'Active' }, // Updated next date
    { id: 'rec2', name: 'JPM Weekly Liquidity Transfer', recipient: 'JPMorgan Chase', fromAccount: 'USDC Treasury Wallet', amount: '750,000 USDC', frequency: 'Weekly (Monday)', nextDate: '2025-04-14', nextTime: '9:00 AM UTC', status: 'Active' },
    { id: 'rec3', name: 'Deutsche Bank Quarterly Payment', recipient: 'Deutsche Bank', fromAccount: 'USD Primary Account', amount: '€1,800,000', frequency: 'Quarterly (1st day)', nextDate: '2025-07-01', nextTime: '10:00 AM UTC', status: 'Active' },
    { id: 'rec4', name: 'Singapore Daily Liquidity', recipient: 'Citi Singapore', fromAccount: 'USDC Treasury Wallet', amount: 'Variable (Avg. 500k USDC)', frequency: 'Daily (Business days)', nextDate: '2025-04-09', nextTime: '7:00 AM UTC', status: 'Active' },
    { id: 'rec5', name: 'ICICI Mumbai Monthly Transfer', recipient: 'ICICI Mumbai', fromAccount: 'eRupee Wallet', amount: '₹75,000,000', frequency: 'Monthly (15th)', nextDate: '2025-04-15', nextTime: '5:00 AM UTC', status: 'Active' },
    { id: 'rec6', name: 'Bank of America Weekly Settlement', recipient: 'Bank of America', fromAccount: 'USD Primary Account', amount: '$950,000', frequency: 'Weekly (Friday)', nextDate: 'Paused', nextTime: '', status: 'Paused' },
    { id: 'rec7', name: 'Old Supplier Payment', recipient: 'Obsolete Systems Inc', fromAccount: 'USD Primary Account', amount: '$10,000', frequency: 'Monthly (1st)', nextDate: 'N/A', nextTime: '', status: 'Completed' },
    { id: 'rec8', name: 'Test Recurring Internal', recipient: 'Internal Ops Wallet', fromAccount: 'USDC Treasury Wallet', amount: '100 USDC', frequency: 'Daily', nextDate: '2025-04-09', nextTime: '1:00 PM UTC', status: 'Active' },
];

// --- Component ---
const ManageRecurringPaymentsScreen = ({ onBack }) => {

  // --- State ---
  const [recurringPayments, setRecurringPayments] = useState(initialDummyRecurringPayments); // <-- Data now in state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All'); // 'All', 'Active', 'Paused', 'Completed'
  const [viewMode, setViewMode] = useState('list'); // 'list', 'calendar'

  // --- Filtering & Sorting Logic (Uses recurringPayments state) ---
  const filteredPayments = useMemo(() => {
    return recurringPayments // Use state variable here
      .filter(payment => {
        if (statusFilter !== 'All' && payment.status !== statusFilter) return false;
        const term = searchTerm.toLowerCase();
        if (term && !( payment.name.toLowerCase().includes(term) || payment.recipient.toLowerCase().includes(term) || payment.amount.toLowerCase().includes(term) || payment.fromAccount.toLowerCase().includes(term) )) return false;
        return true;
      })
      .sort((a, b) => { /* Sorting logic (unchanged) */
          if (a.status === 'Completed' || a.status === 'Paused' || a.nextDate === 'N/A' || a.nextDate === 'Paused') return 1;
          if (b.status === 'Completed' || b.status === 'Paused' || b.nextDate === 'N/A' || b.nextDate === 'Paused') return -1;
          try { return new Date(a.nextDate) - new Date(b.nextDate); } catch (e) { return 0; }
      });
  }, [searchTerm, statusFilter, recurringPayments]); // <-- Add recurringPayments dependency

  // Calculate counts for status filters (Uses recurringPayments state)
  const statusCounts = useMemo(() => {
      const counts = { All: recurringPayments.length, Active: 0, Paused: 0, Completed: 0 };
      recurringPayments.forEach(p => {
          if (counts[p.status] !== undefined) counts[p.status]++;
      });
      return counts;
  }, [recurringPayments]); // <-- Add recurringPayments dependency


  // --- Action Handlers ---
  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const handleStatusFilterChange = (status) => setStatusFilter(status);
  const handleViewToggle = (mode) => setViewMode(mode);
  const handleSetupNew = () => console.log('Setup New Recurring Payment');
  const handleEdit = (id) => console.log('Edit Recurring Payment:', id);
  const handleCalendarNav = (direction) => console.log('Calendar Nav:', direction);

  // --- Pause / Play Handler ---
  const handlePauseToggle = (id, currentStatus) => {
    if (currentStatus === 'Completed') return; // Cannot toggle completed

    setRecurringPayments(currentList => currentList.map(payment => {
        if (payment.id === id) {
            const newStatus = currentStatus === 'Active' ? 'Paused' : 'Active';
            // For demo simplicity, just mark nextDate as 'Paused' or restore a placeholder if unpausing.
            // A real app would need logic to recalculate the *actual* next date based on frequency.
            const newNextDate = newStatus === 'Paused' ? 'Paused' : 'Pending Calculation'; // Placeholder
            console.log(`Toggling payment ${id} to ${newStatus}`);
            return { ...payment, status: newStatus, nextDate: newNextDate };
        }
        return payment;
    }));
  };

  // --- Delete Handler ---
  const handleDelete = (id, name) => {
    if (window.confirm(`Are you sure you want to delete the recurring payment "${name}"? This cannot be undone.`)) {
        console.log('Deleting Recurring Payment:', id);
        setRecurringPayments(currentList => currentList.filter(payment => payment.id !== id));
    }
  };


  // --- Render Logic ---
  return (
    <div className="bg-white p-6 rounded shadow max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 border-b pb-3">
        <h1 className="text-2xl font-bold text-gray-800">Recurring Payments</h1>
        <button className="px-3 py-1 rounded text-white hover:opacity-90 bg-gray-800 text-sm" onClick={onBack}>
          Back to Dashboard
        </button>
      </div>

      {/* Status Filters and Search */}
      <div className="flex flex-wrap sm:flex-nowrap space-y-3 sm:space-y-0 sm:space-x-4 mb-6">
         {/* Status Buttons */}
         <div className="flex border border-gray-300 rounded overflow-hidden flex-shrink-0">
            {Object.entries(statusCounts).map(([status, count]) => (
                 <button key={status} onClick={() => handleStatusFilterChange(status)} className={`px-3 sm:px-4 py-2 text-sm border-l border-gray-300 first:border-l-0 transition-colors duration-150 ${ statusFilter === status ? 'bg-emtech-gold text-white font-medium' : 'bg-white hover:bg-gray-50' }`} > {status} ({count}) </button>
            ))}
         </div>
         {/* Search Input */}
         <div className="flex-grow w-full sm:w-auto"> <div className="relative"> <input type="text" className="w-full pl-10 pr-4 py-2 border rounded text-sm" placeholder="Search by name, recipient, account, amount..." value={searchTerm} onChange={handleSearchChange} /> <div className="absolute left-3 top-2.5 text-gray-400"> <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg> </div> </div> </div>
         {/* Setup New Button */}
         <button className="px-4 py-2 rounded text-white hover:opacity-90 bg-emtech-gold text-sm w-full sm:w-auto flex-shrink-0" onClick={handleSetupNew} > Setup New Recurring Payment </button>
       </div>

      {/* View Toggle and Calendar Nav */}
      <div className="flex justify-between items-center mb-4">
         <div className="flex items-center"> <h2 className="font-medium mr-4 text-gray-800">Schedule</h2> <div className="flex border border-gray-300 rounded overflow-hidden text-sm"> <button onClick={() => handleViewToggle('list')} className={`px-3 py-1 transition-colors duration-150 ${viewMode === 'list' ? 'bg-gray-200 font-medium' : 'bg-white hover:bg-gray-50'}`}> List View </button> <button onClick={() => handleViewToggle('calendar')} className={`px-3 py-1 border-l border-gray-300 transition-colors duration-150 ${viewMode === 'calendar' ? 'bg-gray-200 font-medium' : 'bg-white hover:bg-gray-50'}`}> Calendar View </button> </div> </div>
         {viewMode === 'calendar' && ( <div className="flex items-center text-sm"> <span className="text-gray-600 mr-2">April 2025</span> <button onClick={() => handleCalendarNav('prev')} className="p-1 border border-gray-300 rounded-l hover:bg-gray-50"> <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg> </button> <button onClick={() => handleCalendarNav('next')} className="p-1 border-t border-b border-r border-gray-300 rounded-r hover:bg-gray-50"> <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg> </button> </div> )}
       </div>

      {/* Conditional View: List or Calendar */}
      {viewMode === 'list' && (
        <>
          {/* Recurring Payments Table */}
          <div className="overflow-x-auto mb-6">
            <table className="min-w-full">
              {/* --- Table Head (thead) --- */}
              <thead> <tr> <th className="py-3 px-4 border-b border-gray-200 bg-gray-50 text-left text-sm font-medium text-gray-500 uppercase">Payment Name</th> <th className="py-3 px-4 border-b border-gray-200 bg-gray-50 text-left text-sm font-medium text-gray-500 uppercase">Recipient</th> <th className="py-3 px-4 border-b border-gray-200 bg-gray-50 text-left text-sm font-medium text-gray-500 uppercase">Amount</th> <th className="py-3 px-4 border-b border-gray-200 bg-gray-50 text-left text-sm font-medium text-gray-500 uppercase">Frequency</th> <th className="py-3 px-4 border-b border-gray-200 bg-gray-50 text-left text-sm font-medium text-gray-500 uppercase">Next Payment</th> <th className="py-3 px-4 border-b border-gray-200 bg-gray-50 text-left text-sm font-medium text-gray-500 uppercase">Status</th> <th className="py-3 px-4 border-b border-gray-200 bg-gray-50 text-center text-sm font-medium text-gray-500 uppercase">Actions</th> </tr> </thead>
              {/* --- Table Body (tbody) --- */}
              <tbody>
                 {filteredPayments.length > 0 ? filteredPayments.map((payment) => (
                   <tr key={payment.id} className={`hover:bg-gray-50 ${payment.status === 'Paused' || payment.status === 'Completed' ? 'opacity-60 bg-gray-50' : ''}`}>
                     {/* Payment Details Cells */}
                     <td className="py-3 px-4 border-b border-gray-200"> <div> <p className="font-medium text-sm">{payment.name}</p> <p className="text-xs text-gray-500">From: {payment.fromAccount}</p> </div> </td>
                     <td className="py-3 px-4 border-b border-gray-200 text-sm">{payment.recipient}</td>
                     <td className="py-3 px-4 border-b border-gray-200 text-sm font-medium">{payment.amount}</td>
                     <td className="py-3 px-4 border-b border-gray-200 text-sm">{payment.frequency}</td>
                     <td className="py-3 px-4 border-b border-gray-200 text-sm"> <div> <p>{payment.nextDate}</p> {payment.nextTime && payment.status !== 'Paused' && <p className="text-xs text-gray-500">{payment.nextTime}</p>} </div> </td>
                     {/* Status Badge */}
                     <td className="py-3 px-4 border-b border-gray-200"> <span className={`px-2 py-1 text-xs rounded-full capitalize ${ payment.status === 'Active' ? 'bg-green-100 text-green-800' : payment.status === 'Paused' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-500' }`}>{payment.status}</span> </td>
                     {/* Action Buttons */}
                     <td className="py-3 px-4 border-b border-gray-200">
                       <div className="flex justify-center space-x-2">
                         <button title="Edit" onClick={() => handleEdit(payment.id)} className="p-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50" disabled={payment.status === 'Completed'}> <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg> </button>
                         <button title={payment.status === 'Active' ? 'Pause' : 'Play'} onClick={() => handlePauseToggle(payment.id, payment.status)} className={`p-1 border border-gray-300 rounded hover:bg-gray-100 ${payment.status === 'Completed' ? 'invisible' : ''}`}>
                            {payment.status === 'Active' ? <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> : <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> }
                         </button>
                         <button title="Delete" onClick={() => handleDelete(payment.id, payment.name)} className="p-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50" disabled={payment.status === 'Completed'}> <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg> </button>
                       </div>
                     </td>
                   </tr>
                 )) : ( <tr><td colSpan="7" className="text-center py-10 text-gray-500 italic"> No recurring payments found matching your criteria. </td></tr> )}
               </tbody>
            </table>
          </div>
          {/* Pagination (Placeholder UI) */}
          {filteredPayments.length > 0 && ( <div className="flex justify-between items-center"> <div className="text-sm text-gray-600">Showing {filteredPayments.length} of {recurringPayments.length}</div> <div className="flex space-x-1"> <button className="px-3 py-1 border border-gray-300 rounded text-gray-600 hover:bg-gray-50 text-sm" disabled>Previous</button> <button className="px-3 py-1 bg-emtech-gold text-white rounded text-sm" disabled>1</button> <button className="px-3 py-1 border border-gray-300 rounded text-gray-600 hover:bg-gray-50 text-sm" disabled>Next</button> </div> </div> )}
        </>
      )} {/* End List View */}

      {viewMode === 'calendar' && ( <div className="border rounded p-6 text-center text-gray-500 h-96 flex items-center justify-center"> Calendar View Placeholder </div> )}

      {/* Upcoming Schedule Section (Static for now) */}
      <div className="mt-8 pt-6 border-t">
         <h2 className="font-medium mb-3 text-gray-800">Upcoming Payment Schedule</h2>
         {/* (Static Schedule JSX - unchanged) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           {/* Today */} <div className="bg-green-50 p-4 rounded border border-green-200"> <h3 className="text-sm font-medium text-green-800 mb-2">Today (Apr 8, 2025)</h3> <div className="space-y-3"> {/* Add relevant payment */} </div> </div>
           {/* Tomorrow */} <div className="bg-gray-50 p-4 rounded border border-gray-200"> <h3 className="text-sm font-medium text-gray-800 mb-2">Tomorrow (Apr 9, 2025)</h3> <div className="space-y-3"> <div className="bg-white p-3 rounded border border-gray-200 text-sm"> <p className="font-medium">Singapore Daily Liquidity</p> <p className="text-xs text-gray-500">7:00 AM UTC</p> </div> <div className="bg-white p-3 rounded border border-gray-200 text-sm"> <p className="font-medium">Test Recurring Internal</p> <p className="text-xs text-gray-500">1:00 PM UTC</p> </div> </div> </div>
           {/* Next Week */} <div className="bg-gray-50 p-4 rounded border border-gray-200"> <h3 className="text-sm font-medium text-gray-800 mb-2">Next Week (Apr 14-20)</h3> <div className="space-y-3"> <div className="bg-white p-3 rounded border border-gray-200 text-sm"> <p className="font-medium">JPM Weekly Liquidity</p> <p className="text-xs text-gray-500">Apr 14, 9:00 AM UTC</p> </div> <div className="bg-white p-3 rounded border border-gray-200 text-sm"> <p className="font-medium">ICICI Mumbai Transfer</p> <p className="text-xs text-gray-500">Apr 15, 5:00 AM UTC</p> </div> </div> </div>
         </div>
       </div>

    </div> // End main container
  );
};

export default ManageRecurringPaymentsScreen;