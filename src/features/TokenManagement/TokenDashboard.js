import React, { useState } from 'react';
import TokenIssuanceWizard from '../TokenIssuance/TokenIssuanceWizard';
import IssuanceChoiceScreen from '../TokenIssuance/IssuanceChoiceScreen';
import AssetDetailView from './AssetDetailView';
import MintExistingToken from '../TokenIssuance/MintExistingToken'; // Ensure path is correct
import BurnTokenScreen from './BurnTokenScreen';
import RedeemTokenScreen from './RedeemTokenScreen';
import ReserveManagementScreen from './ReserveManagementScreen';

// Initial sample data for assets displayed on the dashboard.
const initialAssets = [
  { id: 'usdc', label: 'USDC', balance: 10000000, symbol: 'USDC', description: 'Manage USDC stablecoin reserves.', supply: 'Finite', blockchain: 'Stellar', isWizardIssued: false },
  { id: 'usdt', label: 'USDT', balance: 8500000, symbol: 'USDT', description: 'Manage USDT stablecoin reserves.', supply: 'Finite', blockchain: 'Ethereum', isWizardIssued: false },
  { id: 't-gold', label: 'Tokenized Gold', balance: 5000, symbol: 'T-GOLD', description: 'Manage reserves for Gold-backed tokens.', supply: 'Finite', blockchain: 'Polygon', isWizardIssued: false },
  { id: 'e-cedi', label: 'eCedi', balance: 15000000, symbol: 'eGH¢', description: 'Manage reserves for eCedi CBDC.', supply: 'Finite', blockchain: 'Hedera', isWizardIssued: false },
  { id: 'd-euro', label: 'Digital Euro', balance: 9000000, symbol: 'D-EUR', description: 'Manage reserves for Digital Euro.', supply: 'Finite', blockchain: 'Ethereum', isWizardIssued: false }
];

// Static detailed information for pre-defined assets, used in AssetDetailView.
const hardcodedAssetDetails = {
  'usdc': { officialName: 'USD Coin', issuer: 'Circle Internet Financial', website: 'https://www.circle.com/en/usdc', assetType: 'Fiat-backed Stablecoin', reserveInfo: 'Backed by cash and short-duration U.S. Treasuries, attested monthly.', features: ['Pausable by issuer', 'Regulated', 'KYC/AML required'], },
  'usdt': { officialName: 'Tether', issuer: 'Tether Operations Limited', website: 'https://tether.to/', assetType: 'Fiat-backed Stablecoin', reserveInfo: 'Backed by various assets including cash, equivalents, secured loans, bonds, and other investments. Attested regularly.', features: ['Pausable by issuer', 'Regulated (varies by jurisdiction)'], },
  't-gold': { officialName: 'Tokenized Gold', issuer: 'Bank of Ghana', website: '#', assetType: 'Commodity-backed Token', reserveInfo: 'Represents ownership of physical gold held in reserve.', features: ['Fungible'], },
  'e-cedi': { officialName: 'eCedi', issuer: 'Bank of Ghana (Pilot)', website: '#', assetType: 'Central Bank Digital Currency (CBDC)', reserveInfo: 'Direct liability of the central bank.', features: ['Pilot phase', 'Specific CBDC rules apply'], },
  'd-euro': { officialName: 'Digital Euro (Concept)', issuer: 'European Central Bank (Investigative Phase)', website: '#', assetType: 'Central Bank Digital Currency (CBDC)', reserveInfo: 'Direct liability of the central bank (proposed).', features: ['Under investigation', 'Potential privacy features'], }
};
// Mapping from asset ID to its corresponding logo file path (in /public/logos/).
const assetLogos = {
  'usdc': '/logos/circle.png',
  'usdt': '/logos/tether.svg',
  't-gold': '/logos/bog.png',
  'e-cedi': '/logos/bog.png',
  'd-euro': '/logos/ecb.png',
};
// Mapping from blockchain name string to its corresponding logo file path (in /public/logos/).
const blockchainLogos = {
  'Stellar': '/logos/stellar.png',
  'Ethereum': '/logos/ethereum.png',
  'Polygon': '/logos/polygon.png',
  'Hedera': '/logos/hedera.png',
  'Solana': '/logos/solana.png',
};

// Simulated User Initials
const currentUserInitials = 'DB';

/**
 * Manages the state and routing for the Token Management feature.
 * Includes a history log for tracking key actions.
 */
