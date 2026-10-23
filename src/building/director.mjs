// Pure data simulation. No DOM, Three.js, timers, network or frame clock.
import {action,candidates} from './behavior.mjs';
import {normalizeState} from './state.mjs';
export const RULES=Object.freeze({version:1,globalGapMs:60000,transitionMs:3500,curtainCooldownMs:1800000,reconsiderMs:1800000});
export function createBuildingDirector({rooms,startedAt=0,seed,snapshot}={}){
 if(!rooms?.length)throw Error('Rooms required');
 let randomState=(seed??globalThis.crypto.getRandomValues(new Uint32Array(1))[0])>>>0||1;
 const random=()=>{randomState^=randomState<<13;randomState^=randomState>>>17;randomState^=randomState<<5;return((randomState>>>0)+.5)/4294967296;};
 let now=startedAt,nextAt=startedAt,lastEvent=-Infinity,sequence=0,pending=null;
 const homes=new Map(rooms.map(r=>[r.id,{state:normalizeState(r,r.initial),changedAt:startedAt,curtainAt:startedAt,cooldowns:{},reconsiderAt:startedAt+RULES.reconsiderMs}]));
 let counters={events:0,opportunities:0,reconsiderations:0,curtains:0};
 function hour(at){return(22+(at-startedAt)/3600000)%24;}
 function boundary(at){return startedAt+(Math.floor((at-startedAt)/3600000)+1)*3600000;}
 function choices(at){
  const h=hour(at),lit=[...homes.values()].filter(x=>x.state.mainLight+x.state.accentLight+x.state.screen>.1).length/rooms.length;
  const target=h<6?.15:h<17?.3:h<23?.65:.35;const list=[];
  for(const r of rooms){const home=homes.get(r.id),s=home.state;
   if(at<home.changedAt+r.timing.minimumDwellSec*1000)continue;
   const opts=candidates(r,s,h).filter(([id])=>id!==s.activity&&(!['working','watching','screen_only'].includes(id)||r.capabilities.includes('screen'))&&(home.cooldowns[id]??-Infinity)<=at);
   // Retain the no-change probability in the denominator: the traveler stays quiet.
   const total=candidates(r,s,h).reduce((n,x)=>n+x[1],0);
   for(const[k,w]of opts){const bright=action[k].mainLight+action[k].accentLight+action[k].screen>.1;
    const pressure=Math.max(.35,Math.min(1.8,1+(bright?target-lit:lit-target)));
    list.push({roomId:r.id,kind:k,rate:w/total/(r.timing.meanDwellSec*1000)*pressure});}
   if(s.occupancy==='home'&&at>=home.curtainAt+RULES.curtainCooldownMs)list.push({roomId:r.id,kind:'curtain',rate:1/(8*3600000)});
  }return list;
 }
 function schedule(){
  let at=Math.max(now,lastEvent+RULES.globalGapMs),deadline=boundary(at);
  for(const r of rooms){const x=homes.get(r.id);for(const t of [x.changedAt+r.timing.minimumDwellSec*1000,x.curtainAt+RULES.curtainCooldownMs,x.reconsiderAt,...Object.values(x.cooldowns)])if(t>at)deadline=Math.min(deadline,t);}
  const list=choices(at),rate=list.reduce((n,x)=>n+x.rate,0),wait=rate?-Math.log(random())/rate:Infinity;
  if(at+wait<deadline){let p=random()*rate;pending=list.at(-1);for(const x of list){p-=x.rate;if(p<0){pending=x;break;}}nextAt=at+wait;}
  else{pending=null;nextAt=deadline;}
 }
 function advance(to){if(!Number.isFinite(to)||to<now)throw Error('Monotonic finite time required');const events=[];
  // No arbitrary catch-up cap: applying in chunks and after downtime gives identical states.
  while(nextAt<=to){now=nextAt;
   if(pending){const selected=pending;pending=null;counters.opportunities++;
    if(choices(now).some(x=>x.roomId===selected.roomId&&x.kind===selected.kind)&&now-lastEvent>=RULES.globalGapMs){
     const r=rooms.find(r=>r.id===selected.roomId),x=homes.get(r.id),before=x.state;let state;
     if(selected.kind==='curtain'){state=normalizeState(r,{...before,curtainOpen:before.curtainOpen>.65?.45:.92});x.curtainAt=now;counters.curtains++;}
     else{state=normalizeState(r,{...before,...action[selected.kind],curtainOpen:selected.kind==='sleeping'&&now>=x.curtainAt+RULES.curtainCooldownMs?Math.max(.28,before.curtainOpen-.16):before.curtainOpen});if(state.curtainOpen!==before.curtainOpen)x.curtainAt=now;x.cooldowns[before.activity]=now+r.timing.cooldownSec*1000;x.changedAt=now;}
     x.state=state;x.reconsiderAt=now+RULES.reconsiderMs;lastEvent=now;counters.events++;
     events.push({sequence:++sequence,at:now,roomId:r.id,kind:selected.kind,previous:before,state:{...state},durationMs:RULES.transitionMs});
    }
   }
   for(const x of homes.values())if(x.reconsiderAt<=now){x.reconsiderAt=now+RULES.reconsiderMs;counters.reconsiderations++;}
   schedule();
  }now=to;return events;
 }
 function checkpoint(){return JSON.parse(JSON.stringify({version:RULES.version,roomIds:rooms.map(r=>r.id),startedAt,now,nextAt,lastEvent:Number.isFinite(lastEvent)?lastEvent:null,sequence,randomState:randomState>>>0,pending,homes:Object.fromEntries(homes),counters}));}
 if(snapshot){if(snapshot.version!==RULES.version||JSON.stringify(snapshot.roomIds)!==JSON.stringify(rooms.map(r=>r.id))||snapshot.startedAt!==startedAt)throw Error('Incompatible checkpoint');now=snapshot.now;nextAt=snapshot.nextAt;lastEvent=snapshot.lastEvent??-Infinity;sequence=snapshot.sequence;randomState=snapshot.randomState;pending=snapshot.pending;counters={...snapshot.counters};for(const r of rooms)homes.set(r.id,structuredClone(snapshot.homes[r.id]));}else schedule();
 return{advance,get nextAt(){return nextAt},get now(){return now},states:()=>Object.fromEntries([...homes].map(([id,x])=>[id,{...x.state}])),snapshot:checkpoint,metrics:()=>({...counters,hour:hour(now),lit:[...homes.values()].filter(x=>x.state.mainLight+x.state.accentLight+x.state.screen>.1).length}),override(id,state,at=now){advance(at);const r=rooms.find(r=>r.id===id);if(!r)throw Error('Unknown room');const x=homes.get(id);x.state=normalizeState(r,{...x.state,...state});x.changedAt=at;x.curtainAt=at;x.reconsiderAt=at+RULES.reconsiderMs;schedule();}};
}
