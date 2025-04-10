// src/features/Payments/components/CreateEditTemplateModal.js
import React, { useState, useEffect } from 'react';

// Define constants for dropdowns locally for simplicity, or pass as props
const paymentTypes = ['Tokenized', 'Traditional', 'Internal'];
const traditionalRailsList = [
    { code: '', name: 'Select Traditional Rail...' }, { code: 'SWIFT', name: 'SWIFT' }, { code: 'HSBC', name: 'Correspondent Bank (HSBC)' }, { code: 'JPM', name: 'Correspondent Bank (JP Morgan)' }, { code: 'MUFG', name: 'Correspondent Bank (Mitsubishi)' }, { code: 'SANT', name: 'Correspondent Bank (Santander)' }, { code: 'VISA', name: 'Card Network (VISA Direct)' }, { code: 'MC', name: 'Card Network (Mastercard Send)' }, { code: 'WU', name: 'Money Transfer (Western Union)' },
];
const onChainNetworksList = [
    { code: '', name: 'Select Network...' }, { code: 'Ethereum', name: 'Ethereum' }, { code: 'Polygon', name: 'Polygon' }, { code: 'Stellar', name: 'Stellar' }, { code: 'Hedera', name: 'Hedera' }, { code: 'Solana', name: 'Solana' },
];
const samplePurposes = ['Select purpose code', 'BKTR', 'CBFT', 'CORT', 'GOVT', 'TREA', 'SUPP', 'INTRA']; // Added INTRA

