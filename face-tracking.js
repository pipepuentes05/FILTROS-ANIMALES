export const SETTINGS={mouthOpen:.22,mouthClose:.12,confirmMs:85,expressionTau:.065,poseTau:.055,lossGrace:180,lossFade:170,frogCooldown:900,frogDuration:630};
export const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
export const smoothAlpha=(dt,tau)=>1-Math.exp(-Math.max(0,dt)/tau);
export function angleLerp(a,b,alpha){let delta=(b-a+Math.PI*3)%(Math.PI*2)-Math.PI;return a+delta*alpha;}
export class ExpressionState{
 constructor(){this.reset();}
 reset(){this.amount=0;this.open=false;this.candidateAt=null;this.frogAt=-Infinity;this.lastFrog=-Infinity;}
 update(value,dt,now){
  this.amount+=(clamp((value-.06)/.52)-this.amount)*smoothAlpha(Math.min(dt,.15),SETTINGS.expressionTau);
  let rising=false;
  if(!this.open&&value>SETTINGS.mouthOpen){if(this.candidateAt===null)this.candidateAt=now;if(now-this.candidateAt>=SETTINGS.confirmMs){this.open=true;rising=true;this.candidateAt=null;}}
  else if(this.open&&value<SETTINGS.mouthClose){this.open=false;this.candidateAt=null;}
  else if(!this.open)this.candidateAt=null;
  if(rising&&now-this.lastFrog>SETTINGS.frogCooldown){this.frogAt=now;this.lastFrog=now;}
  return rising;
 }
 animation(now,reduced=false){const t=(now-this.frogAt)/SETTINGS.frogDuration;let frog=0;if(t>=0&&t<1){frog=t<.34?Math.sin((t/.34)*Math.PI/2):Math.pow(Math.cos(((t-.34)/.66)*Math.PI/2),2);}return {amount:this.amount,open:this.open,frog,time:now,reduced};}
}
export function derivePose(face,width,height){
 const p=index=>({x:(1-face[index].x)*width,y:face[index].y*height});
 const eyes=[p(33),p(263)].sort((a,b)=>a.x-b.x),nose=p(1),a=p(234),b=p(454),top=p(10),up=p(13),down=p(14);
 const eyeDist=Math.hypot(eyes[1].x-eyes[0].x,eyes[1].y-eyes[0].y);
 const roll=Math.atan2(eyes[1].y-eyes[0].y,eyes[1].x-eyes[0].x);
 const mouth={x:(up.x+down.x)/2,y:(up.y+down.y)/2};
 const center={x:(eyes[0].x+eyes[1].x)/2,y:(eyes[0].y+eyes[1].y)/2};
 const yaw=clamp(((nose.x-center.x)*Math.cos(roll)+(nose.y-center.y)*Math.sin(roll))/Math.max(eyeDist,1)*1.2,-.6,.6);
 const gap=Math.hypot(up.x-down.x,up.y-down.y)/Math.max(eyeDist,1);
 return {nose,mouth,top,eyeL:eyes[0],eyeR:eyes[1],width:Math.max(40,Math.hypot(a.x-b.x,a.y-b.y)*1.05),roll,yaw,fallbackJaw:clamp((gap-.025)*2.2)};
}
export class FaceSmoother{
 constructor(){this.reset();}
 reset(){this.pose=null;this.lastTime=null;}
 update(face,w,h,now){const target=derivePose(face,w,h);const dt=this.lastTime===null?.1:(now-this.lastTime)/1000;this.lastTime=now;
 if(!this.pose||dt>.6){this.pose=target;return this.pose;}
 const a=smoothAlpha(Math.min(.2,dt),SETTINGS.poseTau);for(const key of ['nose','mouth','top','eyeL','eyeR']){this.pose[key].x+=(target[key].x-this.pose[key].x)*a;this.pose[key].y+=(target[key].y-this.pose[key].y)*a;}
 for(const key of ['width','yaw','fallbackJaw'])this.pose[key]+=(target[key]-this.pose[key])*a;this.pose.roll=angleLerp(this.pose.roll,target.roll,a);return this.pose;
 }
}
// A classic Worker is intentional: MediaPipe's WASM loader uses importScripts.
export class FaceDetector{
 constructor({onResult,onLoading,onError}){this.onResult=onResult;this.onLoading=onLoading;this.onError=onError;this.worker=null;this.busy=false;this.pending=null;this.serial=0;}
 async init(){
  this.stop();const serial=this.serial;
  return new Promise((resolve,reject)=>{
   const timer=setTimeout(()=>{if(serial!==this.serial)return;this.pending=null;reject(new Error('MODEL_TIMEOUT'));this.stop();},90000);
   this.pending={reject,timer};
   try{this.worker=new Worker(new URL('./face-worker.js',import.meta.url));}catch(error){clearTimeout(timer);this.pending=null;reject(error);return;}
   this.worker.onmessage=({data})=>{
    if(serial!==this.serial)return;
    if(data.type==='loading')this.onLoading(data.message);
    if(data.type==='ready'){clearTimeout(timer);this.pending=null;resolve();}
    if(data.type==='result'){this.busy=false;this.onResult(data);}
    if(data.type==='error'){if(this.pending){clearTimeout(timer);this.pending=null;reject(new Error('MODEL_LOAD'));}else this.onError(data.message);}
   };
   this.worker.onerror=event=>{event.preventDefault();if(serial!==this.serial)return;if(this.pending){clearTimeout(timer);this.pending=null;reject(new Error('MODEL_LOAD'));}else this.onError('WORKER_ERROR');};
   this.worker.postMessage({type:'init'});
  });
 }
 async send(video,timestamp){if(this.busy||!this.worker)return;const worker=this.worker,serial=this.serial;this.busy=true;
  try{const bitmap=await createImageBitmap(video,{resizeWidth:640,resizeHeight:Math.round(640*video.videoHeight/video.videoWidth)});
   if(serial!==this.serial||this.worker!==worker){bitmap.close();return;}
   worker.postMessage({type:'frame',bitmap,timestamp},[bitmap]);
  }catch(error){if(serial===this.serial){this.busy=false;this.onError(error.message);}}
 }
 stop(){this.serial++;if(this.pending){clearTimeout(this.pending.timer);this.pending.reject(new Error('CANCELLED'));this.pending=null;}this.worker?.terminate();this.worker=null;this.busy=false;}
}
