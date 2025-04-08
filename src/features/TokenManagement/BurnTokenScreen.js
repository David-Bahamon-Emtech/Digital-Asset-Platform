import React, { useState, useEffect } from 'react';

/**
 * Component providing a form to mint additional units of an existing token type.
 * Includes a simulated single-step approval workflow (Treasury) before final execution.
 *
 * @param {object} props - Component props.
 * @param {Array} props.assets - The list of existing assets available for minting.
 * @param {function} props.onBurn - Callback function executed after workflow approval and user confirmation. Passes an object { assetId, amount, reason, notes } to the parent component.
 * @param {function} props.onBack - Callback function to navigate back to the previous view.
 */
const BurnTokenScreen = ({ assets = [], onBurn, onBack }) => {

  // State for form inputs and workflow management
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [amountToBurn, setAmountToBurn] = useState('');
  const [burnReason, setBurnReason] = useState('');
  const [burnNotes, setBurnNotes] = useState(''); // State for notes textarea
  const [workflowState, setWorkflowState] = useState('idle');
  const [workflowMessage, setWorkflowMessage] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Find the full asset object for the selected ID.
  // Use selectedAssetId when idle, rely on data passed during workflow otherwise.
  const selectedAsset = assets.find(asset => asset.id === selectedAssetId);

  // Update the status message displayed based on the current workflow state.
  useEffect(() => {
    setIsLoading(false); // Reset loading indicator on state change

    switch (workflowState) {
      case 'pending_compliance':
        setWorkflowMessage('Burn request sent to Compliance Officer for review.');
        break;
      case 'pending_treasury':
        setWorkflowMessage('Compliance approved. Request sent to Treasury Department for final review.');
        break;
      case 'approved':
        setWorkflowMessage('Burn request fully approved. Ready to execute.');
        break;
      case 'rejected':
        setWorkflowMessage('Burn request rejected.');
        break;
      default: // 'idle' or other states
        setWorkflowMessage('');
        setRejectReason('');
        break;
    }
  }, [workflowState]);


  // --- Event Handlers ---

  // Validates form input and initiates the simulated approval workflow.
  const handleInitiateBurn = (event) => {
    event.preventDefault();
    const amount = parseFloat(amountToBurn);

    // Find asset based on current selection for validation
    const assetForValidation = assets.find(asset => asset.id === selectedAssetId);

    if (!assetForValidation) { alert("Please select an asset."); return; } // Use validated asset object
    if (isNaN(amount) || amount <= 0) { alert("Please enter a valid positive amount."); return; }
    if (amount > assetForValidation.balance) { alert("Amount to burn cannot exceed current balance."); return; }
    if (!burnReason) { alert("Please select a burn reason."); return; }

    setWorkflowState('pending_compliance');
  };

  // Simulates an approval step (Compliance or Treasury).
  // *** CORRECTED BRACES ***
  const handleApproval = (step) => {
     if (isLoading) return; // Correct placement of return

     setIsLoading(true);
     setWorkflowMessage(`Processing ${step} approval...`);

     setTimeout(() => {
        if (step === 'compliance') {
          setWorkflowState('pending_treasury');
        } else if (step === 'treasury') {
          setWorkflowState('approved');
        }
     }, 1500); // Simulate 1.5 second delay
  }; // Correct closing brace for handleApproval

  // Simulates a rejection step, prompting for a reason.
  const handleReject = (rejectedBy) => {
    if (isLoading) return;
    const reason = prompt(`Enter reason for rejection by ${rejectedBy} (optional):`);
    setIsLoading(true);
    setWorkflowMessage(`Processing rejection...`);

     setTimeout(() => {
        setRejectReason(reason || 'No reason provided.');
        setWorkflowState('rejected');
     }, 1000); // Simulate 1 second delay
  }; // Correct closing brace for handleReject

  // Handles the final execution of the burn after workflow approval and user confirmation.
  // *** CORRECTED STRUCTURE - NO NESTED FUNCTION ***
  const handleExecuteBurn = () => {
    // Check workflow state and loading status
    if (isLoading || workflowState !== 'approved') return;

    // Re-find selected asset based on ID stored when initiating
    // (selectedAssetId should still hold the correct ID from the form)
    const assetToBurn = assets.find(asset => asset.id === selectedAssetId);
    const amount = parseFloat(amountToBurn); // Get amount from state

    if (!assetToBurn || isNaN(amount)) {
        alert("Error: Could not retrieve burn details. Please cancel and try again.");
        setWorkflowState('idle'); // Reset state on error
        return;
    }

    const confirmMsg = `You are about to permanently burn ${amount.toLocaleString()} ${assetToBurn.symbol}. This cannot be undone.\n\nProceed?`;

    if (window.confirm(confirmMsg)) {
        const dataToSend = { // Create object with current state data
            assetId: selectedAssetId,
            amount: amount,
            reason: burnReason,
            notes: burnNotes // Include notes from state
        };
        console.log('BurnScreen: Data being sent via onBurn:', dataToSend); // Log the data
        onBurn(dataToSend); // Call the onBurn callback ONCE with the data object
        // Parent component (TokenDashboard) will handle navigation on success
    } else {
        console.log("Final burn execution cancelled by user.");
        // Optionally reset workflow if user cancels final confirm?
        // setWorkflowState('idle');
    }
  }; // Correct closing brace for handleExecuteBurn

   /** Handles cancelling the active workflow request */
   const handleCancelRequest = () => {
      if (window.confirm("Are you sure you want to cancel this burn request?")) {
          setWorkflowState('idle'); // Reset workflow, keeps form data
      }
  }; // Correct closing brace for handleCancelRequest


  // --- Render Logic --- *** THIS MUST BE AFTER ALL HANDLERS ***
  return (
    <div className="p-8">
      <div className="bg-white p-6 rounded shadow max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 border-b pb-3">
          <h1 className="text-2xl font-bold text-gray-800">Burn Tokens</h1>
          <button
            className="px-3 py-1 rounded text-white hover:opacity-90 bg-gray-800 text-sm disabled:opacity-50"
            // *** CORRECTED onClick LOGIC ***
            onClick={workflowState === 'idle' || workflowState === 'rejected' ? onBack : handleCancelRequest}
            disabled={isLoading} // Simpler disabled check
          >
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
            {workflowState === 'pending_compliance' && !isLoading && (
              <div className="flex space-x-3">
                <button onClick={() => handleApproval('compliance')} className="px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm">Approve (Compliance)</button>
                <button onClick={() => handleReject('Compliance Officer')} className="px-4 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm">Reject (Compliance)</button>
              </div>
            )}
            {workflowState === 'pending_treasury' && !isLoading && (
              <div className="flex space-x-3">
                <button onClick={() => handleApproval('treasury')} className="px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm">Approve (Treasury)</button>
                <button onClick={() => handleReject('Treasury Department')} className="px-4 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm">Reject (Treasury)</button>
              </div>
            )}
             {workflowState === 'rejected' && !isLoading && ( <p className="text-red-700 font-medium">Reason: {rejectReason}</p> )}
             {workflowState === 'approved' && !isLoading && (
                <button onClick={handleExecuteBurn} className="px-4 py-2 bg-red-700 text-white rounded hover:bg-red-800 font-bold"> Execute Irreversible Burn Now </button>
             )}
          </div>
        )}

        {/* Main Burn Form */}
        {workflowState === 'idle' && (
          <>
            {/* Warning Banner */}
            <div className="bg-yellow-50 border-l-4 border-yellow-600 p-4 mb-6">
              {/* ... banner content ... */}
               <div className="flex">
                <div className="flex-shrink-0"> <svg className="h-5 w-5 text-yellow-600" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg> </div>
                <div className="ml-3"><p className="text-sm text-yellow-700"><strong>Warning:</strong> Burning tokens is irreversible.</p></div>
               </div>
            </div>

            {/* Form */}
            <form onSubmit={handleInitiateBurn}>
              <div className="space-y-4">
                {/* Token Selection */}
                <div>
                  <label htmlFor="burnAssetSelect" className="block mb-1 font-medium text-gray-700">Select Token to Burn <span className="text-red-600">*</span></label>
                  <select id="burnAssetSelect" className="w-full p-2 border rounded bg-white" value={selectedAssetId} onChange={(e) => setSelectedAssetId(e.target.value)} required >
                    <option value="" disabled>-- Select an Asset --</option>
                    {/* Filter out assets with 0 balance? Optional */}
                    {assets.map(asset => ( <option key={asset.id} value={asset.id}>{asset.label} ({asset.symbol})</option> ))}
                  </select>
                </div>

                {/* Current Balance Display */}
                {selectedAsset && (
                  <div className="bg-gray-100 p-3 rounded mb-2 text-sm">
                    <div className="flex justify-between"><span>Current Balance:</span><span className="font-medium">{selectedAsset.balance.toLocaleString()} {selectedAsset.symbol}</span></div>
                  </div>
                )}

                {/* Amount Input */}
                <div>
                  <label htmlFor="burnAmount" className="block mb-1 font-medium text-gray-700">Amount to Burn <span className="text-red-600">*</span></label>
                  <input id="burnAmount" type="number" className="w-full p-2 border rounded" placeholder="Enter amount" value={amountToBurn} onChange={(e) => setAmountToBurn(e.target.value)} min="0.000001" step="any" required />
                   {selectedAsset && amountToBurn && parseFloat(amountToBurn) > selectedAsset.balance && ( <p className="text-xs text-red-600 mt-1">Amount exceeds current balance!</p> )}
                </div>

                {/* Reason Selection */}
                <div>
                  <label htmlFor="burnReason" className="block mb-1 font-medium text-gray-700">Burn Reason <span className="text-red-600">*</span></label>
                  <select id="burnReason" className="w-full p-2 border rounded bg-white" value={burnReason} onChange={(e) => setBurnReason(e.target.value)} required >
                    <option value="" disabled>-- Select a reason --</option>
                    <option value="Regulatory">Regulatory Requirement</option>
                    <option value="Correction">Error Correction</option>
                    <option value="SupplyManagement">Excess Supply Management</option>
                    <option value="Other">Other (Specify in Notes)</option>
                  </select>
                </div>

                {/* Notes Input */}
                <div>
                  <label htmlFor="burnNotes" className="block mb-1 font-medium text-gray-700">Notes</label>
                  <textarea id="burnNotes" className="w-full p-2 border rounded" rows="3" placeholder="Additional details (optional)" value={burnNotes} onChange={(e) => setBurnNotes(e.target.value)} ></textarea>
                </div>

                {/* Submit/Cancel Buttons */}
                <div className="mt-6 flex space-x-3">
                  <button type="submit" className="px-4 py-2 rounded text-white hover:opacity-90 bg-yellow-600 disabled:opacity-50" disabled={!selectedAssetId || !amountToBurn || parseFloat(amountToBurn) <= 0 || !burnReason || (selectedAsset && parseFloat(amountToBurn) > selectedAsset.balance) } > Request Burn Approval </button>
                  <button type="button" className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-50" onClick={onBack} > Cancel </button>
                </div>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  ); // <<< End of return statement

}; // <<< *** THIS IS THE CORRECT FINAL BRACE FOR THE COMPONENT ***

export default BurnTokenScreen; // This should be the very last line