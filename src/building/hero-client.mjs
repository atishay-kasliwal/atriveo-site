import {gsap} from 'gsap';
import {createRemoteStateSource} from './client/state-source.mjs';
import {MANIFEST_HASH} from './authority/version.mjs';
import {createAmbientMotion} from './ambient-motion.mjs';

class LivingBuildingHero extends HTMLElement {
  connectedCallback() {
    if(this.controller)return;
    const root=this,status=this.querySelector('[role="status"]');
    const reduced=matchMedia('(prefers-reduced-motion: reduce)'),lifetime=new AbortController();
    const lightCanvas=this.querySelector('.building-light-layer');
    let canvas=this.querySelector('.building-canvas');
    // A disposed/lost WebGL context cannot be reused on a back/forward-cache return.
    if(root.dataset.canvasUsed){const next=canvas.cloneNode();canvas.replaceWith(next);canvas=next;}
    let presentation,source,ambient,ticker=false,idle=0,retry=0,visible=false,disposed=false;
    let initializing=false,enhancing=false,intro;
    const active=()=>visible&&!document.hidden&&!disposed;
    function stopFrames(){gsap.ticker.remove(draw);ticker=false;}
    function stop(){stopFrames();ambient?.pause();source?.pause();intro?.pause();}
    function draw(){
      if(!active()||reduced.matches||!ambient){stopFrames();return;}
      const states=ambient.sample(performance.now());
      if(presentation){
        for(const [id,state]of Object.entries(states))presentation.apply(id,state);
        presentation.render();
        if(!root.hasAttribute('data-ready'))performance.mark('living-building-ready');
        root.dataset.ready='';
      }else ambient.renderOverlay();
      // Keep one registered listener during a transition. Removing/re-adding from
      // inside this callback can revisit it in GSAP's same listener traversal.
      const remoteMoving=source?.snapshot?.transitions?.some(e=>source.serverNow()<e.at+e.durationMs);
      if(!ambient.animating&&!remoteMoving)stopFrames();
    }
    function redraw(){stopFrames();if(active()&&!reduced.matches){gsap.ticker.add(draw);ticker=true;}}
    function fallback(){root.removeAttribute('data-ready');status.textContent='The building is shown as a still image.';ambient?.renderOverlay();}
    function arrival(){
      if(reduced.matches||!active()||intro)return;
      // A brief arrival reveal supports the page; ambient household states remain local presentation only.
      intro=gsap.timeline({defaults:{ease:'power2.out'}})
        .fromTo(root.querySelector('.building-arrival-wash'),{opacity:.30},{opacity:0,duration:1.35},0)
        .fromTo(root.querySelector('.building-brand'),{y:8,opacity:.85},{y:0,opacity:1,duration:.9},.05)
        .fromTo(root.querySelector('.building-invitation'),{y:6,opacity:.9},{y:0,opacity:1,duration:.85},.18);
    }
    async function enhance(){
      if(enhancing||presentation||!active()||reduced.matches||!source?.snapshot)return;
      enhancing=true;
      try{
        const {createPresentation}=await import('./presentation.mjs');if(disposed||reduced.matches)return;
        root.dataset.canvasUsed='';
        const result=await createPresentation({canvas,rooms,signal:lifetime.signal});
        if(disposed||reduced.matches){result.dispose();return;}
        presentation=result;redraw();
      }catch(error){if(!disposed&&error.name!=='AbortError')fallback();}
      finally{enhancing=false;}
    }
    let rooms;
    async function initialize(){
      if(initializing||source||disposed||!active())return;initializing=true;
      try{
        const response=await fetch('/building/rooms.json',{signal:lifetime.signal});
        if(!response.ok)throw Error('Manifest unavailable');
        rooms=(await response.json()).rooms;if(disposed)return;
        ambient=createAmbientMotion({rooms,canvas:lightCanvas,initialStates:null,onFrame:()=>{if(!disposed)redraw();}});
        ambient.start();
        source=createRemoteStateSource({rooms,configHash:MANIFEST_HASH,
          onSnapshot(){if(disposed||reduced.matches)return;ambient?.adopt(source.sample());if(!presentation)enhance();else redraw();},
          onStatus(value){if(disposed)return;root.dataset.connection=value.connected?'connected':'unavailable';}
        });
        if(active()){
          await source.resume();
          ambient.adopt(source.snapshot?.states);await enhance();
        }else source.pause();
      }catch(error){if(!disposed&&error.name!=='AbortError'){fallback();retry=setTimeout(()=>{if(active())initialize();},60000);}}
      finally{initializing=false;}
    }
    async function visibility(){
      if(!active()){clearTimeout(idle);stop();return;}
      arrival();if(intro?.paused())intro.resume();
      if(source){await source.resume();ambient?.resume();await enhance();redraw();}
      else if(!initializing){clearTimeout(idle);idle=setTimeout(initialize,80);}
    }
    const intersection=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;visibility();},{threshold:0});intersection.observe(root);
    const resize=new ResizeObserver(redraw);resize.observe(canvas.parentElement);
    const preference=()=>{
      if(reduced.matches){
        stopFrames();ambient?.pause();intro?.progress(1).kill();intro=null;
        const previous=presentation;presentation=null;previous?.dispose();fallback();
      }else{
        const next=canvas.cloneNode();canvas.removeEventListener('webglcontextlost',lost);canvas.replaceWith(next);canvas=next;canvas.addEventListener('webglcontextlost',lost);
        ambient?.resume();enhance();
      }
    };
    const lost=event=>{if(!presentation||disposed)return;event.preventDefault();stopFrames();const previous=presentation;presentation=null;previous.dispose();fallback();};
    const menu=root.closest('.site-frame')?.querySelector('.mobile-nav');
    const menuEscape=event=>{if(event.key==='Escape'&&menu?.open){menu.open=false;menu.querySelector('summary').focus();}};
    document.addEventListener('keydown',menuEscape);
    const dispose=()=>{
      if(disposed)return;disposed=true;lifetime.abort();stop();ambient?.dispose();clearTimeout(idle);clearTimeout(retry);intro?.kill();
      intersection.disconnect();resize.disconnect();
      document.removeEventListener('visibilitychange',visibility);document.removeEventListener('astro:before-swap',dispose);
      document.removeEventListener('keydown',menuEscape);
      window.removeEventListener('pagehide',dispose);reduced.removeEventListener('change',preference);
      canvas.removeEventListener('webglcontextlost',lost);presentation?.dispose();
      root.removeAttribute('data-ready');root.controller=null;
    };
    reduced.addEventListener('change',preference);canvas.addEventListener('webglcontextlost',lost);
    document.addEventListener('visibilitychange',visibility);document.addEventListener('astro:before-swap',dispose);window.addEventListener('pagehide',dispose);
    // No prototype panels or controls. Read-only public-state diagnostics support local acceptance.
    root.controller={dispose,refresh:()=>source?.sync(),diagnostics:()=>({ready:root.hasAttribute('data-ready'),reducedMotion:reduced.matches,visible,ticker,sequence:source?.sequence,states:source?.snapshot?.states,ambient:ambient?.diagnostics(),metrics:presentation?{...presentation.metrics}:null,renderedIds:presentation?.renderedIds,glassIds:presentation?.glassIds})};
  }
  disconnectedCallback(){this.controller?.dispose();}
}
if(!customElements.get('living-building'))customElements.define('living-building',LivingBuildingHero);
window.addEventListener('pageshow',event=>{if(event.persisted)document.querySelectorAll('living-building').forEach(root=>root.connectedCallback());});
