import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const read = p => fs.readFileSync(path.join(root,p),'utf8');
export const exists = p => fs.existsSync(path.join(root,p));
export function files(dir) {
  if (!exists(dir)) return [];
  return fs.readdirSync(path.join(root,dir),{withFileTypes:true}).flatMap(e => {
    const p=path.posix.join(dir,e.name);
    return e.isDirectory() && !['node_modules','.git'].includes(e.name) ? files(p) : e.isFile() ? [p] : [];
  }).sort();
}
export function write(p,text) {fs.mkdirSync(path.dirname(path.join(root,p)),{recursive:true});fs.writeFileSync(path.join(root,p),text);}
export function finish(issues) {for(const issue of issues) console.error(issue);console.log(`${issues.length} issue(s)`);if(issues.length)process.exitCode=1;}
export const escape = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function stripFrontmatter(s) {return s.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/,'');}
export function slug(s) {return s.toLowerCase().replace(/<[^>]*>/g,'').replace(/[^\p{L}\p{N}_\s-]/gu,'').trim().replace(/\s/g,'-');}
export function references(file) {
 const s=read(file); const out=[];
 if(file.endsWith('.md')) {
  const clean=s.replace(/```[\s\S]*?```/g,'').replace(/`[^`]*`/g,'');
  for(const m of clean.matchAll(/!?\[[^\]]*\]\(([^\s)]+)(?:\s+"[^"]*")?\)/g))out.push(m[1]);
  for(const m of clean.matchAll(/^\s*\[[^\]]+\]:\s*(\S+)/gm))out.push(m[1]);
 }
 for(const m of s.matchAll(/\b(?:href|src)=["']([^"']+)["']/g))out.push(m[1]);
 return [...new Set(out)];
}
export function resolveReference(file,url) {
 let pathname;try {pathname=decodeURIComponent(url.split(/[?#]/)[0]);}catch{return null;}
 if(!pathname)return file;
 const base=file.startsWith('export/')?'export':'';
 return pathname.startsWith('/') ? path.posix.join(base,pathname.slice(1)) : path.posix.normalize(path.posix.join(path.posix.dirname(file),pathname));
}
