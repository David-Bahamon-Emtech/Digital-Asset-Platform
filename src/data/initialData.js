// src/data/initialData.js

/**
 * Initial list of institutional digital assets managed by the platform.
 * Originally defined in App.js
 */
export const initialInstitutionalAssets = [
  { id: 'usdc', label: 'USDC Treasury Wallet', balance: 10000000000, symbol: 'USDC', description: 'Manage USDC stablecoin reserves.', supply: 'Finite', blockchain: 'Stellar', isWizardIssued: false, isInstitutional: true },
  { id: 'usdt', label: 'USDT Treasury Wallet', balance: 8500000000, symbol: 'USDT', description: 'Manage USDT stablecoin reserves.', supply: 'Finite', blockchain: 'Ethereum', isWizardIssued: false, isInstitutional: true },
  { id: 't-gold', label: 'Gold Token Vault', balance: 5000000, symbol: 'T-GOLD', description: 'Manage reserves for Gold-backed tokens.', supply: 'Finite', blockchain: 'Polygon', isWizardIssued: false, isInstitutional: true },
  { id: 'e-cedi', label: 'eCedi Pilot Wallet', balance: 15000000000, symbol: 'eGH¢', description: 'Manage reserves for eCedi CBDC.', supply: 'Finite', blockchain: 'Hedera', isWizardIssued: false, isInstitutional: true },
  { id: 'd-euro', label: 'Digital Euro Pilot Wallet', balance: 9000000000, symbol: 'D-EUR', description: 'Manage reserves for Digital Euro.', supply: 'Finite', blockchain: 'Ethereum', isWizardIssued: false, isInstitutional: true },
  // Add a standard fiat account for the institution
  { id: 'inst-usd-primary', label: 'USD Primary Account', balance: 25000000000, symbol: 'USD', description: 'Main operational USD account.', supply: 'N/A', blockchain: 'N/A', isWizardIssued: false, isInstitutional: true },
  { id: 'inst-eur-primary', label: 'EUR Primary Account', balance: 15000000000, symbol: 'EUR', description: 'Main operational EUR account.', supply: 'N/A', blockchain: 'N/A', isWizardIssued: false, isInstitutional: true },
];

/**
 * Mapping of asset symbols/IDs to their logo image paths.
 * Originally defined in App.js
 */
export const assetLogos = {
  // Institutional assets
  'usdc': '/logos/circle.png',
  'usdt': '/logos/tether.svg',
  't-gold': '/logos/bog.png', // Placeholder - Bank of Ghana? Revisit logo logic
  'e-cedi': '/logos/bog.png', // Placeholder - Bank of Ghana
  'd-euro': '/logos/ecb.png', // Placeholder - ECB
  'inst-usd-primary': '/logos/generic-bank.png', // Placeholder
  'inst-eur-primary': '/logos/generic-bank.png', // Placeholder
  // Symbols for lookup (ensure USDC/USDT here match IDs if needed, or use symbol lookup)
  'USDC': '/logos/circle.png',
  'USDT': '/logos/tether.svg',
  'T-GOLD': '/logos/bog.png',
  'eGH¢': '/logos/bog.png',
  'D-EUR': '/logos/ecb.png',
  'USD': '/logos/generic-bank.png',
  'EUR': '/logos/generic-bank.png',
  // Add generic logo for client accounts if needed, or handle missing logos downstream
  'DEFAULT': '/logos/generic-bank.png' // A default fallback
};

/**
 * Mapping of blockchain names to their logo image paths.
 * Originally defined in App.js
 */
export const blockchainLogos = {
  'Stellar': '/logos/stellar.png',
  'Ethereum': '/logos/ethereum.png',
  'Polygon': '/logos/polygon.png',
  'Hedera': '/logos/hedera.png',
  'Solana': '/logos/solana.png',
  // Add more as needed
};

/**
 * Sample entities list. Used in payment forms.
 * Originally defined in CreateHighValueTransferScreen / CreatePaymentScreen
 */
export const sampleEntities = ['Citi New York', 'Citi London', 'Citi Singapore', 'Citi Mumbai'];

// Add other globally relevant initial data here if necessary