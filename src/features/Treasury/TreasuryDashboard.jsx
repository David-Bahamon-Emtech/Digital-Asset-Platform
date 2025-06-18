import React, { useState, useMemo } from 'react';
// Import child components
import RedeemTokenScreen from './RedeemTokenScreen.jsx';
import SwapTokenScreen from './SwapTokenScreen.jsx';
import AssetDetailView from '../TokenManagement/AssetDetailView.jsx';
import AssetOrdersListView from './AssetOrdersListView.jsx';
import CreateAssetOrderScreen from './CreateAssetOrderScreen.jsx';
// Import hooks for accessing context
import { useAssets } from '../../context/AssetsContext.jsx';
import { useAssetOrders } from '../../context/AssetOrdersContext.jsx'; // <-- Import the hook
// Import helpers
import { formatNumber, getStatusClass } from '../../utils/displayUtils.jsx';
// Import Shared Data
import { hardcodedAssetDetails } from '../../data/initialData.js';

// Define the specific asset IDs to display on the Treasury dashboard overview
const treasuryAssetIds = ['usdc', 'usdt', 'd-euro', 't-bond', 'e-cedi'];

// --- REMOVED Dummy Data for Asset Orders (Now managed by Context) ---
// const dummyAssetOrders = [ ... ];

/**
 * Treasury Management Dashboard component.
 * Container component that handles navigation between Treasury sub-features.
 * @param {object} props - Component props.
 * @param {object} props.assetLogos - Map of asset symbols/IDs to logo paths.
 * @param {object} props.blockchainLogos - Map of blockchain names to logo paths.
 */
