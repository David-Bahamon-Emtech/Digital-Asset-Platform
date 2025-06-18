# Digital-Asset-Platform V0.9

A React-based front-end demonstration platform for managing digital assets and simulating various payment flows. Showcases token lifecycle management (issuance, minting, burning, redeeming, reserves) and payment operations (cross-border, high-value transfers, bulk payments). Built using React and Tailwind CSS.

M## Major Changes from V0.8

This version significantly enhances the **Account Management** section, transforming it from placeholders into a more interactive and feature-rich module. Key architectural refinements include centralizing client account data within `AssetsContext` for application-wide consistency.

**Account Management - Detailed Enhancements:**

The Account Management module, orchestrated by `AccountManagementScreen.jsx`, now provides three distinct sub-sections:

1.  **Internal Account Management (`InternalAccountManagementView.jsx`):**
    * **User Administration:**
        * Displays a list of internal platform users (`UserList.jsx`) with their name, platform role, and status.
        * Supports inviting new users and editing existing users through a comprehensive modal (`EditUserModal.jsx`).
        * The modal allows management of:
            * User's Name, Platform Role (e.g., Administrator, Treasurer), and Status (Active/Inactive).
            * Associated Blockchain Accounts: Add/remove accounts across different blockchains (Hedera, Ethereum, etc.).
            * (Simulated) KYC/AML Management: Grant/revoke KYC status, set/clear AML flags.
            * (Simulated) MFA status display.
    * **Multi-Signature Capabilities (Simulated):**
        * **Configuration (`MultiSigConfigurationView.jsx`):** View existing multi-signature groups and create new configurations, specifying name, blockchain, signers (from platform users with relevant blockchain accounts), and threshold.
        * **Transaction Signing (`MultiSigSigningView.jsx`):** View pending multi-signature transactions requiring the current (simulated) user's signature and simulate the signing process.
    * **Placeholders:**
        * API Key Management (`ApiKeyManagementView.jsx`): Displays a placeholder or a static list of dummy system API keys.
        * Security Settings (`SecuritySettingsView.jsx`): Shows static text for password policy and a non-functional MFA toggle.

2.  **Client Account Management (`ClientAccountManagementView.jsx`):**
    * **Data Source:** Client accounts (non-institutional fiat and stablecoin accounts) are now sourced globally from `AssetsContext` to ensure data consistency across the application. `AssetsContext` initializes these accounts with `simulatedStatus` and `clientName`.
    * **Dynamic Account Listing (`ClientAccountListTable.jsx`):**
        * Displays a comprehensive table of client accounts.
        * Features client-side sorting by various columns (Client Name, Balance, Currency, etc.).
        * Includes dropdown filters for Currency, Account Type (`assetClass`), and Status (`simulatedStatus`).
    * **Detailed Account View (`ClientAccountDetailModal.jsx`):**
        * Opens when "View Details" is clicked for an account.
        * Displays detailed account information, dummy client contact info, and a list of simulated recent transactions.
        * **Simulated Banker Actions:**
            * "Generate Statement": Opens a separate `StatementModal.jsx` displaying a simulated account statement with a transaction list, period, and balances.
            * "Place Hold" / "Remove Hold": Toggles the account's `simulatedStatus` between 'Active' and 'Frozen'.
            * "Flag for Review" / "Clear Flag": Toggles the account's `simulatedStatus` between 'Active' and 'Review'.
            * "Edit Account Nickname": Allows the banker to modify the account's `label` (nickname).
        * **Display Elements:** Includes non-functional sections for "Internal Banker Notes" (textarea) and "Linked Services" (checkboxes).
    * **Global State Updates:** All changes to client account status or nickname are dispatched to `AssetsContext` using the `UPDATE_ASSET_PROPERTY` action, ensuring global consistency.

