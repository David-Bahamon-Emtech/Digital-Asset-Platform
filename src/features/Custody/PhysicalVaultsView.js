// src/features/Custody/PhysicalVaultsView.js
import React, { useState, useMemo } from 'react';
// --- Import Exchange Rates ---
// Adjust path as needed based on your project structure
import { ratesToUSD } from '../Payments/data/paymentConstants';

/**
 * Component for viewing and managing assets held in Physical Vaults.
 * Uses standard HTML and Tailwind CSS.
 * Calculates USD value using ratesToUSD or asset.price.
 * Allows initiating audit requests via a callback prop.
 *
 * @param {object} props - Component props.
 * @param {Array<object>} props.assets - The full list of asset objects from AssetsContext.
 * @param {function} props.onBack - Function to navigate back to the dashboard.
 * @param {function} props.onAuditRequest - Function called when an audit is requested for an asset.
 */
const PhysicalVaultsView = ({ assets = [], onBack, onAuditRequest }) => {

    // Filter assets to show only those designated as Physical or in PhysicalVault
    const physicalAssets = useMemo(() => {
        if (!Array.isArray(assets)) return [];
        return assets.filter(asset =>
            asset.physicality === 'Physical' || asset.custodyType === 'PhysicalVault'
        );
    }, [assets]);

    // Placeholder handlers for actions specific to physical assets
    const handleViewLocationDetails = (assetId) => {
        const asset = assets.find(a => a.id === assetId);
        console.log(`Viewing location details for physical asset: ${asset?.label || assetId}`);
        alert(`Placeholder: Showing location/storage details for asset ${asset?.label || assetId}.`);
        // TODO: Implement modal or detail view for physical location info (e.g., vault address, security protocols)
    };

    // Calls the handler passed from the parent dashboard
    const handleInitiateAuditRequest = (assetId) => {
        const asset = assets.find(a => a.id === assetId);
        if (!asset) return;

        console.log(`Initiating physical audit request for asset: ${assetId}`);
        if (onAuditRequest) {
            onAuditRequest({
                assetId: asset.id,
                assetLabel: asset.label,
                assetSymbol: asset.symbol,
                // Add any other relevant details needed for logging
            });
            // Alert moved to the handler in CustodyDashboard for consistency
        } else {
            console.error("onAuditRequest handler is missing from props.");
            alert("Error: Cannot submit audit request.");
        }
        // No navigation change here, the dashboard handles the logging
    };

     // Helper for formatting numbers/quantities - Implemented
     const formatQuantity = (num, symbol) => {
        if (num === null || num === undefined) return 'N/A';
        let options = {};
        // Example: Add specific formatting for weight if symbol indicates it
        if (symbol === 'XAU' || symbol === 'XAG' || symbol === 'XPT' || symbol === 'XPD') {
             // Assuming balance is in standard units like kg or oz, display as is for now
             // Could add unit detection later if needed
             return `${num.toLocaleString()} ${symbol}`; // e.g., "1,000 XAU"
        }
        if (typeof num !== 'number' || isNaN(num)) {
           const parsed = parseFloat(num); return !isNaN(parsed) ? parsed.toLocaleString() : String(num);
        }
        return `${num.toLocaleString()} ${symbol || ''}`;
     };

     // Helper for formatting value using rates or price - Implemented
     const formatValue = (asset) => {
        if (!asset) return 'N/A';
        const balance = typeof asset.balance === 'number' && !isNaN(asset.balance) ? asset.balance : 0;
        let usdValue = null;

        // Physical assets might use symbol like XAU, XAG, or specific identifiers
        // Use asset.price directly if available (e.g., price per kg/oz/unit)
        const price = typeof asset.price === 'number' && !isNaN(asset.price) ? asset.price : null;
        // Use rate as fallback if symbol matches (less likely for physical but possible)
        const rate = ratesToUSD[asset.symbol];

        if (price !== null) { // Prioritize direct price for physical goods
            usdValue = balance * price;
        } else if (rate !== undefined) { // Fallback to rate
            usdValue = balance * rate;
        }

        if (usdValue === null) return 'N/A';
        // Format as currency
        return usdValue.toLocaleString(undefined, { style: 'currency', currency: 'USD' });
     };


    return (
        <div className="bg-white p-6 rounded shadow">
            {/* Header */}
            <div className="flex justify-between items-center mb-6 border-b pb-3">
                <h1 className="text-2xl font-bold text-gray-800">Physical Vault Management</h1>
                <button
                    type="button"
                    className="px-3 py-1 rounded text-white hover:opacity-90 bg-gray-800 text-sm"
                    onClick={onBack}
                >
                    &larr; Back to Custody Dashboard
                </button>
            </div>

            {/* Physical Asset Table */}
            <div className="mb-8">
                <h2 className="text-lg font-semibold mb-3 text-gray-700">Assets in Physical Vaults</h2>
                <div className="border rounded shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Symbol</th>
                                <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                                <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Approx. Value (USD)</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location/Vault ID</th>
                                <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {physicalAssets.length > 0 ? (
                                physicalAssets.map((asset) => (
                                    <tr key={asset.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{asset.label}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{asset.symbol}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800 text-right">{formatQuantity(asset.balance, asset.symbol)}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800 text-right">
                                            {formatValue(asset)}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                            {/* Placeholder - Needs actual location data from asset object if available */}
                                            {asset.custodyType === 'PhysicalVault' ? 'Managed Vault' : 'Physical Asset'}
                                            {/* Example: Could show asset.locationId if that field existed */}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-center text-sm space-x-2">
                                            <button
                                                type="button"
                                                onClick={() => handleViewLocationDetails(asset.id)}
                                                className="px-2 py-1 rounded border border-gray-300 hover:bg-gray-100 text-xs font-medium text-gray-700"
                                            >
                                                Details
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleInitiateAuditRequest(asset.id)}
                                                className="px-2 py-1 rounded border border-gray-300 hover:bg-gray-100 text-xs font-medium text-gray-700"
                                            >
                                                Request Audit
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                // Corrected empty state JSX
                                <tr>
                                    <td colSpan="6" className="px-4 py-4 text-center text-sm text-gray-500 italic">
                                        No assets currently designated as Physical or in Physical Vaults.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add other sections if needed, e.g., managing physical locations, deposit/withdrawal workflows for physical assets */}

        </div>
    );
};

export default PhysicalVaultsView;
