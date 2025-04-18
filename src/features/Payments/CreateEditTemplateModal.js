import React, { useState, useEffect, useMemo } from 'react';
import { useAssets } from '../../context/AssetsContext'; // Import useAssets hook
import { useTemplates } from '../../context/TemplatesContext'; // Import useTemplates hook
import { renderError } from '../../utils/displayUtils';
import {
    paymentTypes,
    traditionalRailsList,
    onChainNetworksList,
    modalSamplePurposes
} from './data/paymentConstants';

/**
 * Modal for creating or editing payment templates.
 * Fetches assets from AssetsContext and dispatches save actions to TemplatesContext.
 *
 * @param {object} props - Component props.
 * @param {object} [props.template] - The template object to edit. If null/undefined, assumes creation mode.
 * @param {function} props.onClose - Callback function to close the modal.
 */
const CreateEditTemplateModal = ({ template, onClose }) => { // Removed assets and onSave props
  const isEditing = Boolean(template);

  // --- Get context data and dispatch functions ---
  const { assets } = useAssets(); // Get assets from context
  const { dispatchTemplates } = useTemplates(); // Get dispatch function for templates

  // --- Local form state ---
  const [name, setName] = useState('');
  const [paymentType, setPaymentType] = useState('Tokenized');
  const [fromAccountId, setFromAccountId] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientAccount, setRecipientAccount] = useState('');
  const [recipientInstitution, setRecipientInstitution] = useState('');
  const [traditionalRail, setTraditionalRail] = useState('');
  const [onChainNetwork, setOnChainNetwork] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('');
  const [purpose, setPurpose] = useState('');
  const [errors, setErrors] = useState({});

  // Use assets from context for the dropdown
  const availableAccounts = useMemo(() => {
    // Provide a stable empty array if assets is null/undefined or still loading
    return assets || [];
  }, [assets]); // Depend on assets from context

  // Effect to populate form when editing or reset when creating
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

      // Populate fromAccountId based on label lookup using accounts from context
      const currentFromAccount = availableAccounts.find(acc => acc.label === template.fromAccountLabel);
      setFromAccountId(currentFromAccount ? currentFromAccount.id : '');

      setErrors({});
    } else {
      // Reset form for creation
      setName('');
      setPaymentType('Tokenized');
      setFromAccountId('');
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
  }, [template, isEditing, availableAccounts]); // Depend on availableAccounts (derived from context assets)

  // --- Validation ---
  const validate = () => {
      const newErrors = {};
      if (!name.trim()) newErrors.name = 'Template Name is required.';
      if (!paymentType) newErrors.paymentType = 'Payment Type is required.';
      if (!fromAccountId) newErrors.fromAccountId = 'From Account is required.';
      if (!recipientAccount.trim()) newErrors.recipientAccount = 'Recipient Identifier is required.';
      if (!purpose) newErrors.purpose = 'Purpose is required.';
      if (paymentType === 'Traditional' && !traditionalRail) newErrors.traditionalRail = 'Payment Rail is required for Traditional type.';
      if (amount && isNaN(parseFloat(amount))) newErrors.amount = 'Amount must be a number if provided.';
      if (amount && parseFloat(amount) !== 0 && !currency.trim()) newErrors.currency = 'Currency is required if Amount is provided.';
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
  };

  // --- Save Handler - Dispatches directly to context ---
  const handleSaveClick = () => {
    if (!validate()) { return; }

    // Find the selected account details from context assets
    const selectedAccount = availableAccounts.find(acc => acc.id === fromAccountId);
    const labelToSave = selectedAccount ? selectedAccount.label : ''; // Get label for storage

    // Construct template data payload
    const templateData = {
      id: isEditing ? template.id : undefined, // Let reducer handle ID generation for new templates if needed
      name: name.trim(),
      paymentType,
      fromAccountLabel: labelToSave, // Store label for potential display elsewhere
      fromAccountId: fromAccountId, // Store ID for actual use
      recipientName: recipientName.trim(),
      recipientAccount: recipientAccount.trim(),
      recipientInstitution: recipientInstitution.trim(),
      traditionalRail: paymentType === 'Traditional' ? traditionalRail : '',
      onChainNetwork: paymentType === 'Tokenized' ? onChainNetwork : '',
      // Ensure amount is stored as number or empty string
      amount: amount.trim() ? parseFloat(amount) : '',
      // Ensure currency is stored as uppercase or empty string
      currency: amount.trim() ? currency.trim().toUpperCase() : '',
      purpose,
    };

    try {
        // Dispatch the save action to TemplatesContext
        dispatchTemplates({
            type: 'SAVE_TEMPLATE', // Assumes your reducer handles ADD/UPDATE via SAVE
            payload: templateData
        });
        console.log("Dispatching SAVE_TEMPLATE:", templateData);
        onClose(); // Close modal on successful dispatch

    } catch (error) {
        console.error("Error dispatching save template action:", error);
        // Optionally set an error state here to display in the modal
        setErrors({ general: "Failed to save template. Please try again." });
    }
  };

  // --- Render Logic ---
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative bg-white p-6 border w-full max-w-xl mx-auto shadow-lg rounded-md">
        {/* Header */}
        <div className="flex justify-between items-center mb-4 border-b pb-2">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            {isEditing ? 'Edit Payment Template' : 'Create New Payment Template'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
        </div>

        {/* Form Body */}
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          {/* Template Name */}
          <div>
            <label htmlFor="tpl-name" className="block text-sm font-medium text-gray-700">Template Name <span className="text-red-600">*</span></label>
            <input type="text" id="tpl-name" value={name} onChange={(e) => setName(e.target.value)} className={`mt-1 w-full p-2 border rounded text-sm ${errors.name ? 'border-red-500' : 'border-gray-300'}`} />
            {renderError(errors.name)}
          </div>

          {/* Payment Type */}
          <div>
             <label htmlFor="tpl-paymentType" className="block text-sm font-medium text-gray-700">Payment Type <span className="text-red-600">*</span></label>
             <select id="tpl-paymentType" value={paymentType} onChange={(e) => setPaymentType(e.target.value)} className={`mt-1 w-full p-2 border rounded bg-white text-sm ${errors.paymentType ? 'border-red-500' : 'border-gray-300'}`}>
               {paymentTypes.map(type => <option key={type} value={type}>{type}</option>)}
             </select>
             {renderError(errors.paymentType)}
          </div>

          {/* From Account Dropdown (Uses context assets) */}
          <div>
            <label htmlFor="tpl-fromAccount" className="block text-sm font-medium text-gray-700">From Account <span className="text-red-600">*</span></label>
            <select
                id="tpl-fromAccount"
                value={fromAccountId}
                onChange={(e) => setFromAccountId(e.target.value)}
                className={`mt-1 w-full p-2 border rounded bg-white text-sm ${errors.fromAccountId ? 'border-red-500' : 'border-gray-300'} disabled:bg-gray-100`}
                disabled={availableAccounts.length === 0} // Disable if no accounts loaded
            >
                <option value="" disabled>
                    {availableAccounts.length === 0 ? '-- Loading Accounts --' : '-- Select Source Account --'}
                </option>
                {/* Use availableAccounts derived from context assets */}
                {availableAccounts.map(account => (
                    <option key={account.id} value={account.id}>
                        {account.label} ({account.balance.toLocaleString()} {account.symbol})
                    </option>
                ))}
            </select>
            {availableAccounts.length === 0 && !assets && <p className="text-xs text-gray-500 mt-1">Loading account list...</p> }
            {renderError(errors.fromAccountId)}
          </div>

          {/* Conditional Fields based on Payment Type */}
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

          {/* Recipient Fields */}
          <div>
            <label htmlFor="tpl-recipientName" className="block text-sm font-medium text-gray-700">Recipient Name</label>
            <input type="text" id="tpl-recipientName" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} className="mt-1 w-full p-2 border rounded text-sm border-gray-300" />
          </div>
          <div>
            <label htmlFor="tpl-recipientAccount" className="block text-sm font-medium text-gray-700">Recipient Identifier <span className="text-red-600">*</span></label>
            <input type="text" id="tpl-recipientAccount" value={recipientAccount} onChange={(e) => setRecipientAccount(e.target.value)} className={`mt-1 w-full p-2 border rounded text-sm ${errors.recipientAccount ? 'border-red-500' : 'border-gray-300'}`} placeholder="Account #, Wallet Address, etc."/>
            {renderError(errors.recipientAccount)}
          </div>
          {paymentType !== 'Internal' && ( // Hide for internal transfers? Maybe depends on definition
            <div>
                <label htmlFor="tpl-recipientInstitution" className="block text-sm font-medium text-gray-700">Recipient Institution / Network</label>
                <input type="text" id="tpl-recipientInstitution" value={recipientInstitution} onChange={(e) => setRecipientInstitution(e.target.value)} className="mt-1 w-full p-2 border rounded text-sm border-gray-300" />
            </div>
          )}

          {/* Amount / Currency */}
          <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label htmlFor="tpl-amount" className="block text-sm font-medium text-gray-700">Amount (Optional)</label>
                <input type="number" id="tpl-amount" value={amount} onChange={(e) => setAmount(e.target.value)} className={`mt-1 w-full p-2 border rounded text-sm ${errors.amount ? 'border-red-500' : 'border-gray-300'}`} placeholder="Leave blank for variable" min="0" step="any"/>
                 {renderError(errors.amount)}
              </div>
               <div>
                <label htmlFor="tpl-currency" className="block text-sm font-medium text-gray-700">Currency</label>
                <input type="text" id="tpl-currency" value={currency} onChange={(e) => setCurrency(e.target.value)} className={`mt-1 w-full p-2 border rounded text-sm uppercase ${errors.currency ? 'border-red-500' : 'border-gray-300'}`} placeholder="e.g., USD" disabled={!amount.trim()} maxLength={5} />
                {renderError(errors.currency)}
              </div>
          </div>

          {/* Purpose */}
          <div>
            <label htmlFor="tpl-purpose" className="block text-sm font-medium text-gray-700">Purpose <span className="text-red-600">*</span></label>
            <select id="tpl-purpose" value={purpose} onChange={(e) => setPurpose(e.target.value)} className={`mt-1 w-full p-2 border rounded bg-white text-sm ${errors.purpose ? 'border-red-500' : 'border-gray-300'}`} required>
                {modalSamplePurposes.map(p => (<option key={p} value={p === 'Select purpose code' ? '' : p} disabled={p === 'Select purpose code'}>{p}</option>))}
            </select>
            {renderError(errors.purpose)}
          </div>

          {/* General Error Display Area */}
           {errors.general && renderError(errors.general)}

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