import React, { useState, useEffect, useMemo } from 'react';
import { useAssets } from '../../context/AssetsContext';
import { useTokenHistory } from '../../context/TokenHistoryContext';
import { formatNumber } from '../../utils/displayUtils'; // Assuming this utility exists
// *** REMOVED import of detailedDummyReserveData ***
// import { detailedDummyReserveData } from '../../utils/metricsData.js';

// Constants
const currentUserInitials = 'MT'; // Example: User initiating mint
const approverInitials = 'TA'; // Example: Final approver in workflow

// Define which predefined assets can be minted (can be same as burnable or different)
const allowedMintablePredefinedIds = [ 'cp-acme-01', 'mmf-usd-01', 'xagc-01', 'oil-wti-01', 'cc-verra-01', ];

/**
 * MintExistingToken Component
 * Allows users to initiate and manage the workflow for minting additional tokens
 * for an existing asset type. Includes simulated reserve check.
 */
const MintExistingToken = ({ onBack }) => {

  const { assets, dispatchAssets } = useAssets(); // Use dispatchAssets from context
  const { dispatchTokenHistory } = useTokenHistory();

  // Form State
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [amountToMint, setAmountToMint] = useState('');
  const [mintReason, setMintReason] = useState(''); // Optional reason/reference

  // Workflow State
  const [workflowState, setWorkflowState] = useState('idle'); // 'idle', 'pending_reserve_check', 'pending_treasury', 'approved', 'rejected'
  const [workflowMessage, setWorkflowMessage] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mintRequestData, setMintRequestData] = useState(null); // Store request data during workflow

  // Filter assets eligible for minting
  const mintableAssets = useMemo(() => { /* ... unchanged ... */
    if (!Array.isArray(assets)) return [];
    return assets.filter(asset => asset.isWizardIssued === true || allowedMintablePredefinedIds.includes(asset.id) );
  }, [assets]);

  // Get the full object for the selected asset (or the one in the active workflow)
  const assetIdForLookup = workflowState === 'idle' ? selectedAssetId : mintRequestData?.assetId;
  const selectedAsset = useMemo(() => { /* ... unchanged ... */
      if (!assetIdForLookup || !Array.isArray(assets)) return null;
      return assets.find(asset => asset.id === assetIdForLookup);
  }, [assetIdForLookup, assets]);


  // Effect to reset form if selected asset becomes invalid
  useEffect(() => { /* ... unchanged ... */
    if (selectedAssetId && !mintableAssets.some(a => a.id === selectedAssetId)) {
        console.log("Resetting selectedAssetId in Mint screen because it's no longer mintable.");
        setSelectedAssetId(''); setAmountToMint(''); setMintReason('');
    }
  }, [mintableAssets, selectedAssetId]);

  // Effect to manage workflow messages and simulate reserve check
  useEffect(() => {
    setIsLoading(false); // Reset loading state by default

    switch (workflowState) {
      case 'pending_reserve_check':
        setIsLoading(true); // Show loading during check
        setWorkflowMessage('Checking reserve adequacy...');
        // Simulate the check
        setTimeout(() => {
            // Always passes in demo
            // *** REMOVED fetching/logging of static detailedDummyReserveData ***
            // const reserveData = detailedDummyReserveData[mintRequestData?.assetId];
            // console.log(`[Mint Simulation] Checking reserves for ${selectedAsset?.symbol}:`, reserveData?.accounts);
            console.log('[Mint Simulation] Reserve check passed (Simulated).');
            setWorkflowState('pending_treasury'); // Move to next step
        }, 2000); // Simulate 2 second check
        break;
      case 'pending_treasury':
        setWorkflowMessage('Reserve check passed. Request sent to Treasury for review.');
        break;
      case 'approved':
        setWorkflowMessage('Mint request approved. Ready to execute.');
        break;
      case 'rejected':
        setWorkflowMessage('Mint request rejected.');
        break;
      default: // idle
        setWorkflowMessage('');
        setRejectReason('');
        setMintRequestData(null);
        break;
    }
  // Removed selectedAsset from dependencies as it's only used in the removed console log now
  }, [workflowState, mintRequestData]);

  // --- Event Handlers ---

  // Initiate the mint approval workflow
  const handleInitiateMintApproval = (event) => { /* ... unchanged validation ... */
    event.preventDefault();
    const amount = parseFloat(amountToMint);
    if (!selectedAssetId) { alert("Please select an asset to mint."); return; }
    if (isNaN(amount) || amount <= 0) { alert("Please enter a valid positive amount to mint."); return; }
    const assetForValidation = assets.find(asset => asset.id === selectedAssetId);
     if (!assetForValidation) { alert("Error: Selected asset details not found."); return; }
     if (assetForValidation.pausable === true) { alert(`Error: Cannot mint paused asset (${assetForValidation.symbol}).`); return; }
     if (assetForValidation.permissionDetails?.isExpirationEnabled && new Date() > new Date(assetForValidation.permissionDetails.expiration)) { alert(`Error: Cannot mint expired asset (${assetForValidation.symbol}).`); return; }
     const decimals = assetForValidation.decimals ?? 18;
     const amountString = amountToMint.toString();
     if (amountString.includes('.') && amountString.split('.')[1].length > decimals) { alert(`Error: Amount exceeds the maximum allowed decimal places (${decimals}) for ${assetForValidation.symbol}.`); return; }

    const requestData = { assetId: selectedAssetId, amount: amount, reason: mintReason };
    console.log("Initiating mint approval with data:", requestData);
    setMintRequestData(requestData);
    setWorkflowState('pending_reserve_check'); // Start workflow at reserve check step
  };

  // Simulate workflow approval (Treasury step)
  const handleApproval = () => { /* ... unchanged ... */
      if (isLoading || workflowState !== 'pending_treasury') return; setIsLoading(true); setWorkflowMessage(`Processing Treasury approval...`); setTimeout(() => { setWorkflowState('approved'); }, 1500); };
  // Simulate workflow rejection
  const handleReject = () => { /* ... unchanged ... */
      if (isLoading) return; const rejectedBy = workflowState === 'pending_reserve_check' ? 'Reserve Check' : 'Treasury'; const reason = prompt(`Enter reason for rejection by ${rejectedBy} (optional):`); setIsLoading(true); setWorkflowMessage(`Processing rejection...`); setTimeout(() => { setRejectReason(reason || 'No reason provided.'); setWorkflowState('rejected'); }, 1000); };

  // Execute the mint after final approval
  const handleExecuteMint = () => { /* ... unchanged dispatch logic ... */
    if (isLoading || workflowState !== 'approved' || !mintRequestData || !selectedAsset) { console.error("Mint execution attempted in invalid state or with missing data."); alert("Cannot execute mint. Please check the status or cancel and retry."); return; }
    let confirmationMessage = ` Please confirm minting:\n-------------------------\n Asset: ${selectedAsset.label} (${selectedAsset.symbol})\n Amount: ${mintRequestData.amount.toLocaleString()}\n Reason: ${mintRequestData.reason || 'N/A'}\n-------------------------\n Current Balance: ${selectedAsset.balance.toLocaleString()}\n New Balance: ${(selectedAsset.balance + mintRequestData.amount).toLocaleString()} `;
    let finalConfirmationMessage = confirmationMessage;
    if (selectedAsset.supply === 'Finite' && typeof selectedAsset.totalSupplyIssued === 'number') { finalConfirmationMessage += `\n Current Total Issued: ${selectedAsset.totalSupplyIssued.toLocaleString()}\n New Total Issued: ${(selectedAsset.totalSupplyIssued + mintRequestData.amount).toLocaleString()}`; }
    if (window.confirm(finalConfirmationMessage)) {
        setIsLoading(true); setWorkflowMessage('Executing mint...');
        try {
            dispatchAssets({ type: 'MINT_ASSET', payload: { assetId: mintRequestData.assetId, amount: mintRequestData.amount } });
            const historyEntry = { id: Date.now() + Math.random(), timestamp: new Date(), actionType: 'Mint', details: `Minted ${mintRequestData.amount.toLocaleString()} ${selectedAsset.symbol}${mintRequestData.reason ? ` (Reason: ${mintRequestData.reason})` : ''}`, user: currentUserInitials, approver: approverInitials, assetId: selectedAsset.id, assetSymbol: selectedAsset.symbol, assetName: selectedAsset.label, notes: `${mintRequestData.reason || ''} (Reserve adequacy check passed)`.trim() };
            dispatchTokenHistory({ type: 'ADD_TOKEN_HISTORY', payload: historyEntry });
            alert(`${mintRequestData.amount.toLocaleString()} ${selectedAsset.symbol} minted successfully!`);
            onBack();
        } catch (error) { console.error("Error dispatching mint actions:", error); alert("An error occurred while trying to mint the tokens. Please check the console and try again."); setIsLoading(false); setWorkflowState('approved'); setWorkflowMessage('Error during execution. Please try again.'); }
    } else { console.log("Final mint execution cancelled by user."); } };

   // Cancel the workflow request
   const handleCancelRequest = () => { /* ... unchanged ... */
       if (window.confirm("Are you sure you want to cancel this mint request?")) { setWorkflowState('idle'); } }

  // --- Render Logic ---
  return (
    <div className="p-8">
        <div className="bg-white p-6 rounded shadow max-w-2xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-6 border-b pb-3"> <h1 className="text-2xl font-bold text-gray-800">Mint Existing Token</h1> <button className="px-3 py-1 rounded text-white hover:opacity-90 bg-gray-800 text-sm disabled:opacity-50" onClick={workflowState === 'idle' || workflowState === 'rejected' ? onBack : handleCancelRequest} disabled={isLoading && workflowState !== 'idle'} > {workflowState === 'idle' || workflowState === 'rejected' ? '← Back' : 'Cancel Mint Request'} </button> </div>

            {/* Workflow Status Display Area */}
            {workflowState !== 'idle' && ( /* ... unchanged ... */ <div className={`mb-6 p-4 border rounded-lg ${workflowState === 'rejected' ? 'bg-red-50 border-red-300' : 'bg-blue-50 border-blue-300'}`}> <h3 className={`text-lg font-semibold mb-2 ${workflowState === 'rejected' ? 'text-red-800' : 'text-blue-800'}`}>Mint Request Status</h3> <p className={`mb-3 ${workflowState === 'rejected' ? 'text-red-700' : 'text-blue-700'}`}>{workflowMessage}</p> {isLoading && (workflowState === 'pending_reserve_check' || workflowState === 'pending_treasury') && ( <p className="text-sm text-gray-500 italic mb-3">Processing...</p> )} {workflowState === 'pending_treasury' && !isLoading && ( <div className="flex space-x-3"> <button onClick={handleApproval} className="px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm">Approve (Treasury)</button> <button onClick={handleReject} className="px-4 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm">Reject (Treasury)</button> </div> )} {workflowState === 'rejected' && !isLoading && ( <p className="text-red-700 font-medium">Reason: {rejectReason}</p> )} {workflowState === 'approved' && !isLoading && ( <button onClick={handleExecuteMint} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-bold"> Confirm & Mint Tokens </button> )} </div> )}

            {/* Mint Form (Show only when workflow is idle) */}
            {workflowState === 'idle' && ( /* ... unchanged ... */ <form onSubmit={handleInitiateMintApproval}> <div className="space-y-4"> <div> <label htmlFor="assetSelect" className="block mb-1 font-medium text-gray-700">Select Token to Mint <span className="text-red-600">*</span></label> <select id="assetSelect" className="w-full p-2 border rounded bg-white disabled:bg-gray-100" value={selectedAssetId} onChange={(e) => setSelectedAssetId(e.target.value)} required disabled={mintableAssets.length === 0} > <option value="" disabled> {mintableAssets.length === 0 ? '-- No Mintable Assets Available --' : '-- Select an Asset --'} </option> {mintableAssets.map(asset => ( <option key={asset.id} value={asset.id}> {asset.label} ({asset.symbol}) - Bal: {asset.balance.toLocaleString()} {asset.supply === 'Finite' ? `/ Issued: ${asset.totalSupplyIssued?.toLocaleString() ?? 'N/A'}`: ''} </option> ))} </select> {mintableAssets.length === 0 && <p className="text-xs text-gray-500 mt-1">Only wizard-issued or specific predefined assets can be minted here.</p>} </div> <div> <label htmlFor="mintAmount" className="block mb-1 font-medium text-gray-700">Amount to Mint <span className="text-red-600">*</span></label> <input id="mintAmount" type="number" className="w-full p-2 border rounded disabled:bg-gray-100" placeholder="e.g., 10000" value={amountToMint} onChange={(e) => setAmountToMint(e.target.value)} min="0.000001" step="any" required disabled={!selectedAssetId} /> <p className="text-xs text-gray-500 mt-1">Enter the number of new tokens to create.</p> </div> <div> <label htmlFor="mintReason" className="block mb-1 font-medium text-gray-700">Reason / Reference (Optional)</label> <input id="mintReason" type="text" className="w-full p-2 border rounded disabled:bg-gray-100" placeholder="e.g., Fulfilling order #123, Reserve top-up" value={mintReason} onChange={(e) => setMintReason(e.target.value)} disabled={!selectedAssetId} /> <p className="text-xs text-gray-500 mt-1">Enter a reason for this minting operation for audit purposes.</p> </div> <div className="pt-4"> <button type="submit" className="w-full px-5 py-2 rounded text-white hover:opacity-90 bg-yellow-600 disabled:opacity-50" disabled={ !selectedAssetId || !amountToMint || parseFloat(amountToMint) <= 0 || isLoading } > Request Mint Approval </button> </div> </div> </form> )}
        </div>
    </div>
  );
};

export default MintExistingToken;
