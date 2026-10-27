(() => {
  'use strict';
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  let motion = !preference.matches;
  let sound = false;
  let audioContext;
  let toastTimer;
  const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
  const toast = (message) => {
    $('#toast').textContent = message;
    $('#toast').classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => $('#toast').classList.remove('show'), 2600);
  };
  function tone(freq = 440, duration = .065) {
    if (!sound) return;
    try {
      audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
      if (audioContext.state === 'suspended') audioContext.resume();
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioContext.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * .6, audioContext.currentTime + duration);
      gain.gain.setValueAtTime(.055, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(.001, audioContext.currentTime + duration);
      osc.connect(gain).connect(audioContext.destination);
      osc.start(); osc.stop(audioContext.currentTime + duration);
    } catch { /* Sound is optional if this browser has no audio support. */ }
  }
  $('#sound').addEventListener('click', () => {
    sound = !sound;
    $('#sound').setAttribute('aria-pressed', String(sound));
    $('#sound').setAttribute('aria-label', sound ? 'Disable interaction sounds' : 'Enable interaction sounds');
    $('#sound-label').textContent = sound ? 'Sound on' : 'Sound off';
    tone(620, .12);
  });
  $('.menu-toggle').addEventListener('click', () => {
    const opened = $('.header').classList.toggle('menu-open');
    $('.menu-toggle').setAttribute('aria-expanded', String(opened));
    $('.menu-toggle').setAttribute('aria-label', opened ? 'Close navigation' : 'Open navigation');
  });
  $$('.header nav a').forEach(a => a.addEventListener('click', () => {
    $('.header').classList.remove('menu-open');
    $('.menu-toggle').setAttribute('aria-expanded', 'false');
    $('.menu-toggle').setAttribute('aria-label', 'Open navigation');
  }));

  // A small software 3D renderer keeps the sculpture self-contained, with no WebGL dependency.
  const canvas = $('#sculpture');
  const ctx = canvas.getContext('2d', { alpha: true });
  let width = 1, height = 1, dpr = 1;
  let yaw = -.5, pitch = .56, pointerX = 0, pointerY = 0;
  let paused = !motion, dragging = false, visible = true;
  let lastX = 0, lastY = 0, lastFrame = 0;
  let color = [188, 248, 174];
  let shape = 'orbit';
  const U = 128, V = 36;
  const geometry = {};
  const cross = (a, b) => [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];
  const normalize = a => { const l = Math.hypot(...a) || 1; return a.map(x => x/l); };
  function center(t, kind) {
    if (kind === 'knot') return [(1.5 + .4*Math.cos(3*t))*Math.cos(2*t)*.74, (1.5 + .4*Math.cos(3*t))*Math.sin(2*t)*.74, .54*Math.sin(3*t)];
    const r = kind === 'bloom' ? 1.27 + .32*Math.cos(5*t) : 1.4 + .11*Math.cos(3*t);
    return [r*Math.cos(t), r*Math.sin(t), (kind === 'bloom' ? .21 : .38)*Math.sin(3*t)];
  }
  function makeGeometry(kind) {
    const points = [];
    for (let i = 0; i < U; i++) {
      const t = i/U * Math.PI*2;
      const c = center(t, kind), next = center(t + .001, kind);
      const tangent = normalize(next.map((x,k) => x-c[k]));
      const normal = normalize(cross(tangent, [0,0,1]));
      const binormal = cross(tangent, normal);
      for (let j = 0; j < V; j++) {
        const v = j/V * Math.PI*2;
        const tube = kind === 'knot' ? .32 : kind === 'bloom' ? .43 : .55;
        const ripple = 1 + .032*Math.cos(12*t);
        const n = normal.map((x,k) => x*Math.cos(v)+binormal[k]*Math.sin(v));
        points.push({p:c.map((x,k) => x+n[k]*tube*ripple), n});
      }
    }
    return points;
  }
  ['orbit','knot','bloom'].forEach(k => geometry[k] = makeGeometry(k));
  let current = geometry.orbit.map(v => ({p:[...v.p],n:[...v.n]}));
  function resize() {
    const b = canvas.getBoundingClientRect(); width = b.width; height = b.height;
    dpr = Math.min(devicePixelRatio || 1, 1.75);
    canvas.width = Math.round(width*dpr); canvas.height = Math.round(height*dpr);
    render();
  }
  function rotate(v, sy, cy, sp, cp) {
    const x=v[0]*cy + v[2]*sy, z=-v[0]*sy + v[2]*cy;
    return [x, v[1]*cp-z*sp, v[1]*sp+z*cp];
  }
  function render() {
    if (!ctx) return;
    ctx.setTransform(dpr,0,0,dpr,0,0); ctx.clearRect(0,0,width,height);
    const sy=Math.sin(yaw+pointerX),cy=Math.cos(yaw+pointerX),sp=Math.sin(pitch+pointerY),cp=Math.cos(pitch+pointerY);
    const scale=Math.min(width/4.65,(height-100)/4.5);
    const target=geometry[shape];
    const points=current.map((v,i) => {
      for (let k=0;k<3;k++) { v.p[k]+=(target[i].p[k]-v.p[k])*.09; v.n[k]+=(target[i].n[k]-v.n[k])*.09; }
      const p=rotate(v.p,sy,cy,sp,cp), n=rotate(v.n,sy,cy,sp,cp), perspective=6.2/(6.2-p[2]);
      return {x:width/2+p[0]*scale*perspective,y:height*.455-p[1]*scale*perspective,z:p[2],n};
    });
    const faces=[];
    for(let i=0;i<U;i++) for(let j=0;j<V;j++) {
      const a=points[i*V+j],b=points[((i+1)%U)*V+j],c=points[((i+1)%U)*V+(j+1)%V],d=points[i*V+(j+1)%V];
      faces.push({p:[a,b,c,d],z:(a.z+b.z+c.z+d.z)/4});
    }
    faces.sort((a,b)=>a.z-b.z);
    for(const f of faces) {
      const n=normalize(f.p.reduce((r,p)=>r.map((x,k)=>x+p.n[k]),[0,0,0]));
      const diffuse=Math.max(0, n[0]*-.45+n[1]*.62+n[2]*.64);
      const highlight=Math.pow(Math.max(0,n[0]*-.28+n[1]*.37+n[2]*.88),28)*.42;
      const rim=Math.pow(1-Math.abs(n[2]),3)*.16;
      const lighting=.13+diffuse*.78+rim;
      const rgb=color.map(c=>clamp(Math.round(c*lighting+255*highlight),0,255));
      ctx.fillStyle=`rgb(${rgb.join(',')})`;ctx.strokeStyle=ctx.fillStyle;ctx.lineWidth=.65;
      ctx.beginPath();f.p.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();ctx.fill();ctx.stroke();
    }
  }
  function animate(now) {
    requestAnimationFrame(animate);
    if(document.hidden || !visible || now-lastFrame<1000/36) return;
    const dt=Math.min(now-lastFrame,60);lastFrame=now;
    if(!paused && !dragging) yaw+=dt*.00019;
    if(!paused || dragging || current.some((v,i)=>Math.abs(v.p[0]-geometry[shape][i].p[0])>.002)) render();
  }
  requestAnimationFrame(animate);
  new ResizeObserver(resize).observe(canvas);
  new IntersectionObserver(([e])=>visible=e.isIntersecting).observe(canvas);
  function selectShape(kind) {
    shape=kind;
    $$('.shape').forEach(b=>{ const active=b.dataset.shape===kind;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active)); });
    $('#object-name').textContent={orbit:'The orbit',knot:'The knot',bloom:'The bloom'}[kind];
    if (!motion) current=geometry[kind].map(v=>({p:[...v.p],n:[...v.n]}));
    render(); tone({orbit:360,knot:460,bloom:560}[kind]);
  }
  $$('.shape').forEach(b=>b.addEventListener('click',()=>selectShape(b.dataset.shape)));
  function selectColor(button) {
    const hex=button.dataset.color;
    color=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));
    $$('.swatch').forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-pressed',String(b===button));});
    render();tone(700,.05);
  }
  $$('.swatch').forEach(b=>b.addEventListener('click',()=>selectColor(b)));
  function updatePause() {
    $('#pause').textContent=paused?'▶':'Ⅱ';
    $('#pause').setAttribute('aria-label',paused?'Play animation':'Pause animation');
    $('#pause').setAttribute('aria-pressed',String(paused));
  }
  $('#pause').addEventListener('click',()=>{paused=!paused;updatePause();tone(300);});
  canvas.addEventListener('pointerdown',e=>{
    dragging=true;lastX=e.clientX;lastY=e.clientY;canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove',e=>{
    if(dragging){yaw+=(e.clientX-lastX)*.008;pitch=clamp(pitch+(e.clientY-lastY)*.008,-1.3,1.3);lastX=e.clientX;lastY=e.clientY;render();}
  });
  const stopSculpture=()=>dragging=false;
  canvas.addEventListener('pointerup',stopSculpture);canvas.addEventListener('pointercancel',stopSculpture);canvas.addEventListener('lostpointercapture',stopSculpture);
  canvas.addEventListener('keydown',e=>{
    if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown',' '].includes(e.key)){
      e.preventDefault();
      if(e.key===' ') $('#pause').click();
      else if(e.key==='ArrowLeft')yaw-=.2;else if(e.key==='ArrowRight')yaw+=.2;
      else pitch=clamp(pitch+(e.key==='ArrowUp'?-.2:.2),-1.3,1.3);
      render();
    }
  });
  $('#surprise').addEventListener('click',()=>{
    const shapes=['orbit','knot','bloom'].filter(k=>k!==shape);
    selectShape(shapes[Math.floor(Math.random()*shapes.length)]);
    const colors=$$('.swatch').filter(b=>!b.classList.contains('active'));
    selectColor(colors[Math.floor(Math.random()*colors.length)]);
    yaw+=.9;render();toast('A new perspective. Keep exploring.');
  });

  // Native horizontal scrolling remains usable with touch, wheel, arrows, or mouse dragging.
  const carousel=$('#carousel');
  let slide=0, carouselDrag=null, suppressClick=false;
  const step=()=>$('.experiment-card').getBoundingClientRect().width+parseFloat(getComputedStyle(carousel).gap);
  function updateSlide() {
    slide=clamp(Math.round(carousel.scrollLeft/step()),0,3);
    $('#slide-count').textContent=`${slide+1} / 4`;
    $$('.slide-dots button').forEach((b,i)=>{b.classList.toggle('active',i===slide);b.setAttribute('aria-pressed',String(i===slide));});
  }
  const goTo=index=>{slide=(index+4)%4;carousel.scrollTo({left:slide*step(),behavior:motion?'smooth':'instant'});tone(320+slide*70);};
  $('#prev').addEventListener('click',()=>goTo(slide-1));$('#next').addEventListener('click',()=>goTo(slide+1));
  $$('.slide-dots button').forEach(b=>b.addEventListener('click',()=>goTo(+b.dataset.slide)));
  carousel.addEventListener('scroll',updateSlide,{passive:true});
  carousel.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();goTo(slide+(e.key==='ArrowRight'?1:-1));}});
  carousel.addEventListener('pointerdown',e=>{
    if(e.pointerType==='touch'||e.button!==0)return;
    carouselDrag={x:e.clientX,scroll:carousel.scrollLeft,id:e.pointerId,moved:false};
  });
  window.addEventListener('pointermove',e=>{
    if(!carouselDrag)return;
    const delta=e.clientX-carouselDrag.x;
    if(Math.abs(delta)>6){
      if(!carouselDrag.moved){carouselDrag.moved=true;carousel.classList.add('is-dragging');carousel.setPointerCapture(carouselDrag.id);}
      carousel.scrollLeft=carouselDrag.scroll-delta;
    }
  });
  function endCarousel(){
    if(!carouselDrag)return;
    const moved=carouselDrag.moved;
    if(carousel.hasPointerCapture(carouselDrag.id))carousel.releasePointerCapture(carouselDrag.id);
    carouselDrag=null;carousel.classList.remove('is-dragging');
    if(moved){suppressClick=true;goTo(Math.round(carousel.scrollLeft/step()));setTimeout(()=>suppressClick=false,100);}
  }
  window.addEventListener('pointerup',endCarousel);window.addEventListener('pointercancel',endCarousel);
  // The last item gets enough trailing space to align at the leading edge, too.
  function carouselSpace(){const end=Math.max(0,carousel.clientWidth-parseFloat(getComputedStyle(carousel).paddingLeft)*2-$('.experiment-card').getBoundingClientRect().width);carousel.style.paddingRight=`calc(var(--page) + ${end}px)`;}
  new ResizeObserver(()=>{carouselSpace();updateSlide();}).observe(carousel);

  const makeDots=root=>{const frag=document.createDocumentFragment();for(let i=0;i<49;i++){const dot=document.createElement('i');frag.append(dot);}root.append(frag);};
  makeDots($('.magnet-art .magnet-grid'));
  $$('.elastic-sculpture i,.ripple-sculpture i').forEach((el,i)=>el.style.setProperty('--n',i));
  $('.magnet-art').addEventListener('pointermove',e=>{
    if(!motion||carouselDrag?.moved)return;
    $$('.magnet-art .magnet-grid i').forEach(dot=>{
      const b=dot.getBoundingClientRect(),dx=e.clientX-b.left-b.width/2,dy=e.clientY-b.top-b.height/2;
      const force=Math.max(0,1-Math.hypot(dx,dy)/140)*.18;
      dot.style.transform=`translate(${dx*force}px,${dy*force}px)`;
    });
  });
  $('.magnet-art').addEventListener('pointerleave',()=>$$('.magnet-art .magnet-grid i').forEach(d=>d.style.transform=''));

  // Four fully interactive experiment dialogs, with native focus trapping and Escape handling.
  const dialog=$('#experiment-dialog');
  let activeExperiment='',cleanupExperiment=()=>{};
  const content={
    magnet:{title:'Magnetic field',description:'Move your pointer or finger through the field. The dots follow your pull. You can also focus the field and use the arrow keys.'},
    elastic:{title:'Elastic energy',description:'Grab the ball, pull it away from the center, and let go. Or focus it and use the arrow keys to stretch, then press Enter to release.'},
    ripple:{title:'Ripple effect',description:'Click or tap anywhere to set things in motion. Press Enter or Space to send a ripple from the center.'},
    type:{title:'Type in motion',description:'Your words, your personality. Type something, adjust its weight, then give it a little movement.'}
  };
  function openExperiment(kind){
    if(suppressClick)return;
    cleanupExperiment();activeExperiment=kind;
    $('#dialog-title').textContent=content[kind].title;
    $('#dialog-description').textContent=content[kind].description;
    $('#dialog-content').replaceChildren();
    buildExperiment(kind);
    if(!dialog.open)dialog.showModal();
    tone(520,.1);
  }
  $$('[data-open]').forEach(b=>b.addEventListener('click',()=>openExperiment(b.dataset.open)));
  $('#close-dialog').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
  dialog.addEventListener('close',()=>{cleanupExperiment();$('#dialog-content').replaceChildren();});
  $('#dialog-reset').addEventListener('click',()=>openExperiment(activeExperiment));
  function buildExperiment(kind){
    const zone=document.createElement('div');zone.className=`experiment-zone zone-${kind}`;
    $('#dialog-content').append(zone);
    cleanupExperiment=()=>{};
    if(kind==='magnet'){
      zone.tabIndex=0;zone.setAttribute('role','application');zone.setAttribute('aria-label','Magnetic dot field. Move pointer or use arrow keys.');
      const grid=document.createElement('div');grid.className='magnet-grid';
      for(let i=0;i<63;i++)grid.append(document.createElement('i'));
      zone.append(grid);
      const text=document.createElement('p');text.textContent='A small force. A different point of view.';zone.append(text);
      let target=null;let raf=0;
      const dots=$$('i',grid),positions=[];
      const reset=()=>dots.forEach(d=>d.style.transform='');
      const move=(x,y)=>{
        dots.forEach((dot,i)=>{const r=dot.getBoundingClientRect();const base=positions[i]||(positions[i]={x:r.left+r.width/2,y:r.top+r.height/2});const dx=x-base.x,dy=y-base.y;const distance=Math.hypot(dx,dy);const force=Math.max(0,1-distance/160)*.42;dot.style.transform=`translate(${dx*force}px,${dy*force}px) scale(${1+force*.7})`;});
      };
      zone.addEventListener('pointermove',e=>{positions.length=0;reset();target={x:e.clientX,y:e.clientY};cancelAnimationFrame(raf);raf=requestAnimationFrame(()=>move(target.x,target.y));});
      zone.addEventListener('pointerleave',()=>{cancelAnimationFrame(raf);reset();positions.length=0;target=null;});
      zone.addEventListener('keydown',e=>{if(!e.key.startsWith('Arrow'))return;e.preventDefault();const r=zone.getBoundingClientRect();target||={x:r.left+r.width/2,y:r.top+r.height/2};target.x+=e.key==='ArrowRight'?24:e.key==='ArrowLeft'?-24:0;target.y+=e.key==='ArrowDown'?24:e.key==='ArrowUp'?-24:0;reset();positions.length=0;move(target.x,target.y);});
      cleanupExperiment=()=>cancelAnimationFrame(raf);
    }
    if(kind==='elastic'){
      zone.innerHTML='<div class="elastic-tether" aria-hidden="true"></div><div class="elastic-ball" role="button" tabindex="0" aria-label="Stretchable ball. Arrow keys to stretch; Enter to release.">Pull me</div>';
      const ball=$('.elastic-ball',zone),tether=$('.elastic-tether',zone);
      let dx=0,dy=0,start=null,releaseAnimation;
      function draw(){ball.style.transform=`translate(${dx}px,${dy}px) scale(${1+Math.hypot(dx,dy)/1200},${1-Math.hypot(dx,dy)/1800})`;tether.style.height=`${Math.hypot(dx,dy)}px`;tether.style.transform=`rotate(${Math.atan2(-dx,dy)}rad)`;}
      function release(){start=null;ball.textContent='Again?';tone(240,.18);if(!motion){dx=dy=0;draw();return;}let vx=0,vy=0;cancelAnimationFrame(releaseAnimation);function spring(){vx=(vx-dx*.11)*.76;vy=(vy-dy*.11)*.76;dx+=vx;dy+=vy;draw();if(Math.abs(dx)+Math.abs(dy)+Math.abs(vx)+Math.abs(vy)>.3)releaseAnimation=requestAnimationFrame(spring);else{dx=dy=0;draw();}}spring();}
      ball.addEventListener('pointerdown',e=>{cancelAnimationFrame(releaseAnimation);start={x:e.clientX-dx,y:e.clientY-dy};ball.setPointerCapture(e.pointerId);ball.textContent='Let go';});
      ball.addEventListener('pointermove',e=>{if(!start)return;dx=clamp(e.clientX-start.x,-zone.clientWidth/2+65,zone.clientWidth/2-65);dy=clamp(e.clientY-start.y,-95,95);draw();});
      ball.addEventListener('pointerup',release);ball.addEventListener('pointercancel',release);
      ball.addEventListener('keydown',e=>{if(e.key.startsWith('Arrow')){e.preventDefault();cancelAnimationFrame(releaseAnimation);dx=clamp(dx+(e.key==='ArrowRight'?25:e.key==='ArrowLeft'?-25:0),-100,100);dy=clamp(dy+(e.key==='ArrowDown'?25:e.key==='ArrowUp'?-25:0),-100,100);draw();}else if(e.key==='Enter'||e.key===' '){e.preventDefault();release();}});
      cleanupExperiment=()=>cancelAnimationFrame(releaseAnimation);
    }
    if(kind==='ripple'){
      zone.tabIndex=0;zone.setAttribute('role','button');zone.setAttribute('aria-label','Create a ripple');
      zone.innerHTML='<span class="ripple-help">A little ripple starts with you.</span>';
      let count=0;const timers=[];
      const ripple=(x,y)=>{
        const el=document.createElement('i');el.className='user-ripple';el.style.left=`${x}px`;el.style.top=`${y}px`;el.style.transform='translate(-50%,-50%)';zone.append(el);
        count++;$('.ripple-help',zone).textContent=`${count} ${count===1?'ripple':'ripples'}. Keep it going.`;
        timers.push(setTimeout(()=>el.remove(),motion?1600:500));tone(240+Math.random()*240,.12);
      };
      zone.addEventListener('pointerdown',e=>{const r=zone.getBoundingClientRect();ripple(e.clientX-r.left,e.clientY-r.top);});
      zone.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();ripple(zone.clientWidth/2,zone.clientHeight/2);}});
      cleanupExperiment=()=>timers.forEach(clearTimeout);
    }
    if(kind==='type'){
      zone.innerHTML='<div class="type-preview" aria-live="polite">Hello, you.</div><label for="type-input" class="sr-only">Your words</label><input id="type-input" class="type-input" maxlength="24" value="Hello, you." placeholder="Say something curious…"><div class="type-controls"><label for="type-weight">Weight</label><input id="type-weight" type="range" min="400" max="900" step="50" value="800"><output for="type-weight">800</output><button type="button" id="animate-type">Give it a wiggle ↗</button></div>';
      const preview=$('.type-preview',zone),input=$('.type-input',zone),weight=$('#type-weight',zone);
      input.addEventListener('input',()=>preview.textContent=input.value||'Your move.');
      weight.addEventListener('input',()=>{preview.style.fontWeight=weight.value;$('output',zone).textContent=weight.value;});
      $('#animate-type',zone).addEventListener('click',()=>{tone(520,.12);if(motion)preview.animate([{transform:'rotate(0) scale(1)'},{transform:'rotate(-8deg) scale(1.08)'},{transform:'rotate(7deg) scale(1.04)'},{transform:'rotate(0) scale(1)'}],{duration:650,easing:'ease-out'});else preview.style.fontStyle=preview.style.fontStyle==='italic'?'normal':'italic';});
    }
  }

  let presses=0,holdTimer=null,holdDone=false;
  $('#press-button').addEventListener('click',()=>{presses++;$('#lab-status').textContent=`${presses} satisfying ${presses===1?'press':'presses'}. That’s the feeling.`;tone(190,.09);});
  const hold=$('#fill-button');
  function startHold(e){
    if(e.type==='keydown'&&![' ','Enter'].includes(e.key))return;
    if(e.type==='keydown'){e.preventDefault();if(e.repeat)return;}
    if(holdDone||holdTimer)return;
    hold.classList.add('holding');$('#hold-description').textContent='Keep holding…';
    holdTimer=setTimeout(()=>{holdTimer=null;holdDone=true;hold.classList.remove('holding');hold.classList.add('complete');$('span:first-child',hold).textContent='Worth the wait ✓';$('#hold-description').textContent='You’ve got a good thing going';$('#lab-status').textContent='A little patience. A satisfying payoff.';tone(740,.18);burst(hold,25);},1100);
  }
  function stopHold(){if(holdTimer){clearTimeout(holdTimer);holdTimer=null;hold.classList.remove('holding');$('#hold-description').textContent='Press and hold to fill';}}
  hold.addEventListener('pointerdown',e=>{hold.setPointerCapture(e.pointerId);startHold(e);});hold.addEventListener('keydown',startHold);
  ['pointerup','pointercancel','lostpointercapture','keyup','blur'].forEach(type=>hold.addEventListener(type,stopHold));
  $('#like-button').addEventListener('click',()=>{const liked=$('#like-button').getAttribute('aria-pressed')!=='true';$('#like-button').setAttribute('aria-pressed',String(liked));$('#like-label').textContent=liked?'Right back at you':'A little love';$('.heart').textContent=liked?'♥':'♡';$('#lab-status').textContent=liked?'A little love goes a long way.':'The feeling is still mutual.';tone(liked?660:330,.1);});
  $('#confetti-button').addEventListener('click',e=>{burst(e.currentTarget,95);tone(880,.13);$('#lab-status').textContent='No occasion required.';toast('The little things are worth celebrating.');});
  $('#reset-buttons').addEventListener('click',()=>{presses=0;stopHold();holdDone=false;hold.classList.remove('complete');$('span:first-child',hold).textContent='Hold that thought';$('#hold-description').textContent='Press and hold to fill';$('#like-button').setAttribute('aria-pressed','false');$('#like-label').textContent='A little love';$('.heart').textContent='♡';$('#lab-status').textContent='A fresh start. Press something.';tone(300);});

  const confettiCanvas=$('#confetti'),confettiCtx=confettiCanvas.getContext('2d');
  let particles=[],confettiFrame=0;
  function burst(button,number){
    if(!motion)return;
    confettiCanvas.style.display='block';
    confettiCanvas.width=innerWidth;confettiCanvas.height=innerHeight;
    const r=button.getBoundingClientRect();
    for(let i=0;i<number;i++)particles.push({x:r.left+r.width/2,y:r.top+r.height/2,vx:(Math.random()-.5)*12,vy:-5-Math.random()*9,rotation:Math.random()*6,size:4+Math.random()*5,life:100,color:['#bcf8ae','#c3c9ff','#ffb9d1','#efbd75'][i%4]});
    if(!confettiFrame)drawConfetti();
  }
  function drawConfetti(){
    confettiCtx.clearRect(0,0,confettiCanvas.width,confettiCanvas.height);
    particles=particles.filter(p=>p.life>0&&p.y<innerHeight+30);
    particles.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.vy+=.24;p.vx*=.985;p.rotation+=.09;p.life--;confettiCtx.save();confettiCtx.translate(p.x,p.y);confettiCtx.rotate(p.rotation);confettiCtx.globalAlpha=Math.min(p.life/25,1);confettiCtx.fillStyle=p.color;confettiCtx.fillRect(-p.size/2,-p.size/2,p.size,p.size*.5);confettiCtx.restore();});
    confettiFrame=particles.length?requestAnimationFrame(drawConfetti):0;
    if(!particles.length)confettiCanvas.style.display='none';
  }
  function setMotion(enabled){
    motion=enabled;paused=!enabled;updatePause();
    document.body.classList.toggle('motion-off',!enabled);
    document.documentElement.style.scrollBehavior=enabled?'smooth':'auto';
    $('#motion-switch').setAttribute('aria-checked',String(enabled));$('#motion-label').textContent=enabled?'Motion is on':'Motion is off';
    if(!enabled){particles=[];cancelAnimationFrame(confettiFrame);confettiFrame=0;confettiCtx.clearRect(0,0,confettiCanvas.width,confettiCanvas.height);confettiCanvas.style.display='none';$$('.magnetic').forEach(el=>el.style.transform='');}
    render();
  }
  $('#motion-switch').addEventListener('click',()=>setMotion(!motion));preference.addEventListener('change',e=>setMotion(!e.matches));setMotion(motion);

  if('IntersectionObserver' in window){
    const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.remove('waiting');observer.unobserve(e.target);}}),{threshold:.12});
    $$('.section-heading,.tactile-copy,.button-lab,.about-layout>div,.footer-top>div').forEach((el,i)=>{el.classList.add('reveal','waiting');el.style.transitionDelay=`${i%2*80}ms`;observer.observe(el);});
  }
  if(matchMedia('(hover: hover)').matches){
    $$('.magnetic').forEach(button=>{
      button.addEventListener('pointermove',e=>{if(!motion)return;const r=button.getBoundingClientRect();button.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.11}px,${(e.clientY-r.top-r.height/2)*.2}px)`;});
      button.addEventListener('pointerleave',()=>button.style.transform='');
    });
  }
  document.addEventListener('click',e=>{if(e.target.closest('a[href^="#"]'))tone(400,.045);});
})();
