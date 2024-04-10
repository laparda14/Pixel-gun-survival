function createUnityInstance(e, t, n) {
	function r(e) {
		var t = "unhandledrejection" == e.type && "object" == typeof e.reason ? e.reason : "object" == typeof e.error ? e.error : null,
			n = t ? t.toString() : "string" == typeof e.message ? e.message : "string" == typeof e.reason ? e.reason : "";
		if (t && "string" == typeof t.stack && (n += "\n" + t.stack.substring(t.stack.lastIndexOf(n, 0) ? 0 : n.length).replace(/(^\n*|\n*$)/g, "")), n && c.stackTraceRegExp && c.stackTraceRegExp.test(n)) {
			var r = e instanceof ErrorEvent ? e.filename : t && "string" == typeof t.fileName ? t.fileName : t && "string" == typeof t.sourceURL ? t.sourceURL : "",
				a = e instanceof ErrorEvent ? e.lineno : t && "number" == typeof t.lineNumber ? t.lineNumber : t && "number" == typeof t.line ? t.line : 0;
			i(n, r, a)
		}
	}

	function a(e) {
		e.preventDefault()
	}

	function i(e, t, n) {
		if (c.startupErrorHandler) return void c.startupErrorHandler(e, t, n);
		if (!(c.errorHandler && c.errorHandler(e, t, n) || (console.log("Invoking error handler due to\n" + e), "function" == typeof dump && dump("Invoking error handler due to\n" + e), e.indexOf("UnknownError") != -1 || e.indexOf("Program terminated with exit(0)") != -1 || i.didShowErrorMessage))) {
			var e = "An error occurred running the Unity content on this page. See your browser JavaScript console for more info. The error was:\n" + e;
			e.indexOf("DISABLE_EXCEPTION_CATCHING") != -1 ? e = "An exception has occurred, but exception handling has been disabled in this build. If you are the developer of this content, enable exceptions in your project WebGL player settings to be able to catch the exception or see the stack trace." : e.indexOf("Cannot enlarge memory arrays") != -1 ? e = "Out of memory. If you are the developer of this content, try allocating more memory to your WebGL build in the WebGL player settings." : e.indexOf("Invalid array buffer length") == -1 && e.indexOf("Invalid typed array length") == -1 && e.indexOf("out of memory") == -1 && e.indexOf("could not allocate memory") == -1 || (e = "The browser could not allocate enough memory for the WebGL content. If you are the developer of this content, try allocating less memory to your WebGL build in the WebGL player settings."), alert(e), i.didShowErrorMessage = !0
		}
	}

	function o(e, t) {
		if ("symbolsUrl" != e) {
			var r = c.downloadProgress[e];
			r || (r = c.downloadProgress[e] = {
				started: !1,
				finished: !1,
				lengthComputable: !1,
				total: 0,
				loaded: 0
			}), "object" != typeof t || "progress" != t.type && "load" != t.type || (r.started || (r.started = !0, r.lengthComputable = t.lengthComputable, r.total = t.total), r.loaded = t.loaded, "load" == t.type && (r.finished = !0));
			var a = 0,
				i = 0,
				o = 0,
				s = 0,
				l = 0;
			for (var e in c.downloadProgress) {
				var r = c.downloadProgress[e];
				if (!r.started) return 0;
				o++, r.lengthComputable ? (a += r.loaded, i += r.total, s++) : r.finished || l++
			}
			var d = o ? (o - l - (i ? s * (i - a) / i : 0)) / o : 0;
			n(.9 * d)
		}
	}

	function s(e, t, n) {
		for (var r in m)
			if (m[r].hasUnityMarker(e)) {
				t && console.log('You can reduce startup time if you configure your web server to add "Content-Encoding: ' + r + '" response header when serving "' + t + '" file.');
				var a = m[r];
				if (!a.worker) {
					var i = URL.createObjectURL(new Blob(["this.require = ", a.require.toString(), "; this.decompress = ", a.decompress.toString(), "; this.onmessage = ", function(e) {
						var t = {
							id: e.data.id,
							decompressed: this.decompress(e.data.compressed)
						};
						postMessage(t, t.decompressed ? [t.decompressed.buffer] : [])
					}.toString(), "; postMessage({ ready: true });"], {
						type: "application/javascript"
					}));
					a.worker = new Worker(i), a.worker.onmessage = function(e) {
						return e.data.ready ? void URL.revokeObjectURL(i) : (this.callbacks[e.data.id](e.data.decompressed), void delete this.callbacks[e.data.id])
					}, a.worker.callbacks = {}, a.worker.nextCallbackId = 0
				}
				var o = a.worker.nextCallbackId++;
				return a.worker.callbacks[o] = n, void a.worker.postMessage({
					id: o,
					compressed: e
				}, [e.buffer])
			} n(e)
	}

	function l(e) {
		return new Promise(function(t, n) {
			o(e);
			var r = c.companyName && c.productName ? new c.XMLHttpRequest({
				companyName: c.companyName,
				productName: c.productName,
				cacheControl: c.cacheControl(c[e])
			}) : new XMLHttpRequest;
			r.open("GET", c[e]), r.responseType = "arraybuffer", r.addEventListener("progress", function(t) {
				o(e, t)
			}), r.addEventListener("load", function(n) {
				o(e, n), s(new Uint8Array(r.response), c[e], t)
			}), r.send()
		})
	}

	function d() {
		return l("frameworkUrl").then(function(e) {
			var t = URL.createObjectURL(new Blob([e], {
				type: "application/javascript"
			}));
			return new Promise(function(e, n) {
				var r = document.createElement("script");
				r.src = t, r.onload = function() {
					var n = unityFramework;
					unityFramework = null, r.onload = null, URL.revokeObjectURL(t), e(n)
				}, document.body.appendChild(r), c.deinitializers.push(function() {
					document.body.removeChild(r)
				})
			})
		})
	}

	function u() {
		Promise.all([d(), l("codeUrl")]).then(function(e) {
			c.wasmBinary = e[1], e[0](c)
		});
		var e = l("dataUrl");
		c.preRun.push(function() {
			c.addRunDependency("dataUrl"), e.then(function(e) {
				var t = new DataView(e.buffer, e.byteOffset, e.byteLength),
					n = 0,
					r = "UnityWebData1.0\0";
				if (!String.fromCharCode.apply(null, e.subarray(n, n + r.length)) == r) throw "unknown data format";
				n += r.length;
				var a = t.getUint32(n, !0);
				for (n += 4; n < a;) {
					var i = t.getUint32(n, !0);
					n += 4;
					var o = t.getUint32(n, !0);
					n += 4;
					var s = t.getUint32(n, !0);
					n += 4;
					var l = String.fromCharCode.apply(null, e.subarray(n, n + s));
					n += s;
					for (var d = 0, u = l.indexOf("/", d) + 1; u > 0; d = u, u = l.indexOf("/", d) + 1) c.FS_createPath(l.substring(0, d), l.substring(d, u - 1), !0, !0);
					c.FS_createDataFile(l, null, e.subarray(i, i + o), !0, !0, !0)
				}
				c.removeRunDependency("dataUrl")
			})
		})
	}
	n = n || function() {};
	var c = {
		canvas: e,
		webglContextAttributes: {
			preserveDrawingBuffer: !1
		},
		cacheControl: function(e) {
			return e == c.dataUrl ? "must-revalidate" : "no-store"
		},
		streamingAssetsUrl: "StreamingAssets",
		downloadProgress: {},
		deinitializers: [],
		intervals: {},
		setInterval: function(e, t) {
			var n = window.setInterval(e, t);
			return this.intervals[n] = !0, n
		},
		clearInterval: function(e) {
			delete this.intervals[e], window.clearInterval(e)
		},
		preRun: [],
		postRun: [],
		print: function(e) {
			console.log(e)
		},
		printErr: function(e) {
			console.error(e)
		},
		locateFile: function(e) {
			return e
		},
		disabledCanvasEvents: ["contextmenu", "dragstart"]
	};
	for (var f in t) c[f] = t[f];
	c.streamingAssetsUrl = new URL(c.streamingAssetsUrl, document.URL).href;
	var h = c.disabledCanvasEvents.slice();
	h.forEach(function(t) {
		e.addEventListener(t, a)
	}), window.addEventListener("error", r), window.addEventListener("unhandledrejection", r);
	var p = {
		Module: c,
		SetFullscreen: function() {
			return c.SetFullscreen ? c.SetFullscreen.apply(c, arguments) : void c.print("Failed to set Fullscreen mode: Player not loaded yet.")
		},
		SendMessage: function() {
			return c.SendMessage ? c.SendMessage.apply(c, arguments) : void c.print("Failed to execute SendMessage: Player not loaded yet.")
		},
		Quit: function() {
			return new Promise(function(t, n) {
				c.shouldQuit = !0, c.onQuit = t, h.forEach(function(t) {
					e.removeEventListener(t, a)
				}), window.removeEventListener("error", r), window.removeEventListener("unhandledrejection", r)
			})
		}
	};
	c.SystemInfo = function() {
		function e(e, t, n) {
			return e = RegExp(e, "i").exec(t), e && e[n]
		}
		for (var t, n, r, a, i, o, s = navigator.userAgent + " ", l = [
				["Firefox", "Firefox"],
				["OPR", "Opera"],
				["Edg", "Edge"],
				["SamsungBrowser", "Samsung Browser"],
				["Trident", "Internet Explorer"],
				["MSIE", "Internet Explorer"],
				["Chrome", "Chrome"],
				["CriOS", "Chrome on iOS Safari"],
				["FxiOS", "Firefox on iOS Safari"],
				["Safari", "Safari"]
			], d = 0; d < l.length; ++d)
			if (n = e(l[d][0] + "[/ ](.*?)[ \\)]", s, 1)) {
				t = l[d][1];
				break
			}
		"Safari" == t && (n = e("Version/(.*?) ", s, 1)), "Internet Explorer" == t && (n = e("rv:(.*?)\\)? ", s, 1) || n);
		for (var u = [
				["Windows (.*?)[;)]", "Windows"],
				["Android ([0-9_.]+)", "Android"],
				["iPhone OS ([0-9_.]+)", "iPhoneOS"],
				["iPad.*? OS ([0-9_.]+)", "iPadOS"],
				["FreeBSD( )", "FreeBSD"],
				["OpenBSD( )", "OpenBSD"],
				["Linux|X11()", "Linux"],
				["Mac OS X ([0-9_.]+)", "macOS"],
				["bot|google|baidu|bing|msn|teoma|slurp|yandex", "Search Bot"]
			], c = 0; c < u.length; ++c)
			if (a = e(u[c][0], s, 1)) {
				r = u[c][1], a = a.replace(/_/g, ".");
				break
			} var f = {
			"NT 5.0": "2000",
			"NT 5.1": "XP",
			"NT 5.2": "Server 2003",
			"NT 6.0": "Vista",
			"NT 6.1": "7",
			"NT 6.2": "8",
			"NT 6.3": "8.1",
			"NT 10.0": "10"
		};
		a = f[a] || a, i = document.createElement("canvas"), i && (gl = i.getContext("webgl2"), glVersion = gl ? 2 : 0, gl || (gl = i && i.getContext("webgl")) && (glVersion = 1), gl && (o = gl.getExtension("WEBGL_debug_renderer_info") && gl.getParameter(37446) || gl.getParameter(7937)));
		var h = "undefined" != typeof SharedArrayBuffer,
			p = "object" == typeof WebAssembly && "function" == typeof WebAssembly.compile;
		return {
			width: screen.width,
			height: screen.height,
			userAgent: s.trim(),
			browser: t || "Unknown browser",
			browserVersion: n || "Unknown version",
			mobile: /Mobile|Android|iP(ad|hone)/.test(navigator.appVersion),
			os: r || "Unknown OS",
			osVersion: a || "Unknown OS Version",
			gpu: o || "Unknown GPU",
			language: navigator.userLanguage || navigator.language,
			hasWebGL: glVersion,
			hasCursorLock: !!document.body.requestPointerLock,
			hasFullscreen: !!document.body.requestFullscreen,
			hasThreads: h,
			hasWasm: p,
			hasWasmThreads: !1
		}
	}(), c.abortHandler = function(e) {
		return i(e, "", 0), !0
	}, Error.stackTraceLimit = Math.max(Error.stackTraceLimit || 0, 50), c.XMLHttpRequest = function() {
		function e(e) {
			console.log("[UnityCache] " + e)
		}

		function t(e) {
			return t.link = t.link || document.createElement("a"), t.link.href = e, t.link.href
		}

		function n(e) {
			var t = window.location.href.match(/^[a-z]+:\/\/[^\/]+/);
			return !t || e.lastIndexOf(t[0], 0)
		}

		function r() {
			function t(t) {
				if ("undefined" == typeof r.database)
					for (r.database = t, r.database || e("indexedDB database could not be opened"); r.queue.length;) {
						var n = r.queue.shift();
						r.database ? r.execute.apply(r, n.arguments) : "function" == typeof n.onerror && n.onerror(new Error("operation cancelled"))
					}
			}

			function n() {
				var e = a.open(o.name, o.version);
				e.onupgradeneeded = function(e) {
					var t = e.target.result;
					t.objectStoreNames.contains(l.name) || t.createObjectStore(l.name)
				}, e.onsuccess = function(e) {
					t(e.target.result)
				}, e.onerror = function() {
					t(null)
				}
			}
			var r = this;
			r.queue = [];
			try {
				var a = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB,
					i = a.open(o.name);
				i.onupgradeneeded = function(e) {
					var t = e.target.result.createObjectStore(s.name, {
						keyPath: "url"
					});
					["version", "company", "product", "updated", "revalidated", "accessed"].forEach(function(e) {
						t.createIndex(e, e)
					})
				}, i.onsuccess = function(e) {
					var r = e.target.result;
					r.version < o.version ? (r.close(), n()) : t(r)
				}, i.onerror = function() {
					t(null)
				}
			} catch (e) {
				t(null)
			}
		}

		function a(e, t, n, r, a) {
			var i = {
				url: e,
				version: s.version,
				company: t,
				product: n,
				updated: r,
				revalidated: r,
				accessed: r,
				responseHeaders: {},
				xhr: {}
			};
			return a && (["Last-Modified", "ETag"].forEach(function(e) {
				i.responseHeaders[e] = a.getResponseHeader(e)
			}), ["responseURL", "status", "statusText", "response"].forEach(function(e) {
				i.xhr[e] = a[e]
			})), i
		}

		function i(t) {
			this.cache = {
				enabled: !1
			}, t && (this.cache.control = t.cacheControl, this.cache.company = t.companyName, this.cache.product = t.productName), this.xhr = new XMLHttpRequest(t), this.xhr.addEventListener("load", function() {
				var t = this.xhr,
					n = this.cache;
				n.enabled && !n.revalidated && (304 == t.status ? (n.result.revalidated = n.result.accessed, n.revalidated = !0, d.execute(s.name, "put", [n.result]), e("'" + n.result.url + "' successfully revalidated and served from the indexedDB cache")) : 200 == t.status ? (n.result = a(n.result.url, n.company, n.product, n.result.accessed, t), n.revalidated = !0, d.execute(s.name, "put", [n.result], function(t) {
					e("'" + n.result.url + "' successfully downloaded and stored in the indexedDB cache")
				}, function(t) {
					e("'" + n.result.url + "' successfully downloaded but not stored in the indexedDB cache due to the error: " + t)
				})) : e("'" + n.result.url + "' request failed with status: " + t.status + " " + t.statusText))
			}.bind(this))
		}
		var o = {
				name: "UnityCache",
				version: 2
			},
			s = {
				name: "XMLHttpRequest",
				version: 1
			},
			l = {
				name: "WebAssembly",
				version: 1
			};
		r.prototype.execute = function(e, t, n, r, a) {
			if (this.database) try {
				var i = this.database.transaction([e], ["put", "delete", "clear"].indexOf(t) != -1 ? "readwrite" : "readonly").objectStore(e);
				"openKeyCursor" == t && (i = i.index(n[0]), n = n.slice(1));
				var o = i[t].apply(i, n);
				"function" == typeof r && (o.onsuccess = function(e) {
					r(e.target.result)
				}), o.onerror = a
			} catch (e) {
				"function" == typeof a && a(e)
			} else "undefined" == typeof this.database ? this.queue.push({
				arguments: arguments,
				onerror: a
			}) : "function" == typeof a && a(new Error("indexedDB access denied"))
		};
		var d = new r;
		i.prototype.send = function(t) {
			var r = this.xhr,
				a = this.cache,
				i = arguments;
			return a.enabled = a.enabled && "arraybuffer" == r.responseType && !t, a.enabled ? void d.execute(s.name, "get", [a.result.url], function(t) {
				if (!t || t.version != s.version) return void r.send.apply(r, i);
				if (a.result = t, a.result.accessed = Date.now(), "immutable" == a.control) a.revalidated = !0, d.execute(s.name, "put", [a.result]), r.dispatchEvent(new Event("load")), e("'" + a.result.url + "' served from the indexedDB cache without revalidation");
				else if (n(a.result.url) && (a.result.responseHeaders["Last-Modified"] || a.result.responseHeaders.ETag)) {
					var o = new XMLHttpRequest;
					o.open("HEAD", a.result.url), o.onload = function() {
						a.revalidated = ["Last-Modified", "ETag"].every(function(e) {
							return !a.result.responseHeaders[e] || a.result.responseHeaders[e] == o.getResponseHeader(e)
						}), a.revalidated ? (a.result.revalidated = a.result.accessed, d.execute(s.name, "put", [a.result]), r.dispatchEvent(new Event("load")), e("'" + a.result.url + "' successfully revalidated and served from the indexedDB cache")) : r.send.apply(r, i)
					}, o.send()
				} else a.result.responseHeaders["Last-Modified"] ? (r.setRequestHeader("If-Modified-Since", a.result.responseHeaders["Last-Modified"]), r.setRequestHeader("Cache-Control", "no-cache")) : a.result.responseHeaders.ETag && (r.setRequestHeader("If-None-Match", a.result.responseHeaders.ETag), r.setRequestHeader("Cache-Control", "no-cache")), r.send.apply(r, i)
			}, function(e) {
				r.send.apply(r, i)
			}) : r.send.apply(r, i)
		}, i.prototype.open = function(e, n, r, i, o) {
			return this.cache.result = a(t(n), this.cache.company, this.cache.product, Date.now()), this.cache.enabled = ["must-revalidate", "immutable"].indexOf(this.cache.control) != -1 && "GET" == e && this.cache.result.url.match("^https?://") && ("undefined" == typeof r || r) && "undefined" == typeof i && "undefined" == typeof o, this.cache.revalidated = !1, this.xhr.open.apply(this.xhr, arguments)
		}, i.prototype.setRequestHeader = function(e, t) {
			return this.cache.enabled = !1, this.xhr.setRequestHeader.apply(this.xhr, arguments)
		};
		var u = new XMLHttpRequest;
		for (var c in u) i.prototype.hasOwnProperty(c) || ! function(e) {
			Object.defineProperty(i.prototype, e, "function" == typeof u[e] ? {
				value: function() {
					return this.xhr[e].apply(this.xhr, arguments)
				}
			} : {
				get: function() {
					return this.cache.revalidated && this.cache.result.xhr.hasOwnProperty(e) ? this.cache.result.xhr[e] : this.xhr[e]
				},
				set: function(t) {
					this.xhr[e] = t
				}
			})
		}(c);
		return i
	}();
	var m = {
		gzip: {
			require: function(e) {
				var t = {
					"inflate.js": function(e, t, n) {
						"use strict";

						function r(e) {
							if (!(this instanceof r)) return new r(e);
							this.options = s.assign({
								chunkSize: 16384,
								windowBits: 0,
								to: ""
							}, e || {});
							var t = this.options;
							t.raw && t.windowBits >= 0 && t.windowBits < 16 && (t.windowBits = -t.windowBits, 0 === t.windowBits && (t.windowBits = -15)), !(t.windowBits >= 0 && t.windowBits < 16) || e && e.windowBits || (t.windowBits += 32), t.windowBits > 15 && t.windowBits < 48 && 0 === (15 & t.windowBits) && (t.windowBits |= 15), this.err = 0, this.msg = "", this.ended = !1, this.chunks = [], this.strm = new c, this.strm.avail_out = 0;
							var n = o.inflateInit2(this.strm, t.windowBits);
							if (n !== d.Z_OK) throw new Error(u[n]);
							this.header = new f, o.inflateGetHeader(this.strm, this.header)
						}

						function a(e, t) {
							var n = new r(t);
							if (n.push(e, !0), n.err) throw n.msg || u[n.err];
							return n.result
						}

						function i(e, t) {
							return t = t || {}, t.raw = !0, a(e, t)
						}
						var o = e("./zlib/inflate"),
							s = e("./utils/common"),
							l = e("./utils/strings"),
							d = e("./zlib/constants"),
							u = e("./zlib/messages"),
							c = e("./zlib/zstream"),
							f = e("./zlib/gzheader"),
							h = Object.prototype.toString;
						r.prototype.push = function(e, t) {
							var n, r, a, i, u, c, f = this.strm,
								p = this.options.chunkSize,
								m = this.options.dictionary,
								b = !1;
							if (this.ended) return !1;
							r = t === ~~t ? t : t === !0 ? d.Z_FINISH : d.Z_NO_FLUSH, "string" == typeof e ? f.input = l.binstring2buf(e) : "[object ArrayBuffer]" === h.call(e) ? f.input = new Uint8Array(e) : f.input = e, f.next_in = 0, f.avail_in = f.input.length;
							do {
								if (0 === f.avail_out && (f.output = new s.Buf8(p), f.next_out = 0, f.avail_out = p), n = o.inflate(f, d.Z_NO_FLUSH), n === d.Z_NEED_DICT && m && (c = "string" == typeof m ? l.string2buf(m) : "[object ArrayBuffer]" === h.call(m) ? new Uint8Array(m) : m, n = o.inflateSetDictionary(this.strm, c)), n === d.Z_BUF_ERROR && b === !0 && (n = d.Z_OK, b = !1), n !== d.Z_STREAM_END && n !== d.Z_OK) return this.onEnd(n), this.ended = !0, !1;
								f.next_out && (0 !== f.avail_out && n !== d.Z_STREAM_END && (0 !== f.avail_in || r !== d.Z_FINISH && r !== d.Z_SYNC_FLUSH) || ("string" === this.options.to ? (a = l.utf8border(f.output, f.next_out), i = f.next_out - a, u = l.buf2string(f.output, a), f.next_out = i, f.avail_out = p - i, i && s.arraySet(f.output, f.output, a, i, 0), this.onData(u)) : this.onData(s.shrinkBuf(f.output, f.next_out)))), 0 === f.avail_in && 0 === f.avail_out && (b = !0)
							} while ((f.avail_in > 0 || 0 === f.avail_out) && n !== d.Z_STREAM_END);
							return n === d.Z_STREAM_END && (r = d.Z_FINISH), r === d.Z_FINISH ? (n = o.inflateEnd(this.strm), this.onEnd(n), this.ended = !0, n === d.Z_OK) : r !== d.Z_SYNC_FLUSH || (this.onEnd(d.Z_OK), f.avail_out = 0, !0)
						}, r.prototype.onData = function(e) {
							this.chunks.push(e)
						}, r.prototype.onEnd = function(e) {
							e === d.Z_OK && ("string" === this.options.to ? this.result = this.chunks.join("") : this.result = s.flattenChunks(this.chunks)), this.chunks = [], this.err = e, this.msg = this.strm.msg
						}, n.Inflate = r, n.inflate = a, n.inflateRaw = i, n.ungzip = a
					},
					"utils/common.js": function(e, t, n) {
						"use strict";
						var r = "undefined" != typeof Uint8Array && "undefined" != typeof Uint16Array && "undefined" != typeof Int32Array;
						n.assign = function(e) {
							for (var t = Array.prototype.slice.call(arguments, 1); t.length;) {
								var n = t.shift();
								if (n) {
									if ("object" != typeof n) throw new TypeError(n + "must be non-object");
									for (var r in n) n.hasOwnProperty(r) && (e[r] = n[r])
								}
							}
							return e
						}, n.shrinkBuf = function(e, t) {
							return e.length === t ? e : e.subarray ? e.subarray(0, t) : (e.length = t, e)
						};
						var a = {
								arraySet: function(e, t, n, r, a) {
									if (t.subarray && e.subarray) return void e.set(t.subarray(n, n + r), a);
									for (var i = 0; i < r; i++) e[a + i] = t[n + i]
								},
								flattenChunks: function(e) {
									var t, n, r, a, i, o;
									for (r = 0, t = 0, n = e.length; t < n; t++) r += e[t].length;
									for (o = new Uint8Array(r), a = 0, t = 0, n = e.length; t < n; t++) i = e[t], o.set(i, a), a += i.length;
									return o
								}
							},
							i = {
								arraySet: function(e, t, n, r, a) {
									for (var i = 0; i < r; i++) e[a + i] = t[n + i]
								},
								flattenChunks: function(e) {
									return [].concat.apply([], e)
								}
							};
						n.setTyped = function(e) {
							e ? (n.Buf8 = Uint8Array, n.Buf16 = Uint16Array, n.Buf32 = Int32Array, n.assign(n, a)) : (n.Buf8 = Array, n.Buf16 = Array, n.Buf32 = Array, n.assign(n, i))
						}, n.setTyped(r)
					},
					"utils/strings.js": function(e, t, n) {
						"use strict";

						function r(e, t) {
							if (t < 65537 && (e.subarray && o || !e.subarray && i)) return String.fromCharCode.apply(null, a.shrinkBuf(e, t));
							for (var n = "", r = 0; r < t; r++) n += String.fromCharCode(e[r]);
							return n
						}
						var a = e("./common"),
							i = !0,
							o = !0;
						try {
							String.fromCharCode.apply(null, [0])
						} catch (e) {
							i = !1
						}
						try {
							String.fromCharCode.apply(null, new Uint8Array(1))
						} catch (e) {
							o = !1
						}
						for (var s = new a.Buf8(256), l = 0; l < 256; l++) s[l] = l >= 252 ? 6 : l >= 248 ? 5 : l >= 240 ? 4 : l >= 224 ? 3 : l >= 192 ? 2 : 1;
						s[254] = s[254] = 1, n.string2buf = function(e) {
							var t, n, r, i, o, s = e.length,
								l = 0;
							for (i = 0; i < s; i++) n = e.charCodeAt(i), 55296 === (64512 & n) && i + 1 < s && (r = e.charCodeAt(i + 1), 56320 === (64512 & r) && (n = 65536 + (n - 55296 << 10) + (r - 56320), i++)), l += n < 128 ? 1 : n < 2048 ? 2 : n < 65536 ? 3 : 4;
							for (t = new a.Buf8(l), o = 0, i = 0; o < l; i++) n = e.charCodeAt(i), 55296 === (64512 & n) && i + 1 < s && (r = e.charCodeAt(i + 1), 56320 === (64512 & r) && (n = 65536 + (n - 55296 << 10) + (r - 56320), i++)), n < 128 ? t[o++] = n : n < 2048 ? (t[o++] = 192 | n >>> 6, t[o++] = 128 | 63 & n) : n < 65536 ? (t[o++] = 224 | n >>> 12, t[o++] = 128 | n >>> 6 & 63, t[o++] = 128 | 63 & n) : (t[o++] = 240 | n >>> 18, t[o++] = 128 | n >>> 12 & 63, t[o++] = 128 | n >>> 6 & 63, t[o++] = 128 | 63 & n);
							return t
						}, n.buf2binstring = function(e) {
							return r(e, e.length)
						}, n.binstring2buf = function(e) {
							for (var t = new a.Buf8(e.length), n = 0, r = t.length; n < r; n++) t[n] = e.charCodeAt(n);
							return t
						}, n.buf2string = function(e, t) {
							var n, a, i, o, l = t || e.length,
								d = new Array(2 * l);
							for (a = 0, n = 0; n < l;)
								if (i = e[n++], i < 128) d[a++] = i;
								else if (o = s[i], o > 4) d[a++] = 65533, n += o - 1;
							else {
								for (i &= 2 === o ? 31 : 3 === o ? 15 : 7; o > 1 && n < l;) i = i << 6 | 63 & e[n++], o--;
								o > 1 ? d[a++] = 65533 : i < 65536 ? d[a++] = i : (i -= 65536, d[a++] = 55296 | i >> 10 & 1023, d[a++] = 56320 | 1023 & i)
							}
							return r(d, a)
						}, n.utf8border = function(e, t) {
							var n;
							for (t = t || e.length, t > e.length && (t = e.length), n = t - 1; n >= 0 && 128 === (192 & e[n]);) n--;
							return n < 0 ? t : 0 === n ? t : n + s[e[n]] > t ? n : t
						}
					},
					"zlib/inflate.js": function(e, t, n) {
						"use strict";

						function r(e) {
							return (e >>> 24 & 255) + (e >>> 8 & 65280) + ((65280 & e) << 8) + ((255 & e) << 24)
						}

						function a() {
							this.mode = 0, this.last = !1, this.wrap = 0, this.havedict = !1, this.flags = 0, this.dmax = 0, this.check = 0, this.total = 0, this.head = null, this.wbits = 0, this.wsize = 0, this.whave = 0, this.wnext = 0, this.window = null, this.hold = 0, this.bits = 0, this.length = 0, this.offset = 0, this.extra = 0, this.lencode = null, this.distcode = null, this.lenbits = 0, this.distbits = 0, this.ncode = 0, this.nlen = 0, this.ndist = 0, this.have = 0, this.next = null, this.lens = new w.Buf16(320), this.work = new w.Buf16(288), this.lendyn = null, this.distdyn = null, this.sane = 0, this.back = 0, this.was = 0
						}

						function i(e) {
							var t;
							return e && e.state ? (t = e.state, e.total_in = e.total_out = t.total = 0, e.msg = "", t.wrap && (e.adler = 1 & t.wrap), t.mode = D, t.last = 0, t.havedict = 0, t.dmax = 32768, t.head = null, t.hold = 0, t.bits = 0, t.lencode = t.lendyn = new w.Buf32(me), t.distcode = t.distdyn = new w.Buf32(be), t.sane = 1, t.back = -1, R) : A
						}

						function o(e) {
							var t;
							return e && e.state ? (t = e.state, t.wsize = 0, t.whave = 0, t.wnext = 0, i(e)) : A
						}

						function s(e, t) {
							var n, r;
							return e && e.state ? (r = e.state, t < 0 ? (n = 0, t = -t) : (n = (t >> 4) + 1, t < 48 && (t &= 15)), t && (t < 8 || t > 15) ? A : (null !== r.window && r.wbits !== t && (r.window = null), r.wrap = n, r.wbits = t, o(e))) : A
						}

						function l(e, t) {
							var n, r;
							return e ? (r = new a, e.state = r, r.window = null, n = s(e, t), n !== R && (e.state = null), n) : A
						}

						function d(e) {
							return l(e, we)
						}

						function u(e) {
							if (ve) {
								var t;
								for (b = new w.Buf32(512), g = new w.Buf32(32), t = 0; t < 144;) e.lens[t++] = 8;
								for (; t < 256;) e.lens[t++] = 9;
								for (; t < 280;) e.lens[t++] = 7;
								for (; t < 288;) e.lens[t++] = 8;
								for (x(S, e.lens, 0, 288, b, 0, e.work, {
										bits: 9
									}), t = 0; t < 32;) e.lens[t++] = 5;
								x(E, e.lens, 0, 32, g, 0, e.work, {
									bits: 5
								}), ve = !1
							}
							e.lencode = b, e.lenbits = 9, e.distcode = g, e.distbits = 5
						}

						function c(e, t, n, r) {
							var a, i = e.state;
							return null === i.window && (i.wsize = 1 << i.wbits, i.wnext = 0, i.whave = 0, i.window = new w.Buf8(i.wsize)), r >= i.wsize ? (w.arraySet(i.window, t, n - i.wsize, i.wsize, 0), i.wnext = 0, i.whave = i.wsize) : (a = i.wsize - i.wnext, a > r && (a = r), w.arraySet(i.window, t, n - r, a, i.wnext), r -= a, r ? (w.arraySet(i.window, t, n - r, r, 0), i.wnext = r, i.whave = i.wsize) : (i.wnext += a, i.wnext === i.wsize && (i.wnext = 0), i.whave < i.wsize && (i.whave += a))), 0
						}

						function f(e, t) {
							var n, a, i, o, s, l, d, f, h, p, m, b, g, me, be, ge, we, ve, ye, ke, xe, _e, Se, Ee, Le = 0,
								Be = new w.Buf8(4),
								Ce = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15];
							if (!e || !e.state || !e.output || !e.input && 0 !== e.avail_in) return A;
							n = e.state, n.mode === K && (n.mode = V), s = e.next_out, i = e.output, d = e.avail_out, o = e.next_in, a = e.input, l = e.avail_in, f = n.hold, h = n.bits, p = l, m = d, _e = R;
							e: for (;;) switch (n.mode) {
								case D:
									if (0 === n.wrap) {
										n.mode = V;
										break
									}
									for (; h < 16;) {
										if (0 === l) break e;
										l--, f += a[o++] << h, h += 8
									}
									if (2 & n.wrap && 35615 === f) {
										n.check = 0, Be[0] = 255 & f, Be[1] = f >>> 8 & 255, n.check = y(n.check, Be, 2, 0), f = 0, h = 0, n.mode = Z;
										break
									}
									if (n.flags = 0, n.head && (n.head.done = !1), !(1 & n.wrap) || (((255 & f) << 8) + (f >> 8)) % 31) {
										e.msg = "incorrect header check", n.mode = fe;
										break
									}
									if ((15 & f) !== H) {
										e.msg = "unknown compression method", n.mode = fe;
										break
									}
									if (f >>>= 4, h -= 4, xe = (15 & f) + 8, 0 === n.wbits) n.wbits = xe;
									else if (xe > n.wbits) {
										e.msg = "invalid window size", n.mode = fe;
										break
									}
									n.dmax = 1 << xe, e.adler = n.check = 1, n.mode = 512 & f ? G : K, f = 0, h = 0;
									break;
								case Z:
									for (; h < 16;) {
										if (0 === l) break e;
										l--, f += a[o++] << h, h += 8
									}
									if (n.flags = f, (255 & n.flags) !== H) {
										e.msg = "unknown compression method", n.mode = fe;
										break
									}
									if (57344 & n.flags) {
										e.msg = "unknown header flags set", n.mode = fe;
										break
									}
									n.head && (n.head.text = f >> 8 & 1), 512 & n.flags && (Be[0] = 255 & f, Be[1] = f >>> 8 & 255, n.check = y(n.check, Be, 2, 0)), f = 0, h = 0, n.mode = z;
								case z:
									for (; h < 32;) {
										if (0 === l) break e;
										l--, f += a[o++] << h, h += 8
									}
									n.head && (n.head.time = f), 512 & n.flags && (Be[0] = 255 & f, Be[1] = f >>> 8 & 255, Be[2] = f >>> 16 & 255, Be[3] = f >>> 24 & 255, n.check = y(n.check, Be, 4, 0)), f = 0, h = 0, n.mode = F;
								case F:
									for (; h < 16;) {
										if (0 === l) break e;
										l--, f += a[o++] << h, h += 8
									}
									n.head && (n.head.xflags = 255 & f, n.head.os = f >> 8), 512 & n.flags && (Be[0] = 255 & f, Be[1] = f >>> 8 & 255, n.check = y(n.check, Be, 2, 0)), f = 0, h = 0, n.mode = j;
								case j:
									if (1024 & n.flags) {
										for (; h < 16;) {
											if (0 === l) break e;
											l--, f += a[o++] << h, h += 8
										}
										n.length = f, n.head && (n.head.extra_len = f), 512 & n.flags && (Be[0] = 255 & f, Be[1] = f >>> 8 & 255, n.check = y(n.check, Be, 2, 0)), f = 0, h = 0
									} else n.head && (n.head.extra = null);
									n.mode = M;
								case M:
									if (1024 & n.flags && (b = n.length, b > l && (b = l), b && (n.head && (xe = n.head.extra_len - n.length, n.head.extra || (n.head.extra = new Array(n.head.extra_len)), w.arraySet(n.head.extra, a, o, b, xe)), 512 & n.flags && (n.check = y(n.check, a, b, o)), l -= b, o += b, n.length -= b), n.length)) break e;
									n.length = 0, n.mode = P;
								case P:
									if (2048 & n.flags) {
										if (0 === l) break e;
										b = 0;
										do xe = a[o + b++], n.head && xe && n.length < 65536 && (n.head.name += String.fromCharCode(xe)); while (xe && b < l);
										if (512 & n.flags && (n.check = y(n.check, a, b, o)), l -= b, o += b, xe) break e
									} else n.head && (n.head.name = null);
									n.length = 0, n.mode = W;
								case W:
									if (4096 & n.flags) {
										if (0 === l) break e;
										b = 0;
										do xe = a[o + b++], n.head && xe && n.length < 65536 && (n.head.comment += String.fromCharCode(xe)); while (xe && b < l);
										if (512 & n.flags && (n.check = y(n.check, a, b, o)), l -= b, o += b, xe) break e
									} else n.head && (n.head.comment = null);
									n.mode = q;
								case q:
									if (512 & n.flags) {
										for (; h < 16;) {
											if (0 === l) break e;
											l--, f += a[o++] << h, h += 8
										}
										if (f !== (65535 & n.check)) {
											e.msg = "header crc mismatch", n.mode = fe;
											break
										}
										f = 0, h = 0
									}
									n.head && (n.head.hcrc = n.flags >> 9 & 1, n.head.done = !0), e.adler = n.check = 0, n.mode = K;
									break;
								case G:
									for (; h < 32;) {
										if (0 === l) break e;
										l--, f += a[o++] << h, h += 8
									}
									e.adler = n.check = r(f), f = 0, h = 0, n.mode = X;
								case X:
									if (0 === n.havedict) return e.next_out = s, e.avail_out = d, e.next_in = o, e.avail_in = l, n.hold = f, n.bits = h, U;
									e.adler = n.check = 1, n.mode = K;
								case K:
									if (t === B || t === C) break e;
								case V:
									if (n.last) {
										f >>>= 7 & h, h -= 7 & h, n.mode = de;
										break
									}
									for (; h < 3;) {
										if (0 === l) break e;
										l--, f += a[o++] << h, h += 8
									}
									switch (n.last = 1 & f, f >>>= 1, h -= 1, 3 & f) {
										case 0:
											n.mode = Y;
											break;
										case 1:
											if (u(n), n.mode = ne, t === C) {
												f >>>= 2, h -= 2;
												break e
											}
											break;
										case 2:
											n.mode = $;
											break;
										case 3:
											e.msg = "invalid block type", n.mode = fe
									}
									f >>>= 2, h -= 2;
									break;
								case Y:
									for (f >>>= 7 & h, h -= 7 & h; h < 32;) {
										if (0 === l) break e;
										l--, f += a[o++] << h, h += 8
									}
									if ((65535 & f) !== (f >>> 16 ^ 65535)) {
										e.msg = "invalid stored block lengths", n.mode = fe;
										break
									}
									if (n.length = 65535 & f, f = 0, h = 0, n.mode = Q, t === C) break e;
								case Q:
									n.mode = J;
								case J:
									if (b = n.length) {
										if (b > l && (b = l), b > d && (b = d), 0 === b) break e;
										w.arraySet(i, a, o, b, s), l -= b, o += b, d -= b, s += b, n.length -= b;
										break
									}
									n.mode = K;
									break;
								case $:
									for (; h < 14;) {
										if (0 === l) break e;
										l--, f += a[o++] << h, h += 8
									}
									if (n.nlen = (31 & f) + 257, f >>>= 5, h -= 5, n.ndist = (31 & f) + 1, f >>>= 5, h -= 5, n.ncode = (15 & f) + 4, f >>>= 4, h -= 4, n.nlen > 286 || n.ndist > 30) {
										e.msg = "too many length or distance symbols", n.mode = fe;
										break
									}
									n.have = 0, n.mode = ee;
								case ee:
									for (; n.have < n.ncode;) {
										for (; h < 3;) {
											if (0 === l) break e;
											l--, f += a[o++] << h, h += 8
										}
										n.lens[Ce[n.have++]] = 7 & f, f >>>= 3, h -= 3
									}
									for (; n.have < 19;) n.lens[Ce[n.have++]] = 0;
									if (n.lencode = n.lendyn, n.lenbits = 7, Se = {
											bits: n.lenbits
										}, _e = x(_, n.lens, 0, 19, n.lencode, 0, n.work, Se), n.lenbits = Se.bits, _e) {
										e.msg = "invalid code lengths set", n.mode = fe;
										break
									}
									n.have = 0, n.mode = te;
								case te:
									for (; n.have < n.nlen + n.ndist;) {
										for (; Le = n.lencode[f & (1 << n.lenbits) - 1], be = Le >>> 24, ge = Le >>> 16 & 255, we = 65535 & Le, !(be <= h);) {
											if (0 === l) break e;
											l--, f += a[o++] << h, h += 8
										}
										if (we < 16) f >>>= be, h -= be, n.lens[n.have++] = we;
										else {
											if (16 === we) {
												for (Ee = be + 2; h < Ee;) {
													if (0 === l) break e;
													l--, f += a[o++] << h, h += 8
												}
												if (f >>>= be, h -= be, 0 === n.have) {
													e.msg = "invalid bit length repeat", n.mode = fe;
													break
												}
												xe = n.lens[n.have - 1], b = 3 + (3 & f), f >>>= 2, h -= 2
											} else if (17 === we) {
												for (Ee = be + 3; h < Ee;) {
													if (0 === l) break e;
													l--, f += a[o++] << h, h += 8
												}
												f >>>= be, h -= be, xe = 0, b = 3 + (7 & f), f >>>= 3, h -= 3
											} else {
												for (Ee = be + 7; h < Ee;) {
													if (0 === l) break e;
													l--, f += a[o++] << h, h += 8
												}
												f >>>= be, h -= be, xe = 0, b = 11 + (127 & f), f >>>= 7, h -= 7
											}
											if (n.have + b > n.nlen + n.ndist) {
												e.msg = "invalid bit length repeat", n.mode = fe;
												break
											}
											for (; b--;) n.lens[n.have++] = xe
										}
									}
									if (n.mode === fe) break;
									if (0 === n.lens[256]) {
										e.msg = "invalid code -- missing end-of-block", n.mode = fe;
										break
									}
									if (n.lenbits = 9, Se = {
											bits: n.lenbits
										}, _e = x(S, n.lens, 0, n.nlen, n.lencode, 0, n.work, Se), n.lenbits = Se.bits, _e) {
										e.msg = "invalid literal/lengths set", n.mode = fe;
										break
									}
									if (n.distbits = 6, n.distcode = n.distdyn, Se = {
											bits: n.distbits
										}, _e = x(E, n.lens, n.nlen, n.ndist, n.distcode, 0, n.work, Se), n.distbits = Se.bits, _e) {
										e.msg = "invalid distances set", n.mode = fe;
										break
									}
									if (n.mode = ne, t === C) break e;
								case ne:
									n.mode = re;
								case re:
									if (l >= 6 && d >= 258) {
										e.next_out = s, e.avail_out = d, e.next_in = o, e.avail_in = l, n.hold = f, n.bits = h, k(e, m), s = e.next_out, i = e.output, d = e.avail_out, o = e.next_in, a = e.input, l = e.avail_in, f = n.hold, h = n.bits, n.mode === K && (n.back = -1);
										break
									}
									for (n.back = 0; Le = n.lencode[f & (1 << n.lenbits) - 1], be = Le >>> 24, ge = Le >>> 16 & 255, we = 65535 & Le, !(be <= h);) {
										if (0 === l) break e;
										l--, f += a[o++] << h, h += 8
									}
									if (ge && 0 === (240 & ge)) {
										for (ve = be, ye = ge, ke = we; Le = n.lencode[ke + ((f & (1 << ve + ye) - 1) >> ve)], be = Le >>> 24, ge = Le >>> 16 & 255, we = 65535 & Le, !(ve + be <= h);) {
											if (0 === l) break e;
											l--, f += a[o++] << h, h += 8
										}
										f >>>= ve, h -= ve, n.back += ve
									}
									if (f >>>= be, h -= be, n.back += be, n.length = we, 0 === ge) {
										n.mode = le;
										break
									}
									if (32 & ge) {
										n.back = -1, n.mode = K;
										break
									}
									if (64 & ge) {
										e.msg = "invalid literal/length code", n.mode = fe;
										break
									}
									n.extra = 15 & ge, n.mode = ae;
								case ae:
									if (n.extra) {
										for (Ee = n.extra; h < Ee;) {
											if (0 === l) break e;
											l--, f += a[o++] << h, h += 8
										}
										n.length += f & (1 << n.extra) - 1, f >>>= n.extra, h -= n.extra, n.back += n.extra
									}
									n.was = n.length, n.mode = ie;
								case ie:
									for (; Le = n.distcode[f & (1 << n.distbits) - 1], be = Le >>> 24, ge = Le >>> 16 & 255, we = 65535 & Le, !(be <= h);) {
										if (0 === l) break e;
										l--, f += a[o++] << h, h += 8
									}
									if (0 === (240 & ge)) {
										for (ve = be, ye = ge, ke = we; Le = n.distcode[ke + ((f & (1 << ve + ye) - 1) >> ve)], be = Le >>> 24, ge = Le >>> 16 & 255, we = 65535 & Le, !(ve + be <= h);) {
											if (0 === l) break e;
											l--, f += a[o++] << h, h += 8
										}
										f >>>= ve, h -= ve, n.back += ve
									}
									if (f >>>= be, h -= be, n.back += be, 64 & ge) {
										e.msg = "invalid distance code", n.mode = fe;
										break
									}
									n.offset = we, n.extra = 15 & ge, n.mode = oe;
								case oe:
									if (n.extra) {
										for (Ee = n.extra; h < Ee;) {
											if (0 === l) break e;
											l--, f += a[o++] << h, h += 8
										}
										n.offset += f & (1 << n.extra) - 1, f >>>= n.extra, h -= n.extra, n.back += n.extra
									}
									if (n.offset > n.dmax) {
										e.msg = "invalid distance too far back", n.mode = fe;
										break
									}
									n.mode = se;
								case se:
									if (0 === d) break e;
									if (b = m - d, n.offset > b) {
										if (b = n.offset - b, b > n.whave && n.sane) {
											e.msg = "invalid distance too far back", n.mode = fe;
											break
										}
										b > n.wnext ? (b -= n.wnext, g = n.wsize - b) : g = n.wnext - b, b > n.length && (b = n.length), me = n.window
									} else me = i, g = s - n.offset, b = n.length;
									b > d && (b = d), d -= b, n.length -= b;
									do i[s++] = me[g++]; while (--b);
									0 === n.length && (n.mode = re);
									break;
								case le:
									if (0 === d) break e;
									i[s++] = n.length, d--, n.mode = re;
									break;
								case de:
									if (n.wrap) {
										for (; h < 32;) {
											if (0 === l) break e;
											l--, f |= a[o++] << h, h += 8
										}
										if (m -= d, e.total_out += m, n.total += m, m && (e.adler = n.check = n.flags ? y(n.check, i, m, s - m) : v(n.check, i, m, s - m)), m = d, (n.flags ? f : r(f)) !== n.check) {
											e.msg = "incorrect data check", n.mode = fe;
											break
										}
										f = 0, h = 0
									}
									n.mode = ue;
								case ue:
									if (n.wrap && n.flags) {
										for (; h < 32;) {
											if (0 === l) break e;
											l--, f += a[o++] << h, h += 8
										}
										if (f !== (4294967295 & n.total)) {
											e.msg = "incorrect length check", n.mode = fe;
											break
										}
										f = 0, h = 0
									}
									n.mode = ce;
								case ce:
									_e = O;
									break e;
								case fe:
									_e = I;
									break e;
								case he:
									return N;
								case pe:
								default:
									return A
							}
							return e.next_out = s, e.avail_out = d, e.next_in = o, e.avail_in = l, n.hold = f, n.bits = h, (n.wsize || m !== e.avail_out && n.mode < fe && (n.mode < de || t !== L)) && c(e, e.output, e.next_out, m - e.avail_out) ? (n.mode = he, N) : (p -= e.avail_in, m -= e.avail_out, e.total_in += p, e.total_out += m, n.total += m, n.wrap && m && (e.adler = n.check = n.flags ? y(n.check, i, m, e.next_out - m) : v(n.check, i, m, e.next_out - m)), e.data_type = n.bits + (n.last ? 64 : 0) + (n.mode === K ? 128 : 0) + (n.mode === ne || n.mode === Q ? 256 : 0), (0 === p && 0 === m || t === L) && _e === R && (_e = T), _e)
						}

						function h(e) {
							if (!e || !e.state) return A;
							var t = e.state;
							return t.window && (t.window = null), e.state = null, R
						}

						function p(e, t) {
							var n;
							return e && e.state ? (n = e.state, 0 === (2 & n.wrap) ? A : (n.head = t, t.done = !1, R)) : A
						}

						function m(e, t) {
							var n, r, a, i = t.length;
							return e && e.state ? (n = e.state, 0 !== n.wrap && n.mode !== X ? A : n.mode === X && (r = 1, r = v(r, t, i, 0), r !== n.check) ? I : (a = c(e, t, i, i)) ? (n.mode = he, N) : (n.havedict = 1, R)) : A
						}
						var b, g, w = e("../utils/common"),
							v = e("./adler32"),
							y = e("./crc32"),
							k = e("./inffast"),
							x = e("./inftrees"),
							_ = 0,
							S = 1,
							E = 2,
							L = 4,
							B = 5,
							C = 6,
							R = 0,
							O = 1,
							U = 2,
							A = -2,
							I = -3,
							N = -4,
							T = -5,
							H = 8,
							D = 1,
							Z = 2,
							z = 3,
							F = 4,
							j = 5,
							M = 6,
							P = 7,
							W = 8,
							q = 9,
							G = 10,
							X = 11,
							K = 12,
							V = 13,
							Y = 14,
							Q = 15,
							J = 16,
							$ = 17,
							ee = 18,
							te = 19,
							ne = 20,
							re = 21,
							ae = 22,
							ie = 23,
							oe = 24,
							se = 25,
							le = 26,
							de = 27,
							ue = 28,
							ce = 29,
							fe = 30,
							he = 31,
							pe = 32,
							me = 852,
							be = 592,
							ge = 15,
							we = ge,
							ve = !0;
						n.inflateReset = o, n.inflateReset2 = s, n.inflateResetKeep = i, n.inflateInit = d, n.inflateInit2 = l, n.inflate = f, n.inflateEnd = h, n.inflateGetHeader = p, n.inflateSetDictionary = m, n.inflateInfo = "pako inflate (from Nodeca project)"
					},
					"zlib/constants.js": function(e, t, n) {
						"use strict";
						t.exports = {
							Z_NO_FLUSH: 0,
							Z_PARTIAL_FLUSH: 1,
							Z_SYNC_FLUSH: 2,
							Z_FULL_FLUSH: 3,
							Z_FINISH: 4,
							Z_BLOCK: 5,
							Z_TREES: 6,
							Z_OK: 0,
							Z_STREAM_END: 1,
							Z_NEED_DICT: 2,
							Z_ERRNO: -1,
							Z_STREAM_ERROR: -2,
							Z_DATA_ERROR: -3,
							Z_BUF_ERROR: -5,
							Z_NO_COMPRESSION: 0,
							Z_BEST_SPEED: 1,
							Z_BEST_COMPRESSION: 9,
							Z_DEFAULT_COMPRESSION: -1,
							Z_FILTERED: 1,
							Z_HUFFMAN_ONLY: 2,
							Z_RLE: 3,
							Z_FIXED: 4,
							Z_DEFAULT_STRATEGY: 0,
							Z_BINARY: 0,
							Z_TEXT: 1,
							Z_UNKNOWN: 2,
							Z_DEFLATED: 8
						}
					},
					"zlib/messages.js": function(e, t, n) {
						"use strict";
						t.exports = {
							2: "need dictionary",
							1: "stream end",
							0: "",
							"-1": "file error",
							"-2": "stream error",
							"-3": "data error",
							"-4": "insufficient memory",
							"-5": "buffer error",
							"-6": "incompatible version"
						}
					},
					"zlib/zstream.js": function(e, t, n) {
						"use strict";

						function r() {
							this.input = null, this.next_in = 0, this.avail_in = 0, this.total_in = 0,
								this.output = null, this.next_out = 0, this.avail_out = 0, this.total_out = 0, this.msg = "", this.state = null, this.data_type = 2, this.adler = 0
						}
						t.exports = r
					},
					"zlib/gzheader.js": function(e, t, n) {
						"use strict";

						function r() {
							this.text = 0, this.time = 0, this.xflags = 0, this.os = 0, this.extra = null, this.extra_len = 0, this.name = "", this.comment = "", this.hcrc = 0, this.done = !1
						}
						t.exports = r
					},
					"zlib/adler32.js": function(e, t, n) {
						"use strict";

						function r(e, t, n, r) {
							for (var a = 65535 & e | 0, i = e >>> 16 & 65535 | 0, o = 0; 0 !== n;) {
								o = n > 2e3 ? 2e3 : n, n -= o;
								do a = a + t[r++] | 0, i = i + a | 0; while (--o);
								a %= 65521, i %= 65521
							}
							return a | i << 16 | 0
						}
						t.exports = r
					},
					"zlib/crc32.js": function(e, t, n) {
						"use strict";

						function r() {
							for (var e, t = [], n = 0; n < 256; n++) {
								e = n;
								for (var r = 0; r < 8; r++) e = 1 & e ? 3988292384 ^ e >>> 1 : e >>> 1;
								t[n] = e
							}
							return t
						}

						function a(e, t, n, r) {
							var a = i,
								o = r + n;
							e ^= -1;
							for (var s = r; s < o; s++) e = e >>> 8 ^ a[255 & (e ^ t[s])];
							return e ^ -1
						}
						var i = r();
						t.exports = a
					},
					"zlib/inffast.js": function(e, t, n) {
						"use strict";
						var r = 30,
							a = 12;
						t.exports = function(e, t) {
							var n, i, o, s, l, d, u, c, f, h, p, m, b, g, w, v, y, k, x, _, S, E, L, B, C;
							n = e.state, i = e.next_in, B = e.input, o = i + (e.avail_in - 5), s = e.next_out, C = e.output, l = s - (t - e.avail_out), d = s + (e.avail_out - 257), u = n.dmax, c = n.wsize, f = n.whave, h = n.wnext, p = n.window, m = n.hold, b = n.bits, g = n.lencode, w = n.distcode, v = (1 << n.lenbits) - 1, y = (1 << n.distbits) - 1;
							e: do {
								b < 15 && (m += B[i++] << b, b += 8, m += B[i++] << b, b += 8), k = g[m & v];
								t: for (;;) {
									if (x = k >>> 24, m >>>= x, b -= x, x = k >>> 16 & 255, 0 === x) C[s++] = 65535 & k;
									else {
										if (!(16 & x)) {
											if (0 === (64 & x)) {
												k = g[(65535 & k) + (m & (1 << x) - 1)];
												continue t
											}
											if (32 & x) {
												n.mode = a;
												break e
											}
											e.msg = "invalid literal/length code", n.mode = r;
											break e
										}
										_ = 65535 & k, x &= 15, x && (b < x && (m += B[i++] << b, b += 8), _ += m & (1 << x) - 1, m >>>= x, b -= x), b < 15 && (m += B[i++] << b, b += 8, m += B[i++] << b, b += 8), k = w[m & y];
										n: for (;;) {
											if (x = k >>> 24, m >>>= x, b -= x, x = k >>> 16 & 255, !(16 & x)) {
												if (0 === (64 & x)) {
													k = w[(65535 & k) + (m & (1 << x) - 1)];
													continue n
												}
												e.msg = "invalid distance code", n.mode = r;
												break e
											}
											if (S = 65535 & k, x &= 15, b < x && (m += B[i++] << b, b += 8, b < x && (m += B[i++] << b, b += 8)), S += m & (1 << x) - 1, S > u) {
												e.msg = "invalid distance too far back", n.mode = r;
												break e
											}
											if (m >>>= x, b -= x, x = s - l, S > x) {
												if (x = S - x, x > f && n.sane) {
													e.msg = "invalid distance too far back", n.mode = r;
													break e
												}
												if (E = 0, L = p, 0 === h) {
													if (E += c - x, x < _) {
														_ -= x;
														do C[s++] = p[E++]; while (--x);
														E = s - S, L = C
													}
												} else if (h < x) {
													if (E += c + h - x, x -= h, x < _) {
														_ -= x;
														do C[s++] = p[E++]; while (--x);
														if (E = 0, h < _) {
															x = h, _ -= x;
															do C[s++] = p[E++]; while (--x);
															E = s - S, L = C
														}
													}
												} else if (E += h - x, x < _) {
													_ -= x;
													do C[s++] = p[E++]; while (--x);
													E = s - S, L = C
												}
												for (; _ > 2;) C[s++] = L[E++], C[s++] = L[E++], C[s++] = L[E++], _ -= 3;
												_ && (C[s++] = L[E++], _ > 1 && (C[s++] = L[E++]))
											} else {
												E = s - S;
												do C[s++] = C[E++], C[s++] = C[E++], C[s++] = C[E++], _ -= 3; while (_ > 2);
												_ && (C[s++] = C[E++], _ > 1 && (C[s++] = C[E++]))
											}
											break
										}
									}
									break
								}
							} while (i < o && s < d);
							_ = b >> 3, i -= _, b -= _ << 3, m &= (1 << b) - 1, e.next_in = i, e.next_out = s, e.avail_in = i < o ? 5 + (o - i) : 5 - (i - o), e.avail_out = s < d ? 257 + (d - s) : 257 - (s - d), n.hold = m, n.bits = b
						}
					},
					"zlib/inftrees.js": function(e, t, n) {
						"use strict";
						var r = e("../utils/common"),
							a = 15,
							i = 852,
							o = 592,
							s = 0,
							l = 1,
							d = 2,
							u = [3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258, 0, 0],
							c = [16, 16, 16, 16, 16, 16, 16, 16, 17, 17, 17, 17, 18, 18, 18, 18, 19, 19, 19, 19, 20, 20, 20, 20, 21, 21, 21, 21, 16, 72, 78],
							f = [1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145, 8193, 12289, 16385, 24577, 0, 0],
							h = [16, 16, 16, 16, 17, 17, 18, 18, 19, 19, 20, 20, 21, 21, 22, 22, 23, 23, 24, 24, 25, 25, 26, 26, 27, 27, 28, 28, 29, 29, 64, 64];
						t.exports = function(e, t, n, p, m, b, g, w) {
							var v, y, k, x, _, S, E, L, B, C = w.bits,
								R = 0,
								O = 0,
								U = 0,
								A = 0,
								I = 0,
								N = 0,
								T = 0,
								H = 0,
								D = 0,
								Z = 0,
								z = null,
								F = 0,
								j = new r.Buf16(a + 1),
								M = new r.Buf16(a + 1),
								P = null,
								W = 0;
							for (R = 0; R <= a; R++) j[R] = 0;
							for (O = 0; O < p; O++) j[t[n + O]]++;
							for (I = C, A = a; A >= 1 && 0 === j[A]; A--);
							if (I > A && (I = A), 0 === A) return m[b++] = 20971520, m[b++] = 20971520, w.bits = 1, 0;
							for (U = 1; U < A && 0 === j[U]; U++);
							for (I < U && (I = U), H = 1, R = 1; R <= a; R++)
								if (H <<= 1, H -= j[R], H < 0) return -1;
							if (H > 0 && (e === s || 1 !== A)) return -1;
							for (M[1] = 0, R = 1; R < a; R++) M[R + 1] = M[R] + j[R];
							for (O = 0; O < p; O++) 0 !== t[n + O] && (g[M[t[n + O]]++] = O);
							if (e === s ? (z = P = g, S = 19) : e === l ? (z = u, F -= 257, P = c, W -= 257, S = 256) : (z = f, P = h, S = -1), Z = 0, O = 0, R = U, _ = b, N = I, T = 0, k = -1, D = 1 << I, x = D - 1, e === l && D > i || e === d && D > o) return 1;
							for (;;) {
								E = R - T, g[O] < S ? (L = 0, B = g[O]) : g[O] > S ? (L = P[W + g[O]], B = z[F + g[O]]) : (L = 96, B = 0), v = 1 << R - T, y = 1 << N, U = y;
								do y -= v, m[_ + (Z >> T) + y] = E << 24 | L << 16 | B | 0; while (0 !== y);
								for (v = 1 << R - 1; Z & v;) v >>= 1;
								if (0 !== v ? (Z &= v - 1, Z += v) : Z = 0, O++, 0 === --j[R]) {
									if (R === A) break;
									R = t[n + g[O]]
								}
								if (R > I && (Z & x) !== k) {
									for (0 === T && (T = I), _ += U, N = R - T, H = 1 << N; N + T < A && (H -= j[N + T], !(H <= 0));) N++, H <<= 1;
									if (D += 1 << N, e === l && D > i || e === d && D > o) return 1;
									k = Z & x, m[k] = I << 24 | N << 16 | _ - b | 0
								}
							}
							return 0 !== Z && (m[_ + Z] = R - T << 24 | 64 << 16 | 0), w.bits = I, 0
						}
					}
				};
				for (var n in t) t[n].folder = n.substring(0, n.lastIndexOf("/") + 1);
				var r = function(e) {
						var n = [];
						return e = e.split("/").every(function(e) {
							return ".." == e ? n.pop() : "." == e || "" == e || n.push(e)
						}) ? n.join("/") : null, e ? t[e] || t[e + ".js"] || t[e + "/index.js"] : null
					},
					a = function(e, t) {
						return e ? r(e.folder + "node_modules/" + t) || a(e.parent, t) : null
					},
					i = function(e, t) {
						var n = t.match(/^\//) ? null : e ? t.match(/^\.\.?\//) ? r(e.folder + t) : a(e, t) : r(t);
						if (!n) throw "module not found: " + t;
						return n.exports || (n.parent = e, n(i.bind(null, n), n, n.exports = {})), n.exports
					};
				return i(null, e)
			},
			decompress: function(e) {
				this.exports || (this.exports = this.require("inflate.js"));
				try {
					return this.exports.inflate(e)
				} catch (e) {}
			},
			hasUnityMarker: function(e) {
				var t = 10,
					n = "UnityWeb Compressed Content (gzip)";
				if (t > e.length || 31 != e[0] || 139 != e[1]) return !1;
				var r = e[3];
				if (4 & r) {
					if (t + 2 > e.length) return !1;
					if (t += 2 + e[t] + (e[t + 1] << 8), t > e.length) return !1
				}
				if (8 & r) {
					for (; t < e.length && e[t];) t++;
					if (t + 1 > e.length) return !1;
					t++
				}
				return 16 & r && String.fromCharCode.apply(null, e.subarray(t, t + n.length + 1)) == n + "\0"
			}
		}
	};
	return new Promise(function(e, t) {
		c.SystemInfo.hasWebGL ? c.SystemInfo.hasWasm ? (1 == c.SystemInfo.hasWebGL && c.print('Warning: Your browser does not support "WebGL 2.0" Graphics API, switching to "WebGL 1.0"'), c.startupErrorHandler = t, n(0), c.postRun.push(function() {
			n(1), delete c.startupErrorHandler, e(p)
		}), u()) : t("Your browser does not support WebAssembly.") : t("Your browser does not support WebGL.")
	})
}
