var _defineProperty = require("C:/Users/yiktllw/Documents/0-GitWorkSpace/XCMusic/node_modules/@babel/runtime/helpers/defineProperty.js").default;
var _classPrivateFieldInitSpec = require("C:/Users/yiktllw/Documents/0-GitWorkSpace/XCMusic/node_modules/@babel/runtime/helpers/classPrivateFieldInitSpec.js").default;
var _classPrivateFieldSet = require("C:/Users/yiktllw/Documents/0-GitWorkSpace/XCMusic/node_modules/@babel/runtime/helpers/classPrivateFieldSet2.js").default;
var _classPrivateFieldGet = require("C:/Users/yiktllw/Documents/0-GitWorkSpace/XCMusic/node_modules/@babel/runtime/helpers/classPrivateFieldGet2.js").default;
require("core-js/modules/es.array.push.js");
require("core-js/modules/es.array-buffer.detached.js");
require("core-js/modules/es.array-buffer.transfer.js");
require("core-js/modules/es.array-buffer.transfer-to-fixed-length.js");
require("core-js/modules/es.typed-array.to-reversed.js");
require("core-js/modules/es.typed-array.to-sorted.js");
require("core-js/modules/es.typed-array.with.js");
require("core-js/modules/web.dom-exception.stack.js");
require("core-js/modules/web.url-search-params.delete.js");
require("core-js/modules/web.url-search-params.has.js");
require("core-js/modules/web.url-search-params.size.js");
!function (e, t) {
  "object" == typeof exports && "object" == typeof module ? module.exports = t() : "function" == typeof define && define.amd ? define([], t) : "object" == typeof exports ? exports.FFmpegWASM = t() : e.FFmpegWASM = t();
}(self, () => (() => {
  "use strict";

  var e = {
    m: {},
    d: (t, s) => {
      for (var r in s) e.o(s, r) && !e.o(t, r) && Object.defineProperty(t, r, {
        enumerable: !0,
        get: s[r]
      });
    },
    u: e => e + ".ffmpeg.js"
  };
  e.g = function () {
    if ("object" == typeof globalThis) return globalThis;
    try {
      return this || new Function("return this")();
    } catch (e) {
      if ("object" == typeof window) return window;
    }
  }(), e.o = (e, t) => Object.prototype.hasOwnProperty.call(e, t), e.r = e => {
    "undefined" != typeof Symbol && Symbol.toStringTag && Object.defineProperty(e, Symbol.toStringTag, {
      value: "Module"
    }), Object.defineProperty(e, "__esModule", {
      value: !0
    });
  }, (() => {
    var t;
    e.g.importScripts && (t = e.g.location + "");
    var s = e.g.document;
    if (!t && s && (s.currentScript && (t = s.currentScript.src), !t)) {
      var r = s.getElementsByTagName("script");
      if (r.length) for (var a = r.length - 1; a > -1 && !t;) t = r[a--].src;
    }
    if (!t) throw new Error("Automatic publicPath is not supported in this browser");
    t = t.replace(/#.*$/, "").replace(/\?.*$/, "").replace(/\/[^\/]+$/, "/"), e.p = t;
  })(), e.b = document.baseURI || self.location.href;
  var t,
    s = {};
  e.r(s), e.d(s, {
    FFmpeg: () => i
  }), function (e) {
    e.LOAD = "LOAD", e.EXEC = "EXEC", e.WRITE_FILE = "WRITE_FILE", e.READ_FILE = "READ_FILE", e.DELETE_FILE = "DELETE_FILE", e.RENAME = "RENAME", e.CREATE_DIR = "CREATE_DIR", e.LIST_DIR = "LIST_DIR", e.DELETE_DIR = "DELETE_DIR", e.ERROR = "ERROR", e.DOWNLOAD = "DOWNLOAD", e.PROGRESS = "PROGRESS", e.LOG = "LOG", e.MOUNT = "MOUNT", e.UNMOUNT = "UNMOUNT";
  }(t || (t = {}));
  const r = (() => {
      let e = 0;
      return () => e++;
    })(),
    a = (new Error("unknown message type"), new Error("ffmpeg is not loaded, call `await ffmpeg.load()` first")),
    o = new Error("called FFmpeg.terminate()");
  new Error("failed to import ffmpeg-core.js");
  var _e = /*#__PURE__*/new WeakMap();
  var _t = /*#__PURE__*/new WeakMap();
  var _s = /*#__PURE__*/new WeakMap();
  var _r = /*#__PURE__*/new WeakMap();
  var _a = /*#__PURE__*/new WeakMap();
  var _o = /*#__PURE__*/new WeakMap();
  var _i = /*#__PURE__*/new WeakMap();
  class i {
    constructor() {
      _classPrivateFieldInitSpec(this, _e, null);
      _classPrivateFieldInitSpec(this, _t, {});
      _classPrivateFieldInitSpec(this, _s, {});
      _classPrivateFieldInitSpec(this, _r, []);
      _classPrivateFieldInitSpec(this, _a, []);
      _defineProperty(this, "loaded", !1);
      _classPrivateFieldInitSpec(this, _o, () => {
        _classPrivateFieldGet(_e, this) && (_classPrivateFieldGet(_e, this).onmessage = ({
          data: {
            id: e,
            type: s,
            data: r
          }
        }) => {
          switch (s) {
            case t.LOAD:
              this.loaded = !0, _classPrivateFieldGet(_t, this)[e](r);
              break;
            case t.MOUNT:
            case t.UNMOUNT:
            case t.EXEC:
            case t.WRITE_FILE:
            case t.READ_FILE:
            case t.DELETE_FILE:
            case t.RENAME:
            case t.CREATE_DIR:
            case t.LIST_DIR:
            case t.DELETE_DIR:
              _classPrivateFieldGet(_t, this)[e](r);
              break;
            case t.LOG:
              _classPrivateFieldGet(_r, this).forEach(e => e(r));
              break;
            case t.PROGRESS:
              _classPrivateFieldGet(_a, this).forEach(e => e(r));
              break;
            case t.ERROR:
              _classPrivateFieldGet(_s, this)[e](r);
          }
          delete _classPrivateFieldGet(_t, this)[e], delete _classPrivateFieldGet(_s, this)[e];
        });
      });
      _classPrivateFieldInitSpec(this, _i, ({
        type: e,
        data: t
      }, s = [], o) => _classPrivateFieldGet(_e, this) ? new Promise((a, i) => {
        const n = r();
        _classPrivateFieldGet(_e, this) && _classPrivateFieldGet(_e, this).postMessage({
          id: n,
          type: e,
          data: t
        }, s), _classPrivateFieldGet(_t, this)[n] = a, _classPrivateFieldGet(_s, this)[n] = i, o === null || o === void 0 ? void 0 : o.addEventListener("abort", () => {
          i(new DOMException(`Message # ${n} was aborted`, "AbortError"));
        }, {
          once: !0
        });
      }) : Promise.reject(a));
      _defineProperty(this, "load", ({
        classWorkerURL: s,
        ...r
      } = {}, {
        signal: a
      } = {}) => (_classPrivateFieldGet(_e, this) || (_classPrivateFieldSet(_e, this, s ? new Worker(new URL(s, "file:///home/jeromewu/ffmpeg.wasm/packages/ffmpeg/dist/esm/classes.js"), {
        type: "module"
      }) : new Worker(new URL(e.p + e.u(814), e.b), {
        type: void 0
      })), _classPrivateFieldGet(_o, this).call(this)), _classPrivateFieldGet(_i, this).call(this, {
        type: t.LOAD,
        data: r
      }, void 0, a)));
      _defineProperty(this, "exec", (e, s = -1, {
        signal: r
      } = {}) => _classPrivateFieldGet(_i, this).call(this, {
        type: t.EXEC,
        data: {
          args: e,
          timeout: s
        }
      }, void 0, r));
      _defineProperty(this, "terminate", () => {
        const e = Object.keys(_classPrivateFieldGet(_s, this));
        for (const t of e) _classPrivateFieldGet(_s, this)[t](o), delete _classPrivateFieldGet(_s, this)[t], delete _classPrivateFieldGet(_t, this)[t];
        _classPrivateFieldGet(_e, this) && (_classPrivateFieldGet(_e, this).terminate(), _classPrivateFieldSet(_e, this, null), this.loaded = !1);
      });
      _defineProperty(this, "writeFile", (e, s, {
        signal: r
      } = {}) => {
        const a = [];
        return s instanceof Uint8Array && a.push(s.buffer), _classPrivateFieldGet(_i, this).call(this, {
          type: t.WRITE_FILE,
          data: {
            path: e,
            data: s
          }
        }, a, r);
      });
      _defineProperty(this, "mount", (e, s, r) => _classPrivateFieldGet(_i, this).call(this, {
        type: t.MOUNT,
        data: {
          fsType: e,
          options: s,
          mountPoint: r
        }
      }, []));
      _defineProperty(this, "unmount", e => _classPrivateFieldGet(_i, this).call(this, {
        type: t.UNMOUNT,
        data: {
          mountPoint: e
        }
      }, []));
      _defineProperty(this, "readFile", (e, s = "binary", {
        signal: r
      } = {}) => _classPrivateFieldGet(_i, this).call(this, {
        type: t.READ_FILE,
        data: {
          path: e,
          encoding: s
        }
      }, void 0, r));
      _defineProperty(this, "deleteFile", (e, {
        signal: s
      } = {}) => _classPrivateFieldGet(_i, this).call(this, {
        type: t.DELETE_FILE,
        data: {
          path: e
        }
      }, void 0, s));
      _defineProperty(this, "rename", (e, s, {
        signal: r
      } = {}) => _classPrivateFieldGet(_i, this).call(this, {
        type: t.RENAME,
        data: {
          oldPath: e,
          newPath: s
        }
      }, void 0, r));
      _defineProperty(this, "createDir", (e, {
        signal: s
      } = {}) => _classPrivateFieldGet(_i, this).call(this, {
        type: t.CREATE_DIR,
        data: {
          path: e
        }
      }, void 0, s));
      _defineProperty(this, "listDir", (e, {
        signal: s
      } = {}) => _classPrivateFieldGet(_i, this).call(this, {
        type: t.LIST_DIR,
        data: {
          path: e
        }
      }, void 0, s));
      _defineProperty(this, "deleteDir", (e, {
        signal: s
      } = {}) => _classPrivateFieldGet(_i, this).call(this, {
        type: t.DELETE_DIR,
        data: {
          path: e
        }
      }, void 0, s));
    }
    on(e, t) {
      "log" === e ? _classPrivateFieldGet(_r, this).push(t) : "progress" === e && _classPrivateFieldGet(_a, this).push(t);
    }
    off(e, t) {
      "log" === e ? _classPrivateFieldSet(_r, this, _classPrivateFieldGet(_r, this).filter(e => e !== t)) : "progress" === e && _classPrivateFieldSet(_a, this, _classPrivateFieldGet(_a, this).filter(e => e !== t));
    }
  }
  return s;
})());
