// Shared household possibilities. Phase 4 runtime scheduling lives in director.mjs.
// The legacy independent controller remains for regression tests only.
export const action={
 working:{occupancy:'home',activity:'working',mainLight:0,accentLight:1,screen:1},
 screen_only:{occupancy:'home',activity:'working',mainLight:0,accentLight:0,screen:1},
 watching:{occupancy:'home',activity:'watching',mainLight:0,accentLight:.8,screen:.85},
 reading:{occupancy:'home',activity:'reading',mainLight:0,accentLight:1,screen:0},
 quiet:{occupancy:'home',activity:'quiet',mainLight:.82,accentLight:0,screen:0},
 sleeping:{occupancy:'sleeping',activity:'sleeping',mainLight:0,accentLight:0,screen:0},
 away:{occupancy:'away',activity:'away',mainLight:0,accentLight:0,screen:0},
};
export function entropy(){const n=new Uint32Array(1);globalThis.crypto.getRandomValues(n);return(n[0]+.5)/4294967296;}
function weighted(list,rng){const total=list.reduce((n,a)=>n+a[1],0);let p=rng()*total;for(const [id,w]of list){p-=w;if(p<0)return id;}return list.at(-1)[0];}
export function candidates(room,state,hour){
 const late=hour>=0&&hour<6;
 if(state.occupancy==='away')return late?[['away',.9],['quiet',.1]]:[['away',.8],['quiet',.2]];
 if(state.occupancy==='sleeping')return late?[['sleeping',.97],['reading',.03]]:[['quiet',.8],['reading',.2]];
 if(room.profile==='creative')return late?[['working',5],['screen_only',2],['sleeping',2],['reading',1]]:[['working',5],['reading',2],['quiet',1],['screen_only',2]];
 if(room.profile==='older_couple')return late?[['sleeping',7],['watching',1],['reading',2]]:[['watching',6],['reading',3],['sleeping',1]];
 if(room.profile==='family')return late?[['sleeping',8],['reading',2]]:[['quiet',4],['reading',3],['sleeping',3]];
 return late?[['away',8],['sleeping',2]]:[['away',7],['reading',2],['quiet',1]];
}
export function createHouseholdController({room,initial,startedAt,rng=entropy}){
 let state={...initial},currentAt=startedAt,lastTransitionAt=startedAt-room.timing.minimumDwellSec*1000*.5,nextAt=0;const cooldown=new Map();let stopped=false;
 function schedule(at){const u=Math.max(1e-9,Math.min(1-1e-9,rng()));nextAt=at+room.timing.minimumDwellSec*1000-Math.log(u)*room.timing.meanDwellSec*1000;}
 schedule(startedAt);
 return{get nextAt(){return nextAt},get state(){return {...state}},reset(next,at){state={...next};currentAt=at;lastTransitionAt=at;cooldown.clear();schedule(at);},stop(){stopped=true},advance(now,hour=22){if(stopped)return[];const events=[];let limit=0;while(nextAt<=now&&limit++<48){const at=nextAt;const eligible=candidates(room,state,hour).filter(([id])=>(!['working','watching','screen_only'].includes(id)||room.capabilities.includes('screen'))&&(cooldown.get(id)||0)<=at);if(eligible.length){const id=weighted(eligible,rng);if(id===state.activity){currentAt=at;schedule(at);continue;}const next={...state,...action[id]};if(next.occupancy==='sleeping')next.curtainOpen=Math.max(.28,state.curtainOpen-.16);if(next.occupancy==='away')next.curtainOpen=Math.min(.5,state.curtainOpen);events.push({roomId:room.id,at,kind:id,previousActivity:state.activity,previousAt:lastTransitionAt,state:next});cooldown.set(state.activity,at+room.timing.cooldownSec*1000);state=next;lastTransitionAt=at;}currentAt=at;schedule(at);}if(nextAt<=now)schedule(now);currentAt=now;return events;}};
}
