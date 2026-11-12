let detector;
self.onmessage=async({data})=>{
 if(data.type==='init'){
  try{
   self.postMessage({type:'loading',message:'Descargando detector facial…'});
   const {FaceLandmarker,FilesetResolver}=await import('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.21/vision_bundle.mjs');
   self.postMessage({type:'loading',message:'Preparando WebAssembly…'});
   const files=await FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.21/wasm');
   self.postMessage({type:'loading',message:'Cargando modelo de rostro y expresiones…'});
   detector=await FaceLandmarker.createFromOptions(files,{baseOptions:{modelAssetPath:'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',delegate:'CPU'},runningMode:'VIDEO',numFaces:2,outputFaceBlendshapes:true,minFaceDetectionConfidence:.55,minFacePresenceConfidence:.55,minTrackingConfidence:.55});
   self.postMessage({type:'ready'});
  }catch(error){self.postMessage({type:'error',message:error.message});}
 }
 if(data.type==='frame'){
  try{const result=detector.detectForVideo(data.bitmap,data.timestamp);const jaw=result.faceBlendshapes?.map(f=>f.categories.find(c=>c.categoryName==='jawOpen')?.score??null)??[];self.postMessage({type:'result',faces:result.faceLandmarks,jaw,timestamp:data.timestamp});}
  catch(error){self.postMessage({type:'error',message:error.message});}
  finally{data.bitmap.close();}
 }
};
