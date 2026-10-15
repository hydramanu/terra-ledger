import {spawn} from 'node:child_process';
import {setTimeout as delay} from 'node:timers/promises';
const children=[];
function run(args){const c=spawn(process.execPath,args,{stdio:'inherit'});children.push(c);return c;}
function clean(){for(const c of children)c.kill();}
process.on('SIGINT',()=>{clean();process.exit(0)});process.on('SIGTERM',()=>{clean();process.exit(0)});process.on('exit',clean);
async function rpc(){try{const r=await fetch('http://127.0.0.1:8545',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',id:1,method:'eth_chainId',params:[]})});return (await r.json()).result;}catch{return null;}}
if(await rpc()) {console.error('Port 8545 already has a node. Use npm run deploy and npm run dev, or stop the existing node first.');process.exit(1);}
const chain=run(['node_modules/hardhat/internal/cli/cli.js','node','--hostname','127.0.0.1']);
let ready=false;for(let i=0;i<60;i++){await delay(500);if(await rpc()==='0x7a69'){ready=true;break;}}
if(!ready){clean();throw new Error('Local blockchain did not start');}
const deploy=run(['scripts/deploy.mjs']);await new Promise((resolve,reject)=>deploy.on('exit',code=>code===0?resolve():reject(new Error('Deployment failed'))));
const web=run(['node_modules/vite/bin/vite.js','--host','127.0.0.1']);
web.on('exit',()=>{clean();process.exit(0)});chain.on('exit',()=>{clean();process.exit(1)});
