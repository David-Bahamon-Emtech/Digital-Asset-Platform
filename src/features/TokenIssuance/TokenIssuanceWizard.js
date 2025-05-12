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
    'Gold (Troy Ounce)': '3254.90',
    'Silver (Troy Ounce)': '31.73',
    'Oil (Brent Crude Barrel)': '64.71'
};
const kycLevels = ["Simplified Due Diligence (SDD)", "Basic/Standard Due Diligence (CDD)", "Enhanced Due Diligence (EDD)"];
const bankNameOptions = ["JPMorgan Chase", "Citibank", "Bank of America", "Wells Fargo", "Goldman Sachs"];
const reserveCustodianOptions = ["BitGo", "Coinbase Custody", "Fireblocks", "Anchorage Digital", "Copper.co"];
const tokenCustodianOptions = ["Coinbase Custody", "Fireblocks", "BitGo", "Anchorage Digital", "Copper.co"];
const attestationReportTypes = ["Proof of Reserves Report", "SOC 2 Report (Relevant Controls)", "Agreed-Upon Procedures Report"];
const roleOptions = ["Treasurer", "Minter", "Burner", "Pauser", "KYC Administrator"];

// --- Helper Components ---

// Simple progress indicator
const ProgressSteps = ({ currentStep, steps, workflowState }) => {
    const stepMap = { 'token-details': 0, 'supply-reserves-metadata': 1, 'permissions': 2, 'finalization': 3 };
    const currentStepIndex = stepMap[currentStep] ?? -1;

    // Don't show steps if workflow is active before finalization step
    if (workflowState !== 'idle' && currentStep !== 'finalization') return null;

    const activeIndex = (workflowState !== 'idle' && currentStep === 'finalization')
        ? steps.length - 1
        : currentStepIndex;

    return (
        <div className="mb-8">
            <div className="flex items-center justify-between">
                {steps.map((step, index) => (
                    <React.Fragment key={step}>
                        <div className="w-1/4 text-center px-1">
                            <div className={`rounded-full h-10 w-10 flex items-center justify-center mx-auto ${
                                index < activeIndex ? 'bg-green-600 text-white' :
                                (index === activeIndex ? 'bg-yellow-600 text-white' : 'bg-gray-200 text-gray-600')
                            }`}>
                                {index < activeIndex ? '✓' : index + 1}
                            </div>
                            <p className={`mt-1 text-xs sm:text-sm ${index <= activeIndex ? 'font-medium text-gray-800' : 'text-gray-500'}`}>{step}</p>
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

// Input field wrapper
const InputField = ({ label, id, children, required, helpText }) => (
    <div>
        <label htmlFor={id} className="block mb-1 font-medium">
            {label} {required && <span className="text-red-600">*</span>}
        </label>
        {children}
        {helpText && <p className="text-xs text-gray-500 mt-1">{helpText}</p>}
    </div>
);

// Radio button group helper
const RadioGroup = ({ options, selectedValue, onChange, name }) => (
    <div className="grid grid-cols-2 gap-4 mt-2">
        {options.map(({ value, label, description }) => (
            <div
                key={value}
                className={`border rounded p-3 cursor-pointer ${selectedValue === value ? 'border-yellow-600 bg-yellow-50' : 'border-gray-300'}`}
                onClick={() => onChange(value)}
            >
                <div className="flex items-center">
                    <input
                        type="radio"
                        name={name}
                        className="mr-2 focus:ring-yellow-600 h-4 w-4 text-yellow-600"
                        checked={selectedValue === value}
                        readOnly
                    />
                    <div>
                        <p className="font-medium">{label}</p>
                        {description && <p className="text-xs text-gray-500">{description}</p>}
                    </div>
                </div>
            </div>
        ))}
    </div>
);

// --- Main Wizard Component ---
const TokenIssuanceWizard = ({ onBack, onIssue }) => {
    // --- State ---
    const [issuanceScreen, setIssuanceScreen] = useState('token-details'); // 'token-details', 'supply-reserves-metadata', 'permissions', 'finalization'
    const [tokenDetails, setTokenDetails] = useState({ name: '', symbol: '', blockchain: '', tokenType: '', rwaSubType: '', capitalAssetSubType: '', currencySubType: '' });
    const [supplyDetails, setSupplyDetails] = useState({ initialSupply: '', supplyType: 'finite', decimals: '18', metadata: '', marketValueCurrency: 'USD', marketValueAmount: '', });
    const [permissionDetails, setPermissionDetails] = useState({
        kycEnabled: false, kycLevel: '',
        feeScheduleEnabled: false,
        feeDetails: { overallFeePercentage: '', flatFeeAmount: '', flatFeeCurrency: 'USD', recipients: [] },
        pausable: true, fungible: true,
        isExpirationEnabled: false, expiration: '',
        roles: []
    });
    const [reserveDetails, setReserveDetails] = useState({ isBackedAsset: false, backingType: '', selectedBankName: '', bankName: '', accountNumberFull: '', accountNumberLast4: '', contractNetwork: '', contractAddress: '', selectedReserveCustodianName: '', custodianName: '', custodianAccountId: '', custodianReportType: '', attestationFrequency: '', onChainNetwork: '', onChainWalletAddress: '', isConfigured: false });
    const [regulatoryInfo, setRegulatoryInfo] = useState([]); // Array of { country: string, regulator: string }
    const [tokenCustodyType, setTokenCustodyType] = useState('self'); // 'self' or 'thirdParty'
    const [selectedTokenCustodianName, setSelectedTokenCustodianName] = useState('');
    const [tokenCustodianAccountIdInput, setTokenCustodianAccountIdInput] = useState('');
    const [tokenCustodyConnectionLoading, setTokenCustodyConnectionLoading] = useState(false);
    const [tokenCustodyConnectionStatus, setTokenCustodyConnectionStatus] = useState('idle'); // 'idle', 'loading', 'verified'

    // Temporary state for inputs not directly part of the final data model
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
    const [workflowState, setWorkflowState] = useState('idle'); // 'idle', 'pending_compliance', 'pending_management', 'approved', 'rejected'
    const [workflowMessage, setWorkflowMessage] = useState('');
    const [rejectReason, setRejectReason] = useState('');
    const [isLoading, setIsLoading] = useState(false); // For async operations like approval/rejection
    const [finalTokenData, setFinalTokenData] = useState(null); // Stores compiled data before execution

    // --- Memoized Calculations ---

    // Calculate total fee percentage allocated to recipients
    const totalFeePercentageAllocated = useMemo(() => {
        return permissionDetails.feeDetails.recipients.reduce((sum, recipient) => {
            const percentage = parseFloat(recipient.percentage);
            return sum + (isNaN(percentage) ? 0 : percentage);
        }, 0);
    }, [permissionDetails.feeDetails.recipients]);

    // Determine if the RWA type has a hardcoded market value
    const isHardcodedRWA = useMemo(() =>
        tokenDetails.tokenType === 'RWA' && tokenDetails.rwaSubType in hardcodedRwaValues,
        [tokenDetails.tokenType, tokenDetails.rwaSubType]
    );

    // Determine if reserves are required for the selected token type/subtype
    const reservesRequired = useMemo(() =>
        tokenDetails.tokenType === 'RWA' ||
        tokenDetails.tokenType === 'CapitalAsset' ||
        (tokenDetails.tokenType === 'Currency' && tokenDetails.currencySubType === 'Asset Backed Stablecoin'),
        [tokenDetails.tokenType, tokenDetails.currencySubType]
    );

    // Determine if the reserves section should be shown at all
    const showReservesSection = useMemo(() =>
        tokenDetails.tokenType === 'RWA' || tokenDetails.tokenType === 'CapitalAsset' || tokenDetails.tokenType === 'Currency',
        [tokenDetails.tokenType]
    );

    // Generate example text based on token details
    const exampleText = useMemo(() => {
        const supplyValue = parseFloat(supplyDetails.initialSupply);
        // Format supply with commas, handle non-numeric/zero cases
        const supplyFormatted = supplyValue && supplyValue > 0 ? supplyValue.toLocaleString() : 'INPUT AMOUNT';
        // Use 'INPUT AMOUNT' as a placeholder if supply is not valid yet.
        const supplyDisplay = supplyValue && supplyValue > 0 ? supplyFormatted : 'INPUT AMOUNT';

        const { tokenType, rwaSubType, capitalAssetSubType, currencySubType, name } = tokenDetails;

        // Return empty if essential details are missing for a meaningful example
        if (!supplyDetails.initialSupply || !tokenType || (tokenType === 'RWA' && !rwaSubType) || (tokenType === 'CapitalAsset' && !capitalAssetSubType) || (tokenType === 'Currency' && !currencySubType)) {
            return 'Enter Initial Supply and select Token Type details to see an example.'; // Provide clearer guidance
        }

        let description = '';
        let unitName = '';

        switch (tokenType) {
            case 'RWA':
                // Extract unit from subtype if possible (e.g., "Troy Ounce" from "Gold (Troy Ounce)")
                const rwaMatch = rwaSubType.match(/\(([^)]+)\)/);
                unitName = rwaMatch ? rwaMatch[1] : rwaSubType; // Use text in parentheses or the full subtype name
                 // Special handling for Real Estate for better phrasing
                if (rwaSubType === 'Real Estate') {
                     description = `${supplyDisplay} tokens representing fractional ownership of the specified ${rwaSubType} asset will be created.`;
                 } else {
                     description = `${supplyDisplay} tokens representing ${supplyDisplay} ${unitName} of ${rwaSubType.replace(rwaMatch ? ` (${rwaMatch[1]})` : '', '')} will be created.`; // Construct the sentence
                 }
                break;
            case 'CapitalAsset':
                unitName = capitalAssetSubType;
                // Special handling for Company Stock to use the token name
                if (capitalAssetSubType === 'Company Stock') {
                    description = `${supplyDisplay} tokens representing ${supplyDisplay} Shares of ${name || capitalAssetSubType} will be created.`;
                 } else {
                     description = `${supplyDisplay} tokens representing ${supplyDisplay} units of ${unitName} will be created.`;
                 }
                break;
            case 'Currency':
                if (currencySubType === 'Asset Backed Stablecoin') {
                     // Keep specific phrasing for stablecoins as it involves backing assets
                    description = `${supplyDisplay} ${currencySubType}s backed by corresponding reserve assets will be created.`;
                } else if (currencySubType === 'CBDC' || currencySubType === 'Cryptocurrency') {
                     // Specific phrasing for unbacked currency types
                    description = `${supplyDisplay} ${currencySubType.toLowerCase()} tokens will be created.`; // Use lowercase
                } else {
                     // Fallback for other potential currency types
                     description = `${supplyDisplay} ${currencySubType} tokens will be created.`;
                }
                break;
            default:
                 // Generic fallback if token type is somehow unrecognized
                description = `${supplyDisplay} tokens will be created.`;
                break;
        }
        // Replace placeholder if supply was invalid
        return description.replace(/INPUT AMOUNT/g, supplyDisplay);

    }, [supplyDetails.initialSupply, tokenDetails]);

    // --- Validation Logic for Final Step Button ---
    const isFinalStepValid = useMemo(() => {
        const amountToIssue = parseFloat(supplyDetails.initialSupply || 0);

        // Basic Details Checks
        if (!tokenDetails.name || !tokenDetails.symbol || !tokenDetails.blockchain || !tokenDetails.tokenType) return false;
        if (tokenDetails.tokenType === 'RWA' && !tokenDetails.rwaSubType) return false;
        if (tokenDetails.tokenType === 'CapitalAsset' && !tokenDetails.capitalAssetSubType) return false;
        if (tokenDetails.tokenType === 'Currency' && !tokenDetails.currencySubType) return false;

        // Supply Checks
        if (!amountToIssue || amountToIssue <= 0) return false;

        // Reserve Checks
        if (reservesRequired && !reserveDetails.isConfigured) return false;
        if (reserveDetails.isBackedAsset && reserveDetails.backingType === 'custodian' && reserveDetails.isConfigured) {
            if (!reserveDetails.custodianAccountId || !reserveDetails.custodianReportType) return false;
        }

        // Permission Checks
        if (permissionDetails.kycEnabled && !permissionDetails.kycLevel) return false;
        if (permissionDetails.isExpirationEnabled && !permissionDetails.expiration) return false;

        // Token Custody Checks
        if (tokenCustodyType === 'thirdParty') {
            if (!selectedTokenCustodianName || tokenCustodyConnectionStatus !== 'verified') return false;
        }

        // Fee Validation Checks
        if (permissionDetails.feeScheduleEnabled) {
            const percFee = parseFloat(permissionDetails.feeDetails.overallFeePercentage) || 0;
            const flatFee = parseFloat(permissionDetails.feeDetails.flatFeeAmount) || 0;
            // Must have at least one fee type configured if fees are enabled
            if (percFee <= 0 && flatFee <= 0) return false;

            // If percentage fee is used, recipients must be valid
            if (percFee > 0) {
                if (permissionDetails.feeDetails.recipients.length === 0) return false;
                const invalidRecipient = permissionDetails.feeDetails.recipients.some(r =>
                    !r.address || typeof r.address !== 'string' || r.address.trim() === '' || !(parseFloat(r.percentage) > 0)
                );
                if (invalidRecipient) return false;
                if (Math.abs(totalFeePercentageAllocated - 100) > 0.001) return false; // Must total 100%
            }
        }

        // All checks passed
        return true;
    }, [
        tokenDetails, supplyDetails, permissionDetails, reserveDetails, regulatoryInfo,
        tokenCustodyType, selectedTokenCustodianName, tokenCustodyConnectionStatus,
        totalFeePercentageAllocated, reservesRequired
    ]);


    // --- Effects ---

    // Auto-fill market value for hardcoded RWA types
    useEffect(() => {
        if (isHardcodedRWA) {
            const valueToSet = hardcodedRwaValues[tokenDetails.rwaSubType];
            setSupplyDetails(prev => ({ ...prev, marketValueCurrency: 'USD', marketValueAmount: valueToSet }));
        }
    }, [isHardcodedRWA, tokenDetails.rwaSubType]); // Added isHardcodedRWA dependency

    // Update workflow message based on state
    useEffect(() => {
        setIsLoading(false); // Ensure loading is reset when state changes
        switch (workflowState) {
            case 'pending_compliance': setWorkflowMessage('Issuance request sent to Compliance for review.'); break;
            case 'pending_management': setWorkflowMessage('Compliance approved. Request sent to Management for final review.'); break;
            case 'approved': setWorkflowMessage('Issuance request fully approved. Ready to execute.'); break;
            case 'rejected': setWorkflowMessage('Issuance request rejected.'); break;
            default: setWorkflowMessage(''); setRejectReason(''); setFinalTokenData(null); break;
        }
    }, [workflowState]);

    // Reset token custody connection status if custodian changes
    useEffect(() => {
        setTokenCustodyConnectionStatus('idle');
        // Keep account ID if user just re-selects the same custodian? Maybe clear it? Clearing seems safer.
        // setTokenCustodianAccountIdInput('');
    }, [selectedTokenCustodianName]);


    // --- Event Handlers ---

    // Fee Recipient Management
    const handleAddFeeRecipient = () => {
        setPermissionDetails(prev => ({ ...prev, feeDetails: { ...prev.feeDetails, recipients: [ ...prev.feeDetails.recipients, { id: Date.now(), address: '', percentage: '' } ] } }));
    };
    const handleRemoveFeeRecipient = (idToRemove) => {
        setPermissionDetails(prev => ({ ...prev, feeDetails: { ...prev.feeDetails, recipients: prev.feeDetails.recipients.filter(r => r.id !== idToRemove) } }));
    };
    const handleUpdateFeeRecipient = (id, field, value) => {
        setPermissionDetails(prev => ({ ...prev, feeDetails: { ...prev.feeDetails, recipients: prev.feeDetails.recipients.map(r => r.id === id ? { ...r, [field]: value } : r ) } }));
    };

    // Role Management
    const handleAddRole = (event) => {
        event.preventDefault();
        if (!selectedRole || !roleAddress.trim()) {
            alert('Please select a role and enter a valid address.'); return;
        }
        const newRole = { role: selectedRole, address: roleAddress.trim() }; // Trim address
        setPermissionDetails(prev => ({ ...prev, roles: [...prev.roles, newRole] }));
        setSelectedRole('');
        setRoleAddress('');
    };
    // Consider adding handleRemoveRole if needed

    // Regulatory Info Management
    const handleAddRegulatoryInfo = (event) => {
        event.preventDefault();
        if (!selectedCountry || !regulatorName.trim()) {
            alert('Please select a country and enter a regulator name.'); return;
        }
        const newInfo = { country: selectedCountry, regulator: regulatorName.trim() };
        setRegulatoryInfo(prev => [...prev, newInfo]);
        setSelectedCountry(''); // Reset selection
        setRegulatorName('');
    };
     // Consider adding handleRemoveRegulatoryInfo if needed

    // Reserve Connection Handlers (Simulated)
    const simulateConnection = (updateLogic) => {
        if (reserveConnectionLoading) return;
        setReserveConnectionLoading(true);
        console.log("Simulating reserve connection...");
        setTimeout(() => {
            setReserveDetails(updateLogic);
            setReserveConnectionLoading(false);
            console.log("Reserve Connection: Approved (Simulated)");
        }, 1500); // Simulate network delay
    };

    const handleConnectBank = (event) => {
        event.preventDefault();
        if (!reserveDetails.selectedBankName || !tempAccountNumber) return;
        simulateConnection(prev => ({
            ...prev,
            bankName: prev.selectedBankName,
            accountNumberFull: tempAccountNumber, // Store full for potential future use?
            accountNumberLast4: tempAccountNumber.slice(-4),
            backingType: 'bank',
            isConfigured: true
        }));
        setTempAccountNumber(''); // Clear temporary input
    };

    const handleConnectContract = (event) => {
        event.preventDefault();
        if (!tempContractNetwork || !tempContractAddress) return;
         simulateConnection(prev => ({
            ...prev,
            contractNetwork: tempContractNetwork,
            contractAddress: tempContractAddress,
            backingType: 'smartcontract',
            isConfigured: true
        }));
        setTempContractAddress(''); // Clear temporary input
    };

    const handleSetupCustodian = (event) => {
        event.preventDefault();
        if (!reserveDetails.selectedReserveCustodianName || !tempAttestationFreq || !tempCustodianAccountId || !tempCustodianReportType) return;
        simulateConnection(prev => ({
            ...prev,
            custodianName: prev.selectedReserveCustodianName,
            attestationFrequency: tempAttestationFreq,
            custodianAccountId: tempCustodianAccountId,
            custodianReportType: tempCustodianReportType,
            backingType: 'custodian',
            isConfigured: true
        }));
        setTempCustodianAccountId(''); // Clear temporary inputs
        setTempCustodianReportType('');
        // Keep selected custodian name and frequency? Or clear? Depends on desired UX.
    };

    const handleConnectOnChainWallet = (event) => {
        event.preventDefault();
        if (!tempOnChainNetwork || !tempOnChainWalletAddress) return;
        simulateConnection(prev => ({
            ...prev,
            onChainNetwork: tempOnChainNetwork,
            onChainWalletAddress: tempOnChainWalletAddress,
            backingType: 'onchain_wallet',
            isConfigured: true
        }));
        setTempOnChainWalletAddress(''); // Clear temporary input
    };

    // Token Custody Connection Handler (Simulated)
    const handleVerifyTokenCustodyConnection = (event) => {
        event.preventDefault();
        if (tokenCustodyConnectionLoading || tokenCustodyConnectionStatus === 'verified' || !selectedTokenCustodianName || !tokenCustodianAccountIdInput) return;
        setTokenCustodyConnectionLoading(true);
        setTokenCustodyConnectionStatus('loading');
        console.log("Simulating token custody connection verification...");
        setTimeout(() => {
            setTokenCustodyConnectionLoading(false);
            setTokenCustodyConnectionStatus('verified');
            console.log("Token Custody Connection: Verified (Simulated)");
        }, 1500); // Simulate delay
    };

    // --- Workflow Action Handlers ---

    // Compile data and move to the first approval step
    const handleInitiateIssuanceApproval = () => {
        if (!isFinalStepValid) {
            // Although button should be disabled, add an alert just in case
            alert("Please ensure all required fields are valid before requesting approval.");
            return;
        }

        // Compile final data structure (similar to previous version, ensure accuracy)
        const amountToIssue = parseFloat(supplyDetails.initialSupply || 0);
        const processedFeeRecipients = permissionDetails.feeDetails.recipients.map(r => ({
            address: r.address, // Keep address as string
            percentage: parseFloat(r.percentage) || 0 // Convert percentage to float
        }));

        const compiledData = {
            tokenDetails: { ...tokenDetails },
            supplyDetails: {
                 initialSupply: amountToIssue,
                 supplyType: supplyDetails.supplyType,
                 decimals: parseInt(supplyDetails.decimals, 10), // Ensure integer
                 metadata: supplyDetails.metadata,
                 marketValue: {
                     amount: parseFloat(supplyDetails.marketValueAmount) || 0,
                     currency: supplyDetails.marketValueCurrency || 'USD'
                }
            },
            permissionDetails: {
                kycEnabled: permissionDetails.kycEnabled,
                kycLevel: permissionDetails.kycEnabled ? permissionDetails.kycLevel : null,
                feeScheduleEnabled: permissionDetails.feeScheduleEnabled,
                feeDetails: {
                    overallFeePercentage: permissionDetails.feeScheduleEnabled ? (parseFloat(permissionDetails.feeDetails.overallFeePercentage) || 0) : 0,
                    flatFeeAmount: permissionDetails.feeScheduleEnabled ? (parseFloat(permissionDetails.feeDetails.flatFeeAmount) || 0) : 0,
                    flatFeeCurrency: permissionDetails.feeScheduleEnabled ? permissionDetails.feeDetails.flatFeeCurrency : 'USD',
                    recipients: permissionDetails.feeScheduleEnabled ? processedFeeRecipients : []
                },
                pausable: permissionDetails.pausable,
                fungible: permissionDetails.fungible,
                isExpirationEnabled: permissionDetails.isExpirationEnabled,
                expiration: permissionDetails.isExpirationEnabled ? permissionDetails.expiration : null,
                roles: permissionDetails.roles // Assuming roles are already { role: string, address: string }
            },
            reserveDetails: { // Only include relevant reserve details
                isBackedAsset: reserveDetails.isBackedAsset,
                backingType: reserveDetails.isBackedAsset ? reserveDetails.backingType : null,
                isConfigured: reserveDetails.isBackedAsset ? reserveDetails.isConfigured : null, // Include config status
                // Include specific details only if configured and relevant
                bankName: (reserveDetails.isBackedAsset && reserveDetails.backingType === 'bank' && reserveDetails.isConfigured) ? reserveDetails.bankName : null,
                accountNumberLast4: (reserveDetails.isBackedAsset && reserveDetails.backingType === 'bank' && reserveDetails.isConfigured) ? reserveDetails.accountNumberLast4 : null,
                contractNetwork: (reserveDetails.isBackedAsset && reserveDetails.backingType === 'smartcontract' && reserveDetails.isConfigured) ? reserveDetails.contractNetwork : null,
                contractAddress: (reserveDetails.isBackedAsset && reserveDetails.backingType === 'smartcontract' && reserveDetails.isConfigured) ? reserveDetails.contractAddress : null,
                custodianName: (reserveDetails.isBackedAsset && reserveDetails.backingType === 'custodian' && reserveDetails.isConfigured) ? reserveDetails.custodianName : null,
                custodianAccountId: (reserveDetails.isBackedAsset && reserveDetails.backingType === 'custodian' && reserveDetails.isConfigured) ? reserveDetails.custodianAccountId : null,
                custodianReportType: (reserveDetails.isBackedAsset && reserveDetails.backingType === 'custodian' && reserveDetails.isConfigured) ? reserveDetails.custodianReportType : null,
                attestationFrequency: (reserveDetails.isBackedAsset && reserveDetails.backingType === 'custodian' && reserveDetails.isConfigured) ? reserveDetails.attestationFrequency : null,
                onChainNetwork: (reserveDetails.isBackedAsset && reserveDetails.backingType === 'onchain_wallet' && reserveDetails.isConfigured) ? reserveDetails.onChainNetwork : null,
                onChainWalletAddress: (reserveDetails.isBackedAsset && reserveDetails.backingType === 'onchain_wallet' && reserveDetails.isConfigured) ? reserveDetails.onChainWalletAddress : null,
            },
            regulatoryInfo: [...regulatoryInfo],
            tokenCustody: {
                type: tokenCustodyType,
                custodianName: tokenCustodyType === 'thirdParty' ? selectedTokenCustodianName : null,
                custodianAccountId: (tokenCustodyType === 'thirdParty' && tokenCustodyConnectionStatus === 'verified') ? tokenCustodianAccountIdInput : null
            }
        };

        console.log("Initiating issuance approval with compiled data:", compiledData);
        setFinalTokenData(compiledData); // Store the compiled data
        setWorkflowState('pending_compliance'); // Move to the first approval step
    };

    // Handle approval steps (Simulated)
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
            // setLoading(false) is handled by useEffect on workflowState change
        }, 1500);
    };

    // Handle rejection (Simulated)
    const handleReject = (rejectedBy) => {
        if (isLoading) return;
        const reason = prompt(`Enter reason for rejection by ${rejectedBy} (optional):`);
        setIsLoading(true);
        setWorkflowMessage(`Processing rejection...`);
        setTimeout(() => {
            setRejectReason(reason || 'No reason provided.');
            setWorkflowState('rejected');
            // setLoading(false) is handled by useEffect on workflowState change
        }, 1000);
    };

    // Handle final execution (Calls parent component)
    const handleExecuteIssue = () => {
        if (isLoading || workflowState !== 'approved' || !finalTokenData) return;
        const confirmMsg = `You are about to issue ${finalTokenData.supplyDetails.initialSupply.toLocaleString()} ${finalTokenData.tokenDetails.symbol} tokens.\n\nThis action will finalize the token creation based on the approved details.\n\nProceed?`;
        if (window.confirm(confirmMsg)) {
            console.log("Executing onIssue callback with final data:", finalTokenData);
            onIssue(finalTokenData); // Pass the final compiled data up
        } else {
            console.log("Final issuance execution cancelled by user.");
        }
    };

    // Handle cancellation of the workflow
    const handleCancelRequest = () => {
        if (window.confirm("Are you sure you want to cancel this issuance request and return to the dashboard?")) {
            // Reset relevant state if needed, then go back
            setWorkflowState('idle');
            setFinalTokenData(null);
            // Potentially reset form fields? Depends on desired UX.
            onBack(); // Go back to dashboard
        }
    }

    // --- Render Methods for Steps ---

    const renderTokenDetailsStep = () => (
        <div>
            <h2 className="text-xl font-medium mb-4 text-gray-800">Token Details</h2>
            <p className="text-gray-600 mb-6">Define the basic information for your new token.</p>
            <div className="space-y-4">
                <InputField label="Token Name" id="tokenName" required helpText='Full name of your token (e.g. "US Dollar Coin")'>
                    <input type="text" id="tokenName" className="w-full p-2 border rounded" placeholder="e.g. My Stablecoin" value={tokenDetails.name} onChange={(e) => setTokenDetails({...tokenDetails, name: e.target.value})} />
                </InputField>
                 <InputField label="Token Symbol" id="tokenSymbol" required helpText='Short symbol for your token (e.g. "USDC")'>
                    <input type="text" id="tokenSymbol" className="w-full p-2 border rounded" placeholder="e.g. USDC" value={tokenDetails.symbol} onChange={(e) => setTokenDetails({...tokenDetails, symbol: e.target.value})} />
                </InputField>
                 <InputField label="Select Blockchain" id="blockchain" required helpText='The blockchain network where this token will be issued.'>
                    <select id="blockchain" className="w-full p-2 border rounded" value={tokenDetails.blockchain} onChange={(e) => setTokenDetails({...tokenDetails, blockchain: e.target.value})} >
                        <option value="">Select Blockchain</option>
                        <option value="Ethereum">Ethereum</option> <option value="Hedera">Hedera</option> <option value="Solana">Solana</option> <option value="Polygon">Polygon</option> <option value="Stellar">Stellar</option>
                    </select>
                </InputField>
                 <InputField label="Token Type" id="tokenType" required helpText='Classify the type of token being issued.'>
                    <select id="tokenType" className="w-full p-2 border rounded" value={tokenDetails.tokenType} onChange={(e) => { const newType = e.target.value; setTokenDetails({ ...tokenDetails, tokenType: newType, rwaSubType: newType !== 'RWA' ? '' : tokenDetails.rwaSubType, capitalAssetSubType: newType !== 'CapitalAsset' ? '' : tokenDetails.capitalAssetSubType, currencySubType: newType !== 'Currency' ? '' : tokenDetails.currencySubType }); }} >
                        <option value="">Select Token Type</option>
                        <option value="Currency">Currency Token</option> <option value="RWA">Real World Asset Token</option> <option value="CapitalAsset">Capital Asset Token</option>
                    </select>
                </InputField>
                {tokenDetails.tokenType === 'RWA' && (
                     <InputField label="RWA Type" id="rwaSubType" required helpText='Specify the type of Real World Asset being tokenized.'>
                        <select id="rwaSubType" className="w-full p-2 border rounded" value={tokenDetails.rwaSubType} onChange={(e) => setTokenDetails({...tokenDetails, rwaSubType: e.target.value})} required={tokenDetails.tokenType === 'RWA'} >
                            <option value="">Select RWA Type</option> {rwaSubTypes.map(type => <option key={type} value={type}>{type}</option>)}
                        </select>
                    </InputField>
                )}
                 {tokenDetails.tokenType === 'CapitalAsset' && (
                     <InputField label="Capital Asset Type" id="capitalAssetSubType" required helpText='Specify the type of Capital Asset being tokenized.'>
                        <select id="capitalAssetSubType" className="w-full p-2 border rounded" value={tokenDetails.capitalAssetSubType} onChange={(e) => setTokenDetails({...tokenDetails, capitalAssetSubType: e.target.value})} required={tokenDetails.tokenType === 'CapitalAsset'} >
                             <option value="">Select Capital Asset Type</option> {capitalAssetSubTypes.map(type => <option key={type} value={type}>{type}</option>)}
                        </select>
                     </InputField>
                 )}
                 {tokenDetails.tokenType === 'Currency' && (
                     <InputField label="Currency Type" id="currencySubType" required helpText='Specify the type of Currency Token.'>
                         <select id="currencySubType" className="w-full p-2 border rounded" value={tokenDetails.currencySubType} onChange={(e) => setTokenDetails({...tokenDetails, currencySubType: e.target.value})} required={tokenDetails.tokenType === 'Currency'} >
                             <option value="">Select Currency Type</option> {currencySubTypes.map(type => <option key={type} value={type}>{type}</option>)}
                         </select>
                     </InputField>
                 )}

                {/* Regulatory Info Sub-Section */}
                <div className="border rounded-lg p-4 bg-gray-50 mt-6">
                    <label className="block mb-2"><span className="font-medium">Regulatory Information</span><p className="text-sm text-gray-600">Specify jurisdictions and regulatory bodies</p></label>
                    <form onSubmit={handleAddRegulatoryInfo} className="flex space-x-2 items-end"> {/* Use items-end */}
                        <div className="flex-1">
                            <label htmlFor="reg-country" className="block text-sm font-medium mb-1">Country/Jurisdiction</label>
                            <select id="reg-country" className="w-full p-2 border rounded" value={selectedCountry} onChange={(e) => setSelectedCountry(e.target.value)} >
                                <option value="">Select Country/Jurisdiction</option>
                                {sampleCountries.map(country => (<option key={country.code} value={country.name}>{country.name}</option>))}
                            </select>
                        </div>
                        <div className="flex-1">
                             <label htmlFor="reg-name" className="block text-sm font-medium mb-1">Regulator Name</label>
                            <input id="reg-name" type="text" className="w-full p-2 border rounded" placeholder="e.g., SEC" value={regulatorName} onChange={(e) => setRegulatorName(e.target.value)} />
                         </div>
                        <button className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 self-end mb-0" disabled={!selectedCountry || !regulatorName.trim()} type="submit" > Add </button> {/* Align button */}
                    </form>
                     <div className="mt-4 p-3 border rounded bg-white min-h-[50px]">
                        {regulatoryInfo.length === 0 ? (
                            <p className="text-sm text-gray-500 italic">No regulatory information added yet.</p>
                        ) : (
                            <ul className="space-y-1">{regulatoryInfo.map((info, index) => (
                                <li key={index} className="text-sm border-b last:border-b-0 py-1 flex justify-between items-center">
                                    <span><strong>{info.country}:</strong> {info.regulator}</span>
                                    {/* Optional: Add remove button here */}
                                </li>
                            ))}</ul>
                        )}
                    </div>
                </div>

                 {/* Navigation */}
                 <div className="flex justify-end mt-8">
                    <button
                        className="px-4 py-2 rounded text-white hover:opacity-90 bg-yellow-600 disabled:opacity-50"
                        onClick={() => setIssuanceScreen('supply-reserves-metadata')}
                        disabled={
                            !tokenDetails.name || !tokenDetails.symbol || !tokenDetails.blockchain || !tokenDetails.tokenType ||
                            (tokenDetails.tokenType === 'RWA' && !tokenDetails.rwaSubType) ||
                            (tokenDetails.tokenType === 'CapitalAsset' && !tokenDetails.capitalAssetSubType) ||
                            (tokenDetails.tokenType === 'Currency' && !tokenDetails.currencySubType)
                        }
                    >
                        Next Step
                    </button>
                </div>
            </div>
        </div>
    );

    const renderSupplyReservesStep = () => (
        <div>
            <h2 className="text-xl font-medium mb-4 text-gray-800">Supply, Reserves, & Metadata</h2>
            <p className="text-gray-600 mb-6">Configure token supply, reserve backing (if applicable), and metadata.</p>

            {/* Display the dynamic text */}
            {exampleText && (
                 <p className="text-sm text-blue-700 bg-blue-50 p-3 rounded border border-blue-200 mb-6">
                     {exampleText}
                 </p>
             )}

            <div className="space-y-6">
                {/* Supply Section */}
                <InputField label="Initial Supply" id="initialSupply" required helpText='Number of tokens to be created initially'>
                     <input type="number" id="initialSupply" min="0" className="w-full p-2 border rounded" placeholder="e.g. 1000000" value={supplyDetails.initialSupply} onChange={(e) => setSupplyDetails({...supplyDetails, initialSupply: e.target.value})} />
                </InputField>

                <div>
                    <label className="block mb-1 font-medium">Supply Type <span className="text-red-600">*</span></label>
                    <RadioGroup
                        name="supplyType"
                        selectedValue={supplyDetails.supplyType}
                        onChange={(value) => setSupplyDetails({...supplyDetails, supplyType: value})}
                        options={[
                            { value: 'finite', label: 'Finite Supply', description: 'Fixed maximum token supply' },
                            { value: 'infinite', label: 'Infinite Supply', description: 'No maximum supply limit' }
                        ]}
                    />
                </div>

                 <InputField label="Decimal Points" id="decimals" required helpText='How divisible the token will be (smaller units)'>
                    <select id="decimals" className="w-full p-2 border rounded" value={supplyDetails.decimals} onChange={(e) => setSupplyDetails({...supplyDetails, decimals: e.target.value})} >
                        <option value="18">18 (e.g. Ethereum standard)</option>
                        <option value="8">8 (e.g. Bitcoin standard)</option>
                        <option value="6">6 (e.g. USDC standard)</option>
                        <option value="2">2 (e.g. 100.50)</option>
                        <option value="0">0 (No decimal places, whole tokens only)</option>
                    </select>
                </InputField>

                 <InputField label="Pricing Currency" id="marketValueCurrency" helpText='Select the currency for the market value definition.'>
                     <select
                         id="marketValueCurrency"
                         className={`w-full p-2 border rounded ${isHardcodedRWA ? 'bg-gray-100' : 'bg-white'}`}
                         value={supplyDetails.marketValueCurrency}
                         onChange={(e) => setSupplyDetails({...supplyDetails, marketValueCurrency: e.target.value})}
                         disabled={isHardcodedRWA}
                     >
                         {pricingCurrencies.map(currency => (<option key={currency} value={currency}>{currency}</option>))}
                    </select>
                 </InputField>

                 <InputField label="Market Value Amount" id="marketValueAmount" helpText='Define what 1 unit of this token initially represents in the selected currency.'>
                    <input
                        type="number"
                        id="marketValueAmount"
                        step="any" min="0"
                        className={`w-full p-2 border rounded ${isHardcodedRWA ? 'bg-gray-100' : ''}`}
                        placeholder={`Enter value in ${supplyDetails.marketValueCurrency || 'selected currency'}`}
                        value={supplyDetails.marketValueAmount}
                        onChange={(e) => setSupplyDetails({...supplyDetails, marketValueAmount: e.target.value})}
                        disabled={isHardcodedRWA}
                    />
                 </InputField>

                {/* --- Proof of Reserves Section --- */}
                {showReservesSection && (
                    <div className="pt-6 border-t">
                        <h3 className="text-lg font-medium mb-4 text-gray-700">Proof of Reserves Configuration</h3>
                        {/* Asset Backed Yes/No */}
                        <div className="border rounded-lg p-4 bg-gray-50 mb-4">
                             <p className="font-medium mb-3">Is this token backed by real-world assets? {reservesRequired ? <span className="text-red-600">* Required</span> : ''}</p>
                             <RadioGroup
                                name="isBacked"
                                selectedValue={reserveDetails.isBackedAsset}
                                onChange={(value) => {
                                    if (value === false && reservesRequired) return; // Don't allow setting to No if required
                                    setReserveDetails(prev => ({
                                        ...prev,
                                        isBackedAsset: value,
                                        // Reset configuration if changing backing status
                                        isConfigured: value ? false : (prev.isBackedAsset ? false : true), // Reset if changing to Yes, keep if changing to No (already not configured)
                                        backingType: value ? prev.backingType : '', // Keep type if changing to Yes, clear if No
                                    }));
                                }}
                                options={[
                                    { value: true, label: 'Yes', description: 'Token is backed by verifiable reserves' },
                                    { value: false, label: 'No', description: 'Token is not backed by reserves' }
                                ]}
                             />
                             {reservesRequired && !reserveDetails.isBackedAsset &&
                                <p className="text-xs text-red-600 mt-2">Asset backing is required for this token type.</p>
                             }
                        </div>

                        {/* Reserve Backing Method Selection */}
                        {reserveDetails.isBackedAsset && (
                            <div className="mt-4 border rounded-lg p-4 bg-gray-50">
                                <p className="font-medium mb-3">Select Reserve Backing Method <span className="text-red-600">*</span></p>

                                {/* Display Configured Method */}
                                {reserveDetails.isConfigured && (
                                    <div className='mb-4 p-3 bg-green-100 border border-green-300 text-green-800 rounded text-sm'>
                                        <p className='font-medium'>Reserve Method Configured:</p>
                                        {reserveDetails.backingType === 'bank' && <p>Bank Account ({reserveDetails.bankName} ending in {reserveDetails.accountNumberLast4})</p>}
                                        {reserveDetails.backingType === 'smartcontract' && <p>Smart Contract ({reserveDetails.contractNetwork}: {reserveDetails.contractAddress.substring(0,6)}...)</p>}
                                        {reserveDetails.backingType === 'custodian' && <p>Custodian: {reserveDetails.custodianName} (Acct: {reserveDetails.custodianAccountId || 'N/A'}, Report: {reserveDetails.custodianReportType || 'N/A'}, Freq: {reserveDetails.attestationFrequency})</p>}
                                        {reserveDetails.backingType === 'onchain_wallet' && <p>On-Chain Wallet ({reserveDetails.onChainNetwork}: {reserveDetails.onChainWalletAddress.substring(0,6)}...)</p>}
                                        <button onClick={() => setReserveDetails(prev => ({ ...prev, isConfigured: false }))} className="text-xs text-blue-600 hover:underline mt-1" disabled={reserveConnectionLoading}> Edit Configuration </button>
                                    </div>
                                )}

                                 {/* Loading Indicator */}
                                {reserveConnectionLoading && (
                                    <div className="my-4 p-3 bg-blue-100 border border-blue-300 text-blue-800 rounded text-sm flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"> <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle> <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path> </svg>
                                        Validating connection...
                                    </div>
                                )}

                                {/* Method Choices (Disabled if configured or loading) */}
                                <div className={`space-y-3 ${(reserveDetails.isConfigured || reserveConnectionLoading) ? 'opacity-50 pointer-events-none' : ''}`}>
                                     {/* TODO: Refactor each method into its own sub-component for clarity if needed */}
                                     {/* Bank Account */}
                                    <div className={`border rounded p-3 cursor-pointer ${reserveDetails.backingType === 'bank' ? 'border-yellow-600 bg-yellow-50' : 'border-gray-300 bg-white'}`} onClick={() => setReserveDetails({...reserveDetails, backingType: 'bank'})} >
                                        <div className="flex">
                                            <input type="radio" name="backingTypeRadio" className="mr-2 mt-1 focus:ring-yellow-600 h-4 w-4 text-yellow-600" checked={reserveDetails.backingType === 'bank'} readOnly />
                                            <div>
                                                <p className="font-medium">Bank Account Connection</p>
                                                <p className="text-sm text-gray-600">Link a traditional bank account to verify reserves</p>
                                                {reserveDetails.backingType === 'bank' && (
                                                    <form onSubmit={handleConnectBank} className="mt-3 p-3 border rounded bg-white space-y-3">
                                                        <InputField label="Bank Name" id="bankName" required>
                                                            <select id="bankName" value={reserveDetails.selectedBankName} onChange={(e) => setReserveDetails({...reserveDetails, selectedBankName: e.target.value})} className="w-full p-2 border rounded text-sm" required >
                                                                <option value="">-- Select Bank --</option> {bankNameOptions.map(name => <option key={name} value={name}>{name}</option>)}
                                                            </select>
                                                         </InputField>
                                                         <InputField label="Account Number" id="accountNumber" required>
                                                            <input id="accountNumber" type="text" value={tempAccountNumber} onChange={(e) => setTempAccountNumber(e.target.value)} className="w-full p-2 border rounded text-sm" placeholder="Enter full account number" required />
                                                        </InputField>
                                                        <button type="submit" className="mt-2 px-4 py-2 rounded text-white hover:opacity-90 bg-yellow-600 disabled:opacity-50 text-sm" disabled={!reserveDetails.selectedBankName || !tempAccountNumber}>Connect Bank</button>
                                                    </form>
                                                 )}
                                            </div>
                                        </div>
                                    </div>
                                     {/* Smart Contract */}
                                    <div className={`border rounded p-3 cursor-pointer ${reserveDetails.backingType === 'smartcontract' ? 'border-yellow-600 bg-yellow-50' : 'border-gray-300 bg-white'}`} onClick={() => setReserveDetails({...reserveDetails, backingType: 'smartcontract'})} >
                                        <div className="flex">
                                            <input type="radio" name="backingTypeRadio" className="mr-2 mt-1 focus:ring-yellow-600 h-4 w-4 text-yellow-600" checked={reserveDetails.backingType === 'smartcontract'} readOnly />
                                            <div>
                                                 <p className="font-medium">On-Chain Smart Contract</p>
                                                 <p className="text-sm text-gray-600">Link to on-chain assets via smart contract</p>
                                                 {reserveDetails.backingType === 'smartcontract' && (
                                                    <form onSubmit={handleConnectContract} className="mt-3 p-3 border rounded bg-white space-y-3">
                                                        <InputField label="Blockchain Network" id="contractNetwork">
                                                            <select id="contractNetwork" value={tempContractNetwork} onChange={(e)=> setTempContractNetwork(e.target.value)} className="w-full p-2 border rounded text-sm"><option>Ethereum</option><option>Polygon</option><option>BNB Chain</option><option>Solana</option><option>Avalanche</option></select>
                                                        </InputField>
                                                        <InputField label="Smart Contract Address" id="contractAddress" required>
                                                            <input id="contractAddress" type="text" value={tempContractAddress} onChange={(e)=> setTempContractAddress(e.target.value)} className="w-full p-2 border rounded text-sm" placeholder="0x..." required />
                                                        </InputField>
                                                        <button type="submit" className="mt-2 px-4 py-2 rounded text-white hover:opacity-90 bg-yellow-600 disabled:opacity-50 text-sm" disabled={!tempContractNetwork || !tempContractAddress}>Connect Contract</button>
                                                    </form>
                                                 )}
                                            </div>
                                        </div>
                                    </div>
                                     {/* Custodian */}
                                    <div className={`border rounded p-3 cursor-pointer ${reserveDetails.backingType === 'custodian' ? 'border-yellow-600 bg-yellow-50' : 'border-gray-300 bg-white'}`} onClick={() => setReserveDetails({...reserveDetails, backingType: 'custodian'})} >
                                        <div className="flex">
                                            <input type="radio" name="backingTypeRadio" className="mr-2 mt-1 focus:ring-yellow-600 h-4 w-4 text-yellow-600" checked={reserveDetails.backingType === 'custodian'} readOnly />
                                            <div>
                                                <p className="font-medium">Third-Party Custodian</p>
                                                <p className="text-sm text-gray-600">Use a trusted custodian for verification</p>
                                                 {reserveDetails.backingType === 'custodian' && (
                                                    <form onSubmit={handleSetupCustodian} className="mt-3 p-3 border rounded bg-white space-y-3">
                                                         <InputField label="Custodian Name" id="custodianName" required>
                                                            <select id="custodianName" value={reserveDetails.selectedReserveCustodianName} onChange={(e)=> setReserveDetails({...reserveDetails, selectedReserveCustodianName: e.target.value})} className="w-full p-2 border rounded text-sm" required>
                                                                <option value="">-- Select Custodian --</option> {reserveCustodianOptions.map(name => <option key={name} value={name}>{name}</option>)}
                                                            </select>
                                                        </InputField>
                                                         <InputField label="Custodian Account ID" id="custodianAccountId" required>
                                                            <input id="custodianAccountId" type="text" value={tempCustodianAccountId} onChange={(e) => setTempCustodianAccountId(e.target.value)} className="w-full p-2 border rounded text-sm" placeholder="Enter Account Identifier" required />
                                                        </InputField>
                                                         <InputField label="Report Type" id="custodianReportType" required>
                                                            <select id="custodianReportType" value={tempCustodianReportType} onChange={(e) => setTempCustodianReportType(e.target.value)} className="w-full p-2 border rounded text-sm" required >
                                                                 <option value="">-- Select Report Type --</option> {attestationReportTypes.map(type => <option key={type} value={type}>{type}</option>)}
                                                            </select>
                                                        </InputField>
                                                         <InputField label="Attestation Frequency" id="attestationFrequency" required>
                                                            <select id="attestationFrequency" value={tempAttestationFreq} onChange={(e)=> setTempAttestationFreq(e.target.value)} className="w-full p-2 border rounded text-sm" required>
                                                                <option>Daily</option><option>Weekly</option><option>Monthly</option><option>Quarterly</option>
                                                            </select>
                                                         </InputField>
                                                        <button type="submit" className="mt-2 px-4 py-2 rounded text-white hover:opacity-90 bg-yellow-600 disabled:opacity-50 text-sm" disabled={!reserveDetails.selectedReserveCustodianName || !tempAttestationFreq || !tempCustodianAccountId || !tempCustodianReportType}>Setup Custodian</button>
                                                    </form>
                                                 )}
                                            </div>
                                        </div>
                                    </div>
                                    {/* On-Chain Wallet */}
                                    <div className={`border rounded p-3 cursor-pointer ${reserveDetails.backingType === 'onchain_wallet' ? 'border-yellow-600 bg-yellow-50' : 'border-gray-300 bg-white'}`} onClick={() => setReserveDetails({...reserveDetails, backingType: 'onchain_wallet'})} >
                                         <div className="flex">
                                            <input type="radio" name="backingTypeRadio" className="mr-2 mt-1 focus:ring-yellow-600 h-4 w-4 text-yellow-600" checked={reserveDetails.backingType === 'onchain_wallet'} readOnly />
                                            <div>
                                                 <p className="font-medium">Direct On-Chain Wallet</p>
                                                 <p className="text-sm text-gray-600">Link directly to an on-chain wallet</p>
                                                {reserveDetails.backingType === 'onchain_wallet' && (
                                                     <form onSubmit={handleConnectOnChainWallet} className="mt-3 p-3 border rounded bg-white space-y-3">
                                                        <InputField label="Blockchain Network" id="onChainNetwork" required>
                                                            <select id="onChainNetwork" value={tempOnChainNetwork} onChange={(e)=> setTempOnChainNetwork(e.target.value)} className="w-full p-2 border rounded text-sm" required>
                                                                <option value="Ethereum">Ethereum</option> <option value="Polygon">Polygon</option> <option value="Hedera">Hedera</option> <option value="Solana">Solana</option> <option value="Stellar">Stellar</option>
                                                            </select>
                                                        </InputField>
                                                         <InputField label="Wallet Address" id="onChainWalletAddress" required>
                                                            <input id="onChainWalletAddress" type="text" value={tempOnChainWalletAddress} onChange={(e)=> setTempOnChainWalletAddress(e.target.value)} className="w-full p-2 border rounded text-sm" placeholder="Enter wallet address" required />
                                                        </InputField>
                                                        <button type="submit" className="mt-2 px-4 py-2 rounded text-white hover:opacity-90 bg-yellow-600 disabled:opacity-50 text-sm" disabled={!tempOnChainNetwork || !tempOnChainWalletAddress}>Connect Wallet</button>
                                                    </form>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div> {/* End reserve method choices div */}
                            </div>
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
                             <div className="flex items-center">
                                <input type="radio" name="tokenCustodyTypeRadio" value="self" className="mr-2 focus:ring-yellow-600 h-4 w-4 text-yellow-600" checked={tokenCustodyType === 'self'} readOnly />
                                <div>
                                    <p className="font-medium">Self Custody (Platform Internal)</p>
                                     {tokenCustodyType === 'self' && ( <p className="text-xs text-gray-600 mt-1">Tokens managed by the platform's internal infrastructure.</p> )}
                                </div>
                            </div>
                        </div>
                         {/* Third Party Custodian Option */}
                         <div className={`border rounded p-3 ${tokenCustodyType === 'thirdParty' ? 'border-yellow-600 bg-yellow-50' : 'border-gray-300 bg-white'}`}>
                            <div className="flex items-start cursor-pointer" onClick={() => setTokenCustodyType('thirdParty')}>
                                 <input type="radio" name="tokenCustodyTypeRadio" value="thirdParty" className="mr-2 mt-1 focus:ring-yellow-600 h-4 w-4 text-yellow-600 flex-shrink-0" checked={tokenCustodyType === 'thirdParty'} readOnly />
                                <div className="flex-grow">
                                    <p className="font-medium">Third Party Custodian</p>
                                </div>
                             </div>
                             {tokenCustodyType === 'thirdParty' && (
                                <div className="mt-3 pl-6 space-y-3">
                                    <p className="text-xs text-gray-600">Select an integrated third-party custodian and verify the connection.</p>
                                    <InputField label="Select Custodian" id="tokenCustodianName" required>
                                         <select
                                            id="tokenCustodianName"
                                            value={selectedTokenCustodianName}
                                            onChange={(e) => setSelectedTokenCustodianName(e.target.value)}
                                            className="w-full p-2 border rounded text-sm bg-white disabled:bg-gray-100"
                                            required
                                            disabled={tokenCustodyConnectionStatus === 'verified' || tokenCustodyConnectionLoading}
                                        >
                                             <option value="">-- Select Custodian --</option>
                                             {tokenCustodianOptions.map(name => <option key={name} value={name}>{name}</option>)}
                                        </select>
                                     </InputField>
                                     <InputField label="Custodian Account ID" id="tokenCustodianAccountId" required>
                                        <input
                                            id="tokenCustodianAccountId"
                                            type="text"
                                            value={tokenCustodianAccountIdInput}
                                            onChange={(e) => setTokenCustodianAccountIdInput(e.target.value)}
                                            className="w-full p-2 border rounded text-sm disabled:bg-gray-100"
                                            placeholder="Enter Account Identifier provided by custodian"
                                            required
                                            disabled={tokenCustodyConnectionStatus === 'verified' || tokenCustodyConnectionLoading || !selectedTokenCustodianName}
                                        />
                                    </InputField>
                                    <div className="pt-1">
                                        {tokenCustodyConnectionStatus === 'idle' && (
                                             <button
                                                type="button"
                                                onClick={handleVerifyTokenCustodyConnection}
                                                className="px-4 py-2 rounded text-white text-sm hover:opacity-90 bg-blue-600 disabled:opacity-50"
                                                disabled={!selectedTokenCustodianName || !tokenCustodianAccountIdInput || tokenCustodyConnectionLoading}
                                            >
                                                Verify Connection (Simulated)
                                            </button>
                                         )}
                                         {tokenCustodyConnectionStatus === 'loading' && (
                                            <div className="p-2 text-sm flex items-center justify-center text-blue-700">
                                                 <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"> <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle> <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path> </svg>
                                                 Connecting...
                                            </div>
                                        )}
                                         {tokenCustodyConnectionStatus === 'verified' && (
                                            <div className="p-2 border rounded bg-green-50 border-green-200 text-xs space-y-1">
                                                <p className="flex items-center text-green-700 font-medium">
                                                    <svg className="w-4 h-4 mr-1 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                                                    Connection Status: Verified
                                                </p>
                                                <p className="text-gray-600 ml-5">Custodian: {selectedTokenCustodianName}</p>
                                                 <p className="text-gray-600 ml-5">Account ID: {tokenCustodianAccountIdInput || 'N/A'}</p>
                                                 <button onClick={() => setTokenCustodyConnectionStatus('idle')} className="text-xs text-blue-600 hover:underline mt-1 ml-5">Edit Connection</button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                 </div>


                {/* Metadata Section */}
                <InputField label="Metadata Implementation" id="metadata" helpText='Additional data fields to store with the token or transactions.'>
                    <textarea
                        id="metadata"
                        className="w-full p-2 border rounded" rows="3"
                        placeholder="Enter JSON schema or metadata description (optional)"
                        value={supplyDetails.metadata}
                        onChange={(e) => setSupplyDetails({...supplyDetails, metadata: e.target.value})}
                    />
                 </InputField>

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-8">
                    <button className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-50" onClick={() => setIssuanceScreen('token-details')} > Previous Step </button>
                    <button
                        className="px-4 py-2 rounded text-white hover:opacity-90 bg-yellow-600 disabled:opacity-50"
                        onClick={() => setIssuanceScreen('permissions')}
                        disabled={
                            !supplyDetails.initialSupply || parseFloat(supplyDetails.initialSupply) <= 0 ||
                            !supplyDetails.decimals ||
                            (reservesRequired && !reserveDetails.isConfigured) || // Must be configured if required
                            reserveConnectionLoading || // Disable during reserve connection
                            tokenCustodyConnectionLoading // Disable during token custody connection
                         }
                    > Next Step </button>
                </div>
            </div>
        </div>
    );

    const renderPermissionsStep = () => (
        <div>
            <h2 className="text-xl font-medium mb-4 text-gray-800">Permissions & Features</h2>
             <p className="text-gray-600 mb-6">Configure token permissions and functional features.</p>
            <div className="space-y-6">
                {/* KYC */}
                 <div className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-start mb-3">
                         <button
                            type="button" role="switch" aria-checked={permissionDetails.kycEnabled}
                            onClick={() => {
                                const isEnabled = !permissionDetails.kycEnabled;
                                setPermissionDetails({ ...permissionDetails, kycEnabled: isEnabled, kycLevel: isEnabled ? permissionDetails.kycLevel : '' }); // Clear level if disabled
                            }}
                            className={`${ permissionDetails.kycEnabled ? 'bg-yellow-600' : 'bg-gray-300' } relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-600 mr-3`}
                        >
                            <span className="sr-only">Enable KYC Permissions</span>
                            <span aria-hidden="true" className={`${ permissionDetails.kycEnabled ? 'translate-x-5' : 'translate-x-0' } pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`} />
                        </button>
                        <div className="flex-1">
                            <p className="font-medium inline">KYC Required</p>
                             <span className="text-xs text-gray-500 ml-2">(Can be changed later in admin panel)</span>
                             <p className="text-sm text-gray-600 mt-1"> Require accounts to be KYC verified to interact with the token.</p>
                         </div>
                    </div>
                     {permissionDetails.kycEnabled && (
                        <div className="ml-14"> {/* Indent */}
                            <InputField label="Minimum KYC Level" id="kycLevel" required helpText='Minimum level of KYC required.'>
                                <select
                                    id="kycLevel"
                                    className="w-full p-2 border rounded bg-white"
                                    value={permissionDetails.kycLevel}
                                    onChange={(e) => setPermissionDetails({...permissionDetails, kycLevel: e.target.value})}
                                    required
                                >
                                    <option value="" disabled>-- Select Minimum Level --</option>
                                    {kycLevels.map(level => <option key={level} value={level}>{level}</option>)}
                                </select>
                            </InputField>
                        </div>
                     )}
                </div>

                 {/* Fee Schedule Section */}
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
                            <InputField label="Percentage Fee (%)" id="feePercentage" required helpText='Percentage fee per transaction. Enter 0 if none.'>
                                 <input
                                    id="feePercentage" type="number" step="0.01" min="0" max="100"
                                    className="w-full p-2 border rounded text-sm"
                                    placeholder="e.g. 0.5"
                                    value={permissionDetails.feeDetails.overallFeePercentage}
                                    onChange={(e) => setPermissionDetails({...permissionDetails, feeDetails: {...permissionDetails.feeDetails, overallFeePercentage: e.target.value}})}
                                    // Required if flat fee is 0 or empty
                                    required={!(parseFloat(permissionDetails.feeDetails.flatFeeAmount) > 0)}
                                />
                            </InputField>

                            <div className="grid grid-cols-2 gap-4">
                                <InputField label="Flat Fee Amount (Optional)" id="flatFeeAmount" helpText='Fixed fee per transaction. Enter 0 if none.'>
                                    <input
                                        id="flatFeeAmount" type="number" step="any" min="0"
                                        className="w-full p-2 border rounded text-sm"
                                        placeholder="e.g. 5.00"
                                        value={permissionDetails.feeDetails.flatFeeAmount}
                                        onChange={(e) => setPermissionDetails({...permissionDetails, feeDetails: {...permissionDetails.feeDetails, flatFeeAmount: e.target.value}})}
                                         // Required if percentage fee is 0 or empty
                                        required={!(parseFloat(permissionDetails.feeDetails.overallFeePercentage) > 0)}
                                    />
                                </InputField>
                                 <InputField label="Flat Fee Currency" id="flatFeeCurrency">
                                    {/* Consider making this selectable if needed */}
                                     <input id="flatFeeCurrency" type="text" value={permissionDetails.feeDetails.flatFeeCurrency} readOnly className="w-full p-2 border rounded text-sm bg-gray-100" />
                                </InputField>
                            </div>


                             <div>
                                <label className="block text-sm font-medium mb-2">Fee Recipient Allocation <span className="text-red-600">*</span></label>
                                 <p className="text-xs text-gray-500 mb-2">Allocate the collected fee percentage among recipients. Must total 100%.</p>
                                {permissionDetails.feeDetails.recipients.map((recipient, index) => (
                                    <div key={recipient.id} className="flex items-center space-x-2 mb-2 border-b pb-2 last:border-b-0 last:pb-0">
                                        <input
                                            type="text" aria-label={`Recipient ${index + 1} Address`}
                                            placeholder={`Recipient ${index + 1} Address`}
                                            value={recipient.address}
                                            onChange={(e) => handleUpdateFeeRecipient(recipient.id, 'address', e.target.value)}
                                            className="flex-grow p-2 border rounded text-sm"
                                            required
                                        />
                                        <input
                                             type="number" aria-label={`Recipient ${index + 1} Percentage`}
                                            min="0.000001" max="100" step="any"
                                            placeholder="%"
                                            value={recipient.percentage}
                                            onChange={(e) => handleUpdateFeeRecipient(recipient.id, 'percentage', e.target.value)}
                                            className="w-24 p-2 border rounded text-sm" // Slightly wider
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveFeeRecipient(recipient.id)}
                                            className="px-2 py-1 text-red-600 hover:text-red-800 text-sm"
                                            title="Remove Recipient"
                                        >Remove</button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={handleAddFeeRecipient}
                                    className="mt-2 px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50"
                                >+ Add Recipient</button>
                                <div className="mt-2 text-sm font-medium">
                                    Total Allocated: {totalFeePercentageAllocated.toFixed(2)}%
                                     {permissionDetails.feeDetails.recipients.length > 0 && Math.abs(totalFeePercentageAllocated - 100) > 0.001 && (
                                        <span className="text-red-600 ml-2">(Must equal 100%)</span>
                                    )}
                                     {permissionDetails.feeDetails.recipients.some(r => !r.address || r.address.trim() === '') && (
                                          <span className="text-red-600 ml-2">(Address required)</span>
                                     )}
                                     {permissionDetails.feeDetails.recipients.some(r => parseFloat(r.percentage) <= 0) && (
                                          <span className="text-red-600 ml-2">(Percentage must be Greater Thank 0)</span>
                                     )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Pausable & Fungibility */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border rounded-lg p-4 bg-gray-50">
                        <label className="flex items-center mb-2 cursor-pointer">
                            <input type="checkbox" className="mr-2 h-4 w-4 text-yellow-600 focus:ring-yellow-600" checked={permissionDetails.pausable} onChange={(e) => setPermissionDetails({...permissionDetails, pausable: e.target.checked})} />
                            <div><p className="font-medium">Pausable Transactions</p><p className="text-sm text-gray-600">Ability to temporarily pause transfers</p></div>
                        </label>
                    </div>
                    <div className="border rounded-lg p-4 bg-gray-50">
                         <p className="font-medium mb-2">Token Fungibility</p>
                         <div className="space-x-4">
                             <label className="inline-flex items-center"><input type="radio" name="fungibility" className="mr-1 text-yellow-600 focus:ring-yellow-600" checked={permissionDetails.fungible} onChange={() => setPermissionDetails({...permissionDetails, fungible: true})} /><span className="text-sm">Fungible</span></label>
                             <label className="inline-flex items-center"><input type="radio" name="fungibility" className="mr-1 text-yellow-600 focus:ring-yellow-600" checked={!permissionDetails.fungible} onChange={() => setPermissionDetails({...permissionDetails, fungible: false})} /><span className="text-sm">Non-Fungible (NFT)</span></label>
                        </div>
                    </div>
                </div>

                {/* Expiration */}
                <div className="border rounded-lg p-4 bg-gray-50">
                    <label className="flex items-center cursor-pointer mb-2">
                         <input type="checkbox" className="mr-2 h-4 w-4 text-yellow-600 focus:ring-yellow-600" checked={permissionDetails.isExpirationEnabled} onChange={(e) => { const isEnabled = e.target.checked; setPermissionDetails({ ...permissionDetails, isExpirationEnabled: isEnabled, expiration: isEnabled ? permissionDetails.expiration : '' }); }} />
                        <span className="font-medium">Enable Token Expiration</span>
                    </label>
                    <p className="text-sm text-gray-600 mb-2 ml-6">Set a date when the token becomes invalid or unusable (optional).</p>
                     {permissionDetails.isExpirationEnabled && (
                         <InputField label="Expiration Date" id="expirationDate" required>
                            <input
                                id="expirationDate" type="date"
                                className="w-full p-2 border rounded bg-white"
                                min={new Date().toISOString().split('T')[0]} // Set min date to today
                                value={permissionDetails.expiration}
                                onChange={(e) => setPermissionDetails({...permissionDetails, expiration: e.target.value})}
                                required
                            />
                        </InputField>
                     )}
                </div>

                {/* Role Assignments */}
                <div className="border rounded-lg p-4 bg-gray-50">
                    <label className="block mb-2"><span className="font-medium">Role Assignments</span><p className="text-sm text-gray-600">Assign administrative roles for this token</p></label>
                    <form onSubmit={handleAddRole} className="flex space-x-2 items-end">
                        <div className="flex-1">
                             <label htmlFor="role-select" className="block text-sm font-medium mb-1">Role</label>
                            <select id="role-select" className="w-full p-2 border rounded" value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)} >
                                <option value="">Select Role</option>
                                {roleOptions.map(role => <option key={role} value={role}>{role}</option>)}
                            </select>
                        </div>
                         <div className="flex-1">
                            <label htmlFor="role-address" className="block text-sm font-medium mb-1">Address</label>
                            <input id="role-address" type="text" className="w-full p-2 border rounded" placeholder="Account address (e.g., 0x...)" value={roleAddress} onChange={(e) => setRoleAddress(e.target.value)} />
                        </div>
                        <button className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 self-end mb-0" disabled={!selectedRole || !roleAddress.trim()} type="submit" > Add </button>
                    </form>
                     <div className="mt-4 p-3 border rounded bg-white min-h-[50px]">
                        {permissionDetails.roles.length === 0 ? (
                            <p className="text-sm text-gray-500 italic">No roles assigned yet.</p>
                        ) : (
                            <ul className="space-y-1 list-disc list-inside">{permissionDetails.roles.map((roleItem, index) => (
                                <li key={index} className="text-sm"><strong>{roleItem.role}:</strong> {roleItem.address}</li>
                            ))}</ul>
                        )}
                    </div>
                </div>
            </div>

             {/* Navigation */}
            <div className="flex justify-between mt-8">
                <button className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-50" onClick={() => setIssuanceScreen('supply-reserves-metadata')} > Previous Step </button>
                <button
                    className="px-4 py-2 rounded text-white hover:opacity-90 bg-yellow-600 disabled:opacity-50"
                    onClick={() => setIssuanceScreen('finalization')}
                     // Simplified validation check (re-using logic from isFinalStepValid basically)
                    disabled={
                        (permissionDetails.kycEnabled && !permissionDetails.kycLevel) ||
                        (permissionDetails.isExpirationEnabled && !permissionDetails.expiration) ||
                        (permissionDetails.feeScheduleEnabled && (
                             (!(parseFloat(permissionDetails.feeDetails.overallFeePercentage) > 0) && !(parseFloat(permissionDetails.feeDetails.flatFeeAmount) > 0)) || // No fees set
                             ( (parseFloat(permissionDetails.feeDetails.overallFeePercentage) > 0) && // Or % fee > 0 and invalid recipients
                                ( permissionDetails.feeDetails.recipients.length === 0 ||
                                  Math.abs(totalFeePercentageAllocated - 100) > 0.001 ||
                                  permissionDetails.feeDetails.recipients.some(r => !r.address || !(parseFloat(r.percentage) > 0))
                                )
                             )
                        ))
                    }
                > Next Step </button>
            </div>
        </div>
    );

     const renderFinalizationStep = () => (
        <div>
            <h2 className="text-xl font-medium mb-4 text-gray-800">Finalization & Review</h2>

            {/* Workflow Status Display */}
            {workflowState !== 'idle' && (
                <div className={`mb-6 p-4 border rounded-lg ${workflowState === 'rejected' ? 'bg-red-50 border-red-300' : 'bg-blue-50 border-blue-300'}`}>
                    <h3 className={`text-lg font-semibold mb-2 ${workflowState === 'rejected' ? 'text-red-800' : 'text-blue-800'}`}>
                        Issuance Request Status
                    </h3>
                    <p className={`mb-3 ${workflowState === 'rejected' ? 'text-red-700' : 'text-blue-700'}`}>
                        {workflowMessage}
                    </p>
                    {isLoading && <p className="text-sm text-gray-500 italic mb-3">Processing...</p>}

                    {/* Approval/Rejection Buttons */}
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
                    {workflowState === 'rejected' && (
                        <p className="text-red-700 font-medium">Reason: {rejectReason}</p>
                    )}
                    {/* Final Execution Button */}
                    {workflowState === 'approved' && !isLoading && (
                        <button onClick={handleExecuteIssue} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-bold">
                             Confirm & Issue Token
                        </button>
                    )}
                </div>
            )}

            {/* Summary Display (Only when idle before submission) */}
            {workflowState === 'idle' && (
                 <>
                    <p className="text-gray-600 mb-6">Review details below and click 'Request Issuance Approval' to proceed.</p>
                     {/* TODO: Create a dedicated Summary component for better structure */}
                    <div className='p-4 border rounded bg-gray-50 mb-6 space-y-2 text-sm'>
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
                        {/* Fee Summary */}
                        <p><strong>Fees Enabled:</strong> {permissionDetails.feeScheduleEnabled ? `Yes` : 'No'}</p>
                        {permissionDetails.feeScheduleEnabled && (
                            <div className='ml-4'>
                                <p>Percentage Fee: {permissionDetails.feeDetails.overallFeePercentage || 0}%</p>
                                <p>Flat Fee: {permissionDetails.feeDetails.flatFeeAmount || 0} {permissionDetails.feeDetails.flatFeeCurrency}</p>
                                <p>Fee Distribution:</p>
                                {permissionDetails.feeDetails.recipients.length > 0 ? (
                                    <ul className='list-disc list-inside ml-4'>{permissionDetails.feeDetails.recipients.map((r, i) => (
                                        <li key={r.id || i}>{r.address || '[Missing Address]'}: {r.percentage || '[Missing %'}%</li>
                                    ))}</ul>
                                ) : (
                                    <p className='ml-4 italic text-red-600'>Fee Recipient Required!</p> // Highlight if required but missing
                                )}
                            </div>
                        )}
                        <p><strong>Pausable:</strong> {permissionDetails.pausable ? 'Yes' : 'No'}</p>
                        <p><strong>Fungible:</strong> {permissionDetails.fungible ? 'Yes' : 'No'}</p>
                        <p><strong>Expiration Enabled:</strong> {permissionDetails.isExpirationEnabled ? `Yes (Date: ${permissionDetails.expiration || 'Not Set'})` : 'No'}</p>
                        <p><strong>Roles:</strong></p>
                        {permissionDetails.roles.length > 0 ? (
                            <ul className='list-disc list-inside ml-4'>{permissionDetails.roles.map((r, i) => <li key={i}>{r.role}: {r.address}</li>)}</ul>
                        ) : ( <p className='ml-4 italic'>None specified</p> )}
                        <p><strong>Regulatory Info:</strong></p>
                        {regulatoryInfo.length > 0 ? (
                            <ul className='list-disc list-inside ml-4'>{regulatoryInfo.map((info, i) => <li key={i}>{info.country}: {info.regulator}</li>)}</ul>
                        ) : ( <p className='ml-4 italic'>None specified</p> )}
                        <p><strong>Asset Backed:</strong> {reserveDetails.isBackedAsset ? 'Yes' : 'No'}</p>
                        {reserveDetails.isBackedAsset && reserveDetails.isConfigured && (
                            <div className='ml-4'>
                                <p><strong>Backing Type:</strong> {reserveDetails.backingType}</p>
                                {reserveDetails.backingType === 'bank' && <p>Bank Name: {reserveDetails.bankName}, Account ending: {reserveDetails.accountNumberLast4}</p>}
                                {reserveDetails.backingType === 'smartcontract' && <p>Network: {reserveDetails.contractNetwork}, Address: {reserveDetails.contractAddress}</p>}
                                {reserveDetails.backingType === 'custodian' && <p>Custodian: {reserveDetails.custodianName} (Acct: {reserveDetails.custodianAccountId || 'N/A'}, Report: {reserveDetails.custodianReportType || 'N/A'}, Freq: {reserveDetails.attestationFrequency})</p>}
                                {reserveDetails.backingType === 'onchain_wallet' && <p>Network: {reserveDetails.onChainNetwork}, Address: {reserveDetails.onChainWalletAddress}</p>}
                            </div>
                        )}
                        {reserveDetails.isBackedAsset && !reserveDetails.isConfigured && <p className='ml-4 text-red-600'>Reserve details not configured!</p>}
                        <p><strong>Token Custody:</strong> {tokenCustodyType === 'self' ? 'Self Custody (Platform Internal)' : `Third Party (${selectedTokenCustodianName || 'Not Selected'})`}</p>
                        {tokenCustodyType === 'thirdParty' && tokenCustodyConnectionStatus === 'verified' && <p className='ml-4'>Custodian Account ID: {tokenCustodianAccountIdInput || 'N/A'}</p>}
                         {tokenCustodyType === 'thirdParty' && tokenCustodyConnectionStatus !== 'verified' && <p className='ml-4 text-red-600'>Token custody connection not verified!</p>}
                    </div>
                </>
            )}

            {/* Navigation for Finalization Step */}
            <div className="flex justify-between mt-8">
                {/* Show Previous Step only when Idle */}
                 { workflowState === 'idle' ? (
                    <button
                        className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-50"
                        onClick={() => setIssuanceScreen('permissions')}
                    >
                        Previous Step
                    </button>
                ) : (
                    <div /> // Placeholder to maintain layout
                )}

                 {/* Show Request Approval only when Idle */}
                 { workflowState === 'idle' ? (
                    <button
                        className="px-4 py-2 rounded text-white hover:opacity-90 bg-green-600 disabled:opacity-50"
                        onClick={handleInitiateIssuanceApproval}
                         // Use the pre-calculated validation state
                        disabled={!isFinalStepValid}
                    >
                        Request Issuance Approval
                    </button>
                 ) : (
                    <div /> // Placeholder
                )}
            </div>
        </div>
    );


    // --- Main Render ---
    return (
        <div className="p-6 md:p-8"> {/* Added padding */}
            <div className="bg-white p-6 rounded shadow max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-6 pb-4 border-b"> {/* Added border */}
                    <h1 className="text-2xl font-bold text-gray-800">Issue New Tokens</h1>
                     {/* Button now cancels workflow OR goes back */}
                    <button
                        className="px-3 py-1 rounded text-white hover:opacity-90 bg-gray-700 hover:bg-gray-800 text-sm disabled:opacity-50"
                         onClick={workflowState === 'idle' ? onBack : handleCancelRequest}
                        disabled={isLoading && workflowState !== 'idle'} // Disable only if workflow is active AND loading
                    >
                        {workflowState === 'idle' ? 'Back to Dashboard' : 'Cancel Issuance Request'}
                    </button>
                </div>

                 <ProgressSteps
                    currentStep={issuanceScreen}
                    steps={['Token Details', 'Supply & Reserves', 'Permissions', 'Finalization']}
                    workflowState={workflowState}
                 />

                {/* Render Current Step */}
                {issuanceScreen === 'token-details' && workflowState === 'idle' && renderTokenDetailsStep()}
                {issuanceScreen === 'supply-reserves-metadata' && workflowState === 'idle' && renderSupplyReservesStep()}
                {issuanceScreen === 'permissions' && workflowState === 'idle' && renderPermissionsStep()}
                 {/* Finalization step is shown when screen is 'finalization', regardless of workflow state (idle or active) */}
                {issuanceScreen === 'finalization' && renderFinalizationStep()}

                 {/* Fallback for invalid state (shouldn't happen ideally) */}
                {issuanceScreen !== 'token-details' &&
                 issuanceScreen !== 'supply-reserves-metadata' &&
                 issuanceScreen !== 'permissions' &&
                 issuanceScreen !== 'finalization' && (
                     <p className="text-red-500 text-center mt-4">Error: Invalid wizard state reached.</p>
                 )}

            </div>
        </div>
    );
};

export default TokenIssuanceWizard; //