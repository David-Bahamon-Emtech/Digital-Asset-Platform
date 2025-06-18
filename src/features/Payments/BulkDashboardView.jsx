import React from 'react';
// Import the new components
import ActiveBulkFilesTable from './ActiveBulkFilesTable.jsx';
import BulkSummaryStats from './BulkSummaryStats.jsx';

// --- Main BulkDashboardView Component ---
const BulkDashboardView = ({
    onNavigate,
    fullPaymentHistory = [], // Expects the complete history list for calculations
    activeBulkFiles = [],    // Expects the list of active files
    onViewActiveFile,        // Handler for view action
    onEditActiveFile,        // Handler for edit action
    onDeleteActiveFile,      // Handler for delete action
    // onHistoryRowClick     // Kept in case needed later, but unused by current structure
}) => {

    return (
        <div>
             {/* Top summary stats removed as requested */}

             {/* Main Action Buttons (Unchanged) */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
               {/* Upload File Card */}
               <div className="bg-white p-6 rounded shadow">
                 <h2 className="font-bold border-b pb-2 mb-4 text-gray-800">Upload New Payment File</h2>
                 <p className="text-sm text-gray-600 mb-4">Process multiple payments from a CSV, XML, or ISO 20022 formatted file.</p>
                 <ul className="space-y-2 mb-6 text-sm">
                    <li className="flex items-center"><svg className="h-5 w-5 text-green-600 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>Support for multiple file formats</li>
                    <li className="flex items-center"><svg className="h-5 w-5 text-green-600 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>Automatic validation and error checking</li>
                    <li className="flex items-center"><svg className="h-5 w-5 text-green-600 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>Batch processing with detailed reporting</li>
                 </ul>
                 <button className="px-4 py-2 rounded text-white hover:opacity-90 bg-emtech-gold w-full sm:w-auto" onClick={() => onNavigate('upload-bulk-file')}>
                   Upload Payment File
                 </button>
               </div>
                {/* Create Template Card */}
               <div className="bg-white p-6 rounded shadow">
                 <h2 className="font-bold border-b pb-2 mb-4 text-gray-800">Create Bulk Payment Template</h2>
                 <p className="text-sm text-gray-600 mb-4">Design and save templates for recurring bulk payments to streamline future processing.</p>
                  <ul className="space-y-2 mb-6 text-sm">
                    <li className="flex items-center"><svg className="h-5 w-5 text-green-600 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>Save common payment configurations</li>
                    <li className="flex items-center"><svg className="h-5 w-5 text-green-600 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>Standardize bulk payment formats</li>
                    <li className="flex items-center"><svg className="h-5 w-5 text-green-600 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>Schedule recurring bulk payments</li>
                 </ul>
                 <button className="px-4 py-2 rounded text-white hover:opacity-90 bg-emtech-gold w-full sm:w-auto" onClick={() => onNavigate('create-bulk-template')}>
                   Create Template
                 </button>
               </div>
             </div>

            {/* --- Renders Active Bulk Files Table --- */}
            <ActiveBulkFilesTable
                activeBulkFiles={activeBulkFiles}
                onViewActiveFile={onViewActiveFile}
                onEditActiveFile={onEditActiveFile}
                onDeleteActiveFile={onDeleteActiveFile}
            />
            {/* --- END Active Bulk Files Table Section --- */}


            {/* --- Renders Bulk Summary Stats Section --- */}
            <BulkSummaryStats
                fullPaymentHistory={fullPaymentHistory}
            />
            {/* --- END Bulk Summary Stats Section --- */}

        </div> // End main container
    );
};

export default BulkDashboardView;

