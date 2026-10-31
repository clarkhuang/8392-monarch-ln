/* 8392 Monarch Ln — refurbished concept model. Plain three.js r128 (non-module, works from file://).
   Sibling of the 5312 Samels model: same sky/lights, procedural TEX set, Poly Haven PBR set, HDRI, glTF furniture, palette, UI chrome.
   World: x = east (ft), z = south (ft), y = up (ft). Front grade at the house = 0. North = -z. */
(function(){
const Q=new URLSearchParams(location.search), CLEAN=Q.get('clean')==='1', VPQ=Q.get('vp'), LBLQ=Q.get('labels')==='1';
if(CLEAN)document.body.classList.add('clean');
// ---------- renderer / scene (copied from Samels model.js: sky dome shader, hemisphere + ambient + warm sun) ----------
const canvas=document.getElementById('c3d');
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,preserveDrawingBuffer:true});
renderer.setPixelRatio(Math.min(2,devicePixelRatio));
const scene=new THREE.Scene();window.__scene=scene;scene.background=new THREE.Color(0x9cc0de);scene.fog=new THREE.Fog(0xd8e3ea,550,1700);
{const sg=new THREE.SphereGeometry(5000,32,16);const sm=new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,fog:false,uniforms:{top:{value:new THREE.Color(0x3f78b8)},mid:{value:new THREE.Color(0x9cc0de)},bot:{value:new THREE.Color(0xdfe7ea)}},
 vertexShader:'varying vec3 vp;void main(){vp=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
 fragmentShader:'uniform vec3 top;uniform vec3 mid;uniform vec3 bot;varying vec3 vp;void main(){float h=vp.y;vec3 c=h>0.15?mix(mid,top,smoothstep(0.15,0.7,h)):mix(bot,mid,smoothstep(-0.05,0.15,h));gl_FragColor=vec4(c,1.0);}'});
 const sky=new THREE.Mesh(sg,sm);sky.renderOrder=-1;scene.add(sky);}
const camera=new THREE.PerspectiveCamera(55,1,0.3,6000);
scene.add(new THREE.HemisphereLight(0xf4f7ff,0x6a6650,0.78));scene.add(new THREE.AmbientLight(0xffffff,0.2));
const sun=new THREE.DirectionalLight(0xfff4e2,0.85);sun.position.set(-300,500,400);scene.add(sun);
// ---------- groups / layers ----------
const LAYERS={site:'Site: terrain, orchard, road, drive',bldg:'Building shells',roof:'Roofs + ceilings',main:'Main level (refreshed)',lower:'Walk-out lower level (piano lounge)',garage:'3-car garage + Airstream Interstate 24X',ob:'Outbuilding: guest unit + fitness/recovery center',pmain:'plan: main',plower:'plan: lower',pob:'plan: outbuilding',lmain:'labels: main',llower:'labels: lower',lob:'labels: outbuilding',lsite:'labels: site'};
const G={};for(const k in LAYERS){G[k]=new THREE.Group();scene.add(G[k]);}
['pmain','plower','pob','lmain','llower','lob','lsite'].forEach(k=>G[k].visible=false);
const TAGS={photo:['seen in photo','t-photo'],rec:['public record','t-rec'],inf:['inferred','t-inf'],prop:['proposed','t-prop'],own:['owned – Florida inventory','t-own']};
const items=[],pick=[];
// ---------- procedural textures (copied from Samels) ----------
function ctex(sz,draw){const c=document.createElement('canvas');c.width=c.height=sz;const g=c.getContext('2d');draw(g,sz);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=8;return t;}
const TEX={
 siding:ctex(256,(g,n)=>{g.fillStyle='#fff';g.fillRect(0,0,n,n);for(let i=0;i<8;i++){const y=i*n/8;const gr=g.createLinearGradient(0,y,0,y+n/8);gr.addColorStop(0,'#d9d9d9');gr.addColorStop(0.15,'#ffffff');gr.addColorStop(1,'#eeeeee');g.fillStyle=gr;g.fillRect(0,y,n,n/8);g.fillStyle='#a8a8a8';g.fillRect(0,y,n,2);}}),
 rib:ctex(256,(g,n)=>{g.fillStyle='#f4f4f4';g.fillRect(0,0,n,n);for(let i=0;i<4;i++){const x=i*n/4;g.fillStyle='#c4c4c4';g.fillRect(x,0,6,n);g.fillStyle='#ffffff';g.fillRect(x+6,0,3,n);}}),
 seam:ctex(256,(g,n)=>{g.fillStyle='#e6e6e6';g.fillRect(0,0,n,n);for(let i=0;i<3;i++){const x=i*n/3;g.fillStyle='#ffffff';g.fillRect(x,0,4,n);g.fillStyle='#9a9a9a';g.fillRect(x+4,0,3,n);}}),
 plank:ctex(512,(g,n)=>{let r=7;const rnd=()=>{r=(r*16807)%2147483647;return r/2147483647;};const pw=n/8;for(let i=0;i<8;i++){let y=0;while(y<n){const L=n*(0.35+rnd()*0.5);const v=225+Math.floor(rnd()*30);g.fillStyle=`rgb(${v},${v},${v})`;g.fillRect(i*pw,y,pw,L);g.fillStyle='rgba(0,0,0,0.25)';g.fillRect(i*pw,y,pw,1.5);y+=L;}g.fillStyle='rgba(0,0,0,0.3)';g.fillRect(i*pw,0,1.5,n);}}),
 tile:ctex(256,(g,n)=>{g.fillStyle='#fafafa';g.fillRect(0,0,n,n);g.fillStyle='#cfcfcf';for(let i=0;i<2;i++){g.fillRect(0,i*n/2,n,2);g.fillRect(i*n/2,0,2,n);}}),
 deck:ctex(256,(g,n)=>{for(let i=0;i<10;i++){const v=200+(i*37%40);g.fillStyle=`rgb(${v},${v},${v})`;g.fillRect(i*n/10,0,n/10,n);g.fillStyle='#555';g.fillRect(i*n/10,0,2,n);}}),
 shingle:ctex(256,(g,n)=>{g.fillStyle='#bdbdbd';g.fillRect(0,0,n,n);for(let r=0;r<8;r++){for(let i=0;i<8;i++){const v=150+((r*7+i*13)%60);g.fillStyle=`rgb(${v},${v},${v})`;g.fillRect(i*n/8+(r%2)*n/16,r*n/8,n/8-2,n/8-3);}}})};
// Poly Haven PBR set (same files + keys as Samels v8 photo-real tier)
const TL=new THREE.TextureLoader(),tcache={},pend=[];
function T(n){if(!tcache[n]){tcache[n]=new Promise(r=>TL.load('assets/tex/'+n+'.jpg',t=>{t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=8;r(t);},undefined,()=>r(null)));pend.push(tcache[n]);}return tcache[n];}
const PBR={plank:['oak_wood_planks_gray','oak_wood_planks'],siding:['weathered_plank_siding_gray','weathered_plank_siding'],rib:['box_profile_metal_sheet_gray','box_profile_metal_sheet'],deck:['brown_planks_05_gray','brown_planks_05'],rubber:['rubber_tiles_diff','rubber_tiles'],turf:['leafy_grass_diff','leafy_grass'],ply:['plywood_diff','plywood']};
function pbr(m,key,ru,rv){const s=PBR[key];if(!s)return m;Promise.all([T(s[0]),T(s[1]+'_nor'),T(s[1]+'_rough')]).then(([d,n,r])=>{const f=t=>{if(!t)return null;const c=t.clone();c.repeat.set(ru,rv);c.needsUpdate=true;return c;};if(d){m.map=f(d);}if(n){m.normalMap=f(n);m.normalScale=new THREE.Vector2(.5,.5);}if(r)m.roughnessMap=f(r);m.needsUpdate=true;});return m;}
function ptex(m,key,ru,rv){const t=TEX[key].clone();t.needsUpdate=true;t.repeat.set(ru,rv);m.map=t;return m;}
// ---------- palette (Samels constants) ----------
const BLK=0x1d1f22,WHT=0xf7f7f4,OAK=0xc9a97c,STL=0xc3c7ca,WALL=0xefebe4,CEDAR=0xb5824f,LVP=0xcdb08c,ORANGE=0xff8c1a,BLUE=0x2f7fe0;
const S=(c,o)=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.85,metalness:0},o||{}));
const GLASS=new THREE.MeshPhongMaterial({color:0x9fc4d6,transparent:true,opacity:0.22,shininess:120,specular:0xffffff,depthWrite:false});
const FRAME=new THREE.MeshLambertMaterial({color:BLK});
const emis=c=>new THREE.MeshBasicMaterial({color:c});
const M={wall:S(0xe2ddd3),ceil:S(0xe9e6df),vinyl:ptex(S(0xdfe3e7),'siding',1,1),shing:ptex(S(0x4a4e54),'shingle',1,1),conc:S(0xb8b4ac,{roughness:.95}),
 lvp:S(LVP,{roughness:.55}),tileW:ptex(S(0xe9e6e0,{roughness:.4}),'tile',1,1),quartz:S(0xf2f0ec,{roughness:.25}),oak:S(OAK,{roughness:.6}),blk:S(BLK,{roughness:.5}),steel:S(STL,{roughness:.3,metalness:.7}),
 white:S(WHT,{roughness:.4}),obSteel:S(0x3b3f45,{roughness:.55,metalness:.35}),cedar:S(CEDAR,{roughness:.8}),rubber:S(0xb4b6b8,{roughness:.95}),deck:S(0x9a7a5a),water:S(0x3a7fbf,{roughness:.1,metalness:.1,transparent:true,opacity:.85}),grass:S(0x6f9a4a,{roughness:1}),gravel:S(0xa9a197,{roughness:1}),fabric:S(0x6f747b,{roughness:.95}),leather:S(0x111111,{roughness:.6})};
