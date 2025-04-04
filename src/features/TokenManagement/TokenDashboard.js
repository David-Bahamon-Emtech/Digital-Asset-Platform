import React, { useState } from 'react';
import TokenIssuanceWizard from '../TokenIssuance/TokenIssuanceWizard';
import IssuanceChoiceScreen from '../TokenIssuance/IssuanceChoiceScreen';
import AssetDetailView from './AssetDetailView'; // <-- IMPORT ADDED HERE

// Initial data for assets (Unchanged)
const initialAssets = [
  { id: 'usdc', label: 'USDC', balance: 10000000, symbol: 'USDC', description: 'Manage USDC stablecoin reserves.', supply: 'Finite', blockchain: 'Stellar' },
  { id: 'usdt', label: 'USDT', balance: 8500000, symbol: 'USDT', description: 'Manage USDT stablecoin reserves.', supply: 'Finite', blockchain: 'Ethereum' },
  { id: 't-gold', label: 'Tokenized Gold', balance: 5000, symbol: 'T-GOLD', description: 'Manage reserves for Gold-backed tokens.', supply: 'Finite', blockchain: 'Polygon' },
  { id: 'e-cedi', label: 'eCedi', balance: 15000000, symbol: 'eGH¢', description: 'Manage reserves for eCedi CBDC.', supply: 'Finite', blockchain: 'Hedera' },
  { id: 'd-euro', label: 'Digital Euro', balance: 9000000, symbol: 'D-EUR', description: 'Manage reserves for Digital Euro.', supply: 'Finite', blockchain: 'Ethereum' }
];

// --- Hardcoded details for pre-defined assets (Unchanged) ---
const hardcodedAssetDetails = {
  'usdc': { officialName: 'USD Coin', issuer: 'Circle Internet Financial', website: 'https://www.circle.com/en/usdc', assetType: 'Fiat-backed Stablecoin', reserveInfo: 'Backed by cash and short-duration U.S. Treasuries, attested monthly.', features: ['Pausable by issuer', 'Regulated', 'KYC/AML required'], },
  'usdt': { officialName: 'Tether', issuer: 'Tether Operations Limited', website: 'https://tether.to/', assetType: 'Fiat-backed Stablecoin', reserveInfo: 'Backed by various assets including cash, equivalents, secured loans, bonds, and other investments. Attested regularly.', features: ['Pausable by issuer', 'Regulated (varies by jurisdiction)'], },
  't-gold': { officialName: 'Tokenized Gold', issuer: 'Bank of Ghana', website: '#', assetType: 'Commodity-backed Token', reserveInfo: 'Represents ownership of physical gold held in reserve.', features: ['Fungible'], },
  'e-cedi': { officialName: 'eCedi', issuer: 'Bank of Ghana (Pilot)', website: '#', assetType: 'Central Bank Digital Currency (CBDC)', reserveInfo: 'Direct liability of the central bank.', features: ['Pilot phase', 'Specific CBDC rules apply'], },
  'd-euro': { officialName: 'Digital Euro (Concept)', issuer: 'European Central Bank (Investigative Phase)', website: '#', assetType: 'Central Bank Digital Currency (CBDC)', reserveInfo: 'Direct liability of the central bank (proposed).', features: ['Under investigation', 'Potential privacy features'], }
};

// --- Logo Mappings (As provided by you) ---
const assetLogos = {
  'usdc': '/logos/circle.png',
  'usdt': '/logos/tether.svg',
  't-gold': '/logos/bog.png',
  'e-cedi': '/logos/bog.png',
  'd-euro': '/logos/ecb.png',
};
const blockchainLogos = {
  'Stellar': '/logos/stellar.png',
  'Ethereum': '/logos/ethereum.png',
  'Polygon': '/logos/polygon.png',
  'Hedera': '/logos/hedera.png',
};
// --- END OF LOGO MAPPINGS ---


