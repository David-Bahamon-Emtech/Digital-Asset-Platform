# Digital-Asset-Platform V 0.3

A React-based front-end demonstration for managing digital assets and simulating payment flows. Showcases token issuance, minting, burning, redeeming, reserve viewing, cross-border payments, HVT/bulk payment overviews, and related functionalities. Built using React and Tailwind CSS.

**Note:** This is currently a self-contained front-end demo. All data (initial assets, balances, newly issued tokens, payment/template/recurring data) is managed in the application's state or hardcoded and is **not persistent**; refreshing the browser or restarting the server will reset the state to the initial defaults. No backend APIs are connected.

## Key Features (Current)

* **Token Management (`src/features/TokenManagement`)**
    * **Dashboard Overview (`TokenDashboard.js`):**
        * Displays a grid of managed digital assets (e.g., USDC, USDT, user-created tokens).
        * Each asset card shows key details and logo. Includes generic logo for user-created tokens.
        * Provides functional action cards for navigating to Issue/Mint, Burn, Redeem, and Reserve Management screens.
        * Displays a filterable transaction history log with clickable rows for detail modal.
    * **Clickable Asset Cards:** Leads to a detailed view.
    * **Asset Detail View (`AssetDetailView.js`):** Provides expanded view of selected asset (official info for predefined, wizard config for user-issued). Includes simulated pause/unpause workflow.
    * **Token Lifecycle Workflows:**
        * **Issuance Choice Screen (`IssuanceChoiceScreen.js`):** Choice between issuing new or minting existing tokens.
        * **New Token Issuance Wizard (`TokenIssuanceWizard.js`):** Multi-step wizard (Details, Supply, Permissions, Reserves, Finalization) with simulated approval workflow.
        * **Mint Existing Token (`MintExistingToken.js`):** Form to select and mint more of an existing token with simulated approval.
        * **Burn Token (`BurnTokenScreen.js`):** Form to select and burn tokens with simulated multi-step approval.
        * **Redeem Token (`RedeemTokenScreen.js`):** Form to redeem tokens for underlying value or swap for other platform tokens (using simulated rates). Includes simulated multi-step approval.
    * **Reserve Management (`ReserveManagementScreen.js`):** Displays simulated reserve data (Circulation, Ratio, Composition, Accounts) for selected assets. Generates fallback data for user-issued tokens. Allows configuring simulated reserve alerts and downloading simulated reports. Includes modals for all accounts and alert configuration.
    * **History Detail Modal (`HistoryDetailModal.js`):** Displays details of a selected history log entry, including any associated notes.

* **Payments (`src/features/Payments`)**
    * **Main Dashboard (`PaymentsDashboard.js`):**
        * Acts as the central hub for the Payments feature.
        * Provides tabs to navigate between Cross-Border, High-Value Transfers, and Bulk Payments views.
        * Manages the active payment screen state.
        * Handles simulated payment submission logic (e.g., updating asset balances).
    * **Cross-Border Payments View (`CrossBorderDashboardView.js`):**
        * Displays action cards (New Payment, Templates, Recurring).
        * Shows simulated transaction metrics and a recent transactions table for cross-border activity.
    * **Create Payment Screen (`CreatePaymentScreen.js`):**
        * Multi-step form (Details, Review, Confirm) for initiating cross-border style payments (Tokenized, SWIFT, Internal types).
        * Uses controlled inputs linked to component state.
        * Dynamically populates sender accounts/wallets from managed assets and derives currency.
        * Includes balance checks against selected sending account.
        * Calculates and displays a dynamic preview of amounts and simulated fees.
        * Simulates payment submission by updating sender asset balance.
    * **High-Value Transfers View (`HighValueDashboardView.js`):**
        * Displays action cards (Initiate HVT, Review Pending, History).
        * Shows simulated metrics and a recent HVT table.
        * Provides navigation to HVT creation and authorization screens (placeholders).
    * **Bulk Payments View (`BulkDashboardView.js`):**
        * Displays summary stats for bulk processing.
        * Provides action cards (Upload File, Create Template).
        * Shows a table of active/recent bulk files and other stats (static data).
        * Provides navigation to bulk upload/template creation screens (placeholders).
    * **View Templates Screen (`ViewTemplatesScreen.js`):**
        * Displays a grid of simulated payment templates.
        * Includes working search and filter controls (Type, Recipient) acting on static data.
        * Action buttons (Use, Edit, Delete, Create) have placeholder handlers.
    * **Manage Recurring Payments Screen (`ManageRecurringPaymentsScreen.js`):**
        * Displays a table/list of simulated recurring payments.
        * Includes working status filters and search input acting on static data.
        * Includes a non-functional List/Calendar view toggle.
        * Action buttons (Setup New, Edit, Pause/Play, Delete) have placeholder handlers.
    * **Authorize HVT Screen (`AuthorizeHVTScreen.js`):**
        * Displays a queue of simulated pending High-Value Transfers requiring authorization.
        * Includes working status filters and search input acting on static data.
        * Implements UI for selecting single or multiple transfers for batch actions.
        * Action buttons (Authorize, Reject, View Details, Batch actions) have placeholder handlers.

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