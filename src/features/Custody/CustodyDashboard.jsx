// src/features/Custody/CustodyDashboard.js
import React, { useState, useMemo } from 'react';
import { useAssets } from '../../context/AssetsContext.jsx';

// Import Custody Sub-Components (assuming they are in the same directory)
import VaultTypeSummaryCard from './VaultTypeSummaryCard.jsx';
import VaultOperationsLogTable from './VaultOperationsLogTable.jsx';
import VaultAnalytics from './VaultAnalytics.jsx';
import VaultQuickActions from './VaultQuickActions.jsx';
import CustodyReporting from './CustodyReporting.jsx';
import ApprovalQueue from './ApprovalQueue.jsx';
import ColdStorageView from './ColdStorageView.jsx';
import PhysicalVaultsView from './PhysicalVaultsView.jsx';
import DigitalVaultsView from './DigitalVaultsView.jsx';
import InitiateDepositForm from './InitiateDepositForm.jsx';
import RequestWithdrawalForm from './RequestWithdrawalForm.jsx';
import ScheduleAuditForm from './ScheduleAuditForm.jsx';
import FullOperationsLogView from './FullOperationsLogView.jsx';

// Import Initial Dummy Data (used only for initializing state)
// Adjust the path if mockCustodyData.js is located elsewhere
import {
    dummyOperationsData as initialDummyOperationsData,
    dummyPendingApprovals as initialDummyPendingApprovals
} from '../../data/mockCustodyData.js';

// Import Exchange Rates for value calculation
// Adjust path as needed based on your project structure
import { ratesToUSD } from '../Payments/data/paymentConstants.js';

/**
 * Main component for the Custody feature tab.
 * Manages navigation between different custody views (dashboard, reporting, approvals, etc.)
 * Displays overview information and integrates sub-components.
 * Handles state for interactive demo elements like logs and approvals.
 */
