// src/features/Payments/ViewTransferDetailsScreen.js
import React from 'react';

// Helper to format currency based on symbol
const formatAmount = (amount, currency) => {
    try {
        return amount.toLocaleString(undefined, { style: 'currency', currency: currency, minimumFractionDigits: 2, maximumFractionDigits: 2 });
    } catch (e) {
        // Fallback for unknown currency codes
        return `${amount.toLocaleString()} ${currency}`;
    }
};

// --- Component to display HVT details ---
const ViewTransferDetailsScreen = ({ transfer, onBack }) => {

  // Show loading or error if transfer data isn't available
  if (!transfer) {
    return (
      <div className="bg-white p-6 rounded shadow max-w-4xl mx-auto text-center">
        <p className="text-red-600 mb-4">Could not load transfer details.</p>
        <button className="px-3 py-1 rounded text-white hover:opacity-90 bg-gray-800 text-sm" onClick={onBack}>
          Back
        </button>
      </div>
    );
  }

  // Determine status color
  const getStatusColor = (status) => {
    switch (status) {
        case 'Completed':
        case 'Authorized': return 'text-green-700 bg-green-100';
        case 'Pending': return 'text-yellow-800 bg-yellow-100';
        case 'Rejected': return 'text-red-700 bg-red-100';
        default: return 'text-gray-700 bg-gray-100';
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 border-b pb-3">
        <h1 className="text-2xl font-bold text-gray-800">Transfer Details</h1>
        <button className="px-3 py-1 rounded text-white hover:opacity-90 bg-gray-800 text-sm" onClick={onBack}>
          Back
        </button>
      </div>

      {/* Details Section */}
      <div className='p-4 border rounded bg-gray-50 mb-6 space-y-3 text-sm'>
        <h3 className="font-semibold text-base mb-3 border-b pb-2 text-gray-800">Summary</h3>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">

            <dt className="text-gray-500">Reference ID:</dt>
            <dd className="font-medium">{transfer.id}</dd>

            <dt className="text-gray-500">Status:</dt>
            <dd><span className={`px-2 py-0.5 text-xs rounded-full font-medium ${getStatusColor(transfer.status)}`}>{transfer.status}</span></dd>

            {transfer.rejectionReason && (
                 <>
                    <dt className="text-red-500">Rejection Reason:</dt>
                    <dd className="text-red-700">{transfer.rejectionReason}</dd>
                 </>
            )}

            <div className="md:col-span-2 font-medium text-gray-700 border-b pb-1 mb-1 mt-2 text-base">Amount</div>
            <dt className="text-gray-500">Amount:</dt>
            <dd className="font-semibold text-lg">{formatAmount(transfer.amount, transfer.currency)}</dd>
            {transfer.approxUSD && transfer.currency !== 'USD' && (
                <>
                    <dt className="text-gray-500">Approx. USD Value:</dt>
                    <dd className="text-gray-600">${transfer.approxUSD.toLocaleString()}</dd>
                </>
            )}

             <div className="md:col-span-2 font-medium text-gray-700 border-b pb-1 mb-1 mt-2 text-base">Parties</div>
             <dt className="text-gray-500">Recipient Name:</dt>
             <dd>{transfer.recipient}</dd>

             {/* Add From Account/Entity if available in transfer object */}
             {/* <dt className="text-gray-500">From Account:</dt> <dd>{transfer.fromAccount || 'N/A'}</dd> */}

             <dt className="text-gray-500">Recipient Account:</dt>
             <dd className="break-all">{transfer.recipientAccount || 'N/A'}</dd>

             <dt className="text-gray-500">Recipient Bank (SWIFT):</dt>
             <dd>{transfer.recipientBankSwift || 'N/A'}</dd>

             {transfer.intermediaryBankSwift && (
               <>
                 <dt className="text-gray-500">Intermediary Bank:</dt>
                 <dd>{transfer.intermediaryBankSwift}</dd>
               </>
             )}

             <div className="md:col-span-2 font-medium text-gray-700 border-b pb-1 mb-1 mt-2 text-base">Execution Details</div>
             <dt className="text-gray-500">Purpose Code:</dt>
             <dd>{transfer.purposeCode || transfer.purpose || 'N/A'}</dd>

             <dt className="text-gray-500">Value Date:</dt>
             <dd>{transfer.valueDate ? new Date(transfer.valueDate).toLocaleDateString() : 'N/A'}</dd>

             <dt className="text-gray-500">Remittance Info:</dt>
             <dd>{transfer.remittanceInfo || <span className="italic text-gray-500">None</span>}</dd>

             <div className="md:col-span-2 font-medium text-gray-700 border-b pb-1 mb-1 mt-2 text-base">History & Audit</div>
             <dt className="text-gray-500">Initiated by:</dt>
             <dd>{transfer.initiatedBy}</dd>

             <dt className="text-gray-500">Initiated on:</dt>
             <dd>{new Date(transfer.initiatedDate).toLocaleString()}</dd>

            {/* Placeholder for Approval History */}
             <dt className="text-gray-500">Approvals:</dt>
             <dd>{transfer.approvalsCompleted} of {transfer.approvalsRequired} required ({transfer.status})</dd>

        </dl>
      </div>

        {/* Potential Action Buttons (e.g., Recall Request - Placeholder) */}
        {transfer.status === 'Pending' && (
             <div className="mt-6 flex justify-end space-x-3">
                 <button className="px-4 py-2 rounded border border-gray-300 text-sm hover:bg-gray-50">Request Recall</button>
             </div>
        )}

    </div>
  );
};

export default ViewTransferDetailsScreen;