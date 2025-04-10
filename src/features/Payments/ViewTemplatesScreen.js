// src/features/Payments/ViewTemplatesScreen.js
import React, { useState, useMemo } from 'react';
import CreateEditTemplateModal from './CreateEditTemplateModal';
import { sampleEntities } from '../../data/initialData'; // Needed if templates use sendingEntity

// --- New Local Dummy Templates ---
const initialLocalTemplates = [
    // Institutional On-Chain
    {
        id: 'tpl-inst-onchain-1', name: 'USDC Settlement (Inst)', paymentType: 'Tokenized', fromAccountLabel: 'USDC Treasury Wallet',
        recipientName: 'External Partner Wallet', recipientAccount: 'GAEXAMPLE...', recipientInstitution: 'Stellar', amount: 50000, currency: 'USDC', purpose: 'BKTR',
        description: 'USDC On-Chain Template', onChainNetwork: 'Stellar', traditionalRail: '', settlementSpeed: '', paymentOrigin: 'institutional', sendingEntity: sampleEntities[0]
    },
    {
        id: 'tpl-inst-onchain-2', name: 'Digital Euro Transfer (Inst)', paymentType: 'Tokenized', fromAccountLabel: 'Digital Euro Pilot Wallet',
        recipientName: 'EU Counterparty', recipientAccount: '0xABC...', recipientInstitution: 'Ethereum', amount: 100000, currency: 'D-EUR', purpose: 'CORT',
        description: 'D-EUR On-Chain Template', onChainNetwork: 'Ethereum', traditionalRail: '', settlementSpeed: '', paymentOrigin: 'institutional', sendingEntity: sampleEntities[1]
     },
    // Institutional Traditional
    {
        id: 'tpl-inst-trad-1', name: 'USD Supplier Payment (Inst)', paymentType: 'Traditional', fromAccountLabel: 'USD Primary Account',
        recipientName: 'ACME Corp USA', recipientAccount: '123456789', recipientInstitution: 'Bank of America', amount: 7500, currency: 'USD', purpose: 'SUPP',
        description: 'USD Traditional Template', traditionalRail: 'SWIFT', settlementSpeed: 'standard', onChainNetwork: '', paymentOrigin: 'institutional', sendingEntity: sampleEntities[0]
    },
    {
        id: 'tpl-inst-trad-2', name: 'EUR Correspondent Funding (Inst)', paymentType: 'Traditional', fromAccountLabel: 'EUR Primary Account',
        recipientName: 'HSBC Europe', recipientAccount: 'DE89...', recipientInstitution: 'HSBC Bank plc', amount: 250000, currency: 'EUR', purpose: 'TREA',
        description: 'EUR Traditional Template', traditionalRail: 'HSBC', settlementSpeed: 'standard', onChainNetwork: '', paymentOrigin: 'institutional', sendingEntity: sampleEntities[1]
    },
    // Institutional Internal
    {
        id: 'tpl-inst-internal-1', name: 'Internal Ops USDC Funding (Inst)', paymentType: 'Internal', fromAccountLabel: 'USDC Treasury Wallet',
        recipientName: 'Internal Operations', recipientAccount: 'INT-OPS-WALLET', recipientInstitution: 'Internal Platform', amount: '', currency: 'USDC', purpose: 'INTRA', // Variable amount
        description: 'Internal USDC Transfer', traditionalRail: '', settlementSpeed: '', onChainNetwork: '', paymentOrigin: 'institutional', sendingEntity: '' // No entity for internal
    },
    {
        id: 'tpl-inst-internal-2', name: 'Internal Project USD Transfer (Inst)', paymentType: 'Internal', fromAccountLabel: 'USD Primary Account',
        recipientName: 'Project Phoenix Wallet', recipientAccount: 'PROJ-PHX-USD', recipientInstitution: 'Internal Platform', amount: 12000, currency: 'USD', purpose: 'INTRA',
        description: 'Internal USD Transfer', traditionalRail: '', settlementSpeed: '', onChainNetwork: '', paymentOrigin: 'institutional', sendingEntity: '' // No entity for internal
    },
];

