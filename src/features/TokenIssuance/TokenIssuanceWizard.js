import React, { useState } from 'react';

// This component handles the multi-step token issuance process
// It receives an 'onBack' function prop AND an 'onIssue' function prop
const TokenIssuanceWizard = ({ onBack, onIssue }) => {
  // State for the current step within the wizard
  const [issuanceScreen, setIssuanceScreen] = useState('token-details'); // Start at step 1

  // --- UPDATED State for tokenDetails (using blockchain instead of tokenId) ---
  const [tokenDetails, setTokenDetails] = useState({ name: '', symbol: '', blockchain: '' });
  // --- END UPDATE ---

  // Add valueDefinition to the supplyDetails state
const [supplyDetails, setSupplyDetails] = useState({ initialSupply: '', supplyType: 'finite', decimals: '18', metadata: '', valueDefinition: '' }); 
  const [permissionDetails, setPermissionDetails] = useState({ kycEnabled: false, feeScheduleEnabled: false, pausable: true, fungible: true, expiration: '', roles: [] });
  const [reserveDetails, setReserveDetails] = useState({ isBackedAsset: false, backingType: '' });


  // Function to render the progress steps
  const renderProgressSteps = () => {
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
                <div className={`rounded-full h-10 w-10 flex items-center justify-center mx-auto ${
                  index < currentStepIndex ? 'bg-green-600 text-white' : (index === currentStepIndex ? 'bg-emtech-gold text-white' : 'bg-gray-200 text-gray-600')
                }`}>
                  {index < currentStepIndex ? '✓' : index + 1}
                </div>
                <p className={`mt-1 text-sm ${index <= currentStepIndex ? 'font-medium text-gray-800' : 'text-gray-500'}`}>{step}</p>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-1 ${index < currentStepIndex ? 'bg-green-600' : 'bg-gray-200'}`}></div>
              )}
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
          <button
            className="px-3 py-1 rounded text-white hover:opacity-90 bg-gray-800 text-sm"
            onClick={onBack}
          >
            Back to Dashboard
          </button>
        </div>

        {renderProgressSteps()}

        {/* --- Screen 1: Token Details --- */}
        {issuanceScreen === 'token-details' && (
           <div>
             <h2 className="text-xl font-medium mb-4 text-gray-800">Token Details</h2>
             <p className="text-gray-600 mb-6">Define the basic information for your new token.</p>

             <div className="space-y-4">
               {/* Token Name Input */}
               <div>
                 <label className="block mb-1 font-medium">Token Name <span className="text-red-600">*</span></label>
                 <input type="text" className="w-full p-2 border rounded" placeholder="e.g. My Stablecoin" value={tokenDetails.name} onChange={(e) => setTokenDetails({...tokenDetails, name: e.target.value})} />
                 <p className="text-xs text-gray-500 mt-1">Full name of your token (e.g. "US Dollar Coin")</p>
               </div>
                {/* Token Symbol Input */}
               <div>
                 <label className="block mb-1 font-medium">Token Symbol <span className="text-red-600">*</span></label>
                 <input type="text" className="w-full p-2 border rounded" placeholder="e.g. USDC" value={tokenDetails.symbol} onChange={(e) => setTokenDetails({...tokenDetails, symbol: e.target.value})} />
                 <p className="text-xs text-gray-500 mt-1">Short symbol for your token (e.g. "USDC")</p>
               </div>

               {/* --- REMOVED Token ID Implementation Dropdown --- */}

               {/* --- ADDED Select Blockchain Dropdown --- */}
               <div>
                 <label className="block mb-1 font-medium">Select Blockchain <span className="text-red-600">*</span></label>
                 <select
                   className="w-full p-2 border rounded"
                   value={tokenDetails.blockchain} // Use the new state field
                   onChange={(e) => setTokenDetails({...tokenDetails, blockchain: e.target.value})} // Update the new state field
                 >
                   <option value="">Select Blockchain</option>
                   <option value="Ethereum">Ethereum</option>
                   <option value="Hedera">Hedera</option>
                   <option value="Solana">Solana</option>
                   <option value="Polygon">Polygon</option>
                   <option value="Stellar">Stellar</option>
                 </select>
                 <p className="text-xs text-gray-500 mt-1">The blockchain network where this token will be issued.</p>
               </div>
               {/* --- END OF ADDED BLOCK --- */}

               {/* Navigation Buttons */}
               <div className="flex justify-end mt-8">
                 {/* --- UPDATED disabled check --- */}
                 <button
                   className="px-4 py-2 rounded text-white hover:opacity-90 bg-emtech-gold disabled:opacity-50"
                   onClick={() => setIssuanceScreen('supply-metadata')}
                   disabled={!tokenDetails.name || !tokenDetails.symbol || !tokenDetails.blockchain} // Check blockchain instead of tokenId
                 >
                   Next Step
                 </button>
                 {/* --- END UPDATE --- */}
               </div>
             </div>
           </div>
        )}

{/* --- Screen 2: Supply & Metadata --- */}
{issuanceScreen === 'supply-metadata' && (
        <div>
          <h2 className="text-xl font-medium mb-4 text-gray-800">Supply and Metadata</h2>
          <p className="text-gray-600 mb-6">Configure token supply settings and metadata.</p>

          <div className="space-y-4">
            {/* Initial Supply Input */}
            <div>
              <label className="block mb-1 font-medium">Initial Supply <span className="text-red-600">*</span></label>
              <input
                type="number" // Use number input
                min="0" // Prevent negative numbers
                className="w-full p-2 border rounded"
                placeholder="e.g. 1000000"
                value={supplyDetails.initialSupply}
                onChange={(e) => setSupplyDetails({...supplyDetails, initialSupply: e.target.value})}
              />
              <p className="text-xs text-gray-500 mt-1">Number of tokens to be created initially</p>
            </div>

            {/* Supply Type Radio Buttons */}
            <div>
              <label className="block mb-1 font-medium">Supply Type <span className="text-red-600">*</span></label>
              <div className="grid grid-cols-2 gap-4 mt-2">
                {/* Finite Supply Option */}
                <div
                  className={`border rounded p-3 cursor-pointer ${supplyDetails.supplyType === 'finite' ? 'border-emtech-gold bg-yellow-50' : 'border-gray-300'}`} // Use emtech-gold for border
                  onClick={() => setSupplyDetails({...supplyDetails, supplyType: 'finite'})}
                >
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name="supplyType" // Added name attribute for grouping
                      className="mr-2 focus:ring-emtech-gold h-4 w-4 text-emtech-gold" // Added focus/color styling
                      checked={supplyDetails.supplyType === 'finite'}
                      readOnly // Radio buttons controlled by div click
                    />
                    <div>
                      <p className="font-medium">Finite Supply</p>
                      <p className="text-xs text-gray-500">Fixed maximum token supply</p>
                    </div>
                  </div>
                </div>
                {/* Infinite Supply Option */}
                <div
                  className={`border rounded p-3 cursor-pointer ${supplyDetails.supplyType === 'infinite' ? 'border-emtech-gold bg-yellow-50' : 'border-gray-300'}`}
                  onClick={() => setSupplyDetails({...supplyDetails, supplyType: 'infinite'})}
                >
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name="supplyType"
                      className="mr-2 focus:ring-emtech-gold h-4 w-4 text-emtech-gold"
                      checked={supplyDetails.supplyType === 'infinite'}
                      readOnly
                    />
                    <div>
                      <p className="font-medium">Infinite Supply</p>
                      <p className="text-xs text-gray-500">No maximum supply limit</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Decimal Points Select */}
            <div>
              <label className="block mb-1 font-medium">Decimal Points <span className="text-red-600">*</span></label>
              <select
                className="w-full p-2 border rounded"
                value={supplyDetails.decimals}
                onChange={(e) => setSupplyDetails({...supplyDetails, decimals: e.target.value})}
              >
                {/* Keep 18 as default maybe, or add "" option */}
                <option value="18">18 (e.g. Ethereum standard)</option>
                <option value="8">8 (e.g. Bitcoin standard)</option>
                <option value="6">6 (e.g. USDC standard)</option>
                <option value="2">2 (e.g. 100.50)</option>
                <option value="0">0 (No decimal places, whole tokens only)</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">How divisible the token will be (smaller units)</p>
            </div>
            {/* Token Value Definition Textarea */}
            <div>
              <label className="block mb-1 font-medium">Initial Value Definition</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                placeholder="e.g., 1 Token = 1 USD | 1 Token = 1 Ounce Gold"
                value={supplyDetails.valueDefinition} // Bind to new state field
                onChange={(e) => setSupplyDetails({...supplyDetails, valueDefinition: e.target.value})} // Update new state field
              />
              <p className="text-xs text-gray-500 mt-1">Define what 1 unit of this token initially represents (optional).</p>
            </div>
            {/* Metadata Implementation Textarea */}
            <div>
              <label className="block mb-1 font-medium">Metadata Implementation</label>
              <textarea
                className="w-full p-2 border rounded"
                rows="3"
                placeholder="Enter JSON schema or metadata description (optional)"
                value={supplyDetails.metadata}
                onChange={(e) => setSupplyDetails({...supplyDetails, metadata: e.target.value})}
              ></textarea>
              <p className="text-xs text-gray-500 mt-1">Additional data fields to store with the token or transactions.</p>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <button
                className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-50"
                onClick={() => setIssuanceScreen('token-details')} // Go back
              >
                Previous Step
              </button>
              <button
                className="px-4 py-2 rounded text-white hover:opacity-90 bg-emtech-gold disabled:opacity-50"
                onClick={() => setIssuanceScreen('permissions')} // Go next
                // Update disabled logic: Check initialSupply and decimals
                disabled={!supplyDetails.initialSupply || !supplyDetails.decimals }
              >
                Next Step
              </button>
            </div>
          </div>
        </div>
      )}
      {/* --- End of Screen 2 --- */}

         {/* --- Screen 3: Permissions (Placeholder) --- */}
         {issuanceScreen === 'permissions' && (
             <div>
               <h2 className="text-xl font-medium mb-4 text-gray-800">Permissions</h2>
               <p className="text-gray-600 mb-6">Configure token permissions. (Content TBD)</p>
               <div className="flex justify-between mt-8">
                  <button className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-50" onClick={() => setIssuanceScreen('supply-metadata')} > Previous Step </button>
                  <button className="px-4 py-2 rounded text-white hover:opacity-90 bg-emtech-gold" onClick={() => setIssuanceScreen('proof-reserves')} > Next Step </button>
                </div>
             </div>
         )}

          {/* --- Screen 4: Proof of Reserves (Placeholder) --- */}
         {issuanceScreen === 'proof-reserves' && (
             <div>
               <h2 className="text-xl font-medium mb-4 text-gray-800">Proof of Reserves</h2>
               <p className="text-gray-600 mb-6">Configure reserves backing. (Content TBD)</p>
                <div className="flex justify-between mt-8">
                  <button className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-50" onClick={() => setIssuanceScreen('permissions')} > Previous Step </button>
                  <button className="px-4 py-2 rounded text-white hover:opacity-90 bg-emtech-gold disabled:opacity-50" onClick={() => setIssuanceScreen('finalization')} > Next Step </button>
                </div>
             </div>
         )}

          {/* --- Screen 5: Finalization --- */}
         {issuanceScreen === 'finalization' && (
             <div>
               <h2 className="text-xl font-medium mb-4 text-gray-800">Finalization</h2>
               <p className="text-gray-600 mb-6">Review details below and click 'Issue Token' to finalize.</p>
               <div className='p-4 border rounded bg-gray-50 mb-6 space-y-2 text-sm'>
                 <p><strong>Name:</strong> {tokenDetails.name}</p>
                 <p><strong>Symbol:</strong> {tokenDetails.symbol}</p>
                 {/* Display selected blockchain */}
                 <p><strong>Blockchain:</strong> {tokenDetails.blockchain}</p>
                 <p><strong>Amount to Issue:</strong> {supplyDetails.initialSupply ? parseFloat(supplyDetails.initialSupply).toLocaleString() : 'N/A'}</p>
                 <p><strong>Value Definition:</strong> {supplyDetails.valueDefinition || 'Not specified'}</p>
                 {/* Add more details to review later */}
               </div>
               <div className="flex justify-between mt-8">
                  <button className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-50" onClick={() => setIssuanceScreen('proof-reserves')} > Previous Step </button>
                  <button className="px-4 py-2 rounded text-white hover:opacity-90 bg-green-600" onClick={() => { const amountToIssue = parseFloat(supplyDetails.initialSupply || 0); const symbolToIssue = tokenDetails.symbol; if (amountToIssue > 0 && symbolToIssue) { console.log(`Calling onIssue with: ${symbolToIssue}, ${amountToIssue}`); onIssue(symbolToIssue, amountToIssue); } else { alert("Invalid amount or symbol."); } }} > Issue Token </button>

                </div>
             </div>
         )}

      </div> {/* End of white card container */}
    </div> // End of outer padding div
  );
};

export default TokenIssuanceWizard;