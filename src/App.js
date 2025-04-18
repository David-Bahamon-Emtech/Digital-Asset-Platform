import React, { useState } from 'react';
import Layout from './components/Layout/Layout';
import TokenDashboard from './features/TokenManagement/TokenDashboard';
import PaymentsDashboard from './features/Payments/PaymentsDashboard';
import CustodyDashboard from './features/Custody/CustodyDashboard';
import TreasuryDashboard from './features/Treasury/TreasuryDashboard'; // Already imported

import { assetLogos, blockchainLogos } from './data/initialData'; // Import logo data
import { AssetsProvider } from './context/AssetsContext';
import { PaymentHistoryProvider } from './context/PaymentHistoryContext';
import { TokenHistoryProvider } from './context/TokenHistoryContext';
import { TemplatesProvider } from './context/TemplatesContext';
import { RecurringPaymentsProvider } from './context/RecurringPaymentsContext';
import { ActiveBulkProvider } from './context/ActiveBulkContext';

function App() {
  const [activeTab, setActiveTab] = useState('token-mgmt');

  const renderContent = () => {
    switch (activeTab) {
      case 'token-mgmt':
        return (
          <TokenDashboard
            assetLogos={assetLogos}
            blockchainLogos={blockchainLogos}
          />
        );
      case 'payments':
        return (
          <PaymentsDashboard
            assetLogosMap={assetLogos}
          />
        );
      case 'account-mgmt':
        return <div className="p-8"><h1 className="text-2xl">Account Management</h1><p>Placeholder...</p></div>;
      case 'custody':
        return <CustodyDashboard />;
      case 'treasury':
        // Pass logo maps as props to TreasuryDashboard
        return (
          <TreasuryDashboard
            assetLogos={assetLogos} // <-- Pass assetLogos
            blockchainLogos={blockchainLogos} // <-- Pass blockchainLogos
          />
        );
      case 'compliance':
        return <div className="p-8"><h1 className="text-2xl">Compliance</h1><p>Placeholder...</p></div>;
      default:
        return <div className="p-8"><h1 className="text-2xl">Dashboard</h1></div>;
    }
  };

  return (
    <AssetsProvider>
      <PaymentHistoryProvider>
        <TokenHistoryProvider>
          <TemplatesProvider>
            <RecurringPaymentsProvider>
              <ActiveBulkProvider>
                <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
                  {renderContent()}
                </Layout>
              </ActiveBulkProvider>
            </RecurringPaymentsProvider>
          </TemplatesProvider>
        </TokenHistoryProvider>
      </PaymentHistoryProvider>
    </AssetsProvider>
  );
}

export default App;
