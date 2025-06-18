import React, { useState, useEffect, useMemo } from 'react'; // <-- Added useMemo to import
import { useAssets } from '../../context/AssetsContext.jsx'; // Import useAssets hook
import { useRecurringPayments } from '../../context/RecurringPaymentsContext.jsx'; // Import useRecurringPayments hook
// Potentially import shared utils like renderError
// import { renderError } from '../../utils/displayUtils'; // Assuming you have this utility

// Define expected frequency options
const frequencyOptions = [
    'Daily', 'Weekly', 'Bi-Weekly', 'Monthly', 'Quarterly', 'Annually'
];

/**
 * Modal for creating or editing recurring payments.
 * Fetches assets from AssetsContext and dispatches save actions to RecurringPaymentsContext.
 *
 * @param {object} props - Component props.
 * @param {boolean} props.isOpen - Controls whether the modal is visible.
 * @param {function} props.onClose - Callback function to close the modal.
 * @param {object} [props.recurringPaymentData] - The recurring payment object to edit. If null/undefined, assumes creation mode.
 */
const RecurringPaymentModal = ({
    isOpen,
    onClose,
    recurringPaymentData, // null for create, object for edit
    // Removed assets and onSave props
}) => {

    // --- Hooks MUST be called unconditionally at the top ---
    const { assets } = useAssets(); // Get assets from context
    const { dispatchRecurring } = useRecurringPayments(); // Get dispatch for recurring payments
    const [formState, setFormState] = useState({});
    const [errors, setErrors] = useState({});
    const isEditing = Boolean(recurringPaymentData?.id); // Determine edit mode based on ID presence

    // --- MOVED useMemo hook call here (BEFORE conditional return) ---
    // Filter assets for dropdown using assets from context
    const sourceAccountOptions = useMemo(() => {
        if (!Array.isArray(assets)) return [];
        // Example filter: Allow any account with a positive balance (adjust criteria as needed)
        return assets.filter(a => a.balance >= 0); // Allow zero balance for potential future funding
    }, [assets]); // Depend on context assets

    // Initialize form when modal opens or data changes
    useEffect(() => {
        if (isOpen) {
            // Populate with existing data if editing, otherwise set defaults
            const initialFormState = recurringPaymentData || {
                name: '',
                fromAccountId: '',
                recipientName: '',
                recipientAccount: '',
                recipientInstitution: '',
                amount: '',
                currency: '',
                frequency: frequencyOptions[0],
                startDate: new Date().toISOString().split('T')[0],
                endDate: '',
            };
            // Ensure amount is string for input field consistency
            if (typeof initialFormState.amount === 'number') {
                initialFormState.amount = String(initialFormState.amount);
            }
            setFormState(initialFormState);
            setErrors({}); // Clear errors when opening/re-initializing
        }
    }, [isOpen, recurringPaymentData]);

    // --- Handlers ---
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));

        // Clear specific error on change
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }

        // Update currency automatically when 'fromAccountId' changes
        if (name === 'fromAccountId') {
             // Use assets from context
             const selectedAccount = assets?.find(a => a.id === value); // Add optional chaining for safety
             if (selectedAccount) {
                 setFormState(prev => ({ ...prev, currency: selectedAccount.symbol }));
                 // Also clear currency error if it was set
                 if (errors.currency) {
                     setErrors(prev => ({ ...prev, currency: null }));
                 }
             } else {
                  setFormState(prev => ({ ...prev, currency: '' })); // Clear currency if account not found
             }
             // Clear amount error related to balance if account changes
              if (errors.amount?.includes('balance')) {
                 setErrors(prev => ({ ...prev, amount: null }));
              }
        }

         // Clear recipient error if either field changes
         if (name === 'recipientName' || name === 'recipientAccount') {
             if (errors.recipient) {
                setErrors(prev => ({ ...prev, recipient: null }));
             }
         }
    };

    // Validation function
    const validateForm = () => {
        const newErrors = {};
        if (!formState.fromAccountId) newErrors.fromAccountId = 'Source account is required.';
        if (!formState.recipientName?.trim() && !formState.recipientAccount?.trim()) {
             newErrors.recipient = 'Recipient name or identifier is required.';
        }
        const amountValue = parseFloat(formState.amount);
        if (!formState.amount || isNaN(amountValue) || amountValue <= 0) {
             newErrors.amount = 'Valid positive amount is required.';
        } else {
            // Check balance only if amount is valid and account selected
            // Use assets from context
            const selectedAccount = assets?.find(a => a.id === formState.fromAccountId);
            if (selectedAccount && amountValue > selectedAccount.balance) {
                 newErrors.amount = `Amount exceeds available balance (${selectedAccount.balance.toLocaleString()}).`;
            }
        }
        if (!formState.currency) newErrors.currency = 'Currency is required (auto-set by account).';
        if (!formState.frequency) newErrors.frequency = 'Frequency is required.';
        if (!formState.startDate) newErrors.startDate = 'Start date is required.';
        if (formState.endDate && formState.startDate && formState.endDate < formState.startDate) {
             newErrors.endDate = 'End date cannot be before the start date.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Save handler - dispatches action directly
    const handleSaveClick = () => {
        if (validateForm()) {
            console.log("RecurringPaymentModal: Validated data:", formState);
            const dataToSave = {
                ...formState,
                amount: parseFloat(formState.amount), // Ensure amount is number
                id: recurringPaymentData?.id // Pass existing ID if editing
            };

            try {
                 // Dispatch the save action to RecurringPaymentsContext
                dispatchRecurring({
                    type: 'SAVE_RECURRING',
                    payload: dataToSave
                });
                console.log("Dispatching SAVE_RECURRING:", dataToSave);
                onClose(); // Close modal on successful dispatch

            } catch (error) {
                 console.error("Error dispatching save recurring payment action:", error);
                 setErrors({ general: "Failed to save recurring payment. Please try again." });
            }
        } else {
            console.log("Validation Errors:", errors);
        }
    };

    // --- Conditional return AFTER all hook calls ---
    if (!isOpen) {
        return null; // Return null if modal should not be rendered
    }

    // --- Render Logic (Only runs if isOpen is true) ---
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white z-10 flex-shrink-0">
                    <h2 className="text-xl font-bold text-gray-800">
                        {isEditing ? 'Edit Recurring Payment' : 'Setup New Recurring Payment'}
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-3xl leading-none">&times;</button>
                </div>

                {/* Form Body */}
                <div className="p-6 space-y-4 overflow-y-auto flex-grow">
                    {/* Name / Description */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name/Description (Optional)</label>
                        <input type="text" id="name" name="name" value={formState.name || ''} onChange={handleChange} className="w-full p-2 border rounded text-sm border-gray-300" placeholder="e.g., Monthly Rent, Weekly Payroll"/>
                    </div>

                    {/* From Account */}
                    <div>
                        <label htmlFor="fromAccountId" className="block text-sm font-medium text-gray-700 mb-1">From Account <span className="text-red-600">*</span></label>
                        <select
                            id="fromAccountId"
                            name="fromAccountId"
                            value={formState.fromAccountId || ''}
                            onChange={handleChange}
                            className={`w-full p-2 border rounded text-sm bg-white ${errors.fromAccountId ? 'border-red-500' : 'border-gray-300'} disabled:bg-gray-100`}
                            disabled={sourceAccountOptions.length === 0} // Use derived options for disabled check
                        >
                            <option value="" disabled>
                                {sourceAccountOptions.length === 0 ? '-- Loading Accounts --' : 'Select source account...'}
                            </option>
                            {/* Use sourceAccountOptions derived from useMemo */}
                            {sourceAccountOptions.map(acc => (
                                <option key={acc.id} value={acc.id}>
                                    {acc.label} ({acc.symbol} {acc.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
                                </option>
                            ))}
                        </select>
                        {errors.fromAccountId && <p className="text-xs text-red-600 mt-1">{errors.fromAccountId}</p>}
                    </div>

                    {/* Recipient Details */}
                    <fieldset className="border p-4 rounded">
                         <legend className="text-sm font-medium text-gray-700 px-1">Recipient</legend>
                         <div className="space-y-3">
                            <div>
                                <label htmlFor="recipientName" className="block text-xs font-medium text-gray-600">Name</label>
                                <input type="text" id="recipientName" name="recipientName" value={formState.recipientName || ''} onChange={handleChange} className="w-full p-2 border rounded text-sm border-gray-300" />
                            </div>
                             <div>
                                <label htmlFor="recipientAccount" className="block text-xs font-medium text-gray-600">Account/Identifier</label>
                                <input type="text" id="recipientAccount" name="recipientAccount" value={formState.recipientAccount || ''} onChange={handleChange} className={`w-full p-2 border rounded text-sm ${errors.recipient ? 'border-red-500' : 'border-gray-300'}`} placeholder="Account #, Wallet, etc."/>
                             </div>
                             <div>
                                <label htmlFor="recipientInstitution" className="block text-xs font-medium text-gray-600">Institution/Network (Optional)</label>
                                <input type="text" id="recipientInstitution" name="recipientInstitution" value={formState.recipientInstitution || ''} onChange={handleChange} className="w-full p-2 border rounded text-sm border-gray-300" />
                             </div>
                         </div>
                         {errors.recipient && <p className="text-xs text-red-600 mt-1">{errors.recipient}</p>}
                    </fieldset>

                     {/* Amount and Currency */}
                    <div className="flex space-x-4">
                        <div className="flex-grow">
                            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">Amount <span className="text-red-600">*</span></label>
                            <input
                                type="number" id="amount" name="amount" value={formState.amount || ''}
                                onChange={handleChange}
                                className={`w-full p-2 border rounded text-sm ${errors.amount ? 'border-red-500' : 'border-gray-300'}`}
                                placeholder="0.00" min="0" step="any"
                            />
                            {errors.amount && <p className="text-xs text-red-600 mt-1">{errors.amount}</p>}
                        </div>
                        <div className="w-32">
                             <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">Currency <span className="text-red-600">*</span></label>
                             <input
                                type="text" id="currency" name="currency" value={formState.currency || ''}
                                readOnly
                                className={`w-full p-2 border rounded text-sm bg-gray-100 ${errors.currency ? 'border-red-500' : 'border-gray-300'}`}
                             />
                             {errors.currency && <p className="text-xs text-red-600 mt-1">{errors.currency}</p>}
                        </div>
                    </div>

                     {/* Frequency and Dates */}
                     <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                         <div>
                             <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 mb-1">Frequency <span className="text-red-600">*</span></label>
                             <select id="frequency" name="frequency" value={formState.frequency || ''} onChange={handleChange} className={`w-full p-2 border rounded text-sm bg-white ${errors.frequency ? 'border-red-500' : 'border-gray-300'}`}>
                                 {frequencyOptions.map(freq => <option key={freq} value={freq}>{freq}</option>)}
                             </select>
                             {errors.frequency && <p className="text-xs text-red-600 mt-1">{errors.frequency}</p>}
                         </div>
                          <div>
                             <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">Start Date <span className="text-red-600">*</span></label>
                             <input type="date" id="startDate" name="startDate" value={formState.startDate || ''} onChange={handleChange} className={`w-full p-2 border rounded text-sm ${errors.startDate ? 'border-red-500' : 'border-gray-300'}`} min={new Date().toISOString().split('T')[0]}/>
                             {errors.startDate && <p className="text-xs text-red-600 mt-1">{errors.startDate}</p>}
                         </div>
                         <div>
                             <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">End Date (Optional)</label>
                             <input type="date" id="endDate" name="endDate" value={formState.endDate || ''} onChange={handleChange} className={`w-full p-2 border rounded text-sm ${errors.endDate ? 'border-red-500' : 'border-gray-300'}`} min={formState.startDate || ''} />
                             {errors.endDate && <p className="text-xs text-red-600 mt-1">{errors.endDate}</p>}
                         </div>
                     </div>

                    {/* General Error Display */}
                     {errors.general && <p className="text-sm text-red-600 mt-2">{errors.general}</p>}

                </div>

                {/* Footer */}
                <div className="flex justify-end items-center p-4 border-t sticky bottom-0 bg-gray-50 z-10 flex-shrink-0 space-x-3">
                    <button onClick={onClose} className="px-4 py-2 rounded text-sm bg-gray-200 hover:bg-gray-300 text-gray-800">Cancel</button>
                    <button onClick={handleSaveClick} className="px-4 py-2 rounded text-sm bg-emtech-gold text-white hover:opacity-90">
                        {isEditing ? 'Save Changes' : 'Create Recurring Payment'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RecurringPaymentModal;