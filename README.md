# Digital-Asset-Platform V 0.5 (Refactored)

A React-based front-end demonstration platform for managing digital assets and simulating various payment flows. Showcases token lifecycle management (issuance, minting, burning, redeeming, reserves) and payment operations (cross-border, high-value transfers, bulk payments). Built using React and Tailwind CSS.

**Note:** This is currently a self-contained front-end demo. All data (initial assets, balances, payment history, templates, recurring payments) is managed in the application's state (primarily in `App.js` and `PaymentsDashboard.js`) and is initialized with dummy/static data. State is **not persistent**; refreshing the browser or restarting the server will reset the state to the initial defaults. No backend APIs are connected. All workflows (approvals, file processing, settlement times) are simulated using timeouts and placeholder logic.

## Key Changes in V 0.5

* **Centralized State for Payments:** State for Payment History, Templates, and Recurring Payments is now managed centrally within `PaymentsDashboard.js`, removing data isolation issues in sub-components.
* **Props/Callback Interaction:** Components like `AuthorizeHVTScreen`, `ViewTemplatesScreen`, and `ManageRecurringPaymentsScreen` now receive data via props and trigger updates via callback functions passed down from `PaymentsDashboard`.
* **Consistent History Display:** `HighValueDashboardView` and `BulkDashboardView` now correctly use the reusable `PaymentHistoryTable` component with data passed via props, similar to `CrossBorderDashboardView`.
* **Fixed HVT Detail View:** The data source for viewing HVT details is now correctly derived from the central `paymentHistory` state.
* **Centralized Utilities/Data:** Helper functions (for display) and initial data/constants are moved to shared `utils/` and `data/` directories.
* **Refined Token Management Filtering:** `App.js` filter logic updated to ensure only tokenized institutional assets (and wizard-issued ones) are passed to `TokenDashboard`, excluding standard fiat accounts.

## Key Features (Current Structure)

* **Core Structure (`App.js`, `src/components/Layout`)**
    * Manages top-level navigation (`activeTab` state).
    * Manages the master list of all accounts (`allAccounts` state), combining institutional and generated client accounts. Initial data sourced from `src/data/initialData.js`, dummy client accounts generated via `src/utils/dummyData.js`.
    * Passes filtered `tokenManagementAssets` (institutional tokens + wizard-issued) and `setAssets` (main setter) to `TokenDashboard`.
    * Passes all `allAccounts` and `setAssets` to `PaymentsDashboard`.
    * Uses a consistent `Layout`.

* **Shared Utilities & Data (`src/utils/`, `src/data/`)**
    * `src/utils/displayUtils.js`: Contains shared helpers like `renderError`, `getStatusClass`, `formatAmount`.
    * `src/utils/dummyData.js`: Contains `generateDummyClientAccounts`.
    * `src/data/initialData.js`: Contains definitions for `initialInstitutionalAssets`, `assetLogos`, `blockchainLogos`, `sampleEntities`.
    * `src/features/Payments/data/paymentConstants.js`: Contains constants specific to the Payments feature (rails, networks, rates, fees, purposes, initial template/recurring data).

* **Token Management (`src/features/TokenManagement`)**
    * Receives filtered list of token assets and the global `setAssets` function.
    * *(Internal structure assumed unchanged from V 0.4 description, focusing on interaction with `App.js`)*.

