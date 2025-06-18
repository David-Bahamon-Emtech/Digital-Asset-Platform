// src/features/AccountManagement/ClientAccountDetailModal.jsx
import React, { useState, useEffect } from 'react'; 
import { formatNumber, formatBoolean } from '../../utils/displayUtils.jsx';
import StatementModal from './StatementModal.jsx'; 

const ClientAccountDetailModal = ({ isOpen, onClose, account, onToggleHold, onToggleFlag, onUpdateNickname }) => {
  const [isStatementModalOpen, setIsStatementModalOpen] = useState(false);
  
  // State for nickname editing
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [editableNickname, setEditableNickname] = useState('');

  // Dummy linked services
  const dummyLinkedServices = [
    { id: 'svc1', name: 'Online Banking Access', enabled: true },
    { id: 'svc2', name: 'Debit Card Linked', enabled: false },
    { id: 'svc3', name: 'Overdraft Facility', enabled: true },
    { id: 'svc4', name: 'Paperless Statements', enabled: true },
  ];

  // When the account prop changes (e.g., when the modal is opened with a new account),
  // reset the editableNickname.
  useEffect(() => {
    if (account) {
      setEditableNickname(account.label);
    }
  }, [account]);


  if (!isOpen || !account) {
    return null;
  }

  const dummyTransactions = [
    { id: 'txn1', date: '2025-05-07', description: 'Incoming Wire Transfer', debit: '', credit: formatNumber(5000), balance: formatNumber(account.balance + 5000) },
    { id: 'txn2', date: '2025-05-05', description: 'Platform Service Fee', debit: formatNumber(25), credit: '', balance: formatNumber(account.balance + 4975) },
    { id: 'txn3', date: '2025-05-01', description: 'Outgoing Payment - INV00123', debit: formatNumber(1250.75), credit: '', balance: formatNumber(account.balance + 3724.25) },
    { id: 'txn4', date: '2025-04-28', description: 'Interest Payment', debit: '', credit: formatNumber(15.50), balance: formatNumber(account.balance + 3708.75) },
    { id: 'txn5', date: '2025-04-25', description: 'Initial Account Funding', debit: '', credit: formatNumber(account.balance + 3693.25 - (account.balance > 10000 ? 10000 : account.balance/2) ), balance: formatNumber(account.balance + 3693.25 - (account.balance > 10000 ? 10000 : account.balance/2))},
  ].slice(0, 5);

  const clientContact = {
    name: account.clientName?.replace('Client', '').trim() || 'Valued Client',
    email: `${account.clientName?.toLowerCase().replace('client', '').replace(/\s+/g, '.').trim() || 'client'}@examplecorp.com`,
    phone: `+1-555-${Math.floor(1000 + Math.random() * 9000)}`
  };
  
  const accountOpeningDate = new Date(Date.now() - Math.floor(Math.random() * 12) * 30 * 24 * 60 * 60 * 1000).toLocaleDateString();

  const handleGenerateStatement = () => {
    setIsStatementModalOpen(true);
  };

  const handleCloseStatementModal = () => {
    setIsStatementModalOpen(false);
  };

  const handleNicknameEditToggle = () => {
    if (isEditingNickname) {
      // If currently editing, try to save
      if (editableNickname.trim() === '') {
        alert("Nickname cannot be empty.");
        setEditableNickname(account.label); // Reset to original if save fails due to empty
      } else {
        onUpdateNickname(account.id, editableNickname);
      }
    } else {
      // If not editing, set current label to editable field
      setEditableNickname(account.label);
    }
    setIsEditingNickname(!isEditingNickname);
  };


  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 transition-opacity duration-300 ease-in-out">
        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-800">
              Account Details
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

          <div className="space-y-6">
            <section>
              <h3 className="text-lg font-semibold text-gray-700 mb-3">Account Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                <div><strong>Client Name:</strong> {account.clientName}</div>
                <div>
                  <strong>Account Nickname:</strong>
                  {isEditingNickname ? (
                    <input 
                      type="text"
                      value={editableNickname}
                      onChange={(e) => setEditableNickname(e.target.value)}
                      className="ml-2 px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      autoFocus
                    />
                  ) : (
                    <span className="ml-2 text-blue-600">{account.label}</span>
                  )}
                  <button 
                    onClick={handleNicknameEditToggle}
                    className="ml-2 text-xs text-indigo-600 hover:text-indigo-800 underline"
                  >
                    {isEditingNickname ? 'Save' : 'Edit'}
                  </button>
                </div>
                <div><strong>Account ID:</strong> <span className="font-mono">{account.id}</span></div>
                <div><strong>Currency:</strong> {account.symbol}</div>
                <div><strong>Current Balance:</strong> {formatNumber(account.balance)} {account.symbol}</div>
                <div><strong>Account Type:</strong> {account.assetClass}</div>
                <div><strong>Status:</strong> 
                  <span className={`ml-2 px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      account.simulatedStatus === 'Active' ? 'bg-green-100 text-green-800' :
                      account.simulatedStatus === 'Frozen' ? 'bg-yellow-100 text-yellow-800' :
                      account.simulatedStatus === 'Review' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {account.simulatedStatus}
                  </span>
                </div>
                <div><strong>Account Opened:</strong> {accountOpeningDate}</div>
                {account.blockchain !== 'N/A (Client Account)' && <div><strong>Blockchain:</strong> {account.blockchain}</div>}
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-700 mb-3">Client Contact (Dummy)</h3>
              <div className="text-sm space-y-1">
                <p><strong>Contact Person:</strong> {clientContact.name}</p>
                <p><strong>Email:</strong> <a href={`mailto:${clientContact.email}`} className="text-blue-600 hover:underline">{clientContact.email}</a></p>
                <p><strong>Phone:</strong> {clientContact.phone}</p>
              </div>
            </section>

            {/* Internal Banker Notes Section */}
            <section>
              <h3 className="text-lg font-semibold text-gray-700 mb-3">Internal Banker Notes (Simulated)</h3>
              <textarea
                rows="3"
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                placeholder="Enter internal notes here... (not saved in this demo)"
              ></textarea>
            </section>

            {/* Linked Services Section */}
            <section>
              <h3 className="text-lg font-semibold text-gray-700 mb-3">Linked Services (Simulated)</h3>
              <div className="space-y-2 text-sm">
                {dummyLinkedServices.map(service => (
                  <div key={service.id} className="flex items-center">
                    <input
                      id={service.id}
                      name={service.id}
                      type="checkbox"
                      className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-not-allowed"
                      checked={service.enabled}
                      readOnly 
                      disabled
                    />
                    <label htmlFor={service.id} className="ml-2 block text-gray-700 cursor-not-allowed">
                      {service.name}
                    </label>
                  </div>
                ))}
              </div>
            </section>


            <section>
              <h3 className="text-lg font-semibold text-gray-700 mb-3">Recent Transactions (Dummy)</h3>
              <div className="overflow-x-auto border border-gray-200 rounded-md max-h-60">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      <th className="px-4 py-2 text-right font-medium text-gray-500 uppercase tracking-wider">Debit</th>
                      <th className="px-4 py-2 text-right font-medium text-gray-500 uppercase tracking-wider">Credit</th>
                      <th className="px-4 py-2 text-right font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {dummyTransactions.map(tx => (
                      <tr key={tx.id}>
                        <td className="px-4 py-2 whitespace-nowrap">{tx.date}</td>
                        <td className="px-4 py-2 whitespace-nowrap">{tx.description}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-right text-red-600">{tx.debit}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-right text-green-600">{tx.credit}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-right">{tx.balance}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {dummyTransactions.length === 0 && <p className="text-gray-500 italic mt-2">No recent transactions to display.</p>}
            </section>
            
            <section>
              <h3 className="text-lg font-semibold text-gray-700 mb-3">Account Actions</h3>
              <div className="flex flex-wrap gap-3">
                <button 
                  onClick={handleGenerateStatement}
                  className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                >
                  Generate Statement
                </button>
                <button 
                  onClick={() => onToggleHold(account.id)}
                  className={`px-4 py-2 text-white text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50
                    ${account.simulatedStatus === 'Frozen' 
                      ? 'bg-green-500 hover:bg-green-600 focus:ring-green-500' 
                      : 'bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-500'}`}
                >
                  {account.simulatedStatus === 'Frozen' ? 'Remove Hold' : 'Place Hold'}
                </button>
                <button 
                  onClick={() => onToggleFlag(account.id)}
                  className={`px-4 py-2 text-white text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50
                    ${account.simulatedStatus === 'Review' 
                      ? 'bg-green-500 hover:bg-green-600 focus:ring-green-500' 
                      : 'bg-red-500 hover:bg-red-600 focus:ring-red-500'}`}
                >
                  {account.simulatedStatus === 'Review' ? 'Clear Flag' : 'Flag for Review'}
                </button>
              </div>
            </section>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      <StatementModal
        isOpen={isStatementModalOpen}
        onClose={handleCloseStatementModal}
        account={account}
        transactions={dummyTransactions}
      />
    </>
  );
};

export default ClientAccountDetailModal;
