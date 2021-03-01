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

// (ECMAScript Modules for Node.js 15+)
// import { Events } from '@yandeu/events/esm/index.mjs'

const events = new Events()

events.on('message', msg => {
  console.log(`Message: ${msg}`)
})

events.emit('message', 'Hello there!')

// will print: Message: Hello there!
```

## TypeScript

```ts
interface EventMap {
  signal: () => void
  error: (err: string) => void
  something: (a: number, b: { color?: string }, c: [number, number, string]) => void
}

const events = new Events<EventMap>()

events.on('something', (a, b, c) => {
  console.log(a, b.color, c)
})

events.emit('something', 1, { color: 'blue' }, [2, 2, 'k'])
```

## License

[MIT](LICENSE)
