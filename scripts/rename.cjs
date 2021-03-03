/**
 * @description rename .js to .mjs (or .cjs)
 */

const fs = require('fs')
const path = require('path')

const newExtension = '.mjs'
const directory = '../esm'

const dir = path.resolve(__dirname, directory)

const replaceName = fileName => {
  return fileName.replace(/\.js$/, newExtension).replace(/\.js\.map$/, newExtension + '.map')
}

const replaceReferences = (fileName, file) => {
  const fileNameWithoutExtension = path.basename(fileName).split('.').shift()

  const reg1 = new RegExp(`${fileNameWithoutExtension}\.js\.map`)
  const reg2 = new RegExp(`${fileNameWithoutExtension}\.js`)

  return file
    .replace(reg1, `${fileNameWithoutExtension}${newExtension}.map`)
    .replace(reg2, `${fileNameWithoutExtension}${newExtension}`)
}

fs.readdir(dir, (err, files) => {
  if (err) return console.log('ERROR: ' + err)

  for (const file of files) {
    const fileName = `${dir}/${file}`

    const newFileName = replaceName(fileName)

    // rename file
    fs.rename(fileName, newFileName, err => {
      if (err) return console.log('ERROR: ' + err)

      // replace reference inside files
      fs.readFile(newFileName, 'utf8', (err, data) => {
        if (err) return console.log('ERROR: ' + err)

        const modification = replaceReferences(fileName, data)

        // overwrite file
        fs.writeFile(newFileName, modification, 'utf8', err => {
          if (err) return console.log('ERROR: ' + err)
        })
      })
    })
  }
})
