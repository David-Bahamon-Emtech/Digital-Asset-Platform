// src/features/Custody/InitiateDepositForm.js
import React, { useState, useMemo } from 'react';

/**
 * Form component for initiating a new deposit into a managed vault/asset.
 * Uses standard HTML and Tailwind CSS.
 *
 * @param {object} props - Component props.
 * @param {Array<object>} props.assets - The list of asset objects (used to select deposit target).
 * @param {function} props.onBack - Function to navigate back to the dashboard.
 * @param {function} props.onSubmit - Function called when the deposit form is submitted (passes form data).
 */
const InitiateDepositForm = ({ assets = [], onBack, onSubmit }) => {

    // Filter assets to show only those we can deposit into (non-External)
    const depositableAssets = useMemo(() => {
        if (!Array.isArray(assets)) return [];
        // Filter out assets held externally, as we likely deposit *into* managed vaults
        return assets.filter(asset => asset.custodyType !== 'External');
    }, [assets]);

    // Form State
    const [targetAssetId, setTargetAssetId] = useState('');
    const [depositAmount, setDepositAmount] = useState('');
    const [depositSource, setDepositSource] = useState('');
    const [depositReference, setDepositReference] = useState('');

    const handleSubmit = (event) => {
        event.preventDefault();
        const amount = parseFloat(depositAmount);
        if (!targetAssetId) {
            alert('Please select the target asset/vault.');
            return;
        }
        if (isNaN(amount) || amount <= 0) {
            alert('Please enter a valid positive amount.');
            return;
        }

        const selectedAsset = assets.find(a => a.id === targetAssetId);

        // Pass data up to the parent component (CustodyDashboard)
        onSubmit({
            targetAssetId,
            targetAssetSymbol: selectedAsset?.symbol || 'N/A',
            amount,
            source: depositSource,
            reference: depositReference,
        });
    };

    return (
        <div className="bg-white p-6 rounded shadow max-w-2xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-6 border-b pb-3">
                <h1 className="text-xl font-bold text-gray-800">Initiate Vault Deposit</h1>
                <button
                    type="button"
                    className="px-3 py-1 rounded text-white hover:opacity-90 bg-gray-800 text-sm"
                    onClick={onBack}
                >
                    &larr; Back to Dashboard
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Target Asset/Vault Selection */}
                <div>
                    <label htmlFor="targetAsset" className="block mb-1 text-sm font-medium text-gray-700">Target Asset/Vault <span className="text-red-600">*</span></label>
                    <select
                        id="targetAsset"
                        value={targetAssetId}
                        onChange={(e) => setTargetAssetId(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded bg-white text-sm"
                        required
                    >
                        <option value="" disabled>-- Select Target --</option>
                        {depositableAssets.map(asset => (
                            <option key={asset.id} value={asset.id}>
                                {asset.label} ({asset.symbol}) - Type: {asset.custodyType}
                            </option>
                        ))}
                        {depositableAssets.length === 0 && <option disabled>No depositable assets found</option>}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Select the specific vault or asset account to deposit into.</p>
                </div>

                {/* Amount */}
                <div>
                    <label htmlFor="depositAmount" className="block mb-1 text-sm font-medium text-gray-700">Amount <span className="text-red-600">*</span></label>
                    <input
                        id="depositAmount"
                        type="number"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded text-sm"
                        placeholder="Amount to deposit"
                        min="0"
                        step="any" // Allow decimals
                        required
                    />
                </div>

                {/* Source */}
                <div>
                    <label htmlFor="depositSource" className="block mb-1 text-sm font-medium text-gray-700">Source (Optional)</label>
                    <input
                        id="depositSource"
                        type="text"
                        value={depositSource}
                        onChange={(e) => setDepositSource(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded text-sm"
                        placeholder="e.g., Incoming Wire Transfer, External Wallet"
                    />
                    <p className="text-xs text-gray-500 mt-1">Where are the funds/assets coming from?</p>
                </div>

                {/* Reference/Notes */}
                <div>
                    <label htmlFor="depositReference" className="block mb-1 text-sm font-medium text-gray-700">Reference / Notes (Optional)</label>
                    <textarea
                        id="depositReference"
                        value={depositReference}
                        onChange={(e) => setDepositReference(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded text-sm"
                        rows="3"
                        placeholder="Add any relevant notes or reference numbers..."
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
                        className="px-4 py-2 rounded text-white bg-blue-600 hover:bg-blue-700 text-sm font-medium"
                    >
                        Submit Deposit Request
                    </button>
                </div>
            </form>
        </div>
    );
};

export default InitiateDepositForm;
