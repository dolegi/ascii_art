const jimp = require('jimp').default

const container = document.querySelector('#canvas-container')
setCanvas()

function setCanvas() {
  container.innerHTML = `<canvas width="800px" height="600px"></canvas>`
}

function setDiv() {
  container.innerHTML = `<div class="display"></div>`
}

const ASCII = '`^\",:;Il!i~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$'
let cameraOn = true

function convert(url, print) {
  return jimp.read(url)
    .then(img => {
      img = img.resize(100, 62)
      const image = []
      for(let y = 0; y < img.bitmap.height; y++) {
        image.push([])
        for(let x = 0; x < img.bitmap.width; x++) {
          const colour = img.getPixelColor(x, y)
          const rgba = jimp.intToRGBA(colour)
          const b = brightness(rgba.r, rgba.g, rgba.b, rgba.a)
          const char = getAscii(b)
          image[y].push({ char: getAscii(b), rgba })
        }
      }
      print(image)
    })
}

document.querySelector('#file-upload').addEventListener('change', function(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader()
    reader.onload = evt => {
      setDiv()
      convert(evt.target.result, printDiv);
    }
    reader.readAsDataURL(file)
  }
});

function brightness (r, g, b, a) {
  return 0.21*r + 0.72*g + 0.07*b
}

function getAscii(colour) {
  return ASCII[Math.floor(((ASCII.length-1) / 255) * colour)]
}

function printCanvas(image) {
  const canvas = document.querySelector('canvas')
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = '#232323'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.font = '12px Monospace'

  let rowHeight = 12
  let letterCount = 10
  image.forEach(row => {
    letterCount = 0
    row.forEach(cell => {
      const { rgba, char } = cell
      ctx.fillStyle = `rgba(${rgba.r},${rgba.g},${rgba.b},${rgba.a})`
      ctx.fillText(char, letterCount, rowHeight);
      letterCount += 10
    })
    rowHeight += 12
  })
}

function printDiv(image) {
  const display = document.querySelector('.display')
  display.style.fontFamily = 'Monospace'
  display.style.fontSize = '12px'
  display.style.backgroundColor = '#232323'
  display.innerHTML = ''

  const rows = []
  image.forEach(row => {
    const spans = []
    const div = document.createElement('span')
    row.forEach(cell => {
      const span = document.createElement('span')
      const { rgba, char } = cell
      span.style.color = `rgba(${rgba.r},${rgba.g},${rgba.b},${rgba.a})`
      span.innerHTML = char
      spans.push(span)
    })
    spans.push(document.createElement('br'))
    spans.forEach(s => div.appendChild(s))
    rows.push(div)
  })
  rows.forEach(r => display.appendChild(r))
}

const vid = document.querySelector('video')
navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => {
    vid.srcObject = stream
    return vid.play()
  })
  .then(() => {
    const btn = document.querySelector('#video-button')
    btn.disabled = false;
    let interval = setInterval(() => takeASnap(printCanvas), 200)
    btn.onclick = () => {
      if (cameraOn) {
        clearInterval(interval)
        btn.innerHTML = 'Record'
        setTimeout(() => {
          setDiv()
          takeASnap(printDiv)
        }, 1)
      } else {
        setCanvas()
        interval = setInterval(() => takeASnap(printCanvas), 200)
        btn.innerHTML = 'Stop'
      }
      cameraOn = !cameraOn
    }
  })

function takeASnap(print) {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  canvas.width = 800
  canvas.height = 600
  ctx.drawImage(vid, 0,0)
  return new Promise((res, rej)=>{
    canvas.toBlob(res, 'image/jpeg')
  }).then(blob => {
    const reader = new FileReader()
    reader.onload = evt => {
      convert(evt.target.result, print)
    }
    reader.readAsDataURL(blob)
  })
}
