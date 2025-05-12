// src/features/Payments/data/paymentConstants.js

export const hvtPurposeCodes = ['Select purpose code', 'BKTR', 'CBFT', 'CORT', 'GOVT', 'TREA', 'SUPP'];

export const settlementSpeeds = {
    standard: { label: 'Standard', feePercent: 0.001 },
    express: { label: 'Express', feePercent: 0.0025 },
};

export const jurisdictions = [
    { code: '', name: 'Select Jurisdiction...' },
    { code: 'US', name: 'United States', currency: 'USD' },
    { code: 'EU', name: 'Europe', currency: 'EUR' },
    { code: 'JP', name: 'Japan', currency: 'JPY' },
    { code: 'GH', name: 'Ghana', currency: 'GHS' },
    { code: 'CA', name: 'Canada', currency: 'CAD' },
    { code: 'SG', name: 'Singapore', currency: 'SGD' },
    { code: 'GB', name: 'United Kingdom', currency: 'GBP' },
    { code: 'AU', name: 'Australia', currency: 'AUD' },
    { code: 'CH', name: 'Switzerland', currency: 'CHF' },
];

export const traditionalRailsList = [
    { code: '', name: 'Select Traditional Rail...' },
    { code: 'SWIFT', name: 'SWIFT', fee: 5.00, feeType: 'flat' },
    { code: 'HSBC', name: 'Correspondent Bank (HSBC)', fee: 1.50, feeType: 'flat' },
    { code: 'JPM', name: 'Correspondent Bank (JP Morgan)', fee: 1.75, feeType: 'flat' },
    { code: 'MUFG', name: 'Correspondent Bank (Mitsubishi)', fee: 2.00, feeType: 'flat' },
    { code: 'SANT', name: 'Correspondent Bank (Santander)', fee: 1.25, feeType: 'flat' },
    { code: 'VISA', name: 'Card Network (VISA Direct)', fee: 0.008, feeType: 'percent' },
    { code: 'MC', name: 'Card Network (Mastercard Send)', fee: 0.009, feeType: 'percent' },
    { code: 'WU', name: 'Money Transfer (Western Union)', fee: 3.00, feeType: 'flat' },
];

export const onChainNetworksList = [
    { code: '', name: 'Select Network...' },
    { code: 'Ethereum', name: 'Ethereum', nativeSymbol: 'ETH' },
    { code: 'Polygon', name: 'Polygon', nativeSymbol: 'MATIC' },
    { code: 'Stellar', name: 'Stellar', nativeSymbol: 'XLM' },
    { code: 'Hedera', name: 'Hedera', nativeSymbol: 'HBAR' },
    { code: 'Solana', name: 'Solana', nativeSymbol: 'SOL' },
];

export const baseGasFeeUSD = {
    Ethereum: 5.00,
    Polygon: 0.10,
    Stellar: 0.01,
    Hedera: 0.01,
    Solana: 0.05,
    default: 0.50
};

export const nativeTokenPricesUSD = {
    ETH: 3000,
    MATIC: 0.7,
    XLM: 0.1,
    HBAR: 0.08,
    SOL: 150,
};

export const ratesToUSD = {
    USD: 1, EUR: 1.10, GBP: 1.25, CAD: 0.74, AUD: 0.66, SGD: 0.74,
    JPY: 0.0067, CHF: 1.11, GHS: 0.067,
    USDC: 1, USDT: 1, 'D-EUR': 1.10, eGH: 0.067,
    'T-BOND': 2000,
    INR: 0.012
};

export const ratesFromUSD = {
    USD: 1, EUR: 0.91, JPY: 150, GHS: 15, CAD: 1.36, GBP: 0.80, AUD: 1.52, SGD: 1.35, CHF: 0.90,
    USDC: 1, USDT: 1, 'D-EUR': 0.91, eGH: 15,
    INR: 83,
};

