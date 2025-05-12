// src/features/AccountManagement/InternalAccountManagementView.js
import React, { useState } from 'react';
import UserList from './UserList'; // Make sure this path is correct
import EditUserModal from './EditUserModal'; // Make sure this path is correct
import { dummyInternalUsers } from '../../data/initialData'; // Make sure this path is correct

// Import Sub-View Components
import MultiSigConfigurationView from './MultiSigConfigurationView'; // Make sure this path is correct
import MultiSigSigningView from './MultiSigSigningView'; // Make sure this path is correct
import ApiKeyManagementView from './ApiKeyManagementView'; // Make sure this path is correct
import SecuritySettingsView from './SecuritySettingsView'; // Make sure this path is correct

const InternalAccountManagementView = ({ onBack }) => {
  // State for User List and Modal
  const [users, setUsers] = useState(dummyInternalUsers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // State for Current Sub-View
  const [activeInternalView, setActiveInternalView] = useState('userManagement'); // Default view

  // UserList and Modal handlers
  const handleInviteUser = () => {
    setCurrentUser(null);
    setIsModalOpen(true);
  };

  const handleEditUser = (userToEdit) => {
    setCurrentUser(userToEdit);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentUser(null);
  };

  const handleSaveUser = (formData) => {
    if (currentUser && currentUser.id) {
      setUsers(users.map(u => (u.id === currentUser.id ? { ...u, ...formData, id: currentUser.id } : u)));
    } else {
      const newUser = { ...formData, id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` };
      setUsers([...users, newUser]);
    }
    handleCloseModal();
  };

  // Conditional Rendering of Sub-Views
  const renderActiveView = () => {
    switch (activeInternalView) {
      case 'userManagement':
        return <UserList users={users} onInviteUser={handleInviteUser} onEditUser={handleEditUser} />;
      case 'multiSigConfig':
        return <MultiSigConfigurationView onBack={() => setActiveInternalView('userManagement')} />;
      case 'multiSigSigning':
        return <MultiSigSigningView onBack={() => setActiveInternalView('userManagement')} />;
      case 'apiKeys':
        return <ApiKeyManagementView onBack={() => setActiveInternalView('userManagement')} />;
      case 'securitySettings':
        return <SecuritySettingsView onBack={() => setActiveInternalView('userManagement')} />;
      default:
        return <UserList users={users} onInviteUser={handleInviteUser} onEditUser={handleEditUser} />;
    }
  };

  // Common button classes for navigation
  const navButtonBaseClasses = "px-4 py-2 rounded-md text-sm font-medium transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50";
  const activeNavButtonClasses = "bg-blue-600 text-white shadow-md";
  const inactiveNavButtonClasses = "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300";


  return (
    // Main container for this view. p-0 assumes parent provides overall page padding.
    <div className="p-0">
      {/* Header section: Title and Back Button */}
      <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-3">
        <h2 className="text-2xl font-bold text-gray-800">Internal Account Management</h2>
        <button
          onClick={onBack}
          className="px-3 py-1 rounded text-white hover:opacity-90 bg-gray-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          &larr; Back to Account Management Options
        </button>
      </div>

      {/* Navigation UI for internal sections */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setActiveInternalView('userManagement')}
          className={`${navButtonBaseClasses} ${activeInternalView === 'userManagement' ? activeNavButtonClasses : inactiveNavButtonClasses}`}
        >
          User Management
        </button>
        <button
          onClick={() => setActiveInternalView('multiSigConfig')}
          className={`${navButtonBaseClasses} ${activeInternalView === 'multiSigConfig' ? activeNavButtonClasses : inactiveNavButtonClasses}`}
        >
          Multi-Sig Config
        </button>
        <button
          onClick={() => setActiveInternalView('multiSigSigning')}
          className={`${navButtonBaseClasses} ${activeInternalView === 'multiSigSigning' ? activeNavButtonClasses : inactiveNavButtonClasses}`}
        >
          Multi-Sig Signing
        </button>
        <button
          onClick={() => setActiveInternalView('apiKeys')}
          className={`${navButtonBaseClasses} ${activeInternalView === 'apiKeys' ? activeNavButtonClasses : inactiveNavButtonClasses}`}
        >
          API Keys
        </button>
        <button
          onClick={() => setActiveInternalView('securitySettings')}
          className={`${navButtonBaseClasses} ${activeInternalView === 'securitySettings' ? activeNavButtonClasses : inactiveNavButtonClasses}`}
        >
          Security Settings
        </button>
      </div>

      {/* Container for the currently active sub-view's content */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        {renderActiveView()}
      </div>

      {/* Modal for editing/inviting users (conditionally rendered) */}
      {isModalOpen && (
        <EditUserModal
          isOpen={isModalOpen}
          user={currentUser}
          onClose={handleCloseModal}
          onSave={handleSaveUser}
        />
      )}
    </div>
  );
};

export default InternalAccountManagementView;
