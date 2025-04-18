import React, { createContext, useContext, useReducer } from 'react';
import { initialDummyRecurringPayments } from '../features/Payments/data/paymentConstants'; // Adjust path if needed

const initialRecurringState = {
    recurringPayments: initialDummyRecurringPayments,
};

const recurringPaymentsReducer = (state, action) => {
    console.log('Recurring Payments Reducer Action:', action); // Keep for debugging
    switch (action.type) {
        case 'SAVE_RECURRING': {
            const savedData = action.payload;
            // Ensure amount is a number
            const amountAsNumber = typeof savedData.amount === 'string'
                ? parseFloat(savedData.amount)
                : savedData.amount;
            const recurringData = { ...savedData, amount: amountAsNumber };

            const existingIndex = recurringData.id
                ? state.recurringPayments.findIndex(p => p.id === recurringData.id)
                : -1;

            let updatedList;
            if (existingIndex > -1) {
                // Update existing
                updatedList = state.recurringPayments.map((p, i) =>
                    i === existingIndex ? { ...p, ...recurringData } : p
                );
                console.log('RecurringContext: Updated payment', recurringData.id);
            } else {
                // Add new (ensure ID and default status)
                const newPayment = {
                    ...recurringData,
                    id: recurringData.id || `rec-${Date.now()}`,
                    status: recurringData.status || 'Active', // Default to Active if not provided
                };
                updatedList = [newPayment, ...state.recurringPayments]; // Add to beginning
                console.log('RecurringContext: Added new payment', newPayment.id);
            }
            return { ...state, recurringPayments: updatedList };
        }
        case 'DELETE_RECURRING': {
            const paymentIdToDelete = action.payload;
            if (!paymentIdToDelete) {
                console.error('Invalid payload for DELETE_RECURRING:', action.payload);
                return state;
            }
            const filteredList = state.recurringPayments.filter(p => p.id !== paymentIdToDelete);
            console.log('RecurringContext: Deleted payment', paymentIdToDelete);
            return { ...state, recurringPayments: filteredList };
        }
        case 'TOGGLE_RECURRING_STATUS': {
            const { id, newStatus, nextDate } = action.payload; // Expect pre-calculated nextDate
            if (!id || !newStatus) {
                console.error('Invalid payload for TOGGLE_RECURRING_STATUS:', action.payload);
                return state;
            }
            const updatedList = state.recurringPayments.map(p =>
                p.id === id
                    ? { ...p, status: newStatus, nextDate: nextDate } // Update status and nextDate from payload
                    : p
            );
            console.log(`RecurringContext: Toggled status for ${id} to ${newStatus}, nextDate: ${nextDate}`);
            return { ...state, recurringPayments: updatedList };
        }
        default:
            return state;
    }
};

const RecurringPaymentsContext = createContext(initialRecurringState);

export const RecurringPaymentsProvider = ({ children }) => {
    const [state, dispatchRecurring] = useReducer(recurringPaymentsReducer, initialRecurringState);

    return (
        <RecurringPaymentsContext.Provider value={{ recurringPayments: state.recurringPayments, dispatchRecurring }}>
            {children}
        </RecurringPaymentsContext.Provider>
    );
};

export const useRecurringPayments = () => {
    const context = useContext(RecurringPaymentsContext);
    if (context === undefined) {
        throw new Error('useRecurringPayments must be used within a RecurringPaymentsProvider');
    }
    return context;
};