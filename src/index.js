const jimp = require('jimp').default

const ASCII = '`^\",:;Il!i~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$'

function convert(url) {
  return jimp.read(url)
    .then(img => {
      img = img.resize(120,60)
      const image = []
      for(let y = 0; y < img.bitmap.height; y++) {
        image.push([])
        for(let x = 0; x < img.bitmap.width; x++) {
          const colour = img.getPixelColor(x, y)
          const rgba = jimp.intToRGBA(colour)
          const b = brightness(rgba.r, rgba.g, rgba.b, rgba.a)
          const char =  getAscii(b)
          image[y].push(char)
        }
      }
      print(image)
    })
}
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
  const display = document.querySelector('.display')
  display.style.fontFamily = 'Monospace'
  display.style.fontSize = '6px'

  image.forEach(row => {
    const div = document.createElement('div')
    row.forEach(cell => {
      const span = document.createElement('span')
      span.innerHTML = cell
      div.appendChild(span)
    })
    display.appendChild(div)
  })
}