pbr(M.lvp,'plank',1,1);pbr(M.rubber,'rubber',1,1);pbr(M.obSteel,'rib',1,1);pbr(M.cedar,'siding',1,1);pbr(M.deck,'deck',1,1);
Promise.all([T('plastered_wall_nor'),T('plastered_wall_rough')]).then(([n,r])=>{if(n){M.wall.normalMap=n;M.wall.normalScale=new THREE.Vector2(.35,.35);}if(r)M.wall.roughnessMap=r;M.wall.needsUpdate=true;});
// per-mesh UV repeat so tiled maps scale with size (world-ft based)
function uvScale(geo,w,h,d,ft){const uv=geo.attributes.uv,n=geo.attributes.normal;for(let i=0;i<uv.count;i++){const nx=Math.abs(n.getX(i)),ny=Math.abs(n.getY(i));let su,sv;if(ny>.5){su=w;sv=d;}else if(nx>.5){su=d;sv=h;}else{su=w;sv=h;}uv.setXY(i,uv.getX(i)*su/ft,uv.getY(i)*sv/ft);}uv.needsUpdate=true;}
// ---------- primitives ----------
function B(g,x0,z0,x1,z1,y0,h,m,o){const w=Math.abs(x1-x0)||.02,d=Math.abs(z1-z0)||.02;const geo=new THREE.BoxGeometry(w,h,d);uvScale(geo,w,h,d,(o&&o.ft)||6);const me=new THREE.Mesh(geo,m);me.position.set((x0+x1)/2,y0+h/2,(z0+z1)/2);g.add(me);if(o&&o.item){me.userData.item=o.item;pick.push(me);}return me;}
function C(g,x,y,z,r,h,m,seg){const me=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,seg||20),m);me.position.set(x,y+h/2,z);g.add(me);return me;}
function info(name,tag,text,pos,layer){const it={name,tag,text,pos,layer};items.push(it);return it;}
// axis-aligned wall with openings. gaps: [a,b,sill,head,type] measured from the start point; type 'd' door (orange in plan), 'w' window (glass), 'o' open
function wall(g,x0,z0,x1,z1,y0,h,m,gaps,pg,t){t=t||.4;const alongX=z0===z1,L=alongX?x1-x0:z1-z0,s=Math.sign(L)||1,len=Math.abs(L);gaps=(gaps||[]).slice().sort((a,b)=>a[0]-b[0]);
 const seg=(a,b,ya,yb)=>{if(b-a<.01||yb-ya<.01)return;const p0=a*s,p1=b*s;if(pg&&ya===0&&yb===h){const pt=t+.1;if(alongX)B(pg,x0+p0,z0-pt/2,x0+p1,z0+pt/2,y0+h+.2,.05,POCHE);else B(pg,x0-pt/2,z0+p0,x0+pt/2,z0+p1,y0+h+.2,.05,POCHE);}if(alongX)B(g,x0+p0,z0-t/2,x0+p1,z0+t/2,y0+ya,yb-ya,m);else B(g,x0-t/2,z0+p0,x0+t/2,z0+p1,y0+ya,yb-ya,m);};
 let c=0;for(const q of gaps){seg(c,q[0],0,h);if(q[2]>0)seg(q[0],q[1],0,q[2]);seg(q[0],q[1],q[3],h);
  const mid=(q[0]+q[1])/2*s,wd=q[1]-q[0],px=alongX?x0+mid:x0,pz=alongX?z0:z0+mid;
  if(q[4]==='w'&&pg){const pt=t+.1;if(alongX)B(pg,px-wd/2,pz-pt/2,px+wd/2,pz+pt/2,y0+h+.2,.05,WINP);else B(pg,px-pt/2,pz-wd/2,px+pt/2,pz+wd/2,y0+h+.2,.05,WINP);}
  if(q[4]==='w'){const gl=new THREE.Mesh(new THREE.BoxGeometry(alongX?wd:.06,q[3]-q[2],alongX?.06:wd),GLASS);gl.position.set(px,y0+(q[2]+q[3])/2,pz);g.add(gl);
   const fr=(a,b,c2,d2,e,f)=>B(g,a,b,c2,d2,e,f,FRAME);if(alongX){fr(px-wd/2,pz-.12,px+wd/2,pz+.12,y0+q[2]-.12,.14);fr(px-wd/2,pz-.12,px+wd/2,pz+.12,y0+q[3]-.02,.14);fr(px-.05,pz-.1,px+.05,pz+.1,y0+q[2],q[3]-q[2]);}else{fr(px-.12,pz-wd/2,px+.12,pz+wd/2,y0+q[2]-.12,.14);fr(px-.12,pz-wd/2,px+.12,pz+wd/2,y0+q[3]-.02,.14);fr(px-.1,pz-.05,px+.1,pz+.05,y0+q[2],q[3]-q[2]);}}
  if(q[4]==='d'&&pg)door2D(pg,px,pz,alongX,wd,y0);if(q[4]==='d')trim(g,px,pz,alongX,wd,y0,q[3]);
  c=q[1];}
 seg(c,len,0,h);}
function trim(g,px,pz,alongX,wd,y0,hd){const m=M.white;if(alongX){B(g,px-wd/2-.25,pz-.25,px-wd/2,pz+.25,y0,hd,m);B(g,px+wd/2,pz-.25,px+wd/2+.25,pz+.25,y0,hd,m);}else{B(g,px-.25,pz-wd/2-.25,px+.25,pz-wd/2,y0,hd,m);B(g,px-.25,pz+wd/2,px+.25,pz+wd/2+.25,y0,hd,m);}}
const POCHE=new THREE.MeshBasicMaterial({color:0x2a2d33}),WINP=new THREE.MeshBasicMaterial({color:0x7fb4c9});
const OR=new THREE.MeshBasicMaterial({color:ORANGE,depthTest:false,transparent:true}),BL=new THREE.MeshBasicMaterial({color:BLUE,transparent:true,opacity:.55,depthTest:false}),BLs=new THREE.MeshBasicMaterial({color:0x0b4fb0,depthTest:false});
function door2D(pg,px,pz,alongX,wd,y0){const y=y0+.12;const r=new THREE.Mesh(new THREE.PlaneGeometry(alongX?wd:.7,alongX?.7:wd),OR);r.rotation.x=-Math.PI/2;r.position.set(px,y,pz);r.renderOrder=10;pg.add(r);
 const pts=[];const hx=alongX?px-wd/2:px,hz=alongX?pz:pz-wd/2;for(let i=0;i<=16;i++){const a=i/16*Math.PI/2;pts.push(alongX?new THREE.Vector3(hx+Math.cos(a)*wd,y,hz+Math.sin(a)*wd):new THREE.Vector3(hx+Math.sin(a)*wd,y,hz+Math.cos(a)*wd));}
 const l=new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color:ORANGE,depthTest:false}));l.renderOrder=10;pg.add(l);}
// stairs: dir = direction of ascent 'N','S','E','W'
function stairs(g,pg,x0,z0,x1,z1,yb,yt,dir,lab){const n=Math.max(2,Math.round((yt-yb)/0.62)),rh=(yt-yb)/n;const ax=(dir==='E'||dir==='W'),len=ax?x1-x0:z1-z0;
 for(let i=0;i<n;i++){const f=i/n,f2=(i+1)/n;let a,b;if(dir==='N'){a=z1-len*f2;b=z1-len*f;B(g,x0,a,x1,b,yb,rh*(i+1),M.lvp);}else if(dir==='S'){a=z0+len*f;b=z0+len*f2;B(g,x0,a,x1,b,yb,rh*(i+1),M.lvp);}else if(dir==='E'){a=x0+len*f;b=x0+len*f2;B(g,a,z0,b,z1,yb,rh*(i+1),M.lvp);}else{a=x1-len*f2;b=x1-len*f;B(g,a,z0,b,z1,yb,rh*(i+1),M.lvp);}}
 if(!pg)return;const yp=Math.max(yb,yt)+.3;const p=new THREE.Mesh(new THREE.PlaneGeometry(x1-x0,z1-z0),BL);p.rotation.x=-Math.PI/2;p.position.set((x0+x1)/2,yp,(z0+z1)/2);p.renderOrder=9;pg.add(p);
 const cx=(x0+x1)/2,cz=(z0+z1)/2,hl=(ax?x1-x0:z1-z0)/2*.8,v={N:[0,-1],S:[0,1],E:[1,0],W:[-1,0]}[dir];const tail=new THREE.Vector3(cx-v[0]*hl,yp+.05,cz-v[1]*hl),head=new THREE.Vector3(cx+v[0]*hl,yp+.05,cz+v[1]*hl);
 const sh=new THREE.Mesh(new THREE.BoxGeometry(ax?hl*2:.22,.05,ax?.22:hl*2),BLs);sh.position.set(cx,yp+.05,cz);sh.renderOrder=11;pg.add(sh);
 const hd=new THREE.Mesh(new THREE.ConeGeometry(.7,1.4,3),BLs);hd.position.copy(head);hd.rotation.x=-Math.PI/2;hd.rotation.z=-Math.atan2(v[0],-v[1]);hd.renderOrder=11;pg.add(hd);if(lab)label(pg,lab,cx,yp+.2,cz,.8,'#0b4fb0');}
