const jimp = require('jimp').default

const ASCII = '`^\",:;Il!i~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$'

function convert(url) {
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
let b = false
document.querySelector('.file-reader').addEventListener('change', function(event) {
  const file = event.target.files[0];
  const reader = new FileReader()
  reader.onload = evt => {
    convert(evt.target.result);
  }
  reader.readAsDataURL(file)
})


function brightness (r, g, b, a) {
  return 0.21*r + 0.72*g + 0.07*b
}

function getAscii(colour) {
  return ASCII[Math.floor(((ASCII.length-1) / 255) * colour)]
}

function getColour (r, g, b) {
  return `\x1b[38;5;${getAsciiColour(r, b, g)}m`
}

function getAsciiColour (r, g, b) {
  if (r === g && g === b) {
    if (r < 8) {
      return 16
    }

    if (r > 248) {
      return 231
    }

    return Math.round(((r - 8) / 247) * 24) + 232
  }

  const ansi = 16
    + (36 * Math.round(r / 255 * 5))
    + (6 * Math.round(g / 255 * 5))
    + Math.round(b / 255 * 5)

  return ansi
}

function print(image) {
  if (b) {
  printDiv(image)
  } else {
  printCanvas(image)
  }
}

function printCanvas(image) {
  const canvas = document.querySelector('#canvas')
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = 'black'
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
  console.log(letterCount, rowHeight)
}

function printDiv(image) {
  const display = document.querySelector('.display')
  display.style.fontFamily = 'Monospace'
  display.style.fontSize = '12px'
  display.style.backgroundColor = 'black'
  display.innerHTML = ''

  image.forEach(row => {
    const div = document.createElement('div')
    row.forEach(cell => {
      const span = document.createElement('span')
      const { rgba, char } = cell
       span.style.color = `rgba(${rgba.r},${rgba.g},${rgba.b},${rgba.a})`
      span.innerHTML = char
      div.appendChild(span)
    })
    display.appendChild(div)
  })
}


const vid = document.querySelector('video')
navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => {
    vid.srcObject = stream
    return vid.play()
  })
  .then(() => {
    setInterval(() => takeASnap().then(download), 200)
    const btn = document.querySelector('#video-button')
    btn.disabled = false;
    btn.onclick = () => {
      b = true
      takeASnap()
        .then(download)
    }
  })

function takeASnap() {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  canvas.width = 800
  canvas.height = 600
  ctx.drawImage(vid, 0,0)
  return new Promise((res, rej)=>{
    canvas.toBlob(res, 'image/jpeg')
  })
}


function download (blob){
  const reader = new FileReader()
  reader.onload = evt => {
    convert(evt.target.result)
  }
  reader.readAsDataURL(blob)
}