const TokenDashboard = () => {
  // --- State (Unchanged) ---
  const [currentView, setCurrentView] = useState('dashboard');
  const [assets, setAssets] = useState(initialAssets);
  const [selectedAssetId, setSelectedAssetId] = useState(null);

  // --- Event Handlers (Unchanged) ---
  const handleNavigate = (view) => { console.log(`Switching view to ${view}`); setCurrentView(view); };
  const handleAssetCardClick = (assetId) => { console.log(`Asset card clicked: ${assetId}`); setSelectedAssetId(assetId); setCurrentView('assetDetail'); };
  const handleBackToDashboard = () => { console.log('Returning to dashboard from asset detail view.'); setSelectedAssetId(null); setCurrentView('dashboard'); };
  const handleIssueToken = (fullTokenData) => { /* ... Full updated handleIssueToken function ... */
    console.log(`Processing issuance for:`, fullTokenData);
    const amountToAdd = fullTokenData.supplyDetails.initialSupply;
    const tokenSymbol = fullTokenData.tokenDetails.symbol;
    const tokenName = fullTokenData.tokenDetails.name;
    const tokenBlockchain = fullTokenData.tokenDetails.blockchain;
    if (typeof amountToAdd !== 'number' || isNaN(amountToAdd) || amountToAdd <= 0) { console.error("Invalid amount..."); alert("An error occurred..."); setCurrentView('dashboard'); return; }
    if (!tokenSymbol || !tokenName || !tokenBlockchain) { console.error("Missing critical token details..."); alert("An error occurred..."); setCurrentView('dashboard'); return; }
    setAssets(currentAssets => {
      const existingAssetIndex = currentAssets.findIndex(asset => asset.symbol === tokenSymbol);
      if (existingAssetIndex !== -1) {
        console.log("Existing asset found. Updating balance.");
        return currentAssets.map((asset, index) => index === existingAssetIndex ? { ...asset, balance: asset.balance + amountToAdd } : asset);
      } else {
        console.log("New asset. Adding to list.");
        const newAssetObject = {
          id: tokenSymbol.toLowerCase().replace(/[^a-z0-9]/g, '-'), label: tokenName, balance: amountToAdd, symbol: tokenSymbol,
          description: `Manage ${tokenName} (${tokenSymbol}) on ${tokenBlockchain}.`, blockchain: tokenBlockchain,
          supply: fullTokenData.supplyDetails.supplyType === 'infinite' ? 'Infinite' : 'Finite',
          isWizardIssued: true, wizardData: JSON.parse(JSON.stringify(fullTokenData))
        };
        console.log("Creating new asset object with config:", newAssetObject);
        return [...currentAssets, newAssetObject];
      }
    });
    setCurrentView('dashboard');
    alert(`${amountToAdd.toLocaleString()} ${tokenSymbol} processed successfully!`);
  };
  const handleNavigateNew = () => { setCurrentView('issuance'); };
  const handleNavigateExisting = () => { setCurrentView('issueExisting'); };
  const formatNumber = (num) => num.toLocaleString();
  // --- End Event Handlers ---


  // --- Render Logic (Updated Blockchain Rendering) ---
  return (
    <>
      {/* --- Main Dashboard View --- */}
      {currentView === 'dashboard' && (
        <div className="p-8">
          <h1 className="text-2xl font-bold mb-6 text-gray-800">Token Management Dashboard</h1>
          {/* Action Cards (Unchanged) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6"> {/* Issue/Burn */}
             <div className="bg-white p-4 rounded shadow"><h2 className="font-bold border-b pb-2 mb-4 text-gray-800">Issue</h2><p className="text-sm text-gray-600 mb-3">Issue new tokens into circulation.</p><button className="px-4 py-2 rounded text-white hover:opacity-90 bg-emtech-gold" onClick={() => handleNavigate('issuanceChoice')}>Issue Tokens</button></div>
             <div className="bg-white p-4 rounded shadow"><h2 className="font-bold border-b pb-2 mb-4 text-gray-800">Burn</h2><p className="text-sm text-gray-600 mb-3">Remove tokens from circulation permanently.</p><button className="px-4 py-2 rounded text-white hover:opacity-90 bg-emtech-gold" onClick={() => handleNavigate('burn')}>Burn Tokens</button></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6"> {/* Redeem/Reserve */}
             <div className="bg-white p-4 rounded shadow"><h2 className="font-bold border-b pb-2 mb-4 text-gray-800">Redeem</h2><p className="text-sm text-gray-600 mb-3">Redeem tokens for underlying assets or value.</p><button className="px-4 py-2 rounded text-white hover:opacity-90 bg-emtech-gold" onClick={() => handleNavigate('redeem')}>Redeem Tokens</button></div>
             <div className="bg-white p-4 rounded shadow"><h2 className="font-bold border-b pb-2 mb-4 text-gray-800">Reserve</h2><p className="text-sm text-gray-600 mb-3">Manage and view token reserve assets.</p><button className="px-4 py-2 rounded text-white hover:opacity-90 bg-emtech-gold" onClick={() => handleNavigate('reserve')}>View Reserves</button></div>
          </div>

          {/* Asset Reserves Overview (Clickable) */}
          <h2 className="text-xl font-semibold mb-4 text-gray-700 mt-8">Asset Reserves Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assets.map(asset => (
              <div key={asset.id} className="bg-white p-4 rounded shadow flex flex-col cursor-pointer border border-transparent hover:shadow-lg hover:border-gray-400 transition-all" onClick={() => handleAssetCardClick(asset.id)} >
                {/* Asset Logo + Label (Unchanged) */}
                <div className="flex items-center border-b pb-2 mb-2">
                  {assetLogos[asset.id] && ( <img src={assetLogos[asset.id]} alt={`${asset.label} logo`} className="h-5 w-5 mr-2" /> )}
                  <h3 className="font-bold text-gray-800">{asset.label}</h3>
                </div>
                {/* Description and Supply (Unchanged) */}
                <p className="text-sm text-gray-600 mb-3 flex-grow">{asset.description}</p>
                <p className="text-xs text-gray-500 mb-3">Supply: {asset.supply}</p>

                {/* --- MODIFIED BLOCK for Blockchain Logo + Text --- */}
                {asset.blockchain && ( // Check if blockchain data exists
                    <div className="flex items-center text-xs text-gray-400 mb-3"> {/* Flex container */}
                      {/* Conditionally render the blockchain logo image */}
                      {blockchainLogos[asset.blockchain] && ( // Check if a logo exists for this blockchain
                        <img
                          src={blockchainLogos[asset.blockchain]} // Get path from map
                          alt={`${asset.blockchain} logo`}
                          className="h-4 w-4 mr-1.5" // Size and margin
                        />
                      )}
                      {/* Display the text */}
                      <span>On: {asset.blockchain}</span>
                    </div>
                )}
                {/* --- END OF MODIFIED BLOCK --- */}

                {/* Balance display (Unchanged) */}
                <div className="mt-auto bg-gray-100 p-3 rounded"><div className="flex justify-between items-center"><span className="text-sm text-gray-700">Balance:</span><span className="font-bold text-sm">{formatNumber(asset.balance)} {asset.symbol}</span></div></div>
              </div>
            ))}
          </div> {/* End Asset Grid */}
        </div> // End Dashboard View Container
      )} {/* End Dashboard View Conditional Render */}


      {/* --- Conditional Rendering for Asset Detail View (Unchanged) --- */}
      {currentView === 'assetDetail' && selectedAssetId && (
        (() => {
          const selectedAsset = assets.find(asset => asset.id === selectedAssetId);
          if (!selectedAsset) {
            return <div className="p-8 text-red-600">Error: Asset not found. <button onClick={handleBackToDashboard}>Back</button></div>;
          }
          return ( <AssetDetailView asset={selectedAsset} hardcodedDetailsMap={hardcodedAssetDetails} onBack={handleBackToDashboard} /> );
        })()
      )}
      {/* --- END OF ASSET DETAIL VIEW BLOCK --- */}


      {/* --- Other Views (Issuance Choice, Wizard, Placeholders - Unchanged) --- */}
      {currentView === 'issuanceChoice' && ( <IssuanceChoiceScreen onSelectNew={handleNavigateNew} onSelectExisting={handleNavigateExisting} onBack={() => setCurrentView('dashboard')} /> )}
      {currentView === 'issuance' && ( <TokenIssuanceWizard onBack={() => setCurrentView('dashboard')} onIssue={handleIssueToken} /> )}
      {currentView === 'issueExisting' && ( <div className='p-8'><h1 className='text-2xl font-bold'>Issue More (Placeholder)</h1><p className='mt-4'>...</p><button className="mt-4 ..." onClick={() => setCurrentView('dashboard')}>Back</button></div> )}
      {currentView === 'burn' && <div className='p-8'><h1 className='text-2xl'>Burn Screen Placeholder</h1><button className="mt-4 ..." onClick={() => setCurrentView('dashboard')}>Back</button></div>}
      {currentView === 'redeem' && <div className='p-8'><h1 className='text-2xl'>Redeem Screen Placeholder</h1><button className="mt-4 ..." onClick={() => setCurrentView('dashboard')}>Back</button></div>}
      {currentView === 'reserve' && <div className='p-8'><h1 className='text-2xl'>Reserve Screen Placeholder</h1><button className="mt-4 ..." onClick={() => setCurrentView('dashboard')}>Back</button></div>}

    </> // End of outer Fragment
  );
};

export default TokenDashboard;