// labels (canvas sprites) — plan labels + site labels
function label(g,text,x,y,z,size,col,bg){const lines=String(text).split('\n');const c=document.createElement('canvas'),fs=48;const ctx=c.getContext('2d');ctx.font=`600 ${fs}px Inter,Segoe UI,sans-serif`;const w=Math.max(...lines.map(l=>ctx.measureText(l).width))+30;c.width=w;c.height=lines.length*fs*1.15+18;const g2=c.getContext('2d');
 g2.fillStyle=bg||'rgba(15,17,21,0.82)';g2.fillRect(0,0,c.width,c.height);g2.font=`600 ${fs}px Inter,Segoe UI,sans-serif`;g2.fillStyle=col||'#e8e6e1';g2.textBaseline='top';lines.forEach((l,i)=>g2.fillText(l,15,9+i*fs*1.15));
 const t=new THREE.CanvasTexture(c);const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:t,depthTest:false,transparent:true}));const k=(size||1)*1.6/fs;sp.scale.set(c.width*k,c.height*k,1);sp.position.set(x,y,z);sp.renderOrder=20;g.add(sp);return sp;}
// glTF furniture (Poly Haven CC0, same asset set as Samels): fit to a footprint box, rotate ry
const GL=new THREE.GLTFLoader(),gcache={};
function gltf(g,name,x0,z0,x1,z1,y0,h,ry,tint){const p=(gcache[name]=gcache[name]||new Promise((res)=>GL.load('assets/models/'+name+'/'+name+'.gltf',s=>res(s.scene),undefined,()=>res(null))));pend.push(p);
 p.then(src=>{if(!src)return;const o=src.clone(true);o.rotation.y=ry||0;o.updateMatrixWorld(true);const bb=new THREE.Box3().setFromObject(o),sz=bb.getSize(new THREE.Vector3());const sx=Math.abs(x1-x0)/sz.x,sz2=Math.abs(z1-z0)/sz.z,sy=h?h/sz.y:Math.min(sx,sz2);o.scale.set(sx,sy,sz2);o.updateMatrixWorld(true);const b2=new THREE.Box3().setFromObject(o);o.position.set((x0+x1)/2-(b2.min.x+b2.max.x)/2,y0-b2.min.y,(z0+z1)/2-(b2.min.z+b2.max.z)/2);
  if(tint)o.traverse(c=>{if(c.isMesh){c.material=c.material.clone();c.material.color&&c.material.color.multiply(new THREE.Color(tint));}});g.add(o);});}
function light(g,x,y,z,i,d){const l=new THREE.PointLight(0xffe8c4,(i||.55)*.35,d||24,1.6);l.position.set(x,y,z);g.add(l);}
function can(g,x,y,z){const m=new THREE.Mesh(new THREE.CylinderGeometry(.28,.28,.04,14),emis(0xfff4d8));m.position.set(x,y-.03,z);g.add(m);}
function pendant(g,x,yT,yB,z){C(g,x,yB,z,.02,yT-yB,M.blk,6);const s=new THREE.Mesh(new THREE.CylinderGeometry(.35,.55,.6,16,1,true),new THREE.MeshStandardMaterial({color:BLK,side:THREE.DoubleSide}));s.position.set(x,yB,z);g.add(s);const b=new THREE.Mesh(new THREE.SphereGeometry(.22,10,8),emis(0xffe2a8));b.position.set(x,yB-.2,z);g.add(b);}
// ---------- terrain: front yard ~flat at 0, falls ~4.7 ft to the rear walk-out, then gently north (inferred from photos 14, 15, 19) ----------
const HX0=0,HX1=50,HZ0=0,HZ1=24, YM=4, YL=-4.5, YC=12, OX=80,OZ=30;
function elev(x,z){let y;if(z>=26)y=0;else if(z>=-2)y=-4.7+4.7*(z+2)/28;else y=-4.7+(z+2)*0.03;if(x>OX-15&&x<OX+55&&z>OZ-10)y=0;return Math.max(y,-12);}
{const geo=new THREE.PlaneGeometry(1200,1200,240,240);geo.rotateX(-Math.PI/2);const p=geo.attributes.position;for(let i=0;i<p.count;i++)p.setY(i,elev(p.getX(i),p.getZ(i)));geo.computeVertexNormals();
 const uv=geo.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*120,uv.getY(i)*120);
 const m=S(0x8fb070,{roughness:1});pbr(m,'turf',120,120);m.onBeforeCompile=sh=>{sh.vertexShader='varying vec3 vWP;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvWP=(modelMatrix*vec4(position,1.0)).xyz;');sh.fragmentShader='varying vec3 vWP;\n'+sh.fragmentShader.replace('void main() {','void main() {\nif(vWP.x>0.25&&vWP.x<49.75&&vWP.z>0.25&&vWP.z<23.75) discard;');};
 const t=new THREE.Mesh(geo,m);G.site.add(t);}
function ribbon(g,pts,w,m,dy){for(let i=0;i<pts.length-1;i++){const [ax,az]=pts[i],[bx,bz]=pts[i+1],L=Math.hypot(bx-ax,bz-az),n=Math.ceil(L/6);for(let k=0;k<n;k++){const x=ax+(bx-ax)*(k+.5)/n,z=az+(bz-az)*(k+.5)/n;const s=new THREE.Mesh(new THREE.BoxGeometry(w,.25,L/n+.6),m);s.position.set(x,elev(x,z)+(dy||.08),z);s.rotation.y=Math.atan2(bx-ax,bz-az);G.site.add(s);}}}
// private road (surface not photographed: modeled gravel, inferred), concrete drive to garage (photo 13), gravel drive + apron to outbuilding (photo 18)
ribbon(G.site,[[-500,150],[500,150]],18,M.gravel);ribbon(G.site,[[-14,150],[-14,40]],16,M.conc);B(G.site,-28,24,0,42,-.2,.3,M.conc);
ribbon(G.site,[[-6,110],[60,110],[100,100]],12,M.gravel);B(G.site,88,86,112,102,-.2,.32,M.gravel);
info('Private road — Monarch Ln (surface inferred)','inf','Private maintained road per listing; surface not shown in photos. Road maintenance agreement: verify.',[0,3,150],'site');
// orchard: rows of cherry trees with whitewashed trunks (photos 9, 20) west of the house
const trunkM=S(0xe8e4da),canM=S(0x4f6f35,{roughness:1}),canM2=S(0x86a35a,{roughness:1});
{const trunks=[],cans=[];for(let x=-250;x<=-70;x+=20)for(let z=-160;z<=60;z+=16){if(x>-80&&z>-10)continue;trunks.push([x+((z/16)%2)*2,z]);}
 const tg=new THREE.CylinderGeometry(.35,.45,4.5,8),cg=new THREE.SphereGeometry(6,10,8);const ti=new THREE.InstancedMesh(tg,trunkM,trunks.length),ci=new THREE.InstancedMesh(cg,canM,trunks.length),m4=new THREE.Matrix4();
 trunks.forEach(([x,z],i)=>{const y=elev(x,z);m4.makeTranslation(x,y+2.25,z);ti.setMatrixAt(i,m4);m4.compose(new THREE.Vector3(x,y+7.5,z),new THREE.Quaternion(),new THREE.Vector3(1,.75,1));ci.setMatrixAt(i,m4);});G.site.add(ti,ci);}
