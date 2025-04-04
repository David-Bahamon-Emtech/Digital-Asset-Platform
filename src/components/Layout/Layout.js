import React from 'react';
import Sidebar from '../Sidebar/Sidebar';

// Layout receives activeTab and setActiveTab to pass down to Sidebar
// It also receives 'children', which will be the main content for the selected tab
const Layout = ({ activeTab, setActiveTab, children }) => {
  return (
    <div className="flex h-screen bg-slate-300">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      {/* Main Content Area - Offset by sidebar width */}
      <div className="flex-1 overflow-auto ml-64"> {/* Added ml-64 for sidebar offset */}
        {/* The actual content for the active tab will be rendered here */}
        {children}
      </div>
    </div>
  );
};

export default Layout;