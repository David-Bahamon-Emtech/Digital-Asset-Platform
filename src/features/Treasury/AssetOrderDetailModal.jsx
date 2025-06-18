import React from 'react';
import { format } from 'date-fns';
import { formatNumber, getStatusClass } from '../../utils/displayUtils.jsx'; // Adjust path if needed

const AssetOrderDetailModal = ({ order, isOpen, onClose }) => {
    if (!isOpen || !order) {
        return null;
    }

    // --- Dummy Data Generation ---
    const dummyApprovals = [
        { user: order.requestedBy || 'Unknown', action: 'Requested', timestamp: order.timestamp },
        ...(order.status !== 'Pending Approval' && order.approver ? [{ user: order.approver, action: order.status === 'Failed' ? 'Rejected' : 'Approved', timestamp: new Date(new Date(order.timestamp).getTime() + 3600000) }] : []),
    ];

    const dummyStatusHistory = [
         { status: 'Pending Approval', timestamp: order.timestamp },
         ...(order.status === 'Processing' ? [{ status: 'Processing', timestamp: new Date(new Date(order.timestamp).getTime() + 3600000)}] : []),
         ...(order.status === 'Completed' ? [{ status: 'Processing', timestamp: new Date(new Date(order.timestamp).getTime() + 3600000)}, { status: 'Completed', timestamp: new Date(new Date(order.timestamp).getTime() + 7200000)}] : []),
         ...(order.status === 'Failed' ? [{ status: 'Failed', timestamp: new Date(new Date(order.timestamp).getTime() + 3600000)}] : []),
    ];

    const dummyDocuments = order.type === 'Purchase' ? ['Purchase_Order_123.pdf', 'Vendor_Invoice_456.pdf'] :
                           order.type === 'Sale' ? ['Sale_Confirmation_ABC.eml'] :
                           order.type === 'FX Conversion' ? ['FX_Deal_Ticket_789.txt'] :
                           [];


    // --- Helper Function to Render Detail Item ---
    const DetailItem = ({ label, value, isStatus = false, isNote = false }) => {
        // Don't render if value is essentially empty, unless it's the notes field which might intentionally be empty
        if (!isNote && (value === null || value === undefined || value === '')) return null;

        return (
            <div className="py-2 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt className="text-sm font-medium text-gray-500">{label}</dt>
                <dd className={`mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 ${isNote ? 'whitespace-pre-wrap' : ''}`}>
                    {isStatus ? (
                        <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(value)}`}>
                            {value}
                        </span>
                    ) : (
                        value // Render notes or other values directly
                    )}
                     {/* Render empty notes explicitly if needed */}
                     {isNote && !value && <span className="text-gray-400 italic">None</span>}
                </dd>
            </div>
        );
    };

    // --- Render Component ---
    return (
        // Modal Backdrop
        <div
            className="fixed inset-0 z-50 overflow-y-auto bg-gray-600 bg-opacity-75 transition-opacity duration-300 ease-out flex items-center justify-center p-4"
            onClick={onClose}
            aria-labelledby="modal-title"
            role="dialog"
            aria-modal="true"
        >
            {/* Modal Panel */}
            <div
                className="relative bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-2xl md:max-w-3xl lg:max-w-4xl w-full"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <div className="sm:flex sm:items-start">
                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                            <h3 className="text-lg leading-6 font-medium text-gray-900 border-b pb-2" id="modal-title">
                                Asset Order Details: {order.id}
                            </h3>
                        </div>
                        <button
                            onClick={onClose}
                            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-2xl leading-none focus:outline-none"
                            aria-label="Close modal"
                        >
                            &times;
                        </button>
                    </div>
                </div>

                {/* Body - Scrollable */}
                <div className="px-4 sm:px-6 py-4 max-h-[70vh] overflow-y-auto">
                    {/* Basic Order Information Section */}
                     <div className="mb-6 border border-gray-200 rounded-md p-4">
                        <h4 className="text-md font-semibold text-gray-700 mb-3">Order Information</h4>
                        <dl className="divide-y divide-gray-200">
                            <DetailItem label="Order ID" value={order.id} />
                            <DetailItem label="Timestamp" value={format(new Date(order.timestamp), 'PPpp')} />
                            <DetailItem label="Type" value={order.type} />
                            <DetailItem label="Status" value={order.status} isStatus={true} />
                            <DetailItem label="Asset" value={order.assetSymbol} />
                            <DetailItem label="Amount" value={formatNumber(order.amount)} />
                            <DetailItem label="From Account/Location" value={order.from} />
                            <DetailItem label="To Account/Location" value={order.to} />
                            {order.rate && <DetailItem label="Rate" value={order.rate} />}
                            {(order.receivedAmount && order.receivedSymbol) && <DetailItem label="Received Amount" value={`${formatNumber(order.receivedAmount)} ${order.receivedSymbol}`} />}
                            <DetailItem label="Requested By" value={order.requestedBy} />
                            <DetailItem label="Notes" value={order.notes} isNote={true}/>
                        </dl>
                    </div>

                     {/* Approval History Section (Dummy) */}
                     <div className="mb-6 border border-gray-200 rounded-md p-4">
                        <h4 className="text-md font-semibold text-gray-700 mb-3">Approval History</h4>
                        <ul className="space-y-2 text-sm">
                            {dummyApprovals.map((appr, index) => (
                                <li key={index} className="flex justify-between items-center text-gray-700">
                                    <span><strong>{appr.user || 'System'}</strong>: {appr.action}</span>
                                    <span className="text-xs text-gray-500">{format(new Date(appr.timestamp), 'PP p')}</span>
                                </li>
                            ))}
                             {dummyApprovals.length === 1 && order.status === 'Pending Approval' && (
                                <li className="text-gray-500 italic text-xs">(Awaiting further approvals)</li>
                             )}
                        </ul>
                     </div>

                     {/* Status History / Audit Trail Section (Dummy) */}
                     <div className="mb-6 border border-gray-200 rounded-md p-4">
                        <h4 className="text-md font-semibold text-gray-700 mb-3">Status History & Audit</h4>
                         <ul className="space-y-2 text-sm mb-2">
                             {dummyStatusHistory.map((hist, index) => (
                                 <li key={index} className="flex justify-between items-center text-gray-700">
                                     <span>Status changed to <strong>{hist.status}</strong></span>
                                     <span className="text-xs text-gray-500">{format(new Date(hist.timestamp), 'PP p')}</span>
                                 </li>
                             ))}
                         </ul>
                         <p className="text-xs text-gray-400 italic mt-3">(Note: Detailed field change audit trail requires backend logging implementation.)</p>
                     </div>

                    {/* Associated Documents Section (Dummy) */}
                    {dummyDocuments.length > 0 && (
                         <div className="mb-6 border border-gray-200 rounded-md p-4">
                            <h4 className="text-md font-semibold text-gray-700 mb-3">Associated Documents</h4>
                             <ul className="list-disc list-inside space-y-1 text-sm text-blue-600">
                                 {dummyDocuments.map((doc, index) => (
                                     <li key={index}><a href="#" onClick={(e)=>e.preventDefault()} className="hover:underline cursor-not-allowed" title="Document download not implemented">{doc}</a></li>
                                 ))}
                             </ul>
                         </div>
                    )}

                    {/* Liquidity Impact Placeholder */}
                    <div className="mb-6 border border-gray-200 rounded-md p-4 bg-gray-50">
                       <h4 className="text-md font-semibold text-gray-700 mb-2">Liquidity Impact</h4>
                       <p className="text-sm text-gray-600 italic">(Liquidity impact analysis based on affected treasury pools will be displayed here. Pending implementation.)</p>
                    </div>

                </div>

                {/* Footer - Actions/Close Button */}
                <div className="bg-gray-100 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-gray-200">
                    <button
                        type="button"
                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                        onClick={onClose}
                    >
                        Close
                    </button>
                     {/* Potential actions based on status could go here too */}
                     {/* Example:
                     {order.status === 'Approved' && (
                         <button className="...">Execute</button>
                     )}
                     */}
                </div>
            </div>
        </div>
    );
};

export default AssetOrderDetailModal;