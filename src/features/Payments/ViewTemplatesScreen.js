// src/features/Payments/ViewTemplatesScreen.js
import React, { useState, useMemo } from 'react';
// Import the modal component (adjust path if necessary)
import CreateEditTemplateModal from './CreateEditTemplateModal';

// --- Simulated Data for Templates (Initial State) ---
const dummyTemplates = [
    { id: 'tpl1', name: 'HSBC London Monthly Settlement', paymentType: 'Tokenized', recipientName: 'HSBC London', recipientAccount: 'GB29NWBK60161331926819', recipientInstitution: 'HSBC Bank plc', fromAccountLabel: 'USDC Treasury Wallet', amount: '2500000', currency: 'USDC', purpose: 'BKTR', lastUsed: 'Mar 3, 2025' },
    { id: 'tpl2', name: 'JPM Reserve Account Funding', paymentType: 'Tokenized', recipientName: 'JPMorgan Chase', recipientAccount: '0x...JPMCustody', recipientInstitution: 'Ethereum', fromAccountLabel: 'USDC Treasury Wallet', amount: '', currency: 'USDC', purpose: 'TREA', lastUsed: 'Feb 28, 2025' }, // Amount empty means variable
    { id: 'tpl3', name: 'Deutsche Bank EUR Transfer', paymentType: 'Traditional', traditionalRail: 'SWIFT', recipientName: 'Deutsche Bank AG', recipientAccount: 'DE89370400440532013000', recipientInstitution: 'DEUTDEFF', fromAccountLabel: 'USD Primary Account', amount: '1800000', currency: 'EUR', purpose: 'CORT', lastUsed: 'Feb 20, 2025' },
    { id: 'tpl4', name: 'Citi Singapore Internal Transfer', paymentType: 'Internal', recipientName: 'Citi Internal Ops SG', recipientAccount: 'CITI-SG-OPS-001', recipientInstitution: 'Internal Platform', fromAccountLabel: 'USDC Treasury Wallet', amount: '', currency: 'USDC', purpose: 'INTRA', lastUsed: 'Mar 4, 2025' },
    { id: 'tpl5', name: 'ICICI Mumbai INR Transfer', paymentType: 'Tokenized', recipientName: 'ICICI Bank Ltd', recipientAccount: 'icici-wallet-mumbai-7a6b', recipientInstitution: 'Internal Ledger (e₹)', fromAccountLabel: 'eRupee Wallet', amount: '75000000', currency: 'INR', purpose: 'CORT', lastUsed: 'Feb 15, 2025' },
    { id: 'tpl6', name: 'Supplier Payment - ACME Corp', paymentType: 'Tokenized', recipientName: 'ACME Corporation', recipientAccount: 'GD..ACME..STELLAR..WALLET', recipientInstitution: 'Stellar', fromAccountLabel: 'USD Primary Account', amount: '150000', currency: 'USD', purpose: 'SUPP', lastUsed: 'Mar 1, 2025' },
];

