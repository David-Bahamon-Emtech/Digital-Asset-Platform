import React from 'react';
import Sidebar from '../Sidebar/Sidebar.jsx'; // Corrected Path

const Layout = ({ activeTab, setActiveTab, children }) => {
  return (
    <div className="flex h-screen bg-slate-300">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 overflow-auto ml-64"> 
        {children}
      </div>
    </div>
  );
};

export default Layout;