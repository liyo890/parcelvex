(() => {
  'use strict';
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];

  const iconPaths={"arrow-up-right": "M7 17 17 7M7 7h10v10", "arrow-down-left": "m17 7-10 10M7 7v10h10", "arrow-right": "M4 12h16m-6-6 6 6-6 6", "arrow-left": "M20 12H4m6-6-6 6 6 6", "arrow-down": "M12 4v16m-6-6 6 6 6-6", "arrow-up": "M12 20V4m-6 6 6-6 6 6", "reset": "M3 10a9 9 0 1 1 2.6 8.4M3 4v6h6", "play": "m8 5 11 7-11 7Z", "pause": "M8 5v14M16 5v14", "heart": "M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z", "location": "M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0ZM15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z", "sparkles": "m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5ZM21 2v4m-2-2h4", "check": "m5 12 4 4L19 6", "swap": "M4 7h16m-4-4 4 4-4 4M20 17H4m4-4-4 4 4 4", "plus": "M12 5v14M5 12h14", "close": "m6 6 12 12M6 18 18 6", "volume-off": "M11 4 6 8H2v8h4l5 4ZM16 9l6 6m0-6-6 6", "volume-on": "M11 4 6 8H2v8h4l5 4ZM15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14", "menu": "M4 7h16M4 17h16", "package": "m3 7 9-5 9 5v10l-9 5-9-5ZM3 7l9 5 9-5M12 12v10M7.5 4.5l9 5v5"};
  const icon=name=>`<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="${iconPaths[name]}"/></svg>`;
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  const pref=matchMedia('(prefers-reduced-motion: reduce)');
  let motion=!pref.matches,sound=false,audio,toastTimer;
  const state={size:'M',tape:'#bcf8ae',fragile:false,model:'parcel',open:false,paused:!motion};
  const sizes={S:{name:'Small',dims:'20 × 15 × 10 cm',scale:.78,fee:0},M:{name:'Medium',dims:'30 × 25 × 20 cm',scale:1,fee:2},L:{name:'Large',dims:'45 × 35 × 30 cm',scale:1.15,fee:5}};
  function toast(text){$('#toast').textContent=text;$('#toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),3000);}
  function tone(f=440,d=.08){if(!sound)return;try{audio||=new(window.AudioContext||window.webkitAudioContext)();if(audio.state==='suspended')audio.resume();const o=audio.createOscillator(),g=audio.createGain();o.frequency.setValueAtTime(f,audio.currentTime);o.frequency.exponentialRampToValueAtTime(f*.65,audio.currentTime+d);g.gain.setValueAtTime(.045,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+d);o.connect(g).connect(audio.destination);o.start();o.stop(audio.currentTime+d);}catch{}}
  $('#sound').addEventListener('click',()=>{sound=!sound;$('#sound').setAttribute('aria-pressed',String(sound));$('#sound').setAttribute('aria-label',sound?'Disable interaction sounds':'Enable interaction sounds');$('#sound-label').textContent=sound?'Sound on':'Sound off';$('#sound>span:first-child').innerHTML=icon(sound?'volume-on':'volume-off');tone(620,.12);});
  $('.menu-toggle').addEventListener('click',()=>{const open=$('.header').classList.toggle('menu-open');$('.menu-toggle').setAttribute('aria-expanded',String(open));$('.menu-toggle').innerHTML=icon(open?'close':'menu');$('.menu-toggle').setAttribute('aria-label',open?'Close navigation':'Open navigation');});
  $$('.header nav a').forEach(a=>a.addEventListener('click',()=>{$('.header').classList.remove('menu-open');$('.menu-toggle').setAttribute('aria-expanded','false');$('.menu-toggle').innerHTML=icon('menu');$('.menu-toggle').setAttribute('aria-label','Open navigation');}));
  function scrollToSection(id){$(id).scrollIntoView({behavior:motion?'smooth':'instant',block:'start'});}
  const rgb=hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));
  const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
  const norm=v=>{const l=Math.hypot(...v)||1;return v.map(n=>n/l);};
  function createTexture(kind){
    const c=document.createElement('canvas');c.width=512;c.height=400;const x=c.getContext('2d');
    x.fillStyle=kind==='care'?'#efb4c5':'#f5f2e5';x.fillRect(0,0,512,400);x.fillStyle='#293025';
    if(kind==='care'){x.font='bold 58px Arial';x.fillText('HANDLE',40,105);x.fillText('WITH CARE',40,178);x.save();x.translate(195,220);x.scale(5,5);x.strokeStyle='#293025';x.lineWidth=1.6;x.stroke(new Path2D(iconPaths.heart));x.restore();x.font='23px Arial';x.fillText('good things inside',130,365);}
    else{x.font='bold 54px Arial';x.fillText('ParcelVex',35,76);x.font='22px Arial';x.fillText('GOOD THINGS. ON THEIR WAY.',35,119);x.fillRect(35,143,440,3);x.font='bold 38px Arial';x.fillText('KUL → PEN',35,206);x.font='23px Arial';x.fillText('PV20261027 · DEMO',35,247);let at=35;for(let i=0;i<53;i++){const w=[3,5,2,7,3,4][i%6];x.fillRect(at,280,w,66);at+=w+4;}x.font='18px Arial';x.fillText('A LITTLE CARE. EVERY STEP.',35,379);}
    return c;
  }
  const labelTexture=createTexture('label'),careTexture=createTexture('care');
  const vanTexture=document.createElement('canvas');vanTexture.width=600;vanTexture.height=250;{const c=vanTexture.getContext('2d');c.fillStyle='#273a20';c.font='bold 83px Arial';c.fillText('ParcelVex',30,125);c.font='29px Arial';c.fillText('GOOD THINGS, ON THEIR WAY.',34,185);}

  // Real 3D geometry, orthographic projection, per-pixel depth testing, and directional lighting.
  // Keeping the model in code makes every package part directly interactive and offline-capable.
  class Illustration {
    constructor(canvas,kind='hero'){
      this.canvas=canvas;try{this.renderer=new ParcelDepthRenderer(canvas);}catch{canvas.classList.add('model-unavailable');canvas.insertAdjacentHTML('afterend','<p class="model-fallback">3D preview unavailable on this device. Parcel planning and tracking are still available.</p>');}this.kind=kind;this.yaw=-.58;this.pitch=.34;this.open=0;this.w=1;this.h=1;this.visible=true;this.hover=0;this.desiredOpen=kind==='packing'?1:0;
      this.lastRender=0;this.phase=0;this.hoverBlend=0;this.interacting=false;
      new ResizeObserver(()=>this.resize()).observe(canvas);
      canvas.addEventListener('modelrestore',()=>{this.render(performance.now());scheduleModels();});
      new IntersectionObserver(([e])=>{this.visible=e.isIntersecting;if(e.isIntersecting){this.render(performance.now());scheduleModels();}}).observe(canvas);
      if(kind!=='hero'){
        canvas.parentElement.addEventListener('pointerenter',e=>{if(e.pointerType==='touch')return;this.hover=1;scheduleModels();});
        canvas.parentElement.addEventListener('pointerleave',()=>{this.hover=0;scheduleModels();});
      }
    }
    resize(){const r=this.canvas.getBoundingClientRect();this.w=r.width;this.h=r.height;this.dpr=Math.min(devicePixelRatio||1,2);this.canvas.width=Math.round(this.w*this.dpr);this.canvas.height=Math.round(this.h*this.dpr);this.render(performance.now());}
    rotate(v){const sy=Math.sin(this.renderYaw),cy=Math.cos(this.renderYaw),sp=Math.sin(this.pitch),cp=Math.cos(this.pitch);const x=v[0]*cy+v[2]*sy,z=-v[0]*sy+v[2]*cy;return[x,v[1]*cp-z*sp,v[1]*sp+z*cp];}
    project(v){const p=this.rotate(v);return{x:this.w/2+p[0]*this.scale,y:this.h*.51-p[1]*this.scale,z:p[2]};}
    face(points,color,normal,texture=null,double=false){const n=normal||norm(cross(points[1].map((v,i)=>v-points[0][i]),points[2].map((v,i)=>v-points[0][i])));const r=this.rotate(n);if(!double&&r[2]<.001)return;this.faces.push({points:points.map(v=>this.project(v)),color,normal:r,texture,double});}
    box(cx,cy,cz,w,h,d,color){const l=cx-w/2,r=cx+w/2,b=cy-h/2,t=cy+h/2,f=cz+d/2,k=cz-d/2;
      this.face([[l,b,f],[r,b,f],[r,t,f],[l,t,f]],color,[0,0,1]);this.face([[r,b,k],[l,b,k],[l,t,k],[r,t,k]],color,[0,0,-1]);
      this.face([[r,b,f],[r,b,k],[r,t,k],[r,t,f]],color,[1,0,0]);this.face([[l,b,k],[l,b,f],[l,t,f],[l,t,k]],color,[-1,0,0]);
      this.face([[l,t,f],[r,t,f],[r,t,k],[l,t,k]],color,[0,1,0]);this.face([[l,b,k],[r,b,k],[r,b,f],[l,b,f]],color,[0,-1,0]);
    }
    parcel(scale,tape,fragile,opening=0,offset=[0,0,0]){
      const [ox,oy,oz]=offset,w=1.22*scale,h=.93*scale,d=.94*scale;
      const p=(x,y,z)=>[x+ox,y+oy,z+oz];const cardboard='#c69b6e';
      this.face([p(-w,-h,d),p(w,-h,d),p(w,h,d),p(-w,h,d)],cardboard,[0,0,1]);
      this.face([p(w,-h,-d),p(-w,-h,-d),p(-w,h,-d),p(w,h,-d)],cardboard,[0,0,-1]);
      this.face([p(w,-h,d),p(w,-h,-d),p(w,h,-d),p(w,h,d)],cardboard,[1,0,0]);
      this.face([p(-w,-h,-d),p(-w,-h,d),p(-w,h,d),p(-w,h,-d)],cardboard,[-1,0,0]);
      this.face([p(-w,-h,-d),p(w,-h,-d),p(w,-h,d),p(-w,-h,d)],'#856345',[0,1,0],null,true);
      const inset=.025*scale;
      this.face([p(-w+inset,-h,d-inset),p(w-inset,-h,d-inset),p(w-inset,h,d-inset),p(-w+inset,h,d-inset)],'#a47c51',[0,0,-1]);
      this.face([p(w-inset,-h,-d+inset),p(-w+inset,-h,-d+inset),p(-w+inset,h,-d+inset),p(w-inset,h,-d+inset)],'#a47c51',[0,0,1]);
      this.face([p(w-inset,-h,d),p(w-inset,-h,-d),p(w-inset,h,-d),p(w-inset,h,d)],'#a47c51',[-1,0,0]);
      this.face([p(-w+inset,-h,-d),p(-w+inset,-h,d),p(-w+inset,h,d),p(-w+inset,h,-d)],'#a47c51',[1,0,0]);
      // Interior rim and a small mint surprise are revealed by the opening flaps.
      if(opening>.01){this.box(ox,oy-h+.13,oz,w*1.95,.17,d*1.95,'#8e6b48');this.box(ox,oy-.42*scale,oz,.82*scale,.75*scale,.82*scale,tape);}
      const a=opening*2.05,s=Math.sin(a),c=Math.cos(a);
      const front=[p(-w,h,d),p(w,h,d),p(w,h+d*s,d-d*c),p(-w,h+d*s,d-d*c)];
      const back=[p(w,h,-d),p(-w,h,-d),p(-w,h+d*s,-d+d*c),p(w,h+d*s,-d+d*c)];
      const sideA=[p(w,h,-d),p(w,h,d),p(w-w*c,h+w*s,d),p(w-w*c,h+w*s,-d)];
      const sideB=[p(-w,h,d),p(-w,h,-d),p(-w+w*c,h+w*s,-d),p(-w+w*c,h+w*s,d)];
      this.face(sideA.map(v=>[v[0],v[1]-.035*scale,v[2]]),'#b3895c',null,null,true);this.face(sideB.map(v=>[v[0],v[1]-.035*scale,v[2]]),'#b3895c',null,null,true);this.face(front,'#d8b182',null,null,true);this.face(back,'#d8b182',null,null,true);
      // The tape follows the hinged flaps instead of hovering over the open box.
      const tw=.19*scale,eps=.009;
      this.face([p(-tw,h+eps,d),p(tw,h+eps,d),p(tw,h+d*s+eps,d-d*c),p(-tw,h+d*s+eps,d-d*c)],tape,null,null,true);
      this.face([p(tw,h+eps,-d),p(-tw,h+eps,-d),p(-tw,h+d*s+eps,-d+d*c),p(tw,h+d*s+eps,-d+d*c)],tape,null,null,true);
      this.face([p(-tw,-h,d+.01),p(tw,-h,d+.01),p(tw,h,d+.01),p(-tw,h,d+.01)],tape,[0,0,1]);
      this.face([p(tw,-h,-d-.01),p(-tw,-h,-d-.01),p(-tw,h,-d-.01),p(tw,h,-d-.01)],tape,[0,0,-1]);
      this.face([p(.33*scale,.52*scale,d+.018),p(1.04*scale,.52*scale,d+.018),p(1.04*scale,-.2*scale,d+.018),p(.33*scale,-.2*scale,d+.018)],'#f5f2e5',[0,0,1],labelTexture);
      if(fragile)this.face([p(-1.06*scale,.46*scale,d+.02),p(-.38*scale,.46*scale,d+.02),p(-.38*scale,-.19*scale,d+.02),p(-1.06*scale,-.19*scale,d+.02)],'#efb4c5',[0,0,1],careTexture);
      // Folded edges and kraft reinforcement along the base.
      this.box(ox,oy-h+.035,oz,w*2+.008,.045,d*2+.008,'#af8053');
    }
    wheel(x,y,z){const n=48,r=.32,depth=.16;const front=[],back=[];for(let i=0;i<n;i++){const a=i/n*Math.PI*2;front.push([x+Math.cos(a)*r,y+Math.sin(a)*r,z+depth/2]);back.push([x+Math.cos(a)*r,y+Math.sin(a)*r,z-depth/2]);}for(let i=0;i<n;i++)this.face([front[i],front[(i+1)%n],back[(i+1)%n],back[i]],'#222a22',null,null,true);this.face(front,'#263326',[0,0,1]);this.face(back,'#263326',[0,0,-1]);const hub=front.map(p=>[x+(p[0]-x)*.45,y+(p[1]-y)*.45,p[2]+.01]);this.face(hub,'#9aaca0',[0,0,1]);}
    van(tape){this.box(-.55,.23,0,2.25,1.65,1.5,tape);this.box(.98,-.02,0,1.05,1.15,1.46,tape);this.box(1.23,-.33,0,.66,.51,1.5,tape);this.box(0,-.57,0,3.35,.21,1.42,'#31432f');
      this.face([[.55,.51,.75],[1.3,.51,.75],[1.3,.02,.75],[.55,.02,.75]],'#41644d',[0,0,1]);
      this.face([[1.52,.48,.65],[1.52,.48,-.65],[1.52,.02,-.65],[1.52,.02,.65]],'#43644f',[1,0,0]);
      this.face([[-1.47,.76,.757],[.31,.76,.757],[.31,-.12,.757],[-1.47,-.12,.757]],tape,[0,0,1],vanTexture);
      this.box(1.55,-.25,.49,.03,.14,.25,'#f4efd7');this.box(1.55,-.25,-.49,.03,.14,.25,'#f4efd7');this.box(1.57,-.53,0,.1,.14,1.5,'#42563e');
      for(const x of[-1.03,1.01])for(const z of[-.77,.77])this.wheel(x,-.65,z);
      this.box(.98,-.13,.76,.19,.035,.02,'#44683d');
    }
    render(now){if(!this.renderer||this.w<2||!this.visible)return;const hero=this.kind==='hero';const kind=hero?state.model:this.kind;const tape=hero||kind==='packing'||kind==='sizer'?state.tape:kind==='van'?'#9dbef3':kind==='care'?'#e5a4bc':'#b1e69e';
      const dt=Math.min(50,this.lastRender?now-this.lastRender:16.67);this.lastRender=now;
      const ease=1-Math.exp(-dt/110),desired=hero?(state.open&&kind==='parcel'?1:0):this.desiredOpen;
      this.open=motion?this.open+(desired-this.open)*ease:desired;
      if(Math.abs(desired-this.open)<.001)this.open=desired;
      // The van stays rigid. Only explicit hero drag/keyboard input rotates it.
      // Other illustrations ease to hover targets; phase stops rather than snapping on pause.
      const hoverTarget=motion&&kind!=='van'?this.hover:0;
      this.hoverBlend=motion?this.hoverBlend+(hoverTarget-this.hoverBlend)*ease:0;
      if(Math.abs(hoverTarget-this.hoverBlend)<.001)this.hoverBlend=hoverTarget;
      if(motion&&!state.paused&&!this.interacting&&kind!=='van')this.phase+=dt*.0003;
      this.renderYaw=this.yaw+(kind==='van'?0:Math.sin(this.phase)*.1)+(hero?0:this.hoverBlend*.17);
      this.scale=Math.min(this.w/(hero?4.65:4.8),this.h/(hero?4.35:3.5))*(kind!=='van'?1-this.open*.22:1);this.faces=[];
      // A horizontal floor mesh shares the same depth buffer as the parcel.
      const ground=kind==='van'?-.98:-.93*(hero||kind==='sizer'?sizes[state.size].scale:.86)-.015;
      const floor=[];for(let i=0;i<48;i++){const a=i/48*Math.PI*2;floor.push([Math.cos(a)*1.7,ground,Math.sin(a)*1.05]);}
      this.face(floor,hero?'#202b1b':kind==='packing'?'#263321':kind==='sizer'?'#202b1b':kind==='van'?'#8eaddb':kind==='care'?'#cd9eac':'#a7ce96',[0,1,0],null,true);
      if(kind==='van')this.van(tape);else this.parcel(hero||kind==='sizer'?sizes[state.size].scale:.86,tape,hero||kind==='sizer'?state.fragile:kind==='care'||kind==='packing'&&this.desiredOpen===0,this.open);
      this.renderer.draw(this.faces,this.w,this.h);
    }
  }
  const hero=new Illustration($('#parcel-canvas'),'hero');
  const packingModel=new Illustration($('#packing-canvas'),'packing'),sizerModel=new Illustration($('#sizer-canvas'),'sizer');
  const illustrations=[hero,packingModel,sizerModel,...$$('.service-canvas').map(c=>new Illustration(c,c.dataset.scene))];
  let modelFrame=0;
  const needsFrame=i=>{const kind=i.kind==='hero'?state.model:i.kind;return i.renderer&&!i.renderer.lost&&i.visible&&motion&&((!state.paused&&kind!=='van'&&!i.interacting)||Math.abs(i.open-(i.kind==='hero'?(state.open&&state.model==='parcel'?1:0):i.desiredOpen))>.001||(kind!=='van'&&Math.abs(i.hoverBlend-i.hover)>.001));};
  function scheduleModels(){if(!modelFrame&&!document.hidden&&illustrations.some(needsFrame))modelFrame=requestAnimationFrame(frame);}
  function frame(now){modelFrame=0;if(document.hidden)return;illustrations.forEach(i=>{if(needsFrame(i))i.render(now);});scheduleModels();}
  const renderAll=()=>{illustrations.forEach(i=>i.render(performance.now()));scheduleModels();};
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(modelFrame);modelFrame=0;}else renderAll();});
  function setModel(model){state.model=model;if(model==='van')state.open=false;$$('[data-model]').forEach(b=>{const active=b.dataset.model===model;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});$('.stage-heading>span').innerHTML=`<i class="status-dot"></i>${model==='parcel'?'Your parcel, in 3D':'Good things, on the road'}`;$('#model-hint').textContent=model==='parcel'?'Drag to turn it. Click to unpack it.':'A little more get-up-and-go. Drag to explore.';$('#model-size').textContent=model==='parcel'?`${sizes[state.size].name} · ${sizes[state.size].dims}`:'Made for the little journeys.';$('#open-parcel').setAttribute('aria-pressed',String(state.open));$('#open-parcel').innerHTML=model==='van'?'Unpack a parcel <svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M7 17 17 7M7 7h10v10"/></svg>':state.open?'Pack it up <svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m17 7-10 10M7 7v10h10"/></svg>':'Unpack it <svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M7 17 17 7M7 7h10v10"/></svg>';$('#parcel-canvas').setAttribute('aria-label',model==='parcel'?'Interactive 3D cardboard parcel. Drag or use arrow keys to rotate. Press Space to open the parcel.':'Interactive 3D delivery van. Drag or use arrow keys to rotate.');hero.yaw=-.58;renderAll();}
  function toggleOpen(force){if(state.model!=='parcel')setModel('parcel');state.open=typeof force==='boolean'?force:!state.open;$('#open-parcel').setAttribute('aria-pressed',String(state.open));$('#open-parcel').innerHTML=state.open?'Pack it up <svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m17 7-10 10M7 7v10h10"/></svg>':'Unpack it <svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M7 17 17 7M7 7h10v10"/></svg>';renderAll();tone(state.open?540:320,.13);if(state.open)toast('Good things inside. A little care outside.');}
  $$('[data-model]').forEach(b=>b.addEventListener('click',()=>{setModel(b.dataset.model);tone(400);}));$('#open-parcel').addEventListener('click',()=>toggleOpen());
  function setSize(size){state.size=size;$$('[data-size]').forEach(b=>{const active=b.dataset.size===size;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});$(`input[name="parcel-size"][value="${size}"]`).checked=true;$('#model-size').textContent=`${sizes[size].name} · ${sizes[size].dims}`;$('#dimension-caption').textContent=sizes[size].dims;renderAll();updateQuote();}
  $$('[data-size]').forEach(b=>b.addEventListener('click',()=>{setSize(b.dataset.size);tone(440);}));
  $$('[data-tape]').forEach(b=>b.addEventListener('click',()=>{state.tape=b.dataset.tape;$$('[data-tape]').forEach(el=>{el.classList.toggle('active',el===b);el.setAttribute('aria-pressed',String(el===b));});renderAll();tone(650);}));
  function setCare(value){state.fragile=value;$('#fragile').setAttribute('aria-pressed',String(value));$('#quote-care').checked=value;$('#booking-care').checked=value;renderAll();updateQuote();}
  $('#fragile').addEventListener('click',()=>{setCare(!state.fragile);tone(520);});
  function updatePause(){$('#pause-model').innerHTML=icon(state.paused?'play':'pause');$('#pause-model').setAttribute('aria-label',state.paused?'Play ambient rotation':'Pause ambient rotation');$('#pause-model').setAttribute('aria-pressed',String(state.paused));}
  $('#pause-model').addEventListener('click',()=>{state.paused=!state.paused;updatePause();renderAll();});
  $('#reset-model').addEventListener('click',()=>{hero.yaw=-.58;hero.pitch=.34;setModel('parcel');toggleOpen(false);toast('A fresh perspective.');});
  let drag=null;
  $('#parcel-canvas').addEventListener('pointerdown',e=>{hero.interacting=true;drag={x:e.clientX,y:e.clientY,originX:e.clientX,originY:e.clientY,moved:false};e.currentTarget.setPointerCapture(e.pointerId);});
  $('#parcel-canvas').addEventListener('pointermove',e=>{if(!drag)return;if(Math.hypot(e.clientX-drag.originX,e.clientY-drag.originY)>6)drag.moved=true;hero.yaw+=(e.clientX-drag.x)*.009;hero.pitch=clamp(hero.pitch+(e.clientY-drag.y)*.006,-.6,1);drag.x=e.clientX;drag.y=e.clientY;hero.render(performance.now());});
  function endModelDrag(){drag=null;hero.interacting=false;scheduleModels();}
  $('#parcel-canvas').addEventListener('pointerup',()=>{if(drag&&!drag.moved&&state.model==='parcel')toggleOpen();endModelDrag();});$('#parcel-canvas').addEventListener('pointercancel',endModelDrag);$('#parcel-canvas').addEventListener('lostpointercapture',endModelDrag);
  $('#parcel-canvas').addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown',' '].includes(e.key)){e.preventDefault();if(e.key===' ')toggleOpen();else if(e.key==='ArrowLeft')hero.yaw-=.16;else if(e.key==='ArrowRight')hero.yaw+=.16;else hero.pitch=clamp(hero.pitch+(e.key==='ArrowUp'?.12:-.12),-.6,1);hero.render(performance.now());}});

  // Honest local shipment tracking: only the explicitly identified sample is recognized.
  const path=$('#route-path'),progress=$('#route-progress'),pathLength=path.getTotalLength();
  let journeyStep=2,routePosition=.48,targetPosition=.48,journeyTimer=null,routeFrame=0;
  const stops=[0,.22,.48,.78,1];
  const statuses=[['All packed up','A good journey<br>starts right here.','Your sample parcel is ready for its first scan.'],['In good hands','Collected with<br>a little care.','Your sample parcel has reached the Kuala Lumpur hub.'],['On the move','Making its way<br>to a good day.','Your sample parcel is travelling between hubs.'],['Almost there','One last stretch.<br>A little more joy.','Your sample parcel is on its final doorstep journey.'],['Hello, good things','A little journey.<br>A happy ending.','Demo complete. Your sample parcel has arrived.']];
  progress.style.strokeDasharray=String(pathLength);
  function drawRoute(){const p=path.getPointAtLength(pathLength*routePosition);$('#route-van').setAttribute('transform',`translate(${p.x} ${p.y})`);progress.style.strokeDashoffset=String(pathLength*(1-routePosition));}
  function animateRoute(){cancelAnimationFrame(routeFrame);function tick(){routePosition+=(targetPosition-routePosition)*.085;if(Math.abs(routePosition-targetPosition)<.001)routePosition=targetPosition;drawRoute();if(routePosition!==targetPosition&&motion)routeFrame=requestAnimationFrame(tick);}if(motion)tick();else{routePosition=targetPosition;drawRoute();}}
  function setStep(step,celebrate=false){journeyStep=step;targetPosition=stops[step];const s=statuses[step];document.dispatchEvent(new CustomEvent('parcel-journey',{detail:{step}}));$('#journey-status').textContent=s[0];$('#shipment-headline').innerHTML=s[1];$('#shipment-message').textContent=s[2];$$('[data-step]').forEach((b,i)=>{b.classList.toggle('active',i===step);b.classList.toggle('done',i<step);if(i===step)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');$('.step-check',b).innerHTML=i<step?icon('check'):i===step?icon('arrow-right'):'';});animateRoute();if(celebrate&&step===4){burst($('#play-journey'),75);toast('Delivered. A little joy has arrived.');}tone(300+step*80);}
  function stopJourney(){clearInterval(journeyTimer);journeyTimer=null;$('#play-journey').setAttribute('aria-pressed','false');$('#play-journey').innerHTML=motion?'Play the journey <svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m8 5 11 7-11 7Z"/></svg>':'Next journey step <svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 12h16m-6-6 6 6-6 6"/></svg>';}
  $$('[data-step]').forEach(b=>b.addEventListener('click',()=>{stopJourney();setStep(+b.dataset.step,true);}));
  $('#play-journey').addEventListener('click',()=>{if(!motion){setStep((journeyStep+1)%5,true);return;}if(journeyTimer){stopJourney();return;}setStep(0);$('#play-journey').setAttribute('aria-pressed','true');$('#play-journey').innerHTML='Pause the journey <svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M8 5v14M16 5v14"/></svg>';journeyTimer=setInterval(()=>{if(journeyStep<4)setStep(journeyStep+1,true);else stopJourney();},1450);});
  function track(){const input=$('#tracking-number'),value=input.value.toUpperCase().replace(/[\s-]/g,'');if(value!=='PV20261027'){input.setAttribute('aria-invalid','true');$('#track-error').textContent=value?'This demo only recognizes PV20261027. Try the sample tracking number.':'Add a tracking number, or try demo PV20261027.';input.focus();return;}input.removeAttribute('aria-invalid');$('#track-error').textContent='';input.value='PV20261027';stopJourney();setStep(2);scrollToSection('#tracking');toast('Sample shipment found. Follow the good things.');}
  $('#track-form').addEventListener('submit',e=>{e.preventDefault();track();});$('#try-demo').addEventListener('click',()=>{$('#tracking-number').value='PV20261027';track();});$('#tracking-number').addEventListener('input',()=>{$('#tracking-number').removeAttribute('aria-invalid');$('#track-error').textContent='';});
  drawRoute();setStep(2);

  // Service carousel: direct drag, native touch scrolling, arrows, keyboard and dots.
  const carousel=$('#service-carousel');let slide=0,carouselDrag=null,suppressClick=false;
  const carouselStep=()=>$('.service-card').getBoundingClientRect().width+parseFloat(getComputedStyle(carousel).gap);
  function updateSlide(){slide=clamp(Math.round(carousel.scrollLeft/carouselStep()),0,2);$('#slide-count').textContent=`${slide+1} / 3`;$$('[data-slide]').forEach((b,i)=>{b.classList.toggle('active',i===slide);b.setAttribute('aria-pressed',String(i===slide));});}
  function goSlide(n){carousel.scrollTo({left:((n+3)%3)*carouselStep(),behavior:motion?'smooth':'instant'});tone(400);}
  $('#prev-service').addEventListener('click',()=>goSlide(slide-1));$('#next-service').addEventListener('click',()=>goSlide(slide+1));$$('[data-slide]').forEach(b=>b.addEventListener('click',()=>goSlide(+b.dataset.slide)));
  carousel.addEventListener('scroll',updateSlide,{passive:true});carousel.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();goSlide(slide+(e.key==='ArrowRight'?1:-1));}});
  carousel.addEventListener('pointerdown',e=>{if(e.pointerType==='touch'||e.button!==0)return;carouselDrag={x:e.clientX,scroll:carousel.scrollLeft,id:e.pointerId,moved:false};});
  window.addEventListener('pointermove',e=>{if(!carouselDrag)return;const dx=e.clientX-carouselDrag.x;if(Math.abs(dx)>6){if(!carouselDrag.moved){carouselDrag.moved=true;carousel.classList.add('dragging');carousel.setPointerCapture(carouselDrag.id);}carousel.scrollLeft=carouselDrag.scroll-dx;}});
  function endCarousel(){if(!carouselDrag)return;const moved=carouselDrag.moved;if(carousel.hasPointerCapture(carouselDrag.id))carousel.releasePointerCapture(carouselDrag.id);carouselDrag=null;carousel.classList.remove('dragging');if(moved){suppressClick=true;goSlide(Math.round(carousel.scrollLeft/carouselStep()));setTimeout(()=>suppressClick=false,150);}}
  window.addEventListener('pointerup',endCarousel);window.addEventListener('pointercancel',endCarousel);
  new ResizeObserver(()=>{const extra=Math.max(0,carousel.clientWidth-parseFloat(getComputedStyle(carousel).paddingLeft)*2-$('.service-card').getBoundingClientRect().width);carousel.style.paddingRight=`calc(var(--page) + ${extra}px)`;updateSlide();}).observe(carousel);
  $$('[data-quote-service]').forEach(b=>b.addEventListener('click',()=>{if(suppressClick)return;$('#quote-service').value=b.dataset.quoteService;if(b.dataset.quoteService==='care')setCare(true);updateQuote();scrollToSection('#quote');toast('A delivery style, picked for you.');}));

  function quote(){const from=$('#quote-from').value,to=$('#quote-to').value,weight=+$('#quote-weight').value,service=$('#quote-service').value;const east=['Kuching','Kota Kinabalu'];const base=from===to?6.9:east.includes(from)!==east.includes(to)?23.9:east.includes(from)?17.9:8.9;const size=sizes[state.size].fee,weightFee=Math.max(0,Math.ceil(weight-1))*2,option=service==='express'?7:service==='care'?3:0,care=$('#quote-care').checked&&service!=='care'?3:0;return{from,to,weight,service,base,size,weightFee,option,care,total:base+size+weightFee+option+care};}
  function updateQuote(){const q=quote();$('#weight-value').textContent=`${q.weight} kg`;$('#quote-price').textContent=`RM ${q.total.toFixed(2)}`;$('#quote-breakdown').textContent=`RM ${q.base.toFixed(2)} route + ${q.size.toFixed(2)} size + ${q.weightFee.toFixed(2)} weight${q.option+q.care?` + ${(q.option+q.care).toFixed(2)} extras`:''}`;}
  ['#quote-from','#quote-to','#quote-service'].forEach(id=>$(id).addEventListener('change',()=>{updateQuote();tone(420);}));$('#quote-weight').addEventListener('input',updateQuote);$('#quote-care').addEventListener('change',()=>setCare($('#quote-care').checked));
  $$('input[name="parcel-size"]').forEach(input=>input.addEventListener('change',()=>{setSize(input.value);tone(430);}));
  $('#swap-route').addEventListener('click',()=>{const a=$('#quote-from').value;$('#quote-from').value=$('#quote-to').value;$('#quote-to').value=a;updateQuote();tone(500);});
  const booking=$('#booking-dialog');let labelData=null;
  const serviceNames={everyday:'Everyday delivery',express:'Express delivery',care:'Handle with care'};
  const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function localDate(date){return`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;}
  function openBooking(){const q=quote();$('#booking-form').hidden=false;$('#booking-complete').hidden=true;$('#booking-title').textContent='Send a little joy.';$('#booking-summary').innerHTML=`${esc(q.from)} <span aria-hidden="true">→</span> ${esc(q.to)}<br><strong>RM ${q.total.toFixed(2)}</strong> <span>sample estimate</span><small>${sizes[state.size].name} · ${sizes[state.size].dims} · ${q.weight} kg · ${serviceNames[q.service]}</small>`;$('#booking-care').checked=state.fragile;const today=new Date(),tomorrow=new Date(today);tomorrow.setDate(today.getDate()+1);$('#pickup-date').min=localDate(today);if(!$('#pickup-date').value||$('#pickup-date').value<localDate(today))$('#pickup-date').value=localDate(tomorrow);if(!booking.open)booking.showModal();window.ParcelPlanner?.start();tone(520);}
  $$('[data-book]').forEach(b=>b.addEventListener('click',openBooking));$('#quote-form').addEventListener('submit',e=>{e.preventDefault();openBooking();});$('#close-booking').addEventListener('click',()=>booking.close());booking.addEventListener('click',e=>{if(e.target===booking){const r=booking.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)booking.close();}});
  $('#booking-care').addEventListener('change',()=>{setCare($('#booking-care').checked);const q=quote();$('strong',$('#booking-summary')).textContent=`RM ${q.total.toFixed(2)}`;});
  function barcode(root){root.replaceChildren();for(let i=0;i<47;i++){const bar=document.createElement('i');bar.style.width=`${[2,3,1,4,2,1,3][i%7]}px`;root.append(bar);}}
  $$('.barcode').forEach(barcode);
  $('#booking-form').addEventListener('submit',e=>{e.preventDefault();if(!e.currentTarget.reportValidity())return;const q=quote();labelData={...q,note:$('#parcel-note').value.trim()||'A little something good',date:$('#pickup-date').value,size:state.size,fragile:$('#booking-care').checked};$('#booking-form').hidden=true;$('#booking-complete').hidden=false;$('#booking-title').textContent='Good things, all packed.';$('#label-preview').innerHTML=`<div class="label-top"><span class="mini-brand">ParcelVex</span><span class="demo-stamp">DEMO ONLY</span></div><h3>${esc(q.from)}<br>→ ${esc(q.to)}</h3><p>${esc(labelData.note)}<br>${sizes[state.size].name} · ${q.weight} kg · ${serviceNames[q.service]}<br>Preferred collection: ${esc(labelData.date)}${labelData.fragile?'<br>Handle with care':''}</p><div class="barcode" aria-hidden="true"></div><p>PV20261027 · NOT VALID POSTAGE</p>`;barcode($('.barcode',$('#label-preview')));burst($('#booking-title'),75);tone(760,.16);});
  $('#plan-again').addEventListener('click',openBooking);
  $('#download-label').addEventListener('click',()=>{if(!labelData)return;const d=labelData;let bars='',x=40;for(let i=0;i<61;i++){const w=[2,4,2,6,3][i%5];bars+=`<rect x="${x}" y="410" width="${w}" height="65"/>`;x+=w+4;}const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="600" height="760" viewBox="0 0 600 760"><rect width="600" height="760" fill="#f1f0e7"/><g fill="#242e21" font-family="Arial,sans-serif"><text x="40" y="75" font-size="38" font-weight="bold">ParcelVex</text><text x="390" y="67" font-size="18" font-weight="bold">DEMO ONLY</text><path d="M40 105h520" stroke="#242e21" stroke-width="2"/><text x="40" y="165" font-size="30">${esc(d.from)}</text><text x="40" y="209" font-size="30">→ ${esc(d.to)}</text><text x="40" y="265" font-size="18">${esc(d.note)}</text><text x="40" y="303" font-size="18">${sizes[d.size].name} · ${d.weight} kg · ${serviceNames[d.service]}</text><text x="40" y="340" font-size="18">Preferred collection: ${esc(d.date)}</text><text x="40" y="376" font-size="18">${d.fragile?'HANDLE WITH CARE':'PACKED WITH A LITTLE CARE'}</text>${bars}<text x="40" y="515" font-size="20">PV20261027 · NOT VALID POSTAGE</text><text x="40" y="551" font-size="14">Interactive concept. No shipment or collection has been booked.</text>${window.ParcelPlanner?.labelSVG()||''}</g></svg>`;const url=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml'}));const a=document.createElement('a');a.href=url;a.download='parcelvex-demo-shipping-label.svg';a.click();setTimeout(()=>URL.revokeObjectURL(url),5000);toast('Your demo label, ready to keep.');});
  window.ParcelVex={quote,updateQuote,setSize,setCare,sizes,esc,icon};
  updateQuote();

  // An interactive packing storyboard ties the small hover and active states to delivery.
  let packingTimer=null,packingStep=0;
  function setPacking(step){packingStep=step;$$('[data-pack]').forEach((b,i)=>{b.classList.toggle('active',i===step);b.setAttribute('aria-pressed',String(i===step));});$('.packing-mini').dataset.stage=step;packingModel.desiredOpen=step===0?1:0;$('#packing-status').textContent=['A good box is a good beginning.','A little label. A lot of care.','Packed, planned, and ready for a happy ending.'][step];setModel('parcel');toggleOpen(step===0);if(step===1)setCare(true);if(step===2)burst($('#play-packing'),45);tone(350+step*150);}
  function stopPacking(){clearInterval(packingTimer);packingTimer=null;$('#play-packing').innerHTML=motion?'Play the packing demo <svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m8 5 11 7-11 7Z"/></svg>':'Next packing step <svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 12h16m-6-6 6 6-6 6"/></svg>';}
  $$('[data-pack]').forEach(b=>b.addEventListener('click',()=>{stopPacking();setPacking(+b.dataset.pack);}));
  $('#play-packing').addEventListener('click',()=>{if(!motion){setPacking((packingStep+1)%3);return;}if(packingTimer){stopPacking();return;}setPacking(0);$('#play-packing').innerHTML='Pause packing demo <svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M8 5v14M16 5v14"/></svg>';packingTimer=setInterval(()=>{if(packingStep<2)setPacking(packingStep+1);else stopPacking();},1550);});

  const confetti=$('#confetti'),confettiCtx=confetti.getContext('2d');let particles=[],confettiFrame=0;
  function burst(element,number=70){if(!motion)return;const r=element.getBoundingClientRect();confetti.width=innerWidth;confetti.height=innerHeight;confetti.style.display='block';for(let i=0;i<number;i++)particles.push({x:r.left+r.width/2,y:clamp(r.top+r.height/2,50,innerHeight-50),vx:(Math.random()-.5)*12,vy:-5-Math.random()*9,r:Math.random()*6,size:4+Math.random()*5,life:95,color:['#bcf8ae','#accbff','#f7b6cd','#d7b184'][i%4]});if(!confettiFrame)drawConfetti();}
  function drawConfetti(){confettiCtx.clearRect(0,0,confetti.width,confetti.height);particles=particles.filter(p=>p.life>0&&p.y<innerHeight+30);particles.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.vy+=.25;p.vx*=.985;p.r+=.09;p.life--;confettiCtx.save();confettiCtx.translate(p.x,p.y);confettiCtx.rotate(p.r);confettiCtx.globalAlpha=Math.min(p.life/22,1);confettiCtx.fillStyle=p.color;confettiCtx.fillRect(-p.size/2,-p.size/2,p.size,p.size*.5);confettiCtx.restore();});confettiFrame=particles.length?requestAnimationFrame(drawConfetti):0;if(!particles.length)confetti.style.display='none';}
  $('#celebrate').addEventListener('click',e=>{burst(e.currentTarget,95);tone(880,.14);toast('A little joy. No postage required.');});
  function setMotion(value){motion=value;state.paused=!value;document.body.classList.toggle('motion-off',!value);document.documentElement.style.scrollBehavior=value?'smooth':'auto';$('#motion-switch').setAttribute('aria-checked',String(value));$('#motion-label').textContent=value?'Motion is on':'Motion is off';updatePause();if(!value){stopJourney();stopPacking();cancelAnimationFrame(routeFrame);routePosition=targetPosition;drawRoute();particles=[];cancelAnimationFrame(confettiFrame);confettiFrame=0;confettiCtx.clearRect(0,0,confetti.width,confetti.height);confetti.style.display='none';$$('.magnetic').forEach(el=>el.style.transform='');}renderAll();}
  $('#motion-switch').addEventListener('click',()=>setMotion(!motion));pref.addEventListener('change',e=>setMotion(!e.matches));setMotion(motion);
  const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.remove('waiting');observer.unobserve(e.target);}}),{threshold:.12});$$('.section-top,.tracking-dashboard,.quote-copy,.quote-panel,.how-heading,.packing-steps,.faq-section>div,.footer-top>div').forEach((el,i)=>{el.classList.add('reveal','waiting');el.style.transitionDelay=`${i%2*70}ms`;observer.observe(el);});
  if(matchMedia('(hover: hover)').matches)$$('.magnetic').forEach(el=>{el.addEventListener('pointermove',e=>{if(!motion)return;const r=el.getBoundingClientRect();el.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.09}px,${(e.clientY-r.top-r.height/2)*.16}px)`;});el.addEventListener('pointerleave',()=>el.style.transform='');});
  document.addEventListener('click',e=>{if(e.target.closest('a[href^="#"]'))tone(400,.05);});
})();
