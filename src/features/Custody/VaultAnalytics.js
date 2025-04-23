// src/features/Custody/VaultAnalytics.js
import React, { useMemo } from 'react';
// --- Import Exchange Rates ---
// Adjust path as needed based on your project structure
import { ratesToUSD } from '../Payments/data/paymentConstants';

/**
 * Displays analytics related to assets under custody, including allocation and KPIs.
 * Calculates USD value using ratesToUSD or asset.price.
 * Uses standard HTML and Tailwind CSS.
 *
 * @param {object} props - Component props.
 * @param {Array<object>} props.assets - The list of asset objects from AssetsContext.
 */
const VaultAnalytics = ({ assets = [] }) => {

    // Calculate asset allocation based on assetClass for assets under custody
    const allocationData = useMemo(() => {
        // Define categories structure correctly
        const allocation = {
            'Commodity: Precious Metal': { label: 'Precious Metals', value: 0, color: 'bg-yellow-500' },
            'Cryptocurrency': { label: 'Crypto Assets', value: 0, color: 'bg-blue-500' },
            'Stablecoin': { label: 'Stablecoins', value: 0, color: 'bg-green-500' },
            'Security': { label: 'Tokenized Securities', value: 0, color: 'bg-purple-500' },
            'CBDC': { label: 'CBDC', value: 0, color: 'bg-sky-500' }, // Added CBDC
            'Other': { label: 'Other Assets', value: 0, color: 'bg-gray-500' }
            // Add more specific categories if needed (e.g., RealEstate, Carbon Credit)
        };
        let totalValue = 0;

        if (!Array.isArray(assets)) return { categories: [], totalValue: 0 };

        assets.forEach(asset => {
            // Only include assets considered "under custody" (not External)
            if (asset.custodyType !== 'External') {
                const balance = typeof asset.balance === 'number' && !isNaN(asset.balance) ? asset.balance : 0;
                let usdValue = 0;

                // --- Value Calculation Logic ---
                const rate = ratesToUSD[asset.symbol];
                const price = typeof asset.price === 'number' && !isNaN(asset.price) ? asset.price : null;

                if (rate !== undefined) { // Use rate if available (e.g., for EUR, GHS, D-EUR, eGH)
                    usdValue = balance * rate;
                } else if (price !== null) { // Fallback to asset.price if rate not found (e.g., for BTC, ETH, XAU, T-BOND)
                    usdValue = balance * price;
                } // Otherwise usdValue remains 0 (e.g., if price is null and no rate exists)
                // --- End Value Calculation Logic ---

                if (usdValue > 0) {
                    totalValue += usdValue;
                    let categoryAssigned = false;
                    // Assign to specific categories based on assetClass
                    if (asset.assetClass === 'Commodity: Precious Metal') { allocation['Commodity: Precious Metal'].value += usdValue; categoryAssigned = true; }
                    else if (asset.assetClass === 'CryptoCurrency') { allocation['CryptoCurrency'].value += usdValue; categoryAssigned = true; }
                    else if (asset.assetClass === 'Stablecoin') { allocation['Stablecoin'].value += usdValue; categoryAssigned = true; }
                    else if (asset.assetClass?.startsWith('Security')) { allocation['Security'].value += usdValue; categoryAssigned = true; }
                    else if (asset.assetClass === 'CBDC') { allocation['CBDC'].value += usdValue; categoryAssigned = true; }
                    // Add more specific checks here if needed

                    // Assign to 'Other' if not caught by specific categories
                    if (!categoryAssigned && allocation['Other']) {
                         allocation['Other'].value += usdValue;
                    }
                }
            }
        });

        // Calculate percentages and filter out empty categories
        const categories = Object.values(allocation)
            .filter(cat => cat.value > 0) // Filter out categories with 0 value
            .map(cat => ({
                ...cat,
                percent: totalValue > 0 ? ((cat.value / totalValue) * 100) : 0
            }))
            .sort((a, b) => b.value - a.value); // Sort by value descending

        return { categories, totalValue };

    }, [assets]); // Dependency remains assets

    const handleViewDetailedAnalytics = () => {
        console.log("Navigate to Detailed Vault Analytics");
        alert("Placeholder: Navigating to detailed analytics view.");
        // TODO: Implement navigation or modal display
    };

    return (
        // Ensure root div takes full height within its grid cell
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 h-full flex flex-col">
            {/* Allocation Section */}
            {/* Added flex-grow to allow this section to expand */}
            <div className="mb-4 flex-grow">
                <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">Asset Allocation (Under Custody)</span>
                    <span className="text-sm font-medium text-gray-900">
                        {/* Format total value */}
                        Total: {allocationData.totalValue.toLocaleString(undefined, { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </span>
                </div>
                <div className="space-y-2">
                    {/* Render allocation bars - Implemented */}
                    {allocationData.categories.length > 0 ? allocationData.categories.map(cat => (
                        <div key={cat.label}>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-gray-600 truncate pr-2">{cat.label}</span> {/* Added truncate */}
                                <span className="text-gray-800 flex-shrink-0">{cat.percent.toFixed(1)}%</span> {/* Added flex-shrink-0 */}
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className={`${cat.color} h-2 rounded-full`} style={{ width: `${cat.percent}%` }}></div>
                            </div>
                        </div>
                     )) : (
                         // Implemented empty state message
                         <p className="text-xs text-gray-500 italic text-center py-4">No assets under custody to display allocation.</p>
                     )}
                </div>
            </div>

            {/* KPIs Section - Implemented */}
            <div className="grid grid-cols-2 gap-3 mb-3 flex-shrink-0"> {/* Added flex-shrink-0 */}
                <div className="bg-white p-3 rounded border border-gray-200 text-center">
                    <div className="text-xs text-gray-500 mb-1">Security Incidents (YTD)</div>
                    {/* Static placeholder */}
                    <div className="text-xl font-bold text-green-600">0</div>
                </div>
                <div className="bg-white p-3 rounded border border-gray-200 text-center">
                    <div className="text-xs text-gray-500 mb-1">Vault Utilization</div>
                    {/* Static placeholder */}
                    <div className="text-xl font-bold">78.5%</div>
                </div>
            </div>

            {/* Detailed Analytics Button - Implemented */}
            <div className="mt-auto flex-shrink-0"> {/* Added flex-shrink-0 */}
                <button
                    type="button"
                    onClick={handleViewDetailedAnalytics}
                    className="w-full px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded border border-blue-200"
                >
                    View Detailed Analytics
                </button>
            </div>
        </div>
    );
};

export default VaultAnalytics;