const TokenDashboard = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [assets, setAssets] = useState(initialAssets);
  const [selectedAssetId, setSelectedAssetId] = useState(null);
  const [historyLog, setHistoryLog] = useState([]);

  // Function to Add History Entry
  const addHistoryEntry = (actionType, details, userInitials, approverInitials) => {
    const newEntry = {
      id: Date.now() + Math.random(),
      timestamp: new Date(),
      actionType: actionType,
      details: details,
      user: userInitials,
      approver: approverInitials,
    };
    setHistoryLog(prevLog => [newEntry, ...prevLog]);
  };

  // Navigation Logic
  const handleNavigate = (view) => setCurrentView(view);
  const handleAssetCardClick = (assetId) => { setSelectedAssetId(assetId); setCurrentView('assetDetail'); };
  const handleBackToDashboard = () => { setSelectedAssetId(null); setCurrentView('dashboard'); };
  const handleNavigateNew = () => setCurrentView('issuance');
  const handleNavigateExisting = () => setCurrentView('issueExisting');

  // State Update Logic (Action Handlers - With History)
  const handleIssueToken = (fullTokenData) => {
    // ... (keep existing handleIssueToken implementation including addHistoryEntry call)
    const amountToAdd = fullTokenData.supplyDetails?.initialSupply;
    const tokenSymbol = fullTokenData.tokenDetails?.symbol;
    const tokenName = fullTokenData.tokenDetails?.name;
    const tokenBlockchain = fullTokenData.tokenDetails?.blockchain;
    const valueDefinitionString = fullTokenData.supplyDetails?.valueDefinition;

    if (typeof amountToAdd !== 'number' || isNaN(amountToAdd) || amountToAdd <= 0) { alert("Invalid amount for issuance."); setCurrentView('dashboard'); return; }
    if (!tokenSymbol || !tokenName || !tokenBlockchain) { alert("Missing name, symbol, or blockchain."); setCurrentView('dashboard'); return; }
    const isDuplicate = assets.some(asset => asset.symbol === tokenSymbol);
    if (isDuplicate) { alert(`Error: An asset with the symbol "${tokenSymbol}" already exists.`); return; }

    let parsedValueDefinition = null;
    if (valueDefinitionString && valueDefinitionString.trim()) { /* ... parsing logic ... */ }

    let newAssetId = '';
    setAssets(currentAssets => {
        const generatedId = tokenSymbol.toLowerCase().replace(/[^a-z0-9]/g, '-');
        newAssetId = generatedId;
        const newAssetObject = {
          id: generatedId, label: tokenName, balance: amountToAdd, symbol: tokenSymbol,
          description: `Manage ${tokenName} (${tokenSymbol}) on ${tokenBlockchain}.`,
          blockchain: tokenBlockchain, supply: fullTokenData.supplyDetails?.supplyType === 'infinite' ? 'Infinite' : 'Finite',
          isWizardIssued: true, parsedValueDefinition: parsedValueDefinition,
          wizardData: JSON.parse(JSON.stringify(fullTokenData))
        };
        return [...currentAssets, newAssetObject];
    });

    addHistoryEntry('Issue', `Issued ${amountToAdd.toLocaleString()} ${tokenSymbol}`, currentUserInitials, 'MG');
    setCurrentView('dashboard');
    alert(`${amountToAdd.toLocaleString()} ${tokenSymbol} issued successfully!`);
  };

  const handleMintTokens = (mintData) => {
    // ... (keep existing handleMintTokens implementation including addHistoryEntry call)
    let symbol = '';
    setAssets(currentAssets => {
      const assetIndex = currentAssets.findIndex(asset => asset.id === mintData.assetId);
      if (assetIndex === -1) { alert("Error: Could not find the asset to mint."); return currentAssets; }
      symbol = currentAssets[assetIndex].symbol;
      return currentAssets.map((asset, index) => index === assetIndex ? { ...asset, balance: asset.balance + mintData.amount } : asset );
    });

    if (symbol) {
        addHistoryEntry('Mint', `Minted ${mintData.amount.toLocaleString()} ${symbol}${mintData.reason ? ` (Reason: ${mintData.reason})` : ''}`, currentUserInitials, 'TR');
        alert(`${mintData.amount.toLocaleString()} ${symbol} minted successfully! Reason: ${mintData.reason || 'N/A'}`);
        setCurrentView('dashboard');
    }
  };

  const handleBurnTokens = ({ assetId, amount, reason, notes }) => {
    // ... (keep existing handleBurnTokens implementation including addHistoryEntry call)
    let burnSuccessful = false;
    let symbol = '';
    setAssets(currentAssets => {
      const assetIndex = currentAssets.findIndex(asset => asset.id === assetId);
      if (assetIndex === -1) { alert("Error: Could not find the asset to burn."); return currentAssets; }
      const assetToUpdate = currentAssets[assetIndex];
      if (assetToUpdate.balance < amount) { alert(`Error: Insufficient balance.`); return currentAssets; }
      symbol = assetToUpdate.symbol;
      burnSuccessful = true;
      return currentAssets.map((asset, index) => index === assetIndex ? { ...asset, balance: asset.balance - amount } : asset );
    });

    if (burnSuccessful && symbol) {
        addHistoryEntry('Burn', `Burned ${amount.toLocaleString()} ${symbol} (Reason: ${reason || 'N/A'})`, currentUserInitials, 'TR');
        alert(`${amount.toLocaleString()} ${symbol} burned successfully!`);
        setCurrentView('dashboard');
    }
  };

  const handleRedeemTokens = (redeemData) => {
    // ... (keep existing handleRedeemTokens implementation including addHistoryEntry call)
    let transactionSuccessful = false;
    let alertMessage = "Redemption failed.";
    let logDetails = '';
    let sourceSymbol = '';

    setAssets(currentAssets => { /* ... state update logic ... */ });

    if (transactionSuccessful) {
        addHistoryEntry('Redeem', logDetails, currentUserInitials, 'SA');
        // ... alert logic ...
        alert(alertMessage);
        setCurrentView('dashboard');
    }
  };

  const handleUpdatePausableStatus = ({ assetId, newStatus }) => {
      // ... (keep existing handleUpdatePausableStatus implementation including addHistoryEntry call)
    let symbol = '';
    setAssets(currentAssets => { /* ... state update logic ... */ });

    if (symbol) {
        addHistoryEntry('Pause Toggle', `Transactions for ${symbol} ${newStatus ? 'Paused' : 'Unpaused'}`, currentUserInitials, 'PR');
        alert(`Asset ${symbol} transactions ${newStatus ? 'paused' : 'unpaused'} successfully after approval.`);
    }
  };

  // --- NEW: Handler for Logging Reserve Alert Changes ---
  const handleLogReserveAlertChange = ({ assetId, symbol, threshold }) => {
     addHistoryEntry(
         'Reserve Alert',
         `Alert threshold for ${symbol} set to ${threshold}%`,
         currentUserInitials,
         'SA' // System Admin / Self action
     );
     // Alert is handled within ReserveManagementScreen, no need to duplicate here
  };
  // --- END NEW HANDLER ---

  // Utility function to format numbers.
  const formatNumber = (num) => {
    if (typeof num !== 'number' || isNaN(num)) { return String(num); }
    return num.toLocaleString();
  };

  // --- Render Logic ---
  return (
    <>
      {/* Dashboard Grid View */}
      {currentView === 'dashboard' && (
        <div className="p-8">
          {/* ... Header, Action Cards, Asset Cards ... */}
          <h1 className="text-2xl font-bold mb-6 text-gray-800">Token Management Dashboard</h1>
          {/* Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6"> <div className="bg-white p-4 rounded shadow"><h2 className="font-bold border-b pb-2 mb-4 text-gray-800">Issue / Mint</h2><p className="text-sm text-gray-600 mb-3">Issue new tokens or mint more of existing ones.</p><button className="px-4 py-2 rounded text-white hover:opacity-90 bg-emtech-gold" onClick={() => handleNavigate('issuanceChoice')}>Issue / Mint</button></div> <div className="bg-white p-4 rounded shadow"><h2 className="font-bold border-b pb-2 mb-4 text-gray-800">Burn</h2><p className="text-sm text-gray-600 mb-3">Remove tokens from circulation permanently.</p><button className="px-4 py-2 rounded text-white hover:opacity-90 bg-emtech-gold" onClick={() => handleNavigate('burn')}>Burn Tokens</button></div> </div> <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6"> <div className="bg-white p-4 rounded shadow"><h2 className="font-bold border-b pb-2 mb-4 text-gray-800">Redeem</h2><p className="text-sm text-gray-600 mb-3">Redeem tokens for underlying assets or value.</p><button className="px-4 py-2 rounded text-white hover:opacity-90 bg-emtech-gold" onClick={() => handleNavigate('redeem')}>Redeem Tokens</button></div> <div className="bg-white p-4 rounded shadow"><h2 className="font-bold border-b pb-2 mb-4 text-gray-800">Reserve</h2><p className="text-sm text-gray-600 mb-3">Manage and view token reserve assets.</p><button className="px-4 py-2 rounded text-white hover:opacity-90 bg-emtech-gold" onClick={() => handleNavigate('reserve')}>View Reserves</button></div> </div>
          {/* Asset Cards */}
          <h2 className="text-xl font-semibold mb-4 text-gray-700 mt-8">Asset Reserves Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"> {assets.map(asset => ( <div key={asset.id} className="bg-white p-4 rounded shadow flex flex-col cursor-pointer border border-transparent hover:shadow-lg hover:border-gray-400 transition-all" onClick={() => handleAssetCardClick(asset.id)} > <div className="flex items-center border-b pb-2 mb-2"> {asset.isWizardIssued ? ( <img src="/logos/generic-token.png" alt="User-issued token" className="h-5 w-5 mr-2"/> ) : ( assetLogos[asset.id] && ( <img src={assetLogos[asset.id]} alt={`${asset.label} logo`} className="h-5 w-5 mr-2"/> ) )} <h3 className="font-bold text-gray-800">{asset.label}</h3> </div> <p className="text-sm text-gray-600 mb-3 flex-grow">{asset.description}</p> <p className="text-xs text-gray-500 mb-3">Supply: {asset.supply}</p> {asset.blockchain && ( <div className="flex items-center text-xs text-gray-400 mb-3"> {blockchainLogos[asset.blockchain] && ( <img src={blockchainLogos[asset.blockchain]} alt={`${asset.blockchain} logo`} className="h-4 w-4 mr-1.5" /> )} <span>On: {asset.blockchain}</span> </div> )} <div className="mt-auto bg-gray-100 p-3 rounded"><div className="flex justify-between items-center"><span className="text-sm text-gray-700">Balance:</span><span className="font-bold text-sm">{formatNumber(asset.balance)} {asset.symbol}</span></div></div> </div> ))} </div>

          {/* History Log Section */}
          <div className="mt-12">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">History</h2>
            <div className="bg-white p-4 rounded shadow overflow-x-auto">
              {historyLog.length === 0 ? ( <p className="text-center text-gray-500 italic">No history yet.</p> ) : ( <table className="min-w-full divide-y divide-gray-200 text-sm"> <thead className="bg-gray-50"> <tr> <th scope="col" className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Timestamp</th> <th scope="col" className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">User</th> <th scope="col" className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Action</th> <th scope="col" className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Details</th> <th scope="col" className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Approver</th> </tr> </thead> <tbody className="bg-white divide-y divide-gray-200"> {historyLog.map((entry) => ( <tr key={entry.id}> <td className="px-4 py-2 whitespace-nowrap text-gray-500">{entry.timestamp.toLocaleString()}</td> <td className="px-4 py-2 whitespace-nowrap text-gray-900">{entry.user}</td> <td className="px-4 py-2 whitespace-nowrap text-gray-900 font-medium">{entry.actionType}</td> <td className="px-4 py-2 text-gray-700">{entry.details}</td> <td className="px-4 py-2 whitespace-nowrap text-gray-900">{entry.approver}</td> </tr> ))} </tbody> </table> )}
            </div>
          </div>
        </div>
      )}

      {/* Other Views Rendering */}
      {/* Asset Detail View */}
      {currentView === 'assetDetail' && selectedAssetId && (
        (() => {
          const selectedAsset = assets.find(asset => asset.id === selectedAssetId);
          if (!selectedAsset) { console.error("Selected asset not found, returning to dashboard."); setCurrentView('dashboard'); setSelectedAssetId(null); return null; }
          return (
              <AssetDetailView
                    asset={selectedAsset}
                    hardcodedDetailsMap={hardcodedAssetDetails}
                    onBack={handleBackToDashboard}
                    assetLogosMap={assetLogos}
                    blockchainLogosMap={blockchainLogos}
                    onUpdatePausableStatus={handleUpdatePausableStatus}
              />
          );
        })()
      )}
      {/* Issuance Flow Screens */}
      {currentView === 'issuanceChoice' && ( <IssuanceChoiceScreen onSelectNew={handleNavigateNew} onSelectExisting={handleNavigateExisting} onBack={() => setCurrentView('dashboard')} /> )}
      {currentView === 'issuance' && ( <TokenIssuanceWizard onBack={() => setCurrentView('dashboard')} onIssue={handleIssueToken} /> )}
      {currentView === 'issueExisting' && ( <MintExistingToken assets={assets} onMint={handleMintTokens} onBack={() => setCurrentView('issuanceChoice')} /> )}
      {/* Other Action Screens */}
      {currentView === 'burn' && ( <BurnTokenScreen assets={assets} onBurn={handleBurnTokens} onBack={() => setCurrentView('dashboard')} /> )}
      {currentView === 'redeem' && ( <RedeemTokenScreen assets={assets} onRedeem={handleRedeemTokens} onBack={() => setCurrentView('dashboard')} /> )}
      {currentView === 'reserve' && (
        <ReserveManagementScreen
            assets={assets}
            assetLogosMap={assetLogos}
            // --- Pass the new handler ---
            onLogReserveAlertChange={handleLogReserveAlertChange}
            onBack={() => setCurrentView('dashboard')}
        />
       )}
    </>
  );
};

export default TokenDashboard;