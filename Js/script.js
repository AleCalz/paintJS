// CONSTANTS
const MODES = {
  DRAW: 'draw',
  ERASE: 'erase',
  RECTANGLE: 'rectangle',
  ELLIPSE: 'ellipse',
  PICKER: 'picker'
}

// UTILITIES
const $ = (selector) => document.querySelector(selector)
const $$ = (selector) => document.querySelectorAll(selector)

// ELEMENTS -> recuperenado elementos
const $canvas = $('#canvas') // identifica que elementos son los que tienen el ID canvas, como si fuera un querySelector
const $colorPicker = $('#color-picker') // Esuchamos el elemento que nos permite seleccionar el color

const $clearBtn = $('#clear-btn')
const $drawBtn = $('#draw-btn')
const $rectangleBtn = $('#rectangle-btn')
const $erasedBtn = $('#erased-btn')
const $pickerBtn = $('#picker-btn')
const $ellipseBtn = $('#ellipse-btn')

let contexto = $canvas.getContext('2d') // recuperamos el contexto del canvas

// STATE
let isDrawing = false
let startX, startY
let lastX = 0
let lastY = 0
let mode = MODES.DRAW
let imageData
let isShiftPressed = false

// EVENTS
// escuchar cuando el raton haga click
$canvas.addEventListener('mousedown', startDrawing)
$canvas.addEventListener('mousemove', draw)
$canvas.addEventListener('mouseup', stopDrawing)
$canvas.addEventListener('mouseleave', stopDrawing)
$clearBtn.addEventListener('click', clearCanvas)

$ellipseBtn.addEventListener('click', () => {
  setMode(MODES.ELLIPSE)
})

$pickerBtn.addEventListener('click', () => {
  setMode(MODES.PICKER)
})
$erasedBtn.addEventListener('click', () => {
  setMode(MODES.ERASE)
})

$drawBtn.addEventListener('click', () => {
  setMode(MODES.DRAW)
})
$rectangleBtn.addEventListener('click', () => {
  setMode(MODES.RECTANGLE)
})

document.addEventListener('keydown', handleKeyDown)
document.addEventListener('keyup', handleKeyUp)

// escuchar color-picker cada que cambie
$colorPicker.addEventListener('change', hadleColorChange)

// METHODS
function startDrawing(event) {
  isDrawing = true
  console.log(event)

  // desestructurar coordenadas del evento
  const { offsetX, offsetY } = event

  // guardar las coordenas en las variables cu7ando comenzamos a dibujar
  // se coloca punto y coma porque estamos iniciando la linea con corchetes
  ;[startX, startY] = [offsetX, offsetY]
  ;[lastX, lastY] = [offsetX, offsetY]

  // recuperamos imagen del canvas  -- TODO: deshacer cambios..
  imageData = contexto.getImageData(0, 0, canvas.width, canvas.height) // foto de todo el canvas
}

function draw(event) {
  // comenzamos a dibujar cuando existe un clic en el canvas
  if (!isDrawing) return

  // recuperamos posicion del click
  const { offsetX, offsetY } = event

  if (mode === MODES.DRAW || mode === MODES.ERASE) {
    // comenzamos  con el trazo
    contexto.beginPath()

    // movemos a las coordenadas donde comienza
    contexto.moveTo(lastX, lastY)

    // dibuja una linea entre las coordenadas actuales y las nuevas
    contexto.lineTo(offsetX, offsetY)

    // dibujamos el trazo
    contexto.stroke()

    // actualizamos las coordenadas
    ;[lastX, lastY] = [offsetX, offsetY]

    return
  }

  if (mode === MODES.RECTANGLE) {
    // esto para evitar que se repita el trazo del rectangulo
    contexto.putImageData(imageData, 0, 0)
    // recuperar ancho y alto rectangulo
    // startX - cordenada inicial click
    // offsetX - donde esta el mouse
    let width = offsetX - startX
    let height = offsetY - startY

    // tener en cuenta que los valores pueden ser negativos
    // si estamos presionando shift, hacemos un cuadrado perfecto
    if (isShiftPressed) {
      const sideLength = Math.min(
        Math.abs(width), // pasamos valore absoluto ancho y alto
        Math.abs(height)
      )

      // si el ancho era positivo, lo usamos como valor positivo tmb, lo mismo con el alto
      width = width > 0 ? sideLength : -sideLength
      height = height > 0 ? sideLength : -sideLength
    }

    contexto.beginPath()
    contexto.rect(startX, startY, width, height)
    contexto.stroke()

    return
  }

  if (mode === MODES.ELLIPSE) {
    // Imagen de la elipse, para evitar que se repita el trazo
    contexto.putImageData(imageData, 0, 0)

    // Calculamos el ancho y alto de la elipse
    const width = offsetX - startX
    const height = offsetY - startY

    // Calculamos el centro de la elipse
    // desde donde iniciamos mas la mitad de su ancho/alto
    const centerX = startX + width / 2
    const centerY = startY + height / 2

    contexto.beginPath()
    // Dibujamos la elipse
    /*
        1. centerX, centerY: Coordenadas del centro de la elipse.
        2. Math.abs(width) / 2, Math.abs(height) / 2: Radios de la elipse para X e Y.
        3. 0: Rotación de la elipse (lo pasamos en 0, ya que no lo necesitamos).
        4. 0, 2 * Math.PI: Ángulo de inicio y fin para dibujar una elipse completa.
        */
    contexto.ellipse(
      centerX,
      centerY,
      Math.abs(width) / 2,
      Math.abs(height) / 2,
      0,
      0,
      2 * Math.PI
    )
    // Trazamos la elipse
    contexto.stroke()
    return
  }
}

function stopDrawing(event) {
  isDrawing = false
}

function hadleColorChange() {
  const { value } = $colorPicker
  // console.log(value);
  contexto.strokeStyle = value
}

function clearCanvas() {
  // dibujamos un rectangulo y lo limpiamos
  // setteamos valores de inicio en 0 y pasamos el ancho y alto del canvas
  contexto.clearRect(0, 0, canvas.width, canvas.height)
}

async function setMode(newMode) {
  let previousMode = mode
  // pasamos el nuevo mode y lo guardamos en el estado
  mode = newMode // act nuestro nuevo modo
  // recuperamos y limpiamos elemento btn que tengan la clase active
  $('button.active')?.classList.remove('active')

  // colocamos la clase active en el btn que tenga el nuevo modo
  if (mode === MODES.DRAW) {
    // aplica lo mismo (dibujar y borrar)
    $drawBtn.classList.add('active')
    canvas.style.cursor = 'crosshair'
    contexto.globalCompositeOperation = 'source-over' // reseteamos el composite operation
    contexto.lineWidth = 2
    return
  }

  if (mode === MODES.RECTANGLE) {
    $rectangleBtn.classList.add('active')
    canvas.style.cursor = 'nw-resize'
    contexto.globalCompositeOperation = 'source-over'
    contexto.lineWidth = 2
    return
  }

  if (mode === MODES.ERASE) {
    $erasedBtn.classList.add('active')
    canvas.style.cursor = 'url(./cursors/erase.png) 0 24, auto'

    // GlobalCompositeOperator: "destination-out": si dibujmos encima que lo elimine
    contexto.globalCompositeOperation = 'destination-out'
    contexto.lineWidth = 20

    return
  }

  if (mode === MODES.PICKER) {
    $pickerBtn.classList.add('active')
    canvas.style.cursor = 'url(./cursors/picker.png) 0 24, auto'
    const picker = new EyeDropper() // instanciamos el picker

    try {
      const color = await picker.open() // capturamos el color
      // guardamos el color en el input color-picker
      $colorPicker.value = color.sRGBHex // guardamos el color en el input color-picker
      contexto.strokeStyle = color.sRGBHex
      setMode(previousMode)
    } catch (e) {
      // si no se puede capturar el color, no hacemos nada
    }

    return
  }

  if (mode === MODES.ELLIPSE) {
    $ellipseBtn.classList.add('active')
    canvas.style.cursor = 'crosshair'
    contexto.globalCompositeOperation = 'source-over'
    contexto.lineWidth = 2
    return
  }
}

function handleKeyDown({ key }) {
  isShiftPressed = event.key === 'Shift'
}

function handleKeyUp({ key }) {
  if (key === 'Shift') {
    isShiftPressed = false
  }
}

// TODO: hacer el relleno de color
// TODO: hacer el deshacer (ctrl+z)
// TODO: hacer variable el grosor de la linea
// TODO: colocar los colores mas utilizados
// TODO: Texto

// INIT
setMode(MODES.DRAW)

// revisamos si el plugin eyedropper esta disponible en el navegador
// si no lo esta, no mostraremos el btn
if (typeof window.EyeDropper !== 'undefined') {
  $pickerBtn.removeAttribute('disabled')
}
