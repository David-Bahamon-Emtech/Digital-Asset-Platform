// src/utils/dummyData.js

/**
 * Generates a list of dummy client accounts for simulation purposes.
 * Includes various fiat currency accounts and specific USDC/USDT wallets.
 * Adds metadata fields: assetClass, physicality, custodyType, price.
 *
 * @param {number} count - The number of random fiat accounts to generate.
 * @returns {Array<Object>} - An array of dummy client account objects with enriched metadata.
 */
export const generateDummyClientAccounts = (count = 30) => {
    const accounts = [];
    const currencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'SGD', 'JPY', 'CHF'];
    // Simple placeholder exchange rates relative to USD for dummy price calculation
    const exchangeRates = {
        'USD': 1.00, 'EUR': 1.08, 'GBP': 1.25, 'CAD': 0.75,
        'AUD': 0.66, 'SGD': 0.74, 'JPY': 0.0067, 'CHF': 1.10
    };

    // Generate random fiat accounts
    for (let i = 1; i <= count; i++) {
        const currency = currencies[i % currencies.length];
        const accountNumber = String(Math.floor(Math.random() * 90000000) + 10000000);
        const balance = Math.floor(Math.random() * 9000000) + 1000001;
        const label = `Client Account ${accountNumber}`;

        accounts.push({
            // --- Existing Fields ---
            id: `client-${i}-${accountNumber.slice(-4)}`,
            label: label,
            balance: balance,
            symbol: currency,
            description: `Client ${currency} holding account.`, // Added basic description
            supply: 'N/A', // Fiat accounts don't have supply
            blockchain: 'N/A (Client Account)',
            isWizardIssued: false,
            isInstitutional: false,
            // --- New Metadata Fields ---
            assetClass: 'FiatCurrency',
            physicality: 'Digital', // Represents digital record of fiat
            custodyType: 'External', // Assume client fiat held externally at their bank
            price: exchangeRates[currency] || 1.00, // Price relative to USD (for demo)
        });
    }

    // Add specific client token wallets
    const usdcAccountNumber = String(Math.floor(Math.random() * 90000000) + 10000000);
    const usdtAccountNumber = String(Math.floor(Math.random() * 90000000) + 10000000);

    accounts.push({
        // --- Existing Fields ---
        id: `client-usdc-${usdcAccountNumber.slice(-4)}`,
        label: `Client Account ${usdcAccountNumber}`,
        balance: 1500000,
        symbol: 'USDC',
        description: `Client USDC holding account.`, // Added basic description
        supply: 'N/A', // Not relevant for holding account
        blockchain: 'Stellar',
        isWizardIssued: false,
        isInstitutional: false,
        // --- New Metadata Fields ---
        assetClass: 'Stablecoin',
        physicality: 'Digital',
        custodyType: 'Warm', // Assume platform holds client crypto in warm storage
        price: 1.00,
    });

    accounts.push({
        // --- Existing Fields ---
        id: `client-usdt-${usdtAccountNumber.slice(-4)}`,
        label: `Client Account ${usdtAccountNumber}`,
        balance: 1850000,
        symbol: 'USDT',
        description: `Client USDT holding account.`, // Added basic description
        supply: 'N/A', // Not relevant for holding account
        blockchain: 'Ethereum',
        isWizardIssued: false,
        isInstitutional: false,
        // --- New Metadata Fields ---
        assetClass: 'Stablecoin',
        physicality: 'Digital',
        custodyType: 'Warm', // Assume platform holds client crypto in warm storage
        price: 1.00,
    });

    console.log(`Generated ${accounts.length} dummy client accounts with enriched metadata.`);
    return accounts;
};

// Add other data generation utilities here if needed in the future
