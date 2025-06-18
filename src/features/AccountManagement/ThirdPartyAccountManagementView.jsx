// src/features/AccountManagement/ThirdPartyAccountManagementView.js
import React, { useState } from 'react';
import ConnectThirdPartyAppModal from './ConnectThirdPartyAppModal.jsx';
import ManagePermissionsModal from './ManagePermissionsModal.jsx'; 

// Helper function to generate a simple dummy API key
const generateDummyApiKey = () => `tp_key_${Math.random().toString(36).substr(2, 10)}_${Math.random().toString(36).substr(2, 10)}`;

// Initial data for third-party applications
const initialThirdPartyAppsData = [
  {
    id: 'app-001',
    name: 'External Custodian Reporting API',
    description: 'Grants read-only access to custody reports and balances for reconciliation.',
    status: 'Active',
    permissions: ['Read Account Balances', 'Access Custody Reports', 'View Transaction History'],
    apiKey: generateDummyApiKey(),
    connectionDate: new Date(2024, 0, 15).toLocaleDateString(),
  },
  {
    id: 'app-002',
    name: 'Partner Exchange Link (OmegaTrade)',
    description: 'Enables trade execution and market data access for OmegaTrade platform.',
    status: 'Inactive',
    permissions: ['Execute Trades', 'Access Market Data'],
    apiKey: generateDummyApiKey(),
    connectionDate: new Date(2024, 2, 10).toLocaleDateString(),
  },
  {
    id: 'app-003',
    name: 'Analytics Service Integration (DataStream Corp)',
    description: 'Provides anonymized transaction volume and platform usage statistics for analytics.',
    status: 'Active',
    permissions: ['Read Anonymized Volume', 'Read Usage Statistics', 'Access Aggregated Platform Analytics'],
    apiKey: generateDummyApiKey(),
    connectionDate: new Date(2023, 11, 1).toLocaleDateString(),
  },
];

const ThirdPartyAccountManagementView = ({ onBack }) => {
  const [thirdPartyApps, setThirdPartyApps] = useState(initialThirdPartyAppsData);
  
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  
  const [isManagePermissionsModalOpen, setIsManagePermissionsModalOpen] = useState(false);
  const [selectedAppForPermissions, setSelectedAppForPermissions] = useState(null);


  const handleToggleStatus = (appId) => {
    setThirdPartyApps(prevApps =>
      prevApps.map(app =>
        app.id === appId
          ? { ...app, status: app.status === 'Active' ? 'Inactive' : 'Active' }
          : app
      )
    );
  };

  const handleOpenManagePermissions = (app) => {
    setSelectedAppForPermissions(app);
    setIsManagePermissionsModalOpen(true);
  };

  const handleCloseManagePermissions = () => {
    setIsManagePermissionsModalOpen(false);
    setSelectedAppForPermissions(null);
  };

  const handleSaveAppPermissions = (appId, updatedPermissions) => {
    setThirdPartyApps(prevApps =>
      prevApps.map(app =>
        app.id === appId
          ? { ...app, permissions: updatedPermissions }
          : app
      )
    );
  };

  const handleRevokeAccess = (appId) => {
    if (window.confirm("Are you sure you want to revoke access for this application? This action cannot be undone from this V0 interface.")) {
      setThirdPartyApps(prevApps => prevApps.filter(app => app.id !== appId));
      alert("Access (simulated) revoked. The application has been removed from the list for this session.");
    }
  };

  const handleConnectNewApp = (appData) => {
    const newApp = {
      ...appData,
      id: `app-${Date.now()}`,
      status: 'Active',
      apiKey: generateDummyApiKey(),
      connectionDate: new Date().toLocaleDateString(),
    };
    setThirdPartyApps(prevApps => [newApp, ...prevApps]);
  };

  // Function to handle API key rotation
  const handleRotateApiKey = (appId) => {
    const newApiKey = generateDummyApiKey();
    setThirdPartyApps(prevApps =>
      prevApps.map(app =>
        app.id === appId
          ? { ...app, apiKey: newApiKey }
          : app
      )
    );
    // Find the app name for the alert
    const appName = thirdPartyApps.find(app => app.id === appId)?.name || 'Application';
    alert(`API Key for ${appName} has been rotated (simulated).\nNew Key (for demo): ${newApiKey}`);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6 border-b pb-3">
        <h2 className="text-2xl font-bold text-gray-800">3rd Party Account Management</h2>
        <button
          onClick={onBack}
          className="px-3 py-1 rounded text-white hover:opacity-90 bg-gray-700 text-sm"
        >
          &larr; Back to Account Management Options
        </button>
      </div>
      <p className="text-gray-600 mb-4">
        Configure and manage access for external applications, partners, or service providers.
      </p>
      
      <div className="mb-6 text-right">
        <button
          onClick={() => setIsConnectModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          Connect New Application
        </button>
      </div>

      {thirdPartyApps.length === 0 ? (
        <div className="text-center py-10">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No Third-Party Applications</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by connecting a new application.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {thirdPartyApps.map((app) => (
            <div key={app.id} className="p-4 border rounded-lg bg-white shadow-md hover:shadow-lg transition-shadow">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center">
                <h3 className="font-semibold text-gray-800 text-lg mb-1 sm:mb-0">{app.name}</h3>
                <div className="flex items-center space-x-3">
                  <span 
                    className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      app.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {app.status}
                  </span>
                  <button
                    onClick={() => handleToggleStatus(app.id)}
                    className={`px-3 py-1 text-xs font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50
                      ${app.status === 'Active' 
                        ? 'bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-400' 
                        : 'bg-green-500 text-white hover:bg-green-600 focus:ring-green-400'
                      }`}
                  >
                    {app.status === 'Active' ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-2">{app.description}</p>
              <div className="mt-2 text-xs text-gray-500">
                <p><strong>Permissions:</strong> {app.permissions.join(', ')}</p>
                <p><strong>API Key:</strong> <span className="font-mono">{app.apiKey.substring(0, 10)}...</span></p>
                <p><strong>Connected:</strong> {app.connectionDate}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-200 flex flex-wrap gap-2">
                <button 
                  onClick={() => handleOpenManagePermissions(app)}
                  className="text-xs text-blue-600 hover:underline focus:outline-none"
                >
                  Manage Permissions
                </button>
                <button 
                  onClick={() => handleRotateApiKey(app.id)} // Updated onClick
                  className="text-xs text-purple-600 hover:underline focus:outline-none"
                >
                  Rotate Key
                </button>
                <button 
                  onClick={() => handleRevokeAccess(app.id)}
                  className="text-xs text-red-600 hover:underline focus:outline-none"
                >
                  Revoke Access
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConnectThirdPartyAppModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        onConnectApp={handleConnectNewApp}
      />

      <ManagePermissionsModal
        isOpen={isManagePermissionsModalOpen}
        onClose={handleCloseManagePermissions}
        app={selectedAppForPermissions}
        onSavePermissions={handleSaveAppPermissions}
      />
    </div>
  );
};

export default ThirdPartyAccountManagementView;