export const initialDummyActiveBulkFiles = [
    {
      id: 'bulk-active-1',
      fileName: 'Vendor_Payments_Mar2025.csv',
      batchLabel: 'March 2025 Vendor Payments', // <-- New Field Added
      batchReference: 'Q1-VP-003', // <-- New Field Added
      uploadTimestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      fileType: 'CSV',
      paymentType: 'Vendor Payments', // <-- Make this potentially editable
      totalPayments: 942,
      processedPayments: 0,
      totalValue: 3854216.42,
      currency: 'USD',
      sourceAccountId: 'inst-usd-primary',
      scheduleTimestamp: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 1, 14, 0, 0),
      status: 'Scheduled',
      statusMessage: 'Validated, awaiting scheduled processing time.',
    },
    {
      id: 'bulk-active-2',
      fileName: 'Payroll_Distribution_Mar15.iso',
      batchLabel: 'Mid-March Payroll', // <-- New Field Added
      batchReference: 'PAY-2025-03-15', // <-- New Field Added
      uploadTimestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      fileType: 'ISO20022',
      paymentType: 'Payroll', // <-- Make this potentially editable
      totalPayments: 1248,
      processedPayments: 0,
      totalValue: 5875432.12,
      currency: 'USD',
      sourceAccountId: 'inst-usd-primary',
      scheduleTimestamp: null,
      status: 'Validated',
      statusMessage: 'File passed validation checks.',
    },
    {
      id: 'bulk-active-3',
      fileName: 'FX_Payments_Apr15.xml',
      batchLabel: '', // Example: Can be empty initially
      batchReference: '', // Example: Can be empty initially
      uploadTimestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
      fileType: 'XML',
      paymentType: 'FX Settlement', // <-- Make this potentially editable
      totalPayments: 50,
      processedPayments: 0,
      totalValue: 15200000.00,
      currency: 'EUR',
      sourceAccountId: 'inst-eur-primary',
      scheduleTimestamp: null,
      status: 'Validating',
      statusMessage: 'Running format and data checks...',
    },
  ];
  
export const paymentTypes = ['Tokenized', 'Traditional', 'Internal'];

export const modalSamplePurposes = ['Select purpose code', 'BKTR', 'CBFT', 'CORT', 'GOVT', 'TREA', 'SUPP', 'INTRA'];

