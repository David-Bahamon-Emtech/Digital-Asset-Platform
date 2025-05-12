// src/data/initialData.js

/**
 * Initial list of institutional digital assets managed by the platform.
 * BALANCES ADJUSTED TO REFLECT SPREAD-OUT HISTORY & >=10% RESERVE TARGET
 */
export const initialInstitutionalAssets = [
  // --- Digital Assets (Warm/Hot) ---
  { id: 'usdc', label: 'USDC Treasury Wallet', balance: 10000000000, symbol: 'USDC', description: 'Manage USDC stablecoin reserves.', supply: 'Finite', blockchain: 'Stellar', isWizardIssued: false, isInstitutional: true, assetClass: 'Stablecoin', physicality: 'Digital', custodyType: 'Warm', price: 1.00 },
  { id: 'usdt', label: 'USDT Treasury Wallet', balance: 8500000000, symbol: 'USDT', description: 'Manage USDT stablecoin reserves.', supply: 'Finite', blockchain: 'Ethereum', isWizardIssued: false, isInstitutional: true, assetClass: 'Stablecoin', physicality: 'Digital', custodyType: 'Warm', price: 1.00 },
  { id: 't-bond', label: 'Tokenized Bond Vault', balance: 5000000, symbol: 'T-BOND', description: 'Manage reserves for Tokenized Bond Tokens.', supply: 'Finite', blockchain: 'Polygon', isWizardIssued: false, isInstitutional: true, assetClass: 'Security: Bond', physicality: 'Digital', custodyType: 'Warm', price: 998.50 },
  { id: 'e-cedi', label: 'eCedi Pilot Wallet', balance: 15000000000, symbol: 'eGH', description: 'Manage reserves for eCedi CBDC.', supply: 'Finite', blockchain: 'Hedera', isWizardIssued: false, isInstitutional: true, assetClass: 'CBDC', physicality: 'Digital', custodyType: 'Hot', price: null },
  { id: 'd-euro', label: 'Digital Euro Pilot Wallet', balance: 9000000000, symbol: 'D-EUR', description: 'Manage reserves for Digital Euro.', supply: 'Finite', blockchain: 'Ethereum', isWizardIssued: false, isInstitutional: true, assetClass: 'CBDC', physicality: 'Digital', custodyType: 'Hot', price: null },
  { id: 'eth-warm', label: 'Ethereum Operational Wallet', balance: 2000, symbol: 'ETH', description: 'Operational ETH for gas fees and trading.', supply: 'Finite', blockchain: 'Ethereum', isWizardIssued: false, isInstitutional: true, assetClass: 'Cryptocurrency', physicality: 'Digital', custodyType: 'Warm', price: 3500.00 },
  { id: 'matic-hot', label: 'Polygon Hot Wallet', balance: 500000, symbol: 'MATIC', description: 'MATIC for Polygon operations.', supply: 'Finite', blockchain: 'Polygon', isWizardIssued: false, isInstitutional: true, assetClass: 'Cryptocurrency', physicality: 'Digital', custodyType: 'Hot', price: 0.95 },

  // --- NEW Predefined Tokenized Assets (Balances Adjusted for Reserve Target) ---
  { id: 'cp-acme-01', label: 'Tokenized CP (Acme)', balance: 44300000, totalSupplyIssued: 50000000, symbol: 'ACP', description: 'Tokenized Commercial Paper issued by Acme Corp.', supply: 'Finite', blockchain: 'Polygon', isWizardIssued: false, isInstitutional: true, assetClass: 'Security: CP', physicality: 'Digital', custodyType: 'Warm', price: 0.998 }, // Bal: 44.3M (Reserve: 11.4%)
  { id: 'mmf-usd-01', label: 'Tokenized MMF (USD)', balance: 225000000, totalSupplyIssued: 250000000, symbol: 'MMFUSD', description: 'Tokenized shares in a USD Money Market Fund.', supply: 'Finite', blockchain: 'Ethereum', isWizardIssued: false, isInstitutional: true, assetClass: 'Security: MMF', physicality: 'Digital', custodyType: 'Warm', price: 1.00 }, // Bal: 225M (Reserve: 10.0%) - Adjusted
  { id: 'xagc-01', label: 'Silver-Backed Coin', balance: 900000, totalSupplyIssued: 1000000, symbol: 'XAGC', description: 'Digital coin backed by physical silver reserves.', supply: 'Finite', blockchain: 'Stellar', isWizardIssued: false, isInstitutional: true, assetClass: 'Commodity: Precious Metal', physicality: 'Digital', custodyType: 'Cold', price: 30.50 }, // Bal: 900k (Reserve: 10.0%)
  { id: 'oil-wti-01', label: 'Tokenized WTI Oil', balance: 450000, totalSupplyIssued: 500000, symbol: 'WTOIL', description: 'Token representing one barrel of WTI crude oil.', supply: 'Finite', blockchain: 'Polygon', isWizardIssued: false, isInstitutional: true, assetClass: 'Commodity: Energy', physicality: 'Digital', custodyType: 'Warm', price: 80.15 }, // Bal: 450k (Reserve: 10.0%) - Adjusted
  { id: 'cc-verra-01', label: 'Verified Carbon Credit', balance: 9000000, totalSupplyIssued: 10000000, symbol: 'VCC', description: 'Tokenized Verra-certified carbon credit (1 token = 1 tonne CO2e).', supply: 'Finite', blockchain: 'Hedera', isWizardIssued: false, isInstitutional: true, assetClass: 'Carbon Credit', physicality: 'Digital', custodyType: 'Warm', price: 15.75 }, // Bal: 9M (Reserve: 10.0%) - Adjusted

  // --- Cold Storage Examples ---
   { id: 'btc-cold-01', label: 'Bitcoin Cold Storage 1', balance: 500, symbol: 'BTC', description: 'Institution Bitcoin reserves held in cold storage.', supply: 'Finite', blockchain: 'Bitcoin', isWizardIssued: false, isInstitutional: true, assetClass: 'Cryptocurrency', physicality: 'Digital', custodyType: 'Cold', price: 65000.00 },
   { id: 'aave-cold', label: 'Aave Cold Storage', balance: 10000, symbol: 'AAVE', description: 'AAVE governance tokens in cold storage.', supply: 'Finite', blockchain: 'Ethereum', isWizardIssued: false, isInstitutional: true, assetClass: 'Cryptocurrency', physicality: 'Digital', custodyType: 'Cold', price: 110.00 },

  // --- Physical Vault Examples ---
   { id: 'phys-gold-zur', label: 'Physical Gold Zurich', balance: 1000, symbol: 'XAU', description: 'Gold bullion held in Zurich vault.', supply: 'N/A', blockchain: 'N/A', isWizardIssued: false, isInstitutional: true, assetClass: 'Commodity: Precious Metal', physicality: 'Physical', custodyType: 'PhysicalVault', price: 75000 },
   { id: 'phys-whiskey', label: 'Aged Whiskey Cask #42', balance: 1, symbol: 'WHISK-C42', description: 'Physically stored cask of whiskey.', supply: 'N/A', blockchain: 'N/A', isWizardIssued: false, isInstitutional: true, assetClass: 'Commodity: Other', physicality: 'Physical', custodyType: 'PhysicalVault', price: 150000 },

  // --- Standard Fiat Accounts (External) ---
  { id: 'inst-usd-primary', label: 'USD Primary Account', balance: 25000000000, symbol: 'USD', description: 'Main operational USD account.', supply: 'N/A', blockchain: 'N/A', isWizardIssued: false, isInstitutional: true, assetClass: 'FiatCurrency', physicality: 'Digital', custodyType: 'External', price: 1.00 },
  { id: 'inst-eur-primary', label: 'EUR Primary Account', balance: 15000000000, symbol: 'EUR', description: 'Main operational EUR account.', supply: 'N/A', blockchain: 'N/A', isWizardIssued: false, isInstitutional: true, assetClass: 'FiatCurrency', physicality: 'Digital', custodyType: 'External', price: 1.08 },
];

