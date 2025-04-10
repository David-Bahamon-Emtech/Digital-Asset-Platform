// src/features/Payments/BulkDashboardView.js
import React from 'react';
// Import the reusable history table
import PaymentHistoryTable from './PaymentHistoryTable';

// NOTE: activeBulkFiles and recentBulkActivity definitions REMOVED
// NOTE: Placeholder handlers (handleViewHistory, handleViewReports, handleViewFile etc.) REMOVED as they related to the old static table

// --- Component ---
// Expects onNavigate, history (filtered Bulk history), and onHistoryRowClick props
const BulkDashboardView = ({
    onNavigate,
    history = [], // Use prop, default to empty array
    onHistoryRowClick
}) => {

    return (
        <div>
             {/* Summary Stats (Kept static for demo purposes) */}
             <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
               {/* Using placeholder numbers now as activeBulkFiles is removed */}
               <div className="bg-white p-4 rounded shadow"> <h3 className="text-sm text-gray-500 mb-1">Active/Pending Files</h3> <p className="text-2xl font-bold">2</p> <p className="text-xs text-blue-600">Placeholder</p> </div>
               <div className="bg-white p-4 rounded shadow"> <h3 className="text-sm text-gray-500 mb-1">Transactions Pending</h3> <p className="text-2xl font-bold">2,458</p> <p className="text-xs text-blue-600">$12.3M total value</p> </div>
               <div className="bg-white p-4 rounded shadow"> <h3 className="text-sm text-gray-500 mb-1">Processing Efficiency</h3> <p className="text-2xl font-bold">99.8%</p> <p className="text-xs text-green-600">+0.2%</p> </div>
               <div className="bg-white p-4 rounded shadow"> <h3 className="text-sm text-gray-500 mb-1">Last File Processed</h3> <p className="text-lg font-bold">Apr 7, 2025 | 4:30 PM</p> <p className="text-xs text-gray-500">Expense file - 155 items</p> </div>
             </div>

             {/* Main Action Buttons (Unchanged - Use onNavigate) */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
               {/* Upload File Card */}
               <div className="bg-white p-6 rounded shadow">
                 <h2 className="font-bold border-b pb-2 mb-4 text-gray-800">Upload New Payment File</h2>
                 <p className="text-sm text-gray-600 mb-4">Process multiple payments from a CSV, XML, or ISO 20022 formatted file.</p>
                 <ul className="space-y-2 mb-6 text-sm">
                    {/* List items unchanged */}
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
                    {/* List items unchanged */}
                    <li className="flex items-center"><svg className="h-5 w-5 text-green-600 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>Save common payment configurations</li>
                    <li className="flex items-center"><svg className="h-5 w-5 text-green-600 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>Standardize bulk payment formats</li>
                    <li className="flex items-center"><svg className="h-5 w-5 text-green-600 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>Schedule recurring bulk payments</li>
                 </ul>
                 {/* Navigate to placeholder for now, update if create template screen exists */}
                 <button className="px-4 py-2 rounded text-white hover:opacity-90 bg-emtech-gold w-full sm:w-auto" onClick={() => onNavigate('create-bulk-template')}>
                   Create Template
                 </button>
               </div>
             </div>

            {/* --- REMOVED Active Bulk Files Table --- */}

            {/* --- REMOVED Quick Stats / Activity Grids --- */}

            {/* --- ADDED Reusable Payment History Table --- */}
            {/* This will now show history entries related to bulk submissions/processing from central history */}
             <PaymentHistoryTable
                 history={history} // Pass filtered history from props
                 onRowClick={onHistoryRowClick} // Pass row click handler from props
                 title="Recent Bulk Activity / History" // Updated title
                 // Add onViewAllClick prop later if needed for navigation to full bulk history
                 // onViewAllClick={() => onNavigate('bulk-history-list')}
             />
            {/* --- END ADDED History Table --- */}

        </div> // End main container
    );
};

export default BulkDashboardView;