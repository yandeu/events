import { Events } from '../lib/index.js'

describe('Events', function tests() {
  'use strict'

  describe('Events#emit', function () {
    it('should return false when there are not events to emit', function () {
      var e = new Events()

      expect(e.emit('foo')).toBe(false)
      expect(e.emit('bar')).toBe(false)
    })

    it('emits with context', function (done) {
      var context = { bar: 'baz' },
        e = new Events()

      e.on(
        'foo',
        function (bar) {
          expect(bar).toBe('bar')
          expect(this).toBe(context)

          done()
        },
        context
      ).emit('foo', 'bar')
    })

    it('emits with context, multiple arguments (force apply)', function (done) {
      var context = { bar: 'baz' },
        e = new Events()

      e.on(
        'foo',
        function (bar) {
          expect(bar).toBe('bar')
          expect(this).toBe(context)

          done()
        },
        context
      ).emit('foo', 'bar', 1, 2, 3, 4, 5, 6, 7, 8, 9, 0)
    })

    it('can emit the function with multiple arguments', function () {
      var e = new Events()

      for (var i = 0; i < 100; i++) {
        ;(function (j) {
          for (var i = 0, args = []; i < j; i++) {
            args.push(j)
          }

          e.once('args', function () {
            expect(arguments.length).toBe(args.length)
          })

          e.emit.apply(e, ['args'].concat(args))
        })(i)
      }
    })

    it('can emit the function with multiple arguments, multiple listeners', function () {
      var e = new Events()

      for (var i = 0; i < 100; i++) {
        ;(function (j) {
          for (var i = 0, args = []; i < j; i++) {
            args.push(j)
          }

          e.once('args', function () {
            expect(arguments.length).toBe(args.length)
          })

          e.once('args', function () {
            expect(arguments.length).toBe(args.length)
          })

          e.once('args', function () {
            expect(arguments.length).toBe(args.length)
          })

          e.once('args', function () {
            expect(arguments.length).toBe(args.length)
          })

          e.emit.apply(e, ['args'].concat(args))
        })(i)
      }
    })

    it('emits with context, multiple listeners (force loop)', function () {
      var e = new Events()

      // .addListener is an alias of .on
      e.addListener(
        'foo',
        function (bar) {
          expect(this).toMatchObject({ foo: 'bar' })
          expect(bar).toBe('bar')
        },
        { foo: 'bar' }
      )

      e.on(
        'foo',
        function (bar) {
          expect(this).toMatchObject({ bar: 'baz' })
          expect(bar).toBe('bar')
        },
        { bar: 'baz' }
      )

      e.emit('foo', 'bar')
    })

    it('emits with different contexts', function () {
      var e = new Events(),
        pattern = ''

      function writer() {
        pattern += this
      }

      e.on('write', writer, 'foo')
      e.on('write', writer, 'baz')
      e.once('write', writer, 'bar')
      e.once('write', writer, 'banana')

      e.emit('write')
      expect(pattern).toBe('foobazbarbanana')
    })

    it('should return true when there are events to emit', function () {
      var e = new Events(),
        called = 0

      e.on('foo', function () {
        called++
      })

      expect(e.emit('foo')).toBe(true)
      expect(e.emit('foob')).toBe(false)
      expect(called).toBe(1)
    })

    it('receives the emitted events', function (done) {
      var e = new Events()

      e.on('data', function (a, b, c, d, undef) {
        expect(a).toBe('foo')
        expect(b).toBe(e)
        expect(c).toBeInstanceOf(Date)
        expect(undef).toBe(undefined)
        expect(arguments.length).toBe(3)

        done()
      })

      e.emit('data', 'foo', e, new Date())
    })

    it('emits to all event listeners', function () {
      var e = new Events(),
        pattern = []

      e.on('foo', function () {
        pattern.push('foo1')
      })

      e.on('foo', function () {
        pattern.push('foo2')
      })

      e.emit('foo')

      expect(pattern.join(';')).toBe('foo1;foo2')
    })
    ;(function each(keys) {
      var key = keys.shift()

      if (!key) return

      it('can store event which is a known property: ' + key, function (next) {
        var e = new Events()

        e.on(key, function (k) {
          expect(k).toBe(key)
          next()
        }).emit(key, key)
      })

      each(keys)
    })(['hasOwnProperty', 'constructor', '__proto__', 'toString', 'toValue', 'unwatch', 'watch'])
  })

  describe('Events#listeners', function () {
    it('returns an empty array if no listeners are specified', function () {
      var e = new Events()

      expect(Array.isArray(e.listeners('foo'))).toBe(true)
      expect(e.listeners('foo').length).toBe(0)
    })

    it('returns an array of function', function () {
      var e = new Events()

      function foo() {}

      e.on('foo', foo)
      expect(Array.isArray(e.listeners('foo'))).toBe(true)
      expect(e.listeners('foo').length).toBe(1)
      expect(e.listeners('foo')).toMatchObject([foo])
    })

    it('is not vulnerable to modifications', function () {
      var e = new Events()

      function foo() {}

      e.on('foo', foo)

      expect(e.listeners('foo')).toMatchObject([foo])

      e.listeners('foo').length = 0
      expect(e.listeners('foo')).toMatchObject([foo])
    })
  })

  describe('Events#listenerCount', function () {
    it('returns the number of listeners for a given event', function () {
      var e = new Events()

      expect(e.listenerCount()).toBe(0)
      expect(e.listenerCount('foo')).toBe(0)

      e.on('foo', function () {})
      expect(e.listenerCount('foo')).toBe(1)
      e.on('foo', function () {})
      expect(e.listenerCount('foo')).toBe(2)
    })
  })

  describe('Events#on', function () {
    it('throws an error if the listener is not a function', function () {
      var e = new Events()

      try {
        e.on('foo', 'bar')
      } catch (ex) {
        expect(ex).toBeInstanceOf(TypeError)
        expect(ex.message).toBe('The listener must be a function')
        return
      }

      throw new Error('oops')
    })
  })

  describe('Events#once', function () {
    it('only emits it once', function () {
      var e = new Events(),
        calls = 0

      e.once('foo', function () {
        calls++
      })

      e.emit('foo')
      e.emit('foo')
      e.emit('foo')
      e.emit('foo')
      e.emit('foo')

      expect(e.listeners('foo').length).toBe(0)
      expect(calls).toBe(1)
    })

    it('only emits once if emits are nested inside the listener', function () {
      var e = new Events(),
        calls = 0

      e.once('foo', function () {
        calls++
        e.emit('foo')
      })

      e.emit('foo')
      expect(e.listeners('foo').length).toBe(0)
      expect(calls).toBe(1)
    })

    it('only emits once for multiple events', function () {
      var e = new Events(),
        multi = 0,
        foo = 0,
        bar = 0

      e.once('foo', function () {
        foo++
      })

      e.once('foo', function () {
        bar++
      })

      e.on('foo', function () {
        multi++
      })

      e.emit('foo')
      e.emit('foo')
      e.emit('foo')
      e.emit('foo')
      e.emit('foo')

      expect(e.listeners('foo').length).toBe(1)
      expect(multi).toBe(5)
      expect(foo).toBe(1)
      expect(bar).toBe(1)
    })

    it('only emits once with context', function (done) {
      var context = { foo: 'bar' },
        e = new Events()

      e.once(
        'foo',
        function (bar) {
          expect(this).toBe(context)
          expect(bar).toBe('bar')

          done()
        },
        context
      ).emit('foo', 'bar')
    })
  })

  describe('Events#removeListener', function () {
    it('removes all listeners when the listener is not specified', function () {
      var e = new Events()

      e.on('foo', function () {})
      e.on('foo', function () {})

      // .off is an alias of .removeListener
      expect(e.off('foo')).toBe(e)
      expect(e.listeners('foo')).toMatchObject([])
    })

    it('removes only the listeners matching the specified listener', function () {
      var e = new Events()

      function foo() {}
      function bar() {}
      function baz() {}

      e.on('foo', foo)
      e.on('bar', bar)
      e.on('bar', baz)

      expect(e.removeListener('foo', bar)).toBe(e)
      expect(e.listeners('bar')).toMatchObject([bar, baz])
      expect(e.listeners('foo')).toMatchObject([foo])
      expect(e._eventsCount).toBe(2)

      expect(e.removeListener('foo', foo)).toBe(e)
      expect(e.listeners('bar')).toMatchObject([bar, baz])
      expect(e.listeners('foo')).toMatchObject([])
      expect(e._eventsCount).toBe(1)

      expect(e.removeListener('bar', bar)).toBe(e)
      expect(e.listeners('bar')).toMatchObject([baz])
      expect(e._eventsCount).toBe(1)

      expect(e.removeListener('bar', baz)).toBe(e)
      expect(e.listeners('bar')).toMatchObject([])
      expect(e._eventsCount).toBe(0)

      e.on('foo', foo)
      e.on('foo', foo)
      e.on('bar', bar)

      expect(e.removeListener('foo', foo)).toBe(e)
      expect(e.listeners('bar')).toMatchObject([bar])
      expect(e.listeners('foo')).toMatchObject([])
      expect(e._eventsCount).toBe(1)
    })

    it('removes only the once listeners when using the once flag', function () {
      var e = new Events()

      function foo() {}

      e.on('foo', foo)

      expect(e.removeListener('foo', function () {}, undefined, true)).toBe(e)
      expect(e.listeners('foo')).toMatchObject([foo])
      expect(e._eventsCount).toBe(1)

      expect(e.removeListener('foo', foo, undefined, true)).toBe(e)
      expect(e.listeners('foo')).toMatchObject([foo])
      expect(e._eventsCount).toBe(1)

      expect(e.removeListener('foo', foo)).toBe(e)
      expect(e.listeners('foo')).toMatchObject([])
      expect(e._eventsCount).toBe(0)

      e.once('foo', foo)
      e.on('foo', foo)

      expect(e.removeListener('foo', function () {}, undefined, true)).toBe(e)
      expect(e.listeners('foo')).toMatchObject([foo, foo])
      expect(e._eventsCount).toBe(1)

      expect(e.removeListener('foo', foo, undefined, true)).toBe(e)
      expect(e.listeners('foo')).toMatchObject([foo])
      expect(e._eventsCount).toBe(1)

      e.once('foo', foo)

      expect(e.removeListener('foo', foo)).toBe(e)
      expect(e.listeners('foo')).toMatchObject([])
      expect(e._eventsCount).toBe(0)
    })

    it('removes only the listeners matching the correct context', function () {
      var context = { foo: 'bar' },
        e = new Events()

      function foo() {}
      function bar() {}

      e.on('foo', foo, context)

      expect(e.removeListener('foo', function () {}, context)).toBe(e)
      expect(e.listeners('foo')).toMatchObject([foo])
      expect(e._eventsCount).toBe(1)

      expect(e.removeListener('foo', foo, { baz: 'quux' })).toBe(e)
      expect(e.listeners('foo')).toMatchObject([foo])
      expect(e._eventsCount).toBe(1)

      expect(e.removeListener('foo', foo, context)).toBe(e)
      expect(e.listeners('foo')).toMatchObject([])
      expect(e._eventsCount).toBe(0)

      e.on('foo', foo, context)
      e.on('foo', bar)

      expect(e.removeListener('foo', foo, { baz: 'quux' })).toBe(e)
      expect(e.listeners('foo')).toMatchObject([foo, bar])
      expect(e._eventsCount).toBe(1)

      expect(e.removeListener('foo', foo, context)).toBe(e)
      expect(e.listeners('foo')).toMatchObject([bar])
      expect(e._eventsCount).toBe(1)

      e.on('foo', bar, context)

      expect(e.removeListener('foo', bar)).toBe(e)
      expect(e.listeners('foo')).toMatchObject([])
      expect(e._eventsCount).toBe(0)
    })
  })

  describe('Events#removeAllListeners', function () {
    it('removes all events for the specified events', function () {
      var e = new Events()

      e.on('foo', function () {
        throw new Error('oops')
      })
      e.on('foo', function () {
        throw new Error('oops')
      })
      e.on('bar', function () {
        throw new Error('oops')
      })
      e.on('aaa', function () {
        throw new Error('oops')
      })

      expect(e.removeAllListeners('foo')).toBe(e)
      expect(e.listeners('foo').length).toBe(0)
      expect(e.listeners('bar').length).toBe(1)
      expect(e.listeners('aaa').length).toBe(1)
      expect(e._eventsCount).toBe(2)

      expect(e.removeAllListeners('bar')).toBe(e)
      expect(e._eventsCount).toBe(1)
      expect(e.removeAllListeners('aaa')).toBe(e)
      expect(e._eventsCount).toBe(0)

      expect(e.emit('foo')).toBe(false)
      expect(e.emit('bar')).toBe(false)
      expect(e.emit('aaa')).toBe(false)
    })

    it('just nukes the fuck out of everything', function () {
      var e = new Events()

      e.on('foo', function () {
        throw new Error('oops')
      })
      e.on('foo', function () {
        throw new Error('oops')
      })
      e.on('bar', function () {
        throw new Error('oops')
      })
      e.on('aaa', function () {
        throw new Error('oops')
      })

      expect(e.removeAllListeners()).toBe(e)
      expect(e.listeners('foo').length).toBe(0)
      expect(e.listeners('bar').length).toBe(0)
      expect(e.listeners('aaa').length).toBe(0)
      expect(e._eventsCount).toBe(0)

      expect(e.emit('foo')).toBe(false)
      expect(e.emit('bar')).toBe(false)
      expect(e.emit('aaa')).toBe(false)
    })
  })

  describe('Events#eventNames', function () {
    it('returns an empty array when there are no events', function () {
      var e = new Events()

      expect(e.eventNames()).toMatchObject([])

      e.on('foo', function () {})
      e.removeAllListeners('foo')

      expect(e.eventNames()).toMatchObject([])
    })

    it('returns an array listing the events that have listeners', function () {
      var e = new Events(),
        original

      function bar() {}

      // if (Object.getOwnPropertySymbols) {
      //   //
      //   // Monkey patch `Object.getOwnPropertySymbols()` to increase coverage
      //   // on Node.js > 0.10.
      //   //
      //   original = Object.getOwnPropertySymbols
      //   Object.getOwnPropertySymbols = undefined
      // }

      e.on('foo', function () {})
      e.on('bar', bar)

      try {
        expect(e.eventNames()).toMatchObject(['foo', 'bar'])
        e.removeListener('bar', bar)
        expect(e.eventNames()).toMatchObject(['foo'])
      } catch (ex) {
        throw ex
      } finally {
        if (original) Object.getOwnPropertySymbols = original
      }
    })

    // it('does not return inherited property identifiers', function () {
    //   var e = new Events()

    //   function Collection() {}
    //   Collection.prototype.foo = function () {
    //     return 'foo'
    //   }

    //   e._events = new Collection()

    //   expect(e._events.foo()).toBe('foo')
    //   expect(e.eventNames()).toMatchObject([])
    // })

    // if ('undefined' !== typeof Symbol)
    //   it('includes ES6 symbols', function () {
    //     var e = new Events(),
    //       s = Symbol('s')

    //     function foo() {}

    //     e.on('foo', foo)
    //     e.on(s, function () {})

    //     expect(e.eventNames()).toMatchObject(['foo', s])

    //     e.removeListener('foo', foo)

    //     expect(e.eventNames()).toMatchObject([s])
    //   })
  })
})
