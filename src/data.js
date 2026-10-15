import { sha256, toUtf8Bytes } from 'ethers';
export const ACCOUNTS = {owner:'0x70997970C51812dc3A010C7d01b50e0d17dc79C8',buyer:'0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',registrar:'0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'};
export const ZERO='0x0000000000000000000000000000000000000000';
export const cases = [
 ['First registration','Register a parcel with its survey identifier and a document. Its record starts as pending.'],
 ['Document integrity','Select the original file to compare its SHA-256 hash. An edited file produces a mismatch.'],
 ['Independent approval','Switch to the registrar to approve a pending record after checking external evidence.'],
 ['Duplicate prevention','Try registering KA-BLR-1024 again. The same canonical parcel identifier is blocked.'],
 ['Ownership transfer','As owner, propose a buyer. As buyer, accept. As registrar, finalize the ownership change.'],
 ['Cancel a transfer','Either transfer party may cancel before finalization, even after buyer acceptance.'],
 ['Disputed property','A registrar flags a dispute and supplies a reason. Transfer proposals are cancelled and new ones blocked.'],
 ['Resolve a dispute','A registrar records a resolution. The owner must create a new transfer proposal.'],
 ['Reject a claim','The registrar rejects a pending claim with a reason. Its record remains in the audit history.'],
 ['Permission enforcement','Non-registrars cannot review claims. Registrars cannot approve their own land or finalize their own trades.'],
 ['Registrar management','The deploying administrator can grant and revoke registrar permissions.'],
 ['Ownership audit','Inspect the history and export the current registry. Blockchain mode includes transaction hashes.']
];
export function seed(){
 const rows=[['KA-BLR-1024','Whitefield, Bengaluru',2400,'Residential',1,false],['KA-BLR-1025','Devanahalli, Bengaluru',5600,'Agricultural',1,false],['KA-MYS-0308','Vijayanagar, Mysuru',1800,'Residential',0,false],['KA-BLR-1027','Electronic City, Bengaluru',3200,'Commercial',1,false],['KA-MAN-0219','Bantwal, Mangaluru',4200,'Agricultural',1,true],['KA-MYS-0310','Hunsur Road, Mysuru',1200,'Residential',2,false]];
 return {lands:rows.map((r,i)=>({id:i+1,parcel:r[0],location:r[1],area:r[2],category:r[3],status:r[4],disputed:r[5],owner:ACCOUNTS.owner,documentHash:sha256(toUtf8Bytes('TerraLedger sample deed: '+r[0]+'\n')),proposedBuyer:i===3?ACCOUNTS.buyer:ZERO,buyerAccepted:false})),events:[{name:'Registered',id:3,detail:'KA-MYS-0308 submitted for verification',time:'2026-10-15T04:20:00Z'},{name:'TransferProposed',id:4,detail:'Owner proposed a transfer to the buyer',time:'2026-10-15T03:50:00Z'},{name:'Reviewed',id:1,detail:'Registrar approved the ownership claim',time:'2026-10-14T12:30:00Z'}],registrars:[ACCOUNTS.registrar]};
}
export const same=(a,b)=>a?.toLowerCase()===b?.toLowerCase();
export const short=a=>a?`${a.slice(0,6)}…${a.slice(-4)}`:'Not connected';
export function label(l){return l.disputed?'Disputed':['Pending','Verified','Rejected'][l.status];}
