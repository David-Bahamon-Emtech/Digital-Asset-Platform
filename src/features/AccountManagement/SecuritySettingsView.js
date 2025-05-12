// src/features/AccountManagement/SecuritySettingsView.js
import React from 'react';

const SecuritySettingsView = ({ onBack }) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-6 border-b pb-3">
        <h2 className="text-2xl font-bold text-gray-800">Security Settings</h2>
        <button
          onClick={onBack}
          className="px-3 py-1 rounded text-white hover:opacity-90 bg-gray-700 text-sm"
        >
          &larr; Back
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Password Policy</h3>
          <div className="bg-gray-50 p-4 rounded-md">
            <p className="text-gray-700">
              Current Password Policy: Passwords must be at least 12 characters, include uppercase, lowercase, numbers, and symbols.
            </p>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Multi-Factor Authentication (MFA)</h3>
          <div className="flex items-center justify-between bg-gray-50 p-4 rounded-md">
            <div>
              <p className="text-gray-700 mb-1">Platform-wide MFA Requirement</p>
              <p className="text-sm text-gray-500">Require MFA for all platform users</p>
            </div>
            <div className="relative inline-block w-12 mr-2 align-middle select-none">
              <input type="checkbox" id="toggle-mfa" className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 border-gray-300 appearance-none cursor-pointer" />
              <label htmlFor="toggle-mfa" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm italic">Additional security settings functionality coming in future updates</p>
        </div>
      </div>
    </div>
  );
};

export default SecuritySettingsView;