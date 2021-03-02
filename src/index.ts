/**
 * @package      npmjs.com/package/@yandeu/events (events.min.js)
 *
 * @author       Arnout Kazemier (https://github.com/3rd-Eden)
 * @copyright    Copyright (c) 2014 Arnout Kazemier
 * @license      {@link https://github.com/primus/eventemitter3/blob/master/LICENSE|MIT}
 *
 * @author       Yannick Deubel (https://github.com/yandeu)
 * @copyright    Copyright (c) 2021 Yannick Deubel; Project Url: https://github.com/yandeu/events
 * @license      {@link https://github.com/yandeu/events/blob/master/LICENSE|MIT}
 */

import { VERSION } from './version'

export type ValidEventMap<T = any> = T extends {
  [P in keyof T]: (...args: any[]) => void
}
  ? T
  : never

export type Handler<T extends Object | ((...args: any[]) => R), R = any> = T

export type EventListener<T extends ValidEventMap, K extends EventNames<T>> = T extends string | symbol
  ? (...args: any[]) => void
  : K extends keyof T
  ? Handler<T[K], void>
  : never

export type EventArgs<T extends ValidEventMap, K extends EventNames<T>> = Parameters<EventListener<T, K>>

export type EventNames<T extends ValidEventMap> = T extends string | symbol ? T : keyof T

class EE {
  constructor(public fn: any, public context: any, public once = false) {}
}

const addListener = (emitter: Events<any>, event: any, fn: any, context: any, once: any) => {
  if (typeof fn !== 'function') {
    throw new TypeError('The listener must be a function')
  }

  const listener = new EE(fn, context || emitter, once)

  if (!emitter._events.has(event)) emitter._events.set(event, listener), emitter._eventsCount++
  else if (!emitter._events.get(event).fn) emitter._events.get(event).push(listener)
  else emitter._events.set(event, [emitter._events.get(event), listener])

  return emitter
}

const clearEvent = (emitter: Events<any>, event: any) => {
  if (--emitter._eventsCount === 0) emitter._events = new Map()
  else emitter._events.delete(event)
}

export class Events<EventMap extends ValidEventMap = any> {
  static get VERSION() {
    return VERSION
  }

  _events: Map<EventNames<EventMap>, any> = new Map()
  _eventsCount = 0

  public eventNames() {
    return Array.from(this._events.keys())
  }

  public listeners(event: EventNames<EventMap>) {
    const handlers = this._events.get(event)

    if (!handlers) return []
    if (handlers.fn) return [handlers.fn]

    for (var i = 0, l = handlers.length, ee = new Array(l); i < l; i++) {
      ee[i] = handlers[i].fn
    }

    return ee
  }

  public listenerCount(event: EventNames<EventMap>) {
    let listeners = this._events.get(event)

    if (!listeners) return 0
    if (listeners.fn) return 1
    return listeners.length
  }

  public emit<T extends EventNames<EventMap>>(event: T, ...args: EventArgs<EventMap, T>) {
    if (!this._events.has(event)) return false

    let listeners = this._events.get(event)
    let i

    if (listeners.fn) {
      if (listeners.once) this.removeListener(event, listeners.fn, undefined, true)
      return listeners.fn.call(listeners.context, ...args), true
    } else {
      let length = listeners.length

      for (i = 0; i < length; i++) {
        if (listeners[i].once) this.removeListener(event, listeners[i].fn, undefined, true)
        listeners[i].fn.call(listeners[i].context, ...args)
      }
    }

    return true
  }

  public on<T extends EventNames<EventMap>>(event: T, fn: EventListener<EventMap, T>, context?: any) {
    return addListener(this, event, fn, context, false)
  }

  public once<T extends EventNames<EventMap>>(event: T, fn: EventListener<EventMap, T>, context?: any) {
    return addListener(this, event, fn, context, true)
  }

  public removeListener<T extends EventNames<EventMap>>(
    event: T,
    fn?: EventListener<EventMap, T>,
    context?: any,
    once?: boolean
  ) {
    if (!this._events.has(event)) return this
    if (!fn) {
      clearEvent(this, event)
      return this
    }

    let listeners = this._events.get(event)

    if (listeners.fn) {
      if (listeners.fn === fn && (!once || listeners.once) && (!context || listeners.context === context)) {
        clearEvent(this, event)
      }
    } else {
      for (var i = 0, events = [], length = listeners.length; i < length; i++) {
        if (listeners[i].fn !== fn || (once && !listeners[i].once) || (context && listeners[i].context !== context)) {
          events.push(listeners[i])
        }
      }

      // Reset the array, or remove it completely if we have no more listeners.
      if (events.length) this._events.set(event, events.length === 1 ? events[0] : events)
      else clearEvent(this, event)
    }

    return this
  }

  public removeAllListeners(event?: EventNames<EventMap>) {
    if (event) {
      if (this._events.delete(event)) clearEvent(this, event)
    } else {
      this._events = new Map()
      this._eventsCount = 0
    }

    return this
  }

  // alias
  public get off() {
    return this.removeListener
  }

  // alias
  public get addListener() {
    return this.on
  }
}

/** TESTING SECTION */

// type Colors = 'red' | 'blue' | 'yellow'

// interface EventMap {
//   signal: () => void
//   error: (err: string) => void
//   something: (a: number, b: { colors?: Colors[] }, c: [number, number, string]) => void
// }

// const test = new Events<EventMap>()

// const listener: EventListener<EventMap, 'something'> = (a, b, c) => {
//   console.log(a, b.colors, c)
// }

// test.on('something', listener)

// setTimeout(() => {
//   test.removeListener('something', listener)
// }, 5000)

// test.once('error', err => {
//   console.log('error:', err)
// })

// console.log(test.eventNames())

// test.emit('error', 'ok')
// test.emit('error', 'failed')
// test.emit('something', 1234, { colors: ['blue'] }, [3, 3, 'k'])
