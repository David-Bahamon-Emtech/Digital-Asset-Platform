// src/features/Payments/AuthorizeHVTScreen.js
import React, { useState, useMemo, useEffect } from 'react';

// NOTE: initialDummyHVTs definition and export REMOVED

// --- Component ---
// Expects:
// - onBack: function to navigate back
// - onNavigate: function to navigate to other screens (e.g., details)
// - pendingHvts: Array of HVT objects to display (typically filtered for 'Pending Approval' by parent)
// - onAuthorizeHvt: function(id) to call when authorizing
// - onRejectHvt: function(id, reason) to call when rejecting
const AuthorizeHVTScreen = ({
    onBack,
    onNavigate,
    pendingHvts = [], // Use prop, default to empty array
    onAuthorizeHvt,
    onRejectHvt
}) => {

  // --- State --- (Keep UI control state)
  // Note: Status filter might be less relevant if parent always passes only 'Pending' items
  // Keep it for now, assuming parent might pass Pending + recently Auth/Rejected for context
  const [statusFilter, setStatusFilter] = useState('Pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTransferIds, setSelectedTransferIds] = useState(new Set());

  // Remove hvtList state - use pendingHvts prop instead
  // const [hvtList, setHvtList] = useState(initialDummyHVTs);

  // --- Filtering Logic --- (Uses pendingHvts prop)
  const filteredHVTs = useMemo(() => {
    // Filter the incoming prop data based on local UI filters (search/status)
    return pendingHvts.filter(hvt => {
      if (statusFilter !== 'All' && hvt.status !== statusFilter) return false;
      const term = searchTerm.toLowerCase();
      // Ensure fields exist before calling toLowerCase()
      const idMatch = hvt.id && hvt.id.toLowerCase().includes(term);
      const recipientMatch = hvt.recipient && hvt.recipient.toLowerCase().includes(term);
      const purposeMatch = hvt.purpose && hvt.purpose.toLowerCase().includes(term);
      const initiatorMatch = hvt.initiatedBy && hvt.initiatedBy.toLowerCase().includes(term);
      const amountMatch = hvt.amount && hvt.amount.toString().includes(term);

      if (term && !(idMatch || recipientMatch || purposeMatch || initiatorMatch || amountMatch)) return false;

      return true;
    });
  }, [statusFilter, searchTerm, pendingHvts]); // Depend on prop

  // --- Batch Selection Logic --- (Uses pendingHvts prop and filteredHVTs)
  const handleSelectAll = (event) => {
    if (event.target.checked) {
      // Select only visible 'Pending' items when "Select All" is checked
      const allFilteredPendingIds = filteredHVTs
        .filter(hvt => hvt.status === 'Pending')
        .map(hvt => hvt.id);
      setSelectedTransferIds(new Set(allFilteredPendingIds));
    } else {
      setSelectedTransferIds(new Set());
    }
  };
  const handleSelectOne = (event, transferId) => {
    const newSelection = new Set(selectedTransferIds);
    if (event.target.checked) { newSelection.add(transferId); } else { newSelection.delete(transferId); }
    setSelectedTransferIds(newSelection);
  };
  const batchTotals = useMemo(() => {
     let count = 0;
     let totalUSD = 0;
     selectedTransferIds.forEach(id => {
         // Find in the original prop list to ensure data consistency
         const transfer = pendingHvts.find(hvt => hvt.id === id && hvt.status === 'Pending');
         if (transfer) {
             count++;
             // Use approxUSD if available, fallback to amount (assuming USD if no approx)
             totalUSD += transfer.approxUSD || transfer.amount || 0;
            }
     });
     return { count, totalUSD };
  }, [selectedTransferIds, pendingHvts]); // Depend on prop
  const isAllFilteredPendingSelected = useMemo(() => {
      const filteredPendingItems = filteredHVTs.filter(hvt => hvt.status === 'Pending');
      if (filteredPendingItems.length === 0) return false;
      // Check if every visible pending item ID is in the selection set
      // And ensure the size matches (no extra non-pending items selected somehow)
      return filteredPendingItems.every(hvt => selectedTransferIds.has(hvt.id)) && selectedTransferIds.size === filteredPendingItems.length;
  }, [selectedTransferIds, filteredHVTs]);
  // Clear selection when filter changes (remains the same)
  useEffect(() => { setSelectedTransferIds(new Set()); }, [statusFilter]);

  // Calculate counts for status filters (Uses pendingHvts prop)
  const statusCounts = useMemo(() => {
      // Initialize counts for expected statuses
      const counts = { All: pendingHvts.length, Pending: 0, Authorized: 0, Rejected: 0 };
      pendingHvts.forEach(p => {
          if (counts[p.status] !== undefined) {
              counts[p.status]++;
          }
      });
      // Ensure required keys exist even if count is 0
      counts.Pending = counts.Pending || 0;
      counts.Authorized = counts.Authorized || 0;
      counts.Rejected = counts.Rejected || 0;
      return counts;
  }, [pendingHvts]); // Depend on prop


  // --- Action Handlers ---
  const handleSearchChange = (e) => setSearchTerm(e.target.value); // OK
  const handleStatusFilterChange = (status) => setStatusFilter(status); // OK

  // --- UPDATED: Use Callbacks passed via props ---
  const handleAuthorize = (id) => {
    console.log('Authorize Button Clicked for HVT:', id);
    if (typeof onAuthorizeHvt === 'function') {
        onAuthorizeHvt(id); // Call parent handler
    } else {
        console.error("onAuthorizeHvt prop is not a function or is missing!");
        alert("Error: Authorization action is unavailable.");
    }
    // Clear selection optimistically (parent state change will cause re-render)
    setSelectedTransferIds(currentSelection => {
        const newSelection = new Set(currentSelection);
        newSelection.delete(id);
        return newSelection;
    });
  };
  const handleReject = (id) => {
    const reason = prompt(`Enter reason for rejecting HVT ${id} (optional):`);
    // Proceed even if reason is null/empty/cancelled (parent handler should deal with null reason)
    console.log('Reject Button Clicked for HVT:', id, 'Reason:', reason);
    if (typeof onRejectHvt === 'function') {
        onRejectHvt(id, reason); // Call parent handler with reason
    } else {
        console.error("onRejectHvt prop is not a function or is missing!");
        alert("Error: Rejection action is unavailable.");
    }
    // Clear selection optimistically
    setSelectedTransferIds(currentSelection => {
        const newSelection = new Set(currentSelection);
        newSelection.delete(id);
        return newSelection;
    });
  };
  const handleBatchAuthorize = () => {
    if (selectedTransferIds.size === 0) return;
    const idsToAuthorize = Array.from(selectedTransferIds);
    console.log('Batch Authorizing:', idsToAuthorize);
    if (typeof onAuthorizeHvt === 'function') {
        // Call parent handler for each ID
        idsToAuthorize.forEach(id => onAuthorizeHvt(id));
        alert(`${idsToAuthorize.length} transfer(s) submitted for authorization.`);
    } else {
        console.error("onAuthorizeHvt prop is not a function or is missing!");
        alert("Error: Batch authorization action is unavailable.");
    }
    setSelectedTransferIds(new Set()); // Clear selection after submitting batch action
  };
  const handleBatchReject = () => {
    if (selectedTransferIds.size === 0) return;
    const reason = prompt(`Enter reason for rejecting ${selectedTransferIds.size} selected transfer(s) (optional):`);
    const idsToReject = Array.from(selectedTransferIds);
    console.log('Batch Rejecting:', idsToReject, 'Reason:', reason);
     if (typeof onRejectHvt === 'function') {
        // Call parent handler for each ID
        idsToReject.forEach(id => onRejectHvt(id, reason));
        alert(`${idsToReject.length} transfer(s) submitted for rejection.`);
     } else {
         console.error("onRejectHvt prop is not a function or is missing!");
         alert("Error: Batch rejection action is unavailable.");
     }
    setSelectedTransferIds(new Set()); // Clear selection after submitting batch action
  };
  // --- END UPDATED ---


  // View Details Handler (unchanged - uses onNavigate prop correctly)
  const handleViewDetails = (id) => {
      console.log('Request View HVT Details:', id);
      if (onNavigate) {
          onNavigate('view-transfer-details', { transferId: id }); // Pass screen name and ID payload
      } else {
          console.error("onNavigate prop is missing from AuthorizeHVTScreen!");
          alert("Error: Cannot navigate to details."); // Fallback alert
      }
  };

  // Placeholders (unchanged)
  const handleExport = () => console.log('Export HVT List');
  const handleFilter = () => console.log('Open Advanced Filters');


  // --- Render Logic --- (Uses prop data and derived state)
  return (
    <div className="bg-white p-6 rounded shadow max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 border-b pb-3">
        <h1 className="text-2xl font-bold text-gray-800">Authorize High-Value Transfers</h1>
        <button className="px-3 py-1 rounded text-white hover:opacity-90 bg-gray-800 text-sm" onClick={onBack} > Back to Dashboard </button>
      </div>

      {/* Security Banner (Can be kept as is) */}
      <div className="flex items-center mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center mr-4 flex-shrink-0"> <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg> </div>
          <div> <h3 className="font-medium">Authorization Queue</h3> <p className="text-sm text-gray-600">Review and action pending high-value transfers.</p> </div>
          <div className="ml-auto flex-shrink-0"> <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">Security level: Enhanced</span> </div>
      </div>


      {/* Filter Controls (uses statusCounts based on prop) */}
      <div className="flex flex-wrap sm:flex-nowrap space-y-3 sm:space-y-0 sm:space-x-4 mb-6">
         {/* Status Filter Buttons */}
         <div className="flex border border-gray-300 rounded overflow-hidden flex-shrink-0">
             {/* Use statusCounts derived from prop data */}
             {Object.entries(statusCounts).map(([status, count]) => {
                 // Decide whether to show the filter button
                 const showButton = status === 'All' || status === 'Pending' || count > 0;
                 if (showButton) {
                     return ( <button key={status} onClick={() => handleStatusFilterChange(status)} className={`px-3 sm:px-4 py-2 text-sm border-l border-gray-300 first:border-l-0 transition-colors duration-150 ${ statusFilter === status ? 'bg-emtech-gold text-white font-medium' : 'bg-white hover:bg-gray-50' }`} > {status} ({count}) </button> );
                 }
                 return null;
             })}
         </div>
         {/* Search Input (unchanged) */}
         <div className="flex-grow w-full sm:w-auto"> <div className="relative"> <input type="text" className="w-full pl-10 pr-4 py-2 border rounded text-sm" placeholder="Search by ID, recipient, amount..." value={searchTerm} onChange={handleSearchChange} /> <div className="absolute left-3 top-2.5 text-gray-400"> {/* Search Icon */} <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg> </div> </div> </div>
         {/* Filter/Export Buttons (unchanged) */}
         <button onClick={handleFilter} className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 flex items-center text-sm flex-shrink-0"> Filter </button>
         <button onClick={handleExport} className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 flex items-center text-sm flex-shrink-0"> Export </button>
       </div>

      {/* Transfer List (Uses filteredHVTs derived from prop) */}
      <div>
        <h2 className="font-medium text-gray-800 mb-4">{statusFilter} Transfers</h2>
        <div className="space-y-4">
            {filteredHVTs.length > 0 ? filteredHVTs.map(hvt => (
                 // Row rendering logic remains largely the same, just uses data from filteredHVTs
                 <div key={hvt.id} className={`border rounded-lg overflow-hidden transition-colors duration-150 ${ hvt.isUrgent && hvt.status === 'Pending' ? 'border-red-300 bg-red-50' : hvt.status === 'Authorized' ? 'border-green-300 bg-green-50' : hvt.status === 'Rejected' ? 'border-gray-300 bg-gray-100 opacity-70' : 'border-gray-200 bg-white' }`}>
                     {/* Details Section */}
                     <div className="p-4 flex flex-col sm:flex-row justify-between sm:items-start gap-4">
                         {/* Checkbox (only for pending) */}
                         {hvt.status === 'Pending' && ( <div className="flex-shrink-0 sm:pt-1"> <input type="checkbox" className="h-4 w-4 rounded text-emtech-gold focus:ring-emtech-gold focus:ring-offset-1" checked={selectedTransferIds.has(hvt.id)} onChange={(e) => handleSelectOne(e, hvt.id)} /> </div> )}
                         {/* Left Side Info */}
                         <div className="flex-grow"> <p className="font-medium text-base sm:text-lg">{hvt.purpose} to {hvt.recipient}</p> <div className="mt-2 space-y-1 text-xs sm:text-sm"> <div className="flex"> <span className="w-28 text-gray-500 flex-shrink-0">Reference ID:</span> <span className="font-medium">{hvt.id}</span> </div> <div className="flex"> <span className="w-28 text-gray-500 flex-shrink-0">Initiated by:</span> <span className="font-medium">{hvt.initiatedBy || 'N/A'}</span> </div> <div className="flex"> <span className="w-28 text-gray-500 flex-shrink-0">Initiated on:</span> <span className="font-medium">{hvt.initiatedDate ? new Date(hvt.initiatedDate).toLocaleString() : 'N/A'}</span> </div> {hvt.rejectionReason && hvt.status === 'Rejected' && ( <div className="flex"> <span className="w-28 text-red-500 flex-shrink-0">Reason:</span> <span className="font-medium text-red-700">{hvt.rejectionReason}</span> </div> )} </div> </div>
                         {/* Right Side Amount & Actions */}
                         <div className="text-right flex-shrink-0 mt-2 sm:mt-0 sm:ml-4"> <div className="text-xl sm:text-2xl font-bold">{(hvt.amount || 0).toLocaleString()} <span className="text-base font-medium">{hvt.currency}</span></div> {hvt.approxUSD && <div className="text-gray-500 text-xs sm:text-sm">≈ ${(hvt.approxUSD || 0).toLocaleString()} USD</div>} <div className="flex mt-4 space-x-2 justify-end"> <button onClick={() => handleViewDetails(hvt.id)} className="px-3 py-1.5 rounded text-white hover:opacity-90 bg-blue-600 text-sm"> View Details </button> {hvt.status === 'Pending' && <> <button onClick={() => handleReject(hvt.id)} className="px-3 py-1.5 rounded border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm"> Reject </button> <button onClick={() => handleAuthorize(hvt.id)} className="px-3 py-1.5 rounded text-white hover:opacity-90 bg-emtech-gold text-sm font-semibold"> Authorize </button> </>} </div> </div>
                     </div>
                     {/* Approval Progress Bar */}
                     {hvt.status === 'Pending' && hvt.approvalsRequired > 0 && ( // Added check for approvalsRequired > 0
                         <div className={`p-3 border-t ${hvt.isUrgent ? 'bg-red-100 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
                            <div className="flex justify-between items-center">
                                <div className="flex items-center">
                                    <span className="text-sm text-gray-600 mr-2">Approval: {hvt.approvalsCompleted || 0} of {hvt.approvalsRequired || 0} complete</span>
                                    <div className="w-32 bg-gray-200 rounded-full h-2 overflow-hidden">
                                        <div className="bg-green-500 h-2" style={{ width: `${((hvt.approvalsCompleted || 0) / (hvt.approvalsRequired || 1)) * 100}%` }}></div> {/* Avoid division by zero */}
                                    </div>
                                </div>
                                {/* Add expiry info if available in data */}
                                {/* {hvt.expiryDate && <span className="text-xs text-red-600">Expires: {new Date(hvt.expiryDate).toLocaleTimeString()}</span>} */}
                            </div>
                         </div>
                     )}
                 </div>
            )) : ( <div className="text-center py-10 border border-dashed rounded-lg"> <p className="text-gray-500">No {statusFilter.toLowerCase()} high-value transfers found{searchTerm && ' matching your search'}.</p> </div> )}
        </div>
      </div>

      {/* Batch Authorization (Uses derived state based on prop) */}
      {/* Only show batch section if filter is Pending AND there are pending items */}
      {statusFilter === 'Pending' && filteredHVTs.filter(hvt => hvt.status === 'Pending').length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-200">
           <div className="flex flex-wrap justify-between items-center mb-4 gap-2"> <h2 className="font-medium text-gray-800">Batch Authorization</h2> <div> <label className="flex items-center cursor-pointer"> <input type="checkbox" className="mr-2 h-4 w-4 rounded text-emtech-gold focus:ring-emtech-gold" checked={isAllFilteredPendingSelected} onChange={handleSelectAll} disabled={filteredHVTs.filter(hvt => hvt.status === 'Pending').length === 0} /> <span className="text-sm">Select all visible pending</span> </label> </div> </div>
           <div className="p-4 bg-gray-50 rounded border border-gray-200"> <div className="flex flex-wrap justify-between items-center gap-4"> <div> <p className="font-medium text-sm">{batchTotals.count} Transfer(s) Selected</p> <p className="text-sm text-gray-600 mt-1">Total value: <span className="font-semibold">${batchTotals.totalUSD.toLocaleString()}</span> (Approx. USD)</p> </div> <div className="flex space-x-2 flex-shrink-0"> <button onClick={handleBatchReject} className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm" disabled={batchTotals.count === 0}> Batch Reject ({batchTotals.count}) </button> <button onClick={handleBatchAuthorize} className="px-4 py-2 rounded text-white bg-emtech-gold hover:opacity-90 text-sm" disabled={batchTotals.count === 0}> Batch Authorize ({batchTotals.count}) </button> </div> </div> </div>
         </div>
      )}

    </div> // End main container
  );
};

export default AuthorizeHVTScreen;