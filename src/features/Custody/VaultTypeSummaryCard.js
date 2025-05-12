// src/features/Custody/VaultTypeSummaryCard.js
import React from 'react';

/**
 * A card component to display summary information about a specific vault type.
 * Uses standard HTML and Tailwind CSS.
 *
 * @param {object} props - Component props.
 * @param {string} props.title - The title of the card (e.g., "Physical Vaults").
 * @param {string} props.description - A brief description.
 * @param {string} props.value - The total aggregated asset value (e.g., "$1.65B").
 * @param {string} props.countLabel - Label for the count stat (e.g., "Locations").
 * @param {string} props.countValue - Value for the count stat (e.g., "8 active").
 * @param {string} props.detailLabel - Label for the secondary detail (e.g., "Last Audit", "Security Level").
 * @param {string} props.detailValue - Value for the secondary detail (e.g., "Feb 28, 2025", "MPC + HSM").
 * @param {function} props.onManageClick - Function to call when the manage button is clicked.
 * @param {string} props.manageButtonText - Text for the manage button.
 */
const VaultTypeSummaryCard = ({
    title,
    description,
    value,
    countLabel,
    countValue,
    detailLabel,
    detailValue,
    onManageClick,
    manageButtonText
}) => {
    return (
        <div className="bg-white p-5 rounded shadow border border-gray-200 hover:shadow-md transition-shadow flex flex-col">
            {/* Card Header */}
            <div className="flex justify-between items-start mb-2">
                <h2 className="font-bold text-gray-800">{title}</h2>
                {/* Placeholder for potential icon */}
                {/* <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center"> Icon SVG </div> */}
            </div>

            {/* Description */}
            <p className="text-sm text-gray-600 mt-1 mb-4 flex-grow">{description}</p>

            {/* Stats */}
            <div className="space-y-1 text-sm mb-4">
                <div className="flex justify-between">
                    <span className="text-gray-500">{countLabel}:</span>
                    <span className="font-medium text-gray-900">{countValue}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-500">Asset Value:</span>
                    <span className="font-medium text-gray-900">{value}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-500">{detailLabel}:</span>
                    <span className="font-medium text-gray-900">{detailValue}</span>
                </div>
            </div>

            {/* Action Button */}
            <div className="mt-auto">
                <button
                    type="button"
                    onClick={onManageClick}
                    className="w-full px-4 py-2 rounded text-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                >
                    {manageButtonText}
                </button>
            </div>
        </div>
    );
};

export default VaultTypeSummaryCard;
