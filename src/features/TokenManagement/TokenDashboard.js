import React, { useState } from 'react';
import TokenIssuanceWizard from '../TokenIssuance/TokenIssuanceWizard';
import IssuanceChoiceScreen from '../TokenIssuance/IssuanceChoiceScreen';
import AssetDetailView from './AssetDetailView';
import MintExistingToken from '../TokenIssuance/MintExistingToken';
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
  // Note: Logos for user-issued assets are handled generically or need explicit mapping if desired.
};

// Mapping from blockchain name string to its corresponding logo file path (in /public/logos/).
const blockchainLogos = {
  'Stellar': '/logos/stellar.png',
  'Ethereum': '/logos/ethereum.png',
  'Polygon': '/logos/polygon.png',
  'Hedera': '/logos/hedera.png',
  'Solana': '/logos/solana.png',
};


/**
 * Manages the state and routing for the Token Management feature.
 * It holds the list of assets and controls which sub-view (dashboard grid,
 * asset details, issuance wizard, mint, burn, redeem, reserve screens) is displayed.
 * It also defines the callback handlers that update the asset list based on actions
 * performed in the sub-components (issuing, minting, burning, redeeming).
 */
const TokenDashboard = () => {
  // State controlling the currently displayed sub-view within the Token Management feature.
  const [currentView, setCurrentView] = useState('dashboard');
  // State holding the list of all managed assets (predefined and user-issued).
  const [assets, setAssets] = useState(initialAssets);
  // State holding the ID of the asset selected for viewing details.
  const [selectedAssetId, setSelectedAssetId] = useState(null);

  // --- Navigation Logic ---

  // Generic navigation to different views/screens within the Token Management feature.
  const handleNavigate = (view) => {
    setCurrentView(view);
  };

  // Handles clicking an asset card on the dashboard grid to show its details.
  const handleAssetCardClick = (assetId) => {
    setSelectedAssetId(assetId);
    setCurrentView('assetDetail');
  };

  // Handles returning to the main dashboard grid from a detail view.
  const handleBackToDashboard = () => {
    setSelectedAssetId(null);
    setCurrentView('dashboard');
  };

  // Specific navigation handlers called by IssuanceChoiceScreen.
  const handleNavigateNew = () => { setCurrentView('issuance'); };
  const handleNavigateExisting = () => { setCurrentView('issueExisting'); };


  // --- State Update Logic (Action Handlers) ---

  // Handles data submitted from the TokenIssuanceWizard to create a new asset.
  const handleIssueToken = (fullTokenData) => {
    const amountToAdd = fullTokenData.supplyDetails?.initialSupply;
    const tokenSymbol = fullTokenData.tokenDetails?.symbol;
    const tokenName = fullTokenData.tokenDetails?.name;
    const tokenBlockchain = fullTokenData.tokenDetails?.blockchain;
    const valueDefinitionString = fullTokenData.supplyDetails?.valueDefinition;

    // Validation
    if (typeof amountToAdd !== 'number' || isNaN(amountToAdd) || amountToAdd <= 0) { alert("Invalid amount for issuance."); setCurrentView('dashboard'); return; }
    if (!tokenSymbol || !tokenName || !tokenBlockchain) { alert("Missing name, symbol, or blockchain."); setCurrentView('dashboard'); return; }
    const isDuplicate = assets.some(asset => asset.symbol === tokenSymbol);
    if (isDuplicate) { alert(`Error: An asset with the symbol "${tokenSymbol}" already exists.`); return; }

    // Parse Value Definition (assuming "[Number] [Symbol]" format, e.g., "0.5 USDC")
    let parsedValueDefinition = null;
    if (valueDefinitionString && valueDefinitionString.trim()) {
      const parts = valueDefinitionString.trim().split(' ');
      if (parts.length === 2) {
        const value = parseFloat(parts[0]);
        const targetSymbol = parts[1].toUpperCase();
        // Check against predefined symbols for simplicity
        const targetAssetExists = initialAssets.some(a => a.symbol.toUpperCase() === targetSymbol);
        if (!isNaN(value) && value > 0 && targetSymbol.length > 0 && targetAssetExists) {
          parsedValueDefinition = { value: value, targetSymbol: targetSymbol };
        }
      }
      if (!parsedValueDefinition) {
          console.warn("Could not parse value definition or target symbol not recognized:", valueDefinitionString);
          // Optionally alert user about format issue
      }
    }

    // Update assets state
    setAssets(currentAssets => {
        const newAssetObject = {
          id: tokenSymbol.toLowerCase().replace(/[^a-z0-9]/g, '-'), // Simple ID generation
          label: tokenName, balance: amountToAdd, symbol: tokenSymbol,
          description: `Manage ${tokenName} (${tokenSymbol}) on ${tokenBlockchain}.`,
          blockchain: tokenBlockchain, supply: fullTokenData.supplyDetails?.supplyType === 'infinite' ? 'Infinite' : 'Finite',
          isWizardIssued: true,
          parsedValueDefinition: parsedValueDefinition, // Store parsed value
          wizardData: JSON.parse(JSON.stringify(fullTokenData)) // Store full config
        };
        return [...currentAssets, newAssetObject];
    });
    setCurrentView('dashboard');
    alert(`${amountToAdd.toLocaleString()} ${tokenSymbol} issued successfully!`);
  };

  // Handles data submitted from MintExistingToken to increase an asset's balance.
  const handleMintTokens = (mintData) => {
    setAssets(currentAssets => {
      const assetIndex = currentAssets.findIndex(asset => asset.id === mintData.assetId);
      if (assetIndex === -1) { alert("Error: Could not find the asset to mint."); return currentAssets; }
      return currentAssets.map((asset, index) => index === assetIndex ? { ...asset, balance: asset.balance + mintData.amount } : asset );
    });
    // Find asset *after* potential state update for accurate symbol in alert
    const mintedAsset = assets.find(a => a.id === mintData.assetId); // Note: May not reflect immediate update yet
    const amountText = mintData.amount.toLocaleString();
    const symbolText = mintedAsset?.symbol || 'tokens';
    const reasonText = mintData.reason || 'N/A';
    alert(`${amountText} ${symbolText} minted successfully! Reason: ${reasonText}`);
    setCurrentView('dashboard');
  };

  // Handles data submitted from BurnTokenScreen to decrease an asset's balance.
  const handleBurnTokens = ({ assetId, amount, reason, notes }) => {
    let burnSuccessful = false;
    setAssets(currentAssets => {
      const assetIndex = currentAssets.findIndex(asset => asset.id === assetId);
      if (assetIndex === -1) { alert("Error: Could not find the asset to burn."); return currentAssets; }
      const assetToUpdate = currentAssets[assetIndex];
      if (assetToUpdate.balance < amount) { alert(`Error: Insufficient balance. Cannot burn ${amount.toLocaleString()} ${assetToUpdate.symbol}.`); return currentAssets; }
      burnSuccessful = true;
      return currentAssets.map((asset, index) => index === assetIndex ? { ...asset, balance: asset.balance - amount } : asset );
    });
    if (burnSuccessful) {
        const burnedAsset = assets.find(a => a.id === assetId);
        alert(`${amount.toLocaleString()} ${burnedAsset?.symbol || 'tokens'} burned successfully!`);
        setCurrentView('dashboard');
    }
  };

  // Handles data submitted from RedeemTokenScreen to update balances (decrease source, potentially increase target).
  const handleRedeemTokens = (redeemData) => {
    let transactionSuccessful = false;
    let alertMessage = "Redemption failed.";

    setAssets(currentAssets => {
      const sourceAssetId = redeemData.mode === 'cross_token' ? redeemData.sourceAssetId : redeemData.assetId;
      const sourceAssetIndex = currentAssets.findIndex(asset => asset.id === sourceAssetId);
      if (sourceAssetIndex === -1) { alert("Error: Could not find the asset to redeem from."); return currentAssets; }
      const sourceAsset = currentAssets[sourceAssetIndex];
      if (sourceAsset.balance < redeemData.amount) { alert(`Error: Insufficient ${sourceAsset.symbol} balance.`); return currentAssets; }

      let targetAssetIndex = -1;
      if (redeemData.mode === 'cross_token') {
          targetAssetIndex = currentAssets.findIndex(asset => asset.id === redeemData.targetAssetId);
          if (targetAssetIndex === -1) { alert(`Error: Could not find the target asset.`); return currentAssets; }
          if (sourceAssetIndex === targetAssetIndex) { alert("Error: Cannot redeem an asset for itself."); return currentAssets; }
      }

      transactionSuccessful = true; // Assume success if checks pass
      return currentAssets.map((asset, index) => {
          if (index === sourceAssetIndex) { return { ...asset, balance: asset.balance - redeemData.amount }; } // Decrease source
          if (redeemData.mode === 'cross_token' && index === targetAssetIndex) { const targetAmountToAdd = parseFloat(redeemData.targetAmount) || 0; return { ...asset, balance: asset.balance + targetAmountToAdd }; } // Increase target
          return asset; // Keep others unchanged
      });
    });

    if (transactionSuccessful) {
        const sourceAsset = assets.find(a => a.id === (redeemData.sourceAssetId || redeemData.assetId));
        if (redeemData.mode === 'underlying') { alertMessage = `${redeemData.amount.toLocaleString()} ${sourceAsset?.symbol || 'tokens'} redemption processed!\nValue sent to: ${redeemData.receivingAccount}`; }
        else { const targetAsset = assets.find(a => a.id === redeemData.targetAssetId); alertMessage = `Swapped ${redeemData.amount.toLocaleString()} ${sourceAsset?.symbol || ''} for approx. ${redeemData.targetAmount.toLocaleString(undefined, {maximumFractionDigits: 4})} ${targetAsset?.symbol || ''}!\nFunds sent to: ${redeemData.receivingAccount}`; }
        alert(alertMessage);
        setCurrentView('dashboard');
    }
  };

  // Utility function to format numbers.
  const formatNumber = (num) => {
    if (typeof num !== 'number' || isNaN(num)) { return String(num); }
    return num.toLocaleString();
  };


  // --- Render Logic: Conditionally display sub-components ---
  return (
    <>
      {/* Dashboard Grid View */}
      {currentView === 'dashboard' && (
        <div className="p-8">
          <h1 className="text-2xl font-bold mb-6 text-gray-800">Token Management Dashboard</h1>
          {/* Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white p-4 rounded shadow"><h2 className="font-bold border-b pb-2 mb-4 text-gray-800">Issue / Mint</h2><p className="text-sm text-gray-600 mb-3">Issue new tokens or mint more of existing ones.</p><button className="px-4 py-2 rounded text-white hover:opacity-90 bg-emtech-gold" onClick={() => handleNavigate('issuanceChoice')}>Issue / Mint</button></div>
            <div className="bg-white p-4 rounded shadow"><h2 className="font-bold border-b pb-2 mb-4 text-gray-800">Burn</h2><p className="text-sm text-gray-600 mb-3">Remove tokens from circulation permanently.</p><button className="px-4 py-2 rounded text-white hover:opacity-90 bg-emtech-gold" onClick={() => handleNavigate('burn')}>Burn Tokens</button></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white p-4 rounded shadow"><h2 className="font-bold border-b pb-2 mb-4 text-gray-800">Redeem</h2><p className="text-sm text-gray-600 mb-3">Redeem tokens for underlying assets or value.</p><button className="px-4 py-2 rounded text-white hover:opacity-90 bg-emtech-gold" onClick={() => handleNavigate('redeem')}>Redeem Tokens</button></div>
            <div className="bg-white p-4 rounded shadow"><h2 className="font-bold border-b pb-2 mb-4 text-gray-800">Reserve</h2><p className="text-sm text-gray-600 mb-3">Manage and view token reserve assets.</p><button className="px-4 py-2 rounded text-white hover:opacity-90 bg-emtech-gold" onClick={() => handleNavigate('reserve')}>View Reserves</button></div>
          </div>
          {/* Asset Cards */}
          <h2 className="text-xl font-semibold mb-4 text-gray-700 mt-8">Asset Reserves Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assets.map(asset => (
                <div key={asset.id} className="bg-white p-4 rounded shadow flex flex-col cursor-pointer border border-transparent hover:shadow-lg hover:border-gray-400 transition-all" onClick={() => handleAssetCardClick(asset.id)} >
                  <div className="flex items-center border-b pb-2 mb-2">
                    {asset.isWizardIssued ? ( <img src="/logos/generic-token.png" alt="User-issued token" className="h-5 w-5 mr-2"/> ) : ( assetLogos[asset.id] && ( <img src={assetLogos[asset.id]} alt={`${asset.label} logo`} className="h-5 w-5 mr-2"/> ) )}
                    <h3 className="font-bold text-gray-800">{asset.label}</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-3 flex-grow">{asset.description}</p>
                  <p className="text-xs text-gray-500 mb-3">Supply: {asset.supply}</p>
                  {asset.blockchain && (
                      <div className="flex items-center text-xs text-gray-400 mb-3">
                        {blockchainLogos[asset.blockchain] && ( <img src={blockchainLogos[asset.blockchain]} alt={`${asset.blockchain} logo`} className="h-4 w-4 mr-1.5" /> )}
                        <span>On: {asset.blockchain}</span>
                      </div>
                  )}
                  <div className="mt-auto bg-gray-100 p-3 rounded"><div className="flex justify-between items-center"><span className="text-sm text-gray-700">Balance:</span><span className="font-bold text-sm">{formatNumber(asset.balance)} {asset.symbol}</span></div></div>
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* Asset Detail View */}
      {currentView === 'assetDetail' && selectedAssetId && (
        (() => {
          const selectedAsset = assets.find(asset => asset.id === selectedAssetId);
          if (!selectedAsset) { console.error("Selected asset not found, returning to dashboard."); setCurrentView('dashboard'); setSelectedAssetId(null); return null; }
          return ( <AssetDetailView asset={selectedAsset} hardcodedDetailsMap={hardcodedAssetDetails} onBack={handleBackToDashboard} assetLogosMap={assetLogos} blockchainLogosMap={blockchainLogos} /> );
        })()
      )}

      {/* Issuance Flow Screens */}
      {currentView === 'issuanceChoice' && ( <IssuanceChoiceScreen onSelectNew={handleNavigateNew} onSelectExisting={handleNavigateExisting} onBack={() => setCurrentView('dashboard')} /> )}
      {currentView === 'issuance' && ( <TokenIssuanceWizard onBack={() => setCurrentView('dashboard')} onIssue={handleIssueToken} /> )}
      {currentView === 'issueExisting' && ( <MintExistingToken assets={assets} onMint={handleMintTokens} onBack={() => setCurrentView('issuanceChoice')} /> )}

      {/* Other Action Screens */}
      {currentView === 'burn' && ( <BurnTokenScreen assets={assets} onBurn={handleBurnTokens} onBack={() => setCurrentView('dashboard')} /> )}
      {currentView === 'redeem' && ( <RedeemTokenScreen assets={assets} onRedeem={handleRedeemTokens} onBack={() => setCurrentView('dashboard')} /> )}
      {currentView === 'reserve' && ( <ReserveManagementScreen assets={assets} assetLogosMap={assetLogos} onBack={() => setCurrentView('dashboard')} /> )}
    </>
  );
};

export default TokenDashboard;