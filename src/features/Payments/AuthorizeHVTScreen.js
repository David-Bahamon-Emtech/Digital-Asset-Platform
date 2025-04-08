// src/features/Payments/AuthorizeHVTScreen.js
import React, { useState, useMemo } from 'react';

// --- Simulated Data for Pending HVTs ---
const dummyPendingHVTs = [
  // Urgent example from code chunk
  { id: 'HVT-982470', isUrgent: true, recipient: 'Bank of England', purpose: 'Treasury Management Operation', amount: 42500000, currency: 'GBP', approxUSD: 53125000, initiatedBy: 'R. Johnson (Treasury Ops)', initiatedDate: '2025-04-08T09:23:00Z', expiryDate: new Date(Date.now() + 2 * 60 * 60 * 1000 + 17 * 60 * 1000).toISOString(), // Approx 2h 17m from now
    approvalsRequired: 3, approvalsCompleted: 1, status: 'Pending' },
  // Other pending examples
  { id: 'HVT-982469', isUrgent: false, recipient: 'Federal Reserve', purpose: 'Reserve Account Funding', amount: 35000000, currency: 'USD', approxUSD: 35000000, initiatedBy: 'M. Zhang (Treasury)', initiatedDate: '2025-04-08T08:47:00Z', expiryDate: null, // No expiry shown
    approvalsRequired: 2, approvalsCompleted: 1, status: 'Pending' },
  { id: 'HVT-982468', isUrgent: false, recipient: 'Bank of Japan', purpose: 'Interbank Settlement', amount: 2850000000, currency: 'JPY', approxUSD: 19000000, initiatedBy: 'A. Tanaka (APAC Treasury)', initiatedDate: '2025-04-08T07:15:00Z', expiryDate: null, // No expiry shown
    approvalsRequired: 2, approvalsCompleted: 0, status: 'Pending' },
   // Add more dummy items if needed, including potentially 'Authorized' or 'Rejected' ones for filtering test
];


