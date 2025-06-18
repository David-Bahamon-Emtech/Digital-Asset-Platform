import React, { useState, useMemo } from 'react';
import CreateEditTemplateModal from './CreateEditTemplateModal.jsx';
import { useTemplates } from '../../context/TemplatesContext.jsx'; // Adjust path if needed
import { useAssets } from '../../context/AssetsContext.jsx'; // Adjust path if needed (kept in case needed later)

/**
 * Screen component for viewing, searching, filtering, and managing payment templates.
 * Uses TemplatesContext for data and actions. Renders CreateEditTemplateModal.
 *
 * @param {object} props - Component props.
 * @param {function} props.onBack - Callback function to navigate back.
 * @param {function} props.onNavigate - Callback function to navigate to other screens (e.g., CreatePaymentScreen).
 */
const ViewTemplatesScreen = ({
    onBack,
    onNavigate,
}) => {
    // Consume contexts
    const { templates, dispatchTemplates } = useTemplates();
    const { assets } = useAssets(); // Keep hook in case assets needed directly here later

    // Local UI state remains
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('All Types');
    const [recipientFilter, setRecipientFilter] = useState('All Recipients');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState(null);

    // Use templates from context for filtering and options
    const filteredTemplates = useMemo(() => {
        return templates.filter(template => {
            const searchTermLower = searchTerm.toLowerCase();
            // Add checks to ensure properties exist before calling toLowerCase()
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
    }, [searchTerm, typeFilter, recipientFilter, templates]); // Depend on context state

    const recipientOptions = useMemo(() => {
        const recipients = new Set(
            templates // Use context state
                .map(t => t.recipientName || t.recipientAccount)
                .filter(Boolean) // Filter out falsy values like null or empty strings
        );
        // Sort alphabetically after converting Set to Array
        return ['All Recipients', ...Array.from(recipients).sort((a, b) => a.localeCompare(b))];
    }, [templates]); // Depend on context state


    // Navigation handler when "Use Template" is clicked
    const handleUseTemplate = (template) => {
        console.log('ViewTemplatesScreen: Using Template:', JSON.stringify(template, null, 2));
        if (onNavigate) {
            // Pass the template data to the create payment screen
            onNavigate('create-payment', { templateData: template });
        } else {
            console.error("onNavigate prop is missing!");
            alert("Error: Cannot proceed to payment screen.");
        }
    };

    // Handlers for modal control
    const handleCreateClick = () => {
        setEditingTemplate(null); // Ensure we are in "create" mode
        setIsModalOpen(true);
    };

    const handleEditClick = (template) => {
        setEditingTemplate(template); // Set the template to edit
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setEditingTemplate(null); // Clear editing state on close
    };

    // Handler for deleting a template (dispatches directly)
    const handleDeleteClick = (templateId, templateName) => {
        if (window.confirm(`Are you sure you want to delete the template "${templateName || 'Unnamed Template'}"?`)) {
            try {
                dispatchTemplates({ type: 'DELETE_TEMPLATE', payload: templateId });
                console.log('Delete template dispatched for ID:', templateId);
                 // Optionally add success feedback here if needed
            } catch (error) {
                 console.error("Error dispatching delete template action:", error);
                 alert("Failed to delete template. Please try again.");
            }
        }
    };

    // --- REMOVED handleModalSave ---
    // The modal now dispatches the SAVE_TEMPLATE action itself.


    return (
      <div className="bg-white p-6 rounded shadow max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 border-b pb-3">
          <h1 className="text-2xl font-bold text-gray-800">Payment Templates </h1>
          <button className="px-3 py-1 rounded text-white hover:opacity-90 bg-gray-800 text-sm" onClick={onBack} > Back to Dashboard </button>
        </div>

        {/* Filter and Search Controls */}
        <div className="flex flex-wrap sm:flex-nowrap space-y-3 sm:space-y-0 sm:space-x-4 mb-6">
          {/* Search Input */}
          <div className="flex-grow w-full sm:w-auto">
            <div className="relative">
                <input
                    type="text"
                    className="w-full pl-10 pr-4 py-2 border rounded text-sm"
                    placeholder="Search templates by name, recipient..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="absolute left-3 top-2.5 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
            </div>
          </div>
          {/* Type Filter */}
          <select className="p-2 border rounded w-full sm:w-40 text-sm bg-white" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} >
             <option>All Types</option>
             <option>Tokenized</option>
             <option>Traditional</option>
             <option>Internal</option>
          </select>
          {/* Recipient Filter */}
          <select className="p-2 border rounded w-full sm:w-48 text-sm bg-white" value={recipientFilter} onChange={(e) => setRecipientFilter(e.target.value)} >
              {recipientOptions.map(recipient => ( <option key={recipient} value={recipient}>{recipient}</option> ))}
          </select>
          {/* Create Button */}
          <button className="px-4 py-2 rounded text-white hover:opacity-90 bg-emtech-gold text-sm w-full sm:w-auto flex-shrink-0" onClick={handleCreateClick} >
             Create Template
          </button>
        </div>

        {/* Templates Grid */}
        {/* Use filteredTemplates derived from context */}
        {filteredTemplates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {filteredTemplates.map((template) => (
              <div key={template.id} className="border border-gray-200 rounded-lg overflow-hidden flex flex-col hover:border-emtech-gold hover:shadow-md transition-all">
                {/* Card Header */}
                <div className="bg-gray-50 p-3 border-b border-gray-200">
                     <div className="flex justify-between items-center">
                         <h3 className="font-medium text-sm truncate" title={template.name}>{template.name || 'Unnamed Template'}</h3>
                         <span className={`px-2 py-0.5 text-xs rounded-full ${ template.paymentType === 'Tokenized' ? 'bg-blue-100 text-blue-800' : template.paymentType === 'Traditional' ? 'bg-green-100 text-green-800' : template.paymentType === 'Internal' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800' }`}>
                            {template.paymentType || 'N/A'}
                         </span>
                     </div>
                </div>
                {/* Card Body */}
                <div className="p-4 flex-grow">
                     <div className="space-y-2">
                      <div className="flex justify-between text-sm"><span className="text-gray-600 flex-shrink-0 pr-2">From:</span> <span className="font-medium truncate text-right" title={template.fromAccountLabel}>{template.fromAccountLabel || 'N/A'}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-gray-600 flex-shrink-0 pr-2">Recipient:</span> <span className="font-medium truncate text-right" title={template.recipientName || template.recipientAccount}>{template.recipientName || template.recipientAccount || 'N/A'}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-gray-600 flex-shrink-0 pr-2">Amount:</span> <span className="font-medium truncate text-right">{template.amount ? `${template.currency} ${parseFloat(template.amount).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}` : 'Variable'}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-gray-600 flex-shrink-0 pr-2">Purpose:</span> <span className="font-medium truncate text-right">{template.purpose || 'N/A'}</span></div>
                   </div>
                </div>
                {/* Card Footer Actions */}
                <div className="mt-auto p-3 pt-3 border-t border-gray-100 bg-gray-50 flex space-x-2">
                  <button className="flex-1 px-3 py-1.5 bg-emtech-gold text-white text-sm rounded hover:opacity-90" onClick={() => handleUseTemplate(template)}> Use Template </button>
                  <button className="p-2 border border-gray-200 text-gray-600 text-sm rounded bg-white hover:bg-gray-100" title="Edit" onClick={() => handleEditClick(template)}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  </button>
                  <button className="p-2 border border-gray-200 text-gray-600 text-sm rounded bg-white hover:bg-gray-100" title="Delete" onClick={() => handleDeleteClick(template.id, template.name)}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
            ))}
            {/* Add New Template Card */}
            <button className="border border-dashed border-gray-300 rounded-lg flex items-center justify-center p-8 hover:border-emtech-gold hover:bg-yellow-50 transition-all cursor-pointer min-h-[250px]" onClick={handleCreateClick}>
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
           // Empty State Message
          <div className="text-center py-10 border border-dashed rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" /> </svg>
             <p className="text-gray-500 mt-3">No templates found matching your criteria.</p>
             {(searchTerm || typeFilter !== 'All Types' || recipientFilter !== 'All Recipients') && <p className="text-sm text-gray-400 mt-1">Try adjusting your search term or filters.</p>}
             <button className="mt-4 px-4 py-2 rounded text-white hover:opacity-90 bg-emtech-gold text-sm" onClick={handleCreateClick} > Create Your First Template </button>
           </div>
        )}

        {/* Render Modal conditionally - REMOVED onSave and assets props */}
        {isModalOpen && (
            <CreateEditTemplateModal
                template={editingTemplate}
                onClose={handleModalClose}
                // onSave prop removed - Modal dispatches directly
                // assets prop removed - Modal uses context
            />
        )}

      </div> // End main container
    );
};

export default ViewTemplatesScreen;