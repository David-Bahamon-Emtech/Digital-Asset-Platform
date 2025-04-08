// src/features/Payments/UploadBulkFileScreen.js
import React, { useState } from 'react';

// --- Component ---
// Expects 'assets' for source account selection, 'onBack' for navigation,
// and 'onBulkSubmit' (placeholder for actual processing logic later)
const UploadBulkFileScreen = ({ assets = [], onBack, onBulkSubmit }) => {

  // --- State ---
  const [selectedFile, setSelectedFile] = useState(null); // Stores simulated file info { name, size }
  const [fileType, setFileType] = useState('CSV'); // 'CSV', 'ISO20022', 'XML'
  const [sourceAccountId, setSourceAccountId] = useState(''); // Account to debit
  const [validationStatus, setValidationStatus] = useState('No file selected.');
  const [validationMessage, setValidationMessage] = useState(''); // More detailed message
  const [isValidated, setIsValidated] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // For simulated validation/processing

  // --- Handlers ---

  // Simulate selecting a file and validating it
  const handleFileSelectAndValidate = () => {
    if (isLoading) return;

    setIsLoading(true);
    setSelectedFile(null); // Reset previous file/validation
    setIsValidated(false);
    setValidationStatus('Selecting & Validating...');
    setValidationMessage('');

    // Simulate file selection and validation delay
    setTimeout(() => {
      // Simulate different outcomes
      const randomOutcome = Math.random();
      if (randomOutcome < 0.8) { // 80% success
        const dummySize = Math.floor(Math.random() * 50000) + 1000;
        const dummyPayments = Math.floor(Math.random() * 1000) + 50;
        const dummyValue = (Math.random() * 10000000) + 10000;
        const fileName = `bulk_${new Date().toISOString().split('T')[0]}.${fileType.toLowerCase()}`;

        setSelectedFile({ name: fileName, size: dummySize });
        setValidationStatus('Validated');
        setValidationMessage(`File contains ${dummyPayments} payments. Total value: ~$${dummyValue.toLocaleString(undefined, {maximumFractionDigits: 0})}`);
        setIsValidated(true);
      } else if (randomOutcome < 0.95) { // 15% validation error
         setSelectedFile({ name: `invalid_format.${fileType.toLowerCase()}`, size: Math.floor(Math.random() * 1000) + 100 });
         setValidationStatus('Validation Error');
         setValidationMessage('File format incorrect or critical data missing. Please check file specifications.');
         setIsValidated(false);
      } else { // 5% selection cancelled/failed
          setSelectedFile(null);
          setValidationStatus('File selection cancelled or failed.');
          setValidationMessage('');
          setIsValidated(false);
      }
      setIsLoading(false);
    }, 1500); // Simulate 1.5 seconds
  };

  // Simulate processing the validated file
  const handleProcessFile = () => {
     if (!isValidated || isLoading || !selectedFile || !sourceAccountId) {
         alert("Please select a source account and ensure the file is validated successfully.");
         return;
     }
     setIsLoading(true);
     setValidationStatus('Processing...');
     setValidationMessage(`Submitting ${selectedFile.name} for processing...`);

     setTimeout(() => {
         console.log('Simulating bulk file submission:', { file: selectedFile, type: fileType, sourceAccountId });
         // Call parent handler if it exists (placeholder for now)
         if (onBulkSubmit) {
             onBulkSubmit({ file: selectedFile, type: fileType, sourceAccountId });
         }
         alert(`${selectedFile.name} submitted for processing successfully!`);
         setIsLoading(false);
         onBack(); // Go back after submission
     }, 2000); // Simulate 2 seconds processing
  };


  // --- Render Logic ---
  return (
    <div className="bg-white p-6 rounded shadow max-w-3xl mx-auto"> {/* Adjusted max-width */}
      {/* Header */}
      <div className="flex justify-between items-center mb-6 border-b pb-3">
        <h1 className="text-2xl font-bold text-gray-800">Upload Bulk Payment File</h1>
        <button className="px-3 py-1 rounded text-white hover:opacity-90 bg-gray-800 text-sm" onClick={onBack}>
          Back to Bulk Dashboard
        </button>
      </div>

      <div className="space-y-6">
        {/* File Input Simulation */}
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Payment File</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="flex text-sm text-gray-600 justify-center">
                    <button
                        type="button"
                        className={`relative cursor-pointer bg-white rounded-md font-medium text-emtech-gold hover:text-yellow-700 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-emtech-gold ${isLoading ? 'opacity-50 cursor-wait' : ''}`}
                        onClick={handleFileSelectAndValidate}
                        disabled={isLoading}
                    >
                    <span>{isLoading ? 'Validating...' : (selectedFile ? 'Select another file' : 'Select a file to upload')}</span>
                    {/* In a real app, you'd have <input type="file" className="sr-only" /> */}
                    </button>
                    {!selectedFile && !isLoading && <p className="pl-1">or drag and drop</p>}
                </div>
                <p className="text-xs text-gray-500">CSV, ISO 20022 XML, or other supported formats</p>
                </div>
            </div>
        </div>

        {/* Selected File Info & Validation Status */}
        {selectedFile && (
            <div className={`p-3 rounded border text-sm ${
                validationStatus === 'Validated' ? 'bg-green-50 border-green-300 text-green-800' :
                validationStatus.includes('Error') ? 'bg-red-50 border-red-300 text-red-800' :
                'bg-blue-50 border-blue-300 text-blue-800' // For processing/other messages
            }`}>
                <p className="font-medium">{selectedFile.name} ({ (selectedFile.size / 1024).toFixed(1) } KB)</p>
                <p className="mt-1">{validationStatus}: {validationMessage}</p>
            </div>
        )}
        {!selectedFile && validationStatus !== 'No file selected.' && (
             <div className="p-3 rounded border text-sm bg-gray-100 border-gray-300 text-gray-700">
                 <p>{validationStatus}</p>
             </div>
        )}


        {/* Configuration (Only enable if file seems selected/validated) */}
        <div className={`space-y-4 ${!selectedFile ? 'opacity-50' : ''}`}>
            <div>
                <label htmlFor="bulk-fileType" className="block text-sm font-medium text-gray-700">File Type (Detected/Select)</label>
                <select
                    id="bulk-fileType"
                    className={`w-full p-2 border rounded bg-white text-sm mt-1 ${!selectedFile ? 'cursor-not-allowed' : ''}`}
                    value={fileType}
                    onChange={(e) => setFileType(e.target.value)}
                    disabled={!selectedFile || isLoading}
                >
                    <option>CSV</option>
                    <option>ISO20022</option>
                    <option>XML</option>
                    <option>ACH</option>
                </select>
            </div>
             <div>
                <label htmlFor="bulk-sourceAccount" className="block text-sm font-medium text-gray-700">Source Account for Debit <span className="text-red-600">*</span></label>
                <select
                    id="bulk-sourceAccount"
                    className={`w-full p-2 border rounded bg-white text-sm mt-1 ${!selectedFile ? 'cursor-not-allowed' : ''}`}
                    value={sourceAccountId}
                    onChange={(e) => setSourceAccountId(e.target.value)}
                    required
                    disabled={!selectedFile || isLoading}
                >
                    <option value="" disabled>-- Select Debit Account --</option>
                    {assets.map(asset => (
                    <option key={asset.id} value={asset.id}>
                        {asset.label} ({asset.balance.toLocaleString()} {asset.symbol})
                    </option>
                    ))}
                </select>
            </div>
        </div>

         {/* Action Button */}
         <div className="mt-8 flex justify-end">
            <button
                type="button"
                className="px-5 py-2 rounded text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleProcessFile}
                disabled={!isValidated || isLoading || !sourceAccountId}
            >
                {isLoading && validationStatus === 'Processing...' ? 'Processing...' : 'Process Payment File'}
            </button>
         </div>

      </div>
    </div>
  );
};

export default UploadBulkFileScreen;