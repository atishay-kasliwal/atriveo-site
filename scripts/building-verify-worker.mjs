import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
const {default:worker}=await import(pathToFileURL(process.argv[2]||'/tmp/atriveo-building-worker-check/worker.js'));
let calls=0;
const env={ASSETS:{fetch:async()=>new Response('asset')},BUILDINGS:{idFromName:name=>{assert.equal(name,'atriveo-building-001');return name;},get:()=>({fetch:async request=>{calls++;return Response.json({method:request.method},{headers:{'Cache-Control':'no-store'}})}})}};
for(const [path,status,location] of [['/dashboard/jobs?x=1',308,'https://tracker.atriveo.com/dashboard/jobs?x=1'],['/?token=x',308,'https://tracker.atriveo.com/?token=x'],['/extension-install',308,'https://tracker.atriveo.com/extension-install'],['/sitemap.xml',301,'https://atriveo.com/sitemap-index.xml']]){
 const r=await worker.fetch(new Request('https://atriveo.com'+path),env);assert.equal(r.status,status);assert.equal(r.headers.get('location'),location);
}
const canonical=await worker.fetch(new Request('https://www.atriveo.com/projects/?a=1'),env);assert.equal(canonical.headers.get('location'),'https://atriveo.com/projects/?a=1');
for(const path of ['/','/projects/','/building/state']){const r=await worker.fetch(new Request('https://atriveo.com'+path),env);for(const h of ['strict-transport-security','referrer-policy','x-content-type-options','x-frame-options','permissions-policy'])assert.ok(r.headers.has(h));}
assert.equal(calls,1);console.log('Worker redirects, security headers, and same named object routing passed.');
