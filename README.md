# Digital-Asset-Platform V 0.2

A React-based front-end demonstration for managing digital assets, showcasing token issuance and overview functionalities. Built using React and Tailwind CSS.

**Note:** This is currently a self-contained front-end demo. All data (initial assets, newly issued tokens) is managed in the application's state and is not persistent; no backend APIs are connected.

## Key Features (Current)

* **Dashboard Overview (`TokenDashboard.js`):**
    * Displays a grid of managed digital assets (e.g., USDC, USDT, user-created tokens).
    * Each asset card shows key details: Label, Description, Supply Type, Current Balance, Blockchain.
    * Includes logos for specific assets (Circle, Tether, etc.) and blockchains (Stellar, Ethereum, etc.).
    * Displays a generic logo for user-created tokens.
    * Provides placeholder action cards for Issuing, Burning, Redeeming tokens, and viewing Reserves.
* **Clickable Asset Cards:**
    * Dashboard cards are interactive, leading to a detailed view upon clicking.
* **Asset Detail View (`AssetDetailView.js`):**
    * Provides an expanded view of a selected asset.
    * Displays hardcoded "official" information (Issuer, Type, Reserve Info, Features) for pre-defined assets.
    * Displays the full configuration details (Token Details, Supply, Permissions, Regulatory Info, Reserves) captured during the issuance process for user-created tokens.
    * Includes relevant asset and blockchain logos.
* **New Token Issuance Workflow:**
    * **Choice Screen (`IssuanceChoiceScreen.js`):** Allows users to select between issuing a brand new token or minting more of an existing one (Mint Existing is currently a placeholder).
    * **Multi-Step Wizard (`TokenIssuanceWizard.js`):** Guides the user through defining a new token via distinct steps:
        * **Token Details:** Name, Symbol, Blockchain, Token Type (Currency, RWA, Capital Asset), Regulatory Information (Jurisdiction + Body).
        * **Supply & Metadata:** Initial Supply, Supply Type (Finite/Infinite), Decimals, Value Definition, Metadata.
        * **Permissions:** KYC Enabled, Fee Schedule Enabled, Pausable, Fungibility (Fungible/NFT), Expiration Date, Role Assignments (Admin, Minter, etc.).
        * **Proof of Reserves:** Configure if asset-backed and specify backing method (Bank, Smart Contract, Custodian) with relevant details.
        * **Finalization:** Review all configured details before issuing the token.
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