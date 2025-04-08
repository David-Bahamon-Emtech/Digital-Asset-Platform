# Digital-Asset-Platform V 0.4

A React-based front-end demonstration platform for managing digital assets and simulating various payment flows. Showcases token lifecycle management (issuance, minting, burning, redeeming, reserves) and payment operations (cross-border, high-value transfers, bulk payments). Built using React and Tailwind CSS.

**Note:** This is currently a self-contained front-end demo. All data (initial assets, balances, newly issued tokens, payment history, template/recurring lists, HVT lists) is managed in the application's state or hardcoded and is **not persistent**; refreshing the browser or restarting the server will reset the state to the initial defaults. No backend APIs are connected. All workflows (approvals, file processing, settlement times) are simulated using timeouts and placeholder logic.

## Key Features (Current)

* **Core Structure (`App.js`, `src/components/Layout`)**
    * Manages top-level navigation between feature areas (Token Management, Payments, etc.) via `activeTab` state.
    * Manages the shared list of digital `assets` (tokens and balances), passing state and update functions down to features.
    * Uses a consistent `Layout` component containing the sidebar navigation.

* **Token Management (`src/features/TokenManagement`)**
    * **Dashboard Overview (`TokenDashboard.js`):**
        * Displays a grid of managed digital assets with details and logos.
        * Provides action cards for main token operations.
        * Renders the Token Management specific history log.
        * *Note: Receives `assets` and `setAssets` props from `App.js`.*
    * **Asset Detail View (`AssetDetailView.js`):**
        * Displays detailed information for selected assets (predefined vs. user-issued).
        * Includes a simulated multi-step pause/unpause workflow for user-issued tokens. *(Note: Pause state change in parent needs implementation)*.
    * **Token Lifecycle Workflows:**
        * **Issuance Choice (`IssuanceChoiceScreen.js`):** Navigation screen.
        * **New Token Issuance (`TokenIssuanceWizard.js`):** Multi-step wizard (Details, Supply, Permissions, Reserves, Finalization) with simulated multi-step approval. Captures token configuration including value definition used for simulated swap rates.
        * **Mint Existing Token (`MintExistingToken.js`):** Form with simulated Treasury approval.
        * **Burn Token (`BurnTokenScreen.js`):** Form with simulated Compliance & Treasury approval. Captures optional notes.
        * **Redeem Token (`RedeemTokenScreen.js`):** Form allowing redemption for underlying value or swap for other platform tokens (using simulated rates). Includes simulated 2FA approval. Captures optional notes.
    * **Reserve Management (`ReserveManagementScreen.js`):** Displays simulated reserve data (using dummy data or generating based on issuance config). Allows configuration of simulated alerts and download of simulated reports.
    * **History Log & Modal (`TokenDashboard.js`, `HistoryDetailModal.js`):** Displays a log of token management actions. Rows are clickable to open a modal (`HistoryDetailModal`) showing details, including any notes captured during Burn/Redeem.