3.  **3rd Party Account Management (`ThirdPartyAccountManagementView.jsx`):**
    * **Dynamic Application List:**
        * Manages a list of connected third-party applications (e.g., external services, partners) using local component state.
        * Displays application name, description, status, connected date, a partially masked API key, and granted permissions.
        * Features an "Active/Inactive" toggle for each application.
    * **Connect New Applications (`ConnectThirdPartyAppModal.js`):**
        * A modal form allows administrators to "connect" new third-party applications.
        * Inputs for Application Name and Description.
        * A comprehensive, categorized list of selectable permissions (e.g., Compliance, KYC/AML, Treasury, Payments access scopes).
        * Generates a dummy API key upon connection.
    * **Manage Permissions (`ManagePermissionsModal.jsx`):**
        * Allows editing the permissions for an existing connected application.
        * Displays current permissions and allows modification through checkboxes.
    * **Simulated API Key Management:**
        * "Rotate Key" button for each application simulates generating a new dummy API key.
    * **Revoke Access:** Allows removing a connected application from the list (simulated).

Existing features like Token Management, Payments, Custody, Treasury, and Compliance Center remain as described previously, with the understanding that client account data used in sections like Payments will now be sourced consistently from `AssetsContext`.

## Features

### Token Management

Governed by `TokenDashboard.jsx`, using `AssetsContext` for state and `TokenHistoryContext` for logging.

* **Dashboard Overview:**
    * Provides an overview of managed token assets, primarily those issued via the wizard and a specific list of predefined platform assets (e.g., `cp-acme-01`, `mmf-usd-01`, `xagc-01`, `oil-wti-01`, `cc-verra-01`).
    * Includes `TokenMetricsDashboard` showing aggregate metrics, reserve ratios, and a monthly circulation/reserve chart.
* **Detailed Asset View (`AssetDetailView.jsx`):**
    * Displays details for individual assets.
    * Adapts content presentation based on whether the token is wizard-issued or a predefined type.
* **Workflow: New Token Issuance (`TokenIssuanceWizard.jsx`):**
    * A multi-step wizard for creating new token types:
        * **Define Token Details:** Name, Symbol, Blockchain, Type (RWA, Capital Asset, Currency + Subtypes).
        * **Configure Supply:** Initial supply, Finite/Infinite, Decimals, Metadata, Market Value.
        * **Configure Reserves (if asset-backed):** Select backing method (Bank, Smart Contract, Custodian, On-Chain Wallet) and connect/verify details.
        * **Configure Permissions & Features:** KYC requirements (Levels), Fee Schedules (Percentage/Flat, Recipient Allocation), Pausable status, Fungibility, Expiration Date, Role Assignments (Minter, Burner, Pauser, etc.).
        * **Specify Regulatory Information:** Jurisdiction, Regulator.
        * **Define Token Custody:** Arrangement (Self vs. Third-Party).
    * Includes a simulated multi-step approval workflow (Compliance, Management).
* **Workflow: Mint Existing Tokens (`MintExistingToken.jsx`):**
    * Increases `totalSupplyIssued` for existing finite tokens.
    * Updates reserve data (simulated check).
    * *Does not* directly increase circulating supply (`balance`).
    * Includes simulated Treasury approval.
* **Workflow: Burn Tokens (`BurnTokenScreen.jsx`):**
    * Decreases `totalSupplyIssued` for existing finite tokens.
    * Updates reserve data.
    * *Does not* directly decrease circulating supply (`balance`).
    * Includes simulated Compliance & Treasury approval.
* **Workflow: Redeem Tokens (`RedeemTokenScreen.jsx`):**
    * Note: While conceptually related to the token lifecycle, the primary interface for Redeem and Swap operations is within the Treasury Management module.
    * Decreases *both* circulating supply (`balance`) and `totalSupplyIssued`.
    * Allows specifying payout currency (for eligible types) or redeeming for underlying value.
    * Includes simulated multi-step approval and optional smart contract execution simulation.
* **Workflow: Swap Tokens (`SwapTokenScreen.jsx`):**
    * Note: While conceptually related to the token lifecycle, the primary interface for Redeem and Swap operations is within the Treasury Management module.
    * Allows swapping between Treasury assets and platform-issued tokens.
    * Affects circulating `balance`.
    * Includes simulated multi-step approval and optional smart contract execution simulation.
* **Reserve Management (`ReserveManagementScreen.jsx`):**
    * Displays dynamic reserve data from `AssetsContext` (Total Issued, Circulation, Ratio, Composition, Accounts).
    * Allows configuration of reserve ratio alert thresholds.
* **Pause/Unpause Functionality:**
    * Simulated functionality for wizard-issued tokens via `AssetDetailView.jsx` workflow.
    * Includes simulated Pauser Role approval.
* **Token History Log:**
    * Managed via `TokenHistoryContext`.
    * Detailed view available in a modal (`HistoryDetailModal.jsx`).

* **Payments:** Orchestrated by `PaymentsDashboard.jsx`, utilizing contexts (`PaymentHistoryContext`, `TemplatesContext`, `RecurringPaymentsContext`, `ActiveBulkContext`) for state.
    * Central dashboard with tab navigation for Cross-Border, High-Value, and Bulk payments.
    * Dedicated dashboard views (`CrossBorderDashboardView.jsx`, `HighValueDashboardView.jsx`, `BulkDashboardView.jsx`) for each payment category displaying relevant metrics (placeholders) and recent history via `PaymentHistoryTable`.
    * Comprehensive Payment Creation screen (`CreatePaymentScreen.jsx`) supporting:
        * Payment Origins: Institutional, Client.
        * Payment Types: On-Chain, Traditional, Internal Transfer.
        * Detailed fee and FX rate calculation previews.
        * Simulated Compliance check and 2FA workflow for final submission.
    * Dedicated screen for initiating High-Value Transfers (HVT) (`CreateHighValueTransferScreen.jsx`): with a multi-step process and specific HVT policy rules.
    * HVT Authorization screen (`AuthorizeHVTScreen.jsx`) for reviewing and approving/rejecting pending HVTs (individual or batch), featuring a simulated login gate.
    * Detailed view (`ViewTransferDetailsScreen.jsx`) for individual HVT records.
    * Bulk Payment file upload screen (`UploadBulkFileScreen.jsx`) with simulated validation and processing, submitting files to the active queue (`ActiveBulkContext`).
    * Active Bulk File management (`BulkDashboardView.jsx` integrating `ActiveBulkFilesTable.jsx`): View active/processing bulk files, view details (`ActiveBulkDetailModal.jsx`), edit schedule/metadata (`EditBulkFileScreen.jsx`), and cancel/delete files. Includes summary stats (`BulkSummaryStats.jsx`).
    * Bulk Payment Template creation (`CreateBulkTemplateScreen.jsx`): Define reusable templates for bulk files, including file format, field mappings, validation rules, and processing options.
    * Payment Template management (`ViewTemplatesScreen.jsx`): View, Filter, Search, Create/Edit (`CreateEditTemplateModal.jsx`), Delete, and Use templates for new single payments.
    * Recurring Payment management (`ManageRecurringPaymentsScreen.jsx`): View List/Calendar, Setup/Edit (`RecurringPaymentModal.jsx`)

  * **Custody Management:** Orchestrated by `CustodyDashboard.jsx`, using `AssetsContext` for asset data and local state for logs/approvals.
    * Dashboard overview displaying aggregated values and counts for Physical, Digital (Hot/Warm), and Cold storage tiers via `VaultTypeSummaryCard`.
    * Recent Vault Operations log display using `VaultOperationsLogTable`.
    * Vault Analytics section (`VaultAnalytics.jsx`) showing asset allocation (calculated from `AssetsContext`) and static KPIs.
    * Quick Actions section (`VaultQuickActions.jsx`) for initiating Deposit, Withdrawal, Audit, and Report generation.
    * Navigation to detailed views/forms:
        * `CustodyReporting.jsx`: Generate custody reports (form based on old UI).
        * `ApprovalQueue.jsx`: Manage pending custody approvals (displays requests, handles approve/reject actions which update logs and potentially `AssetsContext`).
        * `ColdStorageView.jsx`: View assets in Cold Storage; includes form to initiate transfers out (triggers approval request).
        * `PhysicalVaultsView.jsx`: View assets in Physical Vaults; includes action to request audits.
        * `DigitalVaultsView.jsx`: View assets in Digital Vaults (Hot/Warm); includes action to initiate rebalancing transfers (triggers approval request).
        * `InitiateDepositForm.jsx`: Form to record new deposits (updates `AssetsContext` and logs).
        * `RequestWithdrawalForm.jsx`: Form to request withdrawals (adds item to approval queue and logs).
        * `ScheduleAuditForm.jsx`: Form to schedule audits (adds entry to logs).
        * `FullOperationsLogView.jsx`: View the complete operations log with basic filtering.

* **Treasury Management:** Orchestrated by `TreasuryDashboard.jsx`, using `AssetsContext` and `AssetOrdersContext`.
    * Dashboard overview of core treasury assets (e.g., USDC, USDT, T-BOND, e-Cedi, D-EUR) and key actions.
    * Workflow for redeeming platform-issued tokens (`RedeemTokenScreen.jsx`) for underlying value or specified fiat currency, including simulated approval and smart contract execution.
    * Workflow for swapping between treasury assets and platform-issued tokens (`SwapTokenScreen.jsx`), affecting circulating balances and reserves, including simulated approval and smart contract execution.
    * Asset Order Management:
        * View list of asset orders (`AssetOrdersListView.jsx`), currently focused on *Sales* of platform-issued tokens (debiting from Reserve). Includes filtering and quick approve/reject actions.
        * Create new asset orders (`CreateAssetOrderScreen.jsx`), currently supporting *Sales* of platform-issued tokens (specifying asset, amount, rate, payment asset, and accounts). Submits orders to `AssetOrdersContext` with 'Pending Approval' status.
        * View detailed information for a specific asset order in a modal (`AssetOrderDetailModal.jsx`), including dummy approval/status history.
    * Detailed view for core treasury 
    
* **Account Management:** 
    Orchestrated by `AccountManagementScreen.jsx`. This component provides navigation to three main sub-views:
    * **`InternalAccountManagementView.jsx`**:
    * Manages internal platform users (`UserList.jsx`, `EditUserModal.jsx`).
        * User details: Name, Platform Role, Status.
        * Associated Blockchain Accounts management.
        * Simulated KYC/AML status updates.
        * Simulated MFA status display.
    * Manages Multi-Signature configurations and signing (simulated) (`MultiSigConfigurationView.jsx`, `MultiSigSigningView.jsx`).
    * Placeholder for API Key Management (`ApiKeyManagementView.jsx`).
    * Placeholder for Security Settings (`SecuritySettingsView.jsx`).
    * **`ClientAccountManagementView.jsx`**:
        * Displays and manages client accounts sourced globally from `AssetsContext`.
        * Features a dynamic table (`ClientAccountListTable.jsx`) with sorting and dropdown filters (Currency, Account Type, Status).
        * Provides a detailed view modal (`ClientAccountDetailModal.jsx`) for individual accounts, showing:
            * Comprehensive account details.
            * Simulated recent transaction history.
            * Dummy client contact information.
            * Simulated actions: Generate Statement (opens `StatementModal.jsx`), Place/Remove Hold, Flag/Clear Flag, Edit Account Nickname.
            * Display for Internal Banker Notes and Linked Services.
        * All client account property changes (status, nickname) are dispatched to `AssetsContext`.
* **`ThirdPartyAccountManagementView.jsx`**:
        * Manages connections to external applications using local component state.
        * Displays a list of connected apps with status toggles, API key info, and permissions.
        * Modal (`ConnectThirdPartyAppModal.jsx`) to connect new applications with granular, categorized permission selection.
        * Modal (`ManagePermissionsModal.jsx`) to edit permissions for existing applications.
        * Simulated API key rotation and access revocation.

* **Compliance Center:** The Compliance Center UI is implemented with sections for Transaction Monitoring, KYC/AML Process management, Risk Management, Regulatory Reporting, Alerts & Case Management, and Sanctions Screening. Currently, these UI sections are visual representations and do not yet have full backend functionality or dynamic data integration.
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

* **Frontend Library/Framework:** React.js (using Vite)
* **State Management:** React Context API
* **Styling:** Tailwind CSS
* **Language:** JavaScript (ES6+)
* **Build Tool & Dev Server:** Vite
* **Date Utility:** `date-fns`
* **Calendar:** `react-big-calendar` (for Recurring Payments view)
* **Charts:** `recharts` (for Token Metrics)
* **Utilities:**
    * `web-vitals`: For measuring performance metrics.

## File Breakdown

**Core Application:**

* `src/App.jsx`: The root component. Manages top-level state (`assets`, `paymentHistory` passed down from here) and renders the main `Layout`. Acts as the primary router between major features (Payments, Token Management). Initializes data (combining hardcoded and dummy data).
* `src/App.css`: Contains default CSS, likely including the base styles from Create React App and potentially global custom styles.

**Reusable Components:**
* `src/components/Layout/Layout.jsx`: Defines the main application structure (Sidebar + Content Area).
* `src/components/Sidebar/Sidebar.jsx`: Renders the navigation sidebar with links and icons.
* `src/components/Logo/EmtechLogo.jsx` (Inferred): Simple component to display the company logo.
* `src/features/Payments/PaymentHistoryTable.jsx`: Reusable table for displaying payment history entries.
* `src/features/Payments/PaymentHistoryDetailModal.jsx`: Modal dialog for showing detailed payment history.
* `src/features/TokenManagement/HistoryDetailModal.jsx`: Modal dialog for showing generic token action history details.
* `src/features/Payments/CreateEditTemplateModal.jsx`: Modal dialog with a form for creating/editing single payment templates.
* `src/features/Payments/RecurringPaymentModal.jsx`: Modal dialog with a form for setting up/editing recurring payments.
* `src/features/Payments/ActiveBulkDetailModal.jsx`: Modal dialog for showing details of an active bulk payment file.
* `src/features/Treasury/AssetOrderDetailModal.jsx`: Modal dialog for showing detailed asset order information.
* `src/features/Custody/VaultOperationsLogTable.jsx`: Reusable table for displaying custody operations log entries.
* `src/features/Custody/VaultTypeSummaryCard.jsx`: Reusable card for displaying summary info for vault types (Physical, Digital, Cold).
* `src/features/Custody/VaultAnalytics.jsx`: Reusable component displaying custody asset allocation charts and KPIs.
* `src/features/Custody/VaultQuickActions.jsx`: Reusable component displaying common custody action buttons.
* `src/features/TokenManagement/MonthlyStackedBarChart.jsx`: Reusable chart component (using `recharts`) for displaying monthly stacked bar data (e.g., circulation vs. reserve).
* `src/features/Payments/OnChainPaymentFields.jsx`: Reusable component containing form fields specific to on-chain payments.
* `src/features/Payments/TraditionalPaymentFields.jsx`: Reusable component containing form fields specific to traditional payments.


**Utilities & Data:**
* `src/utils/displayUtils.jsx`: Contains helper functions for formatting UI elements (rendering errors, status badges, currency, numbers, booleans).
* `src/utils/dummyData.jsx`: Contains a function (`generateDummyClientAccounts`) to create sample client account data with enriched metadata.
* `src/utils/metricsData.jsx`: Provides detailed dummy reserve data (`detailedDummyReserveData`) and functions for calculating reserve composition, alert thresholds, and generating circulation history for Token Management.
* `src/data/initialData.jsx`: Provides initial static data, including predefined institutional assets, mappings for asset/blockchain logos, sample entity names, and hardcoded asset details.
* `src/data/mockCustodyData.jsx`: Provides dummy data for the Custody feature's operations log and initial pending approvals queue.
* `src/features/Payments/data/paymentConstants.jsx`: Centralizes constants (dropdown lists, rates, fees) and extensive dummy

**Configuration:**

* `tailwind.config.js`: Configures the Tailwind CSS framework, defining content paths and extending the theme with custom colors linked to CSS variables (e.g., `sidebar-bg`, `emtech-gold`).

