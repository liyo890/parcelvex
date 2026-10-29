(() => {
  'use strict';
  const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)],api=window.ParcelVex;
  const form=$('#booking-form'),steps=$$('[data-planner-step]'),next=$('.booking-submit'),back=$('#planner-back');
  let step=0;
  ['sender','recipient'].forEach(side=>$('#'+side+'-city').replaceChildren(...[...$('#quote-from').options].map(o=>new Option(o.text,o.value))));
  const get=id=>$('#'+id).value.trim(),safe=api.esc;
  function sync(){
    $('#quote-from').value=get('sender-city');$('#quote-to').value=get('recipient-city');
    $('#quote-weight').value=get('plan-weight');$('#quote-service').value=get('plan-service');
    api.setSize(get('plan-size'));api.setCare($('#booking-care').checked);api.updateQuote();
    const q=api.quote();$('#planner-price').textContent=`Sample estimate: RM ${q.total.toFixed(2)}`;
    $('#booking-summary').innerHTML=`${safe(q.from)} → ${safe(q.to)} <strong>RM ${q.total.toFixed(2)}</strong><small>Illustrative estimate · no payment or collection</small>`;
    return q;
  }
  function review(){
    const q=sync();
    const address=(side,title,n)=>`<div class="review-block"><div><h4>${title}</h4><button type="button" data-edit-step="${n}" class="text-link">Edit ${title.toLowerCase()}</button></div><p>${safe(get(side+'-name'))} · ${safe(get(side+'-phone'))}<br>${safe(get(side+'-address'))}<br>${safe(get(side+'-postcode'))} ${safe(get(side+'-city'))}</p></div>`;
    $('#plan-review').innerHTML=address('sender','Sender',0)+address('recipient','Recipient',1)+`<div class="review-block"><div><h4>Parcel & service</h4><button type="button" data-edit-step="2" class="text-link">Edit parcel</button></div><p>${api.sizes[get('plan-size')].name} · ${q.weight} kg · ${safe($('#plan-service').selectedOptions[0].text)}<br>${safe(get('parcel-note')||'A little something good')}<br>Preferred collection: ${safe(get('pickup-date'))}</p><strong class="review-price">RM ${q.total.toFixed(2)}</strong><small>Sample route ${q.base.toFixed(2)} + size ${q.size.toFixed(2)} + weight ${q.weightFee.toFixed(2)} + extras ${(q.option+q.care).toFixed(2)}</small></div>`;
  }
  function show(n,focus=true){
    step=n;steps.forEach((el,i)=>el.hidden=i!==n);
    $$('.planner-progress li').forEach((el,i)=>{el.classList.toggle('complete',i<n);if(i===n)el.setAttribute('aria-current','step');else el.removeAttribute('aria-current');});
    $('#planner-counter').textContent=`Step ${n+1} of 4`;
    back.hidden=n===0;next.innerHTML=n===3?`Create my demo label ${api.icon('arrow-up-right')}`:`Continue ${api.icon('arrow-right')}`;
    $('#fill-sample').hidden=n>1;$('#booking-summary').hidden=n<2;
    if(n===2)sync();if(n===3)review();
    if(focus){const title=steps[n].querySelector('h3');title.tabIndex=-1;title.focus({preventScroll:true});title.scrollIntoView({block:'nearest'});}
  }
  window.ParcelPlanner={labelSVG(){return ['sender','recipient'].map((side,i)=>`<text x="40" y="${600+i*78}" font-size="16">${side==='sender'?'FROM':'TO'}: ${safe(get(side+'-name'))} · ${safe(get(side+'-phone'))}</text><text x="40" y="${624+i*78}" font-size="14" textLength="500" lengthAdjust="spacingAndGlyphs">${safe(get(side+'-address'))}, ${safe(get(side+'-postcode'))} ${safe(get(side+'-city'))}</text>`).join('');},start(){
    $('#sender-city').value=$('#quote-from').value;$('#recipient-city').value=$('#quote-to').value;
    $('#plan-size').value=$('input[name="parcel-size"]:checked').value;$('#plan-weight').value=$('#quote-weight').value;$('#plan-service').value=$('#quote-service').value;
    $('#plan-confirm').checked=false;show(0,false);$('#sender-name').focus({preventScroll:true});
  }};
  form.addEventListener('submit',e=>{
    const fields=[...steps[step].querySelectorAll('input,select')];
    const invalid=fields.find(el=>!el.checkValidity());
    if(invalid){e.preventDefault();e.stopImmediatePropagation();invalid.reportValidity();return;}
    if(step<3){e.preventDefault();e.stopImmediatePropagation();if(step===2)sync();show(step+1);}
    else sync();
  },true);
  back.addEventListener('click',()=>show(Math.max(0,step-1)));
  $('#plan-review').addEventListener('click',e=>{const edit=e.target.closest('[data-edit-step]');if(edit)show(+edit.dataset.editStep);});
  $('#fill-sample').addEventListener('click',()=>{
    const side=step===0?'sender':'recipient';const data=step===0?['Alex Tan','0123456789','12 Example Lane','50000']:['Jamie Lee','0129876543','28 Sample Street','10000'];
    ['name','phone','address','postcode'].forEach((key,i)=>$('#'+side+'-'+key).value=data[i]);
    $('#'+side+'-name').focus();$('#planner-counter').textContent=`Step ${step+1} of 4 · Sample details added`;
  });
  ['plan-size','plan-weight','plan-service','booking-care'].forEach(id=>$('#'+id).addEventListener('change',()=>{if($('#plan-weight').checkValidity())sync();}));
  $('#booking-form').addEventListener('submit',()=>{
    if(step!==3)return;
    const note=document.createElement('p');note.className='label-addresses';note.textContent=`${get('sender-name')} → ${get('recipient-name')} · ${get('recipient-postcode')} ${get('recipient-city')}`;
    $('#label-preview').append(note);
  });
  const scans=['29 Oct · 8:15am · Shipment created','29 Oct · 9:20am · Kuala Lumpur hub','29 Oct · 10:42am · In transit','30 Oct · 8:05am · George Town route','30 Oct · 11:26am · Delivered'];
  document.addEventListener('parcel-journey',e=>{const n=e.detail.step;$('#last-scan').textContent=scans[n];$('#arrival-window').textContent=n===4?'Delivered · 30 Oct, 11:26am':'30 Oct · 9am–6pm (sample)';});
  $('#copy-tracking').addEventListener('click',async()=>{try{await navigator.clipboard.writeText('PV20261027');$('#copy-tracking>span:last-child').textContent='Copied';$('#toast').textContent='Sample tracking number copied.';$('#toast').classList.add('show');setTimeout(()=>{$('#toast').classList.remove('show');$('#copy-tracking>span:last-child').textContent='Copy';},2000);}catch{$('#copy-tracking>span:last-child').textContent='PV20261027';}});
  $('#support-checklist').addEventListener('click',()=>{$('#support-result').hidden=false;$('#support-result').scrollIntoView({block:'nearest',behavior:'smooth'});});
})();
