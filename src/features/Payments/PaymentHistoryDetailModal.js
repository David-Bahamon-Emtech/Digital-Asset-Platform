// src/features/Payments/PaymentHistoryDetailModal.js
// Assuming this file lives directly under src/features/Payments/
import React from 'react';

// --- Import centralized utilities ---
// Adjust path if utils is elsewhere relative to features/Payments
import { getStatusClass } from '../../utils/displayUtils'; // IMPORTED

// NOTE: Local getStatusClass definition REMOVED

// --- Component to display Payment History Details ---
const PaymentHistoryDetailModal = ({ entry, onClose }) => {
  // Don't render anything if no entry is selected
  if (!entry) return null;

  // Local helper function REMOVED

  // Format timestamp safely, providing a fallback
  const formattedTimestamp = entry.timestamp
    ? new Date(entry.timestamp).toLocaleString()
    : 'N/A';

  // Format amount safely, checking if it's a number
  const formattedAmount = (typeof entry.amount === 'number')
    ? entry.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) // Standard formatting for numbers
    : entry.amount || 'N/A'; // Display as is if not a number, or N/A


  return (
    // Modal backdrop
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      {/* Modal Content Box */}
      <div className="relative bg-white p-6 border w-full max-w-lg mx-auto shadow-lg rounded-md">
        {/* Modal Header */}
        <div className="flex justify-between items-center mb-4 border-b pb-2">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Payment History Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none focus:outline-none"
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>

        {/* Modal Body - Displaying Entry Details */}
        <div className="space-y-3 text-sm">
           {/* Using definition list for better structure */}
           <dl className="grid grid-cols-3 gap-x-2 gap-y-2">
                <dt className="col-span-1 text-gray-500">Timestamp:</dt>
                <dd className="col-span-2">{formattedTimestamp}</dd>

                <dt className="col-span-1 text-gray-500">Type:</dt>
                <dd className="col-span-2 font-medium">{entry.type || 'N/A'}</dd>

                <dt className="col-span-1 text-gray-500">Amount:</dt>
                {/* Display currency only if amount is valid */}
                <dd className="col-span-2">{formattedAmount} {entry.currency && formattedAmount !== 'N/A' ? entry.currency : ''}</dd>

                <dt className="col-span-1 text-gray-500">Recipient:</dt>
                <dd className="col-span-2 break-words">{entry.recipient || 'N/A'}</dd>

                <dt className="col-span-1 text-gray-500">Status:</dt>
                <dd className="col-span-2">
                    {/* USE IMPORTED HELPER */}
                    <span className={`px-2 py-0.5 text-xs rounded-full font-semibold ${getStatusClass(entry.status)}`}>
                        {entry.status || 'Unknown'}
                    </span>
                </dd>

                {entry.reference && ( // Conditionally show reference
                   <>
                    <dt className="col-span-1 text-gray-500">Reference:</dt>
                    <dd className="col-span-2 text-xs text-gray-600 break-all">{entry.reference}</dd>
                   </>
                )}

                <dt className="col-span-1 text-gray-500 pt-2 border-t mt-2">Internal ID:</dt>
                <dd className="col-span-2 text-xs text-gray-500 pt-2 border-t mt-2">{entry.id || 'N/A'}</dd>
           </dl>
          {/* Display rawData if available and not null/empty object */}
          {entry.rawData && typeof entry.rawData === 'object' && Object.keys(entry.rawData).length > 0 && (
            <div className="mt-4 pt-3 border-t">
                <p className="font-medium text-gray-700 mb-1">Raw Data:</p>
                <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-40 border border-gray-200">
                    {JSON.stringify(entry.rawData, null, 2)}
                </pre>
            </div>
          )}
        </div>

        {/* Modal Footer - Close Button */}
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            className="px-4 py-2 bg-gray-200 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentHistoryDetailModal;