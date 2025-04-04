import React, { useState } from 'react';
import Layout from './components/Layout/Layout'; // Import the Layout component
import TokenDashboard from './features/TokenManagement/TokenDashboard'; // <-- ADDED THIS IMPORT

function App() {
  // Bring the activeTab state here, as Layout needs it
  const [activeTab, setActiveTab] = useState('token-mgmt'); // Default to token-mgmt

  // Function to render content based on activeTab
  const renderContent = () => {
    switch (activeTab) {
      case 'token-mgmt':
        // Render the actual TokenDashboard component now
        return <TokenDashboard />; // <-- CHANGED THIS LINE

      case 'account-mgmt': // Separate case for account-mgmt
        // Later, this will render the AccountManagementDashboard component
        return <div className="p-8"><h1 className="text-2xl">Account Management Content Area</h1><p>Details for {activeTab} will go here.</p></div>;

      case 'payments': // Separate case for payments
         // Later, this will render the PaymentsDashboard component
        return <div className="p-8"><h1 className="text-2xl">Payments Content Area</h1><p>Details for {activeTab} will go here.</p></div>;

      case 'custody':
         // Later, this will render the CustodyDashboard component
        return <div className="p-8"><h1 className="text-2xl">Custody Content Area</h1><p>Details for {activeTab} will go here.</p></div>;

      case 'treasury':
         // Later, this will render the TreasuryDashboard component
        return <div className="p-8"><h1 className="text-2xl">Treasury Content Area</h1><p>Details for {activeTab} will go here.</p></div>;

      case 'compliance':
         // Later, this will render the ComplianceDashboard component
        return <div className="p-8"><h1 className="text-2xl">Compliance Content Area</h1><p>Details for {activeTab} will go here.</p></div>;

      default:
        return <div className="p-8"><h1 className="text-2xl">Dashboard</h1></div>;
    }
  };

  return (
    // Pass the state and setter down to the Layout
    // Render the content determined by renderContent() inside the Layout
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </Layout>
  );
}

export default App;