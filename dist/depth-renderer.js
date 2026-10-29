/* ParcelVex's illustration renderer. All surfaces share one per-pixel depth buffer. */
class ParcelDepthRenderer {
  constructor(canvas) {
    this.canvas=canvas;
    this.gl=canvas.getContext('webgl',{alpha:true,antialias:true,premultipliedAlpha:false});
    if(!this.gl) throw new Error('3D preview needs WebGL');
    this.initialize();
    canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();this.lost=true;});
    canvas.addEventListener('webglcontextrestored',()=>{this.initialize();this.lost=false;canvas.dispatchEvent(new Event('modelrestore'));});
  }
  initialize() {
    const g=this.gl;
    const shader=(type,source)=>{const s=g.createShader(type);g.shaderSource(s,source);g.compileShader(s);if(!g.getShaderParameter(s,g.COMPILE_STATUS))throw new Error(g.getShaderInfoLog(s));return s;};
    const vertex=shader(g.VERTEX_SHADER,'attribute vec3 position; attribute vec2 uv; varying vec2 texUV; void main(){gl_Position=vec4(position,1.0);texUV=uv;}');
    const fragment=shader(g.FRAGMENT_SHADER,'precision highp float; varying vec2 texUV; uniform vec4 color; uniform sampler2D image; uniform float textured; void main(){vec4 t=texture2D(image,texUV);vec3 base=color.rgb;if(base.r>base.b*1.25&&base.r>base.g*1.12){float grain=fract(sin(dot(floor(texUV*360.0),vec2(12.9898,78.233)))*43758.5453)-0.5;float edge=min(min(texUV.x,1.0-texUV.x),min(texUV.y,1.0-texUV.y));base+=grain*0.018;base*=0.96+0.04*smoothstep(0.0,0.018,edge);}gl_FragColor=mix(vec4(base,1.0),vec4(mix(base,t.rgb,t.a),1.0),textured);}');
    this.program=g.createProgram();g.attachShader(this.program,vertex);g.attachShader(this.program,fragment);g.linkProgram(this.program);
    if(!g.getProgramParameter(this.program,g.LINK_STATUS))throw new Error(g.getProgramInfoLog(this.program));
    g.deleteShader(vertex);g.deleteShader(fragment);g.useProgram(this.program);
    this.position=g.getAttribLocation(this.program,'position');this.uv=g.getAttribLocation(this.program,'uv');
    this.color=g.getUniformLocation(this.program,'color');this.textured=g.getUniformLocation(this.program,'textured');
    this.buffer=g.createBuffer();this.textures=new Map();
    const white=document.createElement('canvas');white.width=white.height=1;white.getContext('2d').fillRect(0,0,1,1);this.white=this.texture(white);
    g.enable(g.DEPTH_TEST);g.depthFunc(g.LEQUAL);g.clearColor(0,0,0,0);g.clearDepth(1);
  }
  texture(source) {
    if(this.textures.has(source))return this.textures.get(source);
    const g=this.gl,t=g.createTexture();g.bindTexture(g.TEXTURE_2D,t);
    // Mipmaps keep fine label print stable instead of shimmering at small sizes.
    const image=document.createElement('canvas');image.width=2**Math.ceil(Math.log2(source.width));image.height=2**Math.ceil(Math.log2(source.height));image.getContext('2d').drawImage(source,0,0,image.width,image.height);
    g.texImage2D(g.TEXTURE_2D,0,g.RGBA,g.RGBA,g.UNSIGNED_BYTE,image);g.generateMipmap(g.TEXTURE_2D);
    g.texParameteri(g.TEXTURE_2D,g.TEXTURE_WRAP_S,g.CLAMP_TO_EDGE);g.texParameteri(g.TEXTURE_2D,g.TEXTURE_WRAP_T,g.CLAMP_TO_EDGE);
    g.texParameteri(g.TEXTURE_2D,g.TEXTURE_MIN_FILTER,g.LINEAR_MIPMAP_LINEAR);g.texParameteri(g.TEXTURE_2D,g.TEXTURE_MAG_FILTER,g.LINEAR);
    this.textures.set(source,t);return t;
  }
  draw(faces,w,h) {
    if(this.lost)return;
    const g=this.gl;g.viewport(0,0,this.canvas.width,this.canvas.height);g.clear(g.COLOR_BUFFER_BIT|g.DEPTH_BUFFER_BIT);g.useProgram(this.program);g.bindBuffer(g.ARRAY_BUFFER,this.buffer);
    g.enableVertexAttribArray(this.position);g.vertexAttribPointer(this.position,3,g.FLOAT,false,20,0);
    g.enableVertexAttribArray(this.uv);g.vertexAttribPointer(this.uv,2,g.FLOAT,false,20,12);
    for(const face of faces){
      const n=face.normal;let light=.64+Math.max(0,n[0]*-.35+n[1]*.7+n[2]*.65)*.36;
      if(face.double&&n[2]<0)light=.77;
      const color=[1,3,5].map(i=>Math.min(1,parseInt(face.color.slice(i,i+2),16)/255*light));
      g.uniform4f(this.color,...color,1);g.uniform1f(this.textured,face.texture?1:0);g.bindTexture(g.TEXTURE_2D,face.texture?this.texture(face.texture):this.white);
      const data=[],uv=[[0,0],[1,0],[1,1],[0,1]];
      const add=i=>{const p=face.points[i],t=uv[i]||[0,0];data.push(p.x/w*2-1,1-p.y/h*2,-p.z/12,t[0],t[1]);};
      for(let i=1;i<face.points.length-1;i++){add(0);add(i);add(i+1);}
      g.bufferData(g.ARRAY_BUFFER,new Float32Array(data),g.DYNAMIC_DRAW);g.drawArrays(g.TRIANGLES,0,data.length/5);
    }
  }
}
