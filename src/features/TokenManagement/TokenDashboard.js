import React, { useState } from 'react';
import TokenIssuanceWizard from '../TokenIssuance/TokenIssuanceWizard';
import IssuanceChoiceScreen from '../TokenIssuance/IssuanceChoiceScreen';
import AssetDetailView from './AssetDetailView';

// Initial sample data for assets displayed on the dashboard.
const initialAssets = [
  { id: 'usdc', label: 'USDC', balance: 10000000, symbol: 'USDC', description: 'Manage USDC stablecoin reserves.', supply: 'Finite', blockchain: 'Stellar' },
  { id: 'usdt', label: 'USDT', balance: 8500000, symbol: 'USDT', description: 'Manage USDT stablecoin reserves.', supply: 'Finite', blockchain: 'Ethereum' },
  { id: 't-gold', label: 'Tokenized Gold', balance: 5000, symbol: 'T-GOLD', description: 'Manage reserves for Gold-backed tokens.', supply: 'Finite', blockchain: 'Polygon' },
  { id: 'e-cedi', label: 'eCedi', balance: 15000000, symbol: 'eGH¢', description: 'Manage reserves for eCedi CBDC.', supply: 'Finite', blockchain: 'Hedera' },
  { id: 'd-euro', label: 'Digital Euro', balance: 9000000, symbol: 'D-EUR', description: 'Manage reserves for Digital Euro.', supply: 'Finite', blockchain: 'Ethereum' }
];

// Static detailed information for pre-defined assets, used in the AssetDetailView.
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


/**
 * Main component for the Token Management feature.
 * Displays an overview of assets and action cards (Issue, Burn, etc.).
 * Handles navigation between the main dashboard, asset detail view, issuance flows,
 * and other action placeholders. Manages the state for the list of assets.
 */