* **Payments (`src/features/Payments`)**
    * **Main Controller (`PaymentsDashboard.js`):**
        * Acts as the central hub, managing navigation within Payments (`paymentScreen` state).
        * **Manages central state** for `paymentHistory`, `templates`, and `recurringPayments`, initialized with dummy data (from `paymentConstants.js`).
        * Provides `addPaymentHistoryEntry`, `handleSaveTemplate`, `handleDeleteTemplate`, `handleToggleRecurring`, `handleDeleteRecurring`, `handleAuthorizeHvt`, `handleRejectHvt` functions to modify its state.
        * Receives `assets` (all accounts) and `setAssets` (global setter) from `App.js`.
        * Handles `handlePaymentSubmit` callback from creation screens, updating `paymentHistory` and conditionally calling `setAssets` for institutional balance changes.
        * Handles `handleBulkSubmit` callback from upload screen (logs to history).
        * Filters `paymentHistory` based on active view and passes `filteredHistory` and `handlePaymentHistoryRowClick` down to dashboard views.
        * Manages state for and renders `PaymentHistoryDetailModal`.
        * Correctly sources data for `ViewTransferDetailsScreen` from `paymentHistory`.
        * Passes state (`templates`, `recurringPayments`, `pendingHvts`) and relevant handlers down to child screens (`ViewTemplatesScreen`, `ManageRecurringPaymentsScreen`, `AuthorizeHVTScreen`).
    * **Reusable History Table (`PaymentHistoryTable.js`):**
        * Receives `history` array and `onRowClick` handler. Displays limited rows (5). Rows trigger `onRowClick`. (Uses shared `getStatusClass`). `View All` button is placeholder.
    * **Cross-Border View (`CrossBorderDashboardView.js`):**
        * Displays action cards (using `onNavigate`), static metrics.
        * Correctly renders `PaymentHistoryTable`, passing `history` and `onHistoryRowClick` props received from parent.
    * **Create Payment Screen (`CreatePaymentScreen.js`):**
        * Multi-step form for various payment types/origins. Uses controlled inputs.
        * Receives `assets` prop, filters internally for sender account dropdown.
        * Uses sub-components `TraditionalPaymentFields` and `OnChainPaymentFields`.
        * Uses shared utilities/constants (`renderError`, lists, rates from `paymentConstants.js`).
        * Calls `onPaymentSubmit` prop on confirmation.
        * *(Placeholder: Logic to pre-fill form using template data passed via navigation needs implementation)*.
    * **Sub-Component: `TraditionalPaymentFields.js`:** Renders Rail/Speed dropdowns for 'traditional' type. Uses props for data/state/handlers. Uses shared `renderError`.
    * **Sub-Component: `OnChainPaymentFields.js`:** Renders Network dropdown (client) or display (institutional) for 'on-chain' type. Uses props for data/state/handlers. Uses shared `renderError`.
    * **High-Value View (`HighValueDashboardView.js`):**
        * Displays action cards (using `onNavigate` for create/authorize, placeholder for history list). Static metrics.
        * **Now correctly renders `PaymentHistoryTable`**, passing `history` and `onHistoryRowClick` props received from parent.
    * **Create HVT Screen (`CreateHighValueTransferScreen.js`):**
        * Multi-step form. Receives `assets`, calls `onPaymentSubmit` (setting status 'Pending Approval'). Uses constants from `paymentConstants.js`.
    * **Authorize HVT Screen (`AuthorizeHVTScreen.js`):**
        * **No longer manages local HVT list.** Receives `pendingHvts` list (derived from `paymentHistory` in parent) via props.
        * Displays queue, handles local search/selection state.
        * Authorize/Reject buttons now call callback props (`onAuthorizeHvt`, `onRejectHvt`) to trigger state updates in `PaymentsDashboard`.
        * "View Details" button uses `onNavigate`.
    * **View HVT Details Screen (`ViewTransferDetailsScreen.js`):**
        * Displays read-only details. Receives `transfer` object prop. Uses `onBack` prop. Data now correctly sourced from `paymentHistory` via `PaymentsDashboard`. Uses shared `formatAmount`, `getStatusClass`.
    * **Bulk Payments View (`BulkDashboardView.js`):**
        * Displays action cards (using `onNavigate` for upload, placeholder for create template). Static metrics.
        * **No longer displays static file list/activity.**
        * **Now correctly renders `PaymentHistoryTable`**, passing `history` (filtered for bulk activity) and `onHistoryRowClick` props received from parent.
    * **Upload Bulk File Screen (`UploadBulkFileScreen.js`):**
        * Simulates upload UI/workflow. Receives `assets`. Calls `onBulkSubmit` prop (now implemented in parent to log history).
    * **View Templates Screen (`ViewTemplatesScreen.js`):**
    * **Manages its own template list locally** using `useState` (`localTemplates`), initialized with its own dummy data. **Does not use centralized state/handlers from`PaymentsDashboard` for create/edit/delete.** (Deviation from original V0.5 plan).
        * Handles local search/filter state.
        * Create/Edit actions trigger `CreateEditTemplateModal`. Save action calls `handleModalSave` which updates *local* state.
        * Delete action calls `handleDeleteClick` which updates *local* state after confirmation.
        *  "Use Template" action uses the `onNavigate` prop (passed from `PaymentsDashboard`) to send selected template data to `CreatePaymentScreen`.
        * Receives `assets` prop for use within the modal.
    * **Modal: `CreateEditTemplateModal.js`:**
        * Modal form for creating/editing templates. Receives `template` data for editing.
        * Uses props `onClose` and `onSave` (calls parent's `handleSaveTemplate`). Uses shared `renderError` and constants.
    * **Manage Recurring Payments Screen (`ManageRecurringPaymentsScreen.js`):**
        * Receives `recurringPayments` list via props from `PaymentsDashboard`.
        * Receives callbacks `onToggleRecurringStatus`, `onDeleteRecurring`, `onEditRecurring`, `onSetupNewRecurring` from `PaymentsDashboard`.
        * Handles local state for search (`searchTerm`), status filter (`statusFilter`), and view mode (`viewMode`: 'list' or 'calendar').
        * Provides toggle buttons to switch between List and Calendar views.
        * **List View:** Displays filtered list (`filteredListPayments`) of recurring payments with details and action buttons (Pause/Play/Edit/Delete) which trigger callbacks.
        * **Calendar View:**
           * Calculates `upcomingOccurrences` using `useMemo` and `date-fns`, determining all occurrences of active, filtered payments within a defined future timeframe (e.g., 30 days) based on their `nextDate` and `frequency`.
           * Transforms `upcomingOccurrences` into `calendarEvents` format for `react-big-calendar`.
           * Renders a visual calendar using `react-big-calendar`, displaying the calculated `calendarEvents`.
           * Implements a **custom toolbar** with state (`calendarView`, `calendarDate`) and handlers (`MapsToPrev`, `MapsToNext`, `MapsToToday`, `changeCalendarView`) to control calendar navigation and view, passing necessary props (`view`, `date`, `onNavigate`, `onView`) to the controlled `<Calendar>` component and hiding the default toolbar.
   * **Modal: `RecurringPaymentModal.js`:**
    * Modal form for creating or editing recurring payment definitions.
    * Receives props: `isOpen`, `onClose`, `onSave` (callback to `PaymentsDashboard`), `recurringPaymentData` (data for editing, or null for create), `assets` (for 'From Account' dropdown).
    * Contains form fields for name, source account, recipient details, amount, currency, frequency, start date, etc.
    * Manages internal form state and performs basic validation.
    * Calls the `onSave` prop with the form data when the save button is clicked and validation passes.
    * **Payment History Modal (`PaymentHistoryDetailModal.js`):**
        * Displays details of a selected history entry. Receives `entry` prop. Uses `onClose` prop. Uses shared `getStatusClass`.

* **Component Structure Summary:** Organized via `src/components` and `src/features`. Shared state mostly managed in `App.js` (`allAccounts`) and `PaymentsDashboard.js` (`paymentHistory`, `templates`, `recurringPayments`), passed down via props. Child components use callbacks to trigger state updates in parents. Shared utilities/data in `src/utils` and `src/data`.

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
...