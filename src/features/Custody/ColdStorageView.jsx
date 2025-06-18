// src/features/Custody/ColdStorageView.js
import React, { useState, useMemo } from 'react';
// --- Import Exchange Rates ---
// Adjust path as needed based on your project structure
import { ratesToUSD } from '../Payments/data/paymentConstants.js';

/**
 * Component for viewing and managing assets held in Cold Storage.
 * Uses standard HTML and Tailwind CSS.
 * Calculates USD value using ratesToUSD or asset.price.
 * Includes a form to initiate transfers out of cold storage (requires approval).
 *
 * @param {object} props - Component props.
 * @param {Array<object>} props.assets - The full list of asset objects from AssetsContext.
 * @param {function} props.onBack - Function to navigate back to the dashboard.
 * @param {function} props.onSubmitTransfer - Function called when transfer out form is submitted.
 */
const ColdStorageView = ({ assets = [], onBack, onSubmitTransfer }) => { // Added onSubmitTransfer prop

    // Filter assets to show only those designated as 'Cold'
    const coldStorageAssets = useMemo(() => {
        if (!Array.isArray(assets)) return [];
        return assets.filter(asset => asset.custodyType === 'Cold');
    }, [assets]);

    // State for transfer form
    const [showTransferForm, setShowTransferForm] = useState(false);
    const [transferAssetId, setTransferAssetId] = useState('');
    const [transferAmount, setTransferAmount] = useState('');
    const [transferDestination, setTransferDestination] = useState('Warm'); // Default destination

    // Get selected asset details for validation/display in form
    const selectedTransferAsset = useMemo(() => {
        return assets.find(a => a.id === transferAssetId);
    }, [transferAssetId, assets]);


    // Handler for submitting the transfer out request
    const handleInitiateTransfer = (event) => {
        event.preventDefault();
        const amount = parseFloat(transferAmount);

        if (!transferAssetId) {
            alert('Please select the asset to transfer.');
            return;
        }
        if (isNaN(amount) || amount <= 0) {
            alert('Please enter a valid positive amount to transfer.');
            return;
        }
        // Basic balance check
        if (selectedTransferAsset && amount > selectedTransferAsset.balance) {
             alert(`Transfer amount (${amount.toLocaleString()}) exceeds available cold storage balance (${selectedTransferAsset.balance.toLocaleString()}).`);
             return;
        }

        // Call the onSubmitTransfer prop passed from CustodyDashboard
        if (onSubmitTransfer) {
            onSubmitTransfer({
                sourceAssetId: transferAssetId,
                sourceAssetSymbol: selectedTransferAsset?.symbol || 'N/A',
                amount,
                fromTier: 'Cold',
                toTier: transferDestination,
            });
        } else {
            console.error("onSubmitTransfer handler is missing from props.");
            alert("Error: Cannot submit transfer request.");
        }

        // Reset form and close
        setShowTransferForm(false);
        setTransferAssetId('');
        setTransferAmount('');
        setTransferDestination('Warm');
    };

    // Placeholder handlers for other actions
    const handleViewAddresses = () => {
        console.log("Viewing Cold Storage Addresses...");
        alert("Placeholder: Displaying associated cold storage addresses.");
        // TODO: Implement modal or view to show addresses (needs data source)
    };

    const handleManageProtocol = () => {
        console.log("Managing Access Protocol...");
        alert("Placeholder: Navigating to access protocol management (e.g., M-of-N Quorum details).");
        // TODO: Implement navigation or modal
    };

    // Helper for formatting numbers/quantities
    const formatNumber = (num) => {
        if (num === null || num === undefined) return 'N/A';
        if (typeof num !== 'number' || isNaN(num)) {
           const parsed = parseFloat(num); return !isNaN(parsed) ? parsed.toLocaleString() : String(num);
        } return num.toLocaleString();
     };

    // Helper for formatting value using rates or price
    const formatValue = (asset) => {
        if (!asset) return 'N/A';
        const balance = typeof asset.balance === 'number' && !isNaN(asset.balance) ? asset.balance : 0;
        let usdValue = null;

        const rate = ratesToUSD[asset.symbol];
        const price = typeof asset.price === 'number' && !isNaN(asset.price) ? asset.price : null;

        if (rate !== undefined) {
            usdValue = balance * rate;
        } else if (price !== null) {
            usdValue = balance * price;
        }

        if (usdValue === null) return 'N/A';
        // Format as currency
        return usdValue.toLocaleString(undefined, { style: 'currency', currency: 'USD' });
     };


    return (
        <div className="bg-white p-6 rounded shadow">
            {/* Header */}
            <div className="flex justify-between items-center mb-6 border-b pb-3">
                <h1 className="text-2xl font-bold text-gray-800">Cold Storage Management</h1>
                <button
                    type="button"
                    className="px-3 py-1 rounded text-white hover:opacity-90 bg-gray-800 text-sm"
                    onClick={onBack}
                >
                    &larr; Back to Custody Dashboard
                </button>
            </div>

            {/* Cold Storage Asset Table */}
            <div className="mb-8">
                <h2 className="text-lg font-semibold mb-3 text-gray-700">Assets in Cold Storage</h2>
                <div className="border rounded shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Symbol</th>
                                <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                                <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Approx. Value (USD)</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {coldStorageAssets.length > 0 ? (
                                coldStorageAssets.map((asset) => (
                                    <tr key={asset.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{asset.label}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{asset.symbol}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800 text-right">{formatNumber(asset.balance)}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800 text-right">
                                            {formatValue(asset)}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                // Corrected empty state JSX
                                <tr>
                                    <td colSpan="4" className="px-4 py-4 text-center text-sm text-gray-500 italic">
                                        No assets currently designated as Cold Storage.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Cold Storage Actions */}
            <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                 <button
                    type="button"
                    onClick={() => { setShowTransferForm(true); setTransferAssetId(''); setTransferAmount(''); }} // Reset form state on open
                    className="w-full px-4 py-2 rounded border border-orange-300 bg-orange-50 hover:bg-orange-100 text-sm font-medium text-orange-700"
                 >
                    Initiate Transfer Out
                 </button>
                 <button
                    type="button"
                    onClick={handleViewAddresses}
                    className="w-full px-4 py-2 rounded border border-gray-300 hover:bg-gray-50 text-sm font-medium text-gray-700"
                 >
                    View Cold Addresses
                 </button>
                 <button
                    type="button"
                    onClick={handleManageProtocol}
                    className="w-full px-4 py-2 rounded border border-gray-300 hover:bg-gray-50 text-sm font-medium text-gray-700"
                 >
                    Manage Access Protocol
                 </button>
            </div>

             {/* Transfer Out Form (Conditional) */}
             {showTransferForm && (
                <div className="mt-6 p-4 border rounded bg-gray-50">
                    <h3 className="text-md font-semibold mb-3 text-gray-700">Initiate Transfer from Cold Storage</h3>
                    <form onSubmit={handleInitiateTransfer} className="space-y-3">
                        <div>
                            <label htmlFor="transferAsset" className="block text-sm font-medium text-gray-700 mb-1">Asset to Transfer <span className="text-red-600">*</span></label>
                            <select
                                id="transferAsset"
                                value={transferAssetId}
                                onChange={(e) => setTransferAssetId(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded bg-white text-sm"
                                required
                            >
                                <option value="" disabled>-- Select Asset --</option>
                                {coldStorageAssets.map(asset => (
                                    <option key={asset.id} value={asset.id}>
                                        {asset.label} ({asset.symbol}) - Bal: {formatNumber(asset.balance)}
                                    </option>
                                ))}
                                {coldStorageAssets.length === 0 && <option disabled>No assets in cold storage</option>}
                            </select>
                        </div>
                        <div>
                             <label htmlFor="transferAmount" className="block text-sm font-medium text-gray-700 mb-1">Amount <span className="text-red-600">*</span></label>
                             <input
                                id="transferAmount"
                                type="number"
                                value={transferAmount}
                                onChange={(e) => setTransferAmount(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded text-sm"
                                placeholder="Amount to transfer"
                                min="0"
                                step="any"
                                required
                             />
                             {selectedTransferAsset && (
                                <p className="text-xs text-gray-500 mt-1">Available: {selectedTransferAsset.balance?.toLocaleString() ?? 'N/A'} {selectedTransferAsset.symbol}</p>
                             )}
                        </div>
                        <div>
                             <label htmlFor="transferDestination" className="block text-sm font-medium text-gray-700 mb-1">Destination Tier <span className="text-red-600">*</span></label>
                             <select
                                id="transferDestination"
                                value={transferDestination}
                                onChange={(e) => setTransferDestination(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded bg-white text-sm"
                                required
                             >
                                <option value="Warm">Warm Wallet</option>
                                <option value="Hot">Hot Wallet</option>
                                {/* Add other internal destinations if applicable */}
                             </select>
                             <p className="text-xs text-gray-500 mt-1">Select the internal tier to move funds to (Requires Approval).</p>
                        </div>
                        <div className="flex justify-end space-x-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setShowTransferForm(false)}
                                className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-100 text-sm font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 rounded text-white bg-blue-600 hover:bg-blue-700 text-sm font-medium"
                            >
                                Request Transfer Approval
                            </button>
                        </div>
                    </form>
                </div>
             )}

        </div>
    );
};

export default ColdStorageView;
