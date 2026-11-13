import {chromium} from 'playwright';
import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import assert from 'node:assert/strict';
import {gzipSync} from 'node:zlib';
import config from '../src/building/rooms.json' with {type:'json'};
import {isPresented} from '../src/building/presentation-layout.mjs';
const out='docs/review/living-building',base=process.env.BUILDING_PREVIEW||'http://127.0.0.1:4455';
await fs.mkdir(out,{recursive:true});
const report={environment:'Local production Astro assets + native local workerd/SQLite Durable Object; Chrome with SwiftShader. No cloud deployment, physical-device or capacity claim.',checks:{},pages:[],errors:[]};
const mime={'.html':'text/html','.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.json':'application/json','.webp':'image/webp'};
const baseline=http.createServer(async(req,res)=>{const root=process.env.BUILDING_BASELINE||'/tmp/atriveo-building-baseline';let file=path.join(root,new URL(req.url,'http://local').pathname);if(file.endsWith('/'))file+='index.html';try{res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');let body=await fs.readFile(file);if(/\.(html|js|css|json)$/.test(file)){body=gzipSync(body);res.setHeader('Content-Encoding','gzip');}res.end(body);}catch{res.writeHead(404);res.end();}});
await new Promise(r=>baseline.listen(4457,'127.0.0.1',r));
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
async function context(options={}){
 const c=await browser.newContext({viewport:{width:1440,height:1100},...options});
 await c.route('**/*google-analytics*/**',r=>r.abort());await c.route('**/*googletagmanager*/**',r=>r.abort());
 await c.addInitScript(()=>{
  window.loadStats={lcp:0,cls:0,longTasks:0};
  new PerformanceObserver(l=>{for(const e of l.getEntries())window.loadStats.lcp=e.startTime;}).observe({type:'largest-contentful-paint',buffered:true});
  new PerformanceObserver(l=>{for(const e of l.getEntries())if(!e.hadRecentInput)window.loadStats.cls+=e.value;}).observe({type:'layout-shift',buffered:true});
  new PerformanceObserver(l=>{window.loadStats.longTasks+=l.getEntries().length;}).observe({type:'longtask',buffered:true});
 });return c;
}
const diag=p=>p.locator('living-building').evaluate(e=>e.controller?.diagnostics());
async function measure(p,label){const data=await p.evaluate(()=>({url:location.href,...window.loadStats,fcp:performance.getEntriesByName('first-contentful-paint')[0]?.startTime,ready:performance.getEntriesByName('living-building-ready')[0]?.startTime,resources:performance.getEntriesByType('resource').map(r=>({name:new URL(r.name).pathname,bytes:r.encodedBodySize,transfer:r.transferSize,end:r.responseEnd}))}));report.pages.push({label,...data});}
async function layout(p,mobile){
 assert.equal(await p.locator('h1').count(),1);assert.equal(await p.locator('living-building h1').innerText(),'Atriveo.');
 assert.equal(await p.locator('living-building .building-cta').getAttribute('href'),'/projects/');
 assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 const boxes=await p.locator('living-building').evaluate(e=>{const r=x=>{const b=x.getBoundingClientRect();const t=new DOMMatrix(getComputedStyle(x).transform);return{x:b.x-t.m41,y:b.y-t.m42,w:b.width,h:b.height};};return{composition:r(e.querySelector('.building-composition')),brand:r(e.querySelector('.building-brand')),invite:r(e.querySelector('.building-invitation')),visual:r(e.querySelector('.building-visual'))};});
 if(mobile){assert.ok(boxes.brand.y+boxes.brand.h<=boxes.visual.y+1);assert.ok(boxes.invite.y>=boxes.visual.y+boxes.visual.h-1);}
 else{assert.ok(Math.abs((boxes.brand.x-boxes.composition.x)/boxes.composition.w)<.002);assert.ok(Math.abs((boxes.brand.y-boxes.composition.y)/boxes.composition.h-.125)<.002);assert.ok(Math.abs((boxes.invite.x-boxes.composition.x)/boxes.composition.w-.7)<.002);assert.ok(Math.abs((boxes.invite.y-boxes.composition.y)/boxes.composition.h-.75)<.002);}
 return boxes;
}
try{
 const baselineContext=await context();const old=await baselineContext.newPage();await old.goto('http://127.0.0.1:4457/');await old.waitForTimeout(1200);await old.screenshot({path:out+'/baseline-desktop.png'});await measure(old,'baseline desktop');await baselineContext.close();
 const c=await context(),p=await c.newPage();p.on('pageerror',e=>report.errors.push(e.message));
 await p.goto(base);await p.waitForFunction(()=>document.querySelector('living-building')?.hasAttribute('data-ready'),null,{timeout:120000});await p.waitForTimeout(1400);
 report.checks.desktop=await layout(p,false);await measure(p,'integrated desktop');await p.screenshot({path:out+'/desktop.png'});await p.screenshot({path:out+'/desktop-full.png',fullPage:true});
 const d=await diag(p),expected=config.rooms.filter(isPresented).map(r=>r.id);
 assert.equal(d.renderedIds.length,72);assert.equal(Object.keys(d.states).length,80);assert.deepEqual(d.metrics.geometryRoomIds,expected);assert.deepEqual(d.metrics.glassRoomIds,expected);assert.equal(d.metrics.mainCalls,3);
 report.checks.geometry=d.metrics;
 // Two independent browser contexts observe the same authority, including a skewed wall clock.
 const c2=await context();await c2.addInitScript(()=>{const realNow=Date.now;Date.now=()=>realNow()-86400000;});const p2=await c2.newPage();await p2.goto(base);await p2.waitForFunction(()=>document.querySelector('living-building')?.hasAttribute('data-ready'),null,{timeout:120000});
 await p.evaluate(()=>document.querySelector('living-building').controller.refresh());await p2.evaluate(()=>document.querySelector('living-building').controller.refresh());
 const [a,b]=await Promise.all([diag(p),diag(p2)]);assert.equal(a.sequence,b.sequence);assert.deepEqual(a.states,b.states);assert.equal(b.reducedMotion,false);report.checks.convergence={sequence:a.sequence,households:Object.keys(a.states).length,skewedWallClockClient:true};
 // Focus the actual HTML link via the keyboard, not a canvas hit target.
 await p.locator('.building-cta').focus();assert.equal(await p.locator('.building-cta').evaluate(e=>e===document.activeElement),true);report.checks.keyboardCtaFocus=true;
 await p.locator('living-building').evaluate(e=>e.style.transform='translateY(200vh)');await p.waitForTimeout(250);assert.equal((await diag(p)).visible,false);const off=(await diag(p)).metrics.frames;await p.waitForTimeout(500);assert.equal((await diag(p)).metrics.frames,off);report.checks.offscreenStops=true;
 await p.locator('living-building').evaluate(e=>e.style.transform='');await p.waitForTimeout(500);
 // Visibility handler tested explicitly; actual browser tab suspension remains device acceptance.
 await p.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));});const hidden=(await diag(p)).metrics.frames;await p.waitForTimeout(300);assert.equal((await diag(p)).metrics.frames,hidden);
 await p.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));});report.checks.visibilityHandler=true;
 await p.setViewportSize({width:390,height:844});await p.waitForTimeout(500);report.checks.mobile=await layout(p,true);await p.screenshot({path:out+'/mobile.png',fullPage:true});assert.equal((await diag(p)).metrics.visibleRooms,15);
 await p.setViewportSize({width:768,height:1024});await p.waitForTimeout(300);await layout(p,false);await p.screenshot({path:out+'/tablet.png'});
 await p.setViewportSize({width:1440,height:1100});await p.evaluate(()=>document.dispatchEvent(new Event('astro:before-swap')));assert.equal(await p.locator('living-building').evaluate(e=>e.controller===null),true);assert.equal(await p.locator('canvas').evaluate(e=>e.getContext('webgl2')?.isContextLost()),true);report.checks.navigationCleanup=true;
 await c.close();await c2.close();
 for(const mode of ['no-js','reduced-motion','no-webgl','state-outage','asset-failure']){
  const cx=await context({javaScriptEnabled:mode!=='no-js',reducedMotion:mode==='reduced-motion'?'reduce':'no-preference'});
  if(mode==='no-webgl')await cx.addInitScript(()=>{const get=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(kind,...args){return /^webgl/.test(kind)?null:get.call(this,kind,...args);};});
  if(mode==='state-outage')await cx.route('**/building/state*',r=>r.fulfill({status:503,body:'Unavailable'}));
  if(mode==='asset-failure')await cx.route('**/building/models/new-homes.glb',r=>r.fulfill({status:503,body:'Unavailable'}));
  const q=await cx.newPage();await q.goto(base);await q.waitForTimeout(mode==='asset-failure'?5000:1500);
  assert.equal(await q.locator('living-building').getAttribute('data-ready'),null);
  assert.equal(await q.locator('.building-poster').evaluate(e=>e.complete&&e.naturalWidth>0),true);await layout(q,false);
  assert.equal(await q.locator('.building-caption, .building-motion').count(),0);assert.equal(await q.locator('nav[aria-label="Primary navigation"] a[href="/projects/"]').isVisible(),true);
  if(mode==='reduced-motion'){await q.waitForFunction(()=>document.querySelector('living-building')?.controller?.diagnostics().states,null,{timeout:15000});assert.equal((await diag(q)).reducedMotion,true);assert.equal((await diag(q)).metrics,null);assert.equal(Object.keys((await diag(q)).states).length,80);assert.equal(await q.evaluate(()=>performance.getEntriesByType('resource').some(r=>r.name.includes('/presentation.'))),false);}
  await q.screenshot({path:out+'/'+mode+'.png'});await measure(q,mode);report.checks[mode]=true;await cx.close();
 }
 // Force a long committed-transition envelope only in this test context. It must not monopolize a GSAP tick.
 const activeEnvelope=await (await fetch(base+'/building/state')).json();
 const roomId=config.rooms[0].id,previous=activeEnvelope.snapshot.states[roomId],next={...previous,mainLight:previous.mainLight>.5?0:1};
 activeEnvelope.snapshot.sequence++;activeEnvelope.snapshot.serverTime=Date.now();activeEnvelope.snapshot.states[roomId]=next;
 activeEnvelope.snapshot.transitions=[{sequence:activeEnvelope.snapshot.sequence,at:activeEnvelope.snapshot.serverTime,roomId,previous,state:next,durationMs:60000,kind:'presentation-regression-fixture'}];activeEnvelope.reset=true;activeEnvelope.events=[];
 const fx=await context();await fx.route('**/building/state*',r=>r.fulfill({contentType:'application/json',body:JSON.stringify(activeEnvelope)}));const fp=await fx.newPage();await fp.goto(base);
 await fp.waitForFunction(()=>document.querySelector('living-building')?.hasAttribute('data-ready'),null,{timeout:20000});
 const responsiveness=await fp.evaluate(()=>new Promise(resolve=>{const t=performance.now();setTimeout(()=>resolve(performance.now()-t),100);}));assert.ok(responsiveness<1000,'An active transition must yield to the browser event loop');
 assert.equal((await diag(fp)).ticker,true);report.checks.activeTransitionResponsive={timerMs:responsiveness,fixture:'60-second committed transition; test interception only'};await fx.close();
 // The HTTP surface remains read-only and protects responses with the site's security headers.
 const state=await fetch(base+'/building/state');const envelope=await state.json();assert.equal(Object.keys(envelope.snapshot.states).length,80);assert.equal(JSON.stringify(envelope).includes('randomState'),false);
 for(const h of ['x-frame-options','permissions-policy','strict-transport-security'])assert.ok(state.headers.has(h));
 assert.equal((await fetch(base+'/building/state',{method:'POST'})).status,405);assert.equal((await fetch(base+'/building/state?after=bad')).status,400);
 assert.equal((await fetch(base+'/dashboard/jobs?x=1',{redirect:'manual'})).headers.get('location'),'https://tracker.atriveo.com/dashboard/jobs?x=1');report.checks.nativeEndpoint=true;
 const assets=[];for(const dir of ['public/building/models','public/building/atlases/128','public/building','dist/_astro'])for(const name of await fs.readdir(dir)){const file=path.join(dir,name);if(!(await fs.stat(file)).isFile())continue;const body=await fs.readFile(file);assets.push({file,bytes:body.length,gzipBytes:gzipSync(body).length});}report.assets=assets;
 assert.equal(report.errors.length,0);
}catch(error){report.failure=error.stack;process.exitCode=1;console.error(error);}
finally{await browser.close();await new Promise(r=>baseline.close(r));await fs.writeFile(out+'/validation.json',JSON.stringify(report,null,2));console.log(JSON.stringify({checks:Object.keys(report.checks),failure:report.failure,errors:report.errors}));}
