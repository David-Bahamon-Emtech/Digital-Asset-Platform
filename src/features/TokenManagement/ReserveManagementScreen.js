import React, { useState, useEffect, useMemo } from 'react';
import { useAssets } from '../../context/AssetsContext';
import { useTokenHistory } from '../../context/TokenHistoryContext';
import { formatNumber } from '../../utils/displayUtils';
import { getAlertThreshold } from '../../utils/metricsData.js';

// Constants
const currentUserInitials = 'RM'; // Example user
const approverInitials = 'SA'; // Example approver
const defaultAlertThreshold = 100; // Default if not found
const allowedPredefinedTokenIds = [ 'cp-acme-01', 'mmf-usd-01', 'xagc-01', 'oil-wti-01', 'cc-verra-01', ];

/**
 * ReserveManagementScreen Component
 * Displays reserve details for selected assets, reading data dynamically from AssetsContext.
 * Allows configuration of alert thresholds.
 */
const ReserveManagementScreen = ({ assetLogosMap = {}, onBack, alertThresholds = {}, onUpdateThreshold }) => {
  const { assets } = useAssets(); // Get assets from context
  const { dispatchTokenHistory } = useTokenHistory(); // For logging threshold changes

  // State
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [currentThresholdInput, setCurrentThresholdInput] = useState('');
  const [showAllAccountsModal, setShowAllAccountsModal] = useState(false);

  // Filter assets that should have reserve data displayed
  const displayableTokenAssets = useMemo(() => { /* ... unchanged ... */
      if (!Array.isArray(assets)) return [];
      return assets.filter(asset => allowedPredefinedTokenIds.includes(asset.id) || (asset.isWizardIssued && asset.reserveData) );
  }, [assets]);

  // Effect to select the first available asset
  useEffect(() => { /* ... unchanged ... */
      if (displayableTokenAssets.length > 0) { if (!selectedAssetId || !displayableTokenAssets.some(a => a.id === selectedAssetId)) { setSelectedAssetId(displayableTokenAssets[0].id); } } else { setSelectedAssetId(''); } }, [displayableTokenAssets, selectedAssetId]);

  // Get the full selected asset object from context
  const selectedAsset = useMemo(() => { /* ... unchanged ... */
      if (!selectedAssetId || !Array.isArray(assets)) return null; return assets.find(asset => asset.id === selectedAssetId); }, [selectedAssetId, assets]);

  // Derive display info directly from selectedAsset and its reserveData
  const reserveInfoToDisplay = useMemo(() => {
      if (!selectedAsset) return null;

      const reserveData = selectedAsset.reserveData;

      if (reserveData) {
          return {
              // *** UPDATED: Add totalSupply for the card ***
              totalSupply: selectedAsset.totalSupplyIssued,
              circulation: selectedAsset.balance || 0, // Keep circulation for potential future use if needed
              ratio: reserveData.ratio ?? 'N/A',
              requirement: reserveData.requirement ?? getAlertThreshold(selectedAsset),
              lastAudit: reserveData.lastAudit || 'N/A',
              auditor: reserveData.auditor || 'N/A',
              composition: reserveData.composition || [],
              accounts: reserveData.accounts || [],
              isFiniteSupply: selectedAsset.supply === 'Finite' // Add flag for display logic
          };
      } else {
          // Fallback for assets without reserveData
          return {
              totalSupply: selectedAsset.totalSupplyIssued, // Still might have total supply
              circulation: selectedAsset.balance || 0,
              ratio: 'N/A',
              requirement: getAlertThreshold(selectedAsset),
              lastAudit: 'N/A',
              auditor: 'N/A',
              composition: [],
              accounts: [],
              isFiniteSupply: selectedAsset.supply === 'Finite'
          };
      }
  }, [selectedAsset]); // Recompute when selectedAsset changes

  // Get the current alert threshold
  const currentThreshold = useMemo(() => { /* ... unchanged ... */
      return selectedAssetId ? (alertThresholds[selectedAssetId] ?? getAlertThreshold(selectedAsset)) : getAlertThreshold(null); }, [selectedAssetId, selectedAsset, alertThresholds]);

  // Effect to set modal input value
  useEffect(() => { /* ... unchanged ... */
      if (isAlertModalOpen && selectedAssetId) { setCurrentThresholdInput(String(currentThreshold)); } }, [isAlertModalOpen, selectedAssetId, currentThreshold]);

  // --- Event Handlers ---
  const handleGenerateReport = () => { alert('Placeholder: Generate Attestation Report'); };
  const handleViewHistory = () => { alert('Placeholder: View Historical Reports'); };
  const handleOpenAlertModal = () => { if (selectedAsset) setIsAlertModalOpen(true); };
  const handleSaveThreshold = () => { /* ... unchanged ... */
     if (!selectedAsset || !onUpdateThreshold) return; const newThreshold = parseFloat(currentThresholdInput); if (!isNaN(newThreshold) && newThreshold >= 0 && newThreshold <= 200) { onUpdateThreshold(selectedAssetId, newThreshold); try { const historyEntry = { id: Date.now() + Math.random(), timestamp: new Date(), actionType: 'Reserve Alert', details: `Alert threshold for ${selectedAsset.symbol} set to ${newThreshold}%`, user: currentUserInitials, approver: approverInitials, assetId: selectedAsset.id, assetSymbol: selectedAsset.symbol, assetName: selectedAsset.label, notes: `Threshold updated via Reserve Management Screen.` }; dispatchTokenHistory({ type: 'ADD_TOKEN_HISTORY', payload: historyEntry }); console.log("Dispatched Reserve Alert history:", historyEntry); } catch (error) { console.error("Error dispatching token history for alert change:", error); } setIsAlertModalOpen(false); alert(`Alert threshold for ${selectedAsset.label} set to ${newThreshold}%`); } else { alert("Please enter a valid percentage between 0 and 200."); } };

  // --- Render Logic ---
  return (
    <div className="p-8">
      <div className="bg-white p-6 rounded shadow max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 border-b pb-3">
            <h1 className="text-2xl font-bold text-gray-800">Reserve Management</h1>
            <button type="button" className="px-3 py-1 rounded text-white hover:opacity-90 bg-gray-800 text-sm" onClick={onBack}> Back to Dashboard </button>
        </div>

        {/* Asset Selection Tabs */}
        <div className="mb-6"> {/* ... unchanged ... */}
            <label className="block mb-2 font-medium text-gray-700">Select Token Type</label>
            <div className="flex space-x-2 border-b border-gray-200 overflow-x-auto pb-2">
                {displayableTokenAssets.map(asset => ( <button key={asset.id} onClick={() => setSelectedAssetId(asset.id)} className={`flex-shrink-0 flex items-center px-4 py-2 text-sm font-medium rounded-t-md focus:outline-none transition-colors duration-150 ease-in-out ${ selectedAssetId === asset.id ? 'border-b-2 border-yellow-600 text-yellow-700 bg-yellow-50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100' }`} > {asset.isWizardIssued ? ( <img src={asset.logoPath || '/logos/generic-token.png'} alt="Token type icon" className="h-4 w-4 mr-2" onError={(e) => { e.target.src = '/logos/generic-token.png'; }} /> ) : ( (assetLogosMap[asset.id] || assetLogosMap[asset.symbol]) && ( <img src={assetLogosMap[asset.id] || assetLogosMap[asset.symbol]} alt={`${asset.label} logo`} className="h-4 w-4 mr-2" onError={(e) => { e.target.style.display = 'none'; }} /> ) )} {asset.label} ({asset.symbol}) </button> ))}
                {displayableTokenAssets.length === 0 && ( <p className="text-sm text-gray-500 italic pl-4 py-2"> {Array.isArray(assets) ? 'No reservable token assets found.' : 'Loading assets...'} </p> )}
            </div>
        </div>

        {/* Reserve Details Content Area */}
        {!selectedAsset || !reserveInfoToDisplay ? ( /* ... unchanged ... */ <div className="text-center py-10 text-gray-500"> {!selectedAssetId ? "Select a token above to view reserve details." : "Loading reserve data..."} </div>
        ) : (
            <div className="space-y-8">
                {/* Summary Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                    {/* *** UPDATED Card 1: Total Issued *** */}
                    <div className="bg-gray-50 p-4 rounded shadow">
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Total Tokens Issued</h3>
                        <p className="text-2xl font-semibold text-gray-900">
                            {reserveInfoToDisplay.isFiniteSupply
                                ? formatNumber(reserveInfoToDisplay.totalSupply)
                                : 'Infinite'}
                        </p>
                        {/* Display circulation below total issued if needed */}
                         <p className="text-xs text-gray-500 mt-1">
                            (Circulating: {formatNumber(reserveInfoToDisplay.circulation)})
                         </p>
                    </div>
                    {/* Reserve Ratio Card */}
                    <div className="bg-gray-50 p-4 rounded shadow relative"> {/* ... unchanged ... */}
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Reserve Ratio</h3>
                        <p className="text-2xl font-semibold text-gray-900"> {typeof reserveInfoToDisplay.ratio === 'number' ? `${reserveInfoToDisplay.ratio.toFixed(1)}%` : reserveInfoToDisplay.ratio} </p>
                        {typeof reserveInfoToDisplay.ratio === 'number' && typeof currentThreshold === 'number' && currentThreshold > 0 && ( <p className={`text-xs ${reserveInfoToDisplay.ratio >= currentThreshold ? 'text-green-600' : 'text-red-600'}`}> {reserveInfoToDisplay.ratio >= currentThreshold ? `Above requirement (${currentThreshold}%)` : `ALERT: Below requirement (${currentThreshold}%)` } </p> )}
                        {typeof reserveInfoToDisplay.ratio === 'number' && typeof currentThreshold === 'number' && currentThreshold > 0 && reserveInfoToDisplay.ratio < currentThreshold && ( <span className="absolute top-2 right-2 text-red-500" title={`Reserve ratio below configured threshold of ${currentThreshold}%!`}> <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg> </span> )}
                    </div>
                    {/* Audit Card */}
                    <div className="bg-gray-50 p-4 rounded shadow"> {/* ... unchanged ... */}
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Last External Audit/Verification</h3>
                        <p className="text-xl font-semibold text-gray-900">{reserveInfoToDisplay.lastAudit}</p>
                        <p className="text-xs text-gray-500">Verified by {reserveInfoToDisplay.auditor}</p>
                    </div>
                </div>

                {/* Reserve Composition */}
                <div> {/* ... unchanged ... */}
                    <h2 className="text-xl font-semibold mb-3 text-gray-800">Reserve Composition</h2>
                    <div className="space-y-2"> {reserveInfoToDisplay.composition?.map((item, index) => ( <div key={index}> <div className="flex justify-between text-sm mb-1"> <span className="text-gray-700">{item.name}</span> <span className="font-medium text-gray-800">{item.percent.toFixed(1)}%</span> </div> <div className="w-full bg-gray-200 rounded-full h-2.5"> <div className="bg-gradient-to-r from-blue-400 to-blue-600 h-2.5 rounded-full" style={{ width: `${item.percent}%` }}></div> </div> </div> ))} {(!reserveInfoToDisplay.composition || reserveInfoToDisplay.composition.length === 0) && ( <p className="text-sm text-gray-500 italic">Composition data not applicable or available.</p> )} </div>
                </div>

                {/* Reserve Accounts Table */}
                {reserveInfoToDisplay.accounts && reserveInfoToDisplay.accounts.length > 0 && ( /* ... unchanged ... */ <div> <div className="flex justify-between items-center mb-3"> <h2 className="text-xl font-semibold text-gray-800">Reserve Accounts (Top {Math.min(reserveInfoToDisplay.accounts.length, 3)})</h2> {reserveInfoToDisplay.accounts.length > 3 && ( <button onClick={() => setShowAllAccountsModal(true)} className="text-sm text-blue-600 hover:underline"> View All Accounts ({reserveInfoToDisplay.accounts.length}) </button> )} </div> <div className="overflow-x-auto border rounded"> <table className="min-w-full divide-y divide-gray-200"> <thead className="bg-gray-50"> <tr> <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Institution/Registry</th> <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account Type</th> <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance/Holding</th> <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th> <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th> </tr> </thead> <tbody className="bg-white divide-y divide-gray-200"> {reserveInfoToDisplay.accounts.slice(0, 3).map((account, index) => ( <tr key={index}> <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{account.institution}</td> <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{account.type}</td> <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700"> {account.originalBalanceStr ?? (account.numericBalance !== null ? account.numericBalance.toLocaleString() : 'N/A')} </td> <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{account.updated}</td> <td className="px-6 py-4 whitespace-nowrap"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${ ['Active', 'Verified', 'Secure', 'Configured'].includes(account.status) ? 'bg-green-100 text-green-800' : ['Retired', 'Inactive', 'Planning'].includes(account.status) ? 'bg-gray-100 text-gray-800' : 'bg-yellow-100 text-yellow-800' }`}> {account.status} </span></td> </tr> ))} </tbody> </table> </div> </div> )}

                {/* Action Buttons */}
                <div className="pt-6 border-t border-gray-200 flex flex-col md:flex-row justify-between space-y-3 md:space-y-0 md:space-x-3"> {/* ... unchanged ... */}
                    <button onClick={handleGenerateReport} className="w-full md:w-auto px-4 py-2 rounded text-white hover:opacity-90 bg-yellow-600 disabled:opacity-50" disabled={!selectedAsset || !reserveInfoToDisplay} > Generate Attestation Report </button>
                    <button onClick={handleViewHistory} className="w-full md:w-auto px-4 py-2 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50" disabled={!selectedAsset || !reserveInfoToDisplay} > View Historical Reports </button>
                    <button onClick={handleOpenAlertModal} className="w-full md:w-auto px-4 py-2 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50" disabled={!selectedAsset || typeof reserveInfoToDisplay?.ratio !== 'number'} > Configure Reserve Alerts </button>
                </div>
            </div>
        )}

        {/* Alert Configuration Modal */}
        {isAlertModalOpen && selectedAsset && ( /* ... unchanged ... */ <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center"> <div className="relative bg-white p-6 border w-full max-w-md mx-auto shadow-lg rounded-md"> <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Configure Reserve Alert for {selectedAsset.label}</h3> <div className="mt-2"> <label htmlFor="threshold" className="block text-sm font-medium text-gray-700">Alert Threshold (%)</label> <input type="number" id="threshold" name="threshold" className="mt-1 w-full p-2 border rounded" placeholder="e.g., 100" value={currentThresholdInput} onChange={(e) => setCurrentThresholdInput(e.target.value)} min="0" max="200" step="0.1" /> <p className="text-xs text-gray-500 mt-1">Set the minimum reserve ratio percentage. An alert will show if the actual ratio falls below this.</p> </div> <div className="mt-6 flex justify-end space-x-3"> <button type="button" className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50" onClick={() => setIsAlertModalOpen(false)} > Cancel </button> <button type="button" className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:opacity-90" onClick={handleSaveThreshold} > Save Threshold </button> </div> </div> </div> )}

        {/* View All Accounts Modal */}
        {showAllAccountsModal && selectedAsset && reserveInfoToDisplay?.accounts && ( /* ... unchanged ... */ <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4"> <div className="relative bg-white p-6 border w-full max-w-3xl mx-auto shadow-lg rounded-md"> <div className="flex justify-between items-center mb-4"> <h3 className="text-xl font-medium leading-6 text-gray-900">All Reserve Accounts for {selectedAsset.label}</h3> <button onClick={() => setShowAllAccountsModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button> </div> <div className="max-h-[60vh] overflow-y-auto border rounded"> <table className="min-w-full divide-y divide-gray-200"> <thead className="bg-gray-50 sticky top-0"> <tr> <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Institution/Registry</th> <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account Type</th> <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance/Holding</th> <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th> <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th> </tr> </thead> <tbody className="bg-white divide-y divide-gray-200"> {reserveInfoToDisplay.accounts.map((account, index) => ( <tr key={index}> <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{account.institution}</td> <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{account.type}</td> <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700"> {account.originalBalanceStr ?? (account.numericBalance !== null ? account.numericBalance.toLocaleString() : 'N/A')} </td> <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{account.updated}</td> <td className="px-6 py-4 whitespace-nowrap"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${ ['Active', 'Verified', 'Secure', 'Configured'].includes(account.status) ? 'bg-green-100 text-green-800' : ['Retired', 'Inactive', 'Planning'].includes(account.status) ? 'bg-gray-100 text-gray-800' : 'bg-yellow-100 text-yellow-800' }`}> {account.status} </span></td> </tr> ))} </tbody> </table> </div> <div className="mt-6 flex justify-end"> <button type="button" className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50" onClick={() => setShowAllAccountsModal(false)} > Close </button> </div> </div> </div> )}
      </div>
    </div>
  );
};

export default ReserveManagementScreen;
