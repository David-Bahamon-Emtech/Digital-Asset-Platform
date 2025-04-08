// src/features/Payments/CreatePaymentScreen.js
import React, { useState, useEffect } from 'react';

// --- Helper Data (Simulated) ---
const sampleEntities = ['Citi New York', 'Citi London', 'Citi Singapore', 'Citi Mumbai'];
const samplePurposes = ['Select purpose', 'Interbank Settlement', 'Corporate Payment', 'Customer Payment', 'Treasury Operation', 'Other (specify)'];
const settlementSpeeds = {
    standard: { label: 'Standard (1-3 minutes)', feePercent: 0.001 }, // 0.1%
    express: { label: 'Express (10-30 seconds)', feePercent: 0.0025 }, // 0.25%
    instant: { label: 'Instant (1-5 seconds)', feePercent: 0.005 }, // 0.5%
};

// --- Component ---
const CreatePaymentScreen = ({ assets = [], onBack, onPaymentSubmit }) => {

  // --- State ---
  const [formStep, setFormStep] = useState('details'); // 'details', 'review', 'confirm'

  // Form Input State
  const [paymentType, setPaymentType] = useState('tokenized');
  const [senderEntity, setSenderEntity] = useState(sampleEntities[0] || '');
  const [senderAccountId, setSenderAccountId] = useState('');
  const [debitReference, setDebitReference] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientAccount, setRecipientAccount] = useState('');
  const [recipientInstitution, setRecipientInstitution] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('');
  const [settlementSpeed, setSettlementSpeed] = useState('standard');
  const [dateType, setDateType] = useState('immediate');
  const [scheduledDate, setScheduledDate] = useState('');
  const [purpose, setPurpose] = useState('');
  const [description, setDescription] = useState('');
  const [complianceSanctions, setComplianceSanctions] = useState(false);
  const [complianceSourceFunds, setComplianceSourceFunds] = useState(false);
  const [complianceAuthorized, setComplianceAuthorized] = useState(false);
  const [authCode, setAuthCode] = useState('');

  // Preview State
  const [previewData, setPreviewData] = useState({
    paymentAmount: 0, fee: 0, networkFee: 0, total: 0, currencySymbol: ''
  });

  // --- Derived Data ---
  const selectedSenderAsset = assets.find(a => a.id === senderAccountId);
  const amountNumber = parseFloat(amount) || 0;
  const isFormValidForReview = // Basic validation for enabling continue button
     senderAccountId && amountNumber > 0 && selectedSenderAsset && amountNumber <= selectedSenderAsset.balance &&
     recipientAccount.trim() && recipientInstitution.trim() && purpose &&
     complianceSanctions && complianceSourceFunds && complianceAuthorized && authCode.trim() &&
     (dateType !== 'scheduled' || scheduledDate); // Require date if scheduled


  // --- Effects ---

  // Derive currency and reset amount when sender account changes
  useEffect(() => {
    if (selectedSenderAsset) {
      setCurrency(selectedSenderAsset.symbol);
      setAmount('');
    } else {
      setCurrency('');
      setAmount('');
    }
  }, [selectedSenderAsset]);

  // Calculate preview when relevant inputs change
  useEffect(() => {
    const calculatedPreview = {
      paymentAmount: 0, fee: 0, networkFee: 0, total: 0, currencySymbol: currency || ''
    };

    if (amountNumber > 0 && currency) {
      calculatedPreview.paymentAmount = amountNumber;
      const speedData = settlementSpeeds[settlementSpeed];
      if (speedData) {
        calculatedPreview.fee = amountNumber * speedData.feePercent;
      }
      if (paymentType === 'swift') calculatedPreview.networkFee = 5; // Simulate $5 fee for SWIFT
      else calculatedPreview.networkFee = 0;

      calculatedPreview.total = calculatedPreview.paymentAmount + calculatedPreview.fee + calculatedPreview.networkFee;
    }
    setPreviewData(calculatedPreview);

  }, [amountNumber, currency, settlementSpeed, paymentType]);


  // --- Handlers ---

  const handleContinueToReview = (event) => {
    event.preventDefault();
    if (!isFormValidForReview) {
        alert("Please fill out all required (*) fields correctly, including amount within balance, compliance checks, and authentication code.");
        return;
    }
    console.log('Proceeding to review step...');
    setFormStep('review');
  };

  const handleProceedToConfirm = () => {
    console.log('Proceeding to confirm step...');
    setFormStep('confirm');
  };

  const handleConfirmPayment = () => {
    console.log('Confirming payment...');
    // Compile final data from state
    const paymentData = {
      paymentType, senderEntity, senderAccountId,
      senderAccountLabel: selectedSenderAsset?.label || 'Unknown',
      senderAccountSymbol: currency, debitReference, recipientName,
      recipientAccount, recipientInstitution, amount: amountNumber, currency,
      settlementSpeed, dateType, scheduledDate: dateType === 'scheduled' ? scheduledDate : null,
      purpose, description, fee: previewData.fee, networkFee: previewData.networkFee,
      totalDebit: previewData.total,
      // We typically wouldn't send compliance checkbox status or auth code itself
    };
    // Call the submission handler passed from the parent
    onPaymentSubmit(paymentData);
  };

  const handleBackToDetails = () => {
    setFormStep('details');
  };

  // Function to render read-only data for review/confirm
  const renderReviewData = () => (
     <div className='p-4 border rounded bg-gray-50 mb-6 space-y-2 text-sm'>
        <h3 className="font-semibold text-base mb-3 border-b pb-1 text-gray-800">Payment Summary</h3>
        {/* Use grid for better alignment */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
            <p><strong>Payment Type:</strong></p><p><span className="capitalize">{paymentType}</span></p>
            <p><strong>From Entity:</strong></p><p>{senderEntity}</p>
            <p><strong>From Account:</strong></p><p>{selectedSenderAsset?.label} ({selectedSenderAsset?.symbol})</p>
            <p><strong>Debit Reference:</strong></p><p>{debitReference || <span className="italic text-gray-500">None</span>}</p>
            <p><strong>To Recipient:</strong></p><p>{recipientName}</p>
            <p><strong>To Account:</strong></p><p className="break-all">{recipientAccount}</p> {/* Allow long accounts/addresses to wrap */}
            <p><strong>To Institution:</strong></p><p>{recipientInstitution}</p>
            <p><strong>Amount:</strong></p><p className="font-medium">{previewData.paymentAmount.toLocaleString()} {previewData.currencySymbol}</p>
            <p><strong>Settlement Speed:</strong></p><p>{settlementSpeeds[settlementSpeed]?.label || settlementSpeed}</p>
            <p><strong>Payment Date:</strong></p><p>{dateType === 'scheduled' ? scheduledDate : 'Immediate'}</p>
            <p><strong>Purpose:</strong></p><p>{purpose}</p>
            <p><strong>Description:</strong></p><p>{description || <span className="italic text-gray-500">None</span>}</p>
            <p><strong>Estimated Fee:</strong></p><p>{previewData.fee.toLocaleString(undefined, {maximumFractionDigits: 4})} {previewData.currencySymbol}</p>
            {previewData.networkFee > 0 && <> <p><strong>Network Fee:</strong></p><p>{previewData.networkFee.toLocaleString(undefined, {maximumFractionDigits: 4})} {previewData.currencySymbol}</p> </>}
            <p className="font-semibold pt-2 border-t sm:col-span-2">Total Estimated Debit:</p><p className="font-semibold pt-2 border-t sm:col-span-2 text-right text-base">{previewData.total.toLocaleString(undefined, {maximumFractionDigits: 4})} {previewData.currencySymbol}</p>
        </div>
     </div>
  );

  // --- Render Logic ---
  return (
    <div className="bg-white p-6 rounded shadow max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 border-b pb-3">
        <h1 className="text-2xl font-bold text-gray-800">Create New Payment</h1>
        <button className="px-3 py-1 rounded text-white hover:opacity-90 bg-gray-800 text-sm" onClick={onBack}>
          Back to Dashboard
        </button>
      </div>

      {/* Multi-step Indicator */}
      <div className="mb-8">
         {/* (Indicator JSX - unchanged from previous version) */}
         <div className="flex items-center justify-between">
          {['Payment Details', 'Review', 'Confirm'].map((stepName, index) => {
            const stepValue = stepName.toLowerCase().split(' ')[0];
            const isActive = formStep === stepValue;
            const isCompleted = (formStep === 'review' && index < 1) || (formStep === 'confirm' && index < 2);
            return (
              <React.Fragment key={stepName}>
                <div className="w-1/3 text-center">
                  <div className={`rounded-full h-10 w-10 flex items-center justify-center mx-auto transition-colors duration-300 ${ isCompleted ? 'bg-green-600 text-white' : (isActive ? 'bg-emtech-gold text-white' : 'bg-gray-200 text-gray-600') }`}>
                    {isCompleted ? '✓' : index + 1}
                  </div>
                  <p className={`mt-1 text-sm transition-colors duration-300 ${isCompleted || isActive ? 'font-medium text-gray-800' : 'text-gray-500'}`}>{stepName}</p>
                </div>
                {index < 2 && ( <div className={`flex-1 h-1 transition-colors duration-300 ${isCompleted ? 'bg-green-600' : 'bg-gray-200'}`}></div> )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* --- Step 1: Payment Details --- */}
      {formStep === 'details' && (
        <form onSubmit={handleContinueToReview}>
          {/* Payment Type */}
          <div className="mb-6"> <h2 className="font-medium mb-3 text-gray-800">Payment Type <span className="text-red-600">*</span></h2> <div className="grid grid-cols-1 sm:grid-cols-3 gap-3"> {/* Radios... */}
             <label className={`border rounded p-3 cursor-pointer hover:shadow-md transition-shadow ${paymentType === 'tokenized' ? 'border-emtech-gold bg-yellow-50' : 'border-gray-300'}`}> <div className="flex items-center"> <input type="radio" name="paymentType" value="tokenized" checked={paymentType === 'tokenized'} onChange={(e) => setPaymentType(e.target.value)} className="mr-2 h-4 w-4 text-emtech-gold focus:ring-emtech-gold"/> <div> <p className="font-medium text-sm">Tokenized Transfer</p> <p className="text-xs text-gray-500">Using tokenized assets</p> </div> </div> </label>
             <label className={`border rounded p-3 cursor-pointer hover:shadow-md transition-shadow ${paymentType === 'swift' ? 'border-emtech-gold bg-yellow-50' : 'border-gray-300'}`}> <div className="flex items-center"> <input type="radio" name="paymentType" value="swift" checked={paymentType === 'swift'} onChange={(e) => setPaymentType(e.target.value)} className="mr-2 h-4 w-4 text-emtech-gold focus:ring-emtech-gold"/> <div> <p className="font-medium text-sm">SWIFT</p> <p className="text-xs text-gray-500">Traditional rails</p> </div> </div> </label>
             <label className={`border rounded p-3 cursor-pointer hover:shadow-md transition-shadow ${paymentType === 'internal' ? 'border-emtech-gold bg-yellow-50' : 'border-gray-300'}`}> <div className="flex items-center"> <input type="radio" name="paymentType" value="internal" checked={paymentType === 'internal'} onChange={(e) => setPaymentType(e.target.value)} className="mr-2 h-4 w-4 text-emtech-gold focus:ring-emtech-gold"/> <div> <p className="font-medium text-sm">Internal Transfer</p> <p className="text-xs text-gray-500">Within platform</p> </div> </div> </label>
          </div> </div>
          {/* From / To */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4"> <div> <h2 className="font-medium mb-3 text-gray-800">From</h2> <div className="space-y-4"> {/* Sender Entity */} <div> <label htmlFor="senderEntity" className="block mb-1 text-sm">Sending Entity <span className="text-red-600">*</span></label> <select id="senderEntity" className="w-full p-2 border rounded bg-white text-sm" value={senderEntity} onChange={(e) => setSenderEntity(e.target.value)} required> {sampleEntities.map(entity => (<option key={entity} value={entity}>{entity}</option>))} </select> </div> {/* Account/Wallet */} <div> <label htmlFor="senderAccount" className="block mb-1 text-sm">Account/Wallet <span className="text-red-600">*</span></label> <select id="senderAccount" className="w-full p-2 border rounded bg-white text-sm" value={senderAccountId} onChange={(e) => setSenderAccountId(e.target.value)} required> <option value="" disabled>-- Select Account --</option> {assets.map(asset => (<option key={asset.id} value={asset.id}>{asset.label} ({asset.balance.toLocaleString()} {asset.symbol})</option>))} </select> {selectedSenderAsset && <p className="text-xs text-gray-500 mt-1">Blockchain: {selectedSenderAsset.blockchain}</p>} </div> {/* Debit Reference */} <div> <label htmlFor="debitRef" className="block mb-1 text-sm">Debit Reference</label> <input id="debitRef" type="text" className="w-full p-2 border rounded text-sm" placeholder="Internal reference ID" value={debitReference} onChange={(e) => setDebitReference(e.target.value)} /> </div> </div> </div> <div> <h2 className="font-medium mb-3 text-gray-800">To</h2> <div className="space-y-4"> {/* Recipient Name */} <div> <label htmlFor="recipientName" className="block mb-1 text-sm">Recipient Name <span className="text-red-600">*</span></label> <input id="recipientName" type="text" className="w-full p-2 border rounded text-sm" placeholder="Enter recipient name" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} required/> </div> {/* Recipient Account */} <div> <label htmlFor="recipientAccount" className="block mb-1 text-sm">Recipient Wallet/Account <span className="text-red-600">*</span></label> <input id="recipientAccount" type="text" className="w-full p-2 border rounded text-sm" placeholder="Enter address or account number" value={recipientAccount} onChange={(e) => setRecipientAccount(e.target.value)} required /> </div> {/* Recipient Institution */} <div> <label htmlFor="recipientInst" className="block mb-1 text-sm">Recipient Institution <span className="text-red-600">*</span></label> <input id="recipientInst" type="text" className="w-full p-2 border rounded text-sm" placeholder="Bank name or institution" value={recipientInstitution} onChange={(e) => setRecipientInstitution(e.target.value)} required /> </div> </div> </div> </div>
          {/* Payment Details */}
          <div className="mt-6"> <h2 className="font-medium mb-3 text-gray-800">Payment Details</h2> <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4"> <div className="space-y-4"> {/* Amount */} <div> <label htmlFor="amount" className="block mb-1 text-sm">Amount <span className="text-red-600">*</span></label> <div className="flex"> <input id="amount" type="number" min="0" step="any" className="flex-1 p-2 border-l border-t border-b rounded-l text-sm" placeholder="Enter amount" value={amount} onChange={(e) => setAmount(e.target.value)} required disabled={!currency} /> <span className="inline-flex items-center px-3 p-2 border-r border-t border-b rounded-r border-l-0 bg-gray-100 text-gray-600 text-sm"> {currency || '---'} </span> </div> {selectedSenderAsset && amountNumber > selectedSenderAsset.balance && (<p className="text-xs text-red-600 mt-1">Amount exceeds available balance ({selectedSenderAsset.balance.toLocaleString()} {currency})!</p> )} </div> {/* Settlement Speed */} <div> <label htmlFor="settlementSpeed" className="block mb-1 text-sm">Settlement Speed</label> <select id="settlementSpeed" className="w-full p-2 border rounded bg-white text-sm" value={settlementSpeed} onChange={(e) => setSettlementSpeed(e.target.value)}> {Object.entries(settlementSpeeds).map(([key, value]) => (<option key={key} value={key}>{value.label}</option>))} </select> </div> </div> <div className="space-y-4"> {/* Payment Date */} <div> <label className="block mb-1 text-sm">Payment Date</label> <div className="flex space-x-2"> <div className="flex-1"> <select className="w-full p-2 border rounded bg-white text-sm" value={dateType} onChange={(e) => setDateType(e.target.value)}> <option value="immediate">Immediate</option> <option value="scheduled">Scheduled</option> </select> </div> <input type="date" className={`flex-1 p-2 border rounded text-sm ${dateType !== 'scheduled' ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`} value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} min={new Date().toISOString().split('T')[0]} disabled={dateType !== 'scheduled'} required={dateType === 'scheduled'} /> </div> </div> {/* Purpose */} <div> <label htmlFor="purpose" className="block mb-1 text-sm">Payment Purpose <span className="text-red-600">*</span></label> <select id="purpose" className="w-full p-2 border rounded bg-white text-sm" value={purpose} onChange={(e) => setPurpose(e.target.value)} required> {samplePurposes.map(p => (<option key={p} value={p === 'Select purpose' ? '' : p} disabled={p === 'Select purpose'}>{p}</option>))} </select> </div> </div> </div> {/* Description */} <div className="mt-4"> <label htmlFor="description" className="block mb-1 text-sm">Payment Description/Instructions</label> <textarea id="description" className="w-full p-2 border rounded text-sm" rows="2" placeholder="Additional payment details or instructions" value={description} onChange={(e) => setDescription(e.target.value)}></textarea> </div> </div>
          {/* Compliance & Preview */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4"> <div className="md:col-span-2"> <h2 className="font-medium mb-3 text-gray-800">Compliance <span className="text-red-600">*</span></h2> <div className="p-4 bg-gray-50 rounded border border-gray-200 text-sm space-y-3"> {/* Checkboxes... */} <label htmlFor="sanction-check" className="flex items-center cursor-pointer"> <input type="checkbox" id="sanction-check" className="mr-2 h-4 w-4 text-emtech-gold focus:ring-emtech-gold" checked={complianceSanctions} onChange={(e) => setComplianceSanctions(e.target.checked)} required /> <span>I confirm compliance with sanctions regulations.</span> </label> <label htmlFor="source-funds" className="flex items-center cursor-pointer"> <input type="checkbox" id="source-funds" className="mr-2 h-4 w-4 text-emtech-gold focus:ring-emtech-gold" checked={complianceSourceFunds} onChange={(e) => setComplianceSourceFunds(e.target.checked)} required /> <span>I confirm source of funds is legitimate (AML).</span> </label> <label htmlFor="authorized" className="flex items-center cursor-pointer"> <input type="checkbox" id="authorized" className="mr-2 h-4 w-4 text-emtech-gold focus:ring-emtech-gold" checked={complianceAuthorized} onChange={(e) => setComplianceAuthorized(e.target.checked)} required /> <span>I am authorized to initiate this payment.</span> </label> </div> </div> {/* Preview */} <div> <h2 className="font-medium mb-3 text-gray-800">Preview</h2> <div className="p-4 bg-gray-50 rounded border border-gray-200 text-sm"> <div className="space-y-2"> <div className="flex justify-between"> <span className="text-gray-600">Amount:</span> <span className="font-medium">{previewData.paymentAmount.toLocaleString()} {previewData.currencySymbol}</span> </div> <div className="flex justify-between"> <span className="text-gray-600">Est. Fee:</span> <span className="font-medium">{previewData.fee.toLocaleString(undefined, {maximumFractionDigits: 4})} {previewData.currencySymbol}</span> </div> {previewData.networkFee > 0 && <div className="flex justify-between"> <span className="text-gray-600">Network Fee:</span> <span className="font-medium">{previewData.networkFee.toLocaleString(undefined, {maximumFractionDigits: 4})} {previewData.currencySymbol}</span> </div>} <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between font-semibold"> <span>Total Debit:</span> <span>{previewData.total.toLocaleString(undefined, {maximumFractionDigits: 4})} {previewData.currencySymbol}</span> </div> </div> </div> </div> </div>
          {/* Authentication */}
          <div className="mt-6"> <h2 className="font-medium mb-3 text-gray-800">Authentication <span className="text-red-600">*</span></h2> <div className="flex items-start space-x-3"> <div className="flex-1"> <input type="password" id="authCode" className="w-full p-2 border rounded text-sm" placeholder="Enter authorization code" value={authCode} onChange={(e) => setAuthCode(e.target.value)} required/> <p className="text-xs text-gray-500 mt-1">Enter code for payment initiation</p> </div> <button type="button" className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-50 self-start text-sm"> Request Code </button> </div> </div>
          {/* Action Buttons */}
          <div className="mt-8 flex space-x-3 justify-end"> <button type="button" className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-50" onClick={onBack} > Cancel </button> <button type="submit" className="px-4 py-2 rounded text-white hover:opacity-90 bg-emtech-gold disabled:opacity-50" disabled={!isFormValidForReview} > Continue to Review </button> </div>
        </form>
      )} {/* End Details Step */}


      {/* --- Step 2: Review --- */}
      {formStep === 'review' && (
        <div>
          <h2 className="text-xl font-medium mb-4 text-gray-800">Review Payment</h2>
          <p className="text-gray-600 mb-6">Please review the details below before confirming.</p>

           {/* Render the read-only summary */}
           {renderReviewData()}

          {/* Action Buttons for Review Step */}
          <div className="mt-8 flex space-x-3 justify-between">
            <button type="button" className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-50" onClick={handleBackToDetails} > Back to Edit </button>
            <button type="button" className="px-4 py-2 rounded text-white hover:opacity-90 bg-green-600" onClick={handleProceedToConfirm}> Proceed to Confirm </button>
          </div>
        </div>
      )} {/* End Review Step */}


      {/* --- Step 3: Confirm --- */}
      {formStep === 'confirm' && (
         <div>
           <h2 className="text-xl font-medium mb-4 text-gray-800">Confirm Payment Initiation</h2>
           {/* Re-render summary for final check */}
           {renderReviewData()}

           <div className="p-4 border rounded bg-green-50 text-green-800 my-6 text-sm">
             <p>Clicking 'Confirm & Initiate Payment' will process this transaction based on the details above.</p>
             <p className="mt-1 text-xs font-medium">This action cannot be easily undone.</p>
           </div>

           {/* Add simulated workflow logic here later if desired */}

           <div className="mt-8 flex space-x-3 justify-between">
             <button type="button" className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-50" onClick={handleBackToDetails} > Cancel / Back to Edit </button>
             <button type="button" className="px-4 py-2 rounded text-white hover:opacity-90 bg-green-700 font-semibold" onClick={handleConfirmPayment}> Confirm & Initiate Payment </button>
           </div>
         </div>
      )} {/* End Confirm Step */}

    </div> // End main container
  );
};

export default CreatePaymentScreen;