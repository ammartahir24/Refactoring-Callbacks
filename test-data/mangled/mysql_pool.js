"use strict";

function _typeof(n) {
    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
        _typeof = function n(o) {
            return typeof o;
        };
    } else {
        _typeof = function n(o) {
            return o && typeof Symbol === "function" && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
        };
    }
    return _typeof(n);
}

var mysql = require("../");

var Connection = require("./Connection");

var EventEmitter = require("events").EventEmitter;

var Util = require("util");

var PoolConnection = require("./PoolConnection");

module.exports = Pool;

Util.inherits(Pool, EventEmitter);

function Pool(n) {
    EventEmitter.call(this);
    this.config = n.config;
    this.config.connectionConfig.pool = this;
    this._acquiringConnections = [];
    this._allConnections = [];
    this._freeConnections = [];
    this._connectionQueue = [];
    this._closed = false;
}

Pool_prototype_getConnection = function(e) {
    if (this._closed) {
        var n = new Error("Pool is closed.");
        n.code = "POOL_CLOSED";
        process.nextTick(function() {
            e(n);
        });
        return;
    }
    var i;
    var t = this;
    if (this._freeConnections.length > 0) {
        i = this._freeConnections.shift();
        this.acquireConnection(i, e);
        return;
    }
    if (this.config.connectionLimit === 0 || this._allConnections.length < this.config.connectionLimit) {
        i = new PoolConnection(this, {
            config: this.config.newConnectionConfig()
        });
        this._acquiringConnections.push(i);
        this._allConnections.push(i);
        i.connect({
            timeout: this.config.acquireTimeout
        }, function n(o) {
            spliceConnection(t._acquiringConnections, i);
            if (t._closed) {
                o = new Error("Pool is closed.");
                o.code = "POOL_CLOSED";
            }
            if (o) {
                t._purgeConnection(i);
                e(o);
                return;
            }
            t.emit("connection", i);
            t.emit("acquire", i);
            e(null, i);
        });
        return;
    }
    if (!this.config.waitForConnections) {
        process.nextTick(function() {
            var n = new Error("No connections available.");
            n.code = "POOL_CONNLIMIT";
            e(n);
        });
        return;
    }
    this._enqueueCallback(e);
};

Pool_prototype_acquireConnection = function n(o, e) {
    if (o._pool !== this) {
        throw new Error("Connection acquired from wrong pool.");
    }
    var i = this._needsChangeUser(o);
    var t = this;
    this._acquiringConnections.push(o);
    function c(n) {
        spliceConnection(t._acquiringConnections, o);
        if (t._closed) {
            n = new Error("Pool is closed.");
            n.code = "POOL_CLOSED";
        }
        if (n) {
            t._connectionQueue.unshift(e);
            t._purgeConnection(o);
            return;
        }
        if (i) {
            t.emit("connection", o);
        }
        t.emit("acquire", o);
        e(null, o);
    }
    if (i) {
        o.config = this.config.newConnectionConfig();
        o.changeUser({
            timeout: this.config.acquireTimeout
        }, c);
    } else {
        o.ping({
            timeout: this.config.acquireTimeout
        }, c);
    }
};

Pool_prototype_releaseConnection = function n(o) {
    if (this._acquiringConnections.indexOf(o) !== -1) {
        return;
    }
    if (o._pool) {
        if (o._pool !== this) {
            throw new Error("Connection released to wrong pool");
        }
        if (this._freeConnections.indexOf(o) !== -1) {
            throw new Error("Connection already released");
        } else {
            this._freeConnections.push(o);
            this.emit("release", o);
        }
    }
    if (this._closed) {
        this._connectionQueue.splice(0).forEach(function(n) {
            var o = new Error("Pool is closed.");
            o.code = "POOL_CLOSED";
            process.nextTick(function() {
                n(o);
            });
        });
    } else if (this._connectionQueue.length) {
        this.getConnection(this._connectionQueue.shift());
    }
};

Pool_prototype_end = function(o) {
    this._closed = true;
    if (typeof o !== "function") {
        o = function n(o) {
            if (o) throw o;
        };
    }
    var e = false;
    var i = 0;
    function n(n) {
        if (!e && (n || --i <= 0)) {
            e = true;
            o(n);
        }
    }
    while (this._allConnections.length !== 0) {
        i++;
        this._purgeConnection(this._allConnections[0], n);
    }
    if (i === 0) {
        process.nextTick(n);
    }
};

Pool_prototype_query = function(n, o, e) {
    var i = Connection.createQuery(n, o, e);
    if (!(_typeof(n) === "object" && "typeCast" in n)) {
        i.typeCast = this.config.connectionConfig.typeCast;
    }
    if (this.config.connectionConfig.trace) {
        i._callSite = new Error();
    }
    this.getConnection(function(n, o) {
        if (n) {
            i.on("error", function() {});
            i.end(n);
            return;
        }
        i.once("end", function() {
            o.release();
        });
        o.query(i);
    });
    return i;
};

Pool_prototype__enqueueCallback = function n(o) {
    if (this.config.queueLimit && this._connectionQueue.length >= this.config.queueLimit) {
        process.nextTick(function() {
            var n = new Error("Queue limit reached.");
            n.code = "POOL_ENQUEUELIMIT";
            o(n);
        });
        return;
    }
    var e = process.domain ? process.domain.bind(o) : o;
    this._connectionQueue.push(e);
    this.emit("enqueue");
};

Pool_prototype__needsChangeUser = function n(o) {
    var e = o.config;
    var i = this.config.connectionConfig;
    return e.user !== i.user || e.database !== i.database || e.password !== i.password || e.charsetNumber !== i.charsetNumber;
};

Pool_prototype__purgeConnection = function n(o, e) {
    var i = e || function() {};
    if (o.state === "disconnected") {
        o.destroy();
    }
    this._removeConnection(o);
    if (o.state !== "disconnected" && !o._protocol._quitSequence) {
        o._realEnd(i);
        return;
    }
    process.nextTick(i);
};

Pool_prototype__removeConnection = function(n) {
    n._pool = null;
    spliceConnection(this._allConnections, n);
    spliceConnection(this._freeConnections, n);
    this.releaseConnection(n);
};

Pool_prototype_escape = function(n) {
    return mysql.escape(n, this.config.connectionConfig.stringifyObjects, this.config.connectionConfig.timezone);
};

Pool_prototype_escapeId = function n(o) {
    return mysql.escapeId(o, false);
};

function spliceConnection(n, o) {
    var e;
    if ((e = n.indexOf(o)) !== -1) {
        n.splice(e, 1);
    }
}
