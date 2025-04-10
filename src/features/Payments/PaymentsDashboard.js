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
import {
    dummyTemplates, // Assuming you might revert ViewTemplatesScreen later
    initialDummyRecurringPayments
} from './data/paymentConstants';

// Note: Using dummyTemplates for initial state, even if ViewTemplatesScreen uses local data temporarily
const initialPaymentHistory = [
    { id: 'hvt_1712720000000', timestamp: new Date(Date.now() - 5 * 60 * 1000), type: 'HVT', amount: 5000000, currency: 'USD', recipient: 'Bank of Example', status: 'Pending Approval', reference: 'HVT-PEND01', rawData: { purposeCode: 'TREA', valueDate: '2025-04-10', initiatedBy: 'Test User HVT', recipientAccount: '123456789', recipientBankSwift: 'BOFUS33A', _simulated_total_debit: 5000100 } },
    { id: 'ph1', timestamp: new Date(Date.now() - 2 * 60 * 1000), type: 'Cross-Border', amount: 1500, currency: 'USDC', recipient: 'External Vendor A', status: 'Completed', reference: 'INV-123' },
    { id: 'ph3', timestamp: new Date(Date.now() - 10 * 60 * 1000), type: 'Cross-Border', amount: 25000, currency: 'USDT', recipient: 'Partner Company X', status: 'Completed', reference: 'PO-456' },
    { id: 'ph4', timestamp: new Date(Date.now() - 30 * 60 * 1000), type: 'HVT', amount: 10000000, currency: 'GBP', recipient: 'UK Treasury', status: 'Authorized', reference: 'HVT-AUTH01', rawData: { purposeCode: 'GOVT', valueDate: '2025-04-09', initiatedBy: 'Treasury Dept', recipientAccount: 'GB12ABCD12345678901234', recipientBankSwift: 'BOEGB2L' } },
    { id: 'ph5', timestamp: new Date(Date.now() - 60 * 60 * 1000), type: 'Cross-Border', amount: 50, currency: 'eGH¢', recipient: 'Local Merchant', status: 'Completed', reference: 'POS-789' },
    { id: 'ph6', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), type: 'Bulk Process', amount: 125000, currency: 'USD', recipient: 'Payroll Batch 1', status: 'Completed', reference: 'BULK-PAY-01' },
    { id: 'ph7', timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), type: 'Cross-Border', amount: 999, currency: 'USDC', recipient: 'Test Wallet', status: 'Completed', reference: 'TEST-001' },
].sort((a, b) => b.timestamp - a.timestamp);


