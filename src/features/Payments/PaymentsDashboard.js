// src/features/Payments/PaymentsDashboard.js
import React, { useState, useMemo } from 'react';

// Import screen components
import CrossBorderDashboardView from './CrossBorderDashboardView';
import CreatePaymentScreen from './CreatePaymentScreen';
import HighValueDashboardView from './HighValueDashboardView';
import BulkDashboardView from './BulkDashboardView';
import ViewTemplatesScreen from './ViewTemplatesScreen';
import ManageRecurringPaymentsScreen from './ManageRecurringPaymentsScreen';
import AuthorizeHVTScreen from './AuthorizeHVTScreen';
import CreateHighValueTransferScreen from './CreateHighValueTransferScreen';
import UploadBulkFileScreen from './UploadBulkFileScreen';
import ViewTransferDetailsScreen from './ViewTransferDetailsScreen';
import PaymentHistoryDetailModal from './PaymentHistoryDetailModal';
import PaymentHistoryTable from './PaymentHistoryTable';

// Import HVT data
import { initialDummyHVTs } from './AuthorizeHVTScreen';

// Initial Dummy History Data (Unchanged)
const initialPaymentHistory = [
    { id: 'ph1', timestamp: new Date(Date.now() - 2 * 60 * 1000), type: 'Cross-Border', amount: 1500, currency: 'USDC', recipient: 'External Vendor A', status: 'Completed', reference: 'INV-123' },
    { id: 'ph2', timestamp: new Date(Date.now() - 5 * 60 * 1000), type: 'HVT', amount: 5000000, currency: 'USD', recipient: 'Bank of Example', status: 'Pending Approval', reference: 'HVT-PEND01' },
    { id: 'ph3', timestamp: new Date(Date.now() - 10 * 60 * 1000), type: 'Cross-Border', amount: 25000, currency: 'USDT', recipient: 'Partner Company X', status: 'Completed', reference: 'PO-456' },
    { id: 'ph4', timestamp: new Date(Date.now() - 30 * 60 * 1000), type: 'HVT', amount: 10000000, currency: 'GBP', recipient: 'UK Treasury', status: 'Authorized', reference: 'HVT-AUTH01' },
    { id: 'ph5', timestamp: new Date(Date.now() - 60 * 60 * 1000), type: 'Cross-Border', amount: 50, currency: 'eGH¢', recipient: 'Local Merchant', status: 'Completed', reference: 'POS-789' },
    { id: 'ph6', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), type: 'Bulk Process', amount: 125000, currency: 'USD', recipient: 'Payroll Batch 1', status: 'Completed', reference: 'BULK-PAY-01' },
    { id: 'ph7', timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), type: 'Cross-Border', amount: 999, currency: 'USDC', recipient: 'Test Wallet', status: 'Completed', reference: 'TEST-001' },
];


