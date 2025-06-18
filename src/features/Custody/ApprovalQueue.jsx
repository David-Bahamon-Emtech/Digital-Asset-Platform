// src/features/Custody/ApprovalQueue.js
import React from 'react';

/**
 * Displays a list of items pending custody approval and allows approving/rejecting.
 * Uses standard HTML and Tailwind CSS.
 *
 * @param {object} props - Component props.
 * @param {Array<object>} props.pendingApprovals - Array of items needing approval.
 * @param {function} props.onApprove - Function called when an item is approved (passes item id).
 * @param {function} props.onReject - Function called when an item is rejected (passes item id).
 * @param {function} props.onBack - Function to navigate back.
 */
const ApprovalQueue = ({
    pendingApprovals = [],
    onApprove,
    onReject,
    onBack
}) => {

    // Placeholder: In a real scenario, you might fetch details based on item.type/item.id
    const getApprovalDetails = (item) => {
        // Example: Format details based on type
        switch (item.type) {
            case 'Internal Transfer':
                return `Transfer ${item.amount || 'N/A'} ${item.asset || ''} from ${item.from || '?'} to ${item.to || '?'}`;
            case 'Policy Change':
                return `Update policy: ${item.policyName || 'Unknown Policy'}`;
            case 'Settlement':
                 return `Settle ${item.asset || ''} (${item.amount || 'N/A'}) between ${item.from || '?'} and ${item.to || '?'}`;
             case 'Payment':
                 return `Pay ${item.amount || 'N/A'} ${item.asset || ''} to ${item.recipient || 'Unknown'}`;
            default:
                return item.details || 'No details provided.';
        }
    };

    return (
        <div className="bg-white p-6 rounded shadow">
            {/* Header */}
            <div className="flex justify-between items-center mb-6 border-b pb-3">
                <h1 className="text-2xl font-bold text-gray-800">Pending Custody Approvals</h1>
                <button
                    type="button"
                    className="px-3 py-1 rounded text-white hover:opacity-90 bg-gray-800 text-sm"
                    onClick={onBack}
                >
                    &larr; Back to Custody Dashboard
                </button>
            </div>

            {/* Approval List/Table */}
            {pendingApprovals.length === 0 ? (
                <p className="text-center text-gray-500 italic py-6">No items currently pending approval.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requested By</th>
                                <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {pendingApprovals.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{item.timestamp ? new Date(item.timestamp).toLocaleString() : 'N/A'}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-800">{item.type}</td>
                                    <td className="px-4 py-3 text-sm text-gray-700 max-w-md">{getApprovalDetails(item)}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{item.requester}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-center text-sm space-x-2">
                                        <button
                                            type="button"
                                            onClick={() => onApprove(item.id)}
                                            className="px-3 py-1 rounded text-white bg-green-600 hover:bg-green-700 text-xs font-medium"
                                        >
                                            Approve
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => onReject(item.id)}
                                            className="px-3 py-1 rounded text-white bg-red-600 hover:bg-red-700 text-xs font-medium"
                                        >
                                            Reject
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ApprovalQueue;