const CreateEditTemplateModal = ({ template, onClose, onSave }) => {
  const isEditing = Boolean(template); // Check if we are editing an existing template

  // --- State for Form Fields ---
  const [name, setName] = useState('');
  const [paymentType, setPaymentType] = useState('Tokenized');
  const [recipientName, setRecipientName] = useState('');
  const [recipientAccount, setRecipientAccount] = useState('');
  const [recipientInstitution, setRecipientInstitution] = useState('');
  const [traditionalRail, setTraditionalRail] = useState(''); // Only for Traditional
  const [onChainNetwork, setOnChainNetwork] = useState('');   // Only for On-Chain
  const [amount, setAmount] = useState(''); // Allow empty for variable amount
  const [currency, setCurrency] = useState('');
  const [purpose, setPurpose] = useState('');
  const [errors, setErrors] = useState({});

  // --- Effect to Populate Form on Edit ---
  useEffect(() => {
    if (isEditing && template) {
      setName(template.name || '');
      setPaymentType(template.paymentType || 'Tokenized');
      setRecipientName(template.recipientName || '');
      setRecipientAccount(template.recipientAccount || '');
      setRecipientInstitution(template.recipientInstitution || '');
      setTraditionalRail(template.traditionalRail || '');
      setOnChainNetwork(template.onChainNetwork || '');
      setAmount(template.amount || ''); // Keep empty if template amount is empty/null/undefined
      setCurrency(template.currency || '');
      setPurpose(template.purpose || '');
      setErrors({}); // Clear any previous errors
    } else {
      // Reset form for creation
      setName('');
      setPaymentType('Tokenized');
      setRecipientName('');
      setRecipientAccount('');
      setRecipientInstitution('');
      setTraditionalRail('');
      setOnChainNetwork('');
      setAmount('');
      setCurrency('');
      setPurpose('');
      setErrors({});
    }
  }, [template, isEditing]); // Rerun effect if template changes

  // --- Validation ---
  const validate = () => {
      const newErrors = {};
      if (!name.trim()) newErrors.name = 'Template Name is required.';
      if (!paymentType) newErrors.paymentType = 'Payment Type is required.';
      if (!recipientAccount.trim()) newErrors.recipientAccount = 'Recipient Identifier is required.';
      if (!purpose) newErrors.purpose = 'Purpose is required.';
      if (paymentType === 'Traditional' && !traditionalRail) newErrors.traditionalRail = 'Payment Rail is required for Traditional type.';
      // Don't require network for template, could be variable recipient
      // if (paymentType === 'Tokenized' && !onChainNetwork) newErrors.onChainNetwork = 'Network is required for On-Chain type.';
      if (amount && isNaN(parseFloat(amount))) newErrors.amount = 'Amount must be a number if provided.';
      if (amount && !currency.trim()) newErrors.currency = 'Currency is required if Amount is provided.';

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
  };

  // --- Save Handler ---
  const handleSaveClick = () => {
    if (!validate()) {
      return; // Stop if validation fails
    }

    const templateData = {
      id: isEditing ? template.id : undefined, // Include ID only if editing
      name: name.trim(),
      paymentType,
      recipientName: recipientName.trim(),
      recipientAccount: recipientAccount.trim(),
      recipientInstitution: recipientInstitution.trim(),
      traditionalRail: paymentType === 'Traditional' ? traditionalRail : '',
      onChainNetwork: paymentType === 'Tokenized' ? onChainNetwork : '', // Save network if Tokenized type
      amount: amount.trim() ? parseFloat(amount) : '', // Save as number or empty string
      currency: amount.trim() ? currency.trim().toUpperCase() : '', // Save currency only if amount exists
      purpose,
      // Note: We are not saving 'fromAccountLabel' or 'lastUsed' here,
      // 'lastUsed' will be updated when actually used.
    };
    onSave(templateData); // Pass data back to parent
  };

  // Helper to render inline errors
  const renderError = (fieldName) => {
    return errors[fieldName] ? <p className="text-xs text-red-600 mt-1">{errors[fieldName]}</p> : null;
  };

  return (
    // Modal backdrop
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      {/* Modal Content Box */}
      <div className="relative bg-white p-6 border w-full max-w-xl mx-auto shadow-lg rounded-md">
        {/* Header */}
        <div className="flex justify-between items-center mb-4 border-b pb-2">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            {isEditing ? 'Edit Payment Template' : 'Create New Payment Template'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
        </div>

        {/* Form Body */}
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2"> {/* Allow scrolling */}
          {/* Template Name */}
          <div>
            <label htmlFor="tpl-name" className="block text-sm font-medium text-gray-700">Template Name <span className="text-red-600">*</span></label>
            <input type="text" id="tpl-name" value={name} onChange={(e) => setName(e.target.value)} className={`mt-1 w-full p-2 border rounded text-sm ${errors.name ? 'border-red-500' : 'border-gray-300'}`} />
            {renderError('name')}
          </div>

          {/* Payment Type */}
          <div>
             <label htmlFor="tpl-paymentType" className="block text-sm font-medium text-gray-700">Payment Type <span className="text-red-600">*</span></label>
             <select id="tpl-paymentType" value={paymentType} onChange={(e) => setPaymentType(e.target.value)} className={`mt-1 w-full p-2 border rounded bg-white text-sm ${errors.paymentType ? 'border-red-500' : 'border-gray-300'}`}>
               {paymentTypes.map(type => <option key={type} value={type}>{type}</option>)}
             </select>
             {renderError('paymentType')}
          </div>

          {/* Conditional: Traditional Rail */}
          {paymentType === 'Traditional' && (
              <div>
                  <label htmlFor="tpl-traditionalRail" className="block text-sm font-medium text-gray-700">Payment Rail <span className="text-red-600">*</span></label>
                  <select id="tpl-traditionalRail" value={traditionalRail} onChange={(e) => setTraditionalRail(e.target.value)} className={`mt-1 w-full p-2 border rounded bg-white text-sm ${errors.traditionalRail ? 'border-red-500' : 'border-gray-300'}`} required>
                      {traditionalRailsList.map(rail => (<option key={rail.code} value={rail.code} disabled={rail.code === ''}>{rail.name}</option>))}
                  </select>
                  {renderError('traditionalRail')}
              </div>
          )}

          {/* Conditional: On-Chain Network */}
          {paymentType === 'Tokenized' && (
               <div>
                  <label htmlFor="tpl-onChainNetwork" className="block text-sm font-medium text-gray-700">Network (Optional)</label>
                  <select id="tpl-onChainNetwork" value={onChainNetwork} onChange={(e) => setOnChainNetwork(e.target.value)} className={`mt-1 w-full p-2 border rounded bg-white text-sm ${errors.onChainNetwork ? 'border-red-500' : 'border-gray-300'}`}>
                      {onChainNetworksList.map(net => (<option key={net.code} value={net.code} disabled={net.code === ''}>{net.name}</option>))}
                  </select>
                  {renderError('onChainNetwork')}
                   <p className="text-xs text-gray-500 mt-1">Specify if the recipient identifier is network-specific.</p>
              </div>
          )}

          {/* Recipient Details */}
          <div>
            <label htmlFor="tpl-recipientName" className="block text-sm font-medium text-gray-700">Recipient Name</label>
            <input type="text" id="tpl-recipientName" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} className="mt-1 w-full p-2 border rounded text-sm border-gray-300" />
          </div>
          <div>
            <label htmlFor="tpl-recipientAccount" className="block text-sm font-medium text-gray-700">Recipient Identifier <span className="text-red-600">*</span></label>
            <input type="text" id="tpl-recipientAccount" value={recipientAccount} onChange={(e) => setRecipientAccount(e.target.value)} className={`mt-1 w-full p-2 border rounded text-sm ${errors.recipientAccount ? 'border-red-500' : 'border-gray-300'}`} placeholder="Account #, Wallet Address, etc."/>
            {renderError('recipientAccount')}
          </div>
          {paymentType !== 'Internal' && ( // Hide for internal
            <div>
                <label htmlFor="tpl-recipientInstitution" className="block text-sm font-medium text-gray-700">Recipient Institution / Network</label>
                <input type="text" id="tpl-recipientInstitution" value={recipientInstitution} onChange={(e) => setRecipientInstitution(e.target.value)} className="mt-1 w-full p-2 border rounded text-sm border-gray-300" />
            </div>
          )}

          {/* Amount & Currency */}
          <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label htmlFor="tpl-amount" className="block text-sm font-medium text-gray-700">Amount (Optional)</label>
                <input type="number" id="tpl-amount" value={amount} onChange={(e) => setAmount(e.target.value)} className={`mt-1 w-full p-2 border rounded text-sm ${errors.amount ? 'border-red-500' : 'border-gray-300'}`} placeholder="Leave blank for variable"/>
                 {renderError('amount')}
              </div>
               <div>
                <label htmlFor="tpl-currency" className="block text-sm font-medium text-gray-700">Currency</label>
                <input type="text" id="tpl-currency" value={currency} onChange={(e) => setCurrency(e.target.value)} className={`mt-1 w-full p-2 border rounded text-sm ${errors.currency ? 'border-red-500' : 'border-gray-300'}`} placeholder="e.g., USD" disabled={!amount}/>
                {renderError('currency')}
              </div>
          </div>

           {/* Purpose */}
          <div>
            <label htmlFor="tpl-purpose" className="block text-sm font-medium text-gray-700">Purpose <span className="text-red-600">*</span></label>
            <select id="tpl-purpose" value={purpose} onChange={(e) => setPurpose(e.target.value)} className={`mt-1 w-full p-2 border rounded bg-white text-sm ${errors.purpose ? 'border-red-500' : 'border-gray-300'}`} required>
                {samplePurposes.map(p => (<option key={p} value={p === 'Select purpose code' ? '' : p} disabled={p === 'Select purpose code'}>{p}</option>))}
            </select>
            {renderError('purpose')}
          </div>

        </div>

        {/* Footer Buttons */}
        <div className="mt-6 flex justify-end space-x-3 pt-4 border-t">
          <button type="button" className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50" onClick={onClose}> Cancel </button>
          <button type="button" className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emtech-gold hover:opacity-90" onClick={handleSaveClick}> Save Template </button>
        </div>
      </div>
    </div>
  );
};

export default CreateEditTemplateModal;