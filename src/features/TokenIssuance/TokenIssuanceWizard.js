import React, { useState, useEffect, useMemo } from 'react';

// --- Constants ---
const sampleCountries = [
    { code: 'US', name: 'United States' }, { code: 'GB', name: 'United Kingdom' }, { code: 'CA', name: 'Canada' }, { code: 'EU', name: 'European Union (Region)' }, { code: 'SG', name: 'Singapore' }, { code: 'GH', name: 'Ghana' }, { code: 'OTHER', name: 'Other/Multiple' },
];
const rwaSubTypes = ["Gold (Troy Ounce)", "Carbon Credit", "Silver (Troy Ounce)", "Oil (Brent Crude Barrel)", "Real Estate", "Other"];
const capitalAssetSubTypes = ["Company Stock", "Government Bond", "Money Market Fund", "Commercial Paper", "Treasury Bill", "Other"];
const currencySubTypes = ["Asset Backed Stablecoin", "CBDC", "Cryptocurrency"];
const pricingCurrencies = ["USD", "EUR", "GHS", "CAD", "GBP", "SGD", "JPY"];
const hardcodedRwaValues = {
    'Gold (Troy Ounce)': '3254.90', // Example value
    'Silver (Troy Ounce)': '31.73', // Example value
    'Oil (Brent Crude Barrel)': '64.71' // Example value
};
const kycLevels = ["Simplified Due Diligence (SDD)", "Basic/Standard Due Diligence (CDD)", "Enhanced Due Diligence (EDD)"];
const bankNameOptions = ["JPMorgan Chase", "Citibank", "Bank of America", "Wells Fargo", "Goldman Sachs"];
const reserveCustodianOptions = ["BitGo", "Coinbase Custody", "Fireblocks", "Anchorage Digital", "Copper.co"];
const tokenCustodianOptions = ["Coinbase Custody", "Fireblocks", "BitGo", "Anchorage Digital", "Copper.co"];
const attestationReportTypes = ["Proof of Reserves Report", "SOC 2 Report (Relevant Controls)", "Agreed-Upon Procedures Report"];
const roleOptions = ["Treasurer", "Minter", "Burner", "Pauser", "KYC Administrator"];


/**
 * Token Issuance Wizard Component
 * Guides users through issuing a new token with a simulated approval workflow.
 */
