import {read,finish} from './maintenance-lib.mjs';
import {CANONICAL_ELEMENTS,ELEMENT_ALIASES,normalizeElementName} from '../export/src/grammar.js';
const issues=[];const tags=read('DOCS/TAGS.md');
const headings=[...tags.matchAll(/^#+\s+(?:\d+\.\s*)?(.+)$/gm)].map(m=>m[1].trim());
headings.push(...[...tags.matchAll(/^\s+(?:\d+\.\s*)?([a-z][a-z-]*)\s*$/gm)].map(m=>m[1]));
const documented=new Set(headings.flatMap(h=>h.split(/\s*\/\s*/)).filter(h=>/^[a-z][a-z-]*$/.test(h)).map(normalizeElementName));
for(const name of CANONICAL_ELEMENTS)if(!documented.has(name))issues.push(`TAGS: canonical tag '${name}' has no heading.`);
const total=tags.match(/CURRENT TOTAL:\s*(\d+)/);if(total&&Number(total[1])!==CANONICAL_ELEMENTS.size)issues.push(`TAGS: total ${total[1]} differs from ${CANONICAL_ELEMENTS.size} canonical tags.`);
const shorthand=read('DOCS/SHORTHAND.md').split('## OFFICIAL TAG SHORTHANDS')[1]?.split('## PROPOSED TAG SHORTHANDS')[0]??'';
const declared=new Set();
for(const m of shorthand.matchAll(/^\|\s*([a-z-]+)\s*\|\s*([^|]+)\|/gm)) {
 if(!/^[a-z]/.test(m[1]))continue;
 for(const alias of m[2].split(',').map(x=>x.trim())) {declared.add(alias);if(ELEMENT_ALIASES[alias]!==normalizeElementName(m[1]))issues.push(`SHORTHAND: '${alias}' does not map to '${m[1]}' in grammar.`);}
}
for(const [alias,target] of Object.entries(ELEMENT_ALIASES))if(!declared.has(alias))issues.push(`SHORTHAND: implemented '${alias}' → '${target}' is undocumented in the official table.`);
for(const line of read('DOCS/SYNONYMS.md').split('\n').filter(x=>x.startsWith('- ')&&x.includes('<--->'))) {
 const names=line.replace(/\*/g,'').slice(2).split('<--->').map(x=>x.trim());const target=normalizeElementName(names[0]);
 for(const name of names.slice(1))if(normalizeElementName(name)!==target)issues.push(`SYNONYMS: '${name}' is not an implemented alias of '${target}'.`);
}
finish(issues);
