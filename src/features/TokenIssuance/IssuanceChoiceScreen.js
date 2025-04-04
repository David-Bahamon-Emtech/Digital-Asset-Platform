import React from 'react';

// This component receives functions as props to handle user selection
const IssuanceChoiceScreen = ({ onSelectNew, onSelectExisting, onBack }) => {
  return (
    <div className="p-8">
       <div className="bg-white p-6 rounded shadow max-w-2xl mx-auto"> {/* Centered card */}
          <div className="flex justify-between items-center mb-6">
             <h1 className="text-2xl font-bold text-gray-800">Select Action</h1> {/* Updated Title */}
             <button
                className="px-3 py-1 rounded text-white hover:opacity-90 bg-gray-800 text-sm"
                onClick={onBack} // Use the onBack prop
             >
                Back to Dashboard
             </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

             {/* --- Option 1: Issue New Token --- */}
             <div className="border rounded-lg p-6 flex flex-col items-center text-center hover:shadow-md transition-shadow">
                {/* Updated Title */}
                <h2 className="text-xl font-semibold mb-3 text-gray-700">Issue a New Token</h2>
                {/* Updated Description */}
                <p className="text-sm text-gray-600 mb-4">Define the properties, rules, and initial supply for a brand new token type.</p>
                <button
                   className="mt-auto px-5 py-2 rounded text-white hover:opacity-90 bg-emtech-gold w-full"
                   onClick={onSelectNew}
                >
                   {/* Updated Button Text */}
                   Issue New Token
                </button>
             </div>

             {/* --- Option 2: Mint Existing Token --- */}
             <div className="border rounded-lg p-6 flex flex-col items-center text-center hover:shadow-md transition-shadow">
                 {/* Updated Title */}
                <h2 className="text-xl font-semibold mb-3 text-gray-700">Mint More Existing Token</h2>
                 {/* Updated Description */}
                <p className="text-sm text-gray-600 mb-4">Create additional units of an already defined token type, increasing its total supply.</p>
                <button
                   className="mt-auto px-5 py-2 rounded text-white hover:opacity-90 bg-emtech-gold w-full"
                   onClick={onSelectExisting}
                >
                   {/* Updated Button Text */}
                   Mint Existing Token
                </button>
             </div>
             {/* --- End Updates --- */}

          </div>
       </div>
    </div>
  );
};

export default IssuanceChoiceScreen;