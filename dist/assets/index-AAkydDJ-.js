import*as e from"https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.module.js";(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const t of document.querySelectorAll('link[rel="modulepreload"]'))s(t);new MutationObserver(t=>{for(const o of t)if(o.type==="childList")for(const r of o.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&s(r)}).observe(document,{childList:!0,subtree:!0});function a(t){const o={};return t.integrity&&(o.integrity=t.integrity),t.referrerPolicy&&(o.referrerPolicy=t.referrerPolicy),t.crossOrigin==="use-credentials"?o.credentials="include":t.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function s(t){if(t.ep)return;t.ep=!0;const o=a(t);fetch(t.href,o)}})();let c,l,d,h,p,m=[],u=[],f;document.addEventListener("DOMContentLoaded",i=>{window.disableTHREEMode=function(){window.three_mode_initialized=!1},window.initTHREEMode=function(){window.three_mode_initialized=!0,x(),M()}});async function x(){for(let i=0;i<10;i++){u[i]=[];for(let n=0;n<10;n++){u[i][n]=[];for(let a=0;a<10;a++){let s=Math.random(),t=Math.random(),o=Math.random();u[i][n][a]=new e.Vector3(s,t,o)}}}g()}function g(){c=new e.PerspectiveCamera(70,window.innerWidth/window.innerHeight,.1,100),c.position.z=2,l=new e.Scene,f=new e.Group,f.add(new e.ArrowHelper(new e.Vector3(1,0,0),new e.Vector3(0,0,0),1,16711680)),f.add(new e.ArrowHelper(new e.Vector3(0,1,0),new e.Vector3(0,0,0),1,65280)),f.add(new e.ArrowHelper(new e.Vector3(0,0,1),new e.Vector3(0,0,0),1,255)),l.add(f),u.forEach((t,o)=>{t.forEach((r,w)=>{r.forEach((y,F)=>{let S=new e.ArrowHelper(y,new e.Vector3(o,w,F),.5,65280);l.add(S)})})});{const t=new e.SphereGeometry(.01,32,32);new e.MeshBasicMaterial({color:16777215});for(let o=0;o<1e3;o++){const r=new e.Vector3(e.MathUtils.randFloatSpread(2),e.MathUtils.randFloatSpread(2),e.MathUtils.randFloatSpread(2)),w=new e.Mesh(t,new e.MeshBasicMaterial({color:16777215}));w.castShadow=!0,w.receiveShadow=!0,w.position.set(r.x,r.y,r.z),l.add(w),m.push(w)}}const i=new e.DirectionalLight(16761035,1);i.position.set(1,1,1),i.castShadow=!0,l.add(i);const n=new e.DirectionalLight(16753920,1);n.position.set(-1,-1,-1),n.target.position.set(0,0,0),n.castShadow=!0,new e.TextureLoader().load("res/crate.gif");let a=new e.BoxGeometry(1,1,1),s=new e.MeshPhongMaterial({color:65280,transparent:!0,opacity:.5});h=new e.Mesh(a,s),h.castShadow=!0,h.receiveShadow=!0,l.add(h),a=new e.SphereGeometry(.5,32,32),s=new e.MeshPhongMaterial({color:16711680}),p=new e.Mesh(a,s),p.castShadow=!0,p.receiveShadow=!0,l.add(p),d=new e.WebGLRenderer({antialias:!0,alpha:!0}),d.setClearColor(0,0),d.setPixelRatio(window.devicePixelRatio),d.setSize(window.innerWidth,window.innerHeight),d.shadowMap.enabled=!0,d.shadowMap.enabled=!0,i.castShadow=!0,h.castShadow=!0,h.receiveShadow=!0,p.castShadow=!0,p.receiveShadow=!0,d.shadowMap.type=e.PCFSoftShadowMap,document.body.appendChild(d.domElement),console.warn("append renderer.domElement",d.domElement),d.domElement.id="threejscanvas",new e.PlaneGeometry(100,100,32),window.addEventListener("resize",z)}function z(){c.aspect=window.innerWidth/window.innerHeight,c.updateProjectionMatrix(),d.setSize(window.innerWidth,window.innerHeight)}let E=.001,v=Math.PI;function M(){if(!c)return;let i=Math.abs(window.innerWidth/2-window.mouseX);i*=window.mouseX<window.innerWidth/2?1:-1;let n=i/(window.innerWidth/2);n=n*1e-9,c.position.x=2*Math.sin(Date.now()*.001*n)*(1/window.zoom),c.position.z=2*Math.cos(Date.now()*.001*n)*(1/window.zoom),c.lookAt(0,0,0),m.forEach(t=>{if(typeof noise<"u"){let o=.1,r=.05,w=noise(t.position.x,t.position.y,t.position.z,Date.now()*.0015);t.position.x+=w*o-r,t.position.y+=w*o-r,t.position.z+=w*o-r,t.material.color.setRGB(Math.abs(t.position.x),Math.abs(t.position.y),Math.abs(t.position.z))}}),c.fov=window.fov;let a=Date.now()*E,s=1;h.position.y=Math.sin(a*s),p.position.y=Math.sin((a+v)*s);try{d.render(l,c)}catch(t){console.error(t)}window.three_mode_initialized&&requestAnimationFrame(M)}