const TokenDashboard = () => {
  // State for controlling which view/sub-component is currently displayed.
  // Possible values: 'dashboard', 'assetDetail', 'issuanceChoice', 'issuance', 'issueExisting', 'burn', 'redeem', 'reserve'
  const [currentView, setCurrentView] = useState('dashboard');
  // State holding the array of asset objects displayed on the dashboard.
  const [assets, setAssets] = useState(initialAssets);
  // State storing the ID of the asset currently being viewed in detail (null if none).
  const [selectedAssetId, setSelectedAssetId] = useState(null);

  /**
   * Navigates to simple placeholder views like Burn, Redeem, Reserve.
   * @param {string} view - The target view name (e.g., 'burn').
   */
  const handleNavigate = (view) => {
    console.log(`Switching view to ${view}`); // Keep console logs for debugging if helpful
    setCurrentView(view);
  };

  /**
   * Handles clicking on an asset card in the dashboard grid.
   * Sets the selected asset ID and switches the view to 'assetDetail'.
   * @param {string} assetId - The unique ID of the clicked asset.
   */
  const handleAssetCardClick = (assetId) => {
    console.log(`Asset card clicked: ${assetId}`);
    setSelectedAssetId(assetId);
    setCurrentView('assetDetail');
  };

  /**
   * Handles navigating back from the asset detail view to the main dashboard.
   * Resets the selected asset ID and sets the view back to 'dashboard'.
   */
  const handleBackToDashboard = () => {
    console.log('Returning to dashboard from asset detail view.');
    setSelectedAssetId(null);
    setCurrentView('dashboard');
  };

  /**
   * Callback function passed to TokenIssuanceWizard.
   * Processes the complete configuration data for a newly issued token.
   * Adds the new token object (including wizardData) to the assets state.
   * If an asset with the same symbol exists, it currently only updates balance (intended for a future 'Mint Existing' flow).
   * Navigates back to the dashboard view upon completion.
   * @param {object} fullTokenData - The comprehensive data object received from TokenIssuanceWizard,
   * containing nested objects: tokenDetails, supplyDetails, permissionDetails, reserveDetails.
   */
  const handleIssueToken = (fullTokenData) => {
    console.log(`Processing issuance for:`, fullTokenData);
    // Extract data safely
    const amountToAdd = fullTokenData.supplyDetails?.initialSupply;
    const tokenSymbol = fullTokenData.tokenDetails?.symbol;
    const tokenName = fullTokenData.tokenDetails?.name;
    const tokenBlockchain = fullTokenData.tokenDetails?.blockchain;

    // Validate essential data
    if (typeof amountToAdd !== 'number' || isNaN(amountToAdd) || amountToAdd <= 0) {
      console.error("Invalid amount received for issuance:", amountToAdd);
      alert("An error occurred: Invalid amount for issuance.");
      setCurrentView('dashboard'); return; // Go back on error
    }
    if (!tokenSymbol || !tokenName || !tokenBlockchain) {
      console.error("Missing critical token details:", fullTokenData.tokenDetails);
      alert("An error occurred: Missing name, symbol, or blockchain.");
      setCurrentView('dashboard'); return; // Go back on error
    }

    setAssets(currentAssets => {
      const existingAssetIndex = currentAssets.findIndex(asset => asset.symbol === tokenSymbol);
      if (existingAssetIndex !== -1) {
        // This path is technically reachable if the user enters an existing symbol in the 'new token' wizard.
        // Currently, it just updates the balance. Consider adding a warning or preventing duplicate symbols earlier.
        console.warn(`Asset symbol ${tokenSymbol} already exists. Updating balance only.`);
        return currentAssets.map((asset, index) =>
          index === existingAssetIndex ? { ...asset, balance: asset.balance + amountToAdd } : asset
        );
      } else {
        // Create a new asset object for the state
        console.log("New asset. Adding to list.");
        const newAssetObject = {
          id: tokenSymbol.toLowerCase().replace(/[^a-z0-9]/g, '-'), // Generate simple ID
          label: tokenName,
          balance: amountToAdd,
          symbol: tokenSymbol,
          description: `Manage ${tokenName} (${tokenSymbol}) on ${tokenBlockchain}.`, // Basic description for card
          blockchain: tokenBlockchain,
          supply: fullTokenData.supplyDetails?.supplyType === 'infinite' ? 'Infinite' : 'Finite', // Simplified supply type for card
          isWizardIssued: true, // Flag for detail view logic
          wizardData: JSON.parse(JSON.stringify(fullTokenData)) // Store deep copy of all wizard config
        };
        console.log("Creating new asset object with config:", newAssetObject);
        return [...currentAssets, newAssetObject];
      }
    });
    setCurrentView('dashboard'); // Navigate back to dashboard
    alert(`${amountToAdd.toLocaleString()} ${tokenSymbol} processed successfully!`);
  };

  /**
   * Navigates to the 'issuance' view to start the TokenIssuanceWizard.
   * Called from IssuanceChoiceScreen.
   */
  const handleNavigateNew = () => {
    setCurrentView('issuance');
  };

  /**
   * Navigates to the 'issueExisting' placeholder view.
   * Called from IssuanceChoiceScreen.
   */
  const handleNavigateExisting = () => {
    setCurrentView('issueExisting');
  };

  /**
   * Utility function to format numbers with thousands separators.
   * @param {number} num - The number to format.
   * @returns {string} The formatted number string.
   */
  const formatNumber = (num) => {
    // Basic check to handle potential non-numeric values gracefully
    if (typeof num !== 'number' || isNaN(num)) {
      return String(num); // Return as string if not a valid number
    }
    return num.toLocaleString();
  };


  // --- Render Logic ---
  return (
    <>
      {/* Render main dashboard view */}
      {currentView === 'dashboard' && (
        <div className="p-8">
          <h1 className="text-2xl font-bold mb-6 text-gray-800">Token Management Dashboard</h1>
          {/* Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
             <div className="bg-white p-4 rounded shadow"><h2 className="font-bold border-b pb-2 mb-4 text-gray-800">Issue</h2><p className="text-sm text-gray-600 mb-3">Issue new tokens into circulation.</p><button className="px-4 py-2 rounded text-white hover:opacity-90 bg-emtech-gold" onClick={() => handleNavigate('issuanceChoice')}>Issue Tokens</button></div>
             <div className="bg-white p-4 rounded shadow"><h2 className="font-bold border-b pb-2 mb-4 text-gray-800">Burn</h2><p className="text-sm text-gray-600 mb-3">Remove tokens from circulation permanently.</p><button className="px-4 py-2 rounded text-white hover:opacity-90 bg-emtech-gold" onClick={() => handleNavigate('burn')}>Burn Tokens</button></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
             <div className="bg-white p-4 rounded shadow"><h2 className="font-bold border-b pb-2 mb-4 text-gray-800">Redeem</h2><p className="text-sm text-gray-600 mb-3">Redeem tokens for underlying assets or value.</p><button className="px-4 py-2 rounded text-white hover:opacity-90 bg-emtech-gold" onClick={() => handleNavigate('redeem')}>Redeem Tokens</button></div>
             <div className="bg-white p-4 rounded shadow"><h2 className="font-bold border-b pb-2 mb-4 text-gray-800">Reserve</h2><p className="text-sm text-gray-600 mb-3">Manage and view token reserve assets.</p><button className="px-4 py-2 rounded text-white hover:opacity-90 bg-emtech-gold" onClick={() => handleNavigate('reserve')}>View Reserves</button></div>
          </div>

          {/* Asset Reserves Overview */}
          <h2 className="text-xl font-semibold mb-4 text-gray-700 mt-8">Asset Reserves Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assets.map(asset => {
              // Map each asset in state to a clickable card component
              return (
                <div key={asset.id} className="bg-white p-4 rounded shadow flex flex-col cursor-pointer border border-transparent hover:shadow-lg hover:border-gray-400 transition-all" onClick={() => handleAssetCardClick(asset.id)} >
                  {/* Asset Logo + Label */}
                  <div className="flex items-center border-b pb-2 mb-2">
                    {asset.isWizardIssued ? ( <img src="/logos/generic-token.png" alt="User-issued token" className="h-5 w-5 mr-2"/> ) : ( assetLogos[asset.id] && ( <img src={assetLogos[asset.id]} alt={`${asset.label} logo`} className="h-5 w-5 mr-2"/> ) )}
                    <h3 className="font-bold text-gray-800">{asset.label}</h3>
                  </div>
                  {/* Description and Supply */}
                  <p className="text-sm text-gray-600 mb-3 flex-grow">{asset.description}</p>
                  <p className="text-xs text-gray-500 mb-3">Supply: {asset.supply}</p>
                  {/* Blockchain Logo + Text */}
                  {asset.blockchain && (
                      <div className="flex items-center text-xs text-gray-400 mb-3">
                        {blockchainLogos[asset.blockchain] && ( <img src={blockchainLogos[asset.blockchain]} alt={`${asset.blockchain} logo`} className="h-4 w-4 mr-1.5" /> )}
                        <span>On: {asset.blockchain}</span>
                      </div>
                  )}
                  {/* Balance display */}
                  <div className="mt-auto bg-gray-100 p-3 rounded"><div className="flex justify-between items-center"><span className="text-sm text-gray-700">Balance:</span><span className="font-bold text-sm">{formatNumber(asset.balance)} {asset.symbol}</span></div></div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Render asset detail view when selected */}
      {currentView === 'assetDetail' && selectedAssetId && (
        (() => {
          const selectedAsset = assets.find(asset => asset.id === selectedAssetId);
          // Handle case where asset might not be found after selection (e.g., state issue)
          if (!selectedAsset) {
            return <div className="p-8 text-red-600">Error: Asset not found. <button onClick={handleBackToDashboard}>Back</button></div>;
          }
          // Render the detail view component, passing necessary data and callbacks
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

      {/* Render other views/components based on currentView state */}
      {currentView === 'issuanceChoice' && ( <IssuanceChoiceScreen onSelectNew={handleNavigateNew} onSelectExisting={handleNavigateExisting} onBack={() => setCurrentView('dashboard')} /> )}
      {currentView === 'issuance' && ( <TokenIssuanceWizard onBack={() => setCurrentView('dashboard')} onIssue={handleIssueToken} /> )}

      {/* Placeholder Views */}
      {currentView === 'issueExisting' && ( <div className='p-8'><h1 className='text-2xl font-bold'>Issue More (Placeholder)</h1><p className='mt-4'>UI for selecting an existing token and amount goes here.</p><button className="mt-4 px-4 py-2 rounded border border-gray-300 hover:bg-gray-50" onClick={() => setCurrentView('dashboard')}>Back</button></div> )}
      {currentView === 'burn' && <div className='p-8'><h1 className='text-2xl'>Burn Screen Placeholder</h1><button className="mt-4 px-4 py-2 rounded border border-gray-300 hover:bg-gray-50" onClick={() => setCurrentView('dashboard')}>Back</button></div>}
      {currentView === 'redeem' && <div className='p-8'><h1 className='text-2xl'>Redeem Screen Placeholder</h1><button className="mt-4 px-4 py-2 rounded border border-gray-300 hover:bg-gray-50" onClick={() => setCurrentView('dashboard')}>Back</button></div>}
      {currentView === 'reserve' && <div className='p-8'><h1 className='text-2xl'>Reserve Screen Placeholder</h1><button className="mt-4 px-4 py-2 rounded border border-gray-300 hover:bg-gray-50" onClick={() => setCurrentView('dashboard')}>Back</button></div>}

    </>
  );
};

export default TokenDashboard;