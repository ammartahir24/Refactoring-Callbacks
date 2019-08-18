"use strict";

exports.__esModule = true;

exports.deepTargetFind = deepTargetFind;

exports.addListener = addListener;

exports.removeListener = removeListener;

exports.register = register;

exports.setTouchAction = setTouchAction;

exports.prevent = _prevent;

exports.resetMouseCanceller = resetMouseCanceller;

exports.remove = exports.add = exports.findOriginalTarget = exports.recognizers = exports.gestures = void 0;

require("./boot.js");

var _async = require("./async.js");

var _debounce = require("./debounce.js");

var _settings = require("./settings.js");

var _wrap = require("./wrap.js");

function _instanceof(e, t) {
    if (t != null && typeof Symbol !== "undefined" && t[Symbol.hasInstance]) {
        return !!t[Symbol.hasInstance](e);
    } else {
        return e instanceof t;
    }
}

var HAS_NATIVE_TA = typeof document.head.style.touchAction === "string";

var GESTURE_KEY = "__polymerGestures";

var HANDLED_OBJ = "__polymerGesturesHandled";

var TOUCH_ACTION = "__polymerGesturesTouchAction";

var TAP_DISTANCE = 25;

var TRACK_DISTANCE = 5;

var TRACK_LENGTH = 2;

var MOUSE_TIMEOUT = 2500;

var MOUSE_EVENTS = [ "mousedown", "mousemove", "mouseup", "click" ];

var MOUSE_WHICH_TO_BUTTONS = [ 0, 1, 4, 2 ];

var MOUSE_HAS_BUTTONS = function() {
    try {
        return new MouseEvent("test", {
            buttons: 1
        }).buttons === 1;
    } catch (e) {
        return false;
    }
}();

function isMouseEvent(e) {
    return MOUSE_EVENTS.indexOf(e) > -1;
}

var supportsPassive = false;

(function() {
    try {
        var e = Object.defineProperty({}, "passive", {
            get: function e() {
                supportsPassive = true;
            }
        });
        window.addEventListener("test", null, e);
        window.removeEventListener("test", null, e);
    } catch (e) {}
})();

function PASSIVE_TOUCH(e) {
    if (isMouseEvent(e) || e === "touchend") {
        return;
    }
    if (HAS_NATIVE_TA && supportsPassive && _settings.passiveTouchGestures) {
        return {
            passive: true
        };
    } else {
        return;
    }
}

var IS_TOUCH_ONLY = navigator.userAgent.match(/iP(?:[oa]d|hone)|Android/);

var clickedLabels = [];

var labellable = {
    button: true,
    input: true,
    keygen: true,
    meter: true,
    output: true,
    textarea: true,
    progress: true,
    select: true
};

var canBeDisabled = {
    button: true,
    command: true,
    fieldset: true,
    input: true,
    keygen: true,
    optgroup: true,
    option: true,
    select: true,
    textarea: true
};

function canBeLabelled(e) {
    return labellable[e.localName] || false;
}

function matchingLabels(e) {
    var t = Array.prototype.slice.call(e.labels || []);
    if (!t.length) {
        t = [];
        var n = e.getRootNode();
        if (e.id) {
            var r = n.querySelectorAll("label[for = " + e.id + "]");
            for (var o = 0; o < r.length; o++) {
                t.push(r[o]);
            }
        }
    }
    return t;
}

var mouseCanceller = function e(t) {
    var n = t.sourceCapabilities;
    if (n && !n.firesTouchEvents) {
        return;
    }
    t[HANDLED_OBJ] = {
        skip: true
    };
    if (t.type === "click") {
        var r = false;
        var o = getComposedPath(t);
        for (var i = 0; i < o.length; i++) {
            if (o[i].nodeType === Node.ELEMENT_NODE) {
                if (o[i].localName === "label") {
                    clickedLabels.push(o[i]);
                } else if (canBeLabelled(o[i])) {
                    var a = matchingLabels(o[i]);
                    for (var s = 0; s < a.length; s++) {
                        r = r || clickedLabels.indexOf(a[s]) > -1;
                    }
                }
            }
            if (o[i] === POINTERSTATE.mouse.target) {
                return;
            }
        }
        if (r) {
            return;
        }
        t.preventDefault();
        t.stopPropagation();
    }
};

