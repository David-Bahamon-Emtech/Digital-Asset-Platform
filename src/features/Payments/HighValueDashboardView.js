// src/features/Payments/HighValueDashboardView.js
import React, { useMemo } from 'react'; // Added useMemo
import PaymentHistoryTable from './PaymentHistoryTable';
// --- ADDED: Import rates for calculation ---
import { ratesToUSD } from './data/paymentConstants';

// --- Icon Components ---
const InformationCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
const CheckCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
);
// --- END Icon Components ---

// --- Component ---
// Removed pendingCount, pendingTotalValue, urgentCount props
const HighValueDashboardView = ({
    onNavigate,
    history = [],
    onHistoryRowClick
}) => {

    // --- Calculate pending summary data dynamically ---
    const pendingSummary = useMemo(() => {
        let count = 0;
        let totalUSD = 0;
        let urgentCount = 0;

        if (!Array.isArray(history)) {
             console.error("History prop is not an array in HighValueDashboardView");
             return { count: 0, totalUSD: 0, urgentCount: 0 };
        }

        history.forEach(item => {
            // Check if status indicates pending (case-insensitive)
            if (item.status?.toLowerCase().includes('pending')) {
                count++;

                // Calculate USD value
                const amount = item.amount || 0; // Use amount field
                // Use rawData._simulated_total_debit if preferred and available:
                // const amount = item.rawData?._simulated_total_debit || item.amount || 0;
                const currency = item.currency || 'USD'; // Default to USD if currency missing? Adjust as needed.
                const rate = ratesToUSD[currency] || 0; // Default to 0 if rate missing

                if (rate > 0) {
                    totalUSD += amount * rate;
                } else if (currency !== 'USD') { // Don't warn if it's USD with rate 0 or missing
                    console.warn(`Missing USD conversion rate for currency: ${currency} in HVT history item ID: ${item.id}`);
                } else if (currency === 'USD' && amount > 0) {
                     totalUSD += amount; // Assume 1:1 if currency is USD but rate somehow missing
                }


                // Check for urgency flag (adjust path if needed)
                if (item.rawData?.isUrgent === true) {
                    urgentCount++;
                }
            }
        });

        return { count, totalUSD, urgentCount };

    }, [history]); // Recalculate whenever the history prop changes


    return (
        <div>
            {/* Information Banner */}
            <div className="flex items-start p-4 mb-6 text-sm text-blue-700 rounded-lg bg-blue-50 border border-blue-200" role="alert">
                <InformationCircleIcon />
                <div className="ml-3">
                    <div className="font-medium">High-Value Transfer Policy:</div>
                     <ul className="mt-1 list-disc list-inside">
                        <li>Initiating accounts must have ≥ $10,000,000 USD equivalent balance.</li>
                        <li>Payment amount must be ≥ $10,000,000 USD equivalent.</li>
                        <li>Transfers over $10M require dual authorization.</li>
                        <li>Transfers over $50M require executive approval.</li>
                        <li>Compliance checks performed during confirmation.</li>
                        <li>Submitted transfers require authorization.</li>
                    </ul>
                </div>
            </div>

            {/* Action Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

                {/* Initiate HVT Card */}
                <div className="bg-white p-6 rounded shadow flex flex-col">
                    <h2 className="font-bold border-b pb-2 mb-4 text-gray-800 text-lg">Initiate High-Value Transfer</h2>
                    <p className="text-sm text-gray-600 mb-4">Create and submit a new high-value transfer with enhanced security and multi-party approvals</p>
                    <ul className="space-y-2 text-sm text-gray-700 mb-6 flex-grow">
                        <li className="flex items-center"> <CheckCircleIcon /> Multi-signature authentication </li>
                        <li className="flex items-center"> <CheckCircleIcon /> Automated compliance checks </li>
                        <li className="flex items-center"> <CheckCircleIcon /> Secure authorization workflow </li>
                    </ul>
                    <button
                        className="px-4 py-2 rounded text-white hover:opacity-90 bg-emtech-gold w-full mt-auto"
                        onClick={() => onNavigate('create-hvt')}
                    >
                        Initiate Transfer
                    </button>
                </div>

                {/* Authorize Pending Transfers Card - Uses calculated data */}
                 <div className="bg-white p-6 rounded shadow flex flex-col">
                    <h2 className="font-bold border-b pb-2 mb-4 text-gray-800 text-lg">Authorize Pending Transfers</h2>
                    <p className="text-sm text-gray-600 mb-6">Review and approve high-value transfers awaiting your authorization</p>
                    <div className="p-4 rounded-lg border bg-yellow-50 border-yellow-200 mb-6 flex-grow">
                         <div className="flex items-center justify-between">
                             <div className="flex items-center">
                                {/* --- Use calculated count --- */}
                                <span className="text-3xl font-bold text-yellow-900 mr-3">{pendingSummary.count}</span>
                                <div>
                                     <p className="text-sm font-medium text-yellow-900">Transfers awaiting authorization</p>
                                     {/* --- Use calculated totalUSD --- */}
                                     <p className="text-xs text-yellow-800">Total value: ${pendingSummary.totalUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD</p>
                                </div>
                            </div>
                             {/* --- Use calculated urgentCount --- */}
                            {pendingSummary.urgentCount > 0 && (
                                 <span className="px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded-full font-medium">{pendingSummary.urgentCount} Urgent</span>
                            )}
                         </div>
                    </div>
                    <button
                        className="px-4 py-2 rounded text-white hover:opacity-90 bg-emtech-gold w-full mt-auto"
                        onClick={() => onNavigate('authorize-hvt')}
                    >
                        Review & Authorize
                    </button>
                </div>

            </div>

            {/* Reusable Payment History Table Section */}
            <PaymentHistoryTable
                history={history}
                onRowClick={onHistoryRowClick}
                title="Recent High-Value Transfers"
            />

        </div>
    );
};

export default HighValueDashboardView;