// --- Component ---
const PaymentsDashboard = ({ assets = [], setAssets, assetLogosMap = {} }) => {

  const [paymentScreen, setPaymentScreen] = useState('cross-border-dash');
  const [viewingTransferDetails, setViewingTransferDetails] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState(initialPaymentHistory);
  const [isPaymentHistoryModalOpen, setIsPaymentHistoryModalOpen] = useState(false);
  const [selectedPaymentHistoryEntry, setSelectedPaymentHistoryEntry] = useState(null);

  // History Function (Unchanged)
  const addPaymentHistoryEntry = (entryData) => { /* ... */
    const newEntry = {
      id: Date.now() + Math.random(), timestamp: new Date(), type: entryData.type || 'Payment',
      amount: entryData.amount || 0, currency: entryData.currency || 'N/A',
      recipient: entryData.recipient || 'N/A', status: entryData.status || 'Submitted',
      reference: entryData.reference || null,
    };
    console.log("Adding to Payment History:", newEntry);
    setPaymentHistory(prevLog => [newEntry, ...prevLog]);
   };

  // Navigation Handlers (Unchanged)
  const handleNavigate = (screen, data = null) => { /* ... */
     console.log('Navigating to payment screen:', screen, 'Data:', data);
     if (screen === 'view-transfer-details' && data?.transferId) {
       const transfer = initialDummyHVTs.find(hvt => hvt.id === data.transferId);
       if (transfer) { setViewingTransferDetails(transfer); setPaymentScreen(screen); }
       else { alert(`Error: Could not find details...`); }
     } else { setViewingTransferDetails(null); setPaymentScreen(screen); }
   };
  const handleBackToPaymentsDash = (defaultScreen = 'cross-border-dash') => { /* ... */
    setViewingTransferDetails(null); setPaymentScreen(defaultScreen);
   };
  const handlePaymentHistoryRowClick = (entry) => { /* ... */
    setSelectedPaymentHistoryEntry(entry); setIsPaymentHistoryModalOpen(true);
   };

  // --- MODIFIED Payment Submission Handler ---
  const handlePaymentSubmit = (paymentData) => {
    console.log('Payment Submitted in Dashboard:', paymentData);
    let updateError = false;

    // --- ONLY attempt balance update for institutional payments ---
    if (paymentData._ui_payment_origin === 'institutional') {
        console.log("Attempting balance update for institutional payment...");
        setAssets(currentAssets => {
            const senderAssetIndex = currentAssets.findIndex(asset => asset.id === paymentData.payment_source?.account_id);
            if (senderAssetIndex === -1) {
                console.error("Error in setAssets: Institutional sender account not found. ID:", paymentData.payment_source?.account_id);
                updateError = true;
                return currentAssets;
            }
            const senderAsset = currentAssets[senderAssetIndex];
            const totalDebit = paymentData._simulated_total_debit || 0;

            // Basic check to prevent negative balance simulation if form validation failed somehow
            if(senderAsset.balance < totalDebit) {
                console.error("Error in setAssets: Insufficient balance for institutional payment.");
                updateError = true;
                return currentAssets;
            }

            const newBalance = Math.max(0, senderAsset.balance - totalDebit);
            console.log(`Updating institutional balance for ${senderAsset.symbol}: ${senderAsset.balance} -> ${newBalance}`);
            return currentAssets.map((asset, index) => index === senderAssetIndex ? { ...asset, balance: newBalance } : asset);
        });
    } else {
        console.log("Skipping balance update for client payment (handled conceptually).");
        // For client payments, we assume the debit happened off-platform or is managed elsewhere
        // No error is set here because the expected action (logging history) can still proceed.
        updateError = false;
    }
    // --- End Conditional Balance Update ---


    // Proceed if the balance update (if attempted) was successful OR if it was skipped (client payment)
    if (!updateError) {
       // Log history for both types
       addPaymentHistoryEntry({
           type: paymentData._ui_payment_type === 'hvt' ? 'HVT' : 'Cross-Border',
           amount: paymentData.payment_info.amount,
           currency: paymentData.payment_info.currency,
           recipient: paymentData.destination_counterparty_info.name || paymentData.destination_counterparty_info.accountIdentifier,
           // Assign status based on type (HVT goes to pending, others complete for demo)
           status: paymentData._ui_payment_type === 'hvt' ? 'Pending Approval' : 'Completed',
           // Try using description as reference, fallback to debitReference if needed
           reference: paymentData.payment_info.description || paymentData.debitReference || null
       });
        // Show generic success alert
        alert(`Payment initiated successfully!`);

        // Navigate back based on UI type
        if (paymentData._ui_payment_type === 'hvt') {
            handleBackToPaymentsDash('high-value-dash');
        } else {
            handleBackToPaymentsDash('cross-border-dash');
        }
    } else {
        // Show error alert ONLY if updateError was explicitly set (i.e., institutional balance update failed)
        alert("Error processing payment submission. Failed to update institutional balance.");
    }
  };
  // --- END MODIFIED Handler ---

  // Filter History based on Current Dashboard View (Unchanged)
  const filteredHistory = useMemo(() => { /* ... */
      if (paymentScreen.includes('cross-border') || paymentScreen === 'create-payment' || paymentScreen === 'view-templates' || paymentScreen === 'manage-recurring') {
          return paymentHistory.filter(entry => entry.type === 'Cross-Border' || entry.type === 'Payment');
      } else if (paymentScreen.includes('high-value') || paymentScreen === 'create-hvt' || paymentScreen === 'authorize-hvt' || paymentScreen === 'view-transfer-details') {
          return paymentHistory.filter(entry => entry.type === 'HVT');
      } else if (paymentScreen.includes('bulk') || paymentScreen === 'upload-bulk-file' || paymentScreen === 'create-bulk-template') {
          return paymentHistory.filter(entry => entry.type === 'Bulk Process' || entry.type === 'Bulk Upload');
      }
      return [];
   }, [paymentScreen, paymentHistory]);


  // --- Render Logic (Unchanged) ---
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Payments Dashboard</h1>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200"> <div className="flex space-x-6"> {/* ... tab buttons ... */}
        <button className={`pb-2 px-1 text-sm sm:text-base focus:outline-none ${ paymentScreen.includes('cross-border') || paymentScreen === 'create-payment' || paymentScreen === 'view-templates' || paymentScreen === 'manage-recurring' ? 'border-b-2 font-medium text-emtech-gold border-emtech-gold' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => handleNavigate('cross-border-dash')} > Cross-Border Payments </button>
        <button className={`pb-2 px-1 text-sm sm:text-base focus:outline-none ${ paymentScreen.includes('high-value') || paymentScreen === 'create-hvt' || paymentScreen === 'authorize-hvt' || paymentScreen === 'view-transfer-details' ? 'border-b-2 font-medium text-emtech-gold border-emtech-gold' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => handleNavigate('high-value-dash')} > High-Value Transfers </button>
        <button className={`pb-2 px-1 text-sm sm:text-base focus:outline-none ${ paymentScreen.includes('bulk') || paymentScreen === 'upload-bulk-file' || paymentScreen === 'create-bulk-template' ? 'border-b-2 font-medium text-emtech-gold border-emtech-gold' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => handleNavigate('bulk-dash')} > Bulk Payments </button>
      </div> </div>

      {/* Conditional Screen Rendering */}
      <div className="mb-12">
        {paymentScreen === 'cross-border-dash' && ( <CrossBorderDashboardView onNavigate={handleNavigate} history={filteredHistory} onHistoryRowClick={handlePaymentHistoryRowClick} /> )}
        {paymentScreen === 'create-payment' && ( <CreatePaymentScreen assets={assets} onBack={() => handleBackToPaymentsDash('cross-border-dash')} onPaymentSubmit={handlePaymentSubmit} /> )}
        {paymentScreen === 'view-templates' && ( <ViewTemplatesScreen onBack={() => handleBackToPaymentsDash('cross-border-dash')} /> )}
        {paymentScreen === 'manage-recurring' && ( <ManageRecurringPaymentsScreen onBack={() => handleBackToPaymentsDash('cross-border-dash')} /> )}

        {paymentScreen === 'high-value-dash' && ( <HighValueDashboardView onNavigate={handleNavigate} history={filteredHistory} onHistoryRowClick={handlePaymentHistoryRowClick} /> )}
        {paymentScreen === 'create-hvt' && ( <CreateHighValueTransferScreen assets={assets} onBack={() => handleBackToPaymentsDash('high-value-dash')} onPaymentSubmit={handlePaymentSubmit} /> )}
        {paymentScreen === 'authorize-hvt' && ( <AuthorizeHVTScreen onBack={() => handleBackToPaymentsDash('high-value-dash')} onNavigate={handleNavigate} /> )}
        {paymentScreen === 'view-transfer-details' && ( <ViewTransferDetailsScreen transfer={viewingTransferDetails} onBack={() => handleNavigate('authorize-hvt')} /> )}

        {paymentScreen === 'bulk-dash' && ( <BulkDashboardView onNavigate={handleNavigate} history={filteredHistory} onHistoryRowClick={handlePaymentHistoryRowClick} /> )}
        {paymentScreen === 'upload-bulk-file' && ( <UploadBulkFileScreen assets={assets} onBack={() => handleBackToPaymentsDash('bulk-dash')} onBulkSubmit={(data) => console.log("Bulk Submit Placeholder:", data)} /> )}
        {paymentScreen === 'create-bulk-template' && ( <div>Create Bulk Template Placeholder... <button onClick={() => handleBackToPaymentsDash('bulk-dash')} className="text-sm text-blue-600 hover:underline">Back</button></div> )}
      </div>

      {/* Render Payment History Detail Modal */}
       {isPaymentHistoryModalOpen && (
          <PaymentHistoryDetailModal
              entry={selectedPaymentHistoryEntry}
              onClose={() => { setIsPaymentHistoryModalOpen(false); setSelectedPaymentHistoryEntry(null); }}
          />
       )}

    </div> // End main container div
  );
};

export default PaymentsDashboard;