import React from 'react';

// Helper functions (formatBoolean, DetailItem, DetailSection) remain the same...
// ... (Keep existing helper functions) ...
/**
 * Formats a boolean value into 'Yes' or 'No' string.
 * @param {boolean} value - The boolean value to format.
 * @returns {string} 'Yes' or 'No'.
 */
const formatBoolean = (value) => (value ? 'Yes' : 'No');

/**
 * Renders a single detail item with a label and value.
 * Optionally displays an icon next to the value.
 * Does not render if the value is null, undefined, or an empty string.
 * @param {object} props - Component props.
 * @param {string} props.label - The label for the detail item.
 * @param {string|number|boolean} props.value - The value to display.
 * @param {string} [props.iconSrc] - Optional URL source for an icon to display before the value.
 */
const DetailItem = ({ label, value, iconSrc }) => {
  // Do not render if value is missing
  if (value === undefined || value === null || value === '') {
    return null;
  }
  return (
    // Flex layout for label, optional icon, and value
    <div className="mb-2 flex items-start sm:items-center flex-col sm:flex-row">
      {/* Label */}
      <span className="font-semibold text-gray-600 w-full sm:w-40 flex-shrink-0 mb-1 sm:mb-0">{label}:</span>
      {/* Value container (includes optional icon) */}
      <div className="flex items-center ml-0 sm:ml-2 flex-grow">
        {/* Icon (if provided) */}
        {iconSrc && (
          <img src={iconSrc} alt={`${label} icon`} className="w-4 h-4 mr-1.5 flex-shrink-0" />
        )}
        {/* Value */}
        <span className="text-gray-800 break-words">{String(value)}</span>
      </div>
    </div>
  );
};

/**
 * Renders a styled section container with a title.
 * Only renders the section if it contains non-empty child elements.
 * @param {object} props - Component props.
 * @param {string} props.title - The title of the section.
 * @param {React.ReactNode} props.children - The content (typically DetailItems) to render within the section.
 */
