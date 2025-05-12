import React, { useState, useEffect, useMemo } from 'react';
import { usePaymentHistory } from '../../context/PaymentHistoryContext';
import { useAssets } from '../../context/AssetsContext';
import { ratesToUSD } from './data/paymentConstants';

// Component for Authorizing HVTs - now with a simple login gate for demo
const AuthorizeHVTScreen = ({
    onBack,
    onNavigate,
}) => {

  const { paymentHistory, dispatchPaymentHistory } = usePaymentHistory();
  const { dispatchAssets } = useAssets();

  // --- Login State ---
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Initially not authenticated
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  // --- Authorization List State ---
  const [statusFilter, setStatusFilter] = useState('Pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTransferIds, setSelectedTransferIds] = useState(new Set());

  // --- Derived Data (Memoized calculations) ---
  const allHvts = useMemo(() => {
    return paymentHistory.filter(item => item.rawData?._ui_payment_type === 'hvt');
  }, [paymentHistory]);

  const pendingHvtsList = useMemo(() => {
      return allHvts.filter(item => item.status?.toLowerCase().includes('pending'));
  }, [allHvts]);

  const filteredHVTs = useMemo(() => {
    return allHvts.filter(hvt => {
      const currentStatusLower = hvt.status?.toLowerCase() || '';
      if (statusFilter === 'Pending' && !currentStatusLower.includes('pending')) return false;
      if (statusFilter !== 'All' && statusFilter !== 'Pending' && hvt.status !== statusFilter) return false;
      const term = searchTerm.toLowerCase();
      if (!term) return true;
      const idMatch = hvt.id && hvt.id.toLowerCase().includes(term);
      const recipientMatch = hvt.recipient && hvt.recipient.toLowerCase().includes(term);
      const purposeMatch = hvt.rawData?.payment_info?.purpose && hvt.rawData.payment_info.purpose.toLowerCase().includes(term);
      const initiatorEntityMatch = hvt.rawData?.payment_source?.entity && hvt.rawData.payment_source.entity.toLowerCase().includes(term);
      const initiatorOnBehalfMatch = hvt.rawData?.payment_source?.onBehalfOf && hvt.rawData.payment_source.onBehalfOf.toLowerCase().includes(term);
      const amountMatch = hvt.amount && hvt.amount.toString().includes(term);
      const currencyMatch = hvt.currency && hvt.currency.toLowerCase().includes(term);
      const descriptionMatch = hvt.rawData?.payment_info?.description && hvt.rawData.payment_info.description.toLowerCase().includes(term);
      return idMatch || recipientMatch || purposeMatch || initiatorEntityMatch || initiatorOnBehalfMatch || amountMatch || currencyMatch || descriptionMatch;
    });
  }, [statusFilter, searchTerm, allHvts]);

   const batchTotals = useMemo(() => {
     let count = 0;
     let totalUSD = 0;
     selectedTransferIds.forEach(id => {
         const transfer = pendingHvtsList.find(hvt => hvt.id === id);
         if (transfer) {
             count++;
             const amount = transfer.rawData?._simulated_total_debit || transfer.amount || 0;
             const currency = transfer.currency || 'USD';
             const rate = ratesToUSD[currency] || 0;
             if (rate > 0) { totalUSD += amount * rate; }
             else if (currency === 'USD') { totalUSD += amount; }
             else { console.warn(`Batch Total: Missing rate for ${currency}`); }
            }
     });
     return { count, totalUSD: totalUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) };
  }, [selectedTransferIds, pendingHvtsList]);


  const isAllFilteredPendingSelected = useMemo(() => {
      const visiblePendingItems = filteredHVTs.filter(hvt => pendingHvtsList.some(pending => pending.id === hvt.id));
      if (visiblePendingItems.length === 0) return false;
      return visiblePendingItems.every(hvt => selectedTransferIds.has(hvt.id)) && selectedTransferIds.size === visiblePendingItems.length;
  }, [selectedTransferIds, filteredHVTs, pendingHvtsList]);

  const statusCounts = useMemo(() => {
      const counts = { All: allHvts.length, Pending: 0, Authorized: 0, Rejected: 0 };
      let pendingCount = 0;
      allHvts.forEach(p => {
          const statusLower = p.status?.toLowerCase() || '';
          if (statusLower.includes('pending')) { pendingCount++; }
          if (p.status === 'Authorized') counts.Authorized++;
          else if (p.status?.startsWith('Rejected')) counts.Rejected++;
      });
      counts.Pending = pendingCount;
      return counts;
  }, [allHvts]);

  // --- Effects ---
  useEffect(() => { setSelectedTransferIds(new Set()); }, [statusFilter]);

  // --- Handlers ---
  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const allFilteredPendingIds = filteredHVTs.filter(hvt => pendingHvtsList.some(pending => pending.id === hvt.id)).map(hvt => hvt.id);
      setSelectedTransferIds(new Set(allFilteredPendingIds));
    } else { setSelectedTransferIds(new Set()); }
  };
  const handleSelectOne = (event, transferId) => {
    const newSelection = new Set(selectedTransferIds);
    if (event.target.checked) { newSelection.add(transferId); } else { newSelection.delete(transferId); }
    setSelectedTransferIds(newSelection);
  };
  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const handleStatusFilterChange = (status) => setStatusFilter(status);

  const handleAuthorize = (hvtId) => {
    console.log('Authorizing HVT:', hvtId);
    const itemToAuthorize = paymentHistory.find(item => item.id === hvtId && item.status?.toLowerCase().includes('pending'));
    if (!itemToAuthorize) { console.error("Cannot find pending HVT to authorize:", hvtId); alert("Error: Transfer not found."); return; }
    dispatchPaymentHistory({ type: 'UPDATE_PAYMENT_STATUS', payload: { entryId: hvtId, newStatus: 'Authorized', newTimestamp: new Date() } });
    if (itemToAuthorize.rawData?._ui_payment_origin === 'institutional' && itemToAuthorize.rawData?.payment_source?.account_id && itemToAuthorize.rawData?._simulated_total_debit > 0) {
        dispatchAssets({ type: 'UPDATE_ASSET_BALANCE', payload: { assetId: itemToAuthorize.rawData.payment_source.account_id, changeAmount: -itemToAuthorize.rawData._simulated_total_debit } });
    }
    setSelectedTransferIds(currentSelection => { const ns = new Set(currentSelection); ns.delete(hvtId); return ns; });
    alert(`HVT ${hvtId} authorized.`);
  };
  const handleReject = (hvtId) => {
    const reason = prompt(`Enter reason for rejecting HVT ${hvtId} (optional):`);
    const newStatus = `Rejected${reason ? ` (${reason.trim()})` : ''}`;
    dispatchPaymentHistory({ type: 'UPDATE_PAYMENT_STATUS', payload: { entryId: hvtId, newStatus: newStatus, newTimestamp: new Date() } });
    setSelectedTransferIds(currentSelection => { const ns = new Set(currentSelection); ns.delete(hvtId); return ns; });
    alert(`HVT ${hvtId} rejected.`);
  };
  const handleBatchAuthorize = () => {
    if (selectedTransferIds.size === 0) return;
    const idsToAuthorize = Array.from(selectedTransferIds);
    console.log('Batch Authorizing:', idsToAuthorize);
    idsToAuthorize.forEach(id => {
        const itemToAuthorize = paymentHistory.find(item => item.id === id && item.status?.toLowerCase().includes('pending'));
        if (itemToAuthorize) {
            dispatchPaymentHistory({ type: 'UPDATE_PAYMENT_STATUS', payload: { entryId: id, newStatus: 'Authorized', newTimestamp: new Date() } });
            if (itemToAuthorize.rawData?._ui_payment_origin === 'institutional' && itemToAuthorize.rawData?.payment_source?.account_id && itemToAuthorize.rawData?._simulated_total_debit > 0) {
                dispatchAssets({ type: 'UPDATE_ASSET_BALANCE', payload: { assetId: itemToAuthorize.rawData.payment_source.account_id, changeAmount: -itemToAuthorize.rawData._simulated_total_debit } });
            }
        } else { console.warn("Could not find pending HVT in history during batch authorize for ID:", id); }
    });
    alert(`${idsToAuthorize.length} transfer(s) submitted for authorization.`);
    setSelectedTransferIds(new Set());
  };
  const handleBatchReject = () => {
    if (selectedTransferIds.size === 0) return;
    const reason = prompt(`Enter reason for rejecting ${selectedTransferIds.size} selected transfer(s) (optional):`);
    const idsToReject = Array.from(selectedTransferIds);
    const newStatus = `Rejected${reason ? ` (${reason.trim()})` : ''}`;
    idsToReject.forEach(id => { dispatchPaymentHistory({ type: 'UPDATE_PAYMENT_STATUS', payload: { entryId: id, newStatus: newStatus, newTimestamp: new Date() } }); });
    alert(`${idsToReject.length} transfer(s) submitted for rejection.`);
    setSelectedTransferIds(new Set());
  };
  const handleViewDetails = (id) => {
      if (onNavigate) { onNavigate('view-transfer-details', { transferId: id }); }
      else { console.error("onNavigate prop is missing!"); alert("Error: Cannot navigate."); }
  };
  const handleExport = () => console.log('Export HVT List');
  const handleFilter = () => console.log('Open Advanced Filters');

  // --- NEW: Login Handler ---
  const handleLoginAttempt = (event) => {
    event.preventDefault();
    // --- DEMO ONLY: Highly insecure hardcoded credentials ---
    if (usernameInput === 'user' && passwordInput === 'password') {
        setIsAuthenticated(true);
        setLoginError('');
    } else {
        setLoginError('Invalid username or password.');
        setPasswordInput(''); // Clear password on failure
    }
  };

  // --- Conditional Rendering based on Authentication ---

  if (!isAuthenticated) {
    // --- Render Login Form ---
    return (
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md mx-auto mt-12 border border-gray-200">
             <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">HVT Authorization Required</h1>
             <form onSubmit={handleLoginAttempt} className="space-y-4">
                <div>
                    <label htmlFor="auth_username" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                    <input
                        type="text"
                        id="auth_username"
                        value={usernameInput}
                        onChange={(e) => setUsernameInput(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                        autoFocus
                     />
                 </div>
                 <div>
                    <label htmlFor="auth_password"className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input
                        type="password"
                        id="auth_password"
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                     />
                 </div>
                 {loginError && (
                     <p className="text-red-600 text-sm text-center py-2">{loginError}</p>
                 )}
                 <button type="submit" className="w-full px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 font-medium">
                    Login
                 </button>
             </form>
             <div className="text-center mt-5">
                <button onClick={onBack} className="text-sm text-gray-500 hover:text-gray-700 hover:underline">
                    Cancel / Back to Dashboard
                </button>
             </div>
        </div>
    );
  }

  // --- Render Main Authorization Screen Content (if authenticated) ---
  return (
    <div className="bg-white p-6 rounded shadow max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6 border-b pb-3">
        <h1 className="text-2xl font-bold text-gray-800">Authorize High-Value Transfers</h1>
        <button className="px-3 py-1 rounded text-white hover:opacity-90 bg-gray-800 text-sm" onClick={onBack} > Back </button>
      </div>

      <div className="flex items-center mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center mr-4 flex-shrink-0"> <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg> </div>
          <div> <h3 className="font-medium">Authorization Queue</h3> <p className="text-sm text-gray-600">Review and action pending high-value transfers.</p> </div>
          <div className="ml-auto flex-shrink-0"> <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">Security level: Enhanced</span> </div>
      </div>

       <div className="flex flex-wrap sm:flex-nowrap space-y-3 sm:space-y-0 sm:space-x-4 mb-6">
         <div className="flex border border-gray-300 rounded overflow-hidden flex-shrink-0">
             {Object.entries(statusCounts).map(([status, count]) => {
                 const showButton = status === 'All' || status === 'Pending' || count > 0;
                 if (showButton) {
                     return ( <button key={status} onClick={() => handleStatusFilterChange(status)} className={`px-3 sm:px-4 py-2 text-sm border-l border-gray-300 first:border-l-0 transition-colors duration-150 ${ statusFilter === status ? 'bg-emtech-gold text-white font-medium' : 'bg-white hover:bg-gray-50' }`} > {status} ({count}) </button> );
                 }
                 return null;
             })}
         </div>
         <div className="flex-grow w-full sm:w-auto"> <div className="relative"> <input type="text" className="w-full pl-10 pr-4 py-2 border rounded text-sm" placeholder="Search by ID, recipient, amount..." value={searchTerm} onChange={handleSearchChange} /> <div className="absolute left-3 top-2.5 text-gray-400"> <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg> </div> </div> </div>
         <button onClick={handleFilter} className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 flex items-center text-sm flex-shrink-0"> Filter </button>
         <button onClick={handleExport} className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 flex items-center text-sm flex-shrink-0"> Export </button>
       </div>

       <div>
        <h2 className="font-medium text-gray-800 mb-4">{statusFilter} Transfers</h2>
        <div className="space-y-4">
            {filteredHVTs.length > 0 ? filteredHVTs.map(hvt => {
                 const isPending = hvt.status?.toLowerCase().includes('pending');
                 const isAuthorized = hvt.status === 'Authorized';
                 const isRejected = hvt.status?.toLowerCase().startsWith('rejected');
                 const canSelect = isPending;
                 const purpose = hvt.rawData?.payment_info?.purpose || 'N/A';
                 const recipient = hvt.rawData?.destination_counterparty_info?.name || hvt.recipient || 'N/A';
                 const initiatorEntity = hvt.rawData?.payment_source?.entity || 'N/A';
                 const initiatorOnBehalf = hvt.rawData?.payment_source?.onBehalfOf;
                 const initiatorDisplay = initiatorOnBehalf ? `${initiatorEntity} (On behalf of ${initiatorOnBehalf})` : initiatorEntity;
                 const isUrgent = hvt.rawData?.isUrgent === true;

                 return (
                     <div key={hvt.id} className={`border rounded-lg overflow-hidden transition-colors duration-150 ${ isUrgent && isPending ? 'border-red-300 bg-red-50' : isAuthorized ? 'border-green-300 bg-green-50' : isRejected ? 'border-gray-300 bg-gray-100 opacity-70' : 'border-gray-200 bg-white' }`}>
                         <div className="p-4 flex flex-col sm:flex-row justify-between sm:items-start gap-4">
                             {canSelect && ( <div className="flex-shrink-0 sm:pt-1"> <input type="checkbox" className="h-4 w-4 rounded text-emtech-gold focus:ring-emtech-gold focus:ring-offset-1" checked={selectedTransferIds.has(hvt.id)} onChange={(e) => handleSelectOne(e, hvt.id)} /> </div> )}
                             {!canSelect && <div className="flex-shrink-0 sm:pt-1 w-4 h-4 mr-2"></div>}
                             <div className="flex-grow">
                                <p className="font-medium text-base sm:text-lg">{purpose} to {recipient}</p>
                                <div className="mt-2 space-y-1 text-xs sm:text-sm">
                                    <div className="flex"> <span className="w-28 text-gray-500 flex-shrink-0">Reference ID:</span> <span className="font-medium">{hvt.id}</span> </div>
                                    <div className="flex"> <span className="w-28 text-gray-500 flex-shrink-0">Initiated by:</span> <span className="font-medium">{initiatorDisplay}</span> </div>
                                    <div className="flex"> <span className="w-28 text-gray-500 flex-shrink-0">Initiated on:</span> <span className="font-medium">{hvt.timestamp ? new Date(hvt.timestamp).toLocaleString() : 'N/A'}</span> </div>
                                    {isRejected && hvt.status?.includes('(') && (
                                        <div className="flex"> <span className="w-28 text-red-500 flex-shrink-0">Reason:</span> <span className="font-medium text-red-700">{hvt.status.substring(hvt.status.indexOf('(') + 1, hvt.status.lastIndexOf(')'))}</span> </div>
                                    )}
                                </div>
                             </div>
                             <div className="text-right flex-shrink-0 mt-2 sm:mt-0 sm:ml-4">
                                 <div className="text-xl sm:text-2xl font-bold">{(hvt.amount || 0).toLocaleString()} <span className="text-base font-medium">{hvt.currency}</span></div>
                                 {isUrgent && isPending && <div className="text-red-600 text-sm font-semibold mt-1">URGENT</div>}
                                 <div className="flex mt-4 space-x-2 justify-end">
                                     <button onClick={() => handleViewDetails(hvt.id)} className="px-3 py-1.5 rounded text-white hover:opacity-90 bg-blue-600 text-sm"> View Details </button>
                                     {isPending && <>
                                        <button onClick={() => handleReject(hvt.id)} className="px-3 py-1.5 rounded border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm"> Reject </button>
                                        <button onClick={() => handleAuthorize(hvt.id)} className="px-3 py-1.5 rounded text-white hover:opacity-90 bg-emtech-gold text-sm font-semibold"> Authorize </button>
                                     </>}
                                 </div>
                             </div>
                         </div>
                     </div>
                 );
             }) : ( <div className="text-center py-10 border border-dashed rounded-lg"> <p className="text-gray-500">No {statusFilter.toLowerCase()} high-value transfers found{searchTerm && ' matching your search'}.</p> </div> )}
        </div>
      </div>

      {statusFilter === 'Pending' && pendingHvtsList.length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-200">
           <div className="flex flex-wrap justify-between items-center mb-4 gap-2"> <h2 className="font-medium text-gray-800">Batch Authorization</h2> <div> <label className="flex items-center cursor-pointer"> <input type="checkbox" className="mr-2 h-4 w-4 rounded text-emtech-gold focus:ring-emtech-gold" checked={isAllFilteredPendingSelected} onChange={handleSelectAll} disabled={filteredHVTs.filter(hvt => hvt.status?.toLowerCase().includes('pending')).length === 0} /> <span className="text-sm">Select all visible pending</span> </label> </div> </div>
           <div className="p-4 bg-gray-50 rounded border border-gray-200"> <div className="flex flex-wrap justify-between items-center gap-4"> <div> <p className="font-medium text-sm">{batchTotals.count} Transfer(s) Selected</p> <p className="text-sm text-gray-600 mt-1">Total value: <span className="font-semibold">${batchTotals.totalUSD}</span> (Approx. USD)</p> </div> <div className="flex space-x-2 flex-shrink-0"> <button onClick={handleBatchReject} className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm" disabled={batchTotals.count === 0}> Batch Reject ({batchTotals.count}) </button> <button onClick={handleBatchAuthorize} className="px-4 py-2 rounded text-white bg-emtech-gold hover:opacity-90 text-sm" disabled={batchTotals.count === 0}> Batch Authorize ({batchTotals.count}) </button> </div> </div> </div>
         </div>
      )}

    </div>
  );
};

export default AuthorizeHVTScreen;