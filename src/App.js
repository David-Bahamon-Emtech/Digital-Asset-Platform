// src/App.js
import React, { useState } from 'react';
import Layout from './components/Layout/Layout';
import TokenDashboard from './features/TokenManagement/TokenDashboard';
import PaymentsDashboard from './features/Payments/PaymentsDashboard';

// --- Copied from CreatePaymentScreen.js ---
// (Consider moving this to a separate data/utils file later)
const generateDummyClientAccounts = (count = 30) => {
    const accounts = [];
    const currencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'SGD', 'JPY', 'CHF'];
    for (let i = 1; i <= count; i++) {
        const currency = currencies[i % currencies.length];
        const accountNumber = String(Math.floor(Math.random() * 90000000) + 10000000);
        const balance = Math.floor(Math.random() * 9000000) + 1000001;
        const label = `Account ${accountNumber}`;
        accounts.push({
            id: `client-${i}-${accountNumber.slice(-4)}`,
            label: label,
            balance: balance,
            symbol: currency,
            // Add isInstitutional flag
            isInstitutional: false,
            // Add blockchain placeholder if needed, consistent with generate function
            blockchain: 'N/A (Client Account)'
        });
    }
    const usdcAccountNumber = String(Math.floor(Math.random() * 90000000) + 10000000);
    const usdtAccountNumber = String(Math.floor(Math.random() * 90000000) + 10000000);
    accounts.push({
        id: `client-usdc-${usdcAccountNumber.slice(-4)}`,
        label: `Account ${usdcAccountNumber}`,
        balance: 1500000, symbol: 'USDC',
        blockchain: 'Stellar', // Keep specific blockchain for these token wallets
        isInstitutional: false // Mark as client account
    });
    accounts.push({
        id: `client-usdt-${usdtAccountNumber.slice(-4)}`,
        label: `Account ${usdtAccountNumber}`,
        balance: 1850000, symbol: 'USDT',
        blockchain: 'Ethereum', // Keep specific blockchain for these token wallets
        isInstitutional: false // Mark as client account
    });
    return accounts;
};
// --- End Copied Function ---

// --- Shared Data Definitions ---
// Add isInstitutional flag to initial assets
const initialInstitutionalAssets = [
  { id: 'usdc', label: 'USDC', balance: 10000000, symbol: 'USDC', description: 'Manage USDC stablecoin reserves.', supply: 'Finite', blockchain: 'Stellar', isWizardIssued: false, isInstitutional: true },
  { id: 'usdt', label: 'USDT', balance: 8500000, symbol: 'USDT', description: 'Manage USDT stablecoin reserves.', supply: 'Finite', blockchain: 'Ethereum', isWizardIssued: false, isInstitutional: true },
  { id: 't-gold', label: 'Tokenized Gold', balance: 5000, symbol: 'T-GOLD', description: 'Manage reserves for Gold-backed tokens.', supply: 'Finite', blockchain: 'Polygon', isWizardIssued: false, isInstitutional: true },
  { id: 'e-cedi', label: 'eCedi', balance: 15000000, symbol: 'eGH¢', description: 'Manage reserves for eCedi CBDC.', supply: 'Finite', blockchain: 'Hedera', isWizardIssued: false, isInstitutional: true },
  { id: 'd-euro', label: 'Digital Euro', balance: 9000000, symbol: 'D-EUR', description: 'Manage reserves for Digital Euro.', supply: 'Finite', blockchain: 'Ethereum', isWizardIssued: false, isInstitutional: true }
];

// Generate client accounts
const initialClientAccounts = generateDummyClientAccounts(30); // Generate 30 dummy accounts

// Combine lists for initial state
const combinedInitialAccounts = [
    ...initialInstitutionalAssets,
    ...initialClientAccounts
];

const assetLogos = { /* ... unchanged ... */
  'usdc': '/logos/circle.png', 'usdt': '/logos/tether.svg', 't-gold': '/logos/bog.png', 'e-cedi': '/logos/bog.png', 'd-euro': '/logos/ecb.png',
  // Add generic logo for client accounts if needed, or handle missing logos downstream
};
const blockchainLogos = { /* ... unchanged ... */
  'Stellar': '/logos/stellar.png', 'Ethereum': '/logos/ethereum.png', 'Polygon': '/logos/polygon.png', 'Hedera': '/logos/hedera.png', 'Solana': '/logos/solana.png',
};
// --- End Shared Data ---


function App() {
  // --- State Managed by App ---
  const [activeTab, setActiveTab] = useState('token-mgmt');
  // Use the combined list for initial state
  const [allAccounts, setAllAccounts] = useState(combinedInitialAccounts);
  // --- End State ---

  // Function to render content based on activeTab
  const renderContent = () => {
    // Filter accounts before passing down if necessary, or let child components filter
    // For simplicity, we pass all accounts down using the existing 'assets' prop name

    // Filter institutional assets for Token Management if needed (or handle in TokenDashboard)
    const institutionalAssets = allAccounts.filter(acc => acc.isInstitutional || acc.isWizardIssued); // Also include wizard-issued tokens

    switch (activeTab) {
      case 'token-mgmt':
        return (
          <TokenDashboard
            assets={institutionalAssets} // Pass only relevant assets here
            setAssets={setAllAccounts}    // Pass the main setter for adding new wizard tokens etc.
            assetLogos={assetLogos}
            blockchainLogos={blockchainLogos}
          />
        );

      case 'payments':
        return (
          <PaymentsDashboard
            assets={allAccounts}    // Pass the combined list
            setAssets={setAllAccounts} // Pass the main setter
            assetLogosMap={assetLogos}
          />
        );

      // --- Other placeholders --- (Unchanged)
      case 'account-mgmt': return <div className="p-8"><h1 className="text-2xl">Account Management</h1><p>Placeholder...</p></div>;
      case 'custody': return <div className="p-8"><h1 className="text-2xl">Custody</h1><p>Placeholder...</p></div>;
      case 'treasury': return <div className="p-8"><h1 className="text-2xl">Treasury Management</h1><p>Placeholder...</p></div>;
      case 'compliance': return <div className="p-8"><h1 className="text-2xl">Compliance</h1><p>Placeholder...</p></div>;
      default: return <div className="p-8"><h1 className="text-2xl">Dashboard</h1></div>;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </Layout>
  );
}

export default App;