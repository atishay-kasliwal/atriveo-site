import config from '../rooms.json' with {type:'json'};
import {BUILDING_ID,advanceWorld,publicEnvelope,parseAfter} from './core.mjs';
import {MANIFEST_HASH} from './version.mjs';
export class LivingBuilding{
 constructor(ctx,env){this.ctx=ctx;this.env=env;}
 async commit(now,rearm=false){return this.ctx.storage.transaction(async ()=>{const storage=this.ctx.storage;const previous=await storage.get('world');const {record,changed}=advanceWorld({record:previous,rooms:config.rooms,configHash:MANIFEST_HASH,now,seed:previous?undefined:crypto.getRandomValues(new Uint32Array(1))[0]});if(changed)await storage.put('world',record);if(changed||rearm)await storage.setAlarm(Math.max(now+50,record.checkpoint.nextAt));return record;});}
 async fetch(request){
  if(request.method!=='GET')return new Response('Read-only building',{status:405,headers:{Allow:'GET'}});
  if(new URL(request.url).pathname!=='/building/state')return new Response('Not found',{status:404});
  let after;try{after=parseAfter(request.url)}catch{return new Response('Invalid cursor',{status:400})}
  try{const now=Date.now(),record=await this.commit(now);return Response.json(publicEnvelope(record,now,after),{headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}})}catch(error){console.error(error);return Response.json({error:'Authority unavailable; preserve last known building'},{status:503,headers:{'Cache-Control':'no-store'}})}
 }
 async alarm(){await this.commit(Date.now(),true);}
}
export default{async fetch(request,env){if(new URL(request.url).pathname==='/building/state'){const id=env.BUILDINGS.idFromName(BUILDING_ID);return env.BUILDINGS.get(id).fetch(request)}return env.ASSETS?env.ASSETS.fetch(request):new Response('Not found',{status:404});}};
