import fs from 'node:fs';
import { JsonRpcProvider, ContractFactory, sha256, toUtf8Bytes } from 'ethers';
import { compile } from './compile.mjs';
export async function deploy(url='http://127.0.0.1:8545', seed=true) {
 const provider=new JsonRpcProvider(url); const network=await provider.getNetwork();
 if(network.chainId!==31337n) throw new Error('This deployment script is restricted to local chain 31337.');
 const admin=await provider.getSigner(0), owner=await provider.getSigner(1), buyer=await provider.getSigner(2);
 const artifact=compile(); const registry=await new ContractFactory(artifact.abi,artifact.bytecode,admin).deploy(); await registry.waitForDeployment();
 const deploymentBlock=await provider.getBlockNumber();
 if(seed){
 const rows=[['KA-BLR-1024','Whitefield, Bengaluru',2400,'Residential'],['KA-BLR-1025','Devanahalli, Bengaluru',5600,'Agricultural'],['KA-MYS-0308','Vijayanagar, Mysuru',1800,'Residential'],['KA-BLR-1027','Electronic City, Bengaluru',3200,'Commercial'],['KA-MAN-0219','Bantwal, Mangaluru',4200,'Agricultural'],['KA-MYS-0310','Hunsur Road, Mysuru',1200,'Residential']];
 for(const row of rows) await (await registry.connect(owner).register(...row,sha256(toUtf8Bytes('TerraLedger sample deed: '+row[0]+'\n')))).wait();
 for(const id of [1,2,4,5]) await (await registry.review(id,true,'Sample survey and ownership evidence reviewed')).wait();
 await (await registry.review(6,false,'Sample case: insufficient ownership evidence')).wait();
 await (await registry.setDispute(5,true,'Sample case: boundary dispute under review')).wait();
 await (await registry.connect(owner).proposeTransfer(4,await buyer.getAddress())).wait();
 }
 return {provider,registry,config:{address:await registry.getAddress(),chainId:31337,deploymentBlock,abi:artifact.abi}};
}
const {config,provider}=await deploy(process.env.RPC_URL);
fs.mkdirSync('public',{recursive:true});fs.writeFileSync('public/deployment.json',JSON.stringify(config,null,2));
console.log('Local registry deployed:',config.address); provider.destroy();
