import React, { useState, useMemo } from 'react';
import { format, parseISO, isValid as isValidDate } from 'date-fns';
import { formatNumber, getStatusClass } from '../../utils/displayUtils';

// Import the hooks for contexts
import { useAssetOrders } from '../../context/AssetOrdersContext';
import { useAssets } from '../../context/AssetsContext'; // Make sure useAssets is imported
import { useTokenHistory } from '../../context/TokenHistoryContext';

// Import the modal component
import AssetOrderDetailModal from './AssetOrderDetailModal';

// *** Import assetLogos map ***
import { assetLogos } from '../../data/initialData'; // Adjust path if needed

// Define constants or get from context/config
const currentUserApprover = 'TreasuryMgr';

// Define Token Management asset criteria (mirroring CreateAssetOrderScreen)
const allowedPredefinedTokenIds = [
    'cp-acme-01', 'mmf-usd-01', 'xagc-01', 'oil-wti-01', 'cc-verra-01',
];
const isTokenManagementAsset = (asset) => {
    if (!asset) return false;
    return asset.isWizardIssued === true || allowedPredefinedTokenIds.includes(asset.id);
};

// Define potential payment assets (mirroring CreateAssetOrderScreen)
const paymentAssetIds = ['usdc', 'usdt', 'inst-usd-primary', 'd-euro', 'inst-eur-primary'];


