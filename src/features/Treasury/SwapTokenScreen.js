import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAssets } from '../../context/AssetsContext';
import { useTokenHistory } from '../../context/TokenHistoryContext';
import { formatNumber, getStatusClass } from '../../utils/displayUtils';

// Constants
const currentUserInitials = 'SWP';
const approverInitials = 'SA';

// Asset ID Lists - Assuming these accurately represent Treasury assets
const treasuryAssetIds = ['usdc', 'usdt', 't-bond', 'e-cedi', 'd-euro', 'inst-usd-primary', 'inst-eur-primary', 'eth-warm', 'matic-hot']; // Added fiat/other treasury for completeness
const specificTokenMgmtIds = [ // Renamed for clarity
    'cp-acme-01', 'mmf-usd-01', 'xagc-01', 'oil-wti-01', 'cc-verra-01',
];

// Rate Maps
const fiatToUsdApprox = { 'USD': 1.00, 'EUR': 1.09, 'GHS': 0.07, 'CAD': 0.75, 'GBP': 1.25, 'SGD': 0.74, 'JPY': 0.0067 };
const ratesToUSD = {
    'USD': 1, 'EUR': 1.10, 'GBP': 1.25, 'CAD': 0.74, 'AUD': 0.66, 'SGD': 0.74, 'JPY': 0.0067, 'CHF': 1.11, 'GHS': 0.067,
    'USDC': 1, 'USDT': 1, 'T-BOND': 998.50, 'eGH': 0.067, 'D-EUR': 1.10,
    'ACP': 0.998, 'MMFUSD': 1.00, 'XAGC': 30.50, 'WTOIL': 80.15, 'VCC': 15.75,
    'T-GOLD': 2350, 'INR': 0.012, 'ETH': 3500.00, 'MATIC': 0.95, 'BTC': 65000.00, 'AAVE': 110.00,
 };

// Hardcoded Wallet Options
const hardcodedBuyerWallets = [
    { value: '0xFireblocksCustodyA1...7b3e', label: 'Fireblocks Custody A (0x...7b3e)' },
    { value: '0xCoinbasePrimeB2...f8a9', label: 'Coinbase Prime B (0x...f8a9)' },
    { value: '0xAnchorageDigitalC3...c1d0', label: 'Anchorage Digital C (0x...c1d0)' },
    { value: '0xFidelityDigitalAssetsD4...9e4f', label: 'Fidelity Digital Assets D (0x...9e4f)' },
    { value: '0xCopperCoCustodyE5...a5b6', label: 'Copper.co Custody E (0x...a5b6)' },
    { value: '0xGalaxyDigitalTradingF6...d8c7', label: 'Galaxy Digital Trading F (0x...d8c7)' },
    { value: '0xKrakenInstitutionalG7...b3e2', label: 'Kraken Institutional G (0x...b3e2)' },
];

// Helper function - Refined to clearly define platform-issued finite assets
const isPlatformIssuedFinite = (asset) => {
    if (!asset) return false;
    // Check if it's wizard issued AND finite, OR if it's in the specific managed list AND finite
    return (
        asset.supply === 'Finite' &&
        (asset.isWizardIssued === true || specificTokenMgmtIds.includes(asset.id))
    );
};
// Helper function to identify Treasury assets based on our list
const isTreasuryAsset = (asset) => {
    if (!asset) return false;
    return treasuryAssetIds.includes(asset.id);
};


