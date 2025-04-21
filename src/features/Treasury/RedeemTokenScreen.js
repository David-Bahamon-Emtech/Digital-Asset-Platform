import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAssets } from '../../context/AssetsContext';
import { useTokenHistory } from '../../context/TokenHistoryContext';
import { formatNumber, getStatusClass } from '../../utils/displayUtils'; // Assuming displayUtils.js

// Constants
const currentUserInitials = 'RD'; // Example user initiating redemption
const approverInitials = 'SA'; // Example final approver

// --- Define ONLY the specific predefined tokens allowed for redemption ---
// Includes tokens that might be redeemed for underlying value (fiat, commodity, etc.)
const specificRedeemablePredefinedTokenIds = [
    'cp-acme-01',   // ACP (to underlying CP/cash)
    'mmf-usd-01',   // MMFUSD (to underlying MMF shares/cash)
    'xagc-01',      // XAGC (to underlying silver)
    'oil-wti-01',   // WTOIL (to underlying oil)
    'cc-verra-01',   // VCC (to underlying credit - often just retired/burned)
    // Add others if they have a direct redemption path
    // 't-bond',    // Example: May or may not be directly redeemable vs needing secondary market sale
];

// Placeholder rate maps (only fiat needed now)
const fiatToUsdApprox = { 'USD': 1.00, 'EUR': 1.09, 'GHS': 0.07, 'CAD': 0.75, 'GBP': 1.25, 'SGD': 0.74, 'JPY': 0.0067 };
const ratesFromUSD = { USD: 1, EUR: 0.91, JPY: 150, GHS: 15, CAD: 1.36, GBP: 0.80, AUD: 1.52, SGD: 1.35, CHF: 0.90, USDC: 1, USDT: 1, 'D-EUR': 0.91, eGH: 15, INR: 83, };

// Define which asset classes are eligible for direct fiat payout selection
const fiatPayoutEligibleClasses = [
    'Stablecoin',
    'CBDC',
    'Security-MMF',
    'Security-CP',
    'Security-TreasuryBill'
];

