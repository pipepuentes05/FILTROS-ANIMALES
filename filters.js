// Original resolution-independent illustrations. Paths are constructed once, reused per frame.
export const FILTERS=[
 {id:'none',name:'Sin filtro',tag:'TAL CUAL',description:'Tu cara, sin accesorios. La misma cámara y la misma libertad para capturar.',action:'Sonríe o haz lo que quieras. Esta cara ya es tuya.',accent:'#d9f68a'},
 {id:'dog',name:'Perro',tag:'EL CLÁSICO',description:'Orejas suaves, hocico de cachorro y una lengua que no sabe quedarse quieta.',action:'Abre la boca para sacar la lengua.',accent:'#e7bb87'},
 {id:'frog',name:'Rana',tag:'MODO PANTANO',description:'Ojos saltones, mejillas verdes y una lengua que sale disparada. Una personalidad anfibia.',action:'Abre la boca para lanzar la lengua. Ciérrala para repetir.',accent:'#bedb77'},
 {id:'cat',name:'Gato',tag:'CERO INOCENCIA',description:'Orejas curiosas, bigotes finos y pequeños colmillos. El encanto viene incluido.',action:'Abre la boca: aparecen colmillos y se mueven las orejas.',accent:'#d8c2b1'},
 {id:'rabbit',name:'Conejo',tag:'OREJAS ARRIBA',description:'Orejas largas con un poquito de inercia. Nariz rosada y una sonrisa muy particular.',action:'Abre la boca para mostrar los dos dientes.',accent:'#eed9d3'},
 {id:'fox',name:'Zorro',tag:'ESPÍRITU LIBRE',description:'Pelaje cobre, orejas puntiagudas y un hocico crema. Astucia en formato retrato.',action:'Abre la boca para sacar una pequeña lengua.',accent:'#f1af73'},
 {id:'bear',name:'Oso',tag:'ABRAZO GRANDE',description:'Orejas redondas y un hocico de terciopelo. La expresión más tierna de la colección.',action:'Abre la boca para mostrar la sonrisa del oso.',accent:'#cdab86'},
 {id:'pig',name:'Cerdito',tag:'SIN VERGÜENZA',description:'Un hocico rosado con rebote y orejas suaves que se contagian de tu expresión.',action:'Abre la boca y mira cómo salta el hocico.',accent:'#efb1be'},
 {id:'panda',name:'Panda',tag:'BLANCO Y NEGRO',description:'Manchas suaves que dejan ver tus ojos. Una pequeña sorpresa al abrir la boca.',action:'Abre la boca para sorprender al panda.',accent:'#dfe5dc'}
];
const P={
 dogEar:new Path2D('M -.08 .03 C -.23 -.02 -.34 .06 -.32 .28 C -.30 .51 -.23 .63 -.10 .56 C .04 .48 .08 .19 -.08 .03 Z'),
 dogInner:new Path2D('M -.14 .10 C -.25 .08 -.27 .20 -.24 .35 C -.22 .50 -.16 .54 -.10 .46 C -.03 .35 -.04 .20 -.14 .10 Z'),
 pointEar:new Path2D('M -.18 .10 C -.21 -.04 -.15 -.37 -.06 -.44 C -.01 -.47 .19 -.08 .20 .10 C .08 .17 -.06 .17 -.18 .10 Z'),
 pointInner:new Path2D('M -.11 .06 C -.12 -.06 -.08 -.24 -.05 -.29 C .01 -.23 .10 -.02 .11 .06 C .03 .10 -.04 .10 -.11 .06 Z'),
 rabbitEar:new Path2D('M -.10 .11 C -.18 -.12 -.18 -.66 -.05 -.79 C .03 -.86 .13 -.72 .14 -.45 C .17 -.20 .12 .04 .08 .12 Z'),
 rabbitInner:new Path2D('M -.045 .06 C -.10 -.15 -.11 -.55 -.045 -.66 C .02 -.71 .07 -.51 .07 -.35 C .09 -.15 .06 .03 .025 .07 Z'),
 pigEar:new Path2D('M -.16 .06 C -.22 -.07 -.18 -.33 -.10 -.37 C .02 -.39 .26 -.14 .20 -.02 C .15 .07 -.02 .17 -.16 .06 Z'),
 pigInner:new Path2D('M -.10 .015 C -.14 -.08 -.13 -.22 -.08 -.26 C .02 -.22 .15 -.10 .12 -.05 C .06 .01 -.01 .05 -.10 .015 Z'),
 nose:new Path2D('M -.105 -.035 C -.13 -.11 .13 -.11 .105 -.035 C .08 .015 .035 .075 0 .077 C -.04 .075 -.09 .02 -.105 -.035 Z'),
 smallNose:new Path2D('M -.067 -.015 C -.085 -.07 .085 -.07 .067 -.015 C .035 .025 .02 .047 0 .047 C -.02 .047 -.04 .025 -.067 -.015 Z'),
 foxMuzzle:new Path2D('M -.32 -.07 C -.22 -.14 -.17 -.04 0 .01 C .14 -.04 .24 -.15 .32 -.07 C .28 .06 .13 .17 0 .17 C -.14 .17 -.27 .07 -.32 -.07 Z'),
 tooth:new Path2D('M -.028 0 Q -.031 .12 0 .16 Q .032 .10 .028 0 Z')
};
function grad(c,x0,y0,x1,y1,a,b){const g=c.createLinearGradient(x0,y0,x1,y1);g.addColorStop(0,a);g.addColorStop(1,b);return g;}
function shape(c,path,a,b,x=-.25,y=-.2,w=.5,h=.6){c.fillStyle=b?grad(c,x,y,x+w,y+h,a,b):a;c.fill(path);}
function ellipse(c,x,y,rx,ry,a,b,rotation=0){c.beginPath();c.ellipse(x,y,Math.max(.001,rx),Math.max(.001,ry),rotation,0,Math.PI*2);c.fillStyle=b?grad(c,x-rx,y-ry,x+rx,y+ry,a,b):a;c.fill();}
function line(c,points,color,width=.008){c.beginPath();points.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.lineJoin='round';c.stroke();}
function at(c,x,y,rotation,fn,sx=1,sy=1){c.save();c.translate(x,y);c.rotate(rotation);c.scale(sx,sy);fn();c.restore();}
function sheen(c,x,y,rx,ry,alpha=.35){c.save();c.globalAlpha*=alpha;ellipse(c,x,y,rx,ry,'#fff');c.restore();}
function nose(c,x,y,size=1,pink=false){at(c,x,y,0,()=>{shape(c,P.nose,pink?'#ef9baf':'#44413f',pink?'#b65778':'#101818',-.1,-.1,.2,.17);sheen(c,-.037,-.057,.035,.012,.35);},size,size);}
function whiskers(c,x,y,color='#493e38',spread=1){for(const side of [-1,1]){for(let i=0;i<3;i++)line(c,[[x+side*.12,y+i*.021],[x+side*.23,y+(i-1)*.035],[x+side*.38,y+(i-1)*.065*spread]],color,.006);}}
function muzzle(c,x,y,size=1,a='#f1d6b2',b='#bc9676'){at(c,x,y,0,()=>{ellipse(c,-.091,0,.15,.105,a,b);ellipse(c,.091,0,.15,.105,a,b);for(const side of [-1,1])for(let i=0;i<3;i++)ellipse(c,side*(.11+.032*(i%2)),-.01+.03*Math.floor(i/2),.007,.007,'#876e57');},size,size);}
function tongue(c,x,y,amount,time,scale=1){if(amount<.015)return;const length=(.13+.34*amount)*scale,width=.10*scale,sway=Math.sin(time*.006)*.025*amount;
 c.save();c.translate(x,y);c.scale(1,Math.max(.02,amount));c.beginPath();c.moveTo(-width,0);c.bezierCurveTo(-width*.9,length*.4,sway-width,length,sway,length);c.bezierCurveTo(sway+width,length,sway+width,length*.40,width,0);c.closePath();c.fillStyle=grad(c,-width,0,width,length,'#f3a7b4','#c74f72');c.fill();c.beginPath();c.moveTo(0,.03);c.quadraticCurveTo(sway*.3,length*.5,sway,length*.83);c.strokeStyle='#b75373';c.lineWidth=.007;c.stroke();sheen(c,-width*.5,length*.36,width*.16,length*.20,.17);c.restore();}
