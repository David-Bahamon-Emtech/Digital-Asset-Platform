import React, { useState } from 'react';
import Layout from './components/Layout/Layout';
import TokenDashboard from './features/TokenManagement/TokenDashboard';
import PaymentsDashboard from './features/Payments/PaymentsDashboard';

// --- Shared Data Definitions ---
const initialAssets = [
  { id: 'usdc', label: 'USDC', balance: 10000000, symbol: 'USDC', description: 'Manage USDC stablecoin reserves.', supply: 'Finite', blockchain: 'Stellar', isWizardIssued: false },
  { id: 'usdt', label: 'USDT', balance: 8500000, symbol: 'USDT', description: 'Manage USDT stablecoin reserves.', supply: 'Finite', blockchain: 'Ethereum', isWizardIssued: false },
  { id: 't-gold', label: 'Tokenized Gold', balance: 5000, symbol: 'T-GOLD', description: 'Manage reserves for Gold-backed tokens.', supply: 'Finite', blockchain: 'Polygon', isWizardIssued: false },
  { id: 'e-cedi', label: 'eCedi', balance: 15000000, symbol: 'eGH¢', description: 'Manage reserves for eCedi CBDC.', supply: 'Finite', blockchain: 'Hedera', isWizardIssued: false },
  { id: 'd-euro', label: 'Digital Euro', balance: 9000000, symbol: 'D-EUR', description: 'Manage reserves for Digital Euro.', supply: 'Finite', blockchain: 'Ethereum', isWizardIssued: false }
];

const assetLogos = {
  'usdc': '/logos/circle.png',
  'usdt': '/logos/tether.svg',
  't-gold': '/logos/bog.png',
  'e-cedi': '/logos/bog.png',
  'd-euro': '/logos/ecb.png',
};
const blockchainLogos = {
  'Stellar': '/logos/stellar.png',
  'Ethereum': '/logos/ethereum.png',
  'Polygon': '/logos/polygon.png',
  'Hedera': '/logos/hedera.png',
  'Solana': '/logos/solana.png',
};
// --- End Shared Data ---


function App() {
  // --- State Managed by App ---
  const [activeTab, setActiveTab] = useState('token-mgmt'); // Default tab
  const [assets, setAssets] = useState(initialAssets); // Shared assets state
  // --- End State ---

  // Function to render content based on activeTab
  const renderContent = () => {
    switch (activeTab) {
      case 'token-mgmt':
        // TokenDashboard receives assets state and updater
        return (
          <TokenDashboard
            assets={assets}
            setAssets={setAssets} // Pass updater
            assetLogos={assetLogos}
            blockchainLogos={blockchainLogos}
          />
        );

      case 'payments':
        // PaymentsDashboard receives assets state and the updater
        return (
          <PaymentsDashboard
            assets={assets}
            setAssets={setAssets} // <-- ADDED THIS PROP
            assetLogosMap={assetLogos}
          />
        );

      // --- Other placeholders ---
      case 'account-mgmt':
        return <div className="p-8"><h1 className="text-2xl">Account Management</h1><p>Placeholder...</p></div>;
      case 'custody':
        return <div className="p-8"><h1 className="text-2xl">Custody</h1><p>Placeholder...</p></div>;
      case 'treasury':
        return <div className="p-8"><h1 className="text-2xl">Treasury Management</h1><p>Placeholder...</p></div>;
      case 'compliance':
        return <div className="p-8"><h1 className="text-2xl">Compliance</h1><p>Placeholder...</p></div>;
      default:
        return <div className="p-8"><h1 className="text-2xl">Dashboard</h1></div>;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </Layout>
  );
}

export default App;