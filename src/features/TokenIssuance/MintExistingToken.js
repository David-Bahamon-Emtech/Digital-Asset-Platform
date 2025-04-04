import React, { useState } from 'react';

/**
 * Component providing a form to mint additional units of an existing token type.
 * It allows the user to select an asset from the provided list, specify an amount
 * and an optional reason for minting. Includes a confirmation step before executing
 * the mint action via a callback.
 *
 * @param {object} props - Component props.
 * @param {Array} props.assets - The list of existing assets available for minting.
 * @param {function} props.onMint - Callback function executed after user confirmation. Passes an object { assetId, amount, reason } to the parent component (TokenDashboard).
 * @param {function} props.onBack - Callback function to navigate back to the previous view.
 */
const MintExistingToken = ({ assets = [], onMint, onBack }) => {
  // State for managing form inputs
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [amountToMint, setAmountToMint] = useState('');
  const [mintReason, setMintReason] = useState('');

  // Handles the submission of the minting form.
  const handleMintSubmit = (event) => {
    event.preventDefault(); // Prevent default page refresh

    // Validate inputs
    const amount = parseFloat(amountToMint);
    if (!selectedAssetId) {
      alert("Please select an asset to mint.");
      return;
    }
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid positive amount to mint.");
      return;
    }

    const assetToMint = assets.find(asset => asset.id === selectedAssetId);
    if (!assetToMint) {
      alert("Error: Selected asset details not found."); // Should ideally not happen if assets prop is correct
      return;
    }

    // Show simple confirmation dialog
    const confirmationMessage = `
    Please confirm minting:
    -------------------------
    Asset: ${assetToMint.label} (${assetToMint.symbol})
    Amount: ${amount.toLocaleString()}
    Reason: ${mintReason || 'N/A'}
    -------------------------
    Current Balance: ${assetToMint.balance.toLocaleString()}
    New Balance: ${(assetToMint.balance + amount).toLocaleString()}
  `;

    if (window.confirm(confirmationMessage)) {
      // Call parent handler if confirmed
      onMint({
        assetId: selectedAssetId,
        amount: amount,
        reason: mintReason
      });
      // Navigation/clearing form is handled by the parent component
    }
    // No action needed if user cancels confirm dialog
  };

  // Render the form UI
  return (
    <div className="p-8">
      <div className="bg-white p-6 rounded shadow max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 border-b pb-3">
          <h1 className="text-2xl font-bold text-gray-800">Mint Existing Token</h1>
          <button className="px-3 py-1 rounded text-white hover:opacity-90 bg-gray-800 text-sm" onClick={onBack}>
            &larr; Back
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleMintSubmit}>
          <div className="space-y-4">

            {/* Asset Selection */}
            <div>
              <label htmlFor="assetSelect" className="block mb-1 font-medium text-gray-700">Select Token to Mint <span className="text-red-600">*</span></label>
              <select
                id="assetSelect"
                className="w-full p-2 border rounded bg-white"
                value={selectedAssetId}
                onChange={(e) => setSelectedAssetId(e.target.value)}
                required
              >
                <option value="" disabled>-- Select an Asset --</option>
                {assets.map(asset => (
                  <option key={asset.id} value={asset.id}>
                    {asset.label} ({asset.symbol}) - Bal: {asset.balance.toLocaleString()}
                  </option>
                ))}
              </select>
            </div>

            {/* Amount Input */}
            <div>
              <label htmlFor="mintAmount" className="block mb-1 font-medium text-gray-700">Amount to Mint <span className="text-red-600">*</span></label>
              <input
                id="mintAmount"
                type="number"
                className="w-full p-2 border rounded"
                placeholder="e.g., 10000"
                value={amountToMint}
                onChange={(e) => setAmountToMint(e.target.value)}
                min="1" // Ensure positive amount
                required
              />
              <p className="text-xs text-gray-500 mt-1">Enter the number of new tokens to create.</p>
            </div>

            {/* Reason Input */}
            <div>
              <label htmlFor="mintReason" className="block mb-1 font-medium text-gray-700">Reason / Reference (Optional)</label>
              <input
                id="mintReason"
                type="text"
                className="w-full p-2 border rounded"
                placeholder="e.g., Fulfilling order #123"
                value={mintReason}
                onChange={(e) => setMintReason(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">Enter a reason for this minting operation for audit purposes.</p>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                className="w-full px-5 py-2 rounded text-white hover:opacity-90 bg-emtech-gold disabled:opacity-50"
                disabled={!selectedAssetId || !amountToMint || parseFloat(amountToMint) <= 0}
              >
                Preview & Mint Tokens
              </button>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
};

export default MintExistingToken;