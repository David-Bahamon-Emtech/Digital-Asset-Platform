// src/features/Payments/CreateHighValueTransferScreen.js
import React, { useState, useEffect, useMemo } from 'react';

// --- Placeholder Data (Adjust as needed for HVT context) ---
const hvtPurposeCodes = ['Select purpose code', 'BKTR', 'CBFT', 'CORT', 'GOVT', 'TREA', 'SUPP']; // Example codes
const sampleEntities = ['Citi New York', 'Citi London', 'Citi Singapore', 'Citi Mumbai']; // Reuse or replace


// --- Component ---
const CreateHighValueTransferScreen = ({ assets = [], onBack, onPaymentSubmit }) => {

  // --- State ---
  const [hvtFormStep, setHvtFormStep] = useState('details'); // 'details', 'review', 'confirm'

  // Form Input State
  const [senderEntity, setSenderEntity] = useState(sampleEntities[0] || '');
  const [senderAccountId, setSenderAccountId] = useState('');
  const [debitReference, setDebitReference] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientAccount, setRecipientAccount] = useState('');
  const [recipientBankSwift, setRecipientBankSwift] = useState('');
  const [intermediaryBankSwift, setIntermediaryBankSwift] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('');
  const [valueDate, setValueDate] = useState('');
  const [purposeCode, setPurposeCode] = useState('');
  const [remittanceInfo, setRemittanceInfo] = useState('');
  const [complianceConfirmed, setComplianceConfirmed] = useState(false);

  // Preview State
  const [previewData, setPreviewData] = useState({
    paymentAmount: 0, fee: 0, total: 0, currencySymbol: ''
  });

  // --- Derived Data ---
  const selectedSenderAsset = useMemo(() => assets.find(a => a.id === senderAccountId), [assets, senderAccountId]);
  const amountNumber = useMemo(() => parseFloat(amount) || 0, [amount]);
  const isFormValidForReview = useMemo(() => { // Basic validation example
      return senderAccountId && amountNumber > 0 && selectedSenderAsset && amountNumber <= selectedSenderAsset.balance &&
             recipientName.trim() && recipientAccount.trim() && recipientBankSwift.trim() &&
             valueDate && purposeCode && complianceConfirmed;
  }, [senderAccountId, amountNumber, selectedSenderAsset, recipientName, recipientAccount, recipientBankSwift, valueDate, purposeCode, complianceConfirmed]);


  // --- Effects ---

  // Derive currency from selected account
  useEffect(() => {
    setCurrency(selectedSenderAsset?.symbol || '');
    if (!selectedSenderAsset) setAmount('');
  }, [selectedSenderAsset]);

  // Calculate preview (simplified for HVT)
  useEffect(() => {
    const calculatedPreview = { paymentAmount: 0, fee: 0, total: 0, currencySymbol: currency || '' };
    if (amountNumber > 0 && currency) {
      calculatedPreview.paymentAmount = amountNumber;
      calculatedPreview.fee = amountNumber * 0.0005; // Example flat fee rate
      calculatedPreview.total = calculatedPreview.paymentAmount + calculatedPreview.fee;
    }
    setPreviewData(calculatedPreview);
  }, [amountNumber, currency]);


  // --- Handlers ---

  const handleContinueToReview = (event) => {
    event.preventDefault();
    if (!isFormValidForReview) {
        alert("Please fill out all required (*) fields correctly, including amount within balance and compliance confirmation.");
        return;
    }
    console.log('Proceeding to HVT review step...');
    setHvtFormStep('review');
  };

  const handleProceedToConfirm = () => {
    console.log('Proceeding to HVT confirm step...');
    setHvtFormStep('confirm');
  };

  const handleConfirmSubmit = () => {
    console.log('Confirming HVT submission...');
    const hvtData = {
      paymentType: 'hvt', senderEntity, senderAccountId,
      senderAccountLabel: selectedSenderAsset?.label, senderAccountSymbol: currency,
      debitReference, recipientName, recipientAccount, recipientBankSwift,
      intermediaryBankSwift, amount: amountNumber, currency, valueDate,
      purposeCode, remittanceInfo, totalDebit: previewData.total,
      status: 'Pending Approval'
    };
    onPaymentSubmit(hvtData);
  };

  const handleBackToDetails = () => {
    setHvtFormStep('details');
  };

  // --- UPDATED renderReviewData Function ---
  const renderReviewData = () => (
     <div className='p-4 border rounded bg-gray-50 mb-6 space-y-3 text-sm'>
        <h3 className="font-semibold text-base mb-3 border-b pb-2 text-gray-800">HVT Review Summary</h3>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">

          <div className="md:col-span-2 font-medium text-gray-700 border-b pb-1 mb-1">Sender Details</div>
          <dt className="text-gray-500">From Account:</dt>
          <dd className="font-medium">{selectedSenderAsset?.label} ({selectedSenderAsset?.symbol})</dd>

          <dt className="text-gray-500">From Entity:</dt>
          <dd>{senderEntity}</dd>

          <dt className="text-gray-500">Debit Reference:</dt>
          <dd>{debitReference || <span className="italic text-gray-500">None</span>}</dd>

          <div className="md:col-span-2 font-medium text-gray-700 border-b pb-1 mb-1 mt-2">Recipient Details</div>
          <dt className="text-gray-500">Recipient Name:</dt>
          <dd>{recipientName}</dd>

          <dt className="text-gray-500">Recipient Account:</dt>
          <dd className="break-all">{recipientAccount}</dd>

          <dt className="text-gray-500">Recipient Bank (SWIFT):</dt>
          <dd>{recipientBankSwift}</dd>

          {intermediaryBankSwift && (
            <>
              <dt className="text-gray-500">Intermediary Bank:</dt>
              <dd>{intermediaryBankSwift}</dd>
            </>
          )}

          <div className="md:col-span-2 font-medium text-gray-700 border-b pb-1 mb-1 mt-2">Transfer Details</div>
          <dt className="text-gray-500">Amount:</dt>
          <dd className="font-semibold">{previewData.paymentAmount.toLocaleString()} {previewData.currencySymbol}</dd>

          <dt className="text-gray-500">Value Date:</dt>
          <dd>{valueDate}</dd>

          <dt className="text-gray-500">Purpose Code:</dt>
          <dd>{purposeCode}</dd>

          <dt className="text-gray-500">Remittance Info:</dt>
          <dd>{remittanceInfo || <span className="italic text-gray-500">None</span>}</dd>

          <dt className="text-gray-500 pt-2 border-t">Estimated Fee:</dt>
          <dd className="pt-2 border-t">{previewData.fee.toLocaleString(undefined, {maximumFractionDigits: 4})} {previewData.currencySymbol}</dd>

          {/* HVT might not have network fees like crypto, adjust if needed */}
          {/* {previewData.networkFee > 0 && <> <dt>Network Fee:</dt><dd>{...}</dd> </>} */}

          <dt className="font-semibold text-gray-800 pt-2 border-t">Total Estimated Debit:</dt>
          <dd className="font-semibold text-gray-800 pt-2 border-t text-right text-base">{previewData.total.toLocaleString(undefined, {maximumFractionDigits: 4})} {previewData.currencySymbol}</dd>
        </dl>
     </div>
  );


  // --- Render Logic ---
  return (
    <div className="bg-white p-6 rounded shadow max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 border-b pb-3">
        <h1 className="text-2xl font-bold text-gray-800">Initiate High-Value Transfer</h1>
        <button className="px-3 py-1 rounded text-white hover:opacity-90 bg-gray-800 text-sm" onClick={onBack}>
          Back to Dashboard
        </button>
      </div>

       {/* Multi-step Indicator */}
       <div className="mb-8">
         <div className="flex items-center justify-between">
           {['Transfer Details', 'Review', 'Submit'].map((stepName, index) => {
             const stepValue = stepName.toLowerCase().split(' ')[0];
             const isActive = hvtFormStep === stepValue;
             // Treat 'confirm' state as visually completing the 'submit' step in the indicator
             const isCompleted = (hvtFormStep === 'review' && index < 1) || (hvtFormStep === 'confirm' && index < 2);
             return (
               <React.Fragment key={stepName}>
                 <div className="w-1/3 text-center"> <div className={`rounded-full h-10 w-10 flex items-center justify-center mx-auto transition-colors duration-300 ${ isCompleted ? 'bg-green-600 text-white' : (isActive ? 'bg-emtech-gold text-white' : 'bg-gray-200 text-gray-600') }`}> {isCompleted ? '✓' : index + 1} </div> <p className={`mt-1 text-sm transition-colors duration-300 ${isCompleted || isActive ? 'font-medium text-gray-800' : 'text-gray-500'}`}>{stepName}</p> </div>
                 {index < 2 && ( <div className={`flex-1 h-1 transition-colors duration-300 ${isCompleted ? 'bg-green-600' : 'bg-gray-200'}`}></div> )}
               </React.Fragment>
             );
           })}
         </div>
       </div>

      {/* --- Step 1: Transfer Details --- */}
      {hvtFormStep === 'details' && (
        <form onSubmit={handleContinueToReview}>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              {/* From Section */}
              <div>
                 <h3 className="font-medium mb-3 text-gray-800">From</h3>
                 <div className="space-y-4">
                    <div>
                        <label htmlFor="hvt-senderAccount" className="block mb-1 text-sm">Account/Wallet <span className="text-red-600">*</span></label>
                        <select id="hvt-senderAccount" className="w-full p-2 border rounded bg-white text-sm" value={senderAccountId} onChange={(e) => setSenderAccountId(e.target.value)} required>
                            <option value="" disabled>-- Select Account --</option>
                            {assets.map(asset => ( <option key={asset.id} value={asset.id}> {asset.label} ({asset.balance.toLocaleString()} {asset.symbol}) </option> ))}
                        </select>
                    </div>
                     <div>
                         <label htmlFor="hvt-amount" className="block mb-1 text-sm">Amount <span className="text-red-600">*</span></label>
                         <div className="flex">
                             <input id="hvt-amount" type="number" min="0" step="any" className="flex-1 p-2 border-l border-t border-b rounded-l text-sm" placeholder="Enter amount" value={amount} onChange={(e) => setAmount(e.target.value)} required disabled={!currency} />
                             <span className="inline-flex items-center px-3 p-2 border-r border-t border-b rounded-r border-l-0 bg-gray-100 text-gray-600 text-sm"> {currency || '---'} </span>
                         </div>
                         {selectedSenderAsset && amountNumber > selectedSenderAsset.balance && (<p className="text-xs text-red-600 mt-1">Amount exceeds available balance!</p> )}
                     </div>
                     <div>
                        <label htmlFor="hvt-valueDate" className="block mb-1 text-sm">Value Date <span className="text-red-600">*</span></label>
                        <input id="hvt-valueDate" type="date" className="w-full p-2 border rounded text-sm bg-white" value={valueDate} onChange={(e) => setValueDate(e.target.value)} min={new Date().toISOString().split('T')[0]} required />
                     </div>
                      <div>
                        <label htmlFor="hvt-debitRef" className="block mb-1 text-sm">Debit Reference</label>
                        <input id="hvt-debitRef" type="text" className="w-full p-2 border rounded text-sm" placeholder="Internal reference ID" value={debitReference} onChange={(e) => setDebitReference(e.target.value)} />
                     </div>
                 </div>
              </div>
              {/* To Section */}
               <div>
                 <h3 className="font-medium mb-3 text-gray-800">To</h3>
                 <div className="space-y-4">
                     <div>
                         <label htmlFor="hvt-recipientName" className="block mb-1 text-sm">Recipient Name <span className="text-red-600">*</span></label>
                         <input id="hvt-recipientName" type="text" className="w-full p-2 border rounded text-sm" placeholder="Beneficiary name" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} required/>
                      </div>
                      <div>
                         <label htmlFor="hvt-recipientAccount" className="block mb-1 text-sm">Recipient Account (e.g., IBAN) <span className="text-red-600">*</span></label>
                         <input id="hvt-recipientAccount" type="text" className="w-full p-2 border rounded text-sm" placeholder="Enter account number / identifier" value={recipientAccount} onChange={(e) => setRecipientAccount(e.target.value)} required />
                      </div>
                      <div>
                         <label htmlFor="hvt-recipientBankSwift" className="block mb-1 text-sm">Recipient Bank (SWIFT/BIC) <span className="text-red-600">*</span></label>
                         <input id="hvt-recipientBankSwift" type="text" className="w-full p-2 border rounded text-sm" placeholder="Enter SWIFT/BIC code" value={recipientBankSwift} onChange={(e) => setRecipientBankSwift(e.target.value)} required />
                      </div>
                      <div>
                         <label htmlFor="hvt-intermediaryBankSwift" className="block mb-1 text-sm">Intermediary Bank (SWIFT/BIC)</label>
                         <input id="hvt-intermediaryBankSwift" type="text" className="w-full p-2 border rounded text-sm" placeholder="Optional" value={intermediaryBankSwift} onChange={(e) => setIntermediaryBankSwift(e.target.value)} />
                      </div>
                 </div>
              </div>
           </div>
           {/* Additional Details */}
           <div className="mt-6">
                <h3 className="font-medium mb-3 text-gray-800">Additional Details</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <div>
                        <label htmlFor="hvt-purposeCode" className="block mb-1 text-sm">Purpose Code <span className="text-red-600">*</span></label>
                        <select id="hvt-purposeCode" className="w-full p-2 border rounded bg-white text-sm" value={purposeCode} onChange={(e) => setPurposeCode(e.target.value)} required>
                           {hvtPurposeCodes.map(code => (<option key={code} value={code === 'Select purpose code' ? '' : code} disabled={code === 'Select purpose code'}>{code}</option>))}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="hvt-remittanceInfo" className="block mb-1 text-sm">Remittance Information</label>
                        <input id="hvt-remittanceInfo" type="text" className="w-full p-2 border rounded text-sm" placeholder="Info for beneficiary / Invoice #" value={remittanceInfo} onChange={(e) => setRemittanceInfo(e.target.value)} />
                     </div>
                 </div>
           </div>
           {/* Compliance */}
           <div className="mt-6">
                <h3 className="font-medium mb-3 text-gray-800">Compliance <span className="text-red-600">*</span></h3>
                <div className="p-4 bg-gray-50 rounded border border-gray-200 text-sm space-y-3">
                    <label htmlFor="hvt-compliance" className="flex items-center cursor-pointer">
                        <input type="checkbox" id="hvt-compliance" className="mr-2 h-4 w-4 text-emtech-gold focus:ring-emtech-gold" checked={complianceConfirmed} onChange={(e) => setComplianceConfirmed(e.target.checked)} required />
                        <span>I confirm this transfer complies with all relevant regulations (AML, Sanctions, etc.) and I am authorized.</span>
                    </label>
                </div>
           </div>
          {/* Preview Section (Simplified) */}
           <div className="mt-6">
              <h2 className="font-medium mb-3 text-gray-800">Preview</h2>
              <div className="p-4 bg-gray-50 rounded border border-gray-200 text-sm">
                <div className="space-y-1">
                  <div className="flex justify-between"> <span className="text-gray-600">Amount:</span> <span className="font-medium">{previewData.paymentAmount.toLocaleString()} {previewData.currencySymbol}</span> </div>
                  <div className="flex justify-between"> <span className="text-gray-600">Est. Fee:</span> <span className="font-medium">{previewData.fee.toLocaleString(undefined, {maximumFractionDigits: 4})} {previewData.currencySymbol}</span> </div>
                  <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between font-semibold"> <span>Total Debit:</span> <span>{previewData.total.toLocaleString(undefined, {maximumFractionDigits: 4})} {previewData.currencySymbol}</span> </div>
                </div>
              </div>
            </div>
          {/* Action Buttons */}
          <div className="mt-8 flex space-x-3 justify-end">
            <button type="button" className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-50" onClick={onBack} > Cancel </button>
            <button type="submit" className="px-4 py-2 rounded text-white hover:opacity-90 bg-emtech-gold disabled:opacity-50" disabled={!isFormValidForReview} >
              Continue to Review
            </button>
          </div>
        </form>
      )}

      {/* --- Step 2: Review --- */}
      {hvtFormStep === 'review' && (
        <div>
          <h2 className="text-xl font-medium mb-4 text-gray-800">Review High-Value Transfer</h2>
          <p className="text-gray-600 mb-6">Please review the HVT details below before submitting for authorization.</p>
          {renderReviewData()}
          <div className="mt-8 flex space-x-3 justify-between">
            <button type="button" className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-50" onClick={handleBackToDetails} > Back to Edit </button>
            <button type="button" className="px-4 py-2 rounded text-white hover:opacity-90 bg-green-600" onClick={handleProceedToConfirm}> Proceed to Submit </button>
          </div>
        </div>
      )}

      {/* --- Step 3: Confirm/Submit --- */}
      {hvtFormStep === 'confirm' && (
         <div>
           <h2 className="text-xl font-medium mb-4 text-gray-800">Submit HVT for Authorization</h2>
           {renderReviewData()}
           <div className="p-4 border rounded bg-blue-50 text-blue-800 my-6 text-sm">
             <p>Clicking 'Submit HVT' will send this transfer request for the required authorizations.</p>
             <p className="mt-1">Total Amount (including estimated fees): <strong className="text-base">{previewData.total.toLocaleString(undefined, {maximumFractionDigits: 4})} {previewData.currencySymbol}</strong></p>
           </div>
           <div className="mt-8 flex space-x-3 justify-between">
             <button type="button" className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-50" onClick={handleBackToDetails} > Cancel / Back to Edit </button>
             <button type="button" className="px-4 py-2 rounded text-white hover:opacity-90 bg-green-700 font-semibold" onClick={handleConfirmSubmit}> Submit HVT </button>
           </div>
         </div>
      )}

    </div> // End main container
  );
};

export default CreateHighValueTransferScreen;