// src/data/mockCustodyData.js

// --- Dummy Data for Operations Log ---
export const dummyOperationsData = [
    { id: 'op1', operation: 'Deposit', vault: 'Zurich Vault', asset: 'Gold Bullion', amount: '250 kg', timestamp: '2025-03-03T10:15:00Z', initiatedBy: 'M. Yamamoto', status: 'Completed' },
    { id: 'op2', operation: 'Withdrawal', vault: 'BTC Vault Alpha', asset: 'Bitcoin', amount: '35 BTC', timestamp: '2025-03-02T16:30:00Z', initiatedBy: 'J. Chen', status: 'Completed' },
    { id: 'op3', operation: 'Key Rotation', vault: 'Singapore Cold Storage', asset: 'Multi-Asset', amount: 'N/A', timestamp: '2025-03-01T09:00:00Z', initiatedBy: 'Security Team', status: 'Completed' },
    { id: 'op4', operation: 'Internal Transfer', vault: 'Hot Wallet -> Cold Storage', asset: 'USDC', amount: '1,000,000 USDC', timestamp: '2025-03-05T11:00:00Z', initiatedBy: 'Treasury Ops', status: 'Pending Approval' },
    { id: 'op5', operation: 'Audit', vault: 'London Vault', asset: 'Silver Bullion', amount: '1,250 kg', timestamp: '2025-02-28T10:00:00Z', initiatedBy: 'External Auditor', status: 'Verified' },
    { id: 'op6', operation: 'Policy Update', vault: 'All Digital Vaults', asset: 'N/A', amount: 'N/A', timestamp: '2025-03-04T14:00:00Z', initiatedBy: 'Compliance Dept', status: 'Completed' },
];

// --- Dummy Data for Approval Queue ---
export const dummyPendingApprovals = [
    { id: 'app1', type: 'Internal Transfer', asset: 'USDC', amount: '1,000,000', from: 'Hot Wallet', to: 'Cold Storage', requester: 'Treasury Ops', timestamp: '2025-03-05T11:00:00Z' },
    { id: 'app2', type: 'Payment', asset: 'BTC', amount: '5', recipient: 'External Address 0xabc...', requester: 'Payments Team', timestamp: '2025-03-05T14:30:00Z' },
    { id: 'app3', type: 'Policy Change', policyName: 'Withdrawal Limit Increase', details: 'Increase daily withdrawal limit to $5M', requester: 'Compliance Dept', timestamp: '2025-03-04T15:00:00Z' },
    { id: 'app4', type: 'Settlement', asset: 'T-BOND', amount: '10,000', from: 'Own Vault', to: 'Counterparty XYZ', requester: 'Settlements Desk', timestamp: '2025-03-05T09:15:00Z' },
];
