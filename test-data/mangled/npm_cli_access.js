"use strict";

var BB = require("bluebird");

var figgyPudding = require("figgy-pudding");

var libaccess = require("libnpm/access");

var npmConfig = require("./config/figgy-config.js");

var output = require("./utils/output.js");

var otplease = require("./utils/otplease.js");

var path = require("path");

var prefix = require("./npm.js").prefix;

var readPackageJson = BB.promisify(require("read-package-json"));

var usage = require("./utils/usage.js");

var whoami = require("./whoami.js");

module.exports = access;

access.usage = usage("npm access", "npm access public [<package>]\n" + "npm access restricted [<package>]\n" + "npm access grant <read-only|read-write> <scope:team> [<package>]\n" + "npm access revoke <scope:team> [<package>]\n" + "npm access 2fa-required [<package>]\n" + "npm access 2fa-not-required [<package>]\n" + "npm access ls-packages [<user>|<scope>|<scope:team>]\n" + "npm access ls-collaborators [<package> [<user>]]\n" + "npm access edit [<package>]");

access.subcommands = [ "public", "restricted", "grant", "revoke", "ls-packages", "ls-collaborators", "edit", "2fa-required", "2fa-not-required" ];

var AccessConfig = figgyPudding({
    json: {}
});

function UsageError(e) {
    if (e === void 0) {
        e = "";
    }
    throw Object.assign(new Error((e ? "\nUsage: " + e + "\n\n" : "") + access.usage), {
        code: "EUSAGE"
    });
}

access.completion = function(e, r) {
    var a = e.conf.argv.remain;
    if (a.length === 2) {
        return r(null, access.subcommands);
    }
    switch (a[2]) {
      case "grant":
        if (a.length === 3) {
            return r(null, [ "read-only", "read-write" ]);
        } else {
            return r(null, []);
        }

      case "public":
      case "restricted":
      case "ls-packages":
      case "ls-collaborators":
      case "edit":
      case "2fa-required":
      case "2fa-not-required":
        return r(null, []);

      case "revoke":
        return r(null, []);

      default:
        return r(new Error(a[2] + " not recognized"));
    }
};

function access(e, r) {
    var a = e[0], s = e.slice(1);
    return BB.try(function() {
        var e = access.subcommands.includes(a) && access[a];
        if (!a) {
            UsageError("Subcommand is required.");
        }
        if (!e) {
            UsageError(a + " is not a recognized subcommand.");
        }
        return e(s, AccessConfig(npmConfig()));
    }).then(function(e) {
        return r(null, e);
    }, function(e) {
        return e.code === "EUSAGE" ? r(e.message) : r(e);
    });
}

access.public = function(e, r) {
    var a = e[0];
    return modifyPackage(a, r, libaccess.public);
};

access.restricted = function(e, r) {
    var a = e[0];
    return modifyPackage(a, r, libaccess.restricted);
};

access.grant = function(e, s) {
    var c = e[0], n = e[1], t = e[2];
    return BB.try(function() {
        if (!c || c !== "read-only" && c !== "read-write") {
            UsageError("First argument must be either `read-only` or `read-write.`");
        }
        if (!n) {
            UsageError("`<scope:team>` argument is required.");
        }
        var e = n.match(/^@?([^:]+):(.*)$/) || [], r = e[1], a = e[2];
        if (!r && !a) {
            UsageError("Second argument used incorrect format.\n" + "Example: @example:developers");
        }
        return modifyPackage(t, s, function(e, r) {
            return libaccess.grant(e, n, c, r);
        });
    });
};

access.revoke = function(e, s) {
    var c = e[0], n = e[1];
    return BB.try(function() {
        if (!c) {
            UsageError("`<scope:team>` argument is required.");
        }
        var e = c.match(/^@?([^:]+):(.*)$/) || [], r = e[1], a = e[2];
        if (!r || !a) {
            UsageError("First argument used incorrect format.\n" + "Example: @example:developers");
        }
        return modifyPackage(n, s, function(e, r) {
            return libaccess.revoke(e, c, r);
        });
    });
};

access["2fa-required"] = access.tfaRequired = function(e, r) {
    var a = e[0];
    return modifyPackage(a, r, libaccess.tfaRequired, false);
};

access["2fa-not-required"] = access.tfaNotRequired = function(e, r) {
    var a = e[0];
    return modifyPackage(a, r, libaccess.tfaNotRequired, false);
};

access["ls-packages"] = access.lsPackages = function(e, r) {
    var a = e[0];
    return (a ? BB.resolve(a) : BB.fromNode(function(e) {
        return whoami([], true, e);
    })).then(function(e) {
        return libaccess.lsPackages(e, r);
    }).then(function(e) {
        output(JSON.stringify(e, null, 2));
    });
};

access["ls-collaborators"] = access.lsCollaborators = function(e, r) {
    var a = e[0], s = e[1];
    return getPackage(a, false).then(function(e) {
        return libaccess.lsCollaborators(e, s, r);
    }).then(function(e) {
        output(JSON.stringify(e, null, 2));
    });
};

access["edit"] = function() {
    return BB.reject(new Error("edit subcommand is not implemented yet"));
};

function modifyPackage(e, a, s, r) {
    if (r === void 0) {
        r = true;
    }
    return getPackage(e, r).then(function(r) {
        return otplease(a, function(e) {
            return s(r, e);
        });
    });
}

function getPackage(e, r) {
    if (r === void 0) {
        r = true;
    }
    return BB.try(function() {
        if (e && e.trim()) {
            return e.trim();
        } else {
            return readPackageJson(path.resolve(prefix, "package.json")).then(function(e) {
                return e.name;
            }, function(e) {
                if (e.code === "ENOENT") {
                    throw new Error("no package name passed to command and no package.json found");
                } else {
                    throw e;
                }
            });
        }
    }).then(function(e) {
        if (r && !e.match(/^@[^/]+\/.*$/)) {
            UsageError("This command is only available for scoped packages.");
        } else {
            return e;
        }
    });
}
