// src/features/Payments/PaymentsDashboard.js

import React, { useState, useMemo, useCallback } from 'react';

// --- Component Imports (Ensure these paths are correct relative to this file) ---
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
import CreateBulkTemplateScreen from './CreateBulkTemplateScreen';
import EditBulkFileScreen from './EditBulkFileScreen';

// Modals
import PaymentHistoryDetailModal from './PaymentHistoryDetailModal';
import RecurringPaymentModal from './RecurringPaymentModal';
import ActiveBulkDetailModal from './ActiveBulkDetailModal';
// --- END Component Imports ---

// --- Context Hooks (Ensure these paths are correct) ---
import { useAssets } from '../../context/AssetsContext';
import { usePaymentHistory } from '../../context/PaymentHistoryContext';
import { useTemplates } from '../../context/TemplatesContext';
import { useRecurringPayments } from '../../context/RecurringPaymentsContext';
import { useActiveBulk } from '../../context/ActiveBulkContext';
// --- END Context Hooks ---

// Utilities (Ensure this path is correct)
import {
    isValid, startOfDay, format as formatDate, addDays, addWeeks, addMonths
} from 'date-fns'; // Or your date utility library


const PaymentsDashboard = ({ assetLogosMap = {} }) => {

    // --- Consume Contexts ---
    const { assets, dispatchAssets } = useAssets();
    const { paymentHistory, dispatchPaymentHistory } = usePaymentHistory();
    const { templates, dispatchTemplates } = useTemplates(); // Get templates for delete handler confirmation
    const { recurringPayments, dispatchRecurring } = useRecurringPayments();
    const {
        activeBulkFiles,
        addActiveBulkFile,
        removeActiveBulkFile,
        updateActiveBulkStatus, // Keep if needed for other status updates
        updateActiveBulkDetails
    } = useActiveBulk();

    // --- Local UI State ---
    const [paymentScreen, setPaymentScreen] = useState('cross-border-dash'); // Default screen
    const [viewingTransferDetails, setViewingTransferDetails] = useState(null); // For HVT details screen
    const [isPaymentHistoryModalOpen, setIsPaymentHistoryModalOpen] = useState(false); // For historical payment details modal
    const [selectedPaymentHistoryEntry, setSelectedPaymentHistoryEntry] = useState(null); // Data for historical payment modal
    const [initialFormData, setInitialFormData] = useState(null); // For pre-filling CreatePaymentScreen from template
    const [isRecurringModalOpen, setIsRecurringModalOpen] = useState(false); // For recurring payment create/edit modal
    const [editingRecurringPayment, setEditingRecurringPayment] = useState(null); // Data for recurring payment modal (edit mode)
    const [isBulkDetailModalOpen, setIsBulkDetailModalOpen] = useState(false); // For active bulk file detail modal
    const [selectedActiveBulkFile, setSelectedActiveBulkFile] = useState(null); // Data for active bulk file modal
    const [editingBulkFileData, setEditingBulkFileData] = useState(null); // Data passed to EditBulkFileScreen

    // --- Helper: Date Calculation for Recurring ---
    const calculateNextDateFromToday = useCallback((payment, startDate = new Date()) => {
       if (!payment?.frequency) return null;
       const today = startOfDay(startDate); let calculatedNextDate = today; let attempts = 0; const maxAttempts = 366; // Safety limit
       while (attempts < maxAttempts) {
           let potentialNextDate = calculatedNextDate; const freqLower = payment.frequency.toLowerCase().split(' ')[0];
           // Calculate next potential date based on frequency
           if (freqLower === 'daily') potentialNextDate = addDays(today, attempts);
           else if (freqLower === 'weekly') potentialNextDate = addWeeks(today, attempts);
           else if (freqLower === 'bi-weekly') potentialNextDate = addWeeks(today, attempts * 2);
           else if (freqLower === 'monthly') potentialNextDate = addMonths(today, attempts);
           else if (freqLower === 'quarterly') potentialNextDate = addMonths(today, attempts * 3);
           else if (freqLower === 'annually') potentialNextDate = addMonths(today, attempts * 12);
           else return null; // Unknown frequency
           potentialNextDate = startOfDay(potentialNextDate);
           // Return the first valid date that is on or after today
           if (potentialNextDate >= today && isValid(potentialNextDate)) { return formatDate(potentialNextDate, 'yyyy-MM-dd'); }
           attempts++;
       } console.warn("Could not calculate next date for recurring payment:", payment.id); return null; // Return null if no date found
   }, []); // No external dependencies for this helper


    // --- Navigation Handlers ---
    const handleNavigate = useCallback((screen, data = null) => {
        // Reset potentially stale state before navigating
        setInitialFormData(null); setViewingTransferDetails(null); setEditingBulkFileData(null);
        setSelectedActiveBulkFile(null); setIsBulkDetailModalOpen(false); setIsPaymentHistoryModalOpen(false); // Also close history modal

        // Pass data needed for specific screens
        if (screen === 'create-payment' && data?.templateData) { setInitialFormData(data.templateData); }
        else if (screen === 'view-transfer-details' && data?.transferId) {
            const transfer = paymentHistory.find(item => item.id === data.transferId && item.type === 'HVT');
            if (transfer) { setViewingTransferDetails(transfer); } else { console.error("HVT not found:", data.transferId); alert("Error: Transfer details not found."); return; }
        } else if (screen === 'edit-bulk-file' && data?.fileData) { setEditingBulkFileData(data.fileData); }
        // Set the active screen
        setPaymentScreen(screen);
    }, [paymentHistory]); // Depends on paymentHistory to find HVT details

    const handleBackToPaymentsDash = useCallback((defaultScreen = 'cross-border-dash') => {
        // Reset transient states when going back to a main dashboard view
        setInitialFormData(null); setViewingTransferDetails(null); setEditingBulkFileData(null);
        setSelectedActiveBulkFile(null); setIsBulkDetailModalOpen(false); setIsPaymentHistoryModalOpen(false);
        // Set the screen
        setPaymentScreen(defaultScreen);
    }, []); // No external dependencies


    // --- Modal Handlers ---
    // Opens the detail modal for HISTORICAL payments
    const handlePaymentHistoryRowClick = useCallback((entry) => {
        setSelectedPaymentHistoryEntry(entry); setIsPaymentHistoryModalOpen(true);
    }, []); // No external dependencies


    // --- Submission Handlers ---
    // Handles submissions from CreatePaymentScreen and CreateHighValueTransferScreen
    const handlePaymentSubmit = useCallback((paymentData) => {
        console.log("PaymentsDashboard: handlePaymentSubmit received:", paymentData);
        const paymentTypeMap = { 'on-chain': paymentData._ui_payment_origin === 'client' ? 'Cross-Border' : 'On-Chain', 'traditional': 'Cross-Border', 'internal': 'Internal Transfer', 'hvt': 'HVT' };
        const paymentTypeString = paymentTypeMap[paymentData._ui_payment_type] || paymentData._ui_payment_type;
        const generatedReference = `REF-${Date.now().toString().slice(-6)}`;
        let status = 'Submitted';
        if (paymentData._ui_payment_type === 'hvt') { status = 'Pending Approval'; }
        else if (paymentData._ui_payment_type === 'on-chain') { status = 'Completed'; } // Assuming instant for demo

        const historyEntry = {
            id: `${paymentTypeString.toLowerCase().replace(' ','-')}-${Date.now()}`, timestamp: new Date(), type: paymentTypeString,
            amount: paymentData.payment_info.amount, currency: paymentData.payment_info.currency,
            recipient: paymentData.destination_counterparty_info.name || paymentData.destination_counterparty_info.accountIdentifier,
            status: status, reference: generatedReference, rawData: paymentData // Store full submission data
        };
        dispatchPaymentHistory({ type: 'ADD_PAYMENT_HISTORY', payload: historyEntry });

        // Debit asset balance if applicable
        if (status !== 'Pending Approval' && paymentData.payment_source.account_id && paymentData._simulated_total_debit > 0) {
             dispatchAssets({ type: 'UPDATE_ASSET_BALANCE', payload: { assetId: paymentData.payment_source.account_id, changeAmount: -paymentData._simulated_total_debit }});
        }
        let targetDashboardScreen = 'cross-border-dash'; if (paymentData._ui_payment_type === 'hvt') { targetDashboardScreen = 'high-value-dash'; }
        handleBackToPaymentsDash(targetDashboardScreen); // Use back handler to reset state & navigate
        alert(`Payment ${historyEntry.status}! Ref: ${historyEntry.reference}`);
    }, [dispatchPaymentHistory, dispatchAssets, handleBackToPaymentsDash]); // Dependencies

    // Handles submissions from UploadBulkFileScreen
    const handleBulkSubmit = useCallback((bulkSubmitData) => {
        console.log("PaymentsDashboard: handleBulkSubmit received:", bulkSubmitData);
        const bulkFileId = `bulk-active-${Date.now()}`;
        const sourceAsset = assets?.find(a => a.id === bulkSubmitData.sourceAccountId); // Find asset details

        // Create entry for the ActiveBulkContext - Includes NEW FIELDS
        const activeBulkEntry = {
             id: bulkFileId,
             fileName: bulkSubmitData.fileName || 'Unknown File',
             batchLabel: bulkSubmitData.fileName?.split('.')[0].replace(/_/g, ' ') || 'Untitled Batch', // Example: derive from filename
             batchReference: '', // Default to empty
             uploadTimestamp: new Date(),
             fileType: bulkSubmitData.fileType || 'Unknown',
             paymentType: 'Bulk', // Default category, could be from template later
             totalPayments: bulkSubmitData.simulatedTotalPayments || 0, // Use simulated data from upload screen
             processedPayments: 0, // Starts at 0
             totalValue: bulkSubmitData.simulatedTotalValue || 0, // Use simulated data from upload screen
             currency: sourceAsset?.symbol || 'UNK', // Get from source asset
             sourceAccountId: bulkSubmitData.sourceAccountId,
             scheduleTimestamp: null, // Default to immediate processing if possible
             status: 'Uploaded', // Initial status
             statusMessage: 'File uploaded, pending validation.',
        };
        addActiveBulkFile(activeBulkEntry); // Add to the active context
        alert(`Bulk file '${activeBulkEntry.fileName}' submitted and added to active queue!`);
        handleBackToPaymentsDash('bulk-dash'); // Use back handler to reset state & navigate
    }, [addActiveBulkFile, assets, handleBackToPaymentsDash]); // Dependencies

    // Handles submissions from CreateBulkTemplateScreen
    const handleTemplateSubmit = useCallback((templateData) => {
         const isUpdate = !!templateData.created; // Check if editing based on existence of 'created' date
         console.log(`PaymentsDashboard: Submitting template (Update: ${isUpdate})`, templateData);
         dispatchTemplates({ type: isUpdate ? 'UPDATE_TEMPLATE' : 'ADD_TEMPLATE', payload: templateData }); // Ensure TemplatesContext handles these
         alert(`Template "${templateData.name}" ${isUpdate ? 'updated' : 'created'} successfully!`);
         handleBackToPaymentsDash('bulk-dash'); // Go back to bulk dash after saving template
    }, [dispatchTemplates, handleBackToPaymentsDash]); // Dependencies


    // --- Template Handlers ---
    // Handles deleting a template (likely triggered from ViewTemplatesScreen)
    const handleDeleteTemplate = useCallback((templateId) => {
        const templateToDelete = templates?.find(t => t.id === templateId); // Use 'templates' from context for name
        const confirmMessage = templateToDelete ? `Are you sure you want to delete the template "${templateToDelete.name || 'Unnamed Template'}"?` : `Are you sure you want to delete this template?`;
        if (window.confirm(confirmMessage)) {
             dispatchTemplates({ type: 'DELETE_TEMPLATE', payload: templateId }); // Ensure TemplatesContext handles this
        }
    }, [templates, dispatchTemplates]); // Depends on templates list for name


    // --- Recurring Payment Handlers ---
    const handleToggleRecurring = useCallback((paymentId, currentStatus) => {
        const paymentToToggle = recurringPayments.find(p => p.id === paymentId); if (!paymentToToggle) { console.error("Recurring payment not found:", paymentId); return; }
        const newStatus = currentStatus === 'Active' ? 'Paused' : 'Active';
        let nextDateValue = newStatus === 'Paused' ? null : calculateNextDateFromToday(paymentToToggle);
        if (newStatus === 'Active' && !nextDateValue) { nextDateValue = 'TBD'; } // Fallback
        dispatchRecurring({ type: 'TOGGLE_RECURRING_STATUS', payload: { id: paymentId, newStatus: newStatus, nextDate: nextDateValue } });
    }, [recurringPayments, dispatchRecurring, calculateNextDateFromToday]);

    const handleDeleteRecurring = useCallback((paymentId) => {
         const paymentToDelete = recurringPayments.find(p => p.id === paymentId);
         const confirmMessage = paymentToDelete ? `Delete recurring payment "${paymentToDelete.name || 'Unnamed'}"?` : `Delete this recurring payment?`;
        if (window.confirm(confirmMessage)) { dispatchRecurring({ type: 'DELETE_RECURRING', payload: paymentId }); }
    }, [recurringPayments, dispatchRecurring]);

    const handleEditRecurring = useCallback((paymentId) => {
        const paymentToEdit = recurringPayments.find(p => p.id === paymentId);
        if (paymentToEdit) { setEditingRecurringPayment(paymentToEdit); setIsRecurringModalOpen(true); }
        else { console.error("Could not find recurring payment to edit:", paymentId); }
    }, [recurringPayments]);

     const handleSetupNewRecurring = useCallback(() => {
        setEditingRecurringPayment(null); setIsRecurringModalOpen(true);
    }, []);


    // --- HVT Handlers ---
    const handleAuthorizeHvt = useCallback((hvtId) => {
        const itemToAuthorize = paymentHistory.find(item => item.id === hvtId && item.status?.toLowerCase().includes('pending')); if (!itemToAuthorize) return;
        dispatchPaymentHistory({ type: 'UPDATE_PAYMENT_STATUS', payload: { entryId: hvtId, newStatus: 'Authorized', newTimestamp: new Date() }});
        // Debit asset upon authorization
        if (itemToAuthorize.rawData?._ui_payment_origin === 'institutional' && itemToAuthorize.rawData?.payment_source?.account_id && itemToAuthorize.rawData?._simulated_total_debit > 0) {
            dispatchAssets({ type: 'UPDATE_ASSET_BALANCE', payload: { assetId: itemToAuthorize.rawData.payment_source.account_id, changeAmount: -itemToAuthorize.rawData._simulated_total_debit }});
        }
    }, [paymentHistory, dispatchPaymentHistory, dispatchAssets]);

    const handleRejectHvt = useCallback((hvtId, reason) => {
        const newStatus = `Rejected${reason ? ` (${reason})` : ''}`;
        dispatchPaymentHistory({ type: 'UPDATE_PAYMENT_STATUS', payload: { entryId: hvtId, newStatus: newStatus, newTimestamp: new Date() }});
    }, [dispatchPaymentHistory]);


    // --- Active Bulk File Action Handlers ---
    // Opens the detail modal for active bulk files
    const handleViewActiveBulkFile = useCallback((fileId) => {
        const file = activeBulkFiles.find(f => f.id === fileId);
        if (file) {
            setSelectedActiveBulkFile(file); // Set data for modal
            setIsBulkDetailModalOpen(true); // Open modal
        } else { console.error("Could not find active bulk file ID:", fileId); }
    }, [activeBulkFiles]); // Dependency

    // Navigates to the edit screen for active bulk files
    const handleEditActiveBulkFile = useCallback((fileId) => {
        const file = activeBulkFiles.find(f => f.id === fileId);
        if (file) {
            handleNavigate('edit-bulk-file', { fileData: file }); // Use navigation handler
        } else { console.error("Could not find active bulk file ID:", fileId); }
    }, [activeBulkFiles, handleNavigate]); // Dependencies

    // Handles deleting/cancelling an active bulk file
    const handleDeleteActiveBulkFile = useCallback((fileId) => {
        const file = activeBulkFiles.find(f => f.id === fileId);
        if (file) {
             if (window.confirm(`Are you sure you want to delete/cancel active file "${file.fileName || fileId}"? This action cannot be undone.`)) {
                removeActiveBulkFile({ fileId }); // Dispatch remove action from context
             }
        } else { console.error("Could not find active bulk file ID:", fileId); }
    }, [activeBulkFiles, removeActiveBulkFile]); // Dependencies

    // Handles saving updates from the EditBulkFileScreen
    const handleUpdateBulkDetails = useCallback((fileId, updates) => {
        console.log(`PaymentsDashboard: Updating details for ${fileId}`, updates);
        updateActiveBulkDetails({ fileId, updates }); // Dispatch update action from context
        handleBackToPaymentsDash('bulk-dash'); // Navigate back after saving
    }, [updateActiveBulkDetails, handleBackToPaymentsDash]); // Dependencies


    // --- Memos using Context State ---
    // Memoize pending HVT list
    const pendingHvts = useMemo(() =>
        paymentHistory.filter(item => item.type === 'HVT' && item.status?.toLowerCase().includes('pending'))
    , [paymentHistory]);

    // Memoize filtered history for views OTHER than bulk dash
    const filteredHistoryForViews = useMemo(() => {
        if (paymentScreen.startsWith('high-value')) {
            return paymentHistory.filter(item => item.type === 'HVT');
        }
        // Default for cross-border or any non-bulk/hvt screen
        if (paymentScreen.startsWith('cross-border') || (!paymentScreen.startsWith('bulk') && !paymentScreen.startsWith('high-value'))) {
            return paymentHistory.filter(item => item.type !== 'HVT' && item.type !== 'Bulk Process');
        }
        return []; // Return empty if on bulk dash or unhandled screen type
    }, [paymentScreen, paymentHistory]);


    // --- Render Logic ---
    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Payments Dashboard</h1>
            {/* Tabs */}
             <div className="mb-6 border-b border-gray-200">
                <div className="flex space-x-6 overflow-x-auto pb-1">
                    {/* Tabs using standard button elements */}
                    <button
                        type="button"
                        className={`pb-2 px-1 text-sm sm:text-base focus:outline-none whitespace-nowrap ${paymentScreen.startsWith('cross-border') || ['create-payment', 'view-templates', 'manage-recurring'].includes(paymentScreen) ? 'border-b-2 font-medium text-emtech-gold border-emtech-gold' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => handleNavigate('cross-border-dash')}
                    >
                        Cross-Border Payments
                    </button>
                    <button
                        type="button"
                        className={`pb-2 px-1 text-sm sm:text-base focus:outline-none whitespace-nowrap ${paymentScreen.startsWith('high-value') || ['create-hvt', 'authorize-hvt', 'view-transfer-details'].includes(paymentScreen) ? 'border-b-2 font-medium text-emtech-gold border-emtech-gold' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => handleNavigate('high-value-dash')}
                    >
                        High-Value Transfers
                    </button>
                    <button
                        type="button"
                        className={`pb-2 px-1 text-sm sm:text-base focus:outline-none whitespace-nowrap ${paymentScreen.startsWith('bulk') || ['upload-bulk-file', 'create-bulk-template', 'edit-bulk-file'].includes(paymentScreen) ? 'border-b-2 font-medium text-emtech-gold border-emtech-gold' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => handleNavigate('bulk-dash')}
                    >
                        Bulk Payments
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="mb-12">
                {/* --- Conditional Rendering based on paymentScreen state --- */}
                {/* Using explicit prop passing */}

                {paymentScreen === 'cross-border-dash' && (
                    <CrossBorderDashboardView
                        onNavigate={handleNavigate}
                        history={filteredHistoryForViews}
                        onHistoryRowClick={handlePaymentHistoryRowClick}
                    />
                )}
                {paymentScreen === 'create-payment' && (
                    <CreatePaymentScreen
                        onBack={() => handleBackToPaymentsDash('cross-border-dash')}
                        onPaymentSubmit={handlePaymentSubmit}
                        initialData={initialFormData}
                    />
                )}
                 {paymentScreen === 'view-templates' && (
                    <ViewTemplatesScreen
                        onBack={() => handleBackToPaymentsDash('cross-border-dash')}
                        onNavigate={handleNavigate}
                        onDeleteTemplate={handleDeleteTemplate}
                    />
                )}
                {paymentScreen === 'manage-recurring' && (
                    <ManageRecurringPaymentsScreen
                        onBack={() => handleBackToPaymentsDash('cross-border-dash')}
                        onEditRecurring={handleEditRecurring}
                        onDeleteRecurring={handleDeleteRecurring}
                        onToggleRecurring={handleToggleRecurring}
                        onSetupNew={handleSetupNewRecurring}
                    />
                )}
                 {paymentScreen === 'high-value-dash' && (
                    <HighValueDashboardView
                        onNavigate={handleNavigate}
                        history={filteredHistoryForViews}
                        onHistoryRowClick={handlePaymentHistoryRowClick}
                    />
                )}
                {paymentScreen === 'create-hvt' && (
                    <CreateHighValueTransferScreen
                        onBack={() => handleBackToPaymentsDash('high-value-dash')}
                        onPaymentSubmit={handlePaymentSubmit}
                    />
                )}
                {paymentScreen === 'authorize-hvt' && (
                     <AuthorizeHVTScreen
                         onBack={() => handleBackToPaymentsDash('high-value-dash')}
                         onNavigate={handleNavigate}
                         onAuthorize={handleAuthorizeHvt}
                         onReject={handleRejectHvt}
                     />
                )}
                {paymentScreen === 'view-transfer-details' && viewingTransferDetails && (
                    <ViewTransferDetailsScreen
                        transfer={viewingTransferDetails}
                        onBack={() => handleNavigate('high-value-dash')}
                    />
                )}
                 {paymentScreen === 'bulk-dash' && (
                    <BulkDashboardView
                        onNavigate={handleNavigate}
                        fullPaymentHistory={paymentHistory}
                        activeBulkFiles={activeBulkFiles}
                        onViewActiveFile={handleViewActiveBulkFile}
                        onEditActiveFile={handleEditActiveBulkFile}
                        onDeleteActiveFile={handleDeleteActiveBulkFile}
                    />
                 )}
                {paymentScreen === 'upload-bulk-file' && (
                    <UploadBulkFileScreen
                        onBack={() => handleBackToPaymentsDash('bulk-dash')}
                        onBulkSubmit={handleBulkSubmit}
                    />
                )}
                 {paymentScreen === 'create-bulk-template' && (
                     <CreateBulkTemplateScreen
                         onBack={() => handleBackToPaymentsDash('bulk-dash')}
                         onTemplateSubmit={handleTemplateSubmit}
                         // Pass initialData for editing if needed later
                     />
                 )}
                {paymentScreen === 'edit-bulk-file' && editingBulkFileData && (
                     <EditBulkFileScreen
                         initialData={editingBulkFileData}
                         onBack={() => handleBackToPaymentsDash('bulk-dash')}
                         onUpdateSubmit={handleUpdateBulkDetails}
                     />
                )}
            </div>

            {/* --- Modals --- */}
            {isPaymentHistoryModalOpen && selectedPaymentHistoryEntry && (
                <PaymentHistoryDetailModal
                    entry={selectedPaymentHistoryEntry}
                    onClose={() => { setIsPaymentHistoryModalOpen(false); setSelectedPaymentHistoryEntry(null); }}
                />
           )}
            {isRecurringModalOpen && (
                <RecurringPaymentModal
                    isOpen={isRecurringModalOpen}
                    onClose={() => { setIsRecurringModalOpen(false); setEditingRecurringPayment(null); }}
                    recurringPaymentData={editingRecurringPayment}
                />
            )}
            {isBulkDetailModalOpen && selectedActiveBulkFile && (
                <ActiveBulkDetailModal
                    file={selectedActiveBulkFile}
                    onClose={() => { setIsBulkDetailModalOpen(false); setSelectedActiveBulkFile(null); }}
                />
            )}

        </div> // End main container
    );
}; // <-- *** End of PaymentsDashboard component function ***

export default PaymentsDashboard; // <-- *** Export statement is AFTER the component function ***