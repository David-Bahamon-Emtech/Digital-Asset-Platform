// src/App.js
import React, { useState } from 'react';
import Layout from './components/Layout/Layout';
import TokenDashboard from './features/TokenManagement/TokenDashboard';
import PaymentsDashboard from './features/Payments/PaymentsDashboard';

// --- Import centralized data and utilities ---
import { generateDummyClientAccounts } from './utils/dummyData';
import {
    initialInstitutionalAssets,
    assetLogos,
    blockchainLogos
} from './data/initialData';

// --- Generate client accounts using the imported function ---
const initialClientAccounts = generateDummyClientAccounts(30);

// --- Combine lists for initial state using imported data ---
const combinedInitialAccounts = [
    ...initialInstitutionalAssets,
    ...initialClientAccounts
];

function App() {
  // --- State Managed by App ---
  const [activeTab, setActiveTab] = useState('token-mgmt');
  const [allAccounts, setAllAccounts] = useState(combinedInitialAccounts);
  // --- End State ---

  // Function to render content based on activeTab
  const renderContent = () => {

    // --- UPDATED FILTER LOGIC for Token Management ---
    const tokenManagementAssets = allAccounts.filter(acc =>
        // Include institutional assets ONLY if they have a blockchain specified (are tokens)
        (acc.isInstitutional && acc.blockchain && acc.blockchain !== 'N/A') ||
        // OR include any asset issued by the wizard
        acc.isWizardIssued
    );
    // --- END UPDATED FILTER ---

    switch (activeTab) {
      case 'token-mgmt':
        return (
          <TokenDashboard
            assets={tokenManagementAssets} // Pass the *new* filtered list
            setAssets={setAllAccounts}
            assetLogos={assetLogos}
            blockchainLogos={blockchainLogos}
          />
        );

      case 'payments':
        // Payments still receives ALL accounts
        return (
          <PaymentsDashboard
            assets={allAccounts}
            setAssets={setAllAccounts}
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