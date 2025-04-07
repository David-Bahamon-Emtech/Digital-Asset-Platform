import React, { useState, useEffect } from 'react'; // Make sure useEffect is imported

// Helper function to format boolean values
const formatBoolean = (value) => (value ? 'Yes' : 'No');

// Helper component to render a single detail item
const DetailItem = ({ label, value, iconSrc }) => {
  // Do not render if value is missing
  if (value === undefined || value === null || value === '') {
    return null;
  }
  return (
    <div className="mb-2 flex items-start sm:items-center flex-col sm:flex-row">
      <span className="font-semibold text-gray-600 w-full sm:w-40 flex-shrink-0 mb-1 sm:mb-0">{label}:</span>
      <div className="flex items-center ml-0 sm:ml-2 flex-grow">
        {iconSrc && (
          <img src={iconSrc} alt={`${label} icon`} className="w-4 h-4 mr-1.5 flex-shrink-0" />
        )}
        <span className="text-gray-800 break-words">{String(value)}</span>
      </div>
    </div>
  );
};

// Helper component to render a section container
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
 * Includes controls for pausing/unpausing wizard-issued tokens with approval workflow.
 * @param {object} props - Component props.
 * @param {object} props.asset - The asset object being viewed.
 * @param {object} props.hardcodedDetailsMap - Map of hardcoded details.
 * @param {function} props.onBack - Function to navigate back.
 * @param {object} props.assetLogosMap - Map of asset logos.
 * @param {object} props.blockchainLogosMap - Map of blockchain logos.
 * @param {function} props.onUpdatePausableStatus - Callback to TokenDashboard to update the pausable state.
 */