// tree line (photos 17, 19, 20)
{const n=80,gm=new THREE.ConeGeometry(7,30,8),im=new THREE.InstancedMesh(gm,S(0x2f4f2a,{roughness:1}),n),m4=new THREE.Matrix4();for(let i=0;i<n;i++){const x=-300+i*8.5,z=-260+Math.sin(i*1.7)*12;m4.makeTranslation(x,elev(x,z)+15,z);im.setMatrixAt(i,m4);}G.site.add(im);}
info('Cherry orchard (~5 rows × 14 trees shown, illustrative)','photo','Photos 9, 20: mowed rows, whitewashed trunks, trees appear pruned and mature. Exact count/row spacing not known — illustrative.',[-160,14,-40],'site');
// ======================= MAIN HOUSE =======================
const hb=G.bldg,gm=G.main,gl=G.lower,pm=G.pmain,pl=G.plower;
// foundation + exterior skins (vinyl, photos 10-15). Front (south) wall z=24 faces the drive; rear (north) is the walk-out (inferred orientation).
B(gl,HX0,HZ0,HX1,HZ1,YL-.4,.4,M.lvp,{ft:8});       // lower floor (new LVP)
B(gm,HX0,HZ0,HX1,HZ1,YM-1,1,M.lvp,{ft:8});          // main floor
B(G.roof,HX0,HZ0,HX1,HZ1,YC,.15,M.ceil);
const EXT=(g,x0,z0,x1,z1,y0,h,gaps,pg,out)=>{wall(g,x0,z0,x1,z1,y0,h,M.wall,gaps,pg,.45);const o=out.map(v=>v*.28);wall(hb,x0+o[0],z0+o[1],x1+o[0],z1+o[1],y0,h,M.vinyl,(gaps||[]).map(q=>q.slice(0,4).concat(['o'])),null,.1);};
// lower level exterior walls (y YL .. YM-1). North = walk-out: slider + windows (photos 15, 37-40)
EXT(gl,0,0,50,0,YL,YM-1-YL,[[3,9,0,6.7,'d'],[16,22,3,6.4,'w'],[30,34,3,6.4,'w'],[45,48,3.6,6.4,'w']],pl,[0,-1]);
EXT(gl,0,24,50,24,YL,YM-1-YL,[[23,26,0,4.6,'o']],pl,[0,1]);
EXT(gl,0,0,0,24,YL,YM-1-YL,[[3,8,3.4,6.4,'w']],pl,[-1,0]);EXT(gl,50,0,50,24,YL,YM-1-YL,[[4,7,4,6.4,'w']],pl,[1,0]);
// main level exterior walls (y YM-1 .. YC)
EXT(gm,0,0,50,0,YM-1,YC-YM+1,[[2,6,4,7.6,'w'],[17,23,1,7.9,'d'],[29,31.5,5.5,7.6,'w'],[35,36.5,6,7.6,'w'],[42,47,4,7.6,'w']],pm,[0,-1]);
EXT(gm,0,24,50,24,YM-1,YC-YM+1,[[6,14,3.4,7.6,'w'],[22.5,25.5,-4.6,7.9,'d'],[30,34,4,7.6,'w'],[42,46,4,7.6,'w']],pm,[0,1]);
EXT(gm,0,0,0,24,YM-1,YC-YM+1,[[8.5,11.5,1,7.9,'d']],pm,[-1,0]);EXT(gm,50,0,50,24,YM-1,YC-YM+1,[[17,21,4,7.6,'w']],pm,[1,0]);
// front door — real entry at the centre of the south wall, onto the split foyer landing (photos 11, 12: red door near centre)
B(gm,22.5,23.7,25.5,24.1,0.5,7.2,S(0x8e2a2a,{roughness:.5}));
// gable roof, ridge E-W, gray asphalt shingles (photos 10-12; roof looks in good shape)
function roof(g,x0,z0,x1,z1,yE,rise,alongX,m,ov){ov=ov||1.2;const w=x1-x0,d=z1-z0;if(alongX){const half=d/2+ov,sl=Math.hypot(half,rise),a=Math.atan2(rise,half);for(const s of [-1,1]){const p=new THREE.Mesh(new THREE.BoxGeometry(w+2*ov,.35,sl),m);uvScale(p.geometry,w+2*ov,.35,sl,6);p.position.set((x0+x1)/2,yE+rise/2,(z0+z1)/2+s*half/2);p.rotation.x=s*a;g.add(p);}
  const sh=new THREE.Shape([new THREE.Vector2(-d/2,0),new THREE.Vector2(d/2,0),new THREE.Vector2(0,rise)]);for(const x of [x0,x1]){const e=new THREE.Mesh(new THREE.ShapeGeometry(sh),m===M.shing?M.vinyl:m);e.material.side=THREE.DoubleSide;e.position.set(x,yE,(z0+z1)/2);e.rotation.y=Math.PI/2;g.add(e);}}
 else{const half=w/2+ov,sl=Math.hypot(half,rise),a=Math.atan2(rise,half);for(const s of [-1,1]){const p=new THREE.Mesh(new THREE.BoxGeometry(sl,.35,d+2*ov),m);uvScale(p.geometry,sl,.35,d+2*ov,6);p.position.set((x0+x1)/2+s*half/2,yE+rise/2,(z0+z1)/2);p.rotation.z=-s*a;g.add(p);}
  const sh=new THREE.Shape([new THREE.Vector2(-w/2,0),new THREE.Vector2(w/2,0),new THREE.Vector2(0,rise)]);for(const z of [z0,z1]){const e=new THREE.Mesh(new THREE.ShapeGeometry(sh),m===M.shing?M.vinyl:m);e.material=e.material.clone();e.material.side=THREE.DoubleSide;e.position.set((x0+x1)/2,yE,z);g.add(e);}}}
