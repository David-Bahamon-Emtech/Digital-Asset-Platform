import React, { useState, useEffect, useMemo } from 'react';
import { useAssets } from '../../context/AssetsContext.jsx';
import { useTokenHistory } from '../../context/TokenHistoryContext.jsx';
import { formatNumber } from '../../utils/displayUtils.jsx';

// Constants (assuming these might be needed or defined elsewhere)
const currentUserInitials = 'BK'; // Example: User initiating burn
const approverInitials = 'TA'; // Example: Final approver in workflow

// Define which predefined assets can be burned (same as TokenDashboard)
const allowedPredefinedTokenIds = [ 'cp-acme-01', 'mmf-usd-01', 'xagc-01', 'oil-wti-01', 'cc-verra-01', ];

/**
 * BurnTokenScreen Component
 * Allows users to initiate and manage the workflow for burning tokens,
 * limited to the amount currently held in reserve.
 */
const BurnTokenScreen = ({ onBack }) => {

  const { assets, dispatchAssets } = useAssets(); // Use dispatchAssets from context
  const { dispatchTokenHistory } = useTokenHistory();

  // Form State
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [amountToBurn, setAmountToBurn] = useState('');
  const [burnReason, setBurnReason] = useState('');
  const [burnNotes, setBurnNotes] = useState('');

  // Workflow State
  const [workflowState, setWorkflowState] = useState('idle'); // 'idle', 'pending_compliance', 'pending_treasury', 'approved', 'rejected'
  const [workflowMessage, setWorkflowMessage] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Filter assets eligible for burning
  const burnableAssets = useMemo(() => {
    if (!Array.isArray(assets)) return [];
    // Allow burning wizard-issued tokens OR specific predefined ones with Finite supply
    return assets.filter(asset =>
        asset.supply === 'Finite' && // Can only burn finite supply tokens
        (asset.isWizardIssued === true || allowedPredefinedTokenIds.includes(asset.id))
    );
  }, [assets]);

  // Get the full object for the selected asset
  const selectedAsset = useMemo(() => {
      if (!selectedAssetId || !Array.isArray(assets)) return null;
      return assets.find(asset => asset.id === selectedAssetId);
  }, [selectedAssetId, assets]);

  // Calculate amount available in reserve
  const reserveAmount = useMemo(() => {
      if (!selectedAsset || selectedAsset.supply !== 'Finite' || typeof selectedAsset.totalSupplyIssued !== 'number' || typeof selectedAsset.balance !== 'number') {
          return 0;
      }
      return Math.max(0, selectedAsset.totalSupplyIssued - selectedAsset.balance);
  }, [selectedAsset]);

  // Effect to reset form if selected asset becomes invalid
  useEffect(() => {
    if (selectedAssetId && !burnableAssets.some(a => a.id === selectedAssetId)) {
        console.log("Resetting selectedAssetId in Burn screen because it's no longer burnable.");
        setSelectedAssetId(''); setAmountToBurn(''); setBurnReason(''); setBurnNotes('');
    }
  }, [burnableAssets, selectedAssetId]);

  // Effect to manage workflow messages
  useEffect(() => {
    setIsLoading(false); // Reset loading state on workflow change
    switch (workflowState) {
      case 'pending_compliance': setWorkflowMessage('Burn request sent to Compliance Officer for review.'); break;
      case 'pending_treasury': setWorkflowMessage('Compliance approved. Request sent to Treasury Department for final review.'); break;
      case 'approved': setWorkflowMessage('Burn request fully approved. Ready to execute.'); break;
      case 'rejected': setWorkflowMessage('Burn request rejected.'); break;
      default: setWorkflowMessage(''); setRejectReason(''); break; // Reset for idle
    }
  }, [workflowState]);

  // --- Event Handlers ---

  // Initiate the burn workflow
  const handleInitiateBurn = (event) => {
    event.preventDefault();
    const amount = parseFloat(amountToBurn);

    // Validation
    if (!selectedAsset) { alert("Please select an asset."); return; }
    if (isNaN(amount) || amount <= 0) { alert("Please enter a valid positive amount."); return; }
    if (selectedAsset.supply !== 'Finite') { alert("Cannot burn tokens with infinite supply."); return; } // Added check
    if (amount > reserveAmount) { alert("Amount to burn cannot exceed amount currently in reserve."); return; }
    if (!burnReason) { alert("Please select a burn reason."); return; }

    // Start workflow
    setWorkflowState('pending_compliance');
  };

  // Simulate workflow approval steps
  const handleApproval = (step) => { /* ... unchanged ... */
      if (isLoading) return; setIsLoading(true); setWorkflowMessage(`Processing ${step} approval...`); setTimeout(() => { if (step === 'compliance') { setWorkflowState('pending_treasury'); } else if (step === 'treasury') { setWorkflowState('approved'); } }, 1500); };
  // Simulate workflow rejection
  const handleReject = (rejectedBy) => { /* ... unchanged ... */
      if (isLoading) return; const reason = prompt(`Enter reason for rejection by ${rejectedBy} (optional):`); setIsLoading(true); setWorkflowMessage(`Processing rejection...`); setTimeout(() => { setRejectReason(reason || 'No reason provided.'); setWorkflowState('rejected'); }, 1000); };

  // Execute the burn after final approval
  const handleExecuteBurn = () => {
    if (isLoading || workflowState !== 'approved') return;

    const assetToBurn = selectedAsset;
    const amount = parseFloat(amountToBurn);

    // Final validation checks
    if (!assetToBurn || isNaN(amount) || assetToBurn.supply !== 'Finite') {
        alert("Error: Could not retrieve burn details or asset is not burnable. Please cancel and try again.");
        setWorkflowState('idle');
        return;
    }
    const currentReserve = (typeof assetToBurn.totalSupplyIssued === 'number' && typeof assetToBurn.balance === 'number')
        ? Math.max(0, assetToBurn.totalSupplyIssued - assetToBurn.balance) : 0;
    if (amount > currentReserve) {
        alert("Error: Amount exceeds available reserve. Operation cancelled.");
        setWorkflowState('idle');
        return;
    }

    // Confirmation dialog
    const confirmMsg = `You are about to permanently burn ${formatNumber(amount)} ${assetToBurn.symbol}. This cannot be undone.\n\nProceed?`;
    if (window.confirm(confirmMsg)) {
        setIsLoading(true);
        setWorkflowMessage('Executing burn...');
        try {
            // *** DISPATCH BURN_ASSET ACTION ***
            // This action should decrease both balance and totalSupplyIssued in AssetsContext
            dispatchAssets({
                type: 'BURN_ASSET',
                payload: { assetId: selectedAssetId, amount: amount } // Pass positive amount
            });

            // Dispatch action to add burn event to history (remains the same)
            const historyEntry = {
                id: Date.now() + Math.random(),
                timestamp: new Date(),
                actionType: 'Burn',
                details: `Burned ${formatNumber(amount)} ${assetToBurn.symbol} (Reason: ${burnReason || 'N/A'})`,
                user: currentUserInitials,
                approver: approverInitials,
                assetId: assetToBurn.id,
                assetSymbol: assetToBurn.symbol,
                assetName: assetToBurn.label,
                notes: burnNotes || `Burn initiated against reserve pool.`
            };
            dispatchTokenHistory({ type: 'ADD_TOKEN_HISTORY', payload: historyEntry });

            alert(`${formatNumber(amount)} ${assetToBurn.symbol} burned successfully!`);
            onBack(); // Navigate back

        } catch (error) {
            console.error("Error dispatching burn actions:", error);
            alert("An error occurred while trying to burn the tokens. Please check the console and try again.");
            setIsLoading(false);
            setWorkflowState('approved');
            setWorkflowMessage('Error during execution. Please try again.');
        }
    } else {
        console.log("Final burn execution cancelled by user.");
    }
  };

   // Cancel the workflow request
   const handleCancelRequest = () => { /* ... unchanged ... */
       if (window.confirm("Are you sure you want to cancel this burn request?")) { setWorkflowState('idle'); } };

  // --- Render Logic ---
  return (
    <div className="p-8">
        <div className="bg-white p-6 rounded shadow max-w-3xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-6 border-b pb-3">
                <h1 className="text-2xl font-bold text-gray-800">Burn Tokens</h1>
                <button className="px-3 py-1 rounded text-white hover:opacity-90 bg-gray-800 text-sm disabled:opacity-50" onClick={workflowState === 'idle' || workflowState === 'rejected' ? onBack : handleCancelRequest} disabled={isLoading && workflowState !== 'idle'} >
                    {workflowState === 'idle' || workflowState === 'rejected' ? 'Back to Dashboard' : 'Cancel Burn Request'}
                </button>
            </div>

            {/* Workflow Status Display Area */}
            {workflowState !== 'idle' && ( /* ... unchanged ... */ <div className={`mb-6 p-4 border rounded-lg ${workflowState === 'rejected' ? 'bg-red-50 border-red-300' : 'bg-blue-50 border-blue-300'}`}> <h3 className={`text-lg font-semibold mb-2 ${workflowState === 'rejected' ? 'text-red-800' : 'text-blue-800'}`}>Burn Request Status</h3> <p className={`mb-3 ${workflowState === 'rejected' ? 'text-red-700' : 'text-blue-700'}`}>{workflowMessage}</p> {isLoading && <p className="text-sm text-gray-500 italic mb-3">Processing...</p>} {workflowState === 'pending_compliance' && !isLoading && ( <div className="flex space-x-3"> <button onClick={() => handleApproval('compliance')} className="px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm">Approve (Compliance)</button> <button onClick={() => handleReject('Compliance Officer')} className="px-4 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm">Reject (Compliance)</button> </div> )} {workflowState === 'pending_treasury' && !isLoading && ( <div className="flex space-x-3"> <button onClick={() => handleApproval('treasury')} className="px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm">Approve (Treasury)</button> <button onClick={() => handleReject('Treasury Department')} className="px-4 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm">Reject (Treasury)</button> </div> )} {workflowState === 'rejected' && !isLoading && ( <p className="text-red-700 font-medium">Reason: {rejectReason}</p> )} {workflowState === 'approved' && !isLoading && ( <button onClick={handleExecuteBurn} className="px-4 py-2 bg-red-700 text-white rounded hover:bg-red-800 font-bold"> Execute Irreversible Burn Now </button> )} </div> )}

            {/* Burn Form (Show only when workflow is idle) */}
            {workflowState === 'idle' && (
                <>
                    {/* Warning Message */}
                    <div className="bg-yellow-50 border-l-4 border-yellow-600 p-4 mb-6"> <div className="flex"> <div className="flex-shrink-0"> <svg className="h-5 w-5 text-yellow-600" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg> </div> <div className="ml-3"><p className="text-sm text-yellow-700"><strong>Warning:</strong> Burning tokens is irreversible and removes them permanently from the total supply and circulation.</p></div> </div> </div>

                    {/* Form */}
                    <form onSubmit={handleInitiateBurn}>
                        <div className="space-y-4">
                            {/* Asset Selection */}
                            <div>
                                <label htmlFor="burnAssetSelect" className="block mb-1 font-medium text-gray-700">Select Token to Burn <span className="text-red-600">*</span></label>
                                <select id="burnAssetSelect" className="w-full p-2 border rounded bg-white disabled:bg-gray-100" value={selectedAssetId} onChange={(e) => setSelectedAssetId(e.target.value)} required disabled={burnableAssets.length === 0} >
                                    <option value="" disabled> {burnableAssets.length === 0 ? '-- No Burnable Assets --' : '-- Select an Asset --'} </option>
                                    {burnableAssets.map(asset => ( <option key={asset.id} value={asset.id}> {asset.label} ({asset.symbol}) </option> ))}
                                </select>
                                {burnableAssets.length === 0 && <p className="text-xs text-gray-500 mt-1">Only finite supply wizard-issued or specific predefined assets can be burned.</p>}
                            </div>

                            {/* Display Balances */}
                            {selectedAsset && ( /* ... unchanged ... */ <div className="bg-gray-100 p-3 rounded mb-2 text-sm space-y-1"> <div className="flex justify-between"> <span>Current Circulating Supply:</span> <span className="font-medium">{formatNumber(selectedAsset.balance)} {selectedAsset.symbol}</span> </div> {selectedAsset.supply === 'Finite' && typeof reserveAmount === 'number' && ( <div className="flex justify-between"> <span>Amount Currently in Reserve:</span> <span className="font-medium">{formatNumber(reserveAmount)} {selectedAsset.symbol}</span> </div> )} {selectedAsset.supply !== 'Finite' && ( <div className="flex justify-between text-gray-500"> <span>Amount Currently in Reserve:</span> <span className="font-medium">N/A (Infinite Supply)</span> </div> )} </div> )}

                            {/* Amount Input */}
                            <div>
                                <label htmlFor="burnAmount" className="block mb-1 font-medium text-gray-700">Amount to Burn (from Reserve) <span className="text-red-600">*</span></label>
                                <input id="burnAmount" type="number" className="w-full p-2 border rounded disabled:bg-gray-100" placeholder="Enter amount" value={amountToBurn} onChange={(e) => setAmountToBurn(e.target.value)} min="0.000001" step="any" required disabled={!selectedAssetId || selectedAsset?.supply !== 'Finite'} />
                                {selectedAsset && amountToBurn && parseFloat(amountToBurn) > reserveAmount && selectedAsset.supply === 'Finite' && ( <p className="text-xs text-red-600 mt-1">Amount exceeds amount currently in reserve ({formatNumber(reserveAmount)})!</p> )}
                                 {selectedAsset?.supply !== 'Finite' && selectedAssetId && ( <p className="text-xs text-gray-500 mt-1">Cannot burn from reserve for tokens with infinite supply.</p> )}
                            </div>

                            {/* Burn Reason */}
                            <div>
                                <label htmlFor="burnReason" className="block mb-1 font-medium text-gray-700">Burn Reason <span className="text-red-600">*</span></label>
                                <select id="burnReason" className="w-full p-2 border rounded bg-white disabled:bg-gray-100" value={burnReason} onChange={(e) => setBurnReason(e.target.value)} required disabled={!selectedAssetId} >
                                    <option value="" disabled>-- Select a reason --</option>
                                    <option value="Regulatory">Regulatory Requirement</option>
                                    <option value="Correction">Error Correction</option>
                                    <option value="SupplyManagement">Excess Supply Management</option>
                                    <option value="TokenExpiry">Token Expiry</option>
                                    <option value="ReserveAdjustment">Reserve Adjustment</option>
                                    <option value="Other">Other (Specify in Notes)</option>
                                </select>
                            </div>

                            {/* Notes */}
                            <div>
                                <label htmlFor="burnNotes" className="block mb-1 font-medium text-gray-700">Notes</label>
                                <textarea id="burnNotes" className="w-full p-2 border rounded disabled:bg-gray-100" rows="3" placeholder="Additional details (optional)" value={burnNotes} onChange={(e) => setBurnNotes(e.target.value)} disabled={!selectedAssetId} ></textarea>
                            </div>

                            {/* Action Buttons */}
                            <div className="mt-6 flex space-x-3">
                                <button type="submit" className="px-4 py-2 rounded text-white hover:opacity-90 bg-yellow-600 disabled:opacity-50" disabled={ !selectedAssetId || !amountToBurn || parseFloat(amountToBurn) <= 0 || !burnReason || (selectedAsset && selectedAsset.supply === 'Finite' && parseFloat(amountToBurn) > reserveAmount) || (selectedAsset && selectedAsset.supply !== 'Finite') || isLoading } >
                                    Request Burn Approval
                                </button>
                                <button type="button" className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-50" onClick={onBack} >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </form>
                </>
            )}
        </div>
    </div>
  );
};

export default BurnTokenScreen;