const TokenIssuanceWizard = ({ onBack, onIssue }) => {
    // --- State ---
    const [issuanceScreen, setIssuanceScreen] = useState('token-details');
    const [tokenDetails, setTokenDetails] = useState({ name: '', symbol: '', blockchain: '', tokenType: '', rwaSubType: '', capitalAssetSubType: '', currencySubType: '' });
    const [supplyDetails, setSupplyDetails] = useState({ initialSupply: '', supplyType: 'finite', decimals: '18', metadata: '', marketValueCurrency: 'USD', marketValueAmount: '', });
    // *** UPDATED PermissionDetails State for COMBINED Fee structure ***
    const [permissionDetails, setPermissionDetails] = useState({
        kycEnabled: false, kycLevel: '',
        feeScheduleEnabled: false,
        // Updated Fee Details: Allows both % and flat
        feeDetails: {
            overallFeePercentage: '', // Required if fees enabled
            flatFeeAmount: '', // Optional flat fee
            flatFeeCurrency: 'USD', // Currency for flat fee (default USD)
            recipients: [] // Array of { id: number, address: string, percentage: string } - distributes TOTAL fee
        },
        pausable: true, fungible: true,
        isExpirationEnabled: false, expiration: '',
        roles: []
    });
    const [reserveDetails, setReserveDetails] = useState({ isBackedAsset: false, backingType: '', selectedBankName: '', bankName: '', accountNumberFull: '', accountNumberLast4: '', contractNetwork: '', contractAddress: '', selectedReserveCustodianName: '', custodianName: '', custodianAccountId: '', custodianReportType: '', attestationFrequency: '', onChainNetwork: '', onChainWalletAddress: '', isConfigured: false });
    const [regulatoryInfo, setRegulatoryInfo] = useState([]);
    const [tokenCustodyType, setTokenCustodyType] = useState('self');
    const [selectedTokenCustodianName, setSelectedTokenCustodianName] = useState('');
    const [tokenCustodianAccountIdInput, setTokenCustodianAccountIdInput] = useState('');
    const [tokenCustodyConnectionLoading, setTokenCustodyConnectionLoading] = useState(false);
    const [tokenCustodyConnectionStatus, setTokenCustodyConnectionStatus] = useState('idle');

    // Temporary state for inputs
    const [selectedRole, setSelectedRole] = useState('');
    const [roleAddress, setRoleAddress] = useState('');
    const [tempAccountNumber, setTempAccountNumber] = useState('');
    const [tempContractNetwork, setTempContractNetwork] = useState('Ethereum');
    const [tempContractAddress, setTempContractAddress] = useState('');
    const [tempCustodianAccountId, setTempCustodianAccountId] = useState('');
    const [tempCustodianReportType, setTempCustodianReportType] = useState('');
    const [tempAttestationFreq, setTempAttestationFreq] = useState('Daily');
    const [tempOnChainNetwork, setTempOnChainNetwork] = useState('Ethereum');
    const [tempOnChainWalletAddress, setTempOnChainWalletAddress] = useState('');
    const [selectedCountry, setSelectedCountry] = useState('');
    const [regulatorName, setRegulatorName] = useState('');
    const [reserveConnectionLoading, setReserveConnectionLoading] = useState(false);

    // Workflow State
    const [workflowState, setWorkflowState] = useState('idle');
    const [workflowMessage, setWorkflowMessage] = useState('');
    const [rejectReason, setRejectReason] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [finalTokenData, setFinalTokenData] = useState(null);

    // --- Fee Recipient Management ---
    const handleAddFeeRecipient = () => { /* ... unchanged ... */
        setPermissionDetails(prev => ({ ...prev, feeDetails: { ...prev.feeDetails, recipients: [ ...prev.feeDetails.recipients, { id: Date.now(), address: '', percentage: '' } ] } })); };
    const handleRemoveFeeRecipient = (idToRemove) => { /* ... unchanged ... */
        setPermissionDetails(prev => ({ ...prev, feeDetails: { ...prev.feeDetails, recipients: prev.feeDetails.recipients.filter(r => r.id !== idToRemove) } })); };
    const handleUpdateFeeRecipient = (id, field, value) => { /* ... unchanged ... */
        setPermissionDetails(prev => ({ ...prev, feeDetails: { ...prev.feeDetails, recipients: prev.feeDetails.recipients.map(r => r.id === id ? { ...r, [field]: value } : r ) } })); };
    const totalFeePercentageAllocated = useMemo(() => { /* ... unchanged ... */
        return permissionDetails.feeDetails.recipients.reduce((sum, recipient) => { const percentage = parseFloat(recipient.percentage); return sum + (isNaN(percentage) ? 0 : percentage); }, 0); }, [permissionDetails.feeDetails.recipients]);

    // --- Helper Functions ---
    const handleAddRole = (event) => { /* ... unchanged ... */
        event.preventDefault(); if (!selectedRole || !roleAddress.trim()) { alert('Please select a role and enter a valid address.'); return; } const newRole = { role: selectedRole, address: roleAddress }; setPermissionDetails(prev => ({ ...prev, roles: [...prev.roles, newRole] })); setSelectedRole(''); setRoleAddress(''); };
    const handleAddRegulatoryInfo = (event) => { /* ... unchanged ... */
        event.preventDefault(); if (!selectedCountry || !regulatorName.trim()) { alert('Please select a country and enter a regulator name.'); return; } const newInfo = { country: selectedCountry, regulator: regulatorName.trim() }; setRegulatoryInfo(prev => [...prev, newInfo]); setRegulatorName(''); };

    // --- Reserve Connection Handlers ---
    const handleConnectBank = (event) => { /* ... unchanged ... */
        event.preventDefault(); if (reserveConnectionLoading || !reserveDetails.selectedBankName || !tempAccountNumber) return; setReserveConnectionLoading(true); setTimeout(() => { const last4 = tempAccountNumber.slice(-4); setReserveDetails(prev => ({ ...prev, bankName: prev.selectedBankName, accountNumberFull: tempAccountNumber, accountNumberLast4: last4, backingType: 'bank', isConfigured: true })); setTempAccountNumber(''); setReserveConnectionLoading(false); console.log("Bank Connection: Approved"); }, 2000); };
    const handleConnectContract = (event) => { /* ... unchanged ... */
        event.preventDefault(); if (reserveConnectionLoading || !tempContractNetwork || !tempContractAddress) return; setReserveConnectionLoading(true); setTimeout(() => { setReserveDetails(prev => ({...prev, contractNetwork: tempContractNetwork, contractAddress: tempContractAddress, backingType: 'smartcontract', isConfigured: true })); setTempContractAddress(''); setReserveConnectionLoading(false); console.log("Contract Connection: Approved"); }, 2000); };
    const handleSetupCustodian = (event) => { /* ... unchanged ... */
        event.preventDefault(); if (reserveConnectionLoading || !reserveDetails.selectedReserveCustodianName || !tempAttestationFreq || !tempCustodianAccountId || !tempCustodianReportType) return; setReserveConnectionLoading(true); setTimeout(() => { setReserveDetails(prev => ({ ...prev, custodianName: prev.selectedReserveCustodianName, attestationFrequency: tempAttestationFreq, custodianAccountId: tempCustodianAccountId, custodianReportType: tempCustodianReportType, backingType: 'custodian', isConfigured: true })); setTempCustodianAccountId(''); setTempCustodianReportType(''); setReserveConnectionLoading(false); console.log("Custodian Setup: Approved"); }, 2000); };
    const handleConnectOnChainWallet = (event) => { /* ... unchanged ... */
        event.preventDefault(); if (reserveConnectionLoading || !tempOnChainNetwork || !tempOnChainWalletAddress) return; setReserveConnectionLoading(true); setTimeout(() => { setReserveDetails(prev => ({ ...prev, onChainNetwork: tempOnChainNetwork, onChainWalletAddress: tempOnChainWalletAddress, backingType: 'onchain_wallet', isConfigured: true })); setTempOnChainWalletAddress(''); setReserveConnectionLoading(false); console.log("On-Chain Wallet Connection: Approved"); }, 2000); };

    // --- Token Custody Connection Handler ---
    const handleVerifyTokenCustodyConnection = (event) => { /* ... unchanged ... */
        event.preventDefault(); if (tokenCustodyConnectionLoading || tokenCustodyConnectionStatus === 'verified' || !selectedTokenCustodianName || !tokenCustodianAccountIdInput) return; setTokenCustodyConnectionLoading(true); setTokenCustodyConnectionStatus('loading'); console.log("Simulating token custody connection verification..."); setTimeout(() => { setTokenCustodyConnectionLoading(false); setTokenCustodyConnectionStatus('verified'); console.log("Token Custody Connection: Verified (Simulated)"); }, 2000); };

    // --- Effects ---
    useEffect(() => { /* ... unchanged ... */
        const isHardcodedRWA = tokenDetails.tokenType === 'RWA' && tokenDetails.rwaSubType in hardcodedRwaValues; if (isHardcodedRWA) { const valueToSet = hardcodedRwaValues[tokenDetails.rwaSubType]; setSupplyDetails(prev => ({ ...prev, marketValueCurrency: 'USD', marketValueAmount: valueToSet })); } }, [tokenDetails.tokenType, tokenDetails.rwaSubType]);
    useEffect(() => { /* ... unchanged ... */
        setIsLoading(false); switch (workflowState) { case 'pending_compliance': setWorkflowMessage('Issuance request sent to Compliance for review.'); break; case 'pending_management': setWorkflowMessage('Compliance approved. Request sent to Management for final review.'); break; case 'approved': setWorkflowMessage('Issuance request fully approved. Ready to execute.'); break; case 'rejected': setWorkflowMessage('Issuance request rejected.'); break; default: setWorkflowMessage(''); setRejectReason(''); setFinalTokenData(null); break; } }, [workflowState]);
    useEffect(() => { /* ... unchanged ... */
        setTokenCustodyConnectionStatus('idle'); setTokenCustodianAccountIdInput(''); }, [selectedTokenCustodianName]);

    // --- Workflow Action Handlers ---
    const handleInitiateIssuanceApproval = () => {
        // Compile final data
        const amountToIssue = parseFloat(supplyDetails.initialSupply || 0);
        const processedFeeRecipients = permissionDetails.feeDetails.recipients.map(r => ({ ...r, percentage: parseFloat(r.percentage) || 0 }));
        const fullTokenData = {
            tokenDetails: { ...tokenDetails },
            supplyDetails: { /* ... unchanged ... */
                 initialSupply: amountToIssue, supplyType: supplyDetails.supplyType, decimals: supplyDetails.decimals, metadata: supplyDetails.metadata, marketValue: { amount: parseFloat(supplyDetails.marketValueAmount) || 0, currency: supplyDetails.marketValueCurrency || 'USD' } },
            // Include updated feeDetails structure
            permissionDetails: {
                ...permissionDetails,
                feeDetails: {
                    ...permissionDetails.feeDetails,
                    overallFeePercentage: parseFloat(permissionDetails.feeDetails.overallFeePercentage) || 0,
                    flatFeeAmount: parseFloat(permissionDetails.feeDetails.flatFeeAmount) || 0, // Add flat fee
                    // flatFeeCurrency remains as is
                    recipients: processedFeeRecipients
                }
            },
            reserveDetails: { ...reserveDetails },
            regulatoryInfo: [...regulatoryInfo],
            tokenCustody: { /* ... unchanged ... */
                type: tokenCustodyType, custodianName: tokenCustodyType === 'thirdParty' ? selectedTokenCustodianName : null, custodianAccountId: (tokenCustodyType === 'thirdParty' && tokenCustodyConnectionStatus === 'verified') ? tokenCustodianAccountIdInput : null }
        };

        const reservesRequired = /* ... unchanged ... */
            fullTokenData.tokenDetails.tokenType === 'RWA' || fullTokenData.tokenDetails.tokenType === 'CapitalAsset' || (fullTokenData.tokenDetails.tokenType === 'Currency' && fullTokenData.tokenDetails.currencySubType === 'Asset Backed Stablecoin');

        // Final Validation including NEW fields
        let validationPassed = true;
        let errorMsg = "Please ensure all required fields are valid:\n";

        // Basic Details
        if (!fullTokenData.tokenDetails.name) { errorMsg += "- Token Name\n"; validationPassed = false; }
        // ... (other basic validations unchanged) ...
        if (!fullTokenData.tokenDetails.blockchain) { errorMsg += "- Blockchain\n"; validationPassed = false; }
        if (!fullTokenData.tokenDetails.tokenType) { errorMsg += "- Token Type\n"; validationPassed = false; }
        // ... (subtype validations unchanged) ...
        if (fullTokenData.tokenDetails.tokenType === 'Currency' && !fullTokenData.tokenDetails.currencySubType) { errorMsg += "- Currency Type\n"; validationPassed = false; }
        // Supply
        if (!amountToIssue || amountToIssue <= 0) { errorMsg += "- Initial Supply (must be > 0)\n"; validationPassed = false; }
        // Reserves
        if (reservesRequired && !fullTokenData.reserveDetails.isConfigured) { errorMsg += "- Reserve Details configuration (required)\n"; validationPassed = false; }
        if (fullTokenData.reserveDetails.backingType === 'custodian' && fullTokenData.reserveDetails.isConfigured) {
             if (!fullTokenData.reserveDetails.custodianAccountId) { errorMsg += "- Reserve Custodian Account ID\n"; validationPassed = false; }
             if (!fullTokenData.reserveDetails.custodianReportType) { errorMsg += "- Reserve Custodian Report Type\n"; validationPassed = false; }
        }
        // Permissions
        if (fullTokenData.permissionDetails.kycEnabled && !fullTokenData.permissionDetails.kycLevel) { errorMsg += "- KYC Level (required when KYC enabled)\n"; validationPassed = false; }
        if (fullTokenData.permissionDetails.isExpirationEnabled && !fullTokenData.permissionDetails.expiration) { errorMsg += "- Expiration Date (required when expiration enabled)\n"; validationPassed = false; }
        // *** UPDATED Fee Validation ***
        if (fullTokenData.permissionDetails.feeScheduleEnabled) {
            // Must have at least one fee type configured
            if (fullTokenData.permissionDetails.feeDetails.overallFeePercentage <= 0 && fullTokenData.permissionDetails.feeDetails.flatFeeAmount <= 0) {
                 errorMsg += "- At least Percentage Fee OR Flat Fee Amount must be configured (> 0)\n"; validationPassed = false;
            }
            // Recipient validation only applies if there's a percentage fee component that needs splitting
            if (fullTokenData.permissionDetails.feeDetails.overallFeePercentage > 0) {
                 if (fullTokenData.permissionDetails.feeDetails.recipients.length === 0) { errorMsg += "- At least one Fee Recipient address is required for percentage fees\n"; validationPassed = false; }
                 let recipientErrors = false;
                 fullTokenData.permissionDetails.feeDetails.recipients.forEach((r, index) => {
                     if (!r.address) { errorMsg += `- Fee Recipient #${index + 1} Address is missing\n`; recipientErrors = true; }
                     if (r.percentage <= 0) { errorMsg += `- Fee Recipient #${index + 1} Percentage must be > 0\n`; recipientErrors = true; }
                 });
                 if (!recipientErrors && Math.abs(totalFeePercentageAllocated - 100) > 0.001) {
                      errorMsg += `- Fee Recipient Percentages must total 100% (Currently ${totalFeePercentageAllocated.toFixed(1)}%)\n`; // Use toFixed(1) here too
                      validationPassed = false;
                 } else if (recipientErrors) {
                      validationPassed = false;
                 }
            }
        }
        // Token Custody
        if (fullTokenData.tokenCustody.type === 'thirdParty' && !fullTokenData.tokenCustody.custodianName) { errorMsg += "- Token Custodian selection\n"; validationPassed = false; }
        if (fullTokenData.tokenCustody.type === 'thirdParty' && tokenCustodyConnectionStatus !== 'verified') { errorMsg += "- Token Custody connection must be verified\n"; validationPassed = false; }


        if (!validationPassed) { alert(errorMsg); return; }

        console.log("Initiating issuance approval with data:", fullTokenData);
        setFinalTokenData(fullTokenData);
        setWorkflowState('pending_compliance');
    };

    const handleApproval = (step) => { /* ... unchanged ... */
        if (isLoading) return; setIsLoading(true); setWorkflowMessage(`Processing ${step} approval...`); setTimeout(() => { if (step === 'compliance') { setWorkflowState('pending_management');} else if (step === 'management') { setWorkflowState('approved'); } setIsLoading(false); }, 1500); };
    const handleReject = (rejectedBy) => { /* ... unchanged ... */
        if (isLoading) return; const reason = prompt(`Enter reason for rejection by ${rejectedBy} (optional):`); setIsLoading(true); setWorkflowMessage(`Processing rejection...`); setTimeout(() => { setRejectReason(reason || 'No reason provided.'); setWorkflowState('rejected'); setIsLoading(false); }, 1000); };
    const handleExecuteIssue = () => { /* ... unchanged ... */
        if (isLoading || workflowState !== 'approved' || !finalTokenData) return; const confirmMsg = `You are about to issue ${finalTokenData.supplyDetails.initialSupply.toLocaleString()} ${finalTokenData.tokenDetails.symbol} tokens.\n\nThis action will finalize the token creation based on the approved details.\n\nProceed?`; if (window.confirm(confirmMsg)) { console.log("Executing onIssue with final data:", finalTokenData); onIssue(finalTokenData); } else { console.log("Final issuance execution cancelled by user."); } };
    const handleCancelRequest = () => { /* ... unchanged ... */
        if (window.confirm("Are you sure you want to cancel this issuance request?")) { setWorkflowState('idle'); } }

    // --- Render Logic ---
    const renderProgressSteps = () => { /* ... unchanged ... */
        const steps = ['Token Details', 'Supply & Reserves', 'Permissions', 'Finalization']; const stepMap = { 'token-details': 0, 'supply-reserves-metadata': 1, 'permissions': 2, 'finalization': 3 }; const currentStepIndex = stepMap[issuanceScreen] ?? -1; if (workflowState !== 'idle' && issuanceScreen !== 'finalization') return null; const activeIndex = (workflowState !== 'idle' && issuanceScreen === 'finalization') ? steps.length -1 : currentStepIndex; return ( <div className="mb-8"> <div className="flex items-center justify-between"> {steps.map((step, index) => ( <React.Fragment key={step}> <div className="w-1/4 text-center px-1"> <div className={`rounded-full h-10 w-10 flex items-center justify-center mx-auto ${ index < activeIndex ? 'bg-green-600 text-white' : (index === activeIndex ? 'bg-yellow-600 text-white' : 'bg-gray-200 text-gray-600') }`}> {index < activeIndex ? '✓' : index + 1} </div> <p className={`mt-1 text-xs sm:text-sm ${index <= activeIndex ? 'font-medium text-gray-800' : 'text-gray-500'}`}>{step}</p> </div> {index < steps.length - 1 && ( <div className={`flex-1 h-1 ${index < activeIndex ? 'bg-green-600' : 'bg-gray-200'}`}></div> )} </React.Fragment> ))} </div> </div> ); };

    const isHardcodedRWA = tokenDetails.tokenType === 'RWA' && tokenDetails.rwaSubType in hardcodedRwaValues;
    const reservesRequired = tokenDetails.tokenType === 'RWA' || tokenDetails.tokenType === 'CapitalAsset' || (tokenDetails.tokenType === 'Currency' && tokenDetails.currencySubType === 'Asset Backed Stablecoin');
    const showReservesSection = tokenDetails.tokenType === 'RWA' || tokenDetails.tokenType === 'CapitalAsset' || tokenDetails.tokenType === 'Currency';


    return (
        <div className="p-8">
            <div className="bg-white p-6 rounded shadow max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-6"> <h1 className="text-2xl font-bold text-gray-800">Issue New Tokens</h1> <button className="px-3 py-1 rounded text-white hover:opacity-90 bg-gray-800 text-sm disabled:opacity-50" onClick={workflowState === 'idle' ? onBack : handleCancelRequest} disabled={isLoading && workflowState !== 'idle'} > {workflowState === 'idle' ? 'Back to Dashboard' : 'Cancel Issuance Request'} </button> </div>

                {renderProgressSteps()}

                {/* --- Wizard Step Content --- */}

                {/* Step 1: Token Details */}
                {issuanceScreen === 'token-details' && workflowState === 'idle' && ( <div> {/* ... Step 1 JSX unchanged ... */ } <h2 className="text-xl font-medium mb-4 text-gray-800">Token Details</h2> <p className="text-gray-600 mb-6">Define the basic information for your new token.</p> <div className="space-y-4"> <div> <label className="block mb-1 font-medium">Token Name <span className="text-red-600">*</span></label> <input type="text" className="w-full p-2 border rounded" placeholder="e.g. My Stablecoin" value={tokenDetails.name} onChange={(e) => setTokenDetails({...tokenDetails, name: e.target.value})} /> <p className="text-xs text-gray-500 mt-1">Full name of your token (e.g. "US Dollar Coin")</p> </div> <div> <label className="block mb-1 font-medium">Token Symbol <span className="text-red-600">*</span></label> <input type="text" className="w-full p-2 border rounded" placeholder="e.g. USDC" value={tokenDetails.symbol} onChange={(e) => setTokenDetails({...tokenDetails, symbol: e.target.value})} /> <p className="text-xs text-gray-500 mt-1">Short symbol for your token (e.g. "USDC")</p> </div> <div> <label className="block mb-1 font-medium">Select Blockchain <span className="text-red-600">*</span></label> <select className="w-full p-2 border rounded" value={tokenDetails.blockchain} onChange={(e) => setTokenDetails({...tokenDetails, blockchain: e.target.value})} > <option value="">Select Blockchain</option> <option value="Ethereum">Ethereum</option> <option value="Hedera">Hedera</option> <option value="Solana">Solana</option> <option value="Polygon">Polygon</option> <option value="Stellar">Stellar</option> </select> <p className="text-xs text-gray-500 mt-1">The blockchain network where this token will be issued.</p> </div> <div> <label className="block mb-1 font-medium">Token Type <span className="text-red-600">*</span></label> <select className="w-full p-2 border rounded" value={tokenDetails.tokenType} onChange={(e) => { const newType = e.target.value; setTokenDetails({ ...tokenDetails, tokenType: newType, rwaSubType: newType !== 'RWA' ? '' : tokenDetails.rwaSubType, capitalAssetSubType: newType !== 'CapitalAsset' ? '' : tokenDetails.capitalAssetSubType, currencySubType: newType !== 'Currency' ? '' : tokenDetails.currencySubType }); }} > <option value="">Select Token Type</option> <option value="Currency">Currency Token</option> <option value="RWA">Real World Asset Token</option> <option value="CapitalAsset">Capital Asset Token</option> </select> <p className="text-xs text-gray-500 mt-1">Classify the type of token being issued.</p> </div> {tokenDetails.tokenType === 'RWA' && ( <div> <label className="block mb-1 font-medium">RWA Type <span className="text-red-600">*</span></label> <select className="w-full p-2 border rounded" value={tokenDetails.rwaSubType} onChange={(e) => setTokenDetails({...tokenDetails, rwaSubType: e.target.value})} required={tokenDetails.tokenType === 'RWA'} > <option value="">Select RWA Type</option> {rwaSubTypes.map(type => <option key={type} value={type}>{type}</option>)} </select> <p className="text-xs text-gray-500 mt-1">Specify the type of Real World Asset being tokenized.</p> </div> )} {tokenDetails.tokenType === 'CapitalAsset' && ( <div> <label className="block mb-1 font-medium">Capital Asset Type <span className="text-red-600">*</span></label> <select className="w-full p-2 border rounded" value={tokenDetails.capitalAssetSubType} onChange={(e) => setTokenDetails({...tokenDetails, capitalAssetSubType: e.target.value})} required={tokenDetails.tokenType === 'CapitalAsset'} > <option value="">Select Capital Asset Type</option> {capitalAssetSubTypes.map(type => <option key={type} value={type}>{type}</option>)} </select> <p className="text-xs text-gray-500 mt-1">Specify the type of Capital Asset being tokenized.</p> </div> )} {tokenDetails.tokenType === 'Currency' && ( <div> <label className="block mb-1 font-medium">Currency Type <span className="text-red-600">*</span></label> <select className="w-full p-2 border rounded" value={tokenDetails.currencySubType} onChange={(e) => setTokenDetails({...tokenDetails, currencySubType: e.target.value})} required={tokenDetails.tokenType === 'Currency'} > <option value="">Select Currency Type</option> {currencySubTypes.map(type => <option key={type} value={type}>{type}</option>)} </select> <p className="text-xs text-gray-500 mt-1">Specify the type of Currency Token.</p> </div> )} <div className="border rounded-lg p-4 bg-gray-50 mt-6"> <label className="block mb-2"><span className="font-medium">Regulatory Information</span><p className="text-sm text-gray-600">Specify jurisdictions and regulatory bodies</p></label> <form onSubmit={handleAddRegulatoryInfo} className="flex space-x-2 items-center"> <select className="flex-1 p-2 border rounded" value={selectedCountry} onChange={(e) => setSelectedCountry(e.target.value)} > <option value="">Select Country/Jurisdiction</option> {sampleCountries.map(country => ( <option key={country.code} value={country.name}>{country.name}</option> ))} </select> <input type="text" className="flex-1 p-2 border rounded" placeholder="Regulatory Body Name (e.g., SEC)" value={regulatorName} onChange={(e) => setRegulatorName(e.target.value)} /> <button className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50" disabled={!selectedCountry || !regulatorName.trim()} type="submit" > Add </button> </form> <div className="mt-4 p-3 border rounded bg-white min-h-[50px]"> {regulatoryInfo.length === 0 ? ( <p className="text-sm text-gray-500 italic">No regulatory information added yet.</p> ) : ( <ul className="space-y-1">{regulatoryInfo.map((info, index) => ( <li key={index} className="text-sm border-b last:border-b-0 py-1"><strong>{info.country}:</strong> {info.regulator}</li> ))}</ul> )} </div> </div> <div className="flex justify-end mt-8"> <button className="px-4 py-2 rounded text-white hover:opacity-90 bg-yellow-600 disabled:opacity-50" onClick={() => setIssuanceScreen('supply-reserves-metadata')} disabled={ !tokenDetails.name || !tokenDetails.symbol || !tokenDetails.blockchain || !tokenDetails.tokenType || (tokenDetails.tokenType === 'RWA' && !tokenDetails.rwaSubType) || (tokenDetails.tokenType === 'CapitalAsset' && !tokenDetails.capitalAssetSubType) || (tokenDetails.tokenType === 'Currency' && !tokenDetails.currencySubType) } > Next Step </button> </div> </div> </div> )}

                {/* Step 2: Supply, Reserves, & Metadata */}
                {issuanceScreen === 'supply-reserves-metadata' && workflowState === 'idle' && (
                    <div>
                        <h2 className="text-xl font-medium mb-4 text-gray-800">Supply, Reserves, & Metadata</h2>
                        <p className="text-gray-600 mb-6">Configure token supply, reserve backing (if applicable), and metadata.</p>
                        <div className="space-y-6">
                            {/* Supply Section */}
                            <div> <label className="block mb-1 font-medium">Initial Supply <span className="text-red-600">*</span></label> <input type="number" min="0" className="w-full p-2 border rounded" placeholder="e.g. 1000000" value={supplyDetails.initialSupply} onChange={(e) => setSupplyDetails({...supplyDetails, initialSupply: e.target.value})} /> <p className="text-xs text-gray-500 mt-1">Number of tokens to be created initially</p> </div>
                            <div> <label className="block mb-1 font-medium">Supply Type <span className="text-red-600">*</span></label> <div className="grid grid-cols-2 gap-4 mt-2"> <div className={`border rounded p-3 cursor-pointer ${supplyDetails.supplyType === 'finite' ? 'border-yellow-600 bg-yellow-50' : 'border-gray-300'}`} onClick={() => setSupplyDetails({...supplyDetails, supplyType: 'finite'})} > <div className="flex items-center"> <input type="radio" name="supplyType" className="mr-2 focus:ring-yellow-600 h-4 w-4 text-yellow-600" checked={supplyDetails.supplyType === 'finite'} readOnly /> <div> <p className="font-medium">Finite Supply</p> <p className="text-xs text-gray-500">Fixed maximum token supply</p> </div> </div> </div> <div className={`border rounded p-3 cursor-pointer ${supplyDetails.supplyType === 'infinite' ? 'border-yellow-600 bg-yellow-50' : 'border-gray-300'}`} onClick={() => setSupplyDetails({...supplyDetails, supplyType: 'infinite'})} > <div className="flex items-center"> <input type="radio" name="supplyType" className="mr-2 focus:ring-yellow-600 h-4 w-4 text-yellow-600" checked={supplyDetails.supplyType === 'infinite'} readOnly /> <div> <p className="font-medium">Infinite Supply</p> <p className="text-xs text-gray-500">No maximum supply limit</p> </div> </div> </div> </div> </div>
                            <div> <label className="block mb-1 font-medium">Decimal Points <span className="text-red-600">*</span></label> <select className="w-full p-2 border rounded" value={supplyDetails.decimals} onChange={(e) => setSupplyDetails({...supplyDetails, decimals: e.target.value})} > <option value="18">18 (e.g. Ethereum standard)</option> <option value="8">8 (e.g. Bitcoin standard)</option> <option value="6">6 (e.g. USDC standard)</option> <option value="2">2 (e.g. 100.50)</option> <option value="0">0 (No decimal places, whole tokens only)</option> </select> <p className="text-xs text-gray-500 mt-1">How divisible the token will be (smaller units)</p> </div>
                            <div> <label className="block mb-1 font-medium">Pricing Currency</label> <select className={`w-full p-2 border rounded ${isHardcodedRWA ? 'bg-gray-100' : 'bg-white'}`} value={supplyDetails.marketValueCurrency} onChange={(e) => setSupplyDetails({...supplyDetails, marketValueCurrency: e.target.value})} disabled={isHardcodedRWA} > {pricingCurrencies.map(currency => (<option key={currency} value={currency}>{currency}</option>))} </select> <p className="text-xs text-gray-500 mt-1">Select the currency for the market value definition.</p> </div>
                            <div> <label className="block mb-1 font-medium">Market Value Amount</label> <input type="number" step="any" min="0" className={`w-full p-2 border rounded ${isHardcodedRWA ? 'bg-gray-100' : ''}`} placeholder={`Enter value in ${supplyDetails.marketValueCurrency || 'selected currency'}`} value={supplyDetails.marketValueAmount} onChange={(e) => setSupplyDetails({...supplyDetails, marketValueAmount: e.target.value})} disabled={isHardcodedRWA} /> <p className="text-xs text-gray-500 mt-1">Define what 1 unit of this token initially represents in the selected currency.</p> </div>

                            {/* --- Proof of Reserves Section (with updated fields) --- */}
                            {showReservesSection && (
                                <div className="pt-6 border-t">
                                    <h3 className="text-lg font-medium mb-4 text-gray-700">Proof of Reserves Configuration</h3>
                                    <div className="border rounded-lg p-4 bg-gray-50"> <p className="font-medium mb-3">Is this token backed by real-world assets? {reservesRequired ? <span className="text-red-600">* Required</span> : ''}</p> <div className="grid grid-cols-2 gap-4"> <div className={`border rounded p-3 cursor-pointer ${reserveDetails.isBackedAsset ? 'border-yellow-600 bg-yellow-50' : 'border-gray-300'}`} onClick={() => setReserveDetails({...reserveDetails, isBackedAsset: true, isConfigured: false})} > <div className="flex items-center"> <input type="radio" name="isBacked" className="mr-2 focus:ring-yellow-600 h-4 w-4 text-yellow-600" checked={reserveDetails.isBackedAsset} readOnly /> <div><p className="font-medium">Yes</p><p className="text-xs text-gray-500">Token is backed by verifiable reserves</p></div> </div> </div> <div className={`border rounded p-3 cursor-pointer ${!reserveDetails.isBackedAsset ? 'border-yellow-600 bg-yellow-50' : 'border-gray-300'} ${reservesRequired ? 'opacity-50 cursor-not-allowed' : ''}`} onClick={() => { if (!reservesRequired) setReserveDetails({ ...reserveDetails, isBackedAsset: false, backingType: '', selectedBankName: '', accountNumberFull: '', accountNumberLast4: '', contractNetwork: '', contractAddress: '', selectedReserveCustodianName: '', custodianAccountId: '', custodianReportType: '', attestationFrequency: '', onChainNetwork: '', onChainWalletAddress: '', isConfigured: true }); }} > <div className="flex items-center"> <input type="radio" name="isBacked" className="mr-2 focus:ring-yellow-600 h-4 w-4 text-yellow-600" checked={!reserveDetails.isBackedAsset} readOnly disabled={reservesRequired}/> <div><p className="font-medium">No</p><p className="text-xs text-gray-500">Token is not backed by reserves</p></div> </div> </div> </div> {reservesRequired && !reserveDetails.isBackedAsset && <p className="text-xs text-red-600 mt-1">Asset backing is required for this token type.</p>} </div>
                                    {reserveDetails.isBackedAsset && (
                                        <div className="mt-4 border rounded-lg p-4 bg-gray-50">
                                            <p className="font-medium mb-3">Select Reserve Backing Method <span className="text-red-600">*</span></p>
                                            {reserveDetails.isConfigured && ( <div className='mb-4 p-3 bg-green-100 border border-green-300 text-green-800 rounded text-sm'> <p className='font-medium'>Reserve Method Configured:</p> {reserveDetails.backingType === 'bank' && <p>Bank Account ({reserveDetails.bankName} ending in {reserveDetails.accountNumberLast4})</p>} {reserveDetails.backingType === 'smartcontract' && <p>Smart Contract ({reserveDetails.contractNetwork}: {reserveDetails.contractAddress.substring(0,6)}...)</p>} {reserveDetails.backingType === 'custodian' && <p>Custodian: {reserveDetails.custodianName} (Acct: {reserveDetails.custodianAccountId || 'N/A'}, Report: {reserveDetails.custodianReportType || 'N/A'}, Freq: {reserveDetails.attestationFrequency})</p>} {reserveDetails.backingType === 'onchain_wallet' && <p>On-Chain Wallet ({reserveDetails.onChainNetwork}: {reserveDetails.onChainWalletAddress.substring(0,6)}...)</p>} <button onClick={() => setReserveDetails(prev => ({ ...prev, isConfigured: false }))} className="text-xs text-blue-600 hover:underline mt-1" disabled={reserveConnectionLoading}> Edit Configuration </button> </div> )}
                                            {reserveConnectionLoading && ( <div className="my-4 p-3 bg-blue-100 border border-blue-300 text-blue-800 rounded text-sm flex items-center justify-center"> <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"> <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle> <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path> </svg> Validating connection... </div> )}
                                            <div className={`space-y-3 ${(reserveDetails.isConfigured || reserveConnectionLoading) ? 'opacity-50 pointer-events-none' : ''}`}>
                                                {/* Bank Account - Updated Input */}
                                                <div className={`border rounded p-3 cursor-pointer ${reserveDetails.backingType === 'bank' ? 'border-yellow-600 bg-yellow-50' : 'border-gray-300 bg-white'}`} onClick={() => !reserveDetails.isConfigured && setReserveDetails({...reserveDetails, backingType: 'bank'})} >
                                                    <div className="flex"> <input type="radio" name="backingType" className="mr-2 mt-1 focus:ring-yellow-600 h-4 w-4 text-yellow-600" checked={reserveDetails.backingType === 'bank'} readOnly />
                                                        <div> <p className="font-medium">Bank Account Connection</p> <p className="text-sm text-gray-600">Link a traditional bank account to verify reserves</p>
                                                            {reserveDetails.backingType === 'bank' && !reserveDetails.isConfigured && ( <form onSubmit={handleConnectBank} className="mt-3 p-3 border rounded bg-white"> <div className="space-y-3"> <div><label className="block text-sm font-medium mb-1">Bank Name <span className="text-red-600">*</span></label> <select value={reserveDetails.selectedBankName} onChange={(e) => setReserveDetails({...reserveDetails, selectedBankName: e.target.value})} className="w-full p-2 border rounded text-sm" required > <option value="">-- Select Bank --</option> {bankNameOptions.map(name => <option key={name} value={name}>{name}</option>)} </select> </div> <div><label className="block text-sm font-medium mb-1">Account Number <span className="text-red-600">*</span></label> <input type="text" value={tempAccountNumber} onChange={(e) => setTempAccountNumber(e.target.value)} className="w-full p-2 border rounded text-sm" placeholder="Enter full account number" required /> </div> <button type="submit" className="mt-2 px-4 py-2 rounded text-white hover:opacity-90 bg-yellow-600 disabled:opacity-50" disabled={!reserveDetails.selectedBankName || !tempAccountNumber}>Connect Bank Account</button> </div> </form> )}
                                                        </div>
                                                    </div>
                                                </div>
                                                {/* Smart Contract */}
                                                <div className={`border rounded p-3 cursor-pointer ${reserveDetails.backingType === 'smartcontract' ? 'border-yellow-600 bg-yellow-50' : 'border-gray-300 bg-white'}`} onClick={() => !reserveDetails.isConfigured && setReserveDetails({...reserveDetails, backingType: 'smartcontract'})} > {/* ... unchanged ... */} <div className="flex"> <input type="radio" name="backingType" className="mr-2 mt-1 focus:ring-yellow-600 h-4 w-4 text-yellow-600" checked={reserveDetails.backingType === 'smartcontract'} readOnly /> <div> <p className="font-medium">On-Chain Asset with Smart Contract</p> <p className="text-sm text-gray-600">Link to on-chain assets via smart contract for automated verification</p> {reserveDetails.backingType === 'smartcontract' && !reserveDetails.isConfigured && ( <form onSubmit={handleConnectContract} className="mt-3 p-3 border rounded bg-white"> <div className="space-y-3"> <div><label className="block text-sm font-medium mb-1">Blockchain Network</label><select value={tempContractNetwork} onChange={(e)=> setTempContractNetwork(e.target.value)} className="w-full p-2 border rounded text-sm"><option>Ethereum</option><option>Polygon</option><option>BNB Chain</option><option>Solana</option><option>Avalanche</option></select></div> <div><label className="block text-sm font-medium mb-1">Smart Contract Address</label><input type="text" value={tempContractAddress} onChange={(e)=> setTempContractAddress(e.target.value)} className="w-full p-2 border rounded text-sm" placeholder="0x..." required /></div> <button type="submit" className="mt-2 px-4 py-2 rounded text-white hover:opacity-90 bg-yellow-600 disabled:opacity-50" disabled={!tempContractNetwork || !tempContractAddress}>Connect Smart Contract</button> </div> </form> )} </div> </div> </div>
                                                {/* Custodian - Updated with new fields */}
                                                <div className={`border rounded p-3 cursor-pointer ${reserveDetails.backingType === 'custodian' ? 'border-yellow-600 bg-yellow-50' : 'border-gray-300 bg-white'}`} onClick={() => !reserveDetails.isConfigured && setReserveDetails({...reserveDetails, backingType: 'custodian'})} >
                                                    <div className="flex"> <input type="radio" name="backingType" className="mr-2 mt-1 focus:ring-yellow-600 h-4 w-4 text-yellow-600" checked={reserveDetails.backingType === 'custodian'} readOnly />
                                                        <div> <p className="font-medium">Third-Party Custodian Verification</p> <p className="text-sm text-gray-600">Use a trusted third-party custodian to verify and attest to reserves</p>
                                                            {reserveDetails.backingType === 'custodian' && !reserveDetails.isConfigured && ( <form onSubmit={handleSetupCustodian} className="mt-3 p-3 border rounded bg-white"> <div className="space-y-3"> <div><label className="block text-sm font-medium mb-1">Custodian Name <span className="text-red-600">*</span></label> <select value={reserveDetails.selectedReserveCustodianName} onChange={(e)=> setReserveDetails({...reserveDetails, selectedReserveCustodianName: e.target.value})} className="w-full p-2 border rounded text-sm" required> <option value="">-- Select Custodian --</option> {reserveCustodianOptions.map(name => <option key={name} value={name}>{name}</option>)} </select> </div> <div><label className="block text-sm font-medium mb-1">Custodian Account/Vault ID (Simulated) <span className="text-red-600">*</span></label> <input type="text" value={tempCustodianAccountId} onChange={(e) => setTempCustodianAccountId(e.target.value)} className="w-full p-2 border rounded text-sm" placeholder="Enter Account/Vault Identifier" required /> </div> <div><label className="block text-sm font-medium mb-1">Report Type <span className="text-red-600">*</span></label> <select value={tempCustodianReportType} onChange={(e) => setTempCustodianReportType(e.target.value)} className="w-full p-2 border rounded text-sm" required > <option value="">-- Select Report Type --</option> {attestationReportTypes.map(type => <option key={type} value={type}>{type}</option>)} </select> </div> <div><label className="block text-sm font-medium mb-1">Attestation Frequency <span className="text-red-600">*</span></label> <select value={tempAttestationFreq} onChange={(e)=> setTempAttestationFreq(e.target.value)} className="w-full p-2 border rounded text-sm" required> <option>Daily</option><option>Weekly</option><option>Monthly</option><option>Quarterly</option> </select> </div> <button type="submit" className="mt-2 px-4 py-2 rounded text-white hover:opacity-90 bg-yellow-600 disabled:opacity-50" disabled={!reserveDetails.selectedReserveCustodianName || !tempAttestationFreq || !tempCustodianAccountId || !tempCustodianReportType}>Setup Custodian Verification</button> </div> </form> )}
                                                        </div>
                                                    </div>
                                                </div>
                                                {/* On-Chain Wallet */}
                                                <div className={`border rounded p-3 cursor-pointer ${reserveDetails.backingType === 'onchain_wallet' ? 'border-yellow-600 bg-yellow-50' : 'border-gray-300 bg-white'}`} onClick={() => !reserveDetails.isConfigured && setReserveDetails({...reserveDetails, backingType: 'onchain_wallet'})} > {/* ... unchanged ... */} <div className="flex"> <input type="radio" name="backingType" className="mr-2 mt-1 focus:ring-yellow-600 h-4 w-4 text-yellow-600" checked={reserveDetails.backingType === 'onchain_wallet'} readOnly /> <div> <p className="font-medium">Direct On-Chain Wallet Connection</p> <p className="text-sm text-gray-600">Link directly to an on-chain wallet holding reserve assets</p> {reserveDetails.backingType === 'onchain_wallet' && !reserveDetails.isConfigured && ( <form onSubmit={handleConnectOnChainWallet} className="mt-3 p-3 border rounded bg-white"> <div className="space-y-3"> <div> <label className="block text-sm font-medium mb-1">Blockchain Network</label> <select value={tempOnChainNetwork} onChange={(e)=> setTempOnChainNetwork(e.target.value)} className="w-full p-2 border rounded text-sm" required> <option value="Ethereum">Ethereum</option> <option value="Polygon">Polygon</option> <option value="Hedera">Hedera</option> <option value="Solana">Solana</option> <option value="Stellar">Stellar</option> </select> </div> <div> <label className="block text-sm font-medium mb-1">Wallet Address</label> <input type="text" value={tempOnChainWalletAddress} onChange={(e)=> setTempOnChainWalletAddress(e.target.value)} className="w-full p-2 border rounded text-sm" placeholder="Enter wallet address" required /> </div> <button type="submit" className="mt-2 px-4 py-2 rounded text-white hover:opacity-90 bg-yellow-600 disabled:opacity-50" disabled={!tempOnChainNetwork || !tempOnChainWalletAddress}>Connect Wallet</button> </div> </form> )} </div> </div> </div>
                                            </div> {/* End reserve method choices div */}
                                        </div> // End conditional backing methods div
                                    )}
                                </div> // End Proof of Reserves Section div
                            )}

                            {/* Token Custody Arrangement Section */}
                            <div className="pt-6 border-t">
                                <h3 className="text-lg font-medium mb-4 text-gray-700">Token Custody Arrangement</h3>
                                <p className="text-sm text-gray-600 mb-3">Select how the newly issued tokens will be held and managed.</p>
                                <div className="space-y-3">
                                    {/* Self Custody Option */}
                                    <div className={`border rounded p-3 cursor-pointer ${tokenCustodyType === 'self' ? 'border-yellow-600 bg-yellow-50' : 'border-gray-300 bg-white'}`} onClick={() => setTokenCustodyType('self')}>
                                        <div className="flex items-center"> <input type="radio" name="tokenCustodyType" value="self" className="mr-2 focus:ring-yellow-600 h-4 w-4 text-yellow-600" checked={tokenCustodyType === 'self'} readOnly /> <div> <p className="font-medium">Self Custody</p> {tokenCustodyType === 'self' && ( <p className="text-xs text-gray-600 mt-1">Tokens will be managed using the platform's internal secure custody infrastructure.</p> )} </div> </div>
                                    </div>
                                    {/* Third Party Custodian Option */}
                                    <div className={`border rounded p-3 ${tokenCustodyType === 'thirdParty' ? 'border-yellow-600 bg-yellow-50' : 'border-gray-300 bg-white'}`}>
                                        <div className="flex items-start cursor-pointer" onClick={() => setTokenCustodyType('thirdParty')}> <input type="radio" name="tokenCustodyType" value="thirdParty" className="mr-2 mt-1 focus:ring-yellow-600 h-4 w-4 text-yellow-600 flex-shrink-0" checked={tokenCustodyType === 'thirdParty'} readOnly /> <div className="flex-grow"> <p className="font-medium">Third Party Custodian</p> </div> </div>
                                        {tokenCustodyType === 'thirdParty' && (
                                            <div className="mt-3 pl-6 space-y-3">
                                                <p className="text-xs text-gray-600">Select an integrated third-party custodian and verify the connection.</p>
                                                <div> <label className="block text-sm font-medium mb-1">Select Custodian <span className="text-red-600">*</span></label> <select value={selectedTokenCustodianName} onChange={(e) => setSelectedTokenCustodianName(e.target.value)} className="w-full p-2 border rounded text-sm bg-white disabled:bg-gray-100" required={tokenCustodyType === 'thirdParty'} disabled={tokenCustodyConnectionStatus === 'verified' || tokenCustodyConnectionLoading} > <option value="">-- Select Custodian --</option> {tokenCustodianOptions.map(name => <option key={name} value={name}>{name}</option>)} </select> </div>
                                                {/* *** UPDATED: Account ID Input *** */}
                                                <div> <label className="block text-sm font-medium mb-1">Custodian Account ID <span className="text-red-600">*</span></label> <input type="text" value={tokenCustodianAccountIdInput} onChange={(e) => setTokenCustodianAccountIdInput(e.target.value)} className="w-full p-2 border rounded text-sm disabled:bg-gray-100" placeholder="Enter Account Identifier provided by custodian" required={tokenCustodyType === 'thirdParty'} disabled={tokenCustodyConnectionStatus === 'verified' || tokenCustodyConnectionLoading || !selectedTokenCustodianName} /> </div>
                                                {/* Connection Status / Action Button */}
                                                <div className="pt-1">
                                                    {tokenCustodyConnectionStatus === 'idle' && ( <button type="button" onClick={handleVerifyTokenCustodyConnection} className="px-4 py-2 rounded text-white text-sm hover:opacity-90 bg-blue-600 disabled:opacity-50" disabled={!selectedTokenCustodianName || !tokenCustodianAccountIdInput || tokenCustodyConnectionLoading} > Verify Connection (Simulated) </button> )}
                                                    {tokenCustodyConnectionStatus === 'loading' && ( <div className="p-2 text-sm flex items-center justify-center text-blue-700"> <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"> <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle> <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path> </svg> Connecting... </div> )}
                                                    {tokenCustodyConnectionStatus === 'verified' && ( <div className="p-2 border rounded bg-green-50 border-green-200 text-xs space-y-1"> <p className="flex items-center text-green-700 font-medium"> <svg className="w-4 h-4 mr-1 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg> Connection Status: Verified </p> <p className="text-gray-600 ml-5">Custodian: {selectedTokenCustodianName}</p> <p className="text-gray-600 ml-5">Account ID: {tokenCustodianAccountIdInput || 'N/A'}</p> <button onClick={() => setTokenCustodyConnectionStatus('idle')} className="text-xs text-blue-600 hover:underline mt-1 ml-5">Edit Connection</button> </div> )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Metadata Section */}
                            <div> <label className="block mb-1 font-medium">Metadata Implementation</label> <textarea className="w-full p-2 border rounded" rows="3" placeholder="Enter JSON schema or metadata description (optional)" value={supplyDetails.metadata} onChange={(e) => setSupplyDetails({...supplyDetails, metadata: e.target.value})} ></textarea> <p className="text-xs text-gray-500 mt-1">Additional data fields to store with the token or transactions.</p> </div>

                            {/* Navigation Buttons */}
                            <div className="flex justify-between mt-8">
                                <button className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-50" onClick={() => setIssuanceScreen('token-details')} > Previous Step </button>
                                <button className="px-4 py-2 rounded text-white hover:opacity-90 bg-yellow-600 disabled:opacity-50" onClick={() => setIssuanceScreen('permissions')} disabled={!supplyDetails.initialSupply || !supplyDetails.decimals || (reservesRequired && !reserveDetails.isConfigured) || reserveConnectionLoading || tokenCustodyConnectionLoading} > Next Step </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 3: Permissions */}
                {issuanceScreen === 'permissions' && workflowState === 'idle' && (
                    <div>
                        <h2 className="text-xl font-medium mb-4 text-gray-800">Permissions</h2>
                        <p className="text-gray-600 mb-6">Configure token permissions and functional features.</p>
                        <div className="space-y-6">
                            {/* KYC */}
                             <div className="border rounded-lg p-4 bg-gray-50"> <div className="flex items-start mb-3"> <button type="button" role="switch" aria-checked={permissionDetails.kycEnabled} onClick={() => { const isEnabled = !permissionDetails.kycEnabled; setPermissionDetails({ ...permissionDetails, kycEnabled: isEnabled, kycLevel: isEnabled ? permissionDetails.kycLevel : '' }); }} className={`${ permissionDetails.kycEnabled ? 'bg-yellow-600' : 'bg-gray-300' } relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-600 mr-3`} > <span className="sr-only">Enable KYC Permissions</span> <span aria-hidden="true" className={`${ permissionDetails.kycEnabled ? 'translate-x-5' : 'translate-x-0' } pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`} /> </button> <div className="flex-1"> <p className="font-medium inline">KYC Required</p> <span className="text-xs text-gray-500 ml-2">(This can be changed later within admin panel)</span> <p className="text-sm text-gray-600 mt-1"> Require accounts to be KYC verified before holding or transferring tokens.<br /> If true every account associated with this token must have selected KYC levels. </p> </div> </div> {permissionDetails.kycEnabled && ( <div className="ml-6"> <label className="block text-sm font-medium mb-1 text-gray-700">Minimum KYC Level <span className="text-red-600">*</span></label> <select className="w-full p-2 border rounded bg-white" value={permissionDetails.kycLevel} onChange={(e) => setPermissionDetails({...permissionDetails, kycLevel: e.target.value})} required={permissionDetails.kycEnabled} > <option value="" disabled>-- Select Minimum Level --</option> {kycLevels.map(level => <option key={level} value={level}>{level}</option>)} </select> <p className="text-xs text-gray-500 mt-1">Minimum level of KYC required to interact with this token.</p> </div> )} </div>
                            {/* *** UPDATED Fee Schedule Section - Combined Fees *** */}
                            <div className="border rounded-lg p-4 bg-gray-50">
                                <label className="flex items-center mb-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="mr-2 h-4 w-4 text-yellow-600 focus:ring-yellow-600"
                                        checked={permissionDetails.feeScheduleEnabled}
                                        onChange={(e) => setPermissionDetails({...permissionDetails, feeScheduleEnabled: e.target.checked})}
                                    />
                                    <div>
                                        <p className="font-medium">Enable Fee Schedule</p>
                                        <p className="text-sm text-gray-600">Apply transaction fees when tokens are transferred.</p>
                                    </div>
                                </label>
                                {permissionDetails.feeScheduleEnabled && (
                                    <div className="ml-6 mt-2 p-3 border rounded bg-white space-y-4">
                                        {/* Percentage Fee Input */}
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Percentage Fee (%) <span className="text-red-600">*</span></label>
                                            <input
                                                type="number" step="0.01" min="0" max="100"
                                                className="w-full p-2 border rounded text-sm"
                                                placeholder="e.g. 0.5 (Enter 0 if none)"
                                                value={permissionDetails.feeDetails.overallFeePercentage}
                                                onChange={(e) => setPermissionDetails({...permissionDetails, feeDetails: {...permissionDetails.feeDetails, overallFeePercentage: e.target.value}})}
                                                required={permissionDetails.feeScheduleEnabled && !permissionDetails.feeDetails.flatFeeAmount} // Required if no flat fee
                                            />
                                             <p className="text-xs text-gray-500 mt-1">Percentage fee applied to each transaction amount.</p>
                                        </div>
                                        {/* Flat Fee Input */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Flat Fee Amount (Optional)</label>
                                                <input
                                                    type="number" step="any" min="0"
                                                    className="w-full p-2 border rounded text-sm"
                                                    placeholder="e.g. 5.00 (Enter 0 if none)"
                                                    value={permissionDetails.feeDetails.flatFeeAmount}
                                                    onChange={(e) => setPermissionDetails({...permissionDetails, feeDetails: {...permissionDetails.feeDetails, flatFeeAmount: e.target.value}})}
                                                    required={permissionDetails.feeScheduleEnabled && !permissionDetails.feeDetails.overallFeePercentage} // Required if no percentage fee
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Flat Fee Currency</label>
                                                {/* Simple display for demo, could be a select */}
                                                <input type="text" value={permissionDetails.feeDetails.flatFeeCurrency} readOnly className="w-full p-2 border rounded text-sm bg-gray-100" />
                                            </div>
                                        </div>
                                         <p className="text-xs text-gray-500">Optional fixed fee added to each transaction.</p>

                                        {/* Fee Recipient List */}
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Fee Recipient Allocation <span className="text-red-600">*</span></label>
                                            <p className="text-xs text-gray-500 mb-2">Allocate the collected fee (Percentage + Flat) among one or more recipients. Allocations must total 100%.</p>
                                            {permissionDetails.feeDetails.recipients.map((recipient, index) => (
                                                <div key={recipient.id} className="flex items-center space-x-2 mb-2 border-b pb-2">
                                                    <input
                                                        type="text"
                                                        placeholder={`Recipient ${index + 1} Address`}
                                                        value={recipient.address}
                                                        onChange={(e) => handleUpdateFeeRecipient(recipient.id, 'address', e.target.value)}
                                                        className="flex-grow p-2 border rounded text-sm"
                                                        required
                                                    />
                                                    <input
                                                        type="number"
                                                        min="0" max="100" step="0.1"
                                                        placeholder="%"
                                                        value={recipient.percentage}
                                                        onChange={(e) => handleUpdateFeeRecipient(recipient.id, 'percentage', e.target.value)}
                                                        className="w-20 p-2 border rounded text-sm"
                                                        required
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveFeeRecipient(recipient.id)}
                                                        className="px-2 py-1 text-red-600 hover:text-red-800 text-xs"
                                                        title="Remove Recipient"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            ))}
                                            <button
                                                type="button"
                                                onClick={handleAddFeeRecipient}
                                                className="mt-2 px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50"
                                            >
                                                + Add Recipient
                                            </button>
                                            {/* Total Percentage Display & Validation */}
                                            <div className="mt-2 text-sm font-medium">
                                                {/* *** UPDATED Percentage formatting *** */}
                                                Total Allocated: {totalFeePercentageAllocated.toFixed(0)}%
                                                {permissionDetails.feeDetails.recipients.length > 0 && Math.abs(totalFeePercentageAllocated - 100) > 0.001 && (
                                                    <span className="text-red-600 ml-2">(Must equal 100%)</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            {/* Pausable & Fungibility */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> <div className="border rounded-lg p-4 bg-gray-50"> <label className="flex items-center mb-2 cursor-pointer"> <input type="checkbox" className="mr-2 h-4 w-4 text-yellow-600 focus:ring-yellow-600" checked={permissionDetails.pausable} onChange={(e) => setPermissionDetails({...permissionDetails, pausable: e.target.checked})} /> <div><p className="font-medium">Pausable Transactions</p><p className="text-sm text-gray-600">Ability to temporarily pause token transfers</p></div> </label> </div> <div className="border rounded-lg p-4 bg-gray-50"> <p className="font-medium mb-2">Token Fungibility</p> <div className="space-x-4"><label className="inline-flex items-center"><input type="radio" name="fungibility" className="mr-1 text-yellow-600 focus:ring-yellow-600" checked={permissionDetails.fungible} onChange={() => setPermissionDetails({...permissionDetails, fungible: true})} /><span className="text-sm">Fungible</span></label> <label className="inline-flex items-center"><input type="radio" name="fungibility" className="mr-1 text-yellow-600 focus:ring-yellow-600" checked={!permissionDetails.fungible} onChange={() => setPermissionDetails({...permissionDetails, fungible: false})} /><span className="text-sm">Non-Fungible (NFT)</span></label></div> </div> </div>
                            {/* Expiration */}
                            <div className="border rounded-lg p-4 bg-gray-50"> <label className="flex items-center cursor-pointer mb-2"> <input type="checkbox" className="mr-2 h-4 w-4 text-yellow-600 focus:ring-yellow-600" checked={permissionDetails.isExpirationEnabled} onChange={(e) => { const isEnabled = e.target.checked; setPermissionDetails({ ...permissionDetails, isExpirationEnabled: isEnabled, expiration: isEnabled ? permissionDetails.expiration : '' }); }} /> <span className="font-medium">Enable Token Expiration</span> </label> <p className="text-sm text-gray-600 mb-2 ml-6">Set a date when the token becomes invalid or unusable (optional).</p> <input type="date" className={`w-full p-2 border rounded ${!permissionDetails.isExpirationEnabled ? 'bg-gray-100' : ''}`} min={new Date().toISOString().split('T')[0]} value={permissionDetails.expiration} onChange={(e) => setPermissionDetails({...permissionDetails, expiration: e.target.value})} disabled={!permissionDetails.isExpirationEnabled} required={permissionDetails.isExpirationEnabled} /> </div>
                            {/* Role Assignments */}
                            <div className="border rounded-lg p-4 bg-gray-50">
                                <label className="block mb-2"><span className="font-medium">Role Assignments</span><p className="text-sm text-gray-600">Assign administrative roles for this token</p></label>
                                <form onSubmit={handleAddRole} className="flex space-x-2 items-center">
                                    <select className="flex-1 p-2 border rounded" value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)} >
                                        <option value="">Select Role</option>
                                        {roleOptions.map(role => <option key={role} value={role}>{role}</option>)}
                                    </select>
                                    <input type="text" className="flex-1 p-2 border rounded" placeholder="Account address (e.g., 0x...)" value={roleAddress} onChange={(e) => setRoleAddress(e.target.value)} />
                                    <button className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50" disabled={!selectedRole || !roleAddress} type="submit" > Add </button>
                                </form>
                                <div className="mt-4 p-3 border rounded bg-white min-h-[50px]"> {permissionDetails.roles.length === 0 ? (<p className="text-sm text-gray-500 italic">No roles assigned yet. Add a role above.</p>) : (<ul className="space-y-1 list-disc list-inside">{permissionDetails.roles.map((roleItem, index) => (<li key={index} className="text-sm"><strong>{roleItem.role}:</strong> {roleItem.address}</li>))}</ul>)} </div>
                            </div>
                        </div>
                        {/* Navigation */}
                        <div className="flex justify-between mt-8">
                            <button className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-50" onClick={() => setIssuanceScreen('supply-reserves-metadata')} > Previous Step </button>
                            <button className="px-4 py-2 rounded text-white hover:opacity-90 bg-yellow-600 disabled:opacity-50" onClick={() => setIssuanceScreen('finalization')}
                                // *** UPDATED Disable condition for Fee Schedule ***
                                disabled={
                                    (permissionDetails.kycEnabled && !permissionDetails.kycLevel) ||
                                    (permissionDetails.isExpirationEnabled && !permissionDetails.expiration) ||
                                    // Fee validation: if enabled, must have EITHER % OR flat fee > 0, AND if % > 0, recipients must be valid and sum to 100
                                    (permissionDetails.feeScheduleEnabled &&
                                        (permissionDetails.feeDetails.overallFeePercentage <= 0 && permissionDetails.feeDetails.flatFeeAmount <= 0) || // Must have at least one fee type amount
                                        (permissionDetails.feeDetails.overallFeePercentage > 0 && // If percentage fee exists...
                                            (permissionDetails.feeDetails.recipients.length === 0 || // ..must have recipients
                                             Math.abs(totalFeePercentageAllocated - 100) > 0.001 || // ..must sum to 100
                                             permissionDetails.feeDetails.recipients.some(r => !r.address || !r.percentage || parseFloat(r.percentage) <= 0)) // ..each recipient must be valid
                                        )
                                    )
                                }
                            > Next Step </button>
                        </div>
                    </div>
                )}

                {/* Step 4: Finalization & Workflow */}
                {issuanceScreen === 'finalization' && ( <div> {/* ... Step 4 JSX including summary and workflow unchanged ... */ } <h2 className="text-xl font-medium mb-4 text-gray-800">Finalization</h2> {workflowState !== 'idle' && ( <div className={`mb-6 p-4 border rounded-lg ${workflowState === 'rejected' ? 'bg-red-50 border-red-300' : 'bg-blue-50 border-blue-300'}`}> <h3 className={`text-lg font-semibold mb-2 ${workflowState === 'rejected' ? 'text-red-800' : 'text-blue-800'}`}>Issuance Request Status</h3> <p className={`mb-3 ${workflowState === 'rejected' ? 'text-red-700' : 'text-blue-700'}`}>{workflowMessage}</p> {isLoading && <p className="text-sm text-gray-500 italic mb-3">Processing...</p>} {workflowState === 'pending_compliance' && !isLoading && ( <div className="flex space-x-3"> <button onClick={() => handleApproval('compliance')} className="px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm">Approve (Compliance)</button> <button onClick={() => handleReject('Compliance')} className="px-4 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm">Reject (Compliance)</button> </div> )} {workflowState === 'pending_management' && !isLoading && ( <div className="flex space-x-3"> <button onClick={() => handleApproval('management')} className="px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm">Approve (Management)</button> <button onClick={() => handleReject('Management')} className="px-4 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm">Reject (Management)</button> </div> )} {workflowState === 'rejected' && ( <p className="text-red-700 font-medium">Reason: {rejectReason}</p> )} {workflowState === 'approved' && !isLoading && ( <button onClick={handleExecuteIssue} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-bold"> Confirm & Issue Token </button> )} </div> )} {workflowState === 'idle' && ( <> <p className="text-gray-600 mb-6">Review details below and click 'Request Issuance Approval' to proceed.</p> <div className='p-4 border rounded bg-gray-50 mb-6 space-y-2 text-sm'> {/* Summary Updated */} <p><strong>Name:</strong> {tokenDetails.name || 'N/A'}</p> <p><strong>Symbol:</strong> {tokenDetails.symbol || 'N/A'}</p> <p><strong>Blockchain:</strong> {tokenDetails.blockchain || 'N/A'}</p> <p><strong>Token Type:</strong> {tokenDetails.tokenType || 'N/A'}</p> {tokenDetails.tokenType === 'RWA' && <p><strong>RWA Type:</strong> {tokenDetails.rwaSubType || 'N/A'}</p>} {tokenDetails.tokenType === 'CapitalAsset' && <p><strong>Capital Asset Type:</strong> {tokenDetails.capitalAssetSubType || 'N/A'}</p>} {tokenDetails.tokenType === 'Currency' && <p><strong>Currency Type:</strong> {tokenDetails.currencySubType || 'N/A'}</p>} <p><strong>Amount to Issue:</strong> {supplyDetails.initialSupply ? parseFloat(supplyDetails.initialSupply).toLocaleString() : 'N/A'}</p> <p><strong>Market Value:</strong> {supplyDetails.marketValueAmount ? `${parseFloat(supplyDetails.marketValueAmount).toLocaleString()} ${supplyDetails.marketValueCurrency}` : 'N/A'}</p> <p><strong>Supply Type:</strong> {supplyDetails.supplyType === 'finite' ? 'Finite' : 'Infinite'}</p> <p><strong>Decimals:</strong> {supplyDetails.decimals}</p> <p><strong>KYC Enabled:</strong> {permissionDetails.kycEnabled ? `Yes (Level: ${permissionDetails.kycLevel || 'Not Set'})` : 'No'}</p> {/* Fee Summary */} <p><strong>Fees Enabled:</strong> {permissionDetails.feeScheduleEnabled ? `Yes` : 'No'}</p> {permissionDetails.feeScheduleEnabled && ( <div className='ml-4'> <p>Percentage Fee: {permissionDetails.feeDetails.overallFeePercentage || 0}%</p> <p>Flat Fee: {permissionDetails.feeDetails.flatFeeAmount || 0} {permissionDetails.feeDetails.flatFeeCurrency}</p> <p>Fee Distribution:</p> {permissionDetails.feeDetails.recipients.length > 0 ? (<ul className='list-disc list-inside ml-4'>{permissionDetails.feeDetails.recipients.map((r, i) => <li key={i}>{r.address}: {r.percentage}%</li>)}</ul>) : (<p className='ml-4 italic'>Recipient Required!</p>)} </div> )} <p><strong>Pausable:</strong> {permissionDetails.pausable ? 'Yes' : 'No'}</p> <p><strong>Fungible:</strong> {permissionDetails.fungible ? 'Yes' : 'No'}</p> <p><strong>Expiration Enabled:</strong> {permissionDetails.isExpirationEnabled ? `Yes (Date: ${permissionDetails.expiration || 'Not Set'})` : 'No'}</p> <p><strong>Roles:</strong></p> {permissionDetails.roles.length > 0 ? ( <ul className='list-disc list-inside ml-4'>{permissionDetails.roles.map((r, i) => <li key={i}>{r.role}: {r.address}</li>)}</ul> ) : ( <p className='ml-4 italic'>None specified</p> )} <p><strong>Regulatory Info:</strong></p> {regulatoryInfo.length > 0 ? ( <ul className='list-disc list-inside ml-4'>{regulatoryInfo.map((info, i) => <li key={i}>{info.country}: {info.regulator}</li>)}</ul> ) : ( <p className='ml-4 italic'>None specified</p> )} <p><strong>Asset Backed:</strong> {reserveDetails.isBackedAsset ? 'Yes' : 'No'}</p> {reserveDetails.isBackedAsset && reserveDetails.isConfigured && ( <div className='ml-4'><p><strong>Backing Type:</strong> {reserveDetails.backingType}</p> {reserveDetails.backingType === 'bank' && <p>Bank Name: {reserveDetails.bankName}, Account ending: {reserveDetails.accountNumberLast4}</p>} {reserveDetails.backingType === 'smartcontract' && <p>Network: {reserveDetails.contractNetwork}, Address: {reserveDetails.contractAddress}</p>} {reserveDetails.backingType === 'custodian' && <p>Custodian: {reserveDetails.custodianName} (Acct: {reserveDetails.custodianAccountId || 'N/A'}, Report: {reserveDetails.custodianReportType || 'N/A'}, Freq: {reserveDetails.attestationFrequency})</p>} {reserveDetails.backingType === 'onchain_wallet' && <p>Network: {reserveDetails.onChainNetwork}, Address: {reserveDetails.onChainWalletAddress}</p>} </div> )} {reserveDetails.isBackedAsset && !reserveDetails.isConfigured && <p className='ml-4 text-red-600'>Reserve details not configured!</p>} <p><strong>Token Custody:</strong> {tokenCustodyType === 'self' ? 'Self Custody (Platform Internal)' : `Third Party (${selectedTokenCustodianName || 'Not Selected'})`}</p> {tokenCustodyType === 'thirdParty' && tokenCustodyConnectionStatus === 'verified' && <p className='ml-4'>Custodian Account ID: {tokenCustodianAccountIdInput || 'N/A'}</p>} </div> </> )} <div className="flex justify-between mt-8"> { workflowState === 'idle' ? ( <button className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-50" onClick={() => setIssuanceScreen('permissions')} > Previous Step </button> ) : ( <div /> )} { workflowState === 'idle' ? ( <button className="px-4 py-2 rounded text-white hover:opacity-90 bg-green-600 disabled:opacity-50" onClick={handleInitiateIssuanceApproval} disabled={ (reservesRequired && !reserveDetails.isConfigured) || (permissionDetails.kycEnabled && !permissionDetails.kycLevel) || (permissionDetails.isExpirationEnabled && !permissionDetails.expiration) || (tokenCustodyType === 'thirdParty' && tokenCustodyConnectionStatus !== 'verified') || (permissionDetails.feeScheduleEnabled && (permissionDetails.feeDetails.overallFeePercentage <= 0 && permissionDetails.feeDetails.flatFeeAmount <= 0)) || (permissionDetails.feeScheduleEnabled && permissionDetails.feeDetails.overallFeePercentage > 0 && (permissionDetails.feeDetails.recipients.length === 0 || Math.abs(totalFeePercentageAllocated - 100) > 0.001 || permissionDetails.feeDetails.recipients.some(r => !r.address || !r.percentage || parseFloat(r.percentage) <= 0))) } > Request Issuance Approval </button> ) : ( <div/> )} </div> </div> )}

                {/* Fallback */}
                {issuanceScreen !== 'token-details' && issuanceScreen !== 'supply-reserves-metadata' && issuanceScreen !== 'permissions' && issuanceScreen !== 'finalization' && ( <p className="text-red-500">Error: Invalid issuance screen state.</p> )}

            </div>
        </div>
    );
};

export default TokenIssuanceWizard;
