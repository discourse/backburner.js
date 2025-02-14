define('backburner-tests', ['backburner'], function (Backburner) { 'use strict';

    var Backburner__default = 'default' in Backburner ? Backburner['default'] : Backburner;

    var skipIfNotSupported = !!console['createTask'] ? QUnit.test : QUnit.skip;
    QUnit.module('tests/async_stacks');
    QUnit.test('schedule - does not affect normal behaviour', function (assert) {
        var bb = new Backburner__default(['one']);
        var callCount = 0;
        bb.run(function () {
            bb.schedule('one', function () { return callCount += 1; });
            bb.schedule('one', function () { return callCount += 1; });
        });
        assert.strictEqual(callCount, 2, 'schedule works correctly with ASYNC_STACKS disabled');
        bb.ASYNC_STACKS = true;
        bb.run(function () {
            bb.schedule('one', function () { return callCount += 1; });
            bb.schedule('one', function () { return callCount += 1; });
        });
        assert.strictEqual(callCount, 4, 'schedule works correctly with ASYNC_STACKS enabled');
    });
    skipIfNotSupported('schedule - ASYNC_STACKS flag enables async stack tagging', function (assert) {
        var bb = new Backburner__default(['one']);
        bb.schedule('one', function () { });
        assert.true(bb.currentInstance && (bb.currentInstance.queues.one.consoleTaskFor(0) === undefined), 'No consoleTask is stored');
        bb.ASYNC_STACKS = true;
        bb.schedule('one', function () { });
        var task = bb.currentInstance && bb.currentInstance.queues.one.consoleTaskFor(1);
        assert.true(!!(task === null || task === void 0 ? void 0 : task.run), 'consoleTask is stored in queue');
    });
    QUnit.test('later - ASYNC_STACKS does not affect normal behaviour', function (assert) {
        var bb = new Backburner__default(['one']);
        var done = assert.async();
        bb.ASYNC_STACKS = true;
        bb.later(function () {
            assert.true(true, 'timer called');
            done();
        });
    });
    skipIfNotSupported('later - skips async stack when ASYNC_STACKS is false', function (assert) {
        var done = assert.async();
        var bb = new Backburner__default(['one']);
        bb.later(function () {
            var task = bb.currentInstance && bb.currentInstance.queues.one.consoleTaskFor(0, true);
            assert.true(bb.currentInstance && (bb.currentInstance.queues.one.consoleTaskFor(0, true) === undefined), 'consoleTask is not stored');
            done();
        });
    });
    skipIfNotSupported('later - ASYNC_STACKS flag enables async stack tagging', function (assert) {
        var done = assert.async();
        var bb = new Backburner__default(['one']);
        bb.ASYNC_STACKS = true;
        bb.later(function () {
            var task = bb.currentInstance && bb.currentInstance.queues.one.consoleTaskFor(0, true);
            assert.true(!!(task === null || task === void 0 ? void 0 : task.run), 'consoleTask is stored in timer queue and then passed to runloop queue');
            done();
        });
    });

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function createCommonjsModule(fn, module) {
    	return module = { exports: {} }, fn(module, module.exports), module.exports;
    }

    /**
     * A reference to the global object
     *
     * @type {object} globalObject
     */
    var globalObject;

    /* istanbul ignore else */
    if (typeof commonjsGlobal !== "undefined") {
        // Node
        globalObject = commonjsGlobal;
    } else if (typeof window !== "undefined") {
        // Browser
        globalObject = window;
    } else {
        // WebWorker
        globalObject = self;
    }

    var global_1 = globalObject;

    var call = Function.call;

    var copyPrototype = function copyPrototypeMethods(prototype) {
        // eslint-disable-next-line @sinonjs/no-prototype-methods/no-prototype-methods
        return Object.getOwnPropertyNames(prototype).reduce(function(result, name) {
            // ignore size because it throws from Map
            if (
                name !== "size" &&
                name !== "caller" &&
                name !== "callee" &&
                name !== "arguments" &&
                typeof prototype[name] === "function"
            ) {
                result[name] = call.bind(prototype[name]);
            }

            return result;
        }, Object.create(null));
    };

    var array = copyPrototype(Array.prototype);

    var every = array.every;

    /**
     * @private
     */
    function hasCallsLeft(callMap, spy) {
        if (callMap[spy.id] === undefined) {
            callMap[spy.id] = 0;
        }

        return callMap[spy.id] < spy.callCount;
    }

    /**
     * @private
     */
    function checkAdjacentCalls(callMap, spy, index, spies) {
        var calledBeforeNext = true;

        if (index !== spies.length - 1) {
            calledBeforeNext = spy.calledBefore(spies[index + 1]);
        }

        if (hasCallsLeft(callMap, spy) && calledBeforeNext) {
            callMap[spy.id] += 1;
            return true;
        }

        return false;
    }

    /**
     * A Sinon proxy object (fake, spy, stub)
     *
     * @typedef {object} SinonProxy
     * @property {Function} calledBefore - A method that determines if this proxy was called before another one
     * @property {string} id - Some id
     * @property {number} callCount - Number of times this proxy has been called
     */

    /**
     * Returns true when the spies have been called in the order they were supplied in
     *
     * @param  {SinonProxy[] | SinonProxy} spies An array of proxies, or several proxies as arguments
     * @returns {boolean} true when spies are called in order, false otherwise
     */
    function calledInOrder(spies) {
        var callMap = {};
        // eslint-disable-next-line no-underscore-dangle
        var _spies = arguments.length > 1 ? arguments : spies;

        return every(_spies, checkAdjacentCalls.bind(null, callMap));
    }

    var calledInOrder_1 = calledInOrder;

    /**
     * Returns a display name for a function
     *
     * @param  {Function} func
     * @returns {string}
     */
    var functionName = function functionName(func) {
        if (!func) {
            return "";
        }

        try {
            return (
                func.displayName ||
                func.name ||
                // Use function decomposition as a last resort to get function
                // name. Does not rely on function decomposition to work - if it
                // doesn't debugging will be slightly less informative
                // (i.e. toString will say 'spy' rather than 'myFunc').
                (String(func).match(/function ([^\s(]+)/) || [])[1]
            );
        } catch (e) {
            // Stringify may fail and we might get an exception, as a last-last
            // resort fall back to empty string.
            return "";
        }
    };

    /**
     * Returns a display name for a value from a constructor
     *
     * @param  {object} value A value to examine
     * @returns {(string|null)} A string or null
     */
    function className(value) {
        return (
            (value.constructor && value.constructor.name) ||
            // The next branch is for IE11 support only:
            // Because the name property is not set on the prototype
            // of the Function object, we finally try to grab the
            // name from its definition. This will never be reached
            // in node, so we are not able to test this properly.
            // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/name
            (typeof value.constructor === "function" &&
                /* istanbul ignore next */
                functionName(value.constructor)) ||
            null
        );
    }

    var className_1 = className;

    var deprecated = createCommonjsModule(function (module, exports) {

    /**
     * Returns a function that will invoke the supplied function and print a
     * deprecation warning to the console each time it is called.
     *
     * @param  {Function} func
     * @param  {string} msg
     * @returns {Function}
     */
    exports.wrap = function(func, msg) {
        var wrapped = function() {
            exports.printWarning(msg);
            return func.apply(this, arguments);
        };
        if (func.prototype) {
            wrapped.prototype = func.prototype;
        }
        return wrapped;
    };

    /**
     * Returns a string which can be supplied to `wrap()` to notify the user that a
     * particular part of the sinon API has been deprecated.
     *
     * @param  {string} packageName
     * @param  {string} funcName
     * @returns {string}
     */
    exports.defaultMsg = function(packageName, funcName) {
        return (
            packageName +
            "." +
            funcName +
            " is deprecated and will be removed from the public API in a future version of " +
            packageName +
            "."
        );
    };

    /**
     * Prints a warning on the console, when it exists
     *
     * @param  {string} msg
     * @returns {undefined}
     */
    exports.printWarning = function(msg) {
        /* istanbul ignore next */
        if (typeof process === "object" && process.emitWarning) {
            // Emit Warnings in Node
            process.emitWarning(msg);
        } else if (console.info) {
            console.info(msg);
        } else {
            console.log(msg);
        }
    };
    });
    var deprecated_1 = deprecated.wrap;
    var deprecated_2 = deprecated.defaultMsg;
    var deprecated_3 = deprecated.printWarning;

    /**
     * Returns true when fn returns true for all members of obj.
     * This is an every implementation that works for all iterables
     *
     * @param  {object}   obj
     * @param  {Function} fn
     * @returns {boolean}
     */
    var every$1 = function every(obj, fn) {
        var pass = true;

        try {
            // eslint-disable-next-line @sinonjs/no-prototype-methods/no-prototype-methods
            obj.forEach(function() {
                if (!fn.apply(this, arguments)) {
                    // Throwing an error is the only way to break `forEach`
                    throw new Error();
                }
            });
        } catch (e) {
            pass = false;
        }

        return pass;
    };

    var sort = array.sort;
    var slice = array.slice;

    /**
     * @private
     */
    function comparator(a, b) {
        // uuid, won't ever be equal
        var aCall = a.getCall(0);
        var bCall = b.getCall(0);
        var aId = (aCall && aCall.callId) || -1;
        var bId = (bCall && bCall.callId) || -1;

        return aId < bId ? -1 : 1;
    }

    /**
     * A Sinon proxy object (fake, spy, stub)
     *
     * @typedef {object} SinonProxy
     * @property {Function} getCall - A method that can return the first call
     */

    /**
     * Sorts an array of SinonProxy instances (fake, spy, stub) by their first call
     *
     * @param  {SinonProxy[] | SinonProxy} spies
     * @returns {SinonProxy[]}
     */
    function orderByFirstCall(spies) {
        return sort(slice(spies), comparator);
    }

    var orderByFirstCall_1 = orderByFirstCall;

    var _function = copyPrototype(Function.prototype);

    var map = copyPrototype(Map.prototype);

    var object = copyPrototype(Object.prototype);

    var set = copyPrototype(Set.prototype);

    var string = copyPrototype(String.prototype);

    var prototypes = {
        array: array,
        function: _function,
        map: map,
        object: object,
        set: set,
        string: string
    };

    var typeDetect = createCommonjsModule(function (module, exports) {
    (function (global, factory) {
    	 module.exports = factory() ;
    }(commonjsGlobal, (function () {
    /* !
     * type-detect
     * Copyright(c) 2013 jake luer <jake@alogicalparadox.com>
     * MIT Licensed
     */
    var promiseExists = typeof Promise === 'function';

    /* eslint-disable no-undef */
    var globalObject = typeof self === 'object' ? self : commonjsGlobal; // eslint-disable-line id-blacklist

    var symbolExists = typeof Symbol !== 'undefined';
    var mapExists = typeof Map !== 'undefined';
    var setExists = typeof Set !== 'undefined';
    var weakMapExists = typeof WeakMap !== 'undefined';
    var weakSetExists = typeof WeakSet !== 'undefined';
    var dataViewExists = typeof DataView !== 'undefined';
    var symbolIteratorExists = symbolExists && typeof Symbol.iterator !== 'undefined';
    var symbolToStringTagExists = symbolExists && typeof Symbol.toStringTag !== 'undefined';
    var setEntriesExists = setExists && typeof Set.prototype.entries === 'function';
    var mapEntriesExists = mapExists && typeof Map.prototype.entries === 'function';
    var setIteratorPrototype = setEntriesExists && Object.getPrototypeOf(new Set().entries());
    var mapIteratorPrototype = mapEntriesExists && Object.getPrototypeOf(new Map().entries());
    var arrayIteratorExists = symbolIteratorExists && typeof Array.prototype[Symbol.iterator] === 'function';
    var arrayIteratorPrototype = arrayIteratorExists && Object.getPrototypeOf([][Symbol.iterator]());
    var stringIteratorExists = symbolIteratorExists && typeof String.prototype[Symbol.iterator] === 'function';
    var stringIteratorPrototype = stringIteratorExists && Object.getPrototypeOf(''[Symbol.iterator]());
    var toStringLeftSliceLength = 8;
    var toStringRightSliceLength = -1;
    /**
     * ### typeOf (obj)
     *
     * Uses `Object.prototype.toString` to determine the type of an object,
     * normalising behaviour across engine versions & well optimised.
     *
     * @param {Mixed} object
     * @return {String} object type
     * @api public
     */
    function typeDetect(obj) {
      /* ! Speed optimisation
       * Pre:
       *   string literal     x 3,039,035 ops/sec ±1.62% (78 runs sampled)
       *   boolean literal    x 1,424,138 ops/sec ±4.54% (75 runs sampled)
       *   number literal     x 1,653,153 ops/sec ±1.91% (82 runs sampled)
       *   undefined          x 9,978,660 ops/sec ±1.92% (75 runs sampled)
       *   function           x 2,556,769 ops/sec ±1.73% (77 runs sampled)
       * Post:
       *   string literal     x 38,564,796 ops/sec ±1.15% (79 runs sampled)
       *   boolean literal    x 31,148,940 ops/sec ±1.10% (79 runs sampled)
       *   number literal     x 32,679,330 ops/sec ±1.90% (78 runs sampled)
       *   undefined          x 32,363,368 ops/sec ±1.07% (82 runs sampled)
       *   function           x 31,296,870 ops/sec ±0.96% (83 runs sampled)
       */
      var typeofObj = typeof obj;
      if (typeofObj !== 'object') {
        return typeofObj;
      }

      /* ! Speed optimisation
       * Pre:
       *   null               x 28,645,765 ops/sec ±1.17% (82 runs sampled)
       * Post:
       *   null               x 36,428,962 ops/sec ±1.37% (84 runs sampled)
       */
      if (obj === null) {
        return 'null';
      }

      /* ! Spec Conformance
       * Test: `Object.prototype.toString.call(window)``
       *  - Node === "[object global]"
       *  - Chrome === "[object global]"
       *  - Firefox === "[object Window]"
       *  - PhantomJS === "[object Window]"
       *  - Safari === "[object Window]"
       *  - IE 11 === "[object Window]"
       *  - IE Edge === "[object Window]"
       * Test: `Object.prototype.toString.call(this)``
       *  - Chrome Worker === "[object global]"
       *  - Firefox Worker === "[object DedicatedWorkerGlobalScope]"
       *  - Safari Worker === "[object DedicatedWorkerGlobalScope]"
       *  - IE 11 Worker === "[object WorkerGlobalScope]"
       *  - IE Edge Worker === "[object WorkerGlobalScope]"
       */
      if (obj === globalObject) {
        return 'global';
      }

      /* ! Speed optimisation
       * Pre:
       *   array literal      x 2,888,352 ops/sec ±0.67% (82 runs sampled)
       * Post:
       *   array literal      x 22,479,650 ops/sec ±0.96% (81 runs sampled)
       */
      if (
        Array.isArray(obj) &&
        (symbolToStringTagExists === false || !(Symbol.toStringTag in obj))
      ) {
        return 'Array';
      }

      // Not caching existence of `window` and related properties due to potential
      // for `window` to be unset before tests in quasi-browser environments.
      if (typeof window === 'object' && window !== null) {
        /* ! Spec Conformance
         * (https://html.spec.whatwg.org/multipage/browsers.html#location)
         * WhatWG HTML$7.7.3 - The `Location` interface
         * Test: `Object.prototype.toString.call(window.location)``
         *  - IE <=11 === "[object Object]"
         *  - IE Edge <=13 === "[object Object]"
         */
        if (typeof window.location === 'object' && obj === window.location) {
          return 'Location';
        }

        /* ! Spec Conformance
         * (https://html.spec.whatwg.org/#document)
         * WhatWG HTML$3.1.1 - The `Document` object
         * Note: Most browsers currently adher to the W3C DOM Level 2 spec
         *       (https://www.w3.org/TR/DOM-Level-2-HTML/html.html#ID-26809268)
         *       which suggests that browsers should use HTMLTableCellElement for
         *       both TD and TH elements. WhatWG separates these.
         *       WhatWG HTML states:
         *         > For historical reasons, Window objects must also have a
         *         > writable, configurable, non-enumerable property named
         *         > HTMLDocument whose value is the Document interface object.
         * Test: `Object.prototype.toString.call(document)``
         *  - Chrome === "[object HTMLDocument]"
         *  - Firefox === "[object HTMLDocument]"
         *  - Safari === "[object HTMLDocument]"
         *  - IE <=10 === "[object Document]"
         *  - IE 11 === "[object HTMLDocument]"
         *  - IE Edge <=13 === "[object HTMLDocument]"
         */
        if (typeof window.document === 'object' && obj === window.document) {
          return 'Document';
        }

        if (typeof window.navigator === 'object') {
          /* ! Spec Conformance
           * (https://html.spec.whatwg.org/multipage/webappapis.html#mimetypearray)
           * WhatWG HTML$8.6.1.5 - Plugins - Interface MimeTypeArray
           * Test: `Object.prototype.toString.call(navigator.mimeTypes)``
           *  - IE <=10 === "[object MSMimeTypesCollection]"
           */
          if (typeof window.navigator.mimeTypes === 'object' &&
              obj === window.navigator.mimeTypes) {
            return 'MimeTypeArray';
          }

          /* ! Spec Conformance
           * (https://html.spec.whatwg.org/multipage/webappapis.html#pluginarray)
           * WhatWG HTML$8.6.1.5 - Plugins - Interface PluginArray
           * Test: `Object.prototype.toString.call(navigator.plugins)``
           *  - IE <=10 === "[object MSPluginsCollection]"
           */
          if (typeof window.navigator.plugins === 'object' &&
              obj === window.navigator.plugins) {
            return 'PluginArray';
          }
        }

        if ((typeof window.HTMLElement === 'function' ||
            typeof window.HTMLElement === 'object') &&
            obj instanceof window.HTMLElement) {
          /* ! Spec Conformance
          * (https://html.spec.whatwg.org/multipage/webappapis.html#pluginarray)
          * WhatWG HTML$4.4.4 - The `blockquote` element - Interface `HTMLQuoteElement`
          * Test: `Object.prototype.toString.call(document.createElement('blockquote'))``
          *  - IE <=10 === "[object HTMLBlockElement]"
          */
          if (obj.tagName === 'BLOCKQUOTE') {
            return 'HTMLQuoteElement';
          }

          /* ! Spec Conformance
           * (https://html.spec.whatwg.org/#htmltabledatacellelement)
           * WhatWG HTML$4.9.9 - The `td` element - Interface `HTMLTableDataCellElement`
           * Note: Most browsers currently adher to the W3C DOM Level 2 spec
           *       (https://www.w3.org/TR/DOM-Level-2-HTML/html.html#ID-82915075)
           *       which suggests that browsers should use HTMLTableCellElement for
           *       both TD and TH elements. WhatWG separates these.
           * Test: Object.prototype.toString.call(document.createElement('td'))
           *  - Chrome === "[object HTMLTableCellElement]"
           *  - Firefox === "[object HTMLTableCellElement]"
           *  - Safari === "[object HTMLTableCellElement]"
           */
          if (obj.tagName === 'TD') {
            return 'HTMLTableDataCellElement';
          }

          /* ! Spec Conformance
           * (https://html.spec.whatwg.org/#htmltableheadercellelement)
           * WhatWG HTML$4.9.9 - The `td` element - Interface `HTMLTableHeaderCellElement`
           * Note: Most browsers currently adher to the W3C DOM Level 2 spec
           *       (https://www.w3.org/TR/DOM-Level-2-HTML/html.html#ID-82915075)
           *       which suggests that browsers should use HTMLTableCellElement for
           *       both TD and TH elements. WhatWG separates these.
           * Test: Object.prototype.toString.call(document.createElement('th'))
           *  - Chrome === "[object HTMLTableCellElement]"
           *  - Firefox === "[object HTMLTableCellElement]"
           *  - Safari === "[object HTMLTableCellElement]"
           */
          if (obj.tagName === 'TH') {
            return 'HTMLTableHeaderCellElement';
          }
        }
      }

      /* ! Speed optimisation
      * Pre:
      *   Float64Array       x 625,644 ops/sec ±1.58% (80 runs sampled)
      *   Float32Array       x 1,279,852 ops/sec ±2.91% (77 runs sampled)
      *   Uint32Array        x 1,178,185 ops/sec ±1.95% (83 runs sampled)
      *   Uint16Array        x 1,008,380 ops/sec ±2.25% (80 runs sampled)
      *   Uint8Array         x 1,128,040 ops/sec ±2.11% (81 runs sampled)
      *   Int32Array         x 1,170,119 ops/sec ±2.88% (80 runs sampled)
      *   Int16Array         x 1,176,348 ops/sec ±5.79% (86 runs sampled)
      *   Int8Array          x 1,058,707 ops/sec ±4.94% (77 runs sampled)
      *   Uint8ClampedArray  x 1,110,633 ops/sec ±4.20% (80 runs sampled)
      * Post:
      *   Float64Array       x 7,105,671 ops/sec ±13.47% (64 runs sampled)
      *   Float32Array       x 5,887,912 ops/sec ±1.46% (82 runs sampled)
      *   Uint32Array        x 6,491,661 ops/sec ±1.76% (79 runs sampled)
      *   Uint16Array        x 6,559,795 ops/sec ±1.67% (82 runs sampled)
      *   Uint8Array         x 6,463,966 ops/sec ±1.43% (85 runs sampled)
      *   Int32Array         x 5,641,841 ops/sec ±3.49% (81 runs sampled)
      *   Int16Array         x 6,583,511 ops/sec ±1.98% (80 runs sampled)
      *   Int8Array          x 6,606,078 ops/sec ±1.74% (81 runs sampled)
      *   Uint8ClampedArray  x 6,602,224 ops/sec ±1.77% (83 runs sampled)
      */
      var stringTag = (symbolToStringTagExists && obj[Symbol.toStringTag]);
      if (typeof stringTag === 'string') {
        return stringTag;
      }

      var objPrototype = Object.getPrototypeOf(obj);
      /* ! Speed optimisation
      * Pre:
      *   regex literal      x 1,772,385 ops/sec ±1.85% (77 runs sampled)
      *   regex constructor  x 2,143,634 ops/sec ±2.46% (78 runs sampled)
      * Post:
      *   regex literal      x 3,928,009 ops/sec ±0.65% (78 runs sampled)
      *   regex constructor  x 3,931,108 ops/sec ±0.58% (84 runs sampled)
      */
      if (objPrototype === RegExp.prototype) {
        return 'RegExp';
      }

      /* ! Speed optimisation
      * Pre:
      *   date               x 2,130,074 ops/sec ±4.42% (68 runs sampled)
      * Post:
      *   date               x 3,953,779 ops/sec ±1.35% (77 runs sampled)
      */
      if (objPrototype === Date.prototype) {
        return 'Date';
      }

      /* ! Spec Conformance
       * (http://www.ecma-international.org/ecma-262/6.0/index.html#sec-promise.prototype-@@tostringtag)
       * ES6$25.4.5.4 - Promise.prototype[@@toStringTag] should be "Promise":
       * Test: `Object.prototype.toString.call(Promise.resolve())``
       *  - Chrome <=47 === "[object Object]"
       *  - Edge <=20 === "[object Object]"
       *  - Firefox 29-Latest === "[object Promise]"
       *  - Safari 7.1-Latest === "[object Promise]"
       */
      if (promiseExists && objPrototype === Promise.prototype) {
        return 'Promise';
      }

      /* ! Speed optimisation
      * Pre:
      *   set                x 2,222,186 ops/sec ±1.31% (82 runs sampled)
      * Post:
      *   set                x 4,545,879 ops/sec ±1.13% (83 runs sampled)
      */
      if (setExists && objPrototype === Set.prototype) {
        return 'Set';
      }

      /* ! Speed optimisation
      * Pre:
      *   map                x 2,396,842 ops/sec ±1.59% (81 runs sampled)
      * Post:
      *   map                x 4,183,945 ops/sec ±6.59% (82 runs sampled)
      */
      if (mapExists && objPrototype === Map.prototype) {
        return 'Map';
      }

      /* ! Speed optimisation
      * Pre:
      *   weakset            x 1,323,220 ops/sec ±2.17% (76 runs sampled)
      * Post:
      *   weakset            x 4,237,510 ops/sec ±2.01% (77 runs sampled)
      */
      if (weakSetExists && objPrototype === WeakSet.prototype) {
        return 'WeakSet';
      }

      /* ! Speed optimisation
      * Pre:
      *   weakmap            x 1,500,260 ops/sec ±2.02% (78 runs sampled)
      * Post:
      *   weakmap            x 3,881,384 ops/sec ±1.45% (82 runs sampled)
      */
      if (weakMapExists && objPrototype === WeakMap.prototype) {
        return 'WeakMap';
      }

      /* ! Spec Conformance
       * (http://www.ecma-international.org/ecma-262/6.0/index.html#sec-dataview.prototype-@@tostringtag)
       * ES6$24.2.4.21 - DataView.prototype[@@toStringTag] should be "DataView":
       * Test: `Object.prototype.toString.call(new DataView(new ArrayBuffer(1)))``
       *  - Edge <=13 === "[object Object]"
       */
      if (dataViewExists && objPrototype === DataView.prototype) {
        return 'DataView';
      }

      /* ! Spec Conformance
       * (http://www.ecma-international.org/ecma-262/6.0/index.html#sec-%mapiteratorprototype%-@@tostringtag)
       * ES6$23.1.5.2.2 - %MapIteratorPrototype%[@@toStringTag] should be "Map Iterator":
       * Test: `Object.prototype.toString.call(new Map().entries())``
       *  - Edge <=13 === "[object Object]"
       */
      if (mapExists && objPrototype === mapIteratorPrototype) {
        return 'Map Iterator';
      }

      /* ! Spec Conformance
       * (http://www.ecma-international.org/ecma-262/6.0/index.html#sec-%setiteratorprototype%-@@tostringtag)
       * ES6$23.2.5.2.2 - %SetIteratorPrototype%[@@toStringTag] should be "Set Iterator":
       * Test: `Object.prototype.toString.call(new Set().entries())``
       *  - Edge <=13 === "[object Object]"
       */
      if (setExists && objPrototype === setIteratorPrototype) {
        return 'Set Iterator';
      }

      /* ! Spec Conformance
       * (http://www.ecma-international.org/ecma-262/6.0/index.html#sec-%arrayiteratorprototype%-@@tostringtag)
       * ES6$22.1.5.2.2 - %ArrayIteratorPrototype%[@@toStringTag] should be "Array Iterator":
       * Test: `Object.prototype.toString.call([][Symbol.iterator]())``
       *  - Edge <=13 === "[object Object]"
       */
      if (arrayIteratorExists && objPrototype === arrayIteratorPrototype) {
        return 'Array Iterator';
      }

      /* ! Spec Conformance
       * (http://www.ecma-international.org/ecma-262/6.0/index.html#sec-%stringiteratorprototype%-@@tostringtag)
       * ES6$21.1.5.2.2 - %StringIteratorPrototype%[@@toStringTag] should be "String Iterator":
       * Test: `Object.prototype.toString.call(''[Symbol.iterator]())``
       *  - Edge <=13 === "[object Object]"
       */
      if (stringIteratorExists && objPrototype === stringIteratorPrototype) {
        return 'String Iterator';
      }

      /* ! Speed optimisation
      * Pre:
      *   object from null   x 2,424,320 ops/sec ±1.67% (76 runs sampled)
      * Post:
      *   object from null   x 5,838,000 ops/sec ±0.99% (84 runs sampled)
      */
      if (objPrototype === null) {
        return 'Object';
      }

      return Object
        .prototype
        .toString
        .call(obj)
        .slice(toStringLeftSliceLength, toStringRightSliceLength);
    }

    return typeDetect;

    })));
    });

    /**
     * Returns the lower-case result of running type from type-detect on the value
     *
     * @param  {*} value
     * @returns {string}
     */
    var typeOf = function typeOf(value) {
        return typeDetect(value).toLowerCase();
    };

    /**
     * Returns a string representation of the value
     *
     * @param  {*} value
     * @returns {string}
     */
    function valueToString(value) {
        if (value && value.toString) {
            // eslint-disable-next-line @sinonjs/no-prototype-methods/no-prototype-methods
            return value.toString();
        }
        return String(value);
    }

    var valueToString_1 = valueToString;

    var lib = {
        global: global_1,
        calledInOrder: calledInOrder_1,
        className: className_1,
        deprecated: deprecated,
        every: every$1,
        functionName: functionName,
        orderByFirstCall: orderByFirstCall_1,
        prototypes: prototypes,
        typeOf: typeOf,
        valueToString: valueToString_1
    };

    var globalObject$1 = lib.global;

    // eslint-disable-next-line complexity
    function withGlobal(_global) {
        var userAgent = _global.navigator && _global.navigator.userAgent;
        var isRunningInIE = userAgent && userAgent.indexOf("MSIE ") > -1;
        var maxTimeout = Math.pow(2, 31) - 1; //see https://heycam.github.io/webidl/#abstract-opdef-converttoint
        var NOOP = function() {
            return undefined;
        };
        var NOOP_ARRAY = function() {
            return [];
        };
        var timeoutResult = _global.setTimeout(NOOP, 0);
        var addTimerReturnsObject = typeof timeoutResult === "object";
        var hrtimePresent =
            _global.process && typeof _global.process.hrtime === "function";
        var hrtimeBigintPresent =
            hrtimePresent && typeof _global.process.hrtime.bigint === "function";
        var nextTickPresent =
            _global.process && typeof _global.process.nextTick === "function";
        var performancePresent =
            _global.performance && typeof _global.performance.now === "function";
        var hasPerformancePrototype =
            _global.Performance &&
            (typeof _global.Performance).match(/^(function|object)$/);
        var queueMicrotaskPresent = _global.hasOwnProperty("queueMicrotask");
        var requestAnimationFramePresent =
            _global.requestAnimationFrame &&
            typeof _global.requestAnimationFrame === "function";
        var cancelAnimationFramePresent =
            _global.cancelAnimationFrame &&
            typeof _global.cancelAnimationFrame === "function";
        var requestIdleCallbackPresent =
            _global.requestIdleCallback &&
            typeof _global.requestIdleCallback === "function";
        var cancelIdleCallbackPresent =
            _global.cancelIdleCallback &&
            typeof _global.cancelIdleCallback === "function";
        var setImmediatePresent =
            _global.setImmediate && typeof _global.setImmediate === "function";

        // Make properties writable in IE, as per
        // http://www.adequatelygood.com/Replacing-setTimeout-Globally.html
        /* eslint-disable no-self-assign */
        if (isRunningInIE) {
            _global.setTimeout = _global.setTimeout;
            _global.clearTimeout = _global.clearTimeout;
            _global.setInterval = _global.setInterval;
            _global.clearInterval = _global.clearInterval;
            _global.Date = _global.Date;
        }

        // setImmediate is not a standard function
        // avoid adding the prop to the window object if not present
        if (setImmediatePresent) {
            _global.setImmediate = _global.setImmediate;
            _global.clearImmediate = _global.clearImmediate;
        }
        /* eslint-enable no-self-assign */

        _global.clearTimeout(timeoutResult);

        var NativeDate = _global.Date;
        var uniqueTimerId = 1;

        function isNumberFinite(num) {
            if (Number.isFinite) {
                return Number.isFinite(num);
            }

            if (typeof num !== "number") {
                return false;
            }

            return isFinite(num);
        }

        /**
         * Parse strings like "01:10:00" (meaning 1 hour, 10 minutes, 0 seconds) into
         * number of milliseconds. This is used to support human-readable strings passed
         * to clock.tick()
         */
        function parseTime(str) {
            if (!str) {
                return 0;
            }

            var strings = str.split(":");
            var l = strings.length;
            var i = l;
            var ms = 0;
            var parsed;

            if (l > 3 || !/^(\d\d:){0,2}\d\d?$/.test(str)) {
                throw new Error(
                    "tick only understands numbers, 'm:s' and 'h:m:s'. Each part must be two digits"
                );
            }

            while (i--) {
                parsed = parseInt(strings[i], 10);

                if (parsed >= 60) {
                    throw new Error("Invalid time " + str);
                }

                ms += parsed * Math.pow(60, l - i - 1);
            }

            return ms * 1000;
        }

        /**
         * Get the decimal part of the millisecond value as nanoseconds
         *
         * @param {Number} msFloat the number of milliseconds
         * @returns {Number} an integer number of nanoseconds in the range [0,1e6)
         *
         * Example: nanoRemainer(123.456789) -> 456789
         */
        function nanoRemainder(msFloat) {
            var modulo = 1e6;
            var remainder = (msFloat * 1e6) % modulo;
            var positiveRemainder = remainder < 0 ? remainder + modulo : remainder;

            return Math.floor(positiveRemainder);
        }

        /**
         * Used to grok the `now` parameter to createClock.
         * @param epoch {Date|number} the system time
         */
        function getEpoch(epoch) {
            if (!epoch) {
                return 0;
            }
            if (typeof epoch.getTime === "function") {
                return epoch.getTime();
            }
            if (typeof epoch === "number") {
                return epoch;
            }
            throw new TypeError("now should be milliseconds since UNIX epoch");
        }

        function inRange(from, to, timer) {
            return timer && timer.callAt >= from && timer.callAt <= to;
        }

        function mirrorDateProperties(target, source) {
            var prop;
            for (prop in source) {
                if (source.hasOwnProperty(prop)) {
                    target[prop] = source[prop];
                }
            }

            // set special now implementation
            if (source.now) {
                target.now = function now() {
                    return target.clock.now;
                };
            } else {
                delete target.now;
            }

            // set special toSource implementation
            if (source.toSource) {
                target.toSource = function toSource() {
                    return source.toSource();
                };
            } else {
                delete target.toSource;
            }

            // set special toString implementation
            target.toString = function toString() {
                return source.toString();
            };

            target.prototype = source.prototype;
            target.parse = source.parse;
            target.UTC = source.UTC;
            target.prototype.toUTCString = source.prototype.toUTCString;

            return target;
        }

        function createDate() {
            function ClockDate(year, month, date, hour, minute, second, ms) {
                // the Date constructor called as a function, ref Ecma-262 Edition 5.1, section 15.9.2.
                // This remains so in the 10th edition of 2019 as well.
                if (!(this instanceof ClockDate)) {
                    return new NativeDate(ClockDate.clock.now).toString();
                }

                // if Date is called as a constructor with 'new' keyword
                // Defensive and verbose to avoid potential harm in passing
                // explicit undefined when user does not pass argument
                switch (arguments.length) {
                    case 0:
                        return new NativeDate(ClockDate.clock.now);
                    case 1:
                        return new NativeDate(year);
                    case 2:
                        return new NativeDate(year, month);
                    case 3:
                        return new NativeDate(year, month, date);
                    case 4:
                        return new NativeDate(year, month, date, hour);
                    case 5:
                        return new NativeDate(year, month, date, hour, minute);
                    case 6:
                        return new NativeDate(
                            year,
                            month,
                            date,
                            hour,
                            minute,
                            second
                        );
                    default:
                        return new NativeDate(
                            year,
                            month,
                            date,
                            hour,
                            minute,
                            second,
                            ms
                        );
                }
            }

            return mirrorDateProperties(ClockDate, NativeDate);
        }

        function enqueueJob(clock, job) {
            // enqueues a microtick-deferred task - ecma262/#sec-enqueuejob
            if (!clock.jobs) {
                clock.jobs = [];
            }
            clock.jobs.push(job);
        }

        function runJobs(clock) {
            // runs all microtick-deferred tasks - ecma262/#sec-runjobs
            if (!clock.jobs) {
                return;
            }
            for (var i = 0; i < clock.jobs.length; i++) {
                var job = clock.jobs[i];
                job.func.apply(null, job.args);
                if (clock.loopLimit && i > clock.loopLimit) {
                    throw new Error(
                        "Aborting after running " +
                            clock.loopLimit +
                            " timers, assuming an infinite loop!"
                    );
                }
            }
            clock.jobs = [];
        }

        function addTimer(clock, timer) {
            if (timer.func === undefined) {
                throw new Error("Callback must be provided to timer calls");
            }

            timer.type = timer.immediate ? "Immediate" : "Timeout";

            if (timer.hasOwnProperty("delay")) {
                if (!isNumberFinite(timer.delay)) {
                    timer.delay = 0;
                }
                timer.delay = timer.delay > maxTimeout ? 1 : timer.delay;
                timer.delay = Math.max(0, timer.delay);
            }

            if (timer.hasOwnProperty("interval")) {
                timer.type = "Interval";
                timer.interval = timer.interval > maxTimeout ? 1 : timer.interval;
            }

            if (timer.hasOwnProperty("animation")) {
                timer.type = "AnimationFrame";
                timer.animation = true;
            }

            if (!clock.timers) {
                clock.timers = {};
            }

            timer.id = uniqueTimerId++;
            timer.createdAt = clock.now;
            timer.callAt =
                clock.now + (parseInt(timer.delay) || (clock.duringTick ? 1 : 0));

            clock.timers[timer.id] = timer;

            if (addTimerReturnsObject) {
                var res = {
                    id: timer.id,
                    ref: function() {
                        return res;
                    },
                    unref: function() {
                        return res;
                    },
                    refresh: function() {
                        return res;
                    }
                };
                return res;
            }

            return timer.id;
        }

        /* eslint consistent-return: "off" */
        function compareTimers(a, b) {
            // Sort first by absolute timing
            if (a.callAt < b.callAt) {
                return -1;
            }
            if (a.callAt > b.callAt) {
                return 1;
            }

            // Sort next by immediate, immediate timers take precedence
            if (a.immediate && !b.immediate) {
                return -1;
            }
            if (!a.immediate && b.immediate) {
                return 1;
            }

            // Sort next by creation time, earlier-created timers take precedence
            if (a.createdAt < b.createdAt) {
                return -1;
            }
            if (a.createdAt > b.createdAt) {
                return 1;
            }

            // Sort next by id, lower-id timers take precedence
            if (a.id < b.id) {
                return -1;
            }
            if (a.id > b.id) {
                return 1;
            }

            // As timer ids are unique, no fallback `0` is necessary
        }

        function firstTimerInRange(clock, from, to) {
            var timers = clock.timers;
            var timer = null;
            var id, isInRange;

            for (id in timers) {
                if (timers.hasOwnProperty(id)) {
                    isInRange = inRange(from, to, timers[id]);

                    if (
                        isInRange &&
                        (!timer || compareTimers(timer, timers[id]) === 1)
                    ) {
                        timer = timers[id];
                    }
                }
            }

            return timer;
        }

        function firstTimer(clock) {
            var timers = clock.timers;
            var timer = null;
            var id;

            for (id in timers) {
                if (timers.hasOwnProperty(id)) {
                    if (!timer || compareTimers(timer, timers[id]) === 1) {
                        timer = timers[id];
                    }
                }
            }

            return timer;
        }

        function lastTimer(clock) {
            var timers = clock.timers;
            var timer = null;
            var id;

            for (id in timers) {
                if (timers.hasOwnProperty(id)) {
                    if (!timer || compareTimers(timer, timers[id]) === -1) {
                        timer = timers[id];
                    }
                }
            }

            return timer;
        }

        function callTimer(clock, timer) {
            if (typeof timer.interval === "number") {
                clock.timers[timer.id].callAt += timer.interval;
            } else {
                delete clock.timers[timer.id];
            }

            if (typeof timer.func === "function") {
                timer.func.apply(null, timer.args);
            } else {
                /* eslint no-eval: "off" */
                eval(timer.func);
            }
        }

        function clearTimer(clock, timerId, ttype) {
            if (!timerId) {
                // null appears to be allowed in most browsers, and appears to be
                // relied upon by some libraries, like Bootstrap carousel
                return;
            }

            if (!clock.timers) {
                clock.timers = {};
            }

            // in Node, timerId is an object with .ref()/.unref(), and
            // its .id field is the actual timer id.
            var id = typeof timerId === "object" ? timerId.id : timerId;

            if (clock.timers.hasOwnProperty(id)) {
                // check that the ID matches a timer of the correct type
                var timer = clock.timers[id];
                if (timer.type === ttype) {
                    delete clock.timers[id];
                } else {
                    var clear =
                        ttype === "AnimationFrame"
                            ? "cancelAnimationFrame"
                            : "clear" + ttype;
                    var schedule =
                        timer.type === "AnimationFrame"
                            ? "requestAnimationFrame"
                            : "set" + timer.type;
                    throw new Error(
                        "Cannot clear timer: timer created with " +
                            schedule +
                            "() but cleared with " +
                            clear +
                            "()"
                    );
                }
            }
        }

        function uninstall(clock, target, config) {
            var method, i, l;
            var installedHrTime = "_hrtime";
            var installedNextTick = "_nextTick";

            for (i = 0, l = clock.methods.length; i < l; i++) {
                method = clock.methods[i];
                if (method === "hrtime" && target.process) {
                    target.process.hrtime = clock[installedHrTime];
                } else if (method === "nextTick" && target.process) {
                    target.process.nextTick = clock[installedNextTick];
                } else if (method === "performance") {
                    var originalPerfDescriptor = Object.getOwnPropertyDescriptor(
                        clock,
                        "_" + method
                    );
                    if (
                        originalPerfDescriptor &&
                        originalPerfDescriptor.get &&
                        !originalPerfDescriptor.set
                    ) {
                        Object.defineProperty(
                            target,
                            method,
                            originalPerfDescriptor
                        );
                    } else if (originalPerfDescriptor.configurable) {
                        target[method] = clock["_" + method];
                    }
                } else {
                    if (target[method] && target[method].hadOwnProperty) {
                        target[method] = clock["_" + method];
                        if (
                            method === "clearInterval" &&
                            config.shouldAdvanceTime === true
                        ) {
                            target[method](clock.attachedInterval);
                        }
                    } else {
                        try {
                            delete target[method];
                        } catch (ignore) {
                            /* eslint no-empty: "off" */
                        }
                    }
                }
            }

            // Prevent multiple executions which will completely remove these props
            clock.methods = [];

            // return pending timers, to enable checking what timers remained on uninstall
            if (!clock.timers) {
                return [];
            }
            return Object.keys(clock.timers).map(function mapper(key) {
                return clock.timers[key];
            });
        }

        function hijackMethod(target, method, clock) {
            var prop;
            clock[method].hadOwnProperty = Object.prototype.hasOwnProperty.call(
                target,
                method
            );
            clock["_" + method] = target[method];

            if (method === "Date") {
                var date = mirrorDateProperties(clock[method], target[method]);
                target[method] = date;
            } else if (method === "performance") {
                var originalPerfDescriptor = Object.getOwnPropertyDescriptor(
                    target,
                    method
                );
                // JSDOM has a read only performance field so we have to save/copy it differently
                if (
                    originalPerfDescriptor &&
                    originalPerfDescriptor.get &&
                    !originalPerfDescriptor.set
                ) {
                    Object.defineProperty(
                        clock,
                        "_" + method,
                        originalPerfDescriptor
                    );

                    var perfDescriptor = Object.getOwnPropertyDescriptor(
                        clock,
                        method
                    );
                    Object.defineProperty(target, method, perfDescriptor);
                } else {
                    target[method] = clock[method];
                }
            } else {
                target[method] = function() {
                    return clock[method].apply(clock, arguments);
                };

                for (prop in clock[method]) {
                    if (clock[method].hasOwnProperty(prop)) {
                        target[method][prop] = clock[method][prop];
                    }
                }
            }

            target[method].clock = clock;
        }

        function doIntervalTick(clock, advanceTimeDelta) {
            clock.tick(advanceTimeDelta);
        }

        var timers = {
            setTimeout: _global.setTimeout,
            clearTimeout: _global.clearTimeout,
            setInterval: _global.setInterval,
            clearInterval: _global.clearInterval,
            Date: _global.Date
        };

        if (setImmediatePresent) {
            timers.setImmediate = _global.setImmediate;
            timers.clearImmediate = _global.clearImmediate;
        }

        if (hrtimePresent) {
            timers.hrtime = _global.process.hrtime;
        }

        if (nextTickPresent) {
            timers.nextTick = _global.process.nextTick;
        }

        if (performancePresent) {
            timers.performance = _global.performance;
        }

        if (requestAnimationFramePresent) {
            timers.requestAnimationFrame = _global.requestAnimationFrame;
        }

        if (queueMicrotaskPresent) {
            timers.queueMicrotask = true;
        }

        if (cancelAnimationFramePresent) {
            timers.cancelAnimationFrame = _global.cancelAnimationFrame;
        }

        if (requestIdleCallbackPresent) {
            timers.requestIdleCallback = _global.requestIdleCallback;
        }

        if (cancelIdleCallbackPresent) {
            timers.cancelIdleCallback = _global.cancelIdleCallback;
        }

        var keys =
            Object.keys ||
            function(obj) {
                var ks = [];
                var key;

                for (key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        ks.push(key);
                    }
                }

                return ks;
            };

        var originalSetTimeout = _global.setImmediate || _global.setTimeout;

        /**
         * @param start {Date|number} the system time - non-integer values are floored
         * @param loopLimit {number}  maximum number of timers that will be run when calling runAll()
         */
        function createClock(start, loopLimit) {
            // eslint-disable-next-line no-param-reassign
            start = Math.floor(getEpoch(start));
            // eslint-disable-next-line no-param-reassign
            loopLimit = loopLimit || 1000;
            var nanos = 0;
            var adjustedSystemTime = [0, 0]; // [millis, nanoremainder]

            if (NativeDate === undefined) {
                throw new Error(
                    "The global scope doesn't have a `Date` object" +
                        " (see https://github.com/sinonjs/sinon/issues/1852#issuecomment-419622780)"
                );
            }

            var clock = {
                now: start,
                timeouts: {},
                Date: createDate(),
                loopLimit: loopLimit
            };

            clock.Date.clock = clock;

            function getTimeToNextFrame() {
                return 16 - ((clock.now - start) % 16);
            }

            function hrtime(prev) {
                var millisSinceStart = clock.now - adjustedSystemTime[0] - start;
                var secsSinceStart = Math.floor(millisSinceStart / 1000);
                var remainderInNanos =
                    (millisSinceStart - secsSinceStart * 1e3) * 1e6 +
                    nanos -
                    adjustedSystemTime[1];

                if (Array.isArray(prev)) {
                    if (prev[1] > 1e9) {
                        throw new TypeError(
                            "Number of nanoseconds can't exceed a billion"
                        );
                    }

                    var oldSecs = prev[0];
                    var nanoDiff = remainderInNanos - prev[1];
                    var secDiff = secsSinceStart - oldSecs;

                    if (nanoDiff < 0) {
                        nanoDiff += 1e9;
                        secDiff -= 1;
                    }

                    return [secDiff, nanoDiff];
                }
                return [secsSinceStart, remainderInNanos];
            }

            if (hrtimeBigintPresent) {
                hrtime.bigint = function() {
                    var parts = hrtime();
                    return BigInt(parts[0]) * BigInt(1e9) + BigInt(parts[1]); // eslint-disable-line
                };
            }

            clock.requestIdleCallback = function requestIdleCallback(
                func,
                timeout
            ) {
                var timeToNextIdlePeriod = 0;

                if (clock.countTimers() > 0) {
                    timeToNextIdlePeriod = 50; // const for now
                }

                var result = addTimer(clock, {
                    func: func,
                    args: Array.prototype.slice.call(arguments, 2),
                    delay:
                        typeof timeout === "undefined"
                            ? timeToNextIdlePeriod
                            : Math.min(timeout, timeToNextIdlePeriod)
                });

                return result.id || result;
            };

            clock.cancelIdleCallback = function cancelIdleCallback(timerId) {
                return clearTimer(clock, timerId, "Timeout");
            };

            clock.setTimeout = function setTimeout(func, timeout) {
                return addTimer(clock, {
                    func: func,
                    args: Array.prototype.slice.call(arguments, 2),
                    delay: timeout
                });
            };

            clock.clearTimeout = function clearTimeout(timerId) {
                return clearTimer(clock, timerId, "Timeout");
            };

            clock.nextTick = function nextTick(func) {
                return enqueueJob(clock, {
                    func: func,
                    args: Array.prototype.slice.call(arguments, 1)
                });
            };

            clock.queueMicrotask = function queueMicrotask(func) {
                return clock.nextTick(func); // explicitly drop additional arguments
            };

            clock.setInterval = function setInterval(func, timeout) {
                // eslint-disable-next-line no-param-reassign
                timeout = parseInt(timeout, 10);
                return addTimer(clock, {
                    func: func,
                    args: Array.prototype.slice.call(arguments, 2),
                    delay: timeout,
                    interval: timeout
                });
            };

            clock.clearInterval = function clearInterval(timerId) {
                return clearTimer(clock, timerId, "Interval");
            };

            if (setImmediatePresent) {
                clock.setImmediate = function setImmediate(func) {
                    return addTimer(clock, {
                        func: func,
                        args: Array.prototype.slice.call(arguments, 1),
                        immediate: true
                    });
                };

                clock.clearImmediate = function clearImmediate(timerId) {
                    return clearTimer(clock, timerId, "Immediate");
                };
            }

            clock.countTimers = function countTimers() {
                return (
                    Object.keys(clock.timers || {}).length +
                    (clock.jobs || []).length
                );
            };

            clock.requestAnimationFrame = function requestAnimationFrame(func) {
                var result = addTimer(clock, {
                    func: func,
                    delay: getTimeToNextFrame(),
                    args: [clock.now + getTimeToNextFrame()],
                    animation: true
                });

                return result.id || result;
            };

            clock.cancelAnimationFrame = function cancelAnimationFrame(timerId) {
                return clearTimer(clock, timerId, "AnimationFrame");
            };

            clock.runMicrotasks = function runMicrotasks() {
                runJobs(clock);
            };

            function doTick(tickValue, isAsync, resolve, reject) {
                var msFloat =
                    typeof tickValue === "number"
                        ? tickValue
                        : parseTime(tickValue);
                var ms = Math.floor(msFloat);
                var remainder = nanoRemainder(msFloat);
                var nanosTotal = nanos + remainder;
                var tickTo = clock.now + ms;

                if (msFloat < 0) {
                    throw new TypeError("Negative ticks are not supported");
                }

                // adjust for positive overflow
                if (nanosTotal >= 1e6) {
                    tickTo += 1;
                    nanosTotal -= 1e6;
                }

                nanos = nanosTotal;
                var tickFrom = clock.now;
                var previous = clock.now;
                var timer,
                    firstException,
                    oldNow,
                    nextPromiseTick,
                    compensationCheck,
                    postTimerCall;

                clock.duringTick = true;

                // perform microtasks
                oldNow = clock.now;
                runJobs(clock);
                if (oldNow !== clock.now) {
                    // compensate for any setSystemTime() call during microtask callback
                    tickFrom += clock.now - oldNow;
                    tickTo += clock.now - oldNow;
                }

                function doTickInner() {
                    // perform each timer in the requested range
                    timer = firstTimerInRange(clock, tickFrom, tickTo);
                    // eslint-disable-next-line no-unmodified-loop-condition
                    while (timer && tickFrom <= tickTo) {
                        if (clock.timers[timer.id]) {
                            tickFrom = timer.callAt;
                            clock.now = timer.callAt;
                            oldNow = clock.now;
                            try {
                                runJobs(clock);
                                callTimer(clock, timer);
                            } catch (e) {
                                firstException = firstException || e;
                            }

                            if (isAsync) {
                                // finish up after native setImmediate callback to allow
                                // all native es6 promises to process their callbacks after
                                // each timer fires.
                                originalSetTimeout(nextPromiseTick);
                                return;
                            }

                            compensationCheck();
                        }

                        postTimerCall();
                    }

                    // perform process.nextTick()s again
                    oldNow = clock.now;
                    runJobs(clock);
                    if (oldNow !== clock.now) {
                        // compensate for any setSystemTime() call during process.nextTick() callback
                        tickFrom += clock.now - oldNow;
                        tickTo += clock.now - oldNow;
                    }
                    clock.duringTick = false;

                    // corner case: during runJobs new timers were scheduled which could be in the range [clock.now, tickTo]
                    timer = firstTimerInRange(clock, tickFrom, tickTo);
                    if (timer) {
                        try {
                            clock.tick(tickTo - clock.now); // do it all again - for the remainder of the requested range
                        } catch (e) {
                            firstException = firstException || e;
                        }
                    } else {
                        // no timers remaining in the requested range: move the clock all the way to the end
                        clock.now = tickTo;

                        // update nanos
                        nanos = nanosTotal;
                    }
                    if (firstException) {
                        throw firstException;
                    }

                    if (isAsync) {
                        resolve(clock.now);
                    } else {
                        return clock.now;
                    }
                }

                nextPromiseTick =
                    isAsync &&
                    function() {
                        try {
                            compensationCheck();
                            postTimerCall();
                            doTickInner();
                        } catch (e) {
                            reject(e);
                        }
                    };

                compensationCheck = function() {
                    // compensate for any setSystemTime() call during timer callback
                    if (oldNow !== clock.now) {
                        tickFrom += clock.now - oldNow;
                        tickTo += clock.now - oldNow;
                        previous += clock.now - oldNow;
                    }
                };

                postTimerCall = function() {
                    timer = firstTimerInRange(clock, previous, tickTo);
                    previous = tickFrom;
                };

                return doTickInner();
            }

            /**
             * @param {tickValue} {String|Number} number of milliseconds or a human-readable value like "01:11:15"
             */
            clock.tick = function tick(tickValue) {
                return doTick(tickValue, false);
            };

            if (typeof _global.Promise !== "undefined") {
                clock.tickAsync = function tickAsync(ms) {
                    return new _global.Promise(function(resolve, reject) {
                        originalSetTimeout(function() {
                            try {
                                doTick(ms, true, resolve, reject);
                            } catch (e) {
                                reject(e);
                            }
                        });
                    });
                };
            }

            clock.next = function next() {
                runJobs(clock);
                var timer = firstTimer(clock);
                if (!timer) {
                    return clock.now;
                }

                clock.duringTick = true;
                try {
                    clock.now = timer.callAt;
                    callTimer(clock, timer);
                    runJobs(clock);
                    return clock.now;
                } finally {
                    clock.duringTick = false;
                }
            };

            if (typeof _global.Promise !== "undefined") {
                clock.nextAsync = function nextAsync() {
                    return new _global.Promise(function(resolve, reject) {
                        originalSetTimeout(function() {
                            try {
                                var timer = firstTimer(clock);
                                if (!timer) {
                                    resolve(clock.now);
                                    return;
                                }

                                var err;
                                clock.duringTick = true;
                                clock.now = timer.callAt;
                                try {
                                    callTimer(clock, timer);
                                } catch (e) {
                                    err = e;
                                }
                                clock.duringTick = false;

                                originalSetTimeout(function() {
                                    if (err) {
                                        reject(err);
                                    } else {
                                        resolve(clock.now);
                                    }
                                });
                            } catch (e) {
                                reject(e);
                            }
                        });
                    });
                };
            }

            clock.runAll = function runAll() {
                var numTimers, i;
                runJobs(clock);
                for (i = 0; i < clock.loopLimit; i++) {
                    if (!clock.timers) {
                        return clock.now;
                    }

                    numTimers = keys(clock.timers).length;
                    if (numTimers === 0) {
                        return clock.now;
                    }

                    clock.next();
                }

                throw new Error(
                    "Aborting after running " +
                        clock.loopLimit +
                        " timers, assuming an infinite loop!"
                );
            };

            clock.runToFrame = function runToFrame() {
                return clock.tick(getTimeToNextFrame());
            };

            if (typeof _global.Promise !== "undefined") {
                clock.runAllAsync = function runAllAsync() {
                    return new _global.Promise(function(resolve, reject) {
                        var i = 0;
                        function doRun() {
                            originalSetTimeout(function() {
                                try {
                                    var numTimers;
                                    if (i < clock.loopLimit) {
                                        if (!clock.timers) {
                                            resolve(clock.now);
                                            return;
                                        }

                                        numTimers = Object.keys(clock.timers)
                                            .length;
                                        if (numTimers === 0) {
                                            resolve(clock.now);
                                            return;
                                        }

                                        clock.next();

                                        i++;

                                        doRun();
                                        return;
                                    }

                                    reject(
                                        new Error(
                                            "Aborting after running " +
                                                clock.loopLimit +
                                                " timers, assuming an infinite loop!"
                                        )
                                    );
                                } catch (e) {
                                    reject(e);
                                }
                            });
                        }
                        doRun();
                    });
                };
            }

            clock.runToLast = function runToLast() {
                var timer = lastTimer(clock);
                if (!timer) {
                    runJobs(clock);
                    return clock.now;
                }

                return clock.tick(timer.callAt - clock.now);
            };

            if (typeof _global.Promise !== "undefined") {
                clock.runToLastAsync = function runToLastAsync() {
                    return new _global.Promise(function(resolve, reject) {
                        originalSetTimeout(function() {
                            try {
                                var timer = lastTimer(clock);
                                if (!timer) {
                                    resolve(clock.now);
                                }

                                resolve(clock.tickAsync(timer.callAt));
                            } catch (e) {
                                reject(e);
                            }
                        });
                    });
                };
            }

            clock.reset = function reset() {
                nanos = 0;
                clock.timers = {};
                clock.jobs = [];
                clock.now = start;
            };

            clock.setSystemTime = function setSystemTime(systemTime) {
                // determine time difference
                var newNow = getEpoch(systemTime);
                var difference = newNow - clock.now;
                var id, timer;

                adjustedSystemTime[0] = adjustedSystemTime[0] + difference;
                adjustedSystemTime[1] = adjustedSystemTime[1] + nanos;
                // update 'system clock'
                clock.now = newNow;
                nanos = 0;

                // update timers and intervals to keep them stable
                for (id in clock.timers) {
                    if (clock.timers.hasOwnProperty(id)) {
                        timer = clock.timers[id];
                        timer.createdAt += difference;
                        timer.callAt += difference;
                    }
                }
            };

            if (performancePresent) {
                clock.performance = Object.create(null);

                if (hasPerformancePrototype) {
                    var proto = _global.Performance.prototype;

                    Object.getOwnPropertyNames(proto).forEach(function(name) {
                        if (name.indexOf("getEntries") === 0) {
                            // match expected return type for getEntries functions
                            clock.performance[name] = NOOP_ARRAY;
                        } else {
                            clock.performance[name] = NOOP;
                        }
                    });
                }

                clock.performance.now = function lolexNow() {
                    var hrt = hrtime();
                    var millis = hrt[0] * 1000 + hrt[1] / 1e6;
                    return millis;
                };
            }

            if (hrtimePresent) {
                clock.hrtime = hrtime;
            }

            return clock;
        }

        /**
         * @param config {Object} optional config
         * @param config.target {Object} the target to install timers in (default `window`)
         * @param config.now {number|Date}  a number (in milliseconds) or a Date object (default epoch)
         * @param config.toFake {string[]} names of the methods that should be faked.
         * @param config.loopLimit {number} the maximum number of timers that will be run when calling runAll()
         * @param config.shouldAdvanceTime {Boolean} tells lolex to increment mocked time automatically (default false)
         * @param config.advanceTimeDelta {Number} increment mocked time every <<advanceTimeDelta>> ms (default: 20ms)
         */
        // eslint-disable-next-line complexity
        function install(config) {
            if (
                arguments.length > 1 ||
                config instanceof Date ||
                Array.isArray(config) ||
                typeof config === "number"
            ) {
                throw new TypeError(
                    "lolex.install called with " +
                        String(config) +
                        " lolex 2.0+ requires an object parameter - see https://github.com/sinonjs/lolex"
                );
            }

            // eslint-disable-next-line no-param-reassign
            config = typeof config !== "undefined" ? config : {};
            config.shouldAdvanceTime = config.shouldAdvanceTime || false;
            config.advanceTimeDelta = config.advanceTimeDelta || 20;

            var i, l;
            var target = config.target || _global;
            var clock = createClock(config.now, config.loopLimit);

            clock.uninstall = function() {
                return uninstall(clock, target, config);
            };

            clock.methods = config.toFake || [];

            if (clock.methods.length === 0) {
                // do not fake nextTick by default - GitHub#126
                clock.methods = keys(timers).filter(function(key) {
                    return key !== "nextTick" && key !== "queueMicrotask";
                });
            }

            for (i = 0, l = clock.methods.length; i < l; i++) {
                if (clock.methods[i] === "hrtime") {
                    if (
                        target.process &&
                        typeof target.process.hrtime === "function"
                    ) {
                        hijackMethod(target.process, clock.methods[i], clock);
                    }
                } else if (clock.methods[i] === "nextTick") {
                    if (
                        target.process &&
                        typeof target.process.nextTick === "function"
                    ) {
                        hijackMethod(target.process, clock.methods[i], clock);
                    }
                } else {
                    if (
                        clock.methods[i] === "setInterval" &&
                        config.shouldAdvanceTime === true
                    ) {
                        var intervalTick = doIntervalTick.bind(
                            null,
                            clock,
                            config.advanceTimeDelta
                        );
                        var intervalId = target[clock.methods[i]](
                            intervalTick,
                            config.advanceTimeDelta
                        );
                        clock.attachedInterval = intervalId;
                    }
                    hijackMethod(target, clock.methods[i], clock);
                }
            }

            return clock;
        }

        return {
            timers: timers,
            createClock: createClock,
            install: install,
            withGlobal: withGlobal
        };
    }

    var defaultImplementation = withGlobal(globalObject$1);

    var timers = defaultImplementation.timers;
    var createClock = defaultImplementation.createClock;
    var install = defaultImplementation.install;
    var withGlobal_1 = withGlobal;

    var lolexSrc = {
    	timers: timers,
    	createClock: createClock,
    	install: install,
    	withGlobal: withGlobal_1
    };

    // used to ensure tests for fake timers can reliably use native setTimeout
    var SET_TIMEOUT = setTimeout;
    var fakeClock;
    function escapeCurrentMicrotaskQueue() {
        return new Promise(function (resolve) {
            // this ensures that we have been to the end of the current
            // events microtask queue
            setTimeout(resolve, 0);
        });
    }
    QUnit.module('tests/autorun', {
        afterEach: function afterEach() {
            if (fakeClock) {
                fakeClock.uninstall();
            }
        }
    });
    QUnit.test('autorun', function (assert) {
        var done = assert.async();
        var bb = new Backburner__default(['zomg']);
        var step = 0;
        assert.ok(!bb.currentInstance, 'The DeferredActionQueues object is lazily instaniated');
        assert.equal(step++, 0);
        bb.schedule('zomg', null, function () {
            assert.equal(step++, 2);
            setTimeout(function () {
                assert.ok(!bb.hasTimers(), 'The all timers are cleared');
                done();
            });
        });
        assert.ok(bb.currentInstance, 'The DeferredActionQueues object exists');
        assert.equal(step++, 1);
    });
    QUnit.test('autorun (joins next run if not yet flushed)', function (assert) {
        var bb = new Backburner__default(['zomg']);
        var order = -1;
        var tasks = {
            one: { count: 0, order: -1 },
            two: { count: 0, order: -1 }
        };
        bb.schedule('zomg', null, function () {
            tasks.one.count++;
            tasks.one.order = ++order;
        });
        assert.deepEqual(tasks, {
            one: { count: 0, order: -1 },
            two: { count: 0, order: -1 }
        });
        bb.run(function () {
            bb.schedule('zomg', null, function () {
                tasks.two.count++;
                tasks.two.order = ++order;
            });
            assert.deepEqual(tasks, {
                one: { count: 0, order: -1 },
                two: { count: 0, order: -1 }
            });
        });
        assert.deepEqual(tasks, {
            one: { count: 1, order: 0 },
            two: { count: 1, order: 1 }
        });
    });
    QUnit.test('autorun completes before items scheduled by later (via microtasks)', function (assert) {
        var done = assert.async();
        var bb = new Backburner__default(['first', 'second']);
        var order = new Array();
        // this later will be scheduled into the `first` queue when
        // its timer is up
        bb.later(function () {
            order.push('second - later');
        }, 0);
        // scheduling this into the second queue so that we can confirm this _still_
        // runs first (due to autorun resolving before scheduled timer)
        bb.schedule('second', null, function () {
            order.push('first - scheduled');
        });
        setTimeout(function () {
            assert.deepEqual(order, ['first - scheduled', 'second - later']);
            done();
        }, 20);
    });
    QUnit.test('can be canceled (private API)', function (assert) {
        assert.expect(0);
        var done = assert.async();
        var bb = new Backburner__default(['zomg']);
        bb.schedule('zomg', null, function () {
            assert.notOk(true, 'should not flush');
        });
        bb['_cancelAutorun']();
        setTimeout(done, 10);
    });
    QUnit.test('autorun interleaved with microtasks do not get dropped [GH#332]', function (assert) {
        var done = assert.async();
        var actual = [];
        var bb = new Backburner__default(['actions', 'render']);
        bb.schedule('render', function () {
            actual.push('first');
            bb.schedule('actions', function () {
                actual.push('action1');
            });
            Promise.resolve().then(function () {
                actual.push('second');
                bb.schedule('actions', function () {
                    actual.push('action2');
                });
                return Promise.resolve().then(function () {
                    actual.push('third');
                    bb.schedule('actions', function () {
                        actual.push('action3');
                    });
                });
            });
        });
        setTimeout(function () {
            assert.deepEqual(actual, ['first', 'action1', 'second', 'action2', 'third', 'action3']);
            done();
        });
    });
    QUnit.test('autorun functions even when using fake timers', function (assert) {
        var done = assert.async();
        var bb = new Backburner__default(['zomg']);
        var step = 0;
        assert.ok(!bb.currentInstance, 'The DeferredActionQueues object is lazily instaniated');
        assert.equal(step++, 0);
        fakeClock = lolexSrc.install();
        bb.schedule('zomg', null, function () {
            assert.equal(step++, 2);
            SET_TIMEOUT(function () {
                assert.ok(!bb.hasTimers(), 'The all timers are cleared');
                done();
            });
        });
        assert.ok(bb.currentInstance, 'The DeferredActionQueues object exists');
        assert.equal(step++, 1);
    });
    QUnit.test('customizing flushing per queue via flush', function (assert) {
        assert.step('start');
        var deferredFlush;
        var bb = new Backburner__default([
            'zomg',
            'render',
            'afterRender'
        ], {
            flush: function flush(queueName, flush$1) {
                if (queueName === 'render') {
                    deferredFlush = flush$1;
                }
                else {
                    flush$1();
                }
            }
        });
        bb.schedule('zomg', null, function () {
            assert.step('running zomg');
        });
        bb.schedule('render', null, function () {
            assert.step('running render');
        });
        bb.schedule('afterRender', null, function () {
            assert.step('running afterRender');
        });
        return escapeCurrentMicrotaskQueue()
            .then(function () {
            deferredFlush();
        })
            .then(escapeCurrentMicrotaskQueue)
            .then(function () {
            assert.verifySteps([
                'start',
                'running zomg',
                'running render',
                'running afterRender' ]);
        });
    });
    QUnit.test('customized flushing - precedence is rechecked upon each flush', function (assert) {
        assert.step('start');
        var deferredFlush;
        var bb = new Backburner__default([
            'zomg',
            'render',
            'afterRender'
        ], {
            flush: function flush(queueName, flush$1) {
                if (deferredFlush === undefined && queueName === 'render') {
                    deferredFlush = flush$1;
                }
                else {
                    flush$1();
                }
            }
        });
        bb.schedule('zomg', null, function () {
            assert.step('running zomg');
        });
        bb.schedule('render', null, function () {
            assert.step('running render');
        });
        bb.schedule('afterRender', null, function () {
            assert.step('running afterRender');
        });
        return escapeCurrentMicrotaskQueue()
            .then(function () {
            bb.schedule('zomg', null, function () {
                assert.step('running zomg 2');
            });
            deferredFlush();
        })
            .then(escapeCurrentMicrotaskQueue)
            .then(function () {
            assert.verifySteps([
                'start',
                'running zomg',
                'running zomg 2',
                'running render',
                'running afterRender' ]);
        });
    });
    QUnit.test('customizing flushing per queue via flush - with forced run', function (assert) {
        assert.step('start');
        var bb = new Backburner__default([
            'zomg',
            'render',
            'afterRender'
        ], {
            flush: function flush(queueName, flush$1) {
                if (queueName === 'render') ;
                else {
                    flush$1();
                }
            }
        });
        bb.schedule('zomg', null, function () {
            assert.step('running zomg');
        });
        bb.schedule('render', null, function () {
            assert.step('running render');
        });
        bb.schedule('afterRender', null, function () {
            assert.step('running afterRender');
        });
        return escapeCurrentMicrotaskQueue()
            .then(function () {
            bb.run(function () { });
            assert.verifySteps([
                'start',
                'running zomg',
                'running render',
                'running afterRender' ]);
        });
    });

    QUnit.module('tests/bb-has-timers');
    QUnit.test('hasTimers', function (assert) {
        var done = assert.async();
        var bb = new Backburner__default(['ohai']);
        var timer;
        var target = {
            fn: function fn() { }
        };
        bb.schedule('ohai', null, function () {
            assert.ok(!bb.hasTimers(), 'Initially there are no timers');
            timer = bb.later('ohai', function () { });
            assert.ok(bb.hasTimers(), 'hasTimers checks timers');
            bb.cancel(timer);
            assert.ok(!bb.hasTimers(), 'Timers are cleared');
            timer = bb.debounce(target, 'fn', 200);
            assert.ok(bb.hasTimers(), 'hasTimers checks debouncees');
            bb.cancel(timer);
            assert.ok(!bb.hasTimers(), 'Timers are cleared');
            timer = bb.throttle(target, 'fn', 200);
            assert.ok(bb.hasTimers(), 'hasTimers checks throttlers');
            bb.cancel(timer);
            assert.ok(!bb.hasTimers(), 'Timers are cleared');
            done();
        });
    });

    QUnit.module('tests/build-next', function () {
        QUnit.test('can build custom flushing next', function (assert) {
            var done = assert.async();
            var next = Backburner__default.buildNext(function () { return assert.step('custom next'); });
            assert.step('start');
            Promise.resolve().then(function () { return assert.step('first promise resolved'); });
            next();
            Promise.resolve().then(function () { return assert.step('second promise resolved'); });
            assert.step('end');
            setTimeout(function () {
                assert.verifySteps([
                    'start',
                    'end',
                    'first promise resolved',
                    'custom next',
                    'second promise resolved' ]);
                done();
            }, 10);
        });
    });

    QUnit.module('tests/cancel');
    QUnit.test('scheduleOnce', function (assert) {
        assert.expect(3);
        var bb = new Backburner__default(['one']);
        var functionWasCalled = false;
        bb.run(function () {
            var timer = bb.scheduleOnce('one', function () { return functionWasCalled = true; });
            assert.ok(timer, 'Timer object was returned');
            assert.ok(bb.cancel(timer), 'Cancel returned true');
            assert.ok(!functionWasCalled, 'function was not called');
        });
    });
    QUnit.test('cancelling does not affect future scheduleOnce calls', function (assert) {
        assert.expect(5);
        var bb = new Backburner__default(['queueName']);
        var f1Calls = [];
        var f2Calls = [];
        var f3Calls = [];
        var f1 = function (arg) { return f1Calls.push(arg); };
        var f2 = function (arg) { return f2Calls.push(arg); };
        var f3 = function (arg) { return f3Calls.push(arg); };
        bb.run(function () {
            var toCancel = bb.scheduleOnce('queueName', null, f1, 'f1 cancelled schedule');
            bb.scheduleOnce('queueName', null, f2, 'f2 first schedule');
            bb.scheduleOnce('queueName', null, f3, 'f3 first schedule');
            bb.cancel(toCancel);
            bb.scheduleOnce('queueName', null, f2, 'f2 second schedule');
        });
        assert.equal(f1Calls.length, 0, 'f1 was not called');
        assert.equal(f2Calls.length, 1, 'f2 was called once');
        assert.equal(f3Calls.length, 1, 'f3 was called once');
        assert.deepEqual(f2Calls, ['f2 second schedule'], 'f2 received the correct argument');
        assert.deepEqual(f3Calls, ['f3 first schedule'], 'f3 received the correct argument');
    });
    QUnit.test('setTimeout', function (assert) {
        assert.expect(5);
        var done = assert.async();
        var called = false;
        var bb = new Backburner__default(['one'], {
            onBegin: function onBegin() {
                called = true;
            }
        });
        var functionWasCalled = false;
        var timer = bb.later(function () { return functionWasCalled = true; });
        assert.ok(timer, 'Timer object was returned');
        assert.ok(bb.cancel(timer), 'Cancel returned true');
        assert.ok(!called, 'onBegin was not called');
        setTimeout(function () {
            assert.ok(!functionWasCalled, 'function was not called');
            assert.ok(!called, 'onBegin was not called');
            done();
        }, 0);
    });
    QUnit.test('setTimeout with multiple pending', function (assert) {
        assert.expect(7);
        var done = assert.async();
        var called = false;
        var bb = new Backburner__default(['one'], {
            onBegin: function onBegin() {
                called = true;
            }
        });
        var function1WasCalled = false;
        var function2WasCalled = false;
        var timer1 = bb.later(function () { return function1WasCalled = true; });
        var timer2 = bb.later(function () { return function2WasCalled = true; });
        assert.ok(timer1, 'Timer object 2 was returned');
        assert.ok(bb.cancel(timer1), 'Cancel for timer 1 returned true');
        assert.ok(timer2, 'Timer object 2 was returned');
        assert.ok(!called, 'onBegin was not called');
        setTimeout(function () {
            assert.ok(!function1WasCalled, 'function 1 was not called');
            assert.ok(function2WasCalled, 'function 2 was called');
            assert.ok(called, 'onBegin was called');
            done();
        }, 10);
    });
    QUnit.test('setTimeout and creating a new later', function (assert) {
        assert.expect(7);
        var done = assert.async();
        var called = false;
        var bb = new Backburner__default(['one'], {
            onBegin: function onBegin() {
                called = true;
            }
        });
        var function1WasCalled = false;
        var function2WasCalled = false;
        var timer1 = bb.later(function () { return function1WasCalled = true; }, 0);
        assert.ok(timer1, 'Timer object 2 was returned');
        assert.ok(bb.cancel(timer1), 'Cancel for timer 1 returned true');
        var timer2 = bb.later(function () { return function2WasCalled = true; }, 1);
        assert.ok(timer2, 'Timer object 2 was returned');
        assert.ok(!called, 'onBegin was not called');
        setTimeout(function () {
            assert.ok(!function1WasCalled, 'function 1 was not called');
            assert.ok(function2WasCalled, 'function 2 was called');
            assert.ok(called, 'onBegin was called');
            done();
        }, 50);
    });
    QUnit.test('cancelTimers', function (assert) {
        assert.expect(8);
        var done = assert.async();
        var bb = new Backburner__default(['one']);
        var laterWasCalled = false;
        var debounceWasCalled = false;
        var throttleWasCalled = false;
        var timer1 = bb.later(function () { return laterWasCalled = true; }, 0);
        var timer2 = bb.debounce(function () { return debounceWasCalled = true; }, 0);
        var timer3 = bb.throttle(function () { return throttleWasCalled = true; }, 0, false);
        assert.ok(timer1, 'Timer object was returned');
        assert.ok(timer2, 'Timer object was returned');
        assert.ok(timer3, 'Timer object was returned');
        assert.ok(bb.hasTimers(), 'bb has scheduled timer');
        bb.cancelTimers();
        setTimeout(function () {
            assert.ok(!bb.hasTimers(), 'bb has no scheduled timer');
            assert.ok(!laterWasCalled, 'later function was not called');
            assert.ok(!debounceWasCalled, 'debounce function was not called');
            assert.ok(!throttleWasCalled, 'throttle function was not called');
            done();
        }, 100);
    });
    QUnit.test('cancel during flush', function (assert) {
        assert.expect(1);
        var bb = new Backburner__default(['one']);
        var functionWasCalled = false;
        bb.run(function () {
            var timer1 = bb.scheduleOnce('one', function () { return bb.cancel(timer2); });
            var timer2 = bb.scheduleOnce('one', function () { return functionWasCalled = true; });
        });
        assert.ok(!functionWasCalled, 'function was not called');
    });
    QUnit.test('with target', function (assert) {
        assert.expect(3);
        var obj = {
            ___FOO___: 1
        };
        var bb = new Backburner__default(['action']);
        var wasCalled = 0;
        function fn() {
            wasCalled++;
        }
        bb.run(function () {
            var timer = bb.scheduleOnce('action', obj, fn);
            assert.equal(wasCalled, 0);
            bb.cancel(timer);
            bb.scheduleOnce('action', obj, fn);
            assert.equal(wasCalled, 0);
        });
        assert.equal(wasCalled, 1);
    });
    QUnit.test('no target', function (assert) {
        assert.expect(3);
        var bb = new Backburner__default(['action']);
        var wasCalled = 0;
        function fn() {
            wasCalled++;
        }
        bb.run(function () {
            var timer = bb.scheduleOnce('action', fn);
            assert.equal(wasCalled, 0);
            bb.cancel(timer);
            bb.scheduleOnce('action', fn);
            assert.equal(wasCalled, 0);
        });
        assert.equal(wasCalled, 1);
    });
    QUnit.test('cancel always returns boolean', function (assert) {
        var bb = new Backburner__default(['one']);
        bb.run(function () {
            var timer1 = bb.schedule('one', null, function () { });
            assert.equal(bb.cancel(timer1), true);
            assert.equal(bb.cancel(timer1), false);
            assert.equal(bb.cancel(timer1), false);
            var timer2 = bb.later(function () { }, 10);
            assert.equal(bb.cancel(timer2), true);
            assert.equal(bb.cancel(timer2), false);
            assert.equal(bb.cancel(timer2), false);
            var timer3 = bb.debounce(function () { }, 10);
            assert.equal(bb.cancel(timer3), true);
            assert.equal(bb.cancel(timer3), false);
            assert.equal(bb.cancel(timer3), false);
            assert.equal(bb.cancel(undefined), false);
            assert.equal(bb.cancel(null), false);
            assert.equal(bb.cancel({}), false);
            assert.equal(bb.cancel([]), false);
            assert.equal(bb.cancel(42), false);
            assert.equal(bb.cancel('42'), false);
        });
    });

    QUnit.module('tests/configurable-timeout');
    QUnit.test('We can configure a custom platform', function (assert) {
        assert.expect(1);
        var bb = new Backburner__default(['one'], {
            _buildPlatform: function _buildPlatform(flush) {
                var platform = Backburner.buildPlatform(flush);
                platform['isFakePlatform'] = true;
                return platform;
            }
        });
        assert.ok(bb['_platform']['isFakePlatform'], 'We can pass in a custom platform');
    });
    QUnit.test('We can use a custom setTimeout', function (assert) {
        assert.expect(1);
        var done = assert.async();
        var customNextWasUsed = false;
        var bb = new Backburner__default(['one'], {
            _buildPlatform: function _buildPlatform(flush) {
                return {
                    next: function next() {
                        throw new TypeError('NOT IMPLEMENTED');
                    },
                    clearNext: function clearNext() { },
                    setTimeout: function setTimeout$1(cb) {
                        customNextWasUsed = true;
                        return setTimeout(cb);
                    },
                    clearTimeout: function clearTimeout$1(timer) {
                        return clearTimeout(timer);
                    },
                    now: function now() {
                        return Date.now();
                    },
                    isFakePlatform: true
                };
            }
        });
        bb.setTimeout(function () {
            assert.ok(customNextWasUsed, 'custom later was used');
            done();
        });
    });
    QUnit.test('We can use a custom next', function (assert) {
        assert.expect(1);
        var done = assert.async();
        var customNextWasUsed = false;
        var bb = new Backburner__default(['one'], {
            _buildPlatform: function _buildPlatform(flush) {
                return {
                    setTimeout: function setTimeout() {
                        throw new TypeError('NOT IMPLEMENTED');
                    },
                    clearTimeout: function clearTimeout$1(timer) {
                        return clearTimeout(timer);
                    },
                    next: function next() {
                        // next is used for the autorun
                        customNextWasUsed = true;
                        return setTimeout(flush);
                    },
                    clearNext: function clearNext() { },
                    now: function now() { return Date.now(); },
                    isFakePlatform: true
                };
            }
        });
        bb.scheduleOnce('one', function () {
            assert.ok(customNextWasUsed, 'custom later was used');
            done();
        });
    });
    QUnit.test('We can use a custom clearTimeout', function (assert) {
        assert.expect(2);
        var functionWasCalled = false;
        var customClearTimeoutWasUsed = false;
        var bb = new Backburner__default(['one'], {
            _buildPlatform: function _buildPlatform(flush) {
                return {
                    setTimeout: function setTimeout$1(method, wait) {
                        return setTimeout(method, wait);
                    },
                    clearTimeout: function clearTimeout$1(timer) {
                        customClearTimeoutWasUsed = true;
                        return clearTimeout(timer);
                    },
                    next: function next() {
                        return setTimeout(flush, 0);
                    },
                    clearNext: function clearNext() {
                        customClearTimeoutWasUsed = true;
                    },
                    now: function now() {
                        return Date.now();
                    }
                };
            }
        });
        bb.scheduleOnce('one', function () { return functionWasCalled = true; });
        bb.cancelTimers();
        bb.run(function () {
            bb.scheduleOnce('one', function () {
                assert.ok(!functionWasCalled, 'function was not called');
                assert.ok(customClearTimeoutWasUsed, 'custom clearTimeout was used');
            });
        });
    });
    QUnit.test('We can use a custom now', function (assert) {
        assert.expect(1);
        var done = assert.async();
        var currentTime = 10;
        var customNowWasUsed = false;
        var bb = new Backburner__default(['one'], {
            _buildPlatform: function _buildPlatform(flush) {
                return {
                    setTimeout: function setTimeout$1(method, wait) {
                        return setTimeout(method, wait);
                    },
                    clearTimeout: function clearTimeout$1(id) {
                        clearTimeout(id);
                    },
                    next: function next() {
                        return setTimeout(flush, 0);
                    },
                    clearNext: function clearNext() { },
                    now: function now() {
                        customNowWasUsed = true;
                        return currentTime += 10;
                    },
                };
            }
        });
        bb.later(function () {
            assert.ok(customNowWasUsed, 'custom now was used');
            done();
        }, 10);
    });

    var DATE_NOW = Date.now;
    var fakeClock$1;
    QUnit.module('tests/debounce', {
        afterEach: function afterEach() {
            if (fakeClock$1) {
                fakeClock$1.uninstall();
            }
        }
    });
    QUnit.test('debounce', function (assert) {
        assert.expect(14);
        var bb = new Backburner__default(['zomg']);
        var step = 0;
        var done = assert.async();
        var wasCalled = false;
        function debouncee() {
            assert.ok(!wasCalled);
            wasCalled = true;
        }
        // let's debounce the function `debouncee` for 40ms
        // it will be executed 40ms after
        bb.debounce(null, debouncee, 40);
        assert.equal(step++, 0);
        // let's schedule `debouncee` to run in 10ms
        setTimeout(function () {
            assert.equal(step++, 1);
            assert.ok(!wasCalled, '@10ms, should not yet have been called');
            bb.debounce(null, debouncee, 40);
        }, 10);
        // let's schedule `debouncee` to run again in 30ms
        setTimeout(function () {
            assert.equal(step++, 2);
            assert.ok(!wasCalled, '@ 30ms, should not yet have been called');
            bb.debounce(null, debouncee, 40);
        }, 30);
        // let's schedule `debouncee` to run yet again in 60ms
        setTimeout(function () {
            assert.equal(step++, 3);
            assert.ok(!wasCalled, '@ 60ms, should not yet have been called');
            bb.debounce(null, debouncee, 40);
        }, 60);
        // now, let's schedule an assertion to occur at 110ms,
        // 10ms after `debouncee` has been called the last time
        setTimeout(function () {
            assert.equal(step++, 4);
            assert.ok(wasCalled, '@ 110ms should have been called');
        }, 110);
        // great, we've made it this far, there's one more thing
        // we need to test. we want to make sure we can call `debounce`
        // again with the same target/method after it has executed
        // at the 120ms mark, let's schedule another call to `debounce`
        setTimeout(function () {
            wasCalled = false; // reset the flag
            // assert call order
            assert.equal(step++, 5);
            // call debounce for the second time
            bb.debounce(null, debouncee, 100);
            // assert that it is called in the future and not blackholed
            setTimeout(function () {
                assert.equal(step++, 6);
                assert.ok(wasCalled, 'Another debounce call with the same function can be executed later');
                done();
            }, 230);
        }, 120);
    });
    QUnit.test('debounce - immediate', function (assert) {
        assert.expect(16);
        var done = assert.async();
        var bb = new Backburner__default(['zomg']);
        var step = 0;
        var wasCalled = false;
        function debouncee() {
            assert.ok(!wasCalled);
            wasCalled = true;
        }
        // let's debounce the function `debouncee` for 40ms
        // it will be executed immediately, and prevent
        // any actions for 40ms after
        bb.debounce(null, debouncee, 40, true);
        assert.equal(step++, 0);
        assert.ok(wasCalled);
        wasCalled = false;
        // let's schedule `debouncee` to run in 10ms
        setTimeout(function () {
            assert.equal(step++, 1);
            assert.ok(!wasCalled);
            bb.debounce(null, debouncee, 40, true);
        }, 10);
        // let's schedule `debouncee` to run again in 30ms
        setTimeout(function () {
            assert.equal(step++, 2);
            assert.ok(!wasCalled);
            bb.debounce(null, debouncee, 40, true);
        }, 30);
        // let's schedule `debouncee` to run yet again in 60ms
        setTimeout(function () {
            assert.equal(step++, 3);
            assert.ok(!wasCalled);
            bb.debounce(null, debouncee, 40, true);
        }, 60);
        // now, let's schedule an assertion to occur at 110ms,
        // 10ms after `debouncee` has been called the last time
        setTimeout(function () {
            assert.equal(step++, 4);
            assert.ok(!wasCalled);
        }, 110);
        // great, we've made it this far, there's one more thing
        // we need to QUnit.test. we want to make sure we can call `debounce`
        // again with the same target/method after it has executed
        // at the 120ms mark, let's schedule another call to `debounce`
        setTimeout(function () {
            wasCalled = false; // reset the flag
            // assert call order
            assert.equal(step++, 5);
            // call debounce for the second time
            bb.debounce(null, debouncee, 100, true);
            assert.ok(wasCalled, 'Another debounce call with the same function can be executed later');
            wasCalled = false;
            // assert that it is called in the future and not blackholed
            setTimeout(function () {
                assert.equal(step++, 6);
                assert.ok(!wasCalled);
                done();
            }, 230);
        }, 120);
    });
    QUnit.test('debounce + immediate joins existing run loop instances', function (assert) {
        assert.expect(1);
        function onError(error) {
            throw error;
        }
        var bb = new Backburner__default(['errors'], {
            onError: onError
        });
        bb.run(function () {
            var parentInstance = bb.currentInstance;
            bb.debounce(null, function () {
                assert.equal(bb.currentInstance, parentInstance);
            }, 20, true);
        });
    });
    QUnit.test('debounce accept time interval like string numbers', function (assert) {
        var done = assert.async();
        var bb = new Backburner__default(['zomg']);
        var step = 0;
        var wasCalled = false;
        function debouncee() {
            assert.ok(!wasCalled);
            wasCalled = true;
        }
        bb.debounce(null, debouncee, '40');
        assert.equal(step++, 0);
        setTimeout(function () {
            assert.equal(step++, 1);
            assert.ok(!wasCalled);
            bb.debounce(null, debouncee, '40');
        }, 10);
        setTimeout(function () {
            assert.equal(step++, 2);
            assert.ok(wasCalled);
            done();
        }, 60);
    });
    QUnit.test('debounce returns timer information usable for canceling', function (assert) {
        assert.expect(3);
        var done = assert.async();
        var bb = new Backburner__default(['batman']);
        var wasCalled = false;
        function debouncee() {
            assert.ok(false, 'this method shouldn\'t be called');
            wasCalled = true;
        }
        var timer = bb.debounce(null, debouncee, 1);
        assert.ok(bb.cancel(timer), 'the timer is cancelled');
        // should return false second time around
        assert.ok(!bb.cancel(timer), 'the timer no longer exists in the list');
        setTimeout(function () {
            assert.ok(!wasCalled, 'the timer wasn\'t called after waiting');
            done();
        }, 60);
    });
    QUnit.test('debounce cancelled after it\'s executed returns false', function (assert) {
        assert.expect(3);
        var done = assert.async();
        var bb = new Backburner__default(['darkknight']);
        var wasCalled = false;
        function debouncee() {
            assert.ok(true, 'the debounced method was called');
            wasCalled = true;
        }
        var timer = bb.debounce(null, debouncee, 1);
        setTimeout(function () {
            assert.ok(!bb.cancel(timer), 'no timer existed to cancel');
            assert.ok(wasCalled, 'the timer was actually called');
            done();
        }, 10);
    });
    QUnit.test('debounced function is called with final argument', function (assert) {
        assert.expect(1);
        var done = assert.async();
        var bb = new Backburner__default(['joker']);
        function debouncee(arg) {
            assert.equal('bus', arg, 'the debounced is called with right argument');
            done();
        }
        bb.debounce(null, debouncee, 'car', 10);
        bb.debounce(null, debouncee, 'bicycle', 10);
        bb.debounce(null, debouncee, 'bus', 10);
    });
    QUnit.test('debounce cancelled doesn\'t cancel older items', function (assert) {
        assert.expect(4);
        var bb = new Backburner__default(['robin']);
        var wasCalled = false;
        var done = assert.async();
        function debouncee() {
            assert.ok(true, 'the debounced method was called');
            if (wasCalled) {
                done();
            }
            wasCalled = true;
        }
        var timer = bb.debounce(null, debouncee, 1);
        setTimeout(function () {
            bb.debounce(null, debouncee, 1);
            assert.ok(!bb.cancel(timer), 'the second timer isn\'t removed, despite appearing to be the same');
            assert.ok(wasCalled, 'the timer was actually called');
        }, 10);
    });
    QUnit.test('debounce that is immediate, and cancelled and called again happens immediately', function (assert) {
        assert.expect(3);
        var done = assert.async();
        var bb = new Backburner__default(['robin']);
        var calledCount = 0;
        function debouncee() {
            calledCount++;
        }
        var timer = bb.debounce(null, debouncee, 1000, true);
        setTimeout(function () {
            assert.equal(1, calledCount, 'debounced method was called');
            assert.ok(bb.cancel(timer), 'debounced delay was cancelled');
            bb.debounce(null, debouncee, 1000, true);
            setTimeout(function () {
                assert.equal(2, calledCount, 'debounced method was called again immediately');
                done();
            }, 10);
        }, 10);
    });
    QUnit.test('debounce without a target, without args', function (assert) {
        var done = assert.async();
        var bb = new Backburner__default(['batman']);
        var calledCount = 0;
        var calledWith = new Array();
        function debouncee() {
            var args = [], len = arguments.length;
            while ( len-- ) args[ len ] = arguments[ len ];

            calledCount++;
            calledWith.push(args);
        }
        bb.debounce(debouncee, 10);
        bb.debounce(debouncee, 10);
        bb.debounce(debouncee, 10);
        assert.equal(calledCount, 0, 'debounced method was not called immediately');
        setTimeout(function () {
            assert.equal(calledCount, 0, 'debounced method was not called on next tick');
        }, 0);
        setTimeout(function () {
            assert.equal(calledCount, 1, 'debounced method was was only called once');
            assert.deepEqual(calledWith, [[]], 'debounce called once without arguments');
            done();
        }, 20);
    });
    QUnit.test('debounce without a target, without args - can be canceled', function (assert) {
        var done = assert.async();
        var bb = new Backburner__default(['batman']);
        var calledCount = 0;
        function debouncee() {
            calledCount++;
        }
        bb.debounce(debouncee, 10);
        bb.debounce(debouncee, 10);
        var timer = bb.debounce(debouncee, 10);
        assert.equal(calledCount, 0, 'debounced method was not called immediately');
        setTimeout(function () {
            bb.cancel(timer);
            assert.equal(calledCount, 0, 'debounced method was not called on next tick');
        }, 0);
        setTimeout(function () {
            assert.equal(calledCount, 0, 'debounced method was canceled properly');
            done();
        }, 20);
    });
    QUnit.test('debounce without a target, without args, immediate', function (assert) {
        var done = assert.async();
        var bb = new Backburner__default(['batman']);
        var calledCount = 0;
        var calledWith = new Array();
        function debouncee() {
            var args = [], len = arguments.length;
            while ( len-- ) args[ len ] = arguments[ len ];

            calledCount++;
            calledWith.push(args);
        }
        bb.debounce(debouncee, 10, true);
        bb.debounce(debouncee, 10, true);
        bb.debounce(debouncee, 10, true);
        assert.equal(calledCount, 1, 'debounced method was called immediately');
        assert.deepEqual(calledWith, [[]], 'debounce method was called with the correct arguments');
        setTimeout(function () {
            bb.debounce(debouncee, 10, true);
            assert.equal(calledCount, 1, 'debounced method was not called again within the time window');
        }, 0);
        setTimeout(function () {
            assert.equal(calledCount, 1, 'debounced method was was only called once');
            done();
        }, 20);
    });
    QUnit.test('debounce without a target, without args, immediate - can be canceled', function (assert) {
        var bb = new Backburner__default(['batman']);
        var fooCalledCount = 0;
        var barCalledCount = 0;
        function foo() {
            fooCalledCount++;
        }
        function bar() {
            barCalledCount++;
        }
        bb.debounce(foo, 10, true);
        bb.debounce(foo, 10, true);
        assert.equal(fooCalledCount, 1, 'foo was called immediately, then debounced');
        bb.debounce(bar, 10, true);
        var timer = bb.debounce(bar, 10, true);
        assert.equal(barCalledCount, 1, 'bar was called immediately, then debounced');
        bb.cancel(timer);
        bb.debounce(bar, 10, true);
        assert.equal(barCalledCount, 2, 'after canceling the prior debounce, bar was called again');
    });
    QUnit.test('debounce without a target, with args', function (assert) {
        var done = assert.async();
        var bb = new Backburner__default(['batman']);
        var calledCount = 0;
        var calledWith = [];
        function debouncee(first) {
            calledCount++;
            calledWith.push(first);
        }
        var foo = { isFoo: true };
        var bar = { isBar: true };
        var baz = { isBaz: true };
        bb.debounce(debouncee, foo, 10);
        bb.debounce(debouncee, bar, 10);
        bb.debounce(debouncee, baz, 10);
        assert.equal(calledCount, 0, 'debounced method was not called immediately');
        setTimeout(function () {
            assert.deepEqual(calledWith, [{ isBaz: true }], 'debounce method was only called once, with correct argument');
            done();
        }, 20);
    });
    QUnit.test('debounce without a target, with args - can be canceled', function (assert) {
        var done = assert.async();
        var bb = new Backburner__default(['batman']);
        var calledCount = 0;
        var calledWith = [];
        function debouncee(first) {
            calledCount++;
            calledWith.push(first);
        }
        var foo = { isFoo: true };
        var bar = { isBar: true };
        var baz = { isBaz: true };
        bb.debounce(debouncee, foo, 10);
        bb.debounce(debouncee, bar, 10);
        var timer = bb.debounce(debouncee, baz, 10);
        assert.equal(calledCount, 0, 'debounced method was not called immediately');
        setTimeout(function () {
            assert.deepEqual(calledWith, [], 'debounce method has not been called on next tick');
            bb.cancel(timer);
        }, 0);
        setTimeout(function () {
            assert.deepEqual(calledWith, [], 'debounce method is not called when canceled');
            done();
        }, 20);
    });
    QUnit.test('debounce without a target, with args, immediate', function (assert) {
        var done = assert.async();
        var bb = new Backburner__default(['batman']);
        var calledWith = new Array();
        function debouncee(first) {
            calledWith.push(first);
        }
        var foo = { isFoo: true };
        var bar = { isBar: true };
        var baz = { isBaz: true };
        var qux = { isQux: true };
        bb.debounce(debouncee, foo, 10, true);
        bb.debounce(debouncee, bar, 10, true);
        bb.debounce(debouncee, baz, 10, true);
        assert.deepEqual(calledWith, [{ isFoo: true }], 'debounce method was only called once, with correct argument');
        setTimeout(function () {
            bb.debounce(debouncee, qux, 10, true);
            assert.deepEqual(calledWith, [{ isFoo: true }], 'debounce method was only called once, with correct argument');
        }, 0);
        setTimeout(function () {
            assert.deepEqual(calledWith, [{ isFoo: true }], 'debounce method was only called once, with correct argument');
            done();
        }, 20);
    });
    QUnit.test('debounce without a target, with args, immediate - can be canceled', function (assert) {
        var done = assert.async();
        var bb = new Backburner__default(['batman']);
        var calledWith = [];
        function debouncee(first) {
            calledWith.push(first);
        }
        var foo = { isFoo: true };
        var bar = { isBar: true };
        var baz = { isBaz: true };
        var qux = { isQux: true };
        bb.debounce(debouncee, foo, 10, true);
        bb.debounce(debouncee, bar, 10, true);
        var timer = bb.debounce(debouncee, baz, 10, true);
        assert.deepEqual(calledWith, [{ isFoo: true }], 'debounce method was only called once, with correct argument');
        setTimeout(function () {
            bb.cancel(timer);
            bb.debounce(debouncee, qux, 10, true);
            assert.deepEqual(calledWith, [{ isFoo: true }, { isQux: true }], 'debounce method was called again after canceling prior timer');
        }, 0);
        setTimeout(function () {
            assert.deepEqual(calledWith, [{ isFoo: true }, { isQux: true }], 'debounce method was not called again');
            done();
        }, 20);
    });
    QUnit.test('onError', function (assert) {
        assert.expect(1);
        var done = assert.async();
        function onError(error) {
            assert.equal('QUnit.test error', error.message);
            done();
        }
        var bb = new Backburner__default(['errors'], {
            onError: onError
        });
        bb.debounce(null, function () { throw new Error('QUnit.test error'); }, 20);
    });
    QUnit.test('debounce within a debounce can be canceled GH#183', function (assert) {
        assert.expect(3);
        var done = assert.async();
        var bb = new Backburner__default(['zomg']);
        var foo = function () {
            assert.ok(true, 'foo called');
            return bb.debounce(bar, 10);
        };
        var bar = function () {
            assert.ok(true, 'bar called');
            var timer = foo();
            bb.cancel(timer);
            setTimeout(done, 10);
        };
        foo();
    });
    QUnit.test('when [callback, string] args passed', function (assert) {
        assert.expect(2);
        var bb = new Backburner__default(['one']);
        var functionWasCalled = false;
        bb.run(function () {
            bb.debounce(function (name) {
                assert.equal(name, 'batman');
                functionWasCalled = true;
            }, 'batman', 100, true);
        });
        assert.ok(functionWasCalled, 'function was called');
    });
    QUnit.test('can be ran "early" with fake timers GH#351', function (assert) {
        assert.expect(1);
        var done = assert.async();
        var bb = new Backburner__default(['one']);
        fakeClock$1 = lolexSrc.install();
        var startTime = DATE_NOW();
        bb.debounce(function () {
            var endTime = DATE_NOW();
            assert.ok(endTime - startTime < 100, 'executed in less than 5000ms');
            done();
        }, 5000);
        fakeClock$1.tick(5001);
    });

    var ERROR = Error;
    // @ts-ignore - Skip preventing overriding the readonly Error object
    Error = ERROR;
    var stacks = [];
    function pushStackTrace(stackLine) {
        stacks.push(stackLine);
        return stackLine;
    }
    function overrideError(_Error) {
        // @ts-ignore
        Error = _Error;
    }
    function resetError() {
        // @ts-ignore
        Error = ERROR;
        stacks = [];
    }
    var MockStableError = function MockStableError(message) {
        this.message = message;
    };

    var prototypeAccessors = { stack: { configurable: true } };
    prototypeAccessors.stack.get = function () {
        return stacks.pop() || '';
    };

    Object.defineProperties( MockStableError.prototype, prototypeAccessors );

    QUnit.module('tests/debug-info', {
        beforeEach: function () {
            // @ts-ignore
            overrideError(MockStableError);
        },
        afterEach: function () {
            resetError();
        }
    });
    QUnit.test('getDebugInfo returns undefined when DEBUG = false', function (assert) {
        assert.expect(1);
        var debugInfo;
        var bb = new Backburner__default(['one']);
        bb.run(function () {
            debugInfo = bb.getDebugInfo();
            assert.equal(debugInfo, undefined, 'DebugInfo is undefined when DEBUG = false');
        });
    });
    QUnit.test('getDebugInfo returns debugInfo using later when DEBUG = true', function (assert) {
        assert.expect(1);
        var debugInfo;
        var target1 = { one: true };
        var target2 = { two: true };
        var method = function () { };
        var arg1 = 1;
        var arg2 = 2;
        var twoStack = pushStackTrace('Two stack');
        var oneStack = pushStackTrace('One stack');
        var bb = new Backburner__default(['one']);
        bb.DEBUG = true;
        bb.run(function () {
            bb.later(target1, method, arg1, 1000);
            bb.later(target2, method, arg1, arg2, 1000);
            debugInfo = bb.getDebugInfo();
            resetError();
            assert.deepEqual(debugInfo.timers, [
                {
                    args: [arg1],
                    method: method,
                    stack: oneStack,
                    target: target1
                },
                {
                    args: [arg1, arg2],
                    method: method,
                    stack: twoStack,
                    target: target2
                }
            ], 'debugInfo is output');
        });
    });
    QUnit.test('getDebugInfo returns debugInfo using throttle when DEBUG = true', function (assert) {
        assert.expect(1);
        var debugInfo;
        var target1 = { one: true };
        var target2 = { two: true };
        var method = function () { };
        var arg1 = 1;
        var arg2 = 2;
        var twoStack = pushStackTrace('Two stack');
        var oneStack = pushStackTrace('One stack');
        var bb = new Backburner__default(['one']);
        bb.DEBUG = true;
        bb.run(function () {
            bb.throttle(target1, method, arg1, 1000, false);
            bb.throttle(target2, method, arg1, arg2, 1000, false);
            debugInfo = bb.getDebugInfo();
            resetError();
            assert.deepEqual(debugInfo.timers, [
                {
                    args: [arg1],
                    method: method,
                    stack: oneStack,
                    target: target1
                },
                {
                    args: [arg1, arg2],
                    method: method,
                    stack: twoStack,
                    target: target2
                }
            ], 'debugInfo is output');
        });
    });
    QUnit.test('getDebugInfo returns debugInfo using debounce when DEBUG = true', function (assert) {
        assert.expect(1);
        var debugInfo;
        var target1 = { one: true };
        var target2 = { two: true };
        var method = function () { };
        var arg1 = 1;
        var arg2 = 2;
        var twoStack = pushStackTrace('Two stack');
        var oneStack = pushStackTrace('One stack');
        var bb = new Backburner__default(['one']);
        bb.DEBUG = true;
        bb.run(function () {
            bb.debounce(target1, method, arg1, 1000);
            bb.debounce(target2, method, arg1, arg2, 1000);
            debugInfo = bb.getDebugInfo();
            resetError();
            assert.deepEqual(debugInfo.timers, [
                {
                    args: [arg1],
                    method: method,
                    stack: oneStack,
                    target: target1
                },
                {
                    args: [arg1, arg2],
                    method: method,
                    stack: twoStack,
                    target: target2
                }
            ], 'debugInfo is output');
        });
    });
    QUnit.test('getDebugInfo returns debugInfo using when DEBUG = true', function (assert) {
        assert.expect(1);
        var debugInfo;
        var target1 = { one: true };
        var target2 = { two: true };
        var method = function () { };
        var arg1 = 1;
        var arg2 = 2;
        var twoStack = pushStackTrace('Two stack');
        var oneStack = pushStackTrace('One stack');
        var bb = new Backburner__default(['one', 'two']);
        bb.DEBUG = true;
        bb.run(function () {
            bb.schedule('one', target1, method, arg1);
            bb.schedule('two', target2, method, arg1, arg2);
            debugInfo = bb.getDebugInfo();
            resetError();
            assert.deepEqual(debugInfo.instanceStack, [
                {
                    one: [
                        {
                            args: [arg1],
                            method: method,
                            stack: oneStack,
                            target: target1
                        }
                    ],
                    two: [
                        {
                            args: [arg1, arg2],
                            method: method,
                            stack: twoStack,
                            target: target2
                        }
                    ]
                }
            ], 'debugInfo is output');
        });
    });
    QUnit.test('getDebugInfo returns debugInfo when DEBUG = true in nested run', function (assert) {
        assert.expect(1);
        var debugInfo;
        var method = function () { };
        var twoStack = pushStackTrace('Two stack');
        var oneStack = pushStackTrace('One stack');
        var fourStack = pushStackTrace('Four stack');
        var threeStack = pushStackTrace('Three stack');
        var bb = new Backburner__default(['one', 'two', 'three', 'four']);
        bb.DEBUG = true;
        bb.run(function () {
            bb.schedule('one', method);
            bb.schedule('two', method);
            bb.run(function () {
                bb.schedule('three', method);
                bb.schedule('four', method);
                debugInfo = bb.getDebugInfo();
                resetError();
                assert.deepEqual(debugInfo.instanceStack, [
                    {
                        four: [
                            {
                                args: undefined,
                                method: method,
                                stack: fourStack,
                                target: null
                            }
                        ],
                        one: [],
                        three: [
                            {
                                args: undefined,
                                method: method,
                                stack: threeStack,
                                target: null
                            }
                        ],
                        two: []
                    },
                    {
                        four: [],
                        one: [
                            {
                                args: undefined,
                                method: method,
                                stack: oneStack,
                                target: null
                            }
                        ],
                        three: [],
                        two: [
                            {
                                args: undefined,
                                method: method,
                                stack: twoStack,
                                target: null
                            }
                        ]
                    }
                ], 'debugInfo is output');
            });
        });
    });
    QUnit.test('autorun', function (assert) {
        var done = assert.async();
        var bb = new Backburner__default(['one']);
        var autorunStack = pushStackTrace('Autorun stack');
        pushStackTrace('Schedule stack');
        bb.DEBUG = true;
        bb.schedule('one', null, function () {
            setTimeout(function () {
                assert.equal(bb.getDebugInfo().autorun, null);
                done();
            });
        });
        assert.equal(bb.getDebugInfo().autorun.stack, autorunStack);
    });

    QUnit.module('tests/debug');
    QUnit.test('schedule - DEBUG flag enables stack tagging', function (assert) {
        var bb = new Backburner__default(['one']);
        bb.schedule('one', function () { });
        if (!bb.currentInstance) {
            throw new Error('bb has no instance');
        }
        assert.ok(bb.currentInstance && !bb.currentInstance.queues.one.stackFor(0), 'No stack is recorded');
        bb.DEBUG = true;
        bb.schedule('one', function () { });
        if (new Error().stack) { // workaround for CLI runner :(
            assert.expect(4);
            var stack = bb.currentInstance && bb.currentInstance.queues.one.stackFor(1);
            assert.ok(typeof stack === 'string', 'A stack is recorded');
            var onError = function (error, errorRecordedForStack) {
                assert.ok(errorRecordedForStack, 'errorRecordedForStack passed to error function');
                assert.ok(errorRecordedForStack.stack, 'stack is recorded');
            };
            bb = new Backburner__default(['errors'], { onError: onError });
            bb.DEBUG = true;
            bb.run(function () {
                bb.schedule('errors', function () {
                    throw new Error('message!');
                });
            });
        }
    });
    QUnit.test('later - DEBUG flag off does not capture stack', function (assert) {
        var done = assert.async();
        var onError = function (error, errorRecordedForStack) {
            assert.strictEqual(errorRecordedForStack, undefined, 'errorRecordedForStack is not passed to error function when DEBUG is not set');
            done();
        };
        var bb = new Backburner__default(['one'], { onError: onError });
        bb.later(function () {
            throw new Error('message!');
        });
    });
    if (new Error().stack) { // workaround for CLI runner :(
        QUnit.test('later - DEBUG flag on captures stack', function (assert) {
            assert.expect(3);
            var done = assert.async();
            var onError = function (error, errorRecordedForStack) {
                assert.ok(errorRecordedForStack, 'errorRecordedForStack passed to error function');
                assert.ok(errorRecordedForStack.stack, 'stack is recorded');
                assert.ok(errorRecordedForStack.stack.indexOf('later') > -1, 'stack includes `later` invocation');
                done();
            };
            var bb = new Backburner__default(['one'], { onError: onError });
            bb.DEBUG = true;
            bb.later(function () {
                throw new Error('message!');
            });
        });
    }

    QUnit.module('tests/defer-debug-info', {
        beforeEach: function () {
            // @ts-ignore
            overrideError(MockStableError);
        },
        afterEach: function () {
            resetError();
        }
    });
    QUnit.test('_getDebugInfo returns empty object with DEBUG = false', function (assert) {
        assert.expect(1);
        var debugInfo;
        var bb = new Backburner__default(['render', 'afterRender']);
        bb.run(function () {
            debugInfo = bb.currentInstance && bb.currentInstance._getDebugInfo(bb.DEBUG);
            assert.equal(debugInfo, undefined);
        });
    });
    QUnit.test('_getDebugInfo returns debugInfo when DEBUG = true', function (assert) {
        assert.expect(1);
        var debugInfo;
        var method = function () { };
        var afterRenderStack = pushStackTrace('afterRender stack');
        var renderStack = pushStackTrace('render stack');
        var bb = new Backburner__default(['render', 'afterRender']);
        bb.DEBUG = true;
        bb.run(function () {
            bb.schedule('render', method);
            bb.schedule('afterRender', method);
            debugInfo = bb.currentInstance && bb.currentInstance._getDebugInfo(bb.DEBUG);
            assert.deepEqual(debugInfo, {
                render: [
                    {
                        target: null,
                        method: method,
                        args: undefined,
                        stack: renderStack
                    }
                ],
                afterRender: [
                    {
                        target: null,
                        method: method,
                        args: undefined,
                        stack: afterRenderStack
                    }
                ]
            });
        });
    });

    QUnit.module('tests/defer-iterable');
    var Iterator = function Iterator(collection) {
        this._iteration = 0;
        this._collection = collection;
    };
    Iterator.prototype.next = function next () {
        var iteration = this._iteration++;
        var collection = this._collection;
        var done = collection.length <= iteration;
        var value = done ? undefined : collection[iteration];
        return {
            done: done,
            value: value
        };
    };
    QUnit.test('deferIterable', function (assert) {
        var bb = new Backburner__default(['zomg']);
        var order = 0;
        var tasks = {
            one: { count: 0, order: -1 },
            two: { count: 0, order: -1 },
            three: { count: 0, order: -1 }
        };
        function task1() {
            tasks.one.count++;
            tasks.one.order = order++;
        }
        function task2() {
            tasks.two.count++;
            tasks.two.order = order++;
        }
        function task3() {
            tasks.three.count++;
            tasks.three.order = order++;
        }
        var iterator = function () { return new Iterator([
            task1,
            task2,
            task3
        ]); };
        bb.run(function () {
            bb.scheduleIterable('zomg', iterator);
            assert.deepEqual(tasks, {
                one: { count: 0, order: -1 },
                two: { count: 0, order: -1 },
                three: { count: 0, order: -1 }
            });
        });
        assert.deepEqual(tasks, {
            one: { count: 1, order: 0 },
            two: { count: 1, order: 1 },
            three: { count: 1, order: 2 }
        });
    });

    QUnit.module('tests/defer-once');
    QUnit.test('when passed a function', function (assert) {
        assert.expect(1);
        var bb = new Backburner__default(['one']);
        var functionWasCalled = false;
        bb.run(function () {
            bb.scheduleOnce('one', function () {
                functionWasCalled = true;
            });
        });
        assert.ok(functionWasCalled, 'function was called');
    });
    QUnit.test('when passed a target and method', function (assert) {
        assert.expect(2);
        var bb = new Backburner__default(['one']);
        var functionWasCalled = false;
        bb.run(function () {
            bb.scheduleOnce('one', { zomg: 'hi' }, function () {
                assert.equal(this.zomg, 'hi', 'the target was properly set');
                functionWasCalled = true;
            });
        });
        assert.ok(functionWasCalled, 'function was called');
    });
    QUnit.test('when passed a target and method name', function (assert) {
        assert.expect(2);
        var bb = new Backburner__default(['one']);
        var functionWasCalled = false;
        var targetObject = {
            zomg: 'hi',
            checkFunction: function checkFunction() {
                assert.equal(this.zomg, 'hi', 'the target was properly set');
                functionWasCalled = true;
            }
        };
        bb.run(function () { return bb.scheduleOnce('one', targetObject, 'checkFunction'); });
        assert.ok(functionWasCalled, 'function was called');
    });
    QUnit.test('throws when passed a null method', function (assert) {
        assert.expect(1);
        function onError(error) {
            assert.equal('You attempted to schedule an action in a queue (deferErrors) for a method that doesn\'t exist', error.message);
        }
        var bb = new Backburner__default(['deferErrors'], {
            onError: onError
        });
        bb.run(function () { return bb.scheduleOnce('deferErrors', { zomg: 'hi' }, null); });
    });
    QUnit.test('throws when passed an undefined method', function (assert) {
        assert.expect(1);
        function onError(error) {
            assert.equal('You attempted to schedule an action in a queue (deferErrors) for a method that doesn\'t exist', error.message);
        }
        var bb = new Backburner__default(['deferErrors'], {
            onError: onError
        });
        bb.run(function () { return bb.deferOnce('deferErrors', { zomg: 'hi' }, undefined); });
    });
    QUnit.test('throws when passed an method name that does not exists on the target', function (assert) {
        assert.expect(1);
        function onError(error) {
            assert.equal('You attempted to schedule an action in a queue (deferErrors) for a method that doesn\'t exist', error.message);
        }
        var bb = new Backburner__default(['deferErrors'], {
            onError: onError
        });
        bb.run(function () { return bb.deferOnce('deferErrors', { zomg: 'hi' }, 'checkFunction'); });
    });
    QUnit.test('when passed a target, method, and arguments', function (assert) {
        assert.expect(5);
        var bb = new Backburner__default(['one']);
        var functionWasCalled = false;
        bb.run(function () {
            bb.scheduleOnce('one', { zomg: 'hi' }, function (a, b, c) {
                assert.equal(this.zomg, 'hi', 'the target was properly set');
                assert.equal(a, 1, 'the first arguments was passed in');
                assert.equal(b, 2, 'the second arguments was passed in');
                assert.equal(c, 3, 'the third arguments was passed in');
                functionWasCalled = true;
            }, 1, 2, 3);
        });
        assert.ok(functionWasCalled, 'function was called');
    });
    QUnit.test('when passed same function twice', function (assert) {
        assert.expect(2);
        var bb = new Backburner__default(['one']);
        var i = 0;
        var functionWasCalled = false;
        function deferMethod() {
            i++;
            assert.equal(i, 1, 'Function should be called only once');
            functionWasCalled = true;
        }
        bb.run(function () {
            bb.scheduleOnce('one', deferMethod);
            bb.scheduleOnce('one', deferMethod);
        });
        assert.ok(functionWasCalled, 'function was called only once');
    });
    QUnit.test('when passed same function twice with same target', function (assert) {
        assert.expect(3);
        var bb = new Backburner__default(['one']);
        var i = 0;
        var functionWasCalled = false;
        function deferMethod() {
            i++;
            assert.equal(i, 1, 'Function should be called only once');
            assert.equal(this['first'], 1, 'the target property was set');
            functionWasCalled = true;
        }
        var argObj = { first: 1 };
        bb.run(function () {
            bb.scheduleOnce('one', argObj, deferMethod);
            bb.scheduleOnce('one', argObj, deferMethod);
        });
        assert.ok(functionWasCalled, 'function was called only once');
    });
    QUnit.test('when passed same function twice with different targets', function (assert) {
        assert.expect(3);
        var bb = new Backburner__default(['one']);
        var i = 0;
        function deferMethod() {
            i++;
            assert.equal(this['first'], 1, 'the target property was set');
        }
        bb.run(function () {
            bb.scheduleOnce('one', { first: 1 }, deferMethod);
            bb.scheduleOnce('one', { first: 1 }, deferMethod);
        });
        assert.equal(i, 2, 'function was called twice');
    });
    QUnit.test('when passed same function twice with same arguments and same target', function (assert) {
        assert.expect(4);
        var bb = new Backburner__default(['one']);
        var i = 0;
        function deferMethod(a, b) {
            i++;
            assert.equal(a, 1, 'First argument is set only one time');
            assert.equal(b, 2, 'Second argument remains same');
            assert.equal(this['first'], 1, 'the target property was set');
        }
        var argObj = { first: 1 };
        bb.run(function () {
            bb.scheduleOnce('one', argObj, deferMethod, 1, 2);
            bb.scheduleOnce('one', argObj, deferMethod, 1, 2);
        });
        assert.equal(i, 1, 'function was called once');
    });
    QUnit.test('when passed same function twice with same target and different arguments', function (assert) {
        assert.expect(4);
        var bb = new Backburner__default(['one']);
        var i = 0;
        function deferMethod(a, b) {
            i++;
            assert.equal(a, 3, 'First argument of only second call is set');
            assert.equal(b, 2, 'Second argument remains same');
            assert.equal(this['first'], 1, 'the target property was set');
        }
        var argObj = { first: 1 };
        bb.run(function () {
            bb.scheduleOnce('one', argObj, deferMethod, 1, 2);
            bb.scheduleOnce('one', argObj, deferMethod, 3, 2);
        });
        assert.equal(i, 1, 'function was called once');
    });
    QUnit.test('when passed same function twice with different target and different arguments', function (assert) {
        assert.expect(7);
        var bb = new Backburner__default(['one']);
        var i = 0;
        function deferMethod(a, b) {
            i++;
            if (i === 1) {
                assert.equal(a, 1, 'First argument set during first call');
            }
            else {
                assert.equal(a, 3, 'First argument set during second call');
            }
            assert.equal(b, 2, 'Second argument remains same');
            assert.equal(this['first'], 1, 'the target property was set');
        }
        bb.run(function () {
            bb.scheduleOnce('one', { first: 1 }, deferMethod, 1, 2);
            bb.scheduleOnce('one', { first: 1 }, deferMethod, 3, 2);
        });
        assert.equal(i, 2, 'function was called twice');
    });
    QUnit.test('when passed same function with same target after already triggering in current loop', function (assert) {
        assert.expect(5);
        var bb = new Backburner__default(['one', 'two']);
        var i = 0;
        function deferMethod(a) {
            i++;
            assert.equal(a, i, 'Correct argument is set');
            assert.equal(this['first'], 1, 'the target property was set');
        }
        function scheduleMethod() {
            bb.scheduleOnce('one', argObj, deferMethod, 2);
        }
        var argObj = { first: 1 };
        bb.run(function () {
            bb.scheduleOnce('one', argObj, deferMethod, 1);
            bb.scheduleOnce('two', argObj, scheduleMethod);
        });
        assert.equal(i, 2, 'function was called twice');
    });
    QUnit.test('when passed same function with same target after already triggering in current loop', function (assert) {
        assert.expect(5);
        var argObj = { first: 1 };
        var bb = new Backburner__default(['one', 'two'], {});
        var i = 0;
        function deferMethod(a) {
            i++;
            assert.equal(a, i, 'Correct argument is set');
            assert.equal(this['first'], 1, 'the target property was set');
        }
        function scheduleMethod() {
            bb.scheduleOnce('one', argObj, deferMethod, 2);
        }
        bb.run(function () {
            bb.scheduleOnce('one', argObj, deferMethod, 1);
            bb.scheduleOnce('two', argObj, scheduleMethod);
        });
        assert.equal(i, 2, 'function was called twice');
    });
    QUnit.test('onError', function (assert) {
        assert.expect(1);
        function onError(error) {
            assert.equal('QUnit.test error', error.message);
        }
        var bb = new Backburner__default(['errors'], { onError: onError });
        bb.run(function () {
            bb.scheduleOnce('errors', function () {
                throw new Error('QUnit.test error');
            });
        });
    });
    QUnit.test('when [queueName, callback, string] args passed', function (assert) {
        assert.expect(2);
        var bb = new Backburner__default(['one']);
        var functionWasCalled = false;
        bb.run(function () {
            bb.scheduleOnce('one', function (name) {
                assert.equal(name, 'batman');
                functionWasCalled = true;
            }, 'batman', 100);
        });
        assert.ok(functionWasCalled, 'function was called');
    });

    var originalDateValueOf = Date.prototype.valueOf;
    QUnit.module('tests/defer', {
        afterEach: function afterEach() {
            Date.prototype.valueOf = originalDateValueOf;
        }
    });
    QUnit.test('when passed a function', function (assert) {
        assert.expect(1);
        var bb = new Backburner__default(['one']);
        var functionWasCalled = false;
        bb.run(function () {
            bb.schedule('one', function () { return functionWasCalled = true; });
        });
        assert.ok(functionWasCalled, 'function was called');
    });
    QUnit.test('when passed a target and method', function (assert) {
        assert.expect(2);
        var bb = new Backburner__default(['one']);
        var functionWasCalled = false;
        bb.run(function () {
            bb.schedule('one', { zomg: 'hi' }, function () {
                assert.equal(this.zomg, 'hi', 'the target was properly set');
                functionWasCalled = true;
            });
        });
        assert.ok(functionWasCalled, 'function was called');
    });
    QUnit.test('when [queueName, callback, string] args passed', function (assert) {
        assert.expect(2);
        var bb = new Backburner__default(['one']);
        var functionWasCalled = false;
        bb.run(function () {
            bb.schedule('one', function (name) {
                assert.equal(name, 'batman');
                functionWasCalled = true;
            }, 'batman');
        });
        assert.ok(functionWasCalled, 'function was called');
    });
    QUnit.test('when passed a target and method name', function (assert) {
        assert.expect(2);
        var bb = new Backburner__default(['one']);
        var functionWasCalled = false;
        var targetObject = {
            zomg: 'hi',
            checkFunction: function checkFunction() {
                assert.equal(this.zomg, 'hi', 'the target was properly set');
                functionWasCalled = true;
            }
        };
        bb.run(function () { return bb.schedule('one', targetObject, 'checkFunction'); });
        assert.ok(functionWasCalled, 'function was called');
    });
    QUnit.test('throws when passed a null method', function (assert) {
        assert.expect(1);
        function onError(error) {
            assert.equal('You attempted to schedule an action in a queue (deferErrors) for a method that doesn\'t exist', error.message);
        }
        var bb = new Backburner__default(['deferErrors'], {
            onError: onError
        });
        bb.run(function () { return bb.schedule('deferErrors', { zomg: 'hi' }, null); });
    });
    QUnit.test('throws when passed an undefined method', function (assert) {
        assert.expect(1);
        function onError(error) {
            assert.equal('You attempted to schedule an action in a queue (deferErrors) for a method that doesn\'t exist', error.message);
        }
        var bb = new Backburner__default(['deferErrors'], {
            onError: onError
        });
        bb.run(function () { return bb.schedule('deferErrors', { zomg: 'hi' }, undefined); });
    });
    QUnit.test('throws when passed an method name that does not exists on the target', function (assert) {
        assert.expect(1);
        function onError(error) {
            assert.equal('You attempted to schedule an action in a queue (deferErrors) for a method that doesn\'t exist', error.message);
        }
        var bb = new Backburner__default(['deferErrors'], {
            onError: onError
        });
        bb.run(function () { return bb.schedule('deferErrors', { zomg: 'hi' }, 'checkFunction'); });
    });
    QUnit.test('when passed a target, method, and arguments', function (assert) {
        assert.expect(5);
        var bb = new Backburner__default(['one']);
        var functionWasCalled = false;
        bb.run(function () {
            bb.schedule('one', { zomg: 'hi' }, function (a, b, c) {
                assert.equal(this.zomg, 'hi', 'the target was properly set');
                assert.equal(a, 1, 'the first arguments was passed in');
                assert.equal(b, 2, 'the second arguments was passed in');
                assert.equal(c, 3, 'the third arguments was passed in');
                functionWasCalled = true;
            }, 1, 2, 3);
        });
        assert.ok(functionWasCalled, 'function was called');
    });
    QUnit.test('when passed same function twice', function (assert) {
        assert.expect(1);
        var bb = new Backburner__default(['one']);
        var i = 0;
        function deferMethod() {
            i++;
        }
        bb.run(function () {
            bb.schedule('one', deferMethod);
            bb.schedule('one', deferMethod);
        });
        assert.equal(i, 2, 'function was called twice');
    });
    QUnit.test('when passed same function twice with arguments', function (assert) {
        assert.expect(2);
        var bb = new Backburner__default(['one']);
        var argObj = { first: 1 };
        function deferMethod() {
            assert.equal(this['first'], 1, 'the target property was set');
        }
        bb.run(function () {
            bb.schedule('one', argObj, deferMethod);
            bb.schedule('one', argObj, deferMethod);
        });
    });
    QUnit.test('when passed same function twice with same arguments and same target', function (assert) {
        assert.expect(7);
        var bb = new Backburner__default(['one']);
        var i = 0;
        function deferMethod(a, b) {
            i++;
            assert.equal(a, 1, 'First argument is set twice');
            assert.equal(b, 2, 'Second argument is set twice');
            assert.equal(this['first'], 1, 'the target property was set');
        }
        var argObj = { first: 1 };
        bb.run(function () {
            bb.schedule('one', argObj, deferMethod, 1, 2);
            bb.schedule('one', argObj, deferMethod, 1, 2);
        });
        assert.equal(i, 2, 'function was called twice');
    });
    QUnit.test('when passed same function twice with same target and different arguments', function (assert) {
        assert.expect(7);
        var bb = new Backburner__default(['one']);
        var i = 0;
        function deferMethod(a, b) {
            i++;
            if (i === 1) {
                assert.equal(a, 1, 'First argument set during first call');
            }
            else {
                assert.equal(a, 3, 'First argument set during second call');
            }
            assert.equal(b, 2, 'Second argument remains same');
            assert.equal(this['first'], 1, 'the target property was set');
        }
        var argObj = { first: 1 };
        bb.run(function () {
            bb.schedule('one', argObj, deferMethod, 1, 2);
            bb.schedule('one', argObj, deferMethod, 3, 2);
        });
        assert.equal(i, 2, 'function was called twice');
    });
    QUnit.test('when passed same function twice with different target and different arguments', function (assert) {
        assert.expect(7);
        var bb = new Backburner__default(['one']);
        var i = 0;
        function deferMethod(a, b) {
            i++;
            if (i === 1) {
                assert.equal(a, 1, 'First argument set during first call');
            }
            else {
                assert.equal(a, 3, 'First argument set during second call');
            }
            assert.equal(b, 2, 'Second argument remains same');
            assert.equal(this['first'], 1, 'the target property was set');
        }
        bb.run(function () {
            bb.schedule('one', { first: 1 }, deferMethod, 1, 2);
            bb.schedule('one', { first: 1 }, deferMethod, 3, 2);
        });
        assert.equal(i, 2, 'function was called twice');
    });
    QUnit.test('onError', function (assert) {
        assert.expect(1);
        function onError(error) {
            assert.equal('QUnit.test error', error.message);
        }
        var bb = new Backburner__default(['errors'], {
            onError: onError
        });
        bb.run(function () {
            bb.schedule('errors', function () {
                throw new Error('QUnit.test error');
            });
        });
    });

    QUnit.module('tests/events');
    QUnit.test('end event should fire after runloop completes', function (assert) {
        assert.expect(3);
        var callNumber = 0;
        var bb = new Backburner__default(['one', 'two']);
        bb.on('end', function () { return callNumber++; });
        function funcOne() {
            assert.equal(callNumber, 0);
        }
        function funcTwo() {
            assert.equal(callNumber, 0);
        }
        bb.run(function () {
            bb.schedule('one', null, funcOne);
            bb.schedule('two', null, funcTwo);
        });
        assert.equal(callNumber, 1);
    });
    QUnit.test('end event should fire before onEnd', function (assert) {
        assert.expect(3);
        var callNumber = 0;
        var bb = new Backburner__default(['one', 'two'], {
            onEnd: function onEnd() {
                assert.equal(callNumber, 1);
            }
        });
        bb.on('end', function () { return callNumber++; });
        function funcOne() {
            assert.equal(callNumber, 0);
        }
        function funcTwo() {
            assert.equal(callNumber, 0);
        }
        bb.run(function () {
            bb.schedule('one', null, funcOne);
            bb.schedule('two', null, funcTwo);
        });
    });
    QUnit.test('end event should be passed the current and next instance', function (assert) {
        assert.expect(4);
        var firstArgument = null;
        var secondArgument = null;
        var bb = new Backburner__default(['one'], {
            onEnd: function onEnd(first, second) {
                assert.equal(firstArgument, first);
                assert.equal(secondArgument, second);
            }
        });
        bb.on('end', function (first, second) {
            firstArgument = first;
            secondArgument = second;
        });
        bb.run(function () { return bb.schedule('one', null, function () { }); });
        bb.run(function () { return bb.schedule('one', null, function () { }); });
    });
    // blah
    QUnit.test('begin event should fire before runloop begins', function (assert) {
        assert.expect(4);
        var callNumber = 0;
        var bb = new Backburner__default(['one', 'two']);
        bb.on('begin', function () { return callNumber++; });
        function funcOne() {
            assert.equal(callNumber, 1);
        }
        function funcTwo() {
            assert.equal(callNumber, 1);
        }
        assert.equal(callNumber, 0);
        bb.run(function () {
            bb.schedule('one', null, funcOne);
            bb.schedule('two', null, funcTwo);
        });
        assert.equal(callNumber, 1);
    });
    QUnit.test('begin event should fire before onBegin', function (assert) {
        assert.expect(1);
        var callNumber = 0;
        var bb = new Backburner__default(['one', 'two'], {
            onBegin: function onBegin() {
                assert.equal(callNumber, 1);
            }
        });
        bb.on('begin', function () { return callNumber++; });
        bb.run(function () {
            bb.schedule('one', null, function () { });
            bb.schedule('two', null, function () { });
        });
    });
    QUnit.test('begin event should be passed the current and previous instance', function (assert) {
        assert.expect(4);
        var firstArgument = null;
        var secondArgument = null;
        var bb = new Backburner__default(['one'], {
            onBegin: function onBegin(first, second) {
                assert.equal(firstArgument, first);
                assert.equal(secondArgument, second);
            }
        });
        bb.on('begin', function (first, second) {
            firstArgument = first;
            secondArgument = second;
        });
        bb.run(function () { return bb.schedule('one', null, function () { }); });
        bb.run(function () { return bb.schedule('one', null, function () { }); });
    });
    // blah
    QUnit.test('events should work with multiple callbacks', function (assert) {
        assert.expect(2);
        var firstCalled = false;
        var secondCalled = false;
        var bb = new Backburner__default(['one']);
        function first() {
            firstCalled = true;
        }
        function second() {
            secondCalled = true;
        }
        bb.on('end', first);
        bb.on('end', second);
        bb.run(function () { return bb.schedule('one', null, function () { }); });
        assert.equal(secondCalled, true);
        assert.equal(firstCalled, true);
    });
    QUnit.test('off should unregister specific callback', function (assert) {
        assert.expect(2);
        var firstCalled = false;
        var secondCalled = false;
        var bb = new Backburner__default(['one']);
        function first() {
            firstCalled = true;
        }
        function second() {
            secondCalled = true;
        }
        bb.on('end', first);
        bb.on('end', second);
        bb.off('end', first);
        bb.run(function () { return bb.schedule('one', null, function () { }); });
        assert.equal(secondCalled, true);
        assert.equal(firstCalled, false);
    });

    QUnit.module('tests/join');
    function depth(bb) {
        return bb.instanceStack.length + (bb.currentInstance ? 1 : 0);
    }
    QUnit.test('outside of a run loop', function (assert) {
        assert.expect(4);
        var bb = new Backburner__default(['one']);
        assert.equal(depth(bb), 0);
        var result = bb.join(function () {
            assert.equal(depth(bb), 1);
            return 'result';
        });
        assert.equal(result, 'result');
        assert.equal(depth(bb), 0);
    });
    QUnit.test('inside of a run loop', function (assert) {
        assert.expect(4);
        var bb = new Backburner__default(['one']);
        assert.equal(depth(bb), 0);
        bb.run(function () {
            var result = bb.join(function () {
                assert.equal(depth(bb), 1);
                return 'result';
            });
            assert.equal(result, 'result');
        });
        assert.equal(depth(bb), 0);
    });
    QUnit.test('nested join calls', function (assert) {
        assert.expect(7);
        var bb = new Backburner__default(['one']);
        assert.equal(depth(bb), 0);
        bb.join(function () {
            assert.equal(depth(bb), 1);
            bb.join(function () {
                assert.equal(depth(bb), 1);
                bb.join(function () {
                    assert.equal(depth(bb), 1);
                });
                assert.equal(depth(bb), 1);
            });
            assert.equal(depth(bb), 1);
        });
        assert.equal(depth(bb), 0);
    });
    QUnit.test('nested run loops', function (assert) {
        assert.expect(7);
        var bb = new Backburner__default(['one']);
        assert.equal(depth(bb), 0);
        bb.join(function () {
            assert.equal(depth(bb), 1);
            bb.run(function () {
                assert.equal(depth(bb), 2);
                bb.join(function () {
                    assert.equal(depth(bb), 2);
                });
                assert.equal(depth(bb), 2);
            });
            assert.equal(depth(bb), 1);
        });
        assert.equal(depth(bb), 0);
    });
    QUnit.test('queue execution order', function (assert) {
        assert.expect(1);
        var bb = new Backburner__default(['one']);
        var items = [];
        bb.run(function () {
            items.push(0);
            bb.schedule('one', function () { return items.push(4); });
            bb.join(function () {
                items.push(1);
                bb.schedule('one', function () { return items.push(5); });
                items.push(2);
            });
            bb.schedule('one', function () { return items.push(6); });
            items.push(3);
        });
        assert.deepEqual(items, [0, 1, 2, 3, 4, 5, 6]);
    });
    QUnit.test('without an onError run.join can be caught via `try`/`catch`', function (assert) {
        assert.expect(1);
        var bb = new Backburner__default(['errors']);
        assert.throws(function () {
            bb.join(function () {
                throw new Error('test error');
            });
        }, /test error/);
    });
    QUnit.test('with an onError which does not rethrow, when joining existing instance, can be caught via `try`/`catch`', function (assert) {
        assert.expect(1);
        var bb = new Backburner__default(['errors'], {
            onError: function onError(error) {
                assert.notOk(true, 'onError should not be called as the error from .join is handled by assert.throws');
            }
        });
        bb.run(function () {
            assert.throws(function () {
                bb.join(function () {
                    throw new Error('test error');
                });
            }, /test error/, 'error from within .join can be caught with try/catch');
        });
    });
    QUnit.test('onError which does not rethrow is invoked (only once) when not joining an existing instance', function (assert) {
        assert.expect(1);
        function onError(error) {
            assert.equal('test error', error.message);
        }
        var bb = new Backburner__default(['errors'], {
            onError: onError
        });
        bb.join(function () {
            throw new Error('test error');
        });
    });
    QUnit.test('onError which does not rethrow is invoked (only once) when joining an existing instance', function (assert) {
        assert.expect(1);
        function onError(error) {
            assert.equal('test error', error.message);
        }
        var bb = new Backburner__default(['errors'], {
            onError: onError
        });
        bb.run(function () {
            bb.join(function () {
                throw new Error('test error');
            });
        });
    });
    QUnit.test('onError which does rethrow is invoked (only once) when not joining an existing instance', function (assert) {
        assert.expect(2);
        function onError(error) {
            assert.equal('test error', error.message);
            throw error;
        }
        var bb = new Backburner__default(['errors'], {
            onError: onError
        });
        assert.throws(function () {
            bb.join(function () {
                throw new Error('test error');
            });
        }, /test error/);
    });
    QUnit.test('onError which does rethrow is invoked (only once) when joining an existing instance', function (assert) {
        assert.expect(2);
        function onError(error) {
            assert.equal('test error', error.message);
            throw error;
        }
        var bb = new Backburner__default(['errors'], {
            onError: onError
        });
        assert.throws(function () {
            bb.run(function () {
                bb.join(function () {
                    throw new Error('test error');
                });
            });
        }, /test error/);
    });
    QUnit.test('when [callback, string] args passed', function (assert) {
        assert.expect(2);
        var bb = new Backburner__default(['one']);
        var functionWasCalled = false;
        bb.join(function (name) {
            assert.equal(name, 'batman');
            functionWasCalled = true;
        }, 'batman');
        assert.ok(functionWasCalled, 'function was called');
    });

    /* tslint:disable:no-shadowed-variable*/
    var originalDateNow = Date.now;
    var originalDateValueOf$1 = Date.prototype.valueOf;
    var fakeClock$2;
    QUnit.module('tests/set-timeout-test', {
        afterEach: function afterEach() {
            Date.now = originalDateNow;
            Date.prototype.valueOf = originalDateValueOf$1;
            if (fakeClock$2) {
                fakeClock$2.uninstall();
            }
        }
    });
    QUnit.test('later', function (assert) {
        assert.expect(6);
        var bb = new Backburner__default(['one']);
        var step = 0;
        var instance;
        var done = assert.async();
        // Force +new Date to return the same result while scheduling
        // run.later timers. Otherwise: non-determinism!
        var now = +new Date();
        Date.prototype.valueOf = function () { return now; };
        bb.later(null, function () {
            instance = bb.currentInstance;
            assert.equal(step++, 0);
        }, 10);
        bb.later(null, function () {
            assert.equal(step++, 1);
            assert.equal(instance, bb.currentInstance, 'same instance');
        }, 10);
        Date.prototype.valueOf = originalDateValueOf$1;
        bb.later(null, function () {
            assert.equal(step++, 2);
            bb.later(null, function () {
                assert.equal(step++, 3);
                assert.ok(true, 'Another later will execute correctly');
                done();
            }, 1);
        }, 20);
    });
    QUnit.test('later should rely on stubbed `Date.now`', function (assert) {
        assert.expect(1);
        var bb = new Backburner__default(['one']);
        var done = assert.async();
        var globalNowWasUsed = false;
        Date.now = function () {
            globalNowWasUsed = true;
            return originalDateNow();
        };
        bb.later(function () {
            assert.ok(globalNowWasUsed);
            done();
        }, 1);
    });
    QUnit.test('later shedules timers correctly after time travel', function (assert) {
        assert.expect(2);
        var bb = new Backburner__default(['one']);
        var done = assert.async();
        var start = originalDateNow();
        var now = start;
        Date.now = function () { return now; };
        var called1At = 0;
        var called2At = 0;
        bb.later(function () { return called1At = originalDateNow(); }, 1000);
        now += 1000;
        bb.later(function () { return called2At = originalDateNow(); }, 10);
        now += 10;
        setTimeout(function () {
            assert.ok(called1At !== 0, 'timeout 1 was called');
            assert.ok(called2At !== 0, 'timeout 2 was called');
            done();
        }, 20);
    });
    var bb;
    QUnit.module('later arguments / arity', {
        beforeEach: function beforeEach() {
            bb = new Backburner__default(['one']);
        },
        afterEach: function afterEach() {
            bb = undefined;
            if (fakeClock$2) {
                fakeClock$2.uninstall();
            }
        }
    });
    QUnit.test('[callback]', function (assert) {
        assert.expect(2);
        var done = assert.async();
        bb.later(function () {
            assert.equal(arguments.length, 0);
            assert.ok(true, 'was called');
            done();
        });
    });
    QUnit.test('[callback, undefined]', function (assert) {
        assert.expect(2);
        var done = assert.async();
        bb.later(function () {
            assert.equal(arguments.length, 1);
            assert.ok(true, 'was called');
            done();
        }, undefined);
    });
    QUnit.test('[null, callback, undefined]', function (assert) {
        assert.expect(2);
        var done = assert.async();
        bb.later(null, function () {
            assert.equal(arguments.length, 0);
            assert.ok(true, 'was called');
            done();
        });
    });
    QUnit.test('[null, callback, undefined]', function (assert) {
        assert.expect(2);
        var done = assert.async();
        bb.later(null, function () {
            assert.equal(arguments.length, 1);
            assert.ok(true, 'was called');
            done();
        }, undefined);
    });
    QUnit.test('[null, callback, null]', function (assert) {
        assert.expect(3);
        var done = assert.async();
        bb.later(null, function () {
            assert.equal(arguments.length, 1);
            assert.equal(arguments[0], null);
            assert.ok(true, 'was called');
            done();
        }, null);
    });
    QUnit.test('[callback, string, string, string]', function (assert) {
        assert.expect(5);
        var done = assert.async();
        bb.later(function () {
            assert.equal(arguments.length, 3);
            assert.equal(arguments[0], 'a');
            assert.equal(arguments[1], 'b');
            assert.equal(arguments[2], 'c');
            assert.ok(true, 'was called');
            done();
        }, 'a', 'b', 'c');
    });
    QUnit.test('[null, callback, string, string, string]', function (assert) {
        assert.expect(5);
        var done = assert.async();
        bb.later(null, function () {
            assert.equal(arguments.length, 3);
            assert.equal(arguments[0], 'a');
            assert.equal(arguments[1], 'b');
            assert.equal(arguments[2], 'c');
            assert.ok(true, 'was called');
            done();
        }, 'a', 'b', 'c');
    });
    QUnit.test('[null, callback, string, string, string, number]', function (assert) {
        assert.expect(5);
        var done = assert.async();
        bb.later(null, function () {
            assert.equal(arguments.length, 3);
            assert.equal(arguments[0], 'a');
            assert.equal(arguments[1], 'b');
            assert.equal(arguments[2], 'c');
            assert.ok(true, 'was called');
            done();
        }, 'a', 'b', 'c', 10);
    });
    QUnit.test('[null, callback, string, string, string, numericString]', function (assert) {
        assert.expect(5);
        var done = assert.async();
        bb.later(null, function () {
            assert.equal(arguments.length, 3);
            assert.equal(arguments[0], 'a');
            assert.equal(arguments[1], 'b');
            assert.equal(arguments[2], 'c');
            assert.ok(true, 'was called');
            done();
        }, 'a', 'b', 'c', '1');
    });
    QUnit.test('[obj, string]', function (assert) {
        assert.expect(1);
        var done = assert.async();
        bb.later({
            bro: function bro() {
                assert.ok(true, 'was called');
                done();
            }
        }, 'bro');
    });
    QUnit.test('[obj, string, value]', function (assert) {
        assert.expect(3);
        var done = assert.async();
        bb.later({
            bro: function bro() {
                assert.equal(arguments.length, 1);
                assert.equal(arguments[0], 'value');
                assert.ok(true, 'was called');
                done();
            }
        }, 'bro', 'value');
    });
    QUnit.test('[obj, string, value, number]', function (assert) {
        var done = assert.async();
        bb.later({
            bro: function bro() {
                assert.equal(arguments.length, 1);
                assert.equal(arguments[0], 'value');
                assert.ok(true, 'was called');
                done();
            }
        }, 'bro', 'value', 1);
    });
    QUnit.test('[obj, string, value, numericString]', function (assert) {
        var done = assert.async();
        bb.later({
            bro: function bro() {
                assert.equal(arguments.length, 1);
                assert.equal(arguments[0], 'value');
                assert.ok(true, 'was called');
                done();
            }
        }, 'bro', 'value', '1');
    });
    QUnit.test('onError', function (assert) {
        assert.expect(1);
        var done = assert.async();
        function onError(error) {
            assert.equal('test error', error.message);
            done();
        }
        bb = new Backburner__default(['errors'], { onError: onError });
        bb.later(function () { throw new Error('test error'); }, 1);
    });
    QUnit.test('later doesn\'t trigger twice with earlier later', function (assert) {
        assert.expect(4);
        bb = new Backburner__default(['one']);
        var called1 = 0;
        var called2 = 0;
        var beginCalls = 0;
        var endCalls = 0;
        var oldBegin = bb.begin;
        var oldEnd = bb.end;
        var done = assert.async();
        bb.begin = function () {
            beginCalls++;
            oldBegin.call(bb);
        };
        bb.end = function () {
            endCalls++;
            oldEnd.call(bb);
        };
        bb.later(function () { return called1++; }, 50);
        bb.later(function () { return called2++; }, 10);
        setTimeout(function () {
            assert.equal(called1, 1, 'timeout 1 was called once');
            assert.equal(called2, 1, 'timeout 2 was called once');
            assert.equal(beginCalls, 2, 'begin() was called twice');
            assert.equal(endCalls, 2, 'end() was called twice');
            done();
        }, 100);
    });
    QUnit.test('later with two Backburner instances', function (assert) {
        assert.expect(8);
        var steps = 0;
        var done = assert.async();
        var bb1 = new Backburner__default(['one'], {
            onBegin: function onBegin() {
                assert.equal(++steps, 4);
            }
        });
        var bb2 = new Backburner__default(['one'], {
            onBegin: function onBegin() {
                assert.equal(++steps, 6);
            }
        });
        assert.equal(++steps, 1);
        bb1.later(function () { return assert.equal(++steps, 5); }, 10);
        assert.equal(++steps, 2);
        bb2.later(function () { return assert.equal(++steps, 7); }, 10);
        assert.equal(++steps, 3);
        setTimeout(function () {
            assert.equal(++steps, 8);
            done();
        }, 50);
    });
    QUnit.test('expired timeout doesn\'t hang when setting a new timeout', function (assert) {
        assert.expect(3);
        var called1At = 0;
        var called2At = 0;
        var done = assert.async();
        bb.later(function () { return called1At = Date.now(); }, 1);
        bb.later(function () { return called2At = Date.now(); }, 50);
        setTimeout(function () {
            assert.ok(called1At !== 0, 'timeout 1 was called');
            assert.ok(called2At !== 0, 'timeout 2 was called');
            assert.ok(called2At - called1At > 10, 'timeout 1 did not wait for timeout 2');
            done();
        }, 60);
    });
    QUnit.test('NaN timeout doesn\'t hang other timeouts', function (assert) {
        assert.expect(2);
        var done = assert.async();
        var called1At = 0;
        var called2At = 0;
        bb.later(function () { return called1At = Date.now(); }, 1);
        bb.later(function () { }, NaN);
        bb.later(function () { return called2At = Date.now(); }, 10);
        setTimeout(function () {
            assert.ok(called1At !== 0, 'timeout 1 was called');
            assert.ok(called2At !== 0, 'timeout 2 was called');
            done();
        }, 20);
    });
    QUnit.test('when [callback, string] args passed', function (assert) {
        assert.expect(1);
        var done = assert.async();
        var bb = new Backburner__default(['one']);
        bb.later(function (name) {
            assert.equal(name, 'batman');
            done();
        }, 'batman', 0);
    });
    QUnit.test('can be ran "early" with fake timers GH#351', function (assert) {
        assert.expect(1);
        var done = assert.async();
        var bb = new Backburner__default(['one']);
        fakeClock$2 = lolexSrc.install();
        var startTime = originalDateNow();
        bb.later(function (name) {
            var endTime = originalDateNow();
            assert.ok(endTime - startTime < 100, 'did not wait for 5s to run timer');
            done();
        }, 5000);
        fakeClock$2.tick(5001);
    });
    QUnit.test('debounce called before later', function (assert) {
        assert.expect(1);
        var done = assert.async(1);
        var bb = new Backburner__default(['one']);
        var func = function () { };
        bb.run(function () {
            bb.debounce(func, 1000);
            setTimeout(function () {
                bb.debounce(func, 1000);
            }, 50);
            var before = Date.now();
            bb.later(function () {
                var diff = Date.now() - before;
                assert.ok(diff < 1010, '.later called with too much delay');
                done();
            }, 1000);
        });
    });
    QUnit.test('boundRunExpiredTimers is called once when first timer canceled', function (assert) {
        var done = assert.async(1);
        var bb = new Backburner__default(['one']);
        var timer = bb.later(function () { }, 500);
        bb.cancel(timer);
        var boundRunExpiredTimers = bb['_boundRunExpiredTimers'];
        bb['_boundRunExpiredTimers'] = function () {
            assert.ok(true);
            done();
            return boundRunExpiredTimers.apply(bb, arguments);
        };
        bb.later(function () { }, 800);
    });

    QUnit.module('tests/multi-turn');
    var platform;
    function buildFakePlatform(flush) {
        platform = Backburner.buildPlatform(flush);
        platform.flushSync = function () {
            flush();
        };
        return platform;
    }
    QUnit.test('basic', function (assert) {
        var bb = new Backburner__default(['zomg'], {
            // This is just a place holder for now, but somehow the system needs to
            // know to when to stop
            mustYield: function mustYield() {
                return true; // yield after each step, for now.
            },
            _buildPlatform: buildFakePlatform
        });
        var order = -1;
        var tasks = {
            one: { count: 0, order: -1 },
            two: { count: 0, order: -1 },
            three: { count: 0, order: -1 }
        };
        bb.schedule('zomg', null, function () {
            tasks.one.count++;
            tasks.one.order = ++order;
        });
        bb.schedule('zomg', null, function () {
            tasks.two.count++;
            tasks.two.order = ++order;
        });
        bb.schedule('zomg', null, function () {
            tasks.three.count++;
            tasks.three.order = ++order;
        });
        assert.deepEqual(tasks, {
            one: { count: 0, order: -1 },
            two: { count: 0, order: -1 },
            three: { count: 0, order: -1 }
        }, 'no tasks have been run before the platform flushes');
        platform.flushSync();
        assert.deepEqual(tasks, {
            one: { count: 1, order: 0 },
            two: { count: 0, order: -1 },
            three: { count: 0, order: -1 }
        }, 'TaskOne has been run before the platform flushes');
        platform.flushSync();
        assert.deepEqual(tasks, {
            one: { count: 1, order: 0 },
            two: { count: 1, order: 1 },
            three: { count: 0, order: -1 }
        }, 'TaskOne and TaskTwo has been run before the platform flushes');
        platform.flushSync();
        assert.deepEqual(tasks, {
            one: { count: 1, order: 0 },
            two: { count: 1, order: 1 },
            three: { count: 1, order: 2 }
        }, 'TaskOne, TaskTwo and TaskThree has been run before the platform flushes');
    });
    QUnit.test('properly cancel items which are added during flush', function (assert) {
        var bb = new Backburner__default(['zomg'], {
            // This is just a place holder for now, but somehow the system needs to
            // know to when to stop
            mustYield: function mustYield() {
                return true; // yield after each step, for now.
            },
            _buildPlatform: buildFakePlatform
        });
        var fooCalled = 0;
        var barCalled = 0;
        var obj1 = {
            foo: function foo() {
                fooCalled++;
            }
        };
        var obj2 = {
            bar: function bar() {
                barCalled++;
            }
        };
        bb.scheduleOnce('zomg', obj1, 'foo');
        bb.scheduleOnce('zomg', obj1, 'foo');
        bb.scheduleOnce('zomg', obj2, 'bar');
        bb.scheduleOnce('zomg', obj2, 'bar');
        platform.flushSync();
        var timer1 = bb.scheduleOnce('zomg', obj1, 'foo');
        var timer2 = bb.scheduleOnce('zomg', obj2, 'bar');
        bb.cancel(timer1);
        bb.cancel(timer2);
        platform.flushSync();
        platform.flushSync();
        platform.flushSync();
        assert.equal(fooCalled, 1, 'fooCalled');
        assert.equal(barCalled, 1, 'barCalled');
    });

    QUnit.module('tests/queue-debug-info', {
        beforeEach: function () {
            // @ts-ignore
            overrideError(MockStableError);
        },
        afterEach: function () {
            resetError();
        }
    });
    QUnit.test('getDebugInfo returns empty array when no debug info is present.', function (assert) {
        assert.expect(1);
        var debugInfo;
        var bb = new Backburner__default(['one']);
        bb.run(function () {
            debugInfo = bb.currentInstance && bb.currentInstance.queues.one._getDebugInfo(bb.DEBUG);
            assert.equal(debugInfo, undefined, 'DebugInfo is undefined when DEBUG = false');
        });
    });
    QUnit.test('getDebugInfo returns minimal debug info when one item in queue.', function (assert) {
        assert.expect(2);
        var debugInfo;
        var method = function () {
            assert.ok(true);
        };
        var stack = pushStackTrace('Top of stack');
        var bb = new Backburner__default(['one']);
        bb.DEBUG = true;
        bb.run(function () {
            bb.schedule('one', method);
            debugInfo = bb.currentInstance && bb.currentInstance.queues.one._getDebugInfo(bb.DEBUG);
            assert.deepEqual(debugInfo, [{
                    target: null,
                    method: method,
                    args: undefined,
                    stack: stack
                }]);
        });
    });
    QUnit.test('getDebugInfo returns full debug info when one item in queue.', function (assert) {
        assert.expect(2);
        var debugInfo;
        var target = {};
        var method = function () {
            assert.ok(true);
        };
        var arg1 = 1;
        var arg2 = 2;
        var stack = pushStackTrace('Top of stack');
        var bb = new Backburner__default(['one']);
        bb.DEBUG = true;
        bb.run(function () {
            bb.schedule('one', target, method, arg1, arg2);
            debugInfo = bb.currentInstance && bb.currentInstance.queues.one._getDebugInfo(bb.DEBUG);
            assert.deepEqual(debugInfo, [{
                    target: target,
                    method: method,
                    args: [arg1, arg2],
                    stack: stack
                }]);
        });
    });
    QUnit.test('getDebugInfo returns debug info when multiple items in queue.', function (assert) {
        assert.expect(3);
        var debugInfo;
        var method = function () {
            assert.ok(true);
        };
        var bottom = pushStackTrace('Bottom');
        var top = pushStackTrace('Top');
        var bb = new Backburner__default(['one']);
        bb.DEBUG = true;
        bb.run(function () {
            bb.schedule('one', method);
            bb.schedule('one', method);
            debugInfo = bb.currentInstance && bb.currentInstance.queues.one._getDebugInfo(bb.DEBUG);
            assert.deepEqual(debugInfo, [
                {
                    target: null,
                    method: method,
                    args: undefined,
                    stack: top
                },
                {
                    target: null,
                    method: method,
                    args: undefined,
                    stack: bottom
                }
            ]);
        });
    });

    var Queue = Backburner__default.Queue;
    QUnit.module('tests/queue-push-unique');
    var slice$1 = [].slice;
    QUnit.test('pushUnique: 2 different targets', function (assert) {
        var queue = new Queue('foo');
        var target1fooWasCalled = [];
        var target2fooWasCalled = [];
        var target1 = {
            foo: function foo() {
                target1fooWasCalled.push(slice$1.call(arguments));
            }
        };
        var target2 = {
            foo: function foo() {
                target2fooWasCalled.push(slice$1.call(arguments));
            }
        };
        queue.pushUnique(target1, target1.foo, ['a']);
        queue.pushUnique(target2, target2.foo, ['b']);
        assert.deepEqual(target1fooWasCalled, []);
        assert.deepEqual(target2fooWasCalled, []);
        queue.flush();
        assert.deepEqual(target1fooWasCalled.length, 1, 'expected: target 1.foo to be called only once');
        assert.deepEqual(target1fooWasCalled[0], ['a']);
        assert.deepEqual(target2fooWasCalled.length, 1, 'expected: target 2.foo to be called only once');
        assert.deepEqual(target2fooWasCalled[0], ['b']);
    });
    QUnit.test('pushUnique: 1 target, 2 different methods', function (assert) {
        var queue = new Queue('foo');
        var target1fooWasCalled = [];
        var target1barWasCalled = [];
        var target1 = {
            foo: function () {
                target1fooWasCalled.push(slice$1.call(arguments));
            },
            bar: function () {
                target1barWasCalled.push(slice$1.call(arguments));
            }
        };
        queue.pushUnique(target1, target1.foo, ['a']);
        queue.pushUnique(target1, target1.bar, ['b']);
        assert.deepEqual(target1fooWasCalled, []);
        assert.deepEqual(target1barWasCalled, []);
        queue.flush();
        assert.deepEqual(target1fooWasCalled.length, 1, 'expected: target 1.foo to be called only once');
        assert.deepEqual(target1fooWasCalled[0], ['a']);
        assert.deepEqual(target1barWasCalled.length, 1, 'expected: target 1.bar to be called only once');
        assert.deepEqual(target1barWasCalled[0], ['b']);
    });
    QUnit.test('pushUnique: 1 target, 1 different methods called twice', function (assert) {
        var queue = new Queue('foo');
        var target1fooWasCalled = [];
        var target1 = {
            foo: function () {
                target1fooWasCalled.push(slice$1.call(arguments));
            }
        };
        queue.pushUnique(target1, target1.foo, ['a']);
        queue.pushUnique(target1, target1.foo, ['b']);
        assert.deepEqual(target1fooWasCalled, []);
        queue.flush();
        assert.deepEqual(target1fooWasCalled.length, 1, 'expected: target 1.foo to be called only once');
        assert.deepEqual(target1fooWasCalled[0], ['b']);
    });
    QUnit.test('pushUnique: 2 different targets', function (assert) {
        var queue = new Queue('foo', {});
        var target1fooWasCalled = [];
        var target2fooWasCalled = [];
        var target1 = {
            foo: function () {
                target1fooWasCalled.push(slice$1.call(arguments));
            }
        };
        var target2 = {
            foo: function () {
                target2fooWasCalled.push(slice$1.call(arguments));
            }
        };
        queue.pushUnique(target1, target1.foo, ['a']);
        queue.pushUnique(target2, target2.foo, ['b']);
        assert.deepEqual(target1fooWasCalled, []);
        assert.deepEqual(target2fooWasCalled, []);
        queue.flush();
        assert.deepEqual(target1fooWasCalled.length, 1, 'expected: target 1.foo to be called only once');
        assert.deepEqual(target1fooWasCalled[0], ['a']);
        assert.deepEqual(target2fooWasCalled.length, 1, 'expected: target 2.foo to be called only once');
        assert.deepEqual(target2fooWasCalled[0], ['b']);
    });
    QUnit.test('pushUnique: 1 target, 2 different methods', function (assert) {
        var queue = new Queue('foo', {});
        var target1fooWasCalled = [];
        var target1barWasCalled = [];
        var target1 = {
            foo: function () {
                target1fooWasCalled.push(slice$1.call(arguments));
            },
            bar: function () {
                target1barWasCalled.push(slice$1.call(arguments));
            }
        };
        queue.pushUnique(target1, target1.foo, ['a']);
        queue.pushUnique(target1, target1.bar, ['b']);
        assert.deepEqual(target1fooWasCalled, []);
        assert.deepEqual(target1barWasCalled, []);
        queue.flush();
        assert.deepEqual(target1fooWasCalled.length, 1, 'expected: target 1.foo to be called only once');
        assert.deepEqual(target1fooWasCalled[0], ['a']);
        assert.deepEqual(target1barWasCalled.length, 1, 'expected: target 1.bar to be called only once');
        assert.deepEqual(target1barWasCalled[0], ['b']);
    });
    QUnit.test('pushUnique: 1 target, 1 diffe`rent methods called twice', function (assert) {
        var queue = new Queue('foo', {});
        var target1fooWasCalled = [];
        var target1 = {
            foo: function () {
                target1fooWasCalled.push(slice$1.call(arguments));
            }
        };
        queue.pushUnique(target1, target1.foo, ['a']);
        queue.pushUnique(target1, target1.foo, ['b']);
        assert.deepEqual(target1fooWasCalled, []);
        queue.flush();
        assert.deepEqual(target1fooWasCalled.length, 1, 'expected: target 1.foo to be called only once');
        assert.deepEqual(target1fooWasCalled[0], ['b']);
    });
    QUnit.test('pushUnique: 1 target, 2 different methods, second one called twice', function (assert) {
        var queue = new Queue('foo', {});
        var target1barWasCalled = [];
        var target1 = {
            foo: function () {
            },
            bar: function () {
                target1barWasCalled.push(slice$1.call(arguments));
            }
        };
        queue.pushUnique(target1, target1.foo);
        queue.pushUnique(target1, target1.bar, ['a']);
        queue.pushUnique(target1, target1.bar, ['b']);
        assert.deepEqual(target1barWasCalled, []);
        queue.flush();
        assert.deepEqual(target1barWasCalled.length, 1, 'expected: target 1.bar to be called only once');
    });
    QUnit.test('pushUnique: 2 different targets', function (assert) {
        var queue = new Queue('foo', {});
        var target1fooWasCalled = [];
        var target2fooWasCalled = [];
        var target1 = {
            foo: function () {
                target1fooWasCalled.push(slice$1.call(arguments));
            }
        };
        var target2 = {
            foo: function () {
                target2fooWasCalled.push(slice$1.call(arguments));
            }
        };
        queue.pushUnique(target1, target1.foo, ['a']);
        queue.pushUnique(target2, target2.foo, ['b']);
        assert.deepEqual(target1fooWasCalled, []);
        assert.deepEqual(target2fooWasCalled, []);
        queue.flush();
        assert.deepEqual(target1fooWasCalled.length, 1, 'expected: target 1.foo to be called only once');
        assert.deepEqual(target1fooWasCalled[0], ['a']);
        assert.deepEqual(target2fooWasCalled.length, 1, 'expected: target 2.foo to be called only once');
        assert.deepEqual(target2fooWasCalled[0], ['b']);
    });
    QUnit.test('pushUnique: 1 target, 2 different methods', function (assert) {
        var queue = new Queue('foo', {});
        var target1fooWasCalled = [];
        var target1barWasCalled = [];
        var target1 = {
            foo: function () {
                target1fooWasCalled.push(slice$1.call(arguments));
            },
            bar: function () {
                target1barWasCalled.push(slice$1.call(arguments));
            }
        };
        queue.pushUnique(target1, target1.foo, ['a']);
        queue.pushUnique(target1, target1.bar, ['b']);
        assert.deepEqual(target1fooWasCalled, []);
        assert.deepEqual(target1barWasCalled, []);
        queue.flush();
        assert.deepEqual(target1fooWasCalled.length, 1, 'expected: target 1.foo to be called only once');
        assert.deepEqual(target1fooWasCalled[0], ['a']);
        assert.deepEqual(target1barWasCalled.length, 1, 'expected: target 1.bar to be called only once');
        assert.deepEqual(target1barWasCalled[0], ['b']);
    });
    QUnit.test('pushUnique: 1 target, 1 different methods called twice', function (assert) {
        var queue = new Queue('foo', {});
        var target1fooWasCalled = [];
        var target1 = {
            foo: function () {
                target1fooWasCalled.push(slice$1.call(arguments));
            }
        };
        queue.pushUnique(target1, target1.foo, ['a']);
        queue.pushUnique(target1, target1.foo, ['b']);
        assert.deepEqual(target1fooWasCalled, []);
        queue.flush();
        assert.deepEqual(target1fooWasCalled.length, 1, 'expected: target 1.foo to be called only once');
        assert.deepEqual(target1fooWasCalled[0], ['b']);
    });
    QUnit.test('pushUnique: 1 target, 2 different methods, second one called twice', function (assert) {
        var queue = new Queue('foo', {});
        var target1barWasCalled = [];
        var target1 = {
            foo: function () {
            },
            bar: function () {
                target1barWasCalled.push(slice$1.call(arguments));
            }
        };
        queue.pushUnique(target1, target1.foo);
        queue.pushUnique(target1, target1.bar, ['a']);
        queue.pushUnique(target1, target1.bar, ['b']);
        assert.deepEqual(target1barWasCalled, []);
        queue.flush();
        assert.equal(target1barWasCalled.length, 1, 'expected: target 1.bar to be called only once');
    });
    QUnit.test('can cancel property', function (assert) {
        var queue = new Queue('foo', {});
        var target1fooWasCalled = 0;
        var target2fooWasCalled = 0;
        var target1 = {
            foo: function () {
                target1fooWasCalled++;
            }
        };
        var target2 = {
            foo: function () {
                target2fooWasCalled++;
            }
        };
        var timer1 = queue.pushUnique(target1, target1.foo);
        var timer2 = queue.pushUnique(target2, target2.foo);
        queue.cancel(timer2);
        queue.cancel(timer1);
        queue.pushUnique(target1, target1.foo);
        queue.pushUnique(target1, target1.foo);
        queue.pushUnique(target2, target2.foo);
        queue.pushUnique(target2, target2.foo);
        queue.flush();
        assert.equal(target1fooWasCalled, 1);
        assert.equal(target2fooWasCalled, 1);
    });
    QUnit.test('pushUnique: 1 target, 1 method called twice, canceled 2 call', function (assert) {
        var queue = new Queue('foo');
        var invocationArgs = [];
        var target1 = {
            foo: function () {
                invocationArgs.push.apply(invocationArgs, arguments);
            }
        };
        queue.pushUnique(target1, target1.foo, ['a']);
        var timer = queue.pushUnique(target1, target1.foo, ['b']);
        assert.deepEqual(invocationArgs, [], 'precond - empty initially');
        queue.cancel(timer);
        queue.flush();
        assert.deepEqual(invocationArgs, [], 'still has not been invoked');
    });

    QUnit.module('tests/queue');
    QUnit.test('actions scheduled on previous queue, start over from beginning', function (assert) {
        assert.expect(5);
        var bb = new Backburner__default(['one', 'two']);
        var step = 0;
        bb.run(function () {
            assert.equal(step++, 0, '0');
            bb.schedule('two', null, function () {
                assert.equal(step++, 1, '1');
                bb.schedule('one', null, function () {
                    assert.equal(step++, 3, '3');
                });
            });
            bb.schedule('two', null, function () {
                assert.equal(step++, 2, '2');
            });
        });
        assert.equal(step, 4, '4');
    });
    QUnit.test('Queue#flush should be recursive if new items are added', function (assert) {
        assert.expect(2);
        var bb = new Backburner__default(['one']);
        var count = 0;
        bb.run(function () {
            function increment() {
                if (++count < 3) {
                    bb.schedule('one', increment);
                }
                if (count === 3) {
                    bb.schedule('one', increment);
                }
            }
            increment();
            assert.equal(count, 1, 'should not have run yet');
            var currentInstance = bb.currentInstance;
            if (currentInstance) {
                currentInstance.queues.one.flush();
            }
            assert.equal(count, 4, 'should have run all scheduled methods, even ones added during flush');
        });
    });
    QUnit.test('Default queue is automatically set to first queue if none is provided', function (assert) {
        var bb = new Backburner__default(['one', 'two']);
        assert.equal(bb.defaultQueue, 'one');
    });
    QUnit.test('Default queue can be manually configured', function (assert) {
        var bb = new Backburner__default(['one', 'two'], {
            defaultQueue: 'two'
        });
        assert.equal(bb.defaultQueue, 'two');
    });
    QUnit.test('onBegin and onEnd are called and passed the correct parameters', function (assert) {
        assert.expect(2);
        var befores = [];
        var afters = [];
        var expectedBefores = [];
        var expectedAfters = [];
        var outer;
        var inner;
        var bb = new Backburner__default(['one'], {
            onBegin: function (current, previous) {
                befores.push(current);
                befores.push(previous);
            },
            onEnd: function (current, next) {
                afters.push(current);
                afters.push(next);
            }
        });
        bb.run(function () {
            outer = bb.currentInstance;
            bb.run(function () {
                inner = bb.currentInstance;
            });
        });
        expectedBefores = [outer, null, inner, outer];
        expectedAfters = [inner, outer, outer, null];
        assert.deepEqual(befores, expectedBefores, 'before callbacks successful');
        assert.deepEqual(afters, expectedAfters, 'after callback successful');
    });

    QUnit.module('tests/run');
    QUnit.test('when passed a function', function (assert) {
        assert.expect(1);
        var bb = new Backburner__default(['one']);
        var functionWasCalled = false;
        bb.run(function () { return functionWasCalled = true; });
        assert.ok(functionWasCalled, 'function was called');
    });
    QUnit.test('when passed a target and method', function (assert) {
        assert.expect(2);
        var bb = new Backburner__default(['one']);
        var functionWasCalled = false;
        bb.run({ zomg: 'hi' }, function () {
            assert.equal(this.zomg, 'hi', 'the target was properly set');
            functionWasCalled = true;
        });
        assert.ok(functionWasCalled, 'function was called');
    });
    QUnit.test('when passed a target, method, and arguments', function (assert) {
        assert.expect(5);
        var bb = new Backburner__default(['one']);
        var functionWasCalled = false;
        bb.run({ zomg: 'hi' }, function (a, b, c) {
            assert.equal(this.zomg, 'hi', 'the target was properly set');
            assert.equal(a, 1, 'the first arguments was passed in');
            assert.equal(b, 2, 'the second arguments was passed in');
            assert.equal(c, 3, 'the third arguments was passed in');
            functionWasCalled = true;
        }, 1, 2, 3);
        assert.ok(functionWasCalled, 'function was called');
    });
    QUnit.test('nesting run loops preserves the stack', function (assert) {
        assert.expect(10);
        var bb = new Backburner__default(['one']);
        var outerBeforeFunctionWasCalled = false;
        var middleBeforeFunctionWasCalled = false;
        var innerFunctionWasCalled = false;
        var middleAfterFunctionWasCalled = false;
        var outerAfterFunctionWasCalled = false;
        bb.run(function () {
            bb.schedule('one', function () {
                outerBeforeFunctionWasCalled = true;
            });
            bb.run(function () {
                bb.schedule('one', function () {
                    middleBeforeFunctionWasCalled = true;
                });
                bb.run(function () {
                    bb.schedule('one', function () {
                        innerFunctionWasCalled = true;
                    });
                    assert.ok(!innerFunctionWasCalled, 'function is deferred');
                });
                assert.ok(innerFunctionWasCalled, 'function is called');
                bb.schedule('one', function () {
                    middleAfterFunctionWasCalled = true;
                });
                assert.ok(!middleBeforeFunctionWasCalled, 'function is deferred');
                assert.ok(!middleAfterFunctionWasCalled, 'function is deferred');
            });
            assert.ok(middleBeforeFunctionWasCalled, 'function is called');
            assert.ok(middleAfterFunctionWasCalled, 'function is called');
            bb.schedule('one', function () {
                outerAfterFunctionWasCalled = true;
            });
            assert.ok(!outerBeforeFunctionWasCalled, 'function is deferred');
            assert.ok(!outerAfterFunctionWasCalled, 'function is deferred');
        });
        assert.ok(outerBeforeFunctionWasCalled, 'function is called');
        assert.ok(outerAfterFunctionWasCalled, 'function is called');
    });
    QUnit.test('runs can be nested', function (assert) {
        assert.expect(2);
        var bb = new Backburner__default(['one']);
        var step = 0;
        bb.run(function () {
            assert.equal(step++, 0);
            bb.run(function () {
                assert.equal(step++, 1);
            });
        });
    });
    QUnit.test('run returns value', function (assert) {
        var bb = new Backburner__default(['one']);
        var value = bb.run(function () { return 'hi'; });
        assert.equal(value, 'hi');
    });
    QUnit.test('onError', function (assert) {
        assert.expect(1);
        function onError(error) {
            assert.equal('QUnit.test error', error.message);
        }
        var bb = new Backburner__default(['errors'], {
            onError: onError
        });
        bb.run(function () {
            throw new Error('QUnit.test error');
        });
    });
    QUnit.test('onError set after start', function (assert) {
        assert.expect(2);
        var bb = new Backburner__default(['errors']);
        bb.run(function () { return assert.ok(true); });
        bb.options.onError = function (error) {
            assert.equal('QUnit.test error', error.message);
        };
        bb.run(function () { throw new Error('QUnit.test error'); });
    });
    QUnit.test('onError with target and action', function (assert) {
        assert.expect(3);
        var target = {};
        var bb = new Backburner__default(['errors'], {
            onErrorTarget: target,
            onErrorMethod: 'onerror'
        });
        bb.run(function () { return assert.ok(true); });
        target['onerror'] = function (error) {
            assert.equal('QUnit.test error', error.message);
        };
        bb.run(function () { throw new Error('QUnit.test error'); });
        target['onerror'] = function () { };
        bb.run(function () { throw new Error('QUnit.test error'); });
        target['onerror'] = function (error) {
            assert.equal('QUnit.test error', error.message);
        };
        bb.run(function () { throw new Error('QUnit.test error'); });
    });
    QUnit.test('when [callback, string] args passed', function (assert) {
        assert.expect(2);
        var bb = new Backburner__default(['one']);
        var functionWasCalled = false;
        bb.run(function (name) {
            assert.equal(name, 'batman');
            functionWasCalled = true;
        }, 'batman');
        assert.ok(functionWasCalled, 'function was called');
    });

    QUnit.module('tests/throttle');
    QUnit.test('throttle', function (assert) {
        assert.expect(18);
        var bb = new Backburner__default(['zomg']);
        var step = 0;
        var done = assert.async();
        var wasCalled = false;
        function throttler() {
            assert.ok(!wasCalled);
            wasCalled = true;
        }
        // let's throttle the function `throttler` for 40ms
        // it will be executed in 40ms
        bb.throttle(null, throttler, 40, false);
        assert.equal(step++, 0);
        // let's schedule `throttler` to run in 10ms
        setTimeout(function () {
            assert.equal(step++, 1);
            assert.ok(!wasCalled);
            bb.throttle(null, throttler, false);
        }, 10);
        // let's schedule `throttler` to run again in 20ms
        setTimeout(function () {
            assert.equal(step++, 2);
            assert.ok(!wasCalled);
            bb.throttle(null, throttler, false);
        }, 20);
        // let's schedule `throttler` to run yet again in 30ms
        setTimeout(function () {
            assert.equal(step++, 3);
            assert.ok(!wasCalled);
            bb.throttle(null, throttler, false);
        }, 30);
        // at 40ms, `throttler` will get called once
        // now, let's schedule an assertion to occur at 50ms,
        // 10ms after `throttler` has been called
        setTimeout(function () {
            assert.equal(step++, 4);
            assert.ok(wasCalled);
        }, 50);
        // great, we've made it this far, there's one more thing
        // we need to test. we want to make sure we can call `throttle`
        // again with the same target/method after it has executed
        // at the 60ms mark, let's schedule another call to `throttle`
        setTimeout(function () {
            wasCalled = false; // reset the flag
            // assert call order
            assert.equal(step++, 5);
            // call throttle for the second time
            bb.throttle(null, throttler, 100, false);
            // assert that it is called in the future and not blackholed
            setTimeout(function () {
                assert.equal(step++, 6);
                assert.ok(wasCalled, 'Another throttle call with the same function can be executed later');
            }, 110);
        }, 60);
        setTimeout(function () {
            wasCalled = false; // reset the flag
            // assert call order
            assert.equal(step++, 7);
            // call throttle again that time using a string number like time interval
            bb.throttle(null, throttler, '100', false);
            // assert that it is called in the future and not blackholed
            setTimeout(function () {
                assert.equal(step++, 8);
                assert.ok(wasCalled, 'Throttle accept a string number like time interval');
                done();
            }, 110);
        }, 180);
    });
    QUnit.test('throttle with cancelTimers', function (assert) {
        assert.expect(1);
        var count = 0;
        var bb = new Backburner__default(['zomg']);
        // Throttle a no-op 10ms
        bb.throttle(null, function () { }, 10, false);
        try {
            bb.cancelTimers();
        }
        catch (e) {
            count++;
        }
        assert.equal(count, 0, 'calling cancelTimers while something is being throttled does not throw an error');
    });
    QUnit.test('throttled function is called with final argument', function (assert) {
        assert.expect(1);
        var done = assert.async();
        var bb = new Backburner__default(['zomg']);
        function throttled(arg) {
            assert.equal(arg, 'bus');
            done();
        }
        bb.throttle(null, throttled, 'car', 10, false);
        bb.throttle(null, throttled, 'bicycle', 10, false);
        bb.throttle(null, throttled, 'bus', 10, false);
    });
    QUnit.test('throttle returns same timer', function (assert) {
        assert.expect(2);
        var bb = new Backburner__default(['joker']);
        function throttled1() { }
        function throttled2() { }
        var timer1 = bb.throttle(null, throttled1, 10);
        var timer2 = bb.throttle(null, throttled2, 10);
        var timer3 = bb.throttle(null, throttled1, 10);
        var timer4 = bb.throttle(null, throttled2, 10);
        assert.equal(timer1, timer3);
        assert.equal(timer2, timer4);
    });
    QUnit.test('throttle leading edge', function (assert) {
        assert.expect(10);
        var bb = new Backburner__default(['zerg']);
        var throttle;
        var throttle2;
        var wasCalled = false;
        var done = assert.async();
        function throttler() {
            assert.ok(!wasCalled, 'throttler hasn\'t been called yet');
            wasCalled = true;
        }
        // let's throttle the function `throttler` for 40ms
        // it will be executed immediately, but throttled for the future hits
        throttle = bb.throttle(null, throttler, 40);
        assert.ok(wasCalled, 'function was executed immediately');
        wasCalled = false;
        // let's schedule `throttler` to run again, it shouldn't be allowed to queue for another 40 msec
        throttle2 = bb.throttle(null, throttler, 40);
        assert.equal(throttle, throttle2, 'No new throttle was inserted, returns old throttle');
        setTimeout(function () {
            assert.ok(!wasCalled, 'attempt to call throttle again didn\'t happen');
            throttle = bb.throttle(null, throttler, 40);
            assert.ok(wasCalled, 'newly inserted throttle after timeout functioned');
            assert.ok(bb.cancel(throttle), 'wait time of throttle was cancelled');
            wasCalled = false;
            throttle2 = bb.throttle(null, throttler, 40);
            assert.notEqual(throttle, throttle2, 'the throttle is different');
            assert.ok(wasCalled, 'throttle was inserted and run immediately after cancel');
            done();
        }, 60);
    });
    QUnit.test('throttle returns timer information usable for cancelling', function (assert) {
        assert.expect(3);
        var done = assert.async();
        var bb = new Backburner__default(['batman']);
        var wasCalled = false;
        function throttler() {
            assert.ok(false, 'this method shouldn\'t be called');
            wasCalled = true;
        }
        var timer = bb.throttle(null, throttler, 1, false);
        assert.ok(bb.cancel(timer), 'the timer is cancelled');
        // should return false second time around
        assert.ok(!bb.cancel(timer), 'the timer no longer exists in the list');
        setTimeout(function () {
            assert.ok(!wasCalled, 'the timer wasn\'t called after waiting');
            done();
        }, 60);
    });
    QUnit.test('throttler cancel after it\'s executed returns false', function (assert) {
        assert.expect(3);
        var bb = new Backburner__default(['darkknight']);
        var done = assert.async();
        var wasCalled = false;
        function throttler() {
            assert.ok(true, 'the throttled method was called');
            wasCalled = true;
        }
        var timer = bb.throttle(null, throttler, 1);
        setTimeout(function () {
            assert.ok(!bb.cancel(timer), 'no timer existed to cancel');
            assert.ok(wasCalled, 'the timer was actually called');
            done();
        }, 10);
    });
    QUnit.test('throttler returns the appropriate timer to cancel if the old item still exists', function (assert) {
        assert.expect(5);
        var bb = new Backburner__default(['robin']);
        var wasCalled = false;
        var done = assert.async();
        function throttler() {
            assert.ok(true, 'the throttled method was called');
            wasCalled = true;
        }
        var timer = bb.throttle(null, throttler, 1);
        var timer2 = bb.throttle(null, throttler, 1);
        assert.deepEqual(timer, timer2, 'the same timer was returned');
        setTimeout(function () {
            bb.throttle(null, throttler, 1);
            assert.ok(!bb.cancel(timer), 'the second timer isn\'t removed, despite appearing to be the same item');
            assert.ok(wasCalled, 'the timer was actually called');
            done();
        }, 10);
    });
    QUnit.test('throttle without a target, without args', function (assert) {
        var done = assert.async();
        var bb = new Backburner__default(['batman']);
        var calledCount = 0;
        var calledWith = new Array();
        function throttled() {
            var args = [], len = arguments.length;
            while ( len-- ) args[ len ] = arguments[ len ];

            calledCount++;
            calledWith.push(args);
        }
        bb.throttle(throttled, 10);
        bb.throttle(throttled, 10);
        bb.throttle(throttled, 10);
        assert.equal(calledCount, 1, 'throttle method was called immediately');
        assert.deepEqual(calledWith, [[]], 'throttle method was called with the correct arguments');
        setTimeout(function () {
            bb.throttle(throttled, 10);
            assert.equal(calledCount, 1, 'throttle method was not called again within the time window');
        }, 0);
        setTimeout(function () {
            assert.equal(calledCount, 1, 'throttle method was was only called once');
            done();
        }, 20);
    });
    QUnit.test('throttle without a target, without args - can be canceled', function (assert) {
        var bb = new Backburner__default(['batman']);
        var fooCalledCount = 0;
        var barCalledCount = 0;
        function foo() {
            fooCalledCount++;
        }
        function bar() {
            barCalledCount++;
        }
        bb.throttle(foo, 10);
        bb.throttle(foo, 10);
        assert.equal(fooCalledCount, 1, 'foo was called immediately, then throttle');
        bb.throttle(bar, 10);
        var timer = bb.throttle(bar, 10);
        assert.equal(barCalledCount, 1, 'bar was called immediately, then throttle');
        bb.cancel(timer);
        bb.throttle(bar, 10);
        assert.equal(barCalledCount, 2, 'after canceling the prior throttle, bar was called again');
    });
    QUnit.test('throttle without a target, without args, not immediate', function (assert) {
        var done = assert.async();
        var bb = new Backburner__default(['batman']);
        var calledCount = 0;
        var calledWith = new Array();
        function throttled() {
            var args = [], len = arguments.length;
            while ( len-- ) args[ len ] = arguments[ len ];

            calledCount++;
            calledWith.push(args);
        }
        bb.throttle(throttled, 10, false);
        bb.throttle(throttled, 10, false);
        bb.throttle(throttled, 10, false);
        assert.equal(calledCount, 0, 'throttle method was not called immediately');
        setTimeout(function () {
            assert.equal(calledCount, 0, 'throttle method was not called in next tick');
            bb.throttle(throttled, 10, false);
        }, 0);
        setTimeout(function () {
            assert.equal(calledCount, 1, 'throttle method was was only called once');
            assert.deepEqual(calledWith, [[]], 'throttle method was called with the correct arguments');
            done();
        }, 20);
    });
    QUnit.test('throttle without a target, without args, not immediate - can be canceled', function (assert) {
        var done = assert.async();
        var bb = new Backburner__default(['batman']);
        var fooCalledCount = 0;
        var barCalledCount = 0;
        function foo() {
            fooCalledCount++;
        }
        function bar() {
            barCalledCount++;
        }
        bb.throttle(foo, 10, false);
        bb.throttle(foo, 10, false);
        assert.equal(fooCalledCount, 0, 'foo was not called immediately');
        bb.throttle(bar, 10, false);
        var timer = bb.throttle(bar, 10, false);
        assert.equal(barCalledCount, 0, 'bar was not called immediately');
        setTimeout(function () {
            assert.equal(fooCalledCount, 0, 'foo was not called within the time window');
            assert.equal(barCalledCount, 0, 'bar was not called within the time window');
            bb.cancel(timer);
        }, 0);
        setTimeout(function () {
            assert.equal(fooCalledCount, 1, 'foo ran');
            assert.equal(barCalledCount, 0, 'bar was properly canceled');
            bb.throttle(bar, 10, false);
            setTimeout(function () {
                assert.equal(barCalledCount, 1, 'bar was able to run after being canceled');
                done();
            }, 20);
        }, 20);
    });
    QUnit.test('throttle without a target, with args', function (assert) {
        var bb = new Backburner__default(['batman']);
        var calledWith = [];
        function throttled(first) {
            calledWith.push(first);
        }
        var foo = { isFoo: true };
        var bar = { isBar: true };
        var baz = { isBaz: true };
        bb.throttle(throttled, foo, 10);
        bb.throttle(throttled, bar, 10);
        bb.throttle(throttled, baz, 10);
        assert.deepEqual(calledWith, [{ isFoo: true }], 'throttle method was only called once, with correct argument');
    });
    QUnit.test('throttle without a target, with args - can be canceled', function (assert) {
        var done = assert.async();
        var bb = new Backburner__default(['batman']);
        var calledWith = [];
        function throttled(first) {
            calledWith.push(first);
        }
        var foo = { isFoo: true };
        var bar = { isBar: true };
        var baz = { isBaz: true };
        var qux = { isQux: true };
        bb.throttle(throttled, foo, 10);
        bb.throttle(throttled, bar, 10);
        var timer = bb.throttle(throttled, baz, 10);
        assert.deepEqual(calledWith, [{ isFoo: true }], 'throttle method was only called once, with correct argument');
        setTimeout(function () {
            bb.cancel(timer);
            bb.throttle(throttled, qux, 10, true);
            assert.deepEqual(calledWith, [{ isFoo: true }, { isQux: true }], 'throttle method was called again after canceling prior timer');
        }, 0);
        setTimeout(function () {
            assert.deepEqual(calledWith, [{ isFoo: true }, { isQux: true }], 'throttle method was not called again');
            done();
        }, 20);
    });
    QUnit.test('throttle without a target, with args, not immediate', function (assert) {
        var done = assert.async();
        var bb = new Backburner__default(['batman']);
        var calledWith = [];
        function throttler(first) {
            calledWith.push(first);
        }
        var foo = { isFoo: true };
        var bar = { isBar: true };
        var baz = { isBaz: true };
        bb.throttle(throttler, foo, 10, false);
        bb.throttle(throttler, bar, 10, false);
        bb.throttle(throttler, baz, 10, false);
        assert.deepEqual(calledWith, [], 'throttler was not called immediately');
        setTimeout(function () {
            assert.deepEqual(calledWith, [{ isBaz: true }], 'debounce method was only called once, with correct argument');
            done();
        }, 20);
    });
    QUnit.test('throttle without a target, with args, not immediate - can be canceled', function (assert) {
        var done = assert.async();
        var bb = new Backburner__default(['batman']);
        var calledCount = 0;
        var calledWith = [];
        function throttled(first) {
            calledCount++;
            calledWith.push(first);
        }
        var foo = { isFoo: true };
        var bar = { isBar: true };
        var baz = { isBaz: true };
        bb.throttle(throttled, foo, 10, false);
        bb.throttle(throttled, bar, 10, false);
        var timer = bb.throttle(throttled, baz, 10, false);
        assert.equal(calledCount, 0, 'throttle method was not called immediately');
        setTimeout(function () {
            assert.deepEqual(calledWith, [], 'throttle method has not been called on next tick');
            bb.cancel(timer);
        }, 0);
        setTimeout(function () {
            assert.deepEqual(calledWith, [], 'throttle method is not called when canceled');
            done();
        }, 20);
    });
    QUnit.test('onError', function (assert) {
        assert.expect(1);
        function onError(error) {
            assert.equal('test error', error.message);
        }
        var bb = new Backburner__default(['errors'], {
            onError: onError
        });
        bb.throttle(null, function () {
            throw new Error('test error');
        }, 20);
    });
    QUnit.test('throttle + immediate joins existing run loop instances', function (assert) {
        assert.expect(1);
        function onError(error) {
            assert.equal('test error', error.message);
        }
        var bb = new Backburner__default(['errors'], {
            onError: onError
        });
        bb.run(function () {
            var parentInstance = bb.currentInstance;
            bb.throttle(null, function () {
                assert.equal(bb.currentInstance, parentInstance);
            }, 20, true);
        });
    });
    QUnit.test('when [callback, string] args passed', function (assert) {
        assert.expect(2);
        var bb = new Backburner__default(['one']);
        var functionWasCalled = false;
        bb.run(function () {
            bb.throttle(function (name) {
                assert.equal(name, 'batman');
                functionWasCalled = true;
            }, 'batman', 200);
        });
        assert.ok(functionWasCalled, 'function was called');
    });

});
//# sourceMappingURL=tests.js.map
