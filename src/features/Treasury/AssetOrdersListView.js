import React from 'react';
// Import helpers used in this component
import { formatNumber, getStatusClass } from '../../utils/displayUtils';

/**
 * Component to display a list of asset orders.
 * @param {object} props - Component props.
 * @param {Array} props.assetOrders - Array of asset order objects to display.
 * @param {function} props.onBack - Function to navigate back to the main Treasury dashboard.
 * @param {function} props.onCreateNew - Function to navigate to the create order screen.
 */
const AssetOrdersListView = ({ assetOrders = [], onBack, onCreateNew }) => {
  console.log("Rendering AssetOrdersListView with orders:", assetOrders);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Asset Orders</h1>
        <button
          className="px-3 py-1 rounded text-white hover:opacity-90 bg-gray-800 text-sm"
          onClick={onBack} // Use the onBack prop passed from TreasuryDashboard
        >
          &larr; Back to Treasury Dashboard
        </button>
      </div>

      {/* Action Button */}
      <div className="mb-6 text-right">
        <button
          className="px-4 py-2 rounded text-white hover:opacity-90 bg-green-600 text-sm font-medium"
          onClick={onCreateNew} // Use the onCreateNew prop passed from TreasuryDashboard
        >
          + Create New Order
        </button>
      </div>

      {/* Orders Table */}
      <div className="bg-white p-4 rounded shadow overflow-x-auto">
        {assetOrders.length === 0 ? (
          <p className="text-center text-gray-500 italic">No asset orders found.</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                <th scope="col" className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th scope="col" className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Asset</th>
                <th scope="col" className="px-4 py-2 text-right font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th scope="col" className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">From / To</th>
                <th scope="col" className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Requested By</th>
                <th scope="col" className="px-4 py-2 text-center font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {/* Sort orders by timestamp descending before mapping */}
              {assetOrders.sort((a, b) => b.timestamp - a.timestamp).map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 whitespace-nowrap text-gray-500">{order.timestamp.toLocaleDateString()}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-gray-700 font-medium">{order.id}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-gray-900">{order.type}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-gray-900">{order.assetSymbol}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-right text-gray-900">{formatNumber(order.amount)}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-gray-500 max-w-xs truncate" title={`${order.from} -> ${order.to}`}>
                    {order.from} &rarr; {order.to}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-gray-500">{order.requestedBy}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-center">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AssetOrdersListView;
