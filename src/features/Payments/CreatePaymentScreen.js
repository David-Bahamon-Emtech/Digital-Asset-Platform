// src/features/Payments/CreatePaymentScreen.js
import React, { useState, useEffect, useMemo } from 'react';

// --- Helper Data (Simulated) ---
const sampleEntities = ['Citi New York', 'Citi London', 'Citi Singapore', 'Citi Mumbai'];
const samplePurposes = ['Select purpose code', 'BKTR', 'CBFT', 'CORT', 'GOVT', 'TREA', 'SUPP']; // API uses 'purpose', let's assume these codes fit
const settlementSpeeds = { // Keep this for UI simulation, though not directly in Rail API create step
    standard: { label: 'Standard (1-3 minutes)', feePercent: 0.001 },
    express: { label: 'Express (10-30 seconds)', feePercent: 0.0025 },
    instant: { label: 'Instant (1-5 seconds)', feePercent: 0.005 },
};
const generateDummyClientAccounts = (count = 30) => { /* ... (function unchanged from previous version) ... */
    const accounts = []; const currencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'SGD']; const accountTypes = ['Checking', 'Savings', 'Brokerage', 'Operating'];
    for (let i = 1; i <= count; i++) { const currency = currencies[i % currencies.length]; const lastFourDigits = String(Math.floor(Math.random() * 9000) + 1000); const clientLetter = String.fromCharCode(65 + (i % 26)); const accountType = accountTypes[i % accountTypes.length]; const label = `Client ${clientLetter} ${accountType} (...${lastFourDigits})`; accounts.push({ id: `client-${i}-${lastFourDigits}`, label: label, balance: Math.floor(Math.random() * (currency === 'USD' || currency === 'EUR' || currency === 'GBP' ? 500000 : 5000)) + 1000, symbol: currency, blockchain: 'N/A (Client Account)' }); }
    accounts.push({ id: 'client-usdc-1', label: 'Client A USDC Wallet (...3456)', balance: 15000, symbol: 'USDC', blockchain: 'Stellar'}); accounts.push({ id: 'client-usdt-1', label: 'Client B USDT Wallet (...7890)', balance: 8500, symbol: 'USDT', blockchain: 'Ethereum'}); return accounts;
};
const dummyClientAccounts = generateDummyClientAccounts(30);