const AssetDetailView = ({
    asset,
    hardcodedDetailsMap,
    onBack,
    assetLogosMap,
    blockchainLogosMap,
    onUpdatePausableStatus // <-- Receive the new prop
}) => {

    const isWizard = asset.isWizardIssued;
    // Ensure details are accessed safely, especially nested properties
    const details = isWizard ? asset.wizardData : (hardcodedDetailsMap ? hardcodedDetailsMap[asset.id] : {});

    // Handle missing data cases more gracefully
    if (isWizard && !asset.wizardData) { console.error("Wizard data missing for asset:", asset.id); }
    if (!isWizard && !hardcodedDetailsMap?.[asset.id]) { console.error("Hardcoded details missing for asset:", asset.id); }

    const currentBalance = asset.balance ?? 0; // Default balance if undefined
    const displaySymbol = asset.symbol || 'N/A';
    const displayLabel = asset.label || 'Unknown Asset';
    // Safely access the potentially deeply nested pausable status
    const currentPausableStatus = isWizard ? details?.permissionDetails?.pausable : undefined;

    // --- State for Pause/Unpause Workflow ---
    const [pauseWorkflowState, setPauseWorkflowState] = useState('idle'); // 'idle', 'pending_pauser_approval', 'approved', 'rejected'
    const [pauseWorkflowMessage, setPauseWorkflowMessage] = useState('');
    const [pauseRejectReason, setPauseRejectReason] = useState('');
    const [pauseIsLoading, setPauseIsLoading] = useState(false);
    const [pauseActionType, setPauseActionType] = useState(null); // 'pause' or 'unpause'

    // --- Workflow Effect Hook for Pause/Unpause ---
    useEffect(() => {
        setPauseIsLoading(false); // Reset loading on state change

        switch (pauseWorkflowState) {
            case 'pending_pauser_approval':
                setPauseWorkflowMessage(`Request to ${pauseActionType} transactions sent for Pauser Role approval.`);
                break;
            case 'approved':
                setPauseWorkflowMessage(`Request to ${pauseActionType} transactions approved. Ready to execute.`);
                break;
            case 'rejected':
                setPauseWorkflowMessage(`Request to ${pauseActionType} transactions rejected.`);
                break;
            default: // 'idle'
                setPauseWorkflowMessage('');
                setPauseRejectReason('');
                setPauseActionType(null);
                break;
        }
    }, [pauseWorkflowState, pauseActionType]);

    // --- Pause/Unpause Workflow Action Handlers ---

    /** Initiates the pause/unpause approval workflow */
    const handleInitiatePauseToggle = (action) => {
        // Ensure it's a wizard asset and status is known before initiating
        if (!isWizard || currentPausableStatus === undefined) {
            console.error("Cannot initiate pause/unpause: Not a wizard asset or status unknown.");
            return;
        }

        console.log(`Initiating request to ${action} transactions.`);
        setPauseActionType(action);
        setPauseWorkflowState('pending_pauser_approval');
    };

    /** Simulates the Pauser Role approval step. */
    const handlePauseApproval = () => {
        if (pauseIsLoading) return;
        setPauseIsLoading(true);
        setPauseWorkflowMessage(`Processing Pauser Role approval... (Simulating delay)`);

        setTimeout(() => {
            setPauseWorkflowState('approved');
        }, 1500); // Simulate 1.5 second delay
    };

    /** Simulates a rejection step for pause/unpause. */
    const handlePauseReject = () => {
        if (pauseIsLoading) return;
        const reason = prompt(`Enter reason for rejection by Pauser Role (optional):`);
        setPauseIsLoading(true);
        setPauseWorkflowMessage(`Processing rejection... (Simulating delay)`);

        setTimeout(() => {
            setPauseRejectReason(reason || 'No reason provided.');
            setPauseWorkflowState('rejected');
        }, 1000); // Simulate 1 second delay
    };

    /** Handles the final execution after approval and confirmation. */
    const handleExecutePauseToggle = () => {
        if (pauseIsLoading || pauseWorkflowState !== 'approved' || !pauseActionType) return;

        const newStatus = (pauseActionType === 'pause'); // If action is 'pause', new status is true
        const confirmMsg = `You are about to ${pauseActionType} all transactions for ${displaySymbol}.\n\nCurrent Status: ${formatBoolean(currentPausableStatus)}\nNew Status: ${formatBoolean(newStatus)}\n\nProceed?`;

        if (window.confirm(confirmMsg)) {
            console.log(`Executing ${pauseActionType}. New status: ${newStatus}`);
            // Ensure callback exists before calling
            if (typeof onUpdatePausableStatus === 'function') {
                onUpdatePausableStatus({ assetId: asset.id, newStatus: newStatus }); // Call back to TokenDashboard
            } else {
                console.error("onUpdatePausableStatus callback is not defined!");
            }
            setPauseWorkflowState('idle'); // Reset local workflow state
        } else {
            console.log(`Final ${pauseActionType} execution cancelled by user.`);
        }
    };

     /** Handles cancelling the active pause/unpause request */
    const handleCancelPauseRequest = () => {
      if (window.confirm(`Are you sure you want to cancel this request to ${pauseActionType} transactions?`)) {
          setPauseWorkflowState('idle'); // Reset workflow
      }
    }

    // --- Render Logic ---
    return (
        <div className="p-8">
            {/* Back Button */}
            <button
                className="mb-4 px-3 py-1 rounded text-white hover:opacity-90 bg-gray-800 text-sm disabled:opacity-50"
                onClick={onBack}
                disabled={pauseIsLoading && pauseWorkflowState !== 'idle'} // Disable back if processing pause request
            >
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
                {isWizard && ( // Simplified check: just needs to be wizard issued
                    <>
                        <DetailSection title="Token Details">
                            <div className="flex items-center mb-3"> <img src="/logos/generic-token.png" alt="User-issued token" className="h-5 w-5 mr-2"/> <span className="font-semibold text-lg text-gray-800">{details?.tokenDetails?.name || displayLabel}</span> </div>
                            <DetailItem label="Token Symbol" value={details?.tokenDetails?.symbol} />
                            <DetailItem label="Token Type" value={details?.tokenDetails?.tokenType} />
                            {(() => { const bn = details?.tokenDetails?.blockchain; const logo = bn && blockchainLogosMap ? blockchainLogosMap[bn] : null; return bn ? <DetailItem label="Blockchain" value={bn} iconSrc={logo} /> : null; })()}
                         </DetailSection>

                         <DetailSection title="Supply & Metadata">
                             <DetailItem label="Initial Supply Issued" value={details?.supplyDetails?.initialSupply?.toLocaleString()} />
                            <DetailItem label="Supply Type" value={details?.supplyDetails?.supplyType} />
                            <DetailItem label="Decimal Points" value={details?.supplyDetails?.decimals} />
                            <DetailItem label="Initial Value Definition" value={details?.supplyDetails?.valueDefinition} />
                            <DetailItem label="Metadata Implementation" value={details?.supplyDetails?.metadata} />
                         </DetailSection>

                         {/* Permissions Section - MODIFIED */}
                        <DetailSection title="Permissions & Compliance">
                            <DetailItem label="KYC Enabled" value={formatBoolean(details?.permissionDetails?.kycEnabled)} />
                            <DetailItem label="Fee Schedule Enabled" value={formatBoolean(details?.permissionDetails?.feeScheduleEnabled)} />

                            {/* --- Pausable Transactions Display & Control --- */}
                            <div className="mb-3 pt-3 border-t"> {/* Wrap pausable info */}
                                {/* Display current status even if undefined initially */}
                                <DetailItem label="Pausable Transactions" value={currentPausableStatus !== undefined ? formatBoolean(currentPausableStatus) : 'N/A'} />

                                {/* Render Button or Workflow based on state */}
                                {/* Only show button if status is known (not undefined) */}
                                {pauseWorkflowState === 'idle' && currentPausableStatus !== undefined && (
                                    <div className="mt-2 ml-0 sm:ml-42"> {/* Adjust margin to align roughly under value */}
                                        <button
                                            onClick={() => handleInitiatePauseToggle(currentPausableStatus ? 'unpause' : 'pause')}
                                            className={`px-3 py-1 text-sm rounded text-white ${currentPausableStatus ? 'bg-green-600 hover:bg-green-700' : 'bg-yellow-600 hover:bg-yellow-700'}`}
                                        >
                                            {currentPausableStatus ? 'Request Unpause' : 'Request Pause'}
                                        </button>
                                    </div>
                                )}

                                {/* Workflow Status Area for Pause/Unpause */}
                                {pauseWorkflowState !== 'idle' && (
                                    <div className={`mt-3 p-3 border rounded-lg text-sm ${pauseWorkflowState === 'rejected' ? 'bg-red-50 border-red-300' : 'bg-blue-50 border-blue-300'}`}>
                                        <h4 className={`font-semibold mb-1 ${pauseWorkflowState === 'rejected' ? 'text-red-800' : 'text-blue-800'}`}>Transaction Pause Request Status</h4>
                                        <p className={`mb-2 ${pauseWorkflowState === 'rejected' ? 'text-red-700' : 'text-blue-700'}`}>{pauseWorkflowMessage}</p>

                                        {pauseIsLoading && <p className="text-xs text-gray-500 italic mb-2">Processing...</p>}

                                        {/* Workflow Action Buttons */}
                                        {pauseWorkflowState === 'pending_pauser_approval' && !pauseIsLoading && (
                                            <div className="flex space-x-2">
                                                <button onClick={handlePauseApproval} className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs">Approve (Pauser Role)</button>
                                                <button onClick={handlePauseReject} className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs">Reject (Pauser Role)</button>
                                                <button onClick={handleCancelPauseRequest} className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-xs">Cancel Request</button>
                                            </div>
                                        )}
                                        {pauseWorkflowState === 'rejected' && (
                                           <>
                                             <p className="text-red-700 font-medium text-xs">Reason: {pauseRejectReason}</p>
                                             <button onClick={()=> setPauseWorkflowState('idle')} className="mt-2 px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-xs">Dismiss</button>
                                           </>
                                        )}
                                        {pauseWorkflowState === 'approved' && !pauseIsLoading && (
                                            <div className="flex space-x-2 items-center">
                                                <button onClick={handleExecutePauseToggle} className={`px-3 py-1 rounded text-white font-semibold ${pauseActionType === 'pause' ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'} text-xs`}>
                                                    Confirm & {pauseActionType === 'pause' ? 'Pause Transactions' : 'Unpause Transactions'}
                                                </button>
                                                 <button onClick={handleCancelPauseRequest} className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-xs">Cancel</button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            {/* --- End Pausable Transactions Display & Control --- */}

                           <DetailItem label="Fungible" value={formatBoolean(details?.permissionDetails?.fungible)} />
                           <DetailItem label="Token Expiration" value={details?.permissionDetails?.expiration || 'None'} />
                           {/* Display assigned roles */}
                           {details?.permissionDetails?.roles && details.permissionDetails.roles.length > 0 && (
                              <div className="mt-3 pt-3 border-t">
                                 <p className="font-semibold text-gray-600 mb-1">Assigned Roles:</p>
                                 <ul className="list-disc list-inside ml-4 space-y-1"> {details.permissionDetails.roles.map((roleItem, index) => ( <li key={index}><strong>{roleItem.role}:</strong> {roleItem.address}</li> ))} </ul>
                              </div>
                           )}
                           {/* Display Regulatory Info */}
                           {details?.regulatoryInfo && details.regulatoryInfo.length > 0 && (
                              <div className="mt-3 pt-3 border-t">
                                 <p className="font-semibold text-gray-600 mb-1">Regulatory Information:</p>
                                 <ul className="list-disc list-inside ml-4 space-y-1">
                                    {details.regulatoryInfo.map((info, index) => (
                                       <li key={index}><strong>{info.country}:</strong> {info.regulator}</li>
                                    ))}
                                 </ul>
                              </div>
                           )}
                        </DetailSection>

                         <DetailSection title="Proof of Reserves">
                            <DetailItem label="Asset Backed" value={formatBoolean(details?.reserveDetails?.isBackedAsset)} />
                            {details?.reserveDetails?.isBackedAsset && ( <> <DetailItem label="Backing Type" value={details?.reserveDetails?.backingType} /> {details?.reserveDetails.backingType === 'bank' && ( <> <DetailItem label="Bank Name" value={details.reserveDetails.bankName} /> <DetailItem label="Account (Last 4)" value={details.reserveDetails.accountNumberLast4} /> </> )} {details?.reserveDetails.backingType === 'smartcontract' && ( <> <DetailItem label="Contract Network" value={details.reserveDetails.contractNetwork} /> <DetailItem label="Contract Address" value={details.reserveDetails.contractAddress} /> </> )} {details?.reserveDetails.backingType === 'custodian' && ( <> <DetailItem label="Custodian Name" value={details.reserveDetails.custodianName} /> <DetailItem label="Attestation Frequency" value={details.reserveDetails.attestationFrequency} /> </> )} </> )}
                         </DetailSection>
                    </>
                )}

                {/* === HARDCODED TOKEN DETAILS === */}
                {!isWizard && ( // Simplified check
                    <>
                        <DetailSection title="Official Information">
                           <div className="flex items-center mb-3"> {assetLogosMap && assetLogosMap[asset.id] && ( <img src={assetLogosMap[asset.id]} alt={`${asset.label} logo`} className="h-5 w-5 mr-2"/> )} <span className="font-semibold text-lg text-gray-800">{details?.officialName || displayLabel}</span> </div>
                           <DetailItem label="Issued By" value={details?.issuer} />
                           <DetailItem label="Token Type" value={details?.assetType} />
                           {details?.website && details.website !== '#' && ( <div className="mb-2 flex items-start sm:items-center flex-col sm:flex-row"> <span className="font-semibold text-gray-600 w-full sm:w-40 flex-shrink-0 mb-1 sm:mb-0">Website:</span> <div className="flex items-center ml-0 sm:ml-2 flex-grow"> <a href={details.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">{details.website}</a> </div> </div> )}
                        </DetailSection>

                        <DetailSection title="Features & Reserves">
                            <DetailItem label="Reserve Info" value={details?.reserveInfo} />
                            {details?.features && details.features.length > 0 && ( <div className="mt-3"> <p className="font-semibold text-gray-600 mb-1">Key Features:</p> <ul className="list-disc list-inside ml-4 space-y-1"> {details.features.map((feature, index) => ( <li key={index}>{feature}</li> ))} </ul> </div> )}
                        </DetailSection>
                    </>
                )}

                {/* Fallback message if no details found for EITHER type */}
                 {((isWizard && !asset.wizardData) || (!isWizard && !hardcodedDetailsMap?.[asset.id])) && (
                     <p className="text-red-500 mt-4">Could not load detailed information for this asset.</p>
                 )}


            </div> {/* End Content Card */}
        </div> // End Outer Padding Div
    );
};

export default AssetDetailView;