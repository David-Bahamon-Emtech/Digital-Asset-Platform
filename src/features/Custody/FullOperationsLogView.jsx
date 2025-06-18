// src/features/Custody/FullOperationsLogView.js
import React, { useState, useMemo } from 'react';
// Import the shared log table component
import VaultOperationsLogTable from './VaultOperationsLogTable.jsx';
// Import the dummy data (replace with context/API later)
import { dummyOperationsData } from '../../data/mockCustodyData.js';

/**
 * Displays the full custody operations log with filtering options.
 * Uses standard HTML and Tailwind CSS.
 *
 * @param {object} props - Component props.
 * @param {function} props.onBack - Function to navigate back to the dashboard.
 */
const FullOperationsLogView = ({ onBack }) => {
    // State for filters
    const [filterType, setFilterType] = useState(''); // e.g., 'Deposit', 'Withdrawal', 'Audit'
    const [filterVault, setFilterVault] = useState(''); // e.g., 'Zurich Vault', 'Cold Storage'
    const [filterAsset, setFilterAsset] = useState(''); // e.g., 'Bitcoin', 'USDC'
    const [filterStatus, setFilterStatus] = useState(''); // e.g., 'Completed', 'Pending Approval'
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');

    // Memoized filtered data based on dummy data for now
    const filteredOperations = useMemo(() => {
        let data = [...dummyOperationsData]; // Use dummy data

        if (filterType) { data = data.filter(op => op.operation?.toLowerCase() === filterType.toLowerCase()); }
        if (filterVault) { data = data.filter(op => op.vault?.toLowerCase().includes(filterVault.toLowerCase())); }
        if (filterAsset) { data = data.filter(op => op.asset?.toLowerCase().includes(filterAsset.toLowerCase())); }
        if (filterStatus) { data = data.filter(op => op.status?.toLowerCase() === filterStatus.toLowerCase()); }
        if (filterStartDate) { data = data.filter(op => new Date(op.timestamp) >= new Date(filterStartDate)); }
        if (filterEndDate) { data = data.filter(op => new Date(op.timestamp) <= new Date(filterEndDate + 'T23:59:59Z')); } // Include full end date

        // Sort by timestamp descending by default
        data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        return data;
    }, [filterType, filterVault, filterAsset, filterStatus, filterStartDate, filterEndDate]);

    // Unique values for filter dropdowns (derived from dummy data)
    const uniqueOperations = useMemo(() => [...new Set(dummyOperationsData.map(op => op.operation))], []);
    const uniqueVaults = useMemo(() => [...new Set(dummyOperationsData.map(op => op.vault))], []);
    const uniqueAssets = useMemo(() => [...new Set(dummyOperationsData.map(op => op.asset).filter(Boolean))], []); // Filter out null/undefined assets
    const uniqueStatuses = useMemo(() => [...new Set(dummyOperationsData.map(op => op.status))], []);

    const clearFilters = () => {
        setFilterType('');
        setFilterVault('');
        setFilterAsset('');
        setFilterStatus('');
        setFilterStartDate('');
        setFilterEndDate('');
    };

    // TODO: Implement pagination later

    return (
        <div className="bg-white p-6 rounded shadow">
            {/* Header */}
            <div className="flex justify-between items-center mb-6 border-b pb-3">
                <h1 className="text-2xl font-bold text-gray-800">Complete Vault Operation Log</h1>
                <button
                    type="button"
                    className="px-3 py-1 rounded text-white hover:opacity-90 bg-gray-800 text-sm"
                    onClick={onBack}
                >
                    &larr; Back to Custody Dashboard
                </button>
            </div>

            {/* Filters Section */}
            <div className="mb-6 p-4 border rounded bg-gray-50">
                <h2 className="text-lg font-semibold mb-3 text-gray-700">Filters</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-sm">
                    {/* Operation Type Filter */}
                    <div>
                        <label htmlFor="filterType" className="block mb-1 font-medium text-gray-700">Operation Type</label>
                        <select id="filterType" value={filterType} onChange={(e) => setFilterType(e.target.value)} className="w-full p-2 border border-gray-300 rounded bg-white">
                            <option value="">All Types</option>
                            {uniqueOperations.map(op => <option key={op} value={op}>{op}</option>)}
                        </select>
                    </div>
                     {/* Vault/Location Filter */}
                     <div>
                        <label htmlFor="filterVault" className="block mb-1 font-medium text-gray-700">Vault/Location</label>
                        <input id="filterVault" type="text" value={filterVault} onChange={(e) => setFilterVault(e.target.value)} className="w-full p-2 border border-gray-300 rounded" placeholder="Filter by vault name..." />
                        {/* Or use a dropdown if vaults are predefined */}
                        {/* <select id="filterVault" value={filterVault} onChange={(e) => setFilterVault(e.target.value)} className="w-full p-2 border border-gray-300 rounded bg-white">
                            <option value="">All Vaults</option>
                            {uniqueVaults.map(v => <option key={v} value={v}>{v}</option>)}
                        </select> */}
                    </div>
                     {/* Asset Filter */}
                     <div>
                        <label htmlFor="filterAsset" className="block mb-1 font-medium text-gray-700">Asset</label>
                         <input id="filterAsset" type="text" value={filterAsset} onChange={(e) => setFilterAsset(e.target.value)} className="w-full p-2 border border-gray-300 rounded" placeholder="Filter by asset name/symbol..." />
                        {/* <select id="filterAsset" value={filterAsset} onChange={(e) => setFilterAsset(e.target.value)} className="w-full p-2 border border-gray-300 rounded bg-white">
                            <option value="">All Assets</option>
                            {uniqueAssets.map(a => <option key={a} value={a}>{a}</option>)}
                        </select> */}
                    </div>
                     {/* Status Filter */}
                     <div>
                        <label htmlFor="filterStatus" className="block mb-1 font-medium text-gray-700">Status</label>
                        <select id="filterStatus" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full p-2 border border-gray-300 rounded bg-white">
                            <option value="">All Statuses</option>
                            {uniqueStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    {/* Start Date Filter */}
                    <div>
                        <label htmlFor="filterStartDate" className="block mb-1 font-medium text-gray-700">Start Date</label>
                        <input id="filterStartDate" type="date" value={filterStartDate} onChange={(e) => setFilterStartDate(e.target.value)} className="w-full p-2 border border-gray-300 rounded" />
                    </div>
                    {/* End Date Filter */}
                    <div>
                        <label htmlFor="filterEndDate" className="block mb-1 font-medium text-gray-700">End Date</label>
                        <input id="filterEndDate" type="date" value={filterEndDate} onChange={(e) => setFilterEndDate(e.target.value)} className="w-full p-2 border border-gray-300 rounded" />
                    </div>
                     {/* Clear Filters Button */}
                     <div className="col-span-full sm:col-span-1 md:col-span-1 lg:col-span-2 flex items-end">
                        <button
                            type="button"
                            onClick={clearFilters}
                            className="w-full sm:w-auto px-4 py-2 rounded border border-gray-300 hover:bg-gray-100 text-sm font-medium"
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>
            </div>

            {/* Full Log Table */}
            <div className="mb-8">
                <VaultOperationsLogTable operations={filteredOperations} />
            </div>

            {/* TODO: Add Pagination Controls */}
            <div className="text-center text-sm text-gray-500">
                Pagination controls will go here. Showing {filteredOperations.length} results.
            </div>

        </div>
    );
};

export default FullOperationsLogView;