import {chromium} from 'playwright';
import fs from 'node:fs/promises';
import sharp from 'sharp';
const base=process.env.BUILDING_PREVIEW||'http://127.0.0.1:4455';
const chunk=(await fs.readdir('dist/_astro')).find(name=>name.startsWith('presentation.'));
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try {
  const page=await browser.newPage({viewport:{width:1500,height:960},deviceScaleFactor:1});
  await page.route('**/__poster',route=>route.fulfill({contentType:'text/html',body:'<!doctype html><html><body style="margin:0"><living-building style="display:block;width:1500px"><div style="width:1500px;height:960px"><canvas></canvas></div></living-building></body></html>'}));
  await page.goto(base+'/__poster');
  await page.evaluate(async chunk=>{
    const {createPresentation}=await import('/_astro/'+chunk);
    const {rooms}=await (await fetch('/building/rooms.json')).json();
    window.posterPresentation=await createPresentation({canvas:document.querySelector('canvas'),rooms});
    for(const room of rooms)window.posterPresentation.apply(room.id,room.initial);
    window.posterPresentation.render();
  },chunk);
  await sharp(await page.locator('canvas').screenshot()).webp({quality:88}).toFile('public/building/poster.webp');
  await page.setViewportSize({width:600,height:420});
  await page.evaluate(()=>{document.querySelector('living-building').style.width='600px';const div=document.querySelector('living-building > div');div.style.width='600px';div.style.height='420px';window.posterPresentation.render();});
  await sharp(await page.locator('canvas').screenshot()).webp({quality:88}).toFile('public/building/poster-mobile.webp');
  console.log(await page.evaluate(()=>({metrics:window.posterPresentation.metrics,ids:window.posterPresentation.renderedIds,glass:window.posterPresentation.glassIds})));
  await page.evaluate(()=>window.posterPresentation.dispose());
} finally {await browser.close();}
