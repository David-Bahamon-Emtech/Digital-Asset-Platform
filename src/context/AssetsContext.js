// src/context/AssetsContext.js
import React, { createContext, useContext, useReducer } from 'react';
import { generateDummyClientAccounts } from '../utils/dummyData';
import { initialInstitutionalAssets } from '../data/initialData';
import { detailedDummyReserveData } from '../utils/metricsData.js'; // Adjust path if needed

// Helper function to safely parse balance strings
const parseBalance = (balanceStr) => {
    if (typeof balanceStr === 'number') { return balanceStr; }
    if (typeof balanceStr !== 'string') { return null; }
    const cleanedStr = balanceStr
        .replace(/,/g, '')
        .replace(/USD|Shares|Kg|Barrels|VCUs|Units|Tokens/i, '')
        .trim();
    const num = parseFloat(cleanedStr);
    return isNaN(num) ? null : num;
};

// --- Create Initial State ---
const processedInstitutionalAssets = initialInstitutionalAssets.map(asset => {
    const reserveDataDetails = detailedDummyReserveData[asset.id];
    if (reserveDataDetails) {
        let processedAccounts = [];
        if (Array.isArray(reserveDataDetails.accounts)) {
            processedAccounts = reserveDataDetails.accounts.map(acc => ({
                ...acc,
                numericBalance: parseBalance(acc.balance),
                originalBalanceStr: acc.balance
            }));
        }
        const reserveData = {
            ratio: reserveDataDetails.ratio,
            requirement: reserveDataDetails.requirement,
            lastAudit: reserveDataDetails.lastAudit,
            auditor: reserveDataDetails.auditor,
            composition: reserveDataDetails.composition || [],
            accounts: processedAccounts
        };
        return { ...asset, reserveData: reserveData };
    }
    return asset;
});

// Generate initial client accounts
const rawClientAccounts = generateDummyClientAccounts(30); // Or your desired number

// Process client accounts to add simulatedStatus and clientName
const initialStatuses = ['Active', 'Frozen', 'Review']; // Possible statuses
const processedClientAccounts = rawClientAccounts.map((account, index) => ({
  ...account,
  simulatedStatus: initialStatuses[index % initialStatuses.length], // Cycle through statuses for variety
  clientName: account.label.split(' ')[0] + ' Client ' + account.label.split(' ')[2]?.slice(0,4) || `Client ${account.id.slice(-4)}`, // Derive clientName
  isInstitutional: false, // Ensure this flag is explicitly set
}));

const combinedInitialAccounts = [...processedInstitutionalAssets, ...processedClientAccounts];
const initialAssetsState = { assets: combinedInitialAccounts };
console.log("AssetsContext: Initial combined accounts with processed client accounts", initialAssetsState.assets.filter(a => !a.isInstitutional));


// --- Define Action Types ---
const ActionTypes = {
    ADD_ASSET: 'ADD_ASSET',
    UPDATE_ASSET_BALANCE: 'UPDATE_ASSET_BALANCE',
    DECREASE_CIRCULATION: 'DECREASE_CIRCULATION',
    MINT_ASSET: 'MINT_ASSET',
    BURN_ASSET: 'BURN_ASSET',
    REDEEM_ASSET: 'REDEEM_ASSET',
    UPDATE_ASSET_PROPERTY: 'UPDATE_ASSET_PROPERTY',
    SET_ASSETS: 'SET_ASSETS',
};

