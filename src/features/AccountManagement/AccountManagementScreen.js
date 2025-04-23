import React from 'react';

// Simple placeholder icons (replace with actual icons if available)
const Icon = ({ className = "w-6 h-6 mr-2 text-blue-600" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> // Example Clock Icon
);


const AccountManagementScreen = () => {
  return (
    // Removed bg-gray-100, relies on Layout's background now
    <div className="p-8 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Account Management</h1>

      <p className="text-lg text-gray-600 mb-8">
        Manage user access, roles, security settings, API keys, and third-party integrations for the platform.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card for User & Profile Management */}
        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
          <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
            <Icon /> {/* Replace with relevant icon */}
            User & Profile Management
          </h2>
          <p className="text-gray-700">
            View, add, edit, and deactivate user accounts. Manage user profile information, contact details, and status to keep records accurate.
          </p>
        </div>

        {/* Card for RBAC */}
        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
          <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
             <Icon className="w-6 h-6 mr-2 text-purple-600" /> {/* Replace with relevant icon */}
            Role-Based Access Control (RBAC)
          </h2>
          <p className="text-gray-700">
            Define and assign specific roles (e.g., Admin, Trader, Viewer) with predefined permissions to ensure proper access levels and segregation of duties.
          </p>
        </div>

        {/* Card for API Key Management */}
        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
          <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
             <Icon className="w-6 h-6 mr-2 text-green-600" /> {/* Replace with relevant icon */}
            API Key Management
          </h2>
          <p className="text-gray-700">
            Generate, manage, and revoke API keys for secure programmatic access. Assign specific permission scopes to keys for integrations and automation.
          </p>
        </div>

        {/* Card for Security Settings */}
        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
          <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
             <Icon className="w-6 h-6 mr-2 text-red-600" /> {/* Replace with relevant icon */}
            Security Settings
          </h2>
          <p className="text-gray-700">
            Configure platform-wide and user-specific security policies like Multi-Factor Authentication (MFA), password complexity, and session timeouts.
          </p>
        </div>

        {/* Card for Audit Logs */}
        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
          <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
             <Icon className="w-6 h-6 mr-2 text-yellow-600" /> {/* Replace with relevant icon */}
            Audit Logs
          </h2>
          <p className="text-gray-700">
            Access detailed logs tracking significant user actions within the platform for security monitoring, accountability, and investigation purposes.
          </p>
           <ul className="list-disc ml-6 mt-2 text-sm text-gray-500">
            <li>Filter logs by user, action, date</li>
            <li>Export audit trail</li>
          </ul>
        </div>

         {/* Card for 3rd Party Account Management */}
        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
          <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
             <Icon className="w-6 h-6 mr-2 text-indigo-600" /> {/* Replace with relevant icon */}
            3rd Party Account Management
          </h2>
          <p className="text-gray-700">
            Manage access and permissions for external applications, partners, or service providers interacting with the platform via APIs or dedicated interfaces.
          </p>
           <ul className="list-disc ml-6 mt-2 text-sm text-gray-500">
            <li>Register external applications</li>
            <li>Define access scopes for partners</li>
            <li>Monitor third-party activity</li>
          </ul>
        </div>

      </div>
    </div>
  );
};

export default AccountManagementScreen;