// --- Component ---
const ViewTemplatesScreen = ({ onBack, onNavigate }) => {

  // --- State ---
  const [templates, setTemplates] = useState(dummyTemplates);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [recipientFilter, setRecipientFilter] = useState('All Recipients');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);

  // --- Filtering Logic ---
  const filteredTemplates = useMemo(() => { /* ... unchanged ... */ return templates.filter(template => { const searchTermLower = searchTerm.toLowerCase(); const matchesSearch = searchTermLower === '' || (template.name && template.name.toLowerCase().includes(searchTermLower)) || (template.recipientName && template.recipientName.toLowerCase().includes(searchTermLower)) || (template.purpose && template.purpose.toLowerCase().includes(searchTermLower)); const matchesType = typeFilter === 'All Types' || template.paymentType === typeFilter; const recipientForFilter = template.recipientName || template.recipient || ''; const matchesRecipient = recipientFilter === 'All Recipients' || recipientForFilter === recipientFilter; return matchesSearch && matchesType && matchesRecipient; }); }, [searchTerm, typeFilter, recipientFilter, templates]);

  // --- Action Handlers ---
  const handleUseTemplate = (template) => { /* ... unchanged ... */ console.log('Using Template:', template); if (onNavigate) { onNavigate('create-payment', { templateData: template }); } else { console.error("onNavigate prop is missing!"); } };
  const handleCreateClick = () => { /* ... unchanged ... */ console.log('Create New Template clicked'); setEditingTemplate(null); setIsModalOpen(true); };
  const handleEditClick = (template) => { /* ... unchanged ... */ console.log('Edit Template clicked:', template.id); setEditingTemplate(template); setIsModalOpen(true); };
  const handleDeleteClick = (templateId, templateName) => { /* ... unchanged ... */ console.log('Delete Template clicked:', templateId); if (window.confirm(`Are you sure you want to delete the template "${templateName || 'Unnamed Template'}"?`)) { setTemplates(currentTemplates => currentTemplates.filter(t => t.id !== templateId)); console.log('Template deleted.'); } };
  const handleModalClose = () => { /* ... unchanged ... */ setIsModalOpen(false); setEditingTemplate(null); };
  const handleModalSave = (savedTemplateData) => { /* ... unchanged ... */ console.log('Saving template:', savedTemplateData); if (editingTemplate && savedTemplateData.id) { setTemplates(currentTemplates => currentTemplates.map(t => t.id === savedTemplateData.id ? savedTemplateData : t) ); } else { const newTemplate = { ...savedTemplateData, id: `tpl${Date.now()}${Math.random().toString().slice(2, 5)}`, lastUsed: 'Never' }; setTemplates(currentTemplates => [newTemplate, ...currentTemplates]); } handleModalClose(); };


  // --- Render Logic ---
  return (
    <div className="bg-white p-6 rounded shadow max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 border-b pb-3">
        <h1 className="text-2xl font-bold text-gray-800">Payment Templates</h1>
        <button className="px-3 py-1 rounded text-white hover:opacity-90 bg-gray-800 text-sm" onClick={onBack} > Back to Dashboard </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-wrap sm:flex-nowrap space-y-3 sm:space-y-0 sm:space-x-4 mb-6">
        <div className="flex-grow w-full sm:w-auto"> <div className="relative"> <input type="text" className="w-full pl-10 pr-4 py-2 border rounded text-sm" placeholder="Search templates..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /> <div className="absolute left-3 top-2.5 text-gray-400"> <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg> </div> </div> </div>
        <select className="p-2 border rounded w-full sm:w-40 text-sm bg-white" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} > <option>All Types</option> <option>Tokenized</option> <option>Traditional</option> <option>Internal</option> </select>
        <select className="p-2 border rounded w-full sm:w-48 text-sm bg-white" value={recipientFilter} onChange={(e) => setRecipientFilter(e.target.value)} > <option>All Recipients</option> {[...new Set(templates.map(t => t.recipientName || t.recipient || 'Unknown'))].sort().map(recipient => ( <option key={recipient} value={recipient}>{recipient}</option> ))} </select>
        <button className="px-4 py-2 rounded text-white hover:opacity-90 bg-emtech-gold text-sm w-full sm:w-auto flex-shrink-0" onClick={handleCreateClick} > Create Template </button>
      </div>

      {/* Templates Grid */}
      {filteredTemplates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {filteredTemplates.map((template) => (
            <div key={template.id} className="border border-gray-200 rounded-lg overflow-hidden flex flex-col hover:border-emtech-gold hover:shadow-md transition-all">
              <div className="bg-gray-50 p-3 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium text-sm truncate" title={template.name}>{template.name}</h3>
                  <span className={`px-2 py-0.5 text-xs rounded-full ${ template.paymentType === 'Tokenized' ? 'bg-blue-100 text-blue-800' : template.paymentType === 'Traditional' ? 'bg-green-100 text-green-800' : template.paymentType === 'Internal' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800' }`}>{template.paymentType}</span>
                </div>
              </div>
              <div className="p-4 flex-grow">
                 <div className="space-y-2">
                   <div className="flex justify-between text-sm"><span className="text-gray-600">Recipient:</span> <span className="font-medium truncate">{template.recipientName || template.recipient}</span></div>
                   <div className="flex justify-between text-sm"><span className="text-gray-600">Amount:</span> <span className="font-medium truncate">{template.amount ? `${template.currency} ${parseFloat(template.amount).toLocaleString()}` : 'Variable'}</span></div>
                   <div className="flex justify-between text-sm"><span className="text-gray-600">Purpose:</span> <span className="font-medium truncate">{template.purpose}</span></div>
                   <div className="flex justify-between text-sm"><span className="text-gray-600">Last Used:</span> <span>{template.lastUsed}</span></div>
                 </div>
              </div>
              <div className="mt-auto p-3 pt-3 border-t border-gray-100 bg-gray-50 flex space-x-2">
                <button className="flex-1 px-3 py-1.5 bg-emtech-gold text-white text-sm rounded hover:opacity-90" onClick={() => handleUseTemplate(template)}> Use Template </button>
                <button className="p-2 border border-gray-200 text-gray-600 text-sm rounded bg-white hover:bg-gray-100" title="Edit" onClick={() => handleEditClick(template)}> <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg> </button>
                <button className="p-2 border border-gray-200 text-gray-600 text-sm rounded bg-white hover:bg-gray-100" title="Delete" onClick={() => handleDeleteClick(template.id, template.name)}> <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg> </button>
              </div>
            </div>
          ))}
          <button className="border border-dashed border-gray-300 rounded-lg flex items-center justify-center p-8 hover:border-emtech-gold hover:bg-yellow-50 transition-all cursor-pointer min-h-[250px]" onClick={handleCreateClick}>
             <div className="text-center"> <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3"> <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg> </div> <p className="font-medium text-gray-800">Create New Template</p> <p className="text-sm text-gray-500 mt-1">Save time on recurring payments</p> </div>
           </button>
        </div>
      ) : (
        <div className="text-center py-10 border border-dashed rounded-lg"> <p className="text-gray-500">No templates found matching your criteria.</p> {searchTerm && <p className="text-sm text-gray-400 mt-1">Try adjusting your search term or filters.</p>} </div>
      )}

      {/* --- Render Modal --- */}
      {isModalOpen && (
          <CreateEditTemplateModal
              template={editingTemplate} // Pass null for create, template object for edit
              onClose={handleModalClose}
              onSave={handleModalSave}
              // Pass any other necessary props like available accounts if needed inside modal
          />
      )}
      {/* --- End Modal --- */}

    </div>
  );
};

export default ViewTemplatesScreen;