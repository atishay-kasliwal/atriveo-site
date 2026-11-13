export const CHANNELS=['mainLight','accentLight','screen','curtainOpen'];
export function normalizeState(room,input){
 const out={};for(const k of CHANNELS){const v=input[k];if(typeof v!=='number'||!Number.isFinite(v))throw new TypeError(`Invalid ${k}`);out[k]=Math.max(0,Math.min(1,v));}
 if(!room.capabilities.includes('screen'))out.screen=0;
 if(!room.capabilities.includes('accent'))out.accentLight=0;
 if(!['away','home','sleeping'].includes(input.occupancy))throw new TypeError('Invalid occupancy');
 out.occupancy=input.occupancy;out.activity=input.activity;
 if(out.occupancy==='away'){out.mainLight=out.accentLight=out.screen=0;out.activity='away';}
 if(out.occupancy==='sleeping'){out.mainLight=out.accentLight=out.screen=0;out.activity='sleeping';}
 return Object.freeze(out);
}
export function interpolate(a,b,t){const u=Math.max(0,Math.min(1,t));const f=u*u*(3-2*u);return {...b,...Object.fromEntries(CHANNELS.map(k=>[k,a[k]+(b[k]-a[k])*f]))};}
export function createStateStore(rooms){const states=new Map(rooms.map(r=>[r.id,normalizeState(r,r.initial)]));const listeners=new Set();return {get:id=>states.get(id),all:()=>Object.fromEntries(states),set(id,patch){const room=rooms.find(r=>r.id===id);if(!room)throw new Error('Unknown identity');const next=normalizeState(room,{...states.get(id),...patch});states.set(id,next);listeners.forEach(fn=>fn(id,next));return next;},subscribe(fn){listeners.add(fn);return()=>listeners.delete(fn)}};}
