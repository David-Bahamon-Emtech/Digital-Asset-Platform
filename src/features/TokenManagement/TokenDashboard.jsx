import React, { useState, useEffect, useMemo } from 'react';
import TokenIssuanceWizard from '../TokenIssuance/TokenIssuanceWizard.jsx';
import MintExistingToken from '../TokenIssuance/MintExistingToken.jsx';
import AssetDetailView from './AssetDetailView.jsx';
import BurnTokenScreen from './BurnTokenScreen.jsx';
import ReserveManagementScreen from './ReserveManagementScreen.jsx';
import HistoryDetailModal from './HistoryDetailModal.jsx';
import TokenMetricsDashboard from './TokenMetricsDashboard';
import { useAssets } from '../../context/AssetsContext';
import { useTokenHistory } from '../../context/TokenHistoryContext';
import { formatNumber } from '../../utils/displayUtils';
import { hardcodedAssetDetails } from '../../data/initialData';
// Import getAlertThreshold if not already imported (assuming it's needed by ReserveManagementScreen)
import { getAlertThreshold } from '../../utils/metricsData.js'; // Adjust path if needed

const currentUserInitials = 'DB'; // Example user

// Mapping for wizard token type to logo (assuming this map exists or is defined elsewhere)
const wizardTypeToLogoMap = {
  'Asset Backed Stablecoin': '/logos/stablecoin.png', 'CBDC': '/logos/CBDC.png', 'Cryptocurrency': '/logos/crypto.png', 'Currency-Other': '/logos/other.png',
  'Gold (Troy Ounce)': '/logos/gold.png', 'Carbon Credit': '/logos/carbon-credit.png', 'Silver (Troy Ounce)': '/logos/silver.png', 'Oil (Brent Crude Barrel)': '/logos/oil.png', 'Real Estate': '/logos/real-estate.png', 'RWA-Other': '/logos/other.png',
  'Company Stock': '/logos/company-stock.png', 'Government Bond': '/logos/government-bond.png', 'Money Market Fund': '/logos/money-market-fund.png', 'Commercial Paper': '/logos/commercial-paper.png', 'Treasury Bill': '/logos/treasury-bill.png', 'CapitalAsset-Other': '/logos/other.png',
  'Other': '/logos/other.png', 'DEFAULT': '/logos/generic-token.png'
};

// Define which predefined assets are managed in this dashboard
const allowedPredefinedTokenIds = [ 'cp-acme-01', 'mmf-usd-01', 'xagc-01', 'oil-wti-01', 'cc-verra-01', ];

