// src/features/Custody/RequestWithdrawalForm.js
import React, { useState, useMemo } from 'react';

/**
 * Form component for requesting a withdrawal from a managed vault/asset.
 * Uses standard HTML and Tailwind CSS.
 *
 * @param {object} props - Component props.
 * @param {Array<object>} props.assets - The list of asset objects (used to select withdrawal source).
 * @param {function} props.onBack - Function to navigate back to the dashboard.
 * @param {function} props.onSubmit - Function called when the withdrawal form is submitted (passes form data).
 */
const RequestWithdrawalForm = ({ assets = [], onBack, onSubmit }) => {

    // Filter assets to show only those we can withdraw from (non-External)
    const withdrawableAssets = useMemo(() => {
        if (!Array.isArray(assets)) return [];
        // Filter out assets held externally
        return assets.filter(asset => asset.custodyType !== 'External');
    }, [assets]);

    // Form State
    const [sourceAssetId, setSourceAssetId] = useState('');
    const [withdrawalAmount, setWithdrawalAmount] = useState('');
    const [destinationType, setDestinationType] = useState('External Address'); // Example types
    const [destinationDetails, setDestinationDetails] = useState('');
    const [withdrawalReason, setWithdrawalReason] = useState('');

    // Get selected asset details for validation/display
    const selectedAsset = useMemo(() => {
        return assets.find(a => a.id === sourceAssetId);
    }, [sourceAssetId, assets]);

    const handleSubmit = (event) => {
        event.preventDefault();
        const amount = parseFloat(withdrawalAmount);

        if (!sourceAssetId) {
            alert('Please select the source asset/vault.');
            return;
        }
        if (isNaN(amount) || amount <= 0) {
            alert('Please enter a valid positive amount to withdraw.');
            return;
        }
        // Basic balance check (can be more sophisticated)
        if (selectedAsset && amount > selectedAsset.balance) {
             alert(`Withdrawal amount (${amount.toLocaleString()}) exceeds available balance (${selectedAsset.balance.toLocaleString()}).`);
             return;
        }
        if (!destinationDetails.trim()) {
            alert('Please enter destination details (e.g., address, account).');
            return;
        }

        // Pass data up to the parent component (CustodyDashboard)
        onSubmit({
            sourceAssetId,
            sourceAssetSymbol: selectedAsset?.symbol || 'N/A',
            amount,
            destinationType,
            destinationDetails: destinationDetails.trim(),
            reason: withdrawalReason,
        });
    };

    return (
        <div className="bg-white p-6 rounded shadow max-w-2xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-6 border-b pb-3">
                <h1 className="text-xl font-bold text-gray-800">Request Vault Withdrawal</h1>
                <button
                    type="button"
                    className="px-3 py-1 rounded text-white hover:opacity-90 bg-gray-800 text-sm"
                    onClick={onBack}
                >
                    &larr; Back to Dashboard
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Source Asset/Vault Selection */}
                <div>
                    <label htmlFor="sourceAsset" className="block mb-1 text-sm font-medium text-gray-700">Source Asset/Vault <span className="text-red-600">*</span></label>
                    <select
                        id="sourceAsset"
                        value={sourceAssetId}
                        onChange={(e) => setSourceAssetId(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded bg-white text-sm"
                        required
                    >
                        <option value="" disabled>-- Select Source --</option>
                        {withdrawableAssets.map(asset => (
                            <option key={asset.id} value={asset.id}>
                                {asset.label} ({asset.symbol}) - Bal: {asset.balance?.toLocaleString() ?? 'N/A'}
                            </option>
                        ))}
                        {withdrawableAssets.length === 0 && <option disabled>No withdrawable assets found</option>}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Select the vault or asset account to withdraw from.</p>
                </div>

                {/* Amount */}
                <div>
                    <label htmlFor="withdrawalAmount" className="block mb-1 text-sm font-medium text-gray-700">Amount <span className="text-red-600">*</span></label>
                    <input
                        id="withdrawalAmount"
                        type="number"
                        value={withdrawalAmount}
                        onChange={(e) => setWithdrawalAmount(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded text-sm"
                        placeholder="Amount to withdraw"
                        min="0"
                        step="any" // Allow decimals
                        required
                    />
                     {selectedAsset && (
                        <p className="text-xs text-gray-500 mt-1">Available: {selectedAsset.balance?.toLocaleString() ?? 'N/A'} {selectedAsset.symbol}</p>
                     )}
                </div>

                 {/* Destination Type */}
                 <div>
                    <label htmlFor="destinationType" className="block mb-1 text-sm font-medium text-gray-700">Destination Type <span className="text-red-600">*</span></label>
                    <select
                        id="destinationType"
                        value={destinationType}
                        onChange={(e) => setDestinationType(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded bg-white text-sm"
                        required
                    >
                        <option>External Address</option>
                        <option>Internal Hot Wallet</option>
                        <option>Internal Warm Wallet</option>
                        <option>Bank Account</option>
                         {/* Add other relevant destination types */}
                    </select>
                </div>

                {/* Destination Details */}
                <div>
                    <label htmlFor="destinationDetails" className="block mb-1 text-sm font-medium text-gray-700">Destination Details <span className="text-red-600">*</span></label>
                    <input
                        id="destinationDetails"
                        type="text"
                        value={destinationDetails}
                        onChange={(e) => setDestinationDetails(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded text-sm"
                        placeholder="e.g., Wallet Address, Bank Account #"
                        required
                    />
                     <p className="text-xs text-gray-500 mt-1">Enter the specific address or account details for the destination.</p>
                </div>


                {/* Reason/Reference */}
                <div>
                    <label htmlFor="withdrawalReason" className="block mb-1 text-sm font-medium text-gray-700">Reason / Reference (Optional)</label>
                    <textarea
                        id="withdrawalReason"
                        value={withdrawalReason}
                        onChange={(e) => setWithdrawalReason(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded text-sm"
                        rows="3"
                        placeholder="Reason for withdrawal (e.g., Client Payout, Rebalancing)"
                    />
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4">
                    <button
                        type="button"
                        className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-50 text-sm font-medium"
                        onClick={onBack}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 rounded text-white bg-orange-600 hover:bg-orange-700 text-sm font-medium"
                    >
                        Request Withdrawal Approval
                    </button>
                </div>
            </form>
        </div>
    );
};

export default RequestWithdrawalForm;