// --- Asset Logos (Unchanged) ---
export const assetLogos = { /* ... content unchanged ... */
  // Institutional assets (Treasury)
  'usdc': '/logos/circle.png',
  'usdt': '/logos/tether.svg',
  't-bond': '/logos/bog.png',
  'e-cedi': '/logos/bog.png',
  'd-euro': '/logos/ecb.png',
  // NEW Tokenized Assets
  'cp-acme-01': '/logos/commercial-paper.png',
  'mmf-usd-01': '/logos/money-market-fund.png',
  'xagc-01': '/logos/silver.png',
  'oil-wti-01': '/logos/oil.png',
  'cc-verra-01': '/logos/carbon-credit.png',
  // Other existing assets...
  'inst-usd-primary': '/logos/generic-bank.png',
  'inst-eur-primary': '/logos/generic-bank.png',
  'btc-cold-01': '/logos/bitcoin.png',
  'usdc-cold-01': '/logos/circle.png',
  'eth-cold-01': '/logos/ethereum.png',
  'aave-cold': '/logos/aave.png',
  'phys-gold-zur': '/logos/gold-bar.png',
  'phys-silv-lon': '/logos/silver-bar.png',
  'phys-whiskey': '/logos/whiskey-cask.png',
  'eth-warm': '/logos/ethereum.png',
  'matic-hot': '/logos/polygon.png',
  // Symbols for lookup (Add new symbols)
  'USDC': '/logos/circle.png',
  'USDT': '/logos/tether.svg',
  'T-BOND': '/logos/bog.png',
  'eGH': '/logos/bog.png',
  'D-EUR': '/logos/ecb.png',
  'USD': '/logos/generic-bank.png',
  'EUR': '/logos/generic-bank.png',
  'BTC': '/logos/bitcoin.png',
  'ETH': '/logos/ethereum.png',
  'SOL': '/logos/solana.png',
  'MATIC': '/logos/polygon.png',
  'XAU': '/logos/gold-bar.png',
  'XAG': '/logos/silver-bar.png',
  'ACP': '/logos/commercial-paper.png',
  'MMFUSD': '/logos/money-market-fund.png',
  'XAGC': '/logos/silver.png',
  'WTOIL': '/logos/oil.png',
  'VCC': '/logos/carbon-credit.png',
  'AAVE': '/logos/aave.png',
  // Default fallback
  'DEFAULT': '/logos/generic-bank.png'
};

