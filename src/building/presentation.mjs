import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {isPresented, isMobileRoom} from './presentation-layout.mjs';
const N=80, W=43,H=27.52;
const output=`\n#include <tonemapping_fragment>\n#include <colorspace_fragment>\n`;
const declarations=`uniform sampler2D dataTex;vec4 getState(int i){return texture2D(dataTex,vec2((float(i)+.5)/80.,.5/3.));}vec3 getAccent(int i){return texture2D(dataTex,vec2((float(i)+.5)/80.,1.5/3.)).xyz;}vec3 getScreen(int i){return texture2D(dataTex,vec2((float(i)+.5)/80.,2.5/3.)).xyz;}vec2 getSlot(int i){return vec2(texture2D(dataTex,vec2((float(i)+.5)/80.,1.5/3.)).w,texture2D(dataTex,vec2((float(i)+.5)/80.,2.5/3.)).w);}`;
const vertex=`attribute float roomIndex;attribute float role;attribute vec3 pivot;attribute vec3 baseColor;${declarations}varying vec2 vUv;varying vec3 vP;varying vec3 vN;varying vec3 vColor;varying float vRoom;varying float vRole;void main(){int i=int(roomIndex+.5);vec3 p=position;float open=getState(i).w;if(role==1.)p.x=pivot.x+(p.x-pivot.x)*(1.+(1.-open)*(pivot.z<0.?1.8:1.65));if(role==2.)p.y=pivot.y+(p.y-pivot.y)*(.35+.65*(1.-open));vUv=uv;vP=p;vN=normal;vColor=baseColor;vRoom=roomIndex;vRole=role;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`;
const atlas=`uniform sampler2D ambientTex;uniform sampler2D mainTex;uniform sampler2D accentTex;uniform sampler2D screenTex;uniform float tileSize;${declarations}varying vec2 vUv;varying float vRoom;void main(){int i=int(vRoom+.5);vec2 tile=vec2(mod(vRoom,10.),floor(vRoom/10.));vec2 uv=(tile+(vec2(4.)+vUv*(tileSize-8.))/tileSize)/vec2(10.,8.);vec3 ch=getState(i).xyz;vec3 c=texture2D(ambientTex,uv).rgb+ch.x*texture2D(mainTex,uv).rgb+ch.y*texture2D(accentTex,uv).rgb+ch.z*texture2D(screenTex,uv).rgb;gl_FragColor=vec4(c,1.);${output}}`;
const dynamic=`${declarations}varying vec2 vUv;varying vec3 vP;varying vec3 vN;varying vec3 vColor;varying float vRoom;varying float vRole;void main(){int i=int(vRoom+.5);vec3 ch=getState(i).xyz;vec2 cell=getSlot(i);vec3 p=vP-vec3(-19.35+cell.x*4.3,cell.y*3.44,0.);vec3 c;if(vRole==4.)c=mix(vec3(.0015,.003,.004),getScreen(i),ch.z);else if(vRole==5.)c=vec3(.008,.006,.003)+ch.y*vec3(.9,.47,.16);else if(vRole<=2.){float fold=.32+.68*abs(dot(normalize(vN),normalize(vec3(-.55,.3,1.))));float fall=exp(-1.7*distance(p,getAccent(i)));vec3 light=vec3(.026,.038,.058)+ch.x*vec3(.40,.23,.09)+ch.y*vec3(.9,.37,.07)*fall+ch.z*vec3(.025,.055,.10);c=vColor*light*fold;}else{float direction=.35+.65*max(0.,dot(normalize(vN),normalize(vec3(-.4,.5,1.))));float fall=exp(-1.3*distance(p,getAccent(i)));vec3 light=vec3(.018,.026,.039)+ch.x*vec3(.55,.35,.18)+ch.y*vec3(.8,.40,.13)*fall+ch.z*vec3(.04,.07,.10);c=vColor*light*direction;}gl_FragColor=vec4(c,1.);${output}}`;
const glass=`varying vec2 vUv;void main(){float h=exp(-30.*pow(vUv.x-.78,2.))*.012;float s=exp(-180.*pow(vUv.x-.18+vUv.y*.06,2.))*.018;gl_FragColor=vec4(.29,.37,.42,h+s+.012);}`;

