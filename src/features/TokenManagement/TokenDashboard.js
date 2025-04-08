import React, { useState } from 'react'; // Keep useState for local state like currentView, modals etc.
import TokenIssuanceWizard from '../TokenIssuance/TokenIssuanceWizard';
import IssuanceChoiceScreen from '../TokenIssuance/IssuanceChoiceScreen';
import AssetDetailView from './AssetDetailView';
import MintExistingToken from '../TokenIssuance/MintExistingToken';
import BurnTokenScreen from './BurnTokenScreen';
import RedeemTokenScreen from './RedeemTokenScreen';
import ReserveManagementScreen from './ReserveManagementScreen';
import HistoryDetailModal from './HistoryDetailModal';

// --- REMOVED initialAssets, hardcodedAssetDetails, assetLogos, blockchainLogos constants ---
// These are now expected to be passed as props or managed elsewhere (like App.js)
// Kept hardcodedAssetDetails here for now as it's only used by AssetDetailView via this component
const hardcodedAssetDetails = {
  'usdc': { officialName: 'USD Coin', issuer: 'Circle Internet Financial', website: 'https://www.circle.com/en/usdc', assetType: 'Fiat-backed Stablecoin', reserveInfo: 'Backed by cash and short-duration U.S. Treasuries, attested monthly.', features: ['Pausable by issuer', 'Regulated', 'KYC/AML required'], },
  'usdt': { officialName: 'Tether', issuer: 'Tether Operations Limited', website: 'https://tether.to/', assetType: 'Fiat-backed Stablecoin', reserveInfo: 'Backed by various assets including cash, equivalents, secured loans, bonds, and other investments. Attested regularly.', features: ['Pausable by issuer', 'Regulated (varies by jurisdiction)'], },
  't-gold': { officialName: 'Tokenized Gold', issuer: 'Bank of Ghana', website: '#', assetType: 'Commodity-backed Token', reserveInfo: 'Represents ownership of physical gold held in reserve.', features: ['Fungible'], },
  'e-cedi': { officialName: 'eCedi', issuer: 'Bank of Ghana (Pilot)', website: '#', assetType: 'Central Bank Digital Currency (CBDC)', reserveInfo: 'Direct liability of the central bank.', features: ['Pilot phase', 'Specific CBDC rules apply'], },
  'd-euro': { officialName: 'Digital Euro (Concept)', issuer: 'European Central Bank (Investigative Phase)', website: '#', assetType: 'Central Bank Digital Currency (CBDC)', reserveInfo: 'Direct liability of the central bank (proposed).', features: ['Under investigation', 'Potential privacy features'], }
};

const currentUserInitials = 'DB';

