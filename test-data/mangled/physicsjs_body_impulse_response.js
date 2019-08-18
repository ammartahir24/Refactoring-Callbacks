"use strict";

function _typeof(t) {
    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
        _typeof = function t(e) {
            return typeof e;
        };
    } else {
        _typeof = function t(e) {
            return e && typeof Symbol === "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
        };
    }
    return _typeof(t);
}

(function(t, e) {
    if (typeof define === "function" && define.amd) {
        define([ "physicsjs" ], e);
    } else if ((typeof exports === "undefined" ? "undefined" : _typeof(exports)) === "object") {
        module.exports = e.apply(t, [ "physicsjs" ].map(require));
    } else {
        e.call(t, t.Physics);
    }
})(void 0, function(E) {
    "use strict";
    E.behavior("body-impulse-response", function(o) {
        var s = {
            check: "collisions:detected",
            mtvThreshold: 1,
            bodyExtractDropoff: .5,
            forceWakeupAboveOverlapThreshold: true
        };
        function l(t) {
            return t.uid;
        }
        function D(t, e, o) {
            var s, l;
            l = e.norm();
            s = l - t.proj(e);
            s = Math.max(0, Math.min(l, s));
            if (l === 0) {
                o.zero();
            } else {
                o.clone(e).mult(s / l);
            }
            return o;
        }
        return {
            init: function t(e) {
                o.init.call(this);
                this.options.defaults(s);
                this.options(e);
                this._bodyList = [];
            },
            applyTo: false,
            connect: function t(e) {
                e.on(this.options.check, this.respond, this);
            },
            disconnect: function t(e) {
                e.off(this.options.check, this.respond, this);
            },
            collideBodies: function t(e, o, s, l, a, i) {
                var n = e.treatment === "static" || e.treatment === "kinematic", r = o.treatment === "static" || o.treatment === "kinematic", v = E.scratchpad(), d = v.vector().clone(a);
                if (n && r) {
                    v.done();
                    return;
                }
                var c = n ? 0 : 1 / e.moi, u = r ? 0 : 1 / o.moi, p = n ? 0 : 1 / e.mass, f = r ? 0 : 1 / o.mass, m = e.restitution * o.restitution, h = e.cof * o.cof, y = v.vector().clone(s), b = v.vector().clone(y).perp(), _ = v.vector(), T = v.vector().clone(l), g = v.vector().clone(l).vadd(e.state.pos).vsub(o.state.pos), j = e.state.angular.vel, k = o.state.angular.vel, A = v.vector().clone(o.state.vel).vadd(_.clone(g).perp().mult(k)).vsub(e.state.vel).vsub(_.clone(T).perp().mult(j)), B = T.proj(y), x = T.proj(b), L = g.proj(y), S = g.proj(b), q = A.proj(y), w = A.proj(b), M, I, U, z, C = i;
                if (i) {
                    if (n) {
                        D(o._mtvTotal, d, _);
                        o._mtvTotal.vadd(_);
                    } else if (r) {
                        D(e._mtvTotal, d.negate(), _);
                        e._mtvTotal.vadd(_);
                        d.negate();
                    } else {
                        z = .5;
                        d.mult(z);
                        D(o._mtvTotal, d, _);
                        o._mtvTotal.vadd(_);
                        d.clone(a).mult(z - 1);
                        D(e._mtvTotal, d, _);
                        e._mtvTotal.vadd(_);
                    }
                }
                if (q >= 0) {
                    v.done();
                    return;
                }
                c = c === Infinity ? 0 : c;
                u = u === Infinity ? 0 : u;
                M = -((1 + m) * q) / (p + f + c * x * x + u * S * S);
                if (n) {
                    o.state.vel.vadd(y.mult(M * f));
                    o.state.angular.vel -= M * u * S;
                } else if (r) {
                    e.state.vel.vsub(y.mult(M * p));
                    e.state.angular.vel += M * c * x;
                } else {
                    o.state.vel.vadd(y.mult(M * f));
                    o.state.angular.vel -= M * u * S;
                    e.state.vel.vsub(y.mult(p * o.mass));
                    e.state.angular.vel += M * c * x;
                }
                if (h && w) {
                    U = Math.abs(w) / (p + f + c * B * B + u * L * L);
                    I = w < 0 ? -1 : 1;
                    M = h * Math.abs(M);
                    M = Math.min(M, U);
                    M *= I;
                    if (n) {
                        o.state.vel.vsub(b.mult(M * f));
                        o.state.angular.vel -= M * u * L;
                    } else if (r) {
                        e.state.vel.vadd(b.mult(M * p));
                        e.state.angular.vel += M * c * B;
                    } else {
                        o.state.vel.vsub(b.mult(M * f));
                        o.state.angular.vel -= M * u * L;
                        e.state.vel.vadd(b.mult(p * o.mass));
                        e.state.angular.vel += M * c * B;
                    }
                }
                if (e.sleep()) {
                    e.sleepCheck();
                }
                if (o.sleep()) {
                    o.sleepCheck();
                }
                v.done();
            },
            _pushUniq: function t(e) {
                var o = E.util.sortedIndex(this._bodyList, e, l);
                if (this._bodyList[o] !== e) {
                    this._bodyList.splice(o, 0, e);
                }
            },
            respond: function t(e) {
                var o = this, s, l = e.collisions, a, i, n;
                for (a = 0, i = l.length; a < i; ++a) {
                    s = l[a];
                    this._pushUniq(s.bodyA);
                    this._pushUniq(s.bodyB);
                    s.bodyA._mtvTotal = s.bodyA._mtvTotal || new E.vector();
                    s.bodyB._mtvTotal = s.bodyB._mtvTotal || new E.vector();
                    s.bodyA._oldmtvTotal = s.bodyA._oldmtvTotal || new E.vector();
                    s.bodyB._oldmtvTotal = s.bodyB._oldmtvTotal || new E.vector();
                    o.collideBodies(s.bodyA, s.bodyB, s.norm, s.pos, s.mtv, s.collidedPreviously);
                }
                for (a = 0, i = this._bodyList.length; a < i; ++a) {
                    n = this._bodyList.pop();
                    if (n._mtvTotal.normSq() < this.options.mtvThreshold) {
                        n._mtvTotal.mult(this.options.bodyExtractDropoff);
                    } else if (this.options.forceWakeupAboveOverlapThreshold) {
                        n.sleep(false);
                    }
                    n.state.pos.vadd(n._mtvTotal);
                    n.state.old.pos.vadd(n._mtvTotal);
                    n._oldmtvTotal.swap(n._mtvTotal);
                    n._mtvTotal.zero();
                }
            }
        };
    });
    return E;
});