roof(G.roof,HX0,HZ0,HX1,HZ1,YC+.1,5,true,M.shing);
// ---- main level interior (refresh: new LVP throughout, paint, lighting; kitchen cabinets kept, new quartz top + lighting) ----
const IW=(x0,z0,x1,z1,gaps,y,g,pg)=>wall(g||gm,x0,z0,x1,z1,(y===undefined?YM:y),(y===undefined?YC-YM:YM-1-YL),M.wall,gaps,pg||pm,.33);
IW(12,0,12,4,[]);                                 // kitchen/dining stub (peninsula side)
IW(21,11,50,11,[[2,6,0,8,'o'],[8,10.8,0,6.8,'d'],[13.5,16,0,6.8,'d'],[18,20.6,0,6.8,'d'],[24,26.8,0,6.8,'d']]);  // hall north side: linen, hall bath, primary
IW(27,0,27,11,[]);IW(33,0,33,11,[]);IW(38,0,38,11,[[2,4.6,0,6.8,'d']]);IW(27,0,33,0+3,[]);
IW(27,3,33,3,[]);                                 // linen closet / hall bath split
IW(21,14,50,14,[[8,10.8,0,6.8,'d'],[19.5,22.3,0,6.8,'d']]); // hall south side: office, Milan
IW(27,14,27,24,[]);IW(38,14,38,24,[]);
// half wall between living and split-foyer stair (photo 26)
B(gm,20.85,14,21.15,24,YM,3,M.white);B(gm,21,14,27,14.3,YM,3,M.white);
// split-foyer stairs: landing at y .5 inside the front door; up-flight (west) to main, down-flight (east) to lower — inferred raised-ranch layout (photos 26-28)
B(G.bldg,21,21,27,24,-.2,.7,M.lvp);
stairs(gm,pm,21.2,14.3,24,21,0.5,YM,'N','UP to main');
stairs(gl,pl,24,14.3,26.8,21,YL,0.5,'S','UP to entry');
B(gl,24,14.3,26.8,21,YL-.01,.01,M.lvp);
info('Front door (real entry) → split foyer','photo','Photos 11-12: red front door near the centre of the south (front) façade, opening onto a split-foyer landing: ~3.5 ft up to the main level (west flight) and ~5 ft down to the walk-out (east flight). Stair arrangement inferred.',[24,8,25],'main');
// kitchen (photos 29-32): oak cabinets on the north + west walls, peninsula with bar seating, stainless appliances, window over the sink
const KB=(x0,z0,x1,z1)=>{B(gm,x0,z0,x1,z1,YM,2.9,M.oak);B(gm,x0-.05,z0-.05,x1+.05,z1+.05,YM+2.9,.13,M.quartz);};
KB(0.3,0.3,11.7,2.3);KB(0.3,2.3,2.3,7.8);B(gm,0.3,0.25,4,1.4,YM+4.6,2.8,M.oak);B(gm,8,0.25,11.7,1.4,YM+4.6,2.8,M.oak);B(gm,.25,2.3,1.4,7.8,YM+4.6,2.8,M.oak);
B(gm,4.5,0.4,7.5,2.1,YM+2.9,.2,M.steel);B(gm,.35,4,2.2,6.5,YM,6.2,M.steel);/*fridge*/B(gm,8.3,0.35,10.6,2.25,YM,3.0,M.steel);/*range*/
KB(9.5,4,11.5,9.5);B(gm,11.5,4,12.6,9.5,YM+2.9,.13,M.quartz);for(const z of [4.9,6.8,8.7])gltf(gm,'bar_chair_round_01',12.6,z-.8,14.1,z+.8,YM,3.4,-Math.PI/2);
pendant(gm,10.6,YC,YM+7,5);pendant(gm,10.6,YC,YM+7,8.5);
// dining (photos 29-30): slider to the deck
gltf(gm,'modern_coffee_table_01',15,4,22,7.6,YM,2.5);/* stands in for a 7 × 3.6 dining table (proposed) */
pendant(gm,18.5,YC,YM+6.6,5.8);
info('Kitchen — oak cabinets kept, new quartz tops + LVP + lighting (proposed refresh)','photo','Photos 29-32: honey-oak shaker cabinets, laminate/granite-look top, white tile floor, stainless range/microwave/fridge/dishwasher (appear recent). ~12 × 11 ft (estimated, medium).',[6,YM+9,6],'main');
// living (photos 26-28): picture window to the front
gltf(gm,'sofa_02',5,20.6,13.5,23.6,YM,2.8,Math.PI); // proposed new sofa under the window
B(gm,7.6,16.6,11.6,18.6,YM,1.5,M.leather,{item:info('#4 Tufted dark-leather bench / cocktail table','own','Placeholder 4 × 2 ft (Samels inventory). ≥3 ft walk around.')});
gltf(gm,'modern_arm_chair_01',5.6,12.6,8.6,15.6,YM,3,0,0x333333);gltf(gm,'modern_arm_chair_01',10.6,12.6,13.6,15.6,YM,3,0,0x333333);
B(gm,.25,13.5,.45,20,YM+2.5,4.5,S(0x3a2618,{roughness:.6}),{item:info('#2 Carved panel with mirrored inlay (art wall)','own','West wall of the living room.')});
// office (bedroom 3) — #6 glass desk + #20 Aeron
B(gm,28.5,21,33.5,23.5,YM+2.4,.08,S(0x9ad0e0,{transparent:true,opacity:.5}));for(const[x,z] of [[28.6,21.1],[33.3,21.1],[28.6,23.3],[33.3,23.3]])B(gm,x,z,x+.15,z+.15,YM,2.4,M.blk);
B(gm,30,18.6,32,20.6,YM,3.5,S(0x555555),{item:info('#20 Herman Miller Aeron chair','own','')});
// Milan (bedroom 2): #13 full bed, #14 nightstand, #10 kids desk
B(gm,43.4,16.5,50,21.1,YM,1.9,S(0x22305a));B(gm,49.6,16.3,50,21.3,YM,3.5,S(0x22305a));B(gm,48.3,21.4,49.8,22.9,YM,2,M.white);B(gm,39,14.6,43.5,16.8,YM,2.6,S(0xf2f2f2));
// primary (bedroom 1): queen (proposed) — headboard on the east wall
B(gm,43.3,3,50,8,YM,2,S(0xd8d3c8));B(gm,49.6,2.8,50,8.2,YM,3.8,S(0x6b5a48));B(gm,48.3,.7,49.8,2.4,YM,2,M.oak);B(gm,48.3,8.6,49.8,10.2,YM,2,M.oak);
// baths — new (Samels fixture style: white-oak vanity, quartz top, black fixtures, large-format tile, glass shower)
function vanity(g,x0,z0,x1,z1,y){B(g,x0,z0,x1,z1,y,2.75,M.oak);B(g,x0-.05,z0-.05,x1+.05,z1+.05,y+2.75,.12,M.quartz);B(g,x0+.4,z0,x1-.4,z0+.05,y+3.6,2.6,S(0xdfe9ee,{roughness:.05,metalness:.6}));}
function toilet(g,x,z,y){B(g,x-.6,z-.2,x+.6,z+.5,y+1.4,1.3,M.white);C(g,x,y,z+1.1,.55,1.35,M.white);}
function shower(g,x0,z0,x1,z1,y){B(g,x0,z0,x1,z1,y,.25,M.tileW);B(g,x0,z0,x1,z1+.0,y,0.01,M.tileW);const gs=new THREE.Mesh(new THREE.BoxGeometry(.05,6.8,z1-z0),GLASS);gs.position.set(x1,y+3.4,(z0+z1)/2);g.add(gs);C(g,(x0+x1)/2,y+6.5,z0+.3,.25,.05,M.blk);}
B(gm,27.2,3.2,32.8,10.8,YM+.01,.02,M.tileW);{const ta=ptex(S(0x9fb0b2,{roughness:.35}),'tile',1,1);B(gm,27.2,3.17,32.8,3.3,YM,7.6,ta,{ft:2});B(gm,27.17,3.2,27.3,10.8,YM,7.6,ta,{ft:2});B(gm,33.17,.2,33.3,10.8,YM,7.6,ta,{ft:2});B(gm,38.2,.2,43.8,.33,YL,7,ta,{ft:2});}vanity(gm,27.3,3.3,31,5.2,YM);toilet(gm,32,8.9,YM);B(gm,27.3,6.5,30.3,10.8,YM,1.8,M.white);/*tub-shower*/
B(gm,33.2,.2,37.8,10.8,YM+.01,.02,M.tileW);vanity(gm,33.3,.3,37.7,2.2,YM);toilet(gm,36.8,6.9,YM);shower(gm,33.3,7.8,36.5,10.8,YM);
info('Hall bath — new (proposed)','prop','Existing (photo 25): green walls, oak vanity, cultured-marble top, fiberglass tub/shower. Refresh: white-oak vanity, quartz top, black fixtures, large-format tile, new tub/shower surround. ~6 × 8 ft (estimated, low).',[30,YM+9,7],'main');
info('Primary bath — new walk-in shower (proposed)','prop','Existing (photo 36): oak vanity, white top, fiberglass shower. ~5 × 11 ft (estimated, low).',[35.5,YM+9,5],'main');
// deck (photos 14-17): large wood deck off the dining slider, stair down to the east
B(hb,8,-12,28,0,YM-1,.35,M.deck);for(let x=8;x<=28;x+=2.5){B(hb,x-.12,-12,x+.12,-11.8,YM-.65,3.1,M.deck);}B(hb,8,-12.1,28,-11.9,YM+2.3,.2,M.deck);B(hb,7.9,-12,8.1,0,YM+2.3,.2,M.deck);
for(const [x,z] of [[8.2,-11.8],[17.8,-11.8],[27.6,-11.8]])B(hb,x,z,x+.5,z+.5,elev(x,z),YM-1-elev(x,z),M.deck);stairs(hb,null,28,-8,31,-2,elev(30,-5),YM-.7,'W');
gltf(hb,'outdoor_table_chair_set_01',12,-9,20,-3,YM-.65,3);
B(hb,18,24,30,29,-.3,.8,M.deck); // front stoop/deck (photo 12)
// lighting (Samels style warm cans + pendants)
[[6,6],[17,6],[10,18],[16,18],[24,12.5],[33,18],[44,18],[44,5],[30,7],[35.5,5]].forEach(([x,z])=>can(G.roof,x,YC,z));
[[8,6],[18,18],[44,6],[44,19],[32,19]].forEach(([x,z])=>light(gm,x,YC-1.5,z,.5,22));
// ---- lower level (photos 37-43, 1): family room w/ brick hearth wall, flex bedroom, bath, utility ----
const LW=(x0,z0,x1,z1,gaps)=>IW(x0,z0,x1,z1,gaps,YL,gl,pl);
LW(0,14,21,14,[[14,17,0,6.6,'d']]);LW(21,14,24,14,[]);LW(26.8,12,50,12,[[4,6.8,0,6.6,'d'],[12.5,15.2,0,6.6,'d'],[18,20.8,0,6.6,'d']]);
LW(27,0,27,12,[]);LW(38,0,38,12,[]);LW(44,0,44,12,[]);LW(26.8,15,50,15,[[3,5.8,0,6.6,'d'],[14,16.8,0,6.6,'d']]);LW(38,15,38,24,[]);LW(26.8,12,26.8,21,[[0.4,2.8,0,6.6,'o']]);
B(gl,0,3,0.6,9.5,YL,6.2,S(0x8a5a48,{roughness:.95}),{item:info('Brick hearth wall (photo 40)','photo','Brick wall with a black-tile hearth pad — no fireplace per listing; likely a former wood-stove spot. TV wall in the proposal.')});
B(G.roof,0,0,50,24,YM-1.05,.04,M.ceil);/* 7.5 ft ceiling (drop ceiling, photos 37-39) */
// sectional (#3, L 12 × 10, 40 in deep, size to verify) facing a 75" TV on the brick wall
const fab=M.fabric;B(gl,10,1.6,13.3,11.6,YL,1.4,fab);B(gl,12.6,1.6,13.3,11.6,YL,2.6,fab);B(gl,1.6,10.2,13.3,13.5,YL,1.4,fab);B(gl,1.6,12.8,13.3,13.5,YL,2.6,fab);
info('#3 Florida gray sectional — L 12 × 10 ft (size to verify)','own','Fits the 26 × 14 family room: 10 ft to the TV; 3 ft path from the walk-out slider kept clear.',[8,YL+4,12],'lower');
B(gl,.7,3.5,1.9,9,YL,2.2,M.white);B(gl,.62,3.5,.72,9,YL+3.4,3.1,S(0x050505,{roughness:.2}));
// #5 Steinway Model B 6'11" × 4'10" — curved case (extruded), lid raised, keyboard faces south
{const sh=new THREE.Shape();sh.moveTo(0,0);sh.lineTo(4.83,0);sh.lineTo(4.83,2.2);sh.bezierCurveTo(4.83,4.2,3.4,4.5,2.9,5.4);sh.bezierCurveTo(2.5,6.3,2.3,6.92,1.4,6.92);sh.bezierCurveTo(.4,6.92,0,6.4,0,5.6);sh.lineTo(0,0);
 const g2=new THREE.ExtrudeGeometry(sh,{depth:1.0,bevelEnabled:false});g2.rotateX(-Math.PI/2);const pmat=S(0x0a0a0a,{roughness:.15,metalness:.2});const body=new THREE.Mesh(g2,pmat);body.position.set(16.5,YL+2.1,10.0);
 body.scale.set(1,1,1);gl.add(body);const lid=new THREE.Mesh(new THREE.ShapeGeometry(sh),pmat);lid.material=pmat.clone();lid.material.side=THREE.DoubleSide;lid.rotation.x=-Math.PI/2;const lp=new THREE.Group();lp.add(lid);lp.position.set(16.5,YL+3.12,10.0);gl.add(lp);lid.rotation.y=0;lp.rotateZ(-0.0);lp.rotateX(0);
 for(const [x,z] of [[16.8,9.7],[21,9.7],[18,4.2]])C(gl,x,YL,z,.18,2.1,pmat,10);B(gl,16.5,9.95,21.33,10.6,YL+2.4,.5,M.white);B(gl,17.4,10.9,20.4,12.1,YL,1.6,pmat);
 info('#5 Steinway Model B (6′11″ × 4′10″) — piano lounge','own','Lower family room, interior east side: 4+ ft from the north windows/slider (out of direct sun), ~3 ft to the sectional, ~9 ft to the east wall. Deliver through the walk-out slider (no stairs). Add a Dampp-Chaser humidity system. Bench placeholder 3 × 1.2 ft.',[14,YL+5,7],'lower');}