// --- Component Signature Updated to Accept Props ---
const TokenDashboard = ({ assets = [], setAssets, assetLogos = {}, blockchainLogos = {} }) => {

  // --- State for UI control, History, Modals etc. (Local State) ---
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedAssetId, setSelectedAssetId] = useState(null);
  const [historyLog, setHistoryLog] = useState([]);
  const [isHistoryDetailModalOpen, setIsHistoryDetailModalOpen] = useState(false);
  const [selectedHistoryEntry, setSelectedHistoryEntry] = useState(null);

  // --- REMOVED useState for assets ---
  // const [assets, setAssets] = useState(initialAssets); // Now managed by parent (App.js)

  // --- History Function (Unchanged) ---
  const addHistoryEntry = (actionType, details, userInitials, approverInitials, notes = '') => {
    const newEntry = {
      id: Date.now() + Math.random(), timestamp: new Date(), actionType: actionType,
      details: details, user: userInitials, approver: approverInitials, notes: notes
    };
    setHistoryLog(prevLog => [newEntry, ...prevLog]);
  };

  // --- Navigation Handlers (Unchanged, except using props where needed) ---
  const handleNavigate = (view) => setCurrentView(view);
  const handleAssetCardClick = (assetId) => { setSelectedAssetId(assetId); setCurrentView('assetDetail'); };
  const handleBackToDashboard = () => { setSelectedAssetId(null); setCurrentView('dashboard'); };
  const handleNavigateNew = () => setCurrentView('issuance');
  const handleNavigateExisting = () => setCurrentView('issueExisting');
  const handleHistoryRowClick = (entry) => {
    setSelectedHistoryEntry(entry);
    setIsHistoryDetailModalOpen(true);
  };

  // --- Action Handlers ---
  // These now read the 'assets' prop and call the 'setAssets' prop function for updates

  const handleIssueToken = (fullTokenData) => {
    const amountToAdd = fullTokenData.supplyDetails?.initialSupply;
    const tokenSymbol = fullTokenData.tokenDetails?.symbol;
    const tokenName = fullTokenData.tokenDetails?.name;
    const tokenBlockchain = fullTokenData.tokenDetails?.blockchain;
    const valueDefinitionString = fullTokenData.supplyDetails?.valueDefinition;

    // Validation (using assets prop)
    if (typeof amountToAdd !== 'number' || isNaN(amountToAdd) || amountToAdd <= 0) { alert("Invalid initial supply..."); return; }
    if (!tokenSymbol || !tokenName || !tokenBlockchain) { alert("Missing required token details..."); return; }
    const isDuplicate = assets.some(asset => asset.symbol === tokenSymbol); // Read from assets prop
    if (isDuplicate) { alert(`Error: Symbol "${tokenSymbol}" already exists.`); return; }

    // Parsing (Unchanged)
    let parsedValueDefinition = null;
    if (valueDefinitionString?.trim()) {
        const parts = valueDefinitionString.trim().split(' ');
        if (parts.length === 2) {
            const value = parseFloat(parts[0]); const targetSymbol = parts[1].toUpperCase();
            if (!isNaN(value) && value > 0 && targetSymbol) { parsedValueDefinition = { value, targetSymbol }; }
        }
    }

    // Call setAssets prop function
    setAssets(currentAssets => { // Use prop setAssets
        const generatedId = tokenSymbol.toLowerCase().replace(/[^a-z0-9]/g, '-');
        const newAssetObject = {
          id: generatedId, label: tokenName, balance: amountToAdd, symbol: tokenSymbol,
          description: `Manage ${tokenName} (${tokenSymbol}) on ${tokenBlockchain}.`,
          blockchain: tokenBlockchain, supply: fullTokenData.supplyDetails?.supplyType === 'infinite' ? 'Infinite' : 'Finite',
          isWizardIssued: true, parsedValueDefinition: parsedValueDefinition,
          wizardData: JSON.parse(JSON.stringify(fullTokenData))
        };
        return [...currentAssets, newAssetObject];
    });

    addHistoryEntry('Issue', `Issued ${amountToAdd.toLocaleString()} ${tokenSymbol}`, currentUserInitials, 'MG', '');
    setCurrentView('dashboard');
    alert(`${amountToAdd.toLocaleString()} ${tokenSymbol} issued successfully!`);
  };

  const handleMintTokens = (mintData) => {
    let symbol = '';
    // Call setAssets prop function
    setAssets(currentAssets => { // Use prop setAssets
      const assetIndex = currentAssets.findIndex(asset => asset.id === mintData.assetId);
      if (assetIndex === -1) { alert("Error: Could not find asset to mint."); return currentAssets; }
      if (typeof mintData.amount !== 'number' || isNaN(mintData.amount) || mintData.amount <= 0) { alert("Error: Invalid mint amount."); return currentAssets; }
      symbol = currentAssets[assetIndex].symbol;
      return currentAssets.map((asset, index) => index === assetIndex ? { ...asset, balance: asset.balance + mintData.amount } : asset);
    });

    if (symbol) {
        addHistoryEntry('Mint', `Minted ${mintData.amount.toLocaleString()} ${symbol}${mintData.reason ? ` (Reason: ${mintData.reason})` : ''}`, currentUserInitials, 'TR', mintData.reason || '');
        alert(`${mintData.amount.toLocaleString()} ${symbol} minted successfully! Reason: ${mintData.reason || 'N/A'}`);
        setCurrentView('dashboard');
    }
  };

  const handleBurnTokens = ({ assetId, amount, reason, notes }) => {
    let burnSuccessful = false;
    let symbol = '';
    // Call setAssets prop function
    setAssets(currentAssets => { // Use prop setAssets
      const assetIndex = currentAssets.findIndex(asset => asset.id === assetId);
      if (assetIndex === -1) { alert("Error: Could not find asset to burn."); return currentAssets; }
      const assetToUpdate = currentAssets[assetIndex];
      if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) { alert("Error: Invalid burn amount."); return currentAssets; }
      if (assetToUpdate.balance < amount) { alert(`Error: Insufficient balance...`); return currentAssets; }
      symbol = assetToUpdate.symbol;
      burnSuccessful = true;
      return currentAssets.map((asset, index) => index === assetIndex ? { ...asset, balance: asset.balance - amount } : asset);
    });

    if (burnSuccessful && symbol) {
        addHistoryEntry('Burn', `Burned ${amount.toLocaleString()} ${symbol} (Reason: ${reason || 'N/A'})`, currentUserInitials, 'TR', notes);
        alert(`${amount.toLocaleString()} ${symbol} burned successfully!`);
        setCurrentView('dashboard');
    }
  };

  const handleRedeemTokens = (redeemData) => {
    console.log('LOG 1: handleRedeemTokens called with:', redeemData);
    let transactionSuccessful = false;
    let alertMessage = "Redemption failed.";
    let logDetails = '';
    let sourceSymbol = '';

    // Call setAssets prop function
    setAssets(currentAssets => { // Use prop setAssets
        const idToRedeem = redeemData.mode === 'cross_token' ? redeemData.sourceAssetId : redeemData.assetId;
        const { amount } = redeemData;

        if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) { alertMessage = `Error: Invalid redemption amount...`; transactionSuccessful = false; return currentAssets; }
        const assetIndex = currentAssets.findIndex(asset => asset.id === idToRedeem);
        if (assetIndex === -1) { alertMessage = `Error: Could not find asset to redeem...`; transactionSuccessful = false; return currentAssets; }
        const assetToUpdate = currentAssets[assetIndex];
        sourceSymbol = assetToUpdate.symbol;
        if (assetToUpdate.balance < amount) { alertMessage = `Error: Insufficient balance...`; transactionSuccessful = false; return currentAssets; }

        transactionSuccessful = true;
        const newAssets = currentAssets.map((asset, index) => index === assetIndex ? { ...asset, balance: asset.balance - amount } : asset);

        // Construct details based on mode (using currentAssets from callback scope)
        if (redeemData.mode === 'cross_token') {
            const targetAsset = currentAssets.find(a => a.id === redeemData.targetAssetId);
            const targetSymbol = targetAsset ? targetAsset.symbol : 'Unknown Target';
            const receivedAmount = redeemData.targetAmount || 0;
            logDetails = `Swapped ${amount.toLocaleString()} ${sourceSymbol} for ~${receivedAmount.toLocaleString(undefined, {maximumFractionDigits: 4})} ${targetSymbol}`;
            alertMessage = `Successfully swapped ${amount.toLocaleString()} ${sourceSymbol} for ~${receivedAmount.toLocaleString(undefined, {maximumFractionDigits: 4})} ${targetSymbol}!`;
        } else {
             logDetails = `Redeemed ${amount.toLocaleString()} ${sourceSymbol}`;
             alertMessage = `${amount.toLocaleString()} ${sourceSymbol} redeemed successfully!`;
        }
        if (redeemData.purpose) logDetails += ` (Purpose: ${redeemData.purpose})`;
        if (redeemData.destinationAccount) logDetails += ` (To: ${redeemData.destinationAccount})`;

        return newAssets;
    });

    // Logic after setAssets call (Unchanged, uses transactionSuccessful flag)
    if (transactionSuccessful) {
        try { addHistoryEntry('Redeem/Swap', logDetails, currentUserInitials, 'SA', redeemData.notes); alert(alertMessage); setCurrentView('dashboard');
        } catch (error) { console.error("ERROR occurred in SUCCESS path:", error); alert(`An error occurred...`); }
    } else {
        try { alert(alertMessage); } catch (error) { console.error("ERROR occurred in FAILED path (alert):", error); }
    }
  };

  const handleUpdatePausableStatus = ({ assetId, newStatus }) => {
      // NOTE: State update logic for 'paused' property is missing here.
      // Needs setAssets prop call similar to others if implemented.
      console.warn("handleUpdatePausableStatus does not actually update the asset's paused state.");
      let symbol = assets.find(a => a.id === assetId)?.symbol || 'Unknown'; // Read from assets prop
      if (symbol !== 'Unknown') {
          addHistoryEntry('Pause Toggle', `Transactions for ${symbol} ${newStatus ? 'Paused' : 'Unpaused'}`, currentUserInitials, 'PR', '');
          alert(`Asset ${symbol} transactions ${newStatus ? 'paused' : 'unpaused'} successfully after approval. (State change not implemented)`);
      } else { alert("Error: Could not find asset to update pause status."); }
  };

  const handleLogReserveAlertChange = ({ assetId, symbol, threshold }) => {
     addHistoryEntry('Reserve Alert', `Alert threshold for ${symbol} set to ${threshold}%`, currentUserInitials, 'SA', '');
  };

  // --- Utility Function (Unchanged) ---
  const formatNumber = (num) => {
    if (typeof num !== 'number' || isNaN(num)) {
       const parsed = parseFloat(num); return !isNaN(parsed) ? parsed.toLocaleString() : String(num);
    } return num.toLocaleString();
  };

  // --- Render Logic ---
  // Reads 'assets' prop, uses 'assetLogos' and 'blockchainLogos' props
  return (
    <>
      {/* --- Dashboard View --- */}
      {currentView === 'dashboard' && (
        <div className="p-8">
          <h1 className="text-2xl font-bold mb-6 text-gray-800">Token Management Dashboard</h1>
          {/* Action Cards (Using handleNavigate) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white p-4 rounded shadow"> <h2 className="font-bold border-b pb-2 mb-4 text-gray-800">Issue / Mint</h2> <p className="text-sm text-gray-600 mb-3">Issue new tokens or mint more...</p> <button className="px-4 py-2 rounded text-white hover:opacity-90 bg-emtech-gold" onClick={() => handleNavigate('issuanceChoice')}>Issue / Mint</button> </div>
            <div className="bg-white p-4 rounded shadow"> <h2 className="font-bold border-b pb-2 mb-4 text-gray-800">Burn</h2> <p className="text-sm text-gray-600 mb-3">Remove tokens from circulation...</p> <button className="px-4 py-2 rounded text-white hover:opacity-90 bg-emtech-gold" onClick={() => handleNavigate('burn')}>Burn Tokens</button> </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white p-4 rounded shadow"> <h2 className="font-bold border-b pb-2 mb-4 text-gray-800">Redeem</h2> <p className="text-sm text-gray-600 mb-3">Redeem tokens for underlying assets...</p> <button className="px-4 py-2 rounded text-white hover:opacity-90 bg-emtech-gold" onClick={() => handleNavigate('redeem')}>Redeem Tokens</button> </div>
            <div className="bg-white p-4 rounded shadow"> <h2 className="font-bold border-b pb-2 mb-4 text-gray-800">Reserve</h2> <p className="text-sm text-gray-600 mb-3">Manage and view token reserves...</p> <button className="px-4 py-2 rounded text-white hover:opacity-90 bg-emtech-gold" onClick={() => handleNavigate('reserve')}>View Reserves</button> </div>
          </div>

          {/* Asset Cards (Reading assets prop) */}
          <h2 className="text-xl font-semibold mb-4 text-gray-700 mt-8">Asset Reserves Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.isArray(assets) ? assets.map(asset => ( // Read from assets prop
              <div key={asset.id} className="bg-white p-4 rounded shadow flex flex-col cursor-pointer border border-transparent hover:shadow-lg hover:border-gray-400 transition-all" onClick={() => handleAssetCardClick(asset.id)} >
                <div className="flex items-center border-b pb-2 mb-2">
                  {/* Use assetLogos prop */}
                  {asset.isWizardIssued ? (<img src="/logos/generic-token.png" alt="User-issued token" className="h-5 w-5 mr-2"/>) : (assetLogos[asset.id] && (<img src={assetLogos[asset.id]} alt={`${asset.label} logo`} className="h-5 w-5 mr-2"/>) )}
                  <h3 className="font-bold text-gray-800">{asset.label}</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3 flex-grow">{asset.description}</p>
                <p className="text-xs text-gray-500 mb-3">Supply: {asset.supply}</p>
                {asset.blockchain && (
                  <div className="flex items-center text-xs text-gray-400 mb-3">
                    {/* Use blockchainLogos prop */}
                    {blockchainLogos[asset.blockchain] && (<img src={blockchainLogos[asset.blockchain]} alt={`${asset.blockchain} logo`} className="h-4 w-4 mr-1.5" />)}
                    <span>On: {asset.blockchain}</span>
                  </div> )}
                <div className="mt-auto bg-gray-100 p-3 rounded">
                  <div className="flex justify-between items-center"> <span className="text-sm text-gray-700">Balance:</span> <span className="font-bold text-sm">{formatNumber(asset.balance)} {asset.symbol}</span> </div>
                </div>
              </div> )) : ( <p className="text-red-500 col-span-full">Error: Assets data unavailable.</p> )}
          </div>

          {/* History Log (Using handleHistoryRowClick) */}
          <div className="mt-12">
             <h2 className="text-xl font-semibold mb-4 text-gray-700">History</h2>
             <div className="bg-white p-4 rounded shadow overflow-x-auto">
               {historyLog.length === 0 ? (<p className="text-center text-gray-500 italic">No history yet.</p>) : (
                 <table className="min-w-full divide-y divide-gray-200 text-sm">
                   <thead className="bg-gray-50"> <tr> <th scope="col" className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Timestamp</th> <th scope="col" className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">User</th> <th scope="col" className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Action</th> <th scope="col" className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Details</th> <th scope="col" className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Approver</th> </tr> </thead>
                   <tbody className="bg-white divide-y divide-gray-200">
                     {historyLog.map((entry) => (
                      <tr key={entry.id} onClick={() => handleHistoryRowClick(entry)} className="hover:bg-gray-100 cursor-pointer transition-colors duration-150 ease-in-out" >
                        <td className="px-4 py-2 whitespace-nowrap text-gray-500">{entry.timestamp.toLocaleString()}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-gray-900">{entry.user}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-gray-900 font-medium">{entry.actionType}</td>
                        <td className="px-4 py-2 text-gray-700">{entry.details}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-gray-900">{entry.approver}</td>
                      </tr> ))}
                   </tbody>
                 </table> )}
             </div>
           </div>
        </div>
      )}

      {/* --- Other Views Rendering (Passing assets prop down where needed) --- */}
      {currentView === 'assetDetail' && selectedAssetId && (
        (() => {
          const selectedAsset = Array.isArray(assets) ? assets.find(asset => asset.id === selectedAssetId) : null; // Read from assets prop
          if (!selectedAsset) { console.error("AssetDetailView Error..."); alert("Error..."); setCurrentView('dashboard'); setSelectedAssetId(null); return null; }
          return (<AssetDetailView asset={selectedAsset} hardcodedDetailsMap={hardcodedAssetDetails} onBack={handleBackToDashboard} assetLogosMap={assetLogos} blockchainLogosMap={blockchainLogos} onUpdatePausableStatus={handleUpdatePausableStatus} />);
        })()
      )}
      {currentView === 'issuanceChoice' && (<IssuanceChoiceScreen onSelectNew={handleNavigateNew} onSelectExisting={handleNavigateExisting} onBack={() => setCurrentView('dashboard')} />)}
      {currentView === 'issuance' && (<TokenIssuanceWizard onBack={() => setCurrentView('dashboard')} onIssue={handleIssueToken} />)}
      {currentView === 'issueExisting' && (<MintExistingToken assets={Array.isArray(assets) ? assets : []} onMint={handleMintTokens} onBack={() => setCurrentView('issuanceChoice')} />)}
      {currentView === 'burn' && (<BurnTokenScreen assets={Array.isArray(assets) ? assets : []} onBurn={handleBurnTokens} onBack={() => setCurrentView('dashboard')} />)}
      {currentView === 'redeem' && (<RedeemTokenScreen assets={Array.isArray(assets) ? assets : []} onRedeem={handleRedeemTokens} onBack={() => setCurrentView('dashboard')} />)}
      {currentView === 'reserve' && (<ReserveManagementScreen assets={Array.isArray(assets) ? assets : []} assetLogosMap={assetLogos} onLogReserveAlertChange={handleLogReserveAlertChange} onBack={() => setCurrentView('dashboard')} />)}

      {/* History Detail Modal (Unchanged) */}
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