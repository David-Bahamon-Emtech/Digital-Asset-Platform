// src/features/Payments/PaymentsDashboard.js
import React, { useState, useMemo } from 'react'; // Added useMemo

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
import PaymentHistoryTable from './PaymentHistoryTable'; // <-- IMPORT reusable table

// Import HVT data
import { initialDummyHVTs } from './AuthorizeHVTScreen';

// --- Add More Initial Dummy History Data ---
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
  const [paymentHistory, setPaymentHistory] = useState(initialPaymentHistory); // Use initial data
  const [isPaymentHistoryModalOpen, setIsPaymentHistoryModalOpen] = useState(false);
  const [selectedPaymentHistoryEntry, setSelectedPaymentHistoryEntry] = useState(null);

  // --- History Function ---
  const addPaymentHistoryEntry = (entryData) => { /* ... (function unchanged) ... */
    const newEntry = {
      id: Date.now() + Math.random(), timestamp: new Date(), type: entryData.type || 'Payment',
      amount: entryData.amount || 0, currency: entryData.currency || 'N/A',
      recipient: entryData.recipient || 'N/A', status: entryData.status || 'Submitted',
      reference: entryData.reference || null,
    };
    console.log("Adding to Payment History:", newEntry);
    setPaymentHistory(prevLog => [newEntry, ...prevLog]);
  };

  // --- Navigation Handlers ---
  const handleNavigate = (screen, data = null) => { /* ... (function unchanged) ... */
     console.log('Navigating to payment screen:', screen, 'Data:', data);
     if (screen === 'view-transfer-details' && data?.transferId) {
       const transfer = initialDummyHVTs.find(hvt => hvt.id === data.transferId);
       if (transfer) { setViewingTransferDetails(transfer); setPaymentScreen(screen); }
       else { alert(`Error: Could not find details...`); }
     } else { setViewingTransferDetails(null); setPaymentScreen(screen); }
  };
  const handleBackToPaymentsDash = (defaultScreen = 'cross-border-dash') => { /* ... (function unchanged) ... */
    setViewingTransferDetails(null); setPaymentScreen(defaultScreen);
  };
  const handlePaymentHistoryRowClick = (entry) => { /* ... (function unchanged) ... */
    setSelectedPaymentHistoryEntry(entry); setIsPaymentHistoryModalOpen(true);
  };

  // --- Payment Submission Handler (Unchanged from last version) ---
  const handlePaymentSubmit = (paymentData) => { /* ... (function unchanged - still calls addPaymentHistoryEntry) ... */
    console.log('Payment Submitted in Dashboard:', paymentData);
    let updateError = false;
    setAssets(currentAssets => { /* ... balance update logic ... */
        const senderAssetIndex = currentAssets.findIndex( asset => asset.id === paymentData.senderAccountId );
        if (senderAssetIndex === -1) { updateError = true; return currentAssets; }
        const senderAsset = currentAssets[senderAssetIndex];
        const newBalance = Math.max(0, senderAsset.balance - paymentData.totalDebit);
        return currentAssets.map((asset, index) => index === senderAssetIndex ? { ...asset, balance: newBalance } : asset );
    });
    if (!updateError) {
       addPaymentHistoryEntry({
           type: paymentData.paymentType === 'hvt' ? 'HVT' : 'Cross-Border',
           amount: paymentData.amount, currency: paymentData.currency,
           recipient: paymentData.recipientName || paymentData.recipientAccount,
           status: paymentData.paymentType === 'hvt' ? 'Pending Approval' : 'Completed',
           reference: paymentData.paymentType === 'hvt' ? (paymentData.id || null) : paymentData.debitReference
       });
        alert(`Payment initiated!...`);
    } else { alert("Error processing payment submission."); }
     if (!updateError) {
        if (paymentData.paymentType === 'hvt') { handleBackToPaymentsDash('high-value-dash'); }
        else { handleBackToPaymentsDash('cross-border-dash'); }
     }
  };

  // --- Filter History based on Current Dashboard View ---
  const filteredHistory = useMemo(() => {
      if (paymentScreen.includes('cross-border') || paymentScreen === 'create-payment' || paymentScreen === 'view-templates' || paymentScreen === 'manage-recurring') {
          // Show Cross-Border and maybe generic Payment types
          return paymentHistory.filter(entry => entry.type === 'Cross-Border' || entry.type === 'Payment');
      } else if (paymentScreen.includes('high-value') || paymentScreen === 'create-hvt' || paymentScreen === 'authorize-hvt' || paymentScreen === 'view-transfer-details') {
          // Show only HVT types
          return paymentHistory.filter(entry => entry.type === 'HVT');
      } else if (paymentScreen.includes('bulk') || paymentScreen === 'upload-bulk-file' || paymentScreen === 'create-bulk-template') {
          // Show only Bulk types (adjust type name as needed)
          return paymentHistory.filter(entry => entry.type === 'Bulk Process' || entry.type === 'Bulk Upload');
      }
      return []; // Return empty for non-dashboard screens or unknown types
  }, [paymentScreen, paymentHistory]);


  // --- Render Logic ---
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Payments Dashboard</h1>

      {/* Tabs (Unchanged) */}
      <div className="mb-6 border-b border-gray-200"> <div className="flex space-x-6"> {/* ... tab buttons ... */}
        <button className={`pb-2 px-1 text-sm sm:text-base focus:outline-none ${ paymentScreen.includes('cross-border') || paymentScreen === 'create-payment' || paymentScreen === 'view-templates' || paymentScreen === 'manage-recurring' ? 'border-b-2 font-medium text-emtech-gold border-emtech-gold' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => handleNavigate('cross-border-dash')} > Cross-Border Payments </button>
        <button className={`pb-2 px-1 text-sm sm:text-base focus:outline-none ${ paymentScreen.includes('high-value') || paymentScreen === 'create-hvt' || paymentScreen === 'authorize-hvt' || paymentScreen === 'view-transfer-details' ? 'border-b-2 font-medium text-emtech-gold border-emtech-gold' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => handleNavigate('high-value-dash')} > High-Value Transfers </button>
        <button className={`pb-2 px-1 text-sm sm:text-base focus:outline-none ${ paymentScreen.includes('bulk') || paymentScreen === 'upload-bulk-file' || paymentScreen === 'create-bulk-template' ? 'border-b-2 font-medium text-emtech-gold border-emtech-gold' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => handleNavigate('bulk-dash')} > Bulk Payments </button>
      </div> </div>

      {/* Conditional Screen Rendering (Pass filtered history and click handler down) */}
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

      {/* --- REMOVED History Log Section from here --- */}

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