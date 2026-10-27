// Regression checks for the reported van wiggle, independent of browser rasterization.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('dist/delivery.js','utf8');
const model=source.slice(source.indexOf('  class Illustration'),source.indexOf('  const hero=new Illustration'));
const context={console,Math,performance:{now:()=>0},devicePixelRatio:1,ResizeObserver:class{observe(){}},IntersectionObserver:class{observe(){}},ParcelDepthRenderer:class{draw(faces){this.faces=faces;}},scheduleModels(){},state:{model:'van',tape:'#9dbef3',size:'M',paused:false,open:false},motion:true,sizes:{M:{scale:1}},labelTexture:{},careTexture:{},vanTexture:{},cross:(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],norm:v=>{const l=Math.hypot(...v)||1;return v.map(n=>n/l);}};
vm.createContext(context);vm.runInContext(model+';this.Illustration=Illustration;',context);
const create=kind=>{const c={addEventListener(){},parentElement:{addEventListener(){}},getBoundingClientRect:()=>({width:480,height:310})};const i=new context.Illustration(c,kind);i.resize();return i;};
const van=create('van');van.render(1000);const first=JSON.stringify(van.renderer.faces);
for(const hover of [1,0,1,0]){van.hover=hover;van.render(2000+hover*100);assert.equal(JSON.stringify(van.renderer.faces),first,'Service van must not rotate with time or hover');}
const hero=create('hero');hero.render(1000);const yaw=hero.renderYaw;hero.hover=1;hero.render(5000);assert.equal(hero.renderYaw,yaw,'Hero van must remain steady at rest');hero.yaw+=.2;hero.render(5100);assert.equal(hero.renderYaw,yaw+.2,'Explicit rotation must still work');
const parcel=create('parcel');parcel.hover=1;parcel.render(16);assert(parcel.hoverBlend>0&&parcel.hoverBlend<1,'Hover must ease instead of jumping');
context.state.paused=true;const phase=parcel.phase;parcel.render(1000);assert.equal(parcel.phase,phase,'Pause must preserve the current phase');
context.motion=false;parcel.render(1100);assert.equal(parcel.hoverBlend,0,'Reduced motion must disable hover rotation');
console.log('PASS: stable service van, stable hero van, explicit rotation, eased hover, pause continuity, reduced motion.');
