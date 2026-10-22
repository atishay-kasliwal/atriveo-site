import {isPresented,isMobileRoom} from './presentation-layout.mjs';

const CHANNELS=['mainLight','accentLight','screen','curtainOpen'];
const SESSION_KEY='atriveo-building-activity-v1';
const LIMITS={mainLight:.46,accentLight:.32,screen:.16,curtainOpen:1};
const clamp=(value,min=0,max=1)=>Math.max(min,Math.min(max,value));

function makeRandom(){
  const key='atriveo-building-night-v1';let seed=0;
  try{seed=Number(sessionStorage.getItem(key))||0;if(!seed){seed=crypto.getRandomValues(new Uint32Array(1))[0]||1;sessionStorage.setItem(key,String(seed));}}
  catch{seed=crypto.getRandomValues(new Uint32Array(1))[0]||1;}
  let state=seed>>>0;
  return()=>{state+=0x6D2B79F5;let t=state;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};
}

function nighttime(room,input){
  const state={...input};
  state.mainLight=state.mainLight>0?Math.min(.46,.12+state.mainLight*.3):0;
  state.accentLight=state.accentLight>0?Math.min(.32,.08+state.accentLight*.24):0;
  state.screen=state.screen>0?Math.min(.16,.025+state.screen*.16):0;
  if(!room.capabilities.includes('accent'))state.accentLight=0;
  if(!room.capabilities.includes('screen'))state.screen=0;
  return state;
}

function setPath(ctx,x,y,w,h,r){
  ctx.beginPath();ctx.roundRect(x,y,w,h,Math.min(r,w/5,h/5));
}

