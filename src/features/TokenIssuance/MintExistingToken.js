import React, { useState, useEffect, useMemo } from 'react'; // Added useMemo
import { useAssets } from '../../context/AssetsContext'; // Import Assets context hook
import { useTokenHistory } from '../../context/TokenHistoryContext'; // Import Token History context hook

// Placeholder for current user - replace with actual user context later
const currentUserInitials = 'MT'; // Example Minter initials
const approverInitials = 'TA'; // Example Treasury Approver initials

// *** Define the specific predefined assets allowed to be minted from this screen ***
const allowedMintablePredefinedIds = [
    'cp-acme-01',
    'mmf-usd-01',
    'xagc-01',
    'oil-wti-01',
    'cc-verra-01',
];

/**
 * Component providing a form to mint additional units of an existing token type.
 * Includes a simulated single-step approval workflow (Treasury) before dispatching state updates.
 * Reads asset data and dispatches actions using context hooks.
 * Filters the dropdown to show only mintable token types.
 *
 * @param {object} props - Component props.
 * @param {function} props.onBack - Callback function to navigate back to the previous view.
 */
const MintExistingToken = ({ onBack }) => {

  // Get state and dispatch functions from context
  const { assets, dispatchAssets } = useAssets();
  const { dispatchTokenHistory } = useTokenHistory();

  // State for managing form inputs (local UI state)
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [amountToMint, setAmountToMint] = useState('');
  const [mintReason, setMintReason] = useState('');

  // --- State for Approval Workflow (local UI state) ---
  const [workflowState, setWorkflowState] = useState('idle'); // 'idle', 'pending_treasury', 'approved', 'rejected'
  const [workflowMessage, setWorkflowMessage] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mintRequestData, setMintRequestData] = useState(null); // To store {assetId, amount, reason}

  // --- Filter assets from context for the dropdown ---
  const mintableAssets = useMemo(() => {
    if (!Array.isArray(assets)) return [];
    return assets.filter(asset =>
        // Allow assets created by the wizard OR specific predefined ones
        asset.isWizardIssued === true || allowedMintablePredefinedIds.includes(asset.id)
    );
  }, [assets]); // Re-filter only when the main assets list changes

  // Find the full asset object for the selected ID using the *full* assets list from context.
  // Needed for display/confirmation during workflow.
  const assetIdForLookup = workflowState === 'idle' ? selectedAssetId : mintRequestData?.assetId;
  // Find from the main assets list, not the filtered one
  const selectedAsset = assets.find(asset => asset.id === assetIdForLookup);

  // --- Effect to reset selection if the selected item is no longer in the mintable list ---
  useEffect(() => {
    if (selectedAssetId && !mintableAssets.some(a => a.id === selectedAssetId)) {
        console.log("Resetting selectedAssetId in Mint screen because it's no longer mintable.");
        setSelectedAssetId('');
        setAmountToMint(''); // Also clear amount if selection resets
        setMintReason('');
    }
  }, [mintableAssets, selectedAssetId]);


  // --- Workflow Effect Hook ---
  useEffect(() => {
    setIsLoading(false); // Reset loading indicator on state change
    switch (workflowState) {
      case 'pending_treasury': setWorkflowMessage('Mint request sent to Treasury for review.'); break;
      case 'approved': setWorkflowMessage('Mint request approved. Ready to execute.'); break;
      case 'rejected': setWorkflowMessage('Mint request rejected.'); break;
      default: setWorkflowMessage(''); setRejectReason(''); setMintRequestData(null); break;
    }
  }, [workflowState]);


  // --- Workflow Action Handlers ---

  /**
   * Validates form input and initiates the simulated approval workflow.
   */
  const handleInitiateMintApproval = (event) => {
    event.preventDefault();
    const amount = parseFloat(amountToMint);
    if (!selectedAssetId) { alert("Please select an asset to mint."); return; }
    if (isNaN(amount) || amount <= 0) { alert("Please enter a valid positive amount to mint."); return; }
    // Find the asset object again for validation (using full assets list)
    const assetForValidation = assets.find(asset => asset.id === selectedAssetId);
     if (!assetForValidation) { alert("Error: Selected asset details not found."); return; }
     // TODO: Add specific supply limit validation if needed, e.g., check against asset.totalSupplyIssued if it exists and supply is 'Finite'
     // if (assetForValidation.supply === 'Finite' && assetForValidation.totalSupplyIssued && (assetForValidation.balance + amount > assetForValidation.totalSupplyIssued)) {
     //    alert("Minting this amount would exceed the total defined supply.");
     //    return;
     // }

    // Store data and start workflow
    const requestData = { assetId: selectedAssetId, amount: amount, reason: mintReason };
    console.log("Initiating mint approval with data:", requestData);
    setMintRequestData(requestData);
    setWorkflowState('pending_treasury');
  };

  /** Simulates the Treasury approval step. */
  const handleApproval = () => {
     if (isLoading) return; setIsLoading(true); setWorkflowMessage(`Processing Treasury approval...`);
     setTimeout(() => { setWorkflowState('approved'); }, 1500);
  };

  /** Simulates a rejection step, prompting for a reason. */
  const handleReject = () => {
    if (isLoading) return; const reason = prompt(`Enter reason for rejection by Treasury (optional):`); setIsLoading(true); setWorkflowMessage(`Processing rejection...`);
     setTimeout(() => { setRejectReason(reason || 'No reason provided.'); setWorkflowState('rejected'); }, 1000);
  };

  /**
   * Handles the final execution of the mint after workflow approval and user confirmation.
   * Dispatches actions directly to context.
   */
  const handleExecuteMint = () => {
    if (isLoading || workflowState !== 'approved' || !mintRequestData || !selectedAsset) { console.error("Mint execution attempted in invalid state or with missing data."); alert("Cannot execute mint. Please check the status or cancel and retry."); return; }

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
        setIsLoading(true); setWorkflowMessage('Executing mint...');
        try {
            // Dispatch balance update
            dispatchAssets({ type: 'UPDATE_ASSET_BALANCE', payload: { assetId: mintRequestData.assetId, changeAmount: mintRequestData.amount } });
            // Dispatch history log
            const historyEntry = { id: Date.now() + Math.random(), timestamp: new Date(), actionType: 'Mint', details: `Minted ${mintRequestData.amount.toLocaleString()} ${selectedAsset.symbol}${mintRequestData.reason ? ` (Reason: ${mintRequestData.reason})` : ''}`, user: currentUserInitials, approver: approverInitials, notes: mintRequestData.reason || '' };
            dispatchTokenHistory({ type: 'ADD_TOKEN_HISTORY', payload: historyEntry });

            alert(`${mintRequestData.amount.toLocaleString()} ${selectedAsset.symbol} minted successfully!`);
            onBack(); // Navigate back after successful dispatch
        } catch (error) {
            console.error("Error dispatching mint actions:", error);
            alert("An error occurred while trying to mint the tokens. Please check the console and try again.");
            setIsLoading(false);
            setWorkflowState('approved'); // Allow retry?
            setWorkflowMessage('Error during execution. Please try again.');
        }
    } else { console.log("Final mint execution cancelled by user."); }
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
          <button className="px-3 py-1 rounded text-white hover:opacity-90 bg-gray-800 text-sm disabled:opacity-50" onClick={workflowState === 'idle' ? onBack : handleCancelRequest} disabled={isLoading && workflowState !== 'idle'} >
            {workflowState === 'idle' ? '← Back' : 'Cancel Mint Request'}
          </button>
        </div>

        {/* Workflow Status Area */}
        {workflowState !== 'idle' && (
          <div className={`mb-6 p-4 border rounded-lg ${workflowState === 'rejected' ? 'bg-red-50 border-red-300' : 'bg-blue-50 border-blue-300'}`}>
            <h3 className={`text-lg font-semibold mb-2 ${workflowState === 'rejected' ? 'text-red-800' : 'text-blue-800'}`}>Mint Request Status</h3>
            <p className={`mb-3 ${workflowState === 'rejected' ? 'text-red-700' : 'text-blue-700'}`}>{workflowMessage}</p>
            {isLoading && <p className="text-sm text-gray-500 italic mb-3">Processing...</p>}
            {/* Workflow Buttons */}
            {workflowState === 'pending_treasury' && !isLoading && ( <div className="flex space-x-3"> <button onClick={handleApproval} className="px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm">Approve (Treasury)</button> <button onClick={handleReject} className="px-4 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm">Reject (Treasury)</button> </div> )}
            {workflowState === 'rejected' && !isLoading && ( <p className="text-red-700 font-medium">Reason: {rejectReason}</p> )}
            {workflowState === 'approved' && !isLoading && ( <button onClick={handleExecuteMint} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-bold"> Confirm & Mint Tokens </button> )}
          </div>
        )}


        {/* Main Mint Form (Displayed only when workflow is idle) */}
        {workflowState === 'idle' && (
          <form onSubmit={handleInitiateMintApproval}>
            <div className="space-y-4">

              {/* Asset Selection - UPDATED to use filtered list */}
              <div>
                <label htmlFor="assetSelect" className="block mb-1 font-medium text-gray-700">Select Token to Mint <span className="text-red-600">*</span></label>
                <select
                  id="assetSelect"
                  className="w-full p-2 border rounded bg-white disabled:bg-gray-100"
                  value={selectedAssetId}
                  onChange={(e) => setSelectedAssetId(e.target.value)}
                  required
                  disabled={mintableAssets.length === 0} // Disable if filtered list is empty
                >
                   <option value="" disabled>
                      {/* Update placeholder based on filtered list */}
                      {mintableAssets.length === 0 ? '-- No Mintable Assets Available --' : '-- Select an Asset --'}
                    </option>
                   {/* *** Map over the filtered mintableAssets list *** */}
                  {mintableAssets.map(asset => (
                    <option key={asset.id} value={asset.id}>
                      {asset.label} ({asset.symbol}) - Bal: {asset.balance.toLocaleString()}
                    </option>
                  ))}
                </select>
                {mintableAssets.length === 0 && <p className="text-xs text-gray-500 mt-1">Only wizard-issued or specific predefined assets can be minted here.</p>}
              </div>

              {/* Amount Input */}
              <div>
                <label htmlFor="mintAmount" className="block mb-1 font-medium text-gray-700">Amount to Mint <span className="text-red-600">*</span></label>
                <input id="mintAmount" type="number" className="w-full p-2 border rounded disabled:bg-gray-100" placeholder="e.g., 10000" value={amountToMint} onChange={(e) => setAmountToMint(e.target.value)} min="0.000001" step="any" required disabled={!selectedAssetId} />
                <p className="text-xs text-gray-500 mt-1">Enter the number of new tokens to create.</p>
              </div>

              {/* Reason Input */}
              <div>
                <label htmlFor="mintReason" className="block mb-1 font-medium text-gray-700">Reason / Reference (Optional)</label>
                <input id="mintReason" type="text" className="w-full p-2 border rounded disabled:bg-gray-100" placeholder="e.g., Fulfilling order #123" value={mintReason} onChange={(e) => setMintReason(e.target.value)} disabled={!selectedAssetId} />
                <p className="text-xs text-gray-500 mt-1">Enter a reason for this minting operation for audit purposes.</p>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button type="submit" className="w-full px-5 py-2 rounded text-white hover:opacity-90 bg-emtech-gold disabled:opacity-50" disabled={ !selectedAssetId || !amountToMint || parseFloat(amountToMint) <= 0 || isLoading } >
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
