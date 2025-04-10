// src/features/Payments/RecurringPaymentModal.js
import React, { useState, useEffect } from 'react';
// Potentially import shared utils like renderError
// import { renderError } from '../../utils/displayUtils';

// Define expected frequency options
const frequencyOptions = [
    'Daily', 'Weekly', 'Bi-Weekly', 'Monthly', 'Quarterly', 'Annually'
    // You might want more specific options like 'Monthly (1st)', 'Weekly (Monday)'
];

const RecurringPaymentModal = ({
    isOpen,
    onClose,
    onSave,
    recurringPaymentData, // null for create, object for edit
    assets = []
}) => {
    // --- Form State ---
    const [formState, setFormState] = useState({});
    const [errors, setErrors] = useState({});

    // Initialize form when modal opens or data changes
    useEffect(() => {
        if (isOpen) {
            setFormState(recurringPaymentData || {
                // Default values for creation
                name: '',
                fromAccountId: '',
                recipientName: '',
                recipientAccount: '',
                recipientInstitution: '',
                amount: '',
                currency: '', // Might default based on fromAccount
                frequency: frequencyOptions[0], // Default frequency
                startDate: new Date().toISOString().split('T')[0], // Default to today
                // nextDate: '', // Usually calculated or set based on start/freq
                // endDate: '', // Optional
            });
            setErrors({}); // Clear errors when opening
        }
    }, [isOpen, recurringPaymentData]);

    // --- Handlers ---
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
        // Basic validation example (clear error on change)
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }

        // --- Add logic: If fromAccountId changes, update currency options/default ---
        if (name === 'fromAccountId') {
             const selectedAccount = assets.find(a => a.id === value);
             if (selectedAccount) {
                 setFormState(prev => ({ ...prev, currency: selectedAccount.symbol }));
             }
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formState.fromAccountId) newErrors.fromAccountId = 'Source account is required.';
        if (!formState.recipientName && !formState.recipientAccount) newErrors.recipient = 'Recipient name or account is required.';
        if (!formState.amount || isNaN(parseFloat(formState.amount)) || parseFloat(formState.amount) <= 0) newErrors.amount = 'Valid amount is required.';
        if (!formState.currency) newErrors.currency = 'Currency is required.';
        if (!formState.frequency) newErrors.frequency = 'Frequency is required.';
        if (!formState.startDate) newErrors.startDate = 'Start date is required.';
        // Add more specific validation...
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSaveClick = () => {
        if (validateForm()) {
            console.log("RecurringPaymentModal: Submitting data:", formState);
            // Pass validated data (potentially clean up unused fields) back to parent
            onSave({ ...formState, amount: parseFloat(formState.amount) });
        } else {
            console.log("Validation Errors:", errors);
        }
    };

    // --- Render Logic ---
    if (!isOpen) return null;

    // Filter assets for dropdown (only show accounts user can send from)
    const sourceAccountOptions = assets.filter(a => a.balance > 0); // Or other criteria

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-bold text-gray-800">
                        {recurringPaymentData ? 'Edit Recurring Payment' : 'Setup New Recurring Payment'}
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">&times;</button>
                </div>

                {/* Form Body */}
                <div className="p-6 space-y-4">
                    {/* Name / Description */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name/Description (Optional)</label>
                        <input type="text" id="name" name="name" value={formState.name || ''} onChange={handleChange} className="w-full p-2 border rounded text-sm" />
                    </div>

                    {/* From Account */}
                    <div>
                        <label htmlFor="fromAccountId" className="block text-sm font-medium text-gray-700 mb-1">From Account *</label>
                        <select id="fromAccountId" name="fromAccountId" value={formState.fromAccountId || ''} onChange={handleChange} className="w-full p-2 border rounded text-sm bg-white">
                            <option value="" disabled>Select source account...</option>
                            {sourceAccountOptions.map(acc => (
                                <option key={acc.id} value={acc.id}>
                                    {acc.label} ({acc.symbol} {acc.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
                                </option>
                            ))}
                        </select>
                        {/* {renderError(errors.fromAccountId)} */}
                        {errors.fromAccountId && <p className="text-xs text-red-600 mt-1">{errors.fromAccountId}</p>}
                    </div>

                    {/* Recipient Details */}
                    <fieldset className="border p-4 rounded">
                         <legend className="text-sm font-medium text-gray-700 px-1">Recipient</legend>
                         <div className="space-y-3">
                            {/* Recipient Name, Account, Institution - Add inputs similar to CreatePaymentScreen */}
                            <div>
                                <label htmlFor="recipientName" className="block text-xs font-medium text-gray-600">Name</label>
                                <input type="text" id="recipientName" name="recipientName" value={formState.recipientName || ''} onChange={handleChange} className="w-full p-2 border rounded text-sm" />
                            </div>
                             {/* Add inputs for recipientAccount, recipientInstitution */}
                         </div>
                         {errors.recipient && <p className="text-xs text-red-600 mt-1">{errors.recipient}</p>}
                    </fieldset>

                     {/* Amount and Currency */}
                    <div className="flex space-x-4">
                        <div className="flex-grow">
                            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
                            <input type="number" id="amount" name="amount" value={formState.amount || ''} onChange={handleChange} className="w-full p-2 border rounded text-sm" placeholder="0.00"/>
                            {errors.amount && <p className="text-xs text-red-600 mt-1">{errors.amount}</p>}
                        </div>
                        <div className="w-32">
                             <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">Currency *</label>
                             {/* Currency might be read-only based on selected 'fromAccount', or a dropdown if multiple possible */}
                             <input type="text" id="currency" name="currency" value={formState.currency || ''} readOnly className="w-full p-2 border rounded text-sm bg-gray-100" />
                              {/* OR <select ...> if selectable */}
                             {errors.currency && <p className="text-xs text-red-600 mt-1">{errors.currency}</p>}
                        </div>
                    </div>

                     {/* Frequency and Dates */}
                     <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                         <div>
                             <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 mb-1">Frequency *</label>
                             <select id="frequency" name="frequency" value={formState.frequency || ''} onChange={handleChange} className="w-full p-2 border rounded text-sm bg-white">
                                 {frequencyOptions.map(freq => <option key={freq} value={freq}>{freq}</option>)}
                             </select>
                             {errors.frequency && <p className="text-xs text-red-600 mt-1">{errors.frequency}</p>}
                         </div>
                          <div>
                             <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                             <input type="date" id="startDate" name="startDate" value={formState.startDate || ''} onChange={handleChange} className="w-full p-2 border rounded text-sm" />
                             {errors.startDate && <p className="text-xs text-red-600 mt-1">{errors.startDate}</p>}
                         </div>
                         <div>
                             <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">End Date (Optional)</label>
                             <input type="date" id="endDate" name="endDate" value={formState.endDate || ''} onChange={handleChange} className="w-full p-2 border rounded text-sm" />
                         </div>
                     </div>

                    {/* Add other relevant fields if needed */}

                </div>

                {/* Footer */}
                <div className="flex justify-end items-center p-4 border-t space-x-3">
                    <button onClick={onClose} className="px-4 py-2 rounded text-sm bg-gray-200 hover:bg-gray-300 text-gray-800">Cancel</button>
                    <button onClick={handleSaveClick} className="px-4 py-2 rounded text-sm bg-emtech-gold text-white hover:opacity-90">
                        {recurringPaymentData ? 'Save Changes' : 'Create Recurring Payment'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RecurringPaymentModal;