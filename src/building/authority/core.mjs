import {createBuildingDirector} from '../director.mjs';
export const BUILDING_ID='atriveo-building-001',SIMULATION_VERSION=1,PROTOCOL_VERSION=1,MAX_CATCHUP_MS=6*3600000,REPLAY_LIMIT=128;
const copy=x=>structuredClone(x);
// A complete record is committed in one transaction. No private checkpoint leaves this module.
export function advanceWorld({record,rooms,configHash,now,seed}){
 if(!Number.isFinite(now))throw Error('Finite authority clock required');
 if(record&&(record.configHash!==configHash||record.simulationVersion!==SIMULATION_VERSION))throw Error('Checkpoint version/configuration mismatch; explicit migration required');
 const initial=!record;
 let next=record?copy(record):{buildingId:BUILDING_ID,protocolVersion:PROTOCOL_VERSION,simulationVersion:SIMULATION_VERSION,configHash,sequence:0,events:[],recoveries:0,checkpoint:null};
 const before=next.checkpoint?.now??now;now=Math.max(before,now);
 if(!initial&&now<next.checkpoint.nextAt)return {record:next,changed:false};
 let director=createBuildingDirector({rooms,startedAt:next.checkpoint?.startedAt??now,...(next.checkpoint?{snapshot:next.checkpoint}:{seed})});
 const end=Math.min(now,before+MAX_CATCHUP_MS),events=director.advance(end);
 for(const e of events)next.events.push({sequence:++next.sequence,at:e.at,kind:e.kind,roomId:e.roomId,previous:e.previous,state:e.state,durationMs:e.durationMs});
 next.checkpoint=director.snapshot();
 if(end<now){
  // Explicit, versioned continuity approximation: preserve homes and shift timing obligations.
  const skipped=now-end,c=next.checkpoint;
  for(const key of ['startedAt','now','nextAt','lastEvent'])if(c[key]!==null)c[key]+=skipped;
  for(const h of Object.values(c.homes)){for(const key of ['changedAt','curtainAt','reconsiderAt'])h[key]+=skipped;for(const key of Object.keys(h.cooldowns))h.cooldowns[key]+=skipped;}
  next.recoveries++;next.events.push({sequence:++next.sequence,at:now,kind:'recovery',recoveryVersion:1,skippedMs:skipped,durationMs:0});
 }
 next.events=next.events.slice(-REPLAY_LIMIT);
 return {record:next,changed:true};
}
export function publicEnvelope(record,now,after=null){
 now=Math.max(now,record.checkpoint.now);
 const oldest=record.events[0]?.sequence??record.sequence+1;
 const reset=after===null||after>record.sequence||after<oldest-1;
 const states=Object.fromEntries(Object.entries(record.checkpoint.homes).map(([id,h])=>[id,copy(h.state)]));
 return {snapshot:{buildingId:record.buildingId,protocolVersion:PROTOCOL_VERSION,simulationVersion:SIMULATION_VERSION,configHash:record.configHash,sequence:record.sequence,serverTime:now,states,transitions:record.events.filter(e=>e.roomId&&e.at+e.durationMs>now).map(copy),recoveries:record.recoveries},reset,events:reset?[]:record.events.filter(e=>e.sequence>after).map(copy)};
}
export function parseAfter(url){const value=new URL(url).searchParams.get('after');if(value===null)return null;if(!/^\d{1,16}$/.test(value)||!Number.isSafeInteger(Number(value)))throw Error('Invalid event cursor');return Number(value);}