const CustodyDashboard = () => {
  // Global state access
  const { assets, dispatchAssets } = useAssets();

  // Local state for view navigation within the Custody tab
  const [custodyView, setCustodyView] = useState('dashboard'); // e.g., 'dashboard', 'reporting', 'approvals', 'coldStorage', 'physicalStorage', 'digitalStorage', 'depositForm', 'withdrawalForm', 'auditForm', 'fullLog'

  // Local state for managing dynamic demo data
  const [operationsLog, setOperationsLog] = useState(initialDummyOperationsData);
  const [pendingApprovals, setPendingApprovals] = useState(initialDummyPendingApprovals);

  // --- Memoized Calculation for Summary Cards ---
  const vaultSummaries = useMemo(() => {
    // Default structure to prevent errors during initial render
    const defaultSummaries = {
        physical: { value: '$0', countValue: "0 Assets", detailValue: "N/A" },
        digital: { value: '$0', countValue: "0 Assets", detailValue: "N/A" },
        cold: { value: '$0', countValue: "0 Assets", detailValue: "N/A" }
    };

    if (!Array.isArray(assets) || assets.length === 0) {
      return defaultSummaries;
    }

    let physicalValue = 0, digitalValue = 0, coldValue = 0;
    let physicalCount = 0, digitalCount = 0, coldCount = 0;

    assets.forEach(asset => {
      const balance = typeof asset.balance === 'number' && !isNaN(asset.balance) ? asset.balance : 0;
      let usdValue = 0;

      // Calculate USD value using rates first, then asset price
      const rate = ratesToUSD[asset.symbol];
      const price = typeof asset.price === 'number' && !isNaN(asset.price) ? asset.price : null;

      if (rate !== undefined) { usdValue = balance * rate; }
      else if (price !== null) { usdValue = balance * price; }

      // Aggregate values and counts based on custody type
      if (asset.custodyType !== 'External') {
          if (asset.physicality === 'Physical' || asset.custodyType === 'PhysicalVault') { physicalValue += usdValue; physicalCount++; }
          else if (asset.custodyType === 'Hot' || asset.custodyType === 'Warm') { digitalValue += usdValue; digitalCount++; }
          else if (asset.custodyType === 'Cold') { coldValue += usdValue; coldCount++; }
      }
    });

    // Helper to format large currency values
    const formatLargeValue = (num) => {
        if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
        if (num >= 1e6) return `$${(num / 1e6).toFixed(1)}M`;
        if (num >= 1e3) return `$${(num / 1e3).toFixed(0)}K`;
        return `$${num.toFixed(0)}`;
    };

    // Return calculated summaries, using static placeholders for details not calculated yet
    return {
      physical: { value: formatLargeValue(physicalValue), countValue: `${physicalCount} Assets`, detailValue: "Feb 28, 2025" }, // Static placeholder
      digital: { value: formatLargeValue(digitalValue), countValue: `${digitalCount} Assets`, detailValue: "MPC + HSM" }, // Static placeholder
      cold: { value: formatLargeValue(coldValue), countValue: `${coldCount} Assets`, detailValue: "M-of-N Quorum" } // Static placeholder
    };
  }, [assets]); // Recalculate only when assets change


  // --- Action Handlers ---

  // Navigation Handlers
  const handleNavigate = (view) => setCustodyView(view); // Generic navigation setter
  const handleManagePhysical = () => handleNavigate('physicalStorage');
  const handleManageDigital = () => handleNavigate('digitalStorage');
  const handleManageCold = () => handleNavigate('coldStorage');
  const handleViewFullLog = () => handleNavigate('fullLog');
  const handleInitiateDeposit = () => handleNavigate('depositForm');
  const handleRequestWithdrawal = () => handleNavigate('withdrawalForm');
  const handleScheduleAudit = () => handleNavigate('auditForm');
  const handleGenerateReport = () => handleNavigate('reporting');
  const handleViewApprovals = () => handleNavigate('approvals');
  const handleBackToDashboard = () => handleNavigate('dashboard'); // Common back action

  // Approval Queue Handlers
  const handleApproveItem = (itemId) => {
    const itemToApprove = pendingApprovals.find(item => item.id === itemId);
    if (!itemToApprove) return;

    console.log(`Approving item: ${itemId}`, itemToApprove);
    let logDetails = `Approved item ${itemId} - Type: ${itemToApprove.type}`;
    let assetIdToUpdate = itemToApprove.assetId || itemToApprove.sourceAssetId;
    const assetSymbol = itemToApprove.asset || itemToApprove.sourceAssetSymbol;
    const amount = parseFloat(itemToApprove.amount || 0);

    // Simulate balance update for relevant types
    if ((itemToApprove.type === 'Withdrawal' || itemToApprove.type === 'Internal Transfer' || itemToApprove.type === 'Payment' || itemToApprove.type === 'Settlement') && assetIdToUpdate && !isNaN(amount) && amount !== 0) {
        const balanceChange = -amount; // Assume decrease for these types
        logDetails += ` (${amount.toLocaleString()} ${assetSymbol})`;
        console.log(`Dispatching balance update for ${assetIdToUpdate}: ${balanceChange}`);
        dispatchAssets({ type: 'UPDATE_ASSET_BALANCE', payload: { assetId: assetIdToUpdate, changeAmount: balanceChange } });
        // Note: For Internal Transfer, a second dispatch might be needed to increase balance in the destination, or update custodyType property
    } else if (itemToApprove.type === 'Policy Change') {
         console.log("Simulating policy update approval..."); // Placeholder
    }

    // Add log entry
    const newLogEntry = { id: `log${Date.now()}`, operation: 'Approval', vault: itemToApprove.type, asset: assetSymbol || 'N/A', amount: itemToApprove.amount ? `${amount.toLocaleString()} ${assetSymbol}` : 'N/A', timestamp: new Date().toISOString(), initiatedBy: 'System/Approver', status: 'Completed', details: logDetails };
    setOperationsLog(prevLog => [newLogEntry, ...prevLog]);

    // Remove from pending approvals
    setPendingApprovals(prev => prev.filter(item => item.id !== itemId));
    alert(`Approved item ${itemId}`);
  };

  const handleRejectItem = (itemId) => {
    const itemToReject = pendingApprovals.find(item => item.id === itemId);
    if (!itemToReject) return;
    console.log(`Rejecting item: ${itemId}`, itemToReject);
    const assetSymbol = itemToReject.asset || itemToReject.sourceAssetSymbol;
    const amount = parseFloat(itemToReject.amount || 0);
    const newLogEntry = { id: `log${Date.now()}`, operation: 'Rejection', vault: itemToReject.type, asset: assetSymbol || 'N/A', amount: itemToReject.amount ? `${amount.toLocaleString()} ${assetSymbol}` : 'N/A', timestamp: new Date().toISOString(), initiatedBy: 'System/Approver', status: 'Rejected', details: `Rejected item ${itemId} - Type: ${itemToReject.type}` };
    setOperationsLog(prevLog => [newLogEntry, ...prevLog]);
    setPendingApprovals(prev => prev.filter(item => item.id !== itemId));
    alert(`Rejected item ${itemId}`);
  };

  // Form Submission Handlers
  const handleDepositSubmit = (depositData) => {
      console.log('Deposit Submitted:', depositData);
      if (depositData.targetAssetId && depositData.amount > 0) {
          dispatchAssets({ type: 'UPDATE_ASSET_BALANCE', payload: { assetId: depositData.targetAssetId, changeAmount: depositData.amount } });
          const newLogEntry = { id: `log${Date.now()}`, operation: 'Deposit', vault: depositData.targetAssetId, asset: depositData.targetAssetSymbol, amount: `${depositData.amount.toLocaleString()} ${depositData.targetAssetSymbol}`, timestamp: new Date().toISOString(), initiatedBy: 'User/System', status: 'Completed', details: `Source: ${depositData.source || 'N/A'}. Ref: ${depositData.reference || 'N/A'}` };
          setOperationsLog(prevLog => [newLogEntry, ...prevLog]);
          alert(`Deposit of ${depositData.amount} ${depositData.targetAssetSymbol} completed.`);
      } else { alert('Deposit failed: Invalid data.'); }
      handleBackToDashboard(); // Use common handler
  };

  const handleWithdrawalSubmit = (withdrawalData) => {
    console.log('Withdrawal Submitted:', withdrawalData);
    const newApprovalRequest = { id: `app${Date.now()}`, type: 'Withdrawal', assetId: withdrawalData.sourceAssetId, asset: withdrawalData.sourceAssetSymbol, amount: withdrawalData.amount, sourceAssetId: withdrawalData.sourceAssetId, sourceAssetSymbol: withdrawalData.sourceAssetSymbol, details: `Withdraw ${withdrawalData.amount} ${withdrawalData.sourceAssetSymbol} to ${withdrawalData.destinationType}: ${withdrawalData.destinationDetails}. Reason: ${withdrawalData.reason || 'N/A'}`, requester: 'User/System', timestamp: new Date().toISOString(), recipient: withdrawalData.destinationDetails };
    setPendingApprovals(prev => [newApprovalRequest, ...prev]);
    const newLogEntry = { id: `log${Date.now()}`, operation: 'Withdrawal Request', vault: withdrawalData.sourceAssetId, asset: withdrawalData.sourceAssetSymbol, amount: `${withdrawalData.amount.toLocaleString()} ${withdrawalData.sourceAssetSymbol}`, timestamp: new Date().toISOString(), initiatedBy: 'User/System', status: 'Pending Approval', details: `Request to withdraw to ${withdrawalData.destinationDetails}. Approval ID: ${newApprovalRequest.id}` };
    setOperationsLog(prevLog => [newLogEntry, ...prevLog]);
    alert(`Withdrawal request for ${withdrawalData.amount} ${withdrawalData.sourceAssetSymbol} submitted for approval.`);
    handleBackToDashboard();
  };

   const handleAuditSubmit = (auditData) => {
    console.log('Audit Request Submitted:', auditData);
     const newLogEntry = { id: `log${Date.now()}`, operation: 'Audit Scheduled', vault: auditData.target, asset: auditData.target.startsWith('ALL_') ? 'Multiple' : auditData.target, amount: 'N/A', timestamp: new Date().toISOString(), initiatedBy: 'User/System', status: 'Scheduled', details: `Type: ${auditData.type}. Auditor: ${auditData.auditor}. Scope: ${auditData.scope || 'N/A'}. Notes: ${auditData.notes || 'N/A'}` };
    setOperationsLog(prevLog => [newLogEntry, ...prevLog]);
    alert(`Placeholder: Audit request for target '${auditData.target}' submitted.`);
    handleBackToDashboard();
  };

  // Handler for Audit Requests from Detail Views
  const handleAuditRequestSubmit = (auditRequestData) => {
    console.log('Audit Request Submitted from Detail View:', auditRequestData);
    const newLogEntry = { id: `log${Date.now()}`, operation: 'Audit Request', vault: auditRequestData.assetLabel, asset: auditRequestData.assetSymbol, amount: 'N/A', timestamp: new Date().toISOString(), initiatedBy: 'User (Detail View)', status: 'Requested', details: `Audit requested for ${auditRequestData.assetLabel} (${auditRequestData.assetId})` };
    setOperationsLog(prevLog => [newLogEntry, ...prevLog]);
    alert(`Placeholder: Audit requested for ${auditRequestData.assetLabel}.`);
  };

  // Handler for Internal Transfer Requests (from Cold/Digital views)
  const handleInternalTransferSubmit = (transferData) => {
      console.log('Internal Transfer Submitted:', transferData);
      const newApprovalRequest = { id: `app${Date.now()}`, type: 'Internal Transfer', assetId: transferData.sourceAssetId, asset: transferData.sourceAssetSymbol, amount: transferData.amount, from: transferData.fromTier, to: transferData.toTier, details: `Transfer ${transferData.amount} ${transferData.sourceAssetSymbol} from ${transferData.fromTier} to ${transferData.toTier}`, requester: 'User/System', timestamp: new Date().toISOString(), sourceAssetId: transferData.sourceAssetId, sourceAssetSymbol: transferData.sourceAssetSymbol, };
      setPendingApprovals(prev => [newApprovalRequest, ...prev]);
      const newLogEntry = { id: `log${Date.now()}`, operation: 'Internal Transfer Request', vault: `${transferData.fromTier} -> ${transferData.toTier}`, asset: transferData.sourceAssetSymbol, amount: `${transferData.amount.toLocaleString()} ${transferData.sourceAssetSymbol}`, timestamp: new Date().toISOString(), initiatedBy: 'User/System', status: 'Pending Approval', details: `Request to transfer from ${transferData.fromTier} to ${transferData.toTier}. Approval ID: ${newApprovalRequest.id}` };
      setOperationsLog(prevLog => [newLogEntry, ...prevLog]);
      alert(`Internal transfer request for ${transferData.amount} ${transferData.sourceAssetSymbol} submitted for approval.`);
      // Decide whether to navigate back or stay on current view after request
      // handleBackToDashboard();
  };
  // --- End Action Handlers ---


  // --- Render Logic ---

  // Render specific view based on custodyView state
  const renderSubView = () => {
      switch (custodyView) {
          case 'reporting': return <CustodyReporting assets={assets} onBack={handleBackToDashboard} />;
          case 'approvals': return <ApprovalQueue pendingApprovals={pendingApprovals} onApprove={handleApproveItem} onReject={handleRejectItem} onBack={handleBackToDashboard} />;
          case 'coldStorage': return <ColdStorageView assets={assets} onBack={handleBackToDashboard} onSubmitTransfer={handleInternalTransferSubmit} />;
          case 'physicalStorage': return <PhysicalVaultsView assets={assets} onBack={handleBackToDashboard} onAuditRequest={handleAuditRequestSubmit} />;
          case 'digitalStorage': return <DigitalVaultsView assets={assets} onBack={handleBackToDashboard} onSubmitTransfer={handleInternalTransferSubmit} />;
          case 'depositForm': return <InitiateDepositForm assets={assets} onBack={handleBackToDashboard} onSubmit={handleDepositSubmit} />;
          case 'withdrawalForm': return <RequestWithdrawalForm assets={assets} onBack={handleBackToDashboard} onSubmit={handleWithdrawalSubmit} />;
          case 'auditForm': return <ScheduleAuditForm assets={assets} onBack={handleBackToDashboard} onSubmit={handleAuditSubmit} />;
          case 'fullLog': return <FullOperationsLogView operationsLog={operationsLog} onBack={handleBackToDashboard} />; // Pass stateful log
          case 'dashboard': default: return renderDashboardView(operationsLog, pendingApprovals); // Pass stateful log/approvals
      }
  };

  // Function to render the main dashboard content
  const renderDashboardView = (operations, approvals) => (
     <>
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
           <h1 className="text-2xl font-bold text-gray-800">Custody Management</h1>
        </div>

        {/* Main Content Container */}
        <div className="bg-white p-6 rounded shadow">

          {/* Security Banner */}
          <div className="flex items-center mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
             <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center mr-4"> <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}> <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /> </svg> </div>
             <div> <h3 className="font-medium">Enhanced Security Zone</h3> <p className="text-sm text-gray-600">Vault operations are protected by multi-signature authorization and advanced encryption.</p> </div>
             <div className="ml-auto"> <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">Security level: Maximum</span> </div>
          </div>

          {/* Vault Types */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
             <VaultTypeSummaryCard title="Physical Vaults" description="Secure storage facilities for physical assets..." value={vaultSummaries?.physical?.value ?? '$0'} countLabel="Assets" countValue={vaultSummaries?.physical?.countValue ?? 'N/A'} detailLabel="Last Audit" detailValue={vaultSummaries?.physical?.detailValue ?? 'N/A'} onManageClick={handleManagePhysical} manageButtonText="Manage Physical Vaults" />
             <VaultTypeSummaryCard title="Digital Vaults" description="Secure storage for digital assets (Hot/Warm)..." value={vaultSummaries?.digital?.value ?? '$0'} countLabel="Assets" countValue={vaultSummaries?.digital?.countValue ?? 'N/A'} detailLabel="Security Level" detailValue={vaultSummaries?.digital?.detailValue ?? 'N/A'} onManageClick={handleManageDigital} manageButtonText="Manage Digital Vaults" />
             <VaultTypeSummaryCard title="Cold Storage" description="Air-gapped storage for high-value digital assets..." value={vaultSummaries?.cold?.value ?? '$0'} countLabel="Assets" countValue={vaultSummaries?.cold?.countValue ?? 'N/A'} detailLabel="Access Protocol" detailValue={vaultSummaries?.cold?.detailValue ?? 'N/A'} onManageClick={handleManageCold} manageButtonText="Manage Cold Storage" />
          </div>

          {/* Pending Approvals Banner */}
          {approvals.length > 0 && ( <div onClick={handleViewApprovals} className="flex items-center mb-8 bg-orange-50 p-4 rounded-lg border border-orange-200 cursor-pointer hover:shadow-md transition-shadow" > <div className="h-10 w-10 rounded-full bg-orange-100 text-orange-800 flex items-center justify-center mr-4 flex-shrink-0"> <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}> <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /> </svg> </div> <div className="flex-grow"> <h3 className="font-medium text-orange-800">Action Required: Pending Approvals</h3> <p className="text-sm text-orange-700">{approvals.length} item(s) require custody review and approval.</p> </div> <div className="ml-auto"> <span className="text-orange-600 font-bold">&rarr;</span> </div> </div> )}

          {/* Vault Operations Log */}
          <div className="mb-8">
             <h2 className="font-medium mb-4 text-gray-800">Recent Vault Operations</h2>
             <div className="border rounded shadow overflow-hidden">
                 <VaultOperationsLogTable operations={operations} /> {/* Pass stateful log */}
             </div>
             <div className="flex justify-end mt-3"> <button type="button" onClick={handleViewFullLog} className="px-3 py-1 text-sm text-blue-600 hover:underline flex items-center"> View Complete Operation Log </button> </div>
          </div>

          {/* Vault Actions & Analytics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            {/* Quick Actions */}
            <div className="flex flex-col">
              <h2 className="font-medium mb-3 text-gray-800 flex-shrink-0">Quick Actions</h2>
              <VaultQuickActions onInitiateDeposit={handleInitiateDeposit} onRequestWithdrawal={handleRequestWithdrawal} onScheduleAudit={handleScheduleAudit} onGenerateReport={handleGenerateReport} />
            </div>
            {/* Vault Analytics */}
            <div className="flex flex-col">
              <h2 className="font-medium mb-3 text-gray-800 flex-shrink-0">Vault Analytics</h2>
              <VaultAnalytics assets={assets ?? []} />
            </div>
          </div>

        </div>
     </>
  );

  // Main return uses the renderSubView function
  return ( <div className="p-4 sm:p-8"> {renderSubView()} </div> );
};

export default CustodyDashboard;