// NEW: Add Institutional Recipient Presets
export const institutionalRecipients = [
    { id: 'inst-rec-0', name: '-- Select Common Inst Client --', account: '', institution: '', jurisdiction: '' },
    // US Banks / Corporations / Exchanges
    { id: 'inst-rec-1', name: 'Apple Inc.', account: 'US-BOFA-ACCT-APPLE-123', institution: 'Bank of America', jurisdiction: 'US' },
    { id: 'inst-rec-2', name: 'Microsoft Corporation', account: 'US-JPM-ACCT-MSFT-456', institution: 'JPMorgan Chase', jurisdiction: 'US' },
    { id: 'inst-rec-3', name: 'Coinbase Inc.', account: '0xCoinbaseCustody789ETH', institution: 'Ethereum Mainnet', jurisdiction: 'US' },
    // EU Banks / Corporations / Exchanges
    { id: 'inst-rec-4', name: 'Volkswagen AG', account: 'DE-DB-ACCT-VW-101', institution: 'Deutsche Bank', jurisdiction: 'EU' },
    { id: 'inst-rec-5', name: 'BNP Paribas SA', account: 'FR-BNP-ACCT-CORP-112', institution: 'BNP Paribas', jurisdiction: 'EU' },
    { id: 'inst-rec-6', name: 'Kraken Exchange (Payward)', account: 'kraken-custody-eur-131', institution: 'SEPA / Kraken Internal', jurisdiction: 'EU' },
    // JP Banks / Corporations / Exchanges
    { id: 'inst-rec-7', name: 'Toyota Motor Corp', account: 'JP-MUFG-ACCT-TOYOTA-456', institution: 'MUFG Bank', jurisdiction: 'JP' },
    { id: 'inst-rec-8', name: 'Sony Group Corporation', account: 'JP-SMBC-ACCT-SONY-789', institution: 'Sumitomo Mitsui Banking Corporation', jurisdiction: 'JP' },
    // GH Banks / Corporations / Exchanges
    { id: 'inst-rec-9', name: 'MTN Ghana', account: 'GH-ECO-ACCT-MTN-202', institution: 'Ecobank Ghana', jurisdiction: 'GH' },
    { id: 'inst-rec-10', name: 'Ghana Cocoa Board', account: 'GH-GCB-ACCT-COCOBOD-303', institution: 'GCB Bank', jurisdiction: 'GH' },
    // CA Banks / Corporations / Exchanges
    { id: 'inst-rec-11', name: 'Royal Bank of Canada', account: 'CA-RBC-ACCT-CORP-404', institution: 'Royal Bank of Canada', jurisdiction: 'CA' },
    { id: 'inst-rec-12', name: 'Shopify Inc.', account: 'CA-TD-ACCT-SHOP-505', institution: 'Toronto-Dominion Bank', jurisdiction: 'CA' },
    // SG Banks / Corporations / Exchanges
    { id: 'inst-rec-13', name: 'DBS Bank Ltd', account: 'SG-DBS-ACCT-CORP-606', institution: 'DBS Bank', jurisdiction: 'SG' },
    { id: 'inst-rec-14', name: 'Grab Holdings Inc.', account: 'SG-UOB-ACCT-GRAB-707', institution: 'United Overseas Bank', jurisdiction: 'SG' },
    // GB Banks / Corporations / Exchanges
    { id: 'inst-rec-15', name: 'Shell plc', account: 'GB-HSBC-ACCT-SHELL-789', institution: 'HSBC UK', jurisdiction: 'GB' },
    { id: 'inst-rec-16', name: 'Barclays plc', account: 'GB-BARC-ACCT-CORP-808', institution: 'Barclays Bank UK PLC', jurisdiction: 'GB' },
    // AU Banks / Corporations / Exchanges
    { id: 'inst-rec-17', name: 'Commonwealth Bank', account: 'AU-CBA-ACCT-CORP-909', institution: 'Commonwealth Bank of Australia', jurisdiction: 'AU' },
    { id: 'inst-rec-18', name: 'BHP Group Limited', account: 'AU-NAB-ACCT-BHP-1010', institution: 'National Australia Bank', jurisdiction: 'AU' },
    // CH Banks / Corporations / Exchanges
    { id: 'inst-rec-19', name: 'UBS Group AG', account: 'CH-UBS-ACCT-CORP-1111', institution: 'UBS Switzerland AG', jurisdiction: 'CH' },
    { id: 'inst-rec-20', name: 'Nestlé S.A.', account: 'CH-CS-ACCT-NESTLE-1212', institution: 'Credit Suisse (Schweiz) AG', jurisdiction: 'CH' },
];

export const dummyTemplates = [
    { id: 'tpl1', name: 'HSBC London Monthly Settlement', paymentType: 'Tokenized', recipientName: 'HSBC London', recipientAccount: 'GB29NWBK60161331926819', recipientInstitution: 'HSBC Bank plc', fromAccountLabel: 'USDC Treasury Wallet', amount: '2500000', currency: 'USDC', purpose: 'BKTR', lastUsed: 'Mar 3, 2025' },
    { id: 'tpl2', name: 'JPM Reserve Account Funding', paymentType: 'Tokenized', recipientName: 'JPMorgan Chase', recipientAccount: '0x...JPMCustody', recipientInstitution: 'Ethereum', fromAccountLabel: 'USDC Treasury Wallet', amount: '', currency: 'USDC', purpose: 'TREA', lastUsed: 'Feb 28, 2025' },
    { id: 'tpl3', name: 'Deutsche Bank EUR Transfer', paymentType: 'Traditional', traditionalRail: 'SWIFT', recipientName: 'Deutsche Bank AG', recipientAccount: 'DE89370400440532013000', recipientInstitution: 'DEUTDEFF', fromAccountLabel: 'USD Primary Account', amount: '1800000', currency: 'EUR', purpose: 'CORT', lastUsed: 'Feb 20, 2025' },
    { id: 'tpl4', name: 'Citi Singapore Internal Transfer', paymentType: 'Internal', recipientName: 'Citi Internal Ops SG', recipientAccount: 'CITI-SG-OPS-001', recipientInstitution: 'Internal Platform', fromAccountLabel: 'USDC Treasury Wallet', amount: '', currency: 'USDC', purpose: 'INTRA', lastUsed: 'Mar 4, 2025' },
    { id: 'tpl5', name: 'ICICI Mumbai INR Transfer', paymentType: 'Tokenized', recipientName: 'ICICI Bank Ltd', recipientAccount: 'icici-wallet-mumbai-7a6b', recipientInstitution: 'Internal Ledger (e₹)', fromAccountLabel: 'eRupee Wallet', amount: '75000000', currency: 'INR', purpose: 'CORT', lastUsed: 'Feb 15, 2025' },
    { id: 'tpl6', name: 'Supplier Payment - ACME Corp', paymentType: 'Tokenized', recipientName: 'ACME Corporation', recipientAccount: 'GD..ACME..STELLAR..WALLET', recipientInstitution: 'Stellar', fromAccountLabel: 'USD Primary Account', amount: '150000', currency: 'USD', purpose: 'SUPP', lastUsed: 'Mar 1, 2025' },
];