## Getting Started
 
 This project uses [Vite](https://vitejs.dev/) for its frontend build tooling and development server.
 
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

 ### `npm run dev` or `yarn dev`
 Runs the app in development mode using the Vite development server.
 Open [http://localhost:5173](http://localhost:5173) (or the port Vite specifies, typically 5173) to view it in your browser.
 The page will reload if you make edits. You will also see any lint errors in the console.

 ### `npm run build` or `yarn build`
 Builds the app for production to the `dist` folder.
 It correctly bundles React in production mode and optimizes the build for the best performance.
 The build is minified and the filenames include hashes. Your app is ready to be deployed!

 ### `npm run preview` or `yarn preview`
 Locally serves the content from the `dist` folder, allowing you to preview the production build.

 ### `npm run lint` or `yarn lint`
 Lints the codebase using ESLint to identify and report on patterns in JavaScript.

 ### Testing
 The project includes testing libraries such as `@testing-library/react` and `@testing-library/jest-dom` in its `devDependencies`.
 However, a direct `npm test` script is not pre-configured in `package.json`. Tests can be run using a test runner like Jest directly (e.g., `npx jest`) if Jest is configured, or this can be set up as a future task.

## Key Concepts / State Management

* **React Context API:** The primary state management approach, replacing the previous prop drilling method. `App.jsx` wraps the application in multiple context providers.
* **Context Providers:** Specific providers manage distinct slices of application state:
    * `AssetsProvider` (`AssetsContext.jsx`): Manages the list of all assets (institutional, client, wizard-issued), handling updates like balance changes, minting, burning, and redemption via `useReducer`.
    * `PaymentHistoryProvider` (`PaymentHistoryContext.jsx`): Manages the global list of payment history entries using `useReducer`.
    * `TokenHistoryProvider` (`TokenHistoryContext.jsx`): Manages the history log for token-specific actions (issue, mint, burn, etc.) using `useReducer`.
    * `TemplatesProvider` (`TemplatesContext.jsx`): Manages the list of saved payment templates (supporting both single payment templates and bulk payment templates) using `useReducer`.
    * `RecurringPaymentsProvider` (`RecurringPaymentsContext.jsx`): Manages recurring payment schedules using `useReducer`.
    * `ActiveBulkProvider` (`ActiveBulkContext.jsx`): Manages the state of currently active/processing bulk payment files using `useReducer`. Its reducer includes actions like `ADD_ACTIVE_BULK_FILE`, `UPDATE_ACTIVE_BULK_STATUS`, `REMOVE_ACTIVE_BULK_FILE`, and `UPDATE_ACTIVE_BULK_DETAILS` (for modifying metadata such as schedules or labels).
    * `AssetOrdersProvider` (`AssetOrdersContext.jsx`): Manages the state of asset orders (e.g., sales, transfers) within the Treasury module using `useReducer`.
* **Custom Hooks:** Each context exports a custom hook (e.g., `useAssets`, `usePaymentHistory`, `useAssetOrders`) to provide easy access to the context's state and dispatch function within components.
* **Feature Dashboards as Orchestrators:** Components like `PaymentsDashboard.jsx`, `TokenDashboard.jsx`, `CustodyDashboard.jsx`, and `TreasuryDashboard.jsx` still act as controllers for their respective features. They manage internal navigation (e.g., `currentView` state) and orchestrate actions by calling functions that often dispatch actions to the relevant contexts.
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
        * `src/data/initialData.jsx` (Assets, Logos, Entities, Hardcoded Details)
        * `src/features/Payments/data/paymentConstants.jsx` (Payment-specific constants, Rates, Dummy History/Templates/Recurring/Bulk/Recipients)
        * `src/utils/dummyData.jsx` (Client account generation)
        * `src/utils/metricsData.jsx` (Reserve details, History generation)
        * `src/data/mockCustodyData.jsx` (Custody logs/approvals)
    * State contexts (`AssetsContext`, `PaymentHistoryContext`, etc.) manage this data after initialization.
* **Configuration Files:**
    * `tailwind.config.js`: Defines Tailwind CSS theme extensions, custom variables, and content paths.
---
Last reviewed and updated: 2023-10-27.