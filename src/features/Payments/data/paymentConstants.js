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
    USDC: 1, USDT: 1, D_EUR: 1.10, eGH: 0.067,
    'T-GOLD': 2000,
    INR: 0.012
};

export const ratesFromUSD = {
    USD: 1, EUR: 0.91, JPY: 150, GHS: 15, CAD: 1.36, GBP: 0.80, AUD: 1.52, SGD: 1.35, CHF: 0.90,
    USDC: 1, USDT: 1, D_EUR: 0.91, eGH: 15,
    INR: 83,
};

export const paymentTypes = ['Tokenized', 'Traditional', 'Internal'];

export const modalSamplePurposes = ['Select purpose code', 'BKTR', 'CBFT', 'CORT', 'GOVT', 'TREA', 'SUPP', 'INTRA'];

export const dummyTemplates = [
    { id: 'tpl1', name: 'HSBC London Monthly Settlement', paymentType: 'Tokenized', recipientName: 'HSBC London', recipientAccount: 'GB29NWBK60161331926819', recipientInstitution: 'HSBC Bank plc', fromAccountLabel: 'USDC Treasury Wallet', amount: '2500000', currency: 'USDC', purpose: 'BKTR', lastUsed: 'Mar 3, 2025' },
    { id: 'tpl2', name: 'JPM Reserve Account Funding', paymentType: 'Tokenized', recipientName: 'JPMorgan Chase', recipientAccount: '0x...JPMCustody', recipientInstitution: 'Ethereum', fromAccountLabel: 'USDC Treasury Wallet', amount: '', currency: 'USDC', purpose: 'TREA', lastUsed: 'Feb 28, 2025' },
    { id: 'tpl3', name: 'Deutsche Bank EUR Transfer', paymentType: 'Traditional', traditionalRail: 'SWIFT', recipientName: 'Deutsche Bank AG', recipientAccount: 'DE89370400440532013000', recipientInstitution: 'DEUTDEFF', fromAccountLabel: 'USD Primary Account', amount: '1800000', currency: 'EUR', purpose: 'CORT', lastUsed: 'Feb 20, 2025' },
    { id: 'tpl4', name: 'Citi Singapore Internal Transfer', paymentType: 'Internal', recipientName: 'Citi Internal Ops SG', recipientAccount: 'CITI-SG-OPS-001', recipientInstitution: 'Internal Platform', fromAccountLabel: 'USDC Treasury Wallet', amount: '', currency: 'USDC', purpose: 'INTRA', lastUsed: 'Mar 4, 2025' },
    { id: 'tpl5', name: 'ICICI Mumbai INR Transfer', paymentType: 'Tokenized', recipientName: 'ICICI Bank Ltd', recipientAccount: 'icici-wallet-mumbai-7a6b', recipientInstitution: 'Internal Ledger (e₹)', fromAccountLabel: 'eRupee Wallet', amount: '75000000', currency: 'INR', purpose: 'CORT', lastUsed: 'Feb 15, 2025' },
    { id: 'tpl6', name: 'Supplier Payment - ACME Corp', paymentType: 'Tokenized', recipientName: 'ACME Corporation', recipientAccount: 'GD..ACME..STELLAR..WALLET', recipientInstitution: 'Stellar', fromAccountLabel: 'USD Primary Account', amount: '150000', currency: 'USD', purpose: 'SUPP', lastUsed: 'Mar 1, 2025' },
];

