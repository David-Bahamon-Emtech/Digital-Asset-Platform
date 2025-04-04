import React, { useState, useEffect } from 'react';

// Simulated reserve data structure for predefined assets (for demo purposes).
const dummyReserveData = {
  usdc: { circulation: 10000000, circulationChange: 500000, ratio: 102.4, requirement: 100, lastAudit: '2025-02-28', auditor: 'Deloitte LLP', composition: [ { name: 'USDC (Circle)', percent: 80.5 }, { name: 'Short-Term US Treasuries', percent: 15.2 }, { name: 'Cash Deposits (US Banks)', percent: 4.3 } ], accounts: [ { institution: 'Circle Internet Financial', type: 'USDC Reserve', balance: '8,243,765 USDC', updated: 'Today, 11:30 AM', status: 'Active' }, { institution: 'US Treasury Direct', type: 'T-Bills (3-month)', balance: '1,556,420 USD', updated: 'Today, 9:00 AM', status: 'Active' }, { institution: 'JPMorgan Chase', type: 'Cash Deposit', balance: '440,215 USD', updated: 'Today, 10:15 AM', status: 'Active' }, { institution: 'Bank of New York Mellon', type: 'Custodial Cash', balance: '150,000 USD', updated: 'Yesterday, 4:00 PM', status: 'Active' }, { institution: 'BlackRock MMF', type: 'Money Market Fund', balance: '100,000 USD', updated: 'Today, 11:00 AM', status: 'Active' }, { institution: 'Coinbase Prime', type: 'Trading Balance', balance: '50,000 USDC', updated: 'Today, 11:35 AM', status: 'Active' }, ] },
  usdt: { circulation: 8500000, circulationChange: -100000, ratio: 101.1, requirement: 100, lastAudit: '2025-03-15', auditor: 'BDO Italia', composition: [ { name: 'Cash & Equivalents', percent: 75.0 }, { name: 'Secured Loans', percent: 10.0 }, { name: 'Corporate Bonds', percent: 8.0 }, { name: 'Other Investments (incl. Crypto)', percent: 7.0 } ], accounts: [ { institution: 'Cantor Fitzgerald', type: 'Money Market Funds', balance: '6,375,000 USD Equiv.', updated: 'Today, 11:45 AM', status: 'Active' }, { institution: 'Various Counterparties', type: 'Secured Loans (Overcollateralized)', balance: '850,000 USD Value', updated: 'Yesterday, 5:00 PM', status: 'Active' }, { institution: 'Investment Portfolio', type: 'Bonds/Other', balance: '1,275,000 USD Value', updated: 'Today, 8:30 AM', status: 'Active' }, { institution: 'Partner Bank Offshore', type: 'Cash Deposit', balance: '500,000 USD', updated: 'Yesterday, 10:00 AM', status: 'Active'} ] },
  't-gold': { circulation: 5000, circulationChange: 100, ratio: 100.0, requirement: 100, lastAudit: '2025-04-01', auditor: 'Bank of Ghana Internal Audit', composition: [ { name: 'Physical Gold (Vaulted)', percent: 100.0 } ], accounts: [ { institution: 'Bank of Ghana Vault A', type: 'Allocated Gold Bars', balance: '3000 Units (repr. oz)', updated: 'This morning', status: 'Secure' }, { institution: 'Bank of Ghana Vault B', type: 'Allocated Gold Bars', balance: '2000 Units (repr. oz)', updated: 'Last Week', status: 'Secure' } ] },
  'e-cedi': { circulation: 15000000, circulationChange: 1500000, ratio: 100.0, requirement: 100, lastAudit: 'N/A (Direct Liability)', auditor: 'Bank of Ghana', composition: [ { name: 'Direct Central Bank Liability', percent: 100.0 } ], accounts: [ { institution: 'Bank of Ghana Ledger', type: 'CBDC Liability Entry', balance: '15,000,000 eGH¢', updated: 'Real-time', status: 'Active' } ] },
  'd-euro': { circulation: 9000000, circulationChange: 0, ratio: 100.0, requirement: 100, lastAudit: 'N/A (Concept Phase)', auditor: 'European Central Bank', composition: [ { name: 'Proposed Central Bank Liability', percent: 100.0 } ], accounts: [ { institution: 'ECB (Proposed)', type: 'CBDC Liability (Concept)', balance: '9,000,000 D-EUR', updated: 'N/A', status: 'Planning' } ] }
};
// Default alert thresholds for predefined assets. User token defaults are handled dynamically.
const defaultAlertThresholds = { usdc: 101, usdt: 100, 't-gold': 100, 'e-cedi': 100, 'd-euro': 100 };


