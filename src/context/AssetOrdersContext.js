import React, { createContext, useContext, useReducer, useMemo } from 'react';
import { subDays, subHours, subMinutes } from 'date-fns'; // Import date-fns helpers

// Helper to create dummy timestamps easily
const createTimestamp = (daysAgo, hoursAgo = 0) => {
    let timestamp = new Date(); // Start from approx April 22, 2025
    timestamp = subDays(timestamp, daysAgo);
    timestamp = subHours(timestamp, hoursAgo);
    timestamp = subMinutes(timestamp, Math.floor(Math.random() * 59)); // Add jitter
    return timestamp;
};


// *** NEW DUMMY DATA: 10 Sale Orders (8 Completed, 2 Pending) for TM Assets ***
const initialDummyAssetOrders = [
    // --- Pending Approval Orders (2) ---
    {
        id: 'AO-PA-001', // New ID scheme for clarity
        timestamp: createTimestamp(1, 2), // 1 day, 2 hours ago
        type: 'Sale',
        assetId: 'xagc-01',
        assetSymbol: 'XAGC', // Silver
        amount: 15000,
        from: 'Reserve',
        to: 'Treasury USDC Wallet',
        status: 'Pending Approval', // PENDING
        requestedBy: 'PortfolioMgr',
        approver: null,
        rate: 30.80,
        receivedSymbol: 'USDC',
        receivedAmount: 462000, // 15000 * 30.80
        notes: 'Client order fulfillment request - Silver.'
    },
    {
        id: 'AO-PA-002',
        timestamp: createTimestamp(0, 5), // 5 hours ago
        type: 'Sale',
        assetId: 'cc-verra-01',
        assetSymbol: 'VCC', // Carbon Credit
        amount: 100000,
        from: 'Reserve',
        to: 'Client USD Account 5678',
        status: 'Pending Approval', // PENDING
        requestedBy: 'Sales Desk',
        approver: null,
        rate: 16.50,
        receivedSymbol: 'USD',
        receivedAmount: 1650000, // 100000 * 16.50
        notes: 'Pending sale of carbon credits to Corp ABC.'
    },

    // --- Completed Orders (8) ---
    {
        id: 'AO-C-001',
        timestamp: createTimestamp(3, 8), // 3 days, 8 hours ago
        type: 'Sale',
        assetId: 'cc-verra-01',
        assetSymbol: 'VCC', // Carbon Credit
        amount: 50000,
        from: 'Reserve',
        to: 'Client USD Account 1234',
        status: 'Completed', // COMPLETED
        requestedBy: 'Sales Desk',
        approver: 'TreasuryMgr',
        rate: 16.10,
        receivedSymbol: 'USD',
        receivedAmount: 805000, // 50000 * 16.10
        notes: 'Completed sale of carbon credits to corporate client.'
    },
    {
        id: 'AO-C-002',
        timestamp: createTimestamp(5, 4), // 5 days ago
        type: 'Sale',
        assetId: 'oil-wti-01',
        assetSymbol: 'WTOIL', // WTI Oil
        amount: 2000,
        from: 'Platform Inventory', // Example different source
        to: 'Treasury USDT Wallet',
        status: 'Completed', // COMPLETED
        requestedBy: 'Commodity Desk',
        approver: 'TreasuryMgr',
        rate: 80.50,
        receivedSymbol: 'USDT',
        receivedAmount: 161000, // 2000 * 80.50
        notes: 'Sale of tokenized oil barrel position.'
    },
    {
        id: 'AO-C-003',
        timestamp: createTimestamp(7, 10), // 7 days ago
        type: 'Sale',
        assetId: 'mmf-usd-01',
        assetSymbol: 'MMFUSD', // MMF
        amount: 1000000,
        from: 'Reserve',
        to: 'Institutional Client USDC Wallet',
        status: 'Completed', // COMPLETED
        requestedBy: 'Insti Sales',
        approver: 'OpsManager',
        rate: 1.001, // Slight premium example
        receivedSymbol: 'USDC',
        receivedAmount: 1001000, // 1000000 * 1.001
        notes: 'Institutional MMF Token Sale.'
    },
     {
        id: 'AO-C-004',
        timestamp: createTimestamp(10, 6), // 10 days ago
        type: 'Sale',
        assetId: 'xagc-01',
        assetSymbol: 'XAGC', // Silver
        amount: 25000,
        from: 'Reserve',
        to: 'Treasury USDC Wallet',
        status: 'Completed', // COMPLETED
        requestedBy: 'PortfolioMgr',
        approver: 'TreasuryMgr',
        rate: 30.55,
        receivedSymbol: 'USDC',
        receivedAmount: 763750, // 25000 * 30.55
        notes: 'Completed client order for silver.'
    },
     {
        id: 'AO-C-005',
        timestamp: createTimestamp(14, 9), // 2 weeks ago
        type: 'Sale',
        assetId: 'cp-acme-01',
        assetSymbol: 'ACP', // Commercial Paper
        amount: 500000,
        from: 'Reserve',
        to: 'Money Market Fund Client X',
        status: 'Completed', // COMPLETED
        requestedBy: 'Fixed Income Desk',
        approver: 'OpsManager',
        rate: 0.9985,
        receivedSymbol: 'USD',
        receivedAmount: 499250, // 500000 * 0.9985
        notes: 'Secondary market sale of tokenized CP.'
    },
    {
        id: 'AO-C-006',
        timestamp: createTimestamp(20, 3), // 20 days ago
        type: 'Sale',
        assetId: 'cc-verra-01',
        assetSymbol: 'VCC', // Carbon Credit
        amount: 120000,
        from: 'Reserve',
        to: 'Treasury USDC Wallet',
        status: 'Completed', // COMPLETED
        requestedBy: 'Sales Desk',
        approver: 'TreasuryMgr',
        rate: 15.95,
        receivedSymbol: 'USDC',
        receivedAmount: 1914000, // 120000 * 15.95
        notes: 'Large volume carbon credit sale.'
    },
     {
        id: 'AO-C-007',
        timestamp: createTimestamp(25, 11), // 25 days ago
        type: 'Sale',
        assetId: 'xagc-01',
        assetSymbol: 'XAGC', // Silver
        amount: 5000,
        from: 'Reserve',
        to: 'Retail Client USDC Wallet 9876',
        status: 'Completed', // COMPLETED
        requestedBy: 'Retail Platform',
        approver: 'Auto/System',
        rate: 31.05,
        receivedSymbol: 'USDC',
        receivedAmount: 155250, // 5000 * 31.05
        notes: 'Automated retail platform sale execution.'
    },
    {
        id: 'AO-C-008',
        timestamp: createTimestamp(30, 7), // 30 days ago
        type: 'Sale',
        assetId: 'mmf-usd-01',
        assetSymbol: 'MMFUSD', // MMF
        amount: 250000,
        from: 'Reserve',
        to: 'Treasury USD Account',
        status: 'Completed', // COMPLETED
        requestedBy: 'TreasuryOps',
        approver: 'TreasuryMgr',
        rate: 1.00,
        receivedSymbol: 'USD',
        receivedAmount: 250000, // 250000 * 1.00
        notes: 'Redemption equivalent sale for internal rebalancing.'
    },
     // --- You can optionally keep other non-matching orders below if needed ---
     // { id: 'AO-001', ... },
     // { id: 'AO-004', ... }, // Note: Original AO-004 was processing/ETH
     // { id: 'AO-005', ... },
];


