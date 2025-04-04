import React from 'react';

// This component receives functions as props to handle user selection
const IssuanceChoiceScreen = ({ onSelectNew, onSelectExisting, onBack }) => {
  return (
    <div className="p-8">
       <div className="bg-white p-6 rounded shadow max-w-2xl mx-auto"> {/* Centered card */}
          <div className="flex justify-between items-center mb-6">
             <h1 className="text-2xl font-bold text-gray-800">Select Issuance Type</h1>
             <button
                className="px-3 py-1 rounded text-white hover:opacity-90 bg-gray-800 text-sm"
                onClick={onBack} // Use the onBack prop
             >
                Back to Dashboard
             </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {/* Option 1: Issue New Token */}
             <div className="border rounded-lg p-6 flex flex-col items-center text-center hover:shadow-md transition-shadow">
                <h2 className="text-xl font-semibold mb-3 text-gray-700">Issue a Completely New Token</h2>
                <p className="text-sm text-gray-600 mb-4">Define and launch a brand new token type with its own specific rules, supply, and metadata.</p>
                <button
                   className="mt-auto px-5 py-2 rounded text-white hover:opacity-90 bg-emtech-gold w-full" // Button takes full width
                   onClick={onSelectNew} // Call the onSelectNew prop function
                >
                   Create New Token
                </button>
             </div>

             {/* Option 2: Issue More of Existing Token */}
             <div className="border rounded-lg p-6 flex flex-col items-center text-center hover:shadow-md transition-shadow">
                <h2 className="text-xl font-semibold mb-3 text-gray-700">Issue More of an Existing Token</h2>
                <p className="text-sm text-gray-600 mb-4">Increase the supply of a token type that has already been defined (e.g., add more USDC, USDT).</p>
                <button
                   className="mt-auto px-5 py-2 rounded text-white hover:opacity-90 bg-emtech-gold w-full" // Different color maybe?
                   onClick={onSelectExisting} // Call the onSelectExisting prop function
                >
                   Issue Existing Token
                </button>
             </div>
          </div>
       </div>
    </div>
  );
};

export default IssuanceChoiceScreen;