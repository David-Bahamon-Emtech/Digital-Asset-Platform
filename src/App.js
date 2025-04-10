// src/App.js
import React, { useState } from 'react';
import Layout from './components/Layout/Layout';
import TokenDashboard from './features/TokenManagement/TokenDashboard';
import PaymentsDashboard from './features/Payments/PaymentsDashboard';
import { generateDummyClientAccounts } from './utils/dummyData';
import {
    initialInstitutionalAssets,
    assetLogos,
    blockchainLogos
} from './data/initialData';
import { initialPaymentHistory } from './features/Payments/data/paymentConstants'; // Import lifted state's initial value

const initialClientAccounts = generateDummyClientAccounts(30);

const combinedInitialAccounts = [
    ...initialInstitutionalAssets,
    ...initialClientAccounts
];

function App() {
  const [activeTab, setActiveTab] = useState('token-mgmt');
  const [allAccounts, setAllAccounts] = useState(combinedInitialAccounts);
  const [paymentHistory, setPaymentHistory] = useState(initialPaymentHistory); // History state lifted here

  const handleAddPaymentHistoryEntry = (newEntry) => {
    setPaymentHistory(prev =>
      [newEntry, ...prev].sort((a, b) => b.timestamp - a.timestamp)
    );
  };

  const handleUpdatePaymentHistoryStatus = (entryId, newStatus, newTimestamp) => {
    setPaymentHistory(prev =>
      prev.map(item =>
        item.id === entryId
          ? { ...item, status: newStatus, timestamp: newTimestamp || new Date() }
          : item
      ).sort((a, b) => b.timestamp - a.timestamp)
    );
  };

  const renderContent = () => {
    const tokenManagementAssets = allAccounts.filter(acc =>
        (acc.isInstitutional && acc.blockchain && acc.blockchain !== 'N/A') ||
        acc.isWizardIssued
    );

    switch (activeTab) {
      case 'token-mgmt':
        return (
          <TokenDashboard
            assets={tokenManagementAssets}
            setAssets={setAllAccounts}
            assetLogos={assetLogos}
            blockchainLogos={blockchainLogos}
          />
        );

      case 'payments':
        return (
          <PaymentsDashboard
            assets={allAccounts}
            setAssets={setAllAccounts}
            assetLogosMap={assetLogos}
            paymentHistory={paymentHistory} // Pass state down
            onAddHistoryEntry={handleAddPaymentHistoryEntry} // Pass handler down
            onUpdateHistoryStatus={handleUpdatePaymentHistoryStatus} // Pass handler down
          />
        );

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