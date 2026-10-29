// Route geometry, stable van transforms, controls and render-loop lifecycle.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('dist/delivery.js','utf8'),model=source.slice(source.indexOf('  class Illustration'),source.indexOf('  const hero=new Illustration'));
const frames=new Map();let frameId=0,clock=0;
function element(dataset={}){return{dataset,style:{},hidden:false,disabled:false,attributes:{},listeners:{},classList:{add(){},remove(){},contains(){return false;}},addEventListener(name,fn){this.listeners[name]=fn;},setAttribute(n,v){this.attributes[n]=v;},toggleAttribute(n,v){if(v)this.attributes[n]='';else delete this.attributes[n];},getBoundingClientRect(){return{width:640,height:315};},setPointerCapture(){}};}
const modes=['3d','2d'].map(v=>element({routeView:v})),camera=['out','in','reset'].map(v=>element({routeCamera:v})),labels=[element(),element()],svg=element(),hint=element(),map=element(),stage=element(),canvas=element();
canvas.parentElement=stage;canvas.closest=()=>map;map.querySelectorAll=()=>labels;
const document={hidden:false,querySelector:s=>s==='#route-svg'?svg:hint,querySelectorAll:s=>s==='[data-route-view]'?modes:camera,addEventListener(){}};
const context={console,document,Math,performance:{now:()=>clock},devicePixelRatio:1,matchMedia:()=>({matches:false}),ResizeObserver:class{observe(){}},IntersectionObserver:class{observe(){}},ParcelDepthRenderer:class{draw(faces){this.faces=faces;}},requestAnimationFrame:fn=>{frames.set(++frameId,fn);return frameId;},cancelAnimationFrame:id=>frames.delete(id),scheduleModels(){},state:{model:'parcel',tape:'#bcf8ae',size:'M',paused:false,open:false},motion:true,sizes:{M:{scale:1}},labelTexture:{},careTexture:{},vanTexture:{},cross:(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],norm:v=>{const l=Math.hypot(...v)||1;return v.map(n=>n/l);}};
vm.createContext(context);vm.runInContext(model+';this.Illustration=Illustration;',context);vm.runInContext(fs.readFileSync('dist/route-3d.js','utf8')+';this.RouteView=ParcelRouteView;',context);
// Curved fixture in SVG coordinates exercises interpolation and steering.
const path={getPointAtLength:t=>({x:82+523*t,y:180-60*Math.sin(t*Math.PI*2)})};
const view=new context.RouteView({Base:context.Illustration,canvas,path,length:1});
function flush(){let count=0;while(frames.size){assert(count++<60,'Animation frames must settle');clock+=16;const callbacks=[...frames.values()];frames.clear();callbacks.forEach(fn=>fn(clock));}}
flush();assert.equal(view.mode,'3d');assert.equal(modes[0].attributes['aria-pressed'],'true');
const scene=view.scene;scene.render();const first=JSON.stringify(scene.renderer.faces);scene.render();assert.equal(JSON.stringify(scene.renderer.faces),first,'The van and scene must stay rigid at rest');
assert(scene.renderer.faces.length>150);for(const f of scene.renderer.faces)for(const p of f.points)assert([p.x,p.y,p.z].every(Number.isFinite),'No broken or invalid mesh coordinates');
for(const t of[0,.22,.48,.78,1]){view.setPosition(t);flush();assert.equal(view.position,t);assert(Number.isFinite(view.at(t).angle));}
for(let i=1;i<80;i++){const a=view.at(i/80-1e-7).angle,b=view.at(i/80+1e-7).angle;assert(Math.abs(Math.atan2(Math.sin(a-b),Math.cos(a-b)))<.001,'Steering must be continuous across path samples');}
view.setMode('2d');assert.equal(view.position,1);assert.equal(stage.hidden,true);assert.equal(svg.attributes.hidden,undefined);assert(camera.every(b=>b.disabled));assert.equal(frames.size,0);
view.setPosition(.48);assert.equal(frames.size,0,'Hidden 3D view must not schedule drawing');view.setMode('3d');flush();assert.equal(view.position,.48);assert.equal(stage.hidden,false);
const yaw=scene.yaw;canvas.listeners.keydown({key:'ArrowRight',preventDefault(){}});flush();assert.equal(scene.yaw,yaw+.1,'Keyboard rotation must change the camera');
canvas.listeners.pointerdown({button:0,pointerId:1,clientX:10,clientY:10});canvas.listeners.pointermove({pointerId:1,clientX:90,clientY:1000});flush();assert.equal(scene.pitch,1.12);canvas.listeners.pointerup();assert.equal(view.drag,null);
view.setZoom(99);flush();assert.equal(view.zoom,1.5);assert(camera[1].disabled);view.setZoom(-99);flush();assert.equal(view.zoom,.8);assert(camera[0].disabled);
view.reset();flush();assert.equal(view.cameraTransition,null);assert.equal(view.zoom,1);assert.equal(scene.pitch,.78);
view.setMotion(false);scene.yaw=1;view.setZoom(1.4);view.reset();assert.equal(view.cameraTransition,null,'Reduced motion must skip animated reset');assert.equal(view.zoom,1);flush();
scene.visible=false;view.setPosition(.2);assert.equal(frames.size,0,'Offscreen route must not schedule frames');scene.visible=true;document.hidden=true;view.setPosition(.4);assert.equal(frames.size,0,'Background tabs must not schedule frames');document.hidden=false;
class Unavailable extends context.Illustration{constructor(...args){super(...args);this.renderer=null;}}
const fallback=new context.RouteView({Base:Unavailable,canvas,path,length:1});assert.equal(fallback.mode,'2d');assert(modes[0].disabled,'Unavailable WebGL must retain an accessible 2D map');
console.log('PASS: finite meshes, stable van, smooth steering, shared progress, 2D fallback, camera controls, reduced motion, bounded/offscreen rendering.');
