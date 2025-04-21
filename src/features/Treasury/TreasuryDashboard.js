import React, { useState, useMemo } from 'react';
// Import child components
import RedeemTokenScreen from './RedeemTokenScreen';
import SwapTokenScreen from './SwapTokenScreen';
import AssetDetailView from '../TokenManagement/AssetDetailView';
import AssetOrdersListView from './AssetOrdersListView';
import CreateAssetOrderScreen from './CreateAssetOrderScreen';
// Import hooks for accessing context
import { useAssets } from '../../context/AssetsContext';
// Import helpers
import { formatNumber, getStatusClass } from '../../utils/displayUtils';
// Import Shared Data
import { hardcodedAssetDetails } from '../../data/initialData';

// Define the specific asset IDs to display on the Treasury dashboard overview
const treasuryAssetIds = ['usdc', 'usdt', 'd-euro', 't-bond', 'e-cedi'];

// --- Dummy Data for Asset Orders ---
const dummyAssetOrders = [
    // ... (dummy data remains the same)
    { id: 'AO-001', timestamp: new Date(Date.now() - 86400000 * 2), type: 'Internal Transfer', assetSymbol: 'USDC', amount: 5000000, from: 'Warm Wallet', to: 'Cold Storage 1', status: 'Completed', requestedBy: 'TreasuryOps' },
    { id: 'AO-002', timestamp: new Date(Date.now() - 3600000 * 5), type: 'FX Conversion', assetSymbol: 'EUR', amount: 1000000, from: 'EUR Primary Acct', to: 'USD Primary Acct', status: 'Completed', requestedBy: 'FX Desk' },
    { id: 'AO-003', timestamp: new Date(Date.now() - 3600000 * 1), type: 'Purchase', assetSymbol: 'T-BOND', amount: 50000, from: 'USD Primary Acct', to: 'Tokenized Bond Vault', status: 'Pending Approval', requestedBy: 'PortfolioMgr' },
    { id: 'AO-004', timestamp: new Date(Date.now() - 86400000 * 1), type: 'Sale', assetSymbol: 'ETH', amount: 100, from: 'ETH Operational Wallet', to: 'USD Primary Acct', status: 'Processing', requestedBy: 'TraderX' },
    { id: 'AO-005', timestamp: new Date(Date.now() - 3600000 * 8), type: 'Internal Transfer', assetSymbol: 'BTC', amount: 10, from: 'Cold Storage 1', to: 'Hot Wallet (Exchange)', status: 'Failed', requestedBy: 'TreasuryOps' },
    { id: 'AO-006', timestamp: new Date(Date.now() - 3600000 * 2), type: 'Purchase', assetSymbol: 'XAGC', amount: 10000, from: 'USD Primary Acct', to: 'Silver-Backed Coin', status: 'Pending Approval', requestedBy: 'PortfolioMgr' },
];

/**
 * Treasury Management Dashboard component.
 * Container component that handles navigation between Treasury sub-features.
 * @param {object} props - Component props.
 * @param {object} props.assetLogos - Map of asset symbols/IDs to logo paths.
 * @param {object} props.blockchainLogos - Map of blockchain names to logo paths.
 */
