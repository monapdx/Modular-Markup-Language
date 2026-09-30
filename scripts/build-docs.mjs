import path from 'node:path';
import {marked} from 'marked';
import {files,read,write,stripFrontmatter,escape,slug,resolveReference} from './maintenance-lib.mjs';
for(const file of files('DOCS').filter(p=>p.endsWith('.md'))) {
 const out='export/'+file.replace(/\.md$/,'.html');const used=new Map();
 const renderer=new marked.Renderer();
 renderer.heading=function({tokens,depth}) {const text=this.parser.parseInline(tokens);const base=slug(text),n=used.get(base)??0;used.set(base,n+1);return `<h${depth} id="${escape(n?base+'-'+n:base)}">${text}</h${depth}>\n`;};
 const rewrite=url=>{if(/^(?:[a-z][a-z\d+.-]*:|#|\/\/)/i.test(url))return url;const suffix=url.match(/[?#].*$/)?.[0]??'';const target=resolveReference(file,url);if(!target)return url;let published=target.startsWith('export/')?target:'export/'+target;published=published.replace(/\.md$/,'.html');return path.posix.relative(path.posix.dirname(out),published)+suffix;};
 renderer.link=function({href,title,tokens}){return `<a href="${escape(rewrite(href))}"${title?` title="${escape(title)}"`:''}>${this.parser.parseInline(tokens)}</a>`;};
 renderer.image=function({href,title,text}){return `<img src="${escape(rewrite(href))}" alt="${escape(text)}"${title?` title="${escape(title)}"`:''}>`;};
 const css=path.posix.relative(path.posix.dirname(out),'export/style.css');
 const html=marked.parse(stripFrontmatter(read(file)),{renderer,gfm:true});
 write(out,`<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escape(path.posix.basename(file,'.md'))} — MML</title><link rel="stylesheet" href="${css}"></head><body class="theme-light"><main class="markdown-preview-view markdown-rendered">${html}</main></body></html>\n`);
 console.log(`Built ${out}`);
}
