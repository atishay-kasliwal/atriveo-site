import {chromium} from 'playwright';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const base=process.env.BUILDING_PREVIEW||'http://127.0.0.1:4455';
const out='docs/review/living-building/design';await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const report={environment:'Local production build; desktop Chrome/SwiftShader, emulated viewports, axe WCAG2 A/AA. Not physical-device or deployed performance evidence.',runs:[],errors:[]};
try{
 for(const [name,width,height,reducedMotion] of [['desktop',1440,1000,'no-preference'],['wide',1920,1080,'no-preference'],['laptop',1024,768,'no-preference'],['tablet',768,1024,'no-preference'],['mobile',390,844,'no-preference'],['reduced',390,844,'reduce']]){
  const c=await browser.newContext({viewport:{width,height},reducedMotion});await c.route('**/*googletagmanager*/**',r=>r.abort());
  const p=await c.newPage();p.on('pageerror',e=>report.errors.push(e.message));
  await p.goto(base);await p.waitForTimeout(2200);
  await p.addScriptTag({path:'node_modules/axe-core/axe.min.js'});
  const axe=await p.evaluate(async()=>{const result=await window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa']}});return result.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>n.target)}));});
  const geometry=await p.evaluate(()=>{const h=document.querySelector('.site-header').getBoundingClientRect(),brand=document.querySelector('.building-brand'),cta=document.querySelector('.building-cta');return{overflow:document.documentElement.scrollWidth>innerWidth,header:{x:h.x,width:h.width,height:h.height},brandFits:brand.scrollHeight<=brand.clientHeight,cta:cta.getBoundingClientRect().toJSON()};});
  assert.equal(geometry.overflow,false);assert.equal(geometry.header.x,0);assert.equal(geometry.header.width,width);assert.equal(geometry.header.height,60);assert.equal(geometry.brandFits,true);
  assert.equal(axe.filter(v=>['serious','critical'].includes(v.impact)).length,0);
  await p.screenshot({path:`${out}/${name}.png`});
  if(name==='desktop'){
   await p.locator('.building-cta').screenshot({path:out+'/cta-rest.png'});await p.locator('.building-cta').hover();await p.waitForTimeout(200);await p.locator('.building-cta').screenshot({path:out+'/cta-hover.png'});
   await p.locator('.building-cta').focus();await p.screenshot({path:out+'/keyboard.png'});
  }
  if(name==='mobile'){
   await p.locator('.mobile-nav summary').click();assert.equal(await p.locator('.mobile-nav').getAttribute('open')!==null,true);await p.screenshot({path:out+'/mobile-menu.png'});await p.keyboard.press('Escape');assert.equal(await p.locator('.mobile-nav').getAttribute('open'),null);
  }
  report.runs.push({name,width,height,reducedMotion,geometry,axe});await c.close();
 }
 for(const route of ['/projects/','/projects/cortex/','/about/','/open-source/','/missing-building-check/']){
  const c=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),p=await c.newPage();await c.route('**/*googletagmanager*/**',r=>r.abort());
  const response=await p.goto(base+route);assert.equal(response.status(),route.startsWith('/missing')?404:200);assert.equal(await p.locator('h1').count(),1);assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  await p.screenshot({path:out+'/inner-'+route.replaceAll('/','-')+'.png'});report.runs.push({route,status:response.status()});await c.close();
 }
 assert.equal(report.errors.length,0);
}catch(error){report.failure=error.stack;process.exitCode=1;console.error(error);}
finally{await browser.close();await fs.writeFile(out+'/report.json',JSON.stringify(report,null,2));console.log({runs:report.runs.length,errors:report.errors,failure:report.failure});}
