import React, { useState, useEffect } from 'react';

// Sample countries (keep as is or replace)
const sampleCountries = [
  { code: 'US', name: 'United States' }, { code: 'GB', name: 'United Kingdom' }, { code: 'CA', name: 'Canada' }, { code: 'EU', name: 'European Union (Region)' }, { code: 'SG', name: 'Singapore' }, { code: 'GH', name: 'Ghana' }, { code: 'OTHER', name: 'Other/Multiple' },
];

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
  const [issuanceScreen, setIssuanceScreen] = useState('token-details');

  // State for collected data across wizard steps
  const [tokenDetails, setTokenDetails] = useState({ name: '', symbol: '', blockchain: '', tokenType: '' });
  const [supplyDetails, setSupplyDetails] = useState({ initialSupply: '', supplyType: 'finite', decimals: '18', metadata: '', valueDefinition: '' });
  const [permissionDetails, setPermissionDetails] = useState({ kycEnabled: false, feeScheduleEnabled: false, pausable: true, fungible: true, expiration: '', roles: [] });
  const [reserveDetails, setReserveDetails] = useState({ isBackedAsset: false, backingType: '', bankName: '', accountNumberLast4: '', contractNetwork: '', contractAddress: '', custodianName: '', attestationFrequency: '', isConfigured: false });
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
  const [selectedCountry, setSelectedCountry] = useState('');
  const [regulatorName, setRegulatorName] = useState('');

  // --- State for Approval Workflow ---
  const [workflowState, setWorkflowState] = useState('idle'); // 'idle', 'pending_compliance', 'pending_management', 'approved', 'rejected'
  const [workflowMessage, setWorkflowMessage] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [finalTokenData, setFinalTokenData] = useState(null); // To store compiled data during workflow

  // --- Helper Functions (Add Role, Add Regulatory Info, Connect Bank/Contract/Custodian - Keep existing functions) ---
    const handleAddRole = (event) => {
        event.preventDefault();
        if (!selectedRole || !roleAddress.trim()) { alert('Please select a role and enter a valid address.'); return; }
        const newRole = { role: selectedRole, address: roleAddress };
        setPermissionDetails(prev => ({ ...prev, roles: [...prev.roles, newRole] }));
        setSelectedRole(''); setRoleAddress('');
    };

    const handleAddRegulatoryInfo = (event) => {
        event.preventDefault();
        if (!selectedCountry || !regulatorName.trim()) { alert('Please select a country and enter a regulator name.'); return; }
        const newInfo = { country: selectedCountry, regulator: regulatorName.trim() };
        setRegulatoryInfo(prev => [...prev, newInfo]);
        setRegulatorName(''); // Clear only regulator name
    };

    const handleConnectBank = (event) => {
        event.preventDefault();
        const last4 = tempAccountNumber.slice(-4);
        setReserveDetails(prev => ({ ...prev, bankName: tempBankName, accountNumberLast4: last4, backingType: 'bank', isConfigured: true }));
        setTempBankName(''); setTempAccountNumber('');
    };

    const handleConnectContract = (event) => {
        event.preventDefault();
        setReserveDetails(prev => ({...prev, contractNetwork: tempContractNetwork, contractAddress: tempContractAddress, backingType: 'smartcontract', isConfigured: true }));
        setTempContractAddress('');
    };

    const handleSetupCustodian = (event) => {
        event.preventDefault();
        setReserveDetails(prev => ({ ...prev, custodianName: tempCustodianName, attestationFrequency: tempAttestationFreq, backingType: 'custodian', isConfigured: true }));
        setTempCustodianName('');
    };


  // --- Workflow Effect Hook ---
  useEffect(() => {
    setIsLoading(false); // Reset loading indicator on state change

    switch (workflowState) {
      case 'pending_compliance':
        setWorkflowMessage('Issuance request sent to Compliance for review.');
        break;
      case 'pending_management':
        setWorkflowMessage('Compliance approved. Request sent to Management for final review.');
        break;
      case 'approved':
        setWorkflowMessage('Issuance request fully approved. Ready to execute.');
        break;
      case 'rejected':
        setWorkflowMessage('Issuance request rejected.');
        break;
      default: // 'idle' or other states
        setWorkflowMessage('');
        setRejectReason('');
        setFinalTokenData(null); // Clear compiled data if workflow resets
        break;
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
    const fullTokenData = {
      tokenDetails: { ...tokenDetails },
      supplyDetails: { ...supplyDetails, initialSupply: amountToIssue },
      permissionDetails: { ...permissionDetails },
      reserveDetails: { ...reserveDetails },
      regulatoryInfo: [...regulatoryInfo]
    };

    // Final Validation before starting workflow
    if (!(amountToIssue > 0 &&
        fullTokenData.tokenDetails.symbol &&
        fullTokenData.tokenDetails.name &&
        fullTokenData.tokenDetails.blockchain &&
        fullTokenData.tokenDetails.tokenType &&
        (!fullTokenData.reserveDetails.isBackedAsset || fullTokenData.reserveDetails.isConfigured)))
    {
      alert("Please ensure Name, Symbol, Blockchain, Token Type, Initial Supply are valid, and Reserve Details are configured if asset-backed.");
      return;
    }

    console.log("Initiating issuance approval with data:", fullTokenData);
    setFinalTokenData(fullTokenData); // Store data for later use
    setWorkflowState('pending_compliance'); // Start workflow
  };

  /** Simulates an approval step (Compliance or Management). */
  const handleApproval = (step) => {
    if (isLoading) return;
    setIsLoading(true);
    setWorkflowMessage(`Processing ${step} approval...`);

    setTimeout(() => {
      if (step === 'compliance') {
        setWorkflowState('pending_management');
      } else if (step === 'management') {
        setWorkflowState('approved');
      }
    }, 1500); // Simulate 1.5 second delay
  };

  /** Simulates a rejection step, prompting for a reason. */
  const handleReject = (rejectedBy) => {
    if (isLoading) return;
    const reason = prompt(`Enter reason for rejection by ${rejectedBy} (optional):`);
    setIsLoading(true);
    setWorkflowMessage(`Processing rejection...`);

    setTimeout(() => {
      setRejectReason(reason || 'No reason provided.');
      setWorkflowState('rejected');
    }, 1000); // Simulate 1 second delay
  };

  /** Handles the final execution of the issuance after workflow approval and user confirmation. */
  const handleExecuteIssue = () => {
    if (isLoading || workflowState !== 'approved' || !finalTokenData) return;

    const confirmMsg = `You are about to issue ${finalTokenData.supplyDetails.initialSupply.toLocaleString()} ${finalTokenData.tokenDetails.symbol} tokens.\n\nThis action will finalize the token creation based on the approved details.\n\nProceed?`;

    if (window.confirm(confirmMsg)) {
        console.log("Executing onIssue with final data:", finalTokenData);
        onIssue(finalTokenData); // Calls the original callback passed from the parent
        // Reset workflow state after successful issuance if needed, or rely on parent navigation
        // setWorkflowState('idle');
    } else {
        console.log("Final issuance execution cancelled by user.");
    }
  };

  /** Handles cancelling the active workflow request */
  const handleCancelRequest = () => {
      if (window.confirm("Are you sure you want to cancel this issuance request?")) {
          setWorkflowState('idle'); // Reset workflow, keeps wizard data
      }
  }

  // --- Render Logic ---

  /** Renders the visual progress indicator (steps) */
  const renderProgressSteps = () => {
    const steps = ['Token Details', 'Supply & Metadata', 'Permissions', 'Proof of Reserves', 'Finalization'];
    const currentStepIndex = steps.findIndex(step => step.toLowerCase().replace(/ & | /g, '-').includes(issuanceScreen.split('-')[0]) || (issuanceScreen === 'proof-reserves' && step === 'Proof of Reserves') || (issuanceScreen === 'finalization' && step === 'Finalization') );
    // Only render steps if workflow is idle (i.e. wizard is active)
    if (workflowState !== 'idle' && issuanceScreen !== 'finalization') return null;
    // Highlight finalization step even when workflow is active on that screen
    const activeIndex = (workflowState !== 'idle' && issuanceScreen === 'finalization') ? steps.length -1 : currentStepIndex;

    return (
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <React.Fragment key={step}>
              <div className="w-1/5 text-center">
                <div className={`rounded-full h-10 w-10 flex items-center justify-center mx-auto ${
                  index < activeIndex ? 'bg-green-600 text-white' : (index === activeIndex ? 'bg-emtech-gold text-white' : 'bg-gray-200 text-gray-600')
                }`}>
                  {index < activeIndex ? '✓' : index + 1}
                </div>
                <p className={`mt-1 text-sm ${index <= activeIndex ? 'font-medium text-gray-800' : 'text-gray-500'}`}>{step}</p>
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

  return (
    <div className="p-8">
      <div className="bg-white p-6 rounded shadow max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Issue New Tokens</h1>
          {/* Back button logic depends on wizard/workflow state */}
          <button
            className="px-3 py-1 rounded text-white hover:opacity-90 bg-gray-800 text-sm disabled:opacity-50"
            onClick={workflowState === 'idle' ? onBack : handleCancelRequest} // Go back if idle, offer cancel if workflow active
            disabled={isLoading && workflowState !== 'idle'} // Disable cancel if processing
          >
            {workflowState === 'idle' ? 'Back to Dashboard' : 'Cancel Issuance Request'}
          </button>
        </div>

        {renderProgressSteps()}

        {/* --- Wizard Step Content (Render conditionally based on issuanceScreen IF workflow is idle) --- */}

        {/* Step 1: Token Details */}
        {issuanceScreen === 'token-details' && workflowState === 'idle' && (
           <div>
             <h2 className="text-xl font-medium mb-4 text-gray-800">Token Details</h2>
             <p className="text-gray-600 mb-6">Define the basic information for your new token.</p>
             <div className="space-y-4">
               {/* Token Name */}
               <div> <label className="block mb-1 font-medium">Token Name <span className="text-red-600">*</span></label> <input type="text" className="w-full p-2 border rounded" placeholder="e.g. My Stablecoin" value={tokenDetails.name} onChange={(e) => setTokenDetails({...tokenDetails, name: e.target.value})} /> <p className="text-xs text-gray-500 mt-1">Full name of your token (e.g. "US Dollar Coin")</p> </div>
               {/* Token Symbol */}
               <div> <label className="block mb-1 font-medium">Token Symbol <span className="text-red-600">*</span></label> <input type="text" className="w-full p-2 border rounded" placeholder="e.g. USDC" value={tokenDetails.symbol} onChange={(e) => setTokenDetails({...tokenDetails, symbol: e.target.value})} /> <p className="text-xs text-gray-500 mt-1">Short symbol for your token (e.g. "USDC")</p> </div>
               {/* Blockchain */}
               <div> <label className="block mb-1 font-medium">Select Blockchain <span className="text-red-600">*</span></label> <select className="w-full p-2 border rounded" value={tokenDetails.blockchain} onChange={(e) => setTokenDetails({...tokenDetails, blockchain: e.target.value})} > <option value="">Select Blockchain</option> <option value="Ethereum">Ethereum</option> <option value="Hedera">Hedera</option> <option value="Solana">Solana</option> <option value="Polygon">Polygon</option> <option value="Stellar">Stellar</option> </select> <p className="text-xs text-gray-500 mt-1">The blockchain network where this token will be issued.</p> </div>
               {/* Token Type */}
               <div> <label className="block mb-1 font-medium">Token Type <span className="text-red-600">*</span></label> <select className="w-full p-2 border rounded" value={tokenDetails.tokenType} onChange={(e) => setTokenDetails({...tokenDetails, tokenType: e.target.value})} > <option value="">Select Token Type</option> <option value="Currency">Currency Token</option> <option value="RWA">Real World Asset Token</option> <option value="CapitalAsset">Capital Asset Token</option> </select> <p className="text-xs text-gray-500 mt-1">Classify the type of token being issued.</p> </div>
               {/* Regulatory Info */}
                <div className="border rounded-lg p-4 bg-gray-50 mt-6">
                   <label className="block mb-2"><span className="font-medium">Regulatory Information</span><p className="text-sm text-gray-600">Specify jurisdictions and regulatory bodies (optional)</p></label>
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
               <div className="flex justify-end mt-8"> <button className="px-4 py-2 rounded text-white hover:opacity-90 bg-emtech-gold disabled:opacity-50" onClick={() => setIssuanceScreen('supply-metadata')} disabled={!tokenDetails.name || !tokenDetails.symbol || !tokenDetails.blockchain || !tokenDetails.tokenType} > Next Step </button> </div>
             </div>
           </div>
        )}

        {/* Step 2: Supply & Metadata */}
        {issuanceScreen === 'supply-metadata' && workflowState === 'idle' && (
            <div>
             <h2 className="text-xl font-medium mb-4 text-gray-800">Supply and Metadata</h2>
             <p className="text-gray-600 mb-6">Configure token supply settings and metadata.</p>
             <div className="space-y-4">
               <div> <label className="block mb-1 font-medium">Initial Supply <span className="text-red-600">*</span></label> <input type="number" min="0" className="w-full p-2 border rounded" placeholder="e.g. 1000000" value={supplyDetails.initialSupply} onChange={(e) => setSupplyDetails({...supplyDetails, initialSupply: e.target.value})} /> <p className="text-xs text-gray-500 mt-1">Number of tokens to be created initially</p> </div>
               <div> <label className="block mb-1 font-medium">Supply Type <span className="text-red-600">*</span></label> <div className="grid grid-cols-2 gap-4 mt-2"> <div className={`border rounded p-3 cursor-pointer ${supplyDetails.supplyType === 'finite' ? 'border-emtech-gold bg-yellow-50' : 'border-gray-300'}`} onClick={() => setSupplyDetails({...supplyDetails, supplyType: 'finite'})} > <div className="flex items-center"> <input type="radio" name="supplyType" className="mr-2 focus:ring-emtech-gold h-4 w-4 text-emtech-gold" checked={supplyDetails.supplyType === 'finite'} readOnly /> <div> <p className="font-medium">Finite Supply</p> <p className="text-xs text-gray-500">Fixed maximum token supply</p> </div> </div> </div> <div className={`border rounded p-3 cursor-pointer ${supplyDetails.supplyType === 'infinite' ? 'border-emtech-gold bg-yellow-50' : 'border-gray-300'}`} onClick={() => setSupplyDetails({...supplyDetails, supplyType: 'infinite'})} > <div className="flex items-center"> <input type="radio" name="supplyType" className="mr-2 focus:ring-emtech-gold h-4 w-4 text-emtech-gold" checked={supplyDetails.supplyType === 'infinite'} readOnly /> <div> <p className="font-medium">Infinite Supply</p> <p className="text-xs text-gray-500">No maximum supply limit</p> </div> </div> </div> </div> </div>
               <div> <label className="block mb-1 font-medium">Decimal Points <span className="text-red-600">*</span></label> <select className="w-full p-2 border rounded" value={supplyDetails.decimals} onChange={(e) => setSupplyDetails({...supplyDetails, decimals: e.target.value})} > <option value="18">18 (e.g. Ethereum standard)</option> <option value="8">8 (e.g. Bitcoin standard)</option> <option value="6">6 (e.g. USDC standard)</option> <option value="2">2 (e.g. 100.50)</option> <option value="0">0 (No decimal places, whole tokens only)</option> </select> <p className="text-xs text-gray-500 mt-1">How divisible the token will be (smaller units)</p> </div>
               <div> <label className="block mb-1 font-medium">Initial Value Definition</label> <input type="text" className="w-full p-2 border rounded" placeholder="e.g., 1 USDC" value={supplyDetails.valueDefinition} onChange={(e) => setSupplyDetails({...supplyDetails, valueDefinition: e.target.value})} /> <p className="text-xs text-gray-500 mt-1">Define what 1 unit of this token initially represents (optional).</p> </div>
               <div> <label className="block mb-1 font-medium">Metadata Implementation</label> <textarea className="w-full p-2 border rounded" rows="3" placeholder="Enter JSON schema or metadata description (optional)" value={supplyDetails.metadata} onChange={(e) => setSupplyDetails({...supplyDetails, metadata: e.target.value})} ></textarea> <p className="text-xs text-gray-500 mt-1">Additional data fields to store with the token or transactions.</p> </div>
               <div className="flex justify-between mt-8"> <button className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-50" onClick={() => setIssuanceScreen('token-details')} > Previous Step </button> <button className="px-4 py-2 rounded text-white hover:opacity-90 bg-emtech-gold disabled:opacity-50" onClick={() => setIssuanceScreen('permissions')} disabled={!supplyDetails.initialSupply || !supplyDetails.decimals } > Next Step </button> </div>
             </div>
           </div>
        )}

        {/* Step 3: Permissions */}
        {issuanceScreen === 'permissions' && workflowState === 'idle' && (
             <div>
              <h2 className="text-xl font-medium mb-4 text-gray-800">Permissions</h2>
              <p className="text-gray-600 mb-6">Configure token permissions and functional features.</p>
              <div className="space-y-6">

                {/* KYC - MODIFIED SECTION */}
                <div className="border rounded-lg p-4 bg-gray-50">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="mr-2 h-4 w-4 text-emtech-gold focus:ring-emtech-gold"
                      checked={permissionDetails.kycEnabled}
                      onChange={(e) => setPermissionDetails({...permissionDetails, kycEnabled: e.target.checked})}
                    />
                    <div>
                      <p className="font-medium">KYC Permissions / Account Flags</p>
                      <p className="text-sm text-gray-600">Require accounts to be KYC verified before holding or transferring tokens</p>
                    </div>
                  </label>
                  {/* Intentionally removed the conditional block for detailed KYC requirements */}
                </div>
                {/* END OF MODIFIED KYC SECTION */}

                {/* Fees */}
                <div className="border rounded-lg p-4 bg-gray-50"> <label className="flex items-center mb-3 cursor-pointer"> <input type="checkbox" className="mr-2 h-4 w-4 text-emtech-gold focus:ring-emtech-gold" checked={permissionDetails.feeScheduleEnabled} onChange={(e) => setPermissionDetails({...permissionDetails, feeScheduleEnabled: e.target.checked})} /> <div><p className="font-medium">Fee Schedule</p><p className="text-sm text-gray-600">Apply transaction fees when tokens are transferred</p></div> </label> {permissionDetails.feeScheduleEnabled && ( <div className="ml-6 mt-2 p-3 border rounded bg-white"> <div className="space-y-3"><div><label className="block text-sm font-medium mb-1">Fee Recipient</label><input type="text" className="w-full p-2 border rounded text-sm" placeholder="Enter wallet address" /></div> <div><label className="block text-sm font-medium mb-1">Transaction Fee (%)</label><input type="text" className="w-full p-2 border rounded text-sm" placeholder="e.g. 0.1%" /></div> <div><label className="block text-sm font-medium mb-1">Fee Cap</label><input type="text" className="w-full p-2 border rounded text-sm" placeholder="Maximum fee amount" /></div></div> </div> )} </div>
                {/* Pausable & Fungibility */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> <div className="border rounded-lg p-4 bg-gray-50"> <label className="flex items-center mb-2 cursor-pointer"> <input type="checkbox" className="mr-2 h-4 w-4 text-emtech-gold focus:ring-emtech-gold" checked={permissionDetails.pausable} onChange={(e) => setPermissionDetails({...permissionDetails, pausable: e.target.checked})} /> <div><p className="font-medium">Pausable Transactions</p><p className="text-sm text-gray-600">Ability to temporarily pause token transfers</p></div> </label> </div> <div className="border rounded-lg p-4 bg-gray-50"> <p className="font-medium mb-2">Token Fungibility</p> <div className="space-x-4"><label className="inline-flex items-center"><input type="radio" name="fungibility" className="mr-1 text-emtech-gold focus:ring-emtech-gold" checked={permissionDetails.fungible} onChange={() => setPermissionDetails({...permissionDetails, fungible: true})} /><span className="text-sm">Fungible</span></label> <label className="inline-flex items-center"><input type="radio" name="fungibility" className="mr-1 text-emtech-gold focus:ring-emtech-gold" checked={!permissionDetails.fungible} onChange={() => setPermissionDetails({...permissionDetails, fungible: false})} /><span className="text-sm">Non-Fungible (NFT)</span></label></div> </div> </div>
                {/* Expiration */}
                <div className="border rounded-lg p-4 bg-gray-50"> <label className="block mb-2"><span className="font-medium">Token Expiration</span><p className="text-sm text-gray-600">Set an expiration date for the token (optional)</p></label> <input type="date" className="w-full p-2 border rounded" min={new Date().toISOString().split('T')[0]} value={permissionDetails.expiration} onChange={(e) => setPermissionDetails({...permissionDetails, expiration: e.target.value})} /> </div>
                {/* Role Assignments */}
                <div className="border rounded-lg p-4 bg-gray-50"> <label className="block mb-2"><span className="font-medium">Role Assignments</span><p className="text-sm text-gray-600">Assign administrative roles for this token</p></label> <form onSubmit={handleAddRole} className="flex space-x-2 items-center"> <select className="flex-1 p-2 border rounded" value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)} > <option value="">Select Role</option> <option value="Admin">Admin</option> <option value="Minter">Minter</option> <option value="Burner">Burner</option> <option value="Pauser">Pauser</option> <option value="KYC Administrator">KYC Administrator</option> </select> <input type="text" className="flex-1 p-2 border rounded" placeholder="Account address (e.g., 0x...)" value={roleAddress} onChange={(e) => setRoleAddress(e.target.value)} /> <button className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50" disabled={!selectedRole || !roleAddress} type="submit" > Add </button> </form> <div className="mt-4 p-3 border rounded bg-white min-h-[50px]"> {permissionDetails.roles.length === 0 ? (<p className="text-sm text-gray-500 italic">No roles assigned yet. Add a role above.</p>) : (<ul className="space-y-1 list-disc list-inside">{permissionDetails.roles.map((roleItem, index) => (<li key={index} className="text-sm"><strong>{roleItem.role}:</strong> {roleItem.address}</li>))}</ul>)} </div> </div>
              </div>
              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8"> <button className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-50" onClick={() => setIssuanceScreen('supply-metadata')} > Previous Step </button> <button className="px-4 py-2 rounded text-white hover:opacity-90 bg-emtech-gold" onClick={() => setIssuanceScreen('proof-reserves')} > Next Step </button> </div>
            </div>
        )}

        {/* Step 4: Proof of Reserves */}
        {issuanceScreen === 'proof-reserves' && workflowState === 'idle' && (
            <div>
             <h2 className="text-xl font-medium mb-4 text-gray-800">Proof of Reserves</h2>
             <p className="text-gray-600 mb-6">Specify if your token is backed by real-world assets and how those assets are verified.</p>
             <div className="space-y-6">
               {/* Backed Choice */}
               <div className="border rounded-lg p-4 bg-gray-50"> <p className="font-medium mb-3">Is this token backed by real-world assets? <span className="text-red-600">*</span></p> <div className="grid grid-cols-2 gap-4"> <div className={`border rounded p-3 cursor-pointer ${reserveDetails.isBackedAsset ? 'border-emtech-gold bg-yellow-50' : 'border-gray-300'}`} onClick={() => setReserveDetails({...reserveDetails, isBackedAsset: true, isConfigured: false})} > <div className="flex items-center"> <input type="radio" name="isBacked" className="mr-2 focus:ring-emtech-gold h-4 w-4 text-emtech-gold" checked={reserveDetails.isBackedAsset} readOnly /> <div><p className="font-medium">Yes</p><p className="text-xs text-gray-500">Token is backed by verifiable reserves</p></div> </div> </div> <div className={`border rounded p-3 cursor-pointer ${!reserveDetails.isBackedAsset ? 'border-emtech-gold bg-yellow-50' : 'border-gray-300'}`} onClick={() => setReserveDetails({ isBackedAsset: false, backingType: '', bankName: '', accountNumberLast4: '', contractNetwork: '', contractAddress: '', custodianName: '', attestationFrequency: '', isConfigured: true })} > <div className="flex items-center"> <input type="radio" name="isBacked" className="mr-2 focus:ring-emtech-gold h-4 w-4 text-emtech-gold" checked={!reserveDetails.isBackedAsset} readOnly /> <div><p className="font-medium">No</p><p className="text-xs text-gray-500">Token is not backed by reserves</p></div> </div> </div> </div> </div>
                {/* Conditional Backing Method */}
               {reserveDetails.isBackedAsset && ( <div className="border rounded-lg p-4 bg-gray-50"> <p className="font-medium mb-3">Select Reserve Backing Method <span className="text-red-600">*</span></p> {reserveDetails.isConfigured && ( <div className='mb-4 p-3 bg-green-100 border border-green-300 text-green-800 rounded text-sm'> <p className='font-medium'>Reserve Method Configured:</p> {reserveDetails.backingType === 'bank' && <p>Bank Account ({reserveDetails.bankName} ending in {reserveDetails.accountNumberLast4})</p>} {reserveDetails.backingType === 'smartcontract' && <p>Smart Contract ({reserveDetails.contractNetwork}: {reserveDetails.contractAddress.substring(0,6)}...)</p>} {reserveDetails.backingType === 'custodian' && <p>Custodian ({reserveDetails.custodianName} - {reserveDetails.attestationFrequency} Attestation)</p>} <button onClick={() => setReserveDetails(prev => ({ ...prev, isConfigured: false }))} className="text-xs text-blue-600 hover:underline mt-1"> Edit Configuration </button> </div> )}
                <div className={`space-y-3 ${reserveDetails.isConfigured ? 'opacity-50 pointer-events-none' : ''}`}>
                    {/* Bank */}
                    <div className={`border rounded p-3 cursor-pointer ${reserveDetails.backingType === 'bank' ? 'border-emtech-gold bg-yellow-50' : 'border-gray-300 bg-white'}`} onClick={() => !reserveDetails.isConfigured && setReserveDetails({...reserveDetails, backingType: 'bank'})} >
                        <div className="flex"> <input type="radio" name="backingType" className="mr-2 mt-1 focus:ring-emtech-gold h-4 w-4 text-emtech-gold" checked={reserveDetails.backingType === 'bank'} readOnly />
                        <div> <p className="font-medium">Bank Account Connection</p> <p className="text-sm text-gray-600">Link a traditional bank account to verify reserves</p>
                            {reserveDetails.backingType === 'bank' && !reserveDetails.isConfigured && ( <form onSubmit={handleConnectBank} className="mt-3 p-3 border rounded bg-white"> <div className="space-y-3">
                                <div><label className="block text-sm font-medium mb-1">Bank Name</label><input type="text" value={tempBankName} onChange={(e) => setTempBankName(e.target.value)} className="w-full p-2 border rounded text-sm" placeholder="e.g. JP Morgan Chase" required /></div> {/* Restored Placeholder */}
                                <div><label className="block text-sm font-medium mb-1">Account Number</label><input type="text" value={tempAccountNumber} onChange={(e) => setTempAccountNumber(e.target.value)} className="w-full p-2 border rounded text-sm" placeholder="Enter full account number" required /></div>
                                <button type="submit" className="mt-2 px-4 py-2 rounded text-white hover:opacity-90 bg-emtech-gold">Connect Bank Account</button>
                            </div> </form> )}
                        </div> </div>
                    </div>
                    {/* Contract */}
                    <div className={`border rounded p-3 cursor-pointer ${reserveDetails.backingType === 'smartcontract' ? 'border-emtech-gold bg-yellow-50' : 'border-gray-300 bg-white'}`} onClick={() => !reserveDetails.isConfigured && setReserveDetails({...reserveDetails, backingType: 'smartcontract'})} >
                        <div className="flex"> <input type="radio" name="backingType" className="mr-2 mt-1 focus:ring-emtech-gold h-4 w-4 text-emtech-gold" checked={reserveDetails.backingType === 'smartcontract'} readOnly />
                        <div> <p className="font-medium">On-Chain Asset with Smart Contract</p> <p className="text-sm text-gray-600">Link to on-chain assets via smart contract for automated verification</p>
                            {reserveDetails.backingType === 'smartcontract' && !reserveDetails.isConfigured && ( <form onSubmit={handleConnectContract} className="mt-3 p-3 border rounded bg-white"> <div className="space-y-3">
                                <div><label className="block text-sm font-medium mb-1">Blockchain Network</label><select value={tempContractNetwork} onChange={(e)=> setTempContractNetwork(e.target.value)} className="w-full p-2 border rounded text-sm"><option>Ethereum</option><option>Polygon</option><option>BNB Chain</option><option>Solana</option><option>Avalanche</option></select></div>
                                <div><label className="block text-sm font-medium mb-1">Smart Contract Address</label><input type="text" value={tempContractAddress} onChange={(e)=> setTempContractAddress(e.target.value)} className="w-full p-2 border rounded text-sm" placeholder="0x..." required /></div>
                                <button type="submit" className="mt-2 px-4 py-2 rounded text-white hover:opacity-90 bg-emtech-gold">Connect Smart Contract</button>
                            </div> </form> )}
                        </div> </div>
                    </div>
                    {/* Custodian */}
                    <div className={`border rounded p-3 cursor-pointer ${reserveDetails.backingType === 'custodian' ? 'border-emtech-gold bg-yellow-50' : 'border-gray-300 bg-white'}`} onClick={() => !reserveDetails.isConfigured && setReserveDetails({...reserveDetails, backingType: 'custodian'})} >
                        <div className="flex"> <input type="radio" name="backingType" className="mr-2 mt-1 focus:ring-emtech-gold h-4 w-4 text-emtech-gold" checked={reserveDetails.backingType === 'custodian'} readOnly />
                        <div> <p className="font-medium">Third-Party Custodian Verification</p> <p className="text-sm text-gray-600">Use a trusted third-party custodian to verify and attest to reserves</p>
                            {reserveDetails.backingType === 'custodian' && !reserveDetails.isConfigured && ( <form onSubmit={handleSetupCustodian} className="mt-3 p-3 border rounded bg-white"> <div className="space-y-3">
                                <div><label className="block text-sm font-medium mb-1">Custodian Name</label><input type="text" value={tempCustodianName} onChange={(e)=> setTempCustodianName(e.target.value)} className="w-full p-2 border rounded text-sm" placeholder="e.g. BitGo, Fireblocks, etc." required/></div>
                                <div><label className="block text-sm font-medium mb-1">Attestation Frequency</label><select value={tempAttestationFreq} onChange={(e)=> setTempAttestationFreq(e.target.value)} className="w-full p-2 border rounded text-sm"><option>Daily</option><option>Weekly</option><option>Monthly</option><option>Quarterly</option></select></div>
                                <button type="submit" className="mt-2 px-4 py-2 rounded text-white hover:opacity-90 bg-emtech-gold">Setup Custodian Verification</button>
                            </div> </form> )}
                        </div> </div>
                    </div>
                </div>
               </div> )}
               {/* Navigation Buttons */}
               <div className="flex justify-between mt-8"> <button className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-50" onClick={() => setIssuanceScreen('permissions')} > Previous Step </button> <button className="px-4 py-2 rounded text-white hover:opacity-90 bg-emtech-gold disabled:opacity-50" onClick={() => setIssuanceScreen('finalization')} disabled={reserveDetails.isBackedAsset && !reserveDetails.isConfigured} > Next Step </button> </div>
             </div>
           </div>
        )}

        {/* Step 5: Finalization & Workflow */}
        {issuanceScreen === 'finalization' && (
           <div>
             <h2 className="text-xl font-medium mb-4 text-gray-800">Finalization</h2>
             {/* Show Summary only if workflow is idle */}
             {workflowState === 'idle' && (
                <>
                    <p className="text-gray-600 mb-6">Review details below and click 'Request Issuance Approval' to proceed.</p>
                    {/* Review Summary */}
                    <div className='p-4 border rounded bg-gray-50 mb-6 space-y-2 text-sm'>
                        {/* ... (Keep existing summary rendering logic here) ... */}
                        <p><strong>Name:</strong> {tokenDetails.name || 'N/A'}</p>
                        <p><strong>Symbol:</strong> {tokenDetails.symbol || 'N/A'}</p>
                        {/* ... Add all other details ... */}
                         <p><strong>Blockchain:</strong> {tokenDetails.blockchain || 'N/A'}</p> <p><strong>Token Type:</strong> {tokenDetails.tokenType || 'N/A'}</p> <p><strong>Amount to Issue:</strong> {supplyDetails.initialSupply ? parseFloat(supplyDetails.initialSupply).toLocaleString() : 'N/A'}</p> <p><strong>Value Definition:</strong> {supplyDetails.valueDefinition || 'N/A'}</p> <p><strong>Supply Type:</strong> {supplyDetails.supplyType === 'finite' ? 'Finite' : 'Infinite'}</p> <p><strong>Decimals:</strong> {supplyDetails.decimals}</p> <p><strong>KYC Enabled:</strong> {permissionDetails.kycEnabled ? 'Yes' : 'No'}</p> <p><strong>Fees Enabled:</strong> {permissionDetails.feeScheduleEnabled ? 'Yes' : 'No'}</p> <p><strong>Pausable:</strong> {permissionDetails.pausable ? 'Yes' : 'No'}</p> <p><strong>Fungible:</strong> {permissionDetails.fungible ? 'Yes' : 'No'}</p> <p><strong>Expiration:</strong> {permissionDetails.expiration || 'None'}</p>
                        <p><strong>Roles:</strong></p> {permissionDetails.roles.length > 0 ? ( <ul className='list-disc list-inside ml-4'>{permissionDetails.roles.map((r, i) => <li key={i}>{r.role}: {r.address}</li>)}</ul> ) : ( <p className='ml-4 italic'>None specified</p> )}
                        <p><strong>Regulatory Info:</strong></p> {regulatoryInfo.length > 0 ? ( <ul className='list-disc list-inside ml-4'>{regulatoryInfo.map((info, i) => <li key={i}>{info.country}: {info.regulator}</li>)}</ul> ) : ( <p className='ml-4 italic'>None specified</p> )}
                        <p><strong>Asset Backed:</strong> {reserveDetails.isBackedAsset ? 'Yes' : 'No'}</p> {reserveDetails.isBackedAsset && reserveDetails.isConfigured && ( <div className='ml-4'><p><strong>Backing Type:</strong> {reserveDetails.backingType}</p> {reserveDetails.backingType === 'bank' && <p>Bank Name: {reserveDetails.bankName}, Account ending: {reserveDetails.accountNumberLast4}</p>} {reserveDetails.backingType === 'smartcontract' && <p>Network: {reserveDetails.contractNetwork}, Address: {reserveDetails.contractAddress}</p>} {reserveDetails.backingType === 'custodian' && <p>Custodian: {reserveDetails.custodianName}, Frequency: {reserveDetails.attestationFrequency}</p>} </div> )} {reserveDetails.isBackedAsset && !reserveDetails.isConfigured && <p className='ml-4 text-red-600'>Reserve details not configured!</p>}
                    </div>
                </>
             )}

             {/* --- Workflow Status Area (Displayed when workflow is active) --- */}
             {workflowState !== 'idle' && (
               <div className={`mb-6 p-4 border rounded-lg ${workflowState === 'rejected' ? 'bg-red-50 border-red-300' : 'bg-blue-50 border-blue-300'}`}>
                 <h3 className={`text-lg font-semibold mb-2 ${workflowState === 'rejected' ? 'text-red-800' : 'text-blue-800'}`}>Issuance Request Status</h3>
                 <p className={`mb-3 ${workflowState === 'rejected' ? 'text-red-700' : 'text-blue-700'}`}>{workflowMessage}</p>

                 {isLoading && <p className="text-sm text-gray-500 italic mb-3">Processing...</p>}

                 {/* Simulated Action Buttons for Workflow Steps */}
                 {workflowState === 'pending_compliance' && !isLoading && (
                   <div className="flex space-x-3">
                     <button onClick={() => handleApproval('compliance')} className="px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm">Approve (Compliance)</button>
                     <button onClick={() => handleReject('Compliance')} className="px-4 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm">Reject (Compliance)</button>
                   </div>
                 )}
                 {workflowState === 'pending_management' && !isLoading && (
                   <div className="flex space-x-3">
                     <button onClick={() => handleApproval('management')} className="px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm">Approve (Management)</button>
                     <button onClick={() => handleReject('Management')} className="px-4 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm">Reject (Management)</button>
                   </div>
                 )}
                 {workflowState === 'rejected' && ( <p className="text-red-700 font-medium">Reason: {rejectReason}</p> )}
                 {workflowState === 'approved' && !isLoading && (
                    <button onClick={handleExecuteIssue} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-bold"> Confirm & Issue Token </button>
                 )}
               </div>
             )}

            {/* --- Navigation Buttons for Finalization Step --- */}
            <div className="flex justify-between mt-8">
               {/* Previous Button: Only show if workflow is idle */}
               { workflowState === 'idle' ? (
                    <button className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-50" onClick={() => setIssuanceScreen('proof-reserves')} > Previous Step </button>
               ) : (
                   <div /> // Placeholder to keep layout consistent
               )}

               {/* Action Button: Changes based on workflow state */}
               { workflowState === 'idle' ? (
                    <button className="px-4 py-2 rounded text-white hover:opacity-90 bg-green-600 disabled:opacity-50"
                            onClick={handleInitiateIssuanceApproval}
                            disabled={reserveDetails.isBackedAsset && !reserveDetails.isConfigured}>
                        Request Issuance Approval
                    </button>
                ) : (
                    <div/> // Action buttons are inside the workflow status area now
                )}
             </div>
           </div>
        )}

        {/* Fallback for unexpected state */}
        {issuanceScreen !== 'token-details' &&
         issuanceScreen !== 'supply-metadata' &&
         issuanceScreen !== 'permissions' &&
         issuanceScreen !== 'proof-reserves' &&
         issuanceScreen !== 'finalization' && (
            <p className="text-red-500">Error: Invalid issuance screen state.</p>
        )}

      </div>
    </div>
  );
};

export default TokenIssuanceWizard;