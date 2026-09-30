import {files,read,write} from './maintenance-lib.mjs';
import {CANONICAL_ELEMENTS,REQUIRED_PARENTS,ELEMENT_ALIASES} from '../export/src/grammar.js';
const roots=[...CANONICAL_ELEMENTS].filter(name=>!REQUIRED_PARENTS[name]);
const lines=['# Generated grammar index','','Generated from grammar.js. Parent rules describe parser boundaries; consult SPEC.md and validator.js for complete validation and attributes.','','## Schema implementations',''];
for(const file of files('export/src').filter(p=>p.endsWith('-schema.js')))lines.push(`- [${file.split('/').pop()}](../${file}) — exports: ${[...read(file).matchAll(/export\s+(?:const|function|class)\s+(\w+)/g)].map(m=>m[1]).join(', ')}`);
lines.push('','## Tags','','| Tag | Required parent candidates | Aliases |','| --- | --- | --- |');
for(const name of [...CANONICAL_ELEMENTS].sort())lines.push(`| ${name} | ${(REQUIRED_PARENTS[name]??[]).join(', ')||'No parent requirement'} | ${Object.entries(ELEMENT_ALIASES).filter(([,v])=>v===name).map(([k])=>k).join(', ')||'—'} |`);
lines.push('','See [SPEC.md](SPEC.md) for authored schema examples and attributes.','');write('DOCS/SCHEMA-INDEX.md',lines.join('\n'));console.log('Generated DOCS/SCHEMA-INDEX.md');
