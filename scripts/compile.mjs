import fs from 'node:fs';
import solc from 'solc';
import {pathToFileURL} from 'node:url';
export function compile() {
  const input = {language:'Solidity',sources:{'LandRegistry.sol':{content:fs.readFileSync(new URL('../contracts/LandRegistry.sol',import.meta.url),'utf8')}},settings:{optimizer:{enabled:true,runs:200},evmVersion:'paris',outputSelection:{'*':{'*':['abi','evm.bytecode.object']}}}};
  const result = JSON.parse(solc.compile(JSON.stringify(input)));
  const errors = (result.errors || []).filter(x=>x.severity==='error');
  if(errors.length) throw new Error(errors.map(x=>x.formattedMessage).join('\n'));
  const contract=result.contracts['LandRegistry.sol'].LandRegistry;
  return {abi:contract.abi,bytecode:'0x'+contract.evm.bytecode.object};
}
if(process.argv[1] && import.meta.url===pathToFileURL(process.argv[1]).href) {
  fs.mkdirSync('artifacts',{recursive:true}); fs.writeFileSync('artifacts/LandRegistry.json',JSON.stringify(compile(),null,2)); console.log('LandRegistry compiled.');
}