function setupTeardownMouseCanceller(e) {
    var t = IS_TOUCH_ONLY ? [ "click" ] : MOUSE_EVENTS;
    for (var n = 0, r; n < t.length; n++) {
        r = t[n];
        if (e) {
            clickedLabels.length = 0;
            document.addEventListener(r, mouseCanceller, true);
        } else {
            document.removeEventListener(r, mouseCanceller, true);
        }
    }
}

function ignoreMouse(e) {
    if (!_settings.cancelSyntheticClickEvents) {
        return;
    }
    if (!POINTERSTATE.mouse.mouseIgnoreJob) {
        setupTeardownMouseCanceller(true);
    }
    var t = function e() {
        setupTeardownMouseCanceller();
        POINTERSTATE.mouse.target = null;
        POINTERSTATE.mouse.mouseIgnoreJob = null;
    };
    POINTERSTATE.mouse.target = getComposedPath(e)[0];
    POINTERSTATE.mouse.mouseIgnoreJob = _debounce.Debouncer.debounce(POINTERSTATE.mouse.mouseIgnoreJob, _async.timeOut.after(MOUSE_TIMEOUT), t);
}

function hasLeftMouseButton(e) {
    var t = e.type;
    if (!isMouseEvent(t)) {
        return false;
    }
    if (t === "mousemove") {
        var n = e.buttons === undefined ? 1 : e.buttons;
        if (_instanceof(e, window.MouseEvent) && !MOUSE_HAS_BUTTONS) {
            n = MOUSE_WHICH_TO_BUTTONS[e.which] || 0;
        }
        return Boolean(n & 1);
    } else {
        var r = e.button === undefined ? 0 : e.button;
        return r === 0;
    }
}

function isSyntheticClick(e) {
    if (e.type === "click") {
        if (e.detail === 0) {
            return true;
        }
        var t = _findOriginalTarget(e);
        if (!t.nodeType || t.nodeType !== Node.ELEMENT_NODE) {
            return true;
        }
        var n = t.getBoundingClientRect();
        var r = e.pageX, o = e.pageY;
        return !(r >= n.left && r <= n.right && o >= n.top && o <= n.bottom);
    }
    return false;
}

var POINTERSTATE = {
    mouse: {
        target: null,
        mouseIgnoreJob: null
    },
    touch: {
        x: 0,
        y: 0,
        id: -1,
        scrollDecided: false
    }
};

function firstTouchAction(e) {
    var t = "auto";
    var n = getComposedPath(e);
    for (var r = 0, o; r < n.length; r++) {
        o = n[r];
        if (o[TOUCH_ACTION]) {
            t = o[TOUCH_ACTION];
            break;
        }
    }
    return t;
}

function trackDocument(e, t, n) {
    e.movefn = t;
    e.upfn = n;
    document.addEventListener("mousemove", t);
    document.addEventListener("mouseup", n);
}

function untrackDocument(e) {
    document.removeEventListener("mousemove", e.movefn);
    document.removeEventListener("mouseup", e.upfn);
    e.movefn = null;
    e.upfn = null;
}

if (_settings.cancelSyntheticClickEvents) {
    document.addEventListener("touchend", ignoreMouse, supportsPassive ? {
        passive: true
    } : false);
}

var getComposedPath = window.ShadyDOM && window.ShadyDOM.noPatch ? window.ShadyDOM.composedPath : function(e) {
    return e.composedPath && e.composedPath() || [];
};

var gestures = {};

exports.gestures = gestures;

var recognizers = [];

exports.recognizers = recognizers;

function deepTargetFind(e, t) {
    var n = document.elementFromPoint(e, t);
    var r = n;
    while (r && r.shadowRoot && !window.ShadyDOM) {
        var o = r;
        r = r.shadowRoot.elementFromPoint(e, t);
        if (o === r) {
            break;
        }
        if (r) {
            n = r;
        }
    }
    return n;
}

function _findOriginalTarget(e) {
    var t = getComposedPath(e);
    return t.length > 0 ? t[0] : e.target;
}

function _handleNative(e) {
    var t;
    var n = e.type;
    var r = e.currentTarget;
    var o = r[GESTURE_KEY];
    if (!o) {
        return;
    }
    var i = o[n];
    if (!i) {
        return;
    }
    if (!e[HANDLED_OBJ]) {
        e[HANDLED_OBJ] = {};
        if (n.slice(0, 5) === "touch") {
            e = e;
            var a = e.changedTouches[0];
            if (n === "touchstart") {
                if (e.touches.length === 1) {
                    POINTERSTATE.touch.id = a.identifier;
                }
            }
            if (POINTERSTATE.touch.id !== a.identifier) {
                return;
            }
            if (!HAS_NATIVE_TA) {
                if (n === "touchstart" || n === "touchmove") {
                    _handleTouchAction(e);
                }
            }
        }
    }
    t = e[HANDLED_OBJ];
    if (t.skip) {
        return;
    }
    for (var s = 0, u; s < recognizers.length; s++) {
        u = recognizers[s];
        if (i[u.name] && !t[u.name]) {
            if (u.flow && u.flow.start.indexOf(e.type) > -1 && u.reset) {
                u.reset();
            }
        }
    }
    for (var c = 0, f; c < recognizers.length; c++) {
        f = recognizers[c];
        if (i[f.name] && !t[f.name]) {
            t[f.name] = true;
            f[n](e);
        }
    }
}

function _handleTouchAction(e) {
    var t = e.changedTouches[0];
    var n = e.type;
    if (n === "touchstart") {
        POINTERSTATE.touch.x = t.clientX;
        POINTERSTATE.touch.y = t.clientY;
        POINTERSTATE.touch.scrollDecided = false;
    } else if (n === "touchmove") {
        if (POINTERSTATE.touch.scrollDecided) {
            return;
        }
        POINTERSTATE.touch.scrollDecided = true;
        var r = firstTouchAction(e);
        var o = false;
        var i = Math.abs(POINTERSTATE.touch.x - t.clientX);
        var a = Math.abs(POINTERSTATE.touch.y - t.clientY);
        if (!e.cancelable) {} else if (r === "none") {
            o = true;
        } else if (r === "pan-x") {
            o = a > i;
        } else if (r === "pan-y") {
            o = i > a;
        }
        if (o) {
            e.preventDefault();
        } else {
            _prevent("track");
        }
    }
}

function addListener(e, t, n) {
    if (gestures[t]) {
        _add(e, t, n);
        return true;
    }
    return false;
}

function removeListener(e, t, n) {
    if (gestures[t]) {
        _remove(e, t, n);
        return true;
    }
    return false;
}

function _add(e, t, n) {
    var r = gestures[t];
    var o = r.deps;
    var i = r.name;
    var a = e[GESTURE_KEY];
    if (!a) {
        e[GESTURE_KEY] = a = {};
    }
    for (var s = 0, u, c; s < o.length; s++) {
        u = o[s];
        if (IS_TOUCH_ONLY && isMouseEvent(u) && u !== "click") {
            continue;
        }
        c = a[u];
        if (!c) {
            a[u] = c = {
                _count: 0
            };
        }
        if (c._count === 0) {
            e.addEventListener(u, _handleNative, PASSIVE_TOUCH(u));
        }
        c[i] = (c[i] || 0) + 1;
        c._count = (c._count || 0) + 1;
    }
    e.addEventListener(t, n);
    if (r.touchAction) {
        setTouchAction(e, r.touchAction);
    }
}

function _remove(e, t, n) {
    var r = gestures[t];
    var o = r.deps;
    var i = r.name;
    var a = e[GESTURE_KEY];
    if (a) {
        for (var s = 0, u, c; s < o.length; s++) {
            u = o[s];
            c = a[u];
            if (c && c[i]) {
                c[i] = (c[i] || 1) - 1;
                c._count = (c._count || 1) - 1;
                if (c._count === 0) {
                    e.removeEventListener(u, _handleNative, PASSIVE_TOUCH(u));
                }
            }
        }
    }
    e.removeEventListener(t, n);
}

function register(e) {
    recognizers.push(e);
    for (var t = 0; t < e.emits.length; t++) {
        gestures[e.emits[t]] = e;
    }
}

function _findRecognizerByEvent(e) {
    for (var t = 0, n; t < recognizers.length; t++) {
        n = recognizers[t];
        for (var r = 0, o; r < n.emits.length; r++) {
            o = n.emits[r];
            if (o === e) {
                return n;
            }
        }
    }
    return null;
}

function setTouchAction(e, t) {
    if (HAS_NATIVE_TA && _instanceof(e, HTMLElement)) {
        _async.microTask.run(function() {
            e.style.touchAction = t;
        });
    }
    e[TOUCH_ACTION] = t;
}

function _fire(e, t, n) {
    var r = new Event(t, {
        bubbles: true,
        cancelable: true,
        composed: true
    });
    r.detail = n;
    (0, _wrap.wrap)(e).dispatchEvent(r);
    if (r.defaultPrevented) {
        var o = n.preventer || n.sourceEvent;
        if (o && o.preventDefault) {
            o.preventDefault();
        }
    }
}

function _prevent(e) {
    var t = _findRecognizerByEvent(e);
    if (t.info) {
        t.info.prevent = true;
    }
}

function resetMouseCanceller() {
    if (POINTERSTATE.mouse.mouseIgnoreJob) {
        POINTERSTATE.mouse.mouseIgnoreJob.flush();
    }
}

register({
    name: "downup",
    deps: [ "mousedown", "touchstart", "touchend" ],
    flow: {
        start: [ "mousedown", "touchstart" ],
        end: [ "mouseup", "touchend" ]
    },
    emits: [ "down", "up" ],
    info: {
        movefn: null,
        upfn: null
    },
    reset: function e() {
        untrackDocument(this.info);
    },
    mousedown: function e(t) {
        if (!hasLeftMouseButton(t)) {
            return;
        }
        var n = _findOriginalTarget(t);
        var r = this;
        var o = function e(t) {
            if (!hasLeftMouseButton(t)) {
                downupFire("up", n, t);
                untrackDocument(r.info);
            }
        };
        var i = function e(t) {
            if (hasLeftMouseButton(t)) {
                downupFire("up", n, t);
            }
            untrackDocument(r.info);
        };
        trackDocument(this.info, o, i);
        downupFire("down", n, t);
    },
    touchstart: function e(t) {
        downupFire("down", _findOriginalTarget(t), t.changedTouches[0], t);
    },
    touchend: function e(t) {
        downupFire("up", _findOriginalTarget(t), t.changedTouches[0], t);
    }
});

function downupFire(e, t, n, r) {
    if (!t) {
        return;
    }
    _fire(t, e, {
        x: n.clientX,
        y: n.clientY,
        sourceEvent: n,
        preventer: r,
        prevent: function e(t) {
            return _prevent(t);
        }
    });
}

