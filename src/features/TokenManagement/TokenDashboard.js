import React, { useState, useEffect, useMemo } from 'react';
// Import Token Management specific components
import TokenIssuanceWizard from '../TokenIssuance/TokenIssuanceWizard';
import MintExistingToken from '../TokenIssuance/MintExistingToken';
import AssetDetailView from './AssetDetailView';
import BurnTokenScreen from './BurnTokenScreen';
import ReserveManagementScreen from './ReserveManagementScreen';
import HistoryDetailModal from './HistoryDetailModal';

// Import Context Hooks
import { useAssets } from '../../context/AssetsContext';
import { useTokenHistory } from '../../context/TokenHistoryContext';
// Import Helpers
import { formatNumber } from '../../utils/displayUtils';
// Import Shared Data
import { hardcodedAssetDetails } from '../../data/initialData';

// Placeholder User Initials
const currentUserInitials = 'DB';

// *** NEW: Mapping from Wizard Token Types/Subtypes to Logo Paths ***
const wizardTypeToLogoMap = {
  // Currency Types
  'Asset Backed Stablecoin': '/logos/stablecoin.png',
  'CBDC': '/logos/CBDC.png',
  'Cryptocurrency': '/logos/crypto.png',
  'Currency-Other': '/logos/other.png', // Fallback for Currency type

  // RWA Types (using subtype)
  'Gold (Troy Ounce)': '/logos/gold.png',
  'Carbon Credit': '/logos/carbon-credit.png',
  'Silver (Troy Ounce)': '/logos/silver.png',
  'Oil (Brent Crude Barrel)': '/logos/oil.png', // Corrected case from user list
  'Real Estate': '/logos/real-estate.png',
  'RWA-Other': '/logos/other.png', // Fallback for RWA type

  // Capital Asset Types (using subtype)
  'Company Stock': '/logos/company-stock.png',
  'Government Bond': '/logos/government-bond.png',
  'Money Market Fund': '/logos/money-market-fund.png', // Corrected name from user list
  'Commercial Paper': '/logos/commercial-paper.png',
  'Treasury Bill': '/logos/treasury-bill.png',
  'CapitalAsset-Other': '/logos/other.png', // Fallback for Capital Asset type

  // General Fallback
  'Other': '/logos/other.png',
  'DEFAULT': '/logos/generic-token.png' // Default if no match found
};


