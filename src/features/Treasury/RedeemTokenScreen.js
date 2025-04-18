import React, { useState, useEffect, useMemo, useCallback } from 'react';
// Context imports - paths should still be valid from ../../
import { useAssets } from '../../context/AssetsContext';
import { useTokenHistory } from '../../context/TokenHistoryContext';
// Import helpers
import { formatNumber, getStatusClass } from '../../utils/displayUtils'; // <-- Import helpers

// Placeholder for current user - replace with actual user context later
const currentUserInitials = 'RD'; // Example Redeemer initials
const approverInitials = 'SA'; // Example Settlement Approver initials

// Define simulated FX rates locally (Placeholder - use real source later)
const fiatToUsdApprox = {
    'USD': 1.00, 'EUR': 1.09, 'GHS': 0.07, 'CAD': 0.75, 'GBP': 1.25, 'SGD': 0.74, 'JPY': 0.0067
};
// Define base values for PREDEFINED assets relative to USDC (Placeholder)
// Ensure all relevant predefined assets have an entry here if needed for rate calculation
const ratesToUSD = {
    'USD': 1, 'EUR': 1.10, 'GBP': 1.25, 'CAD': 0.74, 'AUD': 0.66, 'SGD': 0.74,
    'JPY': 0.0067, 'CHF': 1.11, 'GHS': 0.067,
    'USDC': 1, 'USDT': 1, 'T-BOND': 100, // Assign arbitrary value for bond?
    'eGH': 0.067, 'D-EUR': 1.10,
    'ACP': 0.998, // Commercial Paper
    'MMFUSD': 1.00, // Money Market Fund
    'XAGC': 30.50, // Silver Coin
    'WTOIL': 80.15, // Tokenized Oil
    'VCC': 15.75, // Carbon Credit
    'T-GOLD': 2350, // Example Gold price
    'INR': 0.012
};
// Define rates FROM USD (Inverse or specified) - Ensure consistency or derive
const ratesFromUSD = {
    USD: 1, EUR: 0.91, JPY: 150, GHS: 15, CAD: 1.36, GBP: 0.80, AUD: 1.52, SGD: 1.35, CHF: 0.90,
    USDC: 1, USDT: 1, 'D-EUR': 0.91, eGH: 15,
    // Add inverses for others if needed, e.g., ACP might not be directly purchasable with USD
    INR: 83,
};


// --- *** UPDATED: Define ALL predefined token IDs allowed for Redeem/Swap *** ---
const allAllowedPredefinedTokenIds = [
    // Treasury Assets
    'usdc',
    'usdt',
    't-bond',
    'e-cedi',
    'd-euro',
    // Token Management Predefined Assets
    'cp-acme-01',
    'mmf-usd-01',
    'xagc-01',
    'oil-wti-01',
    'cc-verra-01',
];


