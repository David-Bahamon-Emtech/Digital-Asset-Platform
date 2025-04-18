import React, { createContext, useContext, useReducer } from 'react';
import { generateDummyClientAccounts } from '../utils/dummyData';
import { initialInstitutionalAssets } from '../data/initialData';

const initialClientAccounts = generateDummyClientAccounts(30);
const combinedInitialAccounts = [
    ...initialInstitutionalAssets,
    ...initialClientAccounts
];

const initialAssetsState = {
    assets: combinedInitialAccounts,
};

const assetsReducer = (state, action) => {
    switch (action.type) {
        case 'ADD_ASSET':
            if (state.assets.some(asset => asset.id === action.payload.id || asset.symbol === action.payload.symbol)) {
                console.warn(`Asset with ID ${action.payload.id} or Symbol ${action.payload.symbol} already exists.`);
                return state;
            }
            return {
                ...state,
                assets: [...state.assets, action.payload],
            };
        case 'UPDATE_ASSET_BALANCE': {
            const { assetId, changeAmount } = action.payload;
            if (!assetId || typeof changeAmount !== 'number' || isNaN(changeAmount)) {
                console.error('Invalid payload for UPDATE_ASSET_BALANCE:', action.payload);
                return state;
            }
            const updatedAssets = state.assets.map(asset => {
                if (asset.id === assetId) {
                    const newBalance = Math.max(0, asset.balance + changeAmount);
                    return { ...asset, balance: newBalance };
                }
                return asset;
            });
            return {
                ...state,
                assets: updatedAssets,
            };
        }
        case 'UPDATE_ASSET_PROPERTY': {
            const { assetId, propertyName, propertyValue } = action.payload;
             if (!assetId || !propertyName) {
                 console.error('Invalid payload for UPDATE_ASSET_PROPERTY:', action.payload);
                 return state;
             }
            return {
                ...state,
                assets: state.assets.map(asset =>
                    asset.id === assetId ? { ...asset, [propertyName]: propertyValue } : asset
                )
            };
        }
        case 'SET_ASSETS':
             if (!Array.isArray(action.payload)) {
                  console.error('Invalid payload for SET_ASSETS: Payload must be an array.');
                  return state;
             }
            return {
                ...state,
                assets: action.payload,
            };
        default:
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