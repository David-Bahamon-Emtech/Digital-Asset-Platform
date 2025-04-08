// src/features/Payments/ViewTemplatesScreen.js
import React, { useState, useMemo } from 'react';

// --- Simulated Data for Templates ---
const dummyTemplates = [
  { id: 'tpl1', name: 'HSBC London Monthly Settlement', type: 'Tokenized', recipient: 'HSBC London', fromAccount: 'USDC Treasury Wallet', amount: '2,500,000 USDC', purpose: 'Interbank Settlement', lastUsed: 'Mar 3, 2025' },
  { id: 'tpl2', name: 'JPM Reserve Account Funding', type: 'Tokenized', recipient: 'JPMorgan Chase', fromAccount: 'USDC Treasury Wallet', amount: 'Variable', purpose: 'Treasury Operation', lastUsed: 'Feb 28, 2025' },
  { id: 'tpl3', name: 'Deutsche Bank EUR Transfer', type: 'SWIFT', recipient: 'Deutsche Bank', fromAccount: 'USD Primary Account', amount: '€1,800,000', purpose: 'Corporate Payment', lastUsed: 'Feb 20, 2025' },
  { id: 'tpl4', name: 'Citi Singapore Internal Transfer', type: 'Internal', recipient: 'Citi Singapore', fromAccount: 'USDC Treasury Wallet', amount: 'Variable', purpose: 'Liquidity Management', lastUsed: 'Mar 4, 2025' },
  { id: 'tpl5', name: 'ICICI Mumbai INR Transfer', type: 'Tokenized', recipient: 'ICICI Mumbai', fromAccount: 'eRupee Wallet', amount: '₹75,000,000', purpose: 'Corporate Payment', lastUsed: 'Feb 15, 2025' },
  { id: 'tpl6', name: 'Supplier Payment - ACME Corp', type: 'Tokenized', recipient: 'ACME Corporation', fromAccount: 'USD Primary Account', amount: '$150,000', purpose: 'Corporate Payment', lastUsed: 'Mar 1, 2025' },
  // Add more dummy templates if needed
];

