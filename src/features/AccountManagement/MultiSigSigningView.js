// src/features/AccountManagement/MultiSigSigningView.js
import React, { useState } from 'react';
import { dummyInternalUsers } from '../../data/initialData';

const MultiSigSigningView = ({ onBack }) => {
  // Dummy pending transactions for demonstration
  const [pendingTransactions, setPendingTransactions] = useState([
    {
      id: 'tx-1',
      description: 'Mint 10,000 XAGC',
      configId: 'msig-1',
      configName: 'Treasury Transaction Approvers',
      status: 'Pending',
      requiredSignatures: 2,
      currentSignatures: 1,
      signers: [
        { userId: 'user1', status: 'Signed' },
        { userId: 'user2', status: 'Pending' },
        { userId: 'user3', status: 'Pending' }
      ],
      expiresAt: new Date(Date.now() + 86400000), // 24 hours from now
      submittedAt: new Date(),
    },
    {
      id: 'tx-2',
      description: 'Pause ACP Token',
      configId: 'msig-2',
      configName: 'Token Issuance Approvers',
      status: 'Pending',
      requiredSignatures: 2,
      currentSignatures: 0,
      signers: [
        { userId: 'user1', status: 'Pending' },
        { userId: 'user3', status: 'Pending' }
      ],
      expiresAt: new Date(Date.now() + 43200000), // 12 hours from now
      submittedAt: new Date(Date.now() - 3600000), // 1 hour ago
    }
  ]);

  // Current user context (simulated)
  const currentUser = { id: 'user2', name: 'Bob MinterBurner' };

  // Get user name by ID helper
  const getUserNameById = (userId) => {
    const user = dummyInternalUsers.find(u => u.id === userId);
    return user ? user.name : 'Unknown User';
  };

  // Get transaction status text
  const getTransactionStatusText = (tx) => {
    if (tx.currentSignatures >= tx.requiredSignatures) {
      return `Ready to Submit (${tx.currentSignatures} of ${tx.signers.length} signatures)`;
    }
    if (new Date() > tx.expiresAt) {
      return `Expired (${tx.currentSignatures} of ${tx.requiredSignatures} signatures)`;
    }
    return `Pending (${tx.currentSignatures} of ${tx.requiredSignatures} signatures)`;
  };

  // Sign transaction function
  const signTransaction = (txId) => {
    setPendingTransactions(prevTxs => 
      prevTxs.map(tx => {
        if (tx.id === txId) {
          // Find the current user's signer entry
          const updatedSigners = tx.signers.map(signer => 
            signer.userId === currentUser.id ? 
              { ...signer, status: 'Signed' } : 
              signer
          );
          
          // Count new number of signatures
          const newSignatureCount = updatedSigners.filter(s => s.status === 'Signed').length;
          
          // Update transaction status based on signature count
          let newStatus = 'Pending';
          if (newSignatureCount >= tx.requiredSignatures) {
            newStatus = 'Ready to Submit';
          }
          
          return {
            ...tx,
            signers: updatedSigners,
            currentSignatures: newSignatureCount,
            status: newStatus
          };
        }
        return tx;
      })
    );

    // Simulate success message
    alert(`Transaction ${txId} signed successfully!`);
  };

  // Filter transactions that require the current user's signature
  const userPendingTransactions = pendingTransactions.filter(tx => 
    tx.signers.some(signer => 
      signer.userId === currentUser.id && signer.status === 'Pending'
    ) && tx.status !== 'Expired'
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6 border-b pb-3">
        <h2 className="text-2xl font-bold text-gray-800">Multi-Signature Transaction Signing</h2>
        <button
          onClick={onBack}
          className="px-3 py-1 rounded text-white hover:opacity-90 bg-gray-700 text-sm"
        >
          &larr; Back
        </button>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          Pending Transactions Requiring Your Signature
        </h3>

        {userPendingTransactions.length === 0 ? (
          <p className="text-sm text-gray-500 italic">
            No pending transactions require your signature at this time.
          </p>
        ) : (
          <div className="space-y-4">
            {userPendingTransactions.map(tx => (
              <div key={tx.id} className="bg-white p-4 rounded-lg shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">{tx.description}</h4>
                    <p className="text-sm text-gray-600 mt-1">{tx.configName}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    tx.status === 'Ready to Submit' ? 'bg-green-100 text-green-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {getTransactionStatusText(tx)}
                  </span>
                </div>

                <div className="mt-4 border-t pt-3">
                  <p className="text-xs text-gray-500 mb-2">Signatures:</p>
                  <ul className="space-y-1">
                    {tx.signers.map(signer => (
                      <li key={signer.userId} className="flex justify-between text-sm">
                        <span>{getUserNameById(signer.userId)}</span>
                        <span className={signer.status === 'Signed' ? 'text-green-600' : 'text-gray-500'}>
                          {signer.status}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-4 pt-3 border-t flex justify-between items-center text-xs text-gray-500">
                  <div>
                    Submitted: {tx.submittedAt.toLocaleString()}
                  </div>
                  <div>
                    Expires: {tx.expiresAt.toLocaleString()}
                  </div>
                </div>

                <div className="mt-4">
                  <button
                    onClick={() => signTransaction(tx.id)}
                    className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Sign Transaction
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          All Pending Transactions
        </h3>

        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Signatures
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expiration
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pendingTransactions.map(tx => (
                <tr key={tx.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{tx.description}</div>
                    <div className="text-xs text-gray-500">{tx.configName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{tx.currentSignatures} of {tx.requiredSignatures} required</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      tx.status === 'Ready to Submit' ? 'bg-green-100 text-green-800' :
                      new Date() > tx.expiresAt ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {getTransactionStatusText(tx)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {tx.expiresAt.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MultiSigSigningView;