import {test} from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import config from '../../src/building/rooms.json' with {type:'json'};
import {isPresented,isMobileRoom} from '../../src/building/presentation-layout.mjs';
import {MANIFEST_HASH} from '../../src/building/authority/version.mjs';
const {rooms}=config;
test('top-counted exclusions leave 76 unchanged permanent identities and fifteen crop rooms',()=>{
 assert.equal(rooms.length,80);assert.equal(new Set(rooms.map(r=>r.id)).size,80);
 const excluded=rooms.filter(r=>!isPresented(r));assert.equal(excluded.length,4);
 assert.deepEqual(excluded.map(r=>r.id),['room_041','room_042','room_065','room_066']);
 assert.equal(rooms.filter(isPresented).length,76);assert.equal(rooms.filter(isMobileRoom).length,15);
 assert.ok(['room_008','room_016','room_043','room_049','room_050','room_051','room_067','room_068','room_080'].every(id=>isPresented(rooms.find(r=>r.id===id))));
 assert.ok(rooms.filter(isMobileRoom).every(isPresented));
});
test('original Phase 7 compatibility fingerprint survives import relocation, not reseeding',async()=>{
 const hash=crypto.createHash('sha256');
 for(const [original,local] of [['public/rooms.json','rooms.json'],['src/director.mjs','director.mjs'],['src/behavior.mjs','behavior.mjs'],['src/state.mjs','state.mjs'],['authority/core.mjs','authority/core.mjs']]){
  let content=await fs.readFile(new URL('../../src/building/'+local,import.meta.url),'utf8');
  if(local==='authority/core.mjs')content=content.replace("../director.mjs","../src/director.mjs");
  hash.update(original+'\0');hash.update(content);
 }
 assert.equal(hash.digest('hex'),MANIFEST_HASH);
 assert.deepEqual(await fs.readFile(new URL('../../public/building/rooms.json',import.meta.url)),await fs.readFile(new URL('../../src/building/rooms.json',import.meta.url)));
});
