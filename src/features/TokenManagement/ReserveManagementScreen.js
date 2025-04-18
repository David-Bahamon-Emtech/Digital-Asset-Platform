import React, { useState, useEffect, useMemo } from 'react';
import { useAssets } from '../../context/AssetsContext'; // Import useAssets hook
import { useTokenHistory } from '../../context/TokenHistoryContext'; // Import useTokenHistory hook
// *** ADDED: Import formatNumber helper ***
import { formatNumber } from '../../utils/displayUtils';

// Placeholder for current user - replace with actual user context later
const currentUserInitials = 'RM'; // Example Reserve Manager initials
const approverInitials = 'SA'; // Example System/Auditor initials

// Default alert thresholds - can be customized per asset type if needed
const defaultAlertThreshold = 100; // Default to 100% requirement

// *** UPDATED: Define allowed IDs for the NEW assets on this screen ***
const allowedPredefinedTokenIds = [
    'cp-acme-01',
    'mmf-usd-01',
    'xagc-01',
    'oil-wti-01',
    'cc-verra-01',
];

// *** UPDATED: Detailed Dummy Reserve Data for the NEW assets ***
// This data is specific to this component for demo purposes.
const detailedDummyReserveData = {
  'cp-acme-01': {
    circulationChange: 500000 + Math.floor(Math.random() * 100000 - 50000), // Example change
    ratio: 100.0, // Should be fully backed
    requirement: 100, // Requirement is 100%
    lastAudit: `2025-04-01`, // Example audit date
    auditor: 'KPMG (Asset Verification)',
    composition: [
        { name: 'Underlying Commercial Paper Notes (Acme Corp)', percent: 100.0 }
    ],
    accounts: [
        { institution: 'Bank of New York Mellon', type: 'Custodial Account (CP Notes)', balance: '50,000,000 USD Face Value', updated: 'Yesterday', status: 'Active' },
        { institution: 'Acme Corp Issuing SPV', type: 'Issuance Vehicle Ledger', balance: '50,000,000 ACP Tokens', updated: 'Real-time', status: 'Active' },
        { institution: 'Computershare (Paying Agent)', type: 'Paying Agent Account', balance: 'Variable (Cash for Maturity)', updated: 'Daily', status: 'Active' },
        { institution: 'PolygonScan (Auditor View)', type: 'On-Chain Supply', balance: '45,000,000 ACP', updated: 'Real-time', status: 'Verified' },
        { institution: 'Internal Control Ledger', type: 'Reconciliation Account', balance: 'Match Verified', updated: 'Today', status: 'Active' },
        { institution: 'Legal Docs Depository', type: 'Note Agreements', balance: 'Filed', updated: 'Origination Date', status: 'Active' }, // 6th account
    ]
  },
  'mmf-usd-01': {
    circulationChange: 1200000 + Math.floor(Math.random() * 200000 - 100000),
    ratio: 100.0, // Should track NAV closely, aiming for 1:1
    requirement: 100,
    lastAudit: `2025-04-15`, // Example NAV report date
    auditor: 'Stable Investments Fund Admin',
    composition: [
        { name: 'Shares in Underlying MMF (e.g., Fidelity Govt MMF)', percent: 100.0 }
    ],
    accounts: [
        { institution: 'Fidelity Investments', type: 'Underlying MMF Holding', balance: '250,000,000 Shares', updated: 'Today (T+1 NAV)', status: 'Active' },
        { institution: 'Coinbase Custody', type: 'Token Custody', balance: '250,000,000 MMFUSD', updated: 'Real-time', status: 'Active' },
        { institution: 'Stable Investments LLC', type: 'Operational Account', balance: '50,000 USDC', updated: 'Today', status: 'Active' },
        { institution: 'Etherscan (Auditor View)', type: 'On-Chain Supply', balance: '240,500,000 MMFUSD', updated: 'Real-time', status: 'Verified' },
        { institution: 'NAV Calculation Agent', type: 'Valuation Feed', balance: '$1.0000 per Share', updated: 'Today', status: 'Active' },
        { institution: 'Redemption Queue', type: 'Order Book', balance: '~500k MMFUSD', updated: 'Hourly', status: 'Active' }, // 6th account
    ]
  },
  'xagc-01': {
    circulationChange: -50000 + Math.floor(Math.random() * 10000 - 5000),
    ratio: 100.0, // 1 token = 1 unit of silver
    requirement: 100,
    lastAudit: `2025-03-10`, // Example vault audit
    auditor: 'Brink\'s Global Services',
    composition: [ { name: 'Physical Silver Bullion (LBMA Good Delivery)', percent: 100.0 } ],
    accounts: [
        { institution: 'Brink\'s Zurich Vault', type: 'Allocated Silver Storage', balance: '27,322.5 Kg (Approx)', updated: 'Last Audit', status: 'Verified' }, // Approx 850k oz @ 30.5/oz
        { institution: 'Precious Metals Inc.', type: 'Inventory Ledger', balance: '1,000,000 XAGC Units', updated: 'Real-time', status: 'Active' },
        { institution: 'StellarExpert (Auditor View)', type: 'On-Chain Supply', balance: '850,000 XAGC', updated: 'Real-time', status: 'Verified' },
        { institution: 'Insurance Provider (Lloyds)', type: 'Policy Record', balance: 'Coverage Verified', updated: 'Quarterly', status: 'Active' },
        { institution: 'Minting Control Address', type: 'Issuance Wallet', balance: '150,000 XAGC', updated: 'Real-time', status: 'Secure' },
        { institution: 'Refining Partner', type: 'Source Verification', balance: 'Certified', updated: 'Batch Date', status: 'Active' }, // 6th account
    ]
  },
  'oil-wti-01': {
    circulationChange: 20000 + Math.floor(Math.random() * 5000 - 2500),
    ratio: 100.0, // 1 token = 1 barrel
    requirement: 100,
    lastAudit: `2025-04-05`, // Example storage verification
    auditor: 'SGS Group',
    composition: [ { name: 'WTI Crude Oil (Physical Barrels)', percent: 100.0 } ],
    accounts: [
        { institution: 'Enterprise Products Partners (Cushing Storage)', type: 'Allocated Storage', balance: '500,000 Barrels', updated: 'Weekly Report', status: 'Verified' },
        { institution: 'Energy Tokens Ltd.', type: 'Token Ledger', balance: '500,000 WTOIL', updated: 'Real-time', status: 'Active' },
        { institution: 'PolygonScan (Auditor View)', type: 'On-Chain Supply', balance: '480,000 WTOIL', updated: 'Real-time', status: 'Verified' },
        { institution: 'NYMEX/CME Group', type: 'Futures Hedging Account', balance: 'Variable', updated: 'Daily', status: 'Active' },
        { institution: 'Logistics Partner (Pipeline Co.)', type: 'Transport Records', balance: 'In Transit: 0 bbl', updated: 'Daily', status: 'Active' },
        { institution: 'Environmental Compliance Cert.', type: 'Permit Record', balance: 'Valid', updated: 'Annually', status: 'Active' }, // 6th account
    ]
  },
  'cc-verra-01': {
    circulationChange: -100000 + Math.floor(Math.random() * 20000 - 10000),
    ratio: 100.0, // 1 token = 1 credit on registry
    requirement: 100,
    lastAudit: `2025-01-20`, // Example registry sync
    auditor: 'Verra Registry API / Internal Audit',
    composition: [ { name: 'Verified Carbon Units (VCUs) on Verra Registry', percent: 100.0 } ],
    accounts: [
        { institution: 'Verra Registry', type: 'Master Holding Account', balance: '10,000,000 VCUs', updated: 'Daily Sync', status: 'Active' },
        { institution: 'Green Future Tokens', type: 'Token Issuance Ledger', balance: '10,000,000 VCC', updated: 'Real-time', status: 'Active' },
        { institution: 'Hedera Hashgraph (Auditor View)', type: 'On-Chain Supply', balance: '9,500,000 VCC', updated: 'Real-time', status: 'Verified' },
        { institution: 'Retirement Wallet', type: 'Burned/Retired Credits', balance: '500,000 VCC', updated: 'As Retired', status: 'Retired' },
        { institution: 'Project Developer Source', type: 'Origination Verification', balance: 'Verified Projects', updated: 'Project Date', status: 'Active' },
        { institution: 'Marketplace Listing', type: 'Available for Sale', balance: '~1M VCC', updated: 'Hourly', status: 'Active' }, // 6th account
    ]
  }
};
// --- End Dummy Reserve Data ---

