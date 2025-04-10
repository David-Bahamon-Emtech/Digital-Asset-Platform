// src/features/Payments/PaymentsDashboard.js
import React, { useState, useMemo, useEffect } from 'react';

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

import {
    dummyTemplates,
    initialDummyRecurringPayments
} from './data/paymentConstants';

const initialPaymentHistory = [
    // Initial history entries... (kept same as before)
    { id: 'hvt_1712720000000', timestamp: new Date(Date.now() - 5 * 60 * 1000), type: 'HVT', amount: 5000000, currency: 'USD', recipient: 'Bank of Example', status: 'Pending Approval', reference: 'HVT-PEND01', rawData: { purposeCode: 'TREA', valueDate: '2025-04-10', initiatedBy: 'Test User HVT', recipientAccount: '123456789', recipientBankSwift: 'BOFUS33A', _simulated_total_debit: 5000100 } },
    { id: 'ph1', timestamp: new Date(Date.now() - 2 * 60 * 1000), type: 'Cross-Border', amount: 1500, currency: 'USDC', recipient: 'External Vendor A', status: 'Completed', reference: 'INV-123' },
    { id: 'ph3', timestamp: new Date(Date.now() - 10 * 60 * 1000), type: 'Cross-Border', amount: 25000, currency: 'USDT', recipient: 'Partner Company X', status: 'Completed', reference: 'PO-456' },
    { id: 'ph4', timestamp: new Date(Date.now() - 30 * 60 * 1000), type: 'HVT', amount: 10000000, currency: 'GBP', recipient: 'UK Treasury', status: 'Authorized', reference: 'HVT-AUTH01', rawData: { purposeCode: 'GOVT', valueDate: '2025-04-09', initiatedBy: 'Treasury Dept', recipientAccount: 'GB12ABCD12345678901234', recipientBankSwift: 'BOEGB2L' } },
    { id: 'ph5', timestamp: new Date(Date.now() - 60 * 60 * 1000), type: 'Cross-Border', amount: 50, currency: 'eGH¢', recipient: 'Local Merchant', status: 'Completed', reference: 'POS-789' },
    { id: 'ph6', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), type: 'Bulk Process', amount: 125000, currency: 'USD', recipient: 'Payroll Batch 1', status: 'Completed', reference: 'BULK-PAY-01' },
    { id: 'ph7', timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), type: 'Cross-Border', amount: 999, currency: 'USDC', recipient: 'Test Wallet', status: 'Completed', reference: 'TEST-001' },
].sort((a, b) => b.timestamp - a.timestamp);


/**
 * Main component acting as a controller for the Payments feature.
 * Manages navigation between payment-related screens and centralizes state
 * for payment history, templates, and recurring payments.
 */
