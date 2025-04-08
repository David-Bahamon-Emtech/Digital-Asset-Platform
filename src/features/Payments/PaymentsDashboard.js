// src/features/Payments/PaymentsDashboard.js
import React, { useState } from 'react';

// Import screen components
import CrossBorderDashboardView from './CrossBorderDashboardView';
import CreatePaymentScreen from './CreatePaymentScreen';
import ViewTemplatesScreen from './ViewTemplatesScreen';
import ManageRecurringPaymentsScreen from './ManageRecurringPaymentsScreen';
import HighValueDashboardView from './HighValueDashboardView';
import BulkDashboardView from './BulkDashboardView';
import AuthorizeHVTScreen from './AuthorizeHVTScreen';
// Import placeholders for other screens as needed
// import HighValueDashboardView from './HighValueDashboardView';
// import BulkDashboardView from './BulkDashboardView';
// ... etc ...

// --- Component receives setAssets prop now ---
const PaymentsDashboard = ({ assets = [], setAssets, assetLogosMap = {} }) => {

  const [paymentScreen, setPaymentScreen] = useState('cross-border-dash');

  // --- Navigation Handlers (Unchanged) ---
  const handleNavigate = (screen) => {
    console.log('Navigating to payment screen:', screen);
    setPaymentScreen(screen);
  };

  const handleBackToPaymentsDash = (defaultScreen = 'cross-border-dash') => {
    setPaymentScreen(defaultScreen);
  };

  // --- Payment Submission Handler - UPDATED ---
  const handlePaymentSubmit = (paymentData) => {
    console.log('Payment Submitted in Dashboard:', paymentData);

    // *** Use setAssets to update balance ***
    setAssets(currentAssets => {
      // Find the index of the asset being debited
      const senderAssetIndex = currentAssets.findIndex(
        asset => asset.id === paymentData.senderAccountId
      );

      // If sender asset not found (shouldn't happen ideally), return original state
      if (senderAssetIndex === -1) {
        console.error("Error processing payment: Sender asset not found!", paymentData.senderAccountId);
        alert("Error: Could not find the sending account to debit.");
        return currentAssets;
      }

      // Calculate the new balance (ensure it doesn't go below zero)
      const senderAsset = currentAssets[senderAssetIndex];
      const newBalance = Math.max(0, senderAsset.balance - paymentData.totalDebit);

      console.log(`Updating balance for ${senderAsset.symbol}: ${senderAsset.balance} -> ${newBalance}`);

      // Create the new assets array with the updated balance
      return currentAssets.map((asset, index) => {
        if (index === senderAssetIndex) {
          // Return a new object for the updated asset
          return { ...asset, balance: newBalance };
        }
        // Return unchanged asset otherwise
        return asset;
      });
    }); // *** End of setAssets call ***

    // TODO: Add entry to a paymentHistory state later if needed

    // Show success message (can be more specific)
    alert(`Payment initiated!\nAmount: ${paymentData.amount.toLocaleString()} ${paymentData.currency}\nTotal Debit: ${paymentData.totalDebit.toLocaleString(undefined, {maximumFractionDigits: 4})} ${paymentData.currency}\nFrom: ${paymentData.senderAccountLabel}`);

    // Navigate back to the dashboard after submission
    handleBackToPaymentsDash('cross-border-dash');
  };


  // --- Render Logic (Conditional Rendering - Unchanged from previous step) ---
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Payments Dashboard</h1>

      {/* Payment Type Tabs */}
      <div className="mb-6 border-b border-gray-200">
         {/* Tab JSX (unchanged) */}
         <div className="flex space-x-6">
          <button className={`pb-2 px-1 text-sm sm:text-base focus:outline-none ${ paymentScreen.includes('cross-border') || paymentScreen === 'create-payment' || paymentScreen === 'view-templates' || paymentScreen === 'manage-recurring' ? 'border-b-2 font-medium text-emtech-gold border-emtech-gold' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => handleNavigate('cross-border-dash')} > Cross-Border Payments </button>
          <button className={`pb-2 px-1 text-sm sm:text-base focus:outline-none ${ paymentScreen.includes('high-value') || paymentScreen === 'create-hvt' || paymentScreen === 'authorize-hvt' ? 'border-b-2 font-medium text-emtech-gold border-emtech-gold' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => handleNavigate('high-value-dash')} > High-Value Transfers </button>
          <button className={`pb-2 px-1 text-sm sm:text-base focus:outline-none ${ paymentScreen.includes('bulk') || paymentScreen === 'upload-bulk-file' || paymentScreen === 'create-bulk-template' ? 'border-b-2 font-medium text-emtech-gold border-emtech-gold' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => handleNavigate('bulk-dash')} > Bulk Payments </button>
        </div>
      </div>

      {/* --- Conditional Screen Rendering --- */}
      {paymentScreen === 'cross-border-dash' && ( <CrossBorderDashboardView onNavigate={handleNavigate} /> )}
      {paymentScreen === 'create-payment' && ( <CreatePaymentScreen assets={assets} onBack={() => handleBackToPaymentsDash('cross-border-dash')} onPaymentSubmit={handlePaymentSubmit} /> )}
      {paymentScreen === 'view-templates' && (<ViewTemplatesScreen onBack={() => handleBackToPaymentsDash('cross-border-dash')} />)}
      {paymentScreen === 'manage-recurring' && (<ManageRecurringPaymentsScreen onBack={() => handleBackToPaymentsDash('cross-border-dash')} />)}
      {paymentScreen === 'high-value-dash' && (<HighValueDashboardView onNavigate={handleNavigate} />)}
      {paymentScreen === 'create-hvt' && ( <div>Create High-Value Transfer Placeholder... <button onClick={() => handleBackToPaymentsDash('high-value-dash')} className="text-sm text-blue-600 hover:underline">Back</button></div> )}
      {paymentScreen === 'authorize-hvt' && ( <AuthorizeHVTScreen onBack={() => handleBackToPaymentsDash('high-value-dash')} onNavigate={handleNavigate} /> )}
      {paymentScreen === 'bulk-dash' && (<BulkDashboardView onNavigate={handleNavigate} />)} 
      {paymentScreen === 'upload-bulk-file' && ( <div>Upload Bulk File Placeholder... <button onClick={() => handleBackToPaymentsDash('bulk-dash')} className="text-sm text-blue-600 hover:underline">Back</button></div> )}
      {paymentScreen === 'create-bulk-template' && ( <div>Create Bulk Template Placeholder... <button onClick={() => handleBackToPaymentsDash('bulk-dash')} className="text-sm text-blue-600 hover:underline">Back</button></div> )}

    </div>
  );
};

export default PaymentsDashboard;