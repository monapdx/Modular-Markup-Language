import {files,read,exists,resolveReference,finish} from './maintenance-lib.mjs';
const issues=[];
for(const file of [...files('scripts'),...files('export/src'),...files('tests')].filter(p=>/\.(m?js)$/.test(p))) {
 for(const m of read(file).matchAll(/(?:\bfrom\s*|\bimport\s*\(|\bimport\s*)["'](\.[^"']+)["']/g))if(!exists(resolveReference(file,m[1])))issues.push(`${file}: missing import ${m[1]}`);
 for(const m of read(file).matchAll(/path\.join\(__dirname,\s*['"]\.\.['"],\s*['"]([^'"]+)['"]/g))if(!exists(m[1]))issues.push(`${file}: missing directory ${m[1]}`);
}
for(const [name,command] of Object.entries(JSON.parse(read('package.json')).scripts??{})) {
 for(const m of command.matchAll(/\bnode\s+(?:--\S+\s+)*([^\s;&|]+)/g))if(!exists(m[1]))issues.push(`package.json: '${name}' references missing ${m[1]}`);
}
finish(issues);
