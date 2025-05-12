// src/features/AccountManagement/ClientAccountManagementView.js
import React, { useState, useEffect, useMemo } from 'react';
// import { generateDummyClientAccounts } from '../../utils/dummyData'; // No longer needed
import ClientAccountListTable from './ClientAccountListTable';
import ClientAccountDetailModal from './ClientAccountDetailModal';

// Accept initialClientAccounts and dispatchAssets as props
const ClientAccountManagementView = ({ onBack, initialClientAccounts, dispatchAssets }) => { 
  // Local state 'clientAccountsForDisplay' now primarily reflects the prop for display and local filtering/sorting.
  const [clientAccountsForDisplay, setClientAccountsForDisplay] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [sortConfig, setSortConfig] = useState({ key: 'clientName', direction: 'ascending' });
  const [filterAccountType, setFilterAccountType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterCurrency, setFilterCurrency] = useState('All');
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedAccountForDetail, setSelectedAccountForDetail] = useState(null);

  const [uniqueAccountTypes, setUniqueAccountTypes] = useState(['All']);
  const [uniqueStatuses, setUniqueStatuses] = useState(['All']);
  const [uniqueCurrencies, setUniqueCurrencies] = useState(['All']);

  useEffect(() => {
    // Use the passed initialClientAccounts prop (sourced from AssetsContext)
    if (initialClientAccounts) { 
      setClientAccountsForDisplay(initialClientAccounts); 

      const types = ['All', ...new Set(initialClientAccounts.map(acc => acc.assetClass).filter(Boolean))];
      const statusesFromData = ['All', ...new Set(initialClientAccounts.map(acc => acc.simulatedStatus).filter(Boolean))];
      const currencies = ['All', ...new Set(initialClientAccounts.map(acc => acc.symbol).filter(Boolean))];
      
      const baseStatuses = ['Active', 'Frozen', 'Review']; 
      for (const status of baseStatuses) {
          if (!statusesFromData.includes(status)) {
              statusesFromData.push(status);
          }
      }
      
      setUniqueAccountTypes(types.sort((a,b) => a === 'All' ? -1 : b === 'All' ? 1 : a.localeCompare(b)));
      setUniqueStatuses(statusesFromData.filter((value, index, self) => self.indexOf(value) === index).sort((a,b) => a === 'All' ? -1 : b === 'All' ? 1 : a.localeCompare(b)));
      setUniqueCurrencies(currencies.sort((a,b) => a === 'All' ? -1 : b === 'All' ? 1 : a.localeCompare(b)));
      
      setIsLoading(false);
      console.log('ClientAccountManagementView: Received initialClientAccounts from props:', initialClientAccounts.length);
    } else {
      setIsLoading(false);
      setClientAccountsForDisplay([]); // Ensure it's an empty array if prop is null/undefined
      console.warn('ClientAccountManagementView: initialClientAccounts prop was not provided or empty.');
    }
  }, [initialClientAccounts]); // Re-run if initialClientAccounts prop changes

  // This useEffect ensures that if the modal is open and the underlying account data
  // (from initialClientAccounts/AssetsContext) changes, the modal reflects those changes.
  useEffect(() => {
    if (selectedAccountForDetail && initialClientAccounts) {
      const updatedSelectedAccount = initialClientAccounts.find(acc => acc.id === selectedAccountForDetail.id);
      if (updatedSelectedAccount) {
        // Only update if there's a meaningful difference to avoid potential infinite loops
        // This simple check might need to be more robust depending on how frequent updates are
        if (JSON.stringify(updatedSelectedAccount) !== JSON.stringify(selectedAccountForDetail)) {
            setSelectedAccountForDetail(updatedSelectedAccount);
        }
      } else {
        // Account might have been removed or ID changed, close modal
        setIsDetailModalOpen(false);
        setSelectedAccountForDetail(null);
      }
    }
  }, [initialClientAccounts, selectedAccountForDetail]); // Added selectedAccountForDetail to dependencies


  const processedClientAccounts = useMemo(() => {
    let filteredItems = [...clientAccountsForDisplay]; 
    if (filterAccountType !== 'All') {
      filteredItems = filteredItems.filter(item => item.assetClass === filterAccountType);
    }
    if (filterStatus !== 'All') {
      filteredItems = filteredItems.filter(item => item.simulatedStatus === filterStatus);
    }
    if (filterCurrency !== 'All') {
      filteredItems = filteredItems.filter(item => item.symbol === filterCurrency);
    }

    if (sortConfig.key !== null) {
      filteredItems.sort((a, b) => {
        const valA = a[sortConfig.key] || ''; 
        const valB = b[sortConfig.key] || '';
        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortConfig.direction === 'ascending' ? valA - valB : valB - valA;
        }
        if (valA < valB) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (valA > valB) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return filteredItems;
  }, [clientAccountsForDisplay, sortConfig, filterAccountType, filterStatus, filterCurrency]);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const handleViewAccountDetails = (account) => {
    setSelectedAccountForDetail(account);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedAccountForDetail(null);
  };

  // Use dispatchAssets to update global state
  const handleToggleAccountHold = (accountId) => {
    const account = clientAccountsForDisplay.find(acc => acc.id === accountId); // Find from local display copy
    if (account && dispatchAssets) {
      const newStatus = account.simulatedStatus === 'Frozen' ? 'Active' : 'Frozen';
      dispatchAssets({
        type: 'UPDATE_ASSET_PROPERTY',
        payload: { assetId: accountId, propertyName: 'simulatedStatus', propertyValue: newStatus }
      });
      // The useEffect above will handle updating selectedAccountForDetail if it's this account
    } else {
        console.error("Cannot toggle hold: account not found or dispatchAssets not provided.", accountId);
    }
  };

  const handleToggleAccountFlag = (accountId) => {
    const account = clientAccountsForDisplay.find(acc => acc.id === accountId);
    if (account && dispatchAssets) {
      const newStatus = account.simulatedStatus === 'Review' ? 'Active' : 'Review';
      dispatchAssets({
        type: 'UPDATE_ASSET_PROPERTY',
        payload: { assetId: accountId, propertyName: 'simulatedStatus', propertyValue: newStatus }
      });
    } else {
        console.error("Cannot toggle flag: account not found or dispatchAssets not provided.", accountId);
    }
  };

  const handleUpdateAccountNickname = (accountId, newNickname) => {
    if (dispatchAssets) {
      dispatchAssets({
        type: 'UPDATE_ASSET_PROPERTY',
        payload: { assetId: accountId, propertyName: 'label', propertyValue: newNickname }
      });
      // If clientName is also stored in AssetsContext and needs update, dispatch another action.
      // For now, assuming clientName is derived or 'label' update is sufficient for display.
      // Example: if clientName needs separate update:
      // const newClientName = newNickname.split(' ')[0] + ' Client ' + newNickname.split(' ')[2]?.slice(0,4) || `Client ${accountId.slice(-4)}`;
      // dispatchAssets({
      //   type: 'UPDATE_ASSET_PROPERTY',
      //   payload: { assetId: accountId, propertyName: 'clientName', propertyValue: newClientName }
      // });
    } else {
        console.error("Cannot update nickname: dispatchAssets not provided.", accountId);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6 border-b pb-3">
        <h2 className="text-2xl font-bold text-gray-800">Client Account Management</h2>
        <button
          onClick={onBack}
          className="px-3 py-1 rounded text-white hover:opacity-90 bg-gray-700 text-sm"
        >
          &larr; Back to Account Management Options
        </button>
      </div>

      {isLoading ? (
        <p className="text-gray-600 text-center py-10">Loading client accounts...</p>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Client Accounts Overview</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label htmlFor="filterCurrency" className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Currency
              </label>
              <select
                id="filterCurrency"
                name="filterCurrency"
                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={filterCurrency}
                onChange={(e) => setFilterCurrency(e.target.value)}
              >
                {uniqueCurrencies.map(currency => (
                  <option key={currency} value={currency}>{currency}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="filterAccountType" className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Account Type
              </label>
              <select
                id="filterAccountType"
                name="filterAccountType"
                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={filterAccountType}
                onChange={(e) => setFilterAccountType(e.target.value)}
              >
                {uniqueAccountTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="filterStatus" className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Status
              </label>
              <select
                id="filterStatus"
                name="filterStatus"
                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                {uniqueStatuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>
          
          {processedClientAccounts.length > 0 ? (
            <ClientAccountListTable 
              clientAccounts={processedClientAccounts} 
              onViewDetails={handleViewAccountDetails}
              requestSort={requestSort}
              sortConfig={sortConfig}
            />
          ) : (
            <p className="text-gray-500 py-4 text-center">No accounts match your filter criteria.</p>
          )}
        </div>
      )}

      <ClientAccountDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        account={selectedAccountForDetail} 
        onToggleHold={handleToggleAccountHold} 
        onToggleFlag={handleToggleAccountFlag} 
        onUpdateNickname={handleUpdateAccountNickname}
      />
    </div>
  );
};

export default ClientAccountManagementView;
