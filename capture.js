export const MAX_PHOTOS=20;
export function photoFilename(filter,date=new Date(),unique=''){
 const pad=n=>String(n).padStart(2,'0');const day=`${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}`;
 const time=`${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}-${String(date.getMilliseconds()).padStart(3,'0')}`;
 return `foto-${filter}-${day}-${time}${unique?'-'+unique:''}.png`;
}
function toBlob(canvas){return new Promise((resolve,reject)=>{canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('No pudimos codificar la foto.')),'image/png');});}
export class PhotoStore{
 constructor(){this.photos=[];this.sequence=0;}
 async capture(source,filter){
  if(this.photos.length>=MAX_PHOTOS)throw new Error('Tu galería de sesión está llena (20 fotos). Quita una para seguir capturando.');
  // Freeze the *already composed* frame synchronously; do not draw the filter again later.
  const frozen=document.createElement('canvas');frozen.width=source.width;frozen.height=source.height;frozen.getContext('2d').drawImage(source,0,0);
  const date=new Date(),id=String(++this.sequence),blob=await toBlob(frozen);
  const thumb=document.createElement('canvas');thumb.width=320;thumb.height=Math.round(320*frozen.height/frozen.width);thumb.getContext('2d').drawImage(frozen,0,0,thumb.width,thumb.height);const thumbnailBlob=await toBlob(thumb);
  const entry={id,blob,url:URL.createObjectURL(blob),thumbnail:URL.createObjectURL(thumbnailBlob),name:photoFilename(filter.id,date,id),filter:filter.name,width:source.width,height:source.height,date};
  frozen.width=0;frozen.height=0;thumb.width=0;thumb.height=0;this.photos.push(entry);return entry;
 }
 get(id){return this.photos.find(p=>p.id===id);}
 remove(id){const i=this.photos.findIndex(p=>p.id===id);if(i<0)return;const [p]=this.photos.splice(i,1);URL.revokeObjectURL(p.url);URL.revokeObjectURL(p.thumbnail);}
 dispose(){for(const p of [...this.photos])this.remove(p.id);}
 download(photo){const a=document.createElement('a');a.href=photo.url;a.download=photo.name;document.body.appendChild(a);a.click();a.remove();}
}
export class FolderStorage{
 constructor(){this.handle=null;this.auto=false;}
 get supported(){return typeof window.showDirectoryPicker==='function'&&window.isSecureContext;}
 async choose(){
  // Must be called immediately from the click handler, before other async work.
  const handle=await window.showDirectoryPicker({mode:'readwrite',id:'anima-photos',startIn:'pictures'});
  this.handle=handle;this.auto=false;return handle.name;
 }
 async authorize(){if(!this.handle)return false;const options={mode:'readwrite'};return (await this.handle.requestPermission(options))==='granted';}
 disconnect(){this.handle=null;this.auto=false;}
 async save(photo){
  const handle=this.handle;if(!handle)throw new Error('Primero elige una carpeta.');
  // Never request a new permission from an asynchronous automatic capture.
  if(await handle.queryPermission({mode:'readwrite'})!=='granted'){this.auto=false;throw new Error('El permiso de carpeta caducó. Vuelve a elegir la carpeta o usa GUARDAR FOTO.');}
  const file=await handle.getFileHandle(photo.name,{create:true});const writable=await file.createWritable();
  try{await writable.write(photo.blob);await writable.close();}
  catch(error){try{await writable.abort();}catch{}throw error;}
  return handle.name;
 }
}
