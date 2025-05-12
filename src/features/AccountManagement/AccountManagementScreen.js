// src/features/AccountManagement/AccountManagementScreen.js
import React, { useState, useMemo } from 'react'; // Removed useEffect
import InternalAccountManagementView from './InternalAccountManagementView';
import ThirdPartyAccountManagementView from './ThirdPartyAccountManagementView';
import ClientAccountManagementView from './ClientAccountManagementView';
// import { generateDummyClientAccounts } from '../../utils/dummyData'; // No longer needed here
import { useAssets } from '../../context/AssetsContext'; // Import useAssets

// Main AccountManagementScreen component
const AccountManagementScreen = () => {
  const [currentSubView, setCurrentSubView] = useState('main');
  const { assets, dispatchAssets } = useAssets(); // Get assets and dispatch from context

  // Derive client accounts from the global assets context.
  // These accounts are expected to have simulatedStatus and clientName initialized by AssetsContext.
  const clientAccountsFromContext = useMemo(() => {
    console.log("AccountManagementScreen: Filtering client accounts from global AssetsContext...");
    if (!assets) return []; // Guard against assets being undefined initially
    // Client accounts are typically not institutional and are fiat or stablecoins.
    // Adjust filter as per how client accounts are defined in your AssetsContext.
    return assets.filter(asset => 
        !asset.isInstitutional && 
        (asset.assetClass === 'FiatCurrency' || asset.assetClass === 'Stablecoin')
    );
  }, [assets]);

  // Icons for the cards (simple SVG placeholders) - unchanged
  const InternalIcon = () => (
    <svg className="w-12 h-12 text-blue-500 mb-3" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
      <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
    </svg>
  );

  const ThirdPartyIcon = () => (
    <svg className="w-12 h-12 text-purple-500 mb-3" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
      <path d="M13 10V3L4 14h7v7l9-11h-7z"></path>
    </svg>
  );

  const ClientIcon = () => (
    <svg className="w-12 h-12 text-green-500 mb-3" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
      <path d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
    </svg>
  );

  // Function to render the main selection screen - unchanged
  const renderMainSelection = () => (
    <>
      <p className="text-lg text-gray-600 mb-8">
        Manage user access, roles, security settings, API keys, and integrations for the platform.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Internal Account Management Card */}
        <div
          className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer flex flex-col items-center text-center"
          onClick={() => setCurrentSubView('internal')}
        >
          <InternalIcon />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Internal Account Management</h2>
          <p className="text-sm text-gray-600">
            Manage platform administrators, operators, and their roles, permissions, and security configurations.
          </p>
        </div>

        {/* 3rd Party Account Management Card */}
        <div
          className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer flex flex-col items-center text-center"
          onClick={() => setCurrentSubView('thirdParty')}
        >
          <ThirdPartyIcon />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">3rd Party Account Management</h2>
          <p className="text-sm text-gray-600">
            Configure and manage access for external applications, partners, and service providers.
          </p>
        </div>

        {/* Client Account Management Card */}
        <div
          className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer flex flex-col items-center text-center"
          onClick={() => setCurrentSubView('client')}
        >
          <ClientIcon />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Client Account Management</h2>
          <p className="text-sm text-gray-600">
            Oversee and manage accounts for clients utilizing the platform's services.
          </p>
        </div>
      </div>
    </>
  );

  // Render logic based on currentSubView
  const renderCurrentView = () => {
    switch (currentSubView) {
      case 'internal':
        return <InternalAccountManagementView onBack={() => setCurrentSubView('main')} />;
      case 'thirdParty':
        return <ThirdPartyAccountManagementView onBack={() => setCurrentSubView('main')} />;
      case 'client':
        // Pass the client accounts from context and the dispatch function
        return <ClientAccountManagementView 
                  onBack={() => setCurrentSubView('main')} 
                  initialClientAccounts={clientAccountsFromContext} 
                  dispatchAssets={dispatchAssets} // Pass dispatchAssets
               />;
      case 'main':
      default:
        return renderMainSelection();
    }
  };

  return (
    <div className="p-8 min-h-screen"> {/* Relies on Layout's background */}
      {currentSubView === 'main' && (
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Account Management</h1>
      )}
      {renderCurrentView()}
    </div>
  );
};

export default AccountManagementScreen;
