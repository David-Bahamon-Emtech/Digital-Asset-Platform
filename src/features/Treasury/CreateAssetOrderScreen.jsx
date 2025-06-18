import React, { useState, useMemo, useEffect } from 'react';
import { useAssets } from '../../context/AssetsContext.jsx'; //
import { useAssetOrders } from '../../context/AssetOrdersContext.jsx';
import { formatNumber } from '../../utils/displayUtils.jsx';

// Constants
const currentUser = 'PortfolioMgr'; // Example requester

// Asset Scope Definitions from TokenDashboard & initialData
const allowedPredefinedTokenIds = [
    'cp-acme-01', 'mmf-usd-01', 'xagc-01', 'oil-wti-01', 'cc-verra-01',
];

// Helper function to identify assets shown in Token Management (assets the platform can sell)
const isTokenManagementAsset = (asset) => {
    if (!asset) return false;
    return asset.isWizardIssued === true || allowedPredefinedTokenIds.includes(asset.id);
};

// Helper to identify potential payment assets the platform can receive
// Adjust this list based on your actual treasury/payment assets
const paymentAssetIds = ['usdc', 'usdt', 'inst-usd-primary', 'd-euro', 'inst-eur-primary'];

// --- Create Asset Order Screen Component ---
const CreateAssetOrderScreen = ({ onBack }) => {
    const { assets } = useAssets(); //
    const { dispatchAssetOrders } = useAssetOrders();

    // Form State - Removed FX specific state
    const [orderType, setOrderType] = useState('Internal Transfer');
    const [assetId, setAssetId] = useState(''); // Asset to transfer OR asset to SELL
    const [amount, setAmount] = useState(''); // Amount to transfer OR amount to SELL
    const [fromAccount, setFromAccount] = useState(''); // Source for Transfer / Source Account for SOLD Asset
    const [toAccount, setToAccount] = useState('');   // Destination for Transfer / Destination Account for RECEIVED Payment
    const [notes, setNotes] = useState('');
    const [formError, setFormError] = useState('');

    // --- Sale Specific State ---
    const [paymentAssetId, setPaymentAssetId] = useState(''); // Asset received as payment (e.g., 'usdc')
    const [saleRate, setSaleRate] = useState(''); // Price per unit of sold asset (in payment currency)
    const [calculatedPaymentReceived, setCalculatedPaymentReceived] = useState(0); // Calculated total payment to be received

    // --- Memoized Data ---

    // Assets available for Transfer (Use original logic)
    const transferrableAssets = useMemo(() => {
        if (!assets || !Array.isArray(assets)) return [];
        const treasuryAssetIds = ['usdc', 'usdt', 't-bond', 'e-cedi', 'd-euro'];
        const specificTokenMgmtIds = allowedPredefinedTokenIds;
        const isPlatformIssued = (asset) => {
            if (!asset) return false;
            return asset.isWizardIssued === true || specificTokenMgmtIds.includes(asset.id);
        };
        return assets.filter(asset =>
            asset && (isPlatformIssued(asset) || treasuryAssetIds.includes(asset.id))
        ).sort((a, b) => a.label.localeCompare(b.label));
    }, [assets]);

    // Assets available To Be SOLD (Filter based on Token Management screen)
    const sellableAssets = useMemo(() => {
        if (!assets || !Array.isArray(assets)) return [];
        return assets.filter(isTokenManagementAsset) // Use the helper function
               .sort((a, b) => a.label.localeCompare(b.label));
    }, [assets]);

    // Assets available for Receiving Payment
    const receivablePaymentAssets = useMemo(() => {
        if (!assets || !Array.isArray(assets)) return [];
        return assets.filter(asset => paymentAssetIds.includes(asset.id))
               .sort((a, b) => a.label.localeCompare(b.label));
    }, [assets]);

    // Selected Asset Object (depends on order type - asset being transferred OR sold)
    const selectedAsset = useMemo(() => {
        if (!assets || !Array.isArray(assets)) return null;
        const idToFind = (orderType === 'Internal Transfer' || orderType === 'Sale') ? assetId : null;
        if (!idToFind) return null;
        return assets.find(a => a.id === idToFind);
    }, [assets, assetId, orderType]);

    // Selected Payment Asset Object (the currency being received)
    const selectedPaymentAsset = useMemo(() => {
        if (orderType !== 'Sale' || !paymentAssetId || !assets || !Array.isArray(assets)) return null;
        return assets.find(a => a.id === paymentAssetId);
    }, [assets, paymentAssetId, orderType]);

    // Determine balance to check based on order type and asset
    const availableSourceBalance = useMemo(() => {
        let assetToCheck = null;
        let balanceType = 'Circulating'; // Default

        if ((orderType === 'Internal Transfer' || orderType === 'Sale') && selectedAsset) { // Check SOLD asset for Sale
            assetToCheck = selectedAsset;
             // For platform-issued/managed tokens being sold, check RESERVE balance
             if (isTokenManagementAsset(assetToCheck) && assetToCheck.supply === 'Finite') {
                 balanceType = 'Reserve';
                 return Math.max(0, (assetToCheck.totalSupplyIssued || 0) - (assetToCheck.balance || 0));
             }
             // Fallback for other transfer types (like transferring USDC from treasury)
             // This might need refinement based on where exactly treasury assets are held
              balanceType = 'Circulating';
              return assetToCheck?.balance ?? 0;

        } else {
            return 0; // No check needed or possible yet
        }

    }, [orderType, selectedAsset]); // Depends on the primary asset being actioned

    // Determine which balance type is being checked for messaging
    const balanceTypeChecked = useMemo(() => {
       if ((orderType === 'Internal Transfer' || orderType === 'Sale') && isTokenManagementAsset(selectedAsset) && selectedAsset?.supply === 'Finite') {
           return 'Reserve'; // Selling from Reserve
       }
       return 'Circulating'; // Default (e.g., for transferring treasury funds)
    }, [orderType, selectedAsset]);


    // Numerical values for validation/calculation
    const amountNumber = useMemo(() => parseFloat(amount) || 0, [amount]);
    const rateNumber = useMemo(() => parseFloat(saleRate) || 0, [saleRate]);

    // Effect to calculate payment amount for Sale
    useEffect(() => {
        if (orderType === 'Sale' && amountNumber > 0 && rateNumber > 0) {
            setCalculatedPaymentReceived(amountNumber * rateNumber);
        } else {
            setCalculatedPaymentReceived(0);
        }
    }, [orderType, amountNumber, rateNumber]);

    // --- Event Handlers ---
    const handleOrderTypeChange = (e) => {
        const newType = e.target.value;
        setOrderType(newType);
        // Reset common fields
        setAssetId('');
        setAmount('');
        setFromAccount(''); // Will represent source of SOLD asset for Sale
        setToAccount('');   // Will represent destination of PAYMENT for Sale
        setNotes('');
        setFormError('');
        // Reset sale specific fields
        setPaymentAssetId('');
        setSaleRate('');
        setCalculatedPaymentReceived(0);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        setFormError('');
        let isValid = true;
        let missingFields = [];
        let newOrder = {};

        if (!orderType) { missingFields.push('Order Type'); isValid = false; }

        const baseOrderData = {
             id: `AO-${Date.now().toString().slice(-6)}-${Math.random().toString(16).substring(2, 6)}`,
             timestamp: new Date(), type: orderType, status: 'Pending Approval',
             requestedBy: currentUser, approver: null, notes: notes,
        };

        if (orderType === 'Internal Transfer') {
            // Validation remains the same as before for Internal Transfer
             if (!assetId) missingFields.push('Asset to Transfer');
             if (amountNumber <= 0) missingFields.push('Amount');
             if (!fromAccount) missingFields.push('From Account');
             if (!toAccount) missingFields.push('To Account');

             if (missingFields.length === 0) {
                 if (!selectedAsset) { setFormError("Selected asset details not found."); isValid = false; }
                 else if (amountNumber > availableSourceBalance) {
                      setFormError(`Amount (${formatNumber(amountNumber)}) exceeds available ${balanceTypeChecked.toLowerCase()} balance (${formatNumber(availableSourceBalance)}) for ${selectedAsset.symbol}.`);
                      isValid = false;
                 } else {
                     newOrder = { ...baseOrderData, assetId: assetId, assetSymbol: selectedAsset.symbol, amount: amountNumber, from: fromAccount, to: toAccount };
                 }
             } else { isValid = false; }

        } else if (orderType === 'Sale') { // Updated for Sale perspective
            if (!assetId) missingFields.push('Asset to Sell');
            if (amountNumber <= 0) missingFields.push('Amount to Sell');
            if (!paymentAssetId) missingFields.push('Payment Received Asset');
            if (rateNumber <= 0) missingFields.push('Sale Rate');
            if (!fromAccount) missingFields.push('Debit Sold Asset From Account'); // Source of the asset being sold
            if (!toAccount) missingFields.push('Receive Payment To Account'); // Destination for the payment

             if (missingFields.length === 0) {
                 if (!selectedAsset) { setFormError("Selected asset to sell details not found."); isValid = false; }
                 else if (!selectedPaymentAsset) { setFormError("Selected payment asset details not found."); isValid = false; }
                 else if (amountNumber > availableSourceBalance) { // Check if enough of the SOLD asset is available
                     setFormError(`Amount to Sell (${formatNumber(amountNumber)} ${selectedAsset.symbol}) exceeds available ${balanceTypeChecked.toLowerCase()} balance (${formatNumber(availableSourceBalance)}) from ${fromAccount}.`);
                     isValid = false;
                 } else {
                     newOrder = {
                         ...baseOrderData, // Includes type: 'Sale'
                         assetId: assetId,                 // ID of the asset being SOLD
                         assetSymbol: selectedAsset.symbol, // Symbol of the asset being SOLD
                         amount: amountNumber,            // Amount of the asset being SOLD
                         rate: rateNumber,                // Rate (Payment Asset / Sold Asset)
                         receivedSymbol: selectedPaymentAsset.symbol, // Symbol of the PAYMENT asset received
                         receivedAmount: calculatedPaymentReceived,    // Total amount of PAYMENT asset received
                         from: fromAccount,               // Account where SOLD asset is debited FROM (e.g., 'Reserve')
                         to: toAccount,                   // Account where PAYMENT asset is credited TO (e.g., 'Treasury USDC')
                     };
                 }
            } else { isValid = false; }
        }
        // REMOVED FX, leaving only Transfer and Sale implemented for now
        else { setFormError(`Order type "${orderType}" is not supported.`); isValid = false; }

        if (!isValid && missingFields.length > 0) { setFormError(`Please fill in all required fields: ${missingFields.join(', ')}.`); }
        if (!isValid) { return; }

        // --- Dispatch action ---
        try {
            console.log('Submitting new order:', newOrder);
            dispatchAssetOrders({ type: 'ADD_ASSET_ORDER', payload: newOrder });
            alert(`Order ${newOrder.id} (${newOrder.type}) submitted successfully with status '${newOrder.status}'!`);
            onBack();
        } catch (error) {
            console.error("Error dispatching add order:", error);
            setFormError(`Failed to submit order. ${error.message || 'Unknown error'}`);
        }
    };

    // --- Render Logic ---
    return (
        <div className="p-8">
            <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto border border-gray-200">
                 <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-3">
                     <h1 className="text-xl font-semibold text-gray-800">Create New Asset Order</h1>
                 </div>

                 <form onSubmit={handleSubmit}>
                     <div className="space-y-5">
                         {/* Order Type Selection - FX Removed */}
                         <div>
                             <label htmlFor="orderType" className="block text-sm font-medium text-gray-700 mb-1">Order Type <span className="text-red-600">*</span></label>
                             <select id="orderType" value={orderType} onChange={handleOrderTypeChange} required className="w-full p-2 border border-gray-300 rounded-md shadow-sm bg-white focus:ring-blue-500 focus:border-blue-500">
                                 <option value="Internal Transfer">Internal Transfer</option>
                                 <option value="Sale">Sale</option>
                                 {/* <option value="FX Conversion" disabled>FX Conversion (coming soon)</option> */}
                                 {/* <option value="Purchase" disabled>Purchase (coming soon)</option> */}
                             </select>
                         </div>

                         {/* --- Fields for Internal Transfer --- */}
                         {orderType === 'Internal Transfer' && (
                              <>
                                 <div>
                                     <label htmlFor="assetIdTransfer" className="block text-sm font-medium text-gray-700 mb-1">Asset to Transfer <span className="text-red-600">*</span></label>
                                     <select id="assetIdTransfer" value={assetId} onChange={(e) => setAssetId(e.target.value)} required className="w-full p-2 border border-gray-300 rounded-md shadow-sm bg-white disabled:bg-gray-100 focus:ring-blue-500 focus:border-blue-500" disabled={transferrableAssets.length === 0}>
                                         <option value="" disabled>{transferrableAssets.length === 0 ? '-- No Assets Found --' : '-- Select Asset --'}</option>
                                         {transferrableAssets.map(asset => ( <option key={asset.id} value={asset.id}> {asset.label} ({asset.symbol}) </option> ))}
                                     </select>
                                 </div>
                                 <div>
                                     <label htmlFor="amountTransfer" className="block text-sm font-medium text-gray-700 mb-1">Amount <span className="text-red-600">*</span></label>
                                     <input id="amountTransfer" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required min="0.000001" step="any" className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100" placeholder={`Amount in ${selectedAsset?.symbol || 'asset units'}`} disabled={!assetId} />
                                     {/* Balance check message uses logic defined above */}
                                     {selectedAsset && ( <p className="text-xs text-gray-500 mt-1"> Available ({balanceTypeChecked}): {formatNumber(availableSourceBalance)} {selectedAsset.symbol} </p> )}
                                     {selectedAsset && amountNumber > availableSourceBalance && ( <p className="text-xs text-red-600 mt-1">Amount exceeds available {balanceTypeChecked.toLowerCase()} balance.</p> )}
                                 </div>
                                  <div>
                                     <label htmlFor="fromAccountTransfer" className="block text-sm font-medium text-gray-700 mb-1">From Account / Location <span className="text-red-600">*</span></label>
                                     <input id="fromAccountTransfer" type="text" value={fromAccount} onChange={(e) => setFromAccount(e.target.value)} required className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" placeholder="e.g., Reserve Pool, Ops Account" />
                                      <p className="text-xs text-gray-400 mt-1">Specify source location (e.g., 'Reserve' for platform tokens).</p>
                                 </div>
                                 <div>
                                     <label htmlFor="toAccountTransfer" className="block text-sm font-medium text-gray-700 mb-1">To Account / Location <span className="text-red-600">*</span></label>
                                     <input id="toAccountTransfer" type="text" value={toAccount} onChange={(e) => setToAccount(e.target.value)} required className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" placeholder="e.g., Cold Storage, Trading Venue" />
                                 </div>
                             </>
                         )}

                         {/* --- Fields for Sale --- */}
                         {orderType === 'Sale' && (
                              <>
                                 <div>
                                     {/* Changed label */}
                                     <label htmlFor="assetIdSale" className="block text-sm font-medium text-gray-700 mb-1">Asset to Sell <span className="text-red-600">*</span></label>
                                     <select id="assetIdSale" value={assetId} onChange={(e) => setAssetId(e.target.value)} required className="w-full p-2 border border-gray-300 rounded-md shadow-sm bg-white disabled:bg-gray-100 focus:ring-blue-500 focus:border-blue-500" disabled={sellableAssets.length === 0}>
                                         <option value="" disabled>{sellableAssets.length === 0 ? '-- No Assets Found --' : '-- Select Asset to Sell --'}</option>
                                         {/* Use sellableAssets list */}
                                         {sellableAssets.map(asset => ( <option key={asset.id} value={asset.id}> {asset.label} ({asset.symbol}) </option> ))}
                                     </select>
                                 </div>
                                  <div>
                                     {/* Changed label */}
                                     <label htmlFor="amountSale" className="block text-sm font-medium text-gray-700 mb-1">Amount to Sell <span className="text-red-600">*</span></label>
                                     <input id="amountSale" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required min="0.000001" step="any" className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100" placeholder={`Amount of ${selectedAsset?.symbol || 'asset'} to sell`} disabled={!assetId} />
                                     {/* Balance check message for the SOLD asset */}
                                     {selectedAsset && ( <p className="text-xs text-gray-500 mt-1"> Available ({balanceTypeChecked}): {formatNumber(availableSourceBalance)} {selectedAsset.symbol} </p> )}
                                     {selectedAsset && amountNumber > availableSourceBalance && ( <p className="text-xs text-red-600 mt-1">Amount to sell exceeds available {balanceTypeChecked.toLowerCase()} balance.</p> )}
                                 </div>
                                 <div>
                                     {/* Changed label */}
                                     <label htmlFor="paymentAssetIdSale" className="block text-sm font-medium text-gray-700 mb-1">Payment Received Asset <span className="text-red-600">*</span></label>
                                     <select id="paymentAssetIdSale" value={paymentAssetId} onChange={(e) => setPaymentAssetId(e.target.value)} required className="w-full p-2 border border-gray-300 rounded-md shadow-sm bg-white disabled:bg-gray-100 focus:ring-blue-500 focus:border-blue-500" disabled={receivablePaymentAssets.length === 0}>
                                         <option value="" disabled>{receivablePaymentAssets.length === 0 ? '-- No Payment Assets --' : '-- Select Payment Currency --'}</option>
                                         {/* Use receivablePaymentAssets list */}
                                         {receivablePaymentAssets.map(asset => ( <option key={asset.id} value={asset.id}> {asset.label} ({asset.symbol}) </option> ))}
                                     </select>
                                 </div>
                                  <div>
                                     {/* Changed label */}
                                     <label htmlFor="saleRate" className="block text-sm font-medium text-gray-700 mb-1">Sale Rate <span className="text-red-600">*</span></label>
                                     <input id="saleRate" type="number" value={saleRate} onChange={(e) => setSaleRate(e.target.value)} required min="0.000001" step="any" className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100" placeholder={`Price per ${selectedAsset?.symbol || 'sold asset'} in ${selectedPaymentAsset?.symbol || 'payment currency'}`} disabled={!assetId || !paymentAssetId} />
                                     {calculatedPaymentReceived > 0 && selectedPaymentAsset && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            Calculated Payment Received: {formatNumber(calculatedPaymentReceived)} {selectedPaymentAsset.symbol}
                                        </p>
                                     )}
                                 </div>
                                  <div>
                                     {/* Changed label */}
                                     <label htmlFor="fromAccountSale" className="block text-sm font-medium text-gray-700 mb-1">Debit Sold Asset From Account <span className="text-red-600">*</span></label>
                                     <input id="fromAccountSale" type="text" value={fromAccount} onChange={(e) => setFromAccount(e.target.value)} required className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" placeholder="e.g., Reserve, Platform Inventory" />
                                      <p className="text-xs text-gray-400 mt-1">Specify where the sold {selectedAsset?.symbol || 'asset'} is held.</p>
                                 </div>
                                  <div>
                                     {/* Changed label */}
                                     <label htmlFor="toAccountSale" className="block text-sm font-medium text-gray-700 mb-1">Receive Payment To Account <span className="text-red-600">*</span></label>
                                     <input id="toAccountSale" type="text" value={toAccount} onChange={(e) => setToAccount(e.target.value)} required className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" placeholder="e.g., Treasury USDC Wallet, Ops USD Account" />
                                     <p className="text-xs text-gray-400 mt-1">Specify where the payment ({selectedPaymentAsset?.symbol || 'currency'}) should be sent.</p>
                                 </div>
                             </>
                         )}

                         {/* Removed Placeholder for other types as only Transfer and Sale are left */}

                         {/* Common Fields */}
                         <div>
                             <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                             <textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows="3" className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" placeholder="Add any relevant details or context (optional)..." />
                         </div>

                         {formError && ( <div role="alert" className="mt-2 text-sm text-red-700 bg-red-50 p-3 rounded-md border border-red-200"> {formError} </div> )}

                         {/* Submit/Cancel Buttons */}
                         <div className="pt-4 flex justify-end space-x-3 border-t border-gray-200">
                              <button type="button" onClick={onBack} className="px-4 py-2 rounded-md border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"> Cancel </button>
                             <button type="submit" className="px-6 py-2 rounded-md border border-transparent shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                                 disabled={
                                    // Disable logic updated for Sale type
                                    (orderType === 'Internal Transfer' && (!assetId || amountNumber <= 0 || !fromAccount || !toAccount || (amountNumber > availableSourceBalance && !!selectedAsset))) ||
                                    (orderType === 'Sale' && (!assetId || amountNumber <= 0 || !paymentAssetId || rateNumber <= 0 || !fromAccount || !toAccount || (amountNumber > availableSourceBalance && !!selectedAsset)))
                                    // Add disable logic for other types later
                                 }
                             >
                                 Submit Order
                             </button>
                         </div>
                     </div>
                 </form>
            </div>
        </div>
    );
};

export default CreateAssetOrderScreen;