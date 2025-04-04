import React from 'react';

// Helper function to display boolean values nicely
const formatBoolean = (value) => (value ? 'Yes' : 'No');

// Helper component for consistent label-value display
// It avoids rendering if the value is empty, null, or undefined
const DetailItem = ({ label, value }) => {
  // Check for null, undefined, or empty string specifically
  if (value === undefined || value === null || value === '') {
    return null;
  }
  return (
    <div className="mb-2">
      <span className="font-semibold text-gray-600">{label}:</span>
      {/* Use block or inline-block for potentially long values like addresses */}
      <span className="ml-2 text-gray-800 break-words">{String(value)}</span>
    </div>
  );
};

// Helper component for rendering sections with consistent styling
const DetailSection = ({ title, children }) => {
  // Only render section if it has children to display
  const childContent = React.Children.toArray(children).filter(Boolean);
  if (childContent.length === 0) {
    return null;
  }

  return (
    <div className="mb-6 p-4 border rounded bg-gray-50">
      <h3 className="text-lg font-semibold border-b pb-2 mb-3 text-gray-700">{title}</h3>
      <div className="space-y-1 text-sm">
        {childContent}
      </div>
    </div>
  );
};


// The main component to display asset details
const AssetDetailView = ({ asset, hardcodedDetailsMap, onBack }) => {

  // Determine if the asset was created via the wizard
  const isWizard = asset.isWizardIssued;
  // Get the relevant details object: wizardData for wizard-issued, or lookup in hardcoded map otherwise
  const details = isWizard ? asset.wizardData : (hardcodedDetailsMap ? hardcodedDetailsMap[asset.id] : null);

  // Handle cases where details might be unexpectedly missing
  if (!details && isWizard) {
      console.error("Wizard data is missing for wizard-issued asset:", asset.id);
  }
  if (!details && !isWizard) {
      console.error("Hardcoded details not found for asset ID:", asset.id);
      // You might want a more user-friendly message if this happens
  }

  // Always use the live balance from the main asset object passed in props
  const currentBalance = asset.balance;
  const displaySymbol = asset.symbol;

  return (
    <div className="p-8">
      {/* --- Back Button --- */}
      <button
        className="mb-4 px-3 py-1 rounded text-white hover:opacity-90 bg-gray-800 text-sm"
        onClick={onBack} // Calls the function passed from TokenDashboard
      >
        &larr; Back to Dashboard
      </button>

      {/* --- Main Content Card --- */}
      <div className="bg-white p-6 rounded shadow max-w-4xl mx-auto">
        {/* --- Header --- */}
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Asset Details</h1>
        <h2 className="text-xl font-semibold text-gray-700 mb-6 border-b pb-2">
          {asset.label} ({displaySymbol}) {/* Use label from main asset object */}
        </h2>

        {/* --- Current Status Section (Common to all assets) --- */}
        <DetailSection title="Current Status">
           {/* Use toLocaleString for formatting the number with commas */}
           <DetailItem label="Current Balance" value={`${currentBalance.toLocaleString()} ${displaySymbol}`} />
           {/* Display basic info available on main asset object for context */}
           <DetailItem label="Blockchain" value={asset.blockchain} />
           <DetailItem label="Supply Model (on Card)" value={asset.supply} />
           <DetailItem label="Description (on Card)" value={asset.description} />
        </DetailSection>

        {/* --- Conditional Rendering based on asset type --- */}

        {/* === WIZARD-ISSUED TOKEN DETAILS === */}
        {isWizard && details && (
          <>
            {/* Display data based on the structure stored in asset.wizardData */}
            <DetailSection title="Token Details (Wizard Config)">
              <DetailItem label="Token Name" value={details.tokenDetails?.name} />
              <DetailItem label="Token Symbol" value={details.tokenDetails?.symbol} />
              <DetailItem label="Blockchain" value={details.tokenDetails?.blockchain} />
            </DetailSection>

            <DetailSection title="Supply & Metadata (Wizard Config)">
              {/* Use toLocaleString for initial supply too */}
              <DetailItem label="Initial Supply Issued" value={details.supplyDetails?.initialSupply?.toLocaleString()} />
              <DetailItem label="Supply Type" value={details.supplyDetails?.supplyType} />
              <DetailItem label="Decimal Points" value={details.supplyDetails?.decimals} />
              <DetailItem label="Initial Value Definition" value={details.supplyDetails?.valueDefinition} />
              <DetailItem label="Metadata Implementation" value={details.supplyDetails?.metadata} />
            </DetailSection>

            <DetailSection title="Permissions (Wizard Config)">
              <DetailItem label="KYC Enabled" value={formatBoolean(details.permissionDetails?.kycEnabled)} />
              <DetailItem label="Fee Schedule Enabled" value={formatBoolean(details.permissionDetails?.feeScheduleEnabled)} />
              <DetailItem label="Pausable Transactions" value={formatBoolean(details.permissionDetails?.pausable)} />
              <DetailItem label="Fungible" value={formatBoolean(details.permissionDetails?.fungible)} />
              <DetailItem label="Token Expiration" value={details.permissionDetails?.expiration || 'None'} />
              {/* Render the list of assigned roles if any exist */}
              {details.permissionDetails?.roles && details.permissionDetails.roles.length > 0 && (
                 <div className="mt-3">
                    <p className="font-semibold text-gray-600 mb-1">Assigned Roles:</p>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                       {details.permissionDetails.roles.map((roleItem, index) => (
                          <li key={index}><strong>{roleItem.role}:</strong> {roleItem.address}</li>
                       ))}
                    </ul>
                 </div>
              )}
            </DetailSection>

            <DetailSection title="Proof of Reserves (Wizard Config)">
               <DetailItem label="Asset Backed" value={formatBoolean(details.reserveDetails?.isBackedAsset)} />
               {/* Only show specific reserve details if asset IS backed */}
               {details.reserveDetails?.isBackedAsset && (
                  <>
                     <DetailItem label="Backing Type" value={details.reserveDetails?.backingType} />
                     {/* Show specific fields based on the chosen backing type */}
                     {details.reserveDetails.backingType === 'bank' && (
                        <>
                           <DetailItem label="Bank Name" value={details.reserveDetails.bankName} />
                           <DetailItem label="Account (Last 4)" value={details.reserveDetails.accountNumberLast4} />
                        </>
                     )}
                     {details.reserveDetails.backingType === 'smartcontract' && (
                        <>
                           <DetailItem label="Contract Network" value={details.reserveDetails.contractNetwork} />
                           <DetailItem label="Contract Address" value={details.reserveDetails.contractAddress} />
                        </>
                     )}
                     {details.reserveDetails.backingType === 'custodian' && (
                        <>
                           <DetailItem label="Custodian Name" value={details.reserveDetails.custodianName} />
                           <DetailItem label="Attestation Frequency" value={details.reserveDetails.attestationFrequency} />
                        </>
                     )}
                  </>
               )}
            </DetailSection>
          </>
        )}

        {/* === HARDCODED TOKEN DETAILS === */}
        {!isWizard && details && (
          <>
            {/* Display data based on the structure defined in hardcodedAssetDetails */}
            <DetailSection title="Official Information">
               <DetailItem label="Official Name" value={details.officialName} />
               <DetailItem label="Issued By" value={details.issuer} />
               <DetailItem label="Asset Type" value={details.assetType} />
                {/* Render website as a clickable link if available */}
                {details.website && details.website !== '#' && (
                    <div className="mb-2">
                      <span className="font-semibold text-gray-600">Website:</span>
                      <a href={details.website} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-600 hover:underline break-all">{details.website}</a>
                    </div>
                )}
            </DetailSection>

            <DetailSection title="Features & Reserves">
                <DetailItem label="Reserve Info" value={details.reserveInfo} />
                 {/* Render the list of features if any exist */}
                 {details.features && details.features.length > 0 && (
                     <div className="mt-3">
                        <p className="font-semibold text-gray-600 mb-1">Key Features:</p>
                        <ul className="list-disc list-inside ml-4 space-y-1">
                           {details.features.map((feature, index) => ( <li key={index}>{feature}</li> ))}
                        </ul>
                     </div>
                 )}
            </DetailSection>
          </>
        )}

        {/* Fallback message if details couldn't be loaded */}
        {!details && (
            <p className="text-red-500 mt-4">Could not load detailed information for this asset.</p>
        )}

      </div> {/* End Content Card */}
    </div> // End Outer Padding Div
  );
};

export default AssetDetailView;