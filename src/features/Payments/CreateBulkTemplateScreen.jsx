import React, { useState, useEffect } from 'react'; // Added useEffect for initialData handling
import { useAssets } from '../../context/AssetsContext.jsx';
import { useTemplates } from '../../context/TemplatesContext.jsx';
// Removed unused 'jurisdictions' import
import { hvtPurposeCodes } from './data/paymentConstants.js';

/**
 * Screen for creating bulk payment file templates.
 * Allows defining reusable configurations for bulk payment files.
 *
 * @param {object} props - Component props
 * @param {function} props.onBack - Callback function to navigate back
 * @param {function} props.onTemplateSubmit - Optional callback for template submission
 * @param {object} props.initialData - Optional initial data for editing an existing template
 */
const CreateBulkTemplateScreen = ({ onBack, onTemplateSubmit, initialData = null }) => {
  // --- Get context data ---
  const { assets } = useAssets();
  // Removed unused 'templates' state variable from destructuring
  const { dispatchTemplates } = useTemplates();

  // --- Local State ---
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [fileType, setFileType] = useState('CSV');
  const [sourceAccountId, setSourceAccountId] = useState('');
  const [defaultCurrency, setDefaultCurrency] = useState('USD');
  const [purposeCode, setPurposeCode] = useState('');
  const [processingMode, setProcessingMode] = useState('immediate');

  // Field mapping state - initialized empty or from initialData
  const [fieldMappings, setFieldMappings] = useState([
    // Default mappings can be adjusted or removed if initialData provides them
    { sourceField: 'recipientName', targetField: 'Recipient Name', required: true },
    { sourceField: 'recipientAccount', targetField: 'Account Number', required: true },
    { sourceField: 'amount', targetField: 'Amount', required: true },
    { sourceField: 'currency', targetField: 'Currency', required: false },
    { sourceField: 'reference', targetField: 'Reference', required: false },
  ]);

  // Payment validation rules - initialized with defaults or from initialData
  const [validationRules, setValidationRules] = useState({
    maxSingleAmount: 50000,
    maxTotalAmount: 5000000,
    allowInternational: false,
    allowUnlistedRecipients: false
  });

  // UI States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState('general'); // 'general', 'fields', 'validation', 'processing'

  // --- Effect to populate state from initialData ---
   useEffect(() => {
     if (initialData) {
       setTemplateName(initialData.name || '');
       setTemplateDescription(initialData.description || '');
       setFileType(initialData.fileType || 'CSV');
       setSourceAccountId(initialData.sourceAccountId || '');
       setDefaultCurrency(initialData.defaultCurrency || 'USD');
       setPurposeCode(initialData.purposeCode || '');
       setProcessingMode(initialData.processingMode || 'immediate');
       // Set mappings only if they exist in initialData, otherwise keep defaults
       if (Array.isArray(initialData.fieldMappings) && initialData.fieldMappings.length > 0) {
            setFieldMappings(initialData.fieldMappings);
       }
       // Set validation rules only if they exist in initialData
       if (initialData.validationRules && typeof initialData.validationRules === 'object') {
            setValidationRules({ ...validationRules, ...initialData.validationRules }); // Merge defaults with initialData
       }
     }
     // Reset state if initialData becomes null (e.g., navigating away and back)
     else {
        setTemplateName(''); setTemplateDescription(''); setFileType('CSV');
        setSourceAccountId(''); setDefaultCurrency('USD'); setPurposeCode('');
        setProcessingMode('immediate');
        // Reset to defaults if needed
        // setFieldMappings([...defaultFieldMappings]);
        // setValidationRules({...defaultValidationRules});
     }
     // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [initialData]); // Rerun effect when initialData changes


  // --- Field Mapping Handlers ---
  const handleAddFieldMapping = () => {
    setFieldMappings([
      ...fieldMappings,
      { sourceField: '', targetField: '', required: false }
    ]);
  };

  const handleUpdateFieldMapping = (index, field, value) => {
    const updatedMappings = [...fieldMappings];
    updatedMappings[index] = {
      ...updatedMappings[index],
      // Toggle boolean for 'required', otherwise set value
      [field]: field === 'required' ? !updatedMappings[index].required : value
    };
    setFieldMappings(updatedMappings);
  };

  const handleRemoveFieldMapping = (index) => {
    setFieldMappings(fieldMappings.filter((_, i) => i !== index));
  };

  // --- Validation Rule Handlers ---
  const handleValidationRuleChange = (rule, value) => {
    // Convert amount fields to numbers, keep others (like checkboxes) as they are
    const isAmountRule = rule.startsWith('max');
    const processedValue = isAmountRule ? parseFloat(value) || 0 : value; // Ensure amounts are numbers

    setValidationRules(prevRules => ({ // Use functional update for safety
      ...prevRules,
      [rule]: processedValue
    }));
  };

  // --- Form Submission Handler ---
  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSubmitting) return; // Prevent double submission
    setIsSubmitting(true);
    setErrors({});

    // Basic validation
    const newErrors = {};
    if (!templateName.trim()) newErrors.templateName = 'Template name is required';
    if (!sourceAccountId) newErrors.sourceAccountId = 'Source account is required';
    // Add more validation if needed (e.g., check field mappings)

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      // Focus first error field (optional enhancement)
      const firstErrorField = document.getElementById(Object.keys(newErrors)[0]);
      firstErrorField?.focus();
      return;
    }

    // Prepare template data
    const templateData = {
      id: initialData?.id || `bulk-tpl-${Date.now()}`,
      name: templateName.trim(),
      description: templateDescription.trim(),
      type: 'Bulk', // Explicitly mark as Bulk Template type
      fileType,
      sourceAccountId,
      defaultCurrency,
      purposeCode,
      processingMode,
      fieldMappings, // Ensure required mappings are included
      validationRules,
      created: initialData?.created || new Date().toISOString(),
      lastModified: new Date().toISOString(),
      lastUsed: initialData?.lastUsed || null // Preserve lastUsed if editing
    };

    // Simulate saving delay
    setTimeout(() => {
      console.log('Saving template:', templateData);

      // Use callback prop if provided, otherwise dispatch directly
      if (typeof onTemplateSubmit === 'function') {
        onTemplateSubmit(templateData);
        // Note: Navigation back might be handled by the parent in this case
      } else if (dispatchTemplates) {
        dispatchTemplates({
          type: initialData ? 'UPDATE_TEMPLATE' : 'ADD_TEMPLATE',
          payload: templateData
        });
        alert(`Template "${templateData.name}" ${initialData ? 'updated' : 'created'} successfully!`);
        onBack(); // Navigate back after successful save via dispatch
      } else {
        console.error("No template submission handler available (onTemplateSubmit prop or dispatchTemplates context)");
        alert("Error: Unable to save template due to configuration issue.");
      }

      setIsSubmitting(false);
    }, 700); // Simulate network delay
  };

  // --- Sample Data for File Format Examples ---
  const getFileFormatExample = () => {
    // Format examples based on current field mappings
    const headers = fieldMappings.map(m => m.targetField || `COLUMN_${fieldMappings.indexOf(m)+1}`).join(',');
    const exampleRow1 = fieldMappings.map(m => {
        switch(m.sourceField) {
            case 'recipientName': return 'ACME Corp';
            case 'recipientAccount': return 'US92387465';
            case 'amount': return '5000';
            case 'currency': return defaultCurrency || 'USD';
            case 'reference': return 'INV-2025-1234';
            case 'description': return 'March Invoice';
            default: return `Data_${fieldMappings.indexOf(m)+1}`;
        }
    }).join(',');
     const exampleRow2 = fieldMappings.map(m => {
        switch(m.sourceField) {
            case 'recipientName': return 'Global Supplies';
            case 'recipientAccount': return 'GB29NWBK601613';
            case 'amount': return '2350';
            case 'currency': return 'GBP'; // Example different currency
            case 'reference': return 'PO-89765';
            case 'description': return 'Office Supplies';
            default: return `Data2_${fieldMappings.indexOf(m)+1}`;
        }
    }).join(',');


    switch(fileType) {
      case 'CSV':
        return `${headers}\n${exampleRow1}\n${exampleRow2}`;
      case 'XML':
         // Generate basic XML example based on mappings
         const xmlFields1 = fieldMappings.map(m => `    <${m.targetField?.replace(/\s+/g, '') || `Field${fieldMappings.indexOf(m)+1}` }>${exampleRow1.split(',')[fieldMappings.indexOf(m)]}</${m.targetField?.replace(/\s+/g, '') || `Field${fieldMappings.indexOf(m)+1}` }>`).join('\n');
         return `<payments>\n  <payment>\n${xmlFields1}\n  </payment>\n</payments>`;
      case 'ISO20022':
        return `<?xml version="1.0" encoding="UTF-8"?>\n` +
               `<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pain.001.001.09">\n` +
               `  <CstmrCdtTrfInitn>\n` +
               `    \n` +
               `    <PmtInf>\n` +
               `      <CdtTrfTxInf>\n` +
               `        \n` +
               `        <Amt><InstdAmt Ccy="${defaultCurrency || 'USD'}">[Mapped Amount]</InstdAmt></Amt>\n` +
               `        <CdtrAcct><Id><IBAN>[Mapped Account]</IBAN></Id></CdtrAcct>\n` +
                `        <RmtInf><Ustrd>[Mapped Reference/Description]</Ustrd></RmtInf>\n`+
               `      </CdtTrfTxInf>\n` +
               `    </PmtInf>\n` +
               `  </CstmrCdtTrfInitn>\n` +
               `</Document>`;
      default:
        return `Example format for ${fileType} depends on specific structure and field mappings defined above.`;
    }
  };

  // --- Render Logic ---
  return (
    <div className="bg-white p-6 rounded shadow max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 border-b pb-3">
        <h1 className="text-2xl font-bold text-gray-800">
          {initialData ? 'Edit Bulk Payment Template' : 'Create Bulk Payment Template'}
        </h1>
        <button
          className="px-3 py-1 rounded text-white hover:opacity-90 bg-gray-800 text-sm"
          onClick={onBack}
        >
          Back to Bulk Dashboard
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex space-x-4 overflow-x-auto pb-1">
          {['general', 'fields', 'validation', 'processing'].map((tab) => (
             <button
                key={tab}
                type="button" // Prevent form submission
                className={`pb-2 px-1 text-sm sm:text-base focus:outline-none whitespace-nowrap capitalize ${
                  activeTab === tab
                    ? 'border-b-2 font-medium text-emtech-gold border-emtech-gold'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab(tab)}
              >
               {tab === 'fields' ? 'Field Mapping' : tab === 'validation' ? 'Validation & Limits' : `${tab.charAt(0).toUpperCase() + tab.slice(1)} ${tab === 'general' ? 'Settings': 'Options'}`}
             </button>
          ))}
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">

        {/* === General Settings Tab === */}
        {activeTab === 'general' && (
          <div className="space-y-6 animate-fade-in"> {/* Added animation class */}
            <div>
              <label htmlFor="templateName" className="block text-sm font-medium text-gray-700">
                Template Name <span className="text-red-600">*</span>
              </label>
              <input
                id="templateName"
                type="text"
                className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm p-2 border ${
                  errors.templateName ? 'border-red-500' : 'border-gray-300'
                }`}
                value={templateName}
                onChange={(e) => { setTemplateName(e.target.value); setErrors(p => ({...p, templateName: null})); }}
                placeholder="e.g., Monthly Vendor Payments"
                required // Added HTML required
              />
              {errors.templateName && (
                <p className="mt-1 text-sm text-red-600">{errors.templateName}</p>
              )}
            </div>

            <div>
              <label htmlFor="templateDescription" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="templateDescription"
                rows="3"
                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm sm:text-sm p-2 focus:ring-emtech-gold focus:border-emtech-gold"
                value={templateDescription}
                onChange={(e) => setTemplateDescription(e.target.value)}
                placeholder="Template purpose and usage instructions..."
              />
            </div>

             <div>
                <label htmlFor="fileType" className="block text-sm font-medium text-gray-700">File Format</label>
                <select id="fileType" value={fileType} onChange={(e) => setFileType(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emtech-gold focus:ring-emtech-gold sm:text-sm p-2 border">
                    <option value="CSV">CSV (Comma Separated Values)</option>
                    <option value="XML">XML (Generic)</option>
                    <option value="ISO20022">ISO 20022</option>
                    <option value="ACH">ACH</option>
                    {/* Add other formats as needed */}
                </select>
             </div>

            <div>
              <label htmlFor="sourceAccountId" className="block text-sm font-medium text-gray-700">
                Default Source Account <span className="text-red-600">*</span>
              </label>
              <select
                id="sourceAccountId"
                className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm p-2 border ${
                  errors.sourceAccountId ? 'border-red-500' : 'border-gray-300'
                } focus:ring-emtech-gold focus:border-emtech-gold`}
                value={sourceAccountId}
                onChange={(e) => { setSourceAccountId(e.target.value); setErrors(p => ({...p, sourceAccountId: null})); }}
                required // Added HTML required
              >
                <option value="" disabled>-- Select Source Account --</option>
                {Array.isArray(assets) && assets.map(asset => (
                  // Maybe filter assets suitable for bulk payments?
                  <option key={asset.id} value={asset.id}>
                    {asset.label} ({asset.balance.toLocaleString()} {asset.symbol})
                  </option>
                ))}
                 {!Array.isArray(assets) || assets.length === 0 && (
                    <option value="" disabled>Loading accounts...</option>
                 )}
              </select>
              {errors.sourceAccountId && (
                <p className="mt-1 text-sm text-red-600">{errors.sourceAccountId}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="defaultCurrency" className="block text-sm font-medium text-gray-700">Default Currency</label>
                <select id="defaultCurrency" value={defaultCurrency} onChange={(e) => setDefaultCurrency(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emtech-gold focus:ring-emtech-gold sm:text-sm p-2 border">
                  {/* Add more currencies as needed */}
                  <option value="USD">USD - US Dollar</option> <option value="EUR">EUR - Euro</option> <option value="GBP">GBP - British Pound</option> <option value="CAD">CAD - Canadian Dollar</option> <option value="JPY">JPY - Japanese Yen</option> <option value="GHS">GHS - Ghanaian Cedi</option> <option value="USDC">USDC - USD Coin</option>
                </select>
              </div>
              <div>
                <label htmlFor="purposeCode" className="block text-sm font-medium text-gray-700">Default Purpose Code</label>
                <select id="purposeCode" value={purposeCode} onChange={(e) => setPurposeCode(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emtech-gold focus:ring-emtech-gold sm:text-sm p-2 border">
                  <option value="">-- Optional --</option>
                  {/* Assuming hvtPurposeCodes[0] is "Select purpose code" */}
                  {hvtPurposeCodes.slice(1).map(code => (<option key={code} value={code}>{code}</option>))}
                  <option value="SALA">SALA - Salary Payment</option> <option value="SUPP">SUPP - Supplier Payment</option> <option value="PENS">PENS - Pension Payment</option>
                  {/* Add other common bulk purpose codes */}
                </select>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-md border border-gray-200 mt-4">
               <h3 className="text-sm font-medium text-gray-700 mb-2">Sample File Format ({fileType})</h3>
               <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto max-h-40 pretty-scrollbar">
                 {getFileFormatExample()}
               </pre>
             </div>
          </div>
        )}

        {/* === Field Mapping Tab === */}
        {activeTab === 'fields' && (
          <div className="space-y-6 animate-fade-in">
             <div className="flex justify-between items-center">
               <h3 className="text-md font-medium text-gray-700">Field Mappings</h3>
               <button type="button" onClick={handleAddFieldMapping} className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-emtech-gold hover:bg-yellow-600 focus:outline-none"> + Add Field </button>
             </div>
             <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
               <p className="text-sm text-gray-600 mb-4"> Map fields from your file to the system. Required fields must exist in every file processed with this template. </p>
               <div className="overflow-x-auto">
                 <table className="min-w-full divide-y divide-gray-200">
                   <thead className="bg-gray-100">
                     <tr>
                       <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source Field</th>
                       <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File Column/Tag Name</th>
                       <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Required</th>
                       <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                     </tr>
                   </thead>
                   <tbody className="bg-white divide-y divide-gray-200">
                     {fieldMappings.map((mapping, index) => (
                       <tr key={index} className="group hover:bg-gray-50">
                         <td className="px-3 py-2 whitespace-nowrap text-sm">
                           <select className="block w-full rounded-md border-gray-300 shadow-sm focus:border-emtech-gold focus:ring-emtech-gold sm:text-sm p-1 border" value={mapping.sourceField} onChange={(e) => handleUpdateFieldMapping(index, 'sourceField', e.target.value)} >
                             <option value="">-- Select Field --</option> <option value="recipientName">Recipient Name</option> <option value="recipientAccount">Account Number/IBAN</option> <option value="recipientBank">Bank/Institution</option> <option value="amount">Amount</option> <option value="currency">Currency</option> <option value="reference">Reference</option> <option value="description">Description</option> <option value="purposeCode">Purpose Code</option> <option value="valueDate">Value Date</option> <option value="batchId">Batch ID</option> <option value="custom">Custom Field</option>
                           </select>
                         </td>
                         <td className="px-3 py-2 whitespace-nowrap text-sm">
                           <input type="text" className="block w-full rounded-md border-gray-300 shadow-sm focus:border-emtech-gold focus:ring-emtech-gold sm:text-sm p-1 border" value={mapping.targetField} onChange={(e) => handleUpdateFieldMapping(index, 'targetField', e.target.value)} placeholder={fileType === 'CSV' ? 'Column Header' : 'XML Tag/Path'} />
                         </td>
                         <td className="px-3 py-2 whitespace-nowrap text-sm text-center">
                           <input type="checkbox" className="h-4 w-4 text-emtech-gold focus:ring-yellow-400 border-gray-300 rounded" checked={mapping.required} onChange={() => handleUpdateFieldMapping(index, 'required')} />
                         </td>
                         <td className="px-3 py-2 whitespace-nowrap text-sm text-center">
                           <button type="button" className="text-red-600 hover:text-red-900 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity p-1" onClick={() => handleRemoveFieldMapping(index)} title="Remove Mapping" >
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                           </button>
                         </td>
                       </tr>
                     ))}
                     {fieldMappings.length === 0 && ( <tr><td colSpan="4" className="px-3 py-4 text-sm text-center text-gray-500 italic"> No field mappings defined. Click "Add Field". </td></tr> )}
                   </tbody>
                 </table>
               </div>
             </div>
             <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
               <h4 className="font-medium text-blue-700 text-sm mb-2">Required System Fields</h4>
               <p className="text-sm text-blue-600"> At minimum, your template must map fields for recipient identification (e.g., Name), account number, and payment amount. </p>
             </div>
          </div>
        )}

        {/* === Validation Tab === */}
        {activeTab === 'validation' && (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-md font-medium text-gray-700">Payment Validation Rules</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                 <label htmlFor="maxSingleAmount" className="block text-sm font-medium text-gray-700"> Max Single Payment ({defaultCurrency}) </label>
                 <div className="mt-1 relative rounded-md shadow-sm">
                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><span className="text-gray-500 sm:text-sm">{defaultCurrency === 'USD' ? '$' : defaultCurrency === 'EUR' ? '€' : defaultCurrency === 'GBP' ? '£' : ''}</span></div>
                   <input type="number" id="maxSingleAmount" value={validationRules.maxSingleAmount} onChange={(e) => handleValidationRuleChange('maxSingleAmount', e.target.value)} placeholder="0.00" min="0" step="0.01" className="mt-1 block w-full pl-7 pr-12 rounded-md border-gray-300 shadow-sm focus:border-emtech-gold focus:ring-emtech-gold sm:text-sm p-2 border"/>
                   <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"><span className="text-gray-500 sm:text-sm">{defaultCurrency}</span></div>
                 </div>
                 <p className="mt-1 text-xs text-gray-500"> Reject individual payments exceeding this amount. </p>
              </div>
              <div>
                 <label htmlFor="maxTotalAmount" className="block text-sm font-medium text-gray-700"> Max Total Batch ({defaultCurrency}) </label>
                 <div className="mt-1 relative rounded-md shadow-sm">
                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><span className="text-gray-500 sm:text-sm">{defaultCurrency === 'USD' ? '$' : defaultCurrency === 'EUR' ? '€' : defaultCurrency === 'GBP' ? '£' : ''}</span></div>
                   <input type="number" id="maxTotalAmount" value={validationRules.maxTotalAmount} onChange={(e) => handleValidationRuleChange('maxTotalAmount', e.target.value)} placeholder="0.00" min="0" step="0.01" className="mt-1 block w-full pl-7 pr-12 rounded-md border-gray-300 shadow-sm focus:border-emtech-gold focus:ring-emtech-gold sm:text-sm p-2 border"/>
                   <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"><span className="text-gray-500 sm:text-sm">{defaultCurrency}</span></div>
                 </div>
                 <p className="mt-1 text-xs text-gray-500"> Batches exceeding this require additional approval. </p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="relative flex items-start">
                 <div className="flex items-center h-5"><input id="allowInternational" type="checkbox" checked={validationRules.allowInternational} onChange={(e) => handleValidationRuleChange('allowInternational', e.target.checked)} className="h-4 w-4 text-emtech-gold focus:ring-yellow-400 border-gray-300 rounded"/></div>
                 <div className="ml-3 text-sm"><label htmlFor="allowInternational" className="font-medium text-gray-700"> Allow International Payments </label><p className="text-gray-500"> Enable payments to accounts outside your primary jurisdiction. </p></div>
              </div>
              <div className="relative flex items-start">
                 <div className="flex items-center h-5"><input id="allowUnlistedRecipients" type="checkbox" checked={validationRules.allowUnlistedRecipients} onChange={(e) => handleValidationRuleChange('allowUnlistedRecipients', e.target.checked)} className="h-4 w-4 text-emtech-gold focus:ring-yellow-400 border-gray-300 rounded"/></div>
                 <div className="ml-3 text-sm"><label htmlFor="allowUnlistedRecipients" className="font-medium text-gray-700"> Allow Unlisted Recipients </label><p className="text-gray-500"> Allow payments to recipients not in your approved beneficiary list. </p></div>
              </div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
               <h4 className="font-medium text-yellow-700 text-sm mb-2">Compliance Notice</h4>
               <p className="text-sm text-yellow-600"> All payments are subject to standard compliance checks regardless of template settings. </p>
             </div>
          </div>
        )}

        {/* === Processing Options Tab === */}
        {activeTab === 'processing' && (
          <div className="space-y-6 animate-fade-in">
             <h3 className="text-md font-medium text-gray-700">Processing Configuration</h3>
             <fieldset> {/* Use fieldset for radio group */}
                <legend className="block text-sm font-medium text-gray-700">Default Processing Mode</legend>
                <div className="mt-2 space-y-2">
                   <div className="flex items-center"><input id="processing-immediate" name="processingMode" type="radio" checked={processingMode === 'immediate'} onChange={() => setProcessingMode('immediate')} className="h-4 w-4 text-emtech-gold focus:ring-yellow-400 border-gray-300"/> <label htmlFor="processing-immediate" className="ml-3 block text-sm font-medium text-gray-700"> Immediate Processing </label></div>
                   <div className="flex items-center"><input id="processing-scheduled" name="processingMode" type="radio" checked={processingMode === 'scheduled'} onChange={() => setProcessingMode('scheduled')} className="h-4 w-4 text-emtech-gold focus:ring-yellow-400 border-gray-300"/> <label htmlFor="processing-scheduled" className="ml-3 block text-sm font-medium text-gray-700"> Allow Scheduled Processing </label></div>
                   <div className="flex items-center"><input id="processing-approval" name="processingMode" type="radio" checked={processingMode === 'approval'} onChange={() => setProcessingMode('approval')} className="h-4 w-4 text-emtech-gold focus:ring-yellow-400 border-gray-300"/> <label htmlFor="processing-approval" className="ml-3 block text-sm font-medium text-gray-700"> Require Manual Approval </label></div>
                </div>
             </fieldset>
             <fieldset className="border-t border-gray-200 pt-4">
                <legend className="block text-sm font-medium text-gray-700 mb-2">Notification Settings (Placeholder)</legend>
                <div className="space-y-2">
                   <div className="flex items-center"><input id="notify-upload" type="checkbox" defaultChecked className="h-4 w-4 text-emtech-gold focus:ring-yellow-400 border-gray-300 rounded"/> <label htmlFor="notify-upload" className="ml-3 text-sm text-gray-700"> File Upload/Validation </label></div>
                   <div className="flex items-center"><input id="notify-processing" type="checkbox" defaultChecked className="h-4 w-4 text-emtech-gold focus:ring-yellow-400 border-gray-300 rounded"/> <label htmlFor="notify-processing" className="ml-3 text-sm text-gray-700"> Processing Start/Completion </label></div>
                   <div className="flex items-center"><input id="notify-errors" type="checkbox" defaultChecked className="h-4 w-4 text-emtech-gold focus:ring-yellow-400 border-gray-300 rounded"/> <label htmlFor="notify-errors" className="ml-3 text-sm text-gray-700"> Errors and Rejections </label></div>
                </div>
             </fieldset>
             <div className="bg-green-50 p-4 rounded-md border border-green-200">
               <h4 className="font-medium text-green-700 text-sm mb-2">Processing Information</h4>
               <p className="text-sm text-green-600"> "Immediate Processing" attempts to validate and process files upon upload. Others allow scheduling or require manual approval via the Active Bulk Files table. </p>
             </div>
          </div>
        )}

        {/* Form Action Buttons (always shown) */}
        <div className="pt-6 border-t border-gray-200 flex justify-between items-center">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
          >
            Cancel
          </button>

          <div className="space-x-3">
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
              onClick={() => alert("Draft functionality not implemented.")} // Placeholder action
            >
              Save Draft
            </button>
            <button
              type="submit"
              className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emtech-gold hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emtech-gold ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : (initialData ? 'Update Template' : 'Create Template')}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateBulkTemplateScreen;