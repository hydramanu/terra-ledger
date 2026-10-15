# Demonstration and acceptance cases

Use the demo role selector, or the corresponding MetaMask accounts on the local chain. Real permission enforcement lives in Solidity.

| Case | Steps | Expected result |
|---|---|---|
| Register land | Owner submits unique parcel, location, area, category and file | Pending record, owner equals signer, SHA-256 hash recorded |
| Duplicate parcel | Submit KA-BLR-1024 again | Rejected; no additional record |
| Canonical identifier | Type a lowercase identifier in UI | UI normalizes uppercase; contract rejects noncanonical direct calls |
| Invalid metadata | Submit zero area, blank location or missing file | Form or contract rejects |
| Approve title | Registrar reviews another owner's pending record | Verified; review event contains decision and reason |
| Self-approval | Grant owner registrar role, attempt to approve own land | Contract rejects |
| Reject claim | Registrar rejects pending record with reason | Rejected; history and reserved parcel code remain |
| Unapproved transfer | Try transferring Pending or Rejected land | No transfer action; direct contract call rejects |
| Propose transfer | Verified owner enters buyer wallet | Proposed buyer stored, ownership unchanged |
| Invalid buyer | Use zero address or current owner | Rejected |
| Buyer acceptance | Proposed buyer accepts | Accepted flag set; owner unchanged |
| Impersonated acceptance | Unrelated wallet accepts | Rejected |
| Early finalization | Registrar finalizes before buyer consent | Rejected |
| Successful transfer | Independent registrar finalizes accepted proposal | Buyer becomes owner; pending proposal cleared; event records old/new owners |
| Interested registrar | Buyer or owner with registrar role finalizes own transfer | Rejected |
| Cancel proposal | Owner or proposed buyer cancels before finalization | Proposal cleared, owner unchanged |
| Dispute freeze | Registrar flags parcel with reason | Disputed flag set; outstanding proposal cancelled; transfer blocked |
| Resolve dispute | Registrar records resolution | Unfrozen; previous proposal does not revive |
| Authentic file | Select seeded sample deed or original uploaded document | SHA-256 match |
| Altered file | Edit one character and recheck | Mismatch |
| Role administration | Admin grants/revokes another registrar | Permission change applies immediately on-chain |
| Unauthorized administration | Owner attempts to grant own registrar role | Rejected |
| Wallet change | Switch MetaMask account or network | App clears session; reconnect loads new account safely |
| Cancel wallet prompt | Reject connection or transaction in MetaMask | Error message; no success or fake state mutation |
| Audit | Open activity and export JSON | Demo identifies simulation; blockchain includes transaction hashes |

## Suggested review sequence

Demonstrate registration, verification and transfer first. Then show duplicate prevention, document tampering detection, dispute freeze and unauthorized access. Finish by displaying the ownership history and explaining the boundaries between blockchain integrity and external legal verification.
