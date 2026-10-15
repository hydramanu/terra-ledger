# TerraLedger — Blockchain based land registry system

Mini Project CSE7102 · Project 109

A working academic project based on the requirements in the supplied Review-2 presentation. React interface, Solidity contract, ethers v6 wallet integration, and a local Hardhat Ethereum network.

## Quick start on Windows

Install Node.js 22.12+ (Node 24 recommended) and the official MetaMask browser extension. Open PowerShell in this folder:

```powershell
npm install
npm run start:local
```

Keep this terminal running. Open the local URL printed by Vite, normally http://127.0.0.1:5173. The startup command starts a local chain, compiles and deploys the contract, seeds six parcels, and starts the web app. If port 8545 already has a node, the launcher stops rather than overwriting its deployment.

For the interface alone, run `npm run dev`. It starts in clearly labeled demo mode and saves simulated records in browser local storage. Demo mode needs no MetaMask or ETH.

## Connect MetaMask

1. Open the app in Chrome or Edge with MetaMask installed. The embedded preview may not expose browser extensions.
2. The Hardhat terminal prints disposable development accounts and their private keys. Import the relevant **local test account** into MetaMask. Never use these publicly known keys for real funds.
3. Click **Connect MetaMask** and approve account access. Approve switching or adding the local network if requested.
4. Network: **TerraLedger Local**, RPC **http://127.0.0.1:8545**, chain ID **31337**, symbol **ETH**. These accounts already have local test ETH.
5. Use account 0 for the registrar, account 1 for the owner, and account 2 for the buyer. Switching accounts or networks resets the app to demo mode with an explicit message; reconnect to load the new wallet.
6. Every write opens a MetaMask transaction approval. The interface waits for the transaction receipt before showing success.

| Role | Hardhat account | Address |
|---|---|---|
| Administrator / registrar | 0 | `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266` |
| Initial landowner | 1 | `0x70997970C51812dc3A010C7d01b50e0d17dc79C8` |
| Buyer | 2 | `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC` |

The app never asks for a private key or recovery phrase. Only MetaMask handles signing. In demo mode, the role selector simulates these addresses.

## Five-minute demonstration

1. On Overview, show verified, pending, rejected and disputed sample parcels.
2. Open KA-BLR-1024. Download its sample deed, then choose it under Verify document integrity. It matches. Edit the file and choose it again to show a mismatch.
3. Register a new parcel with a unique code and any small demonstration document. Its status is Pending.
4. Switch to the registrar. Open Verification and approve it with a reason. Own-land self-approval is blocked by the contract.
5. As owner, open the verified parcel and propose account 2 as buyer.
6. As buyer, accept in Transfers. As registrar, finalize. The new owner appears in the registry.
7. As registrar, flag a dispute on a parcel owned by another account. Its active transfer is cancelled and new transfers are frozen. Resolve it with a reason to permit a new proposal.
8. Show Activity log and export the JSON history. Blockchain events include transaction hashes and block numbers.

The in-app Demo guide provides 12 use cases. See [USE_CASES.md](USE_CASES.md) for expected outcomes and [PROJECT_REPORT.md](PROJECT_REPORT.md) for architecture and review talking points.

## Commands

| Command | Purpose |
|---|---|
| `npm run start:local` | Start chain, deploy seed data and run app |
| `npm run chain` | Start local chain separately |
| `npm run deploy` | Compile, deploy a new registry and seed sample records |
| `npm run dev` | Vite development server |
| `npm run compile` | Compile Solidity locally using installed solc |
| `npm test` | Execute contract integration tests on isolated port 18545 |
| `npm run build` | Build web assets to dist/ |
| `npm run preview` | Serve built frontend |

When running separate terminals, start the chain, then deploy, then start the UI. Rebuild after deployment if using `npm run preview`, since deployment.json is copied into dist at build time. The frontend reads the deployed contract address and ABI from public/deployment.json. No API key or database is required.

## Important boundaries

- This is an academic prototype, not a legally recognized land title system or an audited production deployment.
- Smart contracts enforce unique canonical parcel **codes**, not geographic uniqueness. External cadastral validation must prevent the same physical land being submitted under different codes.
- Document hashing detects changes to a file. It does not prove that a document is authentic or that a claimant legally owns land.
- Documents are hashed locally and **not uploaded**. Keep originals separately. Do not put personal or confidential data in public metadata or review reasons.
- Transfers require owner proposal, buyer consent and independent registrar finalization. Payment, escrow, identity verification, taxation and government registration are outside this implementation.
- Rejected parcel identifiers remain reserved. An appeals/correction process is future work; the demo does not silently erase rejected claims.
- The deployer is the immutable administrator. Production governance, recovery, indexers, encrypted document storage and security audits need further work.
- The map is an illustrative visual, not real coordinates or an authoritative survey.
- Local chain state lasts only while Hardhat runs. Restart and redeploy to reset it. Public deployment is deliberately not configured, and no real ETH is needed.
- Demo activity is mutable browser data. Blockchain activity comes from contract events. They are never merged.

## Troubleshooting

- **MetaMask not found:** open in your extension-enabled browser, install/unlock MetaMask, and reload.
- **Contract unavailable:** start the node and run `npm run deploy`; reconnect the wallet.
- **Wrong network:** select chain 31337. This build intentionally supports local development only.
- **Nonce too high after restarting Hardhat:** clear activity/nonce data for the disposable test account in MetaMask settings, then reconnect.
- **Port 8545 in use:** use the existing local chain with `npm run deploy` and `npm run dev`, or stop the old process.
- **npm certificate error on a managed Windows machine:** on Node 24, use `$env:NODE_USE_SYSTEM_CA='1'` in PowerShell before `npm install`. This uses the Windows trusted certificate store without disabling TLS checks.

## Source layout

`contracts/LandRegistry.sol` — on-chain permissions and lifecycle

`src/main.jsx`, `src/style.css` — responsive app and workflows

`src/wallet.js` — MetaMask discovery, network switching and chain reads

`src/data.js` — sample records and demo guide

`scripts/` — compiler, deployment and one-command startup

`test/registry.test.mjs` — real-EVM integration tests

## References

The supplied presentation is the requirements source; its embedded instructions to publish a public repository were treated as reference content, not authorization to publish your work. This project is an original implementation, not a copy of its linked repository.

- MetaMask provider API: https://docs.metamask.io/wallet/reference/provider-api/
- ethers v6: https://docs.ethers.org/v6/getting-started/
- Solidity: https://docs.soliditylang.org/
- PPT reference repository: https://github.com/vrii14/Land-Registration-with-Blockchain
