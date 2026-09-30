import {spawnSync} from 'node:child_process';
import {root,write} from './maintenance-lib.mjs';
const lines=['# MML maintenance report',''];let failed=false;
for(const script of ['tests/run-tests.js','scripts/check-tag-sync.mjs','scripts/check-examples.mjs','scripts/check-repo-paths.mjs','scripts/check-links.mjs']) {
 const result=spawnSync(process.execPath,[script,...(process.argv.includes('--external')&&script.endsWith('check-links.mjs')?['--external']:[])],{cwd:root,encoding:'utf8',timeout:process.argv.includes('--external')?600000:60000});
 const ok=result.status===0&&!result.error;failed ||= !ok;lines.push(`## ${script}: ${ok?'PASS':'FAIL'}`,'','```text',(result.stdout??'')+(result.stderr??'')+(result.error?.message??''),'```','');
}
write('maintenance-report.md',lines.join('\n'));console.log('Wrote maintenance-report.md');if(failed)process.exitCode=1;