const ViewTemplatesScreen = ({
    onBack,
    onNavigate,
    assets = []
    // Removed props: templates, onSaveTemplate, onDeleteTemplate
}) => {

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [recipientFilter, setRecipientFilter] = useState('All Recipients');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [localTemplates, setLocalTemplates] = useState(initialLocalTemplates); // Use local state

  const filteredTemplates = useMemo(() => {
      return localTemplates.filter(template => { // Filter local state
          const searchTermLower = searchTerm.toLowerCase();
          const nameMatch = template.name && template.name.toLowerCase().includes(searchTermLower);
          const recipientNameMatch = template.recipientName && template.recipientName.toLowerCase().includes(searchTermLower);
          const recipientAccountMatch = template.recipientAccount && template.recipientAccount.toLowerCase().includes(searchTermLower);
          const purposeMatch = template.purpose && template.purpose.toLowerCase().includes(searchTermLower);

          const matchesSearch = searchTermLower === '' || nameMatch || recipientNameMatch || recipientAccountMatch || purposeMatch;
          const matchesType = typeFilter === 'All Types' || template.paymentType === typeFilter;
          const recipientForFilter = template.recipientName || template.recipientAccount || '';
          const matchesRecipient = recipientFilter === 'All Recipients' || recipientForFilter === recipientFilter;

          return matchesSearch && matchesType && matchesRecipient;
      });
  }, [searchTerm, typeFilter, recipientFilter, localTemplates]); // Depend on local state

  const handleUseTemplate = (template) => {
      console.log('ViewTemplatesScreen (Rebuilt): Using Template:', JSON.stringify(template, null, 2));
      if (onNavigate) {
          // Ensure the template object passed contains all fields CreatePaymentScreen needs
          // Our local dummy templates are designed for this.
          onNavigate('create-payment', { templateData: template });
      } else {
          console.error("onNavigate prop is missing!");
          alert("Error: Cannot proceed to payment screen.");
      }
  };

  const handleCreateClick = () => {
      setEditingTemplate(null);
      setIsModalOpen(true);
  };

  const handleEditClick = (template) => {
      setEditingTemplate(template);
      setIsModalOpen(true);
  };

  const handleModalClose = () => {
      setIsModalOpen(false);
      setEditingTemplate(null);
  };

  const handleDeleteClick = (templateId, templateName) => {
      if (window.confirm(`Are you sure you want to delete the template "${templateName || 'Unnamed Template'}"?`)) {
          // Update local state
          setLocalTemplates(prev => prev.filter(t => t.id !== templateId));
          console.log('Template deleted locally.');
      }
  };

  const handleModalSave = (savedTemplateData) => {
      // Update local state
       const index = savedTemplateData.id ? localTemplates.findIndex(t => t.id === savedTemplateData.id) : -1;
       if (index > -1) {
           // Update existing in local state
           setLocalTemplates(prev => prev.map((t, i) => i === index ? { ...t, ...savedTemplateData } : t));
           console.log('Template updated locally.');
       } else {
           // Add new to local state (ensure ID)
           const newTemplate = { ...savedTemplateData, id: savedTemplateData.id || `tpl-${Date.now()}` };
           setLocalTemplates(prev => [newTemplate, ...prev]);
           console.log('New template added locally.');
       }
       handleModalClose();
  };

  const recipientOptions = useMemo(() => {
      const recipients = new Set(
          localTemplates // Use local state
              .map(t => t.recipientName || t.recipientAccount)
              .filter(Boolean)
      );
      return ['All Recipients', ...Array.from(recipients).sort()];
  }, [localTemplates]); // Depend on local state

  return (
    <div className="bg-white p-6 rounded shadow max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6 border-b pb-3">
        <h1 className="text-2xl font-bold text-gray-800">Payment Templates </h1>
        <button className="px-3 py-1 rounded text-white hover:opacity-90 bg-gray-800 text-sm" onClick={onBack} > Back to Dashboard </button>
      </div>

      <div className="flex flex-wrap sm:flex-nowrap space-y-3 sm:space-y-0 sm:space-x-4 mb-6">
        <div className="flex-grow w-full sm:w-auto"> <div className="relative"> <input type="text" className="w-full pl-10 pr-4 py-2 border rounded text-sm" placeholder="Search templates by name, recipient..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /> <div className="absolute left-3 top-2.5 text-gray-400"> <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg> </div> </div> </div>
        <select className="p-2 border rounded w-full sm:w-40 text-sm bg-white" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} > <option>All Types</option> <option>Tokenized</option> <option>Traditional</option> <option>Internal</option> </select>
        <select className="p-2 border rounded w-full sm:w-48 text-sm bg-white" value={recipientFilter} onChange={(e) => setRecipientFilter(e.target.value)} >
            {recipientOptions.map(recipient => ( <option key={recipient} value={recipient}>{recipient}</option> ))}
        </select>
        <button className="px-4 py-2 rounded text-white hover:opacity-90 bg-emtech-gold text-sm w-full sm:w-auto flex-shrink-0" onClick={handleCreateClick} > Create Template </button>
      </div>

      {filteredTemplates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {filteredTemplates.map((template) => (
            <div key={template.id} className="border border-gray-200 rounded-lg overflow-hidden flex flex-col hover:border-emtech-gold hover:shadow-md transition-all">
              <div className="bg-gray-50 p-3 border-b border-gray-200"> <div className="flex justify-between items-center"> <h3 className="font-medium text-sm truncate" title={template.name}>{template.name || 'Unnamed Template'}</h3> <span className={`px-2 py-0.5 text-xs rounded-full ${ template.paymentType === 'Tokenized' ? 'bg-blue-100 text-blue-800' : template.paymentType === 'Traditional' ? 'bg-green-100 text-green-800' : template.paymentType === 'Internal' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800' }`}>{template.paymentType || 'N/A'}</span> </div> </div>
              <div className="p-4 flex-grow"> <div className="space-y-2">
                    <div className="flex justify-between text-sm"><span className="text-gray-600">From:</span> <span className="font-medium truncate">{template.fromAccountLabel || 'N/A'}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-gray-600">Recipient:</span> <span className="font-medium truncate">{template.recipientName || template.recipientAccount || 'N/A'}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-gray-600">Amount:</span> <span className="font-medium truncate">{template.amount ? `${template.currency} ${parseFloat(template.amount).toLocaleString()}` : 'Variable'}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-gray-600">Purpose:</span> <span className="font-medium truncate">{template.purpose || 'N/A'}</span></div>
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

      {isModalOpen && (
          <CreateEditTemplateModal
              template={editingTemplate}
              onClose={handleModalClose}
              onSave={handleModalSave} // Now updates local state
              assets={assets}
          />
      )}

    </div>
  );
};

export default ViewTemplatesScreen;