import React, { useState } from 'react';

// This component handles the multi-step token issuance process
// It receives an 'onBack' function prop AND an 'onIssue' function prop
const TokenIssuanceWizard = ({ onBack, onIssue }) => { // <-- Added onIssue prop
  // State for the current step within the wizard
  const [issuanceScreen, setIssuanceScreen] = useState('token-details'); // Start at step 1

  // State for the form data (copied from original snippet)
  const [tokenDetails, setTokenDetails] = useState({ name: '', symbol: '', tokenId: '' });
  const [supplyDetails, setSupplyDetails] = useState({ initialSupply: '', supplyType: 'finite', decimals: '18', metadata: '' });
  const [permissionDetails, setPermissionDetails] = useState({ kycEnabled: false, feeScheduleEnabled: false, pausable: true, fungible: true, expiration: '', roles: [] });
  const [reserveDetails, setReserveDetails] = useState({ isBackedAsset: false, backingType: '' });


  // Function to render the progress steps (copied and adapted slightly)
  const renderProgressSteps = () => {
    const steps = ['Token Details', 'Supply & Metadata', 'Permissions', 'Proof of Reserves', 'Finalization'];
    // Basic logic to find current step index - might need refinement based on exact state names later
    const currentStepIndex = steps.findIndex(step =>
        step.toLowerCase().replace(/ & | /g, '-').includes(issuanceScreen.split('-')[0])
     || (issuanceScreen === 'proof-reserves' && step === 'Proof of Reserves') // Handle specific case
     || (issuanceScreen === 'finalization' && step === 'Finalization')       // Handle specific case
    );

    return (
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <React.Fragment key={step}>
              <div className="w-1/5 text-center">
                {/* Step Circle */}
                <div className={`rounded-full h-10 w-10 flex items-center justify-center mx-auto ${
                  index < currentStepIndex ? 'bg-green-600 text-white' : (index === currentStepIndex ? 'bg-emtech-gold text-white' : 'bg-gray-200 text-gray-600')
                }`}>
                  {index < currentStepIndex ? '✓' : index + 1}
                </div>
                {/* Step Label */}
                <p className={`mt-1 text-sm ${index <= currentStepIndex ? 'font-medium text-gray-800' : 'text-gray-500'}`}>{step}</p>
              </div>
              {/* Connecting Line (except for last step) */}
              {index < steps.length - 1 && (
                <div className={`flex-1 h-1 ${index < currentStepIndex ? 'bg-green-600' : 'bg-gray-200'}`}>
                   {/* Simple line */}
                </div>
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
      {/* Use max-w- to control width, mx-auto to center */}
      <div className="bg-white p-6 rounded shadow max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Issue New Tokens</h1>
          {/* Use the onBack prop to go back */}
          <button
            className="px-3 py-1 rounded text-white hover:opacity-90 bg-gray-800 text-sm" // made button smaller
            onClick={onBack} // Call the function passed from TokenDashboard
          >
            Back to Dashboard
          </button>
        </div>

        {/* Render the progress steps */}
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
               {/* Token ID Select */}
               <div>
                 <label className="block mb-1 font-medium">Token ID Implementation <span className="text-red-600">*</span></label>
                 <select className="w-full p-2 border rounded" value={tokenDetails.tokenId} onChange={(e) => setTokenDetails({...tokenDetails, tokenId: e.target.value})} >
                   <option value="">Select Implementation</option>
                   <option value="standard">Standard Identifier</option>
                   <option value="custom">Custom Identifier</option>
                   <option value="sequential">Sequential Numbering</option>
                   <option value="uuid">UUID-based</option>
                 </select>
                 <p className="text-xs text-gray-500 mt-1">Method used to identify tokens in the system</p>
               </div>
               {/* Navigation Buttons */}
               <div className="flex justify-end mt-8">
                 <button className="px-4 py-2 rounded text-white hover:opacity-90 bg-emtech-gold disabled:opacity-50" onClick={() => setIssuanceScreen('supply-metadata')} disabled={!tokenDetails.name || !tokenDetails.symbol || !tokenDetails.tokenId} > Next Step </button>
               </div>
             </div>
           </div>
        )}

        {/* --- Screen 2: Supply & Metadata (Placeholder - Add actual inputs later) --- */}
        {issuanceScreen === 'supply-metadata' && (
           <div>
             <h2 className="text-xl font-medium mb-4 text-gray-800">Supply and Metadata</h2>
             <p className="text-gray-600 mb-6">Configure token supply settings and metadata.</p>
             {/* !!! Need to add the actual input field for Initial Supply here !!! */}
              {/* Example: */}
              <div>
                <label className="block mb-1 font-medium">Initial Supply <span className="text-red-600">*</span></label>
                <input
                  type="number" // Use type="number" for amount
                  className="w-full p-2 border rounded"
                  placeholder="e.g. 1000000"
                  value={supplyDetails.initialSupply}
                  onChange={(e) => setSupplyDetails({...supplyDetails, initialSupply: e.target.value})}
                />
                <p className="text-xs text-gray-500 mt-1">Number of tokens to be created initially</p>
              </div>
             {/* Add other inputs (supply type, decimals, metadata) from original code here later */}
             <div className="flex justify-between mt-8">
                <button className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-50" onClick={() => setIssuanceScreen('token-details')} > Previous Step </button>
                <button className="px-4 py-2 rounded text-white hover:opacity-90 bg-emtech-gold disabled:opacity-50" onClick={() => setIssuanceScreen('permissions')} disabled={!supplyDetails.initialSupply} > Next Step </button> {/* Basic disable check */}
              </div>
           </div>
        )}

         {/* --- Screen 3: Permissions (Placeholder) --- */}
         {issuanceScreen === 'permissions' && (
            <div>
              <h2 className="text-xl font-medium mb-4 text-gray-800">Permissions</h2>
              <p className="text-gray-600 mb-6">Configure token permissions. (Content TBD)</p>
              {/* Add form elements from original code here later */}
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
              {/* Add form elements from original code here later */}
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
              {/* Add a summary display of tokenDetails, supplyDetails etc. here */}
              <div className='p-4 border rounded bg-gray-50 mb-6 space-y-2 text-sm'>
                <p><strong>Name:</strong> {tokenDetails.name}</p>
                <p><strong>Symbol:</strong> {tokenDetails.symbol}</p>
                <p><strong>Amount to Issue:</strong> {supplyDetails.initialSupply}</p>
                {/* Add more details to review later */}
              </div>

              <div className="flex justify-between mt-8">
                 <button
                   className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-50"
                   onClick={() => setIssuanceScreen('proof-reserves')} // Go back a step
                 >
                   Previous Step
                 </button>
                 <button
                   className="px-4 py-2 rounded text-white hover:opacity-90 bg-green-600"
                   // --- UPDATED onClick HANDLER ---
                   onClick={() => {
                     // Get amount and symbol from state within this wizard
                     const amountToIssue = parseFloat(supplyDetails.initialSupply || 0); // Ensure it's a number
                     const symbolToIssue = tokenDetails.symbol;

                     if (amountToIssue > 0 && symbolToIssue) {
                        console.log(`Calling onIssue with: ${symbolToIssue}, ${amountToIssue}`);
                        onIssue(symbolToIssue, amountToIssue); // Call the function passed from TokenDashboard
                     } else {
                        alert("Invalid amount or symbol.");
                        // Don't navigate back if there was an error
                     }
                   }}
                   // --- END OF UPDATED onClick HANDLER ---
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