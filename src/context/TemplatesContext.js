import React, { createContext, useContext, useReducer } from 'react';
import { dummyTemplates } from '../features/Payments/data/paymentConstants'; // Adjust path if needed

const initialTemplatesState = {
    templates: dummyTemplates,
};

const templatesReducer = (state, action) => {
    switch (action.type) {
        case 'SAVE_TEMPLATE': {
            const savedTemplateData = action.payload;
            const existingIndex = savedTemplateData.id
                ? state.templates.findIndex(t => t.id === savedTemplateData.id)
                : -1;

            let updatedTemplates;
            if (existingIndex > -1) {
                // Update existing template
                updatedTemplates = state.templates.map((t, i) =>
                    i === existingIndex ? { ...t, ...savedTemplateData } : t
                );
                console.log('TemplatesContext: Updated template', savedTemplateData.id);
            } else {
                // Add new template (ensure ID)
                const newTemplate = {
                    ...savedTemplateData,
                    id: savedTemplateData.id || `tpl-${Date.now()}`
                };
                updatedTemplates = [newTemplate, ...state.templates]; // Add to beginning
                console.log('TemplatesContext: Added new template', newTemplate.id);
            }
            return { ...state, templates: updatedTemplates };
        }
        case 'DELETE_TEMPLATE': {
            const templateIdToDelete = action.payload;
            if (!templateIdToDelete) {
                 console.error('Invalid payload for DELETE_TEMPLATE:', action.payload);
                 return state;
            }
            const filteredTemplates = state.templates.filter(t => t.id !== templateIdToDelete);
            console.log('TemplatesContext: Deleted template', templateIdToDelete);
            return { ...state, templates: filteredTemplates };
        }
        default:
            return state;
    }
};

const TemplatesContext = createContext(initialTemplatesState);

export const TemplatesProvider = ({ children }) => {
    const [state, dispatchTemplates] = useReducer(templatesReducer, initialTemplatesState);

    return (
        <TemplatesContext.Provider value={{ templates: state.templates, dispatchTemplates }}>
            {children}
        </TemplatesContext.Provider>
    );
};

export const useTemplates = () => {
    const context = useContext(TemplatesContext);
    if (context === undefined) {
        throw new Error('useTemplates must be used within a TemplatesProvider');
    }
    return context;
};