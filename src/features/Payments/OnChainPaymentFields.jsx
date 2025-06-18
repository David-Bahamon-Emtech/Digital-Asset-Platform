// src/features/Payments/OnChainPaymentFields.js
// Assuming this file lives directly under src/features/Payments/
import React from 'react';

// --- Import centralized utilities ---
// Adjust path if utils is elsewhere relative to features/Payments
import { renderError } from '../../utils/displayUtils.jsx'; // IMPORTED

// NOTE: Local renderError definition REMOVED

const OnChainPaymentFields = ({
    paymentType,
    paymentOrigin,
    selectedSenderAsset, // Needed to infer network for institutional
    onChainNetwork,      // State for client network selection
    setOnChainNetwork,   // Setter for client network selection
    onChainNetworksList, // Data for dropdown (passed from parent)
    error,               // Potential error for client network selection (passed from parent)
    clearError           // Function to clear the error on change (passed from parent)
}) => {

    // Only render if the payment type is 'on-chain'
    if (paymentType !== 'on-chain') {
        return null;
    }

    return (
        // Added margin/border for visual separation within the main form
        <div className="mb-6 pt-4 border-t border-gray-200">
            <h3 className="text-md font-medium text-gray-800 mb-3">On-Chain Details</h3>
            {/* Client Origin: Show Dropdown */}
            {paymentOrigin === 'client' && (
                <>
                    <label htmlFor="onChainNetwork" className="block mb-1 text-sm font-medium text-gray-700">Destination Network <span className="text-red-600">*</span></label>
                    <select
                        id="onChainNetwork"
                        className={`w-full p-2 border rounded bg-white text-sm ${error ? 'border-red-500' : 'border-gray-300'}`}
                        value={onChainNetwork}
                        onChange={(e) => {
                            setOnChainNetwork(e.target.value);
                            if (clearError) clearError(); // Clear error on change
                        }}
                        required={paymentType === 'on-chain' && paymentOrigin === 'client'}
                    >
                        {/* Use prop onChainNetworksList */}
                        {onChainNetworksList.map(net => (<option key={net.code} value={net.code} disabled={net.code === ''}>{net.name}</option>))}
                    </select>
                    {renderError(error)} {/* USE IMPORTED RENDER ERROR */}
                     <p className="text-xs text-gray-500 mt-1">Select the blockchain network for this transfer.</p>
                </>
            )}

            {/* Institutional Origin: Show Inferred Network */}
            {paymentOrigin === 'institutional' && (
                 <>
                    <label htmlFor="institutionalNetwork" className="block mb-1 text-sm font-medium text-gray-700">Source Network (from Asset)</label>
                    <input
                        type="text"
                        id="institutionalNetwork"
                        value={selectedSenderAsset?.blockchain || 'N/A'}
                        className="w-full p-2 border border-gray-300 rounded bg-gray-100 text-sm cursor-not-allowed"
                        readOnly
                        disabled
                    />
                    {/* Show warning only if asset selected but no blockchain */}
                    {!selectedSenderAsset?.blockchain && selectedSenderAsset && (
                         <p className="text-xs text-yellow-600 mt-1">Warning: Selected asset doesn't specify a blockchain.</p>
                    )}
                     <p className="text-xs text-gray-500 mt-1">The network is determined by the selected institutional asset.</p>
                </>
            )}
        </div>
    );
};

export default OnChainPaymentFields;