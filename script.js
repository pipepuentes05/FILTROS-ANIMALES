import {FILTERS,drawFilter,drawPortrait} from './filters.js';
import {FaceDetector,FaceSmoother,ExpressionState,SETTINGS,clamp} from './face-tracking.js';
import {PhotoStore,FolderStorage,MAX_PHOTOS} from './capture.js';
const $=id=>document.getElementById(id);
const video=$('video'),canvas=$('composite'),ctx=canvas.getContext('2d',{alpha:false}),smoother=new FaceSmoother(),expression=new ExpressionState(),photos=new PhotoStore(),folder=new FolderStorage();
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
let selected=1,stream=null,active=false,starting=false,session=0,lastFrame=0,lastInference=0,lastVideoTime=-1,lastSeen=-Infinity,lastResponse=0,lastJaw=0,faceCount=0;
let capturing=false,countdownRunning=false,captureGeneration=0,currentPhoto=null,previewCards=[],heroTime=0,renderToken=0,permanentDisposed=false;
let sound=false,audio=null;
const detector=new FaceDetector({onLoading:text=>message(text),onResult:receiveFaces,onError:detail=>{stopCamera(false);message(/activeTexture|WebGL|GL context/i.test(detail)?'El detector requiere WebGL disponible. Revisa la aceleración gráfica de Chrome o Edge y reinicia el navegador.':'El detector se interrumpió. Reintenta con ACTIVAR CÁMARA.');}});
function message(text){if($('message').textContent!==text)$('message').textContent=text;}
function errorText(error){const map={NotAllowedError:'Permiso de cámara denegado. Habilítalo en el icono junto a la dirección y vuelve a intentar.',NotFoundError:'No encontramos una webcam. Conéctala y reintenta.',NotReadableError:'La cámara está ocupada o no responde. Cierra Zoom, Teams u otras aplicaciones que la estén usando.',OverconstrainedError:'La cámara no admite esta configuración. Prueba con otra webcam.',MODEL_LOAD:'No se pudo cargar el modelo. Comprueba internet y el acceso a jsDelivr y Google Storage.',MODEL_TIMEOUT:'La carga tardó demasiado. Comprueba internet y vuelve a intentar.',SecurityError:'El navegador bloqueó la cámara. Usa localhost o HTTPS.'};return map[error.name]||map[error.message]||'No pudimos iniciar la cámara. Abre el proyecto con Live Server en Chrome o Edge y vuelve a intentar.';}
async function enableAudio(){try{audio??=new(window.AudioContext||window.webkitAudioContext)();await audio.resume();return true;}catch{message('El audio no está disponible. Puedes usar la cámara sin sonido.');return false;}}
function shutterSound(){if(!sound||audio?.state!=='running')return;const t=audio.currentTime,o=audio.createOscillator(),gain=audio.createGain();o.type='triangle';o.frequency.setValueAtTime(1400,t);o.frequency.exponentialRampToValueAtTime(240,t+.065);gain.gain.setValueAtTime(.0001,t);gain.gain.exponentialRampToValueAtTime(.05,t+.009);gain.gain.exponentialRampToValueAtTime(.0001,t+.09);o.connect(gain);gain.connect(audio.destination);o.start(t);o.stop(t+.10);}
$('sound').onclick=async()=>{if(!sound&&!await enableAudio())return;sound=!sound;$('sound').textContent=sound?'SONIDO ON':'SONIDO OFF';$('sound').setAttribute('aria-pressed',String(sound));};
let timerEnabled=false;
$('timer').onclick=()=>{timerEnabled=!timerEnabled;$('timer').textContent=timerEnabled?'TIMER 3s':'TIMER OFF';$('timer').setAttribute('aria-pressed',String(timerEnabled));cancelCountdown();};
function updateControls(){
 $('start').disabled=starting||active; $('stop').disabled=!active&&!starting;
 $('shutter').disabled=!active||capturing||document.hidden||photos.photos.length>=MAX_PHOTOS;
 $('shutter').setAttribute('aria-label',countdownRunning?'Cancelar cuenta regresiva':'Tomar foto');
 $('lastPhoto').disabled=photos.photos.length===0;
 $('folderPhoto').disabled=!folder.handle||!currentPhoto;
}
function setFilter(index){selected=(index+FILTERS.length)%FILTERS.length;expression.reset();lastJaw=0;cancelCountdown();const filter=FILTERS[selected];
 $('filterName').textContent=filter.name;$('filterTag').textContent=filter.tag;$('filterDescription').textContent=filter.description;$('filterAction').textContent=filter.action;$('filterNumber').textContent=selected===0?'SIN EFECTO':`${String(selected).padStart(2,'0')} / 08`;
 document.querySelectorAll('.filter-item').forEach((button,i)=>button.setAttribute('aria-pressed',String(i===selected)));
 const strip=$('filterList'),thumb=strip.children[selected];if(thumb){const target=thumb.offsetLeft-strip.offsetLeft-(strip.clientWidth-thumb.clientWidth)/2;strip.scrollTo({left:target,behavior:reduced.matches?'instant':'smooth'});}
 drawPortrait($('heroAnimal'),filter.id,.5,heroTime);updateControls();
}
function initFilters(){
 FILTERS.forEach((filter,i)=>{
  const button=document.createElement('button');button.className='filter-item';button.type='button';button.setAttribute('aria-label',`Seleccionar ${filter.name}`);button.setAttribute('aria-pressed',String(i===selected));
  const thumb=document.createElement('canvas');thumb.width=180;thumb.height=180;thumb.setAttribute('aria-hidden','true');button.appendChild(thumb);
  if(filter.id==='none'){const c=thumb.getContext('2d');c.strokeStyle='#b4bda7';c.lineWidth=2;c.beginPath();c.arc(90,90,39,0,Math.PI*2);c.moveTo(63,117);c.lineTo(117,63);c.stroke();}else drawPortrait(thumb,filter.id,.25,0);
  const label=document.createElement('span');label.textContent=filter.name;button.appendChild(label);button.onclick=()=>setFilter(i);$('filterList').appendChild(button);
 });
 for(const filter of FILTERS.slice(1)){
  const card=document.createElement('div');card.className='preview-card';const c=document.createElement('canvas');c.width=440;c.height=440;c.setAttribute('aria-label',`Ilustración animada: ${filter.name}`);card.appendChild(c);const name=document.createElement('span');name.textContent=filter.name;const desc=document.createElement('small');desc.textContent=filter.action;card.append(name,desc);$('previewGrid').appendChild(card);previewCards.push({canvas:c,id:filter.id});
 }
 setFilter(selected);
}
async function startCamera(){
 if(active||starting)return;
 if(!window.isSecureContext||!navigator.mediaDevices?.getUserMedia){message('Abre index.html con Live Server en localhost o HTTPS. No funciona abriéndolo con doble clic.');return;}
 starting=true;const token=++session;$('loadingSpinner').hidden=false;message('Preparando tu cámara animal…');updateControls();
 try{
  await detector.init();if(token!==session)return;
  message('Acepta el permiso de cámara del navegador.');
  const acquired=await navigator.mediaDevices.getUserMedia({video:{width:{ideal:1280},height:{ideal:960},facingMode:'user'},audio:false});
  if(token!==session){acquired.getTracks().forEach(t=>t.stop());return;}
  stream=acquired;video.srcObject=acquired;await video.play();if(token!==session)return;
  if(!video.videoWidth||!video.videoHeight)throw new Error('EMPTY_VIDEO');
  canvas.width=Math.min(video.videoWidth,1920);canvas.height=Math.round(canvas.width*video.videoHeight/video.videoWidth);$('stage').style.aspectRatio=`${canvas.width} / ${canvas.height}`;
  smoother.reset();expression.reset();lastSeen=-Infinity;lastFrame=performance.now();lastResponse=lastFrame;lastInference=0;lastVideoTime=-1;faceCount=0;lastJaw=0;
  stream.getVideoTracks()[0].onended=()=>{stopCamera(false);message('Se desconectó la cámara. Conéctala y pulsa ACTIVAR CÁMARA.');};
  active=true;starting=false;$('loadingSpinner').hidden=true;$('placeholder').hidden=true;$('liveDot').classList.add('on');$('liveStatus').textContent='EN VIVO';$('cameraFormat').textContent=`${canvas.width} × ${canvas.height} / ESPEJO`;message('Busca buena luz y centra tu rostro. Abre la boca para jugar.');updateControls();
 }catch(error){if(token!==session||error.message==='CANCELLED')return;stopCamera(false);message(errorText(error));}
}
function stopCamera(showMessage=true){
 session++;cancelCountdown();active=false;starting=false;stream?.getTracks().forEach(t=>t.stop());stream=null;video.srcObject=null;detector.stop();smoother.reset();expression.reset();faceCount=0;lastSeen=-Infinity;lastJaw=0;
 $('loadingSpinner').hidden=true;$('placeholder').hidden=false;$('faceHint').hidden=true;$('liveDot').classList.remove('on');$('liveStatus').textContent='CÁMARA OFF';$('cameraFormat').textContent='IMAGEN EN ESPEJO';
 ctx.fillStyle='#171d18';ctx.fillRect(0,0,canvas.width,canvas.height);if(showMessage)message('Cámara detenida. Tus fotos de sesión siguen aquí.');updateControls();
}
$('start').onclick=startCamera;$('stop').onclick=()=>stopCamera();
function receiveFaces(data){
 if(!active||document.hidden)return;const now=performance.now();lastResponse=now;
 if(now-data.timestamp>600){faceCount=0;return;}
 faceCount=data.faces.length;
 if(faceCount===1){const pose=smoother.update(data.faces[0],canvas.width,canvas.height,now);lastSeen=now;lastJaw=data.jaw?.[0]??pose.fallbackJaw;}
 else lastJaw=0;
}
function faceOpacity(now){const age=now-lastSeen;return clamp(1-(age-SETTINGS.lossGrace)/SETTINGS.lossFade);}
function renderComposite(now,dt){
 if(!active||video.readyState<2)return;
 ctx.save();ctx.setTransform(-1,0,0,1,canvas.width,0);ctx.drawImage(video,0,0,canvas.width,canvas.height);ctx.restore();
 const stale=now-lastResponse>450;if(stale)faceCount=0;
 const visible=faceOpacity(now),hasFace=faceCount===1&&!stale;
 expression.update(hasFace?lastJaw:0,dt,now);
 if(visible>0&&smoother.pose&&faceCount<=1){ctx.save();ctx.globalAlpha=visible;drawFilter(ctx,FILTERS[selected].id,smoother.pose,expression.animation(now,reduced.matches));ctx.restore();}
 if(visible===0){smoother.reset();expression.reset();}
 const showHint=selected!==0&&!hasFace;$('faceHint').hidden=!showHint;
 if(showHint)$('faceHint').textContent=faceCount>1?'Una persona a la vez, por favor.':'Centra tu rostro en la cámara';
}
function render(now){
 if(permanentDisposed)return;const dt=Math.min(.1,(now-(lastFrame||now))/1000);lastFrame=now;
 if(!document.hidden){
  if(active){renderComposite(now,dt);if(now-lastInference>90&&video.readyState>=2&&video.currentTime!==lastVideoTime&&!detector.busy){lastInference=now;lastVideoTime=video.currentTime;detector.send(video,now);}}
  else if(now-heroTime>45){heroTime=now;drawPortrait($('heroAnimal'),FILTERS[selected].id,reduced.matches?.25:(Math.sin(now*.0018)+1)*.38,now);}
  if($('previewDialog').open){for(const card of previewCards)drawPortrait(card.canvas,card.id,reduced.matches?.35:(Math.sin(now*.0018)+1)*.42,now);}
 }
 renderToken=requestAnimationFrame(render);
}
function cancelCountdown(){captureGeneration++;countdownRunning=false;$('countdown').hidden=true;$('countdown').textContent='';updateControls();}
function sleep(ms){return new Promise(resolve=>setTimeout(resolve,ms));}
async function shoot(){
 if(countdownRunning){cancelCountdown();message('Cuenta regresiva cancelada.');return;}
 if(!active||capturing||photos.photos.length>=MAX_PHOTOS)return;
 const token=++captureGeneration;
 if(timerEnabled){countdownRunning=true;updateControls();for(let n=3;n>0;n--){if(token!==captureGeneration||!active||document.hidden)return;$('countdown').hidden=false;$('countdown').textContent=String(n);await sleep(1000);}if(token!==captureGeneration||!active||document.hidden)return;countdownRunning=false;$('countdown').hidden=true;}
 if(token!==captureGeneration||!active)return;
 capturing=true;updateControls();
 try{
  // No render call here: capture the exact composite frame already shown to the user.
  const pending=photos.capture(canvas,FILTERS[selected]);shutterSound();if(!reduced.matches){$('flash').classList.remove('fire');void $('flash').offsetWidth;$('flash').classList.add('fire');}
  const photo=await pending;
  if(token!==captureGeneration||!active){photos.remove(photo.id);return;}
  renderGallery();showPhoto(photo.id);message(photos.photos.length>=MAX_PHOTOS?'Llegaste a 20 fotos. Guarda tus favoritas y quita alguna de la sesión para seguir.':'Foto capturada. Pulsa GUARDAR FOTO para descargarla.');
  if(folder.auto&&folder.handle){try{const name=await folder.save(photo);message(`Foto guardada en ${name}.`);$('photoInfo').textContent=`Guardada en ${name} · ${photo.width} × ${photo.height} px`;}catch(error){folder.auto=false;$('autoSave').checked=false;const text=`No se pudo guardar en carpeta. ${error.message} La foto sigue en tu galería.`;message(text);if(currentPhoto?.id===photo.id)$('photoInfo').textContent=text;}}
 }catch(error){message(error.message||'No pudimos capturar la foto. Vuelve a intentar.');}
 finally{capturing=false;updateControls();}
}
$('shutter').onclick=shoot;
function showPhoto(id){const p=photos.get(id);if(!p)return;currentPhoto=p;$('photoPreview').src=p.url;$('photoTitle').textContent=`Tu momento ${p.filter.toLowerCase()}.`;$('photoInfo').textContent=`${p.width} × ${p.height} px · PNG · ${p.date.toLocaleString()}`;if($('galleryDialog').open)$('galleryDialog').close();if(!$('photoDialog').open)$('photoDialog').showModal();updateControls();}
function closePhoto(){if($('photoDialog').open)$('photoDialog').close();}
$('closePhoto').onclick=closePhoto;$('photoDialog').addEventListener('close',()=>{currentPhoto=null;$('photoPreview').removeAttribute('src');updateControls();});
$('downloadPhoto').onclick=()=>{if(!currentPhoto)return;photos.download(currentPhoto);message('Descarga solicitada. Revisa Descargas o la ubicación elegida en tu navegador.');};
$('folderPhoto').onclick=async()=>{const photo=currentPhoto;if(!photo||!folder.handle)return;try{if(!await folder.authorize())throw new Error('No se autorizó la escritura. Usa GUARDAR FOTO para descargarla.');const name=await folder.save(photo);message(`Foto guardada en ${name}.`);if(currentPhoto?.id===photo.id)$('photoInfo').textContent=`Guardada en ${name} · ${photo.width} × ${photo.height} px`;}catch(error){const text=error.message||'No se pudo escribir en la carpeta. La descarga normal sigue disponible.';message(text);if(currentPhoto?.id===photo.id)$('photoInfo').textContent=text;}};
function removePhoto(id){if(currentPhoto?.id===id)closePhoto();photos.remove(id);renderGallery();message('Foto retirada de esta sesión. Los archivos que guardaste permanecen en tu computador.');}
$('deletePhoto').onclick=()=>{if(currentPhoto)removePhoto(currentPhoto.id);};
function renderGallery(){
 const items=photos.photos;$('photoCount').textContent=String(items.length);$('galleryEmpty').hidden=items.length>0;$('galleryGrid').replaceChildren();
 for(const photo of [...items].reverse()){
  const card=document.createElement('article');card.className='gallery-item fresh';const open=document.createElement('button');open.className='gallery-image';open.setAttribute('aria-label',`Abrir foto ${photo.filter}`);const img=document.createElement('img');img.src=photo.thumbnail;img.alt=`Foto con filtro ${photo.filter}`;open.appendChild(img);open.onclick=()=>showPhoto(photo.id);
  const info=document.createElement('div');info.className='gallery-info';const label=document.createElement('span');label.textContent=photo.filter;const time=document.createElement('span');time.textContent=photo.date.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});info.append(label,time);
  const actions=document.createElement('div');actions.className='actions';for(const [text,fn] of [['GUARDAR',()=>photos.download(photo)],['QUITAR',()=>removePhoto(photo.id)]]){const b=document.createElement('button');b.textContent=text;b.onclick=fn;actions.appendChild(b);}card.append(open,info,actions);$('galleryGrid').appendChild(card);
 }
 const last=items.at(-1);$('lastImage').hidden=!last;$('lastPhoto').querySelector('span').hidden=!!last;if(last)$('lastImage').src=last.thumbnail;else $('lastImage').removeAttribute('src');updateControls();
}
$('lastPhoto').onclick=()=>{const last=photos.photos.at(-1);if(last)showPhoto(last.id);};
$('galleryOpen').onclick=()=>{cancelCountdown();$('galleryDialog').showModal();};$('closeGallery').onclick=()=>$('galleryDialog').close();
$('previewOpen').onclick=()=>{cancelCountdown();$('previewDialog').showModal();};$('closePreview').onclick=()=>$('previewDialog').close();
function folderUI(){const connected=!!folder.handle;$('folderInfo').hidden=!connected;$('folderName').textContent=folder.handle?.name||'';$('autoSave').checked=folder.auto;$('chooseFolder').innerHTML=connected?'CAMBIAR CARPETA <span>+</span>':'ELEGIR CARPETA <span>+</span>';updateControls();}
$('chooseFolder').onclick=async()=>{if(!folder.supported){message('Este navegador no permite elegir carpetas. Usa GUARDAR FOTO para descargar.');return;}try{const name=await folder.choose();folderUI();message(`Carpeta elegida: ${name}. El guardado automático sigue apagado.`);}catch(error){message(error.name==='AbortError'?'Selección cancelada. Puedes seguir descargando tus fotos.':'No se pudo autorizar la carpeta. Usa GUARDAR FOTO.');}};
$('disconnectFolder').onclick=()=>{folder.disconnect();folderUI();message('Carpeta desconectada. Puedes seguir descargando fotos.');};
$('autoSave').onchange=async()=>{if(!$('autoSave').checked){folder.auto=false;message('Guardado automático apagado.');return;}const handle=folder.handle;try{const allowed=await folder.authorize();if(handle!==folder.handle)return;folder.auto=allowed&&$('autoSave').checked;$('autoSave').checked=folder.auto;message(folder.auto?'Próximas capturas: se guardarán en la carpeta que autorizaste.':'No se autorizó el guardado automático. Puedes descargar manualmente.');}catch{folder.auto=false;$('autoSave').checked=false;message('No se pudo autorizar la carpeta. Puedes descargar tus fotos manualmente.');}};
$('fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await $('stage').requestFullscreen();}catch{message('Tu navegador no permite ampliar la cámara en este contexto.');}};
// Space captures only when focus is not already on an interactive element.
document.addEventListener('keydown',event=>{if(document.querySelector('dialog[open]')||/INPUT|TEXTAREA|SELECT/.test(event.target.tagName))return;if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();setFilter(selected+(event.key==='ArrowRight'?1:-1));}if(event.code==='Space'&&!['BUTTON','A','SUMMARY'].includes(event.target.tagName)){event.preventDefault();shoot();}});
document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelCountdown();smoother.reset();expression.reset();lastSeen=-Infinity;lastJaw=0;}updateControls();});
window.addEventListener('pagehide',()=>{stopCamera(false);photos.dispose();folder.disconnect();if(audio)audio.close();permanentDisposed=true;cancelAnimationFrame(renderToken);});
window.addEventListener('pageshow',event=>{if(event.persisted)location.reload();});
initFilters();renderGallery();
if(!folder.supported){$('chooseFolder').disabled=true;$('folderHint').textContent='Aquí puedes guardar con la descarga normal. Para elegir carpeta usa Chrome o Edge de escritorio.';}
if(!window.isSecureContext)message('Para usar la webcam, abre este proyecto con Live Server en localhost o con HTTPS.');
renderToken=requestAnimationFrame(render);
