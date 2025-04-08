// src/features/Payments/BulkDashboardView.js
import React from 'react';

// --- Simulated Data ---
const activeBulkFiles = [
    { id: 'bf1', name: 'Vendor_Payments_Mar2025.csv', uploaded: 'Mar 4, 2025', type: 'Vendor Payments', payments: '942 / 942', value: '$3,854,216.42', scheduleDate: '2025-04-08', scheduleTime: '2:00 PM UTC', status: 'Scheduled' }, // Assuming today is Apr 8
    { id: 'bf2', name: 'Payroll_Distribution_Apr15.iso', uploaded: 'Apr 3, 2025', type: 'Payroll', payments: '1,248 / 1,248', value: '$5,875,432.12', scheduleDate: '2025-04-14', scheduleTime: '11:00 PM UTC', status: 'Validated' },
    { id: 'bf3', name: 'Affiliate_Payments_Q1.xml', uploaded: 'Mar 1, 2025', type: 'Partner Payments', payments: '268 / 268', value: '$2,541,876.33', scheduleDate: '2025-04-08', scheduleTime: '5:00 PM UTC', status: 'Scheduled' },
    { id: 'bf4', name: 'Expense_Reimbursements_Apr.csv', uploaded: 'Apr 7, 2025', type: 'Expenses', payments: '153 / 155', value: '$45,231.98', scheduleDate: '2025-04-09', scheduleTime: '9:00 AM UTC', status: 'Processing Error' },
];

const recentBulkActivity = [
    { id: 'act1', text: 'Expense_Reimbursements_Apr.csv uploaded', time: 'Apr 7, 2025 - 4:10 PM', status: 'upload' },
    { id: 'act2', text: 'Payroll_Distribution_Apr15.iso validated', time: 'Apr 3, 2025 - 11:05 AM', status: 'success' },
    { id: 'act3', text: 'Vendor_Payments_Mar2025.csv scheduled', time: 'Mar 4, 2025 - 2:15 PM', status: 'success' },
    { id: 'act4', text: 'Affiliate_Payments_Q1.xml uploaded', time: 'Mar 1, 2025 - 9:30 AM', status: 'upload' },
];

