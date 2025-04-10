// src/features/Payments/data/paymentConstants.js

// Used in CreateHighValueTransferScreen
export const hvtPurposeCodes = ['Select purpose code', 'BKTR', 'CBFT', 'CORT', 'GOVT', 'TREA', 'SUPP'];

// Used in CreatePaymentScreen
export const settlementSpeeds = {
    standard: { label: 'Standard', feePercent: 0.001 }, // Example fee
    express: { label: 'Express', feePercent: 0.0025 }, // Example fee
};

// Used in CreatePaymentScreen
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

// Used in CreatePaymentScreen, CreateEditTemplateModal
export const traditionalRailsList = [
    { code: '', name: 'Select Traditional Rail...' },
    { code: 'SWIFT', name: 'SWIFT', fee: 5.00, feeType: 'flat' }, // Example fee structure
    { code: 'HSBC', name: 'Correspondent Bank (HSBC)', fee: 1.50, feeType: 'flat' },
    { code: 'JPM', name: 'Correspondent Bank (JP Morgan)', fee: 1.75, feeType: 'flat' },
    { code: 'MUFG', name: 'Correspondent Bank (Mitsubishi)', fee: 2.00, feeType: 'flat' },
    { code: 'SANT', name: 'Correspondent Bank (Santander)', fee: 1.25, feeType: 'flat' },
    { code: 'VISA', name: 'Card Network (VISA Direct)', fee: 0.008, feeType: 'percent' },
    { code: 'MC', name: 'Card Network (Mastercard Send)', fee: 0.009, feeType: 'percent' },
    { code: 'WU', name: 'Money Transfer (Western Union)', fee: 3.00, feeType: 'flat' },
];

// Used in CreatePaymentScreen, CreateEditTemplateModal
export const onChainNetworksList = [
    { code: '', name: 'Select Network...' },
    { code: 'Ethereum', name: 'Ethereum', nativeSymbol: 'ETH' },
    { code: 'Polygon', name: 'Polygon', nativeSymbol: 'MATIC' },
    { code: 'Stellar', name: 'Stellar', nativeSymbol: 'XLM' },
    { code: 'Hedera', name: 'Hedera', nativeSymbol: 'HBAR' },
    { code: 'Solana', name: 'Solana', nativeSymbol: 'SOL' },
];

// Used in CreatePaymentScreen (Simulated Gas Fees)
export const baseGasFeeUSD = {
    Ethereum: 5.00,
    Polygon: 0.10,
    Stellar: 0.01,
    Hedera: 0.01,
    Solana: 0.05,
    default: 0.50 // Fallback
};

// Used in CreatePaymentScreen (Simulated Native Token Prices)
export const nativeTokenPricesUSD = {
    ETH: 3000,
    MATIC: 0.7,
    XLM: 0.1,
    HBAR: 0.08,
    SOL: 150,
};

// Used in CreatePaymentScreen (Simulated FX Rates)
export const ratesToUSD = {
    USD: 1, EUR: 1.10, GBP: 1.25, CAD: 0.74, AUD: 0.66, SGD: 0.74,
    JPY: 0.0067, CHF: 1.11, GHS: 0.067,
    // Stablecoins assumed 1:1 with USD for simplicity here
    USDC: 1, USDT: 1, D_EUR: 1.10, eGH: 0.067, // Assuming D-EUR tracks EUR, eGH¢ tracks GHS
    'T-GOLD': 2000, // Example price per token if needed
    INR: 0.012 // Example INR rate
};

// Used in CreatePaymentScreen (Simulated FX Rates)
export const ratesFromUSD = {
    USD: 1, EUR: 0.91, JPY: 150, GHS: 15, CAD: 1.36, GBP: 0.80, AUD: 1.52, SGD: 1.35, CHF: 0.90,
    // Stablecoins
    USDC: 1, USDT: 1, D_EUR: 0.91, eGH: 15,
    INR: 83, // Example INR rate
};


// Used in CreateEditTemplateModal
export const paymentTypes = ['Tokenized', 'Traditional', 'Internal'];

// Used in CreatePaymentScreen, CreateEditTemplateModal (Consider merging/deduplicating with hvtPurposeCodes if identical)
export const modalSamplePurposes = ['Select purpose code', 'BKTR', 'CBFT', 'CORT', 'GOVT', 'TREA', 'SUPP', 'INTRA'];

// --- ADDED DUMMY DATA FOR STATE LIFTING ---

