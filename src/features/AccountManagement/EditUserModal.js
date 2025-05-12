// src/features/AccountManagement/EditUserModal.js
import React, { useState, useEffect } from 'react';

const EditUserModal = ({ isOpen, onClose, user, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    platformRole: 'Administrator',
    status: 'Active',
    kycStatus: 'Not Verified',
    amlFlag: false,
    mfaEnabled: false,
    associatedBlockchainAccounts: []
  });
  
  const [newAccount, setNewAccount] = useState({
    blockchain: 'Hedera',
    accountId: ''
  });

  // Initialize form with user data when editing
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        platformRole: user.platformRole || 'Administrator',
        status: user.status || 'Active',
        kycStatus: user.kycStatus || 'Not Verified',
        amlFlag: user.amlFlag || false,
        mfaEnabled: user.mfaEnabled || false,
        associatedBlockchainAccounts: user.associatedBlockchainAccounts || []
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleNewAccountChange = (e) => {
    const { name, value } = e.target;
    setNewAccount({
      ...newAccount,
      [name]: value
    });
  };

  const addBlockchainAccount = () => {
    if (!newAccount.accountId) return;
    
    setFormData({
      ...formData,
      associatedBlockchainAccounts: [
        ...formData.associatedBlockchainAccounts,
        { ...newAccount }
      ]
    });
    
    // Reset the form
    setNewAccount({
      blockchain: 'Hedera',
      accountId: ''
    });
  };

  const removeBlockchainAccount = (index) => {
    const updatedAccounts = formData.associatedBlockchainAccounts.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      associatedBlockchainAccounts: updatedAccounts
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            {user ? 'Edit User' : 'Invite New User'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Basic User Information */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">User Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Platform Role</label>
                <select
                  name="platformRole"
                  value={formData.platformRole}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="Administrator">Administrator</option>
                  <option value="Treasurer">Treasurer</option>
                  <option value="Minter/Burner">Minter/Burner</option>
                  <option value="KYC Administrator">KYC Administrator</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Pending Invitation">Pending Invitation</option>
                </select>
              </div>
              <div className="flex items-center mt-4">
                <input
                  type="checkbox"
                  name="mfaEnabled"
                  checked={formData.mfaEnabled}
                  onChange={handleInputChange}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  Enable MFA
                </label>
              </div>
            </div>
          </div>

          {/* Associated Blockchain Accounts */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Associated Blockchain Accounts</h3>
            
            {/* List of current accounts */}
            {formData.associatedBlockchainAccounts.length > 0 && (
              <div className="mb-4 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Blockchain</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account ID</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {formData.associatedBlockchainAccounts.map((account, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{account.blockchain}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 font-mono">{account.accountId}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            type="button"
                            onClick={() => removeBlockchainAccount(index)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {/* Add new account form */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700">Blockchain Type</label>
                <select
                  name="blockchain"
                  value={newAccount.blockchain}
                  onChange={handleNewAccountChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="Hedera">Hedera</option>
                  <option value="Ethereum">Ethereum</option>
                  <option value="Stellar">Stellar</option>
                  <option value="Solana">Solana</option>
                  <option value="Polygon">Polygon</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Account ID</label>
                <input
                  type="text"
                  name="accountId"
                  value={newAccount.accountId}
                  onChange={handleNewAccountChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder={newAccount.blockchain === 'Hedera' ? '0.0.12345' : '0x...'}
                />
              </div>
              <div>
                <button
                  type="button"
                  onClick={addBlockchainAccount}
                  className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Add Account
                </button>
              </div>
            </div>
          </div>

          {/* KYC/AML Management */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">KYC/AML Management</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">KYC Status</label>
                <div className="mt-1 flex items-center">
                  <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                    formData.kycStatus === 'Verified' ? 'bg-green-100 text-green-800' :
                    formData.kycStatus === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {formData.kycStatus}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">AML Flag</label>
                <div className="mt-1 flex items-center">
                  <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                    formData.amlFlag ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {formData.amlFlag ? 'Flagged' : 'Clear'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, kycStatus: 'Verified' })}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Grant KYC
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, kycStatus: 'Not Verified' })}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
              >
                Revoke KYC
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, amlFlag: true })}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Set AML Flag
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, amlFlag: false })}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Clear AML Flag
              </button>
            </div>
          </div>

          {/* Form actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {user ? 'Save Changes' : 'Invite User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserModal;