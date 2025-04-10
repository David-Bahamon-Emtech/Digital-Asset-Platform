// src/utils/dummyData.js

/**
 * Generates a list of dummy client accounts for simulation purposes.
 * Includes various fiat currency accounts and specific USDC/USDT wallets.
 * Originally defined in App.js / CreatePaymentScreen.js
 * @param {number} count - The number of random fiat accounts to generate.
 * @returns {Array<Object>} - An array of dummy client account objects.
 */
export const generateDummyClientAccounts = (count = 30) => {
    const accounts = [];
    const currencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'SGD', 'JPY', 'CHF'];
    for (let i = 1; i <= count; i++) {
        const currency = currencies[i % currencies.length];
        // Generate a plausible-looking account number (e.g., 8 digits)
        const accountNumber = String(Math.floor(Math.random() * 90000000) + 10000000);
        // Generate a balance between ~1M and ~10M
        const balance = Math.floor(Math.random() * 9000000) + 1000001;
        const label = `Client Account ${accountNumber}`; // Updated label
        accounts.push({
            id: `client-${i}-${accountNumber.slice(-4)}`, // More unique ID
            label: label,
            balance: balance,
            symbol: currency,
            // Add isInstitutional flag
            isInstitutional: false,
            // Add blockchain placeholder if needed, consistent with generate function
            blockchain: 'N/A (Client Account)' // Explicitly mark non-blockchain
        });
    }
    // Add specific client token wallets
    const usdcAccountNumber = String(Math.floor(Math.random() * 90000000) + 10000000);
    const usdtAccountNumber = String(Math.floor(Math.random() * 90000000) + 10000000);
    accounts.push({
        id: `client-usdc-${usdcAccountNumber.slice(-4)}`,
        label: `Client Account ${usdcAccountNumber}`, // Consistent label
        balance: 1500000, symbol: 'USDC',
        blockchain: 'Stellar', // Keep specific blockchain for these token wallets
        isInstitutional: false // Mark as client account
    });
    accounts.push({
        id: `client-usdt-${usdtAccountNumber.slice(-4)}`,
        label: `Client Account ${usdtAccountNumber}`, // Consistent label
        balance: 1850000, symbol: 'USDT',
        blockchain: 'Ethereum', // Keep specific blockchain for these token wallets
        isInstitutional: false // Mark as client account
    });
    console.log(`Generated ${accounts.length} dummy client accounts.`);
    return accounts;
};

// Add other data generation utilities here if needed in the future