// src/features/AccountManagement/ClientAccountListTable.js
import React from 'react';
import { formatNumber } from '../../utils/displayUtils.jsx'; // Assuming you have this utility

// Helper to get sort indicator
const getSortIndicator = (columnKey, sortConfig) => {
  if (sortConfig.key === columnKey) {
    return sortConfig.direction === 'ascending' ? ' ▲' : ' ▼';
  }
  return '';
};

const ClientAccountListTable = ({ clientAccounts, onViewDetails, requestSort, sortConfig }) => {

  if (!clientAccounts || clientAccounts.length === 0) {
    return <p className="text-gray-500">No client accounts to display.</p>;
  }

  // Define sortable columns
  const sortableColumns = [
    { key: 'clientName', label: 'Client Name' },
    { key: 'label', label: 'Account Label / Nickname' },
    { key: 'id', label: 'Account ID' },
    { key: 'symbol', label: 'Currency' },
    { key: 'balance', label: 'Balance', isNumeric: true },
    { key: 'assetClass', label: 'Account Type' },
    { key: 'simulatedStatus', label: 'Status' },
  ];

  return (
    <div className="overflow-x-auto shadow-md rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {sortableColumns.map(col => (
              <th
                key={col.key}
                scope="col"
                className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 ${col.isNumeric ? 'text-right' : 'text-left'}`}
                onClick={() => requestSort(col.key)}
              >
                {col.label}
                {getSortIndicator(col.key, sortConfig)}
              </th>
            ))}
            <th
              scope="col"
              className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {clientAccounts.map((account) => (
            <tr key={account.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {account.clientName || 'N/A'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                {account.label}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                {account.id}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                {account.symbol}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">
                {account.balance ? formatNumber(account.balance) : 'N/A'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                {account.assetClass}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    account.simulatedStatus === 'Active'
                      ? 'bg-green-100 text-green-800'
                      : account.simulatedStatus === 'Frozen'
                      ? 'bg-yellow-100 text-yellow-800'
                      : account.simulatedStatus === 'Review' // Corrected from 'Review' to 'Review Needed' if that's the status
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {account.simulatedStatus}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() => onViewDetails ? onViewDetails(account) : console.log('View details for', account.id)}
                  className="text-indigo-600 hover:text-indigo-900 focus:outline-none focus:underline"
                >
                  View Details
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ClientAccountListTable;