const PaymentsDashboard = ({ assets = [], setAssets, assetLogosMap = {} }) => {

  const [paymentScreen, setPaymentScreen] = useState('cross-border-dash');
  const [viewingTransferDetails, setViewingTransferDetails] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState(initialPaymentHistory);
  const [isPaymentHistoryModalOpen, setIsPaymentHistoryModalOpen] = useState(false);
  const [selectedPaymentHistoryEntry, setSelectedPaymentHistoryEntry] = useState(null);
  const [templates, setTemplates] = useState(dummyTemplates); // Manages central template state
  const [recurringPayments, setRecurringPayments] = useState(initialDummyRecurringPayments);
  const [initialFormData, setInitialFormData] = useState(null);

  const addPaymentHistoryEntry = (entryData) => {
    setPaymentHistory(prevHistory => [entryData, ...prevHistory].sort((a, b) => b.timestamp - a.timestamp));
  };

  const handleNavigate = (screen, data = null) => {
     console.log(`>>> PaymentsDashboard: handleNavigate called with screen="${screen}", data=`, data); // DEBUG LOG
     setInitialFormData(null);
     setViewingTransferDetails(null);

     if (screen === 'create-payment' && data?.templateData) {
         console.log('>>> PaymentsDashboard: Setting initialFormData with:', data.templateData); // DEBUG LOG
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
  };

  const handlePaymentHistoryRowClick = (entry) => {
    setSelectedPaymentHistoryEntry(entry);
    setIsPaymentHistoryModalOpen(true);
  };

  const handlePaymentSubmit = (paymentData) => {
    // console.log("handlePaymentSubmit received:", paymentData); // Keep commented unless needed
    const paymentTypeMap = { 'on-chain': paymentData._ui_payment_origin === 'client' ? 'Cross-Border' : 'On-Chain', 'traditional': 'Cross-Border', 'internal': 'Internal Transfer', 'hvt': 'HVT' };
    const paymentTypeString = paymentTypeMap[paymentData._ui_payment_type] || paymentData._ui_payment_type;
    const generatedReference = `REF-${Date.now().toString().slice(-6)}`;

    const historyEntry = {
        id: `${paymentTypeString.toLowerCase().replace(' ','-')}-${Date.now()}`,
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
    setInitialFormData(null);
    alert(`Payment ${historyEntry.status}! Ref: ${historyEntry.reference}`);
  };

  const handleBulkSubmit = (bulkData) => {
      const generatedReference = `BULK-${Date.now().toString().slice(-6)}`;
      addPaymentHistoryEntry({
          id: `bulk-${Date.now()}`, timestamp: new Date(), type: 'Bulk Process',
          amount: bulkData.totalAmount || 0, currency: bulkData.currency || 'USD',
          recipient: bulkData.fileName || 'Bulk File', status: 'Processing',
          reference: generatedReference, rawData: bulkData
      });
      alert(`Bulk file submitted for processing! Ref: ${generatedReference}`);
      setPaymentScreen('bulk-dash');
      setInitialFormData(null);
  };

  const handleSaveTemplate = (templateData) => {
    console.log('PaymentsDashboard: handleSaveTemplate called with:', templateData);
    const index = templateData.id ? templates.findIndex(t => t.id === templateData.id) : -1;
    if (index > -1) {
        setTemplates(prev => prev.map((t, i) => i === index ? { ...t, ...templateData, lastUsed: t.lastUsed } : t));
    } else {
        const newTemplate = { ...templateData, id: templateData.id || `tpl-${Date.now()}` };
        setTemplates(prev => [newTemplate, ...prev]);
    }
  };

  const handleDeleteTemplate = (templateId) => {
    console.log('PaymentsDashboard: handleDeleteTemplate called with ID:', templateId);
    setTemplates(prev => prev.filter(t => t.id !== templateId));
  };

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
  };

  const handleSetupNewRecurring = () => {
    console.log('PaymentsDashboard: handleSetupNewRecurring called');
  };

  const handleAuthorizeHvt = (hvtId) => {
    console.log('PaymentsDashboard: handleAuthorizeHvt called for ID:', hvtId);
    let itemDataForBalanceUpdate = null;
    const newHistory = paymentHistory.map(item => {
        if (item.id === hvtId && item.status === 'Pending Approval') {
            const authorizedItem = { ...item, status: 'Authorized', timestamp: new Date() };
            if (authorizedItem.rawData?._ui_payment_origin === 'institutional' &&
                typeof setAssets === 'function' &&
                authorizedItem.rawData?.payment_source?.account_id &&
                authorizedItem.rawData?._simulated_total_debit > 0)
            {
                itemDataForBalanceUpdate = authorizedItem.rawData;
            }
            return authorizedItem;
        }
        return item;
    }).sort((a, b) => b.timestamp - a.timestamp);

    setPaymentHistory(newHistory);

    if (itemDataForBalanceUpdate && typeof setAssets === 'function') {
        setAssets(prevAssets => prevAssets.map(acc => {
            if (acc.id === itemDataForBalanceUpdate.payment_source.account_id) {
                const newBalance = acc.balance - itemDataForBalanceUpdate._simulated_total_debit;
                return { ...acc, balance: Math.max(0, newBalance) };
            }
            return acc;
        }));
    }
  };

  const handleRejectHvt = (hvtId, reason) => {
    console.log('PaymentsDashboard: handleRejectHvt called for ID:', hvtId);
     setPaymentHistory(prevHistory => prevHistory.map(item =>
        item.id === hvtId && item.status === 'Pending Approval'
        ? { ...item, status: `Rejected (${reason || 'No reason provided'})`, timestamp: new Date() }
        : item
     ).sort((a, b) => b.timestamp - a.timestamp));
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
            <button className={`pb-2 px-1 text-sm sm:text-base focus:outline-none ${ paymentScreen.startsWith('cross-border') || ['create-payment', 'view-templates', 'manage-recurring'].includes(paymentScreen) ? 'border-b-2 font-medium text-emtech-gold border-emtech-gold' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => handleNavigate('cross-border-dash')} > Cross-Border Payments </button>
            <button className={`pb-2 px-1 text-sm sm:text-base focus:outline-none ${ paymentScreen.startsWith('high-value') || ['create-hvt', 'authorize-hvt', 'view-transfer-details'].includes(paymentScreen) ? 'border-b-2 font-medium text-emtech-gold border-emtech-gold' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => handleNavigate('high-value-dash')} > High-Value Transfers </button>
            <button className={`pb-2 px-1 text-sm sm:text-base focus:outline-none ${ paymentScreen.startsWith('bulk') || ['upload-bulk-file', 'create-bulk-template'].includes(paymentScreen) ? 'border-b-2 font-medium text-emtech-gold border-emtech-gold' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => handleNavigate('bulk-dash')} > Bulk Payments </button>
        </div>
      </div>

      <div className="mb-12">
         {paymentScreen === 'cross-border-dash' && (<CrossBorderDashboardView onNavigate={handleNavigate} history={filteredHistory} onHistoryRowClick={handlePaymentHistoryRowClick} />)}
         {paymentScreen === 'create-payment' && (
            <>
                {/* DEBUG LOG */}
                {console.log('>>> PaymentsDashboard: Rendering CreatePaymentScreen with initialData:', initialFormData)}
                <CreatePaymentScreen
                    assets={assets}
                    onBack={() => handleBackToPaymentsDash('cross-border-dash')}
                    onPaymentSubmit={handlePaymentSubmit}
                    initialData={initialFormData}
                />
            </>
         )}
         {paymentScreen === 'view-templates' && (
             // Using central templates state now, assuming ViewTemplatesScreen is reverted or adapted
             <ViewTemplatesScreen
                onBack={() => handleBackToPaymentsDash('cross-border-dash')}
                onNavigate={handleNavigate}
                templates={templates}
                onSaveTemplate={handleSaveTemplate}
                onDeleteTemplate={handleDeleteTemplate}
                assets={assets}
            />

            // If using the REBUILT ViewTemplatesScreen with LOCAL state:
            // <ViewTemplatesScreen
            //    onBack={() => handleBackToPaymentsDash('cross-border-dash')}
            //    onNavigate={handleNavigate}
            //    assets={assets} // Pass assets for modal
            // />
         )}
         {paymentScreen === 'manage-recurring' && (
            <ManageRecurringPaymentsScreen
                onBack={() => handleBackToPaymentsDash('cross-border-dash')}
                recurringPayments={recurringPayments}
                onToggleRecurringStatus={handleToggleRecurring}
                onDeleteRecurring={handleDeleteRecurring}
                onEditRecurring={handleEditRecurring}
                onSetupNewRecurring={handleSetupNewRecurring}
            />
         )}
         {paymentScreen === 'high-value-dash' && (<HighValueDashboardView onNavigate={handleNavigate} history={filteredHistory} onHistoryRowClick={handlePaymentHistoryRowClick} />)}
         {paymentScreen === 'create-hvt' && (<CreateHighValueTransferScreen assets={assets} onBack={() => handleBackToPaymentsDash('high-value-dash')} onPaymentSubmit={handlePaymentSubmit} />)}
         {paymentScreen === 'authorize-hvt' && (
            <AuthorizeHVTScreen
                onBack={() => handleBackToPaymentsDash('high-value-dash')}
                onNavigate={handleNavigate}
                pendingHvts={pendingHvts}
                onAuthorizeHvt={handleAuthorizeHvt}
                onRejectHvt={handleRejectHvt}
            />
         )}
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