const TreasuryDashboard = ({ assetLogos = {}, blockchainLogos = {} }) => {
  // State for navigation: 'dashboard', 'redeem', 'swap', 'assetOrdersList', 'createAssetOrder', 'treasuryAssetDetail'
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedTreasuryAssetId, setSelectedTreasuryAssetId] = useState(null);
  // State for asset orders data
  const [assetOrders, setAssetOrders] = useState(dummyAssetOrders);

  // Get assets from context
  const { assets } = useAssets();

  console.log("Rendering TreasuryDashboard, currentView:", currentView);

  // Filter assets for the Treasury Overview
  const treasuryAssets = useMemo(() => {
    if (!Array.isArray(assets)) return [];
    return assets.filter(asset => treasuryAssetIds.includes(asset.id));
  }, [assets]);

  // --- Navigation Handlers ---
  const handleNavigate = (view) => {
    console.log("TreasuryDashboard: Navigating to", view);
    setCurrentView(view);
  };

  const handleTreasuryAssetCardClick = (assetId) => {
    console.log("TreasuryDashboard: Treasury asset card clicked:", assetId);
    setSelectedTreasuryAssetId(assetId);
    setCurrentView('treasuryAssetDetail');
  };

  const handleBackToTreasuryDashboard = () => {
    console.log("TreasuryDashboard: Navigating back to dashboard");
    setSelectedTreasuryAssetId(null);
    setCurrentView('dashboard');
  };

  const handleBackToOrdersList = () => {
    setCurrentView('assetOrdersList');
  };


  // --- Render Functions for Different Views ---

  // Render the main Treasury dashboard view
  const renderDashboardView = () => (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Treasury Management</h1>
      {/* Action Card Section - UPDATED STYLING */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Actions</h2>
        {/* UPDATED: Applied same grid classes as the overview section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {/* Redeem Card */}
           <div className="bg-white p-4 rounded shadow">
               <h2 className="font-bold border-b pb-2 mb-4 text-gray-800">Redeem Token</h2>
               <p className="text-sm text-gray-600 mb-3">Redeem platform-issued tokens for their underlying asset value (e.g., fiat, commodity units).</p>
               <button
                  type="button"
                  // UPDATED: Button color class
                  className="px-4 py-2 rounded text-white hover:opacity-90 bg-yellow-600 hover:bg-yellow-500" // Placeholder EMTECH Gold
                  onClick={() => handleNavigate('redeem')}
               >
                 Go to Redeem
               </button>
           </div>

           {/* Swap Card */}
           <div className="bg-white p-4 rounded shadow">
               <h2 className="font-bold border-b pb-2 mb-4 text-gray-800">Swap Token</h2>
               <p className="text-sm text-gray-600 mb-3">Swap between different platform tokens and core treasury assets (e.g., USDC, USDT, T-BOND).</p>
               <button
                  type="button"
                  // UPDATED: Button color class
                  className="px-4 py-2 rounded text-white hover:opacity-90 bg-yellow-600 hover:bg-yellow-500" // Placeholder EMTECH Gold
                  onClick={() => handleNavigate('swap')}
               >
                 Go to Swap
                </button>
           </div>

           {/* Asset Order Card */}
            <div className="bg-white p-4 rounded shadow">
               <h2 className="font-bold border-b pb-2 mb-4 text-gray-800">Asset Orders</h2>
               <p className="text-sm text-gray-600 mb-3">View and manage internal asset transfers, FX conversions, and purchases/sales.</p>
               <button
                    type="button"
                    // UPDATED: Button color class
                    className="px-4 py-2 rounded text-white hover:opacity-90 bg-yellow-600 hover:bg-yellow-500" // Placeholder EMTECH Gold
                    onClick={() => handleNavigate('assetOrdersList')}
               >
                 View Asset Orders
               </button>
           </div>
           {/* Add more action cards here if needed, they will follow the grid */}
        </div>
      </div>
      {/* Treasury Assets Overview Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Treasury Assets Overview</h2>
        {/* This section already uses the target grid classes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {treasuryAssets.length > 0 ? treasuryAssets.map(asset => (
            <div key={asset.id} className="bg-white p-4 rounded shadow flex flex-col border border-gray-200 cursor-pointer hover:shadow-lg hover:border-gray-400 transition-all" onClick={() => handleTreasuryAssetCardClick(asset.id)} >
              {/* Card Header */}
              <div className="flex items-center border-b pb-2 mb-2"> {(assetLogos[asset.id] || assetLogos[asset.symbol]) && ( <img src={assetLogos[asset.id] || assetLogos[asset.symbol]} alt={`${asset.label} logo`} className="h-5 w-5 mr-2" onError={(e) => { e.target.style.display = 'none'; }} /> )} <h3 className="font-bold text-gray-800">{asset.label} ({asset.symbol})</h3> </div>
              {/* Card Body */}
              <div className="flex-grow space-y-2 text-sm mb-3"> <p className="text-gray-600">{asset.description}</p> <div className="flex flex-wrap gap-1"> {asset.assetClass && <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">{asset.assetClass}</span>} {asset.physicality && <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 border border-green-200">{asset.physicality}</span>} {asset.custodyType && <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">{asset.custodyType}</span>} </div> {asset.blockchain && asset.blockchain !== 'N/A' && ( <div className="flex items-center text-xs text-gray-400"> {blockchainLogos[asset.blockchain] && (<img src={blockchainLogos[asset.blockchain]} alt={`${asset.blockchain} logo`} className="h-4 w-4 mr-1.5" onError={(e) => { e.target.style.display = 'none'; }}/>)} <span>On: {asset.blockchain}</span> </div> )} {asset.price !== null && asset.price !== undefined && ( <p className="text-xs text-gray-500"> Value: ~{formatNumber(asset.price)} USD / token </p> )} </div>
              {/* Card Footer - Balance */}
              <div className="mt-auto bg-gray-100 p-3 rounded -m-4 mt-4"> <div className="flex justify-between items-center"> <span className="text-sm text-gray-700">Balance:</span> <span className="font-bold text-sm">{formatNumber(asset.balance)} {asset.symbol}</span> </div> </div>
            </div>
          )) : (
            <p className="text-gray-500 italic col-span-full">No specific treasury assets found or still loading...</p>
          )}
        </div>
      </div>
    </div>
  );

  // --- Main Return: Use conditional rendering to show the correct component ---
  // (No changes needed in this part)
  return (
    <>
      {/* Main Dashboard View */}
      {currentView === 'dashboard' && renderDashboardView()}

      {/* Redeem Token View */}
      {currentView === 'redeem' && (
        <RedeemTokenScreen onBack={handleBackToTreasuryDashboard} />
      )}

      {/* Swap Token View */}
      {currentView === 'swap' && (
        <SwapTokenScreen onBack={handleBackToTreasuryDashboard} />
      )}

      {/* Treasury Asset Detail View */}
      {currentView === 'treasuryAssetDetail' && selectedTreasuryAssetId && (
        (() => {
          const selectedAsset = Array.isArray(assets) ? assets.find(asset => asset.id === selectedTreasuryAssetId) : null;
          if (!selectedAsset) { console.error("Treasury AssetDetailView Error: Could not find selected asset ID:", selectedTreasuryAssetId); alert("Error loading asset details."); handleBackToTreasuryDashboard(); return null; }
          return (<AssetDetailView asset={selectedAsset} hardcodedDetailsMap={hardcodedAssetDetails} onBack={handleBackToTreasuryDashboard} assetLogosMap={assetLogos} blockchainLogosMap={blockchainLogos} />);
        })()
      )}

      {/* Asset Orders List View */}
      {currentView === 'assetOrdersList' && (
        <AssetOrdersListView
            assetOrders={assetOrders} // Pass the orders data
            onBack={handleBackToTreasuryDashboard} // Function to go back to main dash
            onCreateNew={() => handleNavigate('createAssetOrder')} // Function to go to create screen
        />
      )}

      {/* Create Asset Order View */}
      {currentView === 'createAssetOrder' && (
        <CreateAssetOrderScreen
            onBack={handleBackToOrdersList} // Function to go back to the list view
        />
      )}
    </>
  );
};

export default TreasuryDashboard;