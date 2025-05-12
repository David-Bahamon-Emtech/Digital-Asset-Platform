// src/context/ActiveBulkContext.js
import React, { createContext, useContext, useReducer, useCallback } from 'react';
// Adjust the path based on your file structure
import { initialDummyActiveBulkFiles } from '../features/Payments/data/paymentConstants';

// --- Initial State ---
const initialActiveBulkState = {
    // Sort initial data by upload timestamp descending
    activeBulkFiles: initialDummyActiveBulkFiles.sort((a, b) => b.uploadTimestamp - a.uploadTimestamp),
};

// --- Reducer Actions ---
const ADD_ACTIVE_BULK_FILE = 'ADD_ACTIVE_BULK_FILE';
const UPDATE_ACTIVE_BULK_STATUS = 'UPDATE_ACTIVE_BULK_STATUS';
const REMOVE_ACTIVE_BULK_FILE = 'REMOVE_ACTIVE_BULK_FILE';
const UPDATE_ACTIVE_BULK_DETAILS = 'UPDATE_ACTIVE_BULK_DETAILS'; // For editing schedule etc.

// --- Reducer Function ---
const activeBulkReducer = (state, action) => {
    switch (action.type) {
        case ADD_ACTIVE_BULK_FILE: {
            if (!action.payload || !action.payload.id) {
                console.error('Invalid payload for ADD_ACTIVE_BULK_FILE:', action.payload);
                return state;
            }
            // Prevent adding duplicates
            if (state.activeBulkFiles.some(file => file.id === action.payload.id)) {
                console.warn(`Active bulk file with ID ${action.payload.id} already exists.`);
                return state;
            }
            const newStateAdd = {
                ...state,
                // Add new file to the beginning and re-sort
                activeBulkFiles: [action.payload, ...state.activeBulkFiles]
                    .sort((a, b) => b.uploadTimestamp - a.uploadTimestamp),
            };
            console.log("ActiveBulkContext: ADDED", action.payload.id, newStateAdd);
            return newStateAdd;
        }

        case UPDATE_ACTIVE_BULK_STATUS: {
            const { fileId, newStatus, statusMessage } = action.payload;
            if (!fileId || !newStatus) {
                console.error('Invalid payload for UPDATE_ACTIVE_BULK_STATUS:', action.payload);
                return state;
            }
            const newStateUpdateStatus = {
                ...state,
                activeBulkFiles: state.activeBulkFiles.map(file =>
                    file.id === fileId
                        ? { ...file, status: newStatus, statusMessage: statusMessage !== undefined ? statusMessage : file.statusMessage }
                        : file
                ), // Re-sorting might not be needed just for status change, unless timestamp also changes
            };
             console.log("ActiveBulkContext: STATUS_UPDATE", fileId, newStatus, newStateUpdateStatus);
            return newStateUpdateStatus;
        }

         case UPDATE_ACTIVE_BULK_DETAILS: {
            const { fileId, updates } = action.payload;
             if (!fileId || !updates || typeof updates !== 'object') {
                 console.error('Invalid payload for UPDATE_ACTIVE_BULK_DETAILS:', action.payload);
                 return state;
             }
             let requiresSort = false;
             const updatedFiles = state.activeBulkFiles.map(file => {
                 if (file.id === fileId) {
                     // Check if a timestamp influencing sort order is updated
                     if (updates.uploadTimestamp || updates.scheduleTimestamp) {
                         requiresSort = true;
                     }
                     return { ...file, ...updates }; // Apply updates
                 }
                 return file;
             });

             const finalFiles = requiresSort ? updatedFiles.sort((a, b) => b.uploadTimestamp - a.uploadTimestamp) : updatedFiles;

             const newStateUpdateDetails = { ...state, activeBulkFiles: finalFiles };
             console.log("ActiveBulkContext: DETAILS_UPDATE", fileId, updates, newStateUpdateDetails);
             return newStateUpdateDetails;
         }

        case REMOVE_ACTIVE_BULK_FILE: {
            const { fileId } = action.payload;
            if (!fileId) {
                console.error('Invalid payload for REMOVE_ACTIVE_BULK_FILE:', action.payload);
                return state;
            }
            const newStateRemove = {
                ...state,
                activeBulkFiles: state.activeBulkFiles.filter(file => file.id !== fileId),
            };
            console.log("ActiveBulkContext: REMOVED", fileId, newStateRemove);
            return newStateRemove;
        }

        default:
            // console.log("ActiveBulkContext: Unknown action type:", action.type);
            return state;
    }
};

// --- Context Object ---
const ActiveBulkContext = createContext(initialActiveBulkState);

// --- Provider Component ---
export const ActiveBulkProvider = ({ children }) => {
    const [state, dispatchActiveBulk] = useReducer(activeBulkReducer, initialActiveBulkState);

    // Optional: Memoize dispatch actions if needed for performance optimization
    const addActiveBulkFile = useCallback((payload) => {
        dispatchActiveBulk({ type: ADD_ACTIVE_BULK_FILE, payload });
    }, []);

    const updateActiveBulkStatus = useCallback((payload) => {
        dispatchActiveBulk({ type: UPDATE_ACTIVE_BULK_STATUS, payload });
    }, []);

     const updateActiveBulkDetails = useCallback((payload) => {
         dispatchActiveBulk({ type: UPDATE_ACTIVE_BULK_DETAILS, payload });
     }, []);

    const removeActiveBulkFile = useCallback((payload) => {
        dispatchActiveBulk({ type: REMOVE_ACTIVE_BULK_FILE, payload });
    }, []);


    // Make state and specific dispatch actions available
    const value = {
        activeBulkFiles: state.activeBulkFiles,
        dispatchActiveBulk, // Provide raw dispatch if needed
        // Provide specific actions:
        addActiveBulkFile,
        updateActiveBulkStatus,
        updateActiveBulkDetails,
        removeActiveBulkFile,
    };

    return (
        <ActiveBulkContext.Provider value={value}>
            {children}
        </ActiveBulkContext.Provider>
    );
};

// --- Custom Hook ---
export const useActiveBulk = () => {
    const context = useContext(ActiveBulkContext);
    if (context === undefined) {
        throw new Error('useActiveBulk must be used within an ActiveBulkProvider');
    }
    return context;
};