// src/features/Payments/CrossBorderDashboardView.js
import React from 'react';
import PaymentHistoryTable from './PaymentHistoryTable'; // <-- IMPORT reusable table

// --- Component receives history and click handler ---
const CrossBorderDashboardView = ({ onNavigate, history = [], onHistoryRowClick }) => {

  return (
    <div>
      {/* Action Cards (Unchanged) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* ... Action Card JSX ... */}
        <div className="bg-white p-4 rounded shadow"> <h2 className="font-bold border-b pb-2 mb-4 text-gray-800">New Payment</h2> <p className="text-sm text-gray-600 mb-4">Initiate a new payment transaction</p> <button className="px-4 py-2 rounded text-white hover:opacity-90 bg-emtech-gold w-full" onClick={() => onNavigate('create-payment')} > Create Payment </button> </div>
        <div className="bg-white p-4 rounded shadow"> <h2 className="font-bold border-b pb-2 mb-4 text-gray-800">Payment Templates</h2> <p className="text-sm text-gray-600 mb-4">Use saved payment instructions</p> <button className="px-4 py-2 rounded text-white hover:opacity-90 bg-emtech-gold w-full" onClick={() => onNavigate('view-templates')} > View Templates </button> </div>
        <div className="bg-white p-4 rounded shadow"> <h2 className="font-bold border-b pb-2 mb-4 text-gray-800">Recurring Payments</h2> <p className="text-sm text-gray-600 mb-4">Schedule regular payment transfers</p> <button className="px-4 py-2 rounded text-white hover:opacity-90 bg-emtech-gold w-full" onClick={() => onNavigate('manage-recurring')} > Manage Recurring </button> </div>
      </div>

      {/* Transaction Metrics (Unchanged) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
         {/* ... Metrics JSX ... */}
         <div className="bg-white p-4 rounded shadow"> <h3 className="text-sm text-gray-500 mb-1">24h Volume</h3> <p className="text-2xl font-bold">$382.5M</p> <p className="text-xs text-green-600">+5.2%</p> </div>
         <div className="bg-white p-4 rounded shadow"> <h3 className="text-sm text-gray-500 mb-1">Transactions Today</h3> <p className="text-2xl font-bold">1,254</p> <p className="text-xs text-green-600">+8.7%</p> </div>
         <div className="bg-white p-4 rounded shadow"> <h3 className="text-sm text-gray-500 mb-1">Avg. Settlement Time</h3> <p className="text-2xl font-bold">4.3 min</p> <p className="text-xs text-green-600">-12%</p> </div>
         <div className="bg-white p-4 rounded shadow"> <h3 className="text-sm text-gray-500 mb-1">Success Rate</h3> <p className="text-2xl font-bold">99.8%</p> <p className="text-xs text-red-600">-0.1%</p> </div>
      </div>

      {/* --- REMOVED Static Recent Transactions Table --- */}

      {/* --- ADDED Reusable Payment History Table --- */}
      <PaymentHistoryTable
          history={history}
          onRowClick={onHistoryRowClick}
          title="Recent Cross-Border Payments" // Customize title
      />
      {/* --- END ADDED History Table --- */}

    </div>
  );
};

export default CrossBorderDashboardView;