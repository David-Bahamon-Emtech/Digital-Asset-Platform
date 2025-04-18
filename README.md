# Digital-Asset-Platform V 0.7 

A React-based front-end demonstration platform for managing digital assets and simulating various payment flows. Showcases token lifecycle management (issuance, minting, burning, redeeming, reserves) and payment operations (cross-border, high-value transfers, bulk payments). Built using React and Tailwind CSS.

## Features

* **Token Management:**
    * Dashboard overview of token assets.
    * Detailed view for individual assets (handling both wizard-issued and predefined types).
    * Workflow for issuing new token types via a multi-step wizard (Token Details, Supply/Reserves/Metadata, Permissions, Finalization).
    * Workflow for minting additional units of existing tokens (with simulated Treasury approval).
    * Workflow for burning (destroying) existing tokens (with simulated Compliance & Treasury approval).
    * Workflow for redeeming/swapping tokens (with simulated multi-step approval and optional smart contract execution simulation).
    * Reserve Management view displaying simulated/derived reserve data (Circulation, Ratio, Composition, Accounts) and allowing alert configuration.
    * Simulated pause/unpause functionality for wizard-issued tokens (with simulated Pauser Role approval).
    * Local audit history log for token actions with detail view.
* **Payments:**
    * Central dashboard with navigation for Cross-Border, High-Value, and Bulk payments.
    * Dedicated dashboard views for each payment category displaying relevant metrics (static placeholders) and recent history.
    * Comprehensive Payment Creation screen supporting:
        * Payment Origins: Institutional, Client.
        * Payment Types: On-Chain, Traditional, Internal Transfer.
        * Detailed fee and FX rate calculation previews.
        * Simulated Compliance check and 2FA workflow for final submission.
    * Dedicated screen for initiating High-Value Transfers (HVT) with a multi-step process.
    * HVT Authorization screen for reviewing and approving/rejecting pending HVTs.
    * Detailed view for individual HVT records.
    * Bulk Payment file upload screen (with simulated validation and processing).
    * Bulk Payment add template functionality. 
    * Payment Template management (View, Filter, Search, Create, Edit, Delete, Use for new payments).
    * Recurring Payment management (View List/Calendar, Setup, Edit, Pause/Resume, Delete).
  **Custody Management:**
    * Dashboard overview of assets under custody.
    * Summary cards for Physical Vaults, Digital Vaults (Hot/Warm), and Cold Storage, showing aggregated values and counts based on asset metadata.
    * Recent Vault Operations log display (using dynamic dummy data).
    * Vault Analytics section showing simulated asset allocation and KPIs.
    * Quick Actions section (Initiate Deposit, Request Withdrawal, Schedule Audit, Generate Report).
    * Navigation to detailed views for:
        * Generating Custody Reports (form based on old UI).
        * Managing Pending Approvals (displaying requests, placeholder approve/reject actions).
        * Viewing assets in Cold Storage (with placeholder transfer-out form).
        * Viewing assets in Physical Vaults (with placeholder audit request action).
        * Viewing assets in Digital Vaults (Hot/Warm) (with placeholder rebalance action).
        * Initiating Deposits (form).
        * Requesting Withdrawals (form, triggers dummy approval).
        * Scheduling Audits (form).
        * Viewing the Full Operations Log (with basic filtering).
    * Uses dynamic state for logs and approvals for interactive demo.
* **Common UI:**
    * Consistent layout with a sidebar navigation.
    * Reusable modal dialogs for details (Payment History, Token History), creation/editing (Templates, Recurring Payments).
    * Reusable Payment History table component used across dashboards.
    * Themed styling using Tailwind CSS and custom CSS variables.

## Tech Stack

* **Frontend Library:** React.js
* **Styling:** Tailwind CSS
* **Language:** JavaScript (ES6+)
* **Date Utility:** `date-fns`
* **Calendar:** `react-big-calendar` (for Recurring Payments view)

## File Breakdown

Here's a summary of each analyzed file:

**Core Application:**

* `src/App.js`: The root component. Manages top-level state (`assets`, `paymentHistory` passed down from here) and renders the main `Layout`. Acts as the primary router between major features (Payments, Token Management). Initializes data (combining hardcoded and dummy data).
* `src/App.css`: Contains default CSS, likely including the base styles from Create React App and potentially global custom styles.

**Reusable Components:**

* `src/components/Layout/Layout.js`: Defines the main application structure with a fixed `Sidebar` and a main content area where feature components are rendered.
* `src/components/Sidebar/Sidebar.js`: Renders the navigation sidebar, displaying links, icons, the company logo, and highlighting the active section. Uses custom Tailwind variables for theming.
* `src/components/Logo/EmtechLogo.js` (Inferred): A simple component to display the company logo image consistently.
* `src/features/Payments/PaymentHistoryTable.js`: A reusable table component to display payment history entries, used across various payment dashboards. Shows a limited number of entries by default.
* `src/features/Payments/PaymentHistoryDetailModal.js`: A modal dialog to show the detailed breakdown of a selected payment history entry, parsing `rawData`.
* `src/features/TokenManagement/HistoryDetailModal.js`: A simpler modal dialog to display details of a generic token management history/audit log entry.
* `src/features/Payments/CreateEditTemplateModal.js`: A modal dialog containing a form for creating or editing payment templates.
* `src/features/Payments/RecurringPaymentModal.js`: A modal dialog containing a form for setting up or editing recurring payment schedules.

**Features - Payments:**

* `src/features/Payments/PaymentsDashboard.js`: The central container/controller for the Payments feature. Manages navigation between payment sub-screens, orchestrates actions (payment submission, template/recurring management, HVT auth), manages local state for templates & recurring payments, and renders the appropriate view.
* `src/features/Payments/CrossBorderDashboardView.js`: Dashboard view focused on general cross-border payments, providing action cards, metrics (placeholders), and recent history via `PaymentHistoryTable`.
* `src/features/Payments/HighValueDashboardView.js`: Dashboard view focused on High-Value Transfers (HVT), providing HVT-specific action cards, metrics (placeholders), and recent HVT history via `PaymentHistoryTable`.
* `src/features/Payments/BulkDashboardView.js`: Dashboard view focused on Bulk Payments, providing action cards, metrics (placeholders), and recent bulk history via `PaymentHistoryTable`.
* `src/features/Payments/CreatePaymentScreen.js`: A complex multi-step form for initiating various payment types (On-Chain, Traditional, Internal) for different origins (Institutional, Client). Includes fee/FX preview calculations and a simulated 2FA workflow.
* `src/features/Payments/OnChainPaymentFields.js`: Sub-component rendered within `CreatePaymentScreen` for on-chain specific fields (Network selection/display).
* `src/features/Payments/TraditionalPaymentFields.js`: Sub-component rendered within `CreatePaymentScreen` for traditional specific fields (Rail, Settlement Speed).
* `src/features/Payments/CreateHighValueTransferScreen.js`: A multi-step form specifically for initiating High-Value Transfers (HVTs).
* `src/features/Payments/AuthorizeHVTScreen.js`: Screen displaying a queue of pending HVTs, allowing users to review, authorize, or reject them individually or in batches (interacts with parent via callbacks).
* `src/features/Payments/UploadBulkFileScreen.js`: Screen for uploading bulk payment files, including simulated file selection, validation, configuration, and submission.
* `src/features/Payments/ViewTemplatesScreen.js`: Screen for managing payment templates (View, Filter, Search, Create/Edit via modal, Delete, Use). Manages template data locally.
* `src/features/Payments/ManageRecurringPaymentsScreen.js`: Screen for managing recurring payment schedules, offering both list and calendar (`react-big-calendar`) views. Manages recurring payment data locally.
* `src/features/Payments/ViewTransferDetailsScreen.js`: Screen displaying a detailed, read-only view of a single HVT record.

**Features - Token Management:**

* `src/features/TokenManagement/TokenDashboard.js`: The central container/controller for the Token Management feature. Manages navigation, orchestrates actions (issue, mint, burn, redeem), manages a local history log, and renders the appropriate view. Handles core asset state updates via the `setAssets` prop.
* `src/features/TokenManagement/IssuanceChoiceScreen.js`: A simple navigation screen allowing users to choose between issuing a new token or minting an existing one.
* `src/features/TokenManagement/TokenIssuanceWizard.js`: A complex, multi-step wizard guiding users through the definition and configuration of a new token type, including a simulated approval workflow.
* `src/features/TokenManagement/MintExistingToken.js`: Screen/form for minting additional units of an existing token, including a simulated Treasury approval workflow.
* `src/features/TokenManagement/BurnTokenScreen.js`: Screen/form for burning (destroying) units of an existing token, including a simulated multi-stage (Compliance, Treasury) approval workflow and irreversibility warnings.
* `src/features/TokenManagement/RedeemTokenScreen.js`: Screen/form for redeeming tokens (either for underlying value or swapping for another platform token). Includes preview calculations, simulated multi-stage approval, and an optional simulated smart contract execution view.
* `src/features/TokenManagement/ReserveManagementScreen.js`: Screen for viewing token reserve details. Displays data from local dummy structures (predefined assets) or generates fallback data (wizard assets). Allows configuration of reserve ratio alerts (managed locally) and generation of simulated reports.
* `src/features/TokenManagement/AssetDetailView.js`: Screen displaying detailed information for a selected token. Adapts content based on whether the token is wizard-issued or predefined. Includes simulated pause/unpause workflow for wizard tokens.