// --- Blockchain Logos (Unchanged) ---
export const blockchainLogos = { /* ... content unchanged ... */
  'Stellar': '/logos/stellar.png',
  'Ethereum': '/logos/ethereum.png',
  'Polygon': '/logos/polygon.png',
  'Hedera': '/logos/hedera.png',
  'Solana': '/logos/solana.png',
  'Bitcoin': '/logos/bitcoin.png',
  'Avalanche': '/logos/avalanche.png',
  'Polkadot': '/logos/polkadot.png',
  'Stacks': '/logos/stacks.png',
  'Filecoin': '/logos/filecoin.png',
  'N/A': null
};

// --- Sample Entities (Unchanged) ---
export const sampleEntities = ['Citi New York', 'Citi London', 'Citi Singapore', 'Citi Mumbai'];

// --- Hardcoded Asset Details (Unchanged) ---
export const hardcodedAssetDetails = { /* ... content unchanged ... */
  // Treasury Assets (needed if Treasury detail view uses this)
  'usdc': { officialName: 'USD Coin', issuer: 'Circle Internet Financial', website: 'https://www.circle.com/en/usdc', assetType: 'Fiat-backed Stablecoin', reserveInfo: 'Backed by cash and short-duration U.S. Treasuries, attested monthly.', features: ['Pausable by issuer', 'Regulated', 'KYC/AML required'], },
  'usdt': { officialName: 'Tether', issuer: 'Tether Operations Limited', website: 'https://tether.to/', assetType: 'Fiat-backed Stablecoin', reserveInfo: 'Backed by various assets including cash, equivalents, secured loans, bonds, and other investments. Attested regularly.', features: ['Pausable by issuer', 'Regulated (varies by jurisdiction)'], },
  't-bond': { officialName: 'Tokenized Bond', issuer: 'Bank of Ghana', website: '#', assetType: 'Treasury-backed Token', reserveInfo: 'Tokenized bonds put into market backed by gold.', features: ['Fungible'], },
  'e-cedi': { officialName: 'eCedi', issuer: 'Bank of Ghana (Pilot)', website: '#', assetType: 'Central Bank Digital Currency (CBDC)', reserveInfo: 'Direct liability of the central bank.', features: ['Pilot phase', 'Specific CBDC rules apply'], },
  'd-euro': { officialName: 'Digital Euro', issuer: 'European Central Bank (Investigative Phase)', website: '#', assetType: 'Central Bank Digital Currency (CBDC)', reserveInfo: 'Direct liability of the central bank (proposed).', features: ['Under investigation', 'Potential privacy features'], },

  // Token Management Assets
  'cp-acme-01': {
    officialName: 'Acme Corp Commercial Paper (Tokenized)',
    issuer: 'Acme Corporation / Tokenizer Agent',
    website: '#', // Placeholder
    assetType: 'Tokenized Commercial Paper',
    reserveInfo: 'Backed by specific commercial paper notes held in custody.',
    features: ['Fixed Term', 'Yield Bearing (Implied)', 'Institutional Only'],
  },
  'mmf-usd-01': {
    officialName: 'Tokenized USD Money Market Fund Shares',
    issuer: 'Stable Investments LLC / Tokenizer Agent',
    website: '#', // Placeholder
    assetType: 'Tokenized Money Market Fund',
    reserveInfo: 'Represents shares in an underlying MMF investing in short-term debt.',
    features: ['Stable Value (Target $1)', 'Liquid', 'Yield Bearing'],
  },
  'xagc-01': {
    officialName: 'Silver-Backed Digital Coin',
    issuer: 'Precious Metals Inc.',
    website: '#', // Placeholder
    assetType: 'Commodity Backed Token',
    reserveInfo: 'Each token backed by a specific amount of vaulted silver, audited regularly.',
    features: ['Physically Backed', 'Redeemable (Potentially)', 'Transferable'],
  },
  'oil-wti-01': {
    officialName: 'Tokenized WTI Crude Oil Barrel',
    issuer: 'Energy Tokens Ltd.',
    website: '#', // Placeholder
    assetType: 'Commodit Backed Token',
    reserveInfo: 'Represents ownership of one barrel of WTI oil held in designated storage.',
    features: ['Physically Backed', 'Exposure to Oil Price', 'Tradeable'],
  },
  'cc-verra-01': {
    officialName: 'Tokenized Verified Carbon Credit (Verra)',
    issuer: 'Green Future Tokens / Verra Registry',
    website: 'https://verra.org/', // Link to Verra
    assetType: 'Tokenized Carbon Credit',
    reserveInfo: 'Represents one tonne of verified CO2e reduction/removal registered with Verra.',
    features: ['Verified Offset', 'Tradeable', 'Retirable for Climate Claims'],
  },
};

