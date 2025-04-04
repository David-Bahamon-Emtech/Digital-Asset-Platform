import React from 'react';

/**
 * Displays a screen allowing the user to choose between initiating the issuance
 * of a completely new token type or minting more units of an existing token type.
 * It uses callback functions passed via props to trigger the navigation to the
 * appropriate next step or back to the dashboard.
 *
 * @param {object} props - Component props.
 * @param {function} props.onSelectNew - Callback function executed when the user chooses to issue a new token. Typically navigates to the TokenIssuanceWizard.
 * @param {function} props.onSelectExisting - Callback function executed when the user chooses to mint an existing token. Typically navigates to the screen for selecting an existing token.
 * @param {function} props.onBack - Callback function executed when the user clicks the 'Back' button. Typically navigates back to the main TokenDashboard view.
 */
const IssuanceChoiceScreen = ({ onSelectNew, onSelectExisting, onBack }) => {
  return (
    <div className="p-8">
       {/* Centered card container */}
       <div className="bg-white p-6 rounded shadow max-w-2xl mx-auto">
          {/* Header with Title and Back button */}
          <div className="flex justify-between items-center mb-6">
             <h1 className="text-2xl font-bold text-gray-800">Select Action</h1>
             <button
                className="px-3 py-1 rounded text-white hover:opacity-90 bg-gray-800 text-sm"
                onClick={onBack} // Trigger the onBack callback
             >
                Back to Dashboard
             </button>
          </div>

          {/* Grid container for the two choices */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

             {/* Option 1: Issue New Token */}
             <div className="border rounded-lg p-6 flex flex-col items-center text-center hover:shadow-md transition-shadow">
                <h2 className="text-xl font-semibold mb-3 text-gray-700">Issue a New Token</h2>
                <p className="text-sm text-gray-600 mb-4">Define the properties, rules, and initial supply for a brand new token type.</p>
                <button
                   className="mt-auto px-5 py-2 rounded text-white hover:opacity-90 bg-emtech-gold w-full"
                   onClick={onSelectNew} // Trigger the onSelectNew callback
                >
                   Issue New Token
                </button>
             </div>

             {/* Option 2: Mint Existing Token */}
             <div className="border rounded-lg p-6 flex flex-col items-center text-center hover:shadow-md transition-shadow">
                <h2 className="text-xl font-semibold mb-3 text-gray-700">Mint More Existing Token</h2>
                <p className="text-sm text-gray-600 mb-4">Create additional units of an already defined token type, increasing its total supply.</p>
                <button
                   className="mt-auto px-5 py-2 rounded text-white hover:opacity-90 bg-emtech-gold w-full"
                   onClick={onSelectExisting} // Trigger the onSelectExisting callback
                >
                   Mint Existing Token
                </button>
             </div>

          </div> {/* End grid */}
       </div> {/* End card */}
    </div> // End container
  );
};

export default IssuanceChoiceScreen;