// --- Component ---
const ViewTemplatesScreen = ({ onBack /* Add props like onUseTemplate, onCreateTemplate later */ }) => {

  // --- State ---
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [recipientFilter, setRecipientFilter] = useState('All Recipients');
  // Add pagination state later if needed
  // const [currentPage, setCurrentPage] = useState(1);
  // const itemsPerPage = 6;

  // --- Filtering Logic ---
  const filteredTemplates = useMemo(() => {
    return dummyTemplates.filter(template => {
      const searchTermLower = searchTerm.toLowerCase();
      const matchesSearch = searchTermLower === '' ||
                            template.name.toLowerCase().includes(searchTermLower) ||
                            template.recipient.toLowerCase().includes(searchTermLower) ||
                            template.purpose.toLowerCase().includes(searchTermLower);

      const matchesType = typeFilter === 'All Types' || template.type === typeFilter;

      const matchesRecipient = recipientFilter === 'All Recipients' || template.recipient === recipientFilter;

      return matchesSearch && matchesType && matchesRecipient;
    });
  }, [searchTerm, typeFilter, recipientFilter]);

  // Placeholder handlers for actions
  const handleUseTemplate = (templateId) => console.log('Use Template clicked:', templateId);
  const handleEditTemplate = (templateId) => console.log('Edit Template clicked:', templateId);
  const handleDeleteTemplate = (templateId) => console.log('Delete Template clicked:', templateId);
  const handleCreateTemplate = () => console.log('Create New Template clicked');
  const handlePageChange = (page) => console.log('Change page to:', page);


  // --- Render Logic ---
  return (
    <div className="bg-white p-6 rounded shadow max-w-6xl mx-auto"> {/* Increased max-width */}
      {/* Header */}
      <div className="flex justify-between items-center mb-6 border-b pb-3">
        <h1 className="text-2xl font-bold text-gray-800">Payment Templates</h1>
        <button
          className="px-3 py-1 rounded text-white hover:opacity-90 bg-gray-800 text-sm"
          onClick={onBack} // Use the onBack prop
        >
          Back to Dashboard
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-wrap sm:flex-nowrap space-y-3 sm:space-y-0 sm:space-x-4 mb-6">
        <div className="flex-grow w-full sm:w-auto">
          <div className="relative">
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2 border rounded text-sm"
              placeholder="Search templates by name, recipient, or purpose"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)} // Controlled input
            />
            <div className="absolute left-3 top-2.5 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
          </div>
        </div>
        {/* Type Filter Dropdown */}
        <select
          className="p-2 border rounded w-full sm:w-40 text-sm bg-white"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)} // Controlled input
        >
          <option>All Types</option>
          <option>Tokenized</option>
          <option>SWIFT</option>
          <option>Internal</option>
        </select>
        {/* Recipient Filter Dropdown (Dynamic options from unique recipients) */}
        <select
          className="p-2 border rounded w-full sm:w-48 text-sm bg-white"
          value={recipientFilter}
          onChange={(e) => setRecipientFilter(e.target.value)} // Controlled input
        >
          <option>All Recipients</option>
          {[...new Set(dummyTemplates.map(t => t.recipient))].sort().map(recipient => (
             <option key={recipient} value={recipient}>{recipient}</option>
          ))}
        </select>
        <button
          className="px-4 py-2 rounded text-white hover:opacity-90 bg-emtech-gold text-sm w-full sm:w-auto flex-shrink-0" // Consistent button color
          onClick={handleCreateTemplate}
        >
          Create Template
        </button>
      </div>

      {/* Templates Grid */}
      {filteredTemplates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {/* Map over filtered templates */}
          {filteredTemplates.map((template) => (
            <div key={template.id} className="border border-gray-200 rounded-lg overflow-hidden flex flex-col hover:border-emtech-gold hover:shadow-md transition-all">
              {/* Template Header */}
              <div className="bg-gray-50 p-3 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium text-sm truncate" title={template.name}>{template.name}</h3>
                  <span className={`px-2 py-0.5 text-xs rounded-full ${
                      template.type === 'Tokenized' ? 'bg-blue-100 text-blue-800' :
                      template.type === 'SWIFT' ? 'bg-green-100 text-green-800' :
                      template.type === 'Internal' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                  }`}>{template.type}</span>
                </div>
              </div>
              {/* Template Body */}
              <div className="p-4 flex-grow">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm"><span className="text-gray-600">Recipient:</span> <span className="font-medium truncate">{template.recipient}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-600">From Account:</span> <span className="font-medium truncate">{template.fromAccount}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-600">Amount:</span> <span className="font-medium truncate">{template.amount}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-600">Purpose:</span> <span className="font-medium truncate">{template.purpose}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-600">Last Used:</span> <span>{template.lastUsed}</span></div>
                </div>
              </div>
              {/* Template Footer (Actions) */}
              <div className="mt-auto p-3 pt-3 border-t border-gray-100 bg-gray-50 flex space-x-2">
                <button className="flex-1 px-3 py-1.5 bg-emtech-gold text-white text-sm rounded hover:opacity-90" onClick={() => handleUseTemplate(template.id)}>
                  Use Template
                </button>
                <button className="p-2 border border-gray-200 text-gray-600 text-sm rounded bg-white hover:bg-gray-100" title="Edit" onClick={() => handleEditTemplate(template.id)}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                </button>
                <button className="p-2 border border-gray-200 text-gray-600 text-sm rounded bg-white hover:bg-gray-100" title="Delete" onClick={() => handleDeleteTemplate(template.id)}>
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </div>
          ))}

          {/* New Template Card Placeholder */}
          <button className="border border-dashed border-gray-300 rounded-lg flex items-center justify-center p-8 hover:border-emtech-gold hover:bg-yellow-50 transition-all cursor-pointer min-h-[250px]" onClick={handleCreateTemplate}>
             <div className="text-center">
               <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
               </div>
               <p className="font-medium text-gray-800">Create New Template</p>
               <p className="text-sm text-gray-500 mt-1">Save time on recurring payments</p>
             </div>
           </button>

        </div>
      ) : (
        // Message when no templates match filters
        <div className="text-center py-10 border border-dashed rounded-lg">
            <p className="text-gray-500">No templates found matching your criteria.</p>
            {searchTerm && <p className="text-sm text-gray-400 mt-1">Try adjusting your search term or filters.</p>}
        </div>
      )}


      {/* Pagination (Placeholder) */}
      {filteredTemplates.length > 0 && ( // Only show if there are results
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Showing {filteredTemplates.length} of {dummyTemplates.length} templates {/* Simple count for now */}
            </div>
            <div className="flex space-x-1">
              <button className="px-3 py-1 border border-gray-300 rounded text-gray-600 hover:bg-gray-50 text-sm" onClick={() => handlePageChange('prev')} disabled> Previous </button>
              <button className="px-3 py-1 bg-emtech-gold text-white rounded text-sm" disabled> 1 </button>
              {/* Add more page numbers dynamically later if needed */}
              <button className="px-3 py-1 border border-gray-300 rounded text-gray-600 hover:bg-gray-50 text-sm" onClick={() => handlePageChange('next')} disabled> Next </button>
            </div>
          </div>
      )}
    </div>
  );
};

export default ViewTemplatesScreen;