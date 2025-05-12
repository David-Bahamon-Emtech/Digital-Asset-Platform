import React, { useState } from 'react';
import Layout from './components/Layout/Layout';
import TokenDashboard from './features/TokenManagement/TokenDashboard';
import PaymentsDashboard from './features/Payments/PaymentsDashboard';
import CustodyDashboard from './features/Custody/CustodyDashboard';
import TreasuryDashboard from './features/Treasury/TreasuryDashboard';
// Import the new screen components
import AccountManagementScreen from './features/AccountManagement/AccountManagementScreen';
import ComplianceScreen from './features/Compliance/ComplianceScreen';


import { assetLogos, blockchainLogos } from './data/initialData';
// Import Context Providers
import { AssetsProvider } from './context/AssetsContext';
import { PaymentHistoryProvider } from './context/PaymentHistoryContext';
import { TokenHistoryProvider } from './context/TokenHistoryContext';
import { TemplatesProvider } from './context/TemplatesContext';
import { RecurringPaymentsProvider } from './context/RecurringPaymentsContext';
import { ActiveBulkProvider } from './context/ActiveBulkContext';
import { AssetOrdersProvider } from './context/AssetOrdersContext'; // <-- Import the new provider

function App() {
  const [activeTab, setActiveTab] = useState('token-mgmt'); // Default to token-mgmt or maybe 'treasury'?

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
        // Render the new Account Management screen
        return <AccountManagementScreen />;
      case 'custody':
        return <CustodyDashboard />;
      case 'treasury':
        // TreasuryDashboard now has access to AssetOrdersContext via the provider below
        return (
          <TreasuryDashboard
            assetLogos={assetLogos}
            blockchainLogos={blockchainLogos}
          />
        );
      case 'compliance':
         // Render the new Compliance screen
        return <ComplianceScreen />;
      default:
        // Fallback or initial view (consider changing if needed)
        return <div className="p-8"><h1 className="text-2xl">Dashboard</h1></div>;
    }
  };

  // Wrap Layout (and thus its children) with all necessary providers
  return (
    <AssetsProvider>
      <PaymentHistoryProvider>
        <TokenHistoryProvider>
          <TemplatesProvider>
            <RecurringPaymentsProvider>
              <ActiveBulkProvider>
                {/* V-- Add the AssetOrdersProvider here --V */}
                <AssetOrdersProvider>
                  <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
                    {renderContent()}
                  </Layout>
                </AssetOrdersProvider>
                {/* ^-- Add the AssetOrdersProvider here --^ */}
              </ActiveBulkProvider>
            </RecurringPaymentsProvider>
          </TemplatesProvider>
        </TokenHistoryProvider>
      </PaymentHistoryProvider>
    </AssetsProvider>
  );
}

export default App;