// --- Reducer function to manage asset state ---
const assetsReducer = (state, action) => {
    console.log('[AssetsContext] Action Dispatched:', action);
    switch (action.type) {
        case ActionTypes.ADD_ASSET: {
            if (state.assets.some(asset => asset.id === action.payload.id || asset.symbol === action.payload.symbol)) {
                console.warn(`Asset with ID ${action.payload.id} or Symbol ${action.payload.symbol} already exists.`);
                return state;
            }
            const newAssetPayload = { ...action.payload };
            if (newAssetPayload.isWizardIssued && newAssetPayload.wizardData?.reserveDetails?.isBackedAsset) {
                newAssetPayload.reserveData = {
                    ratio: 100,
                    requirement: 100,
                    lastAudit: 'N/A (User Issued)',
                    auditor: 'Self-Attested',
                    composition: [{
                        name: `User Defined Backing (${newAssetPayload.wizardData?.reserveDetails?.backingType || 'Unknown'})`,
                        percent: 100.0
                    }],
                    accounts: [{
                        institution: 'Backing Mechanism',
                        type: newAssetPayload.wizardData?.reserveDetails?.backingType || 'Unknown',
                        balance: `Initial: ${newAssetPayload.totalSupplyIssued || 'N/A'}`,
                        numericBalance: newAssetPayload.totalSupplyIssued || 0,
                        originalBalanceStr: `Initial: ${newAssetPayload.totalSupplyIssued || 'N/A'}`,
                        updated: new Date().toLocaleDateString(),
                        status: 'Configured'
                    }]
                };
            }
            return { ...state, assets: [...state.assets, newAssetPayload] };
        }

        case ActionTypes.UPDATE_ASSET_BALANCE: {
            const { assetId, changeAmount } = action.payload;
            if (!assetId || typeof changeAmount !== 'number' || isNaN(changeAmount)) {
                console.error('Invalid payload for UPDATE_ASSET_BALANCE:', action.payload);
                return state;
            }
            return {
                ...state,
                assets: state.assets.map(asset => {
                    if (asset.id === assetId) {
                        const newBalance = Math.max(0, (asset.balance || 0) + changeAmount);
                        console.log(`Updating balance (circulation) for ${asset.symbol}: ${asset.balance} -> ${newBalance} (Change: ${changeAmount})`);
                        if (asset.supply === 'Finite' && typeof asset.totalSupplyIssued === 'number') {
                            const adjustedNewBalance = Math.min(newBalance, asset.totalSupplyIssued);
                            if (adjustedNewBalance !== newBalance) {
                                 console.warn(`[UPDATE_ASSET_BALANCE] Clamped balance for ${asset.symbol} to total supply (${asset.totalSupplyIssued}).`);
                            }
                            return { ...asset, balance: adjustedNewBalance };
                        }
                        return { ...asset, balance: newBalance };
                    }
                    return asset;
                })
            };
        }
        
        case ActionTypes.DECREASE_CIRCULATION: {
            const { assetId, amountToDecrease } = action.payload;
            if (!assetId || typeof amountToDecrease !== 'number' || isNaN(amountToDecrease) || amountToDecrease <= 0) {
                 console.error('Invalid payload for DECREASE_CIRCULATION:', action.payload);
                 return state;
            }
            return { 
                ...state, 
                assets: state.assets.map(asset => {
                     if (asset.id === assetId) {
                         const currentBalance = asset.balance || 0;
                         const newBalance = Math.max(0, currentBalance - amountToDecrease);
                         console.log(`Decreasing circulation for ${asset.symbol}: ${currentBalance} -> ${newBalance} (-${amountToDecrease}). Total supply (${asset.totalSupplyIssued}) unchanged.`);
                         return { ...asset, balance: newBalance }; 
                     }
                     return asset;
                 })
            };
        }

        // *** MINT_ASSET: Merged from detailed version ***
        case ActionTypes.MINT_ASSET: {
            const { assetId, amount } = action.payload;
            if (!assetId || typeof amount !== 'number' || isNaN(amount) || amount <= 0) {
                console.error('Invalid payload for MINT_ASSET:', action.payload);
                return state;
            }

            return {
                ...state,
                assets: state.assets.map(asset => {
                    if (asset.id === assetId) {
                        // Keep current balance (circulation) unchanged for MINT action
                        const currentCirculatingBalance = asset.balance || 0;
                        let newTotalSupplyIssued = asset.totalSupplyIssued;
                        let updatedReserveData = asset.reserveData ? { ...asset.reserveData } : undefined;

                        // Increase total issued supply ONLY if supply is finite
                        if (asset.supply === 'Finite') {
                            newTotalSupplyIssued = (asset.totalSupplyIssued || 0) + amount;

                            // Update reserve account balance if reserveData and accounts exist
                            if (updatedReserveData?.accounts?.length > 0) {
                                const currentReserveBalance = updatedReserveData.accounts[0].numericBalance ?? null;
                                if (currentReserveBalance !== null) {
                                    const newReserveBalance = currentReserveBalance + amount;
                                    const updatedAccounts = updatedReserveData.accounts.map((acc, index) => {
                                        if (index === 0) { // Assuming the first account is the primary reserve backing
                                            const newBalanceStr = newReserveBalance.toLocaleString() + (acc.originalBalanceStr?.match(/\s(.*)/)?.[0] || '');
                                            return { ...acc, numericBalance: newReserveBalance, originalBalanceStr: newBalanceStr };
                                        }
                                        return acc;
                                    });
                                    updatedReserveData.accounts = updatedAccounts;
                                    console.log(`[MINT] Updated reserve account 0 balance for ${asset.symbol} to ${newReserveBalance}`);
                                } else {
                                    console.warn(`[MINT] Could not parse reserve account 0 balance for ${asset.symbol}.`);
                                }
                            } else {
                                console.warn(`[MINT] No reserve accounts found for finite asset ${asset.symbol} to update.`);
                            }
                        } else { // Infinite supply
                            console.log(`[MINT] Minting ${amount} ${asset.symbol} (Infinite Supply): Circulating balance remains ${currentCirculatingBalance}. Total supply not tracked or infinite.`);
                        }
                        console.log(`Minting ${amount} ${asset.symbol}: Circulating Balance ${currentCirculatingBalance} (Unchanged), TotalIssued ${asset.totalSupplyIssued} -> ${newTotalSupplyIssued}`);
                        return { ...asset, balance: currentCirculatingBalance, totalSupplyIssued: newTotalSupplyIssued, reserveData: updatedReserveData };
                    }
                    return asset;
                })
            };
        }

        // *** BURN_ASSET: Merged from detailed version ***
        case ActionTypes.BURN_ASSET: {
            const { assetId, amount } = action.payload;
            if (!assetId || typeof amount !== 'number' || isNaN(amount) || amount <= 0) {
                console.error('Invalid payload for BURN_ASSET:', action.payload);
                return state;
            }
            return {
                ...state,
                assets: state.assets.map(asset => {
                    if (asset.id === assetId) {
                        if (asset.supply === 'Finite' && typeof asset.totalSupplyIssued === 'number') {
                            // Keep balance (circulation) unchanged for BURN action
                            const currentCirculatingBalance = asset.balance || 0;
                            const newTotalSupplyIssued = Math.max(0, asset.totalSupplyIssued - amount);
                            let updatedReserveData = asset.reserveData ? { ...asset.reserveData } : undefined;

                            if (updatedReserveData?.accounts?.length > 0) {
                                const updatedAccounts = updatedReserveData.accounts.map((acc, index) => {
                                    if (index === 0) { // Primary reserve backing
                                        const currentReserveBalance = acc.numericBalance ?? null;
                                        if (currentReserveBalance !== null) {
                                            const newReserveBalance = Math.max(0, currentReserveBalance - amount);
                                            const newBalanceStr = newReserveBalance.toLocaleString() + (acc.originalBalanceStr?.match(/\s(.*)/)?.[0] || '');
                                            console.log(`[BURN] Updated reserve account 0 balance for ${asset.symbol} to ${newReserveBalance}`);
                                            return { ...acc, numericBalance: newReserveBalance, originalBalanceStr: newBalanceStr };
                                        } else {
                                            console.warn(`[BURN] Could not parse reserve account 0 balance for ${asset.symbol}.`);
                                        }
                                    }
                                    // Update SPV ledger if it exists
                                    if (acc.type === 'Issuance Vehicle Ledger') {
                                        const newSpvBalanceStr = newTotalSupplyIssued.toLocaleString() + (acc.originalBalanceStr?.match(/\s(.*)/)?.[0] || ` ${asset.symbol} Tokens`);
                                        console.log(`[BURN] Updated SPV ledger balance for ${asset.symbol} to ${newTotalSupplyIssued}`);
                                        return { ...acc, numericBalance: newTotalSupplyIssued, originalBalanceStr: newSpvBalanceStr };
                                    }
                                    return acc;
                                });
                                updatedReserveData.accounts = updatedAccounts;
                            } else {
                                console.warn(`[BURN] No reserve accounts found for finite asset ${asset.symbol}.`);
                            }
                            console.log(`Burning ${amount} ${asset.symbol}: Circulating Balance ${currentCirculatingBalance} (Unchanged), TotalIssued ${asset.totalSupplyIssued} -> ${newTotalSupplyIssued}`);
                            return { ...asset, balance: currentCirculatingBalance, totalSupplyIssued: newTotalSupplyIssued, reserveData: updatedReserveData };
                        } else {
                            console.warn(`Cannot burn asset ${asset.symbol} as supply is not Finite or totalSupplyIssued is invalid.`);
                            return asset; // Return asset unchanged if not burnable
                        }
                    }
                    return asset;
                })
            };
        }

        // *** REDEEM_ASSET: Merged from detailed version ***
        case ActionTypes.REDEEM_ASSET: {
            const { assetId, amount } = action.payload;
            if (!assetId || typeof amount !== 'number' || isNaN(amount) || amount <= 0) {
                console.error('Invalid payload for REDEEM_ASSET:', action.payload);
                return state;
            }
            return {
                ...state,
                assets: state.assets.map(asset => {
                    if (asset.id === assetId) {
                        // Redemption decreases both balance (circulation) and total supply
                        const newCirculatingBalance = Math.max(0, (asset.balance || 0) - amount);
                        let newTotalSupplyIssued = asset.totalSupplyIssued;
                        let updatedReserveData = asset.reserveData ? { ...asset.reserveData } : undefined;

                        if (asset.supply === 'Finite' && typeof asset.totalSupplyIssued === 'number') {
                            newTotalSupplyIssued = Math.max(0, asset.totalSupplyIssued - amount);

                            if (updatedReserveData?.accounts?.length > 0) {
                                const updatedAccounts = updatedReserveData.accounts.map((acc, index) => {
                                    if (index === 0) { // Primary reserve backing
                                        const currentReserveBalance = acc.numericBalance ?? null;
                                        if (currentReserveBalance !== null) {
                                            const newReserveBalance = Math.max(0, currentReserveBalance - amount);
                                            const newBalanceStr = newReserveBalance.toLocaleString() + (acc.originalBalanceStr?.match(/\s(.*)/)?.[0] || '');
                                            console.log(`[REDEEM] Updated reserve account 0 balance for ${asset.symbol} to ${newReserveBalance}`);
                                            return { ...acc, numericBalance: newReserveBalance, originalBalanceStr: newBalanceStr };
                                        }
                                    }
                                    if (acc.type === 'Issuance Vehicle Ledger') {
                                        const newSpvBalanceStr = newTotalSupplyIssued.toLocaleString() + (acc.originalBalanceStr?.match(/\s(.*)/)?.[0] || ` ${asset.symbol} Tokens`);
                                        console.log(`[REDEEM] Updated SPV ledger balance for ${asset.symbol} to ${newTotalSupplyIssued}`);
                                        return { ...acc, numericBalance: newTotalSupplyIssued, originalBalanceStr: newSpvBalanceStr };
                                    }
                                    return acc;
                                });
                                updatedReserveData.accounts = updatedAccounts;
                            }
                        }
                        console.log(`Redeeming ${amount} ${asset.symbol}: Balance ${asset.balance} -> ${newCirculatingBalance}, TotalIssued ${asset.totalSupplyIssued} -> ${newTotalSupplyIssued}`);
                        return { ...asset, balance: newCirculatingBalance, totalSupplyIssued: newTotalSupplyIssued, reserveData: updatedReserveData };
                    }
                    return asset;
                })
            };
        }

        case ActionTypes.UPDATE_ASSET_PROPERTY: {
            const { assetId, propertyName, propertyValue } = action.payload;
            if (!assetId || !propertyName) {
                console.error('Invalid payload for UPDATE_ASSET_PROPERTY:', action.payload);
                return state;
            }
            console.log(`[AssetsContext] Updating property '${propertyName}' to '${propertyValue}' for asset '${assetId}'`);
            return {
                ...state,
                assets: state.assets.map(asset =>
                    asset.id === assetId ? { ...asset, [propertyName]: propertyValue } : asset
                )
            };
        }

        case ActionTypes.SET_ASSETS: {
            if (!Array.isArray(action.payload)) {
                console.error('Invalid payload for SET_ASSETS: Payload must be an array.');
                return state;
            }
            return { ...state, assets: action.payload };
        }

        default:
             console.warn(`[AssetsContext] Unhandled action type: ${action.type}`);
            return state;
    }
};

const AssetsContext = createContext(initialAssetsState);

export const AssetsProvider = ({ children }) => {
    const [state, dispatchAssets] = useReducer(assetsReducer, initialAssetsState);
    return (
        <AssetsContext.Provider value={{ assets: state.assets, dispatchAssets }}>
            {children}
        </AssetsContext.Provider>
    );
};

export const useAssets = () => {
    const context = useContext(AssetsContext);
    if (context === undefined) {
        throw new Error('useAssets must be used within an AssetsProvider');
    }
    return context;
};
