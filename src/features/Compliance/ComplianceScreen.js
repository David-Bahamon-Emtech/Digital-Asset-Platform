import React from 'react';

// Simple placeholder icons (using the same one for now)
const Icon = ({ className = "w-6 h-6 mr-2 text-blue-600" }) => (
  // Using a shield icon as a placeholder for compliance theme
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
  </svg>
);


const ComplianceScreen = () => {
  return (
    // Removed specific background, relies on Layout's background
    <div className="p-8 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Compliance Center</h1>

      <p className="text-lg text-gray-600 mb-8">
        Oversee regulatory adherence, transaction monitoring, risk management, and reporting activities within the platform.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* Card for Transaction Monitoring */}
        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
          <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
            <Icon className="w-6 h-6 mr-2 text-cyan-600" /> {/* Different color */}
            Transaction Monitoring
          </h2>
          <p className="text-gray-700">
            Configure and oversee real-time monitoring of transactions. Set up rules to flag suspicious activity based on size, velocity, origin/destination, and patterns.
          </p>
        </div>

        {/* Card for KYC/AML Processes */}
        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
          <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
            <Icon className="w-6 h-6 mr-2 text-purple-600" /> {/* Different color */}
            KYC/AML Processes
          </h2>
          <p className="text-gray-700">
            Manage and review Know Your Customer (KYC) and Anti-Money Laundering (AML) status for participants. Oversee onboarding and manage entity risk profiles.
          </p>
        </div>

        {/* Card for Risk Management */}
        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
          <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
            <Icon className="w-6 h-6 mr-2 text-orange-600" /> {/* Different color */}
            Risk Management
          </h2>
          <p className="text-gray-700">
            Access tools for configuring and assessing risk parameters, including transaction limits and counterparty risk evaluation based on compliance data.
          </p>
        </div>

        {/* Card for Regulatory Reporting */}
        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
          <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
            <Icon className="w-6 h-6 mr-2 text-green-600" /> {/* Different color */}
            Regulatory Reporting
          </h2>
          <p className="text-gray-700">
            Generate necessary reports (e.g., SARs, large transaction reports) for regulatory submissions and internal audits, customizable by jurisdiction.
          </p>
        </div>

        {/* Card for Alerts & Case Management */}
        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
          <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
            <Icon className="w-6 h-6 mr-2 text-yellow-600" /> {/* Different color */}
            Alerts & Case Management
          </h2>
          <p className="text-gray-700">
            Review system-generated alerts and utilize case management tools to track investigations, document findings, and resolve compliance events.
          </p>
           <ul className="list-disc ml-6 mt-2 text-sm text-gray-500">
            <li>View pending alerts</li>
            <li>Manage investigation workflow</li>
          </ul>
        </div>

        {/* Card for Sanctions Screening */}
        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
          <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
            <Icon className="w-6 h-6 mr-2 text-red-600" /> {/* Different color */}
            Sanctions Screening
          </h2>
          <p className="text-gray-700">
            Implement and manage the screening of transactions and involved parties against global sanctions lists (e.g., OFAC, UN, EU) to prevent prohibited activities.
          </p>
           <ul className="list-disc ml-6 mt-2 text-sm text-gray-500">
            <li>Configure screening lists</li>
            <li>Review potential matches</li>
          </ul>
        </div>

      </div>
    </div>
  );
};

export default ComplianceScreen;