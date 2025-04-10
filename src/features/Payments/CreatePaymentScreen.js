// src/features/Payments/CreatePaymentScreen.js
import React, { useState, useEffect, useMemo, useCallback } from 'react';

// --- Import Sub-components ---
import TraditionalPaymentFields from './TraditionalPaymentFields'; // Assuming it's in the same folder
import OnChainPaymentFields from './OnChainPaymentFields';       // Assuming it's in the same folder

// --- Helper Data & Constants --- (Unchanged)
const sampleEntities = ['Citi New York', 'Citi London', 'Citi Singapore', 'Citi Mumbai'];
const samplePurposes = ['Select purpose code', 'BKTR', 'CBFT', 'CORT', 'GOVT', 'TREA', 'SUPP'];
// Settlement speeds only relevant for traditional now
const settlementSpeeds = {
    standard: { label: 'Standard', feePercent: 0.001 },
    express: { label: 'Express', feePercent: 0.0025 },
};
const jurisdictions = [ { code: '', name: 'Select Jurisdiction...' }, { code: 'US', name: 'United States', currency: 'USD' }, { code: 'EU', name: 'Europe', currency: 'EUR' }, { code: 'JP', name: 'Japan', currency: 'JPY' }, { code: 'GH', name: 'Ghana', currency: 'GHS' }, { code: 'CA', name: 'Canada', currency: 'CAD' }, ];
const traditionalRailsList = [ { code: '', name: 'Select Traditional Rail...' }, { code: 'SWIFT', name: 'SWIFT', fee: 5.00, feeType: 'flat' }, { code: 'HSBC', name: 'Correspondent Bank (HSBC)', fee: 1.50, feeType: 'flat' }, { code: 'JPM', name: 'Correspondent Bank (JP Morgan)', fee: 1.75, feeType: 'flat' }, { code: 'MUFG', name: 'Correspondent Bank (Mitsubishi)', fee: 2.00, feeType: 'flat' }, { code: 'SANT', name: 'Correspondent Bank (Santander)', fee: 1.25, feeType: 'flat' }, { code: 'VISA', name: 'Card Network (VISA Direct)', fee: 0.008, feeType: 'percent' }, { code: 'MC', name: 'Card Network (Mastercard Send)', fee: 0.009, feeType: 'percent' }, { code: 'WU', name: 'Money Transfer (Western Union)', fee: 3.00, feeType: 'flat' }, ];
const onChainNetworksList = [ { code: '', name: 'Select Network...' }, { code: 'Ethereum', name: 'Ethereum', nativeSymbol: 'ETH' }, { code: 'Polygon', name: 'Polygon', nativeSymbol: 'MATIC' }, { code: 'Stellar', name: 'Stellar', nativeSymbol: 'XLM' }, { code: 'Hedera', name: 'Hedera', nativeSymbol: 'HBAR' }, { code: 'Solana', name: 'Solana', nativeSymbol: 'SOL' }, ];
const baseGasFeeUSD = { Ethereum: 5.00, Polygon: 0.10, Stellar: 0.01, Hedera: 0.01, Solana: 0.05, default: 0.50 };
const nativeTokenPricesUSD = { ETH: 3000, MATIC: 0.7, XLM: 0.1, HBAR: 0.08, SOL: 150 };
const ratesToUSD = { USD: 1, EUR: 1.10, GBP: 1.25, CAD: 0.74, AUD: 0.66, SGD: 0.74, JPY: 0.0067, CHF: 1.11, GHS: 0.067, USDC: 1, USDT: 1 };
const ratesFromUSD = { USD: 1, EUR: 0.91, JPY: 150, GHS: 15, CAD: 1.36 };

const generateDummyClientAccounts = (count = 30) => { /* ... (function unchanged) ... */
    const accounts = []; const currencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'SGD', 'JPY', 'CHF'];
    for (let i = 1; i <= count; i++) { const currency = currencies[i % currencies.length]; const accountNumber = String(Math.floor(Math.random() * 90000000) + 10000000); const balance = Math.floor(Math.random() * 9000000) + 1000001; const label = `Account ${accountNumber}`; accounts.push({ id: `client-${i}-${accountNumber.slice(-4)}`, label: label, balance: balance, symbol: currency, blockchain: 'N/A (Client Account)' }); }
    const usdcAccountNumber = String(Math.floor(Math.random() * 90000000) + 10000000); const usdtAccountNumber = String(Math.floor(Math.random() * 90000000) + 10000000);
    accounts.push({ id: `client-usdc-${usdcAccountNumber.slice(-4)}`, label: `Account ${usdcAccountNumber}`, balance: 1500000, symbol: 'USDC', blockchain: 'Stellar' }); accounts.push({ id: `client-usdt-${usdtAccountNumber.slice(-4)}`, label: `Account ${usdtAccountNumber}`, balance: 1850000, symbol: 'USDT', blockchain: 'Ethereum' }); return accounts;
};
const dummyClientAccounts = generateDummyClientAccounts(30);