// --- Smart Contract Simulation View (Internal Component) ---
// (Keep this component as it was provided - might need slight text adjustment later)
const SmartContractExecutionView = ({ data, sourceAsset, onFinish, onCancel }) => {
    const [step, setStep] = useState(0);
    const [message, setMessage] = useState('Initializing smart contract interaction...');
    useEffect(() => { let timerId = null; if (step === 0) { setMessage('Initializing smart contract interaction...'); timerId = setTimeout(() => setStep(1), 1000); } else if (step === 1) { setMessage(`Validating balances and permissions for ${sourceAsset?.symbol || 'token'}...`); timerId = setTimeout(() => setStep(2), 1500); } else if (step === 2) { setMessage(`Executing redemption via contract...`); timerId = setTimeout(() => setStep(3), 2000); } else if (step === 3) { setMessage(`Confirming transaction settlement...`); timerId = setTimeout(() => setStep(4), 1500); } else if (step === 4) { setMessage(`Execution successful! Tokens redeemed via contract.`); } return () => { if (timerId) clearTimeout(timerId); }; }, [step, sourceAsset?.symbol]);
    const getStepClass = (currentStepMarker) => { if (step >= currentStepMarker + 1) return 'bg-green-500'; if (step === currentStepMarker) return 'bg-blue-500 animate-pulse'; return 'bg-gray-300'; };
    return ( <div className="p-6 border rounded-lg bg-gray-50 animate-fade-in"> <h3 className="text-xl font-semibold mb-4 text-center text-gray-800">Executing Redemption via Smart Contract</h3> <div className="mb-6 p-4 border rounded bg-white text-sm space-y-1 shadow-sm"> <p><strong>Action:</strong> Redeem</p> <p><strong>From:</strong> {sourceAsset?.label || 'N/A'} ({sourceAsset?.symbol || 'N/A'})</p> <p><strong>Amount:</strong> {data.amount?.toLocaleString()} {sourceAsset?.symbol || ''}</p> <p><strong>Buyer/Receiver:</strong> {data.institutionalBuyerName || 'N/A'}</p> <p><strong>Receiving Wallet/Account:</strong> {data.receivingAccount || 'N/A'}</p> </div> <div className="mb-6 space-y-3"> <div className="flex items-center"><div className={`w-5 h-5 rounded-full mr-3 ${getStepClass(1)} transition-colors duration-500`}></div><span className={`${step >= 1 ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>Validating Balances & Permissions</span></div> <div className="flex items-center"><div className={`w-5 h-5 rounded-full mr-3 ${getStepClass(2)} transition-colors duration-500`}></div><span className={`${step >= 2 ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>Executing Redemption</span></div> <div className="flex items-center"><div className={`w-5 h-5 rounded-full mr-3 ${getStepClass(3)} transition-colors duration-500`}></div><span className={`${step >= 3 ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>Confirming Settlement</span></div> </div> <div className="mb-6 text-center font-medium min-h-[2em]"> {step === 4 ? ( <p className="text-green-600 animate-pulse">{message}</p> ) : ( <p className="text-blue-600">{message}</p> )} </div> <div className="flex justify-center space-x-4 mt-6"> {step === 4 ? ( <button onClick={onFinish} className="px-6 py-2 rounded text-white bg-green-600 hover:bg-green-700 font-semibold animate-fade-in">Finish</button> ) : ( step < 4 && <button onClick={onCancel} className="px-4 py-2 rounded text-sm border border-gray-300 hover:bg-gray-100">Cancel Simulation</button> )} </div> </div> );
 };


// --- Main RedeemTokenScreen Component ---
const RedeemTokenScreen = ({ onBack }) => {

  // Hooks for context and state
  const { assets, dispatchAssets } = useAssets();
  const { dispatchTokenHistory } = useTokenHistory();
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [amountToRedeem, setAmountToRedeem] = useState('');
  // Removed redemptionMode state
  const [receivingAccount, setReceivingAccount] = useState('');
  const [redemptionPurpose, setRedemptionPurpose] = useState('');
  const [redeemNotes, setRedeemNotes] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  // Removed institutionalSellerName state
  const [institutionalBuyerName, setInstitutionalBuyerName] = useState(''); // Represents the receiver/redeemer
  const [useSmartContract, setUseSmartContract] = useState(false);
  const [approvedRedeemData, setApprovedRedeemData] = useState(null);
  const [workflowState, setWorkflowState] = useState('idle');
  const [workflowMessage, setWorkflowMessage] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [payoutFiatCurrency, setPayoutFiatCurrency] = useState('USD');

  // --- Memoized calculations ---
  const redeemableAssets = useMemo(() => {
      if (!Array.isArray(assets)) return [];
      // Filter assets that are wizard-issued OR are in the predefined list
      return assets.filter(asset =>
          asset.isWizardIssued === true || specificRedeemablePredefinedTokenIds.includes(asset.id)
      );
  }, [assets]);
  const selectedAsset = useMemo(() => assets.find(asset => asset.id === selectedAssetId), [assets, selectedAssetId]);
  const amountNumber = useMemo(() => parseFloat(amountToRedeem) || 0, [amountToRedeem]);
  // Removed targetableAssets and exchangeRate calculation

  // --- Effects ---
  useEffect(() => {
    // Reset relevant fields if the selected asset becomes invalid or changes
    if (selectedAssetId && !redeemableAssets.some(a => a.id === selectedAssetId)) {
      setSelectedAssetId('');
      setAmountToRedeem('');
      setPayoutFiatCurrency('USD');
      setInstitutionalBuyerName('');
      setReceivingAccount('');
      setRedemptionPurpose('');
      setTermsAccepted(false);
    } else if (selectedAsset) {
        // Reset payout currency if the new asset isn't eligible for fiat payout
        if (!fiatPayoutEligibleClasses.includes(selectedAsset.assetClass)) {
            setPayoutFiatCurrency('USD'); // Default back, though it won't be shown
        }
    }
  }, [redeemableAssets, selectedAssetId, selectedAsset]);

  useEffect(() => {
    // Workflow message handling (no change needed here)
    setIsLoading(false);
    if (workflowState === 'pending_auth1') {
      setWorkflowMessage('Redemption request submitted. Pending First Factor Authentication/Approval.');
    } else if (workflowState === 'pending_auth2') {
      setWorkflowMessage('First Factor OK. Pending Second Factor Authentication/Approval.');
    } else if (workflowState === 'approved') {
      setWorkflowMessage('Redemption request fully approved. Ready to execute.');
    } else if (workflowState === 'rejected') {
      setWorkflowMessage('Redemption request rejected.');
    } else if (workflowState === 'executing_contract') {
      setWorkflowMessage(''); // Handled by simulation view
    } else {
      setWorkflowMessage('');
      setRejectReason('');
      setApprovedRedeemData(null);
    }
  }, [workflowState]);

  // --- Callbacks ---
  // Removed getExchangeRate

  const calculatePreview = useCallback(() => {
    if (!selectedAsset || amountNumber <= 0) return { show: false };

    // Only handle underlying redemption preview
    const assetClass = selectedAsset.assetClass || 'Other';
    const price = selectedAsset.price;
    let previewResult = { show: false };
    const hasValidPrice = typeof price === 'number' && price > 0;
    const physicalFeeRate = 0.05; // Example fee rate for physical/less liquid assets
    const cashLikeFeeRate = 0.0005; // Example fee rate for cash-like assets
    let settlementTime = 'Processing Time Varies';

    if (['Stellar', 'Hedera'].includes(selectedAsset.blockchain)) settlementTime = 'Near Instant';
    else if (selectedAsset.blockchain === 'Ethereum') settlementTime = 'Minutes to Hours';

    // Determine unit description based on asset class (can be expanded)
    let unitDescription = `Underlying Asset (${selectedAsset.symbol})`;
    if (assetClass === 'Commodity-PreciousMetal') unitDescription = `${selectedAsset.label.includes('Silver') ? 'Silver' : 'Gold'} Reference Unit`;
    else if (assetClass === 'Commodity-Energy') unitDescription = 'WTI Oil Reference Unit';
    else if (assetClass === 'RealEstate') unitDescription = 'Fractional Interest Unit';
    else if (assetClass === 'CarbonCredit') unitDescription = 'Carbon Credit Unit';
    else if (assetClass === 'Security-Bond') unitDescription = 'Bond Reference Unit';

    // Handle fiat-redeemable assets
    if (fiatPayoutEligibleClasses.includes(assetClass)) {
      if (!hasValidPrice) {
        return { show: true, mode: 'underlying', error: `Cannot calculate redemption value for ${selectedAsset.symbol} due to missing price information.` };
      }
      const baseValue = amountNumber * price;
      const feeValueCash = baseValue * cashLikeFeeRate;
      const netValueInUSD = baseValue - feeValueCash;
      const targetFiat = payoutFiatCurrency; // Use the selected fiat currency
      const conversionRate = ratesFromUSD[targetFiat] ?? 1.0;
      if (!ratesFromUSD[targetFiat] && targetFiat !== 'USD') {
        console.warn(`Missing conversion rate from USD to ${targetFiat}. Using 1.0.`);
      }
      const finalReceivedAmount = netValueInUSD * conversionRate;
      previewResult = {
        show: true,
        mode: 'underlying',
        redeemAmount: amountNumber,
        redeemSymbol: selectedAsset.symbol,
        receivedAmount: finalReceivedAmount,
        receivedSymbol: targetFiat, // Show the selected fiat currency
        settlement: assetClass === 'CBDC' ? 'CBDC Wallet Transfer' : 'Bank/Platform Transfer (1-2 Days)',
        feeDisplay: { value: feeValueCash, currency: 'USD' }
      };
    }
    // Handle other non-fiat redeemable assets
    else {
        // For non-fiat, we might estimate fees differently or just show the amount redeemed
        let feeValuePhysical = 0;
        if (hasValidPrice) {
             feeValuePhysical = amountNumber * price * physicalFeeRate; // Example value-based fee
        } else {
             console.warn(`Cannot calculate value-based fee for ${selectedAsset.symbol} due to missing/invalid price. Fee might be unit-based.`);
             // Add alternative fee logic if needed, e.g., fixed fee per unit
        }
        previewResult = {
            show: true,
            mode: 'underlying',
            redeemAmount: amountNumber,
            redeemSymbol: selectedAsset.symbol,
            // For non-fiat, 'received amount' is often just the amount of the underlying asset units
            receivedAmount: amountNumber, // Or adjust based on specific redemption terms (e.g., 1 XAGC = 1 oz Silver)
            receivedSymbol: unitDescription,
            settlement: assetClass.startsWith('Security') ? 'Brokerage/Registry Settlement' : 'Physical/Registry Settlement Required',
            // Fee display might show USD equivalent or units of the asset
            feeDisplay: hasValidPrice ? { value: feeValuePhysical, currency: 'USD' } : { value: 'Variable', currency: 'Units' }
        };
    }

    return previewResult;

  }, [selectedAsset, amountNumber, payoutFiatCurrency]); // Removed dependencies on targetAsset, exchangeRate

  const preview = useMemo(() => calculatePreview(), [calculatePreview]);

  // --- Event Handlers ---
  const handleInitiateRedemption = (event) => {
    event.preventDefault();
    const isFiatPayout = fiatPayoutEligibleClasses.includes(selectedAsset?.assetClass);

    // Validation: check selected asset, amount, buyer name, receiving account, purpose, terms, and fiat currency if applicable
    if (!selectedAsset || isNaN(amountNumber) || amountNumber <= 0 || amountNumber > selectedAsset.balance
        || !institutionalBuyerName.trim() || !receivingAccount.trim() || !redemptionPurpose
        || !termsAccepted || (isFiatPayout && !payoutFiatCurrency)) {
      alert("Please ensure all required fields are filled correctly, terms are accepted, the amount is valid, and payout currency is selected if applicable.");
      return;
    }
    // Check if preview has an error
    if (preview.show && preview.error) {
        alert(`Cannot proceed with redemption due to an error in the preview: ${preview.error}`);
        return;
    }
    setWorkflowState('pending_auth1');
  };

  const handleApproval = (step) => { // No change needed
    if (isLoading) return;
    setIsLoading(true);
    setWorkflowMessage(`Processing Step ${step} approval...`);
    setTimeout(() => {
      if (step === 1) { setWorkflowState('pending_auth2'); }
      else if (step === 2) { setWorkflowState('approved'); }
    }, 1500);
  };

  const handleReject = (rejectedByStep) => { // No change needed
    if (isLoading) return;
    const reason = prompt(`Enter reason for rejection at Step ${rejectedByStep} (optional):`);
    setIsLoading(true);
    setWorkflowMessage(`Processing rejection...`);
    setTimeout(() => {
      setRejectReason(reason || 'No reason provided.');
      setWorkflowState('rejected');
    }, 1000);
  };

  // *** executeRedemptionDispatch SIMPLIFIED for Redemption ONLY ***
  const executeRedemptionDispatch = (data) => {
      setIsLoading(true);
      setWorkflowMessage('Processing redemption...');

      try {
          const sourceAssetForLog = assets.find(a => a.id === data.assetId);
          if (!sourceAssetForLog) {
              throw new Error("Could not find asset being redeemed for logging.");
          }

          // *** Dispatch ONLY the REDEEM_ASSET action ***
          dispatchAssets({
              type: 'REDEEM_ASSET', // Use the action that decreases balance and total supply
              payload: {
                  assetId: data.assetId,
                  amount: data.amount // Payload key is 'amount' as per AssetsContext
              }
          });

          // *** Construct log details and history entry ***
          let logDetails = `Redeemed ${formatNumber(data.amount)} ${sourceAssetForLog.symbol}`;
          const historyActionType = 'Redeem & Burn'; // Specific type for redemption

          if (data.payoutFiat) {
              logDetails += ` for ${data.payoutFiat}`;
          } else {
              logDetails += ` for underlying asset/value`;
          }
          if (data.purpose) logDetails += ` (Purpose: ${data.purpose})`;
          if (data.receivingAccount) logDetails += ` (To Account/Wallet: ${data.receivingAccount})`;
          if (data.institutionalBuyerName) logDetails += ` (Receiver: ${data.institutionalBuyerName})`;
          if (data.useSmartContract) logDetails += ` (Via Contract)`;

          const historyEntry = {
              id: Date.now() + Math.random(),
              timestamp: new Date(),
              actionType: historyActionType,
              details: logDetails,
              user: currentUserInitials,
              approver: approverInitials,
              assetId: sourceAssetForLog.id,
              assetSymbol: sourceAssetForLog.symbol,
              assetName: sourceAssetForLog.label,
              notes: `${data.notes || ''}${data.useSmartContract ? ' (Smart Contract Execution)' : ''}`
          };
          dispatchTokenHistory({ type: 'ADD_TOKEN_HISTORY', payload: historyEntry });

          alert(`Redemption processed successfully!`);
          onBack(); // Navigate back after successful completion

      } catch (error) {
          console.error("Error processing redemption:", error);
          alert(`An error occurred while processing the redemption: ${error.message}`);
          setIsLoading(false); // Ensure loading is stopped on error
          setWorkflowState('idle'); // Reset workflow on error
          setWorkflowMessage('Error during final processing. Please review details or cancel.');
      }
  }

  // Handle final confirmation (if not using smart contract)
  const finalizeRedemption = () => {
    if (isLoading || workflowState !== 'approved') return;

    let confirmMsg = `Confirm redemption (burn): ${formatNumber(amountNumber)} ${selectedAsset?.symbol}`;
    if (preview.show && !preview.error) {
        const receivedAmt = preview.receivedAmount;
        const receivedSym = preview.receivedSymbol;
        confirmMsg += ` to receive approx ${typeof receivedAmt === 'number' ? receivedAmt.toLocaleString(undefined, {maximumFractionDigits: receivedSym?.length === 3 ? 2 : 4}) : receivedAmt} ${receivedSym}`;
    }
    confirmMsg += `?`;

    if (window.confirm(confirmMsg)) {
        const isFiatPayout = fiatPayoutEligibleClasses.includes(selectedAsset?.assetClass);
        const redeemData = {
            mode: 'underlying', // Hardcoded as this screen only does redemption
            amount: amountNumber,
            receivingAccount: receivingAccount,
            purpose: redemptionPurpose,
            notes: redeemNotes,
            institutionalBuyerName: institutionalBuyerName, // Receiver name
            useSmartContract: false, // Finalize assumes manual execution here
            assetId: selectedAssetId,
            payoutFiat: isFiatPayout ? payoutFiatCurrency : undefined
        };
        executeRedemptionDispatch(redeemData);
    } else {
      console.log("Final redemption cancelled by user.");
    }
  };

  // Handle the 'Proceed' button after final approval
  const handleProceedAfterApproval = () => {
    if (isLoading || workflowState !== 'approved') return;

    const isFiatPayout = fiatPayoutEligibleClasses.includes(selectedAsset?.assetClass);
    const redeemData = {
        mode: 'underlying',
        amount: amountNumber,
        receivingAccount: receivingAccount,
        purpose: redemptionPurpose,
        notes: redeemNotes,
        institutionalBuyerName: institutionalBuyerName,
        useSmartContract: useSmartContract, // Pass the flag
        assetId: selectedAssetId,
        payoutFiat: isFiatPayout ? payoutFiatCurrency : undefined
    };

    if (useSmartContract) {
      setApprovedRedeemData(redeemData);
      setWorkflowState('executing_contract');
    } else {
      finalizeRedemption(); // Trigger manual confirmation directly
    }
  };

  // Handle completion of the smart contract simulation
  const handleFinishContractExecution = () => {
    if (!approvedRedeemData) {
      console.error("Error: Missing approved data after smart contract simulation.");
      alert("An error occurred finishing the process after simulation.");
      setWorkflowState('idle');
      return;
    }
    executeRedemptionDispatch(approvedRedeemData);
    setApprovedRedeemData(null);
  };


  // --- Render Logic ---
  return (
    <div className="p-8">
      {/* Main container */}
      <div className="bg-white p-6 rounded shadow max-w-3xl mx-auto" key={workflowState /* Re-render on state change */}>

        {/* Header */}
        <div className="flex justify-between items-center mb-6 border-b pb-3">
          <h1 className="text-2xl font-bold text-gray-800">Redeem Token</h1>
          <button
            className="px-3 py-1 rounded text-white hover:opacity-90 bg-gray-800 text-sm disabled:opacity-50"
            onClick={() => {
              if (workflowState === 'idle' || workflowState === 'rejected') {
                onBack();
              } else {
                if (window.confirm("Are you sure you want to cancel this redemption request?")) {
                  setWorkflowState('idle');
                  setApprovedRedeemData(null); // Clear any approved data
                }
              }
            }}
            disabled={isLoading && workflowState !== 'idle'}
          >
            {workflowState === 'idle' || workflowState === 'rejected' ? 'Back to Treasury' : 'Cancel Request'}
          </button>
        </div>

        {/* Workflow Status Area (No change needed here) */}
        {workflowState !== 'idle' && workflowState !== 'executing_contract' && (
          <div className={`mb-6 p-4 border rounded-lg ${workflowState === 'rejected' ? 'bg-red-50 border-red-300' : 'bg-blue-50 border-blue-300'}`}>
            <h3 className={`text-lg font-semibold mb-2 ${workflowState === 'rejected' ? 'text-red-800' : 'text-blue-800'}`}>Request Status</h3>
            <p className={`mb-3 ${workflowState === 'rejected' ? 'text-red-700' : 'text-blue-700'}`}>{workflowMessage}</p>
            {isLoading && <p className="text-sm text-gray-500 italic mb-3">Processing...</p>}

            {/* Action Buttons for Workflow */}
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
              <button
                onClick={handleProceedAfterApproval}
                className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 font-bold"
              >
                Proceed with Redemption
              </button>
            )}
          </div>
        )}

        {/* Main Form Area - Shown only when idle */}
        {workflowState === 'idle' && (
          <>
            {/* Informational Note */}
            <div className="bg-blue-50 border-l-4 border-blue-600 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor"> <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /> </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    <strong>Note:</strong> Redeem tokens for their underlying asset value (e.g., fiat currency, commodity units). Fees and settlement times vary.
                  </p>
                </div>
              </div>
            </div>

            {/* Redemption Form */}
            <form onSubmit={handleInitiateRedemption}>
              <div className="space-y-4">
                {/* Asset Selection */}
                <div>
                  <label htmlFor="redeemAssetSelect" className="block mb-1 font-medium text-gray-700">Token to Redeem <span className="text-red-600">*</span></label>
                  <select
                    id="redeemAssetSelect"
                    className="w-full p-2 border rounded bg-white disabled:bg-gray-100"
                    value={selectedAssetId}
                    onChange={(e) => { setSelectedAssetId(e.target.value); setAmountToRedeem(''); /* Reset amount on asset change */ }}
                    required
                    disabled={redeemableAssets.length === 0}
                  >
                    <option value="" disabled>
                      {redeemableAssets.length === 0 ? '-- No Redeemable Assets --' : '-- Select an Asset --'}
                    </option>
                    {redeemableAssets.map(asset => (
                      <option key={asset.id} value={asset.id}>
                        {asset.label} ({asset.symbol})
                      </option>
                    ))}
                  </select>
                  {redeemableAssets.length === 0 && <p className="text-xs text-gray-500 mt-1">No assets available for redemption.</p>}
                </div>

                {/* Balance Display */}
                {selectedAsset && (
                  <div className="bg-gray-100 p-3 rounded mb-2 text-sm">
                    <div className="flex justify-between">
                      <span>Your Balance:</span>
                      <span className="font-medium">{formatNumber(selectedAsset.balance)} {selectedAsset.symbol}</span>
                    </div>
                  </div>
                )}

                {/* Amount Input */}
                <div>
                  <label htmlFor="redeemAmount" className="block mb-1 font-medium text-gray-700">Amount of {selectedAsset?.symbol || 'Token'} to Redeem <span className="text-red-600">*</span></label>
                  <input
                    id="redeemAmount"
                    type="number"
                    className="w-full p-2 border rounded disabled:bg-gray-100"
                    placeholder="Enter amount"
                    value={amountToRedeem}
                    onChange={(e) => setAmountToRedeem(e.target.value)}
                    min="0.000001" // Example minimum
                    step="any"
                    required
                    disabled={!selectedAssetId}
                  />
                  {selectedAsset && amountNumber > selectedAsset.balance && (
                    <p className="text-xs text-red-600 mt-1">Amount exceeds current balance!</p>
                  )}
                   {preview.show && preview.error && (
                      <p className="text-xs text-red-600 mt-1">{preview.error}</p>
                   )}
                </div>

                 {/* Payout Currency Selection (Conditional) */}
                 {selectedAsset && fiatPayoutEligibleClasses.includes(selectedAsset.assetClass) && (
                  <div>
                      <label htmlFor="payoutFiat" className="block mb-1 font-medium text-gray-700">Select Payout Currency <span className="text-red-600">*</span></label>
                      <select
                          id="payoutFiat"
                          className="w-full p-2 border rounded bg-white"
                          value={payoutFiatCurrency}
                          onChange={(e) => setPayoutFiatCurrency(e.target.value)}
                          required
                      >
                          <option value="USD">USD</option>
                          <option value="EUR">EUR</option>
                          <option value="GHS">GHS (Ghanaian Cedi)</option>
                          <option value="JPY">JPY (Japanese Yen)</option>
                          {/* Add other relevant payout currencies */}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">Select the fiat currency you wish to receive for this redemption.</p>
                  </div>
                 )}

                {/* Redemption Preview */}
                {preview.show && !preview.error && (
                  <div className="bg-gray-50 p-4 rounded border border-gray-200">
                    <h3 className="font-medium mb-2">Redemption Preview (Estimated)</h3>
                      <div className="space-y-2 text-sm">
                        {/* Amount Redeemed */}
                        <div className="flex justify-between">
                          <span>Amount to Redeem:</span>
                          <span>{formatNumber(preview.redeemAmount)} {preview.redeemSymbol}</span>
                        </div>
                        {/* Fee Display */}
                        {preview.feeDisplay && (
                          <div className="flex justify-between">
                            <span>Est. Redemption Fee:</span>
                            <span>
                                {typeof preview.feeDisplay.value === 'number'
                                    ? preview.feeDisplay.value.toLocaleString(undefined, { style: 'currency', currency: preview.feeDisplay.currency, minimumFractionDigits: 2, maximumFractionDigits: 2 })
                                    : `${preview.feeDisplay.value} ${preview.feeDisplay.currency}`
                                }
                            </span>
                          </div>
                        )}
                        {/* Amount Received */}
                        <div className="border-t border-gray-200 my-2 pt-2 flex justify-between font-medium">
                          <span>You Will Receive Approx:</span>
                          <span>
                             {typeof preview.receivedAmount === 'number'
                                 ? preview.receivedAmount.toLocaleString(undefined, { maximumFractionDigits: preview.receivedSymbol?.length === 3 ? 2 : 4 }) // More decimals for non-fiat?
                                 : preview.receivedAmount}{' '}
                             {preview.receivedSymbol}
                          </span>
                        </div>
                        {/* Settlement Time */}
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Estimated Settlement Time:</span>
                          <span>{preview.settlement}</span>
                        </div>
                      </div>
                  </div>
                )}

                {/* Receiving Account Input */}
                <div>
                  <label htmlFor="receivingAccount" className="block mb-1 font-medium text-gray-700">Receiving Wallet / Bank Account <span className="text-red-600">*</span></label>
                  <input
                    id="receivingAccount"
                    type="text"
                    className="w-full p-2 border rounded"
                    placeholder="Enter destination wallet address or bank account details"
                    value={receivingAccount}
                    onChange={(e) => setReceivingAccount(e.target.value)}
                    required
                  />
                </div>

                {/* Institutional Buyer/Receiver Name Input */}
                <div>
                  <label htmlFor="institutionalBuyerName" className="block mb-1 font-medium text-gray-700">Receiver Name (Institutional) <span className="text-red-600">*</span></label>
                  <input
                    id="institutionalBuyerName"
                    type="text"
                    className="w-full p-2 border rounded"
                    placeholder="Enter the name of the receiving entity"
                    value={institutionalBuyerName}
                    onChange={(e) => setInstitutionalBuyerName(e.target.value)}
                    required
                  />
                </div>

                {/* Purpose Selection */}
                <div>
                  <label htmlFor="redemptionPurpose" className="block mb-1 font-medium text-gray-700">Purpose <span className="text-red-600">*</span></label>
                  <select
                    id="redemptionPurpose"
                    className="w-full p-2 border rounded bg-white"
                    value={redemptionPurpose}
                    onChange={(e) => setRedemptionPurpose(e.target.value)}
                    required
                  >
                    <option value="" disabled>-- Select a purpose --</option>
                    <option value="Withdrawal">Customer Withdrawal</option>
                    <option value="Treasury">Treasury Management</option>
                    <option value="Liquidity">Liquidity Provision</option>
                    <option value="Settlement">Asset Settlement</option>
                    {/* Removed "Swap" as it's handled separately */}
                    <option value="Other">Other (Specify in Notes)</option>
                  </select>
                </div>

                {/* Notes Input */}
                <div>
                  <label htmlFor="redeemNotes" className="block mb-1 font-medium text-gray-700">Notes</label>
                  <textarea
                    id="redeemNotes"
                    className="w-full p-2 border rounded"
                    rows="2"
                    placeholder="Additional details (optional)"
                    value={redeemNotes}
                    onChange={(e) => setRedeemNotes(e.target.value)}
                  ></textarea>
                </div>

                {/* Smart Contract Checkbox */}
                <div className="flex items-start pt-2">
                  <input
                    type="checkbox"
                    id="useSmartContract"
                    className="mr-2 mt-1 flex-shrink-0 h-4 w-4 text-blue-600 focus:ring-blue-500"
                    checked={useSmartContract}
                    onChange={(e) => setUseSmartContract(e.target.checked)}
                  />
                  <label htmlFor="useSmartContract" className="text-sm text-gray-600">
                    Use Smart Contract for Verification/Execution (Simulated)
                  </label>
                </div>

                {/* Terms Checkbox */}
                <div className="flex items-start pt-2">
                  <input
                    type="checkbox"
                    id="terms"
                    className="mr-2 mt-1 flex-shrink-0 h-4 w-4 text-blue-600 focus:ring-blue-500"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    required
                  />
                  <label htmlFor="terms" className="text-sm text-gray-600">
                    I acknowledge that rates are indicative, fees may apply, and redemption is subject to compliance checks. <span className="text-red-600">*</span>
                  </label>
                </div>

                {/* Form Submission Buttons */}
                <div className="mt-6 flex space-x-3">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded text-white hover:opacity-90 bg-blue-600 disabled:opacity-50"
                    disabled={
                      !selectedAssetId || amountNumber <= 0 || (selectedAsset && amountNumber > selectedAsset.balance)
                      || !receivingAccount || !redemptionPurpose || !termsAccepted
                      || !institutionalBuyerName.trim()
                      || (selectedAsset && fiatPayoutEligibleClasses.includes(selectedAsset.assetClass) && !payoutFiatCurrency)
                      || (preview.show && preview.error) // Disable if preview shows an error
                      || isLoading
                    }
                  >
                    Submit Redemption Request
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-50"
                    onClick={onBack} // Go back to Treasury dashboard
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </>
        )}

        {/* Smart Contract Execution View (Conditional) */}
        {workflowState === 'executing_contract' && approvedRedeemData && (
          <SmartContractExecutionView
            data={approvedRedeemData}
            sourceAsset={assets.find(a => a.id === approvedRedeemData.assetId)}
            onFinish={handleFinishContractExecution}
            onCancel={() => { setWorkflowState('idle'); setApprovedRedeemData(null); }}
          />
        )}

      </div> {/* End main container */}
    </div> // End padding wrapper
  );
};

export default RedeemTokenScreen;