import React from 'react';
// Assuming these utils are correctly located relative to this file
import { formatAmount, getStatusClass } from '../../utils/displayUtils.jsx';

// Component to display transfer details, now aware of payment types via rawData
const ViewTransferDetailsScreen = ({ transfer, onBack }) => {

  // Show loading or error if transfer data isn't available
  if (!transfer || !transfer.rawData) { // Also check for rawData existence
    return (
      <div className="bg-white p-6 rounded shadow max-w-4xl mx-auto text-center">
        <p className="text-red-600 mb-4">Could not load transfer details or critical data is missing.</p>
        <button className="px-3 py-1 rounded text-white hover:opacity-90 bg-gray-800 text-sm" onClick={onBack}>
          Back
        </button>
      </div>
    );
  }

  // Extract data from rawData for easier access
  const rawData = transfer.rawData;
  const paymentType = rawData._ui_payment_type_selected; // 'on-chain', 'traditional', 'internal'
  const isTraditional = paymentType === 'traditional';
  const isOnChain = paymentType === 'on-chain';
  const isInternal = paymentType === 'internal';

  // Helper to safely get nested values
  const get = (obj, path, defaultValue = 'N/A') => {
    const value = path.split('.').reduce((o, p) => (o && o[p] !== undefined) ? o[p] : undefined, obj);
    return value ?? defaultValue;
  }

  return (
    <div className="bg-white p-6 rounded shadow max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6 border-b pb-3">
        <h1 className="text-2xl font-bold text-gray-800">Transfer Details</h1>
        <button className="px-3 py-1 rounded text-white hover:opacity-90 bg-gray-800 text-sm" onClick={onBack}>
          Back
        </button>
      </div>

      <div className='p-4 border rounded bg-gray-50 mb-6 space-y-3 text-sm'>
        {/* --- Summary Section --- */}
        <h3 className="font-semibold text-base mb-3 border-b pb-2 text-gray-800">Summary</h3>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
            <dt className="text-gray-500">Reference ID:</dt>
            <dd className="font-medium">{transfer.id ?? 'N/A'}</dd>

            <dt className="text-gray-500">Status:</dt>
            <dd>
                <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${getStatusClass(transfer.status)}`}>
                    {transfer.status || 'Unknown'}
                </span>
            </dd>

            {transfer.status?.startsWith('Rejected') && transfer.status?.includes('(') && (
                 <>
                    <dt className="text-red-500">Rejection Reason:</dt>
                    <dd className="text-red-700">{transfer.status.substring(transfer.status.indexOf('(') + 1, transfer.status.lastIndexOf(')'))}</dd>
                 </>
            )}
            <dt className="text-gray-500">Payment Type:</dt>
            <dd className="font-medium capitalize">{paymentType ? paymentType.replace('-', ' ') : 'Unknown'}</dd>
        </dl>

        {/* --- Amount Section --- */}
        <h3 className="font-semibold text-base mb-3 border-b pb-2 text-gray-800 mt-4">Amount</h3>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
            <dt className="text-gray-500">Amount:</dt>
            <dd className="font-semibold text-lg">{formatAmount(transfer.amount ?? 0, transfer.currency || 'N/A')}</dd>

            {/* Display FX details if they exist (client payment, non-internal) */}
            {rawData._simulated_exchange_rate && rawData._simulated_recipient_amount && (
                 <>
                    <dt className="text-gray-500">Exchange Rate (Est.):</dt>
                    <dd>1 {transfer.currency} ≈ {rawData._simulated_exchange_rate.toFixed(4)} {rawData._simulated_recipient_currency}</dd>
                    <dt className="text-gray-500">Recipient Receives (Est.):</dt>
                    <dd>{formatAmount(rawData._simulated_recipient_amount, rawData._simulated_recipient_currency)}</dd>
                 </>
             )}
        </dl>

        {/* --- Parties Section --- */}
         <h3 className="font-semibold text-base mb-3 border-b pb-2 text-gray-800 mt-4">Parties</h3>
         <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
             <dt className="text-gray-500">From Account:</dt>
             <dd>{get(rawData, 'payment_source.account_label')} ({transfer.currency ?? 'N/A'})</dd>

             {rawData.payment_source?.entity &&
                <> <dt className="text-gray-500">From Entity:</dt> <dd>{get(rawData, 'payment_source.entity')}</dd> </>
             }
              {rawData.payment_source?.onBehalfOf &&
                <> <dt className="text-gray-500">On Behalf Of:</dt> <dd>{get(rawData, 'payment_source.onBehalfOf')}</dd> </>
             }

             <dt className="text-gray-500">Recipient Name:</dt>
             <dd>{get(rawData, 'destination_counterparty_info.name')}</dd>

             {/* Conditional Recipient Identifier */}
             {isOnChain &&
                <>
                    <dt className="text-gray-500">Recipient Wallet Address:</dt>
                    <dd className="break-all">{get(rawData, 'destination_counterparty_info.accountIdentifier')}</dd>
                    <dt className="text-gray-500">Recipient Network:</dt>
                    <dd>{get(rawData, 'destination_counterparty_info.institution', 'N/A (On-Chain)')}</dd>
                </>
             }
             {isTraditional &&
                <>
                    <dt className="text-gray-500">Recipient Account:</dt>
                    <dd className="break-all">{get(rawData, 'destination_counterparty_info.accountIdentifier')}</dd>
                    <dt className="text-gray-500">Recipient Bank (SWIFT/BIC):</dt>
                    <dd>{get(rawData, 'destination_counterparty_info.institution', 'N/A (Traditional)')}</dd>
                    {/* Add Intermediary Swift if stored */}
                 </>
             }
             {isInternal &&
                <>
                    <dt className="text-gray-500">Recipient Internal ID:</dt>
                    <dd className="break-all">{get(rawData, 'destination_counterparty_info.accountIdentifier')}</dd>
                </>
            }

            {/* Display jurisdiction only if present (likely client payments) */}
            {rawData.destination_counterparty_info?.jurisdiction &&
                <>
                    <dt className="text-gray-500">Recipient Jurisdiction:</dt>
                    <dd>{get(rawData, 'destination_counterparty_info.jurisdiction')}</dd>
                 </>
             }
        </dl>

        {/* --- Execution Details Section --- */}
         <h3 className="font-semibold text-base mb-3 border-b pb-2 text-gray-800 mt-4">Execution Details</h3>
         <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
             <dt className="text-gray-500">Purpose Code:</dt>
             <dd>{get(rawData, 'payment_info.purpose')}</dd>

             {/* Conditional Execution fields */}
             {isTraditional &&
                 <>
                    <dt className="text-gray-500">Payment Rail:</dt>
                    <dd>{get(rawData, '_ui_traditional_rail')}</dd>
                    <dt className="text-gray-500">Settlement Speed:</dt>
                    <dd className="capitalize">{get(rawData, '_ui_settlement_speed')}</dd>
                 </>
             }
              {isOnChain &&
                 <>
                    <dt className="text-gray-500">Network:</dt>
                    <dd>{get(rawData, '_ui_onchain_network')}</dd>
                    <dt className="text-gray-500">Est. Network Fee:</dt>
                    <dd>{get(rawData, '_ui_network_fee_display', 'N/A')}</dd>
                 </>
             }

             <dt className="text-gray-500">Payment Date:</dt>
             <dd className="capitalize">{rawData._ui_date_type === 'scheduled' ? new Date(rawData._ui_scheduled_date).toLocaleDateString() : rawData._ui_date_type ?? 'N/A'}</dd>

             <dt className="text-gray-500">Description:</dt>
             <dd>{get(rawData, 'payment_info.description', '-') || <span className="italic text-gray-500">None</span>}</dd>

         </dl>

         {/* --- History & Audit Section --- */}
         <h3 className="font-semibold text-base mb-3 border-b pb-2 text-gray-800 mt-4">History & Audit</h3>
         <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
             <dt className="text-gray-500">Initiated by:</dt>
             {/* Construct initiator string */}
             <dd>{get(rawData, 'payment_source.entity', 'N/A')}{rawData.payment_source?.onBehalfOf ? ` (On behalf of ${rawData.payment_source.onBehalfOf})` : ''}</dd>

             <dt className="text-gray-500">Initiated on:</dt>
             <dd>{transfer.timestamp ? new Date(transfer.timestamp).toLocaleString() : 'N/A'}</dd>

             {/* You might want to add fields for approval timestamps/users if you track them */}
             {/* Example:
             {transfer.authorizedBy &&
                <> <dt className="text-gray-500">Authorized by:</dt> <dd>{transfer.authorizedBy}</dd> </>
             }
             {transfer.authorizedTimestamp &&
                <> <dt className="text-gray-500">Authorized on:</dt> <dd>{new Date(transfer.authorizedTimestamp).toLocaleString()}</dd> </>
             }
             */}
        </dl>
      </div>

        {/* Action Buttons */}
        {(transfer.status?.toLowerCase().includes('pending') || transfer.status === 'Authorized') && (
             <div className="mt-6 flex justify-end space-x-3">
                 <button className="px-4 py-2 rounded border border-gray-300 text-sm hover:bg-gray-50 disabled:opacity-50" disabled>Request Recall</button>
             </div>
        )}

    </div>
  );
};

export default ViewTransferDetailsScreen;