/**
 * @author       Arnout Kazemier (https://github.com/3rd-Eden)
 * @copyright    Copyright (c) 2014 Arnout Kazemier
 * @license      {@link https://github.com/primus/eventemitter3/blob/master/LICENSE|MIT}
 *
 * @author       Yannick Deubel (https://github.com/yandeu)
 * @copyright    Copyright (c) 2021 Yannick Deubel; Project Url: https://github.com/yandeu/events
 * @license      {@link https://github.com/yandeu/events/blob/master/LICENSE|MIT}
 */

const a = {}

interface EventMap {
  signal: () => void
  error: (err: string) => void
  something: (a: number, b: { hello: string }, c: [number, number, string]) => void
}

type ValidEventMap<T = any> = T extends {
  [P in keyof T]: (...args: any[]) => void
}
  ? T
  : never

type Handler<T extends Object | ((...args: any[]) => R), R = any> = T

type EventListener<T extends ValidEventMap, K extends EventNames<T>> = T extends string | symbol
  ? (...args: any[]) => void
  : K extends keyof T
  ? Handler<T[K], void>
  : never

type EventArgs<T extends ValidEventMap, K extends EventNames<T>> = Parameters<EventListener<T, K>>

type EventNames<T extends ValidEventMap> = T extends string | symbol ? T : keyof T

export class Events<EventMap extends ValidEventMap> {
  _events: Map<EventNames<EventMap>, any> = new Map()
  _eventsCount = 0

  public eventNames() {
    return Array.from(this._events.keys())
  }
  public on<T extends EventNames<EventMap>>(event: T, fn: EventListener<EventMap, T>) {}

  public emit<T extends EventNames<EventMap>>(event: T, ...args: EventArgs<EventMap, T>) {}
}

const events = new Events<EventMap>()

events.on('something', (a, b, c) => {
  console.log(a)
})

console.log(events.eventNames())

events.emit('error', 'asfd')

events.emit('error', 'asfdasf')

events.emit('something', 2, { hello: 'sdf' }, [3, 3, 'k'])
