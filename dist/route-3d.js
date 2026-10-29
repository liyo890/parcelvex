/* A small, real-depth route diorama sharing the parcel illustration geometry. */
class ParcelRouteView {
  constructor({Base,canvas,path,length}) {
    this.canvas=canvas;this.map=canvas.closest('.route-map');this.svg=document.querySelector('#route-svg');
    this.hint=document.querySelector('#route-view-hint');this.buttons=[...document.querySelectorAll('[data-route-view]')];
    this.cameraButtons=[...document.querySelectorAll('[data-route-camera]')];
    this.labels=[...this.map.querySelectorAll('.route-city')];this.mode='3d';this.position=.48;this.frame=0;
    this.motion=!matchMedia('(prefers-reduced-motion: reduce)').matches;this.zoom=1;this.drag=null;this.cameraTransition=null;
    this.samples=Array.from({length:81},(_,i)=>{const p=path.getPointAtLength(length*i/80);return[(p.x-340)/48,(p.y-155)/48];});
    const owner=this;
    class RouteScene extends Base {
      constructor(){super(canvas,'hero');this.routeOwner=owner;this.yaw=-.32;this.pitch=.78;this.kind='route';}
      face(points,color,normal,texture=null,double=false) {
        if(this.actor){const a=this.actor,c=Math.cos(a.yaw),s=Math.sin(a.yaw);
          points=points.map(([x,y,z])=>[a.x+(x*c-z*s)*a.scale,a.y+y*a.scale,a.z+(x*s+z*c)*a.scale]);
          if(normal){const[x,y,z]=normal;normal=[x*c-z*s,y,x*s+z*c];}
        }
        super.face(points,color,normal,texture,double);
      }
      wheel(x,y,z) {
        // The van is small in this scene; sixteen segments keep its silhouette smooth.
        const ring=[],back=[];for(let i=0;i<16;i++){const a=i/16*Math.PI*2;ring.push([x+Math.cos(a)*.32,y+Math.sin(a)*.32,z+.08]);back.push([x+Math.cos(a)*.32,y+Math.sin(a)*.32,z-.08]);}
        for(let i=0;i<16;i++)this.face([ring[i],ring[(i+1)%16],back[(i+1)%16],back[i]],'#222a22',null,null,true);
        this.face(ring,'#263326',[0,0,1]);this.face(back,'#263326',[0,0,-1]);
        this.face(ring.map(p=>[x+(p[0]-x)*.45,y+(p[1]-y)*.45,p[2]+.01]),'#9aaca0',[0,0,1]);
      }
      render() {
        if(!this.routeOwner||!this.renderer||this.renderer.lost||!this.visible||owner.mode!=='3d'||this.w<2)return;
        this.renderYaw=this.yaw;this.renderPitch=this.pitch;this.scale=Math.min(this.w/15.6,this.h/6.6)*owner.zoom;this.faces=[];this.actor=null;
        this.box(0,-.24,0,13.4,.42,6.5,'#34472a');
        // Fine grid lines sit on the slab, rather than floating over the scene.
        for(let x=-6;x<=6;x++)this.face([[x,-.025,-3.15],[x+.012,-.025,-3.15],[x+.012,-.025,3.15],[x,-.025,3.15]],'#3d5032',[0,1,0]);
        for(let z=-3;z<=3;z++)this.face([[-6.6,-.025,z],[6.6,-.025,z],[6.6,-.025,z+.012],[-6.6,-.025,z+.012]],'#3d5032',[0,1,0]);
        const samples=owner.samples,edges=samples.map((p,i)=>{const a=samples[Math.max(0,i-1)],b=samples[Math.min(80,i+1)],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz);return[-dz/l,dx/l];});
        const point=(i,side,y,width=.38)=>[samples[i][0]+edges[i][0]*side*width,y,samples[i][1]+edges[i][1]*side*width];
        for(let i=0;i<80;i++){
          this.face([point(i,-1,.075),point(i+1,-1,.075),point(i+1,1,.075),point(i,1,.075)],'#536b43',[0,1,0]);
          for(const side of[-1,1])this.face([point(i,side,-.02),point(i+1,side,-.02),point(i+1,side,.075),point(i,side,.075)],'#405333',null,null,true);
          const covered=Math.max(0,Math.min(1,owner.position*80-i));
          if(covered>0){const a=point(i,-1,.084,.045),b=point(i+1,-1,.084,.045),c=point(i+1,1,.084,.045),d=point(i,1,.084,.045);this.face([a,a.map((v,k)=>v+(b[k]-v)*covered),d.map((v,k)=>v+(c[k]-v)*covered),d],'#bcf8ae',[0,1,0]);}
          else if(i%3===0)this.face([point(i,-1,.083,.025),point(i+1,-1,.083,.025),point(i+1,1,.083,.025),point(i,1,.083,.025)],'#879b76',[0,1,0]);
        }
        const disk=(x,z,r,color,y=.092)=>{const points=Array.from({length:20},(_,i)=>[x+Math.cos(i/20*Math.PI*2)*r,y,z+Math.sin(i/20*Math.PI*2)*r]);this.face(points,color,[0,1,0],null,true);};
        for(const t of[0,.22,.48,.78,1]){const p=owner.at(t);disk(p.x,p.z,t===0||t===1?.19:.11,t<=owner.position?'#bcf8ae':'#879b76');}
        // Origin warehouse with loading bays and a mint pitched roof.
        const bx=-5,bz=-1.25;this.box(bx,.43,bz,1.75,.92,1.35,'#b1c69e');
        for(const dx of[-.46,.46]){this.box(bx+dx,.23,bz+.69,.51,.52,.03,'#405638');this.box(bx+dx,.3,bz+.71,.39,.025,.02,'#92af7c');}
        this.face([[bx-1,.9,bz-.8],[bx+1,.9,bz-.8],[bx+1,1.28,bz],[bx-1,1.28,bz]],'#bcf8ae',null,null,true);
        this.face([[bx-1,1.28,bz],[bx+1,1.28,bz],[bx+1,.9,bz+.8],[bx-1,.9,bz+.8]],'#a3d88f',null,null,true);
        for(const side of[-1,1])this.face([[bx+side*.875,.9,bz-.8],[bx+side*.875,1.28,bz],[bx+side*.875,.9,bz+.8]],'#b1c69e',[side,0,0],null,true);
        // A destination parcel stack gives the two ends distinct silhouettes.
        this.box(5.05,.43,-1.65,1.05,.92,1.05,'#c69b6e');this.box(5.05,.9,-1.65,.16,.025,1.07,'#bcf8ae');
        this.box(5.78,.22,-.98,.68,.5,.7,'#cfa678');this.box(5.78,.48,-.98,.12,.025,.72,'#bcf8ae');
        this.box(5.05,.44,-1.11,.16,.91,.025,'#bcf8ae');
        for(const[x,z,h]of[[-1.8,2.1,.72],[2.6,-2.15,.9],[5.7,2.3,.62]]){this.box(x,.19,z,.09,.4,.09,'#99784f');this.box(x,.42+h/3,z,.42,h,.42,'#617e49');this.box(x,.56+h/2,z,.3,h*.62,.3,'#799855');}
        const location=owner.at(owner.position);disk(location.x,location.z,.57,'#35462d',.087);
        this.actor={x:location.x,y:.075+.97*.4,z:location.z,yaw:location.angle,scale:.4};
        this.van('#bcf8ae');this.actor=null;
        this.renderer.draw(this.faces,this.w,this.h);
        // HTML labels stay readable while their anchors follow the 3D camera.
        [owner.at(0),owner.at(1)].forEach((p,i)=>{const screen=this.project([p.x,.1,p.z]),transform=`translate(${screen.x}px,${screen.y+16}px) translateX(-50%)`;if(owner.labels[i].style.transform!==transform)owner.labels[i].style.transform=transform;});
      }
    }
    this.scene=new RouteScene();this.available=!!this.scene.renderer;
    this.buttons.forEach(b=>b.addEventListener('click',()=>this.setMode(b.dataset.routeView)));
    this.cameraButtons.forEach(b=>b.addEventListener('click',()=>{const action=b.dataset.routeCamera;if(action==='reset')this.reset();else this.setZoom(this.zoom+(action==='in'?.15:-.15));}));
    canvas.addEventListener('pointerdown',e=>{if(e.button!==0)return;this.cameraTransition=null;this.drag={id:e.pointerId,x:e.clientX,y:e.clientY,yaw:this.scene.yaw,pitch:this.scene.pitch};canvas.setPointerCapture(e.pointerId);canvas.classList.add('dragging');});
    canvas.addEventListener('pointermove',e=>{if(!this.drag||e.pointerId!==this.drag.id)return;this.scene.yaw=this.drag.yaw+(e.clientX-this.drag.x)*.007;this.scene.pitch=Math.max(.4,Math.min(1.12,this.drag.pitch+(e.clientY-this.drag.y)*.004));this.requestRender();});
    const release=()=>{this.drag=null;canvas.classList.remove('dragging');};canvas.addEventListener('pointerup',release);canvas.addEventListener('pointercancel',release);canvas.addEventListener('lostpointercapture',release);
    canvas.addEventListener('keydown',e=>{const keys=['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','=','-','Home','r','R'];if(!keys.includes(e.key))return;e.preventDefault();this.cameraTransition=null;
      if(e.key==='Home'||e.key.toLowerCase()==='r')this.reset();
      else if(e.key==='+'||e.key==='=')this.setZoom(this.zoom+.15);
      else if(e.key==='-')this.setZoom(this.zoom-.15);
      else{if(e.key==='ArrowLeft')this.scene.yaw-=.1;if(e.key==='ArrowRight')this.scene.yaw+=.1;if(e.key==='ArrowUp')this.scene.pitch=Math.min(1.12,this.scene.pitch+.07);if(e.key==='ArrowDown')this.scene.pitch=Math.max(.4,this.scene.pitch-.07);this.requestRender();}
    });
    document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(this.frame);this.frame=0;}else this.requestRender();});
    if(!this.available){const b=this.buttons.find(b=>b.dataset.routeView==='3d');b.disabled=true;b.title='3D is unavailable on this device. The 2D route remains available.';}
    this.setMode(this.available?'3d':'2d');
  }
  at(progress) {
    const u=Math.max(0,Math.min(1,progress))*80,i=Math.min(79,Math.floor(u)),f=u-i,a=this.samples[i],b=this.samples[i+1];
    // Interpolated tangents avoid a steering snap when crossing a sampled segment.
    const prev=this.samples[Math.max(0,i-1)],next=this.samples[Math.min(80,i+2)],ax=b[0]-prev[0],az=b[1]-prev[1],bx=next[0]-a[0],bz=next[1]-a[1],al=Math.hypot(ax,az),bl=Math.hypot(bx,bz);
    return{x:a[0]+(b[0]-a[0])*f,z:a[1]+(b[1]-a[1])*f,angle:Math.atan2(az/al*(1-f)+bz/bl*f,ax/al*(1-f)+bx/bl*f)};
  }
  setPosition(value){this.position=Math.max(0,Math.min(1,value));this.requestRender();}
  setMode(mode) {
    if(mode==='3d'&&!this.available)return;
    this.mode=mode;this.map.dataset.view=mode;this.canvas.parentElement.hidden=mode!=='3d';this.svg.toggleAttribute('hidden',mode==='3d');
    this.buttons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.routeView===mode)));
    this.cameraButtons.forEach(b=>b.disabled=mode!=='3d');
    this.hint.textContent=mode==='3d'?'Drag to turn · Arrow keys to explore':'From Kuala Lumpur to George Town';
    if(mode==='3d'){this.scene.resize();this.updateZoomButtons();this.requestRender();}else{cancelAnimationFrame(this.frame);this.frame=0;}
  }
  setMotion(value){this.motion=value;if(!value&&this.cameraTransition){const t=this.cameraTransition.to;this.scene.yaw=t.yaw;this.scene.pitch=t.pitch;this.zoom=t.zoom;this.cameraTransition=null;this.requestRender();}}
  setZoom(value){this.cameraTransition=null;this.zoom=Math.max(.8,Math.min(1.5,value));this.updateZoomButtons();this.requestRender();}
  updateZoomButtons(){this.cameraButtons.find(b=>b.dataset.routeCamera==='in').disabled=this.zoom>=1.5;this.cameraButtons.find(b=>b.dataset.routeCamera==='out').disabled=this.zoom<=.8;}
  reset(){const yaw=this.scene.yaw,nearest=yaw+Math.atan2(Math.sin(-.32-yaw),Math.cos(-.32-yaw));if(this.motion)this.cameraTransition={start:performance.now(),from:{yaw,pitch:this.scene.pitch,zoom:this.zoom},to:{yaw:nearest,pitch:.78,zoom:1}};else{this.scene.yaw=nearest;this.scene.pitch=.78;this.zoom=1;}this.updateZoomButtons();this.requestRender();}
  requestRender() {
    if(this.frame||document.hidden||this.mode!=='3d'||!this.scene?.visible)return;
    this.frame=requestAnimationFrame(now=>{this.frame=0;
      if(this.cameraTransition){const t=this.cameraTransition,p=Math.min(1,(now-t.start)/280),e=1-(1-p)**3;this.scene.yaw=t.from.yaw+(t.to.yaw-t.from.yaw)*e;this.scene.pitch=t.from.pitch+(t.to.pitch-t.from.pitch)*e;this.zoom=t.from.zoom+(t.to.zoom-t.from.zoom)*e;if(p===1){this.cameraTransition=null;this.updateZoomButtons();}}
      this.scene.render(now);if(this.cameraTransition)this.requestRender();
    });
  }
}
