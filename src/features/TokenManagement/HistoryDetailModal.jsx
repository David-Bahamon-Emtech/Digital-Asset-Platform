// src/features/TokenManagement/HistoryDetailModal.js
import React from 'react';

const HistoryDetailModal = ({ entry, onClose }) => {
    console.log('HistoryDetailModal: Entry received:', entry);
  
    if (!entry) return null;

  return (
    // Modal backdrop (covers screen)
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      {/* Modal Content Box */}
      <div className="relative bg-white p-6 border w-full max-w-lg mx-auto shadow-lg rounded-md">
        {/* Modal Header */}
        <div className="flex justify-between items-center mb-4 border-b pb-2">
          <h3 className="text-lg font-medium leading-6 text-gray-900">History Event Details</h3>
          {/* Close Button (Top Right) */}
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
          <p><strong>Timestamp:</strong> {entry.timestamp.toLocaleString()}</p>
          <p><strong>Action Type:</strong> {entry.actionType}</p>
          <p><strong>Details:</strong> {entry.details}</p>
          <p><strong>User Initiated:</strong> {entry.user}</p>
          <p><strong>Approver / System:</strong> {entry.approver}</p>
          {entry.notes && ( // Only show if notes exist and are not empty
             <div className="pt-3 mt-3 border-t border-gray-200"> {/* Add separator */}
               <p><strong>Notes:</strong></p>
               {/* Use pre-wrap to respect line breaks in notes */}
               <p className="whitespace-pre-wrap bg-gray-50 p-2 rounded border text-gray-700 mt-1">{entry.notes}</p>
             </div>
           )}
          <p><strong>Internal ID:</strong> <span className="text-xs text-gray-500">{entry.id}</span></p>
          {/* You could add more formatting or parse 'details' further if needed */}
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

export default HistoryDetailModal;