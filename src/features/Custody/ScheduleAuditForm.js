// src/features/Custody/ScheduleAuditForm.js
import React, { useState, useMemo } from 'react';

/**
 * Form component for scheduling a vault/asset audit.
 * Uses standard HTML and Tailwind CSS.
 *
 * @param {object} props - Component props.
 * @param {Array<object>} props.assets - The list of asset objects (used to select audit target).
 * @param {function} props.onBack - Function to navigate back to the dashboard.
 * @param {function} props.onSubmit - Function called when the audit form is submitted (passes form data).
 */
const ScheduleAuditForm = ({ assets = [], onBack, onSubmit }) => {

    // Filter assets to show only those we can audit (non-External)
    const auditableAssets = useMemo(() => {
        if (!Array.isArray(assets)) return [];
        // Filter out assets held externally
        return assets.filter(asset => asset.custodyType !== 'External');
        // TODO: Potentially add options like "All Physical Vaults", "All Cold Storage"
    }, [assets]);

    // Form State
    const [auditTarget, setAuditTarget] = useState(''); // Could be asset ID or a vault type/ID
    const [auditType, setAuditType] = useState('Internal');
    const [auditScope, setAuditScope] = useState('');
    const [preferredDate, setPreferredDate] = useState('');
    const [externalAuditor, setExternalAuditor] = useState('');
    const [auditNotes, setAuditNotes] = useState('');

    const handleSubmit = (event) => {
        event.preventDefault();

        if (!auditTarget) {
            alert('Please select the target vault or asset for the audit.');
            return;
        }
         if (auditType === 'External' && !externalAuditor.trim()) {
            alert('Please specify the External Auditor name.');
            return;
        }

        // Pass data up to the parent component (CustodyDashboard)
        onSubmit({
            target: auditTarget,
            type: auditType,
            scope: auditScope,
            preferredDate: preferredDate,
            auditor: auditType === 'External' ? externalAuditor.trim() : 'Internal Audit Team',
            notes: auditNotes,
        });
    };

    return (
        <div className="bg-white p-6 rounded shadow max-w-2xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-6 border-b pb-3">
                <h1 className="text-xl font-bold text-gray-800">Schedule Vault Audit</h1>
                <button
                    type="button"
                    className="px-3 py-1 rounded text-white hover:opacity-90 bg-gray-800 text-sm"
                    onClick={onBack}
                >
                    &larr; Back to Dashboard
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Audit Target Selection */}
                <div>
                    <label htmlFor="auditTarget" className="block mb-1 text-sm font-medium text-gray-700">Audit Target <span className="text-red-600">*</span></label>
                    <select
                        id="auditTarget"
                        value={auditTarget}
                        onChange={(e) => setAuditTarget(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded bg-white text-sm"
                        required
                    >
                        <option value="" disabled>-- Select Target --</option>
                        <option value="ALL_PHYSICAL">All Physical Vaults</option>
                        <option value="ALL_DIGITAL">All Digital Vaults (Hot/Warm)</option>
                        <option value="ALL_COLD">All Cold Storage</option>
                        <option value="ALL_VAULTS">All Managed Vaults</option>
                        <optgroup label="Specific Assets/Vaults">
                            {auditableAssets.map(asset => (
                                <option key={asset.id} value={asset.id}>
                                    {asset.label} ({asset.symbol}) - Type: {asset.custodyType}
                                </option>
                            ))}
                        </optgroup>
                        {auditableAssets.length === 0 && <option disabled>No specific auditable assets found</option>}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Select the vault(s) or specific asset account to audit.</p>
                </div>

                {/* Audit Type */}
                <div>
                    <label htmlFor="auditType" className="block mb-1 text-sm font-medium text-gray-700">Audit Type <span className="text-red-600">*</span></label>
                    <select
                        id="auditType"
                        value={auditType}
                        onChange={(e) => setAuditType(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded bg-white text-sm"
                        required
                    >
                        <option>Internal</option>
                        <option>External</option>
                    </select>
                </div>

                 {/* External Auditor Name (Conditional) */}
                 {auditType === 'External' && (
                    <div>
                        <label htmlFor="externalAuditor" className="block mb-1 text-sm font-medium text-gray-700">External Auditor Name <span className="text-red-600">*</span></label>
                        <input
                            id="externalAuditor"
                            type="text"
                            value={externalAuditor}
                            onChange={(e) => setExternalAuditor(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded text-sm"
                            placeholder="e.g., Deloitte, PwC"
                            required={auditType === 'External'}
                        />
                    </div>
                 )}


                {/* Audit Scope */}
                <div>
                    <label htmlFor="auditScope" className="block mb-1 text-sm font-medium text-gray-700">Audit Scope (Optional)</label>
                    <input
                        id="auditScope"
                        type="text"
                        value={auditScope}
                        onChange={(e) => setAuditScope(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded text-sm"
                        placeholder="e.g., Balance Verification, Security Controls"
                    />
                     <p className="text-xs text-gray-500 mt-1">Briefly describe the scope or focus of the audit.</p>
                </div>

                {/* Preferred Date */}
                <div>
                    <label htmlFor="preferredDate" className="block mb-1 text-sm font-medium text-gray-700">Preferred Date (Optional)</label>
                    <input
                        id="preferredDate"
                        type="date"
                        value={preferredDate}
                        onChange={(e) => setPreferredDate(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded text-sm"
                        min={new Date().toISOString().split('T')[0]} // Prevent past dates
                    />
                </div>


                {/* Notes */}
                <div>
                    <label htmlFor="auditNotes" className="block mb-1 text-sm font-medium text-gray-700">Notes (Optional)</label>
                    <textarea
                        id="auditNotes"
                        value={auditNotes}
                        onChange={(e) => setAuditNotes(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded text-sm"
                        rows="3"
                        placeholder="Add any relevant notes for the audit team..."
                    />
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4">
                    <button
                        type="button"
                        className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-50 text-sm font-medium"
                        onClick={onBack}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 rounded text-white bg-blue-600 hover:bg-blue-700 text-sm font-medium"
                    >
                        Submit Audit Request
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ScheduleAuditForm;
