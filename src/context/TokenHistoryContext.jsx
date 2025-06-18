import React, { createContext, useContext, useReducer } from 'react';
import { subMonths, subDays, subHours, subMinutes } from 'date-fns'; // Added subMinutes

// Helper function to create dummy events
const createDummyEvent = (monthsAgo, daysAgo, hoursAgo, actionType, details, user, approver, assetId, assetSymbol, assetName, notes = '') => {
    let timestamp = new Date(); // Start from approx April 19, 2025
    timestamp = subMonths(timestamp, monthsAgo);
    timestamp = subDays(timestamp, daysAgo);
    timestamp = subHours(timestamp, hoursAgo);
    // Add slight minute variation to avoid exact same timestamps
    timestamp = subMinutes(timestamp, Math.floor(Math.random() * 59));
    return {
        id: timestamp.getTime() + Math.random(), // Use timestamp + random for uniqueness
        timestamp: timestamp,
        actionType: actionType,
        details: details,
        user: user,
        approver: approver,
        assetId: assetId,
        assetSymbol: assetSymbol,
        assetName: assetName,
        notes: notes
    };
};

// Initial dummy history data - Only 15 events, spaced out, amounts adjusted for reserve target
const initialDummyTokenHistory = [
    // --- Hardcoded Events (15 total) ---
    // ACP ('cp-acme-01') - Target Balance <= 45M
    createDummyEvent(9, 10, 8, 'Mint', 'Minted 1,000,000 ACP', 'BK', 'TA', 'cp-acme-01', 'ACP', 'Tokenized CP (Acme)', 'Tranche 3 issuance based on new underlying paper purchase.'), // monthsAgo: 9
    createDummyEvent(4, 5, 10, 'Burn', 'Burned 1,500,000 ACP', 'BK', 'TA', 'cp-acme-01', 'ACP', 'Tokenized CP (Acme)', 'Scheduled maturity and repayment of underlying commercial paper.'), // monthsAgo: 4
    createDummyEvent(1, 8, 14, 'Redeem', 'Redeemed 200,000 ACP', 'RD', 'SA', 'cp-acme-01', 'ACP', 'Tokenized CP (Acme)', 'Early buy-back requested by institutional holder.'), // monthsAgo: 1

    // MMFUSD ('mmf-usd-01') - Target Balance <= 225M
    createDummyEvent(10, 15, 9, 'Mint', 'Minted 10,000,000 MMFUSD', 'BK', 'TA', 'mmf-usd-01', 'MMFUSD', 'Tokenized MMF (USD)', 'Subscription received from corporate treasury client.'), // monthsAgo: 10
    createDummyEvent(5, 20, 11, 'Burn', 'Burned 26,000,000 MMFUSD', 'RD', 'SA', 'mmf-usd-01', 'MMFUSD', 'Tokenized MMF (USD)', 'Large redemption processed for institutional client portfolio rebalancing.'), // monthsAgo: 5, Amount Increased
    createDummyEvent(0, 3, 15, 'Swap In', 'Swapped ~499,500 USDC for 500,000 MMFUSD', 'CS', 'MG', 'mmf-usd-01', 'MMFUSD', 'Tokenized MMF (USD)', 'Swap to provide MMF liquidity.'), // monthsAgo: 0

    // XAGC ('xagc-01') - Target Balance <= 900k
    createDummyEvent(11, 5, 10, 'Mint', 'Minted 100,000 XAGC', 'BK', 'TA', 'xagc-01', 'XAGC', 'Silver-Backed Coin', 'Vault deposit confirmation received for new silver allocation.'), // monthsAgo: 11
    createDummyEvent(6, 18, 12, 'Burn', 'Burned 30,000 XAGC', 'BK', 'TA', 'xagc-01', 'XAGC', 'Silver-Backed Coin', 'Silver withdrawal from vault completed, corresponding tokens burned.'), // monthsAgo: 6
    createDummyEvent(2, 12, 16, 'Redeem', 'Redeemed 20,000 XAGC', 'RD', 'SA', 'xagc-01', 'XAGC', 'Silver-Backed Coin', 'Holder redeemed tokens for claim on physical silver.'), // monthsAgo: 2

    // WTOIL ('oil-wti-01') - Target Balance <= 450k
    createDummyEvent(8, 8, 11, 'Mint', 'Minted 40,000 WTOIL', 'BK', 'TA', 'oil-wti-01', 'WTOIL', 'Tokenized WTI Oil', 'New barrels added to designated storage facility in Cushing.'), // monthsAgo: 8
    createDummyEvent(3, 12, 13, 'Burn', 'Burned 65,000 WTOIL', 'BK', 'TA', 'oil-wti-01', 'WTOIL', 'Tokenized WTI Oil', 'Physical delivery contracts executed against expiring futures, tokens removed.'), // monthsAgo: 3, Amount Increased
    createDummyEvent(0, 6, 17, 'Swap Out', 'Swapped 5,000 WTOIL for ~400,750 USDC', 'CS', 'MG', 'oil-wti-01', 'WTOIL', 'Tokenized WTI Oil', 'Platform swap executed for client hedging position against USDC.'), // monthsAgo: 0

    // VCC ('cc-verra-01') - Target Balance <= 9M
    createDummyEvent(7, 22, 12, 'Mint', 'Minted 700,000 VCC', 'BK', 'TA', 'cc-verra-01', 'VCC', 'Verified Carbon Credit', 'Registration of new batch of verified credits from forestry project.'), // monthsAgo: 7
    createDummyEvent(4, 10, 14, 'Burn', 'Burned 1,150,000 VCC', 'RD', 'SA', 'cc-verra-01', 'VCC', 'Verified Carbon Credit', 'Large-scale retirement by corporation to meet annual climate commitments.'), // monthsAgo: 4, Amount Increased
    createDummyEvent(1, 2, 18, 'Swap Out', 'Swapped 50,000 VCC for ~787,500 USDC', 'CS', 'MG', 'cc-verra-01', 'VCC', 'Verified Carbon Credit', 'Secondary market sale transaction executed on platform.'), // monthsAgo: 1
];