const TreasuryDashboard = ({ assetLogos = {}, blockchainLogos = {} }) => {
  // State for navigation
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedTreasuryAssetId, setSelectedTreasuryAssetId] = useState(null);

  // --- Get data from Context ---
  const { assets } = useAssets();
  const { assetOrders } = useAssetOrders(); // <-- Get orders from context

  // --- REMOVED local state for asset orders ---
  // const [assetOrders, setAssetOrders] = useState(dummyAssetOrders);

  console.log("Rendering TreasuryDashboard, currentView:", currentView, "Orders:", assetOrders?.length);

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


  // --- Render Function for Dashboard View ---
  const renderDashboardView = () => (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Treasury Management</h1>
      {/* Action Card Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {/* Redeem Card */}
           <div className="bg-white p-4 rounded shadow">
               <h2 className="font-bold border-b pb-2 mb-4 text-gray-800">Redeem Token</h2>
               <p className="text-sm text-gray-600 mb-3">Redeem platform-issued tokens for their underlying asset value (e.g., fiat, commodity units).</p>
               <button type="button" className="px-4 py-2 rounded text-white hover:opacity-90 bg-yellow-500 hover:bg-yellow-600" onClick={() => handleNavigate('redeem')} > Go to Redeem </button>
           </div>
           {/* Swap Card */}
           <div className="bg-white p-4 rounded shadow">
               <h2 className="font-bold border-b pb-2 mb-4 text-gray-800">Swap Token</h2>
               <p className="text-sm text-gray-600 mb-3">Swap between different platform tokens and core treasury assets (e.g., USDC, USDT, T-BOND).</p>
               <button type="button" className="px-4 py-2 rounded text-white hover:opacity-90 bg-yellow-500 hover:bg-yellow-600" onClick={() => handleNavigate('swap')} > Go to Swap </button>
           </div>
           {/* Asset Order Card */}
            <div className="bg-white p-4 rounded shadow">
               <h2 className="font-bold border-b pb-2 mb-4 text-gray-800">Asset Orders</h2>
               <p className="text-sm text-gray-600 mb-3">View and manage internal asset transfers, FX conversions, and purchases/sales.</p>
               <button type="button" className="px-4 py-2 rounded text-white hover:opacity-90 bg-yellow-500 hover:bg-yellow-600" onClick={() => handleNavigate('assetOrdersList')} > View Asset Orders </button>
            </div>
        </div>
      </div>
      {/* Treasury Assets Overview Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Treasury Assets Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {treasuryAssets.length > 0 ? treasuryAssets.map(asset => (
            <div key={asset.id} className="bg-white p-4 rounded shadow flex flex-col border border-gray-200 cursor-pointer hover:shadow-lg hover:border-gray-400 transition-all" onClick={() => handleTreasuryAssetCardClick(asset.id)} >
              <div className="flex items-center border-b pb-2 mb-2"> {(assetLogos[asset.id] || assetLogos[asset.symbol]) && ( <img src={assetLogos[asset.id] || assetLogos[asset.symbol]} alt={`${asset.label} logo`} className="h-5 w-5 mr-2" onError={(e) => { e.target.style.display = 'none'; }} /> )} <h3 className="font-bold text-gray-800">{asset.label} ({asset.symbol})</h3> </div>
              <div className="flex-grow space-y-2 text-sm mb-3"> <p className="text-gray-600">{asset.description}</p> <div className="flex flex-wrap gap-1"> {asset.assetClass && <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">{asset.assetClass}</span>} {asset.physicality && <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 border border-green-200">{asset.physicality}</span>} {asset.custodyType && <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">{asset.custodyType}</span>} </div> {asset.blockchain && asset.blockchain !== 'N/A' && ( <div className="flex items-center text-xs text-gray-400"> {blockchainLogos[asset.blockchain] && (<img src={blockchainLogos[asset.blockchain]} alt={`${asset.blockchain} logo`} className="h-4 w-4 mr-1.5" onError={(e) => { e.target.style.display = 'none'; }}/>)} <span>On: {asset.blockchain}</span> </div> )} {asset.price !== null && asset.price !== undefined && ( <p className="text-xs text-gray-500"> Value: ~{formatNumber(asset.price)} USD / token </p> )} </div>
              <div className="mt-auto bg-gray-100 p-3 rounded -m-4 mt-4"> <div className="flex justify-between items-center"> <span className="text-sm text-gray-700">Balance:</span> <span className="font-bold text-sm">{formatNumber(asset.balance)} {asset.symbol}</span> </div> </div>
            </div>
          )) : (
            <p className="text-gray-500 italic col-span-full">No specific treasury assets found or still loading...</p>
          )}
        </div>
      </div>
    </div>
  );

  // --- Main Return: Use conditional rendering ---
  return (
    <>
      {currentView === 'dashboard' && renderDashboardView()}

      {currentView === 'redeem' && (
        <RedeemTokenScreen onBack={handleBackToTreasuryDashboard} />
      )}

      {currentView === 'swap' && (
        <SwapTokenScreen onBack={handleBackToTreasuryDashboard} />
      )}

      {currentView === 'treasuryAssetDetail' && selectedTreasuryAssetId && (
        (() => {
          const selectedAsset = Array.isArray(assets) ? assets.find(asset => asset.id === selectedTreasuryAssetId) : null;
          if (!selectedAsset) { console.error("Treasury AssetDetailView Error: Could not find selected asset ID:", selectedTreasuryAssetId); alert("Error loading asset details."); handleBackToTreasuryDashboard(); return null; }
          return (<AssetDetailView asset={selectedAsset} hardcodedDetailsMap={hardcodedAssetDetails} onBack={handleBackToTreasuryDashboard} assetLogosMap={assetLogos} blockchainLogosMap={blockchainLogos} />);
        })()
      )}

      {/* Render Asset Orders List View Component */}
      {currentView === 'assetOrdersList' && (
        <AssetOrdersListView
            // Pass orders from context down as props
            assetOrders={assetOrders}
            onBack={handleBackToTreasuryDashboard}
            onCreateNew={() => handleNavigate('createAssetOrder')}
        />
      )}

      {/* Render Create Asset Order Screen Component */}
      {currentView === 'createAssetOrder' && (
        <CreateAssetOrderScreen
            onBack={handleBackToOrdersList}
            // No need to pass orders here, create screen uses context dispatch
        />
      )}
    </>
  );
};

export default TreasuryDashboard;