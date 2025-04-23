# Digital-Asset-Platform V 0.8 

A React-based front-end demonstration platform for managing digital assets and simulating various payment flows. Showcases token lifecycle management (issuance, minting, burning, redeeming, reserves) and payment operations (cross-border, high-value transfers, bulk payments). Built using React and Tailwind CSS.

Major Changes from V 0.7 

This updated version introduces significant architectural changes and new top-level features. The most notable architectural shift is the adoption of the React Context API for state management, replacing the previous reliance on prop drilling. This is evident through the introduction of multiple context providers wrapped around the application in App.js, such as AssetsProvider, PaymentHistoryProvider, TokenHistoryProvider, TemplatesProvider, RecurringPaymentsProvider, ActiveBulkProvider, and AssetOrdersProvider. Functionally, the application has expanded with several new core sections accessible via the sidebar:

    * Treasury Management: A new dedicated section for treasury operations, including viewing treasury assets, managing asset orders (sales of platform-issued tokens) swapping tokens, and redeeming tokens.
    * Account Management: Provides capabilities for user administration, role-based access control (RBAC), API key management, security settings, audit logs, and third-party account integration.
    * Compliance Center: Focuses on regulatory adherence, featuring tools for transaction monitoring, KYC/AML process overview, risk management configuration, regulatory reporting generation, alert/case management, and sanctions screening.

Existing features have also seen substantial enhancements and refinements. The Token Management module, now centered around TokenDashboard.js, features a significantly more detailed Token Issuance Wizard with granular steps for defining token types (RWA, Capital Asset, Currency), supply details, extensive reserve configurations (Bank, Contract, Custodian, On-Chain Wallet), regulatory info, token custody, and permissions like fees with recipient allocation and expiration. The token lifecycle actions have been refined:

    * Minting/Burning: Now clearly distinguishes changes in circulating supply (balance) versus total issued supply, particularly for finite assets, with updates reflected in the AssetsContext. Burning specifically targets the reserve pool.
    * Redemption/Swapping: Dedicated screens (RedeemTokenScreen, SwapTokenScreen) handle redeeming tokens for underlying value or swapping between platform/treasury assets, including simulated smart contract execution steps.
    * Reserve Management: The ReserveManagementScreen dynamically displays detailed reserve composition and accounts sourced from AssetsContext, moving beyond previously static or simpler dummy data structures.
    * Asset Orders: Introduced as part of Treasury, this allows creating and managing orders for selling platform-issued assets, tracked via AssetOrdersContext. The Payments section sees the addition of bulk payment template creation and the ability to edit active bulk files. HVT authorization includes a simulated login gate. The underlying state for payment history, templates, and recurring payments is now managed via dedicated contexts.

## Features

**Token Management:** Governed by `TokenDashboard.js`, using `AssetsContext` for state and `TokenHistoryContext` for logging.
    * Dashboard overview of *managed* token assets (wizard-issued or specific predefined types like ACP, MMFUSD, XAGC, WTOIL, VCC). Includes `TokenMetricsDashboard` showing aggregate metrics, reserve ratios, and a monthly circulation/reserve chart.
    * Detailed view (`AssetDetailView.js`) for individual assets, adapting content for wizard-issued vs. predefined types.
    * Workflow for issuing new token types via a multi-step wizard (`TokenIssuanceWizard.js`):
        * Define Token Details (Name, Symbol, Blockchain, Type: RWA, Capital Asset, Currency + Subtypes).
        * Configure Supply (Initial, Finite/Infinite, Decimals), Metadata, and Market Value.
        * Configure Reserves (if asset-backed): Select backing method (Bank, Smart Contract, Custodian, On-Chain Wallet) and connect/verify details.
        * Configure Permissions & Features: KYC requirements (Levels), Fee Schedules (Percentage/Flat, Recipient Allocation), Pausable status, Fungibility, Expiration Date, Role Assignments (Minter, Burner, Pauser, etc.).
        * Specify Regulatory Information (Jurisdiction, Regulator).
        * Define Token Custody Arrangement (Self vs. Third-Party).
        * Includes simulated multi-step approval workflow (Compliance, Management).
    * Workflow for minting additional units of existing finite tokens (`MintExistingToken.js`): Increases `totalSupplyIssued` and updates reserve data (simulated check); *does not* directly increase circulating supply (`balance`). Includes simulated Treasury approval.
    * Workflow for burning (destroying) existing finite tokens (`BurnTokenScreen.js`): Decreases `totalSupplyIssued` and updates reserve data; *does not* directly decrease circulating supply (`balance`). Includes simulated Compliance & Treasury approval.
    * Workflow for redeeming tokens (`RedeemTokenScreen.js`): *Decreases both* circulating supply (`balance`) and `totalSupplyIssued`. Allows specifying payout currency (for eligible types) or redeeming for underlying value. Includes simulated multi-step approval and optional smart contract execution simulation.
    * Workflow for swapping tokens (`SwapTokenScreen.js`): Allows swapping between Treasury assets and platform-issued tokens (affects circulating `balance`). Includes simulated multi-step approval and optional smart contract execution simulation.
    * Reserve Management view (`ReserveManagementScreen.js`): Displays *dynamic* reserve data from `AssetsContext` (Total Issued, Circulation, Ratio, Composition, Accounts) and allows configuration of reserve ratio alert thresholds.
    * Simulated pause/unpause functionality for wizard-issued tokens (`AssetDetailView.js` workflow) with simulated Pauser Role approval.
    * Token action history log managed via `TokenHistoryContext`, with details viewable in a modal (`HistoryDetailModal.js`).

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
    
* **Account Management:** *(Placeholder - Needs update)*
    * User & Profile Management (View, Add, Edit, Deactivate).
    * Role-Based Access Control (RBAC) definition and assignment.
    * API Key Management (Generate, Manage, Revoke, Scope Permissions).
    * Security Settings (MFA, Password Policy, Session Timeouts).
    * Audit Log access.
    * 3rd Party Account Management (Register Apps, Define Scopes, Monitor).

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