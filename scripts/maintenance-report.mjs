import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
import {root,write} from './maintenance-lib.mjs';

const lines=['# MML maintenance report',''];
let failed=false;
for(const script of ['tests/run-tests.js','scripts/check-tag-sync.mjs','scripts/check-examples.mjs','scripts/check-repo-paths.mjs','scripts/check-links.mjs']) {
 const args=[script];
 if(process.argv.includes('--external')&&script.endsWith('check-links.mjs'))args.push('--external');
 const result=spawnSync(process.execPath,args,{cwd:root,encoding:'utf8',timeout:process.argv.includes('--external')?600000:60000,maxBuffer:10*1024*1024});
 const ok=result.status===0&&!result.error;
 failed ||= !ok;
 const output=(result.stdout??'')+(result.stderr??'')+(result.error?.message??'');
 const heading=script+': '+(ok?'PASS':'FAIL');
 console.log(process.env.GITHUB_ACTIONS?'::group::'+heading:heading);
 process.stdout.write(output.endsWith('\n')?output:output+'\n');
 if(process.env.GITHUB_ACTIONS)console.log('::endgroup::');
 lines.push('## '+heading,'','~~~~text',output,'~~~~','');
}
const report=lines.join('\n');
write('maintenance-report.md',report);
if(process.env.GITHUB_STEP_SUMMARY)fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,report);
console.log('Wrote maintenance-report.md');
if(failed) {
 console.error('Maintenance checks found issues. Read the check output above or the Actions summary.');
 process.exitCode=1;
}