// --- Smart Contract Simulation View Component ---
// (This component remains unchanged)
const SmartContractExecutionView = ({ data, sourceAsset, targetAsset, onFinish, onCancel }) => {
    const [step, setStep] = useState(0);
    const [message, setMessage] = useState('Initializing smart contract interaction...');
    useEffect(() => {
        if (step === 0) {
            const timer1 = setTimeout(() => { setMessage(`Validating balances and permissions for ${sourceAsset?.symbol}...`); setStep(1); }, 1500);
            const timer2 = setTimeout(() => { setMessage(`Executing transfer via contract...`); setStep(2); }, 3000);
            const timer3 = setTimeout(() => { setMessage(`Confirming transaction settlement...`); setStep(3); }, 5000);
            const timer4 = setTimeout(() => { setMessage(`Execution successful! Assets exchanged via contract.`); setStep(4); }, 6500);
            return () => { clearTimeout(timer1); clearTimeout(timer2); clearTimeout(timer3); clearTimeout(timer4); };
        }
    }, [step, sourceAsset?.symbol]); // Added dependencies

    const getStepClass = (currentStepMarker) => {
        if (step > currentStepMarker) return 'bg-green-500';
        if (step === currentStepMarker) return 'bg-blue-500 animate-pulse';
        return 'bg-gray-300';
    };
    return ( <div className="p-6 border rounded-lg bg-gray-50 animate-fade-in"> <h3 className="text-xl font-semibold mb-4 text-center text-gray-800">Executing via Smart Contract</h3> <div className="mb-6 p-4 border rounded bg-white text-sm space-y-1 shadow-sm"> <p><strong>Action:</strong> {data.mode === 'cross_token' ? 'Swap' : 'Redeem'}</p> <p><strong>From:</strong> {sourceAsset?.label || 'N/A'} ({sourceAsset?.symbol || 'N/A'})</p> <p><strong>Amount:</strong> {data.amount?.toLocaleString()} {sourceAsset?.symbol || ''}</p> {data.mode === 'cross_token' && <p><strong>To:</strong> {targetAsset?.label || 'N/A'} ({targetAsset?.symbol || 'N/A'})</p>} <p><strong>Buyer:</strong> {data.institutionalBuyerName || 'N/A'}</p> {data.mode === 'cross_token' && <p><strong>Seller:</strong> {data.institutionalSellerName || 'N/A'}</p>} <p><strong>Receiving Wallet:</strong> {data.receivingAccount || 'N/A'}</p> </div> <div className="mb-6 space-y-3"> <div className="flex items-center"><div className={`w-5 h-5 rounded-full mr-3 ${getStepClass(1)} transition-colors duration-500`}></div><span className={`${step >= 1 ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>Validating Balances & Permissions</span></div> <div className="flex items-center"><div className={`w-5 h-5 rounded-full mr-3 ${getStepClass(2)} transition-colors duration-500`}></div><span className={`${step >= 2 ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>Executing Transfer</span></div> <div className="flex items-center"><div className={`w-5 h-5 rounded-full mr-3 ${getStepClass(3)} transition-colors duration-500`}></div><span className={`${step >= 3 ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>Confirming Settlement</span></div> </div> <div className="mb-6 text-center font-medium min-h-[2em]"> {step === 4 ? ( <p className="text-green-600 animate-pulse">{message}</p> ) : ( <p className="text-blue-600">{message}</p> )} </div> <div className="flex justify-center space-x-4 mt-6"> {step === 4 ? ( <button onClick={onFinish} className="px-6 py-2 rounded text-white bg-green-600 hover:bg-green-700 font-semibold animate-fade-in">Finish</button> ) : ( step < 4 && <button onClick={onCancel} className="px-4 py-2 rounded text-sm border border-gray-300 hover:bg-gray-100">Cancel Simulation</button> )} </div> </div> );
 };
// --- End of SmartContractExecutionView ---


/**
 * Main RedeemTokenScreen Component
 */
const RedeemTokenScreen = ({ onBack }) => {

  const { assets, dispatchAssets } = useAssets();
  const { dispatchTokenHistory } = useTokenHistory();

  // --- Local UI State ---
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [amountToRedeem, setAmountToRedeem] = useState('');
  const [redemptionMode, setRedemptionMode] = useState('underlying');
  const [targetAssetId, setTargetAssetId] = useState('');
  const [receivingAccount, setReceivingAccount] = useState('');
  const [redemptionPurpose, setRedemptionPurpose] = useState('');
  const [redeemNotes, setRedeemNotes] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [institutionalSellerName, setInstitutionalSellerName] = useState('');
  const [institutionalBuyerName, setInstitutionalBuyerName] = useState('');
  const [useSmartContract, setUseSmartContract] = useState(false);
  const [approvedRedeemData, setApprovedRedeemData] = useState(null);
  const [workflowState, setWorkflowState] = useState('idle');
  const [workflowMessage, setWorkflowMessage] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // --- *** UPDATED: Filter assets for the "Token to Redeem" dropdown using combined list *** ---
  const redeemableAssets = useMemo(() => {
      if (!Array.isArray(assets)) return [];
      // Allow wizard-issued OR any asset in the combined predefined list
      return assets.filter(asset =>
          asset.isWizardIssued === true || allAllowedPredefinedTokenIds.includes(asset.id)
      );
  }, [assets]);

  // --- Derived state ---
  const selectedAsset = useMemo(() => assets.find(asset => asset.id === selectedAssetId), [assets, selectedAssetId]);
  const targetAsset = useMemo(() => assets.find(asset => asset.id === targetAssetId), [assets, targetAssetId]);
  const amountNumber = useMemo(() => parseFloat(amountToRedeem) || 0, [amountToRedeem]);

  // --- *** UPDATED: Filter target assets using combined list *** ---
  const targetableAssets = useMemo(() => {
       if (!Array.isArray(assets)) return [];
       // Allow wizard-issued OR any asset in the combined predefined list, excluding the source asset
       return assets.filter(asset =>
           asset.id !== selectedAssetId &&
           (asset.isWizardIssued === true || allAllowedPredefinedTokenIds.includes(asset.id))
       );
  }, [assets, selectedAssetId]);

  // --- Effect to reset selection if needed ---
   useEffect(() => {
      if (selectedAssetId && !redeemableAssets.some(a => a.id === selectedAssetId)) {
          console.log("Resetting selectedAssetId in Redeem screen because it's no longer redeemable.");
          setSelectedAssetId('');
          setAmountToRedeem('');
          setTargetAssetId('');
      }
  }, [redeemableAssets, selectedAssetId]);

  // --- Reset target asset if source changes or mode changes ---
  useEffect(() => {
    setTargetAssetId('');
    setInstitutionalSellerName('');
  }, [selectedAssetId, redemptionMode]);

  // --- Calculations (Exchange Rate, Preview) ---
  const getExchangeRate = useCallback((source, target) => {
      if (!source || !target || source.id === target.id) return null;
      const getUsdcValue = (asset) => {
          if (!asset) return null;
          if (typeof asset.price === 'number' && asset.price >= 0) { return asset.price; } // Use direct price first
          if (asset.isWizardIssued) { // Fallback to wizard PVD
              const pvd = asset.wizardData?.parsedValueDefinition;
              if (pvd && typeof pvd.value === 'number' && pvd.value >= 0 && pvd.currency) {
                  const fxRate = fiatToUsdApprox[pvd.currency];
                  if (fxRate !== undefined) return pvd.value * fxRate;
                  else { console.warn(`RedeemScreen: No simulated FX rate for PVD currency ${pvd.currency}`); return null; }
              } else { console.warn(`RedeemScreen: Invalid or missing PVD for wizard asset ${asset.symbol}`); }
          }
          const rate = ratesToUSD[asset.symbol]; // Fallback to hardcoded rates
          if (rate !== undefined) return rate;
          else { console.warn(`RedeemScreen: No rateToUsdc found for ${asset.symbol}`); return null; }
      };
      const sourceValueInUsdc = getUsdcValue(source);
      const targetValueInUsdc = getUsdcValue(target);
      if (sourceValueInUsdc !== null && targetValueInUsdc !== null && targetValueInUsdc > 0) { return sourceValueInUsdc / targetValueInUsdc; }
      console.warn(`Could not derive rate for ${source?.symbol} -> ${target?.symbol}`);
      return null;
  }, []);

  const exchangeRate = useMemo(() => (
      redemptionMode === 'other_token' ? getExchangeRate(selectedAsset, targetAsset) : null
  ), [redemptionMode, selectedAsset, targetAsset, getExchangeRate]);

  const calculatePreview = useCallback(() => {
      if (!selectedAsset || amountNumber <= 0) return { show: false };
      if (redemptionMode === 'underlying') {
         const feeRate = 0.0005; const calculatedFee = amountNumber * feeRate; const receivedAmount = amountNumber - calculatedFee; let settlementTime = '1-2 Business Days'; if (['Stellar', 'Hedera'].includes(selectedAsset.blockchain)) settlementTime = 'Near Instant'; else if (selectedAsset.blockchain === 'Ethereum') settlementTime = 'Minutes to Hours'; const underlyingSymbol = (selectedAsset.price === 1 && ['Stablecoin', 'FiatCurrency', 'CBDC'].includes(selectedAsset.assetClass)) ? selectedAsset.symbol : `Underlying Value (${selectedAsset.symbol})`;
         return { show: true, mode: 'underlying', redeemAmount: amountNumber, redeemSymbol: selectedAsset.symbol, fee: calculatedFee, received: Math.max(0, receivedAmount), receivedSymbol: underlyingSymbol, settlement: settlementTime };
      } else if (redemptionMode === 'other_token') {
          if (!targetAsset) return { show: true, mode: 'other_token', error: 'Please select the target asset you wish to receive.' };
          if (exchangeRate === null) return { show: true, mode: 'other_token', error: `No exchange rate available for ${selectedAsset.symbol} -> ${targetAsset.symbol}.` };
          const receivedAmount = amountNumber * exchangeRate;
          return { show: true, mode: 'other_token', redeemAmount: amountNumber, redeemSymbol: selectedAsset.symbol, rate: `1 ${selectedAsset.symbol} ≈ ${exchangeRate.toFixed(4)} ${targetAsset.symbol}`, received: receivedAmount, receivedSymbol: targetAsset.symbol, settlement: 'Near Instant (Platform Swap)' };
      }
      return { show: false };
  }, [selectedAsset, amountNumber, redemptionMode, targetAsset, exchangeRate]);

  const preview = useMemo(() => calculatePreview(), [calculatePreview]);

  // --- Workflow State Effect ---
   useEffect(() => {
       setIsLoading(false);
       if (workflowState === 'pending_auth1') { setWorkflowMessage('Redemption request submitted. Pending First Factor Authentication/Approval.'); }
       else if (workflowState === 'pending_auth2') { setWorkflowMessage('First Factor OK. Pending Second Factor Authentication/Approval.'); }
       else if (workflowState === 'approved') { setWorkflowMessage('Redemption request fully approved. Ready to execute.'); }
       else if (workflowState === 'rejected') { setWorkflowMessage('Redemption request rejected.'); }
       else if (workflowState === 'executing_contract') { setWorkflowMessage(''); }
       else { setWorkflowMessage(''); setRejectReason(''); setApprovedRedeemData(null); }
   }, [workflowState]);


  // --- Handlers ---
   const handleInitiateRedemption = (event) => {
       event.preventDefault();
       if (!selectedAsset) { alert("Please select an asset to redeem."); return; }
       if (isNaN(amountNumber) || amountNumber <= 0) { alert("Please enter a valid positive amount."); return; }
       if (amountNumber > selectedAsset.balance) { alert("Amount to redeem cannot exceed current balance."); return; }
       if (redemptionMode === 'other_token' && !targetAssetId) { alert("Please select the asset you wish to receive."); return; }
       if (redemptionMode === 'other_token' && exchangeRate === null) { alert("No exchange rate available for the selected pair."); return; }
       if (!institutionalBuyerName.trim()) { alert("Please enter the Institutional Buyer Name."); return; }
       if (redemptionMode === 'other_token' && !institutionalSellerName.trim()) { alert("Please enter the Institutional Seller Name."); return; }
       if (!receivingAccount.trim()) { alert("Please enter a receiving account/wallet address."); return; }
       if (!redemptionPurpose) { alert("Please select a redemption purpose."); return; }
       if (!termsAccepted) { alert("Please acknowledge the terms."); return; }
       setWorkflowState('pending_auth1');
   };

   const handleApproval = (step) => {
      if (isLoading) return; setIsLoading(true); setWorkflowMessage(`Processing Step ${step} approval...`);
      setTimeout(() => { if (step === 1) { setWorkflowState('pending_auth2'); } else if (step === 2) { setWorkflowState('approved'); } }, 1500);
   };

   const handleReject = (rejectedByStep) => {
     if (isLoading) return; const reason = prompt(`Enter reason for rejection at Step ${rejectedByStep} (optional):`); setIsLoading(true); setWorkflowMessage(`Processing rejection...`);
      setTimeout(() => { setRejectReason(reason || 'No reason provided.'); setWorkflowState('rejected'); }, 1000);
   };

   // Helper function to dispatch actions and handle navigation
   const executeRedemptionDispatch = (data) => {
       setIsLoading(true); setWorkflowMessage('Processing redemption...');
       try {
           let logDetails = ''; let targetAmountChange = 0; const sourceAssetIdToUpdate = data.mode === 'cross_token' ? data.sourceAssetId : data.assetId; const sourceAssetForLog = assets.find(a => a.id === sourceAssetIdToUpdate);
           dispatchAssets({ type: 'UPDATE_ASSET_BALANCE', payload: { assetId: sourceAssetIdToUpdate, changeAmount: -data.amount }}); // Decrease source
           if (data.mode === 'underlying') { logDetails = `Redeemed ${formatNumber(data.amount)} ${sourceAssetForLog?.symbol || 'token'}`; }
           else if (data.mode === 'cross_token') { targetAmountChange = data.targetAmount; const targetAssetForLog = assets.find(a => a.id === data.targetAssetId); dispatchAssets({ type: 'UPDATE_ASSET_BALANCE', payload: { assetId: data.targetAssetId, changeAmount: targetAmountChange }}); logDetails = `Swapped ${formatNumber(data.amount)} ${sourceAssetForLog?.symbol || 'token'} for ~${targetAmountChange.toLocaleString(undefined, {maximumFractionDigits: 4})} ${targetAssetForLog?.symbol || 'token'}`; } // Increase target
           if (data.purpose) logDetails += ` (Purpose: ${data.purpose})`; if (data.receivingAccount) logDetails += ` (To: ${data.receivingAccount})`; if (data.institutionalBuyerName) logDetails += ` (Buyer: ${data.institutionalBuyerName})`; if (data.mode === 'cross_token' && data.institutionalSellerName) logDetails += ` (Seller: ${data.institutionalSellerName})`; if (data.useSmartContract) logDetails += ` (Via Contract)`;
           const historyEntry = { id: Date.now() + Math.random(), timestamp: new Date(), actionType: 'Redeem/Swap', details: logDetails, user: currentUserInitials, approver: approverInitials, notes: `${data.notes || ''}${data.useSmartContract ? ' (Smart Contract Execution)' : ''}` };
           dispatchTokenHistory({ type: 'ADD_TOKEN_HISTORY', payload: historyEntry }); // Log history
           alert(`Redemption/Swap processed successfully!`); onBack(); // Go back
       } catch (error) { console.error("Error dispatching redemption actions:", error); alert("An error occurred while processing the redemption."); setIsLoading(false); setWorkflowState('idle'); setWorkflowMessage('Error during final processing. Please try again or cancel.'); }
   }

   // Finalizes redemption *without* contract simulation
   const finalizeRedemption = () => {
     if (isLoading || workflowState !== 'approved') return; let confirmMsg = `Confirm redemption: ${formatNumber(amountNumber)} ${selectedAsset?.symbol}`; if (redemptionMode === 'other_token' && targetAsset && preview.received) confirmMsg += ` for ~${preview.received.toLocaleString(undefined, {maximumFractionDigits: 4})} ${targetAsset.symbol}`; confirmMsg += `?`;
     if (window.confirm(confirmMsg)) {
         const commonData = { amount: amountNumber, receivingAccount: receivingAccount, purpose: redemptionPurpose, notes: redeemNotes, institutionalBuyerName: institutionalBuyerName, useSmartContract: false }; let redeemData;
         if (redemptionMode === 'underlying') { redeemData = { ...commonData, mode: 'underlying', assetId: selectedAssetId }; }
         else { if (exchangeRate === null || preview.received === undefined) { alert("Error: Cannot execute swap, rate/amount unavailable."); setWorkflowState('idle'); return; } redeemData = { ...commonData, mode: 'cross_token', sourceAssetId: selectedAssetId, targetAssetId: targetAssetId, rate: exchangeRate, targetAmount: preview.received, institutionalSellerName: institutionalSellerName }; }
         console.log("RedeemScreen: Dispatching directly", redeemData); executeRedemptionDispatch(redeemData);
     } else { console.log("Final redemption cancelled."); }
   };

  // Handler called when 'Proceed' button is clicked in 'approved' state
   const handleProceedAfterApproval = () => {
      if (isLoading || workflowState !== 'approved') return; const commonData = { amount: amountNumber, receivingAccount: receivingAccount, purpose: redemptionPurpose, notes: redeemNotes, institutionalBuyerName: institutionalBuyerName, useSmartContract: useSmartContract }; let redeemData;
      if (redemptionMode === 'underlying') { redeemData = { ...commonData, mode: 'underlying', assetId: selectedAssetId }; }
      else { if (exchangeRate === null || preview.received === undefined) { alert("Error: Cannot proceed, rate/amount unavailable."); setWorkflowState('idle'); return; } redeemData = { ...commonData, mode: 'cross_token', sourceAssetId: selectedAssetId, targetAssetId: targetAssetId, rate: exchangeRate, targetAmount: preview.received, institutionalSellerName: institutionalSellerName }; }
      if (useSmartContract) { console.log("RedeemScreen: Proceeding to Smart Contract Simulation", redeemData); setApprovedRedeemData(redeemData); setWorkflowState('executing_contract'); }
      else { finalizeRedemption(); }
  };

 // Called by the simulation screen's Finish button
  const handleFinishContractExecution = () => {
     if (!approvedRedeemData) { console.error("Error: Missing approved data after simulation."); alert("An error occurred finishing the process."); setWorkflowState('idle'); return; }
     console.log("RedeemScreen: Dispatching after Contract Simulation", approvedRedeemData); executeRedemptionDispatch(approvedRedeemData); setApprovedRedeemData(null);
  };

  // --- Render Logic ---
  return (
    <div className="p-8">
      <div className="bg-white p-6 rounded shadow max-w-3xl mx-auto" key={workflowState}>
        {/* Header */}
        <div className="flex justify-between items-center mb-6 border-b pb-3"> <h1 className="text-2xl font-bold text-gray-800">Redeem / Swap Tokens</h1> <button className="px-3 py-1 rounded text-white hover:opacity-90 bg-gray-800 text-sm disabled:opacity-50" onClick={() => { if (workflowState === 'idle' || workflowState === 'rejected') onBack(); else { setWorkflowState('idle'); setApprovedRedeemData(null); } }} disabled={isLoading && workflowState !== 'idle'} > {workflowState === 'idle' || workflowState === 'rejected' ? 'Back to Treasury' : 'Cancel Request'} </button> </div>

         {/* Workflow Status Area */}
         {workflowState !== 'idle' && workflowState !== 'executing_contract' && ( <div className={`mb-6 p-4 border rounded-lg ${workflowState === 'rejected' ? 'bg-red-50 border-red-300' : 'bg-blue-50 border-blue-300'}`}> <h3 className={`text-lg font-semibold mb-2 ${workflowState === 'rejected' ? 'text-red-800' : 'text-blue-800'}`}>Request Status</h3> <p className={`mb-3 ${workflowState === 'rejected' ? 'text-red-700' : 'text-blue-700'}`}>{workflowMessage}</p> {isLoading && <p className="text-sm text-gray-500 italic mb-3">Processing...</p>} {/* Workflow Buttons */} {workflowState === 'pending_auth1' && !isLoading && ( <div className="flex space-x-3"> <button onClick={() => handleApproval(1)} className="px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm">Approve (Step 1)</button> <button onClick={() => handleReject(1)} className="px-4 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm">Reject (Step 1)</button> </div> )} {workflowState === 'pending_auth2' && !isLoading && ( <div className="flex space-x-3"> <button onClick={() => handleApproval(2)} className="px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm">Approve (Step 2)</button> <button onClick={() => handleReject(2)} className="px-4 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm">Reject (Step 2)</button> </div> )} {workflowState === 'rejected' && ( <p className="text-red-700 font-medium">Reason: {rejectReason}</p> )} {workflowState === 'approved' && !isLoading && ( <button onClick={handleProceedAfterApproval} className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 font-bold"> Proceed </button> )} </div> )}

        {/* Main Redeem Form */}
        {workflowState === 'idle' && ( <> <div className="bg-blue-50 border-l-4 border-blue-600 p-4 mb-6"> <div className="flex"> <div className="flex-shrink-0"> <svg className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor"> <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /> </svg> </div> <div className="ml-3"> <p className="text-sm text-blue-700"> <strong>Note:</strong> Redeem tokens for their underlying asset or swap for another token on the platform. Fees and rates apply. </p> </div> </div> </div>
            {/* Form */}
            <form onSubmit={handleInitiateRedemption}> <div className="space-y-4">
                {/* Token Selection - Uses updated filter */}
                 <div> <label htmlFor="redeemAssetSelect" className="block mb-1 font-medium text-gray-700">Token to Redeem / Swap From <span className="text-red-600">*</span></label> <select id="redeemAssetSelect" className="w-full p-2 border rounded bg-white disabled:bg-gray-100" value={selectedAssetId} onChange={(e) => { setSelectedAssetId(e.target.value); setAmountToRedeem(''); setTargetAssetId(''); }} required disabled={redeemableAssets.length === 0} > <option value="" disabled> {redeemableAssets.length === 0 ? '-- No Redeemable Assets --' : '-- Select an Asset --'} </option> {redeemableAssets.map(asset => ( <option key={asset.id} value={asset.id}> {asset.label} ({asset.symbol}) </option> ))} </select> {redeemableAssets.length === 0 && <p className="text-xs text-gray-500 mt-1">No assets available for redemption/swap.</p>} </div>
                {/* Current Balance */}
                {selectedAsset && ( <div className="bg-gray-100 p-3 rounded mb-2 text-sm"> <div className="flex justify-between"> <span>Your Balance:</span> <span className="font-medium">{formatNumber(selectedAsset.balance)} {selectedAsset.symbol}</span> </div> </div> )}
                {/* Redemption Mode Selection */}
                 <div className="pt-2"> <label className="block mb-2 font-medium text-gray-700">Operation Type <span className="text-red-600">*</span></label> <div className="flex space-x-4"> <label className="flex items-center cursor-pointer"> <input type="radio" name="redeemMode" value="underlying" checked={redemptionMode === 'underlying'} onChange={() => setRedemptionMode('underlying')} className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500"/> <span className="text-sm">Redeem for Underlying Asset</span> </label> <label className="flex items-center cursor-pointer"> <input type="radio" name="redeemMode" value="other_token" checked={redemptionMode === 'other_token'} onChange={() => setRedemptionMode('other_token')} className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500"/> <span className="text-sm">Swap for Another Platform Token</span> </label> </div> </div>
                 {/* Target Asset Selection (Conditional for Swap) - Uses updated filter */}
                {redemptionMode === 'other_token' && ( <> <div> <label htmlFor="targetAssetSelect" className="block mb-1 font-medium text-gray-700">Swap To (Target Asset) <span className="text-red-600">*</span></label> <select id="targetAssetSelect" className="w-full p-2 border rounded bg-white disabled:bg-gray-100" value={targetAssetId} onChange={(e) => setTargetAssetId(e.target.value)} required={redemptionMode === 'other_token'} disabled={targetableAssets.length === 0} > <option value="" disabled> {targetableAssets.length === 0 ? '-- No other assets available --' : '-- Select Target Asset --'} </option> {targetableAssets.map(asset => ( <option key={asset.id} value={asset.id}>{asset.label} ({asset.symbol})</option> ))} </select> {/* Rate Display/Error */} {selectedAsset && targetAsset && exchangeRate === null && (<p className="text-xs text-red-600 mt-1">No derivable rate found for {selectedAsset.symbol} -&gt; {targetAsset.symbol}. Swap unavailable.</p>)} {selectedAsset && targetAsset && exchangeRate !== null && (<p className="text-xs text-gray-500 mt-1">Rate: 1 {selectedAsset.symbol} ≈ {exchangeRate.toFixed(4)} {targetAsset.symbol} (Est.)</p>)} </div> {/* Institutional Seller Name Input */} <div> <label htmlFor="institutionalSellerName" className="block mb-1 font-medium text-gray-700">Institutional Seller Name <span className="text-red-600">*</span></label> <input id="institutionalSellerName" type="text" className="w-full p-2 border rounded" placeholder="Enter seller name" value={institutionalSellerName} onChange={(e) => setInstitutionalSellerName(e.target.value)} required={redemptionMode === 'other_token'} /> </div> </> )}
                {/* Amount to Redeem/Swap */}
                <div> <label htmlFor="redeemAmount" className="block mb-1 font-medium text-gray-700">Amount of {selectedAsset?.symbol || 'Token'} to {redemptionMode === 'other_token' ? 'Swap' : 'Redeem'} <span className="text-red-600">*</span></label> <input id="redeemAmount" type="number" className="w-full p-2 border rounded disabled:bg-gray-100" placeholder="Enter amount" value={amountToRedeem} onChange={(e) => setAmountToRedeem(e.target.value)} min="0.000001" step="any" required disabled={!selectedAssetId}/> {selectedAsset && amountNumber > selectedAsset.balance && ( <p className="text-xs text-red-600 mt-1">Amount exceeds current balance!</p> )} </div>
                {/* Redemption Preview */}
                {preview.show && ( <div className="bg-gray-50 p-4 rounded border border-gray-200"> <h3 className="font-medium mb-2">Operation Preview (Estimated)</h3> {preview.error ? (<p className="text-sm text-red-600">{preview.error}</p>) : ( <div className="space-y-2 text-sm"> <div className="flex justify-between"> <span>Amount to {redemptionMode === 'other_token' ? 'Swap' : 'Redeem'}:</span> <span>{formatNumber(preview.redeemAmount)} {preview.redeemSymbol}</span> </div> {preview.mode === 'underlying' && (<> <div className="flex justify-between"> <span>Est. Redemption Fee ({formatNumber(preview.fee)} {preview.redeemSymbol}):</span> <span>Fee Applied</span> </div> </>)} {preview.mode === 'other_token' && (<div className="flex justify-between"> <span>Exchange Rate Used:</span> <span>{preview.rate}</span> </div> )} <div className="border-t border-gray-200 my-2 pt-2 flex justify-between font-medium"> <span>You Will Receive Approx:</span> <span>{preview.received.toLocaleString(undefined, {maximumFractionDigits: 4})} {preview.receivedSymbol}</span> </div> <div className="flex justify-between text-xs text-gray-500"> <span>Estimated Settlement Time:</span> <span>{preview.settlement}</span> </div> </div> )} </div> )}
                {/* Receiving Account Details */}
                <div> <label htmlFor="receivingAccount" className="block mb-1 font-medium text-gray-700">Institutional Buyer Wallet / Receiving Account <span className="text-red-600">*</span></label> <input id="receivingAccount" type="text" className="w-full p-2 border rounded" placeholder={redemptionMode === 'underlying' ? 'e.g., Bank account # or wallet address' : 'Platform account/address for target token'} value={receivingAccount} onChange={(e) => setReceivingAccount(e.target.value)} required /> </div>
                {/* Institutional Buyer Name Input */}
                <div> <label htmlFor="institutionalBuyerName" className="block mb-1 font-medium text-gray-700">Institutional Buyer Name <span className="text-red-600">*</span></label> <input id="institutionalBuyerName" type="text" className="w-full p-2 border rounded" placeholder="Enter buyer name" value={institutionalBuyerName} onChange={(e) => setInstitutionalBuyerName(e.target.value)} required /> </div>
                {/* Redemption Purpose */}
                <div> <label htmlFor="redemptionPurpose" className="block mb-1 font-medium text-gray-700">Purpose <span className="text-red-600">*</span></label> <select id="redemptionPurpose" className="w-full p-2 border rounded bg-white" value={redemptionPurpose} onChange={(e) => setRedemptionPurpose(e.target.value)} required > <option value="" disabled>-- Select a purpose --</option> <option value="Withdrawal">Customer Withdrawal</option> <option value="Treasury">Treasury Management</option> <option value="Liquidity">Liquidity Adjustment</option> <option value="Settlement">Settlement with Counterparty</option> <option value="Swap">Platform Swap</option> <option value="Other">Other (Specify in Notes)</option> </select> </div>
                {/* Notes */}
                <div> <label htmlFor="redeemNotes" className="block mb-1 font-medium text-gray-700">Notes</label> <textarea id="redeemNotes" className="w-full p-2 border rounded" rows="2" placeholder="Additional details (optional)" value={redeemNotes} onChange={(e) => setRedeemNotes(e.target.value)} ></textarea> </div>
                 {/* Smart Contract Checkbox */}
                <div className="flex items-start pt-2"> <input type="checkbox" id="useSmartContract" className="mr-2 mt-1 flex-shrink-0 h-4 w-4 text-blue-600 focus:ring-blue-500" checked={useSmartContract} onChange={(e) => setUseSmartContract(e.target.checked)} /> <label htmlFor="useSmartContract" className="text-sm text-gray-600"> Use Smart Contract for Verification/Execution (Simulated) </label> </div>
                {/* Terms Acknowledgment */}
                <div className="flex items-start pt-2"> <input type="checkbox" id="terms" className="mr-2 mt-1 flex-shrink-0 h-4 w-4 text-blue-600 focus:ring-blue-500" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} required/> <label htmlFor="terms" className="text-sm text-gray-600"> I acknowledge that rates are indicative, fees may apply, and redemption/swap is subject to compliance checks. <span className="text-red-600">*</span></label> </div>
                {/* Submit Button */}
                <div className="mt-6 flex space-x-3"> <button type="submit" className="px-4 py-2 rounded text-white hover:opacity-90 bg-blue-600 disabled:opacity-50" disabled={ !selectedAssetId || amountNumber <= 0 || (selectedAsset && amountNumber > selectedAsset.balance) || (redemptionMode === 'other_token' && (!targetAssetId || exchangeRate === null)) || !receivingAccount || !redemptionPurpose || !termsAccepted || !institutionalBuyerName.trim() || (redemptionMode === 'other_token' && !institutionalSellerName.trim()) || isLoading } > Submit Request </button> <button type="button" className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-50" onClick={onBack} > Cancel </button> </div>
            </div> </form> </> )}

        {/* Smart Contract Execution Simulation Screen */}
        {workflowState === 'executing_contract' && approvedRedeemData && ( <SmartContractExecutionView data={approvedRedeemData} sourceAsset={assets.find(a => a.id === (approvedRedeemData.mode === 'cross_token' ? approvedRedeemData.sourceAssetId : approvedRedeemData.assetId))} targetAsset={assets.find(a => a.id === approvedRedeemData.targetAssetId)} onFinish={handleFinishContractExecution} onCancel={() => { setWorkflowState('idle'); setApprovedRedeemData(null); }} /> )}

      </div> {/* Closes main content card div */}
    </div> /* Closes outer padding div */
  );
};

export default RedeemTokenScreen;
