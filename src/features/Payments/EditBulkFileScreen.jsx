import React, { useState, useEffect } from 'react';
// No context needed if updates are handled by parent via onUpdateSubmit prop

// Placeholder screen for editing active bulk file details
const EditBulkFileScreen = ({ initialData, onBack, onUpdateSubmit }) => {

  // State for editable fields
  const [batchLabel, setBatchLabel] = useState('');
  const [batchReference, setBatchReference] = useState('');
  const [paymentType, setPaymentType] = useState(''); // Example: If payment type is editable category
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); // Add submitting state

  // Populate state from initialData when component mounts or initialData changes
  useEffect(() => {
    if (initialData) {
      setBatchLabel(initialData.batchLabel || '');
      setBatchReference(initialData.batchReference || '');
      setPaymentType(initialData.paymentType || 'Bulk'); // Use existing or default

      // Existing schedule logic
      if (initialData.scheduleTimestamp) {
          try {
              const d = new Date(initialData.scheduleTimestamp);
              if (!isNaN(d.getTime())) {
                  setScheduleDate(d.toISOString().split('T')[0]);
                  // Format time correctly (HH:MM)
                  const hours = d.getHours().toString().padStart(2, '0');
                  const minutes = d.getMinutes().toString().padStart(2, '0');
                  setScheduleTime(`${hours}:${minutes}`);
              } else {
                 setScheduleDate(''); setScheduleTime(''); // Reset if invalid date
              }
          } catch (e) {
             console.error("Error parsing schedule date", e);
             setScheduleDate(''); setScheduleTime('');
          }
      } else {
          setScheduleDate('');
          setScheduleTime('');
      }
    }
  }, [initialData]); // Rerun if initialData changes

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    // Combine date and time for a new timestamp (Handle potential invalid date/time)
    let newScheduleTimestamp = null;
    if (scheduleDate && scheduleTime) {
      try {
        // Construct date string in ISO format (safer across timezones if treated as local initially)
        const dateString = `${scheduleDate}T${scheduleTime}:00`; // Assume local time input for now
        const potentialDate = new Date(dateString);
        if (!isNaN(potentialDate.getTime())) {
             newScheduleTimestamp = potentialDate.toISOString(); // Convert valid date to ISO string (UTC)
        } else {
             console.warn("Invalid date/time combination:", scheduleDate, scheduleTime);
             // Optionally set an error state here
        }
      } catch (err) { console.error("Error creating schedule timestamp:", err); }
    } else if (!scheduleDate && !scheduleTime) {
        // Clear schedule if both are empty
        newScheduleTimestamp = null;
    }
    // If only one is set, it might be an error state or keep existing? Current logic clears if both aren't set.


    // Prepare the updates object with only the fields that changed or are editable
    const updates = {
       batchLabel: batchLabel.trim(),
       batchReference: batchReference.trim(),
       paymentType: paymentType, // Assuming this is an editable category
       scheduleTimestamp: newScheduleTimestamp,
       // Add other editable fields here if needed
    };

     // Call parent handler to dispatch update
     if (typeof onUpdateSubmit === 'function') {
         onUpdateSubmit(initialData.id, updates); // Pass ID and the updates object
     } else {
         console.error("onUpdateSubmit handler is missing!");
         alert("Error: Could not save changes.");
         setIsSubmitting(false); // Reset submitting state on error
     }
     // Parent handler (handleUpdateBulkDetails) should navigate back
  };

  // Basic loading/error state if initialData isn't provided
  if (!initialData) {
    return (
        <div className="bg-white p-6 rounded shadow max-w-2xl mx-auto text-center">
             <p className="text-red-600 font-medium mb-4">Error: No bulk file data provided for editing.</p>
             <button type="button" onClick={onBack} className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-50">
                 Back to Bulk Dashboard
             </button>
         </div>
    );
  }

  // --- Render Logic ---
  return (
    <div className="bg-white p-6 rounded shadow max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6 border-b pb-3">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Edit Active Bulk File</h1>
        <button onClick={onBack} className="px-3 py-1 rounded text-white hover:opacity-90 bg-gray-800 text-sm" disabled={isSubmitting}>
          Back
        </button>
      </div>

       {/* Display some read-only info */}
       <div className="mb-6 p-4 bg-gray-100 rounded border border-gray-200 text-sm space-y-1">
           <p><strong>File Name:</strong> <span className="font-medium text-gray-700 break-all">{initialData.fileName}</span></p>
           <p><strong>File Type:</strong> <span className="font-medium text-gray-700">{initialData.fileType}</span></p>
           <p><strong>Source Account:</strong> <span className="font-medium text-gray-700">{initialData.sourceAccountId}</span></p>
           <p><strong>Total Value (Est.):</strong> <span className="font-medium text-gray-700">{initialData.totalValue?.toLocaleString(undefined, {style:'currency', currency: initialData.currency || 'USD'})}</span></p>
           <p><strong>Status:</strong> <span className="font-medium text-gray-700">{initialData.status}</span></p>
       </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Editable Fields */}
        <div>
          <label htmlFor="batchLabel" className="block text-sm font-medium text-gray-700">Batch Label</label>
          <input
            type="text"
            id="batchLabel"
            value={batchLabel}
            onChange={(e) => setBatchLabel(e.target.value)}
            className="mt-1 w-full p-2 border rounded text-sm border-gray-300 shadow-sm focus:ring-emtech-gold focus:border-emtech-gold"
            placeholder="e.g., Q1 Vendor Payments"
          />
        </div>

        <div>
          <label htmlFor="paymentType" className="block text-sm font-medium text-gray-700">Payment Type/Category</label>
          <select
              id="paymentType"
              value={paymentType}
              onChange={(e) => setPaymentType(e.target.value)}
              className="mt-1 w-full p-2 border rounded bg-white text-sm border-gray-300 shadow-sm focus:ring-emtech-gold focus:border-emtech-gold"
          >
              {/* Add relevant options for bulk payment categories */}
              <option value="Bulk">Bulk (Generic)</option>
              <option value="Payroll">Payroll</option>
              <option value="Vendor Payments">Vendor Payments</option>
              <option value="FX Settlement">FX Settlement</option>
              <option value="Expense Reimbursement">Expense Reimbursement</option>
              <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label htmlFor="batchReference" className="block text-sm font-medium text-gray-700">Batch Reference/Notes (Optional)</label>
          <textarea
            id="batchReference"
            rows="2"
            value={batchReference}
            onChange={(e) => setBatchReference(e.target.value)}
            className="mt-1 w-full p-2 border rounded text-sm border-gray-300 shadow-sm focus:ring-emtech-gold focus:border-emtech-gold"
            placeholder="Internal reference code or notes..."
          />
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-700">Schedule Processing (Optional)</label>
            <div className="flex flex-col sm:flex-row sm:space-x-2 mt-1">
                <input
                    type="date"
                    aria-label="Schedule Date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className="flex-1 mb-2 sm:mb-0 p-2 border rounded text-sm border-gray-300 focus:ring-emtech-gold focus:border-emtech-gold"
                    min={new Date().toISOString().split('T')[0]} // Prevent scheduling in the past
                />
                <input
                    type="time"
                    aria-label="Schedule Time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className={`flex-1 p-2 border rounded text-sm border-gray-300 focus:ring-emtech-gold focus:border-emtech-gold ${!scheduleDate ? 'opacity-50 cursor-not-allowed' : ''}`} // Disable if no date
                    disabled={!scheduleDate} // Only enable time if date is set
                />
            </div>
            <p className="text-xs text-gray-500 mt-1">Leave blank or clear both for immediate processing (if applicable based on status).</p>
        </div>

         {/* Add other editable fields here if necessary */}

        <div className="pt-5 flex justify-end space-x-3 border-t mt-6">
           <button
              type="button"
              onClick={onBack}
              className="px-4 py-2 rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
              disabled={isSubmitting}
           >
               Cancel
           </button>
           <button
              type="submit"
              className={`px-4 py-2 rounded border border-transparent text-white bg-blue-600 hover:bg-blue-700 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isSubmitting ? 'opacity-50 cursor-wait' : ''}`}
              disabled={isSubmitting}
           >
               {isSubmitting ? 'Saving...' : 'Save Changes'}
           </button>
        </div>
      </form>
    </div>
  );
};

export default EditBulkFileScreen;