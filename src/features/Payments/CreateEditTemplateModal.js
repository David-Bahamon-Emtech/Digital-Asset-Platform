// src/features/Payments/CreateEditTemplateModal.js
import React, { useState, useEffect, useMemo } from 'react';
import { renderError } from '../../utils/displayUtils';
import {
    paymentTypes,
    traditionalRailsList,
    onChainNetworksList,
    modalSamplePurposes
} from './data/paymentConstants';

const CreateEditTemplateModal = ({ template, onClose, onSave, assets = [] }) => {
  const isEditing = Boolean(template);

  const [name, setName] = useState('');
  const [paymentType, setPaymentType] = useState('Tokenized');
  const [fromAccountId, setFromAccountId] = useState(''); // Added state
  const [recipientName, setRecipientName] = useState('');
  const [recipientAccount, setRecipientAccount] = useState('');
  const [recipientInstitution, setRecipientInstitution] = useState('');
  const [traditionalRail, setTraditionalRail] = useState('');
  const [onChainNetwork, setOnChainNetwork] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('');
  const [purpose, setPurpose] = useState('');
  const [errors, setErrors] = useState({});

  const availableAccounts = useMemo(() => {
    // Provide a stable empty array if assets is null/undefined
    return assets || [];
  }, [assets]);

  useEffect(() => {
    if (isEditing && template) {
      setName(template.name || '');
      setPaymentType(template.paymentType || 'Tokenized');
      setRecipientName(template.recipientName || '');
      setRecipientAccount(template.recipientAccount || '');
      setRecipientInstitution(template.recipientInstitution || '');
      setTraditionalRail(template.traditionalRail || '');
      setOnChainNetwork(template.onChainNetwork || '');
      setAmount(template.amount || '');
      setCurrency(template.currency || '');
      setPurpose(template.purpose || '');

      // Populate fromAccountId based on label lookup
      const currentFromAccount = availableAccounts.find(acc => acc.label === template.fromAccountLabel);
      setFromAccountId(currentFromAccount ? currentFromAccount.id : '');

      setErrors({});
    } else {
      // Reset form for creation
      setName('');
      setPaymentType('Tokenized');
      setFromAccountId(''); // Reset new state
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
  }, [template, isEditing, availableAccounts]); // Added availableAccounts dependency

  const validate = () => {
      const newErrors = {};
      if (!name.trim()) newErrors.name = 'Template Name is required.';
      if (!paymentType) newErrors.paymentType = 'Payment Type is required.';
      if (!fromAccountId) newErrors.fromAccountId = 'From Account is required.'; // Added validation
      if (!recipientAccount.trim()) newErrors.recipientAccount = 'Recipient Identifier is required.';
      if (!purpose) newErrors.purpose = 'Purpose is required.';
      if (paymentType === 'Traditional' && !traditionalRail) newErrors.traditionalRail = 'Payment Rail is required for Traditional type.';
      if (amount && isNaN(parseFloat(amount))) newErrors.amount = 'Amount must be a number if provided.';
      // Allow currency to be blank if amount is blank (for variable amount templates)
      if (amount && parseFloat(amount) !== 0 && !currency.trim()) newErrors.currency = 'Currency is required if Amount is provided.';
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
  };

  const handleSaveClick = () => {
    if (!validate()) { return; }

    const selectedAccount = availableAccounts.find(acc => acc.id === fromAccountId);
    const labelToSave = selectedAccount ? selectedAccount.label : ''; // Get label from selected account

    const templateData = {
      id: isEditing ? template.id : `tpl-${Date.now()}`, // Ensure new templates get an ID
      name: name.trim(),
      paymentType,
      fromAccountLabel: labelToSave, // Add the label to save data
      recipientName: recipientName.trim(),
      recipientAccount: recipientAccount.trim(),
      recipientInstitution: recipientInstitution.trim(),
      traditionalRail: paymentType === 'Traditional' ? traditionalRail : '',
      onChainNetwork: paymentType === 'Tokenized' ? onChainNetwork : '',
      amount: amount.trim() ? parseFloat(amount) : '',
      currency: amount.trim() ? currency.trim().toUpperCase() : '',
      purpose,
    };
    onSave(templateData);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative bg-white p-6 border w-full max-w-xl mx-auto shadow-lg rounded-md">
        <div className="flex justify-between items-center mb-4 border-b pb-2">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            {isEditing ? 'Edit Payment Template' : 'Create New Payment Template'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
        </div>

        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          <div>
            <label htmlFor="tpl-name" className="block text-sm font-medium text-gray-700">Template Name <span className="text-red-600">*</span></label>
            <input type="text" id="tpl-name" value={name} onChange={(e) => setName(e.target.value)} className={`mt-1 w-full p-2 border rounded text-sm ${errors.name ? 'border-red-500' : 'border-gray-300'}`} />
            {renderError(errors.name)}
          </div>

          <div>
             <label htmlFor="tpl-paymentType" className="block text-sm font-medium text-gray-700">Payment Type <span className="text-red-600">*</span></label>
             <select id="tpl-paymentType" value={paymentType} onChange={(e) => setPaymentType(e.target.value)} className={`mt-1 w-full p-2 border rounded bg-white text-sm ${errors.paymentType ? 'border-red-500' : 'border-gray-300'}`}>
               {paymentTypes.map(type => <option key={type} value={type}>{type}</option>)}
             </select>
             {renderError(errors.paymentType)}
          </div>

          {/* --- Added From Account Dropdown --- */}
          <div>
            <label htmlFor="tpl-fromAccount" className="block text-sm font-medium text-gray-700">From Account <span className="text-red-600">*</span></label>
            <select
                id="tpl-fromAccount"
                value={fromAccountId}
                onChange={(e) => setFromAccountId(e.target.value)}
                className={`mt-1 w-full p-2 border rounded bg-white text-sm ${errors.fromAccountId ? 'border-red-500' : 'border-gray-300'}`}
            >
                <option value="" disabled>-- Select Source Account --</option>
                {availableAccounts.map(account => (
                    <option key={account.id} value={account.id}>
                        {account.label} ({account.balance.toLocaleString()} {account.symbol})
                    </option>
                ))}
            </select>
            {renderError(errors.fromAccountId)}
          </div>
          {/* --- End Added Field --- */}

          {paymentType === 'Traditional' && (
              <div>
                  <label htmlFor="tpl-traditionalRail" className="block text-sm font-medium text-gray-700">Payment Rail <span className="text-red-600">*</span></label>
                  <select id="tpl-traditionalRail" value={traditionalRail} onChange={(e) => setTraditionalRail(e.target.value)} className={`mt-1 w-full p-2 border rounded bg-white text-sm ${errors.traditionalRail ? 'border-red-500' : 'border-gray-300'}`} required>
                      {traditionalRailsList.map(rail => (<option key={rail.code} value={rail.code} disabled={rail.code === ''}>{rail.name}</option>))}
                  </select>
                  {renderError(errors.traditionalRail)}
              </div>
          )}

          {paymentType === 'Tokenized' && (
               <div>
                  <label htmlFor="tpl-onChainNetwork" className="block text-sm font-medium text-gray-700">Network (Optional)</label>
                  <select id="tpl-onChainNetwork" value={onChainNetwork} onChange={(e) => setOnChainNetwork(e.target.value)} className={`mt-1 w-full p-2 border rounded bg-white text-sm ${errors.onChainNetwork ? 'border-red-500' : 'border-gray-300'}`}>
                      {onChainNetworksList.map(net => (<option key={net.code} value={net.code} disabled={net.code === ''}>{net.name}</option>))}
                  </select>
                  {renderError(errors.onChainNetwork)}
                   <p className="text-xs text-gray-500 mt-1">Specify if the recipient identifier is network-specific.</p>
              </div>
          )}

          <div>
            <label htmlFor="tpl-recipientName" className="block text-sm font-medium text-gray-700">Recipient Name</label>
            <input type="text" id="tpl-recipientName" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} className="mt-1 w-full p-2 border rounded text-sm border-gray-300" />
          </div>
          <div>
            <label htmlFor="tpl-recipientAccount" className="block text-sm font-medium text-gray-700">Recipient Identifier <span className="text-red-600">*</span></label>
            <input type="text" id="tpl-recipientAccount" value={recipientAccount} onChange={(e) => setRecipientAccount(e.target.value)} className={`mt-1 w-full p-2 border rounded text-sm ${errors.recipientAccount ? 'border-red-500' : 'border-gray-300'}`} placeholder="Account #, Wallet Address, etc."/>
            {renderError(errors.recipientAccount)}
          </div>
          {paymentType !== 'Internal' && (
            <div>
                <label htmlFor="tpl-recipientInstitution" className="block text-sm font-medium text-gray-700">Recipient Institution / Network</label>
                <input type="text" id="tpl-recipientInstitution" value={recipientInstitution} onChange={(e) => setRecipientInstitution(e.target.value)} className="mt-1 w-full p-2 border rounded text-sm border-gray-300" />
            </div>
          )}

          <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label htmlFor="tpl-amount" className="block text-sm font-medium text-gray-700">Amount (Optional)</label>
                <input type="number" id="tpl-amount" value={amount} onChange={(e) => setAmount(e.target.value)} className={`mt-1 w-full p-2 border rounded text-sm ${errors.amount ? 'border-red-500' : 'border-gray-300'}`} placeholder="Leave blank for variable"/>
                 {renderError(errors.amount)}
              </div>
               <div>
                <label htmlFor="tpl-currency" className="block text-sm font-medium text-gray-700">Currency</label>
                <input type="text" id="tpl-currency" value={currency} onChange={(e) => setCurrency(e.target.value)} className={`mt-1 w-full p-2 border rounded text-sm ${errors.currency ? 'border-red-500' : 'border-gray-300'}`} placeholder="e.g., USD" disabled={!amount.trim()} />
                {renderError(errors.currency)}
              </div>
          </div>

          <div>
            <label htmlFor="tpl-purpose" className="block text-sm font-medium text-gray-700">Purpose <span className="text-red-600">*</span></label>
            <select id="tpl-purpose" value={purpose} onChange={(e) => setPurpose(e.target.value)} className={`mt-1 w-full p-2 border rounded bg-white text-sm ${errors.purpose ? 'border-red-500' : 'border-gray-300'}`} required>
                {modalSamplePurposes.map(p => (<option key={p} value={p === 'Select purpose code' ? '' : p} disabled={p === 'Select purpose code'}>{p}</option>))}
            </select>
            {renderError(errors.purpose)}
          </div>

        </div>

        <div className="mt-6 flex justify-end space-x-3 pt-4 border-t">
          <button type="button" className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50" onClick={onClose}> Cancel </button>
          <button type="button" className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emtech-gold hover:opacity-90" onClick={handleSaveClick}> Save Template </button>
        </div>
      </div>
    </div>
  );
};

export default CreateEditTemplateModal;