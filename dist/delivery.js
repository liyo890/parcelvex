(() => {
  'use strict';
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  const pref=matchMedia('(prefers-reduced-motion: reduce)');
  let motion=!pref.matches,sound=false,audio,toastTimer;
  const state={size:'M',tape:'#bcf8ae',fragile:false,model:'parcel',open:false,paused:!motion};
  const sizes={S:{name:'Small',dims:'20 × 15 × 10 cm',scale:.78,fee:0},M:{name:'Medium',dims:'30 × 25 × 20 cm',scale:1,fee:2},L:{name:'Large',dims:'45 × 35 × 30 cm',scale:1.15,fee:5}};
  function toast(text){$('#toast').textContent=text;$('#toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),3000);}
  function tone(f=440,d=.08){if(!sound)return;try{audio||=new(window.AudioContext||window.webkitAudioContext)();if(audio.state==='suspended')audio.resume();const o=audio.createOscillator(),g=audio.createGain();o.frequency.setValueAtTime(f,audio.currentTime);o.frequency.exponentialRampToValueAtTime(f*.65,audio.currentTime+d);g.gain.setValueAtTime(.045,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+d);o.connect(g).connect(audio.destination);o.start();o.stop(audio.currentTime+d);}catch{}}
  $('#sound').addEventListener('click',()=>{sound=!sound;$('#sound').setAttribute('aria-pressed',String(sound));$('#sound').setAttribute('aria-label',sound?'Disable interaction sounds':'Enable interaction sounds');$('#sound-label').textContent=sound?'Sound on':'Sound off';tone(620,.12);});
  $('.menu-toggle').addEventListener('click',()=>{const open=$('.header').classList.toggle('menu-open');$('.menu-toggle').setAttribute('aria-expanded',String(open));$('.menu-toggle').setAttribute('aria-label',open?'Close navigation':'Open navigation');});
  $$('.header nav a').forEach(a=>a.addEventListener('click',()=>{$('.header').classList.remove('menu-open');$('.menu-toggle').setAttribute('aria-expanded','false');$('.menu-toggle').setAttribute('aria-label','Open navigation');}));
  function scrollToSection(id){$(id).scrollIntoView({behavior:motion?'smooth':'instant',block:'start'});}
  const rgb=hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));
  const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
  const norm=v=>{const l=Math.hypot(...v)||1;return v.map(n=>n/l);};
  function createTexture(kind){
    const c=document.createElement('canvas');c.width=512;c.height=400;const x=c.getContext('2d');
    x.fillStyle=kind==='care'?'#efb4c5':'#f5f2e5';x.fillRect(0,0,512,400);x.fillStyle='#293025';
    if(kind==='care'){x.font='bold 58px Arial';x.fillText('HANDLE',40,105);x.fillText('WITH CARE',40,178);x.font='100px Arial';x.fillText('♡',195,305);x.font='23px Arial';x.fillText('good things inside',130,365);}
    else{x.font='bold 57px Arial';x.fillText('kinetic',35,76);x.font='22px Arial';x.fillText('GOOD THINGS. ON THEIR WAY.',35,119);x.fillRect(35,143,440,3);x.font='bold 38px Arial';x.fillText('KUL → PEN',35,206);x.font='23px Arial';x.fillText('KT20261027 · DEMO',35,247);let at=35;for(let i=0;i<53;i++){const w=[3,5,2,7,3,4][i%6];x.fillRect(at,280,w,66);at+=w+4;}x.font='18px Arial';x.fillText('A LITTLE CARE. EVERY STEP.',35,379);}
    return c;
  }
  const labelTexture=createTexture('label'),careTexture=createTexture('care');
  const vanTexture=document.createElement('canvas');vanTexture.width=600;vanTexture.height=250;{const c=vanTexture.getContext('2d');c.fillStyle='#273a20';c.font='bold 98px Arial';c.fillText('kinetic',30,125);c.font='29px Arial';c.fillText('GOOD THINGS, ON THEIR WAY.',34,185);}

  // Real 3D geometry, orthographic projection, depth sorting, and directional lighting.
  // Keeping the model in code makes every package part directly interactive and offline-capable.
  class Illustration {
    constructor(canvas,kind='hero'){
      this.canvas=canvas;this.ctx=canvas.getContext('2d');this.kind=kind;this.yaw=-.58;this.pitch=.34;this.open=0;this.w=1;this.h=1;this.visible=true;this.hover=0;
      new ResizeObserver(()=>this.resize()).observe(canvas);
      new IntersectionObserver(([e])=>{this.visible=e.isIntersecting;if(e.isIntersecting)this.render(performance.now());}).observe(canvas);
      if(kind!=='hero'){
        canvas.parentElement.addEventListener('pointerenter',()=>this.hover=1);
        canvas.parentElement.addEventListener('pointerleave',()=>this.hover=0);
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
      // Interior rim and a small mint surprise are revealed by the opening flaps.
      if(opening>.01){this.box(ox,oy-h+.13,oz,w*1.95,.17,d*1.95,'#8e6b48');this.box(ox,oy-.42*scale,oz,.82*scale,.75*scale,.82*scale,tape);}
      const a=opening*2.05,s=Math.sin(a),c=Math.cos(a);
      const front=[p(-w,h,d),p(w,h,d),p(w,h+d*s,d-d*c),p(-w,h+d*s,d-d*c)];
      const back=[p(w,h,-d),p(-w,h,-d),p(-w,h+d*s,-d+d*c),p(w,h+d*s,-d+d*c)];
      const sideA=[p(w,h,-d),p(w,h,d),p(w-w*c,h+w*s,d),p(w-w*c,h+w*s,-d)];
      const sideB=[p(-w,h,d),p(-w,h,-d),p(-w+w*c,h+w*s,-d),p(-w+w*c,h+w*s,d)];
      this.face(sideA,'#b3895c',null,null,true);this.face(sideB,'#b3895c',null,null,true);this.face(front,'#d8b182',null,null,true);this.face(back,'#d8b182',null,null,true);
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
    wheel(x,y,z){const n=16,r=.32,depth=.16;const front=[],back=[];for(let i=0;i<n;i++){const a=i/n*Math.PI*2;front.push([x+Math.cos(a)*r,y+Math.sin(a)*r,z+depth/2]);back.push([x+Math.cos(a)*r,y+Math.sin(a)*r,z-depth/2]);}for(let i=0;i<n;i++)this.face([front[i],front[(i+1)%n],back[(i+1)%n],back[i]],'#222a22',null,null,true);this.face(front,'#263326',[0,0,1]);this.face(back,'#263326',[0,0,-1]);const hub=front.map(p=>[x+(p[0]-x)*.45,y+(p[1]-y)*.45,p[2]+.01]);this.face(hub,'#9aaca0',[0,0,1]);}
    van(tape){this.box(-.55,.23,0,2.25,1.65,1.5,tape);this.box(.98,-.02,0,1.05,1.15,1.46,tape);this.box(1.23,-.33,0,.66,.51,1.5,tape);this.box(0,-.57,0,3.35,.21,1.42,'#31432f');
      this.face([[.55,.51,.75],[1.3,.51,.75],[1.3,.02,.75],[.55,.02,.75]],'#41644d',[0,0,1]);
      this.face([[1.52,.48,.65],[1.52,.48,-.65],[1.52,.02,-.65],[1.52,.02,.65]],'#43644f',[1,0,0]);
      this.face([[-1.47,.76,.757],[.31,.76,.757],[.31,-.12,.757],[-1.47,-.12,.757]],tape,[0,0,1],vanTexture);
      this.box(1.55,-.25,.49,.03,.14,.25,'#f4efd7');this.box(1.55,-.25,-.49,.03,.14,.25,'#f4efd7');this.box(1.57,-.53,0,.1,.14,1.5,'#42563e');
      for(const x of[-1.03,1.01])for(const z of[-.77,.77])this.wheel(x,-.65,z);
      this.box(.98,-.13,.76,.19,.035,.02,'#44683d');
    }
    render(now){if(!this.ctx||this.w<2||!this.visible)return;const hero=this.kind==='hero';const kind=hero?state.model:this.kind;const tape=hero?state.tape:kind==='van'?'#9dbef3':kind==='care'?'#e5a4bc':'#b1e69e';
      const desired=hero&&state.open&&kind==='parcel'?1:0;this.open=motion?this.open+(desired-this.open)*.13:desired;
      this.renderYaw=this.yaw+(motion&&!state.paused?Math.sin(now*.0003)*.1:0)+(hero?0:this.hover*.17);
      this.scale=Math.min(this.w/(hero?4.65:4.8),this.h/(hero?4.35:3.5))*(hero&&kind==='parcel'?1-this.open*.16:1);this.faces=[];
      const c=this.ctx;c.setTransform(this.dpr,0,0,this.dpr,0,0);c.clearRect(0,0,this.w,this.h);
      // An actual floor contact shadow gives the illustrated model its weight.
      const floor=this.project([0,-1.28,0]);c.fillStyle=hero?'#1b2518':'#00000012';c.beginPath();c.ellipse(floor.x,floor.y,this.scale*1.55,this.scale*.23,0,0,Math.PI*2);c.fill();
      if(kind==='van')this.van(tape);else this.parcel(hero?sizes[state.size].scale:.86,tape,hero?state.fragile:kind==='care',this.open);
      if(hero&&kind==='parcel'){
        // Secondary physical parcels, in the same world, give the hero its illustration composition.
        this.parcel(.29,'#9cbf89',false,0,[-1.65,-.87,-.3]);
      }
      this.faces.sort((a,b)=>a.points.reduce((n,p)=>n+p.z,0)/a.points.length-b.points.reduce((n,p)=>n+p.z,0)/b.points.length);
      for(const face of this.faces){const points=face.points,n=face.normal;let lighting=.61+Math.max(0,n[0]*-.35+n[1]*.7+n[2]*.65)*.4;if(face.double&&n[2]<0)lighting=.72;const color=rgb(face.color).map(v=>Math.round(clamp(v*lighting,0,255)));c.fillStyle=`rgb(${color})`;c.strokeStyle=c.fillStyle;c.lineWidth=.75;c.beginPath();points.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.closePath();c.fill();c.stroke();
        if(face.texture){const[a,b,,d]=points;const t=face.texture;c.save();c.beginPath();points.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.closePath();c.clip();c.transform((b.x-a.x)/t.width,(b.y-a.y)/t.width,(d.x-a.x)/t.height,(d.y-a.y)/t.height,a.x,a.y);c.drawImage(t,0,0);c.restore();}
      }
    }
  }
  const hero=new Illustration($('#parcel-canvas'),'hero');
  const illustrations=[hero,...$$('.service-canvas').map(c=>new Illustration(c,c.dataset.scene))];
  let lastFrame=0;
  function frame(now){requestAnimationFrame(frame);if(document.hidden||now-lastFrame<1000/35)return;lastFrame=now;illustrations.forEach(i=>{if(motion||Math.abs(i.open-(state.open?1:0))>.002)i.render(now);});}requestAnimationFrame(frame);
  const renderAll=()=>illustrations.forEach(i=>i.render(performance.now()));
  function setModel(model){state.model=model;if(model==='van')state.open=false;$$('[data-model]').forEach(b=>{const active=b.dataset.model===model;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});$('.stage-heading>span').innerHTML=`<i class="status-dot"></i>${model==='parcel'?'Your parcel, in 3D':'Good things, on the road'}`;$('#model-hint').textContent=model==='parcel'?'Drag to turn it. Click to unpack it.':'A little more get-up-and-go. Drag to explore.';$('#model-size').textContent=model==='parcel'?`${sizes[state.size].name} · ${sizes[state.size].dims}`:'Made for the little journeys.';$('#open-parcel').setAttribute('aria-pressed',String(state.open));$('#open-parcel').innerHTML=model==='van'?'Unpack a parcel <span>↗</span>':state.open?'Pack it up <span>↙</span>':'Unpack it <span>↗</span>';$('#parcel-canvas').setAttribute('aria-label',model==='parcel'?'Interactive 3D cardboard parcel. Drag or use arrow keys to rotate. Press Space to open the parcel.':'Interactive 3D delivery van. Drag or use arrow keys to rotate.');hero.yaw=-.58;renderAll();}
  function toggleOpen(force){if(state.model!=='parcel')setModel('parcel');state.open=typeof force==='boolean'?force:!state.open;$('#open-parcel').setAttribute('aria-pressed',String(state.open));$('#open-parcel').innerHTML=state.open?'Pack it up <span>↙</span>':'Unpack it <span>↗</span>';renderAll();tone(state.open?540:320,.13);if(state.open)toast('Good things inside. A little care outside.');}
  $$('[data-model]').forEach(b=>b.addEventListener('click',()=>{setModel(b.dataset.model);tone(400);}));$('#open-parcel').addEventListener('click',()=>toggleOpen());
  function setSize(size){state.size=size;$$('[data-size]').forEach(b=>{const active=b.dataset.size===size;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});$(`input[name="parcel-size"][value="${size}"]`).checked=true;$('#model-size').textContent=`${sizes[size].name} · ${sizes[size].dims}`;$('#dimension-caption').textContent=sizes[size].dims;$('.sizer-box').style.setProperty('--box-scale',sizes[size].scale);renderAll();updateQuote();}
  $$('[data-size]').forEach(b=>b.addEventListener('click',()=>{setSize(b.dataset.size);tone(440);}));
  $$('[data-tape]').forEach(b=>b.addEventListener('click',()=>{state.tape=b.dataset.tape;$$('[data-tape]').forEach(el=>{el.classList.toggle('active',el===b);el.setAttribute('aria-pressed',String(el===b));});renderAll();tone(650);}));
  function setCare(value){state.fragile=value;$('#fragile').setAttribute('aria-pressed',String(value));$('#quote-care').checked=value;$('#booking-care').checked=value;renderAll();updateQuote();}
  $('#fragile').addEventListener('click',()=>{setCare(!state.fragile);tone(520);});
  function updatePause(){$('#pause-model').textContent=state.paused?'▶':'Ⅱ';$('#pause-model').setAttribute('aria-label',state.paused?'Play ambient rotation':'Pause ambient rotation');$('#pause-model').setAttribute('aria-pressed',String(state.paused));}
  $('#pause-model').addEventListener('click',()=>{state.paused=!state.paused;updatePause();});
  $('#reset-model').addEventListener('click',()=>{hero.yaw=-.58;hero.pitch=.34;setModel('parcel');toggleOpen(false);toast('A fresh perspective.');});
  let drag=null;
  $('#parcel-canvas').addEventListener('pointerdown',e=>{drag={x:e.clientX,y:e.clientY,originX:e.clientX,originY:e.clientY,moved:false};e.currentTarget.setPointerCapture(e.pointerId);});
  $('#parcel-canvas').addEventListener('pointermove',e=>{if(!drag)return;if(Math.hypot(e.clientX-drag.originX,e.clientY-drag.originY)>6)drag.moved=true;hero.yaw+=(e.clientX-drag.x)*.009;hero.pitch=clamp(hero.pitch+(e.clientY-drag.y)*.006,-.6,1);drag.x=e.clientX;drag.y=e.clientY;hero.render(performance.now());});
  $('#parcel-canvas').addEventListener('pointerup',()=>{if(drag&&!drag.moved&&state.model==='parcel')toggleOpen();drag=null;});$('#parcel-canvas').addEventListener('pointercancel',()=>drag=null);
  $('#parcel-canvas').addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown',' '].includes(e.key)){e.preventDefault();if(e.key===' ')toggleOpen();else if(e.key==='ArrowLeft')hero.yaw-=.16;else if(e.key==='ArrowRight')hero.yaw+=.16;else hero.pitch=clamp(hero.pitch+(e.key==='ArrowUp'?.12:-.12),-.6,1);hero.render(performance.now());}});

  // Honest local shipment tracking: only the explicitly identified sample is recognized.
  const path=$('#route-path'),progress=$('#route-progress'),pathLength=path.getTotalLength();
  let journeyStep=2,routePosition=.48,targetPosition=.48,journeyTimer=null,routeFrame=0;
  const stops=[0,.22,.48,.78,1];
  const statuses=[['All packed up','A good journey<br>starts right here.','Your sample parcel is ready for its first scan.'],['In good hands','Collected with<br>a little care.','Your sample parcel has reached the Kuala Lumpur hub.'],['On the move','Making its way<br>to a good day.','Your sample parcel is travelling between hubs.'],['Almost there','One last stretch.<br>A little more joy.','Your sample parcel is on its final doorstep journey.'],['Hello, good things','A little journey.<br>A happy ending.','Demo complete. Your sample parcel has arrived.']];
  progress.style.strokeDasharray=String(pathLength);
  function drawRoute(){const p=path.getPointAtLength(pathLength*routePosition);$('#route-van').setAttribute('transform',`translate(${p.x} ${p.y})`);progress.style.strokeDashoffset=String(pathLength*(1-routePosition));}
  function animateRoute(){cancelAnimationFrame(routeFrame);function tick(){routePosition+=(targetPosition-routePosition)*.085;if(Math.abs(routePosition-targetPosition)<.001)routePosition=targetPosition;drawRoute();if(routePosition!==targetPosition&&motion)routeFrame=requestAnimationFrame(tick);}if(motion)tick();else{routePosition=targetPosition;drawRoute();}}
  function setStep(step,celebrate=false){journeyStep=step;targetPosition=stops[step];const s=statuses[step];$('#journey-status').textContent=s[0];$('#shipment-headline').innerHTML=s[1];$('#shipment-message').textContent=s[2];$$('[data-step]').forEach((b,i)=>{b.classList.toggle('active',i===step);b.classList.toggle('done',i<step);if(i===step)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');$('.step-check',b).textContent=i<step?'✓':i===step?'→':'';});animateRoute();if(celebrate&&step===4){burst($('#play-journey'),75);toast('Delivered. A little joy has arrived.');}tone(300+step*80);}
  function stopJourney(){clearInterval(journeyTimer);journeyTimer=null;$('#play-journey').setAttribute('aria-pressed','false');$('#play-journey').innerHTML=motion?'Play the journey <span>▶</span>':'Next journey step <span>→</span>';}
  $$('[data-step]').forEach(b=>b.addEventListener('click',()=>{stopJourney();setStep(+b.dataset.step,true);}));
  $('#play-journey').addEventListener('click',()=>{if(!motion){setStep((journeyStep+1)%5,true);return;}if(journeyTimer){stopJourney();return;}setStep(0);$('#play-journey').setAttribute('aria-pressed','true');$('#play-journey').innerHTML='Pause the journey <span>Ⅱ</span>';journeyTimer=setInterval(()=>{if(journeyStep<4)setStep(journeyStep+1,true);else stopJourney();},1450);});
  function track(){const input=$('#tracking-number'),value=input.value.toUpperCase().replace(/[\s-]/g,'');if(value!=='KT20261027'){input.setAttribute('aria-invalid','true');$('#track-error').textContent=value?'This demo only recognizes KT20261027. Try the sample tracking number.':'Add a tracking number, or try demo KT20261027.';input.focus();return;}input.removeAttribute('aria-invalid');$('#track-error').textContent='';input.value='KT20261027';stopJourney();setStep(2);scrollToSection('#tracking');toast('Sample shipment found. Follow the good things.');}
  $('#track-form').addEventListener('submit',e=>{e.preventDefault();track();});$('#try-demo').addEventListener('click',()=>{$('#tracking-number').value='KT20261027';track();});$('#tracking-number').addEventListener('input',()=>{$('#tracking-number').removeAttribute('aria-invalid');$('#track-error').textContent='';});
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
  function openBooking(){const q=quote();$('#booking-form').hidden=false;$('#booking-complete').hidden=true;$('#booking-title').textContent='Send a little joy.';$('#booking-summary').innerHTML=`${esc(q.from)} <span aria-hidden="true">→</span> ${esc(q.to)}<br><strong>RM ${q.total.toFixed(2)}</strong> <span>sample estimate</span><small>${sizes[state.size].name} · ${sizes[state.size].dims} · ${q.weight} kg · ${serviceNames[q.service]}</small>`;$('#booking-care').checked=state.fragile;const today=new Date(),tomorrow=new Date(today);tomorrow.setDate(today.getDate()+1);$('#pickup-date').min=localDate(today);if(!$('#pickup-date').value||$('#pickup-date').value<localDate(today))$('#pickup-date').value=localDate(tomorrow);if(!booking.open)booking.showModal();tone(520);}
  $$('[data-book]').forEach(b=>b.addEventListener('click',openBooking));$('#quote-form').addEventListener('submit',e=>{e.preventDefault();openBooking();});$('#close-booking').addEventListener('click',()=>booking.close());booking.addEventListener('click',e=>{if(e.target===booking){const r=booking.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)booking.close();}});
  $('#booking-care').addEventListener('change',()=>{setCare($('#booking-care').checked);const q=quote();$('strong',$('#booking-summary')).textContent=`RM ${q.total.toFixed(2)}`;});
  function barcode(root){root.replaceChildren();for(let i=0;i<47;i++){const bar=document.createElement('i');bar.style.width=`${[2,3,1,4,2,1,3][i%7]}px`;root.append(bar);}}
  $$('.barcode').forEach(barcode);
  $('#booking-form').addEventListener('submit',e=>{e.preventDefault();if(!e.currentTarget.reportValidity())return;const q=quote();labelData={...q,note:$('#parcel-note').value.trim()||'A little something good',date:$('#pickup-date').value,size:state.size,fragile:$('#booking-care').checked};$('#booking-form').hidden=true;$('#booking-complete').hidden=false;$('#booking-title').textContent='Good things, all packed.';$('#label-preview').innerHTML=`<div class="label-top"><span class="mini-brand">kinetic ↗</span><span class="demo-stamp">DEMO ONLY</span></div><h3>${esc(q.from)}<br>→ ${esc(q.to)}</h3><p>${esc(labelData.note)}<br>${sizes[state.size].name} · ${q.weight} kg · ${serviceNames[q.service]}<br>Preferred collection: ${esc(labelData.date)}${labelData.fragile?'<br>♡ Handle with care':''}</p><div class="barcode" aria-hidden="true"></div><p>KT20261027 · NOT VALID POSTAGE</p>`;barcode($('.barcode',$('#label-preview')));burst($('#booking-title'),75);tone(760,.16);});
  $('#plan-again').addEventListener('click',openBooking);
  $('#download-label').addEventListener('click',()=>{if(!labelData)return;const d=labelData;let bars='',x=40;for(let i=0;i<61;i++){const w=[2,4,2,6,3][i%5];bars+=`<rect x="${x}" y="410" width="${w}" height="65"/>`;x+=w+4;}const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="600" height="580" viewBox="0 0 600 580"><rect width="600" height="580" fill="#f1f0e7"/><g fill="#242e21" font-family="Arial,sans-serif"><text x="40" y="75" font-size="44" font-weight="bold">kinetic ↗</text><text x="390" y="67" font-size="18" font-weight="bold">DEMO ONLY</text><path d="M40 105h520" stroke="#242e21" stroke-width="2"/><text x="40" y="165" font-size="30">${esc(d.from)}</text><text x="40" y="209" font-size="30">→ ${esc(d.to)}</text><text x="40" y="265" font-size="18">${esc(d.note)}</text><text x="40" y="303" font-size="18">${sizes[d.size].name} · ${d.weight} kg · ${serviceNames[d.service]}</text><text x="40" y="340" font-size="18">Preferred collection: ${esc(d.date)}</text><text x="40" y="376" font-size="18">${d.fragile?'HANDLE WITH CARE':'PACKED WITH A LITTLE CARE'}</text>${bars}<text x="40" y="515" font-size="20">KT20261027 · NOT VALID POSTAGE</text><text x="40" y="551" font-size="14">Interactive concept. No shipment or collection has been booked.</text></g></svg>`;const url=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml'}));const a=document.createElement('a');a.href=url;a.download='kinetic-demo-shipping-label.svg';a.click();setTimeout(()=>URL.revokeObjectURL(url),5000);toast('Your demo label, ready to keep.');});
  updateQuote();

  // An interactive packing storyboard ties the small hover and active states to delivery.
  let packingTimer=null,packingStep=0;
  function setPacking(step){packingStep=step;$$('[data-pack]').forEach((b,i)=>{b.classList.toggle('active',i===step);b.setAttribute('aria-pressed',String(i===step));});$('.packing-mini').dataset.stage=step;$('#packing-status').textContent=['A good box is a good beginning.','A little label. A lot of care.','Packed, planned, and ready for a happy ending.'][step];setModel('parcel');toggleOpen(step===0);if(step===1)setCare(true);if(step===2)burst($('#play-packing'),45);tone(350+step*150);}
  function stopPacking(){clearInterval(packingTimer);packingTimer=null;$('#play-packing').innerHTML=motion?'Play the packing demo <span>▶</span>':'Next packing step <span>→</span>';}
  $$('[data-pack]').forEach(b=>b.addEventListener('click',()=>{stopPacking();setPacking(+b.dataset.pack);}));
  $('#play-packing').addEventListener('click',()=>{if(!motion){setPacking((packingStep+1)%3);return;}if(packingTimer){stopPacking();return;}setPacking(0);$('#play-packing').innerHTML='Pause packing demo <span>Ⅱ</span>';packingTimer=setInterval(()=>{if(packingStep<2)setPacking(packingStep+1);else stopPacking();},1550);});

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
