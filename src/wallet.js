import {BrowserProvider,Contract} from 'ethers';
let injected;
const discovered=[];
window.addEventListener('eip6963:announceProvider',e=>{if(e.detail?.info?.rdns==='io.metamask')discovered.push(e.detail.provider)});
window.dispatchEvent(new Event('eip6963:requestProvider'));
export async function connect(){
 injected=discovered[0] || window.ethereum?.providers?.find(p=>p.isMetaMask) || (window.ethereum?.isMetaMask?window.ethereum:null);
 if(!injected)throw new Error('Open this app in Chrome or Edge with the MetaMask extension installed, then reload.');
 await injected.request({method:'eth_requestAccounts'});
 let chain=await injected.request({method:'eth_chainId'});
 if(chain!=='0x7a69'){
  try{await injected.request({method:'wallet_switchEthereumChain',params:[{chainId:'0x7a69'}]});}
  catch(e){if(e.code!==4902)throw e;await injected.request({method:'wallet_addEthereumChain',params:[{chainId:'0x7a69',chainName:'TerraLedger Local',rpcUrls:['http://127.0.0.1:8545'],nativeCurrency:{name:'Test Ether',symbol:'ETH',decimals:18}}]});}
 }
 chain=await injected.request({method:'eth_chainId'});if(chain!=='0x7a69')throw new Error('Switch MetaMask to TerraLedger Local (31337) and reconnect.');
 const res=await fetch('/deployment.json',{cache:'no-store'});if(!res.ok)throw new Error('Start the local blockchain and run npm run deploy first.');
 const config=await res.json();const provider=new BrowserProvider(injected,undefined,{cacheTimeout:-1});const signer=await provider.getSigner();
 if(config.chainId!==31337 || await provider.getCode(config.address)==='0x')throw new Error('Contract unavailable. Run npm run deploy against the current local node, then reconnect.');
 const contract=new Contract(config.address,config.abi,signer);
 return {provider,contract,config,account:await signer.getAddress()};
}
export function watchWallet(fn){if(!injected)return ()=>{};injected.on('accountsChanged',fn);injected.on('chainChanged',fn);injected.on('disconnect',fn);return ()=>{injected.removeListener('accountsChanged',fn);injected.removeListener('chainChanged',fn);injected.removeListener('disconnect',fn)};}
export async function loadChain(session){
 const {contract,provider,config}=session;
 const count=Number(await contract.landCount());const lands=[];
 for(let start=1;start<=count;start+=25){lands.push(...await Promise.all(Array.from({length:Math.min(25,count-start+1)},(_,i)=>contract.getLand(start+i).then(l=>({id:Number(l.id),parcel:l.parcel,location:l.location,area:Number(l.area),category:l.category,documentHash:l.documentHash,owner:l.owner,status:Number(l.status),disputed:l.disputed,proposedBuyer:l.proposedBuyer,buyerAccepted:l.buyerAccepted})))));}
 const logs=await provider.getLogs({address:config.address,fromBlock:config.deploymentBlock,toBlock:'latest'});
 const events=logs.flatMap(log=>{try{const p=contract.interface.parseLog(log);const a=p.args;const details={Registered:()=>a.parcel+' registered by '+a.owner,Reviewed:()=>(a.approved?'Approved: ':'Rejected: ')+a.reason,TransferProposed:()=>'Proposed buyer: '+a.buyer,TransferAccepted:()=>'Accepted by '+a.buyer,TransferCancelled:()=>'Cancelled by '+a.actor,OwnershipTransferred:()=>a.previousOwner+' → '+a.newOwner,DisputeChanged:()=>(a.disputed?'Dispute opened: ':'Dispute resolved: ')+a.reason,RegistrarChanged:()=>a.account+(a.enabled?' granted registrar access':' revoked registrar access')};return [{name:p.name,id:Number(a.id||0),detail:details[p.name]?.()||p.name,hash:log.transactionHash,block:log.blockNumber}]}catch{return []}}).reverse();
 return {lands,events,isRegistrar:await contract.registrars(session.account),admin:await contract.admin()};
}
