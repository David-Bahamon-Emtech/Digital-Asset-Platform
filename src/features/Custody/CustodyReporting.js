// src/features/Custody/CustodyReporting.js
import React, { useState, useEffect } from 'react';
import { useAssets } from '../../context/AssetsContext'; // To potentially populate filters

/**
 * Component for configuring and generating custody reports.
 * Uses standard HTML and Tailwind CSS.
 *
 * @param {object} props - Component props.
 * @param {function} props.onBack - Function to navigate back to the dashboard.
 * @param {Array<object>} props.assets - List of assets from context (used for filtering options).
 */
const CustodyReporting = ({ onBack, assets = [] }) => {
    // State for form inputs
    const [reportType, setReportType] = useState('Vault Holdings Summary');
    const [vaultSelection, setVaultSelection] = useState('All Vaults');
    const [timePeriod, setTimePeriod] = useState('Current Point-in-Time');
    const [reportFormat, setReportFormat] = useState('PDF Document');
    const [reportName, setReportName] = useState('');
    const [includeAssets, setIncludeAssets] = useState({
        gold: true, crypto: true, stablecoins: true, securities: true, other: true
    });
    const [emailRecipients, setEmailRecipients] = useState('');
    const [reportSections, setReportSections] = useState([
        { name: 'Executive Summary', include: true, level: 'Standard' },
        { name: 'Vault Holdings', include: true, level: 'Standard' },
        { name: 'Asset Movements', include: true, level: 'Standard' },
        { name: 'Valuation Analysis', include: true, level: 'Standard' },
        { name: 'Security Status', include: true, level: 'Standard' },
        { name: 'Compliance & Auditing', include: true, level: 'Standard' },
    ]);
    const [visualizationOptions, setVisualizationOptions] = useState({
        pie: true, bar: true, line: true, tables: true
    });
    const [customizationOptions, setCustomizationOptions] = useState({
        logo: false, header: false
    });
    const [scheduleOption, setScheduleOption] = useState('one-time');
    const [recurringFrequency, setRecurringFrequency] = useState('Daily');
    const [scheduledDateTime, setScheduledDateTime] = useState('');
    const [securityOptions, setSecurityOptions] = useState({
        encrypt: true, watermark: true, auditTrail: true, compliance: true
    });

    // Handler for changing included asset checkboxes
    const handleAssetIncludeChange = (event) => {
        const { id, checked } = event.target;
        setIncludeAssets(prev => ({ ...prev, [id]: checked }));
    };

    // Handler for changing report section include/level
    const handleSectionChange = (index, field, value) => {
        setReportSections(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    };

     // Handler for changing visualization checkboxes
    const handleVizOptionChange = (event) => {
        const { id, checked } = event.target;
        setVisualizationOptions(prev => ({ ...prev, [id]: checked }));
    };

     // Handler for changing customization checkboxes
    const handleCustomizationChange = (event) => {
        const { id, checked } = event.target;
        setCustomizationOptions(prev => ({ ...prev, [id]: checked }));
    };

     // Handler for changing security checkboxes
    const handleSecurityOptionChange = (event) => {
        const { id, checked } = event.target;
        setSecurityOptions(prev => ({ ...prev, [id]: checked }));
    };

    // Placeholder handlers for actions
    const handleGenerateReport = (event) => {
        event.preventDefault();
        console.log('Generating Report with config:', {
            reportType, vaultSelection, timePeriod, reportFormat, reportName,
            includeAssets, emailRecipients, reportSections, visualizationOptions,
            customizationOptions, scheduleOption, recurringFrequency, scheduledDateTime,
            securityOptions
        });
        // TODO: Implement actual report generation logic (likely backend call)
        alert(`Placeholder: Generating '${reportType}' report.`);
        onBack(); // Go back after initiating generation (or show progress)
    };

    const handleSaveTemplate = () => {
        console.log('Saving report configuration as template...');
        // TODO: Implement template saving logic (e.g., using TemplatesContext)
        alert('Placeholder: Report configuration saved as template.');
    };

    // TODO: Populate Vault Selection dropdown dynamically based on asset custodyTypes
    // TODO: Populate Asset Types checkboxes dynamically based on asset assetClasses

    return (
        <div className="bg-white p-6 rounded shadow">
            {/* Header */}
            <div className="flex justify-between items-center mb-6 border-b pb-3">
                <h1 className="text-2xl font-bold text-gray-800">Generate Vault Report</h1>
                <button
                    type="button"
                    className="px-3 py-1 rounded text-white hover:opacity-90 bg-gray-800 text-sm"
                    onClick={onBack}
                >
                    Back to Custody Dashboard
                </button>
            </div>

            <form onSubmit={handleGenerateReport}>
                {/* Report Configuration Form */}
                <div className="mb-8">
                    <h2 className="text-lg font-semibold mb-4 text-gray-700">Report Configuration</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Column 1 */}
                        <div className="space-y-4">
                            {/* Report Type */}
                            <div>
                                <label htmlFor="reportType" className="block mb-1 text-sm font-medium text-gray-700">Report Type <span className="text-red-600">*</span></label>
                                <select id="reportType" value={reportType} onChange={(e) => setReportType(e.target.value)} className="w-full p-2 border border-gray-300 rounded bg-white text-sm" required>
                                    <option>Vault Holdings Summary</option>
                                    <option>Asset Allocation Report</option>
                                    <option>Custody Activity Report</option>
                                    <option>Vault Audit Report</option>
                                    <option>Regulatory Compliance Report</option>
                                    <option>Custom Report</option>
                                </select>
                            </div>
                            {/* Vault Selection */}
                            <div>
                                <label htmlFor="vaultSelection" className="block mb-1 text-sm font-medium text-gray-700">Vault Selection <span className="text-red-600">*</span></label>
                                <select id="vaultSelection" value={vaultSelection} onChange={(e) => setVaultSelection(e.target.value)} className="w-full p-2 border border-gray-300 rounded bg-white text-sm" required>
                                    {/* TODO: Populate dynamically */}
                                    <option>All Vaults</option>
                                    <option>Physical Vaults Only</option>
                                    <option>Digital Vaults Only</option>
                                    <option>Cold Storage Only</option>
                                    <option>Custom Selection...</option>
                                </select>
                            </div>
                            {/* Time Period */}
                            <div>
                                <label htmlFor="timePeriod" className="block mb-1 text-sm font-medium text-gray-700">Time Period <span className="text-red-600">*</span></label>
                                <select id="timePeriod" value={timePeriod} onChange={(e) => setTimePeriod(e.target.value)} className="w-full p-2 border border-gray-300 rounded bg-white text-sm" required>
                                    <option>Current Point-in-Time</option>
                                    <option>Last 30 Days</option>
                                    <option>Last Quarter</option>
                                    <option>Year-to-Date</option>
                                    <option>Last 12 Months</option>
                                    <option>Custom Range...</option>
                                </select>
                            </div>
                            {/* Report Format */}
                            <div>
                                <label htmlFor="reportFormat" className="block mb-1 text-sm font-medium text-gray-700">Report Format <span className="text-red-600">*</span></label>
                                <select id="reportFormat" value={reportFormat} onChange={(e) => setReportFormat(e.target.value)} className="w-full p-2 border border-gray-300 rounded bg-white text-sm" required>
                                    <option>PDF Document</option>
                                    <option>Excel Spreadsheet</option>
                                    <option>CSV Data Export</option>
                                    <option>HTML Report</option>
                                    <option>JSON Data</option>
                                </select>
                            </div>
                        </div>
                        {/* Column 2 */}
                        <div className="space-y-4">
                            {/* Report Name */}
                            <div>
                                <label htmlFor="reportName" className="block mb-1 text-sm font-medium text-gray-700">Report Name (Optional)</label>
                                <input id="reportName" type="text" value={reportName} onChange={(e) => setReportName(e.target.value)} className="w-full p-2 border border-gray-300 rounded text-sm" placeholder="Enter a name for this report" />
                            </div>
                            {/* Asset Types */}
                            <div>
                                <label className="block mb-1 text-sm font-medium text-gray-700">Asset Types to Include</label>
                                <div className="p-3 border border-gray-300 rounded bg-gray-50 text-sm space-y-2">
                                    {/* TODO: Populate dynamically */}
                                    <div className="flex items-center"><input type="checkbox" id="gold" className="mr-2 h-4 w-4 text-yellow-600 focus:ring-yellow-500" checked={includeAssets.gold} onChange={handleAssetIncludeChange} /><label htmlFor="gold">Gold & Precious Metals</label></div>
                                    <div className="flex items-center"><input type="checkbox" id="crypto" className="mr-2 h-4 w-4 text-yellow-600 focus:ring-yellow-500" checked={includeAssets.crypto} onChange={handleAssetIncludeChange} /><label htmlFor="crypto">Cryptocurrencies</label></div>
                                    <div className="flex items-center"><input type="checkbox" id="stablecoins" className="mr-2 h-4 w-4 text-yellow-600 focus:ring-yellow-500" checked={includeAssets.stablecoins} onChange={handleAssetIncludeChange} /><label htmlFor="stablecoins">Stablecoins</label></div>
                                    <div className="flex items-center"><input type="checkbox" id="securities" className="mr-2 h-4 w-4 text-yellow-600 focus:ring-yellow-500" checked={includeAssets.securities} onChange={handleAssetIncludeChange} /><label htmlFor="securities">Tokenized Securities</label></div>
                                    <div className="flex items-center"><input type="checkbox" id="other" className="mr-2 h-4 w-4 text-yellow-600 focus:ring-yellow-500" checked={includeAssets.other} onChange={handleAssetIncludeChange} /><label htmlFor="other">Other Assets</label></div>
                                </div>
                            </div>
                            {/* Email Distribution */}
                            <div>
                                <label htmlFor="emailRecipients" className="block mb-1 text-sm font-medium text-gray-700">Report Distribution (Optional)</label>
                                <input id="emailRecipients" type="text" value={emailRecipients} onChange={(e) => setEmailRecipients(e.target.value)} className="w-full p-2 border border-gray-300 rounded text-sm" placeholder="Email recipients (separate with commas)" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Report Sections & Options */}
                <div className="mb-8">
                    <h2 className="text-lg font-semibold mb-4 text-gray-700">Report Sections & Options</h2>
                    <div className="border border-gray-200 rounded-lg overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Section</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Include</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details Level</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {reportSections.map((section, index) => (
                                    <tr key={section.name}>
                                        <td className="px-4 py-3 text-sm text-gray-800">{section.name}</td>
                                        <td className="px-4 py-3 text-sm">
                                            <input
                                                type="checkbox"
                                                className="h-4 w-4 text-yellow-600 focus:ring-yellow-500"
                                                checked={section.include}
                                                onChange={(e) => handleSectionChange(index, 'include', e.target.checked)}
                                            />
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            <select
                                                className="w-full p-1 border border-gray-300 rounded text-sm bg-white"
                                                value={section.level}
                                                onChange={(e) => handleSectionChange(index, 'level', e.target.value)}
                                                disabled={!section.include}
                                            >
                                                <option>Standard</option>
                                                <option>Detailed</option>
                                                <option>Minimal</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Report Visualization & Customization */}
                 <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                     {/* Visualization */}
                     <div>
                         <h2 className="text-lg font-semibold mb-3 text-gray-700">Report Visualization</h2>
                         <div className="p-3 border border-gray-300 rounded bg-gray-50 text-sm space-y-2">
                             <div className="flex items-center"><input type="checkbox" id="pie" className="mr-2 h-4 w-4 text-yellow-600 focus:ring-yellow-500" checked={visualizationOptions.pie} onChange={handleVizOptionChange} /><label htmlFor="pie">Include pie charts for asset allocation</label></div>
                             <div className="flex items-center"><input type="checkbox" id="bar" className="mr-2 h-4 w-4 text-yellow-600 focus:ring-yellow-500" checked={visualizationOptions.bar} onChange={handleVizOptionChange} /><label htmlFor="bar">Include bar charts for historical comparison</label></div>
                             <div className="flex items-center"><input type="checkbox" id="line" className="mr-2 h-4 w-4 text-yellow-600 focus:ring-yellow-500" checked={visualizationOptions.line} onChange={handleVizOptionChange} /><label htmlFor="line">Include line charts for value trends</label></div>
                             <div className="flex items-center"><input type="checkbox" id="tables" className="mr-2 h-4 w-4 text-yellow-600 focus:ring-yellow-500" checked={visualizationOptions.tables} onChange={handleVizOptionChange} /><label htmlFor="tables">Include detailed data tables</label></div>
                         </div>
                     </div>
                     {/* Customization */}
                     <div>
                         <h2 className="text-lg font-semibold mb-3 text-gray-700">Report Customization</h2>
                         <div className="p-3 border border-gray-300 rounded bg-gray-50 text-sm space-y-2">
                             <div className="flex items-center"><input type="checkbox" id="logo" className="mr-2 h-4 w-4 text-yellow-600 focus:ring-yellow-500" checked={customizationOptions.logo} onChange={handleCustomizationChange} /><label htmlFor="logo">Add custom branding/logo</label></div>
                             <div className="flex items-center"><input type="checkbox" id="header" className="mr-2 h-4 w-4 text-yellow-600 focus:ring-yellow-500" checked={customizationOptions.header} onChange={handleCustomizationChange} /><label htmlFor="header">Add custom header/footer</label></div>
                         </div>
                     </div>
                 </div>

                {/* Report Schedule */}
                <div className="mb-8">
                    <h2 className="text-lg font-semibold mb-3 text-gray-700">Report Schedule</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* One-Time */}
                        <div className={`border rounded-lg p-4 cursor-pointer ${scheduleOption === 'one-time' ? 'border-yellow-600 bg-yellow-50' : 'border-gray-200 bg-white'}`} onClick={() => setScheduleOption('one-time')}>
                            <div className="flex items-center mb-2"><input type="radio" name="schedule" id="one-time" className="mr-2 h-4 w-4 text-yellow-600 focus:ring-yellow-500" checked={scheduleOption === 'one-time'} readOnly /><label htmlFor="one-time" className="font-medium text-sm">One-Time Report</label></div>
                            <p className="text-xs text-gray-600 ml-6">Generate this report once immediately.</p>
                        </div>
                        {/* Recurring */}
                        <div className={`border rounded-lg p-4 cursor-pointer ${scheduleOption === 'recurring' ? 'border-yellow-600 bg-yellow-50' : 'border-gray-200 bg-white'}`} onClick={() => setScheduleOption('recurring')}>
                            <div className="flex items-center mb-2"><input type="radio" name="schedule" id="recurring" className="mr-2 h-4 w-4 text-yellow-600 focus:ring-yellow-500" checked={scheduleOption === 'recurring'} readOnly /><label htmlFor="recurring" className="font-medium text-sm">Recurring Report</label></div>
                            <select value={recurringFrequency} onChange={(e) => setRecurringFrequency(e.target.value)} className={`w-full p-2 border rounded text-sm ml-6 ${scheduleOption !== 'recurring' ? 'bg-gray-100' : 'bg-white border-gray-300'}`} disabled={scheduleOption !== 'recurring'}>
                                <option>Daily</option><option>Weekly</option><option>Monthly</option><option>Quarterly</option>
                            </select>
                        </div>
                        {/* Scheduled */}
                        <div className={`border rounded-lg p-4 cursor-pointer ${scheduleOption === 'scheduled' ? 'border-yellow-600 bg-yellow-50' : 'border-gray-200 bg-white'}`} onClick={() => setScheduleOption('scheduled')}>
                            <div className="flex items-center mb-2"><input type="radio" name="schedule" id="scheduled" className="mr-2 h-4 w-4 text-yellow-600 focus:ring-yellow-500" checked={scheduleOption === 'scheduled'} readOnly /><label htmlFor="scheduled" className="font-medium text-sm">Scheduled Report</label></div>
                            <input type="datetime-local" value={scheduledDateTime} onChange={(e) => setScheduledDateTime(e.target.value)} className={`w-full p-2 border rounded text-sm ml-6 ${scheduleOption !== 'scheduled' ? 'bg-gray-100' : 'bg-white border-gray-300'}`} placeholder="Select date & time" disabled={scheduleOption !== 'scheduled'} />
                        </div>
                    </div>
                </div>

                {/* Security & Compliance */}
                <div className="mb-8">
                    <h2 className="text-lg font-semibold mb-3 text-gray-700">Security & Compliance</h2>
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 text-sm">
                        <div className="space-y-3">
                            <div className="flex items-center"><input type="checkbox" id="encrypt" className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500" checked={securityOptions.encrypt} onChange={handleSecurityOptionChange} /><label htmlFor="encrypt">Encrypt report with password protection</label></div>
                            <div className="flex items-center"><input type="checkbox" id="watermark" className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500" checked={securityOptions.watermark} onChange={handleSecurityOptionChange} /><label htmlFor="watermark">Add confidentiality watermark</label></div>
                            <div className="flex items-center"><input type="checkbox" id="auditTrail" className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500" checked={securityOptions.auditTrail} onChange={handleSecurityOptionChange} /><label htmlFor="auditTrail">Include audit trail in report generation</label></div>
                            <div className="flex items-center"><input type="checkbox" id="compliance" className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500" checked={securityOptions.compliance} onChange={handleSecurityOptionChange} /><label htmlFor="compliance">Apply regulatory compliance standards</label></div>
                        </div>
                        <div className="mt-3 flex items-center text-xs">
                            {/* Info Icon Placeholder */}
                            <span className="text-blue-500 mr-1">&#9432;</span>
                            <span className="text-blue-800">Reports containing sensitive data should be encrypted.</span>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 border-t pt-4">
                    <button
                        type="button"
                        className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-50 text-sm font-medium"
                        onClick={onBack}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-50 text-sm font-medium"
                        onClick={handleSaveTemplate}
                    >
                        Save as Template
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 rounded text-white bg-yellow-600 hover:bg-yellow-700 text-sm font-medium"
                    >
                        Generate Report
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CustodyReporting;

