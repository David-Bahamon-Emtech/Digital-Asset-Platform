// src/features/Payments/ViewTransferDetailsScreen.js
// Assuming this file lives directly under src/features/Payments/
import React from 'react';

// --- Import centralized utilities ---
// Adjust path if utils is elsewhere relative to features/Payments
import { formatAmount, getStatusClass } from '../../utils/displayUtils'; // IMPORTED

// NOTE: Local formatAmount and getStatusColor definitions REMOVED

// --- Component to display HVT details ---
const ViewTransferDetailsScreen = ({ transfer, onBack }) => {

  // Show loading or error if transfer data isn't available
  if (!transfer) {
    return (
      <div className="bg-white p-6 rounded shadow max-w-4xl mx-auto text-center">
        <p className="text-red-600 mb-4">Could not load transfer details or details are missing.</p>
        <button className="px-3 py-1 rounded text-white hover:opacity-90 bg-gray-800 text-sm" onClick={onBack}>
          Back
        </button>
      </div>
    );
  }

  // Local helper functions REMOVED

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
      {/* Use optional chaining '?' and nullish coalescing '??' for safer access */}
      <div className='p-4 border rounded bg-gray-50 mb-6 space-y-3 text-sm'>
        <h3 className="font-semibold text-base mb-3 border-b pb-2 text-gray-800">Summary</h3>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">

            <dt className="text-gray-500">Reference ID:</dt>
            {/* Display history ID, fallback to reference */}
            <dd className="font-medium">{transfer.id ?? transfer.reference ?? 'N/A'}</dd>

            <dt className="text-gray-500">Status:</dt>
            <dd>
                {/* USE IMPORTED HELPER */}
                <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${getStatusClass(transfer.status)}`}>
                    {transfer.status || 'Unknown'}
                </span>
            </dd>

            {/* Display rejection reason if status is Rejected and reason exists */}
            {transfer.status === 'Rejected' && transfer.rejectionReason && (
                 <>
                    <dt className="text-red-500">Rejection Reason:</dt>
                    <dd className="text-red-700">{transfer.rejectionReason}</dd>
                 </>
            )}

            <div className="md:col-span-2 font-medium text-gray-700 border-b pb-1 mb-1 mt-2 text-base">Amount</div>
            <dt className="text-gray-500">Amount:</dt>
            {/* USE IMPORTED HELPER */}
            {/* Use nullish coalescing for amount */}
            <dd className="font-semibold text-lg">{formatAmount(transfer.amount ?? 0, transfer.currency || 'N/A')}</dd>

            {/* Display approx USD only if it exists and currency is not USD */}
            {transfer.approxUSD && transfer.currency !== 'USD' && (
                <>
                    <dt className="text-gray-500">Approx. USD Value:</dt>
                    <dd className="text-gray-600">${(transfer.approxUSD ?? 0).toLocaleString()}</dd>
                </>
            )}

             <div className="md:col-span-2 font-medium text-gray-700 border-b pb-1 mb-1 mt-2 text-base">Parties</div>
             <dt className="text-gray-500">Recipient Name:</dt>
             <dd>{transfer.recipient ?? 'N/A'}</dd>

             {/* Added safety check for From Account/Entity */}
             {transfer.fromAccountLabel &&
                <> <dt className="text-gray-500">From Account:</dt> <dd>{transfer.fromAccountLabel} ({transfer.fromAccountSymbol || ''})</dd> </>
             }
              {transfer.senderEntity &&
                <> <dt className="text-gray-500">From Entity:</dt> <dd>{transfer.senderEntity}</dd> </>
             }

             <dt className="text-gray-500">Recipient Account:</dt>
             <dd className="break-all">{transfer.recipientAccount ?? 'N/A'}</dd>

             <dt className="text-gray-500">Recipient Bank (SWIFT):</dt>
             <dd>{transfer.recipientBankSwift ?? 'N/A'}</dd>

             {transfer.intermediaryBankSwift && (
               <>
                 <dt className="text-gray-500">Intermediary Bank:</dt>
                 <dd>{transfer.intermediaryBankSwift}</dd>
               </>
             )}

             <div className="md:col-span-2 font-medium text-gray-700 border-b pb-1 mb-1 mt-2 text-base">Execution Details</div>
             <dt className="text-gray-500">Purpose Code:</dt>
             <dd>{transfer.purpose ?? 'N/A'}</dd> {/* Use purpose field directly */}

             <dt className="text-gray-500">Value Date:</dt>
             <dd>{transfer.valueDate ? new Date(transfer.valueDate).toLocaleDateString() : 'N/A'}</dd>

             <dt className="text-gray-500">Remittance Info:</dt>
             <dd>{transfer.remittanceInfo || <span className="italic text-gray-500">None</span>}</dd>

             <div className="md:col-span-2 font-medium text-gray-700 border-b pb-1 mb-1 mt-2 text-base">History & Audit</div>
             <dt className="text-gray-500">Initiated by:</dt>
             <dd>{transfer.initiatedBy ?? 'N/A'}</dd>

             <dt className="text-gray-500">Initiated on:</dt>
             <dd>{transfer.initiatedDate ? new Date(transfer.initiatedDate).toLocaleString() : 'N/A'}</dd>

            {/* Display approval info if available */}
             { (typeof transfer.approvalsCompleted === 'number' && typeof transfer.approvalsRequired === 'number') &&
                <>
                    <dt className="text-gray-500">Approvals:</dt>
                    <dd>{transfer.approvalsCompleted} of {transfer.approvalsRequired} required</dd>
                </>
             }

        </dl>
      </div>

        {/* Potential Action Buttons (e.g., Recall Request - Placeholder) */}
        {/* Logic for showing actions could be more complex based on status */}
        {(transfer.status === 'Pending' || transfer.status === 'Pending Approval' || transfer.status === 'Authorized') && ( // Maybe allow recall if Authorized but not Completed?
             <div className="mt-6 flex justify-end space-x-3">
                 <button className="px-4 py-2 rounded border border-gray-300 text-sm hover:bg-gray-50 disabled:opacity-50" disabled>Request Recall</button>
             </div>
        )}

    </div> // End main container
  );
};

export default ViewTransferDetailsScreen;