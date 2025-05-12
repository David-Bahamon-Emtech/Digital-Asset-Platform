import React from 'react';

// --- Import centralized utilities ---
// Adjust path if utils is elsewhere relative to features/Payments
import { renderError } from '../../utils/displayUtils'; // IMPORTED

// NOTE: Local renderError definition REMOVED

const TraditionalPaymentFields = ({
    paymentType, // To conditionally render
    traditionalRail,
    setTraditionalRail,
    settlementSpeed,
    setSettlementSpeed,
    traditionalRailsList, // Pass the list data as prop (from constants)
    settlementSpeeds,     // Pass the speed data as prop (from constants)
    error,                // Pass potential error for rail selection (from parent state)
    clearError            // Pass function to clear the error on change (from parent)
}) => {

    // Only render if the payment type is 'traditional'
    if (paymentType !== 'traditional') {
        return null;
    }

    return (
        // Wrap in a div with common styling like OnChainPaymentFields for consistency
        <div className="mb-6 pt-4 border-t border-gray-200">
            <h3 className="text-md font-medium text-gray-800 mb-3">Traditional Details</h3>
            {/* --- Payment Rail (Traditional Only) --- */}
            <div className="mb-4"> {/* Reduced bottom margin within the group */}
                <label htmlFor="traditionalRail" className="block mb-1 text-sm font-medium text-gray-700">Payment Rail <span className="text-red-600">*</span></label>
                <select
                    id="traditionalRail"
                    className={`w-full p-2 border rounded bg-white text-sm ${error ? 'border-red-500' : 'border-gray-300'}`}
                    value={traditionalRail}
                    onChange={(e) => {
                        setTraditionalRail(e.target.value);
                        if (clearError) clearError(); // Clear error on change
                    }}
                    required={paymentType === 'traditional'}
                >
                    {/* Use prop traditionalRailsList */}
                    {traditionalRailsList.map(rail => (<option key={rail.code} value={rail.code} disabled={rail.code === ''}>{rail.name}</option>))}
                </select>
                {renderError(error)} {/* USE IMPORTED RENDER ERROR */}
                <p className="text-xs text-gray-500 mt-1">Select the network or system used for this traditional payment.</p>
            </div>

            {/* --- Settlement Speed (Traditional Only) --- */}
             <div className="mb-4"> {/* Reduced bottom margin */}
                 <label htmlFor="settlementSpeed" className="block mb-1 text-sm font-medium text-gray-700">Settlement Speed</label>
                 <select
                    id="settlementSpeed"
                    className="w-full p-2 border rounded bg-white text-sm border-gray-300"
                    value={settlementSpeed}
                    onChange={(e) => setSettlementSpeed(e.target.value)}
                 >
                     {/* Use prop settlementSpeeds */}
                     {Object.entries(settlementSpeeds).map(([key, value]) => (<option key={key} value={key}>{value.label}</option>))}
                 </select>
                  <p className="text-xs text-gray-500 mt-1">Select the desired processing speed (fees may apply).</p>
             </div>
        </div> // End wrapper div
    );
};

export default TraditionalPaymentFields;