const TokenDashboard = ({ assetLogos = {}, blockchainLogos = {} }) => {
  const { assets, dispatchAssets } = useAssets();
  const { tokenHistory, dispatchTokenHistory } = useTokenHistory();
  const [currentView, setCurrentView] = useState('dashboard'); // e.g., dashboard, issuance, assetDetail, burn, reserve
  const [selectedAssetId, setSelectedAssetId] = useState(null);
  const [isHistoryDetailModalOpen, setIsHistoryDetailModalOpen] = useState(false);
  const [selectedHistoryEntry, setSelectedHistoryEntry] = useState(null);
  // State to hold alert thresholds, managed here and passed down
  const [alertThresholds, setAlertThresholds] = useState({});

  // Filter assets to show only wizard-issued or specific predefined tokens
  const filteredTokenAssets = useMemo(() => {
      if (!Array.isArray(assets)) return [];
      // Filter logic: include if wizardIssued OR if ID is in the allowed list
      return assets.filter(asset =>
          asset.isWizardIssued === true || allowedPredefinedTokenIds.includes(asset.id)
      );
  }, [assets]); // Re-filter when global assets change

  // Effect to initialize/update alert thresholds based on available assets
  useEffect(() => {
    if (assets && assets.length > 0) {
        setAlertThresholds(prevThresholds => {
            const newThresholds = { ...prevThresholds };
            // Use filteredTokenAssets to only calculate for relevant assets
            filteredTokenAssets.forEach(asset => {
                // Only set if not already present, respecting user overrides from ReserveManagementScreen
                if (!(asset.id in newThresholds)) {
                    newThresholds[asset.id] = getAlertThreshold(asset);
                }
            });
            return newThresholds;
        });
    }
  }, [filteredTokenAssets]); // Depend on filtered assets

  // Callback for ReserveManagementScreen to update threshold state here
  const handleUpdateAlertThreshold = (assetId, newThreshold) => {
    setAlertThresholds(prev => ({ ...prev, [assetId]: newThreshold }));
  };

  // Helper function to add history entries
  const addHistoryEntry = (actionType, details, userInitials, approverInitials, assetId, assetSymbol, assetName, notes = '') => {
      const newEntry = {
          id: Date.now() + Math.random(),
          timestamp: new Date(),
          actionType: actionType,
          details: details,
          user: userInitials,
          approver: approverInitials,
          assetId: assetId, // Include asset identifiers
          assetSymbol: assetSymbol,
          assetName: assetName,
          notes: notes
      };
      dispatchTokenHistory({ type: 'ADD_TOKEN_HISTORY', payload: newEntry });
  };

  // Navigation handlers
  const handleNavigate = (view) => setCurrentView(view);
  const handleAssetCardClick = (assetId) => {
      setSelectedAssetId(assetId);
      setCurrentView('assetDetail');
  };
  const handleBackToDashboard = () => {
      setSelectedAssetId(null);
      setCurrentView('dashboard');
  };
  const handleHistoryRowClick = (entry) => {
      setSelectedHistoryEntry(entry);
      setIsHistoryDetailModalOpen(true);
  };

  // Handler for successful token issuance from wizard
  const handleIssueToken = (fullTokenData) => {
    // --- Validation ---
    const amountToAdd = fullTokenData.supplyDetails?.initialSupply;
    const tokenSymbol = fullTokenData.tokenDetails?.symbol;
    const tokenName = fullTokenData.tokenDetails?.name;
    const tokenBlockchain = fullTokenData.tokenDetails?.blockchain;

    if (typeof amountToAdd !== 'number' || isNaN(amountToAdd) || amountToAdd <= 0) {
        alert("Invalid initial supply amount provided."); return;
    }
    if (!tokenSymbol || !tokenName || !tokenBlockchain) {
        alert("Missing required token details (Symbol, Name, or Blockchain)."); return;
    }
    // Check for duplicate symbol
    const isDuplicate = Array.isArray(assets) && assets.some(asset => asset.symbol === tokenSymbol);
    if (isDuplicate) {
        alert(`Error: A token with the symbol "${tokenSymbol}" already exists.`); return;
    }

    // --- Derive Metadata ---
    let derivedAssetClass = 'Other';
    let derivedPhysicality = 'Digital';
    let derivedCustodyType = 'Warm'; // Default for new tokens
    let derivedPrice = null;
    let derivedLogoPath = wizardTypeToLogoMap['DEFAULT'];

    const wizTokenType = fullTokenData.tokenDetails?.tokenType;
    const wizRwaSubType = fullTokenData.tokenDetails?.rwaSubType;
    const wizCapitalAssetSubType = fullTokenData.tokenDetails?.capitalAssetSubType;
    const wizCurrencySubType = fullTokenData.tokenDetails?.currencySubType;

    // Determine Asset Class, Logo, and potentially Physicality/Custody based on type/subtype
    if (wizTokenType === 'Currency') {
        derivedLogoPath = wizardTypeToLogoMap[wizCurrencySubType] || wizardTypeToLogoMap['Currency-Other'];
        if (wizCurrencySubType === 'Asset Backed Stablecoin') derivedAssetClass = 'Stablecoin';
        else if (wizCurrencySubType === 'CBDC') derivedAssetClass = 'CBDC';
        else if (wizCurrencySubType === 'Cryptocurrency') derivedAssetClass = 'Cryptocurrency';
    } else if (wizTokenType === 'RWA') {
        derivedLogoPath = wizardTypeToLogoMap[wizRwaSubType] || wizardTypeToLogoMap['RWA-Other'];
        derivedAssetClass = 'RWA'; // Generic RWA, specific below
        if (wizRwaSubType?.toLowerCase().includes('gold')) { derivedAssetClass = 'Commodity: Precious Metal'; derivedPhysicality = 'Physical'; derivedCustodyType = 'PhysicalVault'; }
        else if (wizRwaSubType?.toLowerCase().includes('silver')) { derivedAssetClass = 'Commodity: Precious Metal'; derivedPhysicality = 'Physical'; derivedCustodyType = 'PhysicalVault'; }
        else if (wizRwaSubType?.toLowerCase().includes('oil')) { derivedAssetClass = 'Commodity: Energy'; }
        else if (wizRwaSubType?.toLowerCase().includes('real estate')) { derivedAssetClass = 'RealEstate'; derivedPhysicality = 'Physical'; derivedCustodyType = 'External'; }
        else if (wizRwaSubType?.toLowerCase().includes('carbon credit')) { derivedAssetClass = 'Carbon Credit'; }
    } else if (wizTokenType === 'CapitalAsset') {
        derivedLogoPath = wizardTypeToLogoMap[wizCapitalAssetSubType] || wizardTypeToLogoMap['CapitalAsset-Other'];
        derivedAssetClass = 'Security'; // Generic Security, specific below
        if (wizCapitalAssetSubType?.toLowerCase().includes('stock')) derivedAssetClass = 'Security: Stock';
        else if (wizCapitalAssetSubType?.toLowerCase().includes('bond')) derivedAssetClass = 'Security: Bond';
        else if (wizCapitalAssetSubType?.toLowerCase().includes('money market fund')) derivedAssetClass = 'Security: MMF';
        else if (wizCapitalAssetSubType?.toLowerCase().includes('commercial paper')) derivedAssetClass = 'Security: CP';
        else if (wizCapitalAssetSubType?.toLowerCase().includes('treasury bill')) derivedAssetClass = 'Security: Bond';
    } else { // Default/Other
        derivedLogoPath = wizardTypeToLogoMap['Other'] || wizardTypeToLogoMap['DEFAULT'];
    }

    // Determine Price (simple logic for demo)
    const marketValueData = fullTokenData.supplyDetails?.marketValue;
    if (marketValueData && typeof marketValueData.amount === 'number' && marketValueData.amount >= 0) {
        // Assuming price is per token and in USD for simplicity
        derivedPrice = marketValueData.amount;
        if (marketValueData.currency !== 'USD') {
             console.warn(`Market value specified in ${marketValueData.currency}. Storing raw amount. Price field assumes USD.`);
        }
    } else if (derivedAssetClass === 'Stablecoin') {
        derivedPrice = 1.00; // Default for stablecoins
    }

    // Determine Custody Type based on reserve backing (more nuanced logic possible)
    const reserveBackingType = fullTokenData.reserveDetails?.backingType;
    if (derivedPhysicality === 'Physical') {
        derivedCustodyType = 'PhysicalVault'; // Physical assets need physical vault
    } else if (reserveBackingType === 'onchain_wallet') {
        derivedCustodyType = 'Warm'; // Assume platform warm wallet
    } else if (reserveBackingType === 'custodian') {
        derivedCustodyType = `Custodian:${fullTokenData.reserveDetails.custodianName || 'Unknown'}`;
    } else if (reserveBackingType === 'bank' || reserveBackingType === 'smartcontract') {
        derivedCustodyType = 'External'; // Assume reserves held externally
    } else if (wizTokenType === 'CBDC') {
        derivedCustodyType = 'Hot'; // CBDCs might be hot
    } // Keep default 'Warm' otherwise

    // --- Create New Asset Object ---
    const generatedId = tokenSymbol.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Date.now();
    const newAssetObject = {
        id: generatedId,
        label: tokenName,
        // *** CORRECTION: Initial balance (circulating) should be 0 ***
        balance: 0,
        symbol: tokenSymbol,
        description: `Manage ${tokenName} (${tokenSymbol}) on ${tokenBlockchain}.`,
        blockchain: tokenBlockchain,
        supply: fullTokenData.supplyDetails?.supplyType === 'infinite' ? 'Infinite' : 'Finite',
        // Total issued remains the amount created
        totalSupplyIssued: (fullTokenData.supplyDetails?.supplyType !== 'infinite' && typeof amountToAdd === 'number') ? amountToAdd : undefined,
        isWizardIssued: true, // Mark as wizard-issued
        isInstitutional: true, // Assume institutional for now
        pausable: fullTokenData.permissionDetails?.pausable ?? false, // Get pausable status
        // Derived metadata
        assetClass: derivedAssetClass,
        physicality: derivedPhysicality,
        custodyType: derivedCustodyType,
        price: derivedPrice,
        logoPath: derivedLogoPath, // Store the determined logo path
        issuanceTimestamp: new Date(), // Record issuance time
        // Store the raw wizard data for detailed view
        wizardData: JSON.parse(JSON.stringify(fullTokenData)) // Deep copy
    };

    // --- Dispatch Actions ---
    dispatchAssets({ type: 'ADD_ASSET', payload: newAssetObject });
    addHistoryEntry(
        'Issue', // Action Type
        `Issued ${formatNumber(amountToAdd)} ${tokenSymbol}`, // Details
        currentUserInitials, // User
        'MG', // Approver (example)
        newAssetObject.id, // Asset ID
        newAssetObject.symbol, // Asset Symbol
        newAssetObject.label, // Asset Name
        // Updated Note: Reflects initial state
        `Initial issuance. Circulation: 0. In Reserve: ${formatNumber(amountToAdd)}. Value: ${derivedPrice !== null ? `${formatNumber(derivedPrice)} USD` : 'N/A'}. Class: ${derivedAssetClass}, Custody: ${derivedCustodyType}` // Notes
    );

    // --- Finalize ---
    setCurrentView('dashboard'); // Navigate back
    alert(`${formatNumber(amountToAdd)} ${tokenSymbol} issued successfully! Initial balance is 0, full amount held in reserve.`); // Updated alert
  };


  // --- Render Logic ---
  return (
    <>
      {/* Main Dashboard View */}
      {currentView === 'dashboard' && (
        <div className="p-8">
          <h1 className="text-2xl font-bold mb-6 text-gray-800">Token Management Dashboard</h1>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white p-4 rounded shadow">
                <h2 className="font-bold border-b pb-2 mb-4 text-gray-800">Issue New Token</h2>
                <p className="text-sm text-gray-600 mb-3">Define and create a new type of token using the wizard.</p>
                <button type="button" className="px-4 py-2 rounded text-white hover:opacity-90 bg-yellow-600" onClick={() => handleNavigate('issuance')} >
                    Issue New Token
                </button>
            </div>
            <div className="bg-white p-4 rounded shadow">
                 <h2 className="font-bold border-b pb-2 mb-4 text-gray-800">Mint Existing Token</h2>
                 <p className="text-sm text-gray-600 mb-3">Increase the supply of an already issued token.</p>
                 <button type="button" className="px-4 py-2 rounded text-white hover:opacity-90 bg-yellow-600" onClick={() => handleNavigate('issueExisting')} >
                     Mint Existing Token
                 </button>
            </div>
            <div className="bg-white p-4 rounded shadow">
                 <h2 className="font-bold border-b pb-2 mb-4 text-gray-800">Burn</h2>
                 <p className="text-sm text-gray-600 mb-3">Remove tokens from circulation.</p>
                 <button type="button" className="px-4 py-2 rounded text-white hover:opacity-90 bg-yellow-600" onClick={() => handleNavigate('burn')} >
                     Burn Tokens
                 </button>
            </div>
            <div className="bg-white p-4 rounded shadow">
                 <h2 className="font-bold border-b pb-2 mb-4 text-gray-800">Reserve</h2>
                 <p className="text-sm text-gray-600 mb-3">Manage and view token reserves.</p>
                 <button type="button" className="px-4 py-2 rounded text-white hover:opacity-90 bg-yellow-600" onClick={() => handleNavigate('reserve')} >
                     View Reserves
                 </button>
            </div>
          </div>

          {/* Token Metrics Overview Component */}
          <TokenMetricsDashboard
            assets={filteredTokenAssets} // Pass only the filtered assets
            assetLogos={assetLogos}
            alertThresholds={alertThresholds} // Pass down current thresholds
          />

          {/* Managed Token Assets Grid */}
          <h2 className="text-xl font-semibold mb-4 text-gray-700 mt-8">Managed Token Assets</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTokenAssets.length > 0 ? filteredTokenAssets.map(asset => {
                // Calculate reserve amount for display within the card map function
                const reserveAmount = (asset.supply === 'Finite' && typeof asset.totalSupplyIssued === 'number' && typeof asset.balance === 'number' && asset.totalSupplyIssued >= asset.balance)
                    ? asset.totalSupplyIssued - asset.balance
                    : null; // Calculate only if valid

                return (
                    <div
                        key={asset.id}
                        className="bg-white p-4 rounded shadow flex flex-col cursor-pointer border border-gray-200 hover:shadow-lg hover:border-gray-400 transition-all"
                        onClick={() => handleAssetCardClick(asset.id)}
                    >
                        {/* Card Header */}
                        <div className="flex items-center border-b pb-2 mb-2">
                            {/* Logo Logic */}
                            {asset.isWizardIssued ? (
                                <img src={asset.logoPath || '/logos/generic-token.png'} alt="Token type icon" className="h-5 w-5 mr-2" onError={(e) => { e.target.src = '/logos/generic-token.png'; }} />
                            ) : (
                                (assetLogos[asset.id] || assetLogos[asset.symbol]) && (
                                    <img src={assetLogos[asset.id] || assetLogos[asset.symbol]} alt={`${asset.label} logo`} className="h-5 w-5 mr-2" onError={(e) => { e.target.style.display = 'none'; }} />
                                )
                            )}
                            <h3 className="font-bold text-gray-800">{asset.label} ({asset.symbol})</h3>
                        </div>

                        {/* Card Body */}
                        <div className="flex-grow space-y-1 text-sm mb-3"> {/* Reduced space-y */}
                            <p className="text-gray-600 text-xs line-clamp-2">{asset.description}</p> {/* Added line-clamp */}
                            {/* Tags */}
                            <div className="flex flex-wrap gap-1 pt-1">
                                {asset.assetClass && <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">{asset.assetClass}</span>}
                                {asset.physicality && <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 border border-green-200">{asset.physicality}</span>}
                                {asset.custodyType && <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">{asset.custodyType}</span>}
                            </div>
                            {/* Total Issued */}
                            {asset.totalSupplyIssued !== undefined && (
                                <p className="text-xs text-gray-500 pt-1">Total Issued: {formatNumber(asset.totalSupplyIssued)}</p>
                            )}
                            {/* Total in Reserve */}
                            {reserveAmount !== null && (
                                <p className="text-xs text-gray-500">Total in Reserve: {formatNumber(reserveAmount)}</p>
                            )}
                            {/* Blockchain Info */}
                            {asset.blockchain && asset.blockchain !== 'N/A' && (
                                <div className="flex items-center text-xs text-gray-400 pt-1">
                                    {blockchainLogos[asset.blockchain] && (
                                        <img src={blockchainLogos[asset.blockchain]} alt={`${asset.blockchain} logo`} className="h-4 w-4 mr-1.5" onError={(e) => { e.target.style.display = 'none'; }}/>
                                    )}
                                    <span>On: {asset.blockchain}</span>
                                </div>
                            )}
                            {/* Price Info */}
                            {asset.price !== null && asset.price !== undefined && (
                                <p className="text-xs text-gray-500"> Value: ~{formatNumber(asset.price)} USD / token </p>
                            )}
                        </div>

                        {/* Card Footer */}
                        <div className="mt-auto bg-gray-100 p-3 rounded -m-4 mt-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-700">Circulating Supply:</span>
                                <span className="font-bold text-sm">{formatNumber(asset.balance)} {asset.symbol}</span>
                            </div>
                        </div>
                    </div>
                );
            }) : (
                <p className="text-gray-500 italic col-span-full">No managed token assets found or still loading...</p>
            )}
          </div>

          {/* History Table */}
           <div className="mt-12">
             <h2 className="text-xl font-semibold mb-4 text-gray-700">History</h2>
             <div className="bg-white p-4 rounded shadow overflow-x-auto">
               {tokenHistory.length === 0 ? (
                   <p className="text-center text-gray-500 italic">No history yet.</p>
               ) : (
                 <table className="min-w-full divide-y divide-gray-200 text-sm">
                   <thead className="bg-gray-50">
                     <tr>
                       <th scope="col" className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Token</th>
                       <th scope="col" className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                       <th scope="col" className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">User</th>
                       <th scope="col" className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Action</th>
                       <th scope="col" className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Details</th>
                       <th scope="col" className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Approver</th>
                     </tr>
                   </thead>
                   <tbody className="bg-white divide-y divide-gray-200">
                     {tokenHistory.map((entry) => {
                       // Find related asset info for display
                       const assetId = entry.assetId;
                       const assetSymbol = entry.assetSymbol || 'N/A';
                       const assetName = entry.assetName || assetSymbol;
                       const relatedAsset = assetId ? assets.find(a => a.id === assetId) : null;
                       // Determine logo based on asset type
                       let displayLogo = '/logos/generic-token.png';
                       if (relatedAsset?.isWizardIssued) {
                           displayLogo = relatedAsset.logoPath || displayLogo;
                       } else if (assetId || assetSymbol) {
                           displayLogo = assetLogos[assetId] || assetLogos[assetSymbol] || displayLogo;
                       }

                       return (
                         <tr key={entry.id} onClick={() => handleHistoryRowClick(entry)} className="hover:bg-gray-100 cursor-pointer transition-colors duration-150 ease-in-out">
                           {/* Token Column */}
                           <td className="px-4 py-2 whitespace-nowrap">
                             <div className="flex items-center">
                               <img src={displayLogo} alt="token logo" className="h-5 w-5 mr-2 flex-shrink-0" onError={(e) => { e.target.src = '/logos/generic-token.png'; }} />
                               <div>
                                 <div className="font-medium text-gray-900 text-xs">{assetName}</div>
                                 <div className="text-xxs text-gray-500">{assetSymbol}</div>
                               </div>
                             </div>
                           </td>
                           {/* Other Columns */}
                           <td className="px-4 py-2 whitespace-nowrap text-gray-500">{entry.timestamp?.toLocaleString() || 'N/A'}</td>
                           <td className="px-4 py-2 whitespace-nowrap text-gray-900">{entry.user || 'N/A'}</td>
                           <td className="px-4 py-2 whitespace-nowrap text-gray-900 font-medium">{entry.actionType || 'N/A'}</td>
                           <td className="px-4 py-2 text-gray-700 break-words max-w-xs">{entry.details || 'N/A'}</td>
                           <td className="px-4 py-2 whitespace-nowrap text-gray-900">{entry.approver || 'N/A'}</td>
                         </tr>
                       );
                     })}
                   </tbody>
                 </table>
               )}
             </div>
           </div>
        </div>
      )}

      {/* Conditional Rendering for Other Views */}
      {currentView === 'assetDetail' && selectedAssetId && (
          (() => {
              const selectedAsset = Array.isArray(assets) ? assets.find(asset => asset.id === selectedAssetId) : null;
              if (!selectedAsset) {
                  console.error("AssetDetailView Error: Could not find selected asset ID:", selectedAssetId);
                  alert("Error loading asset details.");
                  handleBackToDashboard(); // Go back if asset not found
                  return null;
              }
              return (
                  <AssetDetailView
                      asset={selectedAsset}
                      hardcodedDetailsMap={hardcodedAssetDetails}
                      onBack={handleBackToDashboard}
                      assetLogosMap={assetLogos}
                      blockchainLogosMap={blockchainLogos}
                  />
              );
          })()
      )}
      {currentView === 'issuance' && (
          <TokenIssuanceWizard
              onBack={handleBackToDashboard}
              onIssue={handleIssueToken}
          />
      )}
      {currentView === 'issueExisting' && (
          <MintExistingToken
              onBack={handleBackToDashboard}
              // Pass necessary props if MintExistingToken needs them
          />
      )}
      {currentView === 'burn' && (
          <BurnTokenScreen
              onBack={handleBackToDashboard}
              // Pass necessary props if BurnTokenScreen needs them
          />
      )}
      {currentView === 'reserve' && (
          <ReserveManagementScreen
              assetLogosMap={assetLogos}
              onBack={handleBackToDashboard}
              alertThresholds={alertThresholds} // Pass thresholds down
              onUpdateThreshold={handleUpdateAlertThreshold} // Pass update callback down
          />
      )}

      {/* History Detail Modal */}
      {isHistoryDetailModalOpen && (
          <HistoryDetailModal
              entry={selectedHistoryEntry}
              onClose={() => { setIsHistoryDetailModalOpen(false); setSelectedHistoryEntry(null); }}
          />
      )}
    </>
  );
};

export default TokenDashboard;
