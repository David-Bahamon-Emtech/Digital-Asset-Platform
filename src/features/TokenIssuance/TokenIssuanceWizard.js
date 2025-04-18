import React, { useState, useEffect } from 'react';

// Sample countries (keep as is or replace)
const sampleCountries = [
  { code: 'US', name: 'United States' }, { code: 'GB', name: 'United Kingdom' }, { code: 'CA', name: 'Canada' }, { code: 'EU', name: 'European Union (Region)' }, { code: 'SG', name: 'Singapore' }, { code: 'GH', name: 'Ghana' }, { code: 'OTHER', name: 'Other/Multiple' },
];

// Define RWA and Capital Asset sub-types
const rwaSubTypes = ["Gold (Troy Ounce)", "Carbon Credit", "Silver (Troy Ounce)", "Oil (Brent Crude Barrel)", "Real Estate", "Other"];
const capitalAssetSubTypes = ["Company Stock", "Government Bond", "Money Market Fund", "Commercial Paper", "Treasury Bill", "Other"];
// EDIT: Define Currency sub-types
const currencySubTypes = ["Asset Backed Stablecoin", "CBDC", "Cryptocurrency"];
// Define pricing currencies
const pricingCurrencies = ["USD", "EUR", "GHS", "CAD", "GBP", "SGD", "JPY"];
// Define hardcoded RWA values (USD)
const hardcodedRwaValues = {
    'Gold (Troy Ounce)': '3254.90',
    'Silver (Troy Ounce)': '31.73',
    'Oil (Brent Crude Barrel)': '64.71'
};
// EDIT: Define KYC Levels
const kycLevels = ["Simplified Due Diligence (SDD)", "Basic/Standard Due Diligence (CDD)", "Enhanced Due Diligence (EDD)"];


/**
 * A multi-step wizard component for guiding users through the process of issuing a new token.
 * Includes a simulated multi-step approval workflow (Compliance, Management) before final issuance.
 * Manages the state for wizard steps, approval workflow, and collected token data.
 * Calls `onBack` to return to the previous view or `onIssue` with the compiled token data upon successful approval and final confirmation.
 *
 * @param {object} props - Component props.
 * @param {function} props.onBack - Callback function to navigate back (e.g., to the dashboard).
 * @param {function} props.onIssue - Callback function triggered upon successful finalization *after* workflow approval, passing the complete token configuration data.
 */