// --- Component ---
const CreatePaymentScreen = ({ assets = [], onBack, onPaymentSubmit }) => {

  // --- State --- (Unchanged)
  const [formStep, setFormStep] = useState('details');
  const [paymentType, setPaymentType] = useState('on-chain');
  const [paymentOrigin, setPaymentOrigin] = useState('institutional');
  const [senderEntity, setSenderEntity] = useState(sampleEntities[0] || '');
  const [senderAccountId, setSenderAccountId] = useState('');
  const [debitReference, setDebitReference] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientJurisdiction, setRecipientJurisdiction] = useState('');
  const [recipientAccount, setRecipientAccount] = useState('');
  const [recipientInstitution, setRecipientInstitution] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('');
  const [traditionalRail, setTraditionalRail] = useState('');
  const [onChainNetwork, setOnChainNetwork] = useState('');
  const [settlementSpeed, setSettlementSpeed] = useState('standard');
  const [dateType, setDateType] = useState('immediate');
  const [scheduledDate, setScheduledDate] = useState('');
  const [purpose, setPurpose] = useState('');
  const [description, setDescription] = useState('');
  const [workflowState, setWorkflowState] = useState('idle');
  const [workflowMessage, setWorkflowMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [previewData, setPreviewData] = useState({
      paymentAmount: 0, fee: 0, networkFee: 0, total: 0, currencySymbol: '',
      exchangeRate: null, receivedAmount: null, receivedCurrencySymbol: null,
      networkFeeDisplay: null
  });
  const [errors, setErrors] = useState({});

  // --- Derived Data --- (Unchanged)
  const availableSenderAccounts = useMemo(() => (paymentOrigin === 'client' ? dummyClientAccounts : assets), [paymentOrigin, assets]);
  const selectedSenderAsset = useMemo(() => availableSenderAccounts.find(a => a.id === senderAccountId), [availableSenderAccounts, senderAccountId]);
  const amountNumber = useMemo(() => parseFloat(amount) || 0, [amount]);
  const targetJurisdictionInfo = useMemo(() => jurisdictions.find(j => j.code === recipientJurisdiction), [recipientJurisdiction]);
  const targetCurrency = useMemo(() => paymentOrigin === 'client' && paymentType !== 'internal' ? targetJurisdictionInfo?.currency : currency, [paymentOrigin, paymentType, targetJurisdictionInfo, currency]);
  const exchangeRate = useMemo(() => { /* ... */ if (paymentOrigin !== 'client' || paymentType === 'internal' || !selectedSenderAsset || !targetCurrency || !ratesToUSD[selectedSenderAsset.symbol] || !ratesFromUSD[targetCurrency]) return null; if (selectedSenderAsset.symbol === targetCurrency) return 1; const sourceToUsdRate = ratesToUSD[selectedSenderAsset.symbol]; const usdToTargetRate = ratesFromUSD[targetCurrency]; return sourceToUsdRate * usdToTargetRate; }, [paymentOrigin, paymentType, selectedSenderAsset, targetCurrency]);
  const effectiveOnChainNetwork = useMemo(() => { /* ... */ if (paymentType !== 'on-chain') return null; if (paymentOrigin === 'institutional') return selectedSenderAsset?.blockchain; return onChainNetwork; }, [paymentType, paymentOrigin, selectedSenderAsset, onChainNetwork]);

  // --- Validation Function --- (Unchanged)
  const validateForm = useCallback(() => { /* ... */
    const newErrors = {};
    if (!senderAccountId) newErrors.senderAccountId = 'Please select a source account.';
    if (!recipientAccount.trim()) newErrors.recipientAccount = 'Recipient identifier is required.';
    if (!purpose) newErrors.purpose = 'Please select a purpose code.';
    if (dateType === 'scheduled' && !scheduledDate) newErrors.scheduledDate = 'Please select a scheduled date.';
    if (amountNumber <= 0) newErrors.amount = 'Please enter a valid positive amount.';
    else if (selectedSenderAsset && amountNumber > selectedSenderAsset.balance) newErrors.amount = 'Amount exceeds available balance.';
    if (paymentType === 'traditional' && !traditionalRail) newErrors.traditionalRail = 'Please select a payment rail.';
    if (paymentType === 'on-chain' && paymentOrigin === 'client' && !onChainNetwork) newErrors.onChainNetwork = 'Please select the destination network.';
    if (paymentOrigin === 'client' && paymentType !== 'internal') { if (!recipientJurisdiction) newErrors.recipientJurisdiction = 'Please select recipient jurisdiction.'; else if (exchangeRate === null || exchangeRate <= 0) newErrors.recipientJurisdiction = 'FX rate unavailable for this selection.'; }
    setErrors(newErrors); return Object.keys(newErrors).length === 0;
   }, [senderAccountId, recipientAccount, purpose, dateType, scheduledDate, amountNumber, selectedSenderAsset, paymentType, traditionalRail, paymentOrigin, onChainNetwork, recipientJurisdiction, exchangeRate]);

  // --- Field Reset Logic --- (Unchanged)
  const resetFieldsOnOriginOrTypeChange = useCallback(() => { /* ... */
        setSenderAccountId(''); setRecipientJurisdiction(''); setTraditionalRail(''); setOnChainNetwork(''); setRecipientName(''); setRecipientAccount(''); setRecipientInstitution(''); setAmount(''); setCurrency(''); setDescription(''); setPurpose(''); setErrors({});
        if (paymentType !== 'traditional') setSettlementSpeed('standard');
   }, [paymentType]);

  // --- Effects ---
  useEffect(() => { resetFieldsOnOriginOrTypeChange(); }, [paymentOrigin, resetFieldsOnOriginOrTypeChange]);
  useEffect(() => { resetFieldsOnOriginOrTypeChange(); }, [paymentType, resetFieldsOnOriginOrTypeChange]);
  useEffect(() => { /* ... (Currency/Compat checks unchanged) ... */
      const symbol = selectedSenderAsset?.symbol || ''; setCurrency(symbol);
      if (errors.amount && selectedSenderAsset && amountNumber <= selectedSenderAsset.balance) { setErrors(prev => ({ ...prev, amount: null })); }
      if (!selectedSenderAsset) setAmount('');
      if (paymentOrigin === 'institutional' && paymentType === 'on-chain' && selectedSenderAsset && !selectedSenderAsset.blockchain) { console.warn("Selected institutional asset has no blockchain info."); }
      if (paymentOrigin === 'client' && paymentType !== 'internal' && selectedSenderAsset && !ratesToUSD[symbol]) { console.warn("Source currency not supported for FX."); setRecipientJurisdiction(''); setErrors(prev => ({ ...prev, recipientJurisdiction: 'Source currency cannot be used for FX.' })); }
      else if (errors.recipientJurisdiction === 'Source currency cannot be used for FX.') { setErrors(prev => ({ ...prev, recipientJurisdiction: null })); }
   }, [selectedSenderAsset, paymentOrigin, paymentType, errors.amount, errors.recipientJurisdiction, amountNumber]);
  useEffect(() => { /* ... (Preview calculation unchanged) ... */
      const isClientPayment = paymentOrigin === 'client';
      const calculatedPreview = { paymentAmount: 0, fee: 0, networkFee: 0, total: 0, currencySymbol: currency || '', exchangeRate: null, receivedAmount: null, receivedCurrencySymbol: null, networkFeeDisplay: null };
      if (amountNumber > 0 && currency) { calculatedPreview.paymentAmount = amountNumber; let networkFeeSourceCurrency = 0; if (paymentType === 'on-chain') { const network = effectiveOnChainNetwork; const baseFeeUSD = baseGasFeeUSD[network] || baseGasFeeUSD.default; const sourceToUSDRate = ratesToUSD[currency] || 1; const variability = 1 + (Math.random() * 0.1 - 0.05); networkFeeSourceCurrency = (baseFeeUSD / sourceToUSDRate) * variability; calculatedPreview.fee = 0; calculatedPreview.networkFee = networkFeeSourceCurrency; const nativeSymbol = onChainNetworksList.find(n => n.code === network)?.nativeSymbol; const nativePriceUSD = nativeTokenPricesUSD[nativeSymbol]; if (nativeSymbol && nativePriceUSD > 0) { const nativeAmount = baseFeeUSD / nativePriceUSD * variability; calculatedPreview.networkFeeDisplay = `${nativeAmount.toFixed(6)} ${nativeSymbol}`; } else { calculatedPreview.networkFeeDisplay = `${networkFeeSourceCurrency.toFixed(4)} ${currency} (Est. Gas)`; } } else if (paymentType === 'traditional') { const speedData = settlementSpeeds[settlementSpeed]; calculatedPreview.fee = speedData ? amountNumber * speedData.feePercent : 0; const railInfo = traditionalRailsList.find(r => r.code === traditionalRail); if (railInfo?.feeType === 'flat') { networkFeeSourceCurrency = railInfo.fee; } else if (railInfo?.feeType === 'percent') { networkFeeSourceCurrency = amountNumber * railInfo.fee; } else { networkFeeSourceCurrency = 0; } calculatedPreview.networkFee = networkFeeSourceCurrency; } else if (paymentType === 'internal') { calculatedPreview.fee = 0; calculatedPreview.networkFee = 0; } calculatedPreview.total = calculatedPreview.paymentAmount + calculatedPreview.fee + calculatedPreview.networkFee; if (isClientPayment && paymentType !== 'internal' && exchangeRate !== null && exchangeRate > 0 && targetCurrency) { calculatedPreview.exchangeRate = exchangeRate; calculatedPreview.receivedAmount = amountNumber * exchangeRate; calculatedPreview.receivedCurrencySymbol = targetCurrency; } } setPreviewData(calculatedPreview);
   }, [amountNumber, currency, settlementSpeed, paymentType, paymentOrigin, exchangeRate, targetCurrency, traditionalRail, effectiveOnChainNetwork]);
  useEffect(() => { /* ... (Workflow effect unchanged) ... */
      if (workflowState === 'pending_compliance') { setIsLoading(true); setWorkflowMessage('Running Compliance & KYC checks...'); setTwoFactorCode(''); setIsCodeSent(false); setTimeout(() => { setWorkflowState('compliance_passed'); setIsLoading(false); }, 2000); } else if (workflowState === 'compliance_passed') { setWorkflowState('pending_2fa'); setWorkflowMessage('Compliance checks passed. Please complete Two-Factor Authentication.'); } else if (workflowState === 'compliance_failed') { setWorkflowMessage('Compliance Check Failed. Payment cannot proceed.'); setIsLoading(false); } else if (workflowState === '2fa_passed') { setIsLoading(false); setWorkflowMessage('Authentication successful. Please confirm to initiate the payment.'); } else if (workflowState === 'idle') { setWorkflowMessage(''); setIsLoading(false); setTwoFactorCode(''); setIsCodeSent(false); }
   }, [workflowState]);


  // --- Handlers --- (Unchanged)
  const handleContinueToReview = (event) => { /* ... */ event.preventDefault(); if (!validateForm()) { console.log("Form validation failed:", errors); return; } setFormStep('review'); setWorkflowState('idle'); };
  const handleProceedToWorkflow = () => { setFormStep('confirm'); setWorkflowState('pending_compliance'); };
  const handleBackToDetails = () => { setFormStep('details'); setWorkflowState('idle'); setErrors({}); };
  const handleBackToReview = () => { setFormStep('review'); setWorkflowState('idle'); };
  const handleSend2FACode = () => { /* ... */ if (isLoading) return; setIsLoading(true); setWorkflowMessage('Sending 2FA code...'); setTimeout(() => { setIsCodeSent(true); setWorkflowMessage('Code sent to registered device (Simulated). Please enter the code below.'); setIsLoading(false); }, 1000); };
  const handleVerify2FA = () => { /* ... */ if (isLoading) return; if (twoFactorCode === '123456789') { setIsLoading(true); setWorkflowMessage('Code verified successfully. Preparing final confirmation...'); setTimeout(() => { setWorkflowState('2fa_passed'); setIsLoading(false); }, 500); } else { alert('Incorrect code. Please try again.'); setTwoFactorCode(''); } };
  const handleConfirmPayment = () => { /* ... (unchanged submission data construction) ... */
      if (workflowState !== '2fa_passed') return; console.log('Confirming payment...'); const isClientPayment = paymentOrigin === 'client'; const isTraditional = paymentType === 'traditional'; const isOnChain = paymentType === 'on-chain'; const paymentAPIData = { destination_counterparty_info: { name: recipientName, accountIdentifier: recipientAccount, institution: recipientInstitution, ...(isClientPayment && paymentType !== 'internal' && { jurisdiction: recipientJurisdiction }) }, payment_source: { account_id: senderAccountId }, payment_info: { amount: amountNumber, currency: currency, purpose: purpose, description: description || debitReference }, _ui_payment_type: paymentType, _ui_payment_origin: paymentOrigin, _ui_sender_account_label: selectedSenderAsset?.label || 'Unknown', ...(isTraditional && { _ui_settlement_speed: settlementSpeed, _ui_traditional_rail: traditionalRail }), ...(isOnChain && { _ui_onchain_network: effectiveOnChainNetwork }), _ui_date_type: dateType, _ui_scheduled_date: dateType === 'scheduled' ? scheduledDate : null, _simulated_fee: previewData.fee, _simulated_network_fee: previewData.networkFee, _ui_network_fee_display: previewData.networkFeeDisplay, _simulated_total_debit: previewData.total, ...(isClientPayment && paymentType !== 'internal' && { _simulated_exchange_rate: previewData.exchangeRate, _simulated_recipient_amount: previewData.receivedAmount, _simulated_recipient_currency: previewData.receivedCurrencySymbol, }) }; console.log("Compiled Payment Data (API Structure):", paymentAPIData); onPaymentSubmit(paymentAPIData);
   };
  const renderError = (fieldName) => { /* ... */ return errors[fieldName] ? <p className="text-xs text-red-600 mt-1">{errors[fieldName]}</p> : null; };

  // renderReviewData remains unchanged (already updated previously)
  const renderReviewData = () => { /* ... (JSX unchanged from previous version) ... */
      const isTraditional = paymentType === 'traditional'; const isOnChain = paymentType === 'on-chain'; const isInternal = paymentType === 'internal'; const effectiveSettlement = isTraditional ? (settlementSpeeds[settlementSpeed]?.label || settlementSpeed) : 'Instant';
      return ( <div className='p-4 border rounded bg-gray-50 mb-6 space-y-3 text-sm'> <h3 className="font-semibold text-base mb-3 border-b pb-2 text-gray-800">Payment Review Summary</h3> <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3"> <div className="md:col-span-2 font-medium text-gray-700 border-b pb-1 mb-1">Origin & Type</div> <dt className="text-gray-500">Payment Origin:</dt><dd className="font-medium">{paymentOrigin === 'client' ? 'Client Payment' : 'Institutional Payment'}</dd> <dt className="text-gray-500">Payment Type:</dt><dd>{paymentType === 'on-chain' ? 'On-Chain Payments' : paymentType === 'traditional' ? 'Traditional Payments' : paymentType === 'internal' ? 'Internal Transfer' : 'N/A'}</dd> {isTraditional && <> <dt className="text-gray-500">Payment Rail:</dt><dd>{traditionalRail}</dd> </>} {isOnChain && <> <dt className="text-gray-500">Network:</dt><dd>{effectiveOnChainNetwork || 'N/A'}</dd> </>} <div className="md:col-span-2 font-medium text-gray-700 border-b pb-1 mb-1 mt-2">Sender Details</div> {paymentOrigin === 'institutional' && !isInternal && <><dt className="text-gray-500">From Entity:</dt><dd>{senderEntity}</dd></>} <dt className="text-gray-500">From Account:</dt><dd className="font-medium">{selectedSenderAsset?.label} ({selectedSenderAsset?.symbol})</dd> <dt className="text-gray-500">Debit Reference:</dt><dd>{debitReference || <span className="italic text-gray-500">None</span>}</dd> <div className="md:col-span-2 font-medium text-gray-700 border-b pb-1 mb-1 mt-2">Recipient Details</div> {paymentOrigin === 'client' && !isInternal && <> <dt className="text-gray-500">Recipient Jurisdiction:</dt> <dd>{targetJurisdictionInfo?.name || 'N/A'}</dd> </>} <dt className="text-gray-500">Recipient Name:</dt><dd>{recipientName}</dd> <dt className="text-gray-500">Recipient Account:</dt><dd className="break-all">{recipientAccount}</dd> <dt className="text-gray-500">Recipient Institution:</dt><dd>{recipientInstitution}</dd> <div className="md:col-span-2 font-medium text-gray-700 border-b pb-1 mb-1 mt-2">Transfer Details</div> <dt className="text-gray-500">Amount to Send:</dt><dd className="font-semibold">{previewData.paymentAmount.toLocaleString()} {previewData.currencySymbol}</dd> {paymentOrigin === 'client' && !isInternal && previewData.exchangeRate && previewData.receivedAmount !== null && (<> <dt className="text-gray-500">Exchange Rate (Est.):</dt> <dd>1 {previewData.currencySymbol} ≈ {previewData.exchangeRate.toFixed(4)} {previewData.receivedCurrencySymbol}</dd> <dt className="text-gray-500 font-semibold">Recipient Receives (Est.):</dt> <dd className="font-semibold">{previewData.receivedAmount.toLocaleString(undefined, {maximumFractionDigits: 2})} {previewData.receivedCurrencySymbol}</dd> </>)} <dt className="text-gray-500">Settlement Speed:</dt><dd>{effectiveSettlement}</dd> <dt className="text-gray-500">Payment Date:</dt><dd>{dateType === 'scheduled' ? scheduledDate : 'Immediate'}</dd> <dt className="text-gray-500">Purpose:</dt><dd>{purpose}</dd> <dt className="text-gray-500">Description:</dt><dd>{description || <span className="italic text-gray-500">None</span>}</dd> {(previewData.fee > 0 || previewData.networkFee > 0) ? ( <> <dt className="text-gray-500 pt-2 border-t">Fees:</dt><dd className="pt-2 border-t"></dd> {previewData.fee > 0 && <> <dt className="text-gray-500 pl-4">Settlement Fee:</dt> <dd>{previewData.fee.toLocaleString(undefined, {maximumFractionDigits: 4})} {previewData.currencySymbol}</dd> </> } {previewData.networkFeeDisplay ? <> <dt className="text-gray-500 pl-4">{isOnChain ? 'Network Fee (Est.):' : 'Rail Fee:'}</dt> <dd>{previewData.networkFeeDisplay}</dd> </> : previewData.networkFee > 0 ? <> <dt className="text-gray-500 pl-4">{isOnChain ? 'Network Fee (Est.):' : 'Rail Fee:'}</dt> <dd>{previewData.networkFee.toLocaleString(undefined, {maximumFractionDigits: 4})} {previewData.currencySymbol}</dd> </> : null } </> ) : ( <> <dt className="text-gray-500 pt-2 border-t">Fees:</dt><dd className="pt-2 border-t italic text-gray-500">None</dd> </> )} <dt className="font-semibold text-gray-800 pt-2 border-t">Total Estimated Debit:</dt><dd className="font-semibold text-gray-800 pt-2 border-t text-right text-base">{previewData.total.toLocaleString(undefined, {maximumFractionDigits: 4})} {previewData.currencySymbol}</dd> </dl> </div> );
   };


  // --- Render Logic ---
  return (
    <div className="bg-white p-6 rounded shadow max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 border-b pb-3"> <h1 className="text-2xl font-bold text-gray-800">Create New Payment</h1> <button className="px-3 py-1 rounded text-white hover:opacity-90 bg-gray-800 text-sm" onClick={onBack} > Back to Dashboard </button> </div>
        {/* Step Indicator */}
        <div className="mb-8"> {/* ... */} <div className="flex items-center justify-between"> {['Payment Details', 'Review', 'Confirm'].map((stepName, index) => { const stepValue = stepName.toLowerCase().split(' ')[0]; const isActive = formStep === stepValue; const isCompleted = (formStep === 'review' && index < 1) || (formStep === 'confirm' && index < 2); return ( <React.Fragment key={stepName}> <div className="w-1/3 text-center"> <div className={`rounded-full h-10 w-10 flex items-center justify-center mx-auto transition-colors duration-300 ${ isCompleted ? 'bg-green-600 text-white' : (isActive ? 'bg-emtech-gold text-white' : 'bg-gray-200 text-gray-600') }`}> {isCompleted ? '✓' : index + 1} </div> <p className={`mt-1 text-sm transition-colors duration-300 ${isCompleted || isActive ? 'font-medium text-gray-800' : 'text-gray-500'}`}>{stepName}</p> </div> {index < 2 && ( <div className={`flex-1 h-1 transition-colors duration-300 ${isCompleted ? 'bg-green-600' : 'bg-gray-200'}`}></div> )} </React.Fragment> ); })} </div> </div>

        {/* --- Step 1: Payment Details --- */}
        {formStep === 'details' && (
            <form onSubmit={handleContinueToReview}>
                {/* Payment Origin Toggle */}
                <div className="mb-6"> <h2 className="font-medium mb-2 text-gray-800">Payment Origin <span className="text-red-600">*</span></h2> {/* ... */} <div className="grid grid-cols-2 gap-0 border border-gray-300 rounded-md overflow-hidden"> <button type="button" onClick={() => setPaymentOrigin('institutional')} className={`w-full px-4 py-2 text-center text-sm font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 ${ paymentOrigin === 'institutional' ? 'bg-blue-700 text-white shadow-inner' : 'bg-white text-gray-700 hover:bg-gray-100' }`} > Institutional Payment </button> <button type="button" onClick={() => setPaymentOrigin('client')} className={`w-full px-4 py-2 text-center text-sm font-medium transition-colors duration-150 border-l border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 ${ paymentOrigin === 'client' ? 'bg-blue-700 text-white shadow-inner' : 'bg-white text-gray-700 hover:bg-gray-100' }`} > Client Payment </button> </div> </div>
                {/* Payment Type Selection */}
                <div className="mb-6"> <h2 className="font-medium mb-3 text-gray-800">Payment Type <span className="text-red-600">*</span></h2> {/* ... */} <div className="grid grid-cols-1 sm:grid-cols-3 gap-3"> <label className={`border rounded p-3 cursor-pointer hover:shadow-md transition-shadow ${paymentType === 'on-chain' ? 'border-emtech-gold bg-yellow-50' : 'border-gray-300'}`}> <div className="flex items-center"> <input type="radio" name="paymentType" value="on-chain" checked={paymentType === 'on-chain'} onChange={(e) => setPaymentType(e.target.value)} className="mr-2 h-4 w-4 text-emtech-gold focus:ring-emtech-gold"/> <div> <p className="font-medium text-sm">On-Chain Payments</p> <p className="text-xs text-gray-500">Using tokenized assets</p> </div> </div> </label><label className={`border rounded p-3 cursor-pointer hover:shadow-md transition-shadow ${paymentType === 'traditional' ? 'border-emtech-gold bg-yellow-50' : 'border-gray-300'}`}> <div className="flex items-center"> <input type="radio" name="paymentType" value="traditional" checked={paymentType === 'traditional'} onChange={(e) => setPaymentType(e.target.value)} className="mr-2 h-4 w-4 text-emtech-gold focus:ring-emtech-gold"/> <div> <p className="font-medium text-sm">Traditional Payments</p> <p className="text-xs text-gray-500">SWIFT / Bank Rails</p> </div> </div> </label><label className={`border rounded p-3 cursor-pointer hover:shadow-md transition-shadow ${paymentType === 'internal' ? 'border-emtech-gold bg-yellow-50' : 'border-gray-300'}`}> <div className="flex items-center"> <input type="radio" name="paymentType" value="internal" checked={paymentType === 'internal'} onChange={(e) => setPaymentType(e.target.value)} className="mr-2 h-4 w-4 text-emtech-gold focus:ring-emtech-gold"/> <div> <p className="font-medium text-sm">Internal Transfer</p> <p className="text-xs text-gray-500">Within platform</p> </div> </div> </label></div> </div>

                {/* --- Integrate Sub-components --- */}
                 <TraditionalPaymentFields
                     paymentType={paymentType}
                     traditionalRail={traditionalRail}
                     setTraditionalRail={setTraditionalRail}
                     settlementSpeed={settlementSpeed}
                     setSettlementSpeed={setSettlementSpeed}
                     traditionalRailsList={traditionalRailsList} // Pass data
                     settlementSpeeds={settlementSpeeds}         // Pass data
                     error={errors.traditionalRail}              // Pass error state
                     clearError={() => setErrors(prev => ({ ...prev, traditionalRail: null }))} // Pass clearer
                 />
                 <OnChainPaymentFields
                     paymentType={paymentType}
                     paymentOrigin={paymentOrigin}
                     selectedSenderAsset={selectedSenderAsset}
                     onChainNetwork={onChainNetwork}
                     setOnChainNetwork={setOnChainNetwork}
                     onChainNetworksList={onChainNetworksList} // Pass data
                     error={errors.onChainNetwork}             // Pass error state
                     clearError={() => setErrors(prev => ({ ...prev, onChainNetwork: null }))} // Pass clearer
                 />
                {/* --- End Sub-components --- */}

                {/* From / To Sections */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    {/* From Section */}
                    <div> <h2 className="font-medium mb-3 text-gray-800">From</h2> <div className="space-y-4">
                        {paymentOrigin === 'institutional' && paymentType !== 'internal' && ( /* ... Entity ... */ <div> <label htmlFor="senderEntity" className="block mb-1 text-sm">Sending Entity <span className="text-red-600">*</span></label> <select id="senderEntity" className="w-full p-2 border rounded bg-white text-sm" value={senderEntity} onChange={(e) => setSenderEntity(e.target.value)} required> {sampleEntities.map(entity => (<option key={entity} value={entity}>{entity}</option>))} </select> </div> )}
                        <div> <label htmlFor="senderAccount" className="block mb-1 text-sm"> {paymentOrigin === 'client' ? 'Client Account ' : 'Account/Wallet '} <span className="text-red-600">*</span> </label> <select id="senderAccount" className={`w-full p-2 border rounded bg-white text-sm ${errors.senderAccountId ? 'border-red-500' : 'border-gray-300'}`} value={senderAccountId} onChange={(e) => {setSenderAccountId(e.target.value); setErrors(prev => ({ ...prev, senderAccountId: null }));}} required> <option value="" disabled>-- Select {paymentOrigin === 'client' ? 'Client Account' : 'Source Account'} --</option> {availableSenderAccounts.map(account => ( <option key={account.id} value={account.id}> {account.label} ({account.balance.toLocaleString()} {account.symbol}) </option> ))} </select> {renderError('senderAccountId')} {selectedSenderAsset && <p className="text-xs text-gray-500 mt-1">Selected Balance: {selectedSenderAsset.balance.toLocaleString()} {selectedSenderAsset.symbol}</p>} </div>
                        <div> <label htmlFor="debitRef" className="block mb-1 text-sm">Debit Reference</label> <input id="debitRef" type="text" className="w-full p-2 border rounded text-sm border-gray-300" placeholder="Internal reference ID" value={debitReference} onChange={(e) => setDebitReference(e.target.value)} /> </div>
                    </div> </div>
                    {/* To Section */}
                    <div> <h2 className="font-medium mb-3 text-gray-800">To</h2> <div className="space-y-4">
                        {paymentOrigin === 'client' && paymentType !== 'internal' && ( <div> <label htmlFor="recipientJurisdiction" className="block mb-1 text-sm">Recipient Jurisdiction <span className="text-red-600">*</span></label> <select id="recipientJurisdiction" className={`w-full p-2 border rounded bg-white text-sm ${errors.recipientJurisdiction ? 'border-red-500' : 'border-gray-300'}`} value={recipientJurisdiction} onChange={(e) => {setRecipientJurisdiction(e.target.value); setErrors(prev => ({ ...prev, recipientJurisdiction: null }));}} required={paymentOrigin === 'client' && paymentType !== 'internal'}> {jurisdictions.map(j => (<option key={j.code} value={j.code} disabled={j.code === ''}>{j.name}</option>))} </select> {renderError('recipientJurisdiction')} </div> )}
                        <div> <label htmlFor="recipientName" className="block mb-1 text-sm">Recipient Name</label> <input id="recipientName" type="text" className="w-full p-2 border rounded text-sm border-gray-300" placeholder="Beneficiary name" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} /> </div>
                        <div> <label htmlFor="recipientAccount" className="block mb-1 text-sm">Recipient Identifier <span className="text-red-600">*</span></label> <input id="recipientAccount" type="text" className={`w-full p-2 border rounded text-sm ${errors.recipientAccount ? 'border-red-500' : 'border-gray-300'}`} placeholder={paymentType === 'internal' ? 'Internal Account/Wallet ID' : 'Account #, Wallet Address, etc.'} value={recipientAccount} onChange={(e) => {setRecipientAccount(e.target.value); setErrors(prev => ({ ...prev, recipientAccount: null }));}} required /> {renderError('recipientAccount')}</div>
                        {paymentType !== 'internal' && <div> <label htmlFor="recipientInst" className="block mb-1 text-sm">Recipient Institution / Network</label> <input id="recipientInst" type="text" className="w-full p-2 border rounded text-sm border-gray-300" placeholder="e.g., HSBC London, Ethereum Mainnet" value={recipientInstitution} onChange={(e) => setRecipientInstitution(e.target.value)} /> </div>}
                    </div> </div>
                </div>

                {/* Payment Details */}
                <div className="mt-6"> <h2 className="font-medium mb-3 text-gray-800">Payment Details</h2> <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4"> <div className="space-y-4">
                    {/* Amount */}
                    <div> <label htmlFor="amount" className="block mb-1 text-sm">Amount ({currency || '---'}) <span className="text-red-600">*</span></label> <div className="flex"> <input id="amount" type="number" min="0" step="any" className={`flex-1 p-2 border-l border-t border-b rounded-l text-sm ${errors.amount ? 'border-red-500' : 'border-gray-300'}`} placeholder="Enter amount to send" value={amount} onChange={(e) => {setAmount(e.target.value); setErrors(prev => ({ ...prev, amount: null }));}} required disabled={!currency} /> <span className={`inline-flex items-center px-3 p-2 border-r border-t border-b rounded-r border-l-0 bg-gray-100 text-gray-600 text-sm ${errors.amount ? 'border-red-500' : 'border-gray-300'}`}> {currency || '---'} </span> </div> {renderError('amount')} </div>
                    {/* Settlement Speed handled by TraditionalPaymentFields or implicitly Instant */}
                    {(paymentType === 'on-chain' || paymentType === 'internal') && <div><label className="block mb-1 text-sm">Settlement Speed</label><input type="text" value="Instant" className="w-full p-2 border rounded bg-gray-100 text-sm border-gray-300" readOnly disabled/></div>}
                 </div> <div className="space-y-4">
                    {/* Payment Date */}
                    <div> <label className="block mb-1 text-sm">Payment Date</label> <div className="flex space-x-2"> <div className="flex-1"> <select className="w-full p-2 border rounded bg-white text-sm border-gray-300" value={dateType} onChange={(e) => {setDateType(e.target.value); if(e.target.value === 'immediate') { setErrors(prev => ({ ...prev, scheduledDate: null })); } }}> <option value="immediate">Immediate</option> <option value="scheduled">Scheduled</option> </select> </div> <input type="date" className={`flex-1 p-2 border rounded text-sm ${errors.scheduledDate ? 'border-red-500' : 'border-gray-300'} ${dateType !== 'scheduled' ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`} value={scheduledDate} onChange={(e) => {setScheduledDate(e.target.value); setErrors(prev => ({ ...prev, scheduledDate: null })); }} min={new Date().toISOString().split('T')[0]} disabled={dateType !== 'scheduled'} required={dateType === 'scheduled'} /> </div> {renderError('scheduledDate')} </div>
                    {/* Purpose */}
                    <div> <label htmlFor="purpose" className="block mb-1 text-sm">Purpose <span className="text-red-600">*</span></label> <select id="purpose" className={`w-full p-2 border rounded bg-white text-sm ${errors.purpose ? 'border-red-500' : 'border-gray-300'}`} value={purpose} onChange={(e) => {setPurpose(e.target.value); setErrors(prev => ({ ...prev, purpose: null }));}} required> {samplePurposes.map(p => (<option key={p} value={p === 'Select purpose code' ? '' : p} disabled={p === 'Select purpose code'}>{p}</option>))} </select> {renderError('purpose')} </div>
                </div> </div>
                {/* Description */}
                <div className="mt-4"> <label htmlFor="description" className="block mb-1 text-sm">Payment Description</label> <textarea id="description" className="w-full p-2 border rounded text-sm border-gray-300" rows="2" placeholder="Additional payment details (for recipient or logs)" value={description} onChange={(e) => setDescription(e.target.value)}></textarea> </div> </div>

                {/* Preview Section */}
                <div className="mt-6"> <h2 className="font-medium mb-3 text-gray-800">Preview</h2> {/* ... preview JSX unchanged ... */} <div className="p-4 bg-gray-50 rounded border border-gray-200 text-sm"> <div className="space-y-2"> <div className="flex justify-between"> <span className="text-gray-600">Amount Sent:</span> <span className="font-medium">{previewData.paymentAmount.toLocaleString()} {previewData.currencySymbol}</span> </div> {paymentOrigin === 'client' && paymentType !== 'internal' && previewData.exchangeRate && previewData.receivedAmount !== null && (<> <div className="flex justify-between"> <span className="text-gray-600">FX Rate (Est.):</span> <span className="text-xs">1 {previewData.currencySymbol} ≈ {previewData.exchangeRate.toFixed(4)} {previewData.receivedCurrencySymbol}</span> </div> <div className="flex justify-between"> <span className="text-gray-600">Received (Est.):</span> <span className="font-medium">{previewData.receivedAmount.toLocaleString(undefined, {maximumFractionDigits: 2})} {previewData.receivedCurrencySymbol}</span> </div> </>)} {(previewData.fee > 0 || previewData.networkFee > 0) ? ( <> {previewData.fee > 0 && <div className="flex justify-between"> <span className="text-gray-600">Settlement Fee:</span> <span className="font-medium">{previewData.fee.toLocaleString(undefined, {maximumFractionDigits: 4})} {previewData.currencySymbol}</span> </div>} {previewData.networkFeeDisplay ? <div className="flex justify-between"> <span className="text-gray-600">{paymentType === 'on-chain' ? 'Network Fee (Est.):' : 'Rail Fee:'}</span> <span className="font-medium">{previewData.networkFeeDisplay}</span> </div> : previewData.networkFee > 0 ? <div className="flex justify-between"> <span className="text-gray-600">{paymentType === 'on-chain' ? 'Network Fee (Est.):' : 'Rail Fee:'}</span> <span className="font-medium">{previewData.networkFee.toLocaleString(undefined, {maximumFractionDigits: 4})} {previewData.currencySymbol}</span> </div> : null} </> ) : ( <div className="flex justify-between"> <span className="text-gray-600">Fees:</span> <span className="font-medium italic text-gray-500">None</span> </div> )} <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between font-semibold"> <span>Total Debit:</span> <span>{previewData.total.toLocaleString(undefined, {maximumFractionDigits: 4})} {previewData.currencySymbol}</span> </div> </div> </div> </div>

                {/* Action Buttons */}
                <div className="mt-8 flex space-x-3 justify-end"> <button type="button" className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-50" onClick={onBack} > Cancel </button> <button type="submit" className="px-4 py-2 rounded text-white hover:opacity-90 bg-emtech-gold disabled:opacity-50"> Continue to Review </button> </div>
            </form>
        )}

        {/* --- Step 2: Review --- */}
        {formStep === 'review' && ( /* ... Review JSX unchanged ... */ <div> <h2 className="text-xl font-medium mb-4 text-gray-800">Review Payment</h2> <p className="text-gray-600 mb-6">Please review the details below before proceeding to confirmation steps.</p> {renderReviewData()} <div className="mt-8 flex space-x-3 justify-between"> <button type="button" className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-50" onClick={handleBackToDetails} > Back to Edit </button> <button type="button" className="px-4 py-2 rounded text-white hover:opacity-90 bg-green-600" onClick={handleProceedToWorkflow}> Proceed to Confirm </button> </div> </div> )}

        {/* --- Step 3: Confirm (Includes Workflow) --- */}
        {formStep === 'confirm' && ( /* ... Confirm JSX with Workflow unchanged ... */ <div> <h2 className="text-xl font-medium mb-4 text-gray-800">Confirm Payment Initiation</h2> {renderReviewData()} <div className={`mt-6 p-4 border rounded-lg ${ workflowState === 'compliance_failed' ? 'bg-red-50 border-red-300' : workflowState === '2fa_passed' ? 'bg-green-50 border-green-300' : 'bg-blue-50 border-blue-300' }`}> <div className="flex items-start"> <div className="flex-shrink-0 mr-3"> {workflowState === 'pending_compliance' || workflowState === 'pending_2fa' || isLoading ? (<svg className="animate-spin h-6 w-6 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"> <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle> <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path> </svg>) : workflowState === 'compliance_passed' ? (<div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center"><svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg></div>) : workflowState === 'compliance_failed' ? (<div className="h-6 w-6 rounded-full bg-red-100 flex items-center justify-center"><svg className="h-4 w-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></div>) : workflowState === '2fa_passed' ? (<div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center"><svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg></div>) : null } </div> <div className="flex-grow"> <h3 className={`text-lg font-semibold mb-1 ${ workflowState === 'compliance_failed' ? 'text-red-800' : workflowState === '2fa_passed' ? 'text-green-800' : 'text-blue-800' }`}>Confirmation Status</h3> <p className={`mb-3 text-sm ${ workflowState === 'compliance_failed' ? 'text-red-700' : 'text-gray-700' }`}> {isLoading ? 'Processing...' : workflowMessage || 'Initiating confirmation steps...'} </p> {workflowState === 'compliance_failed' && !isLoading && ( <p className="text-red-700 font-medium text-sm">Please review the payment details or contact support.</p> )} {workflowState === 'pending_2fa' && !isLoading && ( <div className="mt-4 space-y-3"> <div className="flex items-end space-x-3"> <div className="flex-grow"> <label htmlFor="2fa_code" className="block text-sm font-medium text-gray-700">Enter 2FA Code</label> <input type="text" id="2fa_code" className="mt-1 w-full p-2 border rounded text-sm" placeholder="Enter 9-digit code (123456789)" value={twoFactorCode} onChange={(e) => setTwoFactorCode(e.target.value)} maxLength={9} disabled={!isCodeSent} /> </div> <button type="button" className={`px-3 py-2 border rounded text-sm whitespace-nowrap ${!isCodeSent ? 'bg-white border-gray-300 hover:bg-gray-50' : 'bg-gray-100 text-gray-500 cursor-not-allowed'}`} onClick={handleSend2FACode} disabled={isCodeSent} > {isCodeSent ? 'Code Sent' : 'Send Code'} </button> </div> <button type="button" className="w-full px-4 py-2 rounded text-white hover:opacity-90 bg-blue-600 disabled:opacity-50" onClick={handleVerify2FA} disabled={!isCodeSent || twoFactorCode.length !== 9} > Verify Code </button> </div> )} {workflowState === '2fa_passed' && !isLoading && ( <div className="mt-4 p-4 border-t border-gray-200"> <p className="text-sm text-green-700 font-medium mb-4">All checks passed. Ready to initiate payment.</p> <button type="button" className="w-full px-4 py-2 rounded text-white hover:opacity-90 bg-green-700 font-semibold" onClick={handleConfirmPayment} > Confirm & Initiate Payment </button> </div> )} </div> </div> </div> <div className="mt-8 flex space-x-3 justify-between"> {(workflowState === 'idle' || workflowState === 'pending_compliance' || workflowState === 'pending_2fa') && !isLoading ? ( <button type="button" className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-50" onClick={handleBackToReview} > Back to Review </button> ) : ( <div/> )} <button type="button" className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-50" onClick={handleBackToDetails} disabled={isLoading}> Cancel / Back to Edit </button> </div> </div> )}

    </div> // End main container
  );
};

export default CreatePaymentScreen;