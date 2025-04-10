// src/utils/displayUtils.js
import React from 'react';

/**
 * Renders an inline error message paragraph.
 * Originally defined in CreateEditTemplateModal, OnChainPaymentFields, TraditionalPaymentFields
 * @param {string|null|undefined} error - The error message string.
 * @returns {React.ReactNode|null} - JSX for the error message or null.
 */
export const renderError = (error) => {
    return error ? <p className="text-xs text-red-600 mt-1">{error}</p> : null;
};

/**
 * Returns Tailwind CSS classes for styling a status badge based on the status string.
 * Originally defined in PaymentHistoryDetailModal, PaymentHistoryTable, ViewTransferDetailsScreen
 * @param {string} status - The status string (e.g., 'Completed', 'Pending Approval', 'Failed').
 * @returns {string} - CSS classes for background and text color.
 */
export const getStatusClass = (status) => {
    const lowerStatus = status?.toLowerCase() || '';
    if (lowerStatus.includes('completed')) return 'bg-green-100 text-green-800';
    if (lowerStatus.includes('authorized')) return 'bg-green-100 text-green-800'; // Treat Authorized like Completed visually
    if (lowerStatus.includes('pending')) return 'bg-yellow-100 text-yellow-800';
    if (lowerStatus.includes('submitted')) return 'bg-blue-100 text-blue-800'; // Processing or submitted
    if (lowerStatus.includes('processing')) return 'bg-blue-100 text-blue-800';
    if (lowerStatus.includes('failed')) return 'bg-red-100 text-red-800';
    if (lowerStatus.includes('error')) return 'bg-red-100 text-red-800';
    if (lowerStatus.includes('rejected')) return 'bg-red-100 text-red-800';
    if (lowerStatus.includes('paused')) return 'bg-yellow-100 text-yellow-800'; // Paused visually like Pending
    return 'bg-gray-100 text-gray-800'; // Default for unknown or neutral statuses
};

/**
 * Formats a number as a currency string.
 * Includes basic fallback for potentially invalid currency codes.
 * Originally defined in ViewTransferDetailsScreen
 * @param {number} amount - The numeric amount.
 * @param {string} currency - The currency code (e.g., 'USD', 'EUR').
 * @returns {string} - The formatted currency string.
 */
export const formatAmount = (amount, currency) => {
    if (typeof amount !== 'number' || !currency) {
        return `${String(amount)} ${currency || ''}`.trim(); // Basic fallback
    }
    try {
        // Use Intl.NumberFormat for more robust currency formatting
        return new Intl.NumberFormat(undefined, { // Use user's locale/default
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    } catch (e) {
        // console.warn(`Currency formatting failed for code '${currency}':`, e);
        // Fallback for unknown currency codes or other errors
        return `${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
    }
};

// Add other display-related utilities here