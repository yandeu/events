import { Events } from '../esm/index.mjs'

const events = new Events()

events.on('message', msg => {
  console.log(`Got message: ${msg}`)
})

events.emit('message', 'Hello there!')
