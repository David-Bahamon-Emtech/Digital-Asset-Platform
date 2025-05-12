import React from 'react';

const ActiveBulkDetailModal = ({ file, onClose }) => {
  if (!file) return null;

  // Helper to format dates/times consistently
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    try { return new Date(timestamp).toLocaleString(); } catch (e) { return 'Invalid Date'; }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Active Bulk File Details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
        </div>

        <div className="space-y-3 text-sm">
          <p><strong>File Name:</strong> {file.fileName}</p>
          <p><strong>File ID:</strong> {file.id}</p>
          <p><strong>Status:</strong> {file.status}</p>
          {file.statusMessage && <p><strong>Status Info:</strong> {file.statusMessage}</p>}
          <p><strong>File Type:</strong> {file.fileType}</p>
          <p><strong>Payment Type:</strong> {file.paymentType}</p>
          <p><strong>Payments:</strong> {file.processedPayments?.toLocaleString() || 0} / {file.totalPayments?.toLocaleString() || 'N/A'}</p>
          <p><strong>Total Value:</strong> {file.totalValue?.toLocaleString(undefined, {style: 'currency', currency: file.currency || 'USD'})}</p>
          <p><strong>Source Account ID:</strong> {file.sourceAccountId}</p>
          <p><strong>Uploaded:</strong> {formatTimestamp(file.uploadTimestamp)}</p>
          <p><strong>Scheduled For:</strong> {file.scheduleTimestamp ? formatTimestamp(file.scheduleTimestamp) : 'Immediate Processing'}</p>

          <div className="mt-4 pt-4 border-t">
            <h4 className="font-medium mb-2 text-gray-700">Placeholder History/Actions:</h4>
            <p className="text-gray-500 italic">Details about individual payments or processing steps would appear here.</p>
            {/* Add buttons for actions like 'Reprocess', 'Download Errors' etc. if needed */}
          </div>
        </div>

        <div className="mt-6 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActiveBulkDetailModal;