# ANIMA — Cámara con filtros de animales

Proyecto completo para Felipe Puentes. Cámara en espejo, ocho filtros originales animados, captura PNG, galería temporal, descarga y guardado en carpeta autorizada.

## Abrir en Visual Studio Code

1. Extrae **todo** el ZIP en una carpeta del computador. No lo ejecutes desde el ZIP.
2. Abre Visual Studio Code y selecciona **File > Open Folder**. Abre `anima-camara`.
3. En **Extensions**, instala **Live Server**, de **Ritwick Dey**, desde el marketplace oficial.
4. Haz clic derecho en `index.html` y elige **Open with Live Server**.
5. Se abrirá una dirección como `http://127.0.0.1:5500`. Usa Chrome o Edge.
6. Pulsa **ACTIVAR CÁMARA**. Espera la descarga e inicialización del modelo. Acepta el permiso de **cámara** del navegador.
7. Centra tu cara con buena luz y deja espacio sobre tu cabeza para las orejas. Selecciona un animal y abre la boca.

No necesitas Node, npm, un servidor de cuentas ni herramientas de compilación. Sí necesitas internet para descargar MediaPipe y su modelo. No abras index.html mediante doble clic: `file://` no sirve para este proyecto. También puedes servirlo por HTTPS.

## Los filtros

| Filtro | Qué hace al abrir la boca |
| --- | --- |
| Perro | La lengua se extiende, cuelga y se retrae al cerrar. |
| Rana | Dispara una lengua curva hacia la mosca y la retrae; cierra y vuelve a abrir para repetir. |
| Gato | Muestra pequeños colmillos y mueve las orejas. |
| Conejo | Muestra dos dientes y balancea las orejas. |
| Zorro | Saca una lengua pequeña y mueve las orejas. |
| Oso | Abre una boca ilustrada con lengua y pequeños dientes. |
| Cerdito | Anima el hocico y las orejas. |
| Panda | Muestra una boca sorprendida y levanta las orejas. |
| Sin filtro | Conserva la cámara y el botón de fotografía, sin accesorios. |

Las ilustraciones se dibujan con curvas originales de Canvas 2D, degradados y brillos. No usan emojis, fotografías de animales, modelos externos ni recursos gráficos incompletos. Son superposiciones 2D con seguimiento de puntos y rotación, no máscaras volumétricas de realidad aumentada profesional. Funcionan mejor de frente y con giros moderados; no incluyen oclusión por manos u otros objetos.

Las miniaturas, la vista ilustrada sin cámara y los filtros en vivo usan las mismas funciones de dibujo. La vista **VER FILTROS · SIN CÁMARA**, dentro de **Antes de empezar**, solo muestra las ilustraciones y sus animaciones: no activa ni simula detección facial.

## Tomar y guardar fotos

1. Selecciona un animal.
2. Haz la expresión que quieras.
3. Presiona el botón circular de captura. También puedes usar la barra espaciadora cuando no esté enfocado un control.
4. Se abre la fotografía. Pulsa **GUARDAR FOTO** para descargar un PNG.
5. Cierra la fotografía para seguir usando la cámara.

La descarga va a la carpeta configurada en tu navegador, normalmente **Descargas**, o a la ubicación que este te permita elegir. No se integra automáticamente con la aplicación Fotos de Windows.

La captura copia el lienzo de video y filtro **ya compuesto**. No vuelve a dibujar una animación posterior, por lo que conserva el estado visible de la lengua, dientes u orejas. La foto no contiene los botones ni la interfaz.

La imagen está en espejo tanto en la vista previa como en el PNG. Se conserva la proporción de la webcam sin recortes CSS. La composición usa hasta 1920 píxeles de ancho según la resolución real recibida: nunca aumenta artificialmente la resolución de la cámara.

### Elegir una carpeta

En Chrome o Edge de escritorio compatibles:

1. Presiona **ELEGIR CARPETA**.
2. Selecciona la carpeta deseada y autoriza el acceso que solicite el navegador.
3. La página muestra el nombre de la carpeta.
4. En una foto abierta, puedes presionar **GUARDAR EN CARPETA**.
5. Si quieres, marca explícitamente **Guardar próximas fotos automáticamente**. Desde entonces, las próximas capturas se escriben en esa carpeta cuando termina su codificación.

El guardado automático comienza apagado. Elegir o cambiar la carpeta lo deja apagado. Puedes desmarcarlo o desconectar la carpeta con **×**. No se guarda la autorización de carpeta en el almacenamiento de la aplicación para futuras sesiones.

La página solo confirma “guardada” tras terminar de escribir y cerrar el archivo. Si se revoca el permiso, el guardado automático se apaga y la foto permanece en la sesión para descargarla. No se intenta pedir un permiso nuevo silenciosamente desde una captura automática.

Si el navegador no permite elegir carpetas, la descarga normal sigue funcionando. No hace falta elegir una carpeta para usar ANIMA.

### Galería

**MIS FOTOS** abre las capturas retenidas durante esta sesión. Puedes ampliarlas, descargarlas o quitarlas de la sesión. El botón junto al disparador abre la última captura.

Hay un máximo de 20 fotos. Guarda y quita alguna si quieres seguir capturando. Al recargar o cerrar la página se libera esta galería; los archivos ya descargados o guardados permanecen en tu computador. Quitar una foto de la galería **no elimina** archivos de tu disco.

## Controles adicionales

- **SONIDO ON/OFF:** obturador sintetizado localmente. Comienza silenciado. No solicita micrófono.
- **TIMER 3s:** cuenta regresiva antes de la foto. Pulsa otra vez el disparador para cancelar. Detener la cámara, cambiar de animal o cambiar de pestaña también cancela la cuenta.
- **AMPLIAR:** pantalla completa del área de cámara cuando el navegador lo permita. Sal con Escape. El resto de controles queda fuera de esta vista; la barra espaciadora puede capturar si el foco no está sobre un control.
- **Flechas izquierda/derecha:** cambia de animal cuando no haya un diálogo abierto ni estés editando un campo.
- **DETENER CÁMARA:** termina todas las pistas de video, el detector y las capturas pendientes. La luz de tu webcam debe apagarse.

## Archivos

```text
anima-camara/
  index.html              Interfaz, controles y diálogos
  styles.css              Colores y diseño adaptable
  script.js               Coordinación, cámara, galería y controles
  filters.js              Ocho ilustraciones y sus animaciones
  face-tracking.js        Pose, suavizado, expresiones y controlador del worker
  face-worker.js          Inferencia MediaPipe y coeficiente jawOpen
  capture.js              PNG, miniaturas, descargas y File System Access
  LEEME.md                Instrucciones completas
  package.json            Configuración opcional de pruebas
  tests/
    logic.test.js         Nueve pruebas de lógica y escritura en carpeta simulada
    browser-check.html    Pruebas de render, PNG y detector sin solicitar webcam
```

No hay carpeta de imágenes necesaria: todos los gráficos están incluidos en `filters.js`.

## Personalizar

### Colores y diseño

Edita las variables de `:root` en `styles.css`: `--bg`, `--cream`, `--muted`, `--line`, `--lime`. Los colores de cada animal se editan en `filters.js`.

### Nombres, descripciones e instrucciones

La lista `FILTERS`, al comienzo de `filters.js`, contiene los nombres, etiquetas, descripciones e instrucciones.

### Dibujos y animaciones

En `filters.js`:

- `P` contiene los trazados reutilizables de orejas, narices, dientes y hocico de zorro.
- `drawFilter()` dibuja el animal usando los puntos y la expresión actual.
- `tongue()` dibuja la lengua del perro y del zorro.
- El bloque `id === 'frog'` dibuja los ojos, la lengua curva y la mosca.
- `neutralPose()` solo organiza las ilustraciones de miniaturas y vista sin cámara; el modo real usa puntos faciales detectados.

Para añadir otro animal, agrega su entrada a `FILTERS` y su dibujo a `drawFilter()`. Ajusta los textos de cantidad en la interfaz si cambias el total.

### Sensibilidad de apertura de boca

En `face-tracking.js`, `SETTINGS` define:

```js
mouthOpen: .22,       // Umbral para abrir; reduce si cuesta activarlo
mouthClose: .12,      // Umbral menor para cerrar: evita parpadeos
confirmMs: 85,        // Confirmación de apertura
expressionTau: .065, // Suavizado de expresión, en segundos
poseTau: .055,       // Suavizado de posición/escala/rotación
lossGrace: 180,       // Margen de pérdida de rostro, en milisegundos
lossFade: 170,        // Tiempo de desvanecimiento posterior
frogCooldown: 900,    // Tiempo mínimo entre disparos
frogDuration: 630     // Duración de cada disparo
```

Mantén siempre `mouthClose` menor que `mouthOpen`. El detector utiliza `jawOpen`; si no lo recibe, hay una alternativa normalizada basada en la separación de labios respecto a la distancia entre ojos. Detecta **apertura de boca**, no una lengua humana.

El seguimiento usa nariz, labios, frente, ojos y contorno lateral. La nariz, boca y ojos tienen anclajes independientes. La escala depende del rostro y la rotación de la línea entre ojos. El suavizado depende del tiempo entre muestras, no de un número fijo de fotogramas.

### Resolución, memoria y rendimiento

- `startCamera()` en `script.js` solicita idealmente 1280 × 960 y conserva el tamaño real recibido hasta 1920 píxeles de ancho.
- La detección recibe imágenes reducidas a 640 píxeles de ancho y se solicita aproximadamente cada 90 ms.
- Solo hay una inferencia pendiente. La operación síncrona de MediaPipe ocurre en un **worker clásico** compatible con su cargador `importScripts`.
- `MAX_PHOTOS` en `capture.js` limita la galería. Las miniaturas tienen 320 píxeles de ancho.
- Las URLs de objetos se liberan al retirar las fotos o cerrar la página.
- El video no se deforma: el lienzo y el área de cámara adoptan su proporción, y el espejo se aplica una sola vez a la composición.
- No se crean imágenes o archivos SVG en cada fotograma. Los Path2D están precalculados.

## Privacidad

No hay servidor de fotos, cuentas, analítica ni almacenamiento permanente en el navegador. El video, puntos faciales y expresiones se procesan localmente. No se solicitan datos de identidad ni micrófono. Los PNG se generan en memoria y solo se escriben por una acción de descarga/guardado o por el guardado automático que activaste explícitamente.

Se descargan código y modelos desde `cdn.jsdelivr.net` y `storage.googleapis.com`. Esas solicitudes descargan recursos; no contienen tus fotogramas ni puntos faciales.

## Requisitos y errores comunes

- Usa una versión actual de Chrome o Edge con webcam y WebGL disponible. Aunque los filtros se dibujan con Canvas 2D y el modelo usa el delegado CPU, la infraestructura de MediaPipe puede necesitar WebGL para manejar las imágenes.
- Si hay un error gráfico, revisa que la aceleración gráfica esté habilitada, actualiza los controladores y reinicia el navegador. WebGL puede estar bloqueado por una política del computador.
- Si el permiso de cámara está denegado, habilítalo desde el icono junto a la dirección del navegador y vuelve a intentar.
- Si la cámara está ocupada, cierra Zoom, Teams u otras aplicaciones.
- Si el modelo falla, comprueba internet y el acceso a jsDelivr y Google Storage. La primera carga puede tardar. Existe un límite de espera de 90 segundos.
- Si no hay rostro, los accesorios se desvanecen. Si hay más de uno, se solicita una persona a la vez para evitar saltos de filtro.
- Si cambias de pestaña, se pausa trabajo innecesario, se cancela el temporizador y se descarta la pose previa.
- Si la cámara tiene un campo de visión muy cerrado, las orejas largas pueden quedar fuera de la imagen: aléjate un poco.
- En pantallas pequeñas, los controles se organizan debajo de la cámara. La tira de animales se desplaza horizontalmente.

## Validación realizada y límites

Se ejecutaron nueve pruebas automatizadas con resultado correcto:

1. Confirmación e histéresis de apertura/cierre de boca.
2. Un solo disparo de rana por apertura y rearme al cerrar.
3. Retorno suave de expresión a reposo.
4. Suavizado consistente con distintas frecuencias.
5. Interpolación angular por el camino más corto.
6. Coordenadas espejadas y escala coherente entre resoluciones.
7. Nombres con fecha y hora locales e identificador único.
8. Rechazo de permiso de carpeta revocado sin solicitarlo silenciosamente.
9. Confirmación de escritura solo después de cerrar el archivo, usando un sistema de archivos simulado.

También se verificó en el navegador:

- Interfaz, cambio de animales y vista de las ocho ilustraciones animadas.
- Render de los ocho animales sobre una imagen de prueba.
- Captura PNG de 960 × 720 y comparación **píxel por píxel** con el lienzo de origen; la captura permaneció intacta después de cambiar ese lienzo.
- Generación de miniaturas y descarga real de un PNG de prueba.
- Flujo de captura, diálogo, apertura de galería, eliminación de la foto y detención, en una copia de pruebas con video y puntos **sintéticos**, sin webcam. Esa copia no se incluye ni sustituye el modo real del proyecto.
- Descarga e inicialización del modelo MediaPipe con blendshapes activados.
- Revisión sintáctica de los módulos JavaScript.

**No se pudo verificar el seguimiento real:** el navegador remoto de pruebas no tiene acceso a tu webcam y tiene WebGL desactivado. El modelo se inicializó, pero la inferencia de prueba falló al intentar usar el contexto gráfico (`activeTexture`). Por ello no se afirma haber comprobado los filtros sobre una cara real ni su ajuste en tu computador. La escritura mediante el selector real de carpetas tampoco se probó con tu sistema de archivos: la lógica sí se comprobó con simulaciones.

Prueba el recorrido real en tu computador: activa la cámara, cambia de filtro, abre/cierra la boca, toma una foto, descárgala, vuelve a abrirla y compara el encuadre. Después elige una carpeta y comprueba el guardado si quieres usar esa opción.

### Repetir pruebas opcionales

Si tienes Node instalado, abre una terminal en la carpeta y ejecuta:

```sh
npm test
```

No necesita instalar dependencias npm. Para pruebas de dibujo y PNG, abre `tests/browser-check.html` con Live Server y presiona **COMPROBAR RENDER Y PNG**. El botón de modelo hace una inferencia sobre una imagen ilustrada, sin solicitar webcam; requiere WebGL disponible por la infraestructura de MediaPipe. Esta página técnica no forma parte del flujo normal de ANIMA.

## Dependencias

- MediaPipe Tasks Vision **0.10.21**, licencia Apache-2.0, cargada desde jsDelivr.
- Face Landmarker oficial **float16/1**, descargado de Google Storage.
- Canvas 2D, Web Workers, getUserMedia y File System Access del navegador.
- Las ilustraciones y los sonidos están implementados en el proyecto. No se usa GSAP, Three.js ni un backend.

Documentación oficial de referencia:

- https://ai.google.dev/edge/mediapipe/solutions/vision/face_landmarker/web_js
- https://developer.chrome.com/docs/capabilities/web-apis/file-system-access
