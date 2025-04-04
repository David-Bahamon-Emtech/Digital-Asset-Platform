import React, { useState } from 'react';
import TokenIssuanceWizard from '../TokenIssuance/TokenIssuanceWizard';
import IssuanceChoiceScreen from '../TokenIssuance/IssuanceChoiceScreen'; // <-- ADDED THIS IMPORT

// Initial data for assets
const initialAssets = [
  { id: 'usdc', label: 'USDC', balance: 10000000, symbol: 'USDC', description: 'Manage USDC stablecoin reserves.', supply: 'Finite' },
  { id: 'usdt', label: 'USDT', balance: 8500000, symbol: 'USDT', description: 'Manage USDT stablecoin reserves.', supply: 'Finite' },
  { id: 't-gold', label: 'Tokenized Gold', balance: 5000, symbol: 'T-GOLD', description: 'Manage reserves for Gold-backed tokens.', supply: 'Finite' },
  { id: 'e-cedi', label: 'eCedi', balance: 15000000, symbol: 'eGH¢', description: 'Manage reserves for eCedi CBDC.', supply: 'Finite' },
  { id: 'd-euro', label: 'Digital Euro', balance: 9000000, symbol: 'D-EUR', description: 'Manage reserves for Digital Euro.', supply: 'Finite' },
  { id: 't-bond', label: 'Tokenized Bonds', balance: 2500000, symbol: 'T-BOND', description: 'Manage reserves for Bond-backed tokens.', supply: 'Finite' }
];

