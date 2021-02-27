/**
 * @author       Arnout Kazemier (https://github.com/3rd-Eden)
 * @copyright    Copyright (c) 2014 Arnout Kazemier
 * @license      {@link https://github.com/primus/eventemitter3/blob/master/LICENSE|MIT}
 *
 * @author       Yannick Deubel (https://github.com/yandeu)
 * @copyright    Copyright (c) 2021 Yannick Deubel; Project Url: https://github.com/yandeu/events
 * @license      {@link https://github.com/yandeu/events/blob/master/LICENSE|MIT}
 */

export type Context = any
export type Once = boolean
export type EventTypes = string
export type EventName = string
export type EventArg = any

const has = Object.prototype.hasOwnProperty
const prefix = '~'

interface _Events {
  [key: string]: any
}

class _Events {}

class EE {
  constructor(public fn: Function, public context: Context, public once: Once = false) {}
}

const addListener = (emitter: Events, event: EventName, fn: Function, context: Context, once: Once): Events => {
  if (typeof fn !== 'function') {
    throw new TypeError('The listener must be a function')
  }

  const listener = new EE(fn, context || emitter, once)
  const evt = prefix ? prefix + event : event

  if (!emitter._events[evt]) (emitter._events[evt] = listener), emitter._eventsCount++
  else if (!emitter._events[evt].fn) emitter._events[evt].push(listener)
  else emitter._events[evt] = [emitter._events[evt], listener]

  return emitter
}

const clearEvent = (emitter: Events, evt: string) => {
  if (--emitter._eventsCount === 0) emitter._events = new _Events()
  else delete emitter._events[evt]
}

export class Events {
  public prefixed: string = prefix

  public _events: _Events = new _Events()
  public _eventsCount: number = 0

  eventNames(): EventName[] {
    let names: EventName[] = []
    let events: _Events
    let name: EventName

    if (this._eventsCount === 0) return names

    for (name in (events = this._events)) {
      if (has.call(events, name)) names.push(prefix ? name.slice(1) : name)
    }

    return names
  }

  listeners(event: EventName) {
    const evt = prefix ? prefix + event : event
    const handlers = this._events[evt]

    if (!handlers) return []
    if (handlers.fn) return [handlers.fn]

    for (var i = 0, l = handlers.length, ee = new Array(l); i < l; i++) {
      ee[i] = handlers[i].fn
    }

    return ee
  }

  listenerCount(event: EventName): number {
    let evt = prefix ? prefix + event : event,
      listeners = this._events[evt]

    if (!listeners) return 0
    if (listeners.fn) return 1
    return listeners.length
  }

  emit(event: EventName, ...args: EventArg[]): boolean {
    let evt = prefix ? prefix + event : event

    if (!this._events[evt]) return false

    let listeners = this._events[evt]
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

  on(event: EventName, fn: Function, context?: Context): Events {
    return addListener(this, event, fn, context, false)
  }

  once(event: EventName, fn: Function, context?: Context): Events {
    return addListener(this, event, fn, context, true)
  }

  removeListener(event: EventName, fn: Function, context: Context, once: Once) {
    let evt = prefix ? prefix + event : event

    if (!this._events[evt]) return this
    if (!fn) {
      clearEvent(this, evt)
      return this
    }

    let listeners = this._events[evt]

    if (listeners.fn) {
      if (listeners.fn === fn && (!once || listeners.once) && (!context || listeners.context === context)) {
        clearEvent(this, evt)
      }
    } else {
      for (var i = 0, events = [], length = listeners.length; i < length; i++) {
        if (listeners[i].fn !== fn || (once && !listeners[i].once) || (context && listeners[i].context !== context)) {
          events.push(listeners[i])
        }
      }

      // Reset the array, or remove it completely if we have no more listeners.
      if (events.length) this._events[evt] = events.length === 1 ? events[0] : events
      else clearEvent(this, evt)
    }

    return this
  }

  removeAllListeners(event?: EventName): Events {
    let evt

    if (event) {
      evt = prefix ? prefix + event : event
      if (this._events[evt]) clearEvent(this, evt)
    } else {
      this._events = new _Events()
      this._eventsCount = 0
    }

    return this
  }

  // alias
  get off() {
    return this.removeListener
  }

  // alias
  get addListener() {
    return this.on
  }
}
