import React, { useState } from 'react';
import Layout from './components/Layout/Layout.jsx';
import TokenDashboard from './features/TokenManagement/TokenDashboard.jsx';
import PaymentsDashboard from './features/Payments/PaymentsDashboard.jsx';
import CustodyDashboard from './features/Custody/CustodyDashboard.jsx';
import TreasuryDashboard from './features/Treasury/TreasuryDashboard.jsx';
import AccountManagementScreen from './features/AccountManagement/AccountManagementScreen.jsx';
import ComplianceScreen from './features/Compliance/ComplianceScreen.jsx';

import { assetLogos, blockchainLogos } from './data/initialData.js';
import { AssetsProvider } from './context/AssetsContext.jsx';
import { PaymentHistoryProvider } from './context/PaymentHistoryContext.jsx';
import { TokenHistoryProvider } from './context/TokenHistoryContext.jsx';
import { TemplatesProvider } from './context/TemplatesContext.jsx';
import { RecurringPaymentsProvider } from './context/RecurringPaymentsContext.jsx';
import { ActiveBulkProvider } from './context/ActiveBulkContext.jsx';
import { AssetOrdersProvider } from './context/AssetOrdersContext.jsx';

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
        return <AccountManagementScreen />;
      case 'custody':
        return <CustodyDashboard />;
      case 'treasury':
        return (
          <TreasuryDashboard
            assetLogos={assetLogos}
            blockchainLogos={blockchainLogos}
          />
        );
      case 'compliance':
        return <ComplianceScreen />;
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
                <AssetOrdersProvider>
                  <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
                    {renderContent()}
                  </Layout>
                </AssetOrdersProvider>
              </ActiveBulkProvider>
            </RecurringPaymentsProvider>
          </TemplatesProvider>
        </TokenHistoryProvider>
      </PaymentHistoryProvider>
    </AssetsProvider>
  );
}

export default App;