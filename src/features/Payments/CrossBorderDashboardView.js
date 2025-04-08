import React from 'react';

// --- Renders the content for the Cross-Border Payments main dashboard view ---
const CrossBorderDashboardView = ({ onNavigate }) => { // Receives navigation handler

  // Simulated recent transactions data
  const recentTransactions = [
    { id: 'TX92581724', date: 'Mar 5, 2025 10:45 AM', from: 'Citi New York', to: 'HSBC London', amount: '$2,500,000', status: 'Completed' },
    { id: 'TX92581723', date: 'Mar 5, 2025 10:32 AM', from: 'Citi Singapore', to: 'DBS Singapore', amount: '$1,750,000', status: 'Completed' },
    { id: 'TX92581722', date: 'Mar 5, 2025 10:18 AM', from: 'Citi Mumbai', to: 'ICICI Mumbai', amount: '$850,000', status: 'Pending' },
  ];

  return (
    <div>
      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-bold border-b pb-2 mb-4 text-gray-800">New Payment</h2>
          <p className="text-sm text-gray-600 mb-4">Initiate a new payment transaction</p>
          <button
            className="px-4 py-2 rounded text-white hover:opacity-90 bg-emtech-gold w-full" // Use consistent button color
            onClick={() => onNavigate('create-payment')} // Use prop handler
          >
            Create Payment
          </button>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-bold border-b pb-2 mb-4 text-gray-800">Payment Templates</h2>
          <p className="text-sm text-gray-600 mb-4">Use saved payment instructions</p>
          <button
            className="px-4 py-2 rounded text-white hover:opacity-90 bg-emtech-gold w-full"
            onClick={() => onNavigate('view-templates')} // Use prop handler
          >
            View Templates
          </button>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-bold border-b pb-2 mb-4 text-gray-800">Recurring Payments</h2>
          <p className="text-sm text-gray-600 mb-4">Schedule regular payment transfers</p>
          <button
            className="px-4 py-2 rounded text-white hover:opacity-90 bg-emtech-gold w-full"
            onClick={() => onNavigate('manage-recurring')} // Use prop handler
          >
            Manage Recurring
          </button>
        </div>
      </div>

      {/* Transaction Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
         {/* Using slightly fewer metrics for simplicity */}
        <div className="bg-white p-4 rounded shadow"> <h3 className="text-sm text-gray-500 mb-1">24h Volume</h3> <p className="text-2xl font-bold">$382.5M</p> <p className="text-xs text-green-600">+5.2%</p> </div>
        <div className="bg-white p-4 rounded shadow"> <h3 className="text-sm text-gray-500 mb-1">Transactions Today</h3> <p className="text-2xl font-bold">1,254</p> <p className="text-xs text-green-600">+8.7%</p> </div>
        <div className="bg-white p-4 rounded shadow"> <h3 className="text-sm text-gray-500 mb-1">Avg. Settlement Time</h3> <p className="text-2xl font-bold">4.3 min</p> <p className="text-xs text-green-600">-12%</p> </div>
        <div className="bg-white p-4 rounded shadow"> <h3 className="text-sm text-gray-500 mb-1">Success Rate</h3> <p className="text-2xl font-bold">99.8%</p> <p className="text-xs text-red-600">-0.1%</p> </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="bg-white p-6 rounded shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-gray-800">Recent Transactions</h2>
          <button className="text-sm text-blue-600 hover:underline">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left">ID</th>
                <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left">Date</th>
                <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left">From</th>
                <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left">To</th>
                <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left">Amount</th>
                <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b border-gray-200">{tx.id}</td>
                  <td className="py-2 px-4 border-b border-gray-200">{tx.date}</td>
                  <td className="py-2 px-4 border-b border-gray-200">{tx.from}</td>
                  <td className="py-2 px-4 border-b border-gray-200">{tx.to}</td>
                  <td className="py-2 px-4 border-b border-gray-200 font-medium">{tx.amount}</td>
                  <td className="py-2 px-4 border-b border-gray-200">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      tx.status === 'Completed' ? 'bg-green-100 text-green-800' :
                      tx.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800' // Assuming 'Failed' or other might occur
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

export default CrossBorderDashboardView;