export function createAmbientMotion({rooms,canvas,initialStates,onFrame=()=>{}}){
  const random=makeRandom(),visible=rooms.filter(isPresented);
  const baseline=new Map(rooms.map(room=>[room.id,{...room.initial}]));
  const states=new Map(rooms.map(room=>[room.id,nighttime(room,initialStates?.[room.id]||room.initial)]));
  const transitions=new Map(),recent=[],touched=new Set(),events=[];
  const context=canvas?.getContext('2d');
  let timer=0,active=false,disposed=false,lastEventAt=null,completed=0,peakConcurrent=0;

  // Keep initial variation small and stable for this tab's session. It changes the presentation only.
  for(const room of visible){
    const state=states.get(room.id),energy=state.mainLight+state.accentLight+state.screen;
    if(energy>.08&&random()<.16){state.mainLight*=.78;state.accentLight*=.78;state.screen*=.84;}
    else if(energy<.08&&random()<.06){if(room.capabilities.includes('accent'))state.accentLight=.14;else if(room.capabilities.includes('screen')&&random()<.5)state.screen=.07;else state.mainLight=.16;}
  }
  try{
    const saved=JSON.parse(sessionStorage.getItem(SESSION_KEY)||'{}');
    for(const room of visible){
      const persisted=saved[room.id];
      if(!persisted||!CHANNELS.every(key=>Number.isFinite(persisted[key])))continue;
      states.set(room.id,{...states.get(room.id),...Object.fromEntries(CHANNELS.map(key=>[key,clamp(persisted[key],0,LIMITS[key])]))});
      touched.add(room.id);
    }
  }catch{}
  function persist(id,state){
    try{
      const saved=JSON.parse(sessionStorage.getItem(SESSION_KEY)||'{}');
      saved[id]=Object.fromEntries(CHANNELS.map(key=>[key,state[key]]));
      sessionStorage.setItem(SESSION_KEY,JSON.stringify(saved));
    }catch{}
  }

  function viewport(){
    if(matchMedia('(max-width: 700px)').matches)return{left:-8.6,top:19.885,width:12.9,height:9.03,rooms:rooms.filter(isMobileRoom)};
    return{left:-21.5,top:27.52,width:43,height:27.52,rooms:visible};
  }
  function resizeCanvas(){
    if(!canvas||!context)return null;
    const rect=canvas.getBoundingClientRect(),ratio=Math.min(devicePixelRatio||1,2),width=Math.max(1,Math.round(rect.width*ratio)),height=Math.max(1,Math.round(rect.height*ratio));
    if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;}
    context.setTransform(width/Math.max(1,rect.width),0,0,height/Math.max(1,rect.height),0,0);
    return{width:rect.width,height:rect.height};
  }
  function paint(){
    if(!context)return;
    const size=resizeCanvas();if(!size)return;
    const {width,height}=size,v=viewport();context.clearRect(0,0,width,height);
    context.save();context.globalCompositeOperation='source-over';context.filter='blur(1px)';
    for(const room of v.rooms){
      const current=states.get(room.id),start=baseline.get(room.id);if(!current||!start)continue;
      const xWorld=-19.35+room.slot[0]*4.3,yWorld=room.slot[1]*3.44+1.61;
      const x=(xWorld-1.44-v.left)/v.width*width,y=(v.top-yWorld-1.14)/v.height*height,w=2.88/v.width*width,h=2.28/v.height*height;
      const ix=x+w*.09,iy=y+h*.09,iw=w*.82,ih=h*.8;
      const before=start.mainLight*.72+start.accentLight*.55+start.screen*.28;
      const now=current.mainLight*.72+current.accentLight*.55+current.screen*.28;
      const delta=now-before;
      if(delta<-.018){
        const shade=clamp((-delta)*.28,0,.105);context.fillStyle=`rgba(8,11,13,${shade})`;setPath(context,ix,iy,iw,ih,3);context.fill();
      }else if(delta>.018){
        const warmth=clamp(delta*.34,0,.12);context.fillStyle=`rgba(255,190,128,${warmth})`;context.shadowColor=`rgba(245,166,94,${warmth*.6})`;context.shadowBlur=Math.max(2,w*.04);setPath(context,ix,iy,iw,ih,3);context.fill();context.shadowBlur=0;
      }
      const screenDelta=current.screen-start.screen;
      if(screenDelta>.025){const glow=clamp(screenDelta*.35,0,.055);context.fillStyle=`rgba(122,178,226,${glow})`;setPath(context,ix,iy,iw,ih,3);context.fill();}
      const curtainDelta=current.curtainOpen-start.curtainOpen;
      if(Math.abs(curtainDelta)>.025){
        const span=Math.min(.42,Math.abs(curtainDelta)*1.1),alpha=Math.min(.045,Math.abs(curtainDelta)*.11);
        context.fillStyle=curtainDelta<0?`rgba(16,19,18,${alpha})`:`rgba(244,201,153,${alpha*.62})`;
        setPath(context,ix+iw*(curtainDelta<0?0:1-span),iy,iw*span,ih,2);context.fill();
      }
    }
    context.restore();
  }
  function sample(now=performance.now()){
    for(const [id,transition]of transitions){
      const raw=clamp((now-transition.startedAt)/transition.durationMs),t=raw*raw*(3-2*raw),next={...transition.to};
      for(const key of CHANNELS)next[key]=transition.from[key]+(transition.to[key]-transition.from[key])*t;
      states.set(id,next);
      if(raw>=1){states.set(id,transition.to);transitions.delete(id);completed++;}
    }
    return Object.fromEntries([...states].map(([id,state])=>[id,{...state}]));
  }
  function motionActive(){return transitions.size>0;}
  function weightedRoom(){
    const mobile=matchMedia('(max-width: 700px)').matches;
    const pool=(mobile?rooms.filter(isMobileRoom):visible).filter(room=>!recent.includes(room.id)&&!transitions.has(room.id));
    const candidates=pool.length?pool:(mobile?rooms.filter(isMobileRoom):visible).filter(room=>!transitions.has(room.id));
    let weighted=candidates.map(room=>{
      const column=room.slot[0],row=8-room.slot[1];let weight=1;
      if(!mobile&&((column===2&&row>=1&&row<=4)||(column===7&&row>=5)))weight=.48;
      if(!mobile&&column>=3&&column<=6)weight=.8;
      return{room,weight};
    });
    const total=weighted.reduce((sum,item)=>sum+item.weight,0);let pick=random()*total;
    for(const item of weighted){pick-=item.weight;if(pick<=0)return item.room;}
    return weighted.at(-1)?.room;
  }
  function nextState(room,current){
    const state={...current},energy=current.mainLight+current.accentLight+current.screen;
    const options=energy<.09?[
      ['warm-on',.56],['screen-on',room.capabilities.includes('screen') ? .22 : 0],['small-dim',.12],['curtain',.1]
    ]:[
      ['dim',.31],['brighten',.27],['screen',room.capabilities.includes('screen') ? .17 : 0],['curtain',.14],['settle-dark',.11]
    ].filter(([,weight])=>weight>0);
    const total=options.reduce((n,item)=>n+item[1],0);let pick=random()*total,kind=options.at(-1)[0];
    for(const item of options){pick-=item[1];if(pick<=0){kind=item[0];break;}}
    switch(kind){
      case 'warm-on':state.occupancy='home';state.activity='quiet';state.mainLight=.12+random()*.09;if(room.capabilities.includes('accent')&&random()<.35)state.accentLight=.05+random()*.035;break;
      case 'screen-on':state.occupancy='home';state.activity='watching';state.screen=.055+random()*.055;break;
      case 'dim':state.mainLight*=.68+random()*.12;state.accentLight*=.68+random()*.12;state.screen*=.78;break;
      case 'small-dim':state.mainLight*=.78;state.accentLight*=.78;break;
      case 'brighten':if(current.mainLight+current.accentLight<.08)state.mainLight=.14+random()*.07;else if(current.mainLight>=current.accentLight)state.mainLight=Math.min(.46,current.mainLight+.055+random()*.055);else state.accentLight=Math.min(.32,current.accentLight+.045+random()*.04);break;
      case 'screen':state.screen=current.screen>.045?Math.max(0,current.screen*(.65+random()*.2)):.045+random()*.045;break;
      case 'curtain':state.curtainOpen=clamp(current.curtainOpen+(current.curtainOpen>.68?-.045-random()*.035:.035+random()*.035),.18,.96);break;
      case 'settle-dark':state.mainLight=Math.max(0,current.mainLight-(.1+random()*.1));state.accentLight=Math.max(0,current.accentLight-(.035+random()*.06));state.screen=Math.max(0,current.screen-(.02+random()*.035));state.activity='quiet';break;
    }
    state.mainLight=clamp(state.mainLight,0,.46);state.accentLight=clamp(state.accentLight,0,.32);state.screen=clamp(state.screen,0,.16);
    if(!room.capabilities.includes('accent'))state.accentLight=0;if(!room.capabilities.includes('screen'))state.screen=0;
    return{kind,state};
  }
  function fire(){
    timer=0;if(disposed||!active)return;
    if(transitions.size>=2){
      const nextFree=Math.min(...[...transitions.values()].map(transition=>transition.startedAt+transition.durationMs-performance.now()));
      schedule(Math.max(80,Math.min(260,nextFree+20)));return;
    }
    const room=weightedRoom();if(!room)return;
    const from={...states.get(room.id)},result=nextState(room,from),durationMs=780+random()*690,at=performance.now();
    transitions.set(room.id,{from,to:result.state,startedAt:at,durationMs});touched.add(room.id);persist(room.id,result.state);
    recent.push(room.id);if(recent.length>12)recent.shift();lastEventAt=at;
    const maxDelta=Math.max(...CHANNELS.map(key=>Math.abs(result.state[key]-from[key])));
    events.push({at,roomId:room.id,kind:result.kind,durationMs,maxDelta});if(events.length>128)events.shift();peakConcurrent=Math.max(peakConcurrent,transitions.size);
    onFrame();
    schedule(random()<.05?180+random()*380:780+random()*470);
  }
  function schedule(delay){if(!active||disposed||timer)return;timer=setTimeout(fire,delay);}
  function start(){if(disposed)return;active=true;paint();onFrame();if(!matchMedia('(prefers-reduced-motion: reduce)').matches&&!timer&&!transitions.size)schedule(350+random()*300);}
  function pause(){active=false;clearTimeout(timer);timer=0;}
  function resume(){if(disposed)return;active=true;paint();onFrame();if(!matchMedia('(prefers-reduced-motion: reduce)').matches&&!timer)schedule(800+random()*500);}
  function adopt(next){
    if(!next)return;
    for(const room of rooms){if(touched.has(room.id)||transitions.has(room.id)||!next[room.id])continue;states.set(room.id,nighttime(room,next[room.id]));}
    paint();onFrame();
  }
  function renderOverlay(){sample(performance.now());paint();}
  function clearOverlay(){if(context){const size=resizeCanvas();if(size)context.clearRect(0,0,size.width,size.height);}}
  function dispose(){pause();disposed=true;transitions.clear();clearOverlay();}
  function diagnostics(){return{count:events.length,events:events.map(event=>({...event})),recent:[...recent],activeTransitions:transitions.size,peakConcurrent,completed,lastEventAt,currentStates:Object.fromEntries([...states].map(([id,state])=>[id,{...state}]))};}
  return{start,pause,resume,dispose,sample,adopt,renderOverlay,clearOverlay,get animating(){return motionActive();},diagnostics};
}
