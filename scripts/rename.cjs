const fs = require('fs')
const path = require('path')

// rename .js to .mjs
fs.rename(path.resolve(__dirname, '../esm/index.js'), path.resolve(__dirname, '../esm/index.mjs'), function (err) {
  if (err) console.log('ERROR: ' + err)
})