// Originally defined in ViewTemplatesScreen.js
export const dummyTemplates = [
    { id: 'tpl1', name: 'HSBC London Monthly Settlement', paymentType: 'Tokenized', recipientName: 'HSBC London', recipientAccount: 'GB29NWBK60161331926819', recipientInstitution: 'HSBC Bank plc', fromAccountLabel: 'USDC Treasury Wallet', amount: '2500000', currency: 'USDC', purpose: 'BKTR', lastUsed: 'Mar 3, 2025' },
    { id: 'tpl2', name: 'JPM Reserve Account Funding', paymentType: 'Tokenized', recipientName: 'JPMorgan Chase', recipientAccount: '0x...JPMCustody', recipientInstitution: 'Ethereum', fromAccountLabel: 'USDC Treasury Wallet', amount: '', currency: 'USDC', purpose: 'TREA', lastUsed: 'Feb 28, 2025' }, // Amount empty means variable
    { id: 'tpl3', name: 'Deutsche Bank EUR Transfer', paymentType: 'Traditional', traditionalRail: 'SWIFT', recipientName: 'Deutsche Bank AG', recipientAccount: 'DE89370400440532013000', recipientInstitution: 'DEUTDEFF', fromAccountLabel: 'USD Primary Account', amount: '1800000', currency: 'EUR', purpose: 'CORT', lastUsed: 'Feb 20, 2025' },
    { id: 'tpl4', name: 'Citi Singapore Internal Transfer', paymentType: 'Internal', recipientName: 'Citi Internal Ops SG', recipientAccount: 'CITI-SG-OPS-001', recipientInstitution: 'Internal Platform', fromAccountLabel: 'USDC Treasury Wallet', amount: '', currency: 'USDC', purpose: 'INTRA', lastUsed: 'Mar 4, 2025' },
    { id: 'tpl5', name: 'ICICI Mumbai INR Transfer', paymentType: 'Tokenized', recipientName: 'ICICI Bank Ltd', recipientAccount: 'icici-wallet-mumbai-7a6b', recipientInstitution: 'Internal Ledger (e₹)', fromAccountLabel: 'eRupee Wallet', amount: '75000000', currency: 'INR', purpose: 'CORT', lastUsed: 'Feb 15, 2025' },
    { id: 'tpl6', name: 'Supplier Payment - ACME Corp', paymentType: 'Tokenized', recipientName: 'ACME Corporation', recipientAccount: 'GD..ACME..STELLAR..WALLET', recipientInstitution: 'Stellar', fromAccountLabel: 'USD Primary Account', amount: '150000', currency: 'USD', purpose: 'SUPP', lastUsed: 'Mar 1, 2025' },
];

// Originally defined in ManageRecurringPaymentsScreen.js
export const initialDummyRecurringPayments = [
    { id: 'rec1', name: 'HSBC Monthly Settlement', recipient: 'HSBC London', fromAccount: 'USDC Treasury Wallet', amount: '2,500,000 USDC', frequency: 'Monthly (1st)', nextDate: '2025-05-01', nextTime: '3:00 PM UTC', status: 'Active' },
    { id: 'rec2', name: 'JPM Weekly Liquidity Transfer', recipient: 'JPMorgan Chase', fromAccount: 'USDC Treasury Wallet', amount: '750,000 USDC', frequency: 'Weekly (Monday)', nextDate: '2025-04-14', nextTime: '9:00 AM UTC', status: 'Active' },
    { id: 'rec3', name: 'Deutsche Bank Quarterly Payment', recipient: 'Deutsche Bank', fromAccount: 'USD Primary Account', amount: '€1,800,000', frequency: 'Quarterly (1st day)', nextDate: '2025-07-01', nextTime: '10:00 AM UTC', status: 'Active' },
    { id: 'rec4', name: 'Singapore Daily Liquidity', recipient: 'Citi Singapore', fromAccount: 'USDC Treasury Wallet', amount: 'Variable (Avg. 500k USDC)', frequency: 'Daily (Business days)', nextDate: '2025-04-09', nextTime: '7:00 AM UTC', status: 'Active' },
    { id: 'rec5', name: 'ICICI Mumbai Monthly Transfer', recipient: 'ICICI Mumbai', fromAccount: 'eRupee Wallet', amount: '₹75,000,000', frequency: 'Monthly (15th)', nextDate: '2025-04-15', nextTime: '5:00 AM UTC', status: 'Active' },
    { id: 'rec6', name: 'Bank of America Weekly Settlement', recipient: 'Bank of America', fromAccount: 'USD Primary Account', amount: '$950,000', frequency: 'Weekly (Friday)', nextDate: 'Paused', nextTime: '', status: 'Paused' },
    { id: 'rec7', name: 'Old Supplier Payment', recipient: 'Obsolete Systems Inc', fromAccount: 'USD Primary Account', amount: '$10,000', frequency: 'Monthly (1st)', nextDate: 'N/A', nextTime: '', status: 'Completed' },
    { id: 'rec8', name: 'Test Recurring Internal', recipient: 'Internal Ops Wallet', fromAccount: 'USDC Treasury Wallet', amount: '100 USDC', frequency: 'Daily', nextDate: '2025-04-09', nextTime: '1:00 PM UTC', status: 'Active' },
];