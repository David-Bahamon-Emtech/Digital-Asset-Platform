# Digital-Asset-Platform V0.9

A React-based front-end demonstration platform for managing digital assets and simulating various payment flows. Showcases token lifecycle management (issuance, minting, burning, redeeming, reserves) and payment operations (cross-border, high-value transfers, bulk payments). Built using React and Tailwind CSS.

M## Major Changes from V0.8

This version significantly enhances the **Account Management** section, transforming it from placeholders into a more interactive and feature-rich module. Key architectural refinements include centralizing client account data within `AssetsContext` for application-wide consistency.

**Account Management - Detailed Enhancements:**

The Account Management module, orchestrated by `AccountManagementScreen.js`, now provides three distinct sub-sections:

1.  **Internal Account Management (`InternalAccountManagementView.js`):**
    * **User Administration:**
        * Displays a list of internal platform users (`UserList.js`) with their name, platform role, and status.
        * Supports inviting new users and editing existing users through a comprehensive modal (`EditUserModal.js`).
        * The modal allows management of:
            * User's Name, Platform Role (e.g., Administrator, Treasurer), and Status (Active/Inactive).
            * Associated Blockchain Accounts: Add/remove accounts across different blockchains (Hedera, Ethereum, etc.).
            * (Simulated) KYC/AML Management: Grant/revoke KYC status, set/clear AML flags.
            * (Simulated) MFA status display.
    * **Multi-Signature Capabilities (Simulated):**
        * **Configuration (`MultiSigConfigurationView.js`):** View existing multi-signature groups and create new configurations, specifying name, blockchain, signers (from platform users with relevant blockchain accounts), and threshold.
        * **Transaction Signing (`MultiSigSigningView.js`):** View pending multi-signature transactions requiring the current (simulated) user's signature and simulate the signing process.
    * **Placeholders:**
        * API Key Management (`ApiKeyManagementView.js`): Displays a placeholder or a static list of dummy system API keys.
        * Security Settings (`SecuritySettingsView.js`): Shows static text for password policy and a non-functional MFA toggle.

2.  **Client Account Management (`ClientAccountManagementView.js`):**
    * **Data Source:** Client accounts (non-institutional fiat and stablecoin accounts) are now sourced globally from `AssetsContext` to ensure data consistency across the application. `AssetsContext` initializes these accounts with `simulatedStatus` and `clientName`.
    * **Dynamic Account Listing (`ClientAccountListTable.js`):**
        * Displays a comprehensive table of client accounts.
        * Features client-side sorting by various columns (Client Name, Balance, Currency, etc.).
        * Includes dropdown filters for Currency, Account Type (`assetClass`), and Status (`simulatedStatus`).
    * **Detailed Account View (`ClientAccountDetailModal.js`):**
        * Opens when "View Details" is clicked for an account.
        * Displays detailed account information, dummy client contact info, and a list of simulated recent transactions.
        * **Simulated Banker Actions:**
            * "Generate Statement": Opens a separate `StatementModal.js` displaying a simulated account statement with a transaction list, period, and balances.
            * "Place Hold" / "Remove Hold": Toggles the account's `simulatedStatus` between 'Active' and 'Frozen'.
            * "Flag for Review" / "Clear Flag": Toggles the account's `simulatedStatus` between 'Active' and 'Review'.
            * "Edit Account Nickname": Allows the banker to modify the account's `label` (nickname).
        * **Display Elements:** Includes non-functional sections for "Internal Banker Notes" (textarea) and "Linked Services" (checkboxes).
    * **Global State Updates:** All changes to client account status or nickname are dispatched to `AssetsContext` using the `UPDATE_ASSET_PROPERTY` action, ensuring global consistency.