**Utilities & Data:**

* `src/utils/displayUtils.js`: Contains helper functions for formatting UI elements (rendering errors, getting status badge classes, formatting currency amounts).
* `src/utils/dummyData.js`: Contains a function (`generateDummyClientAccounts`) to create sample client account data.
* `src/data/initialData.js`: Provides initial static data, including predefined institutional assets, mappings for asset/blockchain logos, and sample entity names.
* `src/features/Payments/data/paymentConstants.js`: Centralizes constants (dropdown lists, rates, fees) and extensive dummy data (templates, recurring payments, payment history) specifically for the Payments feature.

**Features - Custody Management:** *(All located in `src/features/Custody/`)*

* `CustodyDashboard.js`: Main container for the feature. Manages `custodyView` state for internal navigation. Manages `operationsLog` and `pendingApprovals` state for the demo. Integrates all other Custody components. Contains handler logic for forms and approvals, dispatching updates to `AssetsContext` and modifying local state.
* `VaultTypeSummaryCard.js`: Reusable card to display summary info for Physical, Digital, Cold storage tiers. Reads aggregated data calculated in `CustodyDashboard`.
* `VaultOperationsLogTable.js`: Reusable table to display custody operations log entries. Reads `operationsLog` state passed from `CustodyDashboard`.
* `VaultAnalytics.js`: Displays asset allocation (calculated from `AssetsContext` data) and static KPIs.
* `VaultQuickActions.js`: Displays action buttons (Deposit, Withdrawal, Audit, Report) and calls handlers defined in `CustodyDashboard`.
* `CustodyReporting.js`: Form for configuring custody reports (based on old UI). Placeholder submission logic.
* `ApprovalQueue.js`: Displays items from `pendingApprovals` state. Approve/Reject buttons call handlers in `CustodyDashboard`.
* `ColdStorageView.js`: Displays assets with `custodyType: 'Cold'`. Includes placeholder form/actions for transfers out (calling handler in `CustodyDashboard`).
* `PhysicalVaultsView.js`: Displays assets with `physicality: 'Physical'`. Includes placeholder actions for viewing details and requesting audits (calling handler in `CustodyDashboard`).
* `DigitalVaultsView.js`: Displays assets with `custodyType: 'Hot'` or `'Warm'`. Includes placeholder actions for viewing details/policy and rebalancing (calling handler in `CustodyDashboard`).
* `InitiateDepositForm.js`: Form for initiating deposits. Calls handler in `CustodyDashboard` on submit.
* `RequestWithdrawalForm.js`: Form for requesting withdrawals. Calls handler in `CustodyDashboard` on submit (which adds to approvals).
* `ScheduleAuditForm.js`: Form for scheduling audits. Calls handler in `CustodyDashboard` on submit.
* `FullOperationsLogView.js`: Displays the full operations log (from `operationsLog` state) with basic filtering.

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

* **Container Components:** `PaymentsDashboard.js` and `TokenDashboard.js` act as controllers for their respective features, managing internal navigation (`currentView` state) and orchestrating actions within the feature.
* **Top-Level State:** `App.js` likely manages crucial application-wide state, such as the list of `assets` and the global `paymentHistory`. It passes this state and corresponding update functions (`setAssets`, `onAddHistoryEntry`, etc.) down as props.
* **Local State:** Components manage their own UI state (e.g., modal visibility, filters, form inputs, workflow steps) using `useState`. Some components like `ViewTemplatesScreen`, `ManageRecurringPaymentsScreen`, and `TokenDashboard` also manage feature-specific data (templates, recurring schedules, token action history) locally.
* **Reusable Components:** The project utilizes reusable components like `Layout`, `Sidebar`, `PaymentHistoryTable`, and various modals to maintain consistency and reduce duplication.
* **Props Drilling:** State and callbacks are passed down through multiple component levels (e.g., `App` -> `PaymentsDashboard` -> `CreatePaymentScreen`). For larger applications, consider state management libraries (Context API, Redux, Zustand) might be beneficial.
* **Simulated Actions:** Many actions that would typically involve backend interaction (saving data, approvals, processing) are simulated using `setTimeout` and `window.confirm`/`alert` for demonstration.

## Dependencies & Configuration

* **Core:** React
* **Styling:** Tailwind CSS (configured via `tailwind.config.js` with custom theme variables)
* **Utilities:** `date-fns`, `react-big-calendar`
* **Data:** Initial/dummy data is sourced from `src/data/initialData.js` and `src/features/Payments/data/paymentConstants.js`, as well as defined locally within some components (`TokenDashboard`, `ViewTemplatesScreen`, `ReserveManagementScreen`, etc.).