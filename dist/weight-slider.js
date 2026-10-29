(() => {
  'use strict';
  const input=document.querySelector('#quote-weight'),api=window.ParcelVex;
  const root=document.createElement('div');root.className='weight-control';
  input.before(root);
  root.innerHTML=`<div class="weight-ruler"><div class="weight-track" aria-hidden="true"><div class="weight-fill"></div></div><div class="weight-ticks" aria-hidden="true">${Array.from({length:40},(_,i)=>`<i style="left:${i/39*100}%" class="${i%10===0||i===39?'major':''}"></i>`).join('')}</div><div class="weight-handle" aria-hidden="true"><div class="weight-bubble"><b>2</b><span>kg</span></div><div class="weight-knob"><svg viewBox="0 0 24 24"><path d="M9 8v8M15 8v8"/></svg></div></div></div><div class="weight-tools"><button type="button" class="weight-adjust" data-delta="-0.5" aria-label="Decrease weight by half a kilogram">${api.icon('plus')}</button><span class="weight-instruction">Drag to weigh · 0.5 kg steps</span><button type="button" class="weight-adjust" data-delta="0.5" aria-label="Increase weight by half a kilogram">${api.icon('plus')}</button></div><div class="weight-presets" role="group" aria-label="Quick parcel weights"><span>Quick pick</span>${[1,5,10,20].map(w=>`<button type="button" data-weight="${w}" aria-pressed="false">${w} kg</button>`).join('')}</div><span class="sr-only weight-announcement" role="status"></span>`;
  const ruler=root.querySelector('.weight-ruler');ruler.append(input);ruler.after(root.nextElementSibling);
  // Decorative overlay never replaces the native range's keyboard/touch semantics.
  const handle=root.querySelector('.weight-handle'),fill=root.querySelector('.weight-fill'),bubble=root.querySelector('.weight-bubble b'),output=document.querySelector('#weight-value'),price=document.querySelector('#quote-price');
  root.querySelector('[data-delta="-0.5"]').innerHTML='<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"/></svg>';
  let travel=0,previous=+input.value,lastTick=Math.floor(previous),dragging=false,frame=0,animations=[];
  const moving=()=>!document.body.classList.contains('motion-off')&&!matchMedia('(prefers-reduced-motion: reduce)').matches;
  function animate(el,frames,options){if(!moving())return;const animation=el.animate(frames,{duration:180,easing:'ease-out',...options});animations.push(animation);animation.finished.catch(()=>{}).finally(()=>animations=animations.filter(a=>a!==animation));}
  function draw(){frame=0;const value=+input.value,p=(value-.5)/19.5;
    handle.style.transform=`translate3d(${p*travel}px,-50%,0)`;fill.style.transform=`scaleX(${p})`;bubble.textContent=String(value);
    input.setAttribute('aria-valuetext',`${value} kilograms`);
    root.querySelectorAll('[data-weight]').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.weight===value)));
    root.querySelector('[data-delta="-0.5"]').disabled=value<=.5;root.querySelector('[data-delta="0.5"]').disabled=value>=20;
    const changed=value!==previous;
    if(changed){
      const direction=value>previous?1:-1;
      if(Math.floor(value)!==lastTick){api.tone(260+p*420,.025);lastTick=Math.floor(value);animate(root.querySelector('.weight-knob svg'),[{transform:'scale(1)'},{transform:'scale(.72)',offset:.5},{transform:'scale(1)'}],{duration:100});}
      if(!dragging){animate(output,[{transform:`translateY(${direction*5}px)`,opacity:.6},{transform:'translateY(0)',opacity:1}],{duration:150});}
      previous=value;
    }
  }
  const schedule=()=>{if(!frame)frame=requestAnimationFrame(draw);};
  new ResizeObserver(entries=>{travel=Math.max(0,entries[0].contentRect.width-32);schedule();}).observe(ruler);
  const announce=()=>root.querySelector('.weight-announcement').textContent=`${input.value} kilograms selected. ${price.textContent} sample estimate.`;
  function settle(){if(!dragging)return;dragging=false;root.classList.remove('dragging');announce();
    animate(root.querySelector('.weight-knob'),[{transform:'scale(1.32)'},{transform:'scale(.92)',offset:.65},{transform:'scale(1)'}],{duration:300});
    animate(price,[{transform:'scale(1.035)',color:'#f1f2eb'},{transform:'scale(1)',color:'#bcf8ae'}],{duration:250});
    const preview=document.querySelector('#sizer-canvas');animate(preview,[{transform:'translateY(0)'},{transform:`translateY(${Math.min(7,+input.value*.35)}px)`,offset:.35},{transform:'translateY(0)'}],{duration:340});
  }
  input.addEventListener('pointerdown',()=>{dragging=true;root.classList.add('dragging');});
  window.addEventListener('pointerup',settle);window.addEventListener('pointercancel',settle);input.addEventListener('blur',settle);
  input.addEventListener('input',schedule);input.addEventListener('change',()=>{schedule();announce();});
  input.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End','PageUp','PageDown'].includes(e.key)){root.classList.add('key-active');}});
  input.addEventListener('keyup',()=>{root.classList.remove('key-active');announce();});input.addEventListener('blur',()=>root.classList.remove('key-active'));
  function setWeight(value){input.value=String(Math.max(.5,Math.min(20,value)));input.dispatchEvent(new Event('input',{bubbles:true}));input.dispatchEvent(new Event('change',{bubbles:true}));
    animate(root.querySelector('.weight-knob'),[{transform:'scale(1.35)'},{transform:'scale(1)'}],{duration:260});
    animate(price,[{opacity:.45,transform:'translateY(4px)'},{opacity:1,transform:'translateY(0)'}]);
  }
  root.querySelectorAll('[data-delta]').forEach(b=>b.addEventListener('click',()=>setWeight(+input.value+ +b.dataset.delta)));
  root.querySelectorAll('[data-weight]').forEach(b=>b.addEventListener('click',()=>setWeight(+b.dataset.weight)));
  document.addEventListener('parcel-quote',schedule);
  new MutationObserver(()=>{if(!moving()){animations.forEach(a=>a.cancel());root.classList.remove('tick');}}).observe(document.body,{attributes:true,attributeFilter:['class']});
  draw();
})();