3.  **3rd Party Account Management (`ThirdPartyAccountManagementView.js`):**
    * **Dynamic Application List:**
        * Manages a list of connected third-party applications (e.g., external services, partners) using local component state.
        * Displays application name, description, status, connected date, a partially masked API key, and granted permissions.
        * Features an "Active/Inactive" toggle for each application.
    * **Connect New Applications (`ConnectThirdPartyAppModal.js`):**
        * A modal form allows administrators to "connect" new third-party applications.
        * Inputs for Application Name and Description.
        * A comprehensive, categorized list of selectable permissions (e.g., Compliance, KYC/AML, Treasury, Payments access scopes).
        * Generates a dummy API key upon connection.
    * **Manage Permissions (`ManagePermissionsModal.js`):**
        * Allows editing the permissions for an existing connected application.
        * Displays current permissions and allows modification through checkboxes.
    * **Simulated API Key Management:**
        * "Rotate Key" button for each application simulates generating a new dummy API key.
    * **Revoke Access:** Allows removing a connected application from the list (simulated).

Existing features like Token Management, Payments, Custody, Treasury, and Compliance Center remain as described previously, with the understanding that client account data used in sections like Payments will now be sourced consistently from `AssetsContext`.

## Features

### Token Management

Governed by `TokenDashboard.js`, using `AssetsContext` for state and `TokenHistoryContext` for logging.

* **Dashboard Overview:**
    * Provides an overview of managed token assets (wizard-issued or specific predefined types like `ACP`, `MMFUSD`, `XAGC`, `WTOIL`, `VCC`).
    * Includes `TokenMetricsDashboard` showing aggregate metrics, reserve ratios, and a monthly circulation/reserve chart.
* **Detailed Asset View (`AssetDetailView.js`):**
    * Displays details for individual assets.
    * Adapts content presentation based on whether the token is wizard-issued or a predefined type.
* **Workflow: New Token Issuance (`TokenIssuanceWizard.js`):**
    * A multi-step wizard for creating new token types:
        * **Define Token Details:** Name, Symbol, Blockchain, Type (RWA, Capital Asset, Currency + Subtypes).
        * **Configure Supply:** Initial supply, Finite/Infinite, Decimals, Metadata, Market Value.
        * **Configure Reserves (if asset-backed):** Select backing method (Bank, Smart Contract, Custodian, On-Chain Wallet) and connect/verify details.
        * **Configure Permissions & Features:** KYC requirements (Levels), Fee Schedules (Percentage/Flat, Recipient Allocation), Pausable status, Fungibility, Expiration Date, Role Assignments (Minter, Burner, Pauser, etc.).
        * **Specify Regulatory Information:** Jurisdiction, Regulator.
        * **Define Token Custody:** Arrangement (Self vs. Third-Party).
    * Includes a simulated multi-step approval workflow (Compliance, Management).
* **Workflow: Mint Existing Tokens (`MintExistingToken.js`):**
    * Increases `totalSupplyIssued` for existing finite tokens.
    * Updates reserve data (simulated check).
    * *Does not* directly increase circulating supply (`balance`).
    * Includes simulated Treasury approval.
* **Workflow: Burn Tokens (`BurnTokenScreen.js`):**
    * Decreases `totalSupplyIssued` for existing finite tokens.
    * Updates reserve data.
    * *Does not* directly decrease circulating supply (`balance`).
    * Includes simulated Compliance & Treasury approval.
* **Workflow: Redeem Tokens (`RedeemTokenScreen.js`):**
    * Decreases *both* circulating supply (`balance`) and `totalSupplyIssued`.
    * Allows specifying payout currency (for eligible types) or redeeming for underlying value.
    * Includes simulated multi-step approval and optional smart contract execution simulation.
* **Workflow: Swap Tokens (`SwapTokenScreen.js`):**
    * Allows swapping between Treasury assets and platform-issued tokens.
    * Affects circulating `balance`.
    * Includes simulated multi-step approval and optional smart contract execution simulation.
* **Reserve Management (`ReserveManagementScreen.js`):**
    * Displays dynamic reserve data from `AssetsContext` (Total Issued, Circulation, Ratio, Composition, Accounts).
    * Allows configuration of reserve ratio alert thresholds.
* **Pause/Unpause Functionality:**
    * Simulated functionality for wizard-issued tokens via `AssetDetailView.js` workflow.
    * Includes simulated Pauser Role approval.
