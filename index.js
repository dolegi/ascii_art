const jimp = require('jimp')

const ASCII = '`^\",:;Il!i~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$'
const file = process.argv[2]
const invert = process.argv[3] === 'invert'
const brightnessAlgo = process.argv[4]

jimp.read(file)
  .then(img => {
    img = img.resize(120,60)
    const image = []
    for(let y = 0; y < img.bitmap.height; y++) {
      image.push([])
      for(let x = 0; x < img.bitmap.width; x++) {
        const colour = img.getPixelColor(x, y)
        const rgba = jimp.intToRGBA(colour)
        const b = brightness(rgba.r, rgba.g, rgba.b, rgba.a)
        let char
        if (invert) {
          char = getColour(255-rgba.r, 255-rgba.g, 255-rgba.b) + getAscii(b)
        } else {
          char = getColour(rgba.r, rgba.g, rgba.b) + getAscii(b)
        }
        image[y].push(char)
      }
    }
    print(image)
  })

function brightness (r, g, b, a) {
  switch (brightnessAlgo) {
    case 'min_max':
      return (Math.max(r, g, b) - Math.min(r, g, b))/2
    case 'luminosity':
      return 0.21*r + 0.72*g + 0.07*b
    default:
      return (r + g + b + a) / 4
  }
}

function getAscii(colour) {
  if (invert) {
    return ASCII[ASCII.length-1-Math.floor(((ASCII.length-1) / 255) * colour)]
  } else {
    return ASCII[Math.floor(((ASCII.length-1) / 255) * colour)]
  }
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
  image.forEach(row => {
    row.forEach(cell => {
      process.stdout.write(cell)
    })
    process.stdout.write('\n')
  })
}