register({
    name: "track",
    touchAction: "none",
    deps: [ "mousedown", "touchstart", "touchmove", "touchend" ],
    flow: {
        start: [ "mousedown", "touchstart" ],
        end: [ "mouseup", "touchend" ]
    },
    emits: [ "track" ],
    info: {
        x: 0,
        y: 0,
        state: "start",
        started: false,
        moves: [],
        addMove: function e(t) {
            if (this.moves.length > TRACK_LENGTH) {
                this.moves.shift();
            }
            this.moves.push(t);
        },
        movefn: null,
        upfn: null,
        prevent: false
    },
    reset: function e() {
        this.info.state = "start";
        this.info.started = false;
        this.info.moves = [];
        this.info.x = 0;
        this.info.y = 0;
        this.info.prevent = false;
        untrackDocument(this.info);
    },
    mousedown: function e(t) {
        if (!hasLeftMouseButton(t)) {
            return;
        }
        var o = _findOriginalTarget(t);
        var i = this;
        var n = function e(t) {
            var n = t.clientX, r = t.clientY;
            if (trackHasMovedEnough(i.info, n, r)) {
                i.info.state = i.info.started ? t.type === "mouseup" ? "end" : "track" : "start";
                if (i.info.state === "start") {
                    _prevent("tap");
                }
                i.info.addMove({
                    x: n,
                    y: r
                });
                if (!hasLeftMouseButton(t)) {
                    i.info.state = "end";
                    untrackDocument(i.info);
                }
                if (o) {
                    trackFire(i.info, o, t);
                }
                i.info.started = true;
            }
        };
        var r = function e(t) {
            if (i.info.started) {
                n(t);
            }
            untrackDocument(i.info);
        };
        trackDocument(this.info, n, r);
        this.info.x = t.clientX;
        this.info.y = t.clientY;
    },
    touchstart: function e(t) {
        var n = t.changedTouches[0];
        this.info.x = n.clientX;
        this.info.y = n.clientY;
    },
    touchmove: function e(t) {
        var n = _findOriginalTarget(t);
        var r = t.changedTouches[0];
        var o = r.clientX, i = r.clientY;
        if (trackHasMovedEnough(this.info, o, i)) {
            if (this.info.state === "start") {
                _prevent("tap");
            }
            this.info.addMove({
                x: o,
                y: i
            });
            trackFire(this.info, n, r);
            this.info.state = "track";
            this.info.started = true;
        }
    },
    touchend: function e(t) {
        var n = _findOriginalTarget(t);
        var r = t.changedTouches[0];
        if (this.info.started) {
            this.info.state = "end";
            this.info.addMove({
                x: r.clientX,
                y: r.clientY
            });
            trackFire(this.info, n, r);
        }
    }
});

function trackHasMovedEnough(e, t, n) {
    if (e.prevent) {
        return false;
    }
    if (e.started) {
        return true;
    }
    var r = Math.abs(e.x - t);
    var o = Math.abs(e.y - n);
    return r >= TRACK_DISTANCE || o >= TRACK_DISTANCE;
}

function trackFire(e, t, n) {
    if (!t) {
        return;
    }
    var r = e.moves[e.moves.length - 2];
    var o = e.moves[e.moves.length - 1];
    var i = o.x - e.x;
    var a = o.y - e.y;
    var s, u = 0;
    if (r) {
        s = o.x - r.x;
        u = o.y - r.y;
    }
    _fire(t, "track", {
        state: e.state,
        x: n.clientX,
        y: n.clientY,
        dx: i,
        dy: a,
        ddx: s,
        ddy: u,
        sourceEvent: n,
        hover: function e() {
            return deepTargetFind(n.clientX, n.clientY);
        }
    });
}

register({
    name: "tap",
    deps: [ "mousedown", "click", "touchstart", "touchend" ],
    flow: {
        start: [ "mousedown", "touchstart" ],
        end: [ "click", "touchend" ]
    },
    emits: [ "tap" ],
    info: {
        x: NaN,
        y: NaN,
        prevent: false
    },
    reset: function e() {
        this.info.x = NaN;
        this.info.y = NaN;
        this.info.prevent = false;
    },
    mousedown: function e(t) {
        if (hasLeftMouseButton(t)) {
            this.info.x = t.clientX;
            this.info.y = t.clientY;
        }
    },
    click: function e(t) {
        if (hasLeftMouseButton(t)) {
            trackForward(this.info, t);
        }
    },
    touchstart: function e(t) {
        var n = t.changedTouches[0];
        this.info.x = n.clientX;
        this.info.y = n.clientY;
    },
    touchend: function e(t) {
        trackForward(this.info, t.changedTouches[0], t);
    }
});

function trackForward(e, t, n) {
    var r = Math.abs(t.clientX - e.x);
    var o = Math.abs(t.clientY - e.y);
    var i = _findOriginalTarget(n || t);
    if (!i || canBeDisabled[i.localName] && i.hasAttribute("disabled")) {
        return;
    }
    if (isNaN(r) || isNaN(o) || r <= TAP_DISTANCE && o <= TAP_DISTANCE || isSyntheticClick(t)) {
        if (!e.prevent) {
            _fire(i, "tap", {
                x: t.clientX,
                y: t.clientY,
                sourceEvent: t,
                preventer: n
            });
        }
    }
}

var findOriginalTarget = _findOriginalTarget;

exports.findOriginalTarget = findOriginalTarget;

var add = addListener;

exports.add = add;

var remove = removeListener;

exports.remove = remove;