// Component Definition
const AssetOrdersListView = ({ assetOrders = [], onBack, onCreateNew }) => {

    // Context dispatch functions
    const { dispatchAssetOrders } = useAssetOrders();
    const { dispatchAssets: contextDispatchAssets } = useAssets();
    const { dispatchTokenHistory } = useTokenHistory();

    // Consume assets from context
    const { assets } = useAssets();

    // State for filters
    const [statusFilter, setStatusFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('Sale');
    const [dateFromFilter, setDateFromFilter] = useState('');
    const [dateToFilter, setDateToFilter] = useState('');
    const [minAmountFilter, setMinAmountFilter] = useState('');
    const [maxAmountFilter, setMaxAmountFilter] = useState('');
    const [counterpartyFilter, setCounterpartyFilter] = useState('');

    // State for Detail Modal
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    // State for disabling buttons during processing
    const [processingOrderId, setProcessingOrderId] = useState(null);

    // --- Define Filter Options ---
    const statusOptions = useMemo(() => ['All', 'Pending Approval', 'Completed'], []);
    const typeOptions = useMemo(() => ['Sale'], []);

    // --- MODIFIED Filtering Logic ---
    const filteredOrders = useMemo(() => {
        const assetsList = Array.isArray(assets) ? assets : [];
        return assetOrders.filter(order => {
            const isSaleOrder = order.type === 'Sale';
            const isValidStatus = order.status === 'Completed' || order.status === 'Pending Approval';
            const asset = assetsList.find(a => a && a.id === order.assetId);
            const isTmAsset = isTokenManagementAsset(asset);
            if (!(isSaleOrder && isTmAsset && isValidStatus)) { return false; }
            const dateFrom = dateFromFilter ? parseISO(dateFromFilter) : null;
            const dateTo = dateToFilter ? new Date(parseISO(dateToFilter).setDate(parseISO(dateToFilter).getDate() + 1)) : null;
            const minAmount = minAmountFilter !== '' ? parseFloat(minAmountFilter) : null;
            const maxAmount = maxAmountFilter !== '' ? parseFloat(maxAmountFilter) : null;
            const counterpartyLower = counterpartyFilter.toLowerCase();
            const orderTimestamp = new Date(order.timestamp);
            const dateFromMatch = !dateFrom || !isValidDate(dateFrom) || orderTimestamp >= dateFrom;
            const dateToMatch = !dateTo || !isValidDate(dateTo) || orderTimestamp < dateTo;
            const amountMatchValue = order.amount;
            const minAmountMatch = minAmount === null || isNaN(minAmount) || amountMatchValue >= minAmount;
            const maxAmountMatch = maxAmount === null || isNaN(maxAmount) || amountMatchValue <= maxAmount;
            const counterpartyMatch = !counterpartyLower ||
                order.from?.toLowerCase().includes(counterpartyLower) ||
                order.to?.toLowerCase().includes(counterpartyLower);
            return dateFromMatch && dateToMatch && minAmountMatch && maxAmountMatch && counterpartyMatch;
        });
    }, [assetOrders, assets, dateFromFilter, dateToFilter, minAmountFilter, maxAmountFilter, counterpartyFilter]);

    // --- Event Handlers ---
    const handleRowClick = (order) => {
        if (processingOrderId) return;
        setSelectedOrder(order);
        setIsDetailModalOpen(true);
    };
    const handleCloseModal = () => {
        setIsDetailModalOpen(false);
        setSelectedOrder(null);
    };

    // --- Execution Logic (executeInternalTransfer, executeSale) remain the same ---
    const executeInternalTransfer = async (order) => { /* ... unchanged ... */
         console.log(`Executing internal transfer for order ${order.id}`);
        if (!order || !order.assetId || order.amount <= 0) {
             console.error("Invalid order data for execution:", order);
             alert(`Error: Could not execute order ${order.id} due to missing data.`);
             dispatchAssetOrders({ type: 'UPDATE_STATUS', payload: { orderId: order.id, newStatus: 'Failed', notes: 'Execution failed: Invalid order data.'} });
             return;
        }
        try {
             console.log(`Dispatching balance updates for asset ${order.assetId}, amount ${order.amount}`);
             contextDispatchAssets({ type: 'UPDATE_ASSET_BALANCE', payload: { assetId: order.assetId, changeAmount: -order.amount } }); // Debit source
             contextDispatchAssets({ type: 'UPDATE_ASSET_BALANCE', payload: { assetId: order.assetId, changeAmount: +order.amount } }); // Credit destination
             const historyEntry = { id: `AO-${order.id}-EXEC-${Date.now()}`, timestamp: new Date(), actionType: `Order: Internal Transfer`, details: `Executed Order ${order.id}: Transferred ${formatNumber(order.amount)} ${order.assetSymbol} from "${order.from}" to "${order.to}".`, user: order.requestedBy, approver: currentUserApprover, assetId: order.assetId, assetSymbol: order.assetSymbol, assetName: order.assetSymbol, notes: `Order ${order.id} completed.` };
            console.log("Dispatching history entry:", historyEntry);
            dispatchTokenHistory({ type: 'ADD_TOKEN_HISTORY', payload: historyEntry });
            console.log(`Order ${order.id} execution simulation successful.`);
        } catch (error) {
            console.error(`Error executing internal transfer for order ${order.id}:`, error);
            alert(`Error executing order ${order.id}: ${error.message}`);
            dispatchAssetOrders({ type: 'UPDATE_STATUS', payload: { orderId: order.id, newStatus: 'Failed', notes: `Execution failed: ${error.message}` } });
        }
    };
    const executeSale = async (order) => { /* ... unchanged ... */
        console.log(`Executing Sale for order ${order.id}`);
        if (!order || order.type !== 'Sale' || !order.assetId || !order.receivedSymbol || order.amount <= 0 || order.receivedAmount <= 0) {
            console.error("Invalid order data for Sale execution:", order);
            alert(`Error: Could not execute Sale order ${order.id} due to missing/invalid data.`);
            dispatchAssetOrders({ type: 'UPDATE_STATUS', payload: { orderId: order.id, newStatus: 'Failed', notes: 'Execution failed: Invalid Sale order data.' } });
            return;
        }
        const paymentAsset = assets.find(a => a.symbol === order.receivedSymbol);
        try {
            console.log(`Dispatching circulation decrease for sold asset ${order.assetId}: ${order.amount}`);
            contextDispatchAssets({
                type: 'DECREASE_CIRCULATION', // Use the specific action type if available in context
                payload: { assetId: order.assetId, amountToDecrease: order.amount }
            });
            const paymentDestinationAsset = assets.find(a => a.label === order.to || a.id === order.to);
            if (paymentDestinationAsset && paymentAssetIds.includes(paymentDestinationAsset.id)) {
                 console.log(`Dispatching balance update for received payment asset ${paymentDestinationAsset.id}: +${order.receivedAmount}`);
                 contextDispatchAssets({
                     type: 'UPDATE_ASSET_BALANCE',
                     payload: { assetId: paymentDestinationAsset.id, changeAmount: +order.receivedAmount }
                 });
            } else {
                 console.log(`Payment asset ${order.receivedSymbol} credited to external/untracked account: ${order.to}`);
            }
            const historyEntry = {
                id: `AO-${order.id}-EXEC-${Date.now()}`,
                timestamp: new Date(),
                actionType: `Order: Sale Executed`,
                details: `Sold ${formatNumber(order.amount)} ${order.assetSymbol} from "${order.from}" for ${formatNumber(order.receivedAmount)} ${order.receivedSymbol} credited to "${order.to}". Rate: ${order.rate}.`,
                user: order.requestedBy,
                approver: currentUserApprover,
                assetId: order.assetId,
                assetSymbol: order.assetSymbol,
                assetName: assets.find(a=>a.id === order.assetId)?.label || order.assetSymbol, // Get asset name
                notes: `Sale Order ${order.id} completed.`
            };
            console.log("Dispatching history entry:", historyEntry);
            dispatchTokenHistory({ type: 'ADD_TOKEN_HISTORY', payload: historyEntry });
            console.log(`Sale Order ${order.id} execution simulation successful.`);
        } catch (error) {
            console.error(`Error executing Sale for order ${order.id}:`, error);
            alert(`Error executing Sale order ${order.id}: ${error.message}`);
            dispatchAssetOrders({ type: 'UPDATE_STATUS', payload: { orderId: order.id, newStatus: 'Failed', notes: `Execution failed: ${error.message}` } });
        }
    };

    // --- Quick Action Handlers (handleApprove, handleReject) remain the same ---
    const handleApprove = async (e, order) => { /* ... unchanged ... */
        e.stopPropagation();
        if (processingOrderId) return;
        if (!window.confirm(`Are you sure you want to approve Order ${order.id}?`)) { return; }
        setProcessingOrderId(order.id);
        console.log("Approve clicked for order:", order.id, "Type:", order.type);
        try {
            const newStatus = 'Completed';
            dispatchAssetOrders({ type: 'UPDATE_STATUS', payload: { orderId: order.id, newStatus: newStatus, approver: currentUserApprover } });
            console.log(`Order ${order.id} status updated to ${newStatus}`);
            if (order.type === 'Sale') { await executeSale(order); }
            else if (order.type === 'Internal Transfer') { await executeInternalTransfer(order); }
            else { console.log(`Execution logic for order type "${order.type}" is not implemented in approval step.`); }
            alert(`Order ${order.id} approved and processed.`);
        } catch (error) {
             console.error(`Error approving order ${order.id}:`, error);
             alert(`Failed to approve order ${order.id}.`);
        } finally {
             setProcessingOrderId(null);
        }
    };
    const handleReject = (e, order) => { /* ... unchanged ... */
        e.stopPropagation();
        if (processingOrderId) return;
        const reason = prompt(`Enter rejection reason for ${order.id} (optional):`);
        if (reason === null) return;
        setProcessingOrderId(order.id);
        console.log("Reject clicked for order:", order.id);
        try {
            dispatchAssetOrders({ type: 'UPDATE_STATUS', payload: { orderId: order.id, newStatus: 'Failed', approver: currentUserApprover, notes: `Rejected by ${currentUserApprover}: ${reason}`.trim() } });
             alert(`Order ${order.id} rejected.`);
        } catch (error) {
             console.error(`Error rejecting order ${order.id}:`, error);
             alert(`Failed to reject order ${order.id}.`);
        } finally {
             setProcessingOrderId(null);
        }
    };

    // --- Render Logic ---
    return (
        <div className="p-8">
            {/* Header & Buttons */}
            <div className="flex justify-between items-center mb-6 border-b pb-3">
                 <h1 className="text-2xl font-bold text-gray-800">Token Management Sales Orders</h1>
                 <div className="flex space-x-2">
                     <button onClick={onCreateNew} className="px-4 py-2 rounded text-white bg-blue-600 hover:bg-blue-700 text-sm font-medium"> + Create New Order </button>
                     <button onClick={onBack} className="px-4 py-2 rounded border border-gray-300 text-sm font-medium hover:bg-gray-50"> Back to Treasury </button>
                 </div>
            </div>

            {/* Filter Controls Section */}
            <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 items-end">
                     {/* Filters remain the same */}
                     <div> <label htmlFor="dateFromFilter" className="block text-sm font-medium text-gray-700 mb-1">Date From:</label> <input type="date" id="dateFromFilter" value={dateFromFilter} onChange={e => setDateFromFilter(e.target.value)} className="w-full p-2 border border-gray-300 rounded bg-white shadow-sm text-sm focus:ring-blue-500 focus:border-blue-500" /> </div>
                     <div> <label htmlFor="dateToFilter" className="block text-sm font-medium text-gray-700 mb-1">Date To:</label> <input type="date" id="dateToFilter" value={dateToFilter} onChange={e => setDateToFilter(e.target.value)} className="w-full p-2 border border-gray-300 rounded bg-white shadow-sm text-sm focus:ring-blue-500 focus:border-blue-500" /> </div>
                     <div> <label htmlFor="minAmountFilter" className="block text-sm font-medium text-gray-700 mb-1">Min Sold Amount:</label> <input type="number" id="minAmountFilter" value={minAmountFilter} onChange={e => setMinAmountFilter(e.target.value)} placeholder="Min amount sold..." className="w-full p-2 border border-gray-300 rounded bg-white shadow-sm text-sm focus:ring-blue-500 focus:border-blue-500" /> </div>
                     <div> <label htmlFor="maxAmountFilter" className="block text-sm font-medium text-gray-700 mb-1">Max Sold Amount:</label> <input type="number" id="maxAmountFilter" value={maxAmountFilter} onChange={e => setMaxAmountFilter(e.target.value)} placeholder="Max amount sold..." className="w-full p-2 border border-gray-300 rounded bg-white shadow-sm text-sm focus:ring-blue-500 focus:border-blue-500" /> </div>
                     <div> <label htmlFor="counterpartyFilter" className="block text-sm font-medium text-gray-700 mb-1">From/To Contains:</label> <input type="text" id="counterpartyFilter" value={counterpartyFilter} onChange={e => setCounterpartyFilter(e.target.value)} placeholder="Acct name/ID..." className="w-full p-2 border border-gray-300 rounded bg-white shadow-sm text-sm focus:ring-blue-500 focus:border-blue-500" /> </div>
                 </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white shadow-md overflow-hidden rounded-lg border border-gray-200">
                 <div className="overflow-x-auto">
                     <table className="min-w-full divide-y divide-gray-200 text-sm">
                         <thead className="bg-gray-100">
                             <tr>
                                 <th scope="col" className="px-4 py-3 text-left font-medium text-gray-600 uppercase tracking-wider">Order ID</th>
                                 <th scope="col" className="px-4 py-3 text-left font-medium text-gray-600 uppercase tracking-wider">Timestamp</th>
                                 <th scope="col" className="px-4 py-3 text-left font-medium text-gray-600 uppercase tracking-wider">Asset Sold</th>
                                 <th scope="col" className="px-4 py-3 text-right font-medium text-gray-600 uppercase tracking-wider">Amount Sold</th>
                                 <th scope="col" className="px-4 py-3 text-right font-medium text-gray-600 uppercase tracking-wider">Payment Rcvd</th>
                                 <th scope="col" className="px-4 py-3 text-left font-medium text-gray-600 uppercase tracking-wider">Debit From Acct</th>
                                 <th scope="col" className="px-4 py-3 text-left font-medium text-gray-600 uppercase tracking-wider">Credit To Acct</th>
                                 <th scope="col" className="px-4 py-3 text-center font-medium text-gray-600 uppercase tracking-wider">Status</th>
                                 <th scope="col" className="px-4 py-3 text-left font-medium text-gray-600 uppercase tracking-wider">Requester</th>
                                 <th scope="col" className="px-4 py-3 text-center font-medium text-gray-600 uppercase tracking-wider">Actions</th>
                             </tr>
                         </thead>
                         <tbody className="bg-white divide-y divide-gray-200">
                             {filteredOrders.length > 0 ? (
                                 filteredOrders.map((order) => {
                                     // --- Find asset details for logo lookup ---
                                     const assetsList = Array.isArray(assets) ? assets : [];
                                     const asset = assetsList.find(a => a && a.id === order.assetId);
                                     let logoSrc = '/logos/generic-token.png'; // Default fallback

                                     if (asset?.isWizardIssued && asset?.logoPath) {
                                         logoSrc = asset.logoPath; // Use path from wizard data
                                     } else if (assetLogos) { // Check if assetLogos is available
                                         logoSrc = assetLogos[order.assetId] || assetLogos[order.assetSymbol] || '/logos/generic-token.png';
                                     }
                                     // --- End logo lookup ---

                                     return (
                                         <tr
                                            key={order.id}
                                            className={`hover:bg-blue-50 transition-colors duration-150 ${processingOrderId === order.id ? 'opacity-50' : 'cursor-pointer'}`}
                                            onClick={() => handleRowClick(order)}
                                        >
                                             <td className="px-4 py-3 whitespace-nowrap font-mono text-xs text-gray-700 hover:text-blue-600">{order.id}</td>
                                             <td className="px-4 py-3 whitespace-nowrap text-gray-700">{format(new Date(order.timestamp), 'PPpp')}</td>
                                             {/* --- Asset Sold Column with Logo --- */}
                                             <td className="px-4 py-3 whitespace-nowrap">
                                                 <div className="flex items-center">
                                                     <img
                                                         src={logoSrc}
                                                         alt={`${order.assetSymbol} logo`}
                                                         className="h-5 w-5 mr-2 flex-shrink-0"
                                                         onError={(e) => { e.target.style.display = 'none'; }} // Hide if logo fails
                                                      />
                                                     <span className="text-gray-800 font-medium">{order.assetSymbol}</span>
                                                 </div>
                                             </td>
                                             {/* --- End Asset Sold Column --- */}
                                             <td className="px-4 py-3 whitespace-nowrap text-right text-gray-800">{formatNumber(order.amount)}</td>
                                             <td className="px-4 py-3 whitespace-nowrap text-right text-gray-800">{formatNumber(order.receivedAmount)} {order.receivedSymbol}</td>
                                             <td className="px-4 py-3 whitespace-nowrap text-gray-600 max-w-[150px] truncate" title={order.from}>{order.from}</td>
                                             <td className="px-4 py-3 whitespace-nowrap text-gray-600 max-w-[150px] truncate" title={order.to}>{order.to}</td>
                                             <td className="px-4 py-3 whitespace-nowrap text-center">
                                                 <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(order.status)} ${processingOrderId === order.id ? 'animate-pulse' : ''}`}>
                                                    {processingOrderId === order.id ? 'Processing...' : order.status}
                                                 </span>
                                             </td>
                                             <td className="px-4 py-3 whitespace-nowrap text-gray-600">{order.requestedBy}</td>
                                             {/* Actions Cell */}
                                             <td className="px-4 py-3 whitespace-nowrap text-center text-sm font-medium">
                                                 <div className="flex justify-center items-center space-x-2">
                                                     {order.status === 'Pending Approval' && (
                                                         <>
                                                             <button onClick={(e) => handleApprove(e, order)} title="Approve Order" className="p-1 text-green-600 hover:text-green-800 disabled:opacity-50 disabled:cursor-not-allowed" disabled={!!processingOrderId}> <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}> <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /> </svg> </button>
                                                             <button onClick={(e) => handleReject(e, order)} title="Reject Order" className="p-1 text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed" disabled={!!processingOrderId}> <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}> <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /> </svg> </button>
                                                         </>
                                                     )}
                                                     <button onClick={(e) => { e.stopPropagation(); handleRowClick(order); }} title="View Details" className="p-1 text-gray-500 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed" disabled={!!processingOrderId}> <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}> <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /> </svg> </button>
                                                 </div>
                                             </td>
                                         </tr>
                                     )
                                 })
                             ) : (
                                 <tr>
                                     <td colSpan="10" className="text-center px-4 py-6 text-gray-500 italic">
                                         No Token Management Sale orders found matching the criteria (Pending Approval or Completed).
                                     </td>
                                 </tr>
                             )}
                         </tbody>
                     </table>
                </div>
            </div>

            {/* Render Detail Modal */}
            {isDetailModalOpen && selectedOrder && (
                <AssetOrderDetailModal
                    order={selectedOrder}
                    isOpen={isDetailModalOpen}
                    onClose={handleCloseModal}
                />
            )}
        </div>
    );
};

export default AssetOrdersListView;