const TokenIssuanceWizard = ({ onBack, onIssue }) => {
  // State for wizard step
  // EDIT: Renamed step 4 to step 3, step 5 to step 4
  const [issuanceScreen, setIssuanceScreen] = useState('token-details'); // step 1

  // State for collected data across wizard steps
  const [tokenDetails, setTokenDetails] = useState({
      name: '', symbol: '', blockchain: '', tokenType: '',
      rwaSubType: '', capitalAssetSubType: '',
      currencySubType: '' // EDIT: Added state
  });
  const [supplyDetails, setSupplyDetails] = useState({
      initialSupply: '', supplyType: 'finite', decimals: '18', metadata: '',
      marketValueCurrency: 'USD', marketValueAmount: '',
  });
  const [permissionDetails, setPermissionDetails] = useState({
      kycEnabled: false,
      kycLevel: '', // EDIT: Added state
      feeScheduleEnabled: false, pausable: true, fungible: true,
      isExpirationEnabled: false, // EDIT: Added state
      expiration: '',
      roles: []
  });
  const [reserveDetails, setReserveDetails] = useState({
      isBackedAsset: false, backingType: '', bankName: '', accountNumberLast4: '',
      contractNetwork: '', contractAddress: '', custodianName: '', attestationFrequency: '',
      onChainNetwork: '', onChainWalletAddress: '', // EDIT: Added state for new option
      isConfigured: false
  });
  const [regulatoryInfo, setRegulatoryInfo] = useState([]);

  // Temporary state variables for inputs within steps
  const [selectedRole, setSelectedRole] = useState('');
  const [roleAddress, setRoleAddress] = useState('');
  const [tempBankName, setTempBankName] = useState('');
  const [tempAccountNumber, setTempAccountNumber] = useState('');
  const [tempContractNetwork, setTempContractNetwork] = useState('Ethereum');
  const [tempContractAddress, setTempContractAddress] = useState('');
  const [tempCustodianName, setTempCustodianName] = useState('');
  const [tempAttestationFreq, setTempAttestationFreq] = useState('Daily');
  // EDIT: Added temp state for on-chain wallet form
  const [tempOnChainNetwork, setTempOnChainNetwork] = useState('Ethereum');
  const [tempOnChainWalletAddress, setTempOnChainWalletAddress] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [regulatorName, setRegulatorName] = useState('');
  // EDIT: Loading state for reserve connection simulation
  const [reserveConnectionLoading, setReserveConnectionLoading] = useState(false);


  // --- State for Approval Workflow ---
  const [workflowState, setWorkflowState] = useState('idle'); // 'idle', 'pending_compliance', 'pending_management', 'approved', 'rejected'
  const [workflowMessage, setWorkflowMessage] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [isLoading, setIsLoading] = useState(false); // For overall workflow steps
  const [finalTokenData, setFinalTokenData] = useState(null);

  // --- Helper Functions (Add Role, Add Regulatory Info - Unchanged) ---
    const handleAddRole = (event) => { /* ... unchanged ... */
        event.preventDefault();
        if (!selectedRole || !roleAddress.trim()) { alert('Please select a role and enter a valid address.'); return; }
        const newRole = { role: selectedRole, address: roleAddress };
        setPermissionDetails(prev => ({ ...prev, roles: [...prev.roles, newRole] }));
        setSelectedRole(''); setRoleAddress('');
    };
    const handleAddRegulatoryInfo = (event) => { /* ... unchanged ... */
        event.preventDefault();
        if (!selectedCountry || !regulatorName.trim()) { alert('Please select a country and enter a regulator name.'); return; }
        const newInfo = { country: selectedCountry, regulator: regulatorName.trim() };
        setRegulatoryInfo(prev => [...prev, newInfo]);
        setRegulatorName(''); // Clear only regulator name
    };

  // --- Reserve Connection Handlers (Modified for Dummy Validation) ---
    const handleConnectBank = (event) => {
        event.preventDefault();
        if (reserveConnectionLoading || !tempBankName || !tempAccountNumber) return; // Basic check
        setReserveConnectionLoading(true);
        setTimeout(() => {
            const last4 = tempAccountNumber.slice(-4);
            setReserveDetails(prev => ({ ...prev, bankName: tempBankName, accountNumberLast4: last4, backingType: 'bank', isConfigured: true }));
            setTempBankName(''); setTempAccountNumber(''); // Clear temp state
            setReserveConnectionLoading(false);
            console.log("Bank Connection: Approved");
        }, 3000); // 3 second delay
    };

    const handleConnectContract = (event) => {
        event.preventDefault();
         if (reserveConnectionLoading || !tempContractNetwork || !tempContractAddress) return;
         setReserveConnectionLoading(true);
         setTimeout(() => {
            setReserveDetails(prev => ({...prev, contractNetwork: tempContractNetwork, contractAddress: tempContractAddress, backingType: 'smartcontract', isConfigured: true }));
            setTempContractAddress(''); // Clear temp state
            setReserveConnectionLoading(false);
            console.log("Contract Connection: Approved");
        }, 3000);
    };

    const handleSetupCustodian = (event) => {
        event.preventDefault();
        if (reserveConnectionLoading || !tempCustodianName || !tempAttestationFreq) return;
        setReserveConnectionLoading(true);
        setTimeout(() => {
            setReserveDetails(prev => ({ ...prev, custodianName: tempCustodianName, attestationFrequency: tempAttestationFreq, backingType: 'custodian', isConfigured: true }));
            setTempCustodianName(''); // Clear temp state
            setReserveConnectionLoading(false);
            console.log("Custodian Setup: Approved");
        }, 3000);
    };

    // EDIT: Add handler for On-Chain Wallet connection
    const handleConnectOnChainWallet = (event) => {
        event.preventDefault();
        if (reserveConnectionLoading || !tempOnChainNetwork || !tempOnChainWalletAddress) return;
        setReserveConnectionLoading(true);
        setTimeout(() => {
            setReserveDetails(prev => ({ ...prev, onChainNetwork: tempOnChainNetwork, onChainWalletAddress: tempOnChainWalletAddress, backingType: 'onchain_wallet', isConfigured: true }));
            setTempOnChainWalletAddress(''); // Clear temp state
            setReserveConnectionLoading(false);
            console.log("On-Chain Wallet Connection: Approved");
        }, 3000);
    };

  // Effect hook to handle hardcoding RWA values based on selection in Step 1
  useEffect(() => {
      const isHardcodedRWA = tokenDetails.tokenType === 'RWA' && tokenDetails.rwaSubType in hardcodedRwaValues;

      if (isHardcodedRWA) {
          const valueToSet = hardcodedRwaValues[tokenDetails.rwaSubType];
          // Set currency to USD and amount to hardcoded value
          setSupplyDetails(prev => ({
              ...prev,
              marketValueCurrency: 'USD',
              marketValueAmount: valueToSet
          }));
      }
  }, [tokenDetails.tokenType, tokenDetails.rwaSubType]);


  // --- Workflow Effect Hook ---
  useEffect(() => {
    setIsLoading(false); // Reset overall workflow loading indicator

    switch (workflowState) {
      case 'pending_compliance': setWorkflowMessage('Issuance request sent to Compliance for review.'); break;
      case 'pending_management': setWorkflowMessage('Compliance approved. Request sent to Management for final review.'); break;
      case 'approved': setWorkflowMessage('Issuance request fully approved. Ready to execute.'); break;
      case 'rejected': setWorkflowMessage('Issuance request rejected.'); break;
      default: setWorkflowMessage(''); setRejectReason(''); setFinalTokenData(null); break;
    }
  }, [workflowState]);


  // --- Workflow Action Handlers ---
  /**
   * Validates final data and initiates the simulated approval workflow.
   * Stores the compiled data in `finalTokenData` state.
   */
  const handleInitiateIssuanceApproval = () => {
    // Compile final data
    const amountToIssue = parseFloat(supplyDetails.initialSupply || 0);
    // EDIT: Update compiled data structure
    const fullTokenData = {
      tokenDetails: { ...tokenDetails },
      supplyDetails: {
          initialSupply: amountToIssue,
          supplyType: supplyDetails.supplyType,
          decimals: supplyDetails.decimals,
          metadata: supplyDetails.metadata,
          marketValue: {
              amount: parseFloat(supplyDetails.marketValueAmount) || 0,
              currency: supplyDetails.marketValueCurrency || 'USD'
          }
      },
      permissionDetails: { ...permissionDetails },
      reserveDetails: { ...reserveDetails },
      regulatoryInfo: [...regulatoryInfo]
    };

    // Determine if reserves are required based on final compiled data
    const reservesRequired =
        fullTokenData.tokenDetails.tokenType === 'RWA' ||
        fullTokenData.tokenDetails.tokenType === 'CapitalAsset' ||
        (fullTokenData.tokenDetails.tokenType === 'Currency' && fullTokenData.tokenDetails.currencySubType === 'Asset Backed Stablecoin');

    // Final Validation before starting workflow
    // EDIT: Updated validation logic
    if (!(amountToIssue > 0 &&
        fullTokenData.tokenDetails.symbol &&
        fullTokenData.tokenDetails.name &&
        fullTokenData.tokenDetails.blockchain &&
        fullTokenData.tokenDetails.tokenType &&
        (fullTokenData.tokenDetails.tokenType !== 'RWA' || fullTokenData.tokenDetails.rwaSubType) &&
        (fullTokenData.tokenDetails.tokenType !== 'CapitalAsset' || fullTokenData.tokenDetails.capitalAssetSubType) &&
        (fullTokenData.tokenDetails.tokenType !== 'Currency' || fullTokenData.tokenDetails.currencySubType) && // Check currency sub type
        (!reservesRequired || fullTokenData.reserveDetails.isConfigured) && // Check reserves configured IF required
        (!fullTokenData.permissionDetails.kycEnabled || fullTokenData.permissionDetails.kycLevel) && // Check KYC level if KYC enabled
        (!fullTokenData.permissionDetails.isExpirationEnabled || fullTokenData.permissionDetails.expiration) // Check expiration date if enabled
        ))
    {
      // Construct a more specific error message
      let errorMsg = "Please ensure all required fields are valid:\n";
      if (!fullTokenData.tokenDetails.name) errorMsg += "- Token Name\n";
      if (!fullTokenData.tokenDetails.symbol) errorMsg += "- Token Symbol\n";
      if (!fullTokenData.tokenDetails.blockchain) errorMsg += "- Blockchain\n";
      if (!fullTokenData.tokenDetails.tokenType) errorMsg += "- Token Type\n";
      if (fullTokenData.tokenDetails.tokenType === 'RWA' && !fullTokenData.tokenDetails.rwaSubType) errorMsg += "- RWA Type\n";
      if (fullTokenData.tokenDetails.tokenType === 'CapitalAsset' && !fullTokenData.tokenDetails.capitalAssetSubType) errorMsg += "- Capital Asset Type\n";
      if (fullTokenData.tokenDetails.tokenType === 'Currency' && !fullTokenData.tokenDetails.currencySubType) errorMsg += "- Currency Type\n";
      if (!amountToIssue || amountToIssue <= 0) errorMsg += "- Initial Supply (must be > 0)\n";
      if (reservesRequired && !fullTokenData.reserveDetails.isConfigured) errorMsg += "- Reserve Details configuration (required for this token type)\n";
      if (fullTokenData.permissionDetails.kycEnabled && !fullTokenData.permissionDetails.kycLevel) errorMsg += "- KYC Required (required when KYC is enabled)\n";
      if (fullTokenData.permissionDetails.isExpirationEnabled && !fullTokenData.permissionDetails.expiration) errorMsg += "- Expiration Date (required when expiration is enabled)\n";

      alert(errorMsg);
      return;
    }

    console.log("Initiating issuance approval with data:", fullTokenData);
    setFinalTokenData(fullTokenData); // Store data for later use
    setWorkflowState('pending_compliance'); // Start workflow
  };

  /** Simulates an approval step (Compliance or Management). */
  const handleApproval = (step) => { /* ... unchanged ... */
    if (isLoading) return;
    setIsLoading(true);
    setWorkflowMessage(`Processing ${step} approval...`);

    setTimeout(() => {
      if (step === 'compliance') {
        setWorkflowState('pending_management');
      } else if (step === 'management') {
        setWorkflowState('approved');
      }
       setIsLoading(false); // Ensure loading is reset
    }, 1500);
   };

  /** Simulates a rejection step, prompting for a reason. */
  const handleReject = (rejectedBy) => { /* ... unchanged ... */
    if (isLoading) return;
    const reason = prompt(`Enter reason for rejection by ${rejectedBy} (optional):`);
    setIsLoading(true);
    setWorkflowMessage(`Processing rejection...`);

    setTimeout(() => {
      setRejectReason(reason || 'No reason provided.');
      setWorkflowState('rejected');
      setIsLoading(false); // Ensure loading is reset
    }, 1000);
   };

  /** Handles the final execution of the issuance after workflow approval and user confirmation. */
  const handleExecuteIssue = () => { /* ... unchanged ... */
    if (isLoading || workflowState !== 'approved' || !finalTokenData) return;

    const confirmMsg = `You are about to issue ${finalTokenData.supplyDetails.initialSupply.toLocaleString()} ${finalTokenData.tokenDetails.symbol} tokens.\n\nThis action will finalize the token creation based on the approved details.\n\nProceed?`;

    if (window.confirm(confirmMsg)) {
        console.log("Executing onIssue with final data:", finalTokenData);
        onIssue(finalTokenData);
    } else {
        console.log("Final issuance execution cancelled by user.");
    }
   };

  /** Handles cancelling the active workflow request */
  const handleCancelRequest = () => { /* ... unchanged ... */
      if (window.confirm("Are you sure you want to cancel this issuance request?")) {
          setWorkflowState('idle');
      }
  }

  // --- Render Logic ---

  /** Renders the visual progress indicator (steps) */
  const renderProgressSteps = () => {
    // EDIT: Updated steps array and logic
    const steps = ['Token Details', 'Supply & Reserves', 'Permissions', 'Finalization']; // Removed Proof of Reserves
    const stepMap = { // Map screen state to step index
        'token-details': 0,
        'supply-reserves-metadata': 1, // New combined step
        'permissions': 2,
        'finalization': 3
    };
    const currentStepIndex = stepMap[issuanceScreen] ?? -1;

    if (workflowState !== 'idle' && issuanceScreen !== 'finalization') return null;
    const activeIndex = (workflowState !== 'idle' && issuanceScreen === 'finalization') ? steps.length -1 : currentStepIndex;

    return (
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <React.Fragment key={step}>
              <div className="w-1/4 text-center px-1"> {/* Adjusted width for 4 steps */}
                <div className={`rounded-full h-10 w-10 flex items-center justify-center mx-auto ${
                  index < activeIndex ? 'bg-green-600 text-white' : (index === activeIndex ? 'bg-emtech-gold text-white' : 'bg-gray-200 text-gray-600')
                }`}>
                  {index < activeIndex ? '✓' : index + 1}
                </div>
                <p className={`mt-1 text-xs sm:text-sm ${index <= activeIndex ? 'font-medium text-gray-800' : 'text-gray-500'}`}>{step}</p> {/* Adjusted font size */}
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-1 ${index < activeIndex ? 'bg-green-600' : 'bg-gray-200'}`}></div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  // Determine if RWA fields should be hardcoded/disabled for Step 2 rendering
  const isHardcodedRWA = tokenDetails.tokenType === 'RWA' && tokenDetails.rwaSubType in hardcodedRwaValues;
  // EDIT: Determine if reserve config is required
  const reservesRequired =
      tokenDetails.tokenType === 'RWA' ||
      tokenDetails.tokenType === 'CapitalAsset' ||
      (tokenDetails.tokenType === 'Currency' && tokenDetails.currencySubType === 'Asset Backed Stablecoin');
  // EDIT: Determine if reserves section should be shown
   const showReservesSection =
      tokenDetails.tokenType === 'RWA' ||
      tokenDetails.tokenType === 'CapitalAsset' ||
      tokenDetails.tokenType === 'Currency'; // Show for all currency types to allow selection of 'No' if applicable


  return (
    <div className="p-8">
      <div className="bg-white p-6 rounded shadow max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Issue New Tokens</h1>
          <button
            className="px-3 py-1 rounded text-white hover:opacity-90 bg-gray-800 text-sm disabled:opacity-50"
            onClick={workflowState === 'idle' ? onBack : handleCancelRequest}
            disabled={isLoading && workflowState !== 'idle'}
          >
            {workflowState === 'idle' ? 'Back to Dashboard' : 'Cancel Issuance Request'}
          </button>
        </div>

        {renderProgressSteps()}

        {/* --- Wizard Step Content (Render conditionally based on issuanceScreen IF workflow is idle) --- */}

        {/* Step 1: Token Details */}
        {issuanceScreen === 'token-details' && workflowState === 'idle' && (
           <div>
             {/* ... unchanged name, symbol, blockchain ... */}
             <h2 className="text-xl font-medium mb-4 text-gray-800">Token Details</h2>
             <p className="text-gray-600 mb-6">Define the basic information for your new token.</p>
             <div className="space-y-4">
               <div> <label className="block mb-1 font-medium">Token Name <span className="text-red-600">*</span></label> <input type="text" className="w-full p-2 border rounded" placeholder="e.g. My Stablecoin" value={tokenDetails.name} onChange={(e) => setTokenDetails({...tokenDetails, name: e.target.value})} /> <p className="text-xs text-gray-500 mt-1">Full name of your token (e.g. "US Dollar Coin")</p> </div>
               <div> <label className="block mb-1 font-medium">Token Symbol <span className="text-red-600">*</span></label> <input type="text" className="w-full p-2 border rounded" placeholder="e.g. USDC" value={tokenDetails.symbol} onChange={(e) => setTokenDetails({...tokenDetails, symbol: e.target.value})} /> <p className="text-xs text-gray-500 mt-1">Short symbol for your token (e.g. "USDC")</p> </div>
               <div> <label className="block mb-1 font-medium">Select Blockchain <span className="text-red-600">*</span></label> <select className="w-full p-2 border rounded" value={tokenDetails.blockchain} onChange={(e) => setTokenDetails({...tokenDetails, blockchain: e.target.value})} > <option value="">Select Blockchain</option> <option value="Ethereum">Ethereum</option> <option value="Hedera">Hedera</option> <option value="Solana">Solana</option> <option value="Polygon">Polygon</option> <option value="Stellar">Stellar</option> </select> <p className="text-xs text-gray-500 mt-1">The blockchain network where this token will be issued.</p> </div>

               {/* Token Type */}
               <div>
                 <label className="block mb-1 font-medium">Token Type <span className="text-red-600">*</span></label>
                 <select
                   className="w-full p-2 border rounded"
                   value={tokenDetails.tokenType}
                   onChange={(e) => {
                       const newType = e.target.value;
                       setTokenDetails({
                           ...tokenDetails,
                           tokenType: newType,
                           // Reset sub-types when main type changes
                           rwaSubType: newType !== 'RWA' ? '' : tokenDetails.rwaSubType,
                           capitalAssetSubType: newType !== 'CapitalAsset' ? '' : tokenDetails.capitalAssetSubType,
                           currencySubType: newType !== 'Currency' ? '' : tokenDetails.currencySubType // EDIT: Reset currency sub-type
                       });
                   }}
                 >
                   <option value="">Select Token Type</option>
                   <option value="Currency">Currency Token</option>
                   <option value="RWA">Real World Asset Token</option>
                   <option value="CapitalAsset">Capital Asset Token</option>
                 </select>
                 <p className="text-xs text-gray-500 mt-1">Classify the type of token being issued.</p>
               </div>

               {/* Conditional RWA Sub-Type Dropdown */}
               {tokenDetails.tokenType === 'RWA' && (
                   <div>
                     <label className="block mb-1 font-medium">RWA Type <span className="text-red-600">*</span></label>
                     <select className="w-full p-2 border rounded" value={tokenDetails.rwaSubType} onChange={(e) => setTokenDetails({...tokenDetails, rwaSubType: e.target.value})} required={tokenDetails.tokenType === 'RWA'} >
                       <option value="">Select RWA Type</option>
                       {rwaSubTypes.map(type => <option key={type} value={type}>{type}</option>)}
                     </select> <p className="text-xs text-gray-500 mt-1">Specify the type of Real World Asset being tokenized.</p>
                   </div>
               )}

               {/* Conditional Capital Asset Sub-Type Dropdown */}
               {tokenDetails.tokenType === 'CapitalAsset' && (
                   <div>
                     <label className="block mb-1 font-medium">Capital Asset Type <span className="text-red-600">*</span></label>
                     <select className="w-full p-2 border rounded" value={tokenDetails.capitalAssetSubType} onChange={(e) => setTokenDetails({...tokenDetails, capitalAssetSubType: e.target.value})} required={tokenDetails.tokenType === 'CapitalAsset'} >
                       <option value="">Select Capital Asset Type</option>
                       {capitalAssetSubTypes.map(type => <option key={type} value={type}>{type}</option>)}
                     </select> <p className="text-xs text-gray-500 mt-1">Specify the type of Capital Asset being tokenized.</p>
                   </div>
               )}

               {/* EDIT: Conditional Currency Sub-Type Dropdown */}
               {tokenDetails.tokenType === 'Currency' && (
                   <div>
                     <label className="block mb-1 font-medium">Currency Type <span className="text-red-600">*</span></label>
                     <select
                       className="w-full p-2 border rounded"
                       value={tokenDetails.currencySubType}
                       onChange={(e) => setTokenDetails({...tokenDetails, currencySubType: e.target.value})}
                       required={tokenDetails.tokenType === 'Currency'}
                     >
                       <option value="">Select Currency Type</option>
                       {currencySubTypes.map(type => <option key={type} value={type}>{type}</option>)}
                     </select>
                     <p className="text-xs text-gray-500 mt-1">Specify the type of Currency Token.</p>
                   </div>
               )}

               {/* Regulatory Info (Unchanged) */}
                <div className="border rounded-lg p-4 bg-gray-50 mt-6">
                   {/* ... unchanged regulatory info form ... */}
                   <label className="block mb-2"><span className="font-medium">Regulatory Information</span><p className="text-sm text-gray-600">Specify jurisdictions and regulatory bodies</p></label>
                   <form onSubmit={handleAddRegulatoryInfo} className="flex space-x-2 items-center">
                     <select className="flex-1 p-2 border rounded" value={selectedCountry} onChange={(e) => setSelectedCountry(e.target.value)} > <option value="">Select Country/Jurisdiction</option> {sampleCountries.map(country => ( <option key={country.code} value={country.name}>{country.name}</option> ))} </select>
                     <input type="text" className="flex-1 p-2 border rounded" placeholder="Regulatory Body Name (e.g., SEC)" value={regulatorName} onChange={(e) => setRegulatorName(e.target.value)} />
                     <button className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50" disabled={!selectedCountry || !regulatorName.trim()} type="submit" > Add </button>
                   </form>
                   <div className="mt-4 p-3 border rounded bg-white min-h-[50px]">
                     {regulatoryInfo.length === 0 ? ( <p className="text-sm text-gray-500 italic">No regulatory information added yet.</p> ) : ( <ul className="space-y-1">{regulatoryInfo.map((info, index) => ( <li key={index} className="text-sm border-b last:border-b-0 py-1"><strong>{info.country}:</strong> {info.regulator}</li> ))}</ul> )}
                   </div>
                 </div>
               {/* Navigation Buttons */}
               <div className="flex justify-end mt-8">
                 <button
                   className="px-4 py-2 rounded text-white hover:opacity-90 bg-emtech-gold disabled:opacity-50"
                   onClick={() => setIssuanceScreen('supply-reserves-metadata')} // EDIT: Go to new Step 2 name
                   // EDIT: Update validation for sub-types
                   disabled={
                       !tokenDetails.name || !tokenDetails.symbol || !tokenDetails.blockchain || !tokenDetails.tokenType ||
                       (tokenDetails.tokenType === 'RWA' && !tokenDetails.rwaSubType) ||
                       (tokenDetails.tokenType === 'CapitalAsset' && !tokenDetails.capitalAssetSubType) ||
                       (tokenDetails.tokenType === 'Currency' && !tokenDetails.currencySubType) // Check currency sub type
                   }
                 > Next Step </button>
               </div>
             </div>
           </div>
        )}

        {/* EDIT: Step 2: Supply, Reserves, & Metadata (Combined Step 2 and 4) */}
        {issuanceScreen === 'supply-reserves-metadata' && workflowState === 'idle' && (
           <div>
             <h2 className="text-xl font-medium mb-4 text-gray-800">Supply, Reserves, & Metadata</h2> {/* EDIT: Renamed title */}
             <p className="text-gray-600 mb-6">Configure token supply, reserve backing (if applicable), and metadata.</p>
             <div className="space-y-6"> {/* Increased spacing */}
               {/* --- Supply Section --- */}
               <div> <label className="block mb-1 font-medium">Initial Supply <span className="text-red-600">*</span></label> <input type="number" min="0" className="w-full p-2 border rounded" placeholder="e.g. 1000000" value={supplyDetails.initialSupply} onChange={(e) => setSupplyDetails({...supplyDetails, initialSupply: e.target.value})} /> <p className="text-xs text-gray-500 mt-1">Number of tokens to be created initially</p> </div>
               <div> <label className="block mb-1 font-medium">Supply Type <span className="text-red-600">*</span></label> <div className="grid grid-cols-2 gap-4 mt-2"> <div className={`border rounded p-3 cursor-pointer ${supplyDetails.supplyType === 'finite' ? 'border-emtech-gold bg-yellow-50' : 'border-gray-300'}`} onClick={() => setSupplyDetails({...supplyDetails, supplyType: 'finite'})} > <div className="flex items-center"> <input type="radio" name="supplyType" className="mr-2 focus:ring-emtech-gold h-4 w-4 text-emtech-gold" checked={supplyDetails.supplyType === 'finite'} readOnly /> <div> <p className="font-medium">Finite Supply</p> <p className="text-xs text-gray-500">Fixed maximum token supply</p> </div> </div> </div> <div className={`border rounded p-3 cursor-pointer ${supplyDetails.supplyType === 'infinite' ? 'border-emtech-gold bg-yellow-50' : 'border-gray-300'}`} onClick={() => setSupplyDetails({...supplyDetails, supplyType: 'infinite'})} > <div className="flex items-center"> <input type="radio" name="supplyType" className="mr-2 focus:ring-emtech-gold h-4 w-4 text-emtech-gold" checked={supplyDetails.supplyType === 'infinite'} readOnly /> <div> <p className="font-medium">Infinite Supply</p> <p className="text-xs text-gray-500">No maximum supply limit</p> </div> </div> </div> </div> </div>
               <div> <label className="block mb-1 font-medium">Decimal Points <span className="text-red-600">*</span></label> <select className="w-full p-2 border rounded" value={supplyDetails.decimals} onChange={(e) => setSupplyDetails({...supplyDetails, decimals: e.target.value})} > <option value="18">18 (e.g. Ethereum standard)</option> <option value="8">8 (e.g. Bitcoin standard)</option> <option value="6">6 (e.g. USDC standard)</option> <option value="2">2 (e.g. 100.50)</option> <option value="0">0 (No decimal places, whole tokens only)</option> </select> <p className="text-xs text-gray-500 mt-1">How divisible the token will be (smaller units)</p> </div>
                <div>
                    <label className="block mb-1 font-medium">Pricing Currency</label>
                    <select className={`w-full p-2 border rounded ${isHardcodedRWA ? 'bg-gray-100' : 'bg-white'}`} value={supplyDetails.marketValueCurrency} onChange={(e) => setSupplyDetails({...supplyDetails, marketValueCurrency: e.target.value})} disabled={isHardcodedRWA} >
                        {pricingCurrencies.map(currency => (<option key={currency} value={currency}>{currency}</option>))}
                    </select> <p className="text-xs text-gray-500 mt-1">Select the currency for the market value definition.</p>
                </div>
                <div>
                    <label className="block mb-1 font-medium">Market Value Amount</label>
                    <input type="number" step="any" min="0" className={`w-full p-2 border rounded ${isHardcodedRWA ? 'bg-gray-100' : ''}`} placeholder={`Enter value in ${supplyDetails.marketValueCurrency || 'selected currency'}`} value={supplyDetails.marketValueAmount} onChange={(e) => setSupplyDetails({...supplyDetails, marketValueAmount: e.target.value})} disabled={isHardcodedRWA} />
                    <p className="text-xs text-gray-500 mt-1">Define what 1 unit of this token initially represents in the selected currency.</p>
                </div>

                {/* --- Proof of Reserves Section (Moved from Step 4) --- */}
                {showReservesSection && (
                    <div className="pt-6 border-t"> {/* Added separator */}
                        <h3 className="text-lg font-medium mb-4 text-gray-700">Proof of Reserves Configuration</h3>
                        {/* Backed Choice */}
                        <div className="border rounded-lg p-4 bg-gray-50">
                            <p className="font-medium mb-3">Is this token backed by real-world assets? {reservesRequired ? <span className="text-red-600">* Required</span> : ''}</p>
                            <div className="grid grid-cols-2 gap-4">
                                <div className={`border rounded p-3 cursor-pointer ${reserveDetails.isBackedAsset ? 'border-emtech-gold bg-yellow-50' : 'border-gray-300'}`} onClick={() => setReserveDetails({...reserveDetails, isBackedAsset: true, isConfigured: false})} >
                                    <div className="flex items-center"> <input type="radio" name="isBacked" className="mr-2 focus:ring-emtech-gold h-4 w-4 text-emtech-gold" checked={reserveDetails.isBackedAsset} readOnly /> <div><p className="font-medium">Yes</p><p className="text-xs text-gray-500">Token is backed by verifiable reserves</p></div> </div>
                                </div>
                                <div className={`border rounded p-3 cursor-pointer ${!reserveDetails.isBackedAsset ? 'border-emtech-gold bg-yellow-50' : 'border-gray-300'} ${reservesRequired ? 'opacity-50 cursor-not-allowed' : ''}`} // Disable 'No' if required
                                    onClick={() => { if (!reservesRequired) setReserveDetails({ isBackedAsset: false, backingType: '', bankName: '', accountNumberLast4: '', contractNetwork: '', contractAddress: '', custodianName: '', attestationFrequency: '', onChainNetwork: '', onChainWalletAddress: '', isConfigured: true }); }} >
                                    <div className="flex items-center"> <input type="radio" name="isBacked" className="mr-2 focus:ring-emtech-gold h-4 w-4 text-emtech-gold" checked={!reserveDetails.isBackedAsset} readOnly disabled={reservesRequired}/> <div><p className="font-medium">No</p><p className="text-xs text-gray-500">Token is not backed by reserves</p></div> </div>
                                </div>
                            </div>
                            {reservesRequired && !reserveDetails.isBackedAsset && <p className="text-xs text-red-600 mt-1">Asset backing is required for this token type.</p>}
                        </div>
                        {/* Conditional Backing Method */}
                        {reserveDetails.isBackedAsset && (
                            <div className="mt-4 border rounded-lg p-4 bg-gray-50">
                                <p className="font-medium mb-3">Select Reserve Backing Method <span className="text-red-600">*</span></p>
                                {reserveDetails.isConfigured && (
                                    <div className='mb-4 p-3 bg-green-100 border border-green-300 text-green-800 rounded text-sm'>
                                        <p className='font-medium'>Reserve Method Configured:</p>
                                        {reserveDetails.backingType === 'bank' && <p>Bank Account ({reserveDetails.bankName} ending in {reserveDetails.accountNumberLast4})</p>}
                                        {reserveDetails.backingType === 'smartcontract' && <p>Smart Contract ({reserveDetails.contractNetwork}: {reserveDetails.contractAddress.substring(0,6)}...)</p>}
                                        {reserveDetails.backingType === 'custodian' && <p>Custodian ({reserveDetails.custodianName} - {reserveDetails.attestationFrequency} Attestation)</p>}
                                        {/* EDIT: Display configured On-Chain Wallet */}
                                        {reserveDetails.backingType === 'onchain_wallet' && <p>On-Chain Wallet ({reserveDetails.onChainNetwork}: {reserveDetails.onChainWalletAddress.substring(0,6)}...)</p>}
                                        <button onClick={() => setReserveDetails(prev => ({ ...prev, isConfigured: false }))} className="text-xs text-blue-600 hover:underline mt-1" disabled={reserveConnectionLoading}> Edit Configuration </button>
                                    </div>
                                )}

                                {/* Loading Indicator for Reserve Connection */}
                                {reserveConnectionLoading && (
                                    <div className="my-4 p-3 bg-blue-100 border border-blue-300 text-blue-800 rounded text-sm flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"> <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle> <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path> </svg>
                                        Validating connection...
                                    </div>
                                )}

                                {/* Reserve Method Choices (Disabled if configured or loading) */}
                                <div className={`space-y-3 ${(reserveDetails.isConfigured || reserveConnectionLoading) ? 'opacity-50 pointer-events-none' : ''}`}>
                                    {/* Bank (Unchanged form, just uses loading state) */}
                                    <div className={`border rounded p-3 cursor-pointer ${reserveDetails.backingType === 'bank' ? 'border-emtech-gold bg-yellow-50' : 'border-gray-300 bg-white'}`} onClick={() => !reserveDetails.isConfigured && setReserveDetails({...reserveDetails, backingType: 'bank'})} >
                                        <div className="flex"> <input type="radio" name="backingType" className="mr-2 mt-1 focus:ring-emtech-gold h-4 w-4 text-emtech-gold" checked={reserveDetails.backingType === 'bank'} readOnly />
                                        <div> <p className="font-medium">Bank Account Connection</p> <p className="text-sm text-gray-600">Link a traditional bank account to verify reserves</p>
                                            {reserveDetails.backingType === 'bank' && !reserveDetails.isConfigured && ( <form onSubmit={handleConnectBank} className="mt-3 p-3 border rounded bg-white"> <div className="space-y-3"> <div><label className="block text-sm font-medium mb-1">Bank Name</label><input type="text" value={tempBankName} onChange={(e) => setTempBankName(e.target.value)} className="w-full p-2 border rounded text-sm" placeholder="e.g. JP Morgan Chase" required /></div> <div><label className="block text-sm font-medium mb-1">Account Number</label><input type="text" value={tempAccountNumber} onChange={(e) => setTempAccountNumber(e.target.value)} className="w-full p-2 border rounded text-sm" placeholder="Enter full account number" required /></div> <button type="submit" className="mt-2 px-4 py-2 rounded text-white hover:opacity-90 bg-emtech-gold disabled:opacity-50" disabled={!tempBankName || !tempAccountNumber}>Connect Bank Account</button> </div> </form> )}
                                        </div> </div>
                                    </div>
                                    {/* Contract (Unchanged form, just uses loading state) */}
                                    <div className={`border rounded p-3 cursor-pointer ${reserveDetails.backingType === 'smartcontract' ? 'border-emtech-gold bg-yellow-50' : 'border-gray-300 bg-white'}`} onClick={() => !reserveDetails.isConfigured && setReserveDetails({...reserveDetails, backingType: 'smartcontract'})} >
                                        <div className="flex"> <input type="radio" name="backingType" className="mr-2 mt-1 focus:ring-emtech-gold h-4 w-4 text-emtech-gold" checked={reserveDetails.backingType === 'smartcontract'} readOnly />
                                        <div> <p className="font-medium">On-Chain Asset with Smart Contract</p> <p className="text-sm text-gray-600">Link to on-chain assets via smart contract for automated verification</p>
                                            {reserveDetails.backingType === 'smartcontract' && !reserveDetails.isConfigured && ( <form onSubmit={handleConnectContract} className="mt-3 p-3 border rounded bg-white"> <div className="space-y-3"> <div><label className="block text-sm font-medium mb-1">Blockchain Network</label><select value={tempContractNetwork} onChange={(e)=> setTempContractNetwork(e.target.value)} className="w-full p-2 border rounded text-sm"><option>Ethereum</option><option>Polygon</option><option>BNB Chain</option><option>Solana</option><option>Avalanche</option></select></div> <div><label className="block text-sm font-medium mb-1">Smart Contract Address</label><input type="text" value={tempContractAddress} onChange={(e)=> setTempContractAddress(e.target.value)} className="w-full p-2 border rounded text-sm" placeholder="0x..." required /></div> <button type="submit" className="mt-2 px-4 py-2 rounded text-white hover:opacity-90 bg-emtech-gold disabled:opacity-50" disabled={!tempContractNetwork || !tempContractAddress}>Connect Smart Contract</button> </div> </form> )}
                                        </div> </div>
                                    </div>
                                    {/* Custodian (Unchanged form, just uses loading state) */}
                                    <div className={`border rounded p-3 cursor-pointer ${reserveDetails.backingType === 'custodian' ? 'border-emtech-gold bg-yellow-50' : 'border-gray-300 bg-white'}`} onClick={() => !reserveDetails.isConfigured && setReserveDetails({...reserveDetails, backingType: 'custodian'})} >
                                        <div className="flex"> <input type="radio" name="backingType" className="mr-2 mt-1 focus:ring-emtech-gold h-4 w-4 text-emtech-gold" checked={reserveDetails.backingType === 'custodian'} readOnly />
                                        <div> <p className="font-medium">Third-Party Custodian Verification</p> <p className="text-sm text-gray-600">Use a trusted third-party custodian to verify and attest to reserves</p>
                                            {reserveDetails.backingType === 'custodian' && !reserveDetails.isConfigured && ( <form onSubmit={handleSetupCustodian} className="mt-3 p-3 border rounded bg-white"> <div className="space-y-3"> <div><label className="block text-sm font-medium mb-1">Custodian Name</label><input type="text" value={tempCustodianName} onChange={(e)=> setTempCustodianName(e.target.value)} className="w-full p-2 border rounded text-sm" placeholder="e.g. BitGo, Fireblocks, etc." required/></div> <div><label className="block text-sm font-medium mb-1">Attestation Frequency</label><select value={tempAttestationFreq} onChange={(e)=> setTempAttestationFreq(e.target.value)} className="w-full p-2 border rounded text-sm"><option>Daily</option><option>Weekly</option><option>Monthly</option><option>Quarterly</option></select></div> <button type="submit" className="mt-2 px-4 py-2 rounded text-white hover:opacity-90 bg-emtech-gold disabled:opacity-50" disabled={!tempCustodianName || !tempAttestationFreq}>Setup Custodian Verification</button> </div> </form> )}
                                        </div> </div>
                                    </div>
                                    {/* EDIT: Add On-Chain Wallet Option */}
                                    <div className={`border rounded p-3 cursor-pointer ${reserveDetails.backingType === 'onchain_wallet' ? 'border-emtech-gold bg-yellow-50' : 'border-gray-300 bg-white'}`} onClick={() => !reserveDetails.isConfigured && setReserveDetails({...reserveDetails, backingType: 'onchain_wallet'})} >
                                        <div className="flex"> <input type="radio" name="backingType" className="mr-2 mt-1 focus:ring-emtech-gold h-4 w-4 text-emtech-gold" checked={reserveDetails.backingType === 'onchain_wallet'} readOnly />
                                        <div> <p className="font-medium">Direct On-Chain Wallet Connection</p> <p className="text-sm text-gray-600">Link directly to an on-chain wallet holding reserve assets</p>
                                            {reserveDetails.backingType === 'onchain_wallet' && !reserveDetails.isConfigured && (
                                                <form onSubmit={handleConnectOnChainWallet} className="mt-3 p-3 border rounded bg-white">
                                                    <div className="space-y-3">
                                                        <div>
                                                            <label className="block text-sm font-medium mb-1">Blockchain Network</label>
                                                            <select value={tempOnChainNetwork} onChange={(e)=> setTempOnChainNetwork(e.target.value)} className="w-full p-2 border rounded text-sm" required>
                                                                <option value="Ethereum">Ethereum</option>
                                                                <option value="Polygon">Polygon</option>
                                                                <option value="Hedera">Hedera</option>
                                                                <option value="Solana">Solana</option>
                                                                <option value="Stellar">Stellar</option>
                                                                {/* Add other relevant networks */}
                                                            </select>
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium mb-1">Wallet Address</label>
                                                            <input type="text" value={tempOnChainWalletAddress} onChange={(e)=> setTempOnChainWalletAddress(e.target.value)} className="w-full p-2 border rounded text-sm" placeholder="Enter wallet address" required />
                                                        </div>
                                                        <button type="submit" className="mt-2 px-4 py-2 rounded text-white hover:opacity-90 bg-emtech-gold disabled:opacity-50" disabled={!tempOnChainNetwork || !tempOnChainWalletAddress}>Connect Wallet</button>
                                                    </div>
                                                </form>
                                              )}
                                        </div> </div>
                                    </div>
                                </div> {/* End reserve method choices div */}
                            </div> // End conditional backing methods div
                        )}
                    </div> // End Proof of Reserves Section div
                 )}

                 {/* --- Metadata Section (Moved down slightly) --- */}
               <div> <label className="block mb-1 font-medium">Metadata Implementation</label> <textarea className="w-full p-2 border rounded" rows="3" placeholder="Enter JSON schema or metadata description (optional)" value={supplyDetails.metadata} onChange={(e) => setSupplyDetails({...supplyDetails, metadata: e.target.value})} ></textarea> <p className="text-xs text-gray-500 mt-1">Additional data fields to store with the token or transactions.</p> </div>

               {/* Navigation Buttons */}
               <div className="flex justify-between mt-8">
                 <button className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-50" onClick={() => setIssuanceScreen('token-details')} > Previous Step </button>
                 <button
                   className="px-4 py-2 rounded text-white hover:opacity-90 bg-emtech-gold disabled:opacity-50"
                   onClick={() => setIssuanceScreen('permissions')} // EDIT: Go to Step 3 (Permissions)
                   // EDIT: Update validation to check reserve config if required
                   disabled={!supplyDetails.initialSupply || !supplyDetails.decimals || (reservesRequired && !reserveDetails.isConfigured) || reserveConnectionLoading}
                 > Next Step </button>
               </div>
             </div>
           </div>
        )}

      {/* EDIT: Step 3: Permissions (Was Step 3) */}
      {issuanceScreen === 'permissions' && workflowState === 'idle' && (
          <div>
            <h2 className="text-xl font-medium mb-4 text-gray-800">Permissions</h2>
            <p className="text-gray-600 mb-6">Configure token permissions and functional features.</p>
            <div className="space-y-6">
              <div className="border rounded-lg p-4 bg-gray-50">
                {/* Use Flexbox to align toggle and text */}
                <div className="flex items-start mb-3"> {/* Changed to items-start for better alignment */}

                  {/* Toggle Switch Button */}
                  <button
                    type="button" // Use button type for accessibility and forms
                    role="switch" // ARIA role for toggle switch
                    aria-checked={permissionDetails.kycEnabled} // ARIA state reflects current value
                    onClick={() => {
                        // Toggle the current value and update state
                        const isEnabled = !permissionDetails.kycEnabled;
                        setPermissionDetails({
                            ...permissionDetails,
                            kycEnabled: isEnabled,
                            // Clear level if disabling, otherwise keep existing or let user select
                            kycLevel: isEnabled ? permissionDetails.kycLevel : ''
                        });
                    }}
                    // Base classes + conditional background color
                    className={`${
                      permissionDetails.kycEnabled ? 'bg-emtech-gold' : 'bg-gray-300' // Active vs Inactive background
                    } relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emtech-gold mr-3`} // Added margin-right for spacing
                  >
                    <span className="sr-only">Enable KYC Permissions</span> {/* Screen reader text */}
                    {/* Inner knob element */}
                    <span
                      aria-hidden="true" // Hide from screen readers as state is on the button
                      // Base classes + conditional translation for knob position
                      className={`${
                        permissionDetails.kycEnabled ? 'translate-x-5' : 'translate-x-0' // Right vs Left position
                      } pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`}
                    />
                  </button>
                  {/* End Toggle Switch Button */}

                  {/* Text Labels */}
                  <div className="flex-1"> {/* Allow text to wrap */}
                    <p className="font-medium inline">KYC Required</p>
                    {/* MOVED TEXT HERE */}
                    <span className="text-xs text-gray-500 ml-2">(This can be changed later within admin panel)</span>
                    <p className="text-sm text-gray-600 mt-1"> {/* Added mt-1 for spacing */}
                        Require accounts to be KYC verified before holding or transferring tokens.<br />
                        If true every account associated with this token must have selected KYC levels.
                    </p>
                  </div>
                  {/* End Text Labels */}

                </div> {/* End Flex container */}

                {/* Conditional KYC Level Dropdown */}
                {permissionDetails.kycEnabled && (
                  <div className="ml-6"> {/* Indent dropdown */}
                    <label className="block text-sm font-medium mb-1 text-gray-700">Minimum KYC Level <span className="text-red-600">*</span></label>
                    <select
                      className="w-full p-2 border rounded bg-white"
                      value={permissionDetails.kycLevel}
                      onChange={(e) => setPermissionDetails({...permissionDetails, kycLevel: e.target.value})}
                      required={permissionDetails.kycEnabled} // Required only if KYC is enabled
                    >
                      <option value="" disabled>-- Select Minimum Level --</option>
                      {kycLevels.map(level => <option key={level} value={level}>{level}</option>)}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Minimum level of KYC required to interact with this token.</p>
                    {/* REMOVED TEXT FROM HERE */}
                  </div>
                )}
              </div>

              {/* Fees (Unchanged) */}
              <div className="border rounded-lg p-4 bg-gray-50"> <label className="flex items-center mb-3 cursor-pointer"> <input type="checkbox" className="mr-2 h-4 w-4 text-emtech-gold focus:ring-emtech-gold" checked={permissionDetails.feeScheduleEnabled} onChange={(e) => setPermissionDetails({...permissionDetails, feeScheduleEnabled: e.target.checked})} /> <div><p className="font-medium">Fee Schedule</p><p className="text-sm text-gray-600">Apply transaction fees when tokens are transferred</p></div> </label> {permissionDetails.feeScheduleEnabled && ( <div className="ml-6 mt-2 p-3 border rounded bg-white"> <div className="space-y-3"><div><label className="block text-sm font-medium mb-1">Fee Recipient</label><input type="text" className="w-full p-2 border rounded text-sm" placeholder="Enter wallet address" /></div> <div><label className="block text-sm font-medium mb-1">Transaction Fee (%)</label><input type="text" className="w-full p-2 border rounded text-sm" placeholder="e.g. 0.1%" /></div> <div><label className="block text-sm font-medium mb-1">Fee Cap</label><input type="text" className="w-full p-2 border rounded text-sm" placeholder="Maximum fee amount" /></div></div> </div> )} </div>
              {/* Pausable & Fungibility (Unchanged) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> <div className="border rounded-lg p-4 bg-gray-50"> <label className="flex items-center mb-2 cursor-pointer"> <input type="checkbox" className="mr-2 h-4 w-4 text-emtech-gold focus:ring-emtech-gold" checked={permissionDetails.pausable} onChange={(e) => setPermissionDetails({...permissionDetails, pausable: e.target.checked})} /> <div><p className="font-medium">Pausable Transactions</p><p className="text-sm text-gray-600">Ability to temporarily pause token transfers</p></div> </label> </div> <div className="border rounded-lg p-4 bg-gray-50"> <p className="font-medium mb-2">Token Fungibility</p> <div className="space-x-4"><label className="inline-flex items-center"><input type="radio" name="fungibility" className="mr-1 text-emtech-gold focus:ring-emtech-gold" checked={permissionDetails.fungible} onChange={() => setPermissionDetails({...permissionDetails, fungible: true})} /><span className="text-sm">Fungible</span></label> <label className="inline-flex items-center"><input type="radio" name="fungibility" className="mr-1 text-emtech-gold focus:ring-emtech-gold" checked={!permissionDetails.fungible} onChange={() => setPermissionDetails({...permissionDetails, fungible: false})} /><span className="text-sm">Non-Fungible (NFT)</span></label></div> </div> </div>

              {/* EDIT: Updated Expiration Section */}
              <div className="border rounded-lg p-4 bg-gray-50">
                  <label className="flex items-center cursor-pointer mb-2">
                      <input
                          type="checkbox"
                          className="mr-2 h-4 w-4 text-emtech-gold focus:ring-emtech-gold"
                          checked={permissionDetails.isExpirationEnabled}
                          onChange={(e) => {
                              const isEnabled = e.target.checked;
                              setPermissionDetails({
                                  ...permissionDetails,
                                  isExpirationEnabled: isEnabled,
                                  // Clear date if disabling
                                  expiration: isEnabled ? permissionDetails.expiration : ''
                              });
                          }}
                      />
                      <span className="font-medium">Enable Token Expiration</span>
                    </label>
                    <p className="text-sm text-gray-600 mb-2 ml-6">Set a date when the token becomes invalid or unusable (optional).</p>
                    <input
                      type="date"
                      className={`w-full p-2 border rounded ${!permissionDetails.isExpirationEnabled ? 'bg-gray-100' : ''}`}
                      min={new Date().toISOString().split('T')[0]}
                      value={permissionDetails.expiration}
                      onChange={(e) => setPermissionDetails({...permissionDetails, expiration: e.target.value})}
                      disabled={!permissionDetails.isExpirationEnabled} // Disable if not enabled
                      required={permissionDetails.isExpirationEnabled} // Make required if enabled
                  />
                </div>

              {/* Role Assignments (Unchanged) */}
              <div className="border rounded-lg p-4 bg-gray-50"> <label className="block mb-2"><span className="font-medium">Role Assignments</span><p className="text-sm text-gray-600">Assign administrative roles for this token</p></label> <form onSubmit={handleAddRole} className="flex space-x-2 items-center"> <select className="flex-1 p-2 border rounded" value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)} > <option value="">Select Role</option> <option value="Admin">Admin</option> <option value="Minter">Minter</option> <option value="Burner">Burner</option> <option value="Pauser">Pauser</option> <option value="KYC Administrator">KYC Administrator</option> </select> <input type="text" className="flex-1 p-2 border rounded" placeholder="Account address (e.g., 0x...)" value={roleAddress} onChange={(e) => setRoleAddress(e.target.value)} /> <button className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50" disabled={!selectedRole || !roleAddress} type="submit" > Add </button> </form> <div className="mt-4 p-3 border rounded bg-white min-h-[50px]"> {permissionDetails.roles.length === 0 ? (<p className="text-sm text-gray-500 italic">No roles assigned yet. Add a role above.</p>) : (<ul className="space-y-1 list-disc list-inside">{permissionDetails.roles.map((roleItem, index) => (<li key={index} className="text-sm"><strong>{roleItem.role}:</strong> {roleItem.address}</li>))}</ul>)} </div> </div>
            </div>
            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
                <button className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-50" onClick={() => setIssuanceScreen('supply-reserves-metadata')} > Previous Step </button> {/* EDIT: Go back to new Step 2 */}
                <button
                    className="px-4 py-2 rounded text-white hover:opacity-90 bg-emtech-gold disabled:opacity-50"
                    onClick={() => setIssuanceScreen('finalization')} // EDIT: Go to Step 4 (Finalization)
                    // EDIT: Add validation for KYC Level and Expiration Date if enabled
                    disabled={
                        (permissionDetails.kycEnabled && !permissionDetails.kycLevel) || // Must select a level if KYC is enabled
                        (permissionDetails.isExpirationEnabled && !permissionDetails.expiration)
                    }
                > Next Step </button>
            </div>
          </div>
      )}

        {/* Step 4: Finalization & Workflow (Was Step 5) */}
        {issuanceScreen === 'finalization' && (
           <div>
             <h2 className="text-xl font-medium mb-4 text-gray-800">Finalization</h2>
             {/* Show Summary only if workflow is idle */}
             {workflowState === 'idle' && (
                 <>
                     <p className="text-gray-600 mb-6">Review details below and click 'Request Issuance Approval' to proceed.</p>
                     {/* Review Summary */}
                     <div className='p-4 border rounded bg-gray-50 mb-6 space-y-2 text-sm'>
                         {/* EDIT: Update summary display */}
                         <p><strong>Name:</strong> {tokenDetails.name || 'N/A'}</p>
                         <p><strong>Symbol:</strong> {tokenDetails.symbol || 'N/A'}</p>
                         <p><strong>Blockchain:</strong> {tokenDetails.blockchain || 'N/A'}</p>
                         <p><strong>Token Type:</strong> {tokenDetails.tokenType || 'N/A'}</p>
                         {tokenDetails.tokenType === 'RWA' && <p><strong>RWA Type:</strong> {tokenDetails.rwaSubType || 'N/A'}</p>}
                         {tokenDetails.tokenType === 'CapitalAsset' && <p><strong>Capital Asset Type:</strong> {tokenDetails.capitalAssetSubType || 'N/A'}</p>}
                         {tokenDetails.tokenType === 'Currency' && <p><strong>Currency Type:</strong> {tokenDetails.currencySubType || 'N/A'}</p>}
                         <p><strong>Amount to Issue:</strong> {supplyDetails.initialSupply ? parseFloat(supplyDetails.initialSupply).toLocaleString() : 'N/A'}</p>
                         <p><strong>Market Value:</strong> {supplyDetails.marketValueAmount ? `${parseFloat(supplyDetails.marketValueAmount).toLocaleString()} ${supplyDetails.marketValueCurrency}` : 'N/A'}</p>
                         <p><strong>Supply Type:</strong> {supplyDetails.supplyType === 'finite' ? 'Finite' : 'Infinite'}</p>
                         <p><strong>Decimals:</strong> {supplyDetails.decimals}</p>
                         <p><strong>KYC Enabled:</strong> {permissionDetails.kycEnabled ? `Yes (Level: ${permissionDetails.kycLevel || 'Not Set'})` : 'No'}</p>
                         <p><strong>Fees Enabled:</strong> {permissionDetails.feeScheduleEnabled ? 'Yes' : 'No'}</p>
                         <p><strong>Pausable:</strong> {permissionDetails.pausable ? 'Yes' : 'No'}</p>
                         <p><strong>Fungible:</strong> {permissionDetails.fungible ? 'Yes' : 'No'}</p>
                         <p><strong>Expiration Enabled:</strong> {permissionDetails.isExpirationEnabled ? `Yes (Date: ${permissionDetails.expiration || 'Not Set'})` : 'No'}</p>
                         <p><strong>Roles:</strong></p> {permissionDetails.roles.length > 0 ? ( <ul className='list-disc list-inside ml-4'>{permissionDetails.roles.map((r, i) => <li key={i}>{r.role}: {r.address}</li>)}</ul> ) : ( <p className='ml-4 italic'>None specified</p> )}
                         <p><strong>Regulatory Info:</strong></p> {regulatoryInfo.length > 0 ? ( <ul className='list-disc list-inside ml-4'>{regulatoryInfo.map((info, i) => <li key={i}>{info.country}: {info.regulator}</li>)}</ul> ) : ( <p className='ml-4 italic'>None specified</p> )}
                         <p><strong>Asset Backed:</strong> {reserveDetails.isBackedAsset ? 'Yes' : 'No'}</p> {reserveDetails.isBackedAsset && reserveDetails.isConfigured && ( <div className='ml-4'><p><strong>Backing Type:</strong> {reserveDetails.backingType}</p> {reserveDetails.backingType === 'bank' && <p>Bank Name: {reserveDetails.bankName}, Account ending: {reserveDetails.accountNumberLast4}</p>} {reserveDetails.backingType === 'smartcontract' && <p>Network: {reserveDetails.contractNetwork}, Address: {reserveDetails.contractAddress}</p>} {reserveDetails.backingType === 'custodian' && <p>Custodian: {reserveDetails.custodianName}, Frequency: {reserveDetails.attestationFrequency}</p>} {reserveDetails.backingType === 'onchain_wallet' && <p>Network: {reserveDetails.onChainNetwork}, Address: {reserveDetails.onChainWalletAddress}</p>} </div> )} {reserveDetails.isBackedAsset && !reserveDetails.isConfigured && <p className='ml-4 text-red-600'>Reserve details not configured!</p>}
                     </div>
                 </>
             )}

             {/* --- Workflow Status Area (Unchanged logic, just appears in Step 4 now) --- */}
             {workflowState !== 'idle' && (
               <div className={`mb-6 p-4 border rounded-lg ${workflowState === 'rejected' ? 'bg-red-50 border-red-300' : 'bg-blue-50 border-blue-300'}`}>
                 <h3 className={`text-lg font-semibold mb-2 ${workflowState === 'rejected' ? 'text-red-800' : 'text-blue-800'}`}>Issuance Request Status</h3>
                 <p className={`mb-3 ${workflowState === 'rejected' ? 'text-red-700' : 'text-blue-700'}`}>{workflowMessage}</p>
                 {isLoading && <p className="text-sm text-gray-500 italic mb-3">Processing...</p>}
                 {/* Workflow Action Buttons */}
                 {workflowState === 'pending_compliance' && !isLoading && ( <div className="flex space-x-3"> <button onClick={() => handleApproval('compliance')} className="px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm">Approve (Compliance)</button> <button onClick={() => handleReject('Compliance')} className="px-4 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm">Reject (Compliance)</button> </div> )}
                 {workflowState === 'pending_management' && !isLoading && ( <div className="flex space-x-3"> <button onClick={() => handleApproval('management')} className="px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm">Approve (Management)</button> <button onClick={() => handleReject('Management')} className="px-4 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm">Reject (Management)</button> </div> )}
                 {workflowState === 'rejected' && ( <p className="text-red-700 font-medium">Reason: {rejectReason}</p> )}
                 {workflowState === 'approved' && !isLoading && ( <button onClick={handleExecuteIssue} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-bold"> Confirm & Issue Token </button> )}
               </div>
             )}

           {/* --- Navigation Buttons for Finalization Step --- */}
           <div className="flex justify-between mt-8">
             { workflowState === 'idle' ? (
                 <button className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-50" onClick={() => setIssuanceScreen('permissions')} > Previous Step </button> // EDIT: Go back to Step 3
             ) : ( <div /> )}
             { workflowState === 'idle' ? (
                 <button className="px-4 py-2 rounded text-white hover:opacity-90 bg-green-600 disabled:opacity-50" onClick={handleInitiateIssuanceApproval} disabled={(reservesRequired && !reserveDetails.isConfigured) || (permissionDetails.kycEnabled && !permissionDetails.kycLevel) || (permissionDetails.isExpirationEnabled && !permissionDetails.expiration)} > Request Issuance Approval </button>
             ) : ( <div/> )}
           </div>
           </div>
        )}

        {/* Fallback for unexpected state */}
        {issuanceScreen !== 'token-details' &&
         issuanceScreen !== 'supply-reserves-metadata' && // EDIT: Updated step name
         issuanceScreen !== 'permissions' &&
         // Step 4 removed
         issuanceScreen !== 'finalization' && (
           <p className="text-red-500">Error: Invalid issuance screen state.</p>
        )}

      </div>
    </div>
  );
};

export default TokenIssuanceWizard;