const DetailSection = ({ title, children }) => {
  // Filter out any null/empty children to determine if section should render
  const childContent = React.Children.toArray(children).filter(Boolean);
  if (childContent.length === 0) {
    return null; // Don't render empty sections
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


/**
 * Displays the detailed view for a selected asset.
 * Differentiates between wizard-issued and hardcoded assets.
 * @param {object} props - Component props.
 * @param {object} props.asset - The asset object being viewed.
 * @param {object} props.hardcodedDetailsMap - Map of hardcoded details.
 * @param {function} props.onBack - Function to navigate back.
 * @param {object} props.assetLogosMap - Map of asset logos.
 * @param {object} props.blockchainLogosMap - Map of blockchain logos.
 */
const AssetDetailView = ({ asset, hardcodedDetailsMap, onBack, assetLogosMap, blockchainLogosMap }) => {

  const isWizard = asset.isWizardIssued;
  const details = isWizard ? asset.wizardData : (hardcodedDetailsMap ? hardcodedDetailsMap[asset.id] : null);

  // Handle missing data cases
  if (!details && isWizard) { console.error("Wizard data missing..."); }
  if (!details && !isWizard) { console.error("Hardcoded details missing..."); }

  const currentBalance = asset.balance;
  const displaySymbol = asset.symbol;
  const displayLabel = asset.label;

  return (
    <div className="p-8">
      {/* Back Button */}
      <button className="mb-4 px-3 py-1 rounded text-white hover:opacity-90 bg-gray-800 text-sm" onClick={onBack} >
        &larr; Back to Dashboard
      </button>

      {/* Main Content Card */}
      <div className="bg-white p-6 rounded shadow max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2"> Asset Details </h1>

        {/* Current Status Section */}
        <DetailSection title="Current Status">
           <DetailItem label="Current Balance" value={`${currentBalance.toLocaleString()} ${displaySymbol}`} />
           {(() => { const bn = asset.blockchain; const logo = bn && blockchainLogosMap ? blockchainLogosMap[bn] : null; return bn ? <DetailItem label="Blockchain" value={bn} iconSrc={logo} /> : null; })()}
           <DetailItem label="Supply Model (Card)" value={asset.supply} />
           <DetailItem label="Description (Card)" value={asset.description} />
        </DetailSection>

        {/* === WIZARD-ISSUED TOKEN DETAILS === */}
        {isWizard && details && (
          <>
            <DetailSection title="Token Details (Wizard Config)">
              {/* Logo + Name */}
              <div className="flex items-center mb-3">
                 <img src="/logos/generic-token.png" alt="User-issued token" className="h-5 w-5 mr-2"/>
                 <span className="font-semibold text-lg text-gray-800">{details.tokenDetails?.name || displayLabel}</span>
              </div>
              {/* Other details */}
              <DetailItem label="Token Symbol" value={details.tokenDetails?.symbol} />
              {/* --- ADDED: Display Token Type --- */}
              <DetailItem label="Token Type" value={details.tokenDetails?.tokenType} />
              {/* Blockchain with logo */}
              {(() => { const bn = details.tokenDetails?.blockchain; const logo = bn && blockchainLogosMap ? blockchainLogosMap[bn] : null; return bn ? <DetailItem label="Blockchain" value={bn} iconSrc={logo} /> : null; })()}
            </DetailSection>

            {/* Supply Section (Unchanged) */}
            <DetailSection title="Supply & Metadata (Wizard Config)">
                {/* ... supply detail items ... */}
                <DetailItem label="Initial Supply Issued" value={details.supplyDetails?.initialSupply?.toLocaleString()} />
                <DetailItem label="Supply Type" value={details.supplyDetails?.supplyType} />
                <DetailItem label="Decimal Points" value={details.supplyDetails?.decimals} />
                <DetailItem label="Initial Value Definition" value={details.supplyDetails?.valueDefinition} />
                <DetailItem label="Metadata Implementation" value={details.supplyDetails?.metadata} />
            </DetailSection>

            {/* Permissions Section - ADDED Regulatory Info */}
            <DetailSection title="Permissions & Compliance (Wizard Config)">
               <DetailItem label="KYC Enabled" value={formatBoolean(details.permissionDetails?.kycEnabled)} />
               <DetailItem label="Fee Schedule Enabled" value={formatBoolean(details.permissionDetails?.feeScheduleEnabled)} />
               <DetailItem label="Pausable Transactions" value={formatBoolean(details.permissionDetails?.pausable)} />
               <DetailItem label="Fungible" value={formatBoolean(details.permissionDetails?.fungible)} />
               <DetailItem label="Token Expiration" value={details.permissionDetails?.expiration || 'None'} />
               {/* Display assigned roles */}
               {details.permissionDetails?.roles && details.permissionDetails.roles.length > 0 && (
                  <div className="mt-3 mb-3 pt-3 border-t"> {/* Added border-t */}
                     <p className="font-semibold text-gray-600 mb-1">Assigned Roles:</p>
                     <ul className="list-disc list-inside ml-4 space-y-1"> {details.permissionDetails.roles.map((roleItem, index) => ( <li key={index}><strong>{roleItem.role}:</strong> {roleItem.address}</li> ))} </ul>
                  </div>
               )}
               {/* --- ADDED: Display Regulatory Info --- */}
               {details.regulatoryInfo && details.regulatoryInfo.length > 0 && (
                  <div className="mt-3 pt-3 border-t"> {/* Added border-t */}
                     <p className="font-semibold text-gray-600 mb-1">Regulatory Information:</p>
                     <ul className="list-disc list-inside ml-4 space-y-1">
                        {details.regulatoryInfo.map((info, index) => (
                           <li key={index}><strong>{info.country}:</strong> {info.regulator}</li>
                        ))}
                     </ul>
                  </div>
               )}
               {/* --- END ADDED --- */}
            </DetailSection>

             {/* Proof of Reserves Section (Unchanged) */}
            <DetailSection title="Proof of Reserves (Wizard Config)">
                {/* ... reserve detail items ... */}
                <DetailItem label="Asset Backed" value={formatBoolean(details.reserveDetails?.isBackedAsset)} />
                {details.reserveDetails?.isBackedAsset && ( <> <DetailItem label="Backing Type" value={details.reserveDetails?.backingType} /> {details.reserveDetails.backingType === 'bank' && ( <> <DetailItem label="Bank Name" value={details.reserveDetails.bankName} /> <DetailItem label="Account (Last 4)" value={details.reserveDetails.accountNumberLast4} /> </> )} {details.reserveDetails.backingType === 'smartcontract' && ( <> <DetailItem label="Contract Network" value={details.reserveDetails.contractNetwork} /> <DetailItem label="Contract Address" value={details.reserveDetails.contractAddress} /> </> )} {details.reserveDetails.backingType === 'custodian' && ( <> <DetailItem label="Custodian Name" value={details.reserveDetails.custodianName} /> <DetailItem label="Attestation Frequency" value={details.reserveDetails.attestationFrequency} /> </> )} </> )}
            </DetailSection>
          </>
        )}

        {/* === HARDCODED TOKEN DETAILS === */}
        {!isWizard && details && (
          <>
            <DetailSection title="Official Information">
               {/* Logo + Name */}
               <div className="flex items-center mb-3">
                  {assetLogosMap && assetLogosMap[asset.id] && ( <img src={assetLogosMap[asset.id]} alt={`${asset.label} logo`} className="h-5 w-5 mr-2"/> )}
                  <span className="font-semibold text-lg text-gray-800">{details.officialName || displayLabel}</span>
               </div>
               {/* Other details */}
               <DetailItem label="Issued By" value={details.issuer} />
               {/* ADDED Token Type for hardcoded assets if available */}
               <DetailItem label="Token Type" value={details.assetType} />
               {details.website && details.website !== '#' && ( <div className="mb-2 flex items-start sm:items-center flex-col sm:flex-row"> <span className="font-semibold text-gray-600 w-full sm:w-40 flex-shrink-0 mb-1 sm:mb-0">Website:</span> <div className="flex items-center ml-0 sm:ml-2 flex-grow"> <a href={details.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">{details.website}</a> </div> </div> )}
            </DetailSection>

            <DetailSection title="Features & Reserves">
                <DetailItem label="Reserve Info" value={details.reserveInfo} />
                 {details.features && details.features.length > 0 && ( <div className="mt-3"> <p className="font-semibold text-gray-600 mb-1">Key Features:</p> <ul className="list-disc list-inside ml-4 space-y-1"> {details.features.map((feature, index) => ( <li key={index}>{feature}</li> ))} </ul> </div> )}
            </DetailSection>
          </>
        )}

        {/* Fallback message */}
        {!details && ( <p className="text-red-500 mt-4">Could not load detailed information for this asset.</p> )}

      </div> {/* End Content Card */}
    </div> // End Outer Padding Div
  );
};

export default AssetDetailView;