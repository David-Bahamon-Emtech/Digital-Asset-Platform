import React from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Label
} from 'recharts';
import { format } from 'date-fns'; // Keep format if needed elsewhere, not used in tooltip directly now

// Helper to format large numbers on the Y-axis
const formatYAxisTick = (value) => {
    if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
    if (value >= 1e3) return `${(value / 1e3).toFixed(1)}k`;
    return value.toLocaleString();
};

// Custom Tooltip Component - Updated to show events
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    // Extract main data points (payload order might change, so find by dataKey)
    const circulationPayload = payload.find(p => p.dataKey === 'circulation');
    const reservePayload = payload.find(p => p.dataKey === 'reserve');
    const circulation = circulationPayload?.value || 0;
    const reserve = reservePayload?.value || 0;
    const total = circulation + reserve;
    // Extract events array from the payload (use the first payload entry)
    const events = payload[0]?.payload?.events;

    return (
      <div className="bg-white p-2 border rounded shadow text-xs max-w-xs">
        <p className="font-bold mb-1">{label}</p> {/* Label is the month */}
        {/* Circulation/Reserve Info - Use colors defined for bars */}
        <p style={{ color: '#3B82F6' }}>Circulation: {circulation.toLocaleString()}</p>
        <p style={{ color: '#A78BFA' }}>In Reserve: {reserve.toLocaleString()}</p>
        <p className="mt-1 pt-1 border-t">Total Issued: {total.toLocaleString()}</p>

        {/* Display Events for this month */}
        {events && events.length > 0 && (
            <div className="mt-2 pt-2 border-t">
                <p className="font-semibold mb-1">Events this month:</p>
                <ul className="list-disc list-inside space-y-1">
                    {events.map((event, index) => {
                        let eventColor = 'text-gray-700';
                        if (event.actionType === 'Mint' || event.actionType === 'Issue' || event.actionType === 'Swap In') { eventColor = 'text-green-600'; }
                        else if (event.actionType === 'Burn' || event.actionType === 'Redeem' || event.actionType === 'Swap Out') { eventColor = 'text-red-600'; }
                        const amountMatch = event.details?.match(/([0-9,]+(\.\d+)?)\s+/);
                        const amountStr = amountMatch ? amountMatch[1] : '';
                        return ( <li key={event.id || index} className={eventColor}> {event.actionType}: {amountStr} </li> );
                    })}
                </ul>
            </div>
        )}
      </div>
    );
  }
  return null;
};


/**
 * MonthlyStackedBarChart Component
 * Displays monthly circulation vs. reserve data as a stacked bar chart.
 * @param {object} props - Component props.
 * @param {Array<object>} props.data - Array of monthly data points, e.g., [{ month: '2024-01', circulation: 1000, reserve: 500, events: [...] }, ...]
 * @param {string} props.assetSymbol - The symbol of the asset being displayed.
 */
const MonthlyStackedBarChart = ({ data = [], assetSymbol = '' }) => {

  if (!data || data.length === 0) {
    return <p className="text-center text-gray-500 italic h-[250px] flex items-center justify-center">Monthly data not available.</p>;
  }

  return (
    <div className="h-[250px] w-full">
       <h4 className="text-sm font-medium text-gray-500 mb-2">Monthly Circulation vs. Reserve ({assetSymbol})</h4>
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 10, left: 25, bottom: 5 }} >
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0"/>
                <XAxis dataKey="month" tick={{ fontSize: 10 }} angle={0} />
                <YAxis tickFormatter={formatYAxisTick} tick={{ fontSize: 10 }} width={55} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(200,200,200,0.1)' }}/>
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} verticalAlign="bottom" align="center" />
                {/* *** SWAPPED ORDER: Render Reserve bar first *** */}
                <Bar
                    dataKey="reserve"
                    stackId="a" // Same stackId
                    fill="#A78BFA" // Violet-400
                    name="In Reserve"
                    radius={[4, 4, 0, 0]} // Apply radius here, might be hidden by circ bar
                 />
                 <Bar
                    dataKey="circulation"
                    stackId="a" // Both bars need the same stackId to stack
                    fill="#3B82F6" // Blue-500
                    name="In Circulation"
                    radius={[4, 4, 0, 0]} // Apply radius here too
                 />
            </BarChart>
        </ResponsiveContainer>
    </div>
  );
};

export default MonthlyStackedBarChart;