const PaymentsDashboard = ({ assets = [], setAssets, assetLogosMap = {} }) => {

  const [paymentScreen, setPaymentScreen] = useState('cross-border-dash');
  const [viewingTransferDetails, setViewingTransferDetails] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState(initialPaymentHistory);
  const [isPaymentHistoryModalOpen, setIsPaymentHistoryModalOpen] = useState(false);
  const [selectedPaymentHistoryEntry, setSelectedPaymentHistoryEntry] = useState(null);
  const [templates, setTemplates] = useState(dummyTemplates);
  const [recurringPayments, setRecurringPayments] = useState(initialDummyRecurringPayments);
  const [initialFormData, setInitialFormData] = useState(null); // <-- ADDED State for pre-filling form

  /**
   * Adds a pre-formatted entry object to the payment history state.
   */
  const addPaymentHistoryEntry = (entryData) => {
    setPaymentHistory(prevHistory => [entryData, ...prevHistory]);
  };

  /**
   * Handles navigation between different screens within the Payments feature.
   * Allows passing data for specific transitions (e.g., template data for create screen).
   */
  const handleNavigate = (screen, data = null) => {
     setInitialFormData(null); // Clear previous form data by default
     setViewingTransferDetails(null); // Clear HVT details

     if (screen === 'create-payment' && data?.templateData) {
         setInitialFormData(data.templateData); // Set data for create screen
     } else if (screen === 'view-transfer-details' && data?.transferId) {
         const transfer = paymentHistory.find(item => item.id === data.transferId && item.type === 'HVT');
         if (transfer) {
            setViewingTransferDetails(transfer);
         } else {
            console.error("Could not find HVT transfer with ID:", data.transferId);
         }
     }
     // Always set the screen at the end
     setPaymentScreen(screen);
   };

  const handleBackToPaymentsDash = (defaultScreen = 'cross-border-dash') => {
      setPaymentScreen(defaultScreen);
      setInitialFormData(null); // Also clear form data when going back explicitly
  };

  const handlePaymentHistoryRowClick = (entry) => {
    setSelectedPaymentHistoryEntry(entry);
    setIsPaymentHistoryModalOpen(true);
  };

  /**
   * Handles the submission of a new payment from creation screens.
   * Adds the payment to history, updates institutional balances, and navigates away.
   */
  const handlePaymentSubmit = (paymentData) => {
    console.log("handlePaymentSubmit received:", paymentData);
    const paymentTypeMap = { 'on-chain': paymentData._ui_payment_origin === 'client' ? 'Cross-Border' : 'On-Chain', 'traditional': 'Cross-Border', 'internal': 'Internal Transfer', 'hvt': 'HVT' };
    const paymentTypeString = paymentTypeMap[paymentData._ui_payment_type] || paymentData._ui_payment_type;
    const generatedReference = `REF-${Date.now().toString().slice(-6)}`;

    const historyEntry = {
        id: `${paymentTypeString.toLowerCase().replace(' ','-')}-${Date.now()}`, // Updated ID generation slightly
        timestamp: new Date(),
        type: paymentTypeString,
        amount: paymentData.payment_info.amount,
        currency: paymentData.payment_info.currency,
        recipient: paymentData.destination_counterparty_info.name || paymentData.destination_counterparty_info.accountIdentifier,
        status: paymentData._ui_payment_type === 'hvt' ? 'Pending Approval' : 'Submitted',
        reference: generatedReference,
        rawData: paymentData
    };
    addPaymentHistoryEntry(historyEntry);

    if (historyEntry.status !== 'Pending Approval' && paymentData._ui_payment_origin === 'institutional' && typeof setAssets === 'function' && paymentData.payment_source.account_id && paymentData._simulated_total_debit > 0) {
       setAssets(prevAssets => {
         return prevAssets.map(acc => {
           if (acc.id === paymentData.payment_source.account_id) {
             const newBalance = acc.balance - paymentData._simulated_total_debit;
             return { ...acc, balance: Math.max(0, newBalance) };
           }
           return acc;
         });
       });
    }

    let targetDashboardScreen = 'cross-border-dash';
    if (paymentData._ui_payment_type === 'hvt') { targetDashboardScreen = 'high-value-dash'; }
    setPaymentScreen(targetDashboardScreen);
    setInitialFormData(null); // Clear form data after successful submission
    alert(`Payment ${historyEntry.status}! Ref: ${historyEntry.reference}`);
  };

  const handleBulkSubmit = (bulkData) => {
      console.log("Bulk submit received:", bulkData);
      const generatedReference = `BULK-${Date.now().toString().slice(-6)}`;
      addPaymentHistoryEntry({
          id: `bulk-${Date.now()}`, timestamp: new Date(), type: 'Bulk Process',
          amount: bulkData.totalAmount || 0, currency: bulkData.currency || 'USD',
          recipient: bulkData.fileName || 'Bulk File', status: 'Processing',
          reference: generatedReference, rawData: bulkData
      });
      alert(`Bulk file submitted for processing! Ref: ${generatedReference}`);
      setPaymentScreen('bulk-dash');
      setInitialFormData(null); // Clear potentially conflicting data
  };
  const handleSaveTemplate = (templateData) => { /* Placeholder logic */ console.log('Save Template:', templateData); };
  const handleDeleteTemplate = (templateId) => { /* Placeholder logic */ console.log('Delete Template:', templateId); };
  const handleToggleRecurring = (paymentId, currentStatus) => { /* Placeholder logic */ console.log('Toggle Recurring:', paymentId, currentStatus); };
  const handleDeleteRecurring = (paymentId) => { /* Placeholder logic */ console.log('Delete Recurring:', paymentId); };
  const handleEditRecurring = (paymentId) => { /* Placeholder logic */ console.log('Edit Recurring:', paymentId); };
  const handleSetupNewRecurring = () => { /* Placeholder logic */ console.log('Setup New Recurring'); };
  const handleAuthorizeHvt = (hvtId) => { /* Placeholder logic */ console.log('Authorize HVT:', hvtId); };
  const handleRejectHvt = (hvtId, reason) => { /* Placeholder logic */ console.log('Reject HVT:', hvtId, reason); };

  const pendingHvts = useMemo(() => {
    return paymentHistory.filter(item => item.type === 'HVT' && item.status?.toLowerCase().includes('pending'));
  }, [paymentHistory]);

  const filteredHistory = useMemo(() => {
      if (paymentScreen.startsWith('high-value')) return paymentHistory.filter(item => item.type === 'HVT');
      if (paymentScreen.startsWith('bulk')) return paymentHistory.filter(item => item.type === 'Bulk Process');
      if (paymentScreen.startsWith('cross-border')) return paymentHistory.filter(item => item.type !== 'HVT' && item.type !== 'Bulk Process');
      return paymentHistory;
  }, [paymentScreen, paymentHistory]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Payments Dashboard</h1>
      <div className="mb-6 border-b border-gray-200">
        <div className="flex space-x-6">
            {/* Tabs... */}
            <button className={`pb-2 px-1 text-sm sm:text-base focus:outline-none ${ paymentScreen.startsWith('cross-border') || ['create-payment', 'view-templates', 'manage-recurring'].includes(paymentScreen) ? 'border-b-2 font-medium text-emtech-gold border-emtech-gold' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => handleNavigate('cross-border-dash')} > Cross-Border Payments </button>
            <button className={`pb-2 px-1 text-sm sm:text-base focus:outline-none ${ paymentScreen.startsWith('high-value') || ['create-hvt', 'authorize-hvt', 'view-transfer-details'].includes(paymentScreen) ? 'border-b-2 font-medium text-emtech-gold border-emtech-gold' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => handleNavigate('high-value-dash')} > High-Value Transfers </button>
            <button className={`pb-2 px-1 text-sm sm:text-base focus:outline-none ${ paymentScreen.startsWith('bulk') || ['upload-bulk-file', 'create-bulk-template'].includes(paymentScreen) ? 'border-b-2 font-medium text-emtech-gold border-emtech-gold' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => handleNavigate('bulk-dash')} > Bulk Payments </button>
        </div>
      </div>

      <div className="mb-12">
         {paymentScreen === 'cross-border-dash' && (<CrossBorderDashboardView onNavigate={handleNavigate} history={filteredHistory} onHistoryRowClick={handlePaymentHistoryRowClick} />)}
         {paymentScreen === 'create-payment' && (
            <CreatePaymentScreen
                assets={assets}
                onBack={() => handleBackToPaymentsDash('cross-border-dash')}
                onPaymentSubmit={handlePaymentSubmit}
                initialData={initialFormData}
            />
         )}
         {paymentScreen === 'view-templates' && (<ViewTemplatesScreen onBack={() => handleBackToPaymentsDash('cross-border-dash')} onNavigate={handleNavigate} templates={templates} onSaveTemplate={handleSaveTemplate} onDeleteTemplate={handleDeleteTemplate} />)}
         {paymentScreen === 'manage-recurring' && (<ManageRecurringPaymentsScreen onBack={() => handleBackToPaymentsDash('cross-border-dash')} recurringPayments={recurringPayments} onToggleRecurringStatus={handleToggleRecurring} onDeleteRecurring={handleDeleteRecurring} onEditRecurring={handleEditRecurring} onSetupNewRecurring={handleSetupNewRecurring} />)}
         {paymentScreen === 'high-value-dash' && (<HighValueDashboardView onNavigate={handleNavigate} history={filteredHistory} onHistoryRowClick={handlePaymentHistoryRowClick} />)}
         {paymentScreen === 'create-hvt' && (<CreateHighValueTransferScreen assets={assets} onBack={() => handleBackToPaymentsDash('high-value-dash')} onPaymentSubmit={handlePaymentSubmit} />)}
         {paymentScreen === 'authorize-hvt' && (<AuthorizeHVTScreen onBack={() => handleBackToPaymentsDash('high-value-dash')} onNavigate={handleNavigate} pendingHvts={pendingHvts} onAuthorizeHvt={handleAuthorizeHvt} onRejectHvt={handleRejectHvt} />)}
         {paymentScreen === 'view-transfer-details' && viewingTransferDetails && (<ViewTransferDetailsScreen transfer={viewingTransferDetails} onBack={() => handleNavigate('authorize-hvt')} />)}
         {paymentScreen === 'bulk-dash' && (<BulkDashboardView onNavigate={handleNavigate} history={filteredHistory} onHistoryRowClick={handlePaymentHistoryRowClick} />)}
         {paymentScreen === 'upload-bulk-file' && (<UploadBulkFileScreen assets={assets} onBack={() => handleBackToPaymentsDash('bulk-dash')} onBulkSubmit={handleBulkSubmit} />)}
         {paymentScreen === 'create-bulk-template' && (<div>Create Bulk Template Placeholder... <button onClick={() => handleBackToPaymentsDash('bulk-dash')} className="text-sm text-blue-600 hover:underline">Back</button></div>)}
      </div>

       {isPaymentHistoryModalOpen && selectedPaymentHistoryEntry && ( <PaymentHistoryDetailModal entry={selectedPaymentHistoryEntry} onClose={() => { setIsPaymentHistoryModalOpen(false); setSelectedPaymentHistoryEntry(null); }} /> )}
    </div>
  );
};

export default PaymentsDashboard;