// --- Component ---
const CreatePaymentScreen = ({ assets = [], onBack, onPaymentSubmit }) => {

  // --- State ---
  const [formStep, setFormStep] = useState('details');
  const [paymentType, setPaymentType] = useState('on-chain'); // <-- Default to new name
  const [paymentOrigin, setPaymentOrigin] = useState('institutional');
  // Form Input State (Mostly unchanged)
  const [senderEntity, setSenderEntity] = useState(sampleEntities[0] || '');
  const [senderAccountId, setSenderAccountId] = useState(''); // Maps to payment_source.account_id
  const [debitReference, setDebitReference] = useState(''); // Can map to payment_info.description or a custom field
  const [recipientName, setRecipientName] = useState(''); // Part of destination counterparty info
  const [recipientAccount, setRecipientAccount] = useState(''); // Part of destination counterparty info
  const [recipientInstitution, setRecipientInstitution] = useState(''); // Part of destination counterparty info
  // Removed recipientBankSwift as maybe recipientAccount is enough for counterparty? Add back if needed.
  // const [intermediaryBankSwift, setIntermediaryBankSwift] = useState(''); // Removed for simplicity based on API examples
  const [amount, setAmount] = useState(''); // Maps to payment_info.amount
  const [currency, setCurrency] = useState(''); // Implicit via source account
  const [settlementSpeed, setSettlementSpeed] = useState('standard'); // UI simulation only
  const [dateType, setDateType] = useState('immediate'); // UI simulation only (API might add later)
  const [scheduledDate, setScheduledDate] = useState(''); // UI simulation only
  const [purpose, setPurpose] = useState(''); // Maps to payment_info.purpose
  const [description, setDescription] = useState(''); // Maps to payment_info.description
  const [complianceConfirmed, setComplianceConfirmed] = useState(false); // UI confirmation
  const [authCode, setAuthCode] = useState(''); // UI confirmation

  // Preview State (Unchanged)
  const [previewData, setPreviewData] = useState({ paymentAmount: 0, fee: 0, networkFee: 0, total: 0, currencySymbol: '' });

  // --- Derived Data ---
  const availableSenderAccounts = useMemo(() => (paymentOrigin === 'client' ? dummyClientAccounts : assets), [paymentOrigin, assets]);
  const selectedSenderAsset = useMemo(() => availableSenderAccounts.find(a => a.id === senderAccountId), [availableSenderAccounts, senderAccountId]);
  const amountNumber = useMemo(() => parseFloat(amount) || 0, [amount]);
  // Simplified validation, assuming recipientAccount holds key destination identifier
  const isFormValidForReview = useMemo(() => {
      return senderAccountId && amountNumber > 0 && selectedSenderAsset && amountNumber <= selectedSenderAsset.balance &&
             recipientAccount.trim() && // Main recipient identifier
             purpose && // API doc table lists purpose as mandatory [cite: 11]
             complianceConfirmed && authCode.trim() && // UI confirmations
             (dateType !== 'scheduled' || scheduledDate); // Date logic for UI
  }, [senderAccountId, amountNumber, selectedSenderAsset, recipientAccount, purpose, complianceConfirmed, authCode, dateType, scheduledDate]);


  // --- Effects ---
  // (Effects for currency derivation and preview calculation remain unchanged)
  useEffect(() => { setSenderAccountId(''); }, [paymentOrigin]);
  useEffect(() => { setCurrency(selectedSenderAsset?.symbol || ''); if (!selectedSenderAsset) setAmount(''); }, [selectedSenderAsset]);
  useEffect(() => {
      const calculatedPreview = { paymentAmount: 0, fee: 0, networkFee: 0, total: 0, currencySymbol: currency || '' };
      if (amountNumber > 0 && currency) {
          calculatedPreview.paymentAmount = amountNumber;
          const speedData = settlementSpeeds[settlementSpeed];
          if (speedData) { calculatedPreview.fee = amountNumber * speedData.feePercent; }
          if (paymentType === 'traditional') calculatedPreview.networkFee = 5; else calculatedPreview.networkFee = 0; // SWIFT fee simulation
          calculatedPreview.total = calculatedPreview.paymentAmount + calculatedPreview.fee + calculatedPreview.networkFee;
      }
      setPreviewData(calculatedPreview);
  }, [amountNumber, currency, settlementSpeed, paymentType]);


  // --- Handlers ---
  const handleContinueToReview = (event) => { /* ... (validation logic unchanged) ... */ event.preventDefault(); if (!isFormValidForReview) { alert("Please fill out all required (*) fields..."); return; } setFormStep('review'); };
  const handleProceedToConfirm = () => { /* ... (unchanged) ... */ setFormStep('confirm'); };
  const handleBackToDetails = () => { /* ... (unchanged) ... */ setFormStep('details'); };

  // Update structure submitted to parent to align conceptually with API
  const handleConfirmPayment = () => {
    console.log('Confirming payment...');
    // Construct data conceptually mapping to POST /payments (I2E scenario)
    const paymentAPIData = {
      // Info representing the external destination counterparty
      destination_counterparty_info: { // Combining UI fields conceptually
          name: recipientName,
          accountIdentifier: recipientAccount, // Using this field as primary ID
          institution: recipientInstitution,
          // We could add swift code back here if needed for 'traditional' type
      },
      // Source account within Rail (our platform)
      payment_source: {
        account_id: senderAccountId, // The ID of the wallet/account selected
        // 'asset_type' isn't needed for I2E per API doc table [cite: 11]
      },
      // Payment details
      payment_info: {
        amount: amountNumber, // Amount in primary units (API might use minor units)
        currency: currency, // Currency derived from source account
        purpose: purpose, // Purpose code selected
        description: description || debitReference, // Use description, fallback to debit ref
      },
      // --- Additional UI/Demo specific fields ---
      _ui_payment_type: paymentType, // Track the UI selection
      _ui_payment_origin: paymentOrigin, // Track the UI selection
      _ui_sender_account_label: selectedSenderAsset?.label || 'Unknown',
      _ui_settlement_speed: settlementSpeed, // UI choice
      _ui_date_type: dateType, // UI choice
      _ui_scheduled_date: dateType === 'scheduled' ? scheduledDate : null, // UI choice
      _simulated_fee: previewData.fee, // Simulated fee
      _simulated_network_fee: previewData.networkFee, // Simulated fee
      _simulated_total_debit: previewData.total, // Simulated total
    };

    console.log("Compiled Payment Data (API Structure):", paymentAPIData);

    // Call the parent submission handler, passing the structured data
    // The parent will handle the balance simulation and history logging
    onPaymentSubmit(paymentAPIData);
  };

  // Update review data display
  const renderReviewData = () => (
    <div className='p-4 border rounded bg-gray-50 mb-6 space-y-3 text-sm'>
        <h3 className="font-semibold text-base mb-3 border-b pb-2 text-gray-800">Payment Review Summary</h3>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
            {/* Origin & Type */}
            <div className="md:col-span-2 font-medium text-gray-700 border-b pb-1 mb-1">Origin & Type</div>
            <dt className="text-gray-500">Payment Origin:</dt>
            <dd className="font-medium">{paymentOrigin === 'client' ? 'Client Payment' : 'Institutional Payment'}</dd>
            <dt className="text-gray-500">Payment Type:</dt>
            <dd>
              {paymentType === 'on-chain' ? 'On-Chain Payments' :
               paymentType === 'traditional' ? 'Traditional Payments' :
               paymentType === 'internal' ? 'Internal Transfer' : 'N/A'}
             </dd>
             {/* Sender */}
            <div className="md:col-span-2 font-medium text-gray-700 border-b pb-1 mb-1 mt-2">Sender Details</div>
            {paymentOrigin === 'institutional' && <><dt className="text-gray-500">From Entity:</dt><dd>{senderEntity}</dd></>}
            <dt className="text-gray-500">From Account:</dt><dd className="font-medium">{selectedSenderAsset?.label} ({selectedSenderAsset?.symbol})</dd>
            <dt className="text-gray-500">Debit Reference:</dt><dd>{debitReference || <span className="italic text-gray-500">None</span>}</dd>
             {/* Recipient */}
            <div className="md:col-span-2 font-medium text-gray-700 border-b pb-1 mb-1 mt-2">Recipient Details</div>
            <dt className="text-gray-500">Recipient Name:</dt><dd>{recipientName}</dd>
            <dt className="text-gray-500">Recipient Account:</dt><dd className="break-all">{recipientAccount}</dd>
            <dt className="text-gray-500">Recipient Institution:</dt><dd>{recipientInstitution}</dd>
            {/* Transfer */}
            <div className="md:col-span-2 font-medium text-gray-700 border-b pb-1 mb-1 mt-2">Transfer Details</div>
            <dt className="text-gray-500">Amount:</dt><dd className="font-semibold">{previewData.paymentAmount.toLocaleString()} {previewData.currencySymbol}</dd>
            <dt className="text-gray-500">Settlement Speed:</dt><dd>{settlementSpeeds[settlementSpeed]?.label || settlementSpeed}</dd>
            <dt className="text-gray-500">Payment Date:</dt><dd>{dateType === 'scheduled' ? scheduledDate : 'Immediate'}</dd>
            <dt className="text-gray-500">Purpose:</dt><dd>{purpose}</dd>
            <dt className="text-gray-500">Description:</dt><dd>{description || <span className="italic text-gray-500">None</span>}</dd>
            <dt className="text-gray-500 pt-2 border-t">Estimated Fee:</dt><dd className="pt-2 border-t">{previewData.fee.toLocaleString(undefined, {maximumFractionDigits: 4})} {previewData.currencySymbol}</dd>
            {previewData.networkFee > 0 && <> <dt className="text-gray-500">Network Fee:</dt><dd className="pt-2 border-t">{previewData.networkFee.toLocaleString(undefined, {maximumFractionDigits: 4})} {previewData.currencySymbol}</dd> </>}
            <dt className="font-semibold text-gray-800 pt-2 border-t">Total Estimated Debit:</dt><dd className="font-semibold text-gray-800 pt-2 border-t text-right text-base">{previewData.total.toLocaleString(undefined, {maximumFractionDigits: 4})} {previewData.currencySymbol}</dd>
        </dl>
    </div>
  );


  // --- Render Logic ---
  return (
    <div className="bg-white p-6 rounded shadow max-w-4xl mx-auto">
        {/* Header (Unchanged) */}
        <div className="flex justify-between items-center mb-6 border-b pb-3"> <h1 className="text-2xl font-bold text-gray-800">Create New Payment</h1> <button className="px-3 py-1 rounded text-white hover:opacity-90 bg-gray-800 text-sm" onClick={onBack} > Back to Dashboard </button> </div>
        {/* Multi-step Indicator (Unchanged) */}
        <div className="mb-8"> <div className="flex items-center justify-between"> {['Payment Details', 'Review', 'Confirm'].map((stepName, index) => { const stepValue = stepName.toLowerCase().split(' ')[0]; const isActive = formStep === stepValue; const isCompleted = (formStep === 'review' && index < 1) || (formStep === 'confirm' && index < 2); return ( <React.Fragment key={stepName}> <div className="w-1/3 text-center"> <div className={`rounded-full h-10 w-10 flex items-center justify-center mx-auto transition-colors duration-300 ${ isCompleted ? 'bg-green-600 text-white' : (isActive ? 'bg-emtech-gold text-white' : 'bg-gray-200 text-gray-600') }`}> {isCompleted ? '✓' : index + 1} </div> <p className={`mt-1 text-sm transition-colors duration-300 ${isCompleted || isActive ? 'font-medium text-gray-800' : 'text-gray-500'}`}>{stepName}</p> </div> {index < 2 && ( <div className={`flex-1 h-1 transition-colors duration-300 ${isCompleted ? 'bg-green-600' : 'bg-gray-200'}`}></div> )} </React.Fragment> ); })} </div> </div>

        {/* --- Step 1: Payment Details --- */}
        {formStep === 'details' && (
            <form onSubmit={handleContinueToReview}>

                {/* Payment Origin Toggle (Styled) */}
                <div className="mb-6"> <h2 className="font-medium mb-2 text-gray-800">Payment Origin <span className="text-red-600">*</span></h2> <div className="grid grid-cols-2 gap-0 border border-gray-300 rounded-md overflow-hidden"> <button type="button" onClick={() => setPaymentOrigin('institutional')} className={`w-full px-4 py-2 text-center text-sm font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 ${ paymentOrigin === 'institutional' ? 'bg-blue-700 text-white shadow-inner' : 'bg-white text-gray-700 hover:bg-gray-100' }`} > Institutional Payment </button> <button type="button" onClick={() => setPaymentOrigin('client')} className={`w-full px-4 py-2 text-center text-sm font-medium transition-colors duration-150 border-l border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 ${ paymentOrigin === 'client' ? 'bg-blue-700 text-white shadow-inner' : 'bg-white text-gray-700 hover:bg-gray-100' }`} > Client Payment </button> </div> </div>

                {/* Payment Type Selection - RENAMED LABELS */}
                <div className="mb-6"> <h2 className="font-medium mb-3 text-gray-800">Payment Type <span className="text-red-600">*</span></h2> <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* On-Chain */}
                    <label className={`border rounded p-3 cursor-pointer hover:shadow-md transition-shadow ${paymentType === 'on-chain' ? 'border-emtech-gold bg-yellow-50' : 'border-gray-300'}`}> <div className="flex items-center"> <input type="radio" name="paymentType" value="on-chain" checked={paymentType === 'on-chain'} onChange={(e) => setPaymentType(e.target.value)} className="mr-2 h-4 w-4 text-emtech-gold focus:ring-emtech-gold"/> <div> <p className="font-medium text-sm">On-Chain Payments</p> <p className="text-xs text-gray-500">Using tokenized assets</p> </div> </div> </label>
                    {/* Traditional */}
                    <label className={`border rounded p-3 cursor-pointer hover:shadow-md transition-shadow ${paymentType === 'traditional' ? 'border-emtech-gold bg-yellow-50' : 'border-gray-300'}`}> <div className="flex items-center"> <input type="radio" name="paymentType" value="traditional" checked={paymentType === 'traditional'} onChange={(e) => setPaymentType(e.target.value)} className="mr-2 h-4 w-4 text-emtech-gold focus:ring-emtech-gold"/> <div> <p className="font-medium text-sm">Traditional Payments</p> <p className="text-xs text-gray-500">SWIFT / Bank Rails</p> </div> </div> </label>
                    {/* Internal */}
                    <label className={`border rounded p-3 cursor-pointer hover:shadow-md transition-shadow ${paymentType === 'internal' ? 'border-emtech-gold bg-yellow-50' : 'border-gray-300'}`}> <div className="flex items-center"> <input type="radio" name="paymentType" value="internal" checked={paymentType === 'internal'} onChange={(e) => setPaymentType(e.target.value)} className="mr-2 h-4 w-4 text-emtech-gold focus:ring-emtech-gold"/> <div> <p className="font-medium text-sm">Internal Transfer</p> <p className="text-xs text-gray-500">Within platform</p> </div> </div> </label>
                </div> </div>

                {/* From / To Sections */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    {/* From Section (Conditional Dropdown) */}
                    <div> <h2 className="font-medium mb-3 text-gray-800">From</h2> <div className="space-y-4"> {paymentOrigin === 'institutional' && ( <div> <label htmlFor="senderEntity" className="block mb-1 text-sm">Sending Entity <span className="text-red-600">*</span></label> <select id="senderEntity" className="w-full p-2 border rounded bg-white text-sm" value={senderEntity} onChange={(e) => setSenderEntity(e.target.value)} required> {sampleEntities.map(entity => (<option key={entity} value={entity}>{entity}</option>))} </select> </div> )} <div> <label htmlFor="senderAccount" className="block mb-1 text-sm"> {paymentOrigin === 'client' ? 'Client Account ' : 'Account/Wallet '} <span className="text-red-600">*</span> </label> <select id="senderAccount" className="w-full p-2 border rounded bg-white text-sm" value={senderAccountId} onChange={(e) => setSenderAccountId(e.target.value)} required> <option value="" disabled>-- Select {paymentOrigin === 'client' ? 'Client Account' : 'Source Account'} --</option> {availableSenderAccounts.map(account => ( <option key={account.id} value={account.id}> {account.label} ({account.balance.toLocaleString()} {account.symbol}) </option> ))} </select> {selectedSenderAsset && <p className="text-xs text-gray-500 mt-1">Selected Balance: {selectedSenderAsset.balance.toLocaleString()} {selectedSenderAsset.symbol}</p>} </div> <div> <label htmlFor="debitRef" className="block mb-1 text-sm">Debit Reference</label> <input id="debitRef" type="text" className="w-full p-2 border rounded text-sm" placeholder="Internal reference ID" value={debitReference} onChange={(e) => setDebitReference(e.target.value)} /> </div> </div> </div>
                    {/* To Section (Simplified based on API) */}
                    <div> <h2 className="font-medium mb-3 text-gray-800">To</h2> <div className="space-y-4"> <div> <label htmlFor="recipientName" className="block mb-1 text-sm">Recipient Name</label> <input id="recipientName" type="text" className="w-full p-2 border rounded text-sm" placeholder="Beneficiary name" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} /> </div> <div> <label htmlFor="recipientAccount" className="block mb-1 text-sm">Recipient Identifier <span className="text-red-600">*</span></label> <input id="recipientAccount" type="text" className="w-full p-2 border rounded text-sm" placeholder="Account #, Wallet Address, Counterparty ID" value={recipientAccount} onChange={(e) => setRecipientAccount(e.target.value)} required /> </div> <div> <label htmlFor="recipientInst" className="block mb-1 text-sm">Recipient Institution / Network</label> <input id="recipientInst" type="text" className="w-full p-2 border rounded text-sm" placeholder="e.g., HSBC London, Ethereum Mainnet" value={recipientInstitution} onChange={(e) => setRecipientInstitution(e.target.value)} /> </div> </div> </div>
                </div>

                {/* Payment Details (Inputs controlled) */}
                <div className="mt-6"> <h2 className="font-medium mb-3 text-gray-800">Payment Details</h2> <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4"> <div className="space-y-4"> {/* Amount */} <div> <label htmlFor="amount" className="block mb-1 text-sm">Amount <span className="text-red-600">*</span></label> <div className="flex"> <input id="amount" type="number" min="0" step="any" className="flex-1 p-2 border-l border-t border-b rounded-l text-sm" placeholder="Enter amount" value={amount} onChange={(e) => setAmount(e.target.value)} required disabled={!currency} /> <span className="inline-flex items-center px-3 p-2 border-r border-t border-b rounded-r border-l-0 bg-gray-100 text-gray-600 text-sm"> {currency || '---'} </span> </div> {selectedSenderAsset && amountNumber > selectedSenderAsset.balance && (<p className="text-xs text-red-600 mt-1">Amount exceeds available balance!</p> )} </div> {/* Settlement Speed */} <div> <label htmlFor="settlementSpeed" className="block mb-1 text-sm">Settlement Speed</label> <select id="settlementSpeed" className="w-full p-2 border rounded bg-white text-sm" value={settlementSpeed} onChange={(e) => setSettlementSpeed(e.target.value)}> {Object.entries(settlementSpeeds).map(([key, value]) => (<option key={key} value={key}>{value.label}</option>))} </select> </div> </div> <div className="space-y-4"> {/* Payment Date */} <div> <label className="block mb-1 text-sm">Payment Date</label> <div className="flex space-x-2"> <div className="flex-1"> <select className="w-full p-2 border rounded bg-white text-sm" value={dateType} onChange={(e) => setDateType(e.target.value)}> <option value="immediate">Immediate</option> <option value="scheduled">Scheduled</option> </select> </div> <input type="date" className={`flex-1 p-2 border rounded text-sm ${dateType !== 'scheduled' ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`} value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} min={new Date().toISOString().split('T')[0]} disabled={dateType !== 'scheduled'} required={dateType === 'scheduled'} /> </div> </div> {/* Purpose */} <div> <label htmlFor="purpose" className="block mb-1 text-sm">Purpose <span className="text-red-600">*</span></label> <select id="purpose" className="w-full p-2 border rounded bg-white text-sm" value={purpose} onChange={(e) => setPurpose(e.target.value)} required> {samplePurposes.map(p => (<option key={p} value={p === 'Select purpose' ? '' : p} disabled={p === 'Select purpose'}>{p}</option>))} </select> </div> </div> </div> {/* Description */} <div className="mt-4"> <label htmlFor="description" className="block mb-1 text-sm">Payment Description</label> <textarea id="description" className="w-full p-2 border rounded text-sm" rows="2" placeholder="Additional payment details (for recipient or logs)" value={description} onChange={(e) => setDescription(e.target.value)}></textarea> </div> </div>

                {/* Compliance & Preview */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4"> <div className="md:col-span-2"> <h2 className="font-medium mb-3 text-gray-800">Compliance <span className="text-red-600">*</span></h2> <div className="p-4 bg-gray-50 rounded border border-gray-200 text-sm space-y-3"> <label htmlFor="hvt-compliance" className="flex items-center cursor-pointer"> <input type="checkbox" id="hvt-compliance" className="mr-2 h-4 w-4 text-emtech-gold focus:ring-emtech-gold" checked={complianceConfirmed} onChange={(e) => setComplianceConfirmed(e.target.checked)} required /> <span>I confirm this transfer complies with relevant regulations and I am authorized.</span> </label> </div> </div> {/* Preview */} <div> <h2 className="font-medium mb-3 text-gray-800">Preview</h2> <div className="p-4 bg-gray-50 rounded border border-gray-200 text-sm"> <div className="space-y-2"> <div className="flex justify-between"> <span className="text-gray-600">Amount:</span> <span className="font-medium">{previewData.paymentAmount.toLocaleString()} {previewData.currencySymbol}</span> </div> <div className="flex justify-between"> <span className="text-gray-600">Est. Fee:</span> <span className="font-medium">{previewData.fee.toLocaleString(undefined, {maximumFractionDigits: 4})} {previewData.currencySymbol}</span> </div> {previewData.networkFee > 0 && <div className="flex justify-between"> <span className="text-gray-600">Network Fee:</span> <span className="font-medium">{previewData.networkFee.toLocaleString(undefined, {maximumFractionDigits: 4})} {previewData.currencySymbol}</span> </div>} <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between font-semibold"> <span>Total Debit:</span> <span>{previewData.total.toLocaleString(undefined, {maximumFractionDigits: 4})} {previewData.currencySymbol}</span> </div> </div> </div> </div> </div>

                {/* Authentication */}
                <div className="mt-6"> <h2 className="font-medium mb-3 text-gray-800">Authentication <span className="text-red-600">*</span></h2> <div className="flex items-start space-x-3"> <div className="flex-1"> <input type="password" id="authCode" className="w-full p-2 border rounded text-sm" placeholder="Enter authorization code" value={authCode} onChange={(e) => setAuthCode(e.target.value)} required/> <p className="text-xs text-gray-500 mt-1">Enter code for payment initiation</p> </div> <button type="button" className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-50 self-start text-sm"> Request Code </button> </div> </div>

                {/* Action Buttons */}
                <div className="mt-8 flex space-x-3 justify-end"> <button type="button" className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-50" onClick={onBack} > Cancel </button> <button type="submit" className="px-4 py-2 rounded text-white hover:opacity-90 bg-emtech-gold disabled:opacity-50" disabled={!isFormValidForReview} > Continue to Review </button> </div>
            </form>
        )}

        {/* --- Step 2: Review --- */}
        {formStep === 'review' && ( <div> <h2 className="text-xl font-medium mb-4 text-gray-800">Review Payment</h2> <p className="text-gray-600 mb-6">Please review the details below before confirming.</p> {renderReviewData()} <div className="mt-8 flex space-x-3 justify-between"> <button type="button" className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-50" onClick={handleBackToDetails} > Back to Edit </button> <button type="button" className="px-4 py-2 rounded text-white hover:opacity-90 bg-green-600" onClick={handleProceedToConfirm}> Proceed to Confirm </button> </div> </div> )}

        {/* --- Step 3: Confirm --- */}
        {formStep === 'confirm' && ( <div> <h2 className="text-xl font-medium mb-4 text-gray-800">Confirm Payment Initiation</h2> {renderReviewData()} <div className="p-4 border rounded bg-green-50 text-green-800 my-6 text-sm"> <p>Clicking 'Confirm & Initiate Payment' will process this transaction.</p> <p className="mt-1 text-xs font-medium">This action cannot be easily undone.</p> </div> <div className="mt-8 flex space-x-3 justify-between"> <button type="button" className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-50" onClick={handleBackToDetails} > Cancel / Back to Edit </button> <button type="button" className="px-4 py-2 rounded text-white hover:opacity-90 bg-green-700 font-semibold" onClick={handleConfirmPayment}> Confirm & Initiate Payment </button> </div> </div> )}

    </div> // End main container
  );
};

export default CreatePaymentScreen;