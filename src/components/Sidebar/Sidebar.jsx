import React from 'react';
import EmtechLogo from '../Logo/EmtechLogo.jsx'; // Import the image logo component

// Sidebar navigation items with icons
const sidebarItems = [
  { id: 'token-mgmt', label: 'Token Management', icon: '/Logos/token_management.png' },
  { id: 'account-mgmt', label: 'Account Management', icon: '/Logos/account_management.png' },
  { id: 'payments', label: 'Payments', icon: '/Logos/payments.png' },
  { id: 'custody', label: 'Custody', icon: '/Logos/custody.png' },
  { id: 'treasury', label: 'Treasury', icon: '/Logos/treasury.png' },
  { id: 'compliance', label: 'Compliance', icon: '/Logos/compliance.png' }
];

// The Sidebar component
// Gets activeTab and setActiveTab func from parent (Layout -> App)
const Sidebar = ({ activeTab, setActiveTab }) => {

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
  };

  // Define the logo URL (make sure this path is correct for your image)
  const currentLogoUrl = '/Logos/EMTECH_logo.png';

  return (
    // Use flex column and h-full to enable pushing footer down
    <div className="w-64 bg-sidebar-bg text-sidebar-text h-screen fixed top-0 left-0 flex flex-col">

      {/* Logo Area with top padding */}
      <div className="pt-6 px-4"> {/* CHANGED: Added top and horizontal padding */}
        {/* Container for the logo itself */}
        <div className="mb-10 p-2 rounded">
          <EmtechLogo logoUrl={currentLogoUrl} altText="Dashboard Logo" />
        </div>
      </div>

      {/* Navigation Items Area */}
      {/* Negative top margin pulls this section up */}
      <nav className="flex-grow px-4 -mt-11">
        {/* Top border */}
         <div className="border-b border-gray-600 pb-2"></div>

        {/* Map navigation items */}
        {sidebarItems.map(item => (
          <div
            key={item.id}
            className={`flex items-center py-2 px-4 -mx-4 mt-1 mb-1 cursor-pointer rounded ${ // Added flex and items-center
              activeTab === item.id
                ? 'bg-sidebar-highlight-bg text-sidebar-highlight-text font-semibold'
                : 'hover:bg-sidebar-highlight-bg hover:text-sidebar-highlight-text'
            }`}
            onClick={() => handleTabClick(item.id)}
          >
            {/* Icon */}
            <img
              src={item.icon} // Use the icon path from our array
              alt="" // Alt text is empty as the label provides context
              className="w-7 h-7 mr-3" // Adjust w-5 h-5 (size) and mr-3 (spacing) as needed
            />
            {/* Label */}
            <span>{item.label}</span>
          </div>
        ))}
         {/* Bottom border */}
         <div className="border-b border-gray-600 pt-2 mt-2"></div>
      </nav>

      {/* Footer Area (pushed to bottom by flex-grow on nav and mt-auto here) */}
      <div className="p-4 mt-auto text-center text-xs">
         Powered by{' '}
         <span className="font-bold">
             E<span style={{ color: 'var(--emtech-gold)' }}>M</span>TECH
         </span>
      </div>
    </div>
  );
};

export default Sidebar;