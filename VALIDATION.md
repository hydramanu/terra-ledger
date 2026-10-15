# Validation record

Validated on 15 October 2026 with Node.js 24.14.1 on Windows.

- Production frontend build completed successfully.
- 16 real-EVM contract integration tests passed, including rejected unauthorized calls, duplicate prevention, transfer lifecycle, dispute freeze/resolution and role revocation.
- Local deployment completed and seeded six parcels on chain 31337.
- Browser inspection confirmed the dashboard and responsive sidebar render.
- Browser interaction confirmed buyer acceptance, registrar finalization and updated owner in demo mode.
- Browser file selection confirmed the original sample deed matches its SHA-256 fingerprint.
- Sample browser workspace was reset after testing.

MetaMask account access and transaction approval were not performed on the user's behalf. These require the user's extension and approval. No public testnet/mainnet deployment or production security audit was performed.

An initial test run found ethers' short-lived RPC cache could reuse a rejected gas estimate immediately after a dispute resolution. Disabling provider caching resolved that failure; all 16 cases then passed. Initial sandbox filesystem restrictions required build/test commands to run with approved local access.
