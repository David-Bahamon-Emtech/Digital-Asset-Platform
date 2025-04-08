import React, { useState, useEffect } from 'react';

/**
 * Component for redeeming/swapping tokens. It allows users to select a token they hold,
 * choose an amount, and specify whether they want to redeem it for its underlying
 * value (simulated) or swap it for another token available on the platform.
 * Exchange rates for swaps are derived based on predefined base values (relative to USDC)
 * and value definitions set during token issuance. Includes a multi-step simulated
 * approval workflow before final execution.
 *
 * @param {object} props - Component props.
 * @param {Array} props.assets - The list of all available assets (predefined and user-issued).
 * @param {function} props.onRedeem - Callback function executed after successful workflow approval, passing structured redemption data (mode, amounts, assets involved, etc.).
 * @param {function} props.onBack - Callback function to navigate back to the previous view.
 */
const RedeemTokenScreen = ({ assets = [], onRedeem, onBack }) => {

  // Component State
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [amountToRedeem, setAmountToRedeem] = useState('');
  const [redemptionMode, setRedemptionMode] = useState('underlying'); // 'underlying' or 'other_token'
  const [targetAssetId, setTargetAssetId] = useState('');
  const [receivingAccount, setReceivingAccount] = useState('');
  const [redemptionPurpose, setRedemptionPurpose] = useState('');
  const [redeemNotes, setRedeemNotes] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  // Workflow State
  const [workflowState, setWorkflowState] = useState('idle'); // 'idle', 'pending_auth1', 'pending_auth2', 'approved', 'rejected'
  const [workflowMessage, setWorkflowMessage] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);


  // Derived state from props and component state
  const selectedAsset = assets.find(asset => asset.id === selectedAssetId);
  const targetAsset = assets.find(asset => asset.id === targetAssetId);
  const amountNumber = parseFloat(amountToRedeem) || 0;

  // Calculates the exchange rate between source and target assets.
  // Uses a common base currency (USDC) simulation and parsed value definitions.
  const getExchangeRate = (source, target) => {
    if (!source || !target || source.id === target.id) return null;

    // Approx value of 1 unit of each predefined token in terms of USDC (for simulation).
    const ratesToUsdc = { 'USDC': 1, 'USDT': 1.00, 'T-GOLD': 50.00, 'eGH¢': 0.08, 'D-EUR': 1.09 };

    // Finds the approx value of 1 unit of an asset in USDC.
    const getUsdcValue = (asset) => {
      if (!asset) return null;
      if (asset.isWizardIssued) {
        if (asset.parsedValueDefinition) {
          const defTargetSymbol = asset.parsedValueDefinition.targetSymbol;
          const defValue = asset.parsedValueDefinition.value;
          if (defTargetSymbol === 'USDC') return defValue;
          const backingAssetUsdcRate = ratesToUsdc[defTargetSymbol];
          if (backingAssetUsdcRate) return defValue * backingAssetUsdcRate;
        }
        return null; // Cannot determine value if no usable definition
      } else {
        return ratesToUsdc[asset.symbol] || null; // Use map for predefined
      }
    };

    const sourceValueInUsdc = getUsdcValue(source);
    const targetValueInUsdc = getUsdcValue(target);

    // Calculate rate if both values are found
    if (sourceValueInUsdc !== null && targetValueInUsdc !== null && targetValueInUsdc > 0) {
      return sourceValueInUsdc / targetValueInUsdc; // Rate: How many Target per 1 Source
    }

    console.warn(`Could not derive rate via USDC base for ${source?.symbol} -> ${target?.symbol}`);
    return null; // Rate not available
  };

  // Determine the current exchange rate based on selections.
  const exchangeRate = (redemptionMode === 'other_token')
    ? getExchangeRate(selectedAsset, targetAsset)
    : null;

  // Calculates preview figures for display based on current selections and rate.
  const calculatePreview = () => {
    if (!selectedAsset || amountNumber <= 0) return { show: false };
    if (redemptionMode === 'underlying') {
      const feeRate = 0.0005; const calculatedFee = amountNumber * feeRate; const receivedAmount = amountNumber - calculatedFee;
      let settlementTime = '1-2 Business Days'; if (selectedAsset.blockchain === 'Stellar' || selectedAsset.blockchain === 'Hedera') settlementTime = 'Near Instant'; else if (selectedAsset.blockchain === 'Ethereum') settlementTime = 'Minutes to Hours';
      return { show: true, mode: 'underlying', redeemAmount: amountNumber, redeemSymbol: selectedAsset.symbol, fee: calculatedFee, received: Math.max(0, receivedAmount), receivedSymbol: `Underlying (${selectedAsset.symbol})`, settlement: settlementTime };
    } else if (redemptionMode === 'other_token') {
      if (!targetAsset) return { show: true, mode: 'other_token', error: 'Please select the target asset you wish to receive.' };
      if (!exchangeRate) return { show: true, mode: 'other_token', error: `No exchange rate available for ${selectedAsset.symbol} -> ${targetAsset.symbol}.` };
      const receivedAmount = amountNumber * exchangeRate;
      return { show: true, mode: 'other_token', redeemAmount: amountNumber, redeemSymbol: selectedAsset.symbol, rate: `1 ${selectedAsset.symbol} ≈ ${exchangeRate.toFixed(4)} ${targetAsset.symbol}`, received: receivedAmount, receivedSymbol: targetAsset.symbol, settlement: 'Near Instant (Platform Swap)' };
    }
    return { show: false };
  };
  const preview = calculatePreview();

  // Create a list of assets that can be selected as the target for swapping.
  const targetableAssets = assets.filter(asset => asset.id !== selectedAssetId);

  // Reset target asset selection when the source asset or redemption mode changes.
  useEffect(() => { setTargetAssetId(''); }, [selectedAssetId, redemptionMode]);

  // Updates the workflow status message based on the current workflow state.
  useEffect(() => {
    setIsLoading(false);
    if (workflowState === 'pending_auth1') { setWorkflowMessage('Redemption request submitted. Pending First Factor Authentication/Approval.'); }
    else if (workflowState === 'pending_auth2') { setWorkflowMessage('First Factor OK. Pending Second Factor Authentication/Approval.'); }
    else if (workflowState === 'approved') { setWorkflowMessage('Redemption request fully approved. Ready to execute.'); }
    else if (workflowState === 'rejected') { setWorkflowMessage('Redemption request rejected.'); }
    else { setWorkflowMessage(''); setRejectReason(''); }
  }, [workflowState]);


  // --- Event Handlers ---

  // Handles the initial submission of the redemption form to start the workflow.
  const handleInitiateRedemption = (event) => {
    event.preventDefault();
    // Validation checks
    if (!selectedAsset) { alert("Please select an asset to redeem."); return; }
    if (isNaN(amountNumber) || amountNumber <= 0) { alert("Please enter a valid positive amount."); return; }
    if (amountNumber > selectedAsset.balance) { alert("Amount to redeem cannot exceed current balance."); return; }
    if (redemptionMode === 'other_token' && !targetAssetId) { alert("Please select the asset you wish to receive."); return; }
    if (redemptionMode === 'other_token' && !exchangeRate) { alert("No exchange rate available for the selected pair."); return; }
    if (!receivingAccount.trim()) { alert("Please enter a receiving account/wallet address."); return; }
    if (!redemptionPurpose) { alert("Please select a redemption purpose."); return; }
    if (!termsAccepted) { alert("Please acknowledge the terms."); return; }
    // Start workflow
    setWorkflowState('pending_auth1');
  };

  // Simulates an approval step in the workflow.
  const handleApproval = (step) => {
     if (isLoading) return;
     setIsLoading(true);
     setWorkflowMessage(`Processing Step ${step} approval...`);
     setTimeout(() => {
        if (step === 1) { setWorkflowState('pending_auth2'); }
        else if (step === 2) { setWorkflowState('approved'); }
     }, 1500);
  };

  // Simulates a rejection step in the workflow.
  const handleReject = (rejectedByStep) => {
    if (isLoading) return;
    const reason = prompt(`Enter reason for rejection at Step ${rejectedByStep} (optional):`);
    setIsLoading(true);
    setWorkflowMessage(`Processing rejection...`);
     setTimeout(() => {
        setRejectReason(reason || 'No reason provided.');
        setWorkflowState('rejected');
     }, 1000);
  };

  // Executes the redemption after final confirmation (calls the onRedeem prop).
  const handleExecuteRedemption = () => {
    if (isLoading) return;
    let confirmMsg = `You are about to redeem ${amountNumber.toLocaleString()} ${selectedAsset?.symbol}`;
    if (redemptionMode === 'other_token' && targetAsset && preview.received) {
        confirmMsg += ` for approximately ${preview.received.toLocaleString(undefined, {maximumFractionDigits: 4})} ${targetAsset.symbol}`;
    }
    confirmMsg += `.\nThis will remove the ${selectedAsset?.symbol} from your balance.\n\nProceed?`;

    if (window.confirm(confirmMsg)) {
        const commonData = { amount: amountNumber, receivingAccount: receivingAccount, purpose: redemptionPurpose, notes: redeemNotes };
        let redeemData;
        if (redemptionMode === 'underlying') {
            redeemData = { ...commonData, mode: 'underlying', assetId: selectedAssetId };
        } else { // mode === 'other_token'
            redeemData = { ...commonData, mode: 'cross_token', sourceAssetId: selectedAssetId, targetAssetId: targetAssetId, rate: exchangeRate, targetAmount: preview.received };
        }
        onRedeem(redeemData); // Send data up to parent
    } else {
        console.log("Final redemption execution cancelled by user.");
    }
  };

  // --- Render Logic ---
  return (
    <div className="p-8">
      <div className="bg-white p-6 rounded shadow max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 border-b pb-3">
             <h1 className="text-2xl font-bold text-gray-800">Redeem Tokens</h1>
             <button className="px-3 py-1 rounded text-white hover:opacity-90 bg-gray-800 text-sm disabled:opacity-50" onClick={workflowState === 'idle' || workflowState === 'rejected' ? onBack : () => { setWorkflowState('idle'); }} disabled={isLoading} > {workflowState === 'idle' || workflowState === 'rejected' ? 'Back' : 'Cancel Request'} </button>
        </div>

        {/* Workflow Status Area */}
        {workflowState !== 'idle' && (
           <div className={`mb-6 p-4 border rounded-lg ${workflowState === 'rejected' ? 'bg-red-50 border-red-300' : 'bg-blue-50 border-blue-300'}`}>
              <h3 className={`text-lg font-semibold mb-2 ${workflowState === 'rejected' ? 'text-red-800' : 'text-blue-800'}`}>Redemption Request Status</h3>
              <p className={`mb-3 ${workflowState === 'rejected' ? 'text-red-700' : 'text-blue-700'}`}>{workflowMessage}</p>
              {isLoading && <p className="text-sm text-gray-500 italic mb-3">Processing...</p>}
              {workflowState === 'pending_auth1' && !isLoading && ( <div className="flex space-x-3"> <button onClick={() => handleApproval(1)} className="px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm">Approve (Step 1)</button> <button onClick={() => handleReject(1)} className="px-4 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm">Reject (Step 1)</button> </div> )}
              {workflowState === 'pending_auth2' && !isLoading && ( <div className="flex space-x-3"> <button onClick={() => handleApproval(2)} className="px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm">Approve (Step 2)</button> <button onClick={() => handleReject(2)} className="px-4 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm">Reject (Step 2)</button> </div> )}
              {workflowState === 'rejected' && ( <p className="text-red-700 font-medium">Reason: {rejectReason}</p> )}
              {workflowState === 'approved' && !isLoading && ( <button onClick={handleExecuteRedemption} className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 font-bold"> Execute Redemption </button> )}
           </div>
        )}


        {/* Main Redeem Form (Shown only when workflow is idle) */}
        {workflowState === 'idle' && (
          <>
            {/* Informational Banner */}
            <div className="bg-blue-50 border-l-4 border-blue-600 p-4 mb-6">
              <div className="flex">
                 <div className="flex-shrink-0"> <svg className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor"> <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /> </svg> </div>
                 <div className="ml-3"> <p className="text-sm text-blue-700"> <strong>Note:</strong> Redeem tokens for their underlying asset or swap for another token on the platform. Fees and rates apply. </p> </div>
               </div>
            </div>

            {/* Form */}
            <form onSubmit={handleInitiateRedemption}>
              <div className="space-y-4">

                {/* Token Selection */}
                <div>
                  <label htmlFor="redeemAssetSelect" className="block mb-1 font-medium text-gray-700">Token to Redeem <span className="text-red-600">*</span></label>
                  <select id="redeemAssetSelect" className="w-full p-2 border rounded bg-white" value={selectedAssetId} onChange={(e) => { setSelectedAssetId(e.target.value); setAmountToRedeem(''); }} required >
                     <option value="" disabled>-- Select an Asset --</option>
                     {assets.map(asset => ( <option key={asset.id} value={asset.id}>{asset.label} ({asset.symbol})</option> ))}
                  </select>
                </div>

                {/* Current Balance */}
                {selectedAsset && (
                   <div className="bg-gray-100 p-3 rounded mb-2 text-sm">
                     <div className="flex justify-between"> <span>Your Balance:</span> <span className="font-medium">{selectedAsset.balance.toLocaleString()} {selectedAsset.symbol}</span> </div>
                   </div>
                 )}

                {/* Redemption Mode Selection */}
                 <div className="pt-2">
                    <label className="block mb-2 font-medium text-gray-700">Redemption Type <span className="text-red-600">*</span></label>
                    <div className="flex space-x-4">
                        <label className="flex items-center cursor-pointer">
                            <input type="radio" name="redeemMode" value="underlying" checked={redemptionMode === 'underlying'} onChange={() => setRedemptionMode('underlying')} className="mr-2 h-4 w-4 text-emtech-gold focus:ring-emtech-gold"/>
                            <span className="text-sm">Redeem for Underlying Asset</span>
                        </label>
                        <label className="flex items-center cursor-pointer">
                            <input type="radio" name="redeemMode" value="other_token" checked={redemptionMode === 'other_token'} onChange={() => setRedemptionMode('other_token')} className="mr-2 h-4 w-4 text-emtech-gold focus:ring-emtech-gold"/>
                            <span className="text-sm">Swap for Another Platform Token</span>
                        </label>
                    </div>
                 </div>

                 {/* Target Asset Selection (Conditional) */}
                {redemptionMode === 'other_token' && (
                    <div>
                      <label htmlFor="targetAssetSelect" className="block mb-1 font-medium text-gray-700">Receive Which Token? <span className="text-red-600">*</span></label>
                      <select id="targetAssetSelect" className="w-full p-2 border rounded bg-white" value={targetAssetId} onChange={(e) => setTargetAssetId(e.target.value)} required={redemptionMode === 'other_token'} >
                         <option value="" disabled>-- Select Target Asset --</option>
                         {targetableAssets.map(asset => ( <option key={asset.id} value={asset.id}>{asset.label} ({asset.symbol})</option> ))}
                      </select>
                      {selectedAsset && targetAsset && !exchangeRate && (<p className="text-xs text-red-600 mt-1">No derivable rate found for {selectedAsset.symbol} -&gt; {targetAsset.symbol}.</p>)}
                      {selectedAsset && targetAsset && exchangeRate && (<p className="text-xs text-gray-500 mt-1">Rate: 1 {selectedAsset.symbol} ≈ {exchangeRate.toFixed(4)} {targetAsset.symbol} (Est.)</p>)}
                    </div>
                )}

                {/* Amount to Redeem */}
                <div>
                   <label htmlFor="redeemAmount" className="block mb-1 font-medium text-gray-700">Amount of {selectedAsset?.symbol || 'Token'} to Redeem <span className="text-red-600">*</span></label>
                   <input id="redeemAmount" type="number" className="w-full p-2 border rounded" placeholder="Enter amount" value={amountToRedeem} onChange={(e) => setAmountToRedeem(e.target.value)} min="0.000001" step="any" required disabled={!selectedAssetId}/>
                   {selectedAsset && amountNumber > selectedAsset.balance && ( <p className="text-xs text-red-600 mt-1">Amount exceeds current balance!</p> )}
                 </div>

                {/* Redemption Preview */}
                {preview.show && (
                  <div className="bg-gray-50 p-4 rounded border border-gray-200">
                    <h3 className="font-medium mb-2">Redemption Preview (Estimated)</h3>
                    {preview.error ? (<p className="text-sm text-red-600">{preview.error}</p>) : (
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between"> <span>Amount to Redeem:</span> <span>{preview.redeemAmount.toLocaleString()} {preview.redeemSymbol}</span> </div>
                        {preview.mode === 'underlying' && (<> <div className="flex justify-between"> <span>Est. Redemption Fee ({preview.fee.toFixed(4)} {preview.redeemSymbol}):</span> <span>Fee Applied</span> </div> </>)}
                        {preview.mode === 'other_token' && (<div className="flex justify-between"> <span>Exchange Rate Used:</span> <span>{preview.rate}</span> </div> )}
                        <div className="border-t border-gray-200 my-2 pt-2 flex justify-between font-medium"> <span>You Will Receive Approx:</span> <span>{preview.received.toLocaleString(undefined, {maximumFractionDigits: 4})} {preview.receivedSymbol}</span> </div>
                        <div className="flex justify-between text-xs text-gray-500"> <span>Estimated Settlement Time:</span> <span>{preview.settlement}</span> </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Receiving Account */}
                <div>
                  <label htmlFor="receivingAccount" className="block mb-1 font-medium text-gray-700">Receiving Account/Address <span className="text-red-600">*</span></label>
                  <input id="receivingAccount" type="text" className="w-full p-2 border rounded" placeholder={redemptionMode === 'underlying' ? 'e.g., Bank account # or wallet address' : 'Platform account/address for target token'} value={receivingAccount} onChange={(e) => setReceivingAccount(e.target.value)} required />
                </div>

                {/* Redemption Purpose */}
                <div>
                  <label htmlFor="redemptionPurpose" className="block mb-1 font-medium text-gray-700">Purpose <span className="text-red-600">*</span></label>
                  <select id="redemptionPurpose" className="w-full p-2 border rounded bg-white" value={redemptionPurpose} onChange={(e) => setRedemptionPurpose(e.target.value)} required >
                     <option value="" disabled>-- Select a purpose --</option>
                     <option value="Withdrawal">Customer Withdrawal</option>
                     <option value="Treasury">Treasury Management</option>
                     <option value="Liquidity">Liquidity Adjustment</option>
                     <option value="Settlement">Settlement with Counterparty</option>
                     <option value="Swap">Platform Swap</option>
                     <option value="Other">Other (Specify in Notes)</option>
                   </select>
                 </div>

                {/* Notes */}
                <div>
                  <label htmlFor="redeemNotes" className="block mb-1 font-medium text-gray-700">Notes</label>
                  <textarea id="redeemNotes" className="w-full p-2 border rounded" rows="2" placeholder="Additional details (optional)" value={redeemNotes} onChange={(e) => setRedeemNotes(e.target.value)} ></textarea>
                </div>

                {/* Terms Acknowledgment */}
                <div className="flex items-start pt-2">
                  <input type="checkbox" id="terms" className="mr-2 mt-1 flex-shrink-0 h-4 w-4 text-emtech-gold focus:ring-emtech-gold" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} />
                  <label htmlFor="terms" className="text-sm text-gray-600"> I acknowledge that rates are indicative, fees may apply, and redemption is subject to compliance checks. </label>
                </div>

                {/* Submit Button */}
                <div className="mt-6 flex space-x-3">
                  <button type="submit" className="px-4 py-2 rounded text-white hover:opacity-90 bg-blue-600 disabled:opacity-50" disabled={!selectedAssetId || amountNumber <= 0 || (selectedAsset && amountNumber > selectedAsset.balance) || (redemptionMode === 'other_token' && (!targetAssetId || !exchangeRate)) || !receivingAccount || !redemptionPurpose || !termsAccepted } > Submit Redemption Request </button>
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

export default RedeemTokenScreen;