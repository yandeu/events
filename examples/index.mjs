import { Events } from '../lib/index.js'

const events = new Events()

events.on('message', msg => {
  console.log(`Got message: ${msg}`)
})

events.emit('message', 'Hello there!')