function roundEar(c,x,y,rotation,black=false,bear=false){at(c,x,y,rotation,()=>{ellipse(c,0,-.015,.17,.19,black?'#454c4b':bear?'#bc9571':'#fff4e9',black?'#121b1b':bear?'#765238':'#bcbcb5');ellipse(c,0,.005,.105,.12,black?'#5d6561':bear?'#75533b':'#e9b4ba',black?'#26302b':bear?'#a97c55':'#bd8b92');sheen(c,-.047,-.10,.055,.025,.12);});}
function toothed(c,x,y,amount,rabbit=false){if(amount<.04)return;at(c,x,y,0,()=>{if(rabbit){for(const s of [-1,1]){c.beginPath();c.roundRect(s<0?-.084:.005,0,.079,.13*amount,.018);c.fillStyle=grad(c,0,0,0,.13,'#fffdf0','#d8d5be');c.fill();}}else for(const s of [-1,1])at(c,s*.115,0,0,()=>shape(c,P.tooth,'#fff9e5','#c6c0a6',0,0,.03,.16),1,amount);});}
export function neutralPose(w=700,h=600){const width=Math.min(w*.55,h*.48);return {nose:{x:w*.5,y:h*.62},mouth:{x:w*.5,y:h*.73},top:{x:w*.5,y:h*.35},eyeL:{x:w*.40,y:h*.51},eyeR:{x:w*.60,y:h*.51},width,roll:0,yaw:0};}
export function drawFilter(c,id,pose,state={amount:0,open:false,frog:0,time:0}){
 if(id==='none'||!pose)return;
 const {width,roll,nose:n}=pose;const cos=Math.cos(roll),sin=Math.sin(roll);const local=p=>({x:((p.x-n.x)*cos+(p.y-n.y)*sin)/width,y:(-(p.x-n.x)*sin+(p.y-n.y)*cos)/width});
 const top=local(pose.top),mouth=local(pose.mouth),el=local(pose.eyeL),er=local(pose.eyeR),a=state.amount||0,t=state.time||0;
 const motion=state.reduced?0:Math.sin(t*.004)*.018;const wiggle=state.reduced?0:a*.12+motion;const yaw=pose.yaw||0;
 c.save();c.translate(n.x,n.y);c.rotate(roll);c.scale(width,width);c.lineJoin='round';c.lineCap='round';
 const ear=(side,fn,rotation=0,x=.37,y=0)=>at(c,top.x+side*x,top.y+y,side*rotation,fn,side,1);
 // Ears always render behind the rest of the facial features.
 if(id==='dog')for(const s of [-1,1])ear(s,()=>{shape(c,P.dogEar,'#ba834f','#66432e',-.32,0,.4,.6);shape(c,P.dogInner,'#b57960','#88503e',-.25,.10,.2,.4);},-.18+wiggle,.53,-.06);
 if(id==='cat'||id==='fox')for(const s of [-1,1])ear(s,()=>{shape(c,P.pointEar,id==='fox'?'#edab60':'#d2b8a5',id==='fox'?'#a54f28':'#796858',-.2,-.45,.4,.6);shape(c,P.pointInner,id==='fox'?'#f5dec4':'#e1adad',id==='fox'?'#d59978':'#af7a83',-.12,-.3,.25,.4);line(c,[[-.14,.07],[-.10,.025],[-.07,.06]],id==='fox'?'#fff3d6':'#f6e2cf',.011);},-.08+wiggle,.36,.06);
 if(id==='rabbit')for(const s of [-1,1])ear(s,()=>{shape(c,P.rabbitEar,'#fffaec','#c2b8b0',-.15,-.8,.3,.9);shape(c,P.rabbitInner,'#f0bac5','#cc8395',-.1,-.7,.2,.8);},-.09+wiggle,.27,.02);
 if(id==='bear'||id==='panda')for(const s of [-1,1])roundEar(c,top.x+s*.39,top.y-.035-a*.035,s*(-.16+wiggle),id==='panda',id==='bear');
 if(id==='pig')for(const s of [-1,1])ear(s,()=>{shape(c,P.pigEar,'#f6bbc5','#c36f8b',-.2,-.35,.4,.5);shape(c,P.pigInner,'#e19aa8','#b45e7e',-.12,-.25,.25,.3);},-.15+wiggle,.36,.06);
 if(id==='frog'){
   // Bulging upper eyes with shaped green lids, white sclera, glossy pupils.
   for(const s of [-1,1])at(c,top.x+s*.29,top.y+.015,s*.14,()=>{
    ellipse(c,0,0,.21,.24,'#d1e98b','#65994e');ellipse(c,0,-.015,.157,.18,'#fffae3','#e4e4b9');ellipse(c,-yaw*.025,.015,.077,.108,'#30372a','#121c14');sheen(c,-.025,-.04,.032,.044,.85);sheen(c,.035,.055,.013,.017,.4);
    c.beginPath();c.moveTo(-.19,-.055);c.bezierCurveTo(-.17,-.25,.17,-.26,.195,-.05);c.strokeStyle='#91b65c';c.lineWidth=.045;c.stroke();
   });
   for(const s of [-1,1]){ellipse(c,s*.29,.11,.12,.06,'#bed982','#8db65d',s*.15);for(let i=0;i<3;i++)ellipse(c,s*(.26+i*.028),.12+(i%2)*.02,.008,.01,'#6c964c');}
   ellipse(c,-.055,-.015,.014,.02,'#5c8848');ellipse(c,.055,-.015,.014,.02,'#5c8848');
   const f=state.frog||0;
   if(f>0){const endX=mouth.x+.66*f,endY=mouth.y-.43*f;c.beginPath();c.moveTo(mouth.x,mouth.y);c.bezierCurveTo(mouth.x+.15,mouth.y+.15,endX-.16,endY+.12,endX,endY);c.strokeStyle='#c66583';c.lineWidth=.037+.045*f;c.stroke();c.beginPath();c.moveTo(mouth.x,mouth.y);c.bezierCurveTo(mouth.x+.15,mouth.y+.12,endX-.16,endY+.10,endX,endY);c.strokeStyle='#efa9b7';c.lineWidth=.017+.017*f;c.stroke();ellipse(c,endX,endY,.045+f*.035,.025+f*.02,'#eaa2b1','#bd5277',-.45);}
   // Tiny illustrated fly; not a UI element, part of the effect.
   at(c,mouth.x+.68,mouth.y-.46+Math.sin(t*.009)*.012,0,()=>{c.save();c.globalAlpha*=.55;ellipse(c,-.025,-.035,.035,.018,'#e1efdc',null,-.7);ellipse(c,.025,-.035,.035,.018,'#e1efdc',null,.7);c.restore();ellipse(c,0,0,.025,.035,'#454b36','#18251b');sheen(c,-.009,-.01,.007,.01,.4);});
 }
 if(id==='dog'){
  muzzle(c,mouth.x,mouth.y-.065,1.05);tongue(c,mouth.x,mouth.y-.015,a,t);nose(c,0,0,1.05);line(c,[[0,.07],[0,mouth.y-.025]],'#644935',.012);
 }
 if(id==='cat'){
  muzzle(c,mouth.x,mouth.y-.065,.77,'#e6d7c8','#b7a390');whiskers(c,mouth.x,mouth.y-.025,'#e6dfd3',1);nose(c,0,.015,.65,true);line(c,[[0,.065],[0,mouth.y-.025]],'#6f5b51',.008);toothed(c,mouth.x,mouth.y-.01,a);
 }
 if(id==='rabbit'){
  muzzle(c,mouth.x,mouth.y-.045,.90,'#fff2e3','#ccc1b7');whiskers(c,mouth.x,mouth.y-.02,'#f4eadf',.7);nose(c,0,.02,.70,true);line(c,[[0,.065],[0,mouth.y-.005]],'#a27e82',.007);toothed(c,mouth.x,mouth.y+.01,a,true);
 }
 if(id==='fox'){
  at(c,mouth.x,mouth.y-.09,0,()=>shape(c,P.foxMuzzle,'#fff4d8','#d8b68d',-.3,-.1,.6,.3));
  for(const s of [-1,1]){line(c,[[s*.19,mouth.y-.05],[s*.29,mouth.y-.12],[s*.37,mouth.y-.16]],'#f9d5aa',.035);line(c,[[s*.15,mouth.y],[s*.29,mouth.y-.03]],'#a25c36',.006);}
  tongue(c,mouth.x,mouth.y+.015,a,t,.58);nose(c,0,.01,.91);line(c,[[0,.075],[0,mouth.y+.015]],'#7b5637',.009);
 }
 if(id==='bear'){
  ellipse(c,mouth.x,mouth.y-.055,.285,.19,'#ead3ac','#b59876');
  if(a>.05){ellipse(c,mouth.x,mouth.y+.025,.115,.035+a*.11,'#4b322b','#281e1a');ellipse(c,mouth.x,mouth.y+.06+a*.04,.073,.025+a*.02,'#db98a1','#b96779');toothed(c,mouth.x,mouth.y-.015,a);}
  nose(c,0,.03,1.2);line(c,[[0,.10],[0,mouth.y-.015]],'#74563e',.012);
 }
 if(id==='pig'){
  for(const s of [-1,1])ellipse(c,s*.28,.13,.10,.06,'#f8bec6','#d68b9d',s*.2);
  const bounce=state.reduced?0:Math.sin(a*Math.PI)*.025;
  at(c,0,.04-bounce,0,()=>{ellipse(c,0,0,.205+a*.009,.145,'#f8c1cc','#d5839d');ellipse(c,0,.012,.174,.112,'#efa6b9','#d77b98');for(const s of [-1,1]){ellipse(c,s*.075,.01,.033,.052,'#b96181','#8c4669',s*-.13);sheen(c,s*.075-.007,-.012,.009,.022,.15);}sheen(c,-.045,-.087,.072,.015,.35);});
 }
 if(id==='panda'){
  for(const eye of [el,er])at(c,eye.x,eye.y,eye.x<0?-.27:.27,()=>{
   // Even-odd fill leaves the actual human eye visible in the patch.
   c.beginPath();c.ellipse(0,0,.15,.135,0,0,Math.PI*2);c.ellipse(0,0,.095,.042,0,0,Math.PI*2);c.fillStyle=grad(c,-.12,-.1,.12,.1,'#343e3a','#111b19');c.fill('evenodd');
   c.globalAlpha*=.3;ellipse(c,-.08,-.07,.028,.015,'#8d9a8f');
  });
  muzzle(c,mouth.x,mouth.y-.06,.82,'#f6f5e9','#c5c8bd');nose(c,0,.02,.86);
  if(a>.06){ellipse(c,mouth.x,mouth.y+.02,.055+a*.025,.035+a*.10,'#26342b','#121d18');ellipse(c,mouth.x,mouth.y+.06+a*.035,.033,.019,'#c9949d');}
 }
 c.restore();
}
// Decorative mask-only portraits share the exact same drawing functions as live filters.
export function drawPortrait(canvas,id,amount=0,time=0){const c=canvas.getContext('2d'),w=canvas.width,h=canvas.height;c.clearRect(0,0,w,h);const pose=neutralPose(w,h);if(id==='rabbit'){pose.width*=.83;pose.top.y=h*.43;}const state={amount,open:amount>.2,frog:id==='frog'?Math.max(0,Math.sin(time*.004)):0,time};drawFilter(c,id,pose,state);}
