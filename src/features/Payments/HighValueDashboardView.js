// src/features/Payments/HighValueDashboardView.js
import React from 'react';

// --- Simulated Data ---
const recentHVT = [
    { id: 'HVT-982465', date: 'Mar 4, 2025', from: 'Citi Treasury', to: 'Federal Reserve', amount: '$75,000,000', authorizers: ['JD', 'KL', 'MT'], status: 'Completed'},
    { id: 'HVT-982464', date: 'Mar 4, 2025', from: 'Citi New York', to: 'Bank of England', amount: '$42,800,000', authorizers: ['JD', 'RL'], status: 'Completed'},
    { id: 'HVT-982463', date: 'Mar 3, 2025', from: 'Citi Singapore', to: 'Monetary Authority of Singapore', amount: '$36,500,000', authorizers: ['PW', 'KL'], status: 'Completed'},
];

// --- Helper to get initials color (example) ---
const getInitialsBgColor = (initials) => {
    const charCodeSum = initials.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-red-500', 'bg-yellow-600', 'bg-indigo-500'];
    return colors[charCodeSum % colors.length];
};


// --- Component ---
const HighValueDashboardView = ({ onNavigate }) => { // Expects onNavigate prop

    const handleViewAll = () => {
        console.log("Navigate to All High-Value Transfers History (Not implemented)");
        // Example: onNavigate('hvt-history');
    };

    return (
        <div>
            {/* Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-4 rounded shadow">
                    <h2 className="font-bold border-b pb-2 mb-4 text-gray-800">Initiate New HVT</h2>
                    <p className="text-sm text-gray-600 mb-4">Start a new high-value transfer process</p>
                    <button
                        className="px-4 py-2 rounded text-white hover:opacity-90 bg-emtech-gold w-full" // Consistent button color
                        onClick={() => onNavigate('create-hvt')} // Use prop handler
                    >
                        Initiate Transfer
                    </button>
                </div>
                <div className="bg-white p-4 rounded shadow">
                    <h2 className="font-bold border-b pb-2 mb-4 text-gray-800">Review Pending Transfers</h2>
                    <p className="text-sm text-gray-600 mb-4">Authorize or reject transfers requiring approval</p>
                    <button
                        className="px-4 py-2 rounded text-white hover:opacity-90 bg-emtech-gold w-full"
                        onClick={() => onNavigate('authorize-hvt')} // Use prop handler
                    >
                        Review Pending
                    </button>
                </div>
                <div className="bg-white p-4 rounded shadow">
                    <h2 className="font-bold border-b pb-2 mb-4 text-gray-800">HVT History & Reporting</h2>
                    <p className="text-sm text-gray-600 mb-4">View past high-value transfers and generate reports</p>
                    <button
                        className="px-4 py-2 rounded text-white hover:opacity-90 bg-emtech-gold w-full"
                        onClick={() => console.log("Navigate to HVT History/Reports (Not implemented)")} // Placeholder
                        // Example: onClick={() => onNavigate('hvt-history')}
                    >
                        View History
                    </button>
                </div>
            </div>

            {/* Transaction Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {/* Metrics copied from original chunk */}
                <div className="bg-white p-4 rounded shadow"> <h3 className="text-sm text-gray-500 mb-1">24h HVT Volume</h3> <p className="text-2xl font-bold">$154.3M</p> <p className="text-xs text-red-600">-2.1%</p> </div>
                <div className="bg-white p-4 rounded shadow"> <h3 className="text-sm text-gray-500 mb-1">Pending Approval</h3> <p className="text-2xl font-bold">3 Transfers</p> <p className="text-xs text-blue-600">$130.6M value</p> </div>
                <div className="bg-white p-4 rounded shadow"> <h3 className="text-sm text-gray-500 mb-1">Avg. Processing Time</h3> <p className="text-2xl font-bold">1.5 Hours</p> <p className="text-xs text-green-600">-8%</p> </div>
                <div className="bg-white p-4 rounded shadow"> <h3 className="text-sm text-gray-500 mb-1">Exception Rate</h3> <p className="text-2xl font-bold">0.4%</p> <p className="text-xs text-red-600">+0.1%</p> </div>
            </div>

            {/* Recent High-Value Transfers Table */}
            <div className="bg-white p-6 rounded shadow">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="font-bold text-gray-800">Recent High-Value Transfers</h2>
                    <button className="text-sm text-blue-600 hover:underline" onClick={handleViewAll}>
                        View All
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr>
                                <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left">Reference ID</th>
                                <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left">Date</th>
                                <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left">From</th>
                                <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left">To</th>
                                <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left">Amount</th>
                                <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left">Authorizers</th>
                                <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentHVT.map((tx) => (
                                <tr key={tx.id} className="hover:bg-gray-50">
                                    <td className="py-2 px-4 border-b border-gray-200">{tx.id}</td>
                                    <td className="py-2 px-4 border-b border-gray-200">{tx.date}</td>
                                    <td className="py-2 px-4 border-b border-gray-200">{tx.from}</td>
                                    <td className="py-2 px-4 border-b border-gray-200">{tx.to}</td>
                                    <td className="py-2 px-4 border-b border-gray-200 font-medium">{tx.amount}</td>
                                    <td className="py-2 px-4 border-b border-gray-200">
                                        <div className="flex -space-x-2 overflow-hidden">
                                            {tx.authorizers.map((initials, index) => (
                                                <div key={index} title={initials} className={`inline-block h-6 w-6 rounded-full text-white text-xs flex items-center justify-center ring-2 ring-white ${getInitialsBgColor(initials)}`}>
                                                    {initials}
                                                </div>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="py-2 px-4 border-b border-gray-200">
                                        <span className={`px-2 py-1 text-xs rounded-full ${
                                            tx.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                            tx.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>
                                            {tx.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default HighValueDashboardView;