// lower bedroom/flex (photos 41-42) — guest / Alex (proposed queen); lower bath (photo 43) refreshed; utility (photo 1)
B(gl,28,3,33,9.7,YL,2,S(0xd8d3c8));B(gl,27.2,2.8,27.6,9.9,YL,3.6,S(0x6b5a48));
B(gl,38.2,.2,43.8,11.8,YL+.01,.02,M.tileW);vanity(gl,38.3,.3,41.7,2.2,YL);toilet(gl,43,6,YL);shower(gl,38.3,8.6,41.6,11.8,YL);
B(gl,39,16,49.5,23.5,YL,.02,M.conc);C(gl,48.5,YL,22.5,.7,4.5,S(0x2f6fb0));B(gl,44,23.2,47,24,YL+3,3.5,S(0x777777)); /* mech: pressure tank, panel */
[[5,6],[14,6],[22,6],[32,6],[41,6],[10,19],[32,19]].forEach(([x,z])=>can(G.roof,x,YM-1.05,z));[[6,6],[19,6],[32,6]].forEach(([x,z])=>light(gl,x,YM-2,z,.55,20));
// ======================= 3-CAR GARAGE 28 × 27 (listing) =======================
const gg=G.garage,GX0=-28,GZ0=-3;
B(gg,GX0,GZ0,0,24,-.3,.3,M.conc,{ft:10});B(gg,GX0,GZ0,0,GZ0+.6,-5,5,M.conc);
wall(gg,GX0,24,0,24,0,9,M.wall,[[2,18,0,7,'o'],[19.5,27.5,0,7,'o']],pm,.45);for(const [a,b] of [[2,18],[19.5,27.5]]){const r=new THREE.Mesh(new THREE.PlaneGeometry(b-a,.7),OR);r.rotation.x=-Math.PI/2;r.position.set(GX0+(a+b)/2,.15,24);r.renderOrder=10;pm.add(r);};wall(hb,GX0,24.28,0,24.28,0,9,M.vinyl,[[2,18,0,7,'o'],[19.5,27.5,0,7,'o']],null,.1);
const sec=(x0,x1)=>{for(let y=0;y<7;y+=1.75)B(gg,x0,23.9,x1,24.05,y,1.7,M.white);};sec(GX0+2,GX0+18);sec(GX0+19.5,GX0+27.5);
wall(gg,GX0,GZ0,0,GZ0,0,9,M.wall,[[12,15,0,6.8,'d']],pm,.45);wall(hb,GX0,GZ0-.28,0,GZ0-.28,0,9,M.vinyl,[[12,15,0,6.8,'o']],null,.1);
wall(gg,GX0,GZ0,GX0,24,0,9,M.wall,[[10,13,3.5,6.5,'w']],pm,.45);wall(hb,GX0-.28,GZ0,GX0-.28,24,0,9,M.vinyl,[[10,13,3.5,6.5,'o']],null,.1);
roof(G.roof,GX0,GZ0,-0.7,24,9.1,6,false,M.shing,.7);
stairs(gg,pm,-4,8.5,-0.3,11.5,0,YM-.1,'E','UP 4 steps');
// 2021 Airstream Interstate 24X 4x4 (Mercedes Sprinter 3500 4x4 chassis): ~24′4″ L × ~6′7″ W body (~8′4″ with mirrors) × ~9′7″ H (spec, verify) — parked behind the double door
{const ax0=GX0+6.6,ax1=ax0+6.6,az0=-1.4,az1=az0+24.3;const sil=S(0xe3e6e8,{roughness:.35,metalness:.25}),blk=S(0x15171a,{roughness:.6});
 B(gg,ax0,az0,ax1,az1-4.5,1.4,7.4,sil);B(gg,ax0+.1,az1-4.5,ax1-.1,az1-1.6,1.4,4.6,sil);B(gg,ax0+.15,az1-1.6,ax1-.15,az1,1.4,2.6,sil);
 const ws=new THREE.Mesh(new THREE.BoxGeometry(6.2,2.4,.1),S(0x1b2a33,{roughness:.05,metalness:.5}));ws.position.set((ax0+ax1)/2,6.5,az1-3.2);ws.rotation.x=-.5;gg.add(ws);
 B(gg,ax0+1,az0+4,ax1-1,az0+7,8.8,.8,M.white);B(gg,ax0+.2,az0+12,ax1-.2,az0+16,8.8,.25,blk);
 for(const z of [az0+3.5,az1-4.8])for(const x of [ax0-.1,ax1+.1]){const w=new THREE.Mesh(new THREE.CylinderGeometry(1.35,1.35,1,20),blk);w.rotation.z=Math.PI/2;w.position.set(x,1.35,z);gg.add(w);}
 B(gg,ax0-.05,az0+6,ax0,az0+18,3,2.2,blk);B(gg,ax1,az0+6,ax1+.05,az0+18,3,2.2,blk);
 info('2021 Airstream Interstate 24X 4x4 — in the 3-car garage (Clark confirmed fit)','own','Body ~24′4″ × 6′7″ (8′4″ mirrors) × ~9′7″ tall (Airstream spec — verify). Bay depth 27 ft leaves ~1.3 ft each end; behind the ~16 ft double door. Photos 2 and 13 show the door openings but not their height — measure the door height and opener rail vs the van\'s roof AC/solar.',[(ax0+ax1)/2,11,(az0+az1)/2],'garage');}
light(gg,-14,8,10,.35,30);B(G.roof,GX0,GZ0,0,24,9,.12,M.ceil);[[-21,4],[-7,4],[-21,17],[-7,17]].forEach(([x,z])=>can(G.roof,x,9,z));
info('Attached 3-car garage 28 × 27 (listing)','rec','Photos 2, 13: one ~16 ft double door + one ~8–9 ft single door (widths estimated), unfinished framing, concrete floor. Garage slab ~4 ft below the main floor (raised ranch), steps up into the kitchen.',[-14,13,10],'garage');
// ======================= OUTBUILDING → guest unit + fitness & recovery center =======================
// Existing (photos 3-8, 18): steel pole building, large overhead door + man door on the gable end; inside: open shop (photo 3), commercial-style kitchen (photo 4), two small bedrooms (5, 6), kitchenette/living (7), bath (8).
// Size not published: ~40 × 56 ft, ~14 ft eave (estimated from photos 3 and 18). Redo: modern barn — charcoal standing-seam steel, cedar gable accent, black-frame glazing (Samels barn treatment).
const ob=G.ob,po=G.pob,OW=40,OD=56,OE=14,OY=.3;const P=(u,v)=>[OX+u,OZ+v];
B(ob,OX,OZ,OX+OW,OZ+OD,0,OY,M.lvp,{ft:8});B(ob,OX+14,OZ+22,OX+OW,OZ+OD,OY,.03,M.rubber,{ft:4});B(ob,OX,OZ+34,OX+14,OZ+OD,OY,.03,M.rubber,{ft:4});
const OWL=(u0,v0,u1,v1,y0,h,m,gaps,pg,t)=>wall(ob,OX+u0,OZ+v0,OX+u1,OZ+v1,y0,h,m,gaps,pg,t);
const OEXT=(u0,v0,u1,v1,gaps,out)=>{OWL(u0,v0,u1,v1,OY,OE-OY,M.wall,gaps,po,.45);const o=out.map(v=>v*.3);wall(G.bldg,OX+u0+o[0],OZ+v0+o[1],OX+u1+o[0],OZ+v1+o[1],OY,OE-OY,M.obSteel,gaps.map(q=>q.slice(0,4).concat(['o'])),null,.1);};
OEXT(0,0,OW,0,[[4,10,3,7.5,'w'],[18,30,1,8,'w'],[33,37,3.5,7.5,'w']],[0,-1]);
OEXT(0,OD,OW,OD,[[4,7,0,7,'d'],[14,26,0,12,'o'],[30,38,2,10,'w']],[0,1]);
OEXT(0,0,0,OD,[[3,8,3.5,7.5,'w'],[14,17,0,7,'d'],[24,28,4,7,'w'],[40,48,2,10,'w']],[-1,0]);OEXT(OW,0,OW,OD,[[3,9,3.5,7.5,'w'],[14,19,3.5,7.5,'w'],[30,46,2,10,'w']],[1,0]);
for(let x=14;x<26;x+=.01){break;}
{const gd=new THREE.Mesh(new THREE.BoxGeometry(12,12,.08),GLASS);gd.position.set(OX+20,OY+6,OZ+OD+.05);ob.add(gd);for(let y=0;y<=12;y+=3)B(ob,OX+14,OZ+OD-.06,OX+26,OZ+OD+.12,OY+y-.07,.14,FRAME);for(let x=14;x<=26;x+=3)B(ob,OX+x-.07,OZ+OD-.06,OX+x+.07,OZ+OD+.12,OY,12,FRAME);}
roof(G.roof,OX,OZ,OX+OW,OZ+OD,OE,8,false,S(0x2b2e33,{roughness:.45,metalness:.5}),1.5);
B(G.bldg,OX+8,OZ+OD+.25,OX+32,OZ+OD+.45,OE+.2,6,M.cedar); // cedar gable accent
B(G.roof,OX,OZ,OX+OW,OZ+22,9.3,.12,M.ceil);B(G.roof,OX,OZ+22,OX+OW,OZ+OD,OE-.25,.1,S(0xf2f2f0));B(G.roof,OX,OZ+22,OX+14,OZ+34,9.3,.12,M.ceil);
// guest unit (north end, v 0-22): kitchen, living, entry/laundry, bath, bedroom — partitions 9 ft
const OI=(u0,v0,u1,v1,gaps)=>OWL(u0,v0,u1,v1,OY,9,M.wall,gaps,po,.33);
OI(0,12,40,12,[[14,22,0,8,'o'],[20.5,23.2,0,6.8,'d'],[30,32.8,0,6.8,'d']]);OI(18,12,18,22,[]);OI(26,12,26,22,[]);
OI(0,22,40,22,[[4,6.8,0,6.8,'d'],[15,18,0,6.8,'d'],[34,36.8,0,6.8,'d']]);OI(14,22,14,34,[[8,10.8,0,6.8,'d']]);OI(0,34,14,34,[]);
// kitchen (u 0-14) — white-oak cabinets + quartz, matching the main house refresh
const OK=(u0,v0,u1,v1)=>{B(ob,OX+u0,OZ+v0,OX+u1,OZ+v1,OY,2.9,M.oak);B(ob,OX+u0-.05,OZ+v0-.05,OX+u1+.05,OZ+v1+.05,OY+2.9,.13,M.quartz);};
OK(.3,.3,13,2.3);OK(.3,2.3,2.3,10);B(ob,OX+.35,OZ+8,OX+2.25,OZ+10.5,OY,6.5,M.steel);OK(6,5.5,11,8);B(ob,OX+.3,OZ+.25,OX+3.8,OZ+1.4,OY+4.6,2.8,M.oak);
for(const u of [7,9.5])gltf(ob,'bar_chair_round_01',OX+u-.7,OZ+8.2,OX+u+.7,OZ+9.6,OY,3.2,Math.PI);pendant(ob,OX+7.5,9.3,OY+6.8,OZ+6.8);pendant(ob,OX+9.8,9.3,OY+6.8,OZ+6.8);
// living (u 14-40, v 0-12)
gltf(ob,'sofa_02',OX+20,OZ+8.6,OX+28,OZ+11.4,OY,2.8,Math.PI);gltf(ob,'modern_coffee_table_01',OX+21.5,OZ+5.2,OX+26.5,OZ+7.6,OY,1.4);gltf(ob,'modern_arm_chair_01',OX+30,OZ+4.5,OX+33,OZ+7.5,OY,3,-Math.PI/2);gltf(ob,'potted_plant_02',OX+36,OZ+1,OX+38,OZ+3,OY,4);
// bath (u 18-26) and bedroom (u 26-40)
B(ob,OX+18.2,OZ+12.2,OX+25.8,OZ+21.8,OY+.01,.02,M.tileW);vanity(ob,OX+18.3,OZ+12.3,OX+21.5,OZ+14.2,OY);toilet(ob,OX+24.7,OZ+13,OY);shower(ob,OX+18.3,OZ+18,OX+22,OZ+21.8,OY);
B(ob,OX+31,OZ+15.4,OX+38,OZ+21.8,OY,2,S(0xd8d3c8));B(ob,OX+30.6,OZ+21.4,OX+38.4,OZ+21.8,OY,3.8,S(0x6b5a48));B(ob,OX+28.8,OZ+20,OX+30.3,OZ+21.6,OY,2,M.oak);B(ob,OX+38.6,OZ+19.5,OX+39.8,OZ+21.6,OY,2,M.oak);
B(ob,OX+1,OZ+13,OX+5.5,OZ+15.4,OY,3.2,M.white); // stacked laundry + bench in the entry
// recovery room (u 0-14, v 22-34): sauna, cold plunge, massage chair, rinse shower
{const sx0=OX+.5,sz0=OZ+22.5;B(ob,sx0,sz0,sx0+5.67,sz0+5.92,OY,7.92,M.cedar,{ft:3,item:info('Plunge "The Sauna" Standard 5′8″ × 5′11″ × 7′11″ (proposed)','prop','Cedar, glass front faces east into the recovery room. HUUM electric heater: ~240 V, 40–50 A circuit (verify).')});
 const gf=new THREE.Mesh(new THREE.BoxGeometry(.06,6.8,4.8),GLASS);gf.position.set(sx0+5.7,OY+3.6,sz0+2.96);ob.add(gf);}
