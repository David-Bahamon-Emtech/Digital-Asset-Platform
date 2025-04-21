import React, { useState, useEffect, useMemo } from 'react';
import { useAssets } from '../../context/AssetsContext';
import { useTokenHistory } from '../../context/TokenHistoryContext';
import { formatNumber } from '../../utils/displayUtils';
import {
    detailedDummyReserveData,
    getAlertThreshold,
} from '../../utils/metricsData.js';
import MonthlyStackedBarChart from './MonthlyStackedBarChart'; // Assuming this component is in the same directory
import { subMonths, startOfMonth, endOfMonth, eachMonthOfInterval, format as formatDate, compareAsc, isWithinInterval, compareDesc } from 'date-fns';

// --- TokenMetricsDashboard Component ---
const TokenMetricsDashboard = ({ assets = [], assetLogos = {}, alertThresholds = {} }) => {

  const [selectedMetricAssetId, setSelectedMetricAssetId] = useState('');
  const { tokenHistory } = useTokenHistory();

  // Effect to manage default selected asset
  useEffect(() => {
    if (assets.length > 0 && !selectedMetricAssetId) { setSelectedMetricAssetId(assets[0].id); }
    else if (selectedMetricAssetId && assets.length > 0 && !assets.some(a => a.id === selectedMetricAssetId)) { setSelectedMetricAssetId(assets[0].id); }
    else if (assets.length === 0) { setSelectedMetricAssetId(''); }
  }, [assets, selectedMetricAssetId]);

  // Find full asset object for selected ID
  const selectedAssetObject = useMemo(() => {
    if (!selectedMetricAssetId || assets.length === 0) return null;
    return assets.find(asset => asset.id === selectedMetricAssetId);
  }, [selectedMetricAssetId, assets]);

  // Calculate data for the reserve ratio summary table
  const reserveTableData = useMemo(() => {
    return assets.map(asset => {
      let currentRatio = null;
      if (asset.reserveData && typeof asset.reserveData.ratio === 'number') {
        currentRatio = asset.reserveData.ratio;
      } else if (asset.isWizardIssued && currentRatio === null) {
         currentRatio = asset.wizardData?.reserveDetails?.isBackedAsset ? 100.0 : null;
      } else if (!currentRatio && detailedDummyReserveData[asset.id] && typeof detailedDummyReserveData[asset.id].ratio === 'number') {
        currentRatio = detailedDummyReserveData[asset.id].ratio;
      }
      const threshold = alertThresholds[asset.id] ?? getAlertThreshold(asset);
      let logoSrc = '/logos/generic-token.png';
      if (asset.isWizardIssued && asset.logoPath) {
        logoSrc = asset.logoPath;
      } else if (assetLogos[asset.id] || assetLogos[asset.symbol]) {
        logoSrc = assetLogos[asset.id] || assetLogos[asset.symbol];
      }
      return { id: asset.id, label: asset.label, symbol: asset.symbol, logoSrc: logoSrc, currentRatio: currentRatio, threshold: threshold };
    });
  }, [assets, assetLogos, alertThresholds]);

  // --- Generate Monthly Data for Stacked Bar Chart ---
  const monthlyChartData = useMemo(() => {
    if (!selectedAssetObject || typeof selectedAssetObject.balance !== 'number' || !tokenHistory) {
        return [];
    }

    console.log(`\n[ChartData Debug] --- Generating for: ${selectedAssetObject.symbol} ---`);
    const currentBalance = selectedAssetObject.balance;
    const currentTotalSupplyIssued = (selectedAssetObject.supply === 'Finite' && typeof selectedAssetObject.totalSupplyIssued === 'number')
        ? selectedAssetObject.totalSupplyIssued
        : Infinity;

    console.log(`[ChartData Debug] Current State: Balance=${currentBalance}, TotalSupply=${currentTotalSupplyIssued === Infinity ? 'Infinite' : currentTotalSupplyIssued}`);

    const now = new Date();
    const endPeriod = endOfMonth(now);
    const startPeriod = startOfMonth(subMonths(now, 11));
    const monthsInInterval = eachMonthOfInterval({ start: startPeriod, end: endPeriod });

    const issuanceDate = selectedAssetObject.issuanceTimestamp ? new Date(selectedAssetObject.issuanceTimestamp) : null;
    const firstIssuanceMonth = issuanceDate ? startOfMonth(issuanceDate) : new Date(0);
    console.log(`[ChartData Debug] Issuance Month: ${issuanceDate ? formatDate(firstIssuanceMonth, 'MMM yy') : 'N/A'}`);

    // --- Step 1: Calculate state at START using BACKWARD calculation ---
    let balanceAtStart = currentBalance;
    let totalSupplyAtStart = currentTotalSupplyIssued;

    const firstChartMonthDate = monthsInInterval.find(m => compareAsc(startOfMonth(m), firstIssuanceMonth) >= 0) || startPeriod;
    console.log(`[ChartData Debug] First month needed for chart calculation: ${formatDate(firstChartMonthDate, 'MMM yy')}`);

    const relevantHistoryForStartCalc = tokenHistory
      .filter(entry => {
        if (!entry || !entry.timestamp || entry.assetId !== selectedAssetObject.id) return false;
        const eventDate = new Date(entry.timestamp);
        if (isNaN(eventDate.getTime())) return false;
        return compareAsc(eventDate, firstChartMonthDate) >= 0;
      })
      .sort((a, b) => {
        const dateA = new Date(a?.timestamp); const dateB = new Date(b?.timestamp);
        if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) return 0;
        return compareDesc(dateA, dateB); // DESCENDING for backward calc
      });

    console.log(`[ChartData Debug] Found ${relevantHistoryForStartCalc.length} relevant history events for backward calculation.`);
    console.log(`[ChartData Debug] Starting backward calc with: Balance=${balanceAtStart}, TotalSupply=${totalSupplyAtStart === Infinity ? 'Infinite' : totalSupplyAtStart}`);

    // --- BACKWARD CALCULATION LOOP ---
    relevantHistoryForStartCalc.forEach(entry => {
      if (!entry || !entry.details || !entry.actionType) return;
      const amountMatch = entry.details?.match(/([0-9,]+(\.\d+)?)\s+/);
      const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : 0;
      if (isNaN(amount) || amount <= 0) { console.log(`[ChartData Debug BACKWARD] Skipping event ${entry.actionType} - invalid amount.`); return; }

      const eventDateStr = formatDate(new Date(entry.timestamp), 'yyyy-MM-dd HH:mm');
      console.log(`[ChartData Debug BACKWARD] Reversing ${eventDateStr}: ${entry.actionType} ${amount}`);

      // --- Reverse Circulation Changes ---
      if (entry.actionType === 'Swap In') {
        balanceAtStart -= amount; // Was added, so subtract
        console.log(` -> Balance: ${balanceAtStart} (-${amount})`);
      } else if (entry.actionType === 'Swap Out') {
        balanceAtStart += amount; // Was subtracted, so add
        console.log(` -> Balance: ${balanceAtStart} (+${amount})`);
      } else if (entry.actionType === 'Redeem & Burn') {
        balanceAtStart += amount; // Was subtracted, so add
        console.log(` -> Balance: ${balanceAtStart} (+${amount})`);
      // *** NEW: Handle Swap R->C ***
      } else if (entry.actionType === 'Swap R->C') {
        balanceAtStart -= amount; // Circulation was *increased* by swap, so subtract to reverse
        console.log(` -> Balance: ${balanceAtStart} (-${amount}) [Swap R->C reversal]`);
        // Total supply is NOT affected by Swap R->C, so no change here
      }
      // Note: 'Mint' and 'Burn' (from reserve) don't affect *circulation* directly in this model

      // --- Reverse Total Supply Changes (Only if finite) ---
      if (totalSupplyAtStart !== Infinity) {
          if (entry.actionType === 'Mint') {
            totalSupplyAtStart -= amount; // Was added, so subtract
            console.log(` -> TotalSupply: ${totalSupplyAtStart} (-${amount})`);
          } else if (entry.actionType === 'Burn') { // Burn from reserve
            totalSupplyAtStart += amount; // Was subtracted, so add
            console.log(` -> TotalSupply: ${totalSupplyAtStart} (+${amount})`);
          } else if (entry.actionType === 'Redeem & Burn') { // Redeem also burns total supply
            totalSupplyAtStart += amount; // Was subtracted, so add
            console.log(` -> TotalSupply: ${totalSupplyAtStart} (+${amount})`);
          }
          // *** Swap R->C does NOT affect total supply ***
      }
    }); // End backward calculation loop

    // Clamp starting values
    balanceAtStart = Math.max(0, balanceAtStart);
    if (totalSupplyAtStart !== Infinity) {
      totalSupplyAtStart = Math.max(0, totalSupplyAtStart);
      balanceAtStart = Math.min(balanceAtStart, totalSupplyAtStart); // Ensure consistency
    }
    console.log(`[ChartData Debug] Calculated state at start (${formatDate(firstChartMonthDate, 'MMM yy')}): Balance=${balanceAtStart}, TotalSupply=${totalSupplyAtStart === Infinity ? 'Infinite' : totalSupplyAtStart}`);

    // --- Step 2: Iterate FORWARD through each month ---
    const monthlySnapshots = [];
    let circulationTracker = balanceAtStart;
    let totalSupplyTracker = totalSupplyAtStart;

    console.log(`[ChartData Debug] Starting forward calculation loop...`);
    for (const monthDate of monthsInInterval) {
        const monthLabel = formatDate(monthDate, 'MMM yy');
        const monthStart = startOfMonth(monthDate);
        const monthEnd = endOfMonth(monthDate);

        if (compareAsc(monthStart, firstIssuanceMonth) < 0) {
            console.log(`[ChartData Debug FORWARD] Skipping ${monthLabel} (before issuance)`);
            monthlySnapshots.push({ month: monthLabel, circulation: null, reserve: null, events: [] });
            continue;
        }

        console.log(`[ChartData Debug FORWARD] Processing ${monthLabel}: StartBalance=${circulationTracker}, StartTotalSupply=${totalSupplyTracker === Infinity ? 'Infinite' : totalSupplyTracker}`);

        const eventsThisMonth = tokenHistory.filter(entry => {
            if (!entry || !entry.timestamp || entry.assetId !== selectedAssetObject.id) return false;
            const eventDate = new Date(entry.timestamp);
            if (isNaN(eventDate.getTime())) return false;
            return isWithinInterval(eventDate, { start: monthStart, end: monthEnd });
        });

        console.log(`[ChartData Debug FORWARD] Found ${eventsThisMonth.length} events for ${monthLabel}`);
        let netChangeCirculation = 0;
        let netChangeTotalSupply = 0;

        // --- FORWARD CALCULATION LOOP ---
        eventsThisMonth.forEach(entry => {
            if (!entry || !entry.details || !entry.actionType) return;
            const amountMatch = entry.details?.match(/([0-9,]+(\.\d+)?)\s+/);
            const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : 0;
            if (isNaN(amount) || amount <= 0) { console.log(`[ChartData Debug FORWARD] Skipping event ${entry.actionType} - invalid amount.`); return; }

            const eventDateStr = formatDate(new Date(entry.timestamp), 'yyyy-MM-dd HH:mm');
            console.log(`[ChartData Debug FORWARD] Applying ${eventDateStr}: ${entry.actionType} ${amount}`);

            // Apply Circulation changes
            if (entry.actionType === 'Swap In') {
                netChangeCirculation += amount;
            } else if (entry.actionType === 'Swap Out') {
                netChangeCirculation -= amount;
            } else if (entry.actionType === 'Redeem & Burn') {
                netChangeCirculation -= amount;
            // *** NEW: Handle Swap R->C ***
            } else if (entry.actionType === 'Swap R->C') {
                 netChangeCirculation += amount; // Reserve moved *into* circulation
                 // Total supply not affected
            }
            // Mint/Burn do not affect circulation in this model

            // Apply Total Supply changes (if finite)
            if (totalSupplyTracker !== Infinity) {
                if (entry.actionType === 'Mint') {
                    netChangeTotalSupply += amount;
                } else if (entry.actionType === 'Burn') { // Burn from reserve
                    netChangeTotalSupply -= amount;
                } else if (entry.actionType === 'Redeem & Burn') { // Redeem also decreases total supply
                    netChangeTotalSupply -= amount;
                }
                // *** Swap R->C does NOT affect total supply ***
            }
        }); // End forward calculation loop for month

        // Calculate end-of-month state
        let endOfMonthCirculation = circulationTracker + netChangeCirculation;
        let endOfMonthTotalSupply = (totalSupplyTracker === Infinity) ? Infinity : (totalSupplyTracker + netChangeTotalSupply);

        // Clamp values
        endOfMonthCirculation = Math.max(0, endOfMonthCirculation);
        if (endOfMonthTotalSupply !== Infinity) {
          endOfMonthTotalSupply = Math.max(0, endOfMonthTotalSupply);
          endOfMonthCirculation = Math.min(endOfMonthCirculation, endOfMonthTotalSupply); // Ensure consistency
        }

        // Calculate reserve for snapshot
        const reserve = (endOfMonthTotalSupply === Infinity || endOfMonthTotalSupply <= 0)
            ? 0
            : Math.max(0, endOfMonthTotalSupply - endOfMonthCirculation);

        console.log(`[ChartData Debug FORWARD] End of ${monthLabel}: Balance=${endOfMonthCirculation}, TotalSupply=${endOfMonthTotalSupply === Infinity ? 'Infinite' : endOfMonthTotalSupply}, Reserve=${reserve}`);

        monthlySnapshots.push({
            month: monthLabel,
            circulation: Math.round(endOfMonthCirculation),
            reserve: Math.round(reserve),
            events: eventsThisMonth // Include events for tooltip
        });

        // Update trackers for the START of the NEXT month
        circulationTracker = endOfMonthCirculation;
        totalSupplyTracker = endOfMonthTotalSupply;
    }

    console.log('[ChartData Debug] Final Snapshots:', monthlySnapshots);
    console.log(`[ChartData Debug] --- Finished generation for: ${selectedAssetObject.symbol} ---`);
    return monthlySnapshots;

  }, [selectedAssetObject, tokenHistory]); // Dependencies

  // Handler for dropdown selection change
  const handleAssetSelectionChange = (event) => {
    setSelectedMetricAssetId(event.target.value);
  };

  // --- Render Component ---
  return (
    <div className="mt-8 mb-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-700">Token Metrics Overview</h2>
       <div className="mb-4">
          <label htmlFor="metricAssetSelect" className="block text-sm font-medium text-gray-700 mb-1"> Select Asset for Monthly Chart: </label>
          <select id="metricAssetSelect" value={selectedMetricAssetId} onChange={handleAssetSelectionChange} className="w-full md:w-1/3 p-2 border rounded bg-white shadow-sm focus:ring-yellow-500 focus:border-yellow-500" disabled={assets.length === 0} >
            {assets.length === 0 && <option value="">No assets available</option>}
            {assets.map(asset => ( <option key={asset.id} value={asset.id}> {asset.label} ({asset.symbol}) </option> ))}
          </select>
        </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        {/* Chart Area */}
        <div className="lg:col-span-3 bg-white p-4 rounded shadow h-full min-h-[300px]">
            {selectedAssetObject ? (
                <MonthlyStackedBarChart data={monthlyChartData} assetSymbol={selectedAssetObject.symbol} />
            ) : (
                <div className="h-[250px] flex items-center justify-center text-gray-500 italic">
                    {assets.length > 0 ? 'Select an asset' : 'No assets available'}
                </div>
            )}
        </div>
        {/* Reserve Ratio Table Area */}
        <div className="lg:col-span-2 bg-white p-4 rounded shadow h-full min-h-[300px]">
            <h4 className="text-sm font-medium text-gray-500 mb-2">Current Reserve Ratios</h4>
            <div className="overflow-y-auto max-h-[250px]">
                {reserveTableData.length === 0 ? ( <p className="text-center text-gray-500 italic py-4"> No reserve data available. </p> ) : (
                    <table className="min-w-full divide-y divide-gray-200 text-xs">
                        <thead className="bg-gray-50 sticky top-0"> <tr> <th scope="col" className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Asset</th> <th scope="col" className="px-3 py-2 text-center font-medium text-gray-500 uppercase tracking-wider">Ratio</th> </tr> </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {reserveTableData.map((metric) => { let ratioColor = 'text-gray-700'; if (metric.currentRatio !== null && typeof metric.threshold === 'number') { ratioColor = metric.currentRatio >= metric.threshold ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'; } return ( <tr key={metric.id} className="hover:bg-gray-50"> <td className="px-3 py-2 whitespace-nowrap"> <div className="flex items-center"> <img src={metric.logoSrc} alt={`${metric.label} logo`} className="h-4 w-4 mr-1.5 flex-shrink-0" onError={(e) => { e.target.src = '/logos/generic-token.png'; }} /> <div> <div className="font-medium text-gray-900 text-xs">{metric.label}</div> <div className="text-xxs text-gray-500">{metric.symbol}</div> </div> </div> </td> <td className={`px-3 py-2 whitespace-nowrap text-center ${ratioColor}`}> {metric.currentRatio !== null ? `${metric.currentRatio.toFixed(1)}%` : 'N/A'} </td> </tr> ); })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default TokenMetricsDashboard;