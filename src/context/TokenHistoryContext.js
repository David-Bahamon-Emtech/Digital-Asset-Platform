import React, { createContext, useContext, useReducer } from 'react';

const initialTokenHistoryState = {
    tokenHistory: [], // Start with an empty history log
};

const tokenHistoryReducer = (state, action) => {
    console.log('Token History Reducer Action:', action); // Keep for debugging
    switch (action.type) {
        case 'ADD_TOKEN_HISTORY':
            if (!action.payload || !action.payload.timestamp || !action.payload.actionType) {
                 console.error('Invalid payload for ADD_TOKEN_HISTORY:', action.payload);
                 return state;
            }
            // Add new entry to the beginning and ensure sort order by timestamp (most recent first)
            const newState = {
                ...state,
                tokenHistory: [action.payload, ...state.tokenHistory]
                    .sort((a, b) => b.timestamp - a.timestamp),
            };
            return newState;

        // Add other potential actions like SET_TOKEN_HISTORY if needed later
        default:
            return state;
    }
};

const TokenHistoryContext = createContext(initialTokenHistoryState);

export const TokenHistoryProvider = ({ children }) => {
    const [state, dispatchTokenHistory] = useReducer(tokenHistoryReducer, initialTokenHistoryState);

    return (
        <TokenHistoryContext.Provider value={{ tokenHistory: state.tokenHistory, dispatchTokenHistory }}>
            {children}
        </TokenHistoryContext.Provider>
    );
};

export const useTokenHistory = () => {
    const context = useContext(TokenHistoryContext);
    if (context === undefined) {
        throw new Error('useTokenHistory must be used within a TokenHistoryProvider');
    }
    return context;
};