export const initialDummyRecurringPayments = [
  { id: 'rec1', name: 'HSBC Monthly Settlement', recipient: 'HSBC London', fromAccountId: 'usdc', amount: 2500000, currency: 'USDC', frequency: 'Monthly (1st)', startDate: '2025-01-01', nextDate: '2025-05-01', nextTime: '3:00 PM UTC', status: 'Active' },
  { id: 'rec2', name: 'JPM Weekly Liquidity Transfer', recipient: 'JPMorgan Chase', fromAccountId: 'usdc', amount: 750000, currency: 'USDC', frequency: 'Weekly (Monday)', startDate: '2025-01-01', nextDate: '2025-04-14', nextTime: '9:00 AM UTC', status: 'Active' },
  { id: 'rec3', name: 'Deutsche Bank Quarterly Payment', recipient: 'Deutsche Bank', fromAccountId: 'inst-usd-primary', amount: 1800000, currency: 'EUR', frequency: 'Quarterly (1st day)', startDate: '2025-01-01', nextDate: '2025-07-01', nextTime: '10:00 AM UTC', status: 'Active' },
  { id: 'rec4', name: 'Singapore Daily Liquidity', recipient: 'Citi Singapore', fromAccountId: 'usdc', amount: null, currency: 'USDC', frequency: 'Daily (Business days)', startDate: '2025-01-01', nextDate: '2025-04-09', nextTime: '7:00 AM UTC', status: 'Active' },
  { id: 'rec5', name: 'Ghana MoMo Partner Transfer', recipient: 'MTN Ghana', fromAccountId: 'e-cedi', amount: 500000, currency: 'GHS', frequency: 'Monthly (15th)', startDate: '2025-01-01', nextDate: '2025-04-15', nextTime: '5:00 AM UTC', status: 'Active' },
  { id: 'rec6', name: 'Bank of America Weekly Settlement', recipient: 'Bank of America', fromAccountId: 'inst-usd-primary', amount: 950000, currency: 'USD', frequency: 'Weekly (Friday)', startDate: '2025-01-01', nextDate: 'Paused', nextTime: '', status: 'Paused' },
  { id: 'rec7', name: 'Old Supplier Payment', recipient: 'Obsolete Systems Inc', fromAccountId: 'inst-usd-primary', amount: 10000, currency: 'USD', frequency: 'Monthly (1st)', startDate: '2025-01-01', nextDate: 'N/A', nextTime: '', status: 'Completed' },
  { id: 'rec8', name: 'Test Recurring Internal', recipient: 'Internal Ops Wallet', fromAccountId: 'usdc', amount: 100, currency: 'USDC', frequency: 'Daily', startDate: '2025-01-01', nextDate: '2025-04-09', nextTime: '1:00 PM UTC', status: 'Active' },
  { id: 'rec-comp-1', name: 'Old Payroll Batch (Jan)', recipient: 'Payroll Provider', fromAccountId: 'inst-usd-primary', amount: 115000, currency: 'USD', frequency: 'Monthly', startDate: '2025-01-01', nextDate: 'N/A', nextTime: '', status: 'Completed' },
  { id: 'rec-comp-2', name: 'Q4 Marketing Spend', recipient: 'Ad Agency X', fromAccountId: 'inst-usd-primary', amount: 25000, currency: 'USD', frequency: 'Quarterly', startDate: '2025-01-01', nextDate: 'N/A', nextTime: '', status: 'Completed' },
  { id: 'rec-comp-3', name: 'EU Office Rent (Old)', recipient: 'EU Landlord Property', fromAccountId: 'inst-eur-primary', amount: 15000, currency: 'EUR', frequency: 'Monthly', startDate: '2025-01-01', nextDate: 'N/A', nextTime: '', status: 'Completed' },
  { id: 'rec-comp-4', name: 'USDC Loan Repayment', recipient: 'Crypto Lender Inc.', fromAccountId: 'usdc', amount: 50000, currency: 'USDC', frequency: 'Weekly', startDate: '2025-01-01', nextDate: 'N/A', nextTime: '', status: 'Completed' },
  { id: 'rec-comp-5', name: 'Software Subscription (Expired)', recipient: 'SaaS Vendor Z', fromAccountId: 'inst-usd-primary', amount: 999, currency: 'USD', frequency: 'Annually', startDate: '2025-01-01', nextDate: 'N/A', nextTime: '', status: 'Completed' },
  { id: 'rec-comp-6', name: 'Consulting Fee (Project Alpha)', recipient: 'External Consultant', fromAccountId: 'inst-usd-primary', amount: 22000, currency: 'USD', frequency: 'One-Time (Completed)', startDate: '2025-01-01', nextDate: 'N/A', nextTime: '', status: 'Completed' },
  { id: 'rec-comp-7', name: 'USDT Staking Reward Payout', recipient: 'Internal Treasury', fromAccountId: 'usdt', amount: 5000, currency: 'USDT', frequency: 'Monthly', startDate: '2025-01-01', nextDate: 'N/A', nextTime: '', status: 'Completed' },
  { id: 'rec-comp-8', name: 'eCedi Pilot Test Payment', recipient: 'Test Merchant GH', fromAccountId: 'e-cedi', amount: 1000, currency: 'GHS', frequency: 'One-Time (Completed)', startDate: '2025-01-01', nextDate: 'N/A', nextTime: '', status: 'Completed' },
];