export const initialDummyRecurringPayments = [
  { id: 'rec1', name: 'HSBC Monthly Settlement', recipient: 'HSBC London', fromAccountId: 'usdc', amount: 2500000, currency: 'USDC', frequency: 'Monthly (1st)', nextDate: '2025-05-01', nextTime: '3:00 PM UTC', status: 'Active' },
  { id: 'rec2', name: 'JPM Weekly Liquidity Transfer', recipient: 'JPMorgan Chase', fromAccountId: 'usdc', amount: 750000, currency: 'USDC', frequency: 'Weekly (Monday)', nextDate: '2025-04-14', nextTime: '9:00 AM UTC', status: 'Active' },
  { id: 'rec3', name: 'Deutsche Bank Quarterly Payment', recipient: 'Deutsche Bank', fromAccountId: 'inst-usd-primary', amount: 1800000, currency: 'EUR', frequency: 'Quarterly (1st day)', nextDate: '2025-07-01', nextTime: '10:00 AM UTC', status: 'Active' },
  { id: 'rec4', name: 'Singapore Daily Liquidity', recipient: 'Citi Singapore', fromAccountId: 'usdc', amount: null, currency: 'USDC', frequency: 'Daily (Business days)', nextDate: '2025-04-09', nextTime: '7:00 AM UTC', status: 'Active' },
  { id: 'rec5', name: 'Ghana MoMo Partner Transfer', recipient: 'MTN Ghana', fromAccountId: 'e-cedi', amount: 500000, currency: 'GHS', frequency: 'Monthly (15th)', nextDate: '2025-04-15', nextTime: '5:00 AM UTC', status: 'Active' },
  { id: 'rec6', name: 'Bank of America Weekly Settlement', recipient: 'Bank of America', fromAccountId: 'inst-usd-primary', amount: 950000, currency: 'USD', frequency: 'Weekly (Friday)', nextDate: 'Paused', nextTime: '', status: 'Paused' },
  { id: 'rec7', name: 'Old Supplier Payment', recipient: 'Obsolete Systems Inc', fromAccountId: 'inst-usd-primary', amount: 10000, currency: 'USD', frequency: 'Monthly (1st)', nextDate: 'N/A', nextTime: '', status: 'Completed' },
  { id: 'rec8', name: 'Test Recurring Internal', recipient: 'Internal Ops Wallet', fromAccountId: 'usdc', amount: 100, currency: 'USDC', frequency: 'Daily', nextDate: '2025-04-09', nextTime: '1:00 PM UTC', status: 'Active' },
  { id: 'rec-comp-1', name: 'Old Payroll Batch (Jan)', recipient: 'Payroll Provider', fromAccountId: 'inst-usd-primary', amount: 115000, currency: 'USD', frequency: 'Monthly', nextDate: 'N/A', nextTime: '', status: 'Completed' },
  { id: 'rec-comp-2', name: 'Q4 Marketing Spend', recipient: 'Ad Agency X', fromAccountId: 'inst-usd-primary', amount: 25000, currency: 'USD', frequency: 'Quarterly', nextDate: 'N/A', nextTime: '', status: 'Completed' },
  { id: 'rec-comp-3', name: 'EU Office Rent (Old)', recipient: 'EU Landlord Property', fromAccountId: 'inst-eur-primary', amount: 15000, currency: 'EUR', frequency: 'Monthly', nextDate: 'N/A', nextTime: '', status: 'Completed' },
  { id: 'rec-comp-4', name: 'USDC Loan Repayment', recipient: 'Crypto Lender Inc.', fromAccountId: 'usdc', amount: 50000, currency: 'USDC', frequency: 'Weekly', nextDate: 'N/A', nextTime: '', status: 'Completed' },
  { id: 'rec-comp-5', name: 'Software Subscription (Expired)', recipient: 'SaaS Vendor Z', fromAccountId: 'inst-usd-primary', amount: 999, currency: 'USD', frequency: 'Annually', nextDate: 'N/A', nextTime: '', status: 'Completed' },
  { id: 'rec-comp-6', name: 'Consulting Fee (Project Alpha)', recipient: 'External Consultant', fromAccountId: 'inst-usd-primary', amount: 22000, currency: 'USD', frequency: 'One-Time (Completed)', nextDate: 'N/A', nextTime: '', status: 'Completed' },
  { id: 'rec-comp-7', name: 'USDT Staking Reward Payout', recipient: 'Internal Treasury', fromAccountId: 'usdt', amount: 5000, currency: 'USDT', frequency: 'Monthly', nextDate: 'N/A', nextTime: '', status: 'Completed' },
  { id: 'rec-comp-8', name: 'eCedi Pilot Test Payment', recipient: 'Test Merchant GH', fromAccountId: 'e-cedi', amount: 1000, currency: 'GHS', frequency: 'One-Time (Completed)', nextDate: 'N/A', nextTime: '', status: 'Completed' },
];

export const initialPaymentHistory = [
    { id: 'hvt_1712720000000', timestamp: new Date(Date.now() - 5 * 60 * 1000), type: 'HVT', amount: 5000000, currency: 'USD', recipient: 'Bank of Example', status: 'Pending Approval', reference: 'HVT-PEND01', rawData: { purposeCode: 'TREA', valueDate: '2025-04-10', initiatedBy: 'Test User HVT', recipientAccount: '123456789', recipientBankSwift: 'BOFUS33A', _simulated_total_debit: 5000100 } },
    { id: 'ph1', timestamp: new Date(Date.now() - 2 * 60 * 1000), type: 'Cross-Border', amount: 1500, currency: 'USDC', recipient: 'External Vendor A', status: 'Completed', reference: 'INV-123' },
    { id: 'ph3', timestamp: new Date(Date.now() - 10 * 60 * 1000), type: 'Cross-Border', amount: 25000, currency: 'USDT', recipient: 'Partner Company X', status: 'Completed', reference: 'PO-456' },
    { id: 'ph4', timestamp: new Date(Date.now() - 30 * 60 * 1000), type: 'HVT', amount: 10000000, currency: 'GBP', recipient: 'UK Treasury', status: 'Authorized', reference: 'HVT-AUTH01', rawData: { purposeCode: 'GOVT', valueDate: '2025-04-09', initiatedBy: 'Treasury Dept', recipientAccount: 'GB12ABCD12345678901234', recipientBankSwift: 'BOEGB2L' } },
    { id: 'ph5', timestamp: new Date(Date.now() - 60 * 60 * 1000), type: 'Cross-Border', amount: 50, currency: 'eGH¢', recipient: 'Local Merchant', status: 'Completed', reference: 'POS-789' },
    { id: 'ph6', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), type: 'Bulk Process', amount: 125000, currency: 'USD', recipient: 'Payroll Batch 1', status: 'Completed', reference: 'BULK-PAY-01' },
    { id: 'ph7', timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), type: 'Cross-Border', amount: 999, currency: 'USDC', recipient: 'Test Wallet', status: 'Completed', reference: 'TEST-001' },
].sort((a, b) => b.timestamp - a.timestamp);