// src/features/Custody/DigitalVaultsView.js
import React, { useState, useMemo } from 'react';
// --- Import Exchange Rates ---
// Adjust path as needed based on your project structure
import { ratesToUSD } from '../Payments/data/paymentConstants';

/**
 * Component for viewing and managing assets held in Digital Vaults (Hot/Warm).
 * Uses standard HTML and Tailwind CSS.
 * Calculates USD value using ratesToUSD or asset.price.
 * Includes buttons to initiate rebalancing transfers between Hot/Warm (requires approval).
 *
 * @param {object} props - Component props.
 * @param {Array<object>} props.assets - The full list of asset objects from AssetsContext.
 * @param {function} props.onBack - Function to navigate back to the dashboard.
 * @param {function} props.onSubmitTransfer - Function called when a rebalance transfer is initiated.
 */
const DigitalVaultsView = ({ assets = [], onBack, onSubmitTransfer }) => { // Added onSubmitTransfer prop

    // Filter assets to show only those designated as Hot or Warm
    const digitalAssets = useMemo(() => {
        if (!Array.isArray(assets)) return { hot: [], warm: [] };
        const hot = assets.filter(asset => asset.custodyType === 'Hot');
        const warm = assets.filter(asset => asset.custodyType === 'Warm');
        return { hot, warm };
    }, [assets]);

    // Placeholder handlers for actions specific to digital assets
    const handleRebalance = (assetId, fromTier, toTier) => {
        const asset = assets.find(a => a.id === assetId);
        if (!asset) return;

        // For demo simplicity, assume transferring the full balance
        const amount = asset.balance;
        if (amount <= 0) {
            alert(`No balance available in ${fromTier} for ${asset.symbol} to transfer.`);
            return;
        }

        console.log(`Initiating rebalance for ${assetId} (${amount} ${asset.symbol}) from ${fromTier} to ${toTier}`);

        // Call the onSubmitTransfer prop passed from CustodyDashboard
        if (onSubmitTransfer) {
             onSubmitTransfer({
                sourceAssetId: assetId,
                sourceAssetSymbol: asset.symbol,
                amount: amount, // Transfer full balance for demo
                fromTier: fromTier,
                toTier: toTier,
            });
             alert(`Placeholder: Request to transfer ${amount.toLocaleString()} ${asset.symbol} from ${fromTier} to ${toTier} submitted for approval.`);
        } else {
            console.error("onSubmitTransfer handler is missing from props.");
            alert("Error: Cannot submit transfer request.");
        }
        // Note: No form needed here as we simulate transferring the full amount
    };

    const handleViewAddresses = (assetId, tier) => {
        console.log(`Viewing addresses for ${assetId} in ${tier} storage...`);
        alert(`Placeholder: Displaying ${tier} addresses for ${assetId}.`);
        // TODO: Implement modal or view to show addresses (needs data source)
    };

     const handleManagePolicy = (assetId) => {
        console.log(`Managing security policy for ${assetId}...`);
        alert(`Placeholder: Navigating to policy management for ${assetId}.`);
        // TODO: Implement navigation or modal
    };

     // Helper for formatting numbers/quantities - Implemented
     const formatNumber = (num) => {
        if (num === null || num === undefined) return 'N/A';
        if (typeof num !== 'number' || isNaN(num)) {
           const parsed = parseFloat(num); return !isNaN(parsed) ? parsed.toLocaleString() : String(num);
        } return num.toLocaleString();
     };

      // Helper for formatting value using rates or price - Implemented
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


    // Helper function to render asset table for a given tier (Hot or Warm)
    const renderAssetTable = (title, assetList, tier) => (
        <div className="mb-6">
            <h3 className="text-md font-semibold mb-2 text-gray-700">{title} ({assetList.length})</h3>
            <div className="border rounded shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset</th>
                            <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Symbol</th>
                            <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                            <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Approx. Value (USD)</th>
                            <th scope="col" className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {assetList.length > 0 ? (
                            assetList.map((asset) => (
                                <tr key={asset.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{asset.label}</td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">{asset.symbol}</td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">{formatNumber(asset.balance)}</td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">
                                        {formatValue(asset)}
                                    </td>
                                    <td className="px-4 py-2 whitespace-nowrap text-center text-sm space-x-1">
                                        <button type="button" onClick={() => handleViewAddresses(asset.id, tier)} className="px-2 py-1 rounded border border-gray-300 hover:bg-gray-100 text-xs font-medium text-gray-700">Addresses</button>
                                        <button type="button" onClick={() => handleManagePolicy(asset.id)} className="px-2 py-1 rounded border border-gray-300 hover:bg-gray-100 text-xs font-medium text-gray-700">Policy</button>
                                        {/* Add Rebalance button conditionally */}
                                        {tier === 'Hot' && <button type="button" onClick={() => handleRebalance(asset.id, 'Hot', 'Warm')} className="px-2 py-1 rounded border border-blue-300 hover:bg-blue-50 text-xs font-medium text-blue-700">To Warm</button>}
                                        {tier === 'Warm' && <button type="button" onClick={() => handleRebalance(asset.id, 'Warm', 'Hot')} className="px-2 py-1 rounded border border-orange-300 hover:bg-orange-50 text-xs font-medium text-orange-700">To Hot</button>}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            // Corrected empty state JSX
                             <tr>
                                <td colSpan="5" className="px-4 py-4 text-center text-sm text-gray-500 italic">
                                    No assets currently in {title}.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );


    return (
        <div className="bg-white p-6 rounded shadow">
            {/* Header */}
            <div className="flex justify-between items-center mb-6 border-b pb-3">
                <h1 className="text-2xl font-bold text-gray-800">Digital Vault Management (Hot & Warm)</h1>
                <button
                    type="button"
                    className="px-3 py-1 rounded text-white hover:opacity-90 bg-gray-800 text-sm"
                    onClick={onBack}
                >
                    &larr; Back to Custody Dashboard
                </button>
            </div>

            {/* Hot Wallet Assets Table */}
            {renderAssetTable('Hot Wallet Assets', digitalAssets.hot, 'Hot')}

             {/* Warm Wallet Assets Table */}
             {renderAssetTable('Warm Wallet Assets', digitalAssets.warm, 'Warm')}

            {/* Add other sections if needed, e.g., overall digital vault settings */}

        </div>
    );
};

export default DigitalVaultsView;