// --- Component ---
const BulkDashboardView = ({ onNavigate }) => { // Expects onNavigate prop

    // Placeholder Handlers
    const handleViewHistory = () => console.log("View Bulk History");
    const handleViewReports = () => console.log("View Bulk Reports");
    const handleViewFile = (fileId) => console.log("View File:", fileId);
    const handleEditFile = (fileId) => console.log("Edit File:", fileId);
    const handleDeleteFile = (fileId) => console.log("Delete File:", fileId);


    return (
        <div>
             {/* Summary Stats */}
             <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
               <div className="bg-white p-4 rounded shadow"> <h3 className="text-sm text-gray-500 mb-1">Active Bulk Files</h3> <p className="text-2xl font-bold">{activeBulkFiles.filter(f => f.status === 'Scheduled' || f.status === 'Validated').length}</p> <p className="text-xs text-green-600">{activeBulkFiles.filter(f => f.scheduleDate === '2025-04-08').length} scheduled for today</p> </div>
               <div className="bg-white p-4 rounded shadow"> <h3 className="text-sm text-gray-500 mb-1">Transactions Pending</h3> <p className="text-2xl font-bold">2,458</p> <p className="text-xs text-blue-600">$12.3M total value</p> </div>
               <div className="bg-white p-4 rounded shadow"> <h3 className="text-sm text-gray-500 mb-1">Processing Efficiency</h3> <p className="text-2xl font-bold">99.8%</p> <p className="text-xs text-green-600">+0.2%</p> </div>
               <div className="bg-white p-4 rounded shadow"> <h3 className="text-sm text-gray-500 mb-1">Last File Processed</h3> <p className="text-lg font-bold">Apr 7, 2025 | 4:30 PM</p> <p className="text-xs text-gray-500">Expense file - 155 items</p> </div>
             </div>

             {/* Main Action Buttons */}
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

            {/* Active Bulk Files Table */}
             <div className="bg-white p-6 rounded shadow mb-6">
               <div className="flex justify-between items-center mb-4">
                 <h2 className="font-bold text-gray-800">Active Bulk Payment Files</h2>
                 <div className="flex space-x-2">
                   <button onClick={handleViewHistory} className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 text-sm"> View History </button>
                   <button onClick={handleViewReports} className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 text-sm"> View Reports </button>
                 </div>
               </div>
               <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                    <thead>
                        <tr>
                            <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left">File Name</th>
                            <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left">Type</th>
                            <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left">Payments</th>
                            <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left">Total Value</th>
                            <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left">Schedule</th>
                            <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left">Status</th>
                            <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {activeBulkFiles.length > 0 ? activeBulkFiles.map((file) => (
                        <tr key={file.id} className="hover:bg-gray-50">
                            <td className="py-3 px-4 border-b border-gray-200"> <div> <p className="font-medium">{file.name}</p> <p className="text-xs text-gray-500">Uploaded {file.uploaded}</p> </div> </td>
                            <td className="py-3 px-4 border-b border-gray-200">{file.type}</td>
                            <td className="py-3 px-4 border-b border-gray-200">{file.payments}</td>
                            <td className="py-3 px-4 border-b border-gray-200 font-medium">{file.value}</td>
                            <td className="py-3 px-4 border-b border-gray-200"> <div> <p>{file.scheduleDate}</p> <p className="text-xs text-gray-500">{file.scheduleTime}</p> </div> </td>
                            <td className="py-3 px-4 border-b border-gray-200">
                                <span className={`inline-block px-2 py-1 text-xs rounded-full capitalize ${
                                    file.status === 'Scheduled' ? 'bg-yellow-100 text-yellow-800' :
                                    file.status === 'Validated' ? 'bg-blue-100 text-blue-800' :
                                    file.status === 'Processing Error' ? 'bg-red-100 text-red-800' :
                                    file.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                }`}>{file.status}</span>
                            </td>
                            <td className="py-3 px-4 border-b border-gray-200">
                                <div className="flex justify-center space-x-1">
                                    <button title="View Details" onClick={() => handleViewFile(file.id)} className="p-1 text-blue-600 hover:bg-blue-50 rounded"> <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg> </button>
                                    <button title="Edit" onClick={() => handleEditFile(file.id)} className="p-1 text-blue-600 hover:bg-blue-50 rounded"> <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg> </button>
                                    <button title="Delete" onClick={() => handleDeleteFile(file.id)} className="p-1 text-red-600 hover:bg-red-50 rounded"> <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg> </button>
                                </div>
                            </td>
                        </tr>
                        )) : (
                            <tr><td colSpan="7" className="text-center py-6 text-gray-500 italic">No active bulk files found.</td></tr>
                        )}
                    </tbody>
                    </table>
               </div>
             </div>

            {/* Quick Stats / Activity */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="bg-white p-4 rounded shadow"> <h3 className="font-medium border-b pb-2 mb-3 text-gray-800 text-sm">File Processing Stats (30d)</h3> <div className="flex justify-between mb-1 text-sm"> <span className="text-gray-600">Files Processed:</span> <span className="font-medium">28</span> </div> <div className="flex justify-between mb-1 text-sm"> <span className="text-gray-600">Total Payments:</span> <span className="font-medium">14,253</span> </div> <div className="flex justify-between mb-1 text-sm"> <span className="text-gray-600">Total Value:</span> <span className="font-medium">$64.7M</span> </div> <div className="flex justify-between text-sm"> <span className="text-gray-600">Avg. Time:</span> <span className="font-medium">3.2 min</span> </div> </div>
               <div className="bg-white p-4 rounded shadow"> <h3 className="font-medium border-b pb-2 mb-3 text-gray-800 text-sm">Common File Formats</h3> <div className="space-y-2 mt-1"> <div> <div className="flex justify-between mb-0.5 text-xs"> <span className="text-gray-600">CSV</span> <span className="font-medium">42%</span> </div> <div className="w-full bg-gray-200 rounded-full h-1.5"> <div className="bg-emtech-gold h-1.5 rounded-full" style={{ width: '42%' }}></div> </div> </div> <div> <div className="flex justify-between mb-0.5 text-xs"> <span className="text-gray-600">ISO 20022 XML</span> <span className="font-medium">35%</span> </div> <div className="w-full bg-gray-200 rounded-full h-1.5"> <div className="bg-emtech-gold h-1.5 rounded-full" style={{ width: '35%' }}></div> </div> </div> <div> <div className="flex justify-between mb-0.5 text-xs"> <span className="text-gray-600">ACH</span> <span className="font-medium">15%</span> </div> <div className="w-full bg-gray-200 rounded-full h-1.5"> <div className="bg-emtech-gold h-1.5 rounded-full" style={{ width: '15%' }}></div> </div> </div> <div> <div className="flex justify-between mb-0.5 text-xs"> <span className="text-gray-600">Other</span> <span className="font-medium">8%</span> </div> <div className="w-full bg-gray-200 rounded-full h-1.5"> <div className="bg-emtech-gold h-1.5 rounded-full" style={{ width: '8%' }}></div> </div> </div> </div> </div>
               <div className="bg-white p-4 rounded shadow"> <h3 className="font-medium border-b pb-2 mb-3 text-gray-800 text-sm">Recent Activity</h3> <div className="space-y-3">
                {recentBulkActivity.slice(0, 3).map(activity => ( // Show top 3
                    <div key={activity.id} className="flex items-start">
                         <div className={`h-5 w-5 rounded-full ${activity.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                           {activity.status === 'success' ? <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> : <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" /></svg>}
                         </div>
                         <div className="ml-2"> <p className="text-xs leading-tight">{activity.text}</p> <p className="text-xs text-gray-500">{activity.time}</p> </div>
                     </div>
                ))}
               </div> </div>
             </div>

        </div> // End main container
    );
};

export default BulkDashboardView;