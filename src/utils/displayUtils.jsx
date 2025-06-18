import React from 'react';

/**
 * Renders an inline error message paragraph.
 * @param {string|null|undefined} error - The error message string.
 * @returns {React.ReactNode|null} - JSX for the error message or null.
 */
export const renderError = (error) => {
    return error ? <p className="text-xs text-red-600 mt-1">{error}</p> : null;
};

/**
 * Returns Tailwind CSS classes for styling a status badge based on the status string.
 * @param {string} status - The status string (e.g., 'Completed', 'Pending Approval', 'Failed').
 * @returns {string} - CSS classes for background and text color.
 */
export const getStatusClass = (status) => {
    const lowerStatus = status?.toLowerCase() || '';
    if (lowerStatus.includes('completed')) return 'bg-green-100 text-green-800';
    if (lowerStatus.includes('authorized')) return 'bg-green-100 text-green-800';
    if (lowerStatus.includes('pending')) return 'bg-yellow-100 text-yellow-800';
    if (lowerStatus.includes('submitted')) return 'bg-blue-100 text-blue-800';
    if (lowerStatus.includes('processing')) return 'bg-blue-100 text-blue-800';
    if (lowerStatus.includes('failed')) return 'bg-red-100 text-red-800';
    if (lowerStatus.includes('error')) return 'bg-red-100 text-red-800';
    if (lowerStatus.includes('rejected')) return 'bg-red-100 text-red-800';
    if (lowerStatus.includes('paused')) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800'; // Default
};

/**
 * Formats a number as a currency string using Intl.NumberFormat.
 * @param {number} amount - The numeric amount.
 * @param {string} currency - The currency code (e.g., 'USD', 'EUR').
 * @returns {string} - The formatted currency string.
 */
export const formatAmount = (amount, currency) => {
    if (typeof amount !== 'number' || !currency) {
        return `${String(amount)} ${currency || ''}`.trim(); // Basic fallback
    }
    try {
        return new Intl.NumberFormat(undefined, {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    } catch (e) {
        // Fallback for unknown currency codes or other errors
        return `${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
    }
};

/**
 * Formats a number with commas as thousands separators.
 * Handles null/undefined inputs and attempts to parse non-numeric inputs.
 * @param {number|string|null|undefined} num - The number to format.
 * @returns {string} - The formatted number string or 'N/A'.
 */
export const formatNumber = (num) => {
    if (num === null || num === undefined) return 'N/A';
    if (typeof num === 'number') {
        return num.toLocaleString();
    }
    // Attempt to parse if it's not a number (e.g., string)
    const parsed = parseFloat(num);
    return !isNaN(parsed) ? parsed.toLocaleString() : String(num); // Return original string if parsing fails
};

/**
 * Helper function to format boolean values as 'Yes' or 'No'.
 * Added here for shared use.
 * @param {*} value - The value to format.
 * @returns {string} - 'Yes' if truthy, 'No' otherwise.
 */
export const formatBoolean = (value) => (value ? 'Yes' : 'No'); // <-- ADDED FUNCTION AND EXPORT


// Add other display-related utilities here
