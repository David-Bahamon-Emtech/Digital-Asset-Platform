# Digital-Asset-Platform V 0.2

A React-based front-end demonstration for managing digital assets, showcasing token issuance, minting, burning, redeeming, reserve viewing, and overview functionalities. Built using React and Tailwind CSS.

**Note:** This is currently a self-contained front-end demo. All data (initial assets, balances, newly issued tokens) is managed in the application's state and is **not persistent**; refreshing the browser or restarting the server will reset the state to the initial defaults. No backend APIs are connected.

## Key Features (Current)

* **Dashboard Overview (`TokenDashboard.js`):**
    * Displays a grid of managed digital assets (e.g., USDC, USDT, user-created tokens).
    * Each asset card shows key details: Label, Description, Supply Type, Current Balance, Blockchain.
    * Includes logos for specific assets and blockchains. Displays a generic logo for user-created tokens.
    * Provides functional action cards for navigating to Issue/Mint, Burn, Redeem, and Reserve Management screens.

* **Clickable Asset Cards:**
    * Dashboard cards are interactive, leading to a detailed view upon clicking.

* **Asset Detail View (`AssetDetailView.js`):**
    * Provides an expanded view of a selected asset.
    * Displays hardcoded "official" information for pre-defined assets.
    * Displays the full configuration details captured during the issuance process for user-created tokens (including reserve backing details).
    * Includes relevant asset and blockchain logos.

* **Token Lifecycle Workflows:**
    * **Issuance Choice Screen (`IssuanceChoiceScreen.js`):** Allows users to select between issuing a brand new token or minting more of an existing one.
    * **New Token Issuance Wizard (`TokenIssuanceWizard.js`):** Guides the user through defining a new token via distinct steps (Token Details, Supply & Metadata, Permissions, Proof of Reserves, Finalization). Collects a `valueDefinition` (e.g., "1 USDC") used for simulated swap rates.
    * **Mint Existing Token (`MintExistingToken.js`):** Provides a form to select an existing token, specify an amount and optional reason, confirm details, and increase its balance (mint).
    * **Burn Token (`BurnTokenScreen.js`):** Provides a form to select a token, specify an amount and reason to burn (permanently decrease supply). Includes a simulated multi-step (Compliance, Treasury) approval workflow before final execution.
    * **Redeem Token (`RedeemTokenScreen.js`):** Provides a form to select a token and amount to redeem. Allows choosing between:
        * Redeeming for the implicit underlying asset.
        * Swapping for another token available on the platform (using simulated exchange rates derived from issuance definitions or base values).
        * Includes fields for receiving account, purpose, and terms acknowledgement.
        * Displays an estimated preview of the redemption/swap.
        * Includes a simulated multi-step (2-Factor Auth) approval workflow before final execution.

* **Reserve Management (`ReserveManagementScreen.js`):**
    * Allows selecting different assets (including user-issued) via tabs with logos.
    * Displays simulated reserve data for the selected asset (Circulation, Ratio, Composition, Accounts list).
    * Generates fallback reserve data for user-issued tokens based on their current balance and issuance configuration.
    * Conditionally displays reserve backing attestation details captured during the issuance process for user-issued tokens.
    * Provides buttons to generate and download simulated CSV reports (Attestation, Historical).
    * Includes a modal ("View All Accounts") to display a larger list of simulated reserve accounts.
    * Includes a modal ("Configure Reserve Alerts") to set a simulated reserve ratio threshold for the selected asset.
    * Displays a visual alert if the simulated reserve ratio falls below the configured threshold.

* **Component Structure:** Organized using `src/components` for reusable UI elements (Layout, Sidebar) and `src/features` for feature-specific modules (TokenManagement, TokenIssuance).

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