// Helper Function triggers a browser download for CSV content.
const downloadCSV = (csvContent, filename) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};

/**
 * Displays reserve information for selected tokens, allowing users to switch between
 * tokens, view details, generate simulated reports, view all accounts in a modal,
 * and configure simulated reserve ratio alerts. It uses hardcoded dummy data for
 * predefined assets and generates fallback data for user-issued tokens based on
 * their current balance and issuance configuration.
 *
 * @param {object} props - Component props.
 * @param {Array} props.assets - The list of all available assets (predefined and user-issued).
 * @param {object} props.assetLogosMap - A map of asset IDs/symbols to their logo image paths.
 * @param {function} props.onBack - Callback function to navigate back to the previous view (e.g., dashboard).
 */
const ReserveManagementScreen = ({ assets = [], assetLogosMap = {}, onBack }) => {

  const [selectedAssetId, setSelectedAssetId] = useState(assets[0]?.id || '');
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [alertThresholds, setAlertThresholds] = useState(() => {
     // Initialize thresholds ensuring all assets have a default value.
     const initialThresholds = { ...defaultAlertThresholds };
     assets.forEach(asset => {
         // Use asset.id as the key, ensuring consistency. Add default if not present.
         if (!(asset.id in initialThresholds)) {
             initialThresholds[asset.id] = 100;
         }
     });
     return initialThresholds;
  });
  const [currentThresholdInput, setCurrentThresholdInput] = useState('');
  const [showAllAccountsModal, setShowAllAccountsModal] = useState(false);


  // Find the currently selected asset object from the assets list.
  const selectedAsset = assets.find(a => a.id === selectedAssetId);

  // Determine the reserve information to display.
  // Try finding specific dummy data first. If not found and it's a user-issued token,
  // generate fallback information based on the asset's state and wizard configuration.
  let reserveInfo = null;
  if (selectedAsset) {
    reserveInfo = dummyReserveData[selectedAssetId]; // Lookup using ID

    if (!reserveInfo && selectedAsset.isWizardIssued) {
      // Generate fallback data for user-issued tokens without specific dummy entries.
      const isBacked = selectedAsset.wizardData?.reserveDetails?.isBackedAsset || false;
      let compositionName = 'Not Asset Backed';
      let backingType = 'N/A';
      let backingDetails = 'N/A';
      if (isBacked) {
          const details = selectedAsset.wizardData.reserveDetails;
          backingType = details.backingType ? details.backingType.charAt(0).toUpperCase() + details.backingType.slice(1) : 'Configured';
          if (selectedAsset.parsedValueDefinition) { compositionName = `${selectedAsset.parsedValueDefinition.targetSymbol} Backing (Defined)`; }
          else { compositionName = `${backingType} Backing`; }
          if (details.backingType === 'bank') backingDetails = `${details.bankName} (...${details.accountNumberLast4})`;
          else if (details.backingType === 'smartcontract') backingDetails = `${details.contractNetwork} (${details.contractAddress})`;
          else if (details.backingType === 'custodian') backingDetails = `${details.custodianName} (${details.attestationFrequency})`;
          else backingDetails = 'Details in Issuance Config';
      }
      reserveInfo = {
        circulation: selectedAsset.balance,
        circulationChange: selectedAsset.balance,
        ratio: isBacked ? 100.0 : 'N/A',
        requirement: 100,
        lastAudit: 'N/A (User Issued)',
        auditor: 'Self-Attested (Demo)',
        composition: [ { name: compositionName, percent: 100.0 } ],
        accounts: [ { institution: isBacked ? backingType : 'N/A', type: isBacked ? 'User Defined Reserve' : 'Unbacked Token', balance: isBacked ? backingDetails : 'N/A', updated: 'N/A', status: 'Active' }, { institution: 'Circulation Ledger', type: 'Token Balance', balance: `${selectedAsset.balance.toLocaleString()} ${selectedAsset.symbol}`, updated: 'Real-time', status: 'Active' } ],
        _backingType: isBacked ? backingType : 'Not Backed', // Internal helper for CSV
        _backingDetails: isBacked ? backingDetails : 'N/A' // Internal helper for CSV
      };
    }
  }

  // Get the currently configured alert threshold for the selected asset.
  const currentThreshold = selectedAsset ? (alertThresholds[selectedAssetId] !== undefined ? alertThresholds[selectedAssetId] : 100) : 100;

  // Update the threshold input field value when the modal opens or the selected asset changes.
  useEffect(() => {
    if (isAlertModalOpen && selectedAsset) {
      setCurrentThresholdInput(String(currentThreshold));
    }
  }, [isAlertModalOpen, selectedAsset, currentThreshold]);


  // --- Action Handlers ---

  // Generates and downloads a simulated attestation report CSV.
  const handleGenerateReport = () => {
    if (!selectedAsset || !reserveInfo) return;
    const today = new Date().toISOString().split('T')[0];
    let csvContent = "Asset Symbol,Report Date,Auditor,Reserve Ratio (%),Total Circulation,Backing Type,Backing Details\n";
    const backingType = reserveInfo._backingType || (reserveInfo.composition ? reserveInfo.composition.map(c=>c.name).join('; ') : 'N/A');
    const backingDetails = reserveInfo._backingDetails || 'See reserve accounts';
    csvContent += `${selectedAsset.symbol},${today},${reserveInfo.auditor},${reserveInfo.ratio},${reserveInfo.circulation},${backingType},"${backingDetails}"\n`;
    downloadCSV(csvContent, `${selectedAsset.symbol}_Attestation_${today}.csv`);
    alert(`Generated Attestation Report for ${selectedAsset.label}. Check your downloads.`);
  };

  // Generates and downloads a simulated historical reserve data CSV.
  const handleViewHistory = () => {
    if (!selectedAsset || !reserveInfo) return;
    const today = new Date();
    let csvContent = "Date,Circulation,Reserve Ratio (%)\n";
    for (let i = 0; i < 3; i++) { // Generate 3 months of history
        const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const dateString = date.toISOString().split('T')[0];
        const dummyCirc = reserveInfo.circulation * (1 - (i * 0.05));
        const dummyRatio = typeof reserveInfo.ratio === 'number' ? reserveInfo.ratio + (Math.random() * 2 - 1) : reserveInfo.ratio;
        csvContent += `${dateString},${Math.round(dummyCirc)},${typeof dummyRatio === 'number' ? dummyRatio.toFixed(1) : dummyRatio}\n`;
    }
    downloadCSV(csvContent, `${selectedAsset.symbol}_Historical_Reserves_${today.toISOString().split('T')[0]}.csv`);
     alert(`Generated Historical Report for ${selectedAsset.label}. Check your downloads.`);
  };

  // Opens the modal for configuring reserve alerts.
  const handleOpenAlertModal = () => { if (selectedAsset) setIsAlertModalOpen(true); };

  // Saves the new alert threshold entered in the modal.
  const handleSaveThreshold = () => {
     if (!selectedAsset) return;
     const newThreshold = parseFloat(currentThresholdInput);
     if (!isNaN(newThreshold) && newThreshold >= 0 && newThreshold <= 200) {
       setAlertThresholds(prev => ({ ...prev, [selectedAssetId]: newThreshold }));
       setIsAlertModalOpen(false);
       alert(`Alert threshold for ${selectedAsset.label} set to ${newThreshold}%`);
     } else {
       alert("Please enter a valid percentage between 0 and 200.");
     }
   };


  // --- Render Logic ---
  return (
    <div className="p-8">
      <div className="bg-white p-6 rounded shadow max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 border-b pb-3">
           <h1 className="text-2xl font-bold text-gray-800">Reserve Management</h1>
           <button className="px-3 py-1 rounded text-white hover:opacity-90 bg-gray-800 text-sm" onClick={onBack}> Back to Dashboard </button>
         </div>

        {/* Token Selection */}
        <div className="mb-6">
           <label className="block mb-2 font-medium text-gray-700">Select Token Type</label>
           <div className="flex space-x-2 border-b border-gray-200 overflow-x-auto pb-2">
             {assets.map(asset => (
               <button
                 key={asset.id}
                 onClick={() => setSelectedAssetId(asset.id)}
                 className={`flex-shrink-0 flex items-center px-4 py-2 text-sm font-medium rounded-t-md focus:outline-none transition-colors duration-150 ease-in-out ${
                   selectedAssetId === asset.id
                     ? 'border-b-2 border-emtech-gold text-emtech-gold bg-yellow-50'
                     : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                 }`}
               >
                 {assetLogosMap && assetLogosMap[asset.id] && ( <img src={assetLogosMap[asset.id]} alt={`${asset.label} logo`} className="h-4 w-4 mr-2"/> )}
                 {asset.isWizardIssued && !assetLogosMap[asset.id] && ( <img src="/logos/generic-token.png" alt="Token logo" className="h-4 w-4 mr-2"/> )}
                 {asset.label} ({asset.symbol})
               </button>
             ))}
           </div>
         </div>

        {/* Reserve Details Display Area */}
        {!selectedAsset || !reserveInfo ? (
             <div className="text-center py-10 text-gray-500">
                {selectedAsset ? "Loading reserve data..." : "Please select a token type above."}
             </div>
         ) : (
          <div className="space-y-8">
            {/* Top Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="bg-gray-50 p-4 rounded shadow">
                 <h3 className="text-sm font-medium text-gray-500 mb-1">Total Tokens in Circulation</h3>
                 <p className="text-2xl font-semibold text-gray-900">{reserveInfo.circulation.toLocaleString()}</p>
                 {reserveInfo.circulationChange !== 0 && typeof reserveInfo.circulationChange === 'number' && (
                   <p className={`text-xs ${reserveInfo.circulationChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {reserveInfo.circulationChange > 0 ? '+' : ''}{reserveInfo.circulationChange.toLocaleString()} this month
                   </p>
                 )}
              </div>
              <div className="bg-gray-50 p-4 rounded shadow relative">
                 <h3 className="text-sm font-medium text-gray-500 mb-1">Reserve Ratio</h3>
                 <p className="text-2xl font-semibold text-gray-900">{typeof reserveInfo.ratio === 'number' ? `${reserveInfo.ratio}%` : reserveInfo.ratio}</p>
                 {typeof reserveInfo.ratio === 'number' &&
                     <p className={`text-xs ${reserveInfo.ratio >= currentThreshold ? 'text-green-600' : 'text-red-600'}`}>
                         {reserveInfo.ratio >= currentThreshold ? `+${(reserveInfo.ratio - currentThreshold).toFixed(1)}% requirement (${currentThreshold}%)` : `ALERT: Below requirement (${currentThreshold}%)` }
                     </p>
                 }
                 {typeof reserveInfo.ratio === 'number' && reserveInfo.ratio < currentThreshold && (
                    <span className="absolute top-2 right-2 text-red-500" title={`Reserve ratio below configured threshold of ${currentThreshold}%!`}>
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                    </span>
                 )}
              </div>
              <div className="bg-gray-50 p-4 rounded shadow">
                 <h3 className="text-sm font-medium text-gray-500 mb-1">Last External Audit</h3>
                 <p className="text-xl font-semibold text-gray-900">{reserveInfo.lastAudit}</p>
                 <p className="text-xs text-gray-500">Verified by {reserveInfo.auditor}</p>
              </div>
            </div>

            {/* Backing Attestation Info (Only for relevant user tokens) */}
            {selectedAsset.isWizardIssued && selectedAsset.wizardData?.reserveDetails?.isBackedAsset && (
                <div className="bg-blue-50 border border-blue-200 p-4 rounded">
                    <h3 className="text-lg font-semibold mb-2 text-blue-800">Reserve Backing Attestation (from Issuance)</h3>
                    <div className="text-sm space-y-1 text-blue-700">
                        <p><strong>Asset Backed:</strong> Yes</p>
                        <p><strong>Backing Type:</strong> <span className="capitalize">{selectedAsset.wizardData.reserveDetails.backingType || 'N/A'}</span></p>
                        {selectedAsset.wizardData.reserveDetails.backingType === 'bank' && ( <p><strong>Bank Details:</strong> {selectedAsset.wizardData.reserveDetails.bankName} (Account ending ...{selectedAsset.wizardData.reserveDetails.accountNumberLast4})</p> )}
                        {selectedAsset.wizardData.reserveDetails.backingType === 'smartcontract' && ( <p><strong>Contract:</strong> {selectedAsset.wizardData.reserveDetails.contractNetwork} - {selectedAsset.wizardData.reserveDetails.contractAddress}</p> )}
                        {selectedAsset.wizardData.reserveDetails.backingType === 'custodian' && ( <p><strong>Custodian:</strong> {selectedAsset.wizardData.reserveDetails.custodianName} (Attestation: {selectedAsset.wizardData.reserveDetails.attestationFrequency})</p> )}
                    </div>
                </div>
            )}

            {/* Reserve Composition Display */}
            <div>
              <h2 className="text-xl font-semibold mb-3 text-gray-800">Reserve Composition</h2>
              <div className="space-y-2">
                {reserveInfo.composition.map((item, index) => (
                  <div key={index}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700">{item.name}</span>
                      <span className="font-medium text-gray-800">{item.percent.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-gradient-to-r from-blue-400 to-blue-600 h-2.5 rounded-full" style={{ width: `${item.percent}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reserve Accounts Table (Preview) */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-xl font-semibold text-gray-800">Reserve Accounts (Top {reserveInfo.accounts.slice(0, 3).length})</h2>
                <button onClick={() => setShowAllAccountsModal(true)} className="text-sm text-blue-600 hover:underline">View All Accounts ({reserveInfo.accounts.length})</button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Institution</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account Type</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reserveInfo.accounts.slice(0, 3).map((account, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{account.institution}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{account.type}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{account.balance}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{account.updated}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${account.status === 'Active' || account.status === 'Secure' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                              {account.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Action Buttons Row */}
            <div className="pt-6 border-t border-gray-200 flex flex-col md:flex-row justify-between space-y-3 md:space-y-0 md:space-x-3">
               <button onClick={handleGenerateReport} className="w-full md:w-auto px-4 py-2 rounded text-white hover:opacity-90 bg-emtech-gold disabled:opacity-50" disabled={!selectedAsset || !reserveInfo} > Generate Attestation Report </button>
               <button onClick={handleViewHistory} className="w-full md:w-auto px-4 py-2 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50" disabled={!selectedAsset || !reserveInfo} > View Historical Reports </button>
               <button onClick={handleOpenAlertModal} className="w-full md:w-auto px-4 py-2 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50" disabled={!selectedAsset} > Configure Reserve Alerts </button>
            </div>

          </div>
        )}

        {/* Alert Configuration Modal */}
        {isAlertModalOpen && selectedAsset && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
                <div className="relative bg-white p-6 border w-full max-w-md mx-auto shadow-lg rounded-md">
                    <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Configure Reserve Alert for {selectedAsset.label}</h3>
                    <div className="mt-2">
                        <label htmlFor="threshold" className="block text-sm font-medium text-gray-700">Alert Threshold (%)</label>
                        <input type="number" id="threshold" name="threshold" className="mt-1 w-full p-2 border rounded" placeholder="e.g., 100" value={currentThresholdInput} onChange={(e) => setCurrentThresholdInput(e.target.value)} min="0" max="200" step="0.1" />
                        <p className="text-xs text-gray-500 mt-1">Set the minimum reserve ratio percentage. An alert will show if the actual ratio falls below this.</p>
                    </div>
                    <div className="mt-6 flex justify-end space-x-3">
                        <button type="button" className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50" onClick={() => setIsAlertModalOpen(false)} > Cancel </button>
                        <button type="button" className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emtech-gold hover:opacity-90" onClick={handleSaveThreshold} > Save Threshold </button>
                    </div>
                </div>
            </div>
        )}

        {/* View All Accounts Modal */}
        {showAllAccountsModal && selectedAsset && reserveInfo && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
                <div className="relative bg-white p-6 border w-full max-w-3xl mx-auto shadow-lg rounded-md">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-medium leading-6 text-gray-900">All Reserve Accounts for {selectedAsset.label}</h3>
                        <button onClick={() => setShowAllAccountsModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
                    </div>
                    <div className="max-h-[60vh] overflow-y-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50 sticky top-0">
                                  <tr>
                                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Institution</th>
                                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account Type</th>
                                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                  </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                  {reserveInfo.accounts.map((account, index) => (
                                      <tr key={index}>
                                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{account.institution}</td>
                                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{account.type}</td>
                                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{account.balance}</td>
                                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{account.updated}</td>
                                          <td className="px-6 py-4 whitespace-nowrap">
                                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${account.status === 'Active' || account.status === 'Secure' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                  {account.status}
                                              </span>
                                          </td>
                                      </tr>
                                  ))}
                              </tbody>
                          </table>
                     </div>
                     <div className="mt-6 flex justify-end">
                        <button type="button" className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50" onClick={() => setShowAllAccountsModal(false)} > Close </button>
                    </div>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};

export default ReserveManagementScreen;