B(ob,OX+7.8,OZ+22.6,OX+13.35,OZ+25.2,OY,2.17,M.white,{item:info('The Plunge cold plunge (owned #36) 66⅝ × 31½ × 26 in','own','Along the north partition, 2 ft from the rinse shower. Chiller on a dedicated ~12 A 120 V GFCI circuit; floor drain + slip-resistant floor.')});B(ob,OX+8.1,OZ+22.9,OX+13.05,OZ+24.9,OY+1.6,.6,M.water);
{const mc=S(0x2b2b2b,{roughness:.6});B(ob,OX+2,OZ+29.2,OX+4.67,OZ+32.6,OY,1.8,mc,{item:info('#1 Florida massage chair (size to verify)','own','~32 in W × 60 in D upright, ~75 in reclined (VERIFY). Placed with ≥3 ft clear behind and beside for recline. Climate-controlled room protects its electronics.')});B(ob,OX+2,OZ+32.2,OX+4.67,OZ+33.4,OY,4.2,mc);B(ob,OX+1.8,OZ+29.2,OX+2.2,OZ+32.6,OY,2.8,mc);B(ob,OX+4.47,OZ+29.2,OX+4.87,OZ+32.6,OY,2.8,mc);}
shower(ob,OX+10.6,OZ+30.6,OX+13.7,OZ+33.7,OY);
// gym (u 14-40, v 22-56 + u 0-14, v 34-56): owned Florida gear + proposed rings and GHD
const blk=S(0x1a1a1a,{roughness:.5}),gry=S(0x3a3a3a,{roughness:.5});
B(ob,OX+28,OZ+38,OX+36,OZ+46,OY,.08,S(0x5a4632));for(const[u,v] of [[30,40],[34,40],[30,44],[34,44]])B(ob,OX+u-.15,OZ+v-.15,OX+u+.15,OZ+v+.15,OY,7.5,blk);B(ob,OX+29.85,OZ+39.85,OX+34.15,OZ+40.15,OY+7.3,.2,blk);B(ob,OX+29.85,OZ+43.85,OX+34.15,OZ+44.15,OY+7.3,.2,blk);B(ob,OX+28.5,OZ+41.9,OX+35.5,OZ+42.1,OY+4.5,.1,M.steel);
info('Power rack + 8 × 8 platform (owned rack)','own','South-east of the gym, ≥3 ft clear on all sides; overhead door path kept open.',[OX+32,OY+10,OZ+42],'ob');
C(ob,OX+38,OY,OZ+48,.15,5.5,blk);for(let k=0;k<3;k++){const b=new THREE.Mesh(new THREE.CylinderGeometry(.05,.05,7.2,6),M.steel);b.position.set(OX+38,OY+1.5+k*1.5,OZ+48);b.rotation.z=Math.PI/2;b.rotation.y=k;ob.add(b);}
B(ob,OX+35.5,OZ+50,OX+39.5,OZ+52.5,OY,1,blk);for(let k=0;k<5;k++){const p=new THREE.Mesh(new THREE.CylinderGeometry(1.48,1.48,.25,24),k%2?S(0x1f5fbf):blk);p.rotation.x=Math.PI/2;p.position.set(OX+37.5,OY+2.4,OZ+50.3+k*.45);ob.add(p);}
B(ob,OX+1.5,OZ+36,OX+4.5,OZ+42,OY,.8,blk);B(ob,OX+1.5,OZ+41.4,OX+4.5,OZ+42,OY,4.6,gry);info('Xebex curved manual treadmill (owned #16) ~6 × 3 ft','own','Faces the west windows.',[OX+3,OY+7,OZ+39],'ob');
B(ob,OX+6.5,OZ+37,OX+8.5,OZ+41,OY,.06,M.rubber);B(ob,OX+7.3,OZ+37.3,OX+7.7,OZ+40.7,OY,3,blk);B(ob,OX+6.9,OZ+37.2,OX+8.1,OZ+38.4,OY+3,1.2,blk);info('Peloton bike + mat (owned #17, #19)','own','~4 × 2 ft.',[OX+7.5,OY+6.5,OZ+39],'ob');
B(ob,OX+10.3,OZ+36,OX+11.7,OZ+43,OY,1.2,gry);B(ob,OX+10.3,OZ+42.4,OX+11.7,OZ+43,OY,7,gry);info('EnergyFit rower / SkiErg combo (owned #21)','own','Rail ~7 ft, tower ~7 ft tall.',[OX+11,OY+9,OZ+40],'ob');
B(ob,OX+1,OZ+52,OX+9,OZ+54.5,OY,3,blk,{item:info('DB/KB rack, dumbbells, kettlebells (owned #25, #31, #32)','own','')});
B(ob,OX+22,OZ+39.5,OX+26,OZ+41,OY,1.5,blk);B(ob,OX+22,OZ+44.5,OX+26,OZ+46,OY,1.5,blk);
B(ob,OX+16,OZ+25.5,OX+22,OZ+28,OY,1.6,blk,{item:info('GHD (proposed new) ~6 × 2.5 ft','prop','')});B(ob,OX+16.2,OZ+26,OX+17,OZ+27.5,OY+1.6,1.5,S(0x333333));
{const ru=OX+21,rv=OZ+31;B(ob,OX+14.5,OZ+30.8,OX+27.5,OZ+31.2,OE-.6,.5,M.blk);for(const du of [-1,1]){C(ob,ru+du,OY+8,rv,.03,OE-.6-OY-8,S(0xd8c07a),6);const ring=new THREE.Mesh(new THREE.TorusGeometry(.45,.06,8,20),S(0x8a6a3a));ring.position.set(ru+du,OY+7.6,rv);ob.add(ring);}
 info('High rings (proposed new) from a truss-hung beam','prop','Strap anchor ~13 ft up (eave ~14 ft estimated) — room for kipping/muscle-ups; verify truss capacity.',[ru,OY+11,rv],'ob');}