// Component receives assetLogos and blockchainLogos from App.js
const TokenDashboard = ({ assetLogos = {}, blockchainLogos = {} }) => {
  const { assets, dispatchAssets } = useAssets();
  const { tokenHistory, dispatchTokenHistory } = useTokenHistory();

  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedAssetId, setSelectedAssetId] = useState(null);
  const [isHistoryDetailModalOpen, setIsHistoryDetailModalOpen] = useState(false);
  const [selectedHistoryEntry, setSelectedHistoryEntry] = useState(null);

  // Define the IDs of predefined assets allowed in THIS (Token Mgmt) overview
  const allowedPredefinedTokenIds = [
    'cp-acme-01',
    'mmf-usd-01',
    'xagc-01',
    'oil-wti-01',
    'cc-verra-01',
  ];

  // Filter assets for the overview section
  const filteredTokenAssets = useMemo(() => {
      if (!Array.isArray(assets)) return [];
      return assets.filter(asset =>
          asset.isWizardIssued === true || allowedPredefinedTokenIds.includes(asset.id)
      );
  }, [assets]);


  // Helper to dispatch history entries
  const addHistoryEntry = (actionType, details, userInitials, approverInitials, notes = '') => {
    const newEntry = {
      id: Date.now() + Math.random(), timestamp: new Date(), actionType: actionType,
      details: details, user: userInitials, approver: approverInitials, notes: notes
    };
    dispatchTokenHistory({ type: 'ADD_TOKEN_HISTORY', payload: newEntry });
  };

  // Navigation Handlers
  const handleNavigate = (view) => setCurrentView(view);
  const handleAssetCardClick = (assetId) => {
      console.log("TokenDashboard: Card clicked for asset ID:", assetId);
      setSelectedAssetId(assetId);
      setCurrentView('assetDetail');
  };
  const handleBackToDashboard = () => { setSelectedAssetId(null); setCurrentView('dashboard'); };
  const handleHistoryRowClick = (entry) => {
    setSelectedHistoryEntry(entry);
    setIsHistoryDetailModalOpen(true);
  };

  // *** UPDATED handleIssueToken to determine and add logoPath ***
  const handleIssueToken = (fullTokenData) => {
    const amountToAdd = fullTokenData.supplyDetails?.initialSupply;
    const tokenSymbol = fullTokenData.tokenDetails?.symbol;
    const tokenName = fullTokenData.tokenDetails?.name;
    const tokenBlockchain = fullTokenData.tokenDetails?.blockchain;

    if (typeof amountToAdd !== 'number' || isNaN(amountToAdd) || amountToAdd <= 0) { alert("Invalid initial supply amount provided."); return; }
    if (!tokenSymbol || !tokenName || !tokenBlockchain) { alert("Missing required token details (Symbol, Name, or Blockchain)."); return; }
    const isDuplicate = Array.isArray(assets) && assets.some(asset => asset.symbol === tokenSymbol);
    if (isDuplicate) { alert(`Error: A token with the symbol "${tokenSymbol}" already exists.`); return; }

    let derivedAssetClass = 'Other';
    let derivedPhysicality = 'Digital';
    let derivedCustodyType = 'Warm';
    let derivedPrice = null;
    let derivedLogoPath = wizardTypeToLogoMap['DEFAULT']; // Start with default

    const wizTokenType = fullTokenData.tokenDetails?.tokenType;
    const wizRwaSubType = fullTokenData.tokenDetails?.rwaSubType;
    const wizCapitalAssetSubType = fullTokenData.tokenDetails?.capitalAssetSubType;
    const wizCurrencySubType = fullTokenData.tokenDetails?.currencySubType;

    // Determine Asset Class AND Logo Path based on wizard selection
    if (wizTokenType === 'Currency') {
        derivedLogoPath = wizardTypeToLogoMap[wizCurrencySubType] || wizardTypeToLogoMap['Currency-Other'];
        if (wizCurrencySubType === 'Asset Backed Stablecoin') derivedAssetClass = 'Stablecoin';
        else if (wizCurrencySubType === 'CBDC') derivedAssetClass = 'CBDC';
        else if (wizCurrencySubType === 'Cryptocurrency') derivedAssetClass = 'CryptoCurrency';
    } else if (wizTokenType === 'RWA') {
        derivedLogoPath = wizardTypeToLogoMap[wizRwaSubType] || wizardTypeToLogoMap['RWA-Other'];
        derivedAssetClass = 'RWA';
        if (wizRwaSubType?.toLowerCase().includes('gold')) { derivedAssetClass = 'Commodity-PreciousMetal'; derivedPhysicality = 'Physical'; derivedCustodyType = 'PhysicalVault'; }
        else if (wizRwaSubType?.toLowerCase().includes('silver')) { derivedAssetClass = 'Commodity-PreciousMetal'; derivedPhysicality = 'Physical'; derivedCustodyType = 'PhysicalVault'; }
        else if (wizRwaSubType?.toLowerCase().includes('oil')) { derivedAssetClass = 'Commodity-Energy'; }
        else if (wizRwaSubType?.toLowerCase().includes('real estate')) { derivedAssetClass = 'RealEstate'; derivedPhysicality = 'Physical'; derivedCustodyType = 'External'; }
        else if (wizRwaSubType?.toLowerCase().includes('carbon credit')) { derivedAssetClass = 'CarbonCredit'; }
    } else if (wizTokenType === 'CapitalAsset') {
        derivedLogoPath = wizardTypeToLogoMap[wizCapitalAssetSubType] || wizardTypeToLogoMap['CapitalAsset-Other'];
        derivedAssetClass = 'Security';
        if (wizCapitalAssetSubType?.toLowerCase().includes('stock')) derivedAssetClass = 'Security-Stock';
        else if (wizCapitalAssetSubType?.toLowerCase().includes('bond')) derivedAssetClass = 'Security-Bond';
        else if (wizCapitalAssetSubType?.toLowerCase().includes('money market fund')) derivedAssetClass = 'Security-MMF';
        else if (wizCapitalAssetSubType?.toLowerCase().includes('commercial paper')) derivedAssetClass = 'Security-CP';
        else if (wizCapitalAssetSubType?.toLowerCase().includes('treasury bill')) derivedAssetClass = 'Security-Bond';
    } else {
        // Handle case where top-level type might be 'Other' or undefined
        derivedLogoPath = wizardTypeToLogoMap['Other'] || wizardTypeToLogoMap['DEFAULT'];
    }

    // Determine Price (remains same)
    const marketValueData = fullTokenData.supplyDetails?.marketValue;
    if (marketValueData && typeof marketValueData.amount === 'number' && marketValueData.amount >= 0) {
        if (marketValueData.currency === 'USD') { derivedPrice = marketValueData.amount; }
        else { derivedPrice = marketValueData.amount; console.warn(`Market value specified in ${marketValueData.currency}. Storing raw amount. Price field assumes USD.`); }
    } else if (derivedAssetClass === 'Stablecoin' || derivedAssetClass === 'FiatCurrency') { derivedPrice = 1.00; }

    // Determine Custody Type (remains same)
    const reserveBackingType = fullTokenData.reserveDetails?.backingType;
     if (derivedPhysicality === 'Physical') { derivedCustodyType = 'PhysicalVault'; }
     else if (reserveBackingType === 'onchain_wallet') { derivedCustodyType = 'Warm'; }
     else if (reserveBackingType === 'custodian') { derivedCustodyType = `Custodian:${fullTokenData.reserveDetails.custodianName || 'Unknown'}`; }
     else if (reserveBackingType === 'bank' || reserveBackingType === 'smartcontract') { derivedCustodyType = 'External'; }
     else if (wizTokenType === 'CBDC') { derivedCustodyType = 'Hot'; }

    // Create new asset object including the logoPath
    const generatedId = tokenSymbol.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Date.now();
    const newAssetObject = {
      id: generatedId, label: tokenName, balance: amountToAdd, symbol: tokenSymbol,
      description: `Manage ${tokenName} (${tokenSymbol}) on ${tokenBlockchain}.`,
      blockchain: tokenBlockchain,
      supply: fullTokenData.supplyDetails?.supplyType === 'infinite' ? 'Infinite' : 'Finite',
      totalSupplyIssued: (fullTokenData.supplyDetails?.supplyType !== 'infinite' && typeof amountToAdd === 'number') ? amountToAdd : undefined,
      isWizardIssued: true, isInstitutional: true,
      pausable: fullTokenData.permissionDetails?.pausable ?? false,
      assetClass: derivedAssetClass, physicality: derivedPhysicality, custodyType: derivedCustodyType, price: derivedPrice,
      logoPath: derivedLogoPath, // <-- STORE THE DERIVED LOGO PATH
      wizardData: JSON.parse(JSON.stringify(fullTokenData))
    };

    console.log("Dispatching ADD_ASSET with enriched object:", newAssetObject);
    dispatchAssets({ type: 'ADD_ASSET', payload: newAssetObject });
    addHistoryEntry( 'Issue', `Issued ${formatNumber(amountToAdd)} ${tokenSymbol}`, currentUserInitials, 'MG', `Initial Value: ${derivedPrice !== null ? `${formatNumber(derivedPrice)} USD` : 'N/A'}. Class: ${derivedAssetClass}, Custody: ${derivedCustodyType}` );

    setCurrentView('dashboard');
    alert(`${formatNumber(amountToAdd)} ${tokenSymbol} issued successfully!`);
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
            {/* Issue New Token Card */}
            <div className="bg-white p-4 rounded shadow"> <h2 className="font-bold border-b pb-2 mb-4 text-gray-800">Issue New Token</h2> <p className="text-sm text-gray-600 mb-3">Define and create a new type of token using the wizard.</p> <button type="button" className="px-4 py-2 rounded text-white hover:opacity-90 bg-yellow-600" onClick={() => handleNavigate('issuance')} > Issue New Token </button> </div>
            {/* Mint Existing Token Card */}
            <div className="bg-white p-4 rounded shadow"> <h2 className="font-bold border-b pb-2 mb-4 text-gray-800">Mint Existing Token</h2> <p className="text-sm text-gray-600 mb-3">Increase the supply of an already issued token.</p> <button type="button" className="px-4 py-2 rounded text-white hover:opacity-90 bg-yellow-600" onClick={() => handleNavigate('issueExisting')} > Mint Existing Token </button> </div>
            {/* Burn Card */}
            <div className="bg-white p-4 rounded shadow"> <h2 className="font-bold border-b pb-2 mb-4 text-gray-800">Burn</h2> <p className="text-sm text-gray-600 mb-3">Remove tokens from circulation.</p> <button type="button" className="px-4 py-2 rounded text-white hover:opacity-90 bg-yellow-600" onClick={() => handleNavigate('burn')} > Burn Tokens </button> </div>
            {/* Reserve Card */}
            <div className="bg-white p-4 rounded shadow"> <h2 className="font-bold border-b pb-2 mb-4 text-gray-800">Reserve</h2> <p className="text-sm text-gray-600 mb-3">Manage and view token reserves.</p> <button type="button" className="px-4 py-2 rounded text-white hover:opacity-90 bg-yellow-600" onClick={() => handleNavigate('reserve')} > View Reserves </button> </div>
          </div>

          {/* Asset Overview */}
          <h2 className="text-xl font-semibold mb-4 text-gray-700 mt-8">Managed Token Assets</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTokenAssets.length > 0 ? filteredTokenAssets.map(asset => (
              <div key={asset.id} className="bg-white p-4 rounded shadow flex flex-col cursor-pointer border border-gray-200 hover:shadow-lg hover:border-gray-400 transition-all" onClick={() => handleAssetCardClick(asset.id)} >
                {/* Card Header */}
                <div className="flex items-center border-b pb-2 mb-2">
                  {/* *** UPDATED: Use asset.logoPath for wizard assets if available *** */}
                  {asset.isWizardIssued ? (
                    <img
                      src={asset.logoPath || '/logos/generic-token.png'} // Use stored path or fallback
                      alt="User-issued token"
                      className="h-5 w-5 mr-2"
                      onError={(e) => { e.target.src = '/logos/generic-token.png'; }} // Fallback on error
                    />
                   ) : (
                     (assetLogos[asset.id] || assetLogos[asset.symbol]) && (
                       <img
                         src={assetLogos[asset.id] || assetLogos[asset.symbol]}
                         alt={`${asset.label} logo`}
                         className="h-5 w-5 mr-2"
                         onError={(e) => { e.target.style.display = 'none'; }}
                      />
                     )
                   )}
                  <h3 className="font-bold text-gray-800">{asset.label} ({asset.symbol})</h3>
                </div>
                {/* Card Body (content remains same) */}
                <div className="flex-grow space-y-2 text-sm mb-3"> <p className="text-gray-600">{asset.description}</p> <div className="flex flex-wrap gap-1"> {asset.assetClass && <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">{asset.assetClass}</span>} {asset.physicality && <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 border border-green-200">{asset.physicality}</span>} {asset.custodyType && <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">{asset.custodyType}</span>} </div> {asset.totalSupplyIssued !== undefined && ( <p className="text-xs text-gray-500">Total Issued: {formatNumber(asset.totalSupplyIssued)}</p> )} {asset.blockchain && asset.blockchain !== 'N/A' && ( <div className="flex items-center text-xs text-gray-400"> {blockchainLogos[asset.blockchain] && (<img src={blockchainLogos[asset.blockchain]} alt={`${asset.blockchain} logo`} className="h-4 w-4 mr-1.5" onError={(e) => { e.target.style.display = 'none'; }}/>)} <span>On: {asset.blockchain}</span> </div> )} {asset.price !== null && asset.price !== undefined && ( <p className="text-xs text-gray-500"> Value: ~{formatNumber(asset.price)} USD / token </p> )} </div>
                {/* Card Footer (content remains same) */}
                <div className="mt-auto bg-gray-100 p-3 rounded -m-4 mt-4"> <div className="flex justify-between items-center"> <span className="text-sm text-gray-700">Circulating Supply:</span> <span className="font-bold text-sm">{formatNumber(asset.balance)} {asset.symbol}</span> </div> </div>
              </div>
            )) : (
              <p className="text-gray-500 italic col-span-full">No managed token assets found or still loading...</p>
            )}
          </div>

          {/* History Table */}
           <div className="mt-12"> <h2 className="text-xl font-semibold mb-4 text-gray-700">History</h2> <div className="bg-white p-4 rounded shadow overflow-x-auto"> {tokenHistory.length === 0 ? (<p className="text-center text-gray-500 italic">No history yet.</p>) : ( <table className="min-w-full divide-y divide-gray-200 text-sm"> <thead className="bg-gray-50"> <tr> <th scope="col" className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Timestamp</th> <th scope="col" className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">User</th> <th scope="col" className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Action</th> <th scope="col" className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Details</th> <th scope="col" className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Approver</th> </tr> </thead> <tbody className="bg-white divide-y divide-gray-200"> {tokenHistory.map((entry) => ( <tr key={entry.id} onClick={() => handleHistoryRowClick(entry)} className="hover:bg-gray-100 cursor-pointer transition-colors duration-150 ease-in-out" > <td className="px-4 py-2 whitespace-nowrap text-gray-500">{entry.timestamp.toLocaleString()}</td> <td className="px-4 py-2 whitespace-nowrap text-gray-900">{entry.user}</td> <td className="px-4 py-2 whitespace-nowrap text-gray-900 font-medium">{entry.actionType}</td> <td className="px-4 py-2 text-gray-700 break-words max-w-xs">{entry.details}</td> <td className="px-4 py-2 whitespace-nowrap text-gray-900">{entry.approver}</td> </tr> ))} </tbody> </table> )} </div> </div>
        </div>
      )}

      {/* Render Child Components Based on View State */}
      {currentView === 'assetDetail' && selectedAssetId && (
        (() => {
          const selectedAsset = Array.isArray(assets) ? assets.find(asset => asset.id === selectedAssetId) : null;
          if (!selectedAsset) { console.error("AssetDetailView Error: Could not find selected asset ID:", selectedAssetId); alert("Error loading asset details."); handleBackToDashboard(); return null; }
          return (<AssetDetailView asset={selectedAsset} hardcodedDetailsMap={hardcodedAssetDetails} onBack={handleBackToDashboard} assetLogosMap={assetLogos} blockchainLogosMap={blockchainLogos} />);
        })()
      )}
      {currentView === 'issuance' && (<TokenIssuanceWizard onBack={handleBackToDashboard} onIssue={handleIssueToken} />)}
      {currentView === 'issueExisting' && (<MintExistingToken onBack={handleBackToDashboard} />)}
      {currentView === 'burn' && (<BurnTokenScreen onBack={handleBackToDashboard} />)}
      {currentView === 'reserve' && (<ReserveManagementScreen assetLogosMap={assetLogos} onBack={handleBackToDashboard} />)}

      {/* History Detail Modal */}
      {isHistoryDetailModalOpen && ( <HistoryDetailModal entry={selectedHistoryEntry} onClose={() => { setIsHistoryDetailModalOpen(false); setSelectedHistoryEntry(null); }} /> )}
    </>
  );
};

export default TokenDashboard;