const TokenDashboard = () => {
  // --- State ---
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard', 'issuanceChoice', 'issuance', 'issueExisting', 'burn', 'redeem', 'reserve'
  const [assets, setAssets] = useState(initialAssets);

  // --- Event Handlers ---
  const handleNavigate = (view) => {
    console.log(`Switching view to ${view}`);
    setCurrentView(view);
  };

  // Handles simulated token issuance from the wizard
  // --- CORRECTED Function to handle token issuance ---
  const handleIssueToken = (newTokenData) => {
    console.log(`Processing issuance for:`, newTokenData);

    // Ensure amount is a number before proceeding
    const amountToAdd = newTokenData.initialSupply; // Already parsed in wizard, should be number
    if (typeof amountToAdd !== 'number' || isNaN(amountToAdd) || amountToAdd <= 0) {
         console.error("Invalid amount received for issuance:", newTokenData.initialSupply);
         alert("An error occurred: Invalid amount for issuance.");
         setCurrentView('dashboard'); // Go back even if error
         return; // Stop processing
    }

    setAssets(currentAssets => {
      const existingAssetIndex = currentAssets.findIndex(asset => asset.symbol === newTokenData.symbol);

      if (existingAssetIndex !== -1) {
        console.log("Existing asset found. Updating balance.");
        return currentAssets.map((asset, index) => {
          if (index === existingAssetIndex) {
            // --- FIX 1: Use newTokenData.initialSupply ---
            return { ...asset, balance: asset.balance + amountToAdd };
          }
          return asset;
        });
      } else {
        console.log("New asset. Adding to list.");
        const newAssetCard = {
          id: newTokenData.symbol.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          label: newTokenData.name,
          balance: amountToAdd, // Use the validated amount
          symbol: newTokenData.symbol,
          description: `Manage ${newTokenData.name} (${newTokenData.symbol}) on ${newTokenData.blockchain}.`, // <-- ENSURE THIS LINE IS EXACTLY LIKE THIS
            supply: newTokenData.supplyType === 'infinite' ? 'Infinite' : 'Finite'
        };
        return [...currentAssets, newAssetCard];
      }
    });

    setCurrentView('dashboard');
    // --- FIX 2: Use newTokenData properties in alert ---
    alert(`${amountToAdd.toLocaleString()} ${newTokenData.symbol} processed successfully!`);
  };
  // --- END OF CORRECTED FUNCTION ---

  // --- ADDED: Handlers for Issuance Choice Screen ---
  const handleNavigateNew = () => {
    setCurrentView('issuance'); // Go to the multi-step wizard for new tokens
  };

  const handleNavigateExisting = () => {
    setCurrentView('issueExisting'); // Go to the (currently placeholder) screen for existing tokens
  };
  // --- END OF ADDED HANDLERS ---

  // Function to format numbers with commas
  const formatNumber = (num) => {
    return num.toLocaleString();
  };

  // --- Render Logic ---
  return (
    <>
      {/* --- Main Dashboard View --- */}
      {currentView === 'dashboard' && (
        <div className="p-8">
          <h1 className="text-2xl font-bold mb-6 text-gray-800">Token Management Dashboard</h1>

          {/* Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
             {/* Issue Card */}
             <div className="bg-white p-4 rounded shadow">
               <h2 className="font-bold border-b pb-2 mb-4 text-gray-800">Issue</h2>
               <p className="text-sm text-gray-600 mb-3">Issue new tokens into circulation.</p>
               {/* CHANGED onClick below */}
               <button className="px-4 py-2 rounded text-white hover:opacity-90 bg-emtech-gold" onClick={() => handleNavigate('issuanceChoice')}>Issue Tokens</button>
             </div>
             {/* Burn Card */}
             <div className="bg-white p-4 rounded shadow">
               <h2 className="font-bold border-b pb-2 mb-4 text-gray-800">Burn</h2>
               <p className="text-sm text-gray-600 mb-3">Remove tokens from circulation permanently.</p>
               <button className="px-4 py-2 rounded text-white hover:opacity-90 bg-emtech-gold" onClick={() => handleNavigate('burn')}>Burn Tokens</button>
             </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
             {/* Redeem Card */}
             <div className="bg-white p-4 rounded shadow">
               <h2 className="font-bold border-b pb-2 mb-4 text-gray-800">Redeem</h2>
               <p className="text-sm text-gray-600 mb-3">Redeem tokens for underlying assets or value.</p>
               <button className="px-4 py-2 rounded text-white hover:opacity-90 bg-emtech-gold" onClick={() => handleNavigate('redeem')}>Redeem Tokens</button>
             </div>
             {/* Reserve Card */}
             <div className="bg-white p-4 rounded shadow">
               <h2 className="font-bold border-b pb-2 mb-4 text-gray-800">Reserve</h2>
               <p className="text-sm text-gray-600 mb-3">Manage and view token reserve assets.</p>
               <button className="px-4 py-2 rounded text-white hover:opacity-90 bg-emtech-gold" onClick={() => handleNavigate('reserve')}>View Reserves</button>
             </div>
          </div>

          {/* Asset Reserves Overview */}
          <h2 className="text-xl font-semibold mb-4 text-gray-700 mt-8">Asset Reserves Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assets.map(asset => (
              <div key={asset.id} className="bg-white p-4 rounded shadow flex flex-col">
                <h3 className="font-bold border-b pb-2 mb-2 text-gray-800">{asset.label}</h3>
                <p className="text-sm text-gray-600 mb-3 flex-grow">{asset.description}</p>
                <p className="text-xs text-gray-500 mb-3">Supply: {asset.supply}</p>
                <div className="mt-auto bg-gray-100 p-3 rounded">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">Balance:</span>
                    <span className="font-bold text-sm">{formatNumber(asset.balance)} {asset.symbol}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- ADDED: Issuance Choice Screen View --- */}
      {currentView === 'issuanceChoice' && (
        <IssuanceChoiceScreen
          onSelectNew={handleNavigateNew}       // Pass handler for "New" choice
          onSelectExisting={handleNavigateExisting} // Pass handler for "Existing" choice
          onBack={() => setCurrentView('dashboard')} // Allow going back to dashboard
        />
      )}
      {/* --- END OF ADDED BLOCK --- */}

      {/* --- Issuance Wizard View (for New Tokens) --- */}
      {currentView === 'issuance' && (
        <TokenIssuanceWizard
          onBack={() => setCurrentView('dashboard')} // Changed this to go back to dashboard
          onIssue={handleIssueToken}
        />
      )}

      {/* --- ADDED: Placeholder for Issue Existing Token View --- */}
      {currentView === 'issueExisting' && (
        <div className='p-8'>
           <h1 className='text-2xl font-bold'>Issue More of Existing Token (Placeholder)</h1>
           <p className='mt-4'>UI for selecting an existing token and amount goes here.</p>
           <button className="mt-4 px-4 py-2 rounded border border-gray-300 hover:bg-gray-50" onClick={() => setCurrentView('dashboard')}>Back to Dashboard</button>
        </div>
      )}
      {/* --- END OF ADDED BLOCK --- */}


      {/* --- Placeholders for other views --- */}
      {currentView === 'burn' && <div className='p-8'><h1 className='text-2xl'>Burn Screen Placeholder</h1><button className="mt-4 px-4 py-2 rounded border border-gray-300 hover:bg-gray-50" onClick={() => setCurrentView('dashboard')}>Back</button></div>}
      {currentView === 'redeem' && <div className='p-8'><h1 className='text-2xl'>Redeem Screen Placeholder</h1><button className="mt-4 px-4 py-2 rounded border border-gray-300 hover:bg-gray-50" onClick={() => setCurrentView('dashboard')}>Back</button></div>}
      {currentView === 'reserve' && <div className='p-8'><h1 className='text-2xl'>Reserve Screen Placeholder</h1><button className="mt-4 px-4 py-2 rounded border border-gray-300 hover:bg-gray-50" onClick={() => setCurrentView('dashboard')}>Back</button></div>}
    </>
  );
};

export default TokenDashboard;