B(ob,OX+36,OZ+25,OX+38.5,OZ+27.5,OY,2.5,S(0x5a4632));B(ob,OX+38,OZ+22.6,OX+39.8,OZ+24.4,OY,2.8,S(0x777b80));
[[7,6],[27,6],[22,17],[33,17],[7,28]].forEach(([u,v])=>can(G.roof,OX+u,9.3,OZ+v));
for(let u=17;u<40;u+=8)for(let v=26;v<56;v+=9){const l=new THREE.Mesh(new THREE.BoxGeometry(4,.1,.6),emis(0xf2f6ff));l.position.set(OX+u,OE-1.2,OZ+v);ob.add(l);}
[[7,6],[27,6],[22,17],[33,17],[7,28],[22,36],[32,48],[7,46]].forEach(([u,v])=>light(ob,OX+u,8.5,OZ+v,.55,24));
// ---------- plan labels ----------
const LS=1.0;const L=(g,t,x,z,y)=>label(g,t,x,(y||15),z,LS);
L(G.lmain,'KITCHEN\n~12×11 (est.)',6,6);L(G.lmain,'DINING\n~15×11 (est.)',19.5,8.5);L(G.lmain,'LIVING\n~21×13 (est.)',10,17.5);L(G.lmain,'PRIMARY\n~12×11 (est.)',44,5.5);
L(G.lmain,'PRI BATH',35.5,4.5);L(G.lmain,'HALL BATH',30,7);L(G.lmain,'LINEN',30,1.5);L(G.lmain,'OFFICE (BR3)\n~11×10',32.5,19);L(G.lmain,"MILAN (BR2)\n~12×10",44,19);
L(G.lmain,'HALL',40,12.5);L(G.lmain,'DECK ~20×12',18,-6);L(G.lmain,'3-CAR GARAGE 28×27\nAirstream 24X',-14,6);L(G.lmain,'▲ FRONT DOOR',24,27.5);L(G.lmain,'FOYER',24,22.5);
L(G.llower,'FAMILY ROOM + STEINWAY LOUNGE\n~26×14 (est.)',13,1.5);L(G.llower,'GUEST / ALEX\n~11×12',32.5,6);L(G.llower,'BATH',41,4.5);L(G.llower,'STOR.',47,5);
L(G.llower,'STORAGE / LAUNDRY\n(below-grade front)',10,19);L(G.llower,'UTILITY / MECH\n(photo 1)',44,19.5);L(G.llower,'FLEX',32.5,19.5);L(G.llower,'WALK-OUT ▼',6,-2.5);L(G.llower,'HALL',38,13.5);
L(G.lob,'GUEST KITCHEN',OX+6,OZ+4);L(G.lob,'LIVING',OX+27,OZ+3);L(G.lob,'ENTRY / LAUNDRY',OX+9,OZ+17);L(G.lob,'BATH',OX+22,OZ+16);L(G.lob,'BEDROOM\n14×10',OX+33,OZ+13.5);
L(G.lob,'RECOVERY\nsauna · plunge · massage',OX+7,OZ+28.5);L(G.lob,'GYM ~26×34 + 14×22\n(rubber floor, open to trusses)',OX+27,OZ+33.5);L(G.lob,'12 ft glass overhead door',OX+20,OZ+OD+2.5);
L(G.lob,'treadmill · bike · rower',OX+7,OZ+45);L(G.lob,'rack + platform',OX+32,OZ+47.5);L(G.lob,'GHD',OX+19,OZ+24.2);L(G.lob,'rings',OX+21,OZ+29.5);
// front door marker (3D, at the real entry on the south façade)
{const mk=new THREE.Group();const pin=new THREE.Mesh(new THREE.ConeGeometry(.8,1.8,16),new THREE.MeshBasicMaterial({color:0x3ccf6e,depthTest:false}));pin.rotation.x=Math.PI;pin.position.y=.9;mk.add(pin);mk.position.set(24,10.2,25.5);mk.renderOrder=12;G.pmain.add(mk);}
// north arrow in plans
function northArrow(g,x,z){const a=new THREE.Mesh(new THREE.ConeGeometry(1.4,4,3),new THREE.MeshBasicMaterial({color:0xd19a5b,depthTest:false}));a.rotation.x=-Math.PI/2;a.position.set(x,16,z);a.renderOrder=12;g.add(a);label(g,'N',x,16,z-3.8,1.4,'#d19a5b');}
northArrow(G.lmain,58,-10);northArrow(G.llower,56,-2);northArrow(G.lob,OX+46,OZ+2);
// ---------- camera / controls / viewpoints ----------
const controls=new THREE.OrbitControls(camera,canvas);controls.enableDamping=true;
const VP=[
 {id:'aerial',name:'Aerial — whole site',p:[-230,260,330],t:[-10,0,20],fov:50},
 {id:'hero',name:'Exterior hero (front)',p:[-52,7,82],t:[12,4,10],fov:50},
 {id:'rear',name:'Rear / walk-out',p:[60,10,-70],t:[20,0,8],fov:50},
 {id:'living',name:'Main: living → kitchen',p:[19.5,YM+5.3,22.5],t:[4,YM+3.2,3],fov:78},
 {id:'kitchen',name:'Kitchen',p:[19,YM+5.4,9.5],t:[3,YM+3,3],fov:75},
 {id:'bath',name:'Refreshed hall bath (from the hall)',p:[30.4,YM+5.3,13.4],t:[29.6,YM+2.6,4],fov:78},
 {id:'piano',name:'Lower: Steinway lounge',p:[24.6,YL+5.2,12.8],t:[10,YL+2.4,4],fov:80},
 {id:'garage',name:'Garage + Airstream',p:[-1.5,7.5,22.6],t:[-20,3.5,4],fov:85},
 {id:'ob_ext',name:'Outbuilding exterior',p:[62,10,128],t:[100,7,62],fov:52},
 {id:'ob_gym',name:'Fitness center (gym)',p:[OX+38.5,8,OZ+54.5],t:[OX+12,3,OZ+28],fov:80},
 {id:'ob_rec',name:'Recovery room',p:[OX+13,6.2,OZ+33.4],t:[OX+3,3,OZ+24],fov:85},
 {id:'ob_unit',name:'Outbuilding guest living/kitchen',p:[OX+36,6,OZ+10.8],t:[OX+4,3.2,OZ+3],fov:80},
 {id:'plan_main',name:'Plan: main level',plan:'main',b:[-34,-16,62,34]},
 {id:'plan_lower',name:'Plan: lower level',plan:'lower',b:[-6,-8,62,30]},
 {id:'plan_outbuilding',name:'Plan: outbuilding',plan:'ob',b:[OX-6,OZ-4,OX+52,OZ+OD+6]}];
let ortho=null,active=camera;
function setPlan(lv,b){const vis={pmain:lv==='main',plower:lv==='lower',pob:lv==='ob'};for(const k in vis)G[k].visible=vis[k];G.lmain.visible=lv==='main'&&(LBLQ||!CLEAN);G.llower.visible=lv==='lower'&&(LBLQ||!CLEAN);G.lob.visible=lv==='ob'&&(LBLQ||!CLEAN);
 G.roof.visible=false;G.main.visible=lv!=='lower';G.garage.visible=lv==='main';if(lv==='lower'){G.bldg.visible=false;}G.site.visible=true;
 const w=b[2]-b[0],h=b[3]-b[1],asp=innerWidth/innerHeight;let hw=w/2,hh=h/2;if(hw/hh<asp)hw=hh*asp;else hh=hw/asp;ortho=new THREE.OrthographicCamera(-hw,hw,hh,-hh,1,1000);ortho.up.set(0,0,-1);const cx=(b[0]+b[2])/2,cz=(b[1]+b[3])/2;ortho.position.set(cx,300,cz);ortho.lookAt(cx,0,cz);active=ortho;
 if(lv==='lower'){/* hide the stoop/deck so the walk-out reads */}}
function goVP(id){const v=VP.find(q=>q.id===id);if(!v)return;for(const k of ['pmain','plower','pob','lmain','llower','lob'])G[k].visible=false;G.roof.visible=document.getElementById('roofT')?document.getElementById('roofT').checked:true;G.main.visible=G.bldg.visible=G.garage.visible=true;active=camera;
 if(v.plan){setPlan(v.plan,v.b);return;}camera.fov=v.fov||55;camera.position.set(...v.p);controls.target.set(...v.t);camera.updateProjectionMatrix();controls.update();}
window.__refresh=()=>{G.roof.visible=document.getElementById('roofT').checked;};
// UI
{const vb=document.getElementById('views');if(vb)VP.forEach(v=>{const b=document.createElement('button');b.textContent=v.name;b.onclick=()=>goVP(v.id);vb.appendChild(b);});
 const lg=document.getElementById('legend');if(lg){const li=a=>a.map(i=>`<li>${i.name} <span class="tag ${(TAGS[i.tag]||TAGS.inf)[1]}">${(TAGS[i.tag]||TAGS.inf)[0]}</span></li>`).join('');lg.innerHTML=`<b>Plan colors</b><ul><li><span style="color:#ff8c1a">■</span> doors (swing arcs)</li><li><span style="color:#2f7fe0">■</span> stairs, arrow = up</li><li><span style="color:#3ccf6e">▼</span> front door (real entry)</li></ul><b>Items</b><ul>${li(items)}</ul>`;}
 const ly=document.getElementById('layers');if(ly)['site','bldg','main','lower','garage','ob'].forEach(k=>{const l=document.createElement('label');l.className='t';l.innerHTML=`<input type="checkbox" checked> ${LAYERS[k]}`;l.firstChild.onchange=e=>G[k].visible=e.target.checked;ly.appendChild(l);});}
const ray=new THREE.Raycaster(),mv=new THREE.Vector2();canvas.addEventListener('click',e=>{const r=canvas.getBoundingClientRect();mv.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(mv,active);const h=ray.intersectObjects(pick,false)[0];const el=document.getElementById('info');if(h&&el){const it=h.object.userData.item,t=TAGS[it.tag]||TAGS.inf;el.innerHTML=`<b>${it.name}</b> <span class="tag ${t[1]}">${t[0]}</span><div style="margin-top:6px">${it.text}</div>`;el.style.display='block';}});
function resize(){const el=canvas.parentElement,w=el.clientWidth||innerWidth,h=el.clientHeight||innerHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}addEventListener('resize',resize);resize();
// HDRI environment (Samels: Poly Haven sky_1k.hdr, black-PMREM guard)
const hdr=new Promise(res=>{if(!THREE.RGBELoader||Q.get('hdri')==='0')return res();new THREE.RGBELoader().setDataType(THREE.UnsignedByteType).load('assets/hdri/sky_1k.hdr',t=>{try{const pm=new THREE.PMREMGenerator(renderer);const rt=pm.fromEquirectangular(t);t.dispose();pm.dispose();scene.environment=rt.texture;scene.traverse(o=>{if(o.isMesh&&o.material&&o.material.isMeshStandardMaterial)o.material.envMapIntensity=.3;});}catch(e){}res();},undefined,()=>res());});
goVP(VPQ||'aerial');
function loop(){requestAnimationFrame(loop);if(active===camera)controls.update();renderer.render(scene,active);}loop();
setTimeout(()=>Promise.all(pend.concat([hdr])).then(()=>setTimeout(()=>{window.__ready=true;},1500)),300);
window.__model={VP,goVP,G,items};
})();
