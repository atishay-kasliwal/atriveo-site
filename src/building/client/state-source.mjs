import {normalizeState} from '../state.mjs';
import {interpolate} from '../state.mjs';
export function createRemoteStateSource({rooms,configHash,fetcher=fetch,monotonic=()=>performance.now(),onSnapshot=()=>{},onStatus=()=>{},intervalMs=15000,setTimer=setTimeout,clearTimer=clearTimeout}){
 let sequence=null,current=null,anchor=null,timer=null,inFlight=null,controller=null,generation=0,paused=true,failures=0;
 const serverNow=()=>anchor?anchor.serverTime+monotonic()-anchor.midpoint:null;
 function validate(body){const s=body?.snapshot;
  if(s?.buildingId!=='atriveo-building-001'||s.protocolVersion!==1||s.simulationVersion!==1||s.configHash!==configHash)throw Error('Incompatible building snapshot');
  if(!Number.isSafeInteger(s.sequence)||s.sequence<0||!Number.isFinite(s.serverTime)||!s.states||Object.keys(s.states).length!==rooms.length)throw Error('Invalid snapshot');
  for(const room of rooms){const state=s.states[room.id];if(!state)throw Error('Missing room '+room.id);const normalized=normalizeState(room,state);if(JSON.stringify(normalized)!==JSON.stringify(state)){
   // Compare semantic fields independently of JSON key order.
   for(const key of Object.keys(normalized))if(normalized[key]!==state[key])throw Error('Invalid room state '+room.id);
  }}
  if(!Array.isArray(body.events)||!Array.isArray(s.transitions))throw Error('Invalid event envelope');
  for(const e of [...body.events,...s.transitions])if(!Number.isSafeInteger(e.sequence)||!Number.isFinite(e.at)||e.sequence>s.sequence)throw Error('Invalid event');
  return s;
 }
 async function sync(){
  if(inFlight)return inFlight;
  const token=generation,begin=monotonic();controller=new AbortController();
  inFlight=(async()=>{try{
   const response=await fetcher('/building/state'+(sequence===null?'':'?after='+sequence),{cache:'no-store',signal:controller.signal});if(!response.ok)throw Error('Authority HTTP '+response.status);
   const body=await response.json(),end=monotonic(),s=validate(body);if(token!==generation)return null;if(sequence!==null&&(s.sequence<sequence||(s.sequence===sequence&&s.serverTime<current.serverTime)))return null;
   let reset=body.reset;
   if(!reset&&sequence!==null){let expected=sequence+1;for(const e of body.events){if(e.sequence<=sequence)continue;if(e.sequence!==expected++){reset=true;break;}}if(expected-1!==s.sequence)reset=true;}
   // Every response contains the atomic full snapshot; gaps recover in this same request.
   const changed=!current||s.sequence!==sequence;current=structuredClone(s);sequence=s.sequence;anchor={serverTime:s.serverTime,midpoint:(begin+end)/2};failures=0;
   if(changed)onSnapshot(structuredClone(current),{reset,events:reset?[]:body.events});onStatus({connected:true,sequence,roundTripMs:end-begin});return current;
  }catch(error){if(token===generation&&error.name!=='AbortError'){failures++;onStatus({connected:false,sequence,error:error.message});}return null;
  }finally{inFlight=null;controller=null;}})();return inFlight;
 }
 function schedule(){clearTimer(timer);if(paused)return;timer=setTimer(async()=>{await sync();schedule()},Math.min(60000,intervalMs*2**Math.min(failures,2)));}
 return {sync,serverNow,get snapshot(){return current?structuredClone(current):null},get sequence(){return sequence},
  async resume(){paused=false;await sync();schedule()},pause(){paused=true;generation++;clearTimer(timer);timer=null;controller?.abort()},
  sample({still=false}={}){if(!current)return null;const states=structuredClone(current.states),now=serverNow();if(!still)for(const e of current.transitions){if(e.roomId&&e.previous&&e.state&&now<e.at+e.durationMs)states[e.roomId]=interpolate(e.previous,e.state,Math.max(0,Math.min(1,(now-e.at)/e.durationMs)));}return states;}
 };
}