* **Payments (`src/features/Payments`)**
    * **Main Controller (`PaymentsDashboard.js`):**
        * Acts as the central hub for the Payments feature, rendered when the 'Payments' tab is active in `App.js`.
        * Provides tabs (Cross-Border, High-Value Transfers, Bulk Payments) to switch between different payment overview screens.
        * Manages the active `paymentScreen` state to control which sub-component/screen is displayed.
        * Manages the application's overall `paymentHistory` state (initialized with dummy data) and the `addPaymentHistoryEntry` function.
        * Filters the main `paymentHistory` based on the active view (e.g., showing only 'HVT' history when on the HVT dashboard) and passes the filtered list down to relevant dashboard view components.
        * Receives the shared `assets` list and `setAssets` function from `App.js`.
        * Handles the `onPaymentSubmit` callback from creation screens (Cross-Border, HVT), simulating balance updates via `setAssets` and logging to `paymentHistory`.
        * Manages state (`viewingTransferDetails`) for displaying HVT details.
        * Manages state (`isPaymentHistoryModalOpen`, `selectedPaymentHistoryEntry`) and provides the handler (`handlePaymentHistoryRowClick`) for the payment history detail modal.
        * Provides navigation handlers (`handleNavigate`, `handleBackToPaymentsDash`) passed down as props.
    * **Reusable History Table (`PaymentHistoryTable.js`):**
        * A reusable component designed to display a list of payment history entries.
        * Receives the (filtered) `history` array and an `onRowClick` handler as props.
        * Renders a table with standard columns (Timestamp, Type, Amount, Recipient, Status, Reference).
        * Includes clickable rows that trigger the `onRowClick` handler passed from the parent (`PaymentsDashboard`).
        * Currently displays only the 5 most recent entries with a placeholder "View All" button. Used within `CrossBorderDashboardView`, `HighValueDashboardView`, and `BulkDashboardView`.
    * **Cross-Border Payments View (`CrossBorderDashboardView.js`):**
        * Displays the specific dashboard content for the Cross-Border Payments tab.
        * Shows action cards (New Payment, Templates, Recurring) with functional navigation buttons calling the `onNavigate` prop.
        * Displays simulated transaction metrics.
        * Renders the filtered payment history for cross-border actions using the `PaymentHistoryTable` component (receives `history` and `onHistoryRowClick` props).
    * **Create Payment Screen (`CreatePaymentScreen.js`):**
        * Implements the full multi-step form (Details -> Review -> Confirm) for initiating Cross-Border style payments (Tokenized, SWIFT, Internal types).
        * Uses controlled inputs linked to component state for all form fields.
        * Dynamically populates the 'From Account' dropdown using the shared `assets` prop and performs balance checks. Currency is derived from the selected account.
        * Calculates and displays a dynamic preview of amounts and simulated fees based on state.
        * Includes functional step navigation ("Continue to Review", "Back to Edit", "Proceed to Confirm").
        * The "Confirm & Initiate Payment" button calls the `onPaymentSubmit` prop to simulate the transaction and trigger history logging in the parent dashboard.
    * **High-Value Transfers View (`HighValueDashboardView.js`):**
        * Displays the specific dashboard content for the High-Value Transfers tab.
        * Shows action cards (Initiate HVT, Review Pending, History) with functional navigation buttons calling the `onNavigate` prop.
        * Displays simulated HVT-specific metrics.
        * Renders the filtered payment history for HVT actions using the `PaymentHistoryTable` component (receives `history` and `onHistoryRowClick` props).
    * **Create HVT Screen (`CreateHighValueTransferScreen.js`):**
        * Implements a functional multi-step form (Details -> Review -> Submit) for initiating High-Value Transfers.
        * Uses controlled inputs linked to component state for HVT-specific fields (Value Date, Purpose Code, SWIFT addresses, etc.).
        * Integrates the shared `assets` prop for account selection and balance checks. Currency is derived.
        * Includes a simplified dynamic preview.
        * Includes functional step navigation.
        * The final "Submit HVT" button calls the `onPaymentSubmit` prop to simulate the transaction (setting status to 'Pending Approval') and trigger history logging.
    * **Authorize HVT Screen (`AuthorizeHVTScreen.js`):**
        * Displays a queue of simulated High-Value Transfers requiring authorization, managed in local component state (initialized with dummy data including various statuses).
        * Features functional status filter buttons and a search input operating on the local HVT list state.
        * Implements interactive "Authorize" and "Reject" buttons for individual transfers, which update the status within the component's state list.
        * Includes UI and state logic for selecting multiple pending transfers using checkboxes for batch actions. "Select All" applies to visible pending items.
        * "Batch Authorize" and "Batch Reject" buttons update the state for all selected items.
        * The "View Details" button correctly navigates (via `onNavigate` prop) to the detail screen.
    * **View HVT Details Screen (`ViewTransferDetailsScreen.js`):**
        * Displays detailed, read-only information about a specific High-Value Transfer.
        * Receives the complete transfer data object via the `transfer` prop from `PaymentsDashboard`.
        * Includes a functional "Back" button calling the `onBack` prop.
    * **Bulk Payments View (`BulkDashboardView.js`):**
        * Displays the specific dashboard content for the Bulk Payments tab.
        * Shows simulated summary statistics.
        * Includes action cards ("Upload File", "Create Template") with functional navigation buttons calling the `onNavigate` prop.
        * Shows a table of active/recent bulk files using static data defined within the component (buttons have placeholder handlers).
        * Renders filtered payment history related to bulk actions using the `PaymentHistoryTable` component (receives `history` and `onHistoryRowClick` props).
    * **Upload Bulk File Screen (`UploadBulkFileScreen.js`):**
        * Simulates the UI workflow for uploading a bulk payment file via a clickable area. No actual file reading occurs.
        * Manages internal state to simulate different validation outcomes (Validated, Validation Error) upon file selection.
        * Requires the shared `assets` prop to populate the source account dropdown (controlled input). File type dropdown is also controlled.
        * The final "Process Payment File" button simulates submission (logs to console, calls placeholder `onBulkSubmit` if provided) and navigates back. It's disabled until a file is "selected" and "validated" and a source account is chosen.
    * **View Templates Screen (`ViewTemplatesScreen.js`):**
        * Displays a grid of simulated payment templates using static data defined within the component.
        * Includes functional search input and filter dropdowns (Type, Recipient) that operate on the static template list. Recipient options are dynamically generated from the static data.
        * Action buttons on each template ("Use Template", "Edit", "Delete") and the main "Create Template" button currently have placeholder `console.log` handlers and do not perform actions or navigate. Pagination UI is static placeholders.
    * **Manage Recurring Payments Screen (`ManageRecurringPaymentsScreen.js`):**
        * Displays a table/list of simulated recurring payments managed within the component's state (initialized with dummy data).
        * Features functional search input and status filter buttons that update the displayed list based on the component's state.
        * Features a working List/Calendar view toggle button (Calendar view itself is a placeholder UI).
        * Interactive "Pause/Play" and "Delete" buttons modify the component's local `recurringPayments` state list, visually updating the table in real-time (Delete includes a confirmation prompt).
        * "Setup New" and "Edit" buttons have placeholder `console.log` handlers. Pagination UI is static placeholders.
    * **Payment History Modal (`PaymentHistoryDetailModal.js`):**
        * A modal component that displays the details (Timestamp, Type, Amount, Recipient, Status, Reference, ID) of a specific payment history entry.
        * Receives the entry data via props.
        * Opened when a row in the `PaymentHistoryTable` (rendered by dashboard views) is clicked. Includes a close button.

* **Component Structure:** Organized using `src/components` for reusable UI elements (Layout, Sidebar) and `src/features` for feature-specific modules (TokenManagement, Payments). Shared application state (`assets`) managed in `App.js`.


* **Component Structure:** Organized using `src/components` for reusable UI elements (Layout, Sidebar) and `src/features` for feature-specific modules (TokenManagement, Payments).

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

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.