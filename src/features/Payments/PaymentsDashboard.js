// src/features/Payments/PaymentsDashboard.js
import React, { useState, useMemo } from 'react';
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
import RecurringPaymentModal from './RecurringPaymentModal'; // Import the new modal

// Import constants - initialPaymentHistory is handled in App.js
// recurringPayments state is still local here
import {
    dummyTemplates,
    initialDummyRecurringPayments
} from './data/paymentConstants';

const PaymentsDashboard = ({
    // Props from App.js
    assets = [],
    setAssets,
    assetLogosMap = {},
    // Props related to lifted history state
    paymentHistory = [],
    onAddHistoryEntry,
    onUpdateHistoryStatus,
}) => {

    // --- Component State ---
    const [paymentScreen, setPaymentScreen] = useState('cross-border-dash');
    const [viewingTransferDetails, setViewingTransferDetails] = useState(null);
    const [isPaymentHistoryModalOpen, setIsPaymentHistoryModalOpen] = useState(false);
    const [selectedPaymentHistoryEntry, setSelectedPaymentHistoryEntry] = useState(null);
    const [templates, setTemplates] = useState(dummyTemplates); // Template state is still local (or unused if ViewTemplatesScreen is local)
    const [recurringPayments, setRecurringPayments] = useState(initialDummyRecurringPayments); // Recurring state is local
    const [initialFormData, setInitialFormData] = useState(null);

    // State for the Recurring Payment Modal
    const [isRecurringModalOpen, setIsRecurringModalOpen] = useState(false);
    const [editingRecurringPayment, setEditingRecurringPayment] = useState(null); // null=create, object=edit

    // --- Handlers ---

    const handleNavigate = (screen, data = null) => {
        setInitialFormData(null);
        setViewingTransferDetails(null);
        if (screen === 'create-payment' && data?.templateData) {
            setInitialFormData(data.templateData);
        } else if (screen === 'view-transfer-details' && data?.transferId) {
            const transfer = paymentHistory.find(item => item.id === data.transferId && item.type === 'HVT');
            if (transfer) {
                setViewingTransferDetails(transfer);
            } else {
                console.error("Could not find HVT transfer with ID:", data.transferId);
            }
        }
        setPaymentScreen(screen);
    };

    const handleBackToPaymentsDash = (defaultScreen = 'cross-border-dash') => {
        setPaymentScreen(defaultScreen);
        setInitialFormData(null);
        setViewingTransferDetails(null);
    };

    const handlePaymentHistoryRowClick = (entry) => {
        setSelectedPaymentHistoryEntry(entry);
        setIsPaymentHistoryModalOpen(true);
    };

    const handlePaymentSubmit = (paymentData) => {
        console.log("PaymentsDashboard: handlePaymentSubmit received:", paymentData);
        const paymentTypeMap = { 'on-chain': paymentData._ui_payment_origin === 'client' ? 'Cross-Border' : 'On-Chain', 'traditional': 'Cross-Border', 'internal': 'Internal Transfer', 'hvt': 'HVT' };
        const paymentTypeString = paymentTypeMap[paymentData._ui_payment_type] || paymentData._ui_payment_type;
        const generatedReference = `REF-${Date.now().toString().slice(-6)}`;
        const historyEntry = {
            id: `${paymentTypeString.toLowerCase().replace(' ','-')}-${Date.now()}`, timestamp: new Date(), type: paymentTypeString,
            amount: paymentData.payment_info.amount, currency: paymentData.payment_info.currency,
            recipient: paymentData.destination_counterparty_info.name || paymentData.destination_counterparty_info.accountIdentifier,
            status: paymentData._ui_payment_type === 'hvt' ? 'Pending Approval' : 'Submitted',
            reference: generatedReference, rawData: paymentData
        };

        if (typeof onAddHistoryEntry === 'function') {
            onAddHistoryEntry(historyEntry); // Use prop to update lifted state
        } else { console.error("onAddHistoryEntry handler is missing!"); }

        if (historyEntry.status !== 'Pending Approval' && paymentData._ui_payment_origin === 'institutional' && typeof setAssets === 'function' && paymentData.payment_source.account_id && paymentData._simulated_total_debit > 0) {
            setAssets(prevAssets => { /* ... update balance ... */ });
        }

        let targetDashboardScreen = 'cross-border-dash';
        if (paymentData._ui_payment_type === 'hvt') { targetDashboardScreen = 'high-value-dash'; }
        setPaymentScreen(targetDashboardScreen);
        setInitialFormData(null);
        alert(`Payment ${historyEntry.status}! Ref: ${historyEntry.reference}`);
    };

    const handleBulkSubmit = (bulkData) => {
        console.log("PaymentsDashboard: handleBulkSubmit received:", bulkData);
        const generatedReference = `BULK-${Date.now().toString().slice(-6)}`;
        const historyEntry = {
            id: `bulk-${Date.now()}`, timestamp: new Date(), type: 'Bulk Process',
            amount: bulkData.calculatedTotal || bulkData.totalAmount || 0, currency: bulkData.currency || 'USD',
            recipient: bulkData.file?.name || bulkData.fileName || 'Bulk File', status: 'Processing',
            reference: generatedReference, rawData: bulkData
        };

        if (typeof onAddHistoryEntry === 'function') {
            onAddHistoryEntry(historyEntry); // Use prop to update lifted state
        } else { console.error("onAddHistoryEntry handler is missing!"); }

        alert(`Bulk file submitted for processing! Ref: ${generatedReference}`);
        setPaymentScreen('bulk-dash');
        setInitialFormData(null);
    };

    // Template handlers still modify local state (assuming ViewTemplatesScreen manages its own)
    const handleSaveTemplate = (templateData) => {
        console.log('PaymentsDashboard: handleSaveTemplate called with:', templateData);
        const index = templateData.id ? templates.findIndex(t => t.id === templateData.id) : -1;
        if (index > -1) { setTemplates(prev => prev.map((t, i) => i === index ? { ...t, ...templateData, lastUsed: t.lastUsed } : t)); }
        else { const newTemplate = { ...templateData, id: templateData.id || `tpl-${Date.now()}` }; setTemplates(prev => [newTemplate, ...prev]); }
    };
    const handleDeleteTemplate = (templateId) => {
        console.log('PaymentsDashboard: handleDeleteTemplate called with ID:', templateId);
        setTemplates(prev => prev.filter(t => t.id !== templateId));
    };

    // Recurring Payment Handlers - Updated for Modal
    const handleToggleRecurring = (paymentId, currentStatus) => {
        console.log('PaymentsDashboard: handleToggleRecurring called for ID:', paymentId);
        const newStatus = currentStatus === 'Active' ? 'Paused' : 'Active';
        setRecurringPayments(prev => prev.map(p => p.id === paymentId ? { ...p, status: newStatus, nextDate: newStatus === 'Paused' ? 'Paused' : p.nextDate } : p));
    };
    const handleDeleteRecurring = (paymentId) => {
        console.log('PaymentsDashboard: handleDeleteRecurring called for ID:', paymentId);
        setRecurringPayments(prev => prev.filter(p => p.id !== paymentId));
    };
    const handleEditRecurring = (paymentId) => {
        console.log('PaymentsDashboard: handleEditRecurring called for ID:', paymentId);
        const paymentToEdit = recurringPayments.find(p => p.id === paymentId);
        if (paymentToEdit) {
            setEditingRecurringPayment(paymentToEdit);
            setIsRecurringModalOpen(true); // Open modal for editing
        } else { alert("Error: Could not find recurring payment to edit."); }
    };
    const handleSetupNewRecurring = () => {
        console.log('PaymentsDashboard: handleSetupNewRecurring called');
        setEditingRecurringPayment(null); // null signifies 'create' mode
        setIsRecurringModalOpen(true); // Open modal for creation
    };
    const handleSaveRecurringPayment = (savedData) => {
      console.log("PaymentsDashboard: Saving recurring payment:", savedData);
      setRecurringPayments(prev => {
          const existingIndex = savedData.id ? prev.findIndex(p => p.id === savedData.id) : -1;

          if (existingIndex > -1) {
              // --- Update existing logic ---
              const updatedPayments = [...prev];
              // Merge saved data with existing data, ensure ID is kept
              updatedPayments[existingIndex] = { ...prev[existingIndex], ...savedData };
              // Ensure amount is stored as number if needed
              if (typeof updatedPayments[existingIndex].amount === 'string') {
                   updatedPayments[existingIndex].amount = parseFloat(updatedPayments[existingIndex].amount);
              }
              console.log("Updated existing recurring payment:", updatedPayments[existingIndex]);
              return updatedPayments;

          } else {
              // --- Add new logic ---
              const newPayment = {
                  ...savedData, // Spread data from the modal form
                  id: `rec-${Date.now()}`, // Generate a simple unique ID
                  status: 'Active', // Default new payments to Active

                  // --- Set the initial nextDate based on startDate ---
                  // Simple approach: Assume first payment is on the start date.
                  // Ensure savedData.startDate is in 'YYYY-MM-DD' format from the input type="date"
                  nextDate: savedData.startDate || 'TBD', // Use the start date from the modal

                  // Ensure amount is stored as number if needed
                  amount: typeof savedData.amount === 'string' ? parseFloat(savedData.amount) : savedData.amount,

                  // Add default time if your display/logic needs it (optional)
                  // nextTime: '9:00 AM UTC',
              };
              console.log("Added new recurring payment:", newPayment);
              return [newPayment, ...prev]; // Add to the beginning of the array
          }
      });
      setIsRecurringModalOpen(false); // Close modal after save
      setEditingRecurringPayment(null);
  };

    // HVT Handlers - Use props for history updates
    const handleAuthorizeHvt = (hvtId) => {
        console.log('PaymentsDashboard: handleAuthorizeHvt called for ID:', hvtId);
        const itemToAuthorize = paymentHistory.find(item => item.id === hvtId && item.status === 'Pending Approval');
        let itemDataForBalanceUpdate = null;
        if (itemToAuthorize && itemToAuthorize.rawData?._ui_payment_origin === 'institutional' && typeof setAssets === 'function' && itemToAuthorize.rawData?.payment_source?.account_id && itemToAuthorize.rawData?._simulated_total_debit > 0) {
            itemDataForBalanceUpdate = itemToAuthorize.rawData;
        }
        if (typeof onUpdateHistoryStatus === 'function') {
            onUpdateHistoryStatus(hvtId, 'Authorized', new Date()); // Use prop to update lifted state
        } else { console.error("onUpdateHistoryStatus handler is missing!"); }
        if (itemDataForBalanceUpdate) {
            setAssets(prevAssets => prevAssets.map(acc => { /* ... update balance ... */ }));
        }
    };
    const handleRejectHvt = (hvtId, reason) => {
        console.log('PaymentsDashboard: handleRejectHvt called for ID:', hvtId);
        const newStatus = `Rejected (${reason || 'No reason provided'})`;
        if (typeof onUpdateHistoryStatus === 'function') {
            onUpdateHistoryStatus(hvtId, newStatus, new Date()); // Use prop to update lifted state
        } else { console.error("onUpdateHistoryStatus handler is missing!"); }
    };

    // --- Memoized Values ---
    const pendingHvts = useMemo(() => {
        return paymentHistory.filter(item => item.type === 'HVT' && item.status?.toLowerCase().includes('pending'));
    }, [paymentHistory]); // Depends on history prop

    const filteredHistory = useMemo(() => {
        if (paymentScreen.startsWith('high-value')) return paymentHistory.filter(item => item.type === 'HVT');
        if (paymentScreen.startsWith('bulk')) return paymentHistory.filter(item => item.type === 'Bulk Process');
        if (paymentScreen.startsWith('cross-border')) return paymentHistory.filter(item => item.type !== 'HVT' && item.type !== 'Bulk Process');
        return paymentHistory;
    }, [paymentScreen, paymentHistory]); // Depends on history prop

    // --- Render Logic ---
    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Payments Dashboard</h1>
            {/* Tab Navigation */}
            <div className="mb-6 border-b border-gray-200">
                <div className="flex space-x-6">
                    <button className={`pb-2 px-1 text-sm sm:text-base focus:outline-none ${paymentScreen.startsWith('cross-border') || ['create-payment', 'view-templates', 'manage-recurring'].includes(paymentScreen) ? 'border-b-2 font-medium text-emtech-gold border-emtech-gold' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => handleNavigate('cross-border-dash')} > Cross-Border Payments </button>
                    <button className={`pb-2 px-1 text-sm sm:text-base focus:outline-none ${paymentScreen.startsWith('high-value') || ['create-hvt', 'authorize-hvt', 'view-transfer-details'].includes(paymentScreen) ? 'border-b-2 font-medium text-emtech-gold border-emtech-gold' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => handleNavigate('high-value-dash')} > High-Value Transfers </button>
                    <button className={`pb-2 px-1 text-sm sm:text-base focus:outline-none ${paymentScreen.startsWith('bulk') || ['upload-bulk-file', 'create-bulk-template'].includes(paymentScreen) ? 'border-b-2 font-medium text-emtech-gold border-emtech-gold' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => handleNavigate('bulk-dash')} > Bulk Payments </button>
                </div>
            </div>

            {/* Conditional Rendering of Screens */}
            <div className="mb-12">
                {paymentScreen === 'cross-border-dash' && (<CrossBorderDashboardView onNavigate={handleNavigate} history={filteredHistory} onHistoryRowClick={handlePaymentHistoryRowClick} />)}
                {paymentScreen === 'create-payment' && (<CreatePaymentScreen assets={assets} onBack={() => handleBackToPaymentsDash('cross-border-dash')} onPaymentSubmit={handlePaymentSubmit} initialData={initialFormData} />)}
                {/* Assuming ViewTemplatesScreen uses LOCAL state */}
                {paymentScreen === 'view-templates' && (<ViewTemplatesScreen onBack={() => handleBackToPaymentsDash('cross-border-dash')} onNavigate={handleNavigate} assets={assets} />)}
                {/* ManageRecurringPaymentsScreen receives updated handlers for edit/setup */}
                {paymentScreen === 'manage-recurring' && (<ManageRecurringPaymentsScreen onBack={() => handleBackToPaymentsDash('cross-border-dash')} recurringPayments={recurringPayments} onToggleRecurringStatus={handleToggleRecurring} onDeleteRecurring={handleDeleteRecurring} onEditRecurring={handleEditRecurring} onSetupNewRecurring={handleSetupNewRecurring} assets={assets} />)}
                {paymentScreen === 'high-value-dash' && (<HighValueDashboardView onNavigate={handleNavigate} history={filteredHistory} onHistoryRowClick={handlePaymentHistoryRowClick} />)}
                {paymentScreen === 'create-hvt' && (<CreateHighValueTransferScreen assets={assets} onBack={() => handleBackToPaymentsDash('high-value-dash')} onPaymentSubmit={handlePaymentSubmit} />)}
                {paymentScreen === 'authorize-hvt' && (<AuthorizeHVTScreen onBack={() => handleBackToPaymentsDash('high-value-dash')} onNavigate={handleNavigate} pendingHvts={pendingHvts} onAuthorizeHvt={handleAuthorizeHvt} onRejectHvt={handleRejectHvt} />)}
                {paymentScreen === 'view-transfer-details' && viewingTransferDetails && (<ViewTransferDetailsScreen transfer={viewingTransferDetails} onBack={() => handleNavigate('authorize-hvt')} />)}
                {paymentScreen === 'bulk-dash' && (<BulkDashboardView onNavigate={handleNavigate} history={filteredHistory} onHistoryRowClick={handlePaymentHistoryRowClick} />)}
                {paymentScreen === 'upload-bulk-file' && (<UploadBulkFileScreen assets={assets} onBack={() => handleBackToPaymentsDash('bulk-dash')} onBulkSubmit={handleBulkSubmit} />)}
                {paymentScreen === 'create-bulk-template' && (<div>Create Bulk Template Placeholder... <button onClick={() => handleBackToPaymentsDash('bulk-dash')} className="text-sm text-blue-600 hover:underline">Back</button></div>)}
            </div>

            {/* Payment History Modal */}
            {isPaymentHistoryModalOpen && selectedPaymentHistoryEntry && ( <PaymentHistoryDetailModal entry={selectedPaymentHistoryEntry} onClose={() => { setIsPaymentHistoryModalOpen(false); setSelectedPaymentHistoryEntry(null); }} /> )}

            {/* Recurring Payment Modal */}
            {isRecurringModalOpen && (
                <RecurringPaymentModal
                    isOpen={isRecurringModalOpen}
                    onClose={() => { setIsRecurringModalOpen(false); setEditingRecurringPayment(null); }}
                    onSave={handleSaveRecurringPayment}
                    recurringPaymentData={editingRecurringPayment}
                    assets={assets}
                />
            )}
        </div>
    );
};

export default PaymentsDashboard;