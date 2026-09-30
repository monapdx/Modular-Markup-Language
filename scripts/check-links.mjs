import {files,read,exists,references,resolveReference,slug,finish} from './maintenance-lib.mjs';
const issues=[];const external=new Set();const checked=new Map();
for(const file of [...files('DOCS'),...files('export')].filter(p=>/\.(md|html)$/.test(p))) {
 for(const url of references(file)) {
  if(/^https?:/i.test(url)){external.add(url);continue;}
  if(/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(url))continue;
  const target=resolveReference(file,url);if(!target||target.startsWith('../')){issues.push(`${file}: invalid path ${url}`);continue;}
  let actual=target;if(exists(actual)&&! /\.(md|html|css|js|png|jpg|gif|svg|json)$/i.test(actual))actual=actual.replace(/\/$/,'')+'/index.html';
  if(!exists(actual)){issues.push(`${file}: missing target ${url}`);continue;}
  if(url.includes('#')&&url.split('#')[1]&&/\.(md|html)$/.test(actual)) {
   let fragment;try{fragment=decodeURIComponent(url.split('#')[1]);}catch{issues.push(`${file}: invalid fragment ${url}`);continue;}
   if(!checked.has(actual)){const s=read(actual),ids=new Set();const counts=new Map();for(const m of s.matchAll(/^#+\s+(.+)$/gm)){const id=slug(m[1]),n=counts.get(id)??0;counts.set(id,n+1);ids.add(n?`${id}-${n}`:id);}for(const m of s.matchAll(/\bid=["']([^"']+)["']/g))ids.add(m[1]);checked.set(actual,ids);}
   if(!checked.get(actual).has(fragment))issues.push(`${file}: missing anchor ${url}`);
  }
 }
}
if(process.argv.includes('--external'))for(const url of [...external].sort()) {
 try {const response=await fetch(url,{method:'GET',signal:AbortSignal.timeout(15000)});await response.body?.cancel();if(!response.ok)issues.push(`External: ${response.status} ${url} (review before removing; some sites block automated checks).`);}catch(e){issues.push(`External: ${url}: ${e.message}`);}
}
finish(issues);
