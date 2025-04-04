import React, { useState } from 'react'; // Ensure useState is imported
import TokenIssuanceWizard from '../TokenIssuance/TokenIssuanceWizard'; // Import the wizard

// Initial data for assets - defined outside the component or inside if it never changes
// We define it inside here, then put it in state.
const initialAssets = [
  { id: 'usdc', label: 'USDC', balance: 10000000, symbol: 'USDC', description: 'Manage USDC stablecoin reserves.', supply: 'Finite' }, // Using numbers for balance now
  { id: 'usdt', label: 'USDT', balance: 8500000, symbol: 'USDT', description: 'Manage USDT stablecoin reserves.', supply: 'Finite' },
  { id: 't-gold', label: 'Tokenized Gold', balance: 5000, symbol: 'T-GOLD', description: 'Manage reserves for Gold-backed tokens.', supply: 'Finite' },
  { id: 'e-cedi', label: 'eCedi', balance: 15000000, symbol: 'eGH¢', description: 'Manage reserves for eCedi CBDC.', supply: 'Finite' },
  { id: 'd-euro', label: 'Digital Euro', balance: 9000000, symbol: 'D-EUR', description: 'Manage reserves for Digital Euro.', supply: 'Finite' },
  { id: 't-bond', label: 'Tokenized Bonds', balance: 2500000, symbol: 'T-BOND', description: 'Manage reserves for Bond-backed tokens.', supply: 'Finite' }
]; // Note: Changed balances to numbers for easier calculation

const TokenDashboard = () => {
  // --- State ---
  const [currentView, setCurrentView] = useState('dashboard'); // State for sub-navigation
  const [assets, setAssets] = useState(initialAssets); // <-- State for asset data

  // --- Event Handlers ---
  const handleNavigate = (view) => {
    console.log(`Switching view to ${view}`);
    setCurrentView(view);
  };

  // Function to handle the simulated token issuance
  const handleIssueToken = (symbol, amount) => {
    console.log(`Issuing ${amount} of ${symbol}`);
    setAssets(currentAssets => {
      // Create a new array (React state update best practice)
      return currentAssets.map(asset => {
        // Find the asset to update (match by symbol)
        if (asset.symbol === symbol) {
          // Return a new object for this asset with the updated balance
          return { ...asset, balance: asset.balance + amount };
        }
        // Otherwise, return the original asset object unchanged
        return asset;
      });
    });
    // Switch back to the dashboard view after issuing
    setCurrentView('dashboard');
    alert(`${amount} ${symbol} issued successfully!`); // Give user feedback
  };

  // Function to format numbers with commas (optional but nice)
  const formatNumber = (num) => {
    return num.toLocaleString();
  };

  // --- Render Logic ---
  return (
    <>
      {currentView === 'dashboard' && (
        <div className="p-8">
          <h1 className="text-2xl font-bold mb-6 text-gray-800">Token Management Dashboard</h1>

          {/* Action Cards (Issue, Burn, Redeem, Reserve) */}
          {/* ... (Keep the existing card JSX, ensure onClick calls handleNavigate) ... */}
            {/* Top Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Issue Card */}
                <div className="bg-white p-4 rounded shadow">
                  <h2 className="font-bold border-b pb-2 mb-4 text-gray-800">Issue</h2>
                  <p className="text-sm text-gray-600 mb-3">Issue new tokens into circulation.</p>
                  <button className="px-4 py-2 rounded text-white hover:opacity-90 bg-emtech-gold" onClick={() => handleNavigate('issuance')}>Issue Tokens</button>
                </div>
                {/* Burn Card */}
                <div className="bg-white p-4 rounded shadow">
                  <h2 className="font-bold border-b pb-2 mb-4 text-gray-800">Burn</h2>
                  <p className="text-sm text-gray-600 mb-3">Remove tokens from circulation permanently.</p>
                  <button className="px-4 py-2 rounded text-white hover:opacity-90 bg-emtech-gold" onClick={() => handleNavigate('burn')}>Burn Tokens</button>
                </div>
            </div>
            {/* Middle Row */}
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
            {/* Map over the 'assets' state variable */}
            {assets.map(asset => (
              <div key={asset.id} className="bg-white p-4 rounded shadow flex flex-col">
                <h3 className="font-bold border-b pb-2 mb-2 text-gray-800">{asset.label}</h3>
                <p className="text-sm text-gray-600 mb-3 flex-grow">{asset.description}</p>
                <p className="text-xs text-gray-500 mb-3">Supply: {asset.supply}</p>
                <div className="mt-auto bg-gray-100 p-3 rounded">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">Balance:</span>
                    {/* Format the balance number */}
                    <span className="font-bold text-sm">{formatNumber(asset.balance)} {asset.symbol}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Show Issuance Wizard - Pass the new onIssue prop */}
      {currentView === 'issuance' && (
        <TokenIssuanceWizard
          onBack={() => setCurrentView('dashboard')}
          onIssue={handleIssueToken} // <-- Pass the handler function
        />
      )}

      {/* Placeholders for other views */}
      {currentView === 'burn' && <div className='p-8'><h1 className='text-2xl'>Burn Screen Placeholder</h1><button onClick={() => setCurrentView('dashboard')}>Back</button></div>}
      {currentView === 'redeem' && <div className='p-8'><h1 className='text-2xl'>Redeem Screen Placeholder</h1><button onClick={() => setCurrentView('dashboard')}>Back</button></div>}
      {currentView === 'reserve' && <div className='p-8'><h1 className='text-2xl'>Reserve Screen Placeholder</h1><button onClick={() => setCurrentView('dashboard')}>Back</button></div>}
    </>
  );
};

export default TokenDashboard;