// Initial state for the context
const initialTokenHistoryState = {
    // Sort the reduced history by timestamp descending (most recent first)
    tokenHistory: initialDummyTokenHistory.sort((a, b) => b.timestamp - a.timestamp),
};

// Reducer function to manage token history state
const tokenHistoryReducer = (state, action) => {
    console.log('Token History Reducer Action:', action); // Keep for debugging
    switch (action.type) {
        case 'ADD_TOKEN_HISTORY':
            if (!action.payload || !action.payload.timestamp || !action.payload.actionType || !action.payload.assetSymbol) {
                 console.warn('Payload missing required fields for ADD_TOKEN_HISTORY:', action.payload);
                 // return state;
            }
            const newState = {
                ...state,
                tokenHistory: [action.payload, ...state.tokenHistory]
                    .sort((a, b) => b.timestamp - a.timestamp),
            };
            return newState;

        case 'SET_TOKEN_HISTORY':
             if (!Array.isArray(action.payload)) {
                  console.error('Invalid payload for SET_TOKEN_HISTORY: Payload must be an array.');
                  return state;
             }
            return {
                ...state,
                tokenHistory: [...action.payload].sort((a, b) => b.timestamp - a.timestamp),
            };

        default:
            return state;
    }
};

// Create the context object
const TokenHistoryContext = createContext(initialTokenHistoryState);

// Provider component
export const TokenHistoryProvider = ({ children }) => {
    const [state, dispatchTokenHistory] = useReducer(tokenHistoryReducer, initialTokenHistoryState);

    return (
        <TokenHistoryContext.Provider value={{ tokenHistory: state.tokenHistory, dispatchTokenHistory }}>
            {children}
        </TokenHistoryContext.Provider>
    );
};

// Custom hook to use the token history context
export const useTokenHistory = () => {
    const context = useContext(TokenHistoryContext);
    if (context === undefined) {
        throw new Error('useTokenHistory must be used within a TokenHistoryProvider');
    }
    return context;
};
