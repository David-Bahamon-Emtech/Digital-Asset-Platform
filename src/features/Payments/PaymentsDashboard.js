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
import RecurringPaymentModal from './RecurringPaymentModal';
import {
    dummyTemplates,
    initialDummyRecurringPayments
} from './data/paymentConstants';
import {
    parseISO, addDays, addWeeks, addMonths, isValid, startOfDay, format as formatDate
} from 'date-fns';

const PaymentsDashboard = ({
    assets = [],
    setAssets,
    assetLogosMap = {},
    paymentHistory = [],
    onAddHistoryEntry,
    onUpdateHistoryStatus,
}) => {

    const [paymentScreen, setPaymentScreen] = useState('cross-border-dash');
    const [viewingTransferDetails, setViewingTransferDetails] = useState(null);
    const [isPaymentHistoryModalOpen, setIsPaymentHistoryModalOpen] = useState(false);
    const [selectedPaymentHistoryEntry, setSelectedPaymentHistoryEntry] = useState(null);
    const [templates, setTemplates] = useState(dummyTemplates);
    const [recurringPayments, setRecurringPayments] = useState(initialDummyRecurringPayments);
    const [initialFormData, setInitialFormData] = useState(null);
    const [isRecurringModalOpen, setIsRecurringModalOpen] = useState(false);
    const [editingRecurringPayment, setEditingRecurringPayment] = useState(null);

    const calculateNextDateFromToday = (payment, startDate = new Date()) => {
        if (!payment?.frequency) return null;
        const today = startOfDay(startDate);
        let calculatedNextDate = today;
        let attempts = 0;
        const maxAttempts = 366;

        while (attempts < maxAttempts) {
            let potentialNextDate = calculatedNextDate;
            switch (payment.frequency?.toLowerCase().split(' ')[0]) {
                case 'daily': potentialNextDate = addDays(today, attempts); break;
                case 'weekly': potentialNextDate = addWeeks(today, attempts); break;
                case 'bi-weekly': potentialNextDate = addWeeks(today, attempts * 2); break;
                case 'monthly': potentialNextDate = addMonths(today, attempts); break;
                case 'quarterly': potentialNextDate = addMonths(today, attempts * 3); break;
                case 'annually': potentialNextDate = addMonths(today, attempts * 12); break;
                default: return null;
            }
            potentialNextDate = startOfDay(potentialNextDate);
            if (potentialNextDate >= today) {
                return formatDate(potentialNextDate, 'yyyy-MM-dd');
            }
            attempts++;
        }
        return null;
    };

    const handleNavigate = (screen, data = null) => {
        setInitialFormData(null);
        setViewingTransferDetails(null);
        if (screen === 'create-payment' && data?.templateData) {
            setInitialFormData(data.templateData);
        } else if (screen === 'view-transfer-details' && data?.transferId) {
            const transfer = paymentHistory.find(item => item.id === data.transferId && item.type === 'HVT');
            if (transfer) { setViewingTransferDetails(transfer); }
            else { console.error("Could not find HVT transfer with ID:", data.transferId); }
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
        if (typeof onAddHistoryEntry === 'function') { onAddHistoryEntry(historyEntry); }
        else { console.error("onAddHistoryEntry handler is missing!"); }
        if (historyEntry.status !== 'Pending Approval' && paymentData._ui_payment_origin === 'institutional' && typeof setAssets === 'function' && paymentData.payment_source.account_id && paymentData._simulated_total_debit > 0) {
            setAssets(prevAssets => prevAssets.map(acc => acc.id === paymentData.payment_source.account_id ? { ...acc, balance: Math.max(0, acc.balance - paymentData._simulated_total_debit) } : acc));
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
        if (typeof onAddHistoryEntry === 'function') { onAddHistoryEntry(historyEntry); }
        else { console.error("onAddHistoryEntry handler is missing!"); }
        alert(`Bulk file submitted for processing! Ref: ${generatedReference}`);
        setPaymentScreen('bulk-dash');
        setInitialFormData(null);
    };

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

    const handleToggleRecurring = (paymentId, currentStatus) => {
        console.log('PaymentsDashboard: handleToggleRecurring called for ID:', paymentId);
        const newStatus = currentStatus === 'Active' ? 'Paused' : 'Active';
        setRecurringPayments(prev => prev.map(p => {
            if (p.id === paymentId) {
                let nextDateValue = p.nextDate;
                if (newStatus === 'Paused') {
                    nextDateValue = null;
                    console.log(`Pausing ${paymentId}, nextDate set to null.`);
                } else if (newStatus === 'Active') {
                    nextDateValue = calculateNextDateFromToday(p);
                    console.log(`Activating ${paymentId}, calculated nextDate: ${nextDateValue}`);
                    if (!nextDateValue) {
                         console.warn(`Could not calculate next date for ${paymentId}. Setting to TBD.`);
                         nextDateValue = 'TBD';
                    }
                }
                return { ...p, status: newStatus, nextDate: nextDateValue };
            }
            return p;
        }));
    };

    const handleDeleteRecurring = (paymentId) => {
        console.log('PaymentsDashboard: handleDeleteRecurring called for ID:', paymentId);
        setRecurringPayments(prev => prev.filter(p => p.id !== paymentId));
    };

    const handleEditRecurring = (paymentId) => {
        console.log('PaymentsDashboard: handleEditRecurring called for ID:', paymentId);
        const paymentToEdit = recurringPayments.find(p => p.id === paymentId);
        if (paymentToEdit) { setEditingRecurringPayment(paymentToEdit); setIsRecurringModalOpen(true); }
        else { alert("Error: Could not find recurring payment to edit."); }
    };

    const handleSetupNewRecurring = () => {
        console.log('PaymentsDashboard: handleSetupNewRecurring called');
        setEditingRecurringPayment(null);
        setIsRecurringModalOpen(true);
    };

    const handleSaveRecurringPayment = (savedData) => {
        console.log("PaymentsDashboard: Saving recurring payment:", savedData);
        setRecurringPayments(prev => {
            const existingIndex = savedData.id ? prev.findIndex(p => p.id === savedData.id) : -1;
            if (existingIndex > -1) {
                const updatedPayments = [...prev];
                updatedPayments[existingIndex] = { ...prev[existingIndex], ...savedData };
                if (typeof updatedPayments[existingIndex].amount === 'string') {
                     updatedPayments[existingIndex].amount = parseFloat(updatedPayments[existingIndex].amount);
                }
                console.log("Updated existing recurring payment:", updatedPayments[existingIndex]);
                return updatedPayments;
            } else {
                const newPayment = {
                    ...savedData,
                    id: `rec-${Date.now()}`,
                    status: 'Active',
                    nextDate: savedData.startDate || 'TBD', // Use startDate on creation
                    amount: typeof savedData.amount === 'string' ? parseFloat(savedData.amount) : savedData.amount,
                };
                console.log("Added new recurring payment:", newPayment);
                return [newPayment, ...prev];
            }
        });
        setIsRecurringModalOpen(false);
        setEditingRecurringPayment(null);
    };

    const handleAuthorizeHvt = (hvtId) => {
        console.log('PaymentsDashboard: handleAuthorizeHvt called for ID:', hvtId);
        const itemToAuthorize = paymentHistory.find(item => item.id === hvtId && item.status === 'Pending Approval');
        let itemDataForBalanceUpdate = null;
        if (itemToAuthorize && itemToAuthorize.rawData?._ui_payment_origin === 'institutional' && typeof setAssets === 'function' && itemToAuthorize.rawData?.payment_source?.account_id && itemToAuthorize.rawData?._simulated_total_debit > 0) {
            itemDataForBalanceUpdate = itemToAuthorize.rawData;
        }
        if (typeof onUpdateHistoryStatus === 'function') { onUpdateHistoryStatus(hvtId, 'Authorized', new Date()); }
        else { console.error("onUpdateHistoryStatus handler is missing!"); }
        if (itemDataForBalanceUpdate) {
            setAssets(prevAssets => prevAssets.map(acc => acc.id === itemDataForBalanceUpdate.payment_source.account_id ? { ...acc, balance: Math.max(0, acc.balance - itemDataForBalanceUpdate._simulated_total_debit) } : acc));
        }
    };

    const handleRejectHvt = (hvtId, reason) => {
        console.log('PaymentsDashboard: handleRejectHvt called for ID:', hvtId);
        const newStatus = `Rejected (${reason || 'No reason provided'})`;
        if (typeof onUpdateHistoryStatus === 'function') { onUpdateHistoryStatus(hvtId, newStatus, new Date()); }
        else { console.error("onUpdateHistoryStatus handler is missing!"); }
    };

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
                    <button className={`pb-2 px-1 text-sm sm:text-base focus:outline-none ${paymentScreen.startsWith('cross-border') || ['create-payment', 'view-templates', 'manage-recurring'].includes(paymentScreen) ? 'border-b-2 font-medium text-emtech-gold border-emtech-gold' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => handleNavigate('cross-border-dash')} > Cross-Border Payments </button>
                    <button className={`pb-2 px-1 text-sm sm:text-base focus:outline-none ${paymentScreen.startsWith('high-value') || ['create-hvt', 'authorize-hvt', 'view-transfer-details'].includes(paymentScreen) ? 'border-b-2 font-medium text-emtech-gold border-emtech-gold' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => handleNavigate('high-value-dash')} > High-Value Transfers </button>
                    <button className={`pb-2 px-1 text-sm sm:text-base focus:outline-none ${paymentScreen.startsWith('bulk') || ['upload-bulk-file', 'create-bulk-template'].includes(paymentScreen) ? 'border-b-2 font-medium text-emtech-gold border-emtech-gold' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => handleNavigate('bulk-dash')} > Bulk Payments </button>
                </div>
            </div>

            <div className="mb-12">
                {paymentScreen === 'cross-border-dash' && (<CrossBorderDashboardView onNavigate={handleNavigate} history={filteredHistory} onHistoryRowClick={handlePaymentHistoryRowClick} />)}
                {paymentScreen === 'create-payment' && (<CreatePaymentScreen assets={assets} onBack={() => handleBackToPaymentsDash('cross-border-dash')} onPaymentSubmit={handlePaymentSubmit} initialData={initialFormData} />)}
                {paymentScreen === 'view-templates' && (<ViewTemplatesScreen onBack={() => handleBackToPaymentsDash('cross-border-dash')} onNavigate={handleNavigate} assets={assets} />)}
                {paymentScreen === 'manage-recurring' && (<ManageRecurringPaymentsScreen onBack={() => handleBackToPaymentsDash('cross-border-dash')} recurringPayments={recurringPayments} onToggleRecurringStatus={handleToggleRecurring} onDeleteRecurring={handleDeleteRecurring} onEditRecurring={handleEditRecurring} onSetupNewRecurring={handleSetupNewRecurring} assets={assets} />)}
                {paymentScreen === 'high-value-dash' && (<HighValueDashboardView onNavigate={handleNavigate} history={filteredHistory} onHistoryRowClick={handlePaymentHistoryRowClick} />)}
                {paymentScreen === 'create-hvt' && (<CreateHighValueTransferScreen assets={assets} onBack={() => handleBackToPaymentsDash('high-value-dash')} onPaymentSubmit={handlePaymentSubmit} />)}
                {paymentScreen === 'authorize-hvt' && (<AuthorizeHVTScreen onBack={() => handleBackToPaymentsDash('high-value-dash')} onNavigate={handleNavigate} pendingHvts={pendingHvts} onAuthorizeHvt={handleAuthorizeHvt} onRejectHvt={handleRejectHvt} />)}
                {paymentScreen === 'view-transfer-details' && viewingTransferDetails && (<ViewTransferDetailsScreen transfer={viewingTransferDetails} onBack={() => handleNavigate('authorize-hvt')} />)}
                {paymentScreen === 'bulk-dash' && (<BulkDashboardView onNavigate={handleNavigate} history={filteredHistory} onHistoryRowClick={handlePaymentHistoryRowClick} />)}
                {paymentScreen === 'upload-bulk-file' && (<UploadBulkFileScreen assets={assets} onBack={() => handleBackToPaymentsDash('bulk-dash')} onBulkSubmit={handleBulkSubmit} />)}
                {paymentScreen === 'create-bulk-template' && (<div>Create Bulk Template Placeholder... <button onClick={() => handleBackToPaymentsDash('bulk-dash')} className="text-sm text-blue-600 hover:underline">Back</button></div>)}
            </div>

            {isPaymentHistoryModalOpen && selectedPaymentHistoryEntry && (
           <PaymentHistoryDetailModal
               entry={selectedPaymentHistoryEntry}
               onClose={() => { setIsPaymentHistoryModalOpen(false); setSelectedPaymentHistoryEntry(null); }}
               assets={assets} // <-- ADD THIS LINE TO PASS THE PROP
           />
       )}

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