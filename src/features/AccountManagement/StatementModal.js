// src/features/AccountManagement/StatementModal.js
import React from 'react';
import { formatNumber } from '../../utils/displayUtils'; // Assuming you have this utility

const StatementModal = ({ isOpen, onClose, account, transactions }) => {
  if (!isOpen || !account) {
    return null;
  }

  // For a dummy statement, let's define a period
  const statementPeriodEnd = new Date();
  const statementPeriodStart = new Date(statementPeriodEnd);
  statementPeriodStart.setDate(statementPeriodEnd.getDate() - 30); // Last 30 days

  // Dummy opening/closing balances for the statement
  // This is highly simplified for the demo.
  let openingBalance = account.balance;
  transactions.forEach(tx => {
    if (tx.debit) openingBalance += parseFloat(String(tx.debit).replace(/,/g, ''));
    if (tx.credit) openingBalance -= parseFloat(String(tx.credit).replace(/,/g, ''));
  });
  openingBalance = Math.max(0, openingBalance); // Ensure it's not negative for simplicity

  const closingBalance = account.balance;


  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60] p-4 transition-opacity duration-300 ease-in-out"> {/* Higher z-index */}
      <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-300">
          <div className="flex items-center">
            {/* Placeholder for a bank logo */}
            {/* <img src="/path-to-your-bank-logo.png" alt="Bank Logo" className="h-8 w-auto mr-3" /> */}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-blue-600 mr-2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75Z" />
            </svg>
            <h2 className="text-xl font-semibold text-gray-800">Account Statement</h2>
          </div>
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

        {/* Statement Body */}
        <div className="space-y-5 text-sm">
          {/* Client and Account Information */}
          <section className="p-4 border border-gray-200 rounded-md">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
              <div>
                <p className="font-medium text-gray-600">Client Name:</p>
                <p className="text-gray-800">{account.clientName}</p>
              </div>
              <div>
                <p className="font-medium text-gray-600">Account Nickname:</p>
                <p className="text-gray-800">{account.label}</p>
              </div>
              <div>
                <p className="font-medium text-gray-600">Account ID:</p>
                <p className="text-gray-800 font-mono">{account.id}</p>
              </div>
              <div>
                <p className="font-medium text-gray-600">Currency:</p>
                <p className="text-gray-800">{account.symbol}</p>
              </div>
            </div>
          </section>

          {/* Statement Period and Summary */}
          <section className="p-4 bg-gray-50 rounded-md">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-2">
                <div>
                    <p className="font-medium text-gray-600">Statement Period:</p>
                    <p className="text-gray-800">
                        {statementPeriodStart.toLocaleDateString()} - {statementPeriodEnd.toLocaleDateString()}
                    </p>
                </div>
                <div>
                    <p className="font-medium text-gray-600">Opening Balance:</p>
                    <p className="text-gray-800">{formatNumber(openingBalance)} {account.symbol}</p>
                </div>
                <div>
                    <p className="font-medium text-gray-600">Closing Balance:</p>
                    <p className="text-gray-800 font-semibold">{formatNumber(closingBalance)} {account.symbol}</p>
                </div>
            </div>
          </section>

          {/* Transactions Table */}
          <section>
            <h3 className="text-md font-semibold text-gray-700 mb-2">Transaction Details</h3>
            <div className="overflow-x-auto border border-gray-200 rounded-md max-h-60"> {/* Added max-h-60 for scroll */}
              <table className="min-w-full divide-y divide-gray-200 text-xs">
                <thead className="bg-gray-100 sticky top-0"> {/* Sticky header */}
                  <tr>
                    <th className="px-3 py-2 text-left font-medium text-gray-600 uppercase tracking-wider">Date</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-600 uppercase tracking-wider">Description</th>
                    <th className="px-3 py-2 text-right font-medium text-gray-600 uppercase tracking-wider">Debit</th>
                    <th className="px-3 py-2 text-right font-medium text-gray-600 uppercase tracking-wider">Credit</th>
                    <th className="px-3 py-2 text-right font-medium text-gray-600 uppercase tracking-wider">Balance</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions && transactions.length > 0 ? (
                    transactions.map(tx => (
                      <tr key={tx.id}>
                        <td className="px-3 py-2 whitespace-nowrap">{tx.date}</td>
                        <td className="px-3 py-2 whitespace-nowrap">{tx.description}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-right text-red-600">{tx.debit}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-right text-green-600">{tx.credit}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-right">{tx.balance}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-3 py-4 text-center text-gray-500 italic">
                        No transactions for this period.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Disclaimer */}
          <section className="mt-4 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-500 italic text-center">
              This is a simulated statement for demonstration purposes only.
            </p>
          </section>
        </div>

        {/* Modal Footer */}
        <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end space-x-2">
           <button
            onClick={() => window.print()} // Basic print functionality
            className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Print
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatementModal;
