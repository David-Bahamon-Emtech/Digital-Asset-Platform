import React, { createContext, useContext, useReducer } from 'react';
import { initialPaymentHistory } from '../features/Payments/data/paymentConstants.js'; // Adjust path if needed

const initialHistoryState = {
    paymentHistory: initialPaymentHistory,
};

const paymentHistoryReducer = (state, action) => {
    switch (action.type) {
        case 'ADD_PAYMENT_HISTORY':
            if (!action.payload || !action.payload.timestamp) {
                 console.error('Invalid payload for ADD_PAYMENT_HISTORY:', action.payload);
                 return state;
            }
            const newStateAdd = {
                ...state,
                paymentHistory: [action.payload, ...state.paymentHistory]
                    .sort((a, b) => b.timestamp - a.timestamp),
            };
            return newStateAdd;

        case 'UPDATE_PAYMENT_STATUS': {
            const { entryId, newStatus, newTimestamp } = action.payload;
            if (!entryId || !newStatus) {
                 console.error('Invalid payload for UPDATE_PAYMENT_STATUS:', action.payload);
                 return state;
            }
            const updatedHistory = state.paymentHistory
                .map(item =>
                    item.id === entryId
                        ? { ...item, status: newStatus, timestamp: newTimestamp || item.timestamp }
                        : item
                )
                .sort((a, b) => b.timestamp - a.timestamp);

            return {
                ...state,
                paymentHistory: updatedHistory,
            };
        }
        default:
            return state;
    }
};

const PaymentHistoryContext = createContext(initialHistoryState);

export const PaymentHistoryProvider = ({ children }) => {
    const [state, dispatchPaymentHistory] = useReducer(paymentHistoryReducer, initialHistoryState);

    return (
        <PaymentHistoryContext.Provider value={{ paymentHistory: state.paymentHistory, dispatchPaymentHistory }}>
            {children}
        </PaymentHistoryContext.Provider>
    );
};

export const usePaymentHistory = () => {
    const context = useContext(PaymentHistoryContext);
    if (context === undefined) {
        throw new Error('usePaymentHistory must be used within a PaymentHistoryProvider');
    }
    return context;
};