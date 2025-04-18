import React, { useState, useEffect, useMemo } from 'react'; // <-- Added useMemo, useEffect
import { useAssets } from '../../context/AssetsContext';
import { useTokenHistory } from '../../context/TokenHistoryContext';
// Import helpers
import { formatNumber } from '../../utils/displayUtils'; // <-- Import formatNumber

// Placeholder for current user - replace with actual user context later
const currentUserInitials = 'BK'; // Example Burner initials
const approverInitials = 'TA'; // Example Treasury Approver initials

// *** UPDATED: Define the IDs of predefined assets allowed to be burned ***
// (Should match the predefined assets managed under Token Management)
const allowedPredefinedTokenIds = [
    'cp-acme-01',
    'mmf-usd-01',
    'xagc-01',
    'oil-wti-01',
    'cc-verra-01',
];

/**
 * Component providing a form to burn units of an existing token type.
 * Includes a simulated multi-step approval workflow before dispatching state updates.
 * Reads asset data and dispatches actions using context hooks.
 * Filters the dropdown to show only burnable token types.
 *
 * @param {object} props - Component props.
 * @param {function} props.onBack - Callback function to navigate back to the previous view.
 */
const BurnTokenScreen = ({ onBack }) => {

  // Get state and dispatch functions from context
  const { assets, dispatchAssets } = useAssets();
  const { dispatchTokenHistory } = useTokenHistory();

  // State for form inputs and workflow management (local UI state)
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [amountToBurn, setAmountToBurn] = useState('');
  const [burnReason, setBurnReason] = useState('');
  const [burnNotes, setBurnNotes] = useState('');
  const [workflowState, setWorkflowState] = useState('idle');
  const [workflowMessage, setWorkflowMessage] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // --- Filter assets from context to get only burnable ones ---
  const burnableAssets = useMemo(() => {
    if (!Array.isArray(assets)) return [];
    // Filter based on wizard status OR the updated allowed predefined IDs
    return assets.filter(asset =>
        asset.isWizardIssued === true || allowedPredefinedTokenIds.includes(asset.id)
    );
  }, [assets]); // Re-filter only when assets from context change

  // Find the full asset object for the selected ID using the *full* assets list from context.
  const selectedAsset = useMemo(() => {
      if (!selectedAssetId || !Array.isArray(assets)) return null;
      return assets.find(asset => asset.id === selectedAssetId);
  }, [selectedAssetId, assets]);

  // Effect to reset selection if the selected item is no longer in the burnable list
  useEffect(() => {
    if (selectedAssetId && !burnableAssets.some(a => a.id === selectedAssetId)) {
        console.log("Resetting selectedAssetId in Burn screen because it's no longer burnable.");
        setSelectedAssetId('');
        setAmountToBurn(''); // Also clear amount if selection resets
        setBurnReason('');
        setBurnNotes('');
    }
  }, [burnableAssets, selectedAssetId]);

  // Update the status message displayed based on the current workflow state.
  useEffect(() => {
    setIsLoading(false); // Reset loading indicator on state change
    switch (workflowState) {
      case 'pending_compliance': setWorkflowMessage('Burn request sent to Compliance Officer for review.'); break;
      case 'pending_treasury': setWorkflowMessage('Compliance approved. Request sent to Treasury Department for final review.'); break;
      case 'approved': setWorkflowMessage('Burn request fully approved. Ready to execute.'); break;
      case 'rejected': setWorkflowMessage('Burn request rejected.'); break;
      default: setWorkflowMessage(''); setRejectReason(''); break;
    }
  }, [workflowState]);


  // --- Event Handlers ---

  // Validates form input and initiates the simulated approval workflow.
  const handleInitiateBurn = (event) => {
    event.preventDefault();
    const amount = parseFloat(amountToBurn);
    if (!selectedAsset) { alert("Please select an asset."); return; }
    if (isNaN(amount) || amount <= 0) { alert("Please enter a valid positive amount."); return; }
    if (amount > selectedAsset.balance) { alert("Amount to burn cannot exceed current balance."); return; }
    if (!burnReason) { alert("Please select a burn reason."); return; }
    setWorkflowState('pending_compliance'); // Start workflow
  };

  // Simulates an approval step (Compliance or Treasury).
  const handleApproval = (step) => {
     if (isLoading) return; setIsLoading(true); setWorkflowMessage(`Processing ${step} approval...`);
     setTimeout(() => {
        if (step === 'compliance') { setWorkflowState('pending_treasury'); }
        else if (step === 'treasury') { setWorkflowState('approved'); }
     }, 1500);
  };

  // Simulates a rejection step, prompting for a reason.
  const handleReject = (rejectedBy) => {
    if (isLoading) return; const reason = prompt(`Enter reason for rejection by ${rejectedBy} (optional):`); setIsLoading(true); setWorkflowMessage(`Processing rejection...`);
     setTimeout(() => { setRejectReason(reason || 'No reason provided.'); setWorkflowState('rejected'); }, 1000);
  };

  // Handles the final execution of the burn after workflow approval and user confirmation.
  const handleExecuteBurn = () => {
    if (isLoading || workflowState !== 'approved') return;
    const assetToBurn = selectedAsset;
    const amount = parseFloat(amountToBurn);
    if (!assetToBurn || isNaN(amount)) { alert("Error: Could not retrieve burn details. Please cancel and try again."); setWorkflowState('idle'); return; }
    if (amount > assetToBurn.balance) { alert("Error: Insufficient balance. Operation cancelled."); setWorkflowState('idle'); return; }

    const confirmMsg = `You are about to permanently burn ${formatNumber(amount)} ${assetToBurn.symbol}. This cannot be undone.\n\nProceed?`;

    if (window.confirm(confirmMsg)) {
        setIsLoading(true); setWorkflowMessage('Executing burn...');
        try {
            // Dispatch balance update
            dispatchAssets({ type: 'UPDATE_ASSET_BALANCE', payload: { assetId: selectedAssetId, changeAmount: -amount } });
            // Dispatch history log
            const historyEntry = { id: Date.now() + Math.random(), timestamp: new Date(), actionType: 'Burn', details: `Burned ${formatNumber(amount)} ${assetToBurn.symbol} (Reason: ${burnReason || 'N/A'})`, user: currentUserInitials, approver: approverInitials, notes: burnNotes || '' };
            dispatchTokenHistory({ type: 'ADD_TOKEN_HISTORY', payload: historyEntry });

            alert(`${formatNumber(amount)} ${assetToBurn.symbol} burned successfully!`);
            onBack(); // Navigate back after successful dispatch
        } catch (error) {
            console.error("Error dispatching burn actions:", error);
            alert("An error occurred while trying to burn the tokens. Please check the console and try again.");
            setIsLoading(false);
            setWorkflowState('approved'); // Allow retry?
            setWorkflowMessage('Error during execution. Please try again.');
        }
    } else { console.log("Final burn execution cancelled by user."); }
  };

   /** Handles cancelling the active workflow request */
   const handleCancelRequest = () => {
      if (window.confirm("Are you sure you want to cancel this burn request?")) {
          setWorkflowState('idle'); // Reset workflow, keeps form data
      }
  };


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

        {/* Workflow Status Area */}
        {workflowState !== 'idle' && (
           <div className={`mb-6 p-4 border rounded-lg ${workflowState === 'rejected' ? 'bg-red-50 border-red-300' : 'bg-blue-50 border-blue-300'}`}>
                <h3 className={`text-lg font-semibold mb-2 ${workflowState === 'rejected' ? 'text-red-800' : 'text-blue-800'}`}>Burn Request Status</h3>
                <p className={`mb-3 ${workflowState === 'rejected' ? 'text-red-700' : 'text-blue-700'}`}>{workflowMessage}</p>
                {isLoading && <p className="text-sm text-gray-500 italic mb-3">Processing...</p>}
                {/* Action Buttons */}
                {workflowState === 'pending_compliance' && !isLoading && ( <div className="flex space-x-3"> <button onClick={() => handleApproval('compliance')} className="px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm">Approve (Compliance)</button> <button onClick={() => handleReject('Compliance Officer')} className="px-4 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm">Reject (Compliance)</button> </div> )}
                {workflowState === 'pending_treasury' && !isLoading && ( <div className="flex space-x-3"> <button onClick={() => handleApproval('treasury')} className="px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm">Approve (Treasury)</button> <button onClick={() => handleReject('Treasury Department')} className="px-4 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm">Reject (Treasury)</button> </div> )}
                {workflowState === 'rejected' && !isLoading && ( <p className="text-red-700 font-medium">Reason: {rejectReason}</p> )}
                {workflowState === 'approved' && !isLoading && ( <button onClick={handleExecuteBurn} className="px-4 py-2 bg-red-700 text-white rounded hover:bg-red-800 font-bold"> Execute Irreversible Burn Now </button> )}
            </div>
        )}

        {/* Main Burn Form - Render only when workflow is idle */}
        {workflowState === 'idle' && (
          <>
            {/* Warning Banner */}
            <div className="bg-yellow-50 border-l-4 border-yellow-600 p-4 mb-6">
               <div className="flex"> <div className="flex-shrink-0"> <svg className="h-5 w-5 text-yellow-600" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg> </div> <div className="ml-3"><p className="text-sm text-yellow-700"><strong>Warning:</strong> Burning tokens is irreversible and removes them permanently from circulation.</p></div> </div>
            </div>

            {/* Form */}
            <form onSubmit={handleInitiateBurn}>
              <div className="space-y-4">
                {/* Token Selection - Uses updated filter */}
                <div>
                  <label htmlFor="burnAssetSelect" className="block mb-1 font-medium text-gray-700">Select Token to Burn <span className="text-red-600">*</span></label>
                  <select id="burnAssetSelect" className="w-full p-2 border rounded bg-white disabled:bg-gray-100" value={selectedAssetId} onChange={(e) => setSelectedAssetId(e.target.value)} required disabled={burnableAssets.length === 0} >
                    <option value="" disabled> {burnableAssets.length === 0 ? '-- No Burnable Assets --' : '-- Select an Asset --'} </option>
                    {/* Map over the correctly filtered burnableAssets list */}
                    {burnableAssets.map(asset => ( <option key={asset.id} value={asset.id}> {asset.label} ({asset.symbol}) </option> ))}
                  </select>
                  {burnableAssets.length === 0 && <p className="text-xs text-gray-500 mt-1">Only wizard-issued or specific predefined assets can be burned.</p>}
                </div>

                {/* Current Balance Display */}
                {selectedAsset && ( <div className="bg-gray-100 p-3 rounded mb-2 text-sm"> <div className="flex justify-between"><span>Current Balance:</span><span className="font-medium">{formatNumber(selectedAsset.balance)} {selectedAsset.symbol}</span></div> </div> )}

                {/* Amount Input */}
                <div>
                  <label htmlFor="burnAmount" className="block mb-1 font-medium text-gray-700">Amount to Burn <span className="text-red-600">*</span></label>
                  <input id="burnAmount" type="number" className="w-full p-2 border rounded disabled:bg-gray-100" placeholder="Enter amount" value={amountToBurn} onChange={(e) => setAmountToBurn(e.target.value)} min="0.000001" step="any" required disabled={!selectedAssetId} />
                   {selectedAsset && amountToBurn && parseFloat(amountToBurn) > selectedAsset.balance && ( <p className="text-xs text-red-600 mt-1">Amount exceeds current balance!</p> )}
                </div>

                {/* Reason Selection */}
                <div>
                  <label htmlFor="burnReason" className="block mb-1 font-medium text-gray-700">Burn Reason <span className="text-red-600">*</span></label>
                  <select id="burnReason" className="w-full p-2 border rounded bg-white disabled:bg-gray-100" value={burnReason} onChange={(e) => setBurnReason(e.target.value)} required disabled={!selectedAssetId} >
                    <option value="" disabled>-- Select a reason --</option>
                    <option value="Regulatory">Regulatory Requirement</option>
                    <option value="Correction">Error Correction</option>
                    <option value="SupplyManagement">Excess Supply Management</option>
                    <option value="TokenExpiry">Token Expiry</option>
                    <option value="Other">Other (Specify in Notes)</option>
                  </select>
                </div>

                {/* Notes Input */}
                <div>
                  <label htmlFor="burnNotes" className="block mb-1 font-medium text-gray-700">Notes</label>
                  <textarea id="burnNotes" className="w-full p-2 border rounded disabled:bg-gray-100" rows="3" placeholder="Additional details (optional)" value={burnNotes} onChange={(e) => setBurnNotes(e.target.value)} disabled={!selectedAssetId} ></textarea>
                </div>

                {/* Submit/Cancel Buttons */}
                <div className="mt-6 flex space-x-3">
                  <button type="submit" className="px-4 py-2 rounded text-white hover:opacity-90 bg-yellow-600 disabled:opacity-50" disabled={ !selectedAssetId || !amountToBurn || parseFloat(amountToBurn) <= 0 || !burnReason || (selectedAsset && parseFloat(amountToBurn) > selectedAsset.balance) || isLoading } >
                      Request Burn Approval
                   </button>
                  <button type="button" className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-50" onClick={onBack} > Cancel </button>
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
