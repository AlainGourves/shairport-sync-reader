// Usage : `$ node test.js`

// import the module
const ShairportReader = require('./shairport-sync-reader')
// const util = require('util')
const fs = require('fs')
// pour obtenir les dimensions des images (cf. https://github.com/image-size/image-size)
const sizeOf = require('image-size')

const signatureJPEG = Buffer.from([0xFF, 0xD8, 0xFF])
const signaturePNG = Buffer.from([0x89, 0x50, 0x4E])

// read from pipe
let pipeReader = new ShairportReader({
  path: '/tmp/shairport-sync-metadata'
})

function map (x, inMin, inMax, outMin, outMax) {
  return (x - inMin) * (outMax - outMin) / (inMax - inMin) + outMin
}

function elapsed (progress) {
  return Math.floor((progress.current - progress.start) / 44100)
}

function formatTime (t) {
  // affiche les temps sous la forme : '4:05'
  return Math.floor(t / 60) + ':' + (t % 60).toString().padStart(2, '0')
}

pipeReader.on('meta', function (meta) {
  console.log('Metadata Reçues !\n')
  console.log(meta.asar)
  console.log(meta.minm)
  console.log(meta.asal)
  console.log(formatTime(Math.floor(meta.astm / 1000))) // durée en secondes
}).on('pvol', function (pvol) {
  console.log(pvol)
  console.log(map(pvol.volume, pvol.lowest, pvol.highest, 0, 100))
}).on('prgr', function (prgr) {
  let t = elapsed(prgr)
  if (t !== 0) {
    console.log('écoulé: ' + formatTime(elapsed(prgr)))
  }
}).on('pfls', function (pfls) {
  console.log('Reçu pfls ! (play stream flush)\n')
}).on('PICT', function (PICT) {
  let buf = Buffer.from(PICT, 'base64')
  // find image type
  let imageType = ''
  if (buf.compare(signatureJPEG, 0, 3, 0, 3) === 0) {
    // compare les 3 premier bytes avec la signature pour connaître le type de l'image
    imageType = 'jpg'
  } else if (buf.compare(signaturePNG, 0, 3, 0, 3) === 0) {
    imageType = 'png'
  }
  // Enregistrement fichier
  if (imageType !== '') {
    let img = 'test/artwork.' + imageType
    fs.writeFile(img, buf, (err) => {
      if (err) {
        throw new Error('error writing file: ' + err)
      }
      // fs.writeFile est asynchrone : il faut attendre que le fichier soit effectivement créé pour obtenir ses dimensions
      console.log('Artwork enregistré !')
      let dimensions = sizeOf(img)
      console.log('Dimensions : ' + dimensions.width + 'x' + dimensions.height + 'px')
    })
  }
})
