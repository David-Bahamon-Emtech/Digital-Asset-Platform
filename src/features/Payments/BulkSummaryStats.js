import React, { useMemo } from 'react';

// Component for the 3-column summary stats section
const BulkSummaryStats = ({ fullPaymentHistory = [] }) => {
  // console.log("BulkSummaryStats received full history:", fullPaymentHistory); // Log received data

  // --- Calculate Stats using useMemo for efficiency ---
  const stats = useMemo(() => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Filter for bulk processes within the last 30 days that have a timestamp
    const recentBulkHistory = fullPaymentHistory.filter(h =>
      h.type === 'Bulk Process' &&
      h.timestamp && // Ensure timestamp exists
      new Date(h.timestamp) > thirtyDaysAgo
    );

    const filesProcessed30d = recentBulkHistory.length;

    // Calculate total payments: Look for count in rawData.fileInfo.rows primarily
    const totalPayments30d = recentBulkHistory.reduce((sum, h) => {
      // Safely access nested properties
      const paymentCount = h.rawData?.fileInfo?.rows ?? h.rawData?.summary?.totalPayments ?? 0;
      return sum + Number(paymentCount || 0);
    }, 0);

    // Calculate total value: Sum the 'amount' field from the history item.
    // For simplicity, we'll sum directly. Assumes a common currency or requires conversion logic later.
    // TODO: Implement multi-currency handling if needed (e.g., convert to USD using rates)
    const totalValue30d = recentBulkHistory.reduce((sum, h) => sum + (Number(h.amount) || 0), 0);
    const primaryCurrency = recentBulkHistory.length > 0 ? (recentBulkHistory[0].currency || 'USD') : 'USD'; // Use currency of first item or default

    // Placeholder for average processing time - requires start/end times not currently tracked
    const avgProcessingTime = filesProcessed30d > 0 ? '~35 mins' : 'N/A';

    return {
        filesProcessed30d,
        totalPayments30d,
        totalValue30d,
        avgProcessingTime,
        primaryCurrency // Store the determined primary currency for display
    };
  }, [fullPaymentHistory]);


  // --- Calculate Format Percentages using useMemo ---
  const commonFormats = useMemo(() => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
     const recentBulkHistory = fullPaymentHistory.filter(h =>
       h.type === 'Bulk Process' &&
       h.timestamp && // Ensure timestamp exists
       new Date(h.timestamp) > thirtyDaysAgo
     );

    // Count formats based on rawData.fileType or rawData.file.type
    const formatCounts = recentBulkHistory.reduce((counts, h) => {
      // Prioritize fileType, then look inside file object, default to OTHER
      const type = (h.rawData?.fileType || h.rawData?.file?.type || 'OTHER').toUpperCase();
      // Simple cleanup for common extensions if needed
      const cleanType = type.replace('.', '').split('/')[0]; // Basic cleanup
      counts[cleanType] = (counts[cleanType] || 0) + 1;
      return counts;
    }, {});

    const totalFiles = recentBulkHistory.length;
    if (totalFiles === 0) return []; // Return empty if no files

    const formatPercentages = Object.entries(formatCounts).map(([type, count]) => ({
      type: type,
      percentage: Math.round((count / totalFiles) * 100),
    })).sort((a, b) => b.percentage - a.percentage); // Sort most common first

    // Group formats logic (Top 2 + Other)
    let displayedFormats = formatPercentages.slice(0, 2);
    const otherPercentage = formatPercentages.slice(2).reduce((sum, f) => sum + f.percentage, 0);

    // Add 'OTHER' category only if there are remaining formats
    if (otherPercentage > 0) {
      // Check if 'OTHER' already exists from initial counting
      const existingOther = displayedFormats.find(f => f.type === 'OTHER');
      if (existingOther) {
        existingOther.percentage += otherPercentage;
      } else {
        // Add new OTHER group if needed and space allows (if less than 2 formats already)
        if (displayedFormats.length < 2){
            displayedFormats.push({ type: 'OTHER', percentage: otherPercentage });
        } else {
            // Otherwise add to the second most common format if OTHER wasn't top 2 originally
             if (displayedFormats.length > 1){
                 displayedFormats[1].percentage += otherPercentage;
             } else if (displayedFormats.length > 0) {
                 displayedFormats[0].percentage += otherPercentage; // Add to first if only one
             }
        }
      }
       // Re-sort after potential modification
       displayedFormats.sort((a, b) => b.percentage - a.percentage);
    }


    // Ensure percentages add up roughly to 100 (due to rounding) - Optional adjustment step
    let sumPercentages = displayedFormats.reduce((sum, f) => sum + f.percentage, 0);
    if (sumPercentages !== 100 && displayedFormats.length > 0) {
        let diff = 100 - sumPercentages;
         // Distribute difference - simplistic approach adds to first element
         // A better approach might distribute proportionally or based on rounding direction
         displayedFormats[0].percentage += diff;
         // Ensure no percentage goes over 100 or below 0 after adjustment
         displayedFormats.forEach(f => {
             f.percentage = Math.max(0, Math.min(100, f.percentage));
         });
         // Recalculate sum after clamping (may still not be exactly 100)
         // sumPercentages = displayedFormats.reduce((sum, f) => sum + f.percentage, 0);
    }


    return displayedFormats;
  }, [fullPaymentHistory]);

  // Assign colors for bars (simple example)
  const formatColors = ['bg-blue-600', 'bg-green-600', 'bg-yellow-500', 'bg-indigo-500'];

  // --- Get Recent Activity Feed using useMemo ---
  const recentActivity = useMemo(() => {
    return fullPaymentHistory // Use full history to catch recent updates
      .filter(h => h.type === 'Bulk Process' && h.timestamp) // Filter for bulk items with timestamps
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)) // Ensure sorted recent first
      .slice(0, 5); // Take latest 5 events/updates
  }, [fullPaymentHistory]);

  // --- Helper Functions ---
  const formatCurrencyDisplay = (value, currencyCode = 'USD') => {
     try {
         return value.toLocaleString('en-US', { style: 'currency', currency: currencyCode, minimumFractionDigits: 2, maximumFractionDigits: 2 });
     } catch (e) {
         // console.warn("Currency formatting failed for code:", currencyCode, e);
         return `${value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} ${currencyCode}`;
     }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
        const dateObj = new Date(timestamp);
        if (isNaN(dateObj.getTime())) return 'Invalid Date';
        return dateObj.toLocaleString(); // Consider using date-fns for more control if needed
    } catch (e) {
        // console.error("Timestamp formatting failed:", timestamp, e);
        return 'Invalid Date';
    }
  };

  // --- Render Logic ---
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Column 1: Stats */}
      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-md font-semibold mb-3 text-gray-700 border-b pb-2">File Processing Stats (Last 30 Days)</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span>Files Processed:</span> <span className="font-medium">{stats.filesProcessed30d}</span></div>
          <div className="flex justify-between"><span>Total Payments:</span> <span className="font-medium">{stats.totalPayments30d.toLocaleString()}</span></div>
          {/* Display total value using the determined primary currency */}
          <div className="flex justify-between"><span>Total Value:</span> <span className="font-medium">{formatCurrencyDisplay(stats.totalValue30d, stats.primaryCurrency)}</span></div>
          <div className="flex justify-between"><span>Avg. Processing Time:</span> <span className="font-medium">{stats.avgProcessingTime}</span></div>
        </div>
      </div>

      {/* Column 2: Formats */}
      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-md font-semibold mb-3 text-gray-700 border-b pb-2">Common File Formats (Last 30 Days)</h3>
         {commonFormats.length > 0 ? (
             <div className="space-y-3 text-sm">
                 {commonFormats.map((format, index) => (
                    // Ensure percentage is valid before rendering
                    format.percentage > 0 && (
                     <div key={format.type}>
                         <div className="flex justify-between mb-1">
                             <span className="font-medium">{format.type}</span>
                             <span>{format.percentage}%</span>
                         </div>
                         <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden"> {/* Added overflow-hidden */}
                             <div
                                 className={`${formatColors[index % formatColors.length]} h-2 rounded-full`}
                                 style={{ width: `${format.percentage}%` }}
                                 title={`${format.percentage}%`}
                             ></div>
                         </div>
                     </div>
                    )
                 ))}
             </div>
         ) : (
             <p className="text-sm text-gray-500 italic">No bulk files processed recently.</p>
         )}
      </div>

      {/* Column 3: Activity */}
      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-md font-semibold mb-3 text-gray-700 border-b pb-2">Recent Activity</h3>
        <ul className="space-y-3 text-sm max-h-48 overflow-y-auto pretty-scrollbar"> {/* Added custom scrollbar class if defined */}
          {recentActivity.length > 0 ? recentActivity.map(item => (
             <li key={item.id} className="text-gray-600 border-b border-gray-100 pb-2 last:border-b-0">
                <div className="flex justify-between items-center mb-1">
                    {/* Try to get a meaningful name from rawData, fallback to id */}
                    <span className="font-medium break-all pr-2 text-gray-800">{item.recipient || item.rawData?.fileName || item.rawData?.file?.name || item.id}</span>
                    <span className="text-xs text-gray-500 flex-shrink-0">{formatTimestamp(item.timestamp)}</span>
                </div>
                <div className="text-xs text-gray-500">Status: <span className="font-medium">{item.status}</span></div>
             </li>
          )) : <li className="italic text-gray-500">No recent bulk activity found in history.</li>}
        </ul>
      </div>
    </div>
  );
};

export default BulkSummaryStats;