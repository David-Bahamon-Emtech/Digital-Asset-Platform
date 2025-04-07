import React, { useState, useEffect } from 'react';

/**
 * Component providing a form to mint additional units of an existing token type.
 * Includes a simulated single-step approval workflow (Treasury) before final execution.
 *
 * @param {object} props - Component props.
 * @param {Array} props.assets - The list of existing assets available for minting.
 * @param {function} props.onMint - Callback function executed after workflow approval and user confirmation. Passes an object { assetId, amount, reason } to the parent component.
 * @param {function} props.onBack - Callback function to navigate back to the previous view.
 */
const MintExistingToken = ({ assets = [], onMint, onBack }) => {
  // State for managing form inputs
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [amountToMint, setAmountToMint] = useState('');
  const [mintReason, setMintReason] = useState('');

  // --- State for Approval Workflow ---
  const [workflowState, setWorkflowState] = useState('idle'); // 'idle', 'pending_treasury', 'approved', 'rejected'
  const [workflowMessage, setWorkflowMessage] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mintRequestData, setMintRequestData] = useState(null); // To store {assetId, amount, reason}

  // Find the full asset object for the selected ID (needed for display/confirmation)
  // Note: This relies on selectedAssetId OR mintRequestData.assetId being set
  const assetIdForLookup = workflowState === 'idle' ? selectedAssetId : mintRequestData?.assetId;
  const selectedAsset = assets.find(asset => asset.id === assetIdForLookup);

  // --- Workflow Effect Hook ---
  useEffect(() => {
    setIsLoading(false); // Reset loading indicator on state change

    switch (workflowState) {
      case 'pending_treasury':
        setWorkflowMessage('Mint request sent to Treasury for review.');
        break;
      case 'approved':
        setWorkflowMessage('Mint request approved. Ready to execute.');
        break;
      case 'rejected':
        setWorkflowMessage('Mint request rejected.');
        break;
      default: // 'idle' or other states
        setWorkflowMessage('');
        setRejectReason('');
        setMintRequestData(null); // Clear stored data on reset
        break;
    }
  }, [workflowState]);


  // --- Workflow Action Handlers ---

  /**
   * Validates form input and initiates the simulated approval workflow.
   */
  const handleInitiateMintApproval = (event) => {
    event.preventDefault(); // Prevent default page refresh

    // Validate inputs
    const amount = parseFloat(amountToMint);
    if (!selectedAssetId) {
      alert("Please select an asset to mint.");
      return;
    }
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid positive amount to mint.");
      return;
    }
    // Find asset based on current selection for validation
    const assetForValidation = assets.find(asset => asset.id === selectedAssetId);
     if (!assetForValidation) {
       alert("Error: Selected asset details not found."); // Should ideally not happen
       return;
     }
     // You might add validation against supply limits if applicable (e.g., finite supply tokens)


    // Store data and start workflow
    const requestData = {
        assetId: selectedAssetId,
        amount: amount,
        reason: mintReason
    };
    console.log("Initiating mint approval with data:", requestData);
    setMintRequestData(requestData);
    setWorkflowState('pending_treasury');
  };

  /** Simulates the Treasury approval step. */
  const handleApproval = () => {
     if (isLoading) return;
     setIsLoading(true);
     setWorkflowMessage(`Processing Treasury approval... (Simulating delay)`);

     setTimeout(() => {
        setWorkflowState('approved');
     }, 1500); // Simulate 1.5 second delay
  };

  /** Simulates a rejection step, prompting for a reason. */
  const handleReject = () => {
    if (isLoading) return;
    const reason = prompt(`Enter reason for rejection by Treasury (optional):`);
    setIsLoading(true);
    setWorkflowMessage(`Processing rejection... (Simulating delay)`);

     setTimeout(() => {
        setRejectReason(reason || 'No reason provided.');
        setWorkflowState('rejected');
     }, 1000); // Simulate 1 second delay
  };

  /** Handles the final execution of the mint after workflow approval and user confirmation. */
  const handleExecuteMint = () => {
    if (isLoading || workflowState !== 'approved' || !mintRequestData || !selectedAsset) return;

    // Construct confirmation message using stored data and looked-up asset details
    const confirmationMessage = `
    Please confirm minting:
    -------------------------
    Asset: ${selectedAsset.label} (${selectedAsset.symbol})
    Amount: ${mintRequestData.amount.toLocaleString()}
    Reason: ${mintRequestData.reason || 'N/A'}
    -------------------------
    Current Balance: ${selectedAsset.balance.toLocaleString()}
    New Balance: ${(selectedAsset.balance + mintRequestData.amount).toLocaleString()}
    `;

    if (window.confirm(confirmationMessage)) {
        console.log("Executing onMint with final data:", mintRequestData);
        onMint(mintRequestData); // Call parent handler if confirmed
        // Optionally reset state here, or rely on parent navigation/state update
        // setWorkflowState('idle');
    } else {
        console.log("Final mint execution cancelled by user.");
    }
  };

   /** Handles cancelling the active workflow request */
   const handleCancelRequest = () => {
      if (window.confirm("Are you sure you want to cancel this mint request?")) {
          setWorkflowState('idle'); // Reset workflow, keeps form data
      }
  }

  // Render the UI
  return (
    <div className="p-8">
      <div className="bg-white p-6 rounded shadow max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 border-b pb-3">
          <h1 className="text-2xl font-bold text-gray-800">Mint Existing Token</h1>
          <button
            className="px-3 py-1 rounded text-white hover:opacity-90 bg-gray-800 text-sm disabled:opacity-50"
            onClick={workflowState === 'idle' ? onBack : handleCancelRequest}
            disabled={isLoading && workflowState !== 'idle'}
           >
            {workflowState === 'idle' ? '← Back' : 'Cancel Mint Request'}
          </button>
        </div>

        {/* Workflow Status Area (Displayed when workflow is active) */}
        {workflowState !== 'idle' && (
          <div className={`mb-6 p-4 border rounded-lg ${workflowState === 'rejected' ? 'bg-red-50 border-red-300' : 'bg-blue-50 border-blue-300'}`}>
            <h3 className={`text-lg font-semibold mb-2 ${workflowState === 'rejected' ? 'text-red-800' : 'text-blue-800'}`}>Mint Request Status</h3>
            <p className={`mb-3 ${workflowState === 'rejected' ? 'text-red-700' : 'text-blue-700'}`}>{workflowMessage}</p>

            {isLoading && <p className="text-sm text-gray-500 italic mb-3">Processing...</p>}

            {/* Simulated Action Buttons for Workflow Steps */}
            {workflowState === 'pending_treasury' && !isLoading && (
              <div className="flex space-x-3">
                <button onClick={handleApproval} className="px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm">Approve (Treasury)</button>
                <button onClick={handleReject} className="px-4 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm">Reject (Treasury)</button>
              </div>
            )}
             {workflowState === 'rejected' && ( <p className="text-red-700 font-medium">Reason: {rejectReason}</p> )}
             {workflowState === 'approved' && !isLoading && (
                <button onClick={handleExecuteMint} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-bold"> Confirm & Mint Tokens </button>
             )}
          </div>
        )}


        {/* Main Mint Form (Displayed only when workflow is idle) */}
        {workflowState === 'idle' && (
          <form onSubmit={handleInitiateMintApproval}>
            <div className="space-y-4">

              {/* Asset Selection */}
              <div>
                <label htmlFor="assetSelect" className="block mb-1 font-medium text-gray-700">Select Token to Mint <span className="text-red-600">*</span></label>
                <select
                  id="assetSelect"
                  className="w-full p-2 border rounded bg-white"
                  value={selectedAssetId}
                  onChange={(e) => setSelectedAssetId(e.target.value)}
                  required
                >
                  <option value="" disabled>-- Select an Asset --</option>
                  {assets.map(asset => (
                    <option key={asset.id} value={asset.id}>
                      {asset.label} ({asset.symbol}) - Bal: {asset.balance.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount Input */}
              <div>
                <label htmlFor="mintAmount" className="block mb-1 font-medium text-gray-700">Amount to Mint <span className="text-red-600">*</span></label>
                <input
                  id="mintAmount"
                  type="number"
                  className="w-full p-2 border rounded"
                  placeholder="e.g., 10000"
                  value={amountToMint}
                  onChange={(e) => setAmountToMint(e.target.value)}
                  min="1" // Ensure positive amount, adjust step/min if decimals matter
                  step="any" // Allow decimals if token supports them
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Enter the number of new tokens to create.</p>
              </div>

              {/* Reason Input */}
              <div>
                <label htmlFor="mintReason" className="block mb-1 font-medium text-gray-700">Reason / Reference (Optional)</label>
                <input
                  id="mintReason"
                  type="text"
                  className="w-full p-2 border rounded"
                  placeholder="e.g., Fulfilling order #123"
                  value={mintReason}
                  onChange={(e) => setMintReason(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">Enter a reason for this minting operation for audit purposes.</p>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full px-5 py-2 rounded text-white hover:opacity-90 bg-emtech-gold disabled:opacity-50"
                  // Update disabled logic for the initial request button
                  disabled={!selectedAssetId || !amountToMint || parseFloat(amountToMint) <= 0}
                >
                  Request Mint Approval
                </button>
              </div>

            </div>
          </form>
         )}
      </div>
    </div>
  );
};

export default MintExistingToken;