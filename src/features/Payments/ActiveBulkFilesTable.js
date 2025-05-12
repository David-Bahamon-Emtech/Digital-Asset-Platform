import React from 'react';

// Component for the Active Bulk Files Table
const ActiveBulkFilesTable = ({
  activeBulkFiles = [],
  onViewActiveFile,
  onEditActiveFile,
  onDeleteActiveFile
}) => {
  // console.log("ActiveBulkFilesTable received files:", activeBulkFiles); // Log received data

  // Helper to format currency consistently
  const formatCurrencyDisplay = (value, currencyCode = 'USD') => {
     try {
         // Use a fallback locale that's widely supported if Intl isn't robust
         return value.toLocaleString('en-US', { style: 'currency', currency: currencyCode, minimumFractionDigits: 2, maximumFractionDigits: 2 });
     } catch (e) {
         console.warn("Currency formatting failed for code:", currencyCode, e);
         // Fallback to basic number formatting
         return `${value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} ${currencyCode}`;
     }
  };

   // Helper to format dates/times consistently
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
        // Use Date constructor for wider compatibility with Date objects or ISO strings
        const dateObj = new Date(timestamp);
        // Check if the date is valid before formatting
        if (isNaN(dateObj.getTime())) {
            return 'Invalid Date';
        }
        // Use toLocaleString for user-friendly format based on locale
        return dateObj.toLocaleString();
    } catch (e) {
         console.error("Timestamp formatting failed:", timestamp, e);
        return 'Invalid Date';
    }
  };

  const getStatusColor = (status) => {
      status = status?.toLowerCase();
      if (status === 'scheduled') return 'text-blue-600';
      if (status === 'validated') return 'text-green-600';
      if (status === 'processing' || status === 'validating') return 'text-yellow-600';
      if (status === 'error' || status?.includes('fail')) return 'text-red-600';
      return 'text-gray-600'; // Default for 'Uploaded' or others
  };


  return (
    <div className="bg-white p-4 rounded shadow mb-8">
      <h3 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">Active Bulk Payment Files</h3>
      {activeBulkFiles.length === 0 ? (
         <p className="text-gray-500 italic px-4 py-2">No active bulk files found.</p>
      ) : (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File Name / Uploaded</th>
                  <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payments</th>
                  <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Value</th>
                  <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Schedule</th>
                  <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 text-sm">
                {activeBulkFiles.map((file) => (
                  <tr key={file.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 align-top whitespace-nowrap">
                        <div className="font-medium text-gray-900 break-words max-w-xs">{file.fileName}</div>
                        <div className="text-xs text-gray-500">Uploaded: {formatTimestamp(file.uploadTimestamp)}</div>
                    </td>
                    <td className="px-4 py-2 align-top whitespace-nowrap">{file.fileType}</td>
                    <td className="px-4 py-2 align-top whitespace-nowrap">{file.processedPayments?.toLocaleString() || 0}/{file.totalPayments?.toLocaleString() || 'N/A'}</td>
                    <td className="px-4 py-2 align-top whitespace-nowrap">{formatCurrencyDisplay(file.totalValue || 0, file.currency)}</td>
                    <td className="px-4 py-2 align-top whitespace-nowrap">{file.scheduleTimestamp ? formatTimestamp(file.scheduleTimestamp) : 'Immediate'}</td>
                    <td className="px-4 py-2 align-top whitespace-nowrap">
                        <span className={`font-medium ${getStatusColor(file.status)}`}>{file.status}</span>
                        {file.statusMessage && <div className="text-xs text-gray-500 max-w-xs break-words">{file.statusMessage}</div>}
                    </td>
                    <td className="px-4 py-2 align-top whitespace-nowrap text-center text-sm font-medium">
                      {/* Using flex for better spacing and alignment of icons */}
                      <div className="flex items-center justify-center space-x-3">
                          <button onClick={() => onViewActiveFile(file.id)} className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-100 transition-colors duration-150" title="View Details">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                          </button>
                          <button onClick={() => onEditActiveFile(file.id)} className="text-yellow-600 hover:text-yellow-900 p-1 rounded-full hover:bg-yellow-100 transition-colors duration-150" title="Edit Schedule/Details">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                          </button>
                          <button onClick={() => onDeleteActiveFile(file.id)} className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-100 transition-colors duration-150" title="Cancel/Delete File">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
        </div>
      )}
       {/* Removed View History/Reports buttons as requested */}
    </div>
  );
};

export default ActiveBulkFilesTable; // Export the component