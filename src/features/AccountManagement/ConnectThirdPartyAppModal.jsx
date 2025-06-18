// src/features/AccountManagement/ConnectThirdPartyAppModal.js
import React, { useState } from 'react';

// Enhanced and categorized list of available permissions
const ALL_AVAILABLE_PERMISSIONS = [
  // Compliance & Risk Management
  'Access Transaction Monitoring Data',
  'View AML/KYC Case Details',
  'Update AML/KYC Case Status',
  'Access Sanction Screening Results',
  'Configure Risk Rules & Thresholds',
  'Generate Regulatory Reports (Read-Only)',
  'Submit Regulatory Filings (Write)',

  // KYC/AML & Client Onboarding
  'Initiate Client KYC/AML Checks',
  'Retrieve Client KYC/AML Documents',
  'Update Client KYC/AML Profile',
  'View Client Risk Scoring',

  // Treasury Operations
  'View Treasury Account Balances',
  'Initiate Treasury Transfers (Internal)',
  'Access FX Rate Feeds',
  'Manage Reserve Composition Data (Read)',
  'Execute Automated Rebalancing (Simulated)',

  // Account & User Management (Third-Party Context)
  'Read Client Account Information (Limited Scope)',
  'Read Platform User Roles (Limited Scope)',

  // Payment & Transaction Processing
  'Initiate Payments (Low Value, Client-Instructed)',
  'Initiate Payments (High Value, Requires Dual Approval)',
  'View Payment Status & History',
  'Process Incoming Payment Notifications',

  // Token & Asset Management (Third-Party Context)
  'Read Token Issuance Data',
  'Access Asset Custody Information (Read-Only)',
  'Query Blockchain Transaction Data',

  // Reporting & Analytics
  'Access Aggregated Platform Analytics',
  'Generate Custom Reports (Read-Only)',
  'Access Audit Log Data (Limited Scope)',
  
  // General API Access
  'Webhook Subscription Management',
  'API Key Status Check',
];

const ConnectThirdPartyAppModal = ({ isOpen, onClose, onConnectApp }) => {
  const [appName, setAppName] = useState('');
  const [appDescription, setAppDescription] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [error, setError] = useState('');

  if (!isOpen) {
    return null;
  }

  const handlePermissionChange = (permission) => {
    setSelectedPermissions(prev =>
      prev.includes(permission)
        ? prev.filter(p => p !== permission)
        : [...prev, permission]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!appName.trim()) {
      setError('Application Name is required.');
      return;
    }
    if (selectedPermissions.length === 0) {
      setError('At least one permission must be selected.');
      return;
    }
    setError('');

    onConnectApp({
      name: appName,
      description: appDescription,
      permissions: selectedPermissions,
    });
    // Reset form and close
    setAppName('');
    setAppDescription('');
    setSelectedPermissions([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 transition-opacity duration-300 ease-in-out">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            Connect New Third-Party Application
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body - Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="appName" className="block text-sm font-medium text-gray-700 mb-1">
              Application Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="appName"
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="e.g., Reporting Service X"
            />
          </div>

          <div>
            <label htmlFor="appDescription" className="block text-sm font-medium text-gray-700 mb-1">
              Application Description
            </label>
            <textarea
              id="appDescription"
              rows="3"
              value={appDescription}
              onChange={(e) => setAppDescription(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Briefly describe the application's purpose or integration."
            ></textarea>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Grant Permissions <span className="text-red-500">*</span>
            </h3>
            {/* Increased max-h for better visibility of more permissions */}
            <div className="max-h-60 overflow-y-auto space-y-2 p-3 border border-gray-200 rounded-md bg-gray-50">
              {ALL_AVAILABLE_PERMISSIONS.map(permission => (
                <label key={permission} className="flex items-center space-x-2 cursor-pointer p-1 hover:bg-gray-100 rounded">
                  <input
                    type="checkbox"
                    checked={selectedPermissions.includes(permission)}
                    onChange={() => handlePermissionChange(permission)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{permission}</span>
                </label>
              ))}
            </div>
          </div>
          
          {error && <p className="text-xs text-red-600">{error}</p>}

          {/* Modal Footer - Form Actions */}
          <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              Connect Application
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConnectThirdPartyAppModal;
