# Events

Simplified and TypeScripted version of EventEmitter3@4.0.7  
(_no support for Symbols_)

## Installation

```console
npm install @yandeu/events
```

## CDN

```console
// ES2015+
https://unpkg.com/@yandeu/events/umd/events.min.js

// ES5
https://unpkg.com/@yandeu/events/umd/events.es5.min.js
```

## Usage

```ts
const { Events } = require('@yandeu/events')

// (experimental ECMAScript modules for Node.js)
// import { Events } from '@yandeu/events/esm/index.mjs'

const events = new Events()

events.on('message', msg => {
  console.log(`Got message: ${msg}`)
})

events.emit('message', 'Hello there!')

// will print: Got message: Hello there!
```

## License

[MIT](LICENSE)
