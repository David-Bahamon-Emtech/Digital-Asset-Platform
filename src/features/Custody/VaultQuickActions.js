// src/features/Custody/VaultQuickActions.js
import React from 'react';

/**
 * Renders a set of quick action buttons for vault management.
 * Uses standard HTML and Tailwind CSS.
 *
 * @param {object} props - Component props.
 * @param {function} props.onInitiateDeposit - Handler for deposit action.
 * @param {function} props.onRequestWithdrawal - Handler for withdrawal action.
 * @param {function} props.onScheduleAudit - Handler for audit action.
 * @param {function} props.onGenerateReport - Handler for report action.
 */
const VaultQuickActions = ({
    onInitiateDeposit,
    onRequestWithdrawal,
    onScheduleAudit,
    onGenerateReport
}) => {
    return (
        <div className="space-y-3 h-full bg-gray-100 p-3 rounded border border-gray-300 flex flex-col justify-around">
            {/* Added h-full, flex, flex-col, justify-around for alignment */}
            <button
                type="button"
                onClick={onInitiateDeposit}
                className="w-full flex items-center justify-between p-3 border border-gray-300 rounded hover:bg-gray-50 text-left bg-white shadow-sm"
            >
                <div className="flex items-center">
                    {/* Placeholder for Icon */}
                    {/* <svg className="h-5 w-5 text-blue-600 mr-3" ... /> */}
                    <span className="font-medium text-sm text-gray-700">Initiate New Deposit</span>
                </div>
                {/* Placeholder for Arrow */}
                {/* <svg className="h-5 w-5 text-gray-400" ... /> */}
                <span>&rarr;</span>
            </button>

            <button
                type="button"
                onClick={onRequestWithdrawal}
                className="w-full flex items-center justify-between p-3 border border-gray-300 rounded hover:bg-gray-50 text-left bg-white shadow-sm"
            >
                <div className="flex items-center">
                    {/* Placeholder for Icon */}
                    {/* <svg className="h-5 w-5 text-red-600 mr-3" ... /> */}
                    <span className="font-medium text-sm text-gray-700">Request Withdrawal</span>
                </div>
                 {/* Placeholder for Arrow */}
                <span>&rarr;</span>
            </button>

            <button
                type="button"
                onClick={onScheduleAudit}
                className="w-full flex items-center justify-between p-3 border border-gray-300 rounded hover:bg-gray-50 text-left bg-white shadow-sm"
            >
                <div className="flex items-center">
                    {/* Placeholder for Icon */}
                    {/* <svg className="h-5 w-5 text-yellow-600 mr-3" ... /> */}
                    <span className="font-medium text-sm text-gray-700">Schedule Vault Audit</span>
                </div>
                 {/* Placeholder for Arrow */}
                <span>&rarr;</span>
            </button>

            <button
                type="button"
                onClick={onGenerateReport}
                className="w-full flex items-center justify-between p-3 border border-gray-300 rounded hover:bg-gray-50 text-left bg-white shadow-sm"
            >
                <div className="flex items-center">
                    {/* Placeholder for Icon */}
                    {/* <svg className="h-5 w-5 text-green-600 mr-3" ... /> */}
                    <span className="font-medium text-sm text-gray-700">Generate Vault Report</span>
                </div>
                 {/* Placeholder for Arrow */}
                <span>&rarr;</span>
            </button>
        </div>
    );
};

export default VaultQuickActions;
