"use strict";

var mongoose = require("mongoose"), l = require("lodash"), async = require("async"), cfg = require("../../config"), mailer = require("../utils/mailer");

var module_exports_notifyRequesters = function(o, t) {
    var e = mongoose.model("Request");
    e.findOne({
        $or: [ {
            "project.ref": o._id
        }, {
            "project.githubId": o.githubId
        } ],
        satisfied: false
    }).populate("supporters").exec(function(e, r) {
        if (e) return t("Failed to get requests for project");
        if (!r) return t();
        async.each(r.supporters, function(e, r) {
            if (!e.email) return r(null);
            mailer.send("donate-request-satisfied", [ "Your donate methods request for project", o.owner.username + " / " + o.name, "satisfied" ].join(" "), e.email, {
                project: o
            }, r);
        }, function(e) {
            if (e) return t("Failed to get requests for project");
            r.satisfied = true;
            r.project.methodsSet = true;
            r.project.methodsSetAt = new Date();
            r.save(t);
        });
    });
};

var module_exports_notifySupport = function(e, r, o, t) {
    var n = r.owner.org || r.owner.user || null;
    mailer.send("donate-request-support", [ "Donate methods request from", o ? o.username : "anonymous", "for ", n ? "maintaining" : "unclaimed", " project ", r.owner.username + " / " + r.name ].join(" "), cfg.emails.to, {
        user: o,
        project: r,
        owner: n
    }, t);
};

var module_exports_notifyMaintainer = function(e, r, o, t) {
    mailer.send("donate-request-maintainer", [ "Donate methods request from", o ? o.username : "anonymous", "for your project ", r.owner.username + " / " + r.name ].join(" "), e.maintainer.email, {
        user: o,
        project: r
    }, t);
};

var module_exports_supportNotifyMaintainer = function(e, r) {
    var o = l.filter(e.supporters, function(e) {
        return !e.isAnon;
    }), t = l.filter(e.supporters, function(e) {
        return e.isAnon;
    }), n = o.length, s = t.length;
    mailer.send("donate-request-notify-maintainer", "Donate methods request from I Love Open Source for your project " + e.project.ref.owner.username + " / " + e.project.ref.name, e.maintainer.email, {
        request: e,
        project: e.project.ref,
        users: o,
        usersCount: n,
        anonsCount: s,
        totalCount: n + s
    }, r);
};