export const initialPaymentHistory = [
    {
        id: 'hvt_1712720000000', // High Value Transfer - Pending
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        type: 'HVT',
        amount: 5000000, currency: 'USD',
        recipient: 'JP Morgan Chase', status: 'Pending Approval',
        reference: 'HVT-PEND01',
        rawData: {
            destination_counterparty_info: { name: 'JP Morgan Chase', accountIdentifier: '123456789', institution: 'Bank of Example Corp', jurisdiction: 'US' },
            payment_source: { account_id: 'inst-usd-primary', entity: 'Bank of America', onBehalfOf: 'Treasury Ops' },
            payment_info: { amount: 5000000, currency: 'USD', purpose: 'TREA', description: 'Funding for Example account' },
            _ui_payment_type: 'hvt', // HVT type hint
            _ui_payment_origin: 'institutional',
            _ui_sender_account_label: 'USD Primary Account',
            _ui_settlement_speed: 'standard', // Assumed for HVT
            _ui_traditional_rail: 'FEDW', // Example for HVT
            _ui_date_type: 'immediate', _ui_scheduled_date: null,
            _simulated_fees: { platform: 2500, settlement: 0, networkOrRail: 10, slippage: 0, contract: 0, fxSpread: 0, genericBank: 1000 }, // Example fees
            _ui_network_fee_display: '10.00 USD (Fedwire Fee)',
            _simulated_total_debit: 5003510,
        }
    },
    {
        id: 'ph1', // Cross-Border USDC - Completed
        timestamp: new Date(Date.now() - 2 * 60 * 1000),
        type: 'Cross-Border',
        amount: 1500, currency: 'USDC',
        recipient: 'Accenture', status: 'Completed', // Status from on-chain payment update
        reference: 'INV-123',
        rawData: {
            destination_counterparty_info: { name: 'Accenture', accountIdentifier: '0xVendorA...ETH', institution: 'Ethereum Mainnet' },
            payment_source: { account_id: 'usdc', entity: 'Bank of America' }, // Assume institutional source
            payment_info: { amount: 1500, currency: 'USDC', purpose: 'SUPP', description: 'Invoice #123 Payment' },
            _ui_payment_type: 'on-chain', // On-chain type hint
            _ui_payment_origin: 'institutional',
            _ui_sender_account_label: 'USDC Treasury Wallet',
            _ui_onchain_network: 'Ethereum',
            _ui_date_type: 'immediate', _ui_scheduled_date: null,
            _simulated_fees: { platform: 0.75, settlement: 0, networkOrRail: 5.5, slippage: 1.2, contract: 0.02, fxSpread: 0, genericBank: 0 }, // Example fees
            _ui_network_fee_display: '0.00184 ETH (Est. Gas + Interaction)', // Example display
            _simulated_total_debit: 1507.47,
        }
    },
    {
        id: 'ph3', // Cross-Border USDT - Completed
        timestamp: new Date(Date.now() - 10 * 60 * 1000),
        type: 'Cross-Border',
        amount: 25000, currency: 'USDT',
        recipient: 'EMTECH', status: 'Completed', // Status from on-chain payment update
        reference: 'PO-456',
        rawData: {
            destination_counterparty_info: { name: 'EMTECH', accountIdentifier: 'TPartner...TRON', institution: 'Tron Network' },
            payment_source: { account_id: 'usdt', entity: 'Bank of America' }, // Assume institutional source
            payment_info: { amount: 25000, currency: 'USDT', purpose: 'CORT', description: 'Purchase Order 456' },
            _ui_payment_type: 'on-chain', // On-chain type hint
            _ui_payment_origin: 'institutional',
            _ui_sender_account_label: 'USDT Treasury Wallet',
            _ui_onchain_network: 'Tron', // Example different network
            _ui_date_type: 'immediate', _ui_scheduled_date: null,
            _simulated_fees: { platform: 12.5, settlement: 0, networkOrRail: 1.0, slippage: 20.0, contract: 0.01, fxSpread: 0, genericBank: 0 }, // Example fees Tron might be cheaper
            _ui_network_fee_display: '15 TRX (Est. Energy + Bandwidth)', // Example display
            _simulated_total_debit: 25033.51,
        }
    },
    {
        id: 'ph4', // High Value Transfer - Authorized (Completed technically)
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        type: 'HVT',
        amount: 10000000, currency: 'GBP',
        recipient: 'UK Treasury', status: 'Authorized',
        reference: 'HVT-AUTH01',
        rawData: {
            destination_counterparty_info: { name: 'UK Treasury', accountIdentifier: 'GB12ABCD12345678901234', institution: 'Bank of England', jurisdiction: 'GB' },
            payment_source: { account_id: 'inst-gbp-primary', entity: 'Bank of England', onBehalfOf: 'Tax Payment Dept' },
            payment_info: { amount: 10000000, currency: 'GBP', purpose: 'GOVT', description: 'Q1 VAT Payment' },
            _ui_payment_type: 'hvt',
            _ui_payment_origin: 'institutional',
            _ui_sender_account_label: 'GBP Primary Account',
            _ui_settlement_speed: 'express', // Example HVT speed
            _ui_traditional_rail: 'CHAPS', // Example UK rail
            _ui_date_type: 'immediate', _ui_scheduled_date: null,
            _simulated_fees: { platform: 5000, settlement: 25000, networkOrRail: 20, slippage: 0, contract: 0, fxSpread: 0, genericBank: 2000 }, // Example fees
            _ui_network_fee_display: '20.00 GBP (CHAPS Fee)',
            _simulated_total_debit: 10032020,
        }
    },
    {
        id: 'ph5', // Cross-Border eGHC - Completed
        timestamp: new Date(Date.now() - 60 * 60 * 1000),
        type: 'Cross-Border', // Could be 'On-Chain' if representing a CBDC tx
        amount: 50, currency: 'GHS', // Updated currency symbol
        recipient: 'MTN', status: 'Completed',
        reference: 'POS-789',
        rawData: {
            destination_counterparty_info: { name: 'MTN', accountIdentifier: 'merchant-gh-wallet-1', institution: 'Ghana CBDC Ledger' },
            payment_source: { account_id: 'e-cedi', entity: 'Bank of Ghana' }, // Use e-cedi account
            payment_info: { amount: 50, currency: 'GHS', purpose: 'SUPP', description: 'Point of Sale Purchase' },
            _ui_payment_type: 'on-chain', // Treat as on-chain
            _ui_payment_origin: 'institutional', // Assume from bank's wallet
            _ui_sender_account_label: 'eCedi Operational Wallet',
            _ui_onchain_network: 'Ghana CBDC', // Example network name
            _ui_date_type: 'immediate', _ui_scheduled_date: null,
            _simulated_fees: { platform: 0.025, settlement: 0, networkOrRail: 0.01, slippage: 0.04, contract: 0, fxSpread: 0, genericBank: 0 }, // Very low fees
            _ui_network_fee_display: '0.01 GHS (Network Fee)', // Example display
            _simulated_total_debit: 50.075,
        }
    },
    {
        id: 'ph6', // Bulk Process - Completed
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        type: 'Bulk Process',
        amount: 125000, currency: 'USD',
        recipient: 'Payroll Batch 1', status: 'Completed',
        reference: 'BULK-PAY-01',
        rawData: {
            // Bulk raw data might be different, focusing on file info
            fileInfo: { name: 'payroll_april_pt1.csv', size: 12400, rows: 55 },
            payment_source: { account_id: 'inst-usd-primary', entity: 'Bank of America' },
            payment_info: { amount: 125000, currency: 'USD', purpose: 'SALA', description: 'Payroll for April 2025 - Part 1' },
            _ui_payment_type: 'bulk', // Specific type hint
            _ui_payment_origin: 'institutional',
            _ui_sender_account_label: 'USD Primary Account',
            // Fees for bulk might be calculated differently, simplified here
            _simulated_fees: { platform: 62.5, settlement: 0, networkOrRail: 5.50, slippage: 0, contract: 0, fxSpread: 0, genericBank: 0 }, // Per-file + platform fee?
            _ui_network_fee_display: '5.50 USD (Processing Fee)',
            _simulated_total_debit: 125068.00, // Total debit might not match amount field directly
        }
    },
    {
        id: 'ph7', // Cross-Border USDC Test - Completed
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        type: 'Cross-Border',
        amount: 999, currency: 'USDC',
        recipient: 'Test Wallet', status: 'Completed',
        reference: 'TEST-001',
        rawData: {
            destination_counterparty_info: { name: 'Test Wallet', accountIdentifier: '0xTest...Dev', institution: 'Polygon PoS' },
            payment_source: { account_id: 'usdc', entity: 'Bank of America' }, // Assume institutional source
            payment_info: { amount: 999, currency: 'USDC', purpose: 'TEST', description: 'QA Test Payment' },
            _ui_payment_type: 'on-chain', // On-chain type hint
            _ui_payment_origin: 'institutional',
            _ui_sender_account_label: 'USDC Treasury Wallet',
            _ui_onchain_network: 'Polygon',
            _ui_date_type: 'immediate', _ui_scheduled_date: null,
            _simulated_fees: { platform: 0.4995, settlement: 0, networkOrRail: 0.11, slippage: 0.7992, contract: 0.02, fxSpread: 0, genericBank: 0 }, // Example fees for Polygon
            _ui_network_fee_display: '0.1857 MATIC (Est. Gas + Interaction)', // Example display
            _simulated_total_debit: 1000.4287,
        }
    },
].sort((a, b) => b.timestamp - a.timestamp);