// --- Component ---
const AuthorizeHVTScreen = ({ onBack, onNavigate }) => { // Expects onBack and potentially onNavigate

  // --- State ---
  const [statusFilter, setStatusFilter] = useState('Pending'); // Default to 'Pending'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTransferIds, setSelectedTransferIds] = useState(new Set()); // Use a Set for efficient add/delete/check

  // --- Filtering Logic ---
  const filteredHVTs = useMemo(() => {
    return dummyPendingHVTs.filter(hvt => {
      // Status Filter
      if (hvt.status !== statusFilter) {
        return false;
      }
      // Search Term Filter (ID, Recipient, Purpose, Initiator)
      const term = searchTerm.toLowerCase();
      if (term && !(
          hvt.id.toLowerCase().includes(term) ||
          hvt.recipient.toLowerCase().includes(term) ||
          hvt.purpose.toLowerCase().includes(term) ||
          hvt.initiatedBy.toLowerCase().includes(term) ||
          hvt.amount.toString().includes(term)
      )) {
        return false;
      }
      return true;
    });
  }, [statusFilter, searchTerm]);

  // --- Batch Selection Logic ---
  const handleSelectAll = (event) => {
    if (event.target.checked) {
      // Select all *filtered* pending transfers
      const allFilteredPendingIds = filteredHVTs.filter(hvt => hvt.status === 'Pending').map(hvt => hvt.id);
      setSelectedTransferIds(new Set(allFilteredPendingIds));
    } else {
      setSelectedTransferIds(new Set()); // Clear selection
    }
  };

  const handleSelectOne = (event, transferId) => {
    const newSelection = new Set(selectedTransferIds);
    if (event.target.checked) {
      newSelection.add(transferId);
    } else {
      newSelection.delete(transferId);
    }
    setSelectedTransferIds(newSelection);
  };

  // Calculate batch totals (only for selected *pending* items)
  const batchTotals = useMemo(() => {
     let count = 0;
     let totalUSD = 0;
     selectedTransferIds.forEach(id => {
         const transfer = dummyPendingHVTs.find(hvt => hvt.id === id && hvt.status === 'Pending');
         if (transfer) {
             count++;
             totalUSD += transfer.approxUSD || 0; // Use approxUSD for summing
         }
     });
     return { count, totalUSD };
  }, [selectedTransferIds]);

  const isAllFilteredPendingSelected = useMemo(() => {
      const filteredPendingCount = filteredHVTs.filter(hvt => hvt.status === 'Pending').length;
      return filteredPendingCount > 0 && selectedTransferIds.size === filteredPendingCount;
  }, [selectedTransferIds, filteredHVTs]);


  // --- Placeholder Handlers ---
  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const handleStatusFilterChange = (status) => {
      setStatusFilter(status);
      setSelectedTransferIds(new Set()); // Clear selection when changing filter
  };
  const handleAuthorize = (id) => console.log('Authorize HVT:', id);
  const handleReject = (id) => console.log('Reject HVT:', id);
  const handleViewDetails = (id) => {
      console.log('View HVT Details:', id);
      // Example navigation: onNavigate('view-transfer-details', { transferId: id });
  }
  const handleBatchAuthorize = () => console.log('Batch Authorize:', Array.from(selectedTransferIds));
  const handleBatchReject = () => console.log('Batch Reject:', Array.from(selectedTransferIds));
  const handleExport = () => console.log('Export HVT List');
  const handleFilter = () => console.log('Open Advanced Filters');


  // --- Render Logic ---
  return (
    <div className="bg-white p-6 rounded shadow max-w-7xl mx-auto"> {/* Wider container */}
      {/* Header */}
      <div className="flex justify-between items-center mb-6 border-b pb-3">
        <h1 className="text-2xl font-bold text-gray-800">Authorize High-Value Transfers</h1>
        <button className="px-3 py-1 rounded text-white hover:opacity-90 bg-gray-800 text-sm" onClick={onBack} >
          Back to Dashboard
        </button>
      </div>

      {/* Security Verification Banner (Static) */}
      <div className="flex items-center mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
        <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center mr-4 flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
        </div>
        <div> <h3 className="font-medium">Authorization Session Active</h3> <p className="text-sm text-gray-600">Your identity has been verified. Review and authorize transfers.</p> </div>
        <div className="ml-auto flex-shrink-0"> <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">Security level: Enhanced</span> </div>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-wrap sm:flex-nowrap space-y-3 sm:space-y-0 sm:space-x-4 mb-6">
         <div className="flex border border-gray-300 rounded overflow-hidden flex-shrink-0">
            {['Pending', 'Authorized', 'Rejected'].map(status => {
                const count = status === 'Pending' ? filteredHVTs.filter(h => h.status === 'Pending').length : 0; // Simple count for pending filter
                return (
                     <button
                       key={status}
                       onClick={() => handleStatusFilterChange(status)}
                       className={`px-3 sm:px-4 py-2 text-sm border-l border-gray-300 first:border-l-0 transition-colors duration-150 ${
                           statusFilter === status ? 'bg-emtech-gold text-white font-medium' : 'bg-white hover:bg-gray-50'
                       }`}
                     >
                       {status} {status === 'Pending' ? `(${count})` : ''}
                     </button>
                 );
            })}
         </div>
         <div className="flex-grow w-full sm:w-auto">
           <div className="relative">
             <input type="text" className="w-full pl-10 pr-4 py-2 border rounded text-sm" placeholder="Search by ID, recipient, amount..." value={searchTerm} onChange={handleSearchChange} />
             <div className="absolute left-3 top-2.5 text-gray-400"> <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg> </div>
           </div>
         </div>
         <button onClick={handleFilter} className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 flex items-center text-sm flex-shrink-0"> <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg> Filter </button>
         <button onClick={handleExport} className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 flex items-center text-sm flex-shrink-0"> <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg> Export </button>
       </div>

      {/* Transfer List */}
      <div>
        <h2 className="font-medium text-gray-800 mb-4">{statusFilter} Transfers</h2>
        <div className="space-y-4">
            {filteredHVTs.length > 0 ? filteredHVTs.map(hvt => (
                 <div key={hvt.id} className={`border rounded-lg overflow-hidden ${hvt.isUrgent && hvt.status === 'Pending' ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'}`}>
                     {/* Urgent Banner */}
                     {hvt.isUrgent && hvt.status === 'Pending' && (
                         <div className="p-2 bg-red-100 text-red-800 text-xs font-medium text-center">URGENT AUTHORIZATION REQUIRED</div>
                     )}
                     {/* Transfer Details */}
                     <div className="p-4 flex flex-col sm:flex-row justify-between sm:items-start">
                         {/* Checkbox (only for pending) */}
                         {hvt.status === 'Pending' && (
                           <div className="mr-4 mb-2 sm:mb-0 flex-shrink-0 pt-1">
                             <input type="checkbox" className="h-4 w-4 rounded text-emtech-gold focus:ring-emtech-gold" checked={selectedTransferIds.has(hvt.id)} onChange={(e) => handleSelectOne(e, hvt.id)} />
                           </div>
                         )}
                         {/* Left Side Info */}
                         <div className="flex-grow">
                            <p className="font-medium text-base sm:text-lg">{hvt.purpose} to {hvt.recipient}</p>
                            <div className="mt-2 space-y-1 text-xs sm:text-sm">
                                <div className="flex items-center"> <span className="w-28 text-gray-500">Reference ID:</span> <span className="font-medium">{hvt.id}</span> </div>
                                <div className="flex items-center"> <span className="w-28 text-gray-500">Initiated by:</span> <span className="font-medium">{hvt.initiatedBy}</span> </div>
                                <div className="flex items-center"> <span className="w-28 text-gray-500">Initiated on:</span> <span className="font-medium">{new Date(hvt.initiatedDate).toLocaleString()}</span> </div>
                                {hvt.expiryDate && hvt.status === 'Pending' && (
                                    <div className="flex items-center"> <span className="w-28 text-gray-500">Expires in:</span> <span className="font-medium text-red-600">{/* Calculate time left */}</span> </div>
                                )}
                            </div>
                         </div>
                         {/* Right Side Amount & Actions */}
                         <div className="text-right flex-shrink-0 mt-2 sm:mt-0 sm:ml-4">
                             <div className="text-xl sm:text-2xl font-bold">{hvt.amount.toLocaleString()} <span className="text-base font-medium">{hvt.currency}</span></div>
                             {hvt.approxUSD && <div className="text-gray-500 text-xs sm:text-sm">≈ ${hvt.approxUSD.toLocaleString()} USD</div>}
                             <div className="flex mt-4 space-x-2 justify-end">
                                <button onClick={() => handleViewDetails(hvt.id)} className="px-3 py-1.5 rounded text-white hover:opacity-90 bg-blue-600 text-sm"> View Details </button>
                                {/* Show Auth/Reject only for Pending */}
                                {hvt.status === 'Pending' && <>
                                    <button onClick={() => handleReject(hvt.id)} className="px-3 py-1.5 rounded border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm"> Reject </button>
                                    <button onClick={() => handleAuthorize(hvt.id)} className="px-3 py-1.5 rounded text-white hover:opacity-90 bg-emtech-gold text-sm"> Authorize </button>
                                </>}
                             </div>
                         </div>
                     </div>
                     {/* Approval Progress Bar (only for pending) */}
                     {hvt.status === 'Pending' && (
                        <div className={`p-3 border-t ${hvt.isUrgent ? 'bg-red-100 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
                            <div className="flex justify-between items-center">
                                <div className="flex items-center">
                                    <span className="text-sm text-gray-600 mr-2">Approval: {hvt.approvalsCompleted} of {hvt.approvalsRequired} complete</span>
                                    <div className="w-32 bg-gray-200 rounded-full h-2 overflow-hidden">
                                        <div className="bg-green-500 h-2" style={{ width: `${(hvt.approvalsCompleted / hvt.approvalsRequired) * 100}%` }}></div>
                                    </div>
                                </div>
                                {/* Placeholder for who needs to approve next */}
                                {/* <span className="text-xs text-gray-500">Next: C. Level / Risk</span> */}
                            </div>
                        </div>
                     )}
                 </div>
            )) : (
                <div className="text-center py-10 border border-dashed rounded-lg">
                    <p className="text-gray-500">No {statusFilter.toLowerCase()} high-value transfers found.</p>
                </div>
            )}
        </div>
      </div>

      {/* Batch Authorization (only show if Pending filter is active and items are pending) */}
      {statusFilter === 'Pending' && filteredHVTs.length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-200">
           <div className="flex justify-between items-center mb-4">
             <h2 className="font-medium text-gray-800">Batch Authorization</h2>
             <div>
               <label className="flex items-center cursor-pointer">
                 <input type="checkbox" className="mr-2 h-4 w-4 rounded text-emtech-gold focus:ring-emtech-gold"
                    checked={isAllFilteredPendingSelected}
                    onChange={handleSelectAll}
                 />
                 <span className="text-sm">Select all pending transfers</span>
               </label>
             </div>
           </div>
           <div className="p-4 bg-gray-50 rounded border border-gray-200">
             <div className="flex flex-wrap justify-between items-center gap-4">
               <div>
                 <p className="font-medium text-sm">{batchTotals.count} Transfer(s) Selected</p>
                 <p className="text-sm text-gray-600 mt-1">Total value: <span className="font-semibold">${batchTotals.totalUSD.toLocaleString()}</span> (Approx. USD)</p>
               </div>
               <div className="flex space-x-2 flex-shrink-0">
                 <button onClick={handleBatchReject} className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm" disabled={batchTotals.count === 0}>
                   Batch Reject ({batchTotals.count})
                 </button>
                 <button onClick={handleBatchAuthorize} className="px-4 py-2 rounded text-white bg-emtech-gold hover:opacity-90 text-sm" disabled={batchTotals.count === 0}>
                   Batch Authorize ({batchTotals.count})
                 </button>
               </div>
             </div>
             <div className="mt-4 text-sm text-blue-600 flex items-center">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                 <span>Batch authorization requires additional security verification (Simulated).</span>
             </div>
           </div>
         </div>
      )}

    </div> // End main container
  );
};

export default AuthorizeHVTScreen;