// --- Smart Contract Simulation View (Internal Component) ---
const SmartContractExecutionView = ({ data, sourceAsset, targetAsset, onFinish, onCancel }) => {
    const [step, setStep] = useState(0);
    const [message, setMessage] = useState('Initializing smart contract interaction...');
    useEffect(() => {
        let timerId = null;
        if (step === 0) { setMessage('Initializing smart contract interaction...'); timerId = setTimeout(() => setStep(1), 1000); }
        else if (step === 1) { setMessage(`Validating balances & permissions for ${sourceAsset?.symbol || 'token'} -> ${targetAsset?.symbol || 'token'}...`); timerId = setTimeout(() => setStep(2), 1500); }
        else if (step === 2) { setMessage(`Executing swap via contract...`); timerId = setTimeout(() => setStep(3), 2000); }
        else if (step === 3) { setMessage(`Confirming transaction settlement...`); timerId = setTimeout(() => setStep(4), 1500); }
        else if (step === 4) { setMessage(`Execution successful! Assets swapped via contract.`); }
        return () => { if (timerId) clearTimeout(timerId); };
    }, [step, sourceAsset?.symbol, targetAsset?.symbol]);
    const getStepClass = (currentStepMarker) => {
        if (step >= currentStepMarker + 1) return 'bg-green-500';
        if (step === currentStepMarker) return 'bg-blue-500 animate-pulse';
        return 'bg-gray-300';
    };
    const receivingWalletLabel = hardcodedBuyerWallets.find(w => w.value === data.receivingAccount)?.label || data.receivingAccount || 'N/A';
    return (
        <div className="p-6 border rounded-lg bg-gray-50 animate-fade-in">
            <h3 className="text-xl font-semibold mb-4 text-center text-gray-800">Executing Swap via Smart Contract</h3>
            <div className="mb-6 p-4 border rounded bg-white text-sm space-y-1 shadow-sm">
                 <p><strong>Action:</strong> Swap</p>
                 <p><strong>From:</strong> {sourceAsset?.label || 'N/A'} ({sourceAsset?.symbol || 'N/A'})</p>
                 <p><strong>Amount:</strong> {data.amount?.toLocaleString()} {sourceAsset?.symbol || ''}</p>
                 <p><strong>To:</strong> {targetAsset?.label || 'N/A'} ({targetAsset?.symbol || 'N/A'})</p>
                 <p><strong>Est. Received:</strong> ~{data.targetAmount?.toLocaleString(undefined, { maximumFractionDigits: 4 })} {targetAsset?.symbol || ''}</p>
                 <p><strong>Counterparty/Seller:</strong> {data.institutionalSellerName || 'N/A'}</p>
                 <p><strong>Receiving Wallet:</strong> {receivingWalletLabel}</p>
             </div>
             <div className="mb-6 space-y-3">
                 <div className="flex items-center"><div className={`w-5 h-5 rounded-full mr-3 ${getStepClass(1)} transition-colors duration-500`}></div><span className={`${step >= 1 ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>Validating Balances & Permissions</span></div>
                 <div className="flex items-center"><div className={`w-5 h-5 rounded-full mr-3 ${getStepClass(2)} transition-colors duration-500`}></div><span className={`${step >= 2 ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>Executing Swap</span></div>
                 <div className="flex items-center"><div className={`w-5 h-5 rounded-full mr-3 ${getStepClass(3)} transition-colors duration-500`}></div><span className={`${step >= 3 ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>Confirming Settlement</span></div>
             </div>
             <div className="mb-6 text-center font-medium min-h-[2em]">
                 {step === 4 ? ( <p className="text-green-600 animate-pulse">{message}</p> ) : ( <p className="text-blue-600">{message}</p> )}
             </div>
             <div className="flex justify-center space-x-4 mt-6">
                 {step === 4 ? ( <button onClick={onFinish} className="px-6 py-2 rounded text-white bg-green-600 hover:bg-green-700 font-semibold animate-fade-in">Finish</button> ) : ( step < 4 && <button onClick={onCancel} className="px-4 py-2 rounded text-sm border border-gray-300 hover:bg-gray-100">Cancel Simulation</button> )}
             </div>
         </div>
     );
};


// --- Main SwapTokenScreen Component ---
const SwapTokenScreen = ({ onBack }) => {

  // Hooks and State Declarations
  const { assets, dispatchAssets } = useAssets();
  const { dispatchTokenHistory } = useTokenHistory();
  const [sourceAssetId, setSourceAssetId] = useState('');
  const [targetAssetId, setTargetAssetId] = useState('');
  const [amountToSwap, setAmountToSwap] = useState('');
  const [receivingAccount, setReceivingAccount] = useState('');
  const [swapPurpose, setSwapPurpose] = useState('');
  const [swapNotes, setSwapNotes] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [institutionalSellerName, setInstitutionalSellerName] = useState('');
  const [useSmartContract, setUseSmartContract] = useState(false);
  const [approvedSwapData, setApprovedSwapData] = useState(null);
  const [workflowState, setWorkflowState] = useState('idle');
  const [workflowMessage, setWorkflowMessage] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState('');

  // --- Memoized calculations ---
  const swappableAssets = useMemo(() => {
      if (!assets || !Array.isArray(assets)) { return []; }
      return assets.filter(asset =>
          asset && (isPlatformIssuedFinite(asset) || isTreasuryAsset(asset))
      );
  }, [assets]);

  const sourceAsset = useMemo(() =>
      swappableAssets?.find(asset => asset?.id === sourceAssetId),
      [swappableAssets, sourceAssetId]
  );

  const availableSourceBalance = useMemo(() => {
      if (!sourceAsset) return 0;
      if (isPlatformIssuedFinite(sourceAsset)) {
          const reserve = Math.max(0, (sourceAsset.totalSupplyIssued || 0) - (sourceAsset.balance || 0));
          return reserve;
      }
      return sourceAsset.balance || 0;
  }, [sourceAsset]);

  const availableBalanceLabel = useMemo(() => {
      if (!sourceAsset) return "Available Balance:";
      if (isPlatformIssuedFinite(sourceAsset)) {
          return "Available Reserve Balance:";
      }
      return "Available Balance:";
   }, [sourceAsset]);

  const targetableAssets = useMemo(() => {
      if (!sourceAssetId) return [];
      return swappableAssets?.filter(asset => asset?.id !== sourceAssetId) ?? [];
  }, [swappableAssets, sourceAssetId]);

  const targetAsset = useMemo(() =>
      swappableAssets?.find(asset => asset?.id === targetAssetId),
      [swappableAssets, targetAssetId]
  );

  const amountNumber = useMemo(() => parseFloat(amountToSwap) || 0, [amountToSwap]);

  const getExchangeRate = useCallback((source, target) => {
        if (!source || !target || source.id === target.id) return null;
        const getUsdValue = (asset) => {
            if (!asset) return null;
            if (typeof asset.price === 'number' && asset.price >= 0) { return asset.price; }
            if (asset.isWizardIssued) {
                const pvd = asset.wizardData?.parsedValueDefinition;
                if (pvd && typeof pvd.value === 'number' && pvd.value >= 0 && pvd.currency) {
                    const fxRate = fiatToUsdApprox[pvd.currency];
                    if (fxRate !== undefined) { return pvd.value * fxRate; }
                    else { console.warn(`SwapScreen: No FX rate for PVD currency ${pvd.currency}`); return null; }
                } else { console.warn(`SwapScreen: Invalid PVD for wizard asset ${asset.symbol}`); }
            }
            const rate = ratesToUSD[asset.symbol];
            if (rate !== undefined) { return rate; }
            console.warn(`SwapScreen: Could not determine USD value for ${asset.symbol}`); return null;
        };
        const sourceValueInUsd = getUsdValue(source); const targetValueInUsd = getUsdValue(target);
        if (sourceValueInUsd !== null && targetValueInUsd !== null && targetValueInUsd > 0) { return sourceValueInUsd / targetValueInUsd; }
        console.warn(`Could not derive rate for ${source?.symbol} -> ${target?.symbol}`); return null;
    }, []);

  const exchangeRate = useMemo(() => getExchangeRate(sourceAsset, targetAsset), [sourceAsset, targetAsset, getExchangeRate]);

  // Calculate preview data, including potential validation error message
  const previewData = useMemo(() => {
      if (!sourceAsset || !targetAsset || amountNumber <= 0 || exchangeRate === null) {
           return { show: false, error: '' }; // Return empty error
      }
      const receivedAmount = amountNumber * exchangeRate;
      let currentValidationError = '';

      // Validation Check
      if (isTreasuryAsset(sourceAsset) && isPlatformIssuedFinite(targetAsset)) {
          const targetCirculation = targetAsset.balance || 0;
          if (receivedAmount > targetCirculation) {
              currentValidationError = `Amount to receive (${receivedAmount.toLocaleString(undefined, {maximumFractionDigits: 4})} ${targetAsset.symbol}) exceeds available circulation (${targetCirculation.toLocaleString()} ${targetAsset.symbol}).`;
          }
      }

      const sourceValueUsdForFee = ratesToUSD[sourceAsset.symbol] ?? (typeof sourceAsset.price === 'number' ? sourceAsset.price : 0);
      const feeValue = sourceValueUsdForFee * amountNumber * 0.001;

      return {
          show: true,
          mode: 'cross_token',
          swapAmount: amountNumber,
          swapSymbol: sourceAsset.symbol,
          rateDisplay: `1 ${sourceAsset.symbol} ≈ ${exchangeRate.toFixed(6)} ${targetAsset.symbol}`,
          received: receivedAmount,
          receivedSymbol: targetAsset.symbol,
          settlement: 'Near Instant (Platform Swap)',
          feeDisplay: { value: feeValue, currency: 'USD' },
          error: currentValidationError // Return validation error in the object
      };
  }, [sourceAsset, targetAsset, amountNumber, exchangeRate, targetAsset?.balance]);

  // Effect to update the validationError state based on the calculated previewData
  useEffect(() => {
      if (previewData.error !== validationError) {
           setValidationError(previewData.error || '');
      }
  }, [previewData.error, validationError]);


  // --- Effects --- (Lifecycle effects for cleaning up state)
  useEffect(() => {
      // Reset target-dependent state when source changes
      setTargetAssetId('');
      setAmountToSwap('');
      setApprovedSwapData(null);
      // validationError is handled by previewData effect
  }, [sourceAssetId]);

  useEffect(() => {
       // Reset amount-dependent state when target changes
      setAmountToSwap('');
      setApprovedSwapData(null);
      // validationError is handled by previewData effect
  }, [targetAssetId]);

  useEffect(() => {
      // Update workflow message based on state, clear loading/rejection details
      setIsLoading(false);
      // Don't clear validationError here, it's driven by previewData
      if (workflowState === 'pending_auth1') { setWorkflowMessage('Swap request submitted. Pending First Factor Authentication/Approval.'); }
      else if (workflowState === 'pending_auth2') { setWorkflowMessage('First Factor OK. Pending Second Factor Authentication/Approval.'); }
      else if (workflowState === 'approved') { setWorkflowMessage('Swap request fully approved. Ready to execute.'); }
      else if (workflowState === 'rejected') { setWorkflowMessage('Swap request rejected.'); }
      else if (workflowState === 'executing_contract') { setWorkflowMessage(''); } // Contract view shows progress
      else { setWorkflowMessage(''); setRejectReason(''); setApprovedSwapData(null); } // Idle state
  }, [workflowState]);


  // --- Event Handlers ---
  const handleInitiateSwap = (event) => {
      event.preventDefault();
      // Check basic form requirements first
      if (!sourceAsset || !targetAsset || isNaN(amountNumber) || amountNumber <= 0 || amountNumber > availableSourceBalance || exchangeRate === null || !institutionalSellerName.trim() || !receivingAccount || !swapPurpose || !termsAccepted) {
          alert("Please ensure all required fields are filled correctly, a valid target asset and amount (within available balance/reserve) are entered, terms are accepted, and an exchange rate is available.");
          return;
      }
      // Check specific validation error state (updated by useEffect)
      if (validationError) {
          alert(`Cannot proceed: ${validationError}`);
          return;
      }
      // Reset previous rejection reason if any, and proceed
      setRejectReason('');
      setWorkflowState('pending_auth1');
  };

  const handleApproval = (step) => {
      if (isLoading) return;
      setIsLoading(true);
      setWorkflowMessage(`Processing Step ${step} approval...`);
      setTimeout(() => {
          if (step === 1) { setWorkflowState('pending_auth2'); }
          else if (step === 2) { setWorkflowState('approved'); }
      }, 1500);
  };

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

  // Handles dispatching actions to contexts based on swap type
  const executeSwapDispatch = (data) => {
      setIsLoading(true); setWorkflowMessage('Processing swap...');
      try {
          // Validate necessary data
          if (!assets || !Array.isArray(assets)) throw new Error("Assets data is not available.");
          const sourceAssetLog = assets.find(a => a.id === data.sourceAssetId);
          const targetAssetLog = assets.find(a => a.id === data.targetAssetId);
          if (!sourceAssetLog || !targetAssetLog) throw new Error("Could not find source or target asset.");
          if (data.targetAmount === undefined || data.targetAmount === null || isNaN(data.targetAmount)) throw new Error("Calculated target amount is invalid.");

          // Determine swap type characteristics
          const isSourceTreasury = isTreasuryAsset(sourceAssetLog);
          const isTargetPlatformFinite = isPlatformIssuedFinite(targetAssetLog);
          const isSourcePlatformFinite = isPlatformIssuedFinite(sourceAssetLog);

          // Initialize details for history logging
          let historyActionType = 'Swap';
          let sourceDetail = '(from Circulation)';
          let targetDetail = '(to Circulation)';
          let assetForHistory = sourceAssetLog; // Default to logging against source

          // --- Dispatch logic based on swap type ---

          // Case 1: Treasury Asset -> Platform-Issued Finite Token (T->R)
          if (isSourceTreasury && isTargetPlatformFinite) {
              console.log(`Dispatching Treasury -> Platform Token Swap: ${sourceAssetLog.symbol} -> ${targetAssetLog.symbol}`);
              historyActionType = 'Swap T->R';
              sourceDetail = '(from Treasury)';
              targetDetail = '(to Reserve)';
              assetForHistory = targetAssetLog; // Log against TARGET asset

              dispatchAssets({ type: 'UPDATE_ASSET_BALANCE', payload: { assetId: data.sourceAssetId, changeAmount: -data.amount } });
              dispatchAssets({ type: 'DECREASE_CIRCULATION', payload: { assetId: data.targetAssetId, amountToDecrease: data.targetAmount } });
          }
          // Case 2: Platform-Issued Finite Token -> Any Other Asset (R->C)
          else if (isSourcePlatformFinite) {
              console.log(`Dispatching Platform Token (Reserve) -> Other Swap: ${sourceAssetLog.symbol} -> ${targetAssetLog.symbol}`);
              historyActionType = 'Swap R->C';
              sourceDetail = '(from Reserve)';
              targetDetail = '(to Circulation)';
              assetForHistory = sourceAssetLog; // Log against SOURCE asset

              dispatchAssets({ type: 'UPDATE_ASSET_BALANCE', payload: { assetId: data.sourceAssetId, changeAmount: data.amount } }); // Increase source circulation
              dispatchAssets({ type: 'UPDATE_ASSET_BALANCE', payload: { assetId: data.targetAssetId, changeAmount: data.targetAmount } }); // Increase target circulation
          }
           // Case 3: Default/Other (e.g., Treasury -> Treasury)
          else {
               console.log(`Dispatching Standard Swap: ${sourceAssetLog.symbol} -> ${targetAssetLog.symbol}`);
               historyActionType = 'Swap';
               sourceDetail = '(from Circulation)';
               targetDetail = '(to Circulation)';
               assetForHistory = sourceAssetLog; // Default: Log against source

               dispatchAssets({ type: 'UPDATE_ASSET_BALANCE', payload: { assetId: data.sourceAssetId, changeAmount: -data.amount } });
               dispatchAssets({ type: 'UPDATE_ASSET_BALANCE', payload: { assetId: data.targetAssetId, changeAmount: data.targetAmount } });
           }

          // Construct Log Details String
          const receivingWalletLabel = hardcodedBuyerWallets.find(w => w.value === data.receivingAccount)?.label || data.receivingAccount;
          let logDetails = `Swapped ${formatNumber(data.amount)} ${sourceAssetLog.symbol} ${sourceDetail} for ~${data.targetAmount.toLocaleString(undefined, {maximumFractionDigits: 4})} ${targetAssetLog.symbol} ${targetDetail}`;
          if (data.purpose) logDetails += ` (Purpose: ${data.purpose})`;
          if (data.receivingAccount) logDetails += ` (To Wallet: ${receivingWalletLabel})`;
          if (data.institutionalSellerName) logDetails += ` (Seller: ${data.institutionalSellerName})`;
          if (data.useSmartContract) logDetails += ` (Via Contract)`;

          // Create and Dispatch History Entry
          const historyEntry = {
              id: Date.now() + Math.random(),
              timestamp: new Date(),
              actionType: historyActionType,
              details: logDetails,
              user: currentUserInitials,
              approver: approverInitials,
              assetId: assetForHistory.id,
              assetSymbol: assetForHistory.symbol,
              assetName: assetForHistory.label,
              notes: `${data.notes || ''}${data.useSmartContract ? ' (Smart Contract Execution)' : ''}`
          };
          console.log('Dispatching history entry:', historyEntry);
          dispatchTokenHistory({ type: 'ADD_TOKEN_HISTORY', payload: historyEntry });

          // Finish up
          alert(`Swap processed successfully!`);
          onBack(); // Navigate back after successful swap

      } catch (error) {
          // Error Handling
          console.error("Error processing swap:", error);
          alert(`An error occurred while processing the swap: ${error.message}`);
          setIsLoading(false);
          setWorkflowState('idle');
          setWorkflowMessage('Error during final processing. Please review details or cancel.');
      }
  };

  // Handles the final confirmation step after approval, deciding execution path
  const handleProceedAfterApproval = () => {
      if (isLoading || workflowState !== 'approved') return;
      // Double-check validation state before proceeding
      if (validationError) {
           alert(`Error: Cannot proceed with swap. Validation failed: ${validationError}`);
           setWorkflowState('idle'); // Reset workflow if validation fails at this stage
           return;
      }
      // Ensure rate/preview are still valid (should be, but safety check)
      if (exchangeRate === null || !previewData || previewData.received === undefined) {
           alert("Error: Cannot proceed with swap, rate or received amount is unavailable.");
           setWorkflowState('idle');
           return;
      }

      // Prepare data for execution
      const swapData = {
          mode: 'cross_token',
          amount: amountNumber,
          receivingAccount: receivingAccount,
          purpose: swapPurpose,
          notes: swapNotes,
          institutionalSellerName: institutionalSellerName,
          useSmartContract: useSmartContract,
          sourceAssetId: sourceAssetId,
          targetAssetId: targetAssetId,
          rate: exchangeRate,
          targetAmount: previewData.received, // Use calculated received amount
      };

      // Decide execution path
      if (useSmartContract) {
          setApprovedSwapData(swapData);
          setWorkflowState('executing_contract');
      } else {
          // Execute directly if not using smart contract sim
           let confirmMsg = `Confirm swap: ${formatNumber(amountNumber)} ${sourceAsset?.symbol} for ~${previewData.received.toLocaleString(undefined, {maximumFractionDigits: 4})} ${targetAsset?.symbol}?`;
           if (window.confirm(confirmMsg)) {
               executeSwapDispatch(swapData);
           } else {
               console.log("Final swap cancelled by user.");
               // Optional: Reset workflow or keep in approved state? Resetting seems safer.
               // setWorkflowState('idle');
           }
      }
  };

  // Called when the smart contract simulation finishes
  const handleFinishContractExecution = () => {
      if (!approvedSwapData) {
          console.error("Error: Missing approved data for contract execution completion.");
          alert("An error occurred finishing the process.");
          setWorkflowState('idle');
          return;
      }
      executeSwapDispatch(approvedSwapData);
      setApprovedSwapData(null); // Clean up approved data
  };


  // --- Render Logic ---
  return (
    <div className="p-8">
       <div className="bg-white p-6 rounded shadow max-w-3xl mx-auto" key={workflowState}>
           {/* Header */}
           <div className="flex justify-between items-center mb-6 border-b pb-3">
               <h1 className="text-2xl font-bold text-gray-800">Swap Tokens</h1>
               <button
                  className="px-3 py-1 rounded text-white hover:opacity-90 bg-gray-800 text-sm disabled:opacity-50"
                  onClick={() => {
                      // Allow cancelling unless loading or executing contract
                      if (workflowState === 'idle' || workflowState === 'rejected') {
                          onBack();
                      } else if (workflowState !== 'executing_contract') {
                          if (window.confirm("Are you sure you want to cancel this swap request?")) {
                              setWorkflowState('idle');
                              setApprovedSwapData(null);
                          }
                      }
                  }}
                  disabled={isLoading && workflowState !== 'idle'}
               >
                  {workflowState === 'idle' || workflowState === 'rejected' ? 'Back to Treasury' : 'Cancel Request'}
               </button>
           </div>

           {/* Workflow Status Display */}
           {workflowState !== 'idle' && workflowState !== 'executing_contract' && (
             <div className={`mb-6 p-4 border rounded-lg ${workflowState === 'rejected' ? 'bg-red-50 border-red-300' : 'bg-blue-50 border-blue-300'}`}>
                 <h3 className={`text-lg font-semibold mb-2 ${workflowState === 'rejected' ? 'text-red-800' : 'text-blue-800'}`}>Request Status</h3>
                 <p className={`mb-3 ${workflowState === 'rejected' ? 'text-red-700' : 'text-blue-700'}`}>{workflowMessage}</p>
                 {isLoading && <p className="text-sm text-gray-500 italic mb-3">Processing...</p>}
                 {workflowState === 'pending_auth1' && !isLoading && (
                    <div className="flex space-x-3">
                        <button onClick={() => handleApproval(1)} className="px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm">Approve (Step 1)</button>
                        <button onClick={() => handleReject(1)} className="px-4 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm">Reject (Step 1)</button>
                    </div>
                 )}
                 {workflowState === 'pending_auth2' && !isLoading && (
                     <div className="flex space-x-3">
                         <button onClick={() => handleApproval(2)} className="px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm">Approve (Step 2)</button>
                         <button onClick={() => handleReject(2)} className="px-4 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm">Reject (Step 2)</button>
                     </div>
                 )}
                 {workflowState === 'rejected' && (
                    <p className="text-red-700 font-medium">Reason: {rejectReason}</p>
                 )}
                 {workflowState === 'approved' && !isLoading && (
                     <button onClick={handleProceedAfterApproval} className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 font-bold">
                         Proceed with Swap
                     </button>
                 )}
              </div>
           )}

           {/* Idle State Form */}
           {workflowState === 'idle' && (
             <>
               <div className="bg-purple-50 border-l-4 border-purple-600 p-4 mb-6">
                  <div className="flex">
                     <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-purple-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                           <path fillRule="evenodd" d="M10 3a.75.75 0 01.75.75v.008l.004 4.494 4.146-4.147a.75.75 0 111.06 1.061l-4.147 4.147 4.494.004A.75.75 0 0117 10a.75.75 0 01-.75.75h-.008l-4.494-.004 4.147 4.147a.75.75 0 11-1.061 1.06l-4.147-4.146-.004 4.494A.75.75 0 0110 17a.75.75 0 01-.75-.75v-.008l-.004-4.494-4.146 4.147a.75.75 0 11-1.06-1.061l4.147-4.147-4.494-.004A.75.75 0 013 10a.75.75 0 01.75-.75h.008l4.494.004-4.147-4.147a.75.75 0 111.061-1.06l4.147 4.146.004-4.494A.75.75 0 0110 3z" clipRule="evenodd" />
                        </svg>
                     </div>
                     <div className="ml-3">
                        <p className="text-sm text-purple-700">
                           <strong>Note:</strong> Use this screen to swap Treasury assets (e.g., USDC) for platform-issued tokens (moving them to reserve), or swap platform-issued tokens (from reserve) for Treasury assets (moving them to circulation). Rates are indicative.
                        </p>
                     </div>
                  </div>
               </div>
               <form onSubmit={handleInitiateSwap}>
                 <div className="space-y-4">
                   {/* Source Asset Selection */}
                   <div>
                      <label htmlFor="sourceAssetSelect" className="block mb-1 font-medium text-gray-700">Swap From <span className="text-red-600">*</span></label>
                      <select id="sourceAssetSelect" className="w-full p-2 border rounded bg-white disabled:bg-gray-100" value={sourceAssetId} onChange={(e) => setSourceAssetId(e.target.value)} required disabled={swappableAssets.length === 0}>
                         <option value="" disabled>
                            {swappableAssets.length === 0 ? '-- No Swappable Assets --' : '-- Select Asset to Swap From --'}
                         </option>
                         {swappableAssets.map(asset => (
                            <option key={asset.id} value={asset.id}>
                               {asset.label} ({asset.symbol})
                            </option>
                         ))}
                      </select>
                   </div>
                   {/* Available Balance Display */}
                   {sourceAsset && (
                     <div className="bg-gray-100 p-3 rounded text-sm">
                        <div className="flex justify-between">
                           <span>{availableBalanceLabel}</span>
                           <span className="font-medium">{formatNumber(availableSourceBalance)} {sourceAsset.symbol}</span>
                        </div>
                     </div>
                    )}
                    {/* Target Asset Selection */}
                   <div>
                      <label htmlFor="targetAssetSelect" className="block mb-1 font-medium text-gray-700">Swap To <span className="text-red-600">*</span></label>
                      <select id="targetAssetSelect" className="w-full p-2 border rounded bg-white disabled:bg-gray-100" value={targetAssetId} onChange={(e) => setTargetAssetId(e.target.value)} required disabled={!sourceAssetId || targetableAssets.length === 0}>
                         <option value="" disabled>
                            {!sourceAssetId ? '-- Select Source Asset First --' : targetableAssets.length === 0 ? '-- No Other Assets Available --' : '-- Select Asset to Swap To --'}
                         </option>
                         {targetableAssets.map(asset => (
                            <option key={asset.id} value={asset.id}>
                               {asset.label} ({asset.symbol})
                            </option>
                         ))}
                      </select>
                      {sourceAsset && targetAsset && exchangeRate === null && (
                        <p className="text-xs text-red-600 mt-1">Could not determine exchange rate. Swap unavailable.</p>
                      )}
                      {sourceAsset && targetAsset && exchangeRate !== null && (
                         <p className="text-xs text-gray-500 mt-1">Indicative Rate: 1 {sourceAsset.symbol} ≈ {exchangeRate.toFixed(6)} {targetAsset.symbol}</p>
                      )}
                   </div>
                   {/* Amount Input */}
                   <div>
                        <label htmlFor="swapAmount" className="block mb-1 font-medium text-gray-700">Amount of {sourceAsset?.symbol || 'Token'} to Swap <span className="text-red-600">*</span></label>
                        <input
                           id="swapAmount"
                           type="number"
                           className="w-full p-2 border rounded disabled:bg-gray-100"
                           placeholder="Enter amount"
                           value={amountToSwap}
                           onChange={(e) => setAmountToSwap(e.target.value)}
                           min="0.000001"
                           step="any"
                           required
                           disabled={!sourceAssetId || !targetAssetId || exchangeRate === null}
                        />
                        {/* Validation Error Display Area */}
                        {sourceAsset && amountNumber > availableSourceBalance && (
                           <p className="text-xs text-red-600 mt-1">Amount exceeds available {isPlatformIssuedFinite(sourceAsset) ? 'reserve ' : ''}balance!</p>
                        )}
                        {validationError && (
                           <p className="text-xs text-red-600 mt-1">{validationError}</p>
                        )}
                   </div>
                   {/* Swap Preview (Uses previewData) */}
                   {previewData.show && !previewData.error && (
                     <div className="bg-gray-50 p-4 rounded border border-gray-200">
                        <h3 className="font-medium mb-2">Swap Preview (Estimated)</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between"> <span>Amount to Swap:</span> <span>{formatNumber(previewData.swapAmount)} {previewData.swapSymbol}</span> </div>
                            <div className="flex justify-between"> <span>Rate Used:</span> <span>{previewData.rateDisplay}</span> </div>
                            {previewData.feeDisplay && ( <div className="flex justify-between"> <span>Est. Swap Fee:</span> <span> {typeof previewData.feeDisplay.value === 'number' ? previewData.feeDisplay.value.toLocaleString(undefined, { style: 'currency', currency: previewData.feeDisplay.currency, minimumFractionDigits: 2, maximumFractionDigits: 4 }) : `${previewData.feeDisplay.value} ${previewData.feeDisplay.currency}` } </span> </div> )}
                            <div className="border-t border-gray-200 my-2 pt-2 flex justify-between font-medium"> <span>You Will Receive Approx:</span> <span> {typeof previewData.received === 'number' ? previewData.received.toLocaleString(undefined, { maximumFractionDigits: 6 }) : previewData.received}{' '} {previewData.receivedSymbol} </span> </div>
                            <div className="flex justify-between text-xs text-gray-500"> <span>Estimated Settlement Time:</span> <span>{previewData.settlement}</span> </div>
                        </div>
                     </div>
                    )}

                   {/* Other Form Fields */}
                   <div>
                       <label htmlFor="receivingAccount" className="block mb-1 font-medium text-gray-700">Receiving Wallet Name and Address <span className="text-red-600">*</span></label>
                       <select id="receivingAccount" className="w-full p-2 border rounded bg-white" value={receivingAccount} onChange={(e) => setReceivingAccount(e.target.value)} required >
                           <option value="" disabled>-- Select Receiving Wallet --</option>
                           {hardcodedBuyerWallets.map(wallet => (
                               <option key={wallet.value} value={wallet.value}> {wallet.label} </option>
                           ))}
                       </select>
                   </div>
                   <div>
                       <label htmlFor="institutionalSellerName" className="block mb-1 font-medium text-gray-700">Seller Name (Institutional) <span className="text-red-600">*</span></label>
                       <input id="institutionalSellerName" type="text" className="w-full p-2 border rounded" placeholder="Enter name of entity providing source asset" value={institutionalSellerName} onChange={(e) => setInstitutionalSellerName(e.target.value)} required />
                   </div>
                   <div>
                      <label htmlFor="swapPurpose" className="block mb-1 font-medium text-gray-700">Purpose <span className="text-red-600">*</span></label>
                      <select id="swapPurpose" className="w-full p-2 border rounded bg-white" value={swapPurpose} onChange={(e) => setSwapPurpose(e.target.value)} required >
                         <option value="" disabled>-- Select a purpose --</option>
                         <option value="Portfolio Rebalancing">Portfolio Rebalancing</option>
                         <option value="Treasury FX">Treasury FX Conversion</option>
                         <option value="Liquidity Access">Accessing Liquidity</option>
                         <option value="Arbitrage">Arbitrage</option>
                         <option value="Client Order">Fulfilling Client Order</option>
                         <option value="Other">Other (Specify in Notes)</option>
                      </select>
                   </div>
                   <div>
                      <label htmlFor="swapNotes" className="block mb-1 font-medium text-gray-700">Notes</label>
                      <textarea id="swapNotes" className="w-full p-2 border rounded" rows="2" placeholder="Additional details (optional)" value={swapNotes} onChange={(e) => setSwapNotes(e.target.value)} ></textarea>
                   </div>
                   <div className="flex items-start pt-2">
                      <input type="checkbox" id="useSmartContract" className="mr-2 mt-1 flex-shrink-0 h-4 w-4 text-blue-600 focus:ring-blue-500" checked={useSmartContract} onChange={(e) => setUseSmartContract(e.target.checked)} />
                      <label htmlFor="useSmartContract" className="text-sm text-gray-600"> Use Smart Contract for Verification/Execution (Simulated) </label>
                   </div>
                   <div className="flex items-start pt-2">
                      <input type="checkbox" id="terms" className="mr-2 mt-1 flex-shrink-0 h-4 w-4 text-blue-600 focus:ring-blue-500" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} required/>
                      <label htmlFor="terms" className="text-sm text-gray-600"> I acknowledge that rates are indicative, fees may apply, and swaps are subject to compliance checks and available liquidity. <span className="text-red-600">*</span></label>
                   </div>

                   {/* Submit Button */}
                   <div className="mt-6 flex space-x-3">
                        <button
                           type="submit"
                           className="px-4 py-2 rounded text-white hover:opacity-90 bg-purple-600 disabled:opacity-50"
                           disabled={
                               !sourceAssetId || !targetAssetId || amountNumber <= 0 || amountNumber > availableSourceBalance ||
                               exchangeRate === null || !receivingAccount || !swapPurpose || !termsAccepted ||
                               !institutionalSellerName.trim() ||
                               validationError || // Disable if validation error exists
                               isLoading
                           }
                       >
                           Submit Swap Request
                       </button>
                       <button type="button" className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-50" onClick={onBack} >
                          Cancel
                       </button>
                    </div>
                 </div>
               </form>
             </>
           )}

           {/* Smart Contract View */}
           {workflowState === 'executing_contract' && approvedSwapData && (
               <SmartContractExecutionView
                  data={approvedSwapData}
                  sourceAsset={assets?.find(a => a.id === approvedSwapData.sourceAssetId)}
                  targetAsset={assets?.find(a => a.id === approvedSwapData.targetAssetId)}
                  onFinish={handleFinishContractExecution}
                  onCancel={() => { setWorkflowState('idle'); setApprovedSwapData(null); }}
               />
           )}
       </div>
    </div>
  );
};

export default SwapTokenScreen;