// Reuses the Phase 7 shaders and identity-indexed atlas. No simulation runs here.
export async function createPresentation({canvas, rooms, signal}) {
  if (rooms.length !== N) throw new Error('Expected the unchanged eighty-household manifest');
  const renderer = new THREE.WebGLRenderer({canvas, antialias:true, powerPreference:'low-power'});
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.NoToneMapping;
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  const scene=new THREE.Scene(); scene.background=new THREE.Color('#0B0F12');
  const camera=new THREE.OrthographicCamera(-W/2,W/2,H/2,-H/2,.1,60);
  camera.position.set(0,13.77,40); camera.lookAt(0,13.76,-1);
  const mobileCamera=new THREE.OrthographicCamera(-6.45,6.45,4.515,-4.515,.1,60);
  mobileCamera.position.set(-2.15,15.37,40); mobileCamera.lookAt(-2.15,15.37,-1);
  const textures=[], geometries=[], materials=[], decoded=[];
  const data=new Float32Array(N*3*4), dataTex=new THREE.DataTexture(data,N,3,THREE.RGBAFormat,THREE.FloatType);
  const indexById=new Map(rooms.map((room,i)=>[room.id,i]));
  let disposed=false;
  function dispose() {
    if(disposed)return; disposed=true;
    const sourceGeometry=new Set(), sourceMaterials=new Set(), sourceTextures=new Set();
    decoded.forEach(g=>g.scene.traverse(o=>{if(!o.isMesh)return;sourceGeometry.add(o.geometry);for(const m of (Array.isArray(o.material)?o.material:[o.material])){sourceMaterials.add(m);for(const v of Object.values(m))if(v?.isTexture)sourceTextures.add(v);}}));
    [...sourceGeometry,...sourceMaterials,...sourceTextures,...geometries,...materials,...textures,dataTex].forEach(r=>{r.dispose();r.image?.close?.();});
    renderer.dispose(); renderer.forceContextLoss();
  }
  const metrics={frames:0,visibleRooms:0,mainCalls:0,triangles:0,excludedIds:rooms.filter(r=>!isPresented(r)).map(r=>r.id)};
  try {
    rooms.forEach((r,i)=>{data.set([...r.accentPosition,r.slot[0]],(N+i)*4);data.set([...r.screenColor,r.slot[1]],(2*N+i)*4);});
    const loader=new GLTFLoader();
    async function asset(url){const response=await fetch(url,{signal});if(!response.ok)throw Error('Building asset unavailable');return response;}
    const results=await Promise.allSettled([
      ...['original','neighbors','sixteen','new-homes'].map(async name=>{const response=await asset(`/building/models/${name}.glb`);const g=await loader.parseAsync(await response.arrayBuffer(),'/building/models/');decoded.push(g);return g;}),
      ...['ambient','main','accent','screen'].map(async name=>{const response=await asset(`/building/atlases/128/${name}.png`);const image=await createImageBitmap(await response.blob(),{imageOrientation:'none',premultiplyAlpha:'none',colorSpaceConversion:'none'});const t=new THREE.Texture(image);textures.push(t);t.flipY=false;t.needsUpdate=true;t.colorSpace=THREE.SRGBColorSpace;t.minFilter=THREE.LinearMipmapLinearFilter;t.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());return t;})
    ]);
    const failed=results.find(r=>r.status==='rejected'); if(failed)throw failed.reason;
    if(signal?.aborted)throw new DOMException('Unmounted','AbortError');
    const [original,neighbors,sixteen,additional,...maps]=results.map(r=>r.value);
    const uniforms={dataTex:{value:dataTex},tileSize:{value:128}};
    ['ambientTex','mainTex','accentTex','screenTex'].forEach((key,i)=>uniforms[key]={value:maps[i]});
    materials.push(new THREE.ShaderMaterial({vertexShader:vertex,fragmentShader:atlas,uniforms,side:THREE.DoubleSide}),new THREE.ShaderMaterial({vertexShader:vertex,fragmentShader:dynamic,uniforms,side:THREE.DoubleSide}),new THREE.ShaderMaterial({vertexShader:vertex,fragmentShader:glass,uniforms,transparent:true,depthWrite:false,side:THREE.DoubleSide}));
    const buckets=[[],[],[]],mobileBuckets=[[],[],[]],temporary=[];
    function prepare(mesh,i,role,color) {
      const g=mesh.geometry.clone();temporary.push(g);g.applyMatrix4(mesh.matrixWorld);
      for(const key of Object.keys(g.attributes))if(!['position','normal','uv'].includes(key))g.deleteAttribute(key);
      const count=g.getAttribute('position').count;
      if(!g.index)g.setIndex(Array.from({length:count},(_,n)=>n));
      if(!g.getAttribute('uv'))g.setAttribute('uv',new THREE.Float32BufferAttribute(new Float32Array(count*2),2));
      if(!g.getAttribute('normal'))g.computeVertexNormals();
      const colors=new Float32Array(count*3),pivots=new Float32Array(count*3),pivot=new THREE.Vector3().setFromMatrixPosition(mesh.matrixWorld);
      for(let n=0;n<count;n++){colors.set(color,n*3);pivots.set([pivot.x,pivot.y,mesh.userData.side==='left'?-1:1],n*3);}
      g.setAttribute('roomIndex',new THREE.Float32BufferAttribute(new Float32Array(count).fill(i),1));
      g.setAttribute('role',new THREE.Float32BufferAttribute(new Float32Array(count).fill(role),1));
      g.setAttribute('baseColor',new THREE.Float32BufferAttribute(colors,3));g.setAttribute('pivot',new THREE.Float32BufferAttribute(pivots,3));
      return g;
    }
    const renderedIds=[],glassIds=[];
    for(let i=0;i<N;i++) {
      const room=rooms[i];
      // Exclude BEFORE traversing meshes, adding panes, or merging. Keep i unchanged.
      if(!isPresented(room))continue;
      renderedIds.push(room.id);
      const group=room.id==='room_027'?original.scene:neighbors.scene.getObjectByName(room.id)||sixteen.scene.getObjectByName(room.id)||additional.scene.getObjectByName(room.id);
      if(!group)throw Error('Missing '+room.id);
      group.position.set(-19.35+room.slot[0]*4.3,room.slot[1]*3.44,0);group.updateMatrixWorld(true);
      const add=(g,bucket)=>{buckets[bucket].push(g);if(isMobileRoom(room))mobileBuckets[bucket].push(g);};
      group.traverse(o=>{
        if(!o.isMesh)return;
        let role=o.userData.role;
        if(room.id==='room_027'){if(o.name.startsWith('curtain_')){role='curtain';o.userData.side=o.name.includes('left')?'left':'right';}else if(o.name==='monitor_screen')role='screen';else if(o.name==='lamp_glow')role='lamp_glow';}
        const staticNode=o.name===room.id+'_static',roles={curtain:1,blinds:2,shared_prop:3,screen:4,lamp_glow:5};
        if(!staticNode&&!roles[role])throw Error('Unknown role '+o.name);
        const base=role==='curtain'||role==='blinds'?room.curtainColor:o.userData.baseColor||o.material.color?.toArray()||[.15,.15,.15];
        add(prepare(o,i,staticNode?0:roles[role],base),staticNode?0:1);
      });
      const pane=new THREE.Mesh(new THREE.PlaneGeometry(2.88,2.28));pane.position.set(group.position.x,group.position.y+1.61,.005);pane.updateMatrixWorld(true);
      add(prepare(pane,i,0,[1,1,1]),2);glassIds.push(room.id);pane.geometry.dispose();
    }
    const desktop=[],mobile=[];
    try {
      for(const [source,destination] of [[buckets,desktop],[mobileBuckets,mobile]])for(let k=0;k<3;k++) {
        const g=mergeGeometries(source[k],false);if(!g)throw Error('Batch merge failed');geometries.push(g);
        const mesh=new THREE.Mesh(g,materials[k]);mesh.frustumCulled=false;scene.add(mesh);destination.push(mesh);
      }
    } finally {temporary.forEach(g=>g.dispose());}
    // Inspect the actual merged buffers: excluded room geometry and glass must be absent.
    metrics.geometryRoomIds=[...new Set(geometries.slice(0,3).flatMap(g=>Array.from(g.getAttribute('roomIndex').array)))].sort((a,b)=>a-b).map(i=>rooms[i].id);
    metrics.glassRoomIds=[...new Set(geometries[2].getAttribute('roomIndex').array)].sort((a,b)=>a-b).map(i=>rooms[i].id);
    // The decoded source meshes are never submitted; release their CPU inputs after merging.
    const originals=new Set();decoded.forEach(g=>g.scene.traverse(o=>{if(!o.isMesh)return;originals.add(o.geometry);for(const m of (Array.isArray(o.material)?o.material:[o.material])){originals.add(m);for(const v of Object.values(m))if(v?.isTexture)originals.add(v);}}));
    originals.forEach(r=>r.dispose());decoded.length=0;
    // No prototype mini render target/readback.
    const isMobile=()=>matchMedia('(max-width: 700px)').matches;
    function apply(id,state){const i=indexById.get(id);if(i===undefined)throw Error('Unknown room');data.set([state.mainLight,state.accentLight,state.screen,state.curtainOpen],i*4);dataTex.needsUpdate=true;}
    function render(){
      if(disposed)return;
      const rect=canvas.parentElement.getBoundingClientRect();
      const w=Math.max(1,Math.round(rect.width)),h=Math.max(1,Math.round(rect.height)),ratio=renderer.getPixelRatio();
      if(canvas.width!==Math.floor(w*ratio)||canvas.height!==Math.floor(h*ratio))renderer.setSize(w,h,false);
      const small=isMobile();desktop.forEach(m=>m.visible=!small);mobile.forEach(m=>m.visible=small);
      renderer.render(scene,small?mobileCamera:camera);
      metrics.frames++;metrics.visibleRooms=small?rooms.filter(isMobileRoom).length:renderedIds.length;
      metrics.mainCalls=renderer.info.render.calls;metrics.triangles=renderer.info.render.triangles;
    }
    return {apply,render,dispose,metrics,renderedIds,glassIds};
  } catch(error) {dispose();throw error;}
}
