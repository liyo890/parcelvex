(() => {
  'use strict';
  const reduced=()=>document.body.classList.contains('motion-off')||matchMedia('(prefers-reduced-motion: reduce)').matches;
  const counters=[];
  function attach(host,initial,unit=false){
    const windowEl=document.createElement('span');windowEl.className='weight-digit-window';windowEl.setAttribute('aria-hidden','true');
    const current=document.createElement('span');current.className='weight-digit-current';windowEl.append(current);host.replaceChildren(windowEl);
    if(unit){const suffix=document.createElement('span');suffix.className='weight-unit';suffix.textContent='kg';suffix.setAttribute('aria-hidden','true');host.append(suffix);}
    let value=+initial,running=false,animations=[],outgoing=null,generation=0;
    function snap(){generation++;animations.forEach(a=>a.cancel());animations=[];outgoing?.remove();outgoing=null;running=false;current.style.transform='';current.style.opacity='';}
    function set(next){
      next=+next;host.setAttribute('aria-label',unit?`${next} kilograms`:String(next));
      if(next===value){current.textContent=String(next);return;}
      const before=value;value=next;current.textContent=String(next);
      if(reduced()){snap();return;}
      // A running roll adopts the latest target without starting another animation.
      // Fast drags therefore stay readable and never queue stale numbers.
      if(running)return;
      running=true;const token=++generation,direction=next>before?1:-1;
      outgoing=document.createElement('span');outgoing.className='weight-digit-old';outgoing.textContent=String(before);windowEl.append(outgoing);
      const options={duration:190,easing:'cubic-bezier(.2,.75,.3,1)'};
      animations=[outgoing.animate([{transform:'translateY(0)',opacity:1},{transform:`translateY(${-direction*110}%)`,opacity:0}],options),current.animate([{transform:`translateY(${direction*110}%)`,opacity:0},{transform:'translateY(0)',opacity:1}],options)];
      Promise.all(animations.map(a=>a.finished)).catch(()=>{}).then(()=>{if(token===generation){outgoing?.remove();outgoing=null;animations=[];running=false;}});
    }
    current.textContent=String(value);host.setAttribute('aria-label',unit?`${value} kilograms`:String(value));
    const counter={set,snap};counters.push(counter);return counter;
  }
  const main=attach(document.querySelector('#weight-value'),+document.querySelector('#quote-weight').value,true);
  window.ParcelWeightDigits={set:main.set,attach};
  new MutationObserver(()=>{if(reduced())counters.forEach(c=>c.snap());}).observe(document.body,{attributes:true,attributeFilter:['class']});
})();
