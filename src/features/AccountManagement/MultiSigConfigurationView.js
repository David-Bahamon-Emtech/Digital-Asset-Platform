// src/features/AccountManagement/MultiSigConfigurationView.js
import React, { useState } from 'react';
import { dummyInternalUsers } from '../../data/initialData';

const MultiSigConfigurationView = ({ onBack }) => {
  // Dummy multi-sig configurations for V0
  const [multiSigConfigs, setMultiSigConfigs] = useState([
    {
      id: 'msig-1',
      name: 'Treasury Transaction Approvers',
      blockchainType: 'Hedera',
      signerIds: ['user1', 'user2', 'user3'],
      threshold: 2,
      accountId: '0.0.123456',
    },
    {
      id: 'msig-2',
      name: 'Token Issuance Approvers',
      blockchainType: 'Ethereum',
      signerIds: ['user1', 'user3'],
      threshold: 2,
      accountId: '0xabc123def456789012345678901234567890',
    },
  ]);

  // Form state for creating new multi-sig configuration
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newConfig, setNewConfig] = useState({
    name: '',
    blockchainType: 'Hedera',
    signerIds: [],
    threshold: 2,
    accountId: '',
  });

  // Get user name by ID helper
  const getUserNameById = (userId) => {
    const user = dummyInternalUsers.find(u => u.id === userId);
    return user ? user.name : 'Unknown User';
  };

  // Filter users who have accounts on the selected blockchain
  const getEligibleSigners = (blockchainType) => {
    return dummyInternalUsers.filter(user => 
      user.associatedBlockchainAccounts?.some(acc => acc.blockchain === blockchainType)
    );
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    // Generate a simple ID and auto-generate account ID if empty
    const newId = `msig-${Date.now()}`;
    const accountId = newConfig.accountId || 
      (newConfig.blockchainType === 'Hedera' ? 
        `0.0.${Math.floor(Math.random() * 900000) + 100000}` : 
        `0x${Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`);
    
    const configToAdd = {
      ...newConfig,
      id: newId,
      accountId,
    };
    
    setMultiSigConfigs([...multiSigConfigs, configToAdd]);
    setShowCreateForm(false);
    setNewConfig({
      name: '',
      blockchainType: 'Hedera',
      signerIds: [],
      threshold: 2,
      accountId: '',
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewConfig({
      ...newConfig,
      [name]: value,
    });
  };

  const handleSignerChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setNewConfig({
      ...newConfig,
      signerIds: selectedOptions,
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6 border-b pb-3">
        <h2 className="text-2xl font-bold text-gray-800">Multi-Signature Configuration</h2>
        <button
          onClick={onBack}
          className="px-3 py-1 rounded text-white hover:opacity-90 bg-gray-700 text-sm"
        >
          &larr; Back
        </button>
      </div>

      {/* List of existing multi-sig configurations */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-700">Existing Configurations</h3>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Create New Multi-Sig Configuration
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {multiSigConfigs.map((config) => (
            <div key={config.id} className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between">
                <h4 className="text-lg font-medium text-gray-900">{config.name}</h4>
                <span className="text-sm font-medium text-blue-600">{config.blockchainType}</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Threshold: {config.threshold} of {config.signerIds.length}
              </p>
              <div className="mt-2">
                <p className="text-xs text-gray-500">Account ID:</p>
                <p className="text-sm font-mono">{config.accountId}</p>
              </div>
              <div className="mt-2">
                <p className="text-xs text-gray-500">Signers:</p>
                <ul className="mt-1 text-sm">
                  {config.signerIds.map((signerId) => (
                    <li key={signerId} className="text-gray-700">
                      {getUserNameById(signerId)}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}

          {multiSigConfigs.length === 0 && (
            <p className="text-sm text-gray-500 italic">No multi-signature configurations defined yet.</p>
          )}
        </div>
      </div>

      {/* Create New Multi-Sig Configuration Form */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                Create New Multi-Sig Configuration
              </h3>
              <button 
                onClick={() => setShowCreateForm(false)} 
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreateSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Configuration Name</label>
                  <input
                    type="text"
                    name="name"
                    value={newConfig.name}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="e.g., Treasury Transaction Approvers"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Blockchain Type</label>
                  <select
                    name="blockchainType"
                    value={newConfig.blockchainType}
                    onChange={handleInputChange}
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
                  <label className="block text-sm font-medium text-gray-700">Signers</label>
                  <select
                    multiple
                    value={newConfig.signerIds}
                    onChange={handleSignerChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    size={4}
                    required
                  >
                    {getEligibleSigners(newConfig.blockchainType).map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.platformRole})
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Hold Ctrl/Cmd to select multiple signers
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Required Signatures (Threshold)
                  </label>
                  <input
                    type="number"
                    name="threshold"
                    value={newConfig.threshold}
                    onChange={handleInputChange}
                    min={1}
                    max={newConfig.signerIds.length || 1}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Multi-sig Account/Contract ID (Optional)
                  </label>
                  <input
                    type="text"
                    name="accountId"
                    value={newConfig.accountId}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder={newConfig.blockchainType === 'Hedera' ? '0.0.12345' : '0x...'}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Leave blank to auto-generate a simulated ID
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Create Configuration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiSigConfigurationView;