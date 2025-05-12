// src/features/AccountManagement/ManagePermissionsModal.js
import React, { useState, useEffect } from 'react';

// Import the same permissions list used in ConnectThirdPartyAppModal
// To ensure consistency, this could be moved to a shared constants file in a larger app.
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

const ManagePermissionsModal = ({ isOpen, onClose, app, onSavePermissions }) => {
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [error, setError] = useState('');

  // When the modal opens or the app prop changes, initialize selectedPermissions
  useEffect(() => {
    if (app && app.permissions) {
      setSelectedPermissions([...app.permissions]); // Create a new array copy
    } else {
      setSelectedPermissions([]);
    }
  }, [app, isOpen]); // Rerun effect if app or isOpen changes

  if (!isOpen || !app) {
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
    if (selectedPermissions.length === 0) {
      setError('At least one permission must be selected for the application.');
      return;
    }
    setError('');
    onSavePermissions(app.id, selectedPermissions);
    onClose(); // Close modal after saving
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 transition-opacity duration-300 ease-in-out">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            Manage Permissions for: <span className="text-blue-600">{app.name}</span>
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
            <p className="text-sm text-gray-600 mb-1">
              <strong>Application Name:</strong> {app.name}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Description:</strong> {app.description || 'N/A'}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Select Permissions <span className="text-red-500">*</span>
            </h3>
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
              className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
            >
              Save Permissions
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManagePermissionsModal;
