// src/features/Payments/PaymentHistoryTable.js
import React from 'react';

// Reusable component to display a list of payment history entries
const PaymentHistoryTable = ({ history = [], onRowClick, title = "Payment History" }) => {

    // Helper function for status badge styling
    const getStatusClass = (status) => {
        if (status?.includes('Completed')) return 'bg-green-100 text-green-800';
        if (status?.includes('Pending')) return 'bg-yellow-100 text-yellow-800';
        if (status?.includes('Submitted')) return 'bg-blue-100 text-blue-800';
        if (status?.includes('Failed') || status?.includes('Error')) return 'bg-red-100 text-red-800';
        return 'bg-gray-100 text-gray-800'; // Default
    };

    return (
        <div className="bg-white p-4 pt-0 rounded shadow overflow-x-auto"> {/* Adjusted padding */}
            <div className="flex justify-between items-center my-4 pt-2"> {/* Moved title/button here */}
                <h2 className="font-bold text-gray-800">{title}</h2>
                {/* We can add View All logic here later if needed, maybe via another prop */}
                {/* <button className="text-sm text-blue-600 hover:underline">View All</button> */}
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
                        {/* Displaying only latest 5 for dashboard view, can adjust later */}
                        {history.slice(0, 5).map((entry) => (
                            <tr
                                key={entry.id}
                                onClick={() => onRowClick(entry)} // Use the passed handler
                                className="hover:bg-gray-100 cursor-pointer transition-colors duration-150 ease-in-out"
                            >
                                <td className="px-4 py-2 whitespace-nowrap text-gray-500">{entry.timestamp.toLocaleString()}</td>
                                <td className="px-4 py-2 whitespace-nowrap text-gray-900 font-medium">{entry.type}</td>
                                <td className="px-4 py-2 whitespace-nowrap text-gray-900">{entry.amount.toLocaleString()} {entry.currency}</td>
                                <td className="px-4 py-2 text-gray-700 truncate max-w-xs" title={entry.recipient}>{entry.recipient}</td>
                                <td className="px-4 py-2 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(entry.status)}`}>
                                        {entry.status}
                                    </span>
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-gray-500 text-xs">{entry.reference || 'N/A'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
            {history.length > 5 && (
                <div className="pt-3 text-center">
                     <button className="text-sm text-blue-600 hover:underline">View All ({history.length})</button>
                </div>
            )}
        </div>
    );
};

export default PaymentHistoryTable;