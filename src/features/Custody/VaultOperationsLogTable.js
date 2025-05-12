// src/features/Custody/components/VaultOperationsLogTable.js
import React from 'react';

/**
 * Renders a table displaying recent vault operations.
 *
 * @param {object} props - Component props.
 * @param {Array<object>} props.operations - An array of operation log objects. Each object should have properties like id, operation, vault, asset, amount, timestamp, initiatedBy, status.
 */
const VaultOperationsLogTable = ({ operations = [] }) => {

  // Helper to format status with appropriate styling
  const renderStatus = (status) => {
    let bgColor = 'bg-gray-100';
    let textColor = 'text-gray-800';
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'verified':
        bgColor = 'bg-green-100';
        textColor = 'text-green-800';
        break;
      case 'pending':
      case 'pending approval':
        bgColor = 'bg-yellow-100';
        textColor = 'text-yellow-800';
        break;
      case 'failed':
      case 'rejected':
        bgColor = 'bg-red-100';
        textColor = 'text-red-800';
        break;
      case 'in progress':
         bgColor = 'bg-blue-100';
         textColor = 'text-blue-800';
         break;
      default:
        break; // Keep default gray
    }
    return (
      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${bgColor} ${textColor}`}>
        {status || 'Unknown'}
      </span>
    );
  };

   // Helper to format operation type with color
   const formatOperation = (operation) => {
     let textColor = 'text-gray-700';
     switch (operation?.toLowerCase()) {
        case 'deposit':
            textColor = 'text-blue-700'; break;
        case 'withdrawal':
            textColor = 'text-red-700'; break;
        case 'key rotation':
            textColor = 'text-purple-700'; break;
        case 'audit':
            textColor = 'text-yellow-700'; break;
        case 'internal transfer':
             textColor = 'text-indigo-700'; break;
        default: break;
     }
     return <span className={`font-medium ${textColor}`}>{operation}</span>;
   }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Operation</th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vault/Location</th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset</th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount/Quantity</th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Initiated By</th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {operations.length > 0 ? (
            operations.map((op) => (
              <tr key={op.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap text-sm">{formatOperation(op.operation)}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{op.vault}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{op.asset}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{op.amount}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{op.timestamp ? new Date(op.timestamp).toLocaleString() : 'N/A'}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{op.initiatedBy}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">{renderStatus(op.status)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="px-4 py-4 text-center text-sm text-gray-500 italic">
                No recent vault operations found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default VaultOperationsLogTable;

