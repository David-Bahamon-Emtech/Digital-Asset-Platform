// src/features/Payments/PaymentHistoryDetailModal.js
import React from 'react';
import { getStatusClass, formatAmount } from '../../utils/displayUtils'; // Assuming path and existence of formatAmount

const PaymentHistoryDetailModal = ({ entry, onClose, assets = [] }) => {
    // --- Basic Fields ---
    const formattedTimestamp = entry.timestamp ? new Date(entry.timestamp).toLocaleString() : 'N/A';
    const statusClass = getStatusClass(entry.status);
    // Use formatAmount for consistency if available, otherwise basic formatting
    const displayAmount = typeof formatAmount === 'function'
        ? formatAmount(entry.amount, entry.currency)
        : `${entry.amount?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || 'N/A'} ${entry.currency || ''}`;

    // --- Details from rawData (with safe access) ---
    const raw = entry.rawData || {}; // Use empty object as fallback
    const destinationInfo = raw.destination_counterparty_info || {};
    const sourceInfo = raw.payment_source || {};
    const paymentInfo = raw.payment_info || {};

    const sourceAccountDisplay = raw._ui_sender_account_label || sourceInfo.account_id || 'N/A';
    const sendingEntity = sourceInfo.entity || 'N/A';
    const destAccount = destinationInfo.accountIdentifier || 'N/A';
    const destInstitution = destinationInfo.institution || 'N/A';
    // Combine recipient name from top-level entry or rawData if needed
    const recipientNameDisplay = entry.recipient || destinationInfo.name || 'N/A';

    // Determine Network/Rail based on payment type hint or available fields
    let networkOrRail = raw._ui_onchain_network || paymentInfo.onChainNetwork || 'N/A';
    if (networkOrRail === 'N/A') {
        networkOrRail = raw.traditionalRail || paymentInfo.traditionalRail || 'N/A'; // Check for traditional rail
    }
    const networkOrRailLabel = (raw._ui_onchain_network || paymentInfo.onChainNetwork) ? 'Network' : 'Rail'; // Adjust label

    const purposeCode = paymentInfo.purpose || raw.purposeCode || 'N/A'; // Use purposeCode from payment_info first
    const paymentDescription = paymentInfo.description || null; // The field you identified

    // Fees and Total Debit
    const networkFeeDisplay = raw._ui_network_fee_display || (raw._simulated_network_fee ? `${raw._simulated_network_fee.toFixed(8)} (Simulated)` : 'N/A');
    // Use formatAmount for total debit if possible, requires currency context potentially
    const totalDebit = raw._simulated_total_debit;
    const formattedTotalDebit = typeof totalDebit === 'number' ? totalDebit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : 'N/A';
    // Attempt to get currency for total debit (might be same as payment currency or different if fees are involved)
    const sourceCurrency = assets.find(a => a.id === sourceInfo.account_id)?.symbol || entry.currency || '';


    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white z-10">
                    <h2 className="text-xl font-bold text-gray-800">Payment Details</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-3xl leading-none">&times;</button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4 text-sm overflow-y-auto flex-grow">

                    {/* Basic Info Section */}
                    <div className="grid grid-cols-3 gap-x-4 gap-y-2 pb-3 border-b">
                        <div className="text-gray-500">Timestamp</div>
                        <div className="col-span-2 font-medium text-gray-800">{formattedTimestamp}</div>

                        <div className="text-gray-500">Type</div>
                        <div className="col-span-2 font-medium text-gray-800">{entry.type || 'N/A'}</div>

                        <div className="text-gray-500">Amount</div>
                        <div className="col-span-2 font-medium text-gray-800">{displayAmount}</div>

                        <div className="text-gray-500">Recipient</div>
                        <div className="col-span-2 font-medium text-gray-800 truncate">{recipientNameDisplay}</div>

                        <div className="text-gray-500">Status</div>
                        <div className="col-span-2">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}`}>
                                {entry.status || 'Unknown'}
                            </span>
                        </div>

                        <div className="text-gray-500">Reference</div>
                        <div className="col-span-2 font-medium text-gray-800 text-xs break-all">{entry.reference || 'N/A'}</div>

                        <div className="text-gray-500">Internal ID</div>
                        <div className="col-span-2 font-medium text-gray-800 text-xs break-all">{entry.id || 'N/A'}</div>
                    </div>

                    {/* Details Section */}
                    <div className="grid grid-cols-3 gap-x-4 gap-y-2 pt-3 pb-3 border-b">
                         <div className="text-gray-500">Source Account</div>
                         <div className="col-span-2 font-medium text-gray-800">{sourceAccountDisplay}</div>

                         <div className="text-gray-500">Sending Entity</div>
                         <div className="col-span-2 font-medium text-gray-800">{sendingEntity}</div>

                         <div className="text-gray-500">Destination Acct</div>
                         <div className="col-span-2 font-medium text-gray-800 break-all">{destAccount}</div>

                         <div className="text-gray-500">Destination Inst.</div>
                         <div className="col-span-2 font-medium text-gray-800">{destInstitution}</div>

                         {networkOrRail !== 'N/A' && (
                             <>
                                <div className="text-gray-500">{networkOrRailLabel}</div>
                                <div className="col-span-2 font-medium text-gray-800">{networkOrRail}</div>
                             </>
                         )}

                         <div className="text-gray-500">Purpose Code</div>
                         <div className="col-span-2 font-medium text-gray-800">{purposeCode}</div>

                         {networkFeeDisplay !== 'N/A' && (
                             <>
                                <div className="text-gray-500">Network Fee</div>
                                <div className="col-span-2 font-medium text-gray-800">{networkFeeDisplay}</div>
                             </>
                         )}
                         {formattedTotalDebit !== 'N/A' && (
                              <>
                                <div className="text-gray-500">Total Debit</div>
                                <div className="col-span-2 font-medium text-gray-800">{formattedTotalDebit} {sourceCurrency}</div>
                              </>
                         )}
                    </div>

                    {/* Payment Description (Note) Section */}
                    {paymentDescription && (
                         <div className="pt-3">
                            <h3 className="text-gray-600 font-semibold mb-1">Payment Description</h3>
                            <p className="font-medium bg-gray-50 p-3 border rounded text-gray-800 whitespace-pre-wrap break-words">
                                {paymentDescription}
                            </p>
                         </div>
                     )}

                     {/* Raw Data section removed as requested */}

                </div>

                {/* Footer */}
                <div className="flex justify-end items-center p-4 border-t sticky bottom-0 bg-gray-50 z-10">
                    <button onClick={onClose} className="px-4 py-2 rounded text-sm bg-gray-600 hover:bg-gray-700 text-white">Close</button>
                </div>
            </div>
        </div>
    );
};

export default PaymentHistoryDetailModal;