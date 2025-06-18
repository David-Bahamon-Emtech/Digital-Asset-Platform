// src/features/Payments/PaymentHistoryTable.js
// Assuming this file lives directly under src/features/Payments/
import React from 'react';

// --- Import centralized utilities ---
// Adjust path if utils is elsewhere relative to features/Payments
import { getStatusClass } from '../../utils/displayUtils.jsx'; // IMPORTED

// NOTE: Local getStatusClass definition REMOVED

// Reusable component to display a list of payment history entries
const PaymentHistoryTable = ({
    history = [],
    onRowClick, // Function to handle row clicks (opens modal)
    title = "Payment History",
    // Optional: Add onViewAllClick prop later if needed for full history navigation
    // onViewAllClick
}) => {

    // Local helper function REMOVED

    return (
        // Added shadow and removed pt-0 from container for better spacing with internal header
        <div className="bg-white p-4 rounded shadow overflow-x-auto">
            <div className="flex justify-between items-center mb-4"> {/* Header inside container */}
                <h2 className="font-bold text-gray-800 text-lg">{title}</h2>
                {/* Placeholder for View All button - implement with onViewAllClick prop if needed */}
                {/* {history.length > 5 && onViewAllClick && (
                     <button className="text-sm text-blue-600 hover:underline" onClick={onViewAllClick}>
                         View All ({history.length})
                     </button>
                )} */}
            </div>
            {history.length === 0 ? (
                <p className="text-center text-gray-500 italic py-4">No relevant payment history found.</p>
            ) : (
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                            <th scope="col" className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Type</th>
                            <th scope="col" className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                            <th scope="col" className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Recipient</th>
                            <th scope="col" className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {/* Displaying only latest 5 for dashboard view - add prop later if configurable */}
                        {history.slice(0, 5).map((entry) => {
                            // Safe formatting for potentially missing/invalid data
                            const formattedTimestamp = entry.timestamp ? new Date(entry.timestamp).toLocaleString() : 'N/A';
                            const formattedAmount = (typeof entry.amount === 'number') ? entry.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : entry.amount || 'N/A';
                            const currencyDisplay = entry.currency && formattedAmount !== 'N/A' ? entry.currency : '';

                            return (
                                <tr
                                    key={entry.id || `hist-${Math.random()}`} // Add fallback key just in case ID is missing
                                    // Attach onClick only if the handler is provided
                                    onClick={onRowClick ? () => onRowClick(entry) : undefined}
                                    className={`hover:bg-gray-100 transition-colors duration-150 ease-in-out ${onRowClick ? 'cursor-pointer' : ''}`} // Only show pointer if clickable
                                >
                                    <td className="px-4 py-2 whitespace-nowrap text-gray-500">{formattedTimestamp}</td>
                                    <td className="px-4 py-2 whitespace-nowrap text-gray-900 font-medium">{entry.type || 'N/A'}</td>
                                    <td className="px-4 py-2 whitespace-nowrap text-gray-900">{formattedAmount} {currencyDisplay}</td>
                                    <td className="px-4 py-2 text-gray-700 truncate max-w-xs" title={entry.recipient || ''}>{entry.recipient || 'N/A'}</td>
                                    <td className="px-4 py-2 whitespace-nowrap">
                                        {/* USE IMPORTED HELPER */}
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(entry.status)}`}>
                                            {entry.status || 'Unknown'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2 whitespace-nowrap text-gray-500 text-xs">{entry.reference || 'N/A'}</td>
                                </tr>
                            );
                         })}
                    </tbody>
                </table>
            )}
            {/* Alternative position for View All button below table */}
            {history.length > 5 && (
                <div className="pt-3 text-center border-t border-gray-100 mt-2">
                     {/* Implement onClick using onViewAllClick prop later if needed */}
                     <button className="text-sm text-blue-600 hover:underline focus:outline-none">
                         View All ({history.length})
                     </button>
                </div>
            )}
        </div>
    );
};

export default PaymentHistoryTable;