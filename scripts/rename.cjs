/**
 * @description rename .js to .mjs
 */

const fs = require('fs')
const path = require('path')

const dir = path.resolve(__dirname, '../esm')

const replaceName = fileName => {
  return fileName.replace(/\.js$/, '.mjs').replace(/\.js\.map$/, '.mjs.map')
}

const replaceReferences = (fileName, file) => {
  const fileNameWithoutExtension = path.basename(fileName).split('.').shift()

  const reg1 = new RegExp(`${fileNameWithoutExtension}\.js\.map`)
  const reg2 = new RegExp(`${fileNameWithoutExtension}\.js`)

  return file.replace(reg1, `${fileNameWithoutExtension}.mjs.map`).replace(reg2, `${fileNameWithoutExtension}.mjs`)
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