const initialAssetOrdersState = {
    // Use the new list and ensure sorting
    assetOrders: initialDummyAssetOrders.sort((a, b) => b.timestamp - a.timestamp),
    isLoading: false,
    error: null,
};

// --- Reducer and Provider code remains the same ---

const ActionTypes = {
    SET_ORDERS: 'SET_ASSET_ORDERS',
    ADD_ORDER: 'ADD_ASSET_ORDER',
    UPDATE_STATUS: 'UPDATE_ASSET_ORDER_STATUS',
};

const assetOrdersReducer = (state, action) => {
    console.log("AssetOrders Reducer Action:", action);
    switch (action.type) {
        case ActionTypes.SET_ORDERS:
            if (!Array.isArray(action.payload)) {
                console.error("Invalid payload for SET_ORDERS: Expected an array.");
                return state;
            }
            return {
                ...state,
                assetOrders: [...action.payload].sort((a, b) => b.timestamp - a.timestamp),
                isLoading: false,
                error: null,
            };

        case ActionTypes.ADD_ORDER:
            if (!action.payload || !action.payload.id || !action.payload.timestamp) {
                console.error("Invalid payload for ADD_ORDER: Missing required fields (id, timestamp).", action.payload);
                return state;
            }
            // Ensure new orders are added correctly and the array remains sorted
            const updatedOrdersAdd = [action.payload, ...state.assetOrders]
                .sort((a, b) => b.timestamp - a.timestamp);
            return {
                ...state,
                assetOrders: updatedOrdersAdd,
            };

        case ActionTypes.UPDATE_STATUS:
            const { orderId, newStatus, approver, notes, errorMsg } = action.payload;
            if (!orderId || !newStatus) {
                console.error("Invalid payload for UPDATE_STATUS: Missing orderId or newStatus.", action.payload);
                return state;
            }
            return {
                ...state,
                assetOrders: state.assetOrders.map(order => {
                    if (order.id === orderId) {
                        const updatedOrder = { ...order, status: newStatus };
                        if (approver !== undefined) updatedOrder.approver = approver;
                        // Ensure notes are appended correctly, especially for errors
                        let combinedNotes = order.notes || '';
                        if (notes !== undefined && notes !== order.notes) { // Append if new note provided
                             combinedNotes = `${combinedNotes ? combinedNotes + '\\n' : ''}${notes}`;
                        }
                        if (newStatus === 'Failed' && errorMsg) {
                             combinedNotes = `${combinedNotes ? combinedNotes + '\\n' : ''}Error: ${errorMsg}`;
                        }
                        updatedOrder.notes = combinedNotes.trim();
                        return updatedOrder;
                    }
                    return order;
                }),
            };

        default:
            console.warn("Unhandled action type in assetOrdersReducer:", action.type);
            return state;
    }
};

const AssetOrdersContext = createContext({
    ...initialAssetOrdersState,
    dispatchAssetOrders: () => null,
});

export const AssetOrdersProvider = ({ children }) => {
    const [state, dispatchAssetOrders] = useReducer(assetOrdersReducer, initialAssetOrdersState);

    // Recalculate context value only when state changes
    const contextValue = useMemo(() => ({
        assetOrders: state.assetOrders,
        isLoading: state.isLoading,
        error: state.error,
        dispatchAssetOrders,
    }), [state.assetOrders, state.isLoading, state.error]); // Removed dispatchAssetOrders from deps


    return (
        <AssetOrdersContext.Provider value={contextValue}>
            {children}
        </AssetOrdersContext.Provider>
    );
};

export const useAssetOrders = () => {
    const context = useContext(AssetOrdersContext);
    if (context === undefined) {
        throw new Error('useAssetOrders must be used within an AssetOrdersProvider');
    }
    return context;
};