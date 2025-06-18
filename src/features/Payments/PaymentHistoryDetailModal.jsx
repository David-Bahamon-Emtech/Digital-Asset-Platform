import React, { useMemo } from 'react'; // <-- Add useMemo here
import { useAssets } from '../../context/AssetsContext.jsx'; // <-- Import useAssets hook
import { getStatusClass, formatAmount } from '../../utils/displayUtils.jsx'; // Assuming this path is correct

const PaymentHistoryDetailModal = ({ entry, onClose }) => { // <-- Removed assets prop
    const { assets } = useAssets(); // <-- Get assets from context

    // --- Safely parse and format data from the entry ---
    const formattedTimestamp = entry.timestamp ? new Date(entry.timestamp).toLocaleString() : 'N/A';
    const statusClass = getStatusClass(entry.status);

    // Use formatting utility if available, otherwise fallback
    const displayAmount = typeof formatAmount === 'function'
        ? formatAmount(entry.amount, entry.currency)
        : `${entry.amount?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || 'N/A'} ${entry.currency || ''}`;

    // Safely access nested rawData properties
    const raw = entry.rawData || {};
    const destinationInfo = raw.destination_counterparty_info || {};
    const sourceInfo = raw.payment_source || {};
    const paymentInfo = raw.payment_info || {};
    const simulatedFees = raw._simulated_fees || {};

    const sourceAccountDisplay = raw._ui_sender_account_label || sourceInfo.account_id || 'N/A';
    const onBehalfOf = sourceInfo.onBehalfOf || null;
    const sendingEntity = sourceInfo.entity || 'N/A';
    const destAccount = destinationInfo.accountIdentifier || 'N/A';
    const destInstitution = destinationInfo.institution || 'N/A';
    const recipientNameDisplay = entry.recipient || destinationInfo.name || 'N/A';

    // Determine Network/Rail information
    let networkOrRail = raw._ui_onchain_network || paymentInfo.onChainNetwork || 'N/A';
    if (networkOrRail === 'N/A') {
        networkOrRail = raw.traditionalRail || paymentInfo.traditionalRail || raw._ui_traditional_rail || 'N/A';
    }
    const networkOrRailLabel = (raw._ui_onchain_network || paymentInfo.onChainNetwork) ? 'Network' : 'Rail';

    const purposeCode = paymentInfo.purpose || raw.purposeCode || 'N/A';
    const paymentDescription = paymentInfo.description || null;

    // --- Calculate source currency using assets from context ---
    const sourceCurrency = useMemo(() => {
        if (!Array.isArray(assets) || !sourceInfo.account_id) {
            return entry.currency || ''; // Fallback to entry's currency if assets not ready or no account ID
        }
        return assets.find(a => a.id === sourceInfo.account_id)?.symbol || entry.currency || '';
    }, [assets, sourceInfo.account_id, entry.currency]); // Depend on context assets and source account ID

    const totalDebit = raw._simulated_total_debit;
    const formattedTotalDebit = typeof totalDebit === 'number' ? totalDebit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : 'N/A';


    // Filter and prepare fee items for display
     const feeItems = useMemo(() => [
         { label: 'Platform Fee', value: simulatedFees.platform },
         { label: 'Settlement Fee', value: simulatedFees.settlement },
         { label: networkOrRailLabel === 'Network' ? 'Network Fee (Est.)' : 'Rail Fee', value: simulatedFees.networkOrRail, display: raw._ui_network_fee_display },
         { label: 'Slippage (Est.)', value: simulatedFees.slippage },
         { label: 'Contract Fee (Est.)', value: simulatedFees.contract },
         { label: 'FX Spread (Est.)', value: simulatedFees.fxSpread },
         { label: 'Banking Fee (Est.)', value: simulatedFees.genericBank },
     ].filter(fee => typeof fee.value === 'number' && fee.value > 0), [simulatedFees, networkOrRailLabel, raw._ui_network_fee_display]); // Dependencies include calculated values


    // --- Render Logic ---
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white z-10 flex-shrink-0">
                    <h2 className="text-xl font-bold text-gray-800">Payment Details</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-3xl leading-none">&times;</button>
                </div>

                {/* Scrollable Body */}
                <div className="p-6 space-y-4 text-sm overflow-y-auto flex-grow">
                    {/* Top Details Section */}
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

                    {/* Account & Routing Details Section */}
                    <div className="grid grid-cols-3 gap-x-4 gap-y-2 pt-3 pb-3 border-b">
                         <div className="text-gray-500">Source Account</div>
                         <div className="col-span-2 font-medium text-gray-800">{sourceAccountDisplay}</div>

                         {onBehalfOf && (
                            <>
                             <div className="text-gray-500">On Behalf Of</div>
                             <div className="col-span-2 font-medium text-gray-800">{onBehalfOf}</div>
                            </>
                         )}

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
                    </div>

                    {/* Fee Breakdown Section */}
                     <div className="pt-3 pb-3 border-b">
                         <h3 className="text-gray-600 font-semibold mb-2">Fee Breakdown (Estimated)</h3>
                         {feeItems.length > 0 ? (
                            <dl className="grid grid-cols-3 gap-x-4 gap-y-1">
                                {feeItems.map((fee, index) => (
                                    <React.Fragment key={index}>
                                        <dt className="text-gray-500">{fee.label}:</dt>
                                        <dd className="col-span-2 font-medium text-gray-800">
                                             {/* Use specific display string if available (e.g., native gas fee) */}
                                             {fee.display || `${(fee.value ?? 0).toLocaleString(undefined, { maximumFractionDigits: 6 })} ${sourceCurrency}`}
                                        </dd>
                                    </React.Fragment>
                                ))}
                            </dl>
                         ) : (
                             <p className="text-gray-500 italic">No specific fees were calculated for this transaction.</p>
                         )}
                    </div>

                    {/* Total Debit Section */}
                     <div className="grid grid-cols-3 gap-x-4 gap-y-1 pt-3 pb-3 border-b">
                          <div className="text-gray-500 font-semibold">Total Debit</div>
                          <div className="col-span-2 font-bold text-gray-900">{formattedTotalDebit} {sourceCurrency}</div>
                     </div>

                    {/* Description Section */}
                    {paymentDescription && (
                         <div className="pt-3">
                            <h3 className="text-gray-600 font-semibold mb-1">Payment Description</h3>
                            <p className="font-medium bg-gray-50 p-3 border rounded text-gray-800 whitespace-pre-wrap break-words">
                                {paymentDescription}
                            </p>
                         </div>
                     )}
                </div>

                {/* Footer */}
                <div className="flex justify-end items-center p-4 border-t sticky bottom-0 bg-gray-50 z-10 flex-shrink-0">
                    <button onClick={onClose} className="px-4 py-2 rounded text-sm bg-gray-600 hover:bg-gray-700 text-white">Close</button>
                </div>
            </div>
        </div>
    );
};

export default PaymentHistoryDetailModal;