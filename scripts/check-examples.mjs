import {files,read,finish} from './maintenance-lib.mjs';
import {processSource} from '../export/src/index.js';
const issues=[];let count=0;
for(const file of files('DOCS').filter(p=>p.endsWith('.md'))) {
 for(const m of read(file).matchAll(/^```(mml|mml-invalid)\s*\r?\n([\s\S]*?)^```\s*$/gm)) {
  count++;const line=read(file).slice(0,m.index).split('\n').length;
  try {const result=processSource(m[2]);const expected=m[1]==='mml';if(result.valid!==expected)issues.push(`${file}:${line}: expected ${expected?'valid':'invalid'} example: ${JSON.stringify(result.validationErrors)}`);}catch(e){issues.push(`${file}:${line}: ${e.message}`);}
 }
}
console.log(`Checked ${count} explicitly marked MML examples.`);
if(!count)issues.push('No examples marked with ```mml or ```mml-invalid. Label complete examples to enable validation; leave syntax fragments as text.');
finish(issues);
