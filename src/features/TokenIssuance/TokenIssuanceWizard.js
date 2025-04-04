import React, { useState } from 'react';

// This component handles the multi-step token issuance process
// It receives an 'onBack' function prop AND an 'onIssue' function prop
const TokenIssuanceWizard = ({ onBack, onIssue }) => {
  // State for the current step within the wizard
  const [issuanceScreen, setIssuanceScreen] = useState('token-details'); // Start at step 1

  // --- State for the form data ---
  const [tokenDetails, setTokenDetails] = useState({ name: '', symbol: '', blockchain: '' });
  const [supplyDetails, setSupplyDetails] = useState({ initialSupply: '', supplyType: 'finite', decimals: '18', metadata: '', valueDefinition: '' });
  // Updated permissionDetails state to include roles array
  const [permissionDetails, setPermissionDetails] = useState({
    kycEnabled: false,
    feeScheduleEnabled: false,
    pausable: true,
    fungible: true,
    expiration: '',
    roles: [] // Array to hold { role: 'Admin', address: '0x...' } objects
  });
  const [reserveDetails, setReserveDetails] = useState({
    isBackedAsset: false,
    backingType: '', // 'bank', 'smartcontract', 'custodian'
    // Confirmed details - filled when user clicks connect/setup
    bankName: '',
    accountNumberLast4: '',
    contractNetwork: '',
    contractAddress: '',
    custodianName: '',
    attestationFrequency: '',
    // Flag to track if the selected method's details are saved
    isConfigured: false
  });

  // --- ADDED: State specifically for the Role Assignment input fields ---
  const [selectedRole, setSelectedRole] = useState(''); // Currently selected role in dropdown
  const [roleAddress, setRoleAddress] = useState(''); // Currently typed address
  const [tempBankName, setTempBankName] = useState('');
  const [tempAccountNumber, setTempAccountNumber] = useState('');
  const [tempContractNetwork, setTempContractNetwork] = useState('Ethereum'); // Default value
  const [tempContractAddress, setTempContractAddress] = useState('');
  const [tempCustodianName, setTempCustodianName] = useState('');
  const [tempAttestationFreq, setTempAttestationFreq] = useState('Daily'); // Default value
  // --- END ADDED STATE ---


  // --- ADDED: Function to handle adding a role ---
  const handleAddRole = (event) => {
    event.preventDefault(); // Prevent potential form submission if wrapped in form later
    if (!selectedRole || !roleAddress) {
      alert('Please select a role and enter an address.');
      return;
    }
    // Simple validation (can be improved)
    if (roleAddress.trim() === '') {
       alert('Please enter a valid address.');
       return;
    }

    const newRole = { role: selectedRole, address: roleAddress };
    console.log("Adding role:", newRole);

    // Update the roles array in permissionDetails state
    setPermissionDetails(prevDetails => ({
      ...prevDetails,
      roles: [...prevDetails.roles, newRole] // Add the new role to the existing array
    }));

    // Clear the input fields after adding
    setSelectedRole('');
    setRoleAddress('');
  };
  // --- END ADDED FUNCTION ---

  // --- ADDED: Missing handler functions for reserve methods ---
  // Handler for bank account connection
  const handleConnectBank = (event) => {
    event.preventDefault();
    // Extract last 4 digits of account number for display
    const last4 = tempAccountNumber.slice(-4);
    
    // Update the reserveDetails state with the bank information
    setReserveDetails(prev => ({
      ...prev,
      bankName: tempBankName,
      accountNumberLast4: last4,
      isConfigured: true
    }));
    
    // Reset temp form state
    setTempBankName('');
    setTempAccountNumber('');
  };

  // Handler for smart contract connection
  const handleConnectContract = (event) => {
    event.preventDefault();
    
    // Update the reserveDetails state with the contract information
    setReserveDetails(prev => ({
      ...prev,
      contractNetwork: tempContractNetwork,
      contractAddress: tempContractAddress,
      isConfigured: true
    }));
    
    // Reset temp form state
    setTempContractAddress('');
  };

  // Handler for custodian setup
  const handleSetupCustodian = (event) => {
    event.preventDefault();
    
    // Update the reserveDetails state with the custodian information
    setReserveDetails(prev => ({
      ...prev,
      custodianName: tempCustodianName,
      attestationFrequency: tempAttestationFreq,
      isConfigured: true
    }));
    
    // Reset temp form state
    setTempCustodianName('');
  };
  // --- END ADDED HANDLER FUNCTIONS ---

  // Function to render the progress steps
  const renderProgressSteps = () => {
    // ... (keep the existing renderProgressSteps function as it was) ...
    const steps = ['Token Details', 'Supply & Metadata', 'Permissions', 'Proof of Reserves', 'Finalization'];
    const currentStepIndex = steps.findIndex(step =>
        step.toLowerCase().replace(/ & | /g, '-').includes(issuanceScreen.split('-')[0])
     || (issuanceScreen === 'proof-reserves' && step === 'Proof of Reserves')
     || (issuanceScreen === 'finalization' && step === 'Finalization')
    );
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <React.Fragment key={step}>
              <div className="w-1/5 text-center">
                <div className={`rounded-full h-10 w-10 flex items-center justify-center mx-auto ${ index < currentStepIndex ? 'bg-green-600 text-white' : (index === currentStepIndex ? 'bg-emtech-gold text-white' : 'bg-gray-200 text-gray-600') }`}>
                  {index < currentStepIndex ? '✓' : index + 1}
                </div>
                <p className={`mt-1 text-sm ${index <= currentStepIndex ? 'font-medium text-gray-800' : 'text-gray-500'}`}>{step}</p>
              </div>
              {index < steps.length - 1 && ( <div className={`flex-1 h-1 ${index < currentStepIndex ? 'bg-green-600' : 'bg-gray-200'}`}></div> )}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };


  // Render different screens based on issuanceScreen state
  return (
    <div className="p-8">
      <div className="bg-white p-6 rounded shadow max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Issue New Tokens</h1>
          <button className="px-3 py-1 rounded text-white hover:opacity-90 bg-gray-800 text-sm" onClick={onBack} > Back to Dashboard </button>
        </div>

        {renderProgressSteps()}

        {/* --- Screen 1: Token Details --- */}
        {issuanceScreen === 'token-details' && (
          // ... (keep existing code for Step 1) ...
           <div>
             <h2 className="text-xl font-medium mb-4 text-gray-800">Token Details</h2>
             <p className="text-gray-600 mb-6">Define the basic information for your new token.</p>
             <div className="space-y-4">
               <div> <label className="block mb-1 font-medium">Token Name <span className="text-red-600">*</span></label> <input type="text" className="w-full p-2 border rounded" placeholder="e.g. My Stablecoin" value={tokenDetails.name} onChange={(e) => setTokenDetails({...tokenDetails, name: e.target.value})} /> <p className="text-xs text-gray-500 mt-1">Full name of your token (e.g. "US Dollar Coin")</p> </div>
               <div> <label className="block mb-1 font-medium">Token Symbol <span className="text-red-600">*</span></label> <input type="text" className="w-full p-2 border rounded" placeholder="e.g. USDC" value={tokenDetails.symbol} onChange={(e) => setTokenDetails({...tokenDetails, symbol: e.target.value})} /> <p className="text-xs text-gray-500 mt-1">Short symbol for your token (e.g. "USDC")</p> </div>
               <div> <label className="block mb-1 font-medium">Select Blockchain <span className="text-red-600">*</span></label> <select className="w-full p-2 border rounded" value={tokenDetails.blockchain} onChange={(e) => setTokenDetails({...tokenDetails, blockchain: e.target.value})} > <option value="">Select Blockchain</option> <option value="Ethereum">Ethereum</option> <option value="Hedera">Hedera</option> <option value="Solana">Solana</option> <option value="Polygon">Polygon</option> <option value="Stellar">Stellar</option> </select> <p className="text-xs text-gray-500 mt-1">The blockchain network where this token will be issued.</p> </div>
               <div className="flex justify-end mt-8"> <button className="px-4 py-2 rounded text-white hover:opacity-90 bg-emtech-gold disabled:opacity-50" onClick={() => setIssuanceScreen('supply-metadata')} disabled={!tokenDetails.name || !tokenDetails.symbol || !tokenDetails.blockchain} > Next Step </button> </div>
             </div>
           </div>
        )}

        {/* --- Screen 2: Supply & Metadata --- */}
        {issuanceScreen === 'supply-metadata' && (
          // ... (keep existing code for Step 2) ...
           <div>
             <h2 className="text-xl font-medium mb-4 text-gray-800">Supply and Metadata</h2>
             <p className="text-gray-600 mb-6">Configure token supply settings and metadata.</p>
             <div className="space-y-4">
               <div> <label className="block mb-1 font-medium">Initial Supply <span className="text-red-600">*</span></label> <input type="number" min="0" className="w-full p-2 border rounded" placeholder="e.g. 1000000" value={supplyDetails.initialSupply} onChange={(e) => setSupplyDetails({...supplyDetails, initialSupply: e.target.value})} /> <p className="text-xs text-gray-500 mt-1">Number of tokens to be created initially</p> </div>
               <div> <label className="block mb-1 font-medium">Supply Type <span className="text-red-600">*</span></label> <div className="grid grid-cols-2 gap-4 mt-2"> <div className={`border rounded p-3 cursor-pointer ${supplyDetails.supplyType === 'finite' ? 'border-emtech-gold bg-yellow-50' : 'border-gray-300'}`} onClick={() => setSupplyDetails({...supplyDetails, supplyType: 'finite'})} > <div className="flex items-center"> <input type="radio" name="supplyType" className="mr-2 focus:ring-emtech-gold h-4 w-4 text-emtech-gold" checked={supplyDetails.supplyType === 'finite'} readOnly /> <div> <p className="font-medium">Finite Supply</p> <p className="text-xs text-gray-500">Fixed maximum token supply</p> </div> </div> </div> <div className={`border rounded p-3 cursor-pointer ${supplyDetails.supplyType === 'infinite' ? 'border-emtech-gold bg-yellow-50' : 'border-gray-300'}`} onClick={() => setSupplyDetails({...supplyDetails, supplyType: 'infinite'})} > <div className="flex items-center"> <input type="radio" name="supplyType" className="mr-2 focus:ring-emtech-gold h-4 w-4 text-emtech-gold" checked={supplyDetails.supplyType === 'infinite'} readOnly /> <div> <p className="font-medium">Infinite Supply</p> <p className="text-xs text-gray-500">No maximum supply limit</p> </div> </div> </div> </div> </div>
               <div> <label className="block mb-1 font-medium">Decimal Points <span className="text-red-600">*</span></label> <select className="w-full p-2 border rounded" value={supplyDetails.decimals} onChange={(e) => setSupplyDetails({...supplyDetails, decimals: e.target.value})} > <option value="18">18 (e.g. Ethereum standard)</option> <option value="8">8 (e.g. Bitcoin standard)</option> <option value="6">6 (e.g. USDC standard)</option> <option value="2">2 (e.g. 100.50)</option> <option value="0">0 (No decimal places, whole tokens only)</option> </select> <p className="text-xs text-gray-500 mt-1">How divisible the token will be (smaller units)</p> </div>
               <div> <label className="block mb-1 font-medium">Initial Value Definition</label> <input type="text" className="w-full p-2 border rounded" placeholder="e.g., 1 Token = 1 USD | 1 Token = 1 Ounce Gold" value={supplyDetails.valueDefinition} onChange={(e) => setSupplyDetails({...supplyDetails, valueDefinition: e.target.value})} /> <p className="text-xs text-gray-500 mt-1">Define what 1 unit of this token initially represents (optional).</p> </div>
               <div> <label className="block mb-1 font-medium">Metadata Implementation</label> <textarea className="w-full p-2 border rounded" rows="3" placeholder="Enter JSON schema or metadata description (optional)" value={supplyDetails.metadata} onChange={(e) => setSupplyDetails({...supplyDetails, metadata: e.target.value})} ></textarea> <p className="text-xs text-gray-500 mt-1">Additional data fields to store with the token or transactions.</p> </div>
               <div className="flex justify-between mt-8"> <button className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-50" onClick={() => setIssuanceScreen('token-details')} > Previous Step </button> <button className="px-4 py-2 rounded text-white hover:opacity-90 bg-emtech-gold disabled:opacity-50" onClick={() => setIssuanceScreen('permissions')} disabled={!supplyDetails.initialSupply || !supplyDetails.decimals } > Next Step </button> </div>
             </div>
           </div>
        )}

         {/* --- Screen 3: Permissions --- */}
         {issuanceScreen === 'permissions' && (
            // Replace placeholder with actual content
            <div>
              <h2 className="text-xl font-medium mb-4 text-gray-800">Permissions</h2>
              <p className="text-gray-600 mb-6">Configure token permissions and functional features.</p>

              <div className="space-y-6">
                {/* KYC Permissions */}
                <div className="border rounded-lg p-4 bg-gray-50">
                  <label className="flex items-center mb-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="mr-2 h-4 w-4 text-emtech-gold focus:ring-emtech-gold" // Added styling
                      checked={permissionDetails.kycEnabled}
                      onChange={(e) => setPermissionDetails({...permissionDetails, kycEnabled: e.target.checked})}
                    />
                    <div>
                      <p className="font-medium">KYC Permissions / Account Flags</p>
                      <p className="text-sm text-gray-600">Require accounts to be KYC verified before holding or transferring tokens</p>
                    </div>
                  </label>
                  {/* Conditional Sub-Options for KYC (Not connected to state yet) */}
                  {permissionDetails.kycEnabled && (
                    <div className="ml-6 mt-2 p-3 border rounded bg-white">
                      <p className="text-sm font-medium mb-2">Select KYC Requirements:</p>
                      <div className="space-y-2">
                        <label className="flex items-center"> <input type="checkbox" className="mr-2" /> <span className="text-sm">Basic Identity Verification</span> </label>
                        <label className="flex items-center"> <input type="checkbox" className="mr-2" /> <span className="text-sm">Enhanced Due Diligence</span> </label>
                        <label className="flex items-center"> <input type="checkbox" className="mr-2" /> <span className="text-sm">Accredited Investor Status</span> </label>
                        <label className="flex items-center"> <input type="checkbox" className="mr-2" /> <span className="text-sm">Jurisdiction Restrictions</span> </label>
                      </div>
                    </div>
                  )}
                </div>

                {/* Fee Schedule */}
                <div className="border rounded-lg p-4 bg-gray-50">
                   <label className="flex items-center mb-3 cursor-pointer">
                     <input
                       type="checkbox"
                       className="mr-2 h-4 w-4 text-emtech-gold focus:ring-emtech-gold"
                       checked={permissionDetails.feeScheduleEnabled}
                       onChange={(e) => setPermissionDetails({...permissionDetails, feeScheduleEnabled: e.target.checked})}
                     />
                     <div>
                       <p className="font-medium">Fee Schedule</p>
                       <p className="text-sm text-gray-600">Apply transaction fees when tokens are transferred</p>
                     </div>
                   </label>
                   {/* Conditional Sub-Options for Fees (Not connected to state yet) */}
                   {permissionDetails.feeScheduleEnabled && (
                     <div className="ml-6 mt-2 p-3 border rounded bg-white">
                       <div className="space-y-3">
                         <div> <label className="block text-sm font-medium mb-1">Fee Recipient</label> <input type="text" className="w-full p-2 border rounded text-sm" placeholder="Enter wallet address" /> </div>
                         <div> <label className="block text-sm font-medium mb-1">Transaction Fee (%)</label> <input type="text" className="w-full p-2 border rounded text-sm" placeholder="e.g. 0.1%" /> </div>
                         <div> <label className="block text-sm font-medium mb-1">Fee Cap</label> <input type="text" className="w-full p-2 border rounded text-sm" placeholder="Maximum fee amount" /> </div>
                       </div>
                     </div>
                   )}
                 </div>

                {/* Pausable & Fungibility */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> {/* Use grid */}
                  {/* Pausable */}
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <label className="flex items-center mb-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="mr-2 h-4 w-4 text-emtech-gold focus:ring-emtech-gold"
                        checked={permissionDetails.pausable}
                        onChange={(e) => setPermissionDetails({...permissionDetails, pausable: e.target.checked})}
                      />
                      <div>
                        <p className="font-medium">Pausable Transactions</p>
                        <p className="text-sm text-gray-600">Ability to temporarily pause token transfers</p>
                      </div>
                    </label>
                  </div>
                  {/* Fungibility */}
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <p className="font-medium mb-2">Token Fungibility</p>
                    <div className="space-x-4">
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="fungibility" // Group radios
                          className="mr-1 text-emtech-gold focus:ring-emtech-gold"
                          checked={permissionDetails.fungible}
                          onChange={() => setPermissionDetails({...permissionDetails, fungible: true})}
                        />
                        <span className="text-sm">Fungible</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="fungibility"
                          className="mr-1 text-emtech-gold focus:ring-emtech-gold"
                          checked={!permissionDetails.fungible}
                          onChange={() => setPermissionDetails({...permissionDetails, fungible: false})}
                        />
                        <span className="text-sm">Non-Fungible (NFT)</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Token Expiration */}
                <div className="border rounded-lg p-4 bg-gray-50">
                   <label className="block mb-2">
                     <span className="font-medium">Token Expiration</span>
                     <p className="text-sm text-gray-600">Set an expiration date for the token (optional)</p>
                   </label>
                   <input
                     type="date"
                     className="w-full p-2 border rounded"
                     min={new Date().toISOString().split('T')[0]} // Prevent past dates
                     value={permissionDetails.expiration}
                     onChange={(e) => setPermissionDetails({...permissionDetails, expiration: e.target.value})}
                   />
                 </div>

                {/* Role Assignments */}
                <div className="border rounded-lg p-4 bg-gray-50">
                   <label className="block mb-2">
                     <span className="font-medium">Role Assignments</span>
                     <p className="text-sm text-gray-600">Assign administrative roles for this token</p>
                   </label>
                   {/* Input form */}
                   <div className="flex space-x-2 items-center"> {/* Use items-center */}
                     <select
                       className="flex-1 p-2 border rounded"
                       value={selectedRole}
                       onChange={(e) => setSelectedRole(e.target.value)}
                     >
                       <option value="">Select Role</option>
                       <option value="Admin">Admin</option>
                       <option value="Minter">Minter</option>
                       <option value="Burner">Burner</option>
                       <option value="Pauser">Pauser</option>
                       <option value="KYC Administrator">KYC Administrator</option>
                     </select>
                     <input
                       type="text"
                       className="flex-1 p-2 border rounded"
                       placeholder="Account address (e.g., 0x...)"
                       value={roleAddress}
                       onChange={(e) => setRoleAddress(e.target.value)}
                      />
                     {/* Attach handleAddRole to the button */}
                     <button
                       className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50"
                       onClick={handleAddRole}
                       disabled={!selectedRole || !roleAddress} // Disable if no role or address
                       type="button" // Explicitly set type to prevent form submission issues
                     >
                       Add
                     </button>
                   </div>

                   {/* Display added roles */}
                   <div className="mt-4 p-3 border rounded bg-white min-h-[50px]"> {/* Min height */}
                     {permissionDetails.roles.length === 0 ? (
                       <p className="text-sm text-gray-500 italic">No roles assigned yet. Add a role above.</p>
                     ) : (
                       <ul className="space-y-1 list-disc list-inside">
                         {permissionDetails.roles.map((roleItem, index) => (
                           <li key={index} className="text-sm">
                             <strong>{roleItem.role}:</strong> {roleItem.address}
                             {/* Add a remove button later if needed */}
                           </li>
                         ))}
                       </ul>
                     )}
                   </div>
                 </div>

              </div> {/* End of space-y-6 */}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8">
                 <button className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-50" onClick={() => setIssuanceScreen('supply-metadata')} > Previous Step </button>
                 <button className="px-4 py-2 rounded text-white hover:opacity-90 bg-emtech-gold" onClick={() => setIssuanceScreen('proof-reserves')} > Next Step </button>
               </div>
            </div>
         )}
         {/* --- End of Screen 3 --- */}


    {/* --- Screen 4: Proof of Reserves --- */}
    {issuanceScreen === 'proof-reserves' && (
       <div>
         <h2 className="text-xl font-medium mb-4 text-gray-800">Proof of Reserves</h2>
         <p className="text-gray-600 mb-6">Specify if your token is backed by real-world assets and how those assets are verified.</p>

         <div className="space-y-6">
           {/* Is Backed Asset Choice */}
           <div className="border rounded-lg p-4 bg-gray-50">
             <p className="font-medium mb-3">Is this token backed by real-world assets? <span className="text-red-600">*</span></p>
             <div className="grid grid-cols-2 gap-4">
               {/* Yes Option */}
               <div
                 className={`border rounded p-3 cursor-pointer ${reserveDetails.isBackedAsset ? 'border-emtech-gold bg-yellow-50' : 'border-gray-300'}`}
                 onClick={() => setReserveDetails({...reserveDetails, isBackedAsset: true, isConfigured: false})} // Reset configured status if changing
               >
                 <div className="flex items-center">
                   <input type="radio" name="isBacked" className="mr-2 focus:ring-emtech-gold h-4 w-4 text-emtech-gold" checked={reserveDetails.isBackedAsset} readOnly />
                   <div><p className="font-medium">Yes</p><p className="text-xs text-gray-500">Token is backed by verifiable reserves</p></div>
                 </div>
               </div>
               {/* No Option */}
               <div
                 className={`border rounded p-3 cursor-pointer ${!reserveDetails.isBackedAsset ? 'border-emtech-gold bg-yellow-50' : 'border-gray-300'}`}
                 onClick={() => setReserveDetails({ // Reset all reserve details if 'No' is selected
                   isBackedAsset: false, backingType: '', bankName: '', accountNumberLast4: '',
                   contractNetwork: '', contractAddress: '', custodianName: '', attestationFrequency: '',
                   isConfigured: true // If not backed, it's considered "configured" for validation purposes
                 })}
               >
                 <div className="flex items-center">
                   <input type="radio" name="isBacked" className="mr-2 focus:ring-emtech-gold h-4 w-4 text-emtech-gold" checked={!reserveDetails.isBackedAsset} readOnly />
                   <div><p className="font-medium">No</p><p className="text-xs text-gray-500">Token is not backed by reserves</p></div>
                 </div>
               </div>
             </div>
           </div>

           {/* Conditional: Backing Method Selection and Configuration */}
           {reserveDetails.isBackedAsset && (
             <div className="border rounded-lg p-4 bg-gray-50">
               <p className="font-medium mb-3">Select Reserve Backing Method <span className="text-red-600">*</span></p>

               {/* Display Confirmation Once Configured */}
               {reserveDetails.isConfigured && (
                 <div className='mb-4 p-3 bg-green-100 border border-green-300 text-green-800 rounded text-sm'>
                   <p className='font-medium'>Reserve Method Configured:</p>
                   {reserveDetails.backingType === 'bank' && <p>Bank Account ({reserveDetails.bankName} ending in {reserveDetails.accountNumberLast4})</p>}
                   {reserveDetails.backingType === 'smartcontract' && <p>Smart Contract ({reserveDetails.contractNetwork}: {reserveDetails.contractAddress.substring(0,6)}...{reserveDetails.contractAddress.substring(reserveDetails.contractAddress.length - 4)})</p>}
                   {reserveDetails.backingType === 'custodian' && <p>Custodian ({reserveDetails.custodianName} - {reserveDetails.attestationFrequency} Attestation)</p>}
                   <button
                     onClick={() => setReserveDetails(prev => ({ ...prev, isConfigured: false }))} // Allow editing
                     className="text-xs text-blue-600 hover:underline mt-1"
                   >
                     Edit Configuration
                   </button>
                 </div>
               )}

               {/* Backing Method Options (Disabled if already configured) */}
               <div className={`space-y-3 ${reserveDetails.isConfigured ? 'opacity-50 pointer-events-none' : ''}`}> {/* Disable options once configured */}
                  {/* Option 1: Bank Account */}
                  <div className={`border rounded p-3 cursor-pointer ${reserveDetails.backingType === 'bank' ? 'border-emtech-gold bg-yellow-50' : 'border-gray-300 bg-white'}`} onClick={() => !reserveDetails.isConfigured && setReserveDetails({...reserveDetails, backingType: 'bank'})} >
                    <div className="flex">
                      <input type="radio" name="backingType" className="mr-2 mt-1 focus:ring-emtech-gold h-4 w-4 text-emtech-gold" checked={reserveDetails.backingType === 'bank'} readOnly />
                      <div>
                        <p className="font-medium">Bank Account Connection</p>
                        <p className="text-sm text-gray-600">Link a traditional bank account to verify reserves</p>
                        {/* Bank Details Sub-Form (shown only when this type is selected AND not yet configured) */}
                        {reserveDetails.backingType === 'bank' && !reserveDetails.isConfigured && (
                          <form onSubmit={handleConnectBank} className="mt-3 p-3 border rounded bg-white">
                            <div className="space-y-3">
                              <div> <label className="block text-sm font-medium mb-1">Bank Name</label> <input type="text" value={tempBankName} onChange={(e) => setTempBankName(e.target.value)} className="w-full p-2 border rounded text-sm" placeholder="e.g. JP Morgan Chase" required /> </div>
                              <div> <label className="block text-sm font-medium mb-1">Account Number</label> <input type="text" value={tempAccountNumber} onChange={(e) => setTempAccountNumber(e.target.value)} className="w-full p-2 border rounded text-sm" placeholder="Enter full account number" required /> </div>
                              <button type="submit" className="mt-2 px-4 py-2 rounded text-white hover:opacity-90 bg-emtech-gold"> Connect Bank Account </button>
                            </div>
                          </form>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Option 2: Smart Contract */}
                  <div className={`border rounded p-3 cursor-pointer ${reserveDetails.backingType === 'smartcontract' ? 'border-emtech-gold bg-yellow-50' : 'border-gray-300 bg-white'}`} onClick={() => !reserveDetails.isConfigured && setReserveDetails({...reserveDetails, backingType: 'smartcontract'})} >
                    <div className="flex">
                       <input type="radio" name="backingType" className="mr-2 mt-1 focus:ring-emtech-gold h-4 w-4 text-emtech-gold" checked={reserveDetails.backingType === 'smartcontract'} readOnly />
                       <div>
                         <p className="font-medium">On-Chain Asset with Smart Contract</p>
                         <p className="text-sm text-gray-600">Link to on-chain assets via smart contract for automated verification</p>
                         {reserveDetails.backingType === 'smartcontract' && !reserveDetails.isConfigured && (
                           <form onSubmit={handleConnectContract} className="mt-3 p-3 border rounded bg-white">
                             <div className="space-y-3">
                               <div> <label className="block text-sm font-medium mb-1">Blockchain Network</label> <select value={tempContractNetwork} onChange={(e)=> setTempContractNetwork(e.target.value)} className="w-full p-2 border rounded text-sm"> <option>Ethereum</option> <option>Polygon</option> <option>BNB Chain</option> <option>Solana</option> <option>Avalanche</option> </select> </div>
                               <div> <label className="block text-sm font-medium mb-1">Smart Contract Address</label> <input type="text" value={tempContractAddress} onChange={(e)=> setTempContractAddress(e.target.value)} className="w-full p-2 border rounded text-sm" placeholder="0x..." required /> </div>
                               <button type="submit" className="mt-2 px-4 py-2 rounded text-white hover:opacity-90 bg-emtech-gold"> Connect Smart Contract </button>
                             </div>
                           </form>
                         )}
                       </div>
                     </div>
                  </div>

                  {/* Option 3: Custodian */}
                  <div className={`border rounded p-3 cursor-pointer ${reserveDetails.backingType === 'custodian' ? 'border-emtech-gold bg-yellow-50' : 'border-gray-300 bg-white'}`} onClick={() => !reserveDetails.isConfigured && setReserveDetails({...reserveDetails, backingType: 'custodian'})} >
                     <div className="flex">
                       <input type="radio" name="backingType" className="mr-2 mt-1 focus:ring-emtech-gold h-4 w-4 text-emtech-gold" checked={reserveDetails.backingType === 'custodian'} readOnly />
                       <div>
                         <p className="font-medium">Third-Party Custodian Verification</p>
                         <p className="text-sm text-gray-600">Use a trusted third-party custodian to verify and attest to reserves</p>
                         {reserveDetails.backingType === 'custodian' && !reserveDetails.isConfigured && (
                           <form onSubmit={handleSetupCustodian} className="mt-3 p-3 border rounded bg-white">
                             <div className="space-y-3">
                               <div> <label className="block text-sm font-medium mb-1">Custodian Name</label> <input type="text" value={tempCustodianName} onChange={(e)=> setTempCustodianName(e.target.value)} className="w-full p-2 border rounded text-sm" placeholder="e.g. BitGo, Fireblocks, etc." required/> </div>
                               <div> <label className="block text-sm font-medium mb-1">Attestation Frequency</label> <select value={tempAttestationFreq} onChange={(e)=> setTempAttestationFreq(e.target.value)} className="w-full p-2 border rounded text-sm"> <option>Daily</option> <option>Weekly</option> <option>Monthly</option> <option>Quarterly</option> </select> </div>
                               <button type="submit" className="mt-2 px-4 py-2 rounded text-white hover:opacity-90 bg-emtech-gold"> Setup Custodian Verification </button>
                             </div>
                           </form>
                         )}
                       </div>
                     </div>
                  </div>
                </div> {/* End of space-y-3 for options */}
             </div> // End of conditional div based on isBackedAsset
           )}

           {/* Navigation Buttons */}
           <div className="flex justify-between mt-8">
              <button className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-50" onClick={() => setIssuanceScreen('permissions')} > Previous Step </button>
              <button
                className="px-4 py-2 rounded text-white hover:opacity-90 bg-emtech-gold disabled:opacity-50"
                onClick={() => setIssuanceScreen('finalization')}
                // Disable if assets ARE backed but configuration is NOT complete
                disabled={reserveDetails.isBackedAsset && !reserveDetails.isConfigured}
              >
                Next Step
              </button>
            </div>
         </div> {/* End of space-y-6 */}
       </div> // End of main content div for this screen
     )}
     {/* --- End of Screen 4 --- */}


      {/* --- Screen 5: Finalization --- */}
     {issuanceScreen === 'finalization' && (
         <div>
           <h2 className="text-xl font-medium mb-4 text-gray-800">Finalization</h2>
           <p className="text-gray-600 mb-6">Review details below and click 'Issue Token' to finalize.</p>
           <div className='p-4 border rounded bg-gray-50 mb-6 space-y-2 text-sm'>
             {/* Review Details */}
             <p><strong>Name:</strong> {tokenDetails.name || 'N/A'}</p>
             <p><strong>Symbol:</strong> {tokenDetails.symbol || 'N/A'}</p>
             <p><strong>Blockchain:</strong> {tokenDetails.blockchain || 'N/A'}</p>
             <p><strong>Amount to Issue:</strong> {supplyDetails.initialSupply ? parseFloat(supplyDetails.initialSupply).toLocaleString() : 'N/A'}</p>
             <p><strong>Value Definition:</strong> {supplyDetails.valueDefinition || 'N/A'}</p>
             <p><strong>Supply Type:</strong> {supplyDetails.supplyType === 'finite' ? 'Finite' : 'Infinite'}</p>
             <p><strong>Decimals:</strong> {supplyDetails.decimals}</p>
             <p><strong>KYC Enabled:</strong> {permissionDetails.kycEnabled ? 'Yes' : 'No'}</p>
             <p><strong>Fees Enabled:</strong> {permissionDetails.feeScheduleEnabled ? 'Yes' : 'No'}</p>
             <p><strong>Pausable:</strong> {permissionDetails.pausable ? 'Yes' : 'No'}</p>
             <p><strong>Fungible:</strong> {permissionDetails.fungible ? 'Yes' : 'No'}</p>
             <p><strong>Expiration:</strong> {permissionDetails.expiration || 'None'}</p>
              <p><strong>Roles:</strong></p>
              {permissionDetails.roles.length > 0 ? ( <ul className='list-disc list-inside ml-4'>{permissionDetails.roles.map((r, i) => <li key={i}>{r.role}: {r.address}</li>)}</ul> ) : ( <p className='ml-4 italic'>None specified</p> )}
             {/* Add Proof of Reserve Details */}
             <p><strong>Asset Backed:</strong> {reserveDetails.isBackedAsset ? 'Yes' : 'No'}</p>
             {reserveDetails.isBackedAsset && reserveDetails.isConfigured && (
                <div className='ml-4'>
                  <p><strong>Backing Type:</strong> {reserveDetails.backingType}</p>
                  {reserveDetails.backingType === 'bank' && <p>Bank Name: {reserveDetails.bankName}, Account ending: {reserveDetails.accountNumberLast4}</p>}
                  {reserveDetails.backingType === 'smartcontract' && <p>Network: {reserveDetails.contractNetwork}, Address: {reserveDetails.contractAddress}</p>}
                  {reserveDetails.backingType === 'custodian' && <p>Custodian: {reserveDetails.custodianName}, Frequency: {reserveDetails.attestationFrequency}</p>}
                </div>
             )}
             {reserveDetails.isBackedAsset && !reserveDetails.isConfigured && <p className='ml-4 text-red-600'>Reserve details not configured!</p>}
           </div>
           {/* Buttons */}
           <div className="flex justify-between mt-8">
              <button className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-50" onClick={() => setIssuanceScreen('proof-reserves')} > Previous Step </button>
              <button className="px-4 py-2 rounded text-white hover:opacity-90 bg-green-600" 
              onClick={() => {
                const amountToIssue = parseFloat(supplyDetails.initialSupply || 0);
                const symbolToIssue = tokenDetails.symbol; // Use symbol from tokenDetails state

                if (amountToIssue > 0 && symbolToIssue && tokenDetails.name && tokenDetails.blockchain) { // Added checks for name/blockchain
                  // Create an object with all relevant details
                  const newTokenData = {
                    name: tokenDetails.name,
                    symbol: symbolToIssue,
                    blockchain: tokenDetails.blockchain,
                    initialSupply: amountToIssue,
                    decimals: supplyDetails.decimals,
                    valueDefinition: supplyDetails.valueDefinition,
                    supplyType: supplyDetails.supplyType,
                    // Add other details like permissions if needed later
                  };

                  console.log("Calling onIssue with:", newTokenData);
                  onIssue(newTokenData); // Call the function passed from TokenDashboard with the data object
                } else {
                   alert("Please ensure Name, Symbol, Blockchain, and Initial Supply are valid.");
                }
              }}
            >
                Issue Token
              </button>
            </div>
         </div>
     )}

  </div> {/* End of white card container */}
</div> // End of outer padding div
  );
};

export default TokenIssuanceWizard;