const main = async () => {
  const moduleEvents = await import('../lib/index.js')
  const Events = moduleEvents.Events

  const events = new Events()

  events.on('message', msg => {
    console.log(`Got message: ${msg}`)
  })

  events.emit('message', 'Hello there!')
}

main()