// Helper Function triggers a browser download for CSV content.
const downloadCSV = (csvContent, filename) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};

const ReserveManagementScreen = ({ assetLogosMap = {}, onBack }) => {
  const { assets } = useAssets();
  const { dispatchTokenHistory } = useTokenHistory();

  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [alertThresholds, setAlertThresholds] = useState({});
  const [currentThresholdInput, setCurrentThresholdInput] = useState('');
  const [showAllAccountsModal, setShowAllAccountsModal] = useState(false);

  // Filter assets: include allowed predefined IDs OR wizard-issued backed assets
  const displayableTokenAssets = useMemo(() => {
    if (!Array.isArray(assets)) return [];
    return assets.filter(asset =>
        // Include if ID is in the new allowed list
        allowedPredefinedTokenIds.includes(asset.id) ||
        // OR if it's wizard issued AND marked as backed
        (asset.isWizardIssued && asset.wizardData?.reserveDetails?.isBackedAsset)
    );
  }, [assets]); // Dependency is just assets

  // Effect to select the first available asset if none is selected or current selection disappears
  useEffect(() => {
    if (displayableTokenAssets.length > 0) {
        // If no asset is selected OR the currently selected asset is no longer in the displayable list...
        if (!selectedAssetId || !displayableTokenAssets.some(a => a.id === selectedAssetId)) {
            // ...select the first asset in the new displayable list.
            setSelectedAssetId(displayableTokenAssets[0].id);
        }
    } else {
         // If there are no displayable assets, clear the selection
         setSelectedAssetId('');
    }
    // Depend on the filtered list and the current selection
  }, [displayableTokenAssets, selectedAssetId]);

  // Effect to initialize alert thresholds for newly available assets
  useEffect(() => {
    // Only run if assets are loaded
    if (assets && assets.length > 0) {
        setAlertThresholds(prevThresholds => {
            const newThresholds = { ...prevThresholds };
            // Iterate over the assets that are currently displayable on this screen
            displayableTokenAssets.forEach(asset => {
                // If an asset doesn't have a threshold set yet...
                if (!(asset.id in newThresholds)) {
                    // ...set a default based on its class (or a general default)
                    let defaultT = defaultAlertThreshold; // General default
                    // Specific defaults for asset classes likely requiring 100% backing
                    if (['Stablecoin', 'CBDC', 'Security-MMF', 'Commodity-PreciousMetal', 'Commodity-Energy', 'CarbonCredit', 'Security-CP'].includes(asset.assetClass)) {
                         defaultT = 100;
                    } else if (asset.isWizardIssued && asset.wizardData?.reserveDetails?.isBackedAsset) {
                         defaultT = 100; // Assume wizard backed assets target 100%
                    } else {
                         defaultT = 0; // Default to 0 for others (e.g., generic crypto)
                    }
                    newThresholds[asset.id] = defaultT;
                }
            });
            return newThresholds;
        });
    }
    // Depend on assets and the displayable list derived from it
  }, [assets, displayableTokenAssets]);

  // Get the full asset object for the selected ID
  const selectedAsset = useMemo(() => {
    if (!selectedAssetId || !Array.isArray(assets)) return null;
    return assets.find(a => a.id === selectedAssetId);
  }, [selectedAssetId, assets]);

  // --- Get Reserve Info from Dummy Data or create fallback ---
  const reserveInfoToDisplay = useMemo(() => {
      if (!selectedAsset) return null;
      // Try to get data from the updated dummy data object
      const dummyData = detailedDummyReserveData[selectedAsset.id];
      if (dummyData) {
          // Ensure composition percentages sum to 100 (simple normalization)
          let totalPercent = dummyData.composition.reduce((sum, item) => sum + item.percent, 0);
          let adjustedComposition = dummyData.composition;
          if (totalPercent > 0 && Math.abs(totalPercent - 100) > 0.1) { // Avoid division by zero
              adjustedComposition = dummyData.composition.map(item => ({...item, percent: (item.percent / totalPercent) * 100 }));
          }
          // Return dummy data merged with live circulation from asset context
          return {
              ...dummyData,
              circulation: selectedAsset.balance, // Use live balance for circulation
              composition: adjustedComposition,
              accounts: Array.isArray(dummyData.accounts) ? dummyData.accounts : [], // Ensure accounts is an array
          };
      } else if (selectedAsset.isWizardIssued) {
           // Fallback logic for wizard-issued assets remains the same
           const isBacked = selectedAsset.wizardData?.reserveDetails?.isBackedAsset || false;
           let backingType = isBacked ? (selectedAsset.wizardData?.reserveDetails?.backingType || 'Unknown') : 'N/A';
           let fallbackRatio = 'N/A';
           if (isBacked) {
              // Attempt to calculate ratio if total supply is known
              fallbackRatio = (selectedAsset.totalSupplyIssued && selectedAsset.totalSupplyIssued > 0)
                                ? `${((selectedAsset.balance / selectedAsset.totalSupplyIssued) * 100).toFixed(1)}% (Implied)`
                                : '100% (Assumed)';
           }
          return {
              circulation: selectedAsset.balance,
              circulationChange: 0, // No historical dummy data for wizard assets
              ratio: fallbackRatio,
              requirement: isBacked ? 100 : 0,
              lastAudit: 'N/A (User Issued)',
              auditor: 'Self-Attested',
              composition: isBacked ? [{ name: `User Defined Backing (${backingType})`, percent: 100.0 }] : [{ name: 'Not Asset Backed', percent: 100.0 }],
              accounts: [
                  { institution: 'On-Chain Ledger', type: 'Token Circulation', balance: `${selectedAsset.balance.toLocaleString()} ${selectedAsset.symbol}`, updated: 'Real-time', status: 'Active' },
                  ...(isBacked ? [{ institution: 'Backing Mechanism', type: backingType, balance: 'See Issuance Config', updated: 'N/A', status: 'Configured' }] : [])
              ],
            };
      }
      // Fallback if asset is somehow not in dummy data and not wizard issued (shouldn't happen with current filters)
      return {
            circulation: selectedAsset.balance, circulationChange: 0, ratio: 'N/A', requirement: 0,
            lastAudit: 'N/A', auditor: 'N/A', composition: [], accounts: []
      };
  }, [selectedAsset]); // Dependency is only the selected asset object

  // Get the currently configured alert threshold for the selected asset
  const currentThreshold = selectedAssetId ? (alertThresholds[selectedAssetId] ?? defaultAlertThreshold) : defaultAlertThreshold;

  // Effect to update the input field when the modal opens
  useEffect(() => {
    if (isAlertModalOpen && selectedAssetId) {
      setCurrentThresholdInput(String(currentThreshold));
    }
   }, [isAlertModalOpen, selectedAssetId, currentThreshold]);

  // --- Action Handlers ---
  const handleGenerateReport = () => { alert('Placeholder: Generate Attestation Report'); }; // Placeholder
  const handleViewHistory = () => { alert('Placeholder: View Historical Reports'); }; // Placeholder
  const handleOpenAlertModal = () => { if (selectedAsset) setIsAlertModalOpen(true); };

  // Save the new alert threshold
  const handleSaveThreshold = () => {
     if (!selectedAsset) return;
     const newThreshold = parseFloat(currentThresholdInput);
     if (!isNaN(newThreshold) && newThreshold >= 0 && newThreshold <= 200) { // Allow up to 200% for flexibility
       setAlertThresholds(prev => ({ ...prev, [selectedAssetId]: newThreshold }));
       try {
           // Log the change to token history
           const historyEntry = {
               id: Date.now() + Math.random(),
               timestamp: new Date(),
               actionType: 'Reserve Alert',
               details: `Alert threshold for ${selectedAsset.symbol} set to ${newThreshold}%`,
               user: currentUserInitials,
               approver: approverInitials, // Or maybe 'System'
               notes: `Threshold updated via Reserve Management Screen.`
            };
           dispatchTokenHistory({ type: 'ADD_TOKEN_HISTORY', payload: historyEntry });
           console.log("Dispatched Reserve Alert history:", historyEntry);
       } catch (error) { console.error("Error dispatching token history for alert change:", error); }
       setIsAlertModalOpen(false);
       alert(`Alert threshold for ${selectedAsset.label} set to ${newThreshold}%`);
     } else { alert("Please enter a valid percentage between 0 and 200."); }
   };


  // --- Render Logic ---
  return (
    <div className="p-8">
      <div className="bg-white p-6 rounded shadow max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 border-b pb-3">
           <h1 className="text-2xl font-bold text-gray-800">Reserve Management</h1>
           <button type="button" className="px-3 py-1 rounded text-white hover:opacity-90 bg-gray-800 text-sm" onClick={onBack}> Back to Dashboard </button>
         </div>

        {/* Token Selection Tabs - Uses updated displayableTokenAssets */}
        <div className="mb-6">
           <label className="block mb-2 font-medium text-gray-700">Select Token Type</label>
           <div className="flex space-x-2 border-b border-gray-200 overflow-x-auto pb-2">
             {displayableTokenAssets.map(asset => (
               <button
                 key={asset.id}
                 onClick={() => setSelectedAssetId(asset.id)}
                 className={`flex-shrink-0 flex items-center px-4 py-2 text-sm font-medium rounded-t-md focus:outline-none transition-colors duration-150 ease-in-out ${
                   selectedAssetId === asset.id
                     ? 'border-b-2 border-yellow-600 text-yellow-700 bg-yellow-50'
                     : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                 }`}
               >
                 {/* Use specific logo or generic wizard logo */}
                 {asset.isWizardIssued ? (
                     <img src="/logos/generic-token.png" alt="User-issued token" className="h-4 w-4 mr-2"/>
                 ) : (
                     (assetLogosMap[asset.id] || assetLogosMap[asset.symbol]) && (
                         <img
                            src={assetLogosMap[asset.id] || assetLogosMap[asset.symbol]}
                            alt={`${asset.label} logo`}
                            className="h-4 w-4 mr-2"
                            onError={(e) => { e.target.style.display = 'none'; }}
                         />
                     )
                 )}
                 {asset.label} ({asset.symbol})
               </button>
             ))}
             {/* Message if no assets are available */}
             {displayableTokenAssets.length === 0 && (
               <p className="text-sm text-gray-500 italic pl-4 py-2">
                 {Array.isArray(assets) ? 'No reservable token assets found.' : 'Loading assets...'}
               </p>
             )}
           </div>
         </div>

        {/* Reserve Details Display Area */}
        {!selectedAsset || !reserveInfoToDisplay ? (
             <div className="text-center py-10 text-gray-500">
                 {!selectedAssetId ? "Select a token above to view reserve details." : "Loading reserve data..."}
             </div>
         ) : (
          <div className="space-y-8">
            {/* Top Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              {/* Circulation */}
              <div className="bg-gray-50 p-4 rounded shadow">
                 <h3 className="text-sm font-medium text-gray-500 mb-1">Total Tokens in Circulation</h3>
                 {/* *** Use formatNumber (now imported) *** */}
                 <p className="text-2xl font-semibold text-gray-900">{formatNumber(selectedAsset.balance)}</p>
                 {reserveInfoToDisplay.circulationChange !== 0 && typeof reserveInfoToDisplay.circulationChange === 'number' && (
                   <p className={`text-xs ${reserveInfoToDisplay.circulationChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                     {/* *** Use formatNumber (now imported) *** */}
                     {reserveInfoToDisplay.circulationChange > 0 ? '+' : ''}{formatNumber(reserveInfoToDisplay.circulationChange)} this month
                   </p>
                 )}
              </div>
              {/* Reserve Ratio */}
              <div className="bg-gray-50 p-4 rounded shadow relative">
                 <h3 className="text-sm font-medium text-gray-500 mb-1">Reserve Ratio</h3>
                 <p className="text-2xl font-semibold text-gray-900">
                   {/* Display formatted ratio */}
                   {typeof reserveInfoToDisplay.ratio === 'number' ? `${reserveInfoToDisplay.ratio.toFixed(1)}%` : reserveInfoToDisplay.ratio}
                 </p>
                 {/* Display status vs requirement */}
                 {typeof reserveInfoToDisplay.ratio === 'number' && typeof currentThreshold === 'number' && currentThreshold > 0 && (
                   <p className={`text-xs ${reserveInfoToDisplay.ratio >= currentThreshold ? 'text-green-600' : 'text-red-600'}`}>
                     {reserveInfoToDisplay.ratio >= currentThreshold ? `Above requirement (${currentThreshold}%)` : `ALERT: Below requirement (${currentThreshold}%)` }
                   </p>
                 )}
                 {/* Alert Icon */}
                 {typeof reserveInfoToDisplay.ratio === 'number' && typeof currentThreshold === 'number' && currentThreshold > 0 && reserveInfoToDisplay.ratio < currentThreshold && (
                   <span className="absolute top-2 right-2 text-red-500" title={`Reserve ratio below configured threshold of ${currentThreshold}%!`}>
                     <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                   </span>
                 )}
              </div>
              {/* Last Audit */}
              <div className="bg-gray-50 p-4 rounded shadow">
                 <h3 className="text-sm font-medium text-gray-500 mb-1">Last External Audit/Verification</h3>
                 <p className="text-xl font-semibold text-gray-900">{reserveInfoToDisplay.lastAudit}</p>
                 <p className="text-xs text-gray-500">Verified by {reserveInfoToDisplay.auditor}</p>
              </div>
            </div>

            {/* Reserve Composition Display */}
            <div>
              <h2 className="text-xl font-semibold mb-3 text-gray-800">Reserve Composition</h2>
              <div className="space-y-2">
                {reserveInfoToDisplay.composition?.map((item, index) => (
                  <div key={index}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700">{item.name}</span>
                      <span className="font-medium text-gray-800">{item.percent.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-gradient-to-r from-blue-400 to-blue-600 h-2.5 rounded-full" style={{ width: `${item.percent}%` }}></div>
                    </div>
                  </div>
                ))}
                 {(!reserveInfoToDisplay.composition || reserveInfoToDisplay.composition.length === 0) && (
                   <p className="text-sm text-gray-500 italic">Composition data not applicable or available.</p>
                 )}
              </div>
            </div>

            {/* Reserve Accounts Table */}
            {reserveInfoToDisplay.accounts && reserveInfoToDisplay.accounts.length > 0 && (
              <div>
                  <div className="flex justify-between items-center mb-3">
                      <h2 className="text-xl font-semibold text-gray-800">Reserve Accounts (Top {Math.min(reserveInfoToDisplay.accounts.length, 3)})</h2>
                      {reserveInfoToDisplay.accounts.length > 3 && (
                        <button onClick={() => setShowAllAccountsModal(true)} className="text-sm text-blue-600 hover:underline">
                            View All Accounts ({reserveInfoToDisplay.accounts.length})
                        </button>
                      )}
                  </div>
                  <div className="overflow-x-auto border rounded">
                      <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                              <tr>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Institution/Registry</th>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account Type</th>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance/Holding</th>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                              </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                              {/* Display top 3 accounts */}
                              {reserveInfoToDisplay.accounts.slice(0, 3).map((account, index) => (
                                <tr key={index}>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{account.institution}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{account.type}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{account.balance}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{account.updated}</td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                          ['Active', 'Verified', 'Secure', 'Configured'].includes(account.status) ? 'bg-green-100 text-green-800' :
                                          ['Retired', 'Inactive', 'Planning'].includes(account.status) ? 'bg-gray-100 text-gray-800' :
                                          'bg-yellow-100 text-yellow-800' // Default for other statuses like 'Volatile'
                                      }`}>
                                          {account.status}
                                      </span>
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              </div>
            )}

            {/* Action Buttons Row */}
            <div className="pt-6 border-t border-gray-200 flex flex-col md:flex-row justify-between space-y-3 md:space-y-0 md:space-x-3">
               <button onClick={handleGenerateReport} className="w-full md:w-auto px-4 py-2 rounded text-white hover:opacity-90 bg-yellow-600 disabled:opacity-50" disabled={!selectedAsset || !reserveInfoToDisplay} > Generate Attestation Report </button>
               <button onClick={handleViewHistory} className="w-full md:w-auto px-4 py-2 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50" disabled={!selectedAsset || !reserveInfoToDisplay} > View Historical Reports </button>
               {/* Disable alert config if ratio is not a number */}
               <button onClick={handleOpenAlertModal} className="w-full md:w-auto px-4 py-2 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50" disabled={!selectedAsset || typeof reserveInfoToDisplay.ratio !== 'number'} > Configure Reserve Alerts </button>
            </div>

          </div>
        )}

        {/* Alert Configuration Modal */}
        {isAlertModalOpen && selectedAsset && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
                <div className="relative bg-white p-6 border w-full max-w-md mx-auto shadow-lg rounded-md">
                    <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Configure Reserve Alert for {selectedAsset.label}</h3>
                    <div className="mt-2">
                        <label htmlFor="threshold" className="block text-sm font-medium text-gray-700">Alert Threshold (%)</label>
                        <input type="number" id="threshold" name="threshold" className="mt-1 w-full p-2 border rounded" placeholder="e.g., 100" value={currentThresholdInput} onChange={(e) => setCurrentThresholdInput(e.target.value)} min="0" max="200" step="0.1" />
                        <p className="text-xs text-gray-500 mt-1">Set the minimum reserve ratio percentage. An alert will show if the actual ratio falls below this.</p>
                    </div>
                    <div className="mt-6 flex justify-end space-x-3">
                        <button type="button" className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50" onClick={() => setIsAlertModalOpen(false)} > Cancel </button>
                        <button type="button" className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:opacity-90" onClick={handleSaveThreshold} > Save Threshold </button>
                    </div>
                </div>
            </div>
        )}

        {/* View All Accounts Modal */}
         {showAllAccountsModal && selectedAsset && reserveInfoToDisplay && reserveInfoToDisplay.accounts && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
                <div className="relative bg-white p-6 border w-full max-w-3xl mx-auto shadow-lg rounded-md">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-medium leading-6 text-gray-900">All Reserve Accounts for {selectedAsset.label}</h3>
                        <button onClick={() => setShowAllAccountsModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
                    </div>
                    <div className="max-h-[60vh] overflow-y-auto border rounded">
                          <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50 sticky top-0">
                                  <tr>
                                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Institution/Registry</th>
                                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account Type</th>
                                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance/Holding</th>
                                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                  </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                  {/* Display ALL accounts in the modal */}
                                  {reserveInfoToDisplay.accounts.map((account, index) => (
                                      <tr key={index}>
                                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{account.institution}</td>
                                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{account.type}</td>
                                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{account.balance}</td>
                                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{account.updated}</td>
                                          <td className="px-6 py-4 whitespace-nowrap">
                                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                  ['Active', 'Verified', 'Secure', 'Configured'].includes(account.status) ? 'bg-green-100 text-green-800' :
                                                  ['Retired', 'Inactive', 'Planning'].includes(account.status) ? 'bg-gray-100 text-gray-800' :
                                                  'bg-yellow-100 text-yellow-800'
                                              }`}>
                                                  {account.status}
                                              </span>
                                          </td>
                                      </tr>
                                  ))}
                              </tbody>
                          </table>
                     </div>
                     <div className="mt-6 flex justify-end">
                        <button type="button" className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50" onClick={() => setShowAllAccountsModal(false)} > Close </button>
                    </div>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};

export default ReserveManagementScreen;