* **Token History Log:**
    * Managed via `TokenHistoryContext`.
    * Detailed view available in a modal (`HistoryDetailModal.js`).

* **Payments:** Orchestrated by `PaymentsDashboard.js`, utilizing contexts (`PaymentHistoryContext`, `TemplatesContext`, `RecurringPaymentsContext`, `ActiveBulkContext`) for state.
    * Central dashboard with tab navigation for Cross-Border, High-Value, and Bulk payments.
    * Dedicated dashboard views (`CrossBorderDashboardView.js`, `HighValueDashboardView.js`, `BulkDashboardView.js`) for each payment category displaying relevant metrics (placeholders) and recent history via `PaymentHistoryTable`.
    * Comprehensive Payment Creation screen (`CreatePaymentScreen.js`) supporting:
        * Payment Origins: Institutional, Client.
        * Payment Types: On-Chain, Traditional, Internal Transfer.
        * Detailed fee and FX rate calculation previews.
        * Simulated Compliance check and 2FA workflow for final submission.
    * Dedicated screen for initiating High-Value Transfers (HVT) (`CreateHighValueTransferScreen.js`) with a multi-step process and specific HVT policy rules.
    * HVT Authorization screen (`AuthorizeHVTScreen.js`) for reviewing and approving/rejecting pending HVTs (individual or batch), featuring a simulated login gate.
    * Detailed view (`ViewTransferDetailsScreen.js`) for individual HVT records.
    * Bulk Payment file upload screen (`UploadBulkFileScreen.js`) with simulated validation and processing, submitting files to the active queue (`ActiveBulkContext`).
    * Active Bulk File management (`BulkDashboardView.js` integrating `ActiveBulkFilesTable.js`): View active/processing bulk files, view details (`ActiveBulkDetailModal.js`), edit schedule/metadata (`EditBulkFileScreen.js`), and cancel/delete files. Includes summary stats (`BulkSummaryStats.js`).
    * Bulk Payment Template creation (`CreateBulkTemplateScreen.js`): Define reusable templates for bulk files, including file format, field mappings, validation rules, and processing options.
    * Payment Template management (`ViewTemplatesScreen.js`): View, Filter, Search, Create/Edit (`CreateEditTemplateModal.js`), Delete, and Use templates for new single payments.
    * Recurring Payment management (`ManageRecurringPaymentsScreen.js`): View List/Calendar, Setup/Edit (`RecurringPaymentModal.js`

  * **Custody Management:** Orchestrated by `CustodyDashboard.js`, using `AssetsContext` for asset data and local state for logs/approvals.
    * Dashboard overview displaying aggregated values and counts for Physical, Digital (Hot/Warm), and Cold storage tiers via `VaultTypeSummaryCard`.
    * Recent Vault Operations log display using `VaultOperationsLogTable`.
    * Vault Analytics section (`VaultAnalytics.js`) showing asset allocation (calculated from `AssetsContext`) and static KPIs.
    * Quick Actions section (`VaultQuickActions.js`) for initiating Deposit, Withdrawal, Audit, and Report generation.
    * Navigation to detailed views/forms:
        * `CustodyReporting.js`: Generate custody reports (form based on old UI).
        * `ApprovalQueue.js`: Manage pending custody approvals (displays requests, handles approve/reject actions which update logs and potentially `AssetsContext`).
        * `ColdStorageView.js`: View assets in Cold Storage; includes form to initiate transfers out (triggers approval request).
        * `PhysicalVaultsView.js`: View assets in Physical Vaults; includes action to request audits.
        * `DigitalVaultsView.js`: View assets in Digital Vaults (Hot/Warm); includes action to initiate rebalancing transfers (triggers approval request).
        * `InitiateDepositForm.js`: Form to record new deposits (updates `AssetsContext` and logs).
        * `RequestWithdrawalForm.js`: Form to request withdrawals (adds item to approval queue and logs).
        * `ScheduleAuditForm.js`: Form to schedule audits (adds entry to logs).
        * `FullOperationsLogView.js`: View the complete operations log with basic filtering.

* **Treasury Management:** Orchestrated by `TreasuryDashboard.js`, using `AssetsContext` and `AssetOrdersContext`.
    * Dashboard overview of core treasury assets (e.g., USDC, USDT, T-BOND, e-Cedi, D-EUR) and key actions.
    * Workflow for redeeming platform-issued tokens (`RedeemTokenScreen.js`) for underlying value or specified fiat currency, including simulated approval and smart contract execution.
    * Workflow for swapping between treasury assets and platform-issued tokens (`SwapTokenScreen.js`), affecting circulating balances and reserves, including simulated approval and smart contract execution.
    * Asset Order Management:
        * View list of asset orders (`AssetOrdersListView.js`), currently focused on *Sales* of platform-issued tokens (debiting from Reserve). Includes filtering and quick approve/reject actions.
        * Create new asset orders (`CreateAssetOrderScreen.js`), currently supporting *Sales* of platform-issued tokens (specifying asset, amount, rate, payment asset, and accounts). Submits orders to `AssetOrdersContext` with 'Pending Approval' status.
        * View detailed information for a specific asset order in a modal (`AssetOrderDetailModal.js`), including dummy approval/status history.
    * Detailed view for core treasury 
    
* **Account Management:** 
    Orchestrated by `AccountManagementScreen.js`. This component provides navigation to three main sub-views:
    * **`InternalAccountManagementView.js`**:
    * Manages internal platform users (`UserList.js`, `EditUserModal.js`).
        * User details: Name, Platform Role, Status.
        * Associated Blockchain Accounts management.
        * Simulated KYC/AML status updates.
        * Simulated MFA status display.
    * Manages Multi-Signature configurations and signing (simulated) (`MultiSigConfigurationView.js`, `MultiSigSigningView.js`).
    * Placeholder for API Key Management (`ApiKeyManagementView.js`).
    * Placeholder for Security Settings (`SecuritySettingsView.js`).
    * **`ClientAccountManagementView.js`**:
        * Displays and manages client accounts sourced globally from `AssetsContext`.
        * Features a dynamic table (`ClientAccountListTable.js`) with sorting and dropdown filters (Currency, Account Type, Status).
        * Provides a detailed view modal (`ClientAccountDetailModal.js`) for individual accounts, showing:
            * Comprehensive account details.
            * Simulated recent transaction history.
            * Dummy client contact information.
            * Simulated actions: Generate Statement (opens `StatementModal.js`), Place/Remove Hold, Flag/Clear Flag, Edit Account Nickname.
            * Display for Internal Banker Notes and Linked Services.
        * All client account property changes (status, nickname) are dispatched to `AssetsContext`.
* **`ThirdPartyAccountManagementView.js`**:
        * Manages connections to external applications using local component state.
        * Displays a list of connected apps with status toggles, API key info, and permissions.
        * Modal (`ConnectThirdPartyAppModal.js`) to connect new applications with granular, categorized permission selection.
        * Modal (`ManagePermissionsModal.js`) to edit permissions for existing applications.
        * Simulated API key rotation and access revocation.

* **Compliance Center:** *(Placeholder - Needs update)*
    * Transaction Monitoring configuration and oversight.
    * KYC/AML Process management and review.
    * Risk Management configuration (Limits, Counterparty Risk).
    * Regulatory Reporting generation (SARs, etc.).
    * Alerts & Case Management for compliance events.
    * Sanctions Screening configuration and review.

* **Common UI:**
    * Consistent layout with a sidebar navigation.
    * Reusable modal dialogs for details (Payment History, Token History), creation/editing (Templates, Recurring Payments).
    * Reusable Payment History table component used across dashboards.
    * Themed styling using Tailwind CSS and custom CSS variables.

## Tech Stack

* **Frontend Library:** React.js
* **State Management:** React Context API
* **Styling:** Tailwind CSS
* **Language:** JavaScript (ES6+)
* **Date Utility:** `date-fns`
* **Calendar:** `react-big-calendar` (for Recurring Payments view)
* **Charts:** `recharts` (for Token Metrics)

## File Breakdown

**Core Application:**

* `src/App.js`: The root component. Manages top-level state (`assets`, `paymentHistory` passed down from here) and renders the main `Layout`. Acts as the primary router between major features (Payments, Token Management). Initializes data (combining hardcoded and dummy data).
* `src/App.css`: Contains default CSS, likely including the base styles from Create React App and potentially global custom styles.

**Reusable Components:**
* `src/components/Layout/Layout.js`: Defines the main application structure (Sidebar + Content Area).
* `src/components/Sidebar/Sidebar.js`: Renders the navigation sidebar with links and icons.
* `src/components/Logo/EmtechLogo.js` (Inferred): Simple component to display the company logo.
* `src/features/Payments/PaymentHistoryTable.js`: Reusable table for displaying payment history entries.
* `src/features/Payments/PaymentHistoryDetailModal.js`: Modal dialog for showing detailed payment history.
* `src/features/TokenManagement/HistoryDetailModal.js`: Modal dialog for showing generic token action history details.
* `src/features/Payments/CreateEditTemplateModal.js`: Modal dialog with a form for creating/editing single payment templates.
* `src/features/Payments/RecurringPaymentModal.js`: Modal dialog with a form for setting up/editing recurring payments.
* `src/features/Payments/ActiveBulkDetailModal.js`: Modal dialog for showing details of an active bulk payment file.
* `src/features/Treasury/AssetOrderDetailModal.js`: Modal dialog for showing detailed asset order information.
* `src/features/Custody/VaultOperationsLogTable.js`: Reusable table for displaying custody operations log entries.
* `src/features/Custody/VaultTypeSummaryCard.js`: Reusable card for displaying summary info for vault types (Physical, Digital, Cold).
* `src/features/Custody/VaultAnalytics.js`: Reusable component displaying custody asset allocation charts and KPIs.
* `src/features/Custody/VaultQuickActions.js`: Reusable component displaying common custody action buttons.
* `src/features/TokenManagement/MonthlyStackedBarChart.js`: Reusable chart component (using `recharts`) for displaying monthly stacked bar data (e.g., circulation vs. reserve).
* `src/features/Payments/OnChainPaymentFields.js`: Reusable component containing form fields specific to on-chain payments.
* `src/features/Payments/TraditionalPaymentFields.js`: Reusable component containing form fields specific to traditional payments.


**Utilities & Data:**
* `src/utils/displayUtils.js`: Contains helper functions for formatting UI elements (rendering errors, status badges, currency, numbers, booleans).
* `src/utils/dummyData.js`: Contains a function (`generateDummyClientAccounts`) to create sample client account data with enriched metadata.
* `src/utils/metricsData.js`: Provides detailed dummy reserve data (`detailedDummyReserveData`) and functions for calculating reserve composition, alert thresholds, and generating circulation history for Token Management.
* `src/data/initialData.js`: Provides initial static data, including predefined institutional assets, mappings for asset/blockchain logos, sample entity names, and hardcoded asset details.
* `src/data/mockCustodyData.js`: Provides dummy data for the Custody feature's operations log and initial pending approvals queue.
* `src/features/Payments/data/paymentConstants.js`: Centralizes constants (dropdown lists, rates, fees) and extensive dummy 

**Configuration:**

* `tailwind.config.js`: Configures the Tailwind CSS framework, defining content paths and extending the theme with custom colors linked to CSS variables (e.g., `sidebar-bg`, `emtech-gold`).

## Getting Started
 
 This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).
 
 ### Prerequisites
 
 * Node.js (which includes npm) or Yarn installed.
 
 ### Installation
 
 1.  Clone the repository (if applicable).
 2.  Navigate to the project directory in your terminal.
 3.  Install dependencies:
     ```bash
     npm install
     ```
     or
     ```bash
     yarn install
     ```
 
 ## Available Scripts
 
 In the project directory, you can run:
 
 ### `npm start` or `yarn start`
 
 Runs the app in the development mode.\
 Open [http://localhost:3000](http://localhost:3000) to view it in your browser.
 
 The page will reload when you make changes.\
 You may also see any lint errors in the console.
 
 ### `npm test` or `yarn test`
 
 Launches the test runner in the interactive watch mode.\
 See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.
 
 ### `npm run build` or `yarn build`
 
 Builds the app for production to the `build` folder.\
 It correctly bundles React in production mode and optimizes the build for the best performance. Your app is ready to be deployed!

## Key Concepts / State Management

* **React Context API:** The primary state management approach, replacing the previous prop drilling method. `App.js` wraps the application in multiple context providers.
* **Context Providers:** Specific providers manage distinct slices of application state:
    * `AssetsProvider` (`AssetsContext.js`): Manages the list of all assets (institutional, client, wizard-issued), handling updates like balance changes, minting, burning, and redemption via `useReducer`.
    * `PaymentHistoryProvider` (`PaymentHistoryContext.js`): Manages the global list of payment history entries using `useReducer`.
    * `TokenHistoryProvider` (`TokenHistoryContext.js`): Manages the history log for token-specific actions (issue, mint, burn, etc.) using `useReducer`.
    * `TemplatesProvider` (`TemplatesContext.js`): Manages the list of saved payment templates (both single and bulk) using `useReducer`.
    * `RecurringPaymentsProvider` (`RecurringPaymentsContext.js`): Manages recurring payment schedules using `useReducer`.
    * `ActiveBulkProvider` (`ActiveBulkContext.js`): Manages the state of currently active/processing bulk payment files using `useReducer`.
    * `AssetOrdersProvider` (`AssetOrdersContext.js`): Manages the state of asset orders (e.g., sales, transfers) within the Treasury module using `useReducer`.
* **Custom Hooks:** Each context exports a custom hook (e.g., `useAssets`, `usePaymentHistory`, `useAssetOrders`) to provide easy access to the context's state and dispatch function within components.
* **Feature Dashboards as Orchestrators:** Components like `PaymentsDashboard.js`, `TokenDashboard.js`, `CustodyDashboard.js`, and `TreasuryDashboard.js` still act as controllers for their respective features. They manage internal navigation (e.g., `currentView` state) and orchestrate actions by calling functions that often dispatch actions to the relevant contexts.
* **Local Component State:** Standard React `useState` is used within individual components to manage UI-specific state (e.g., modal visibility, form inputs, filters, workflow steps).
* **Simulated Actions:** Many actions that would typically involve backend interaction (saving data, approvals, processing) are simulated using `setTimeout` and browser dialogs (`window.confirm`, `prompt`) for demonstration purposes within component handlers or context reducers.


## Dependencies & Configuration

* **Core:** React (`react`, `react-dom`)
* **Styling:** Tailwind CSS (`tailwindcss`) - Configured via `tailwind.config.js` with custom theme variables.
* **Utilities:**
    * `date-fns`: For date manipulation and formatting.
    * `react-big-calendar`: Used in `ManageRecurringPaymentsScreen` for the calendar view. Requires `date-fns` localizer setup.
    * `recharts`: Used in `TokenMetricsDashboard` for rendering charts (specifically `MonthlyStackedBarChart`).
* **State Management:** React Context API (implemented via custom providers and hooks).
* **Data Sources:**
    * Initial/dummy data is loaded from various files:
        * `src/data/initialData.js` (Assets, Logos, Entities, Hardcoded Details)
        * `src/features/Payments/data/paymentConstants.js` (Payment-specific constants, Rates, Dummy History/Templates/Recurring/Bulk/Recipients)
        * `src/utils/dummyData.js` (Client account generation)
        * `src/utils/metricsData.js` (Reserve details, History generation)
        * `src/data/mockCustodyData.js` (Custody logs/approvals)
    * State contexts (`AssetsContext`, `PaymentHistoryContext`, etc.) manage this data after initialization.
* **Configuration Files:**
    * `tailwind.config.js`: Defines Tailwind CSS theme extensions, custom variables, and content paths.