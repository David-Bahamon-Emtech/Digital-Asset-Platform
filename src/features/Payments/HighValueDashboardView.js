// src/features/Payments/HighValueDashboardView.js
import React from 'react';
// Import the reusable history table
import PaymentHistoryTable from './PaymentHistoryTable';

// NOTE: recentHVT definition REMOVED
// NOTE: getInitialsBgColor helper REMOVED (specific to old static table)

// --- Component ---
// Expects onNavigate, history (filtered HVT history), and onHistoryRowClick props
const HighValueDashboardView = ({
    onNavigate,
    history = [], // Use prop, default to empty array
    onHistoryRowClick
}) => {

    // --- Removed handleViewAll for separate button ---
    // --- Navigation to full history is now handled by the action card ---

    return (
        <div>
            {/* Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-4 rounded shadow">
                    <h2 className="font-bold border-b pb-2 mb-4 text-gray-800">Initiate New HVT</h2>
                    <p className="text-sm text-gray-600 mb-4">Start a new high-value transfer process</p>
                    <button
                        className="px-4 py-2 rounded text-white hover:opacity-90 bg-emtech-gold w-full"
                        onClick={() => onNavigate('create-hvt')} // OK
                    >
                        Initiate Transfer
                    </button>
                </div>
                <div className="bg-white p-4 rounded shadow">
                    <h2 className="font-bold border-b pb-2 mb-4 text-gray-800">Review Pending Transfers</h2>
                    <p className="text-sm text-gray-600 mb-4">Authorize or reject transfers requiring approval</p>
                    <button
                        className="px-4 py-2 rounded text-white hover:opacity-90 bg-emtech-gold w-full"
                        onClick={() => onNavigate('authorize-hvt')} // OK
                    >
                        Review Pending
                    </button>
                </div>
                <div className="bg-white p-4 rounded shadow">
                    <h2 className="font-bold border-b pb-2 mb-4 text-gray-800">HVT History & Reporting</h2>
                    <p className="text-sm text-gray-600 mb-4">View past high-value transfers and generate reports</p>
                    <button
                        className="px-4 py-2 rounded text-white hover:opacity-90 bg-emtech-gold w-full"
                        onClick={() => {
                            console.log("Navigate to HVT History/Reports");
                            if (onNavigate) {
                                // Define a screen key for the full HVT history view
                                onNavigate('hvt-history-list'); // Assumes this screen key exists/will be created
                            }
                         }} // UPDATED to use onNavigate
                    >
                        View History
                    </button>
                </div>
            </div>

            {/* Transaction Metrics (Static - OK for demo) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-4 rounded shadow"> <h3 className="text-sm text-gray-500 mb-1">24h HVT Volume</h3> <p className="text-2xl font-bold">$154.3M</p> <p className="text-xs text-red-600">-2.1%</p> </div>
                <div className="bg-white p-4 rounded shadow"> <h3 className="text-sm text-gray-500 mb-1">Pending Approval</h3> <p className="text-2xl font-bold">3 Transfers</p> <p className="text-xs text-blue-600">$130.6M value</p> </div>
                <div className="bg-white p-4 rounded shadow"> <h3 className="text-sm text-gray-500 mb-1">Avg. Processing Time</h3> <p className="text-2xl font-bold">1.5 Hours</p> <p className="text-xs text-green-600">-8%</p> </div>
                <div className="bg-white p-4 rounded shadow"> <h3 className="text-sm text-gray-500 mb-1">Exception Rate</h3> <p className="text-2xl font-bold">0.4%</p> <p className="text-xs text-red-600">+0.1%</p> </div>
            </div>

            {/* --- REMOVED Static Recent Transactions Table --- */}

            {/* --- ADDED Reusable Payment History Table --- */}
            <PaymentHistoryTable
                history={history} // Pass filtered history from props
                onRowClick={onHistoryRowClick} // Pass row click handler from props
                title="Recent High-Value Transfers" // Customize title
                // Add onViewAllClick prop later if needed for the button inside the table
                // onViewAllClick={() => onNavigate('hvt-history-list')}
            />
            {/* --- END ADDED History Table --- */}

        </div>
    );
};

export default HighValueDashboardView;