// --- Dummy Internal Users for Account Management V0 ---
export const dummyInternalUsers = [
  { 
    id: 'user1', 
    name: 'Alice Treasurer', 
    platformRole: 'Treasurer', 
    status: 'Active', 
    associatedBlockchainAccounts: [
      {blockchain: 'Hedera', accountId: '0.0.12345'}, 
      {blockchain: 'Ethereum', accountId: '0xabc123def456ghi789jkl0mop1qrs2tuv3wxyz4'}
    ], 
    kycStatus: 'Verified', 
    amlFlag: false, 
    mfaEnabled: true 
  },
  { 
    id: 'user2', 
    name: 'Bob MinterBurner', 
    platformRole: 'Minter/Burner', 
    status: 'Active', 
    associatedBlockchainAccounts: [
      {blockchain: 'Hedera', accountId: '0.0.67890'}
    ], 
    kycStatus: 'Pending', 
    amlFlag: false, 
    mfaEnabled: false 
  },
  { 
    id: 'user3', 
    name: 'Carol Admin', 
    platformRole: 'Administrator', 
    status: 'Inactive', 
    associatedBlockchainAccounts: [], 
    kycStatus: 'Not Verified', 
    amlFlag: true, 
    mfaEnabled: true 
  }
];

// Add other globally relevant initial data here if necessary