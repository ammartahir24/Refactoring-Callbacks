"use strict";

function _typeof(e) {
    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
        _typeof = function e(i) {
            return typeof i;
        };
    } else {
        _typeof = function e(i) {
            return i && typeof Symbol === "function" && i.constructor === Symbol && i !== Symbol.prototype ? "symbol" : typeof i;
        };
    }
    return _typeof(e);
}

var semver = require("semver");

var validateLicense = require("validate-npm-package-license");

var hostedGitInfo = require("hosted-git-info");

var isBuiltinModule = require("resolve").isCore;

var depTypes = [ "dependencies", "devDependencies", "optionalDependencies" ];

var extractDescription = require("./extract_description");

var url = require("url");

var typos = require("./typos.json");

var fixer = module.exports = {
    warn: function e() {},
    fixRepositoryField: function e(i) {
        if (i.repositories) {
            this.warn("repositories");
            i.repository = i.repositories[0];
        }
        if (!i.repository) return this.warn("missingRepository");
        if (typeof i.repository === "string") {
            i.repository = {
                type: "git",
                url: i.repository
            };
        }
        var r = i.repository.url || "";
        if (r) {
            var n = hostedGitInfo.fromUrl(r);
            if (n) {
                r = i.repository.url = n.getDefaultRepresentation() == "shortcut" ? n.https() : n.toString();
            }
        }
        if (r.match(/github.com\/[^\/]+\/[^\/]+\.git\.git$/)) {
            this.warn("brokenGitUrl", r);
        }
    },
    fixTypos: function e(i) {
        Object.keys(typos.topLevel).forEach(function(e) {
            if (i.hasOwnProperty(e)) {
                this.warn("typo", e, typos.topLevel[e]);
            }
        }, this);
    },
    fixScriptsField: function e(i) {
        if (!i.scripts) return;
        if (_typeof(i.scripts) !== "object") {
            this.warn("nonObjectScripts");
            delete i.scripts;
            return;
        }
        Object.keys(i.scripts).forEach(function(e) {
            if (typeof i.scripts[e] !== "string") {
                this.warn("nonStringScript");
                delete i.scripts[e];
            } else if (typos.script[e] && !i.scripts[typos.script[e]]) {
                this.warn("typo", e, typos.script[e], "scripts");
            }
        }, this);
    },
    fixFilesField: function e(i) {
        var r = i.files;
        if (r && !Array.isArray(r)) {
            this.warn("nonArrayFiles");
            delete i.files;
        } else if (i.files) {
            i.files = i.files.filter(function(e) {
                if (!e || typeof e !== "string") {
                    this.warn("invalidFilename", e);
                    return false;
                } else {
                    return true;
                }
            }, this);
        }
    },
    fixBinField: function e(i) {
        if (!i.bin) return;
        if (typeof i.bin === "string") {
            var r = {};
            var n;
            if (n = i.name.match(/^@[^/]+[/](.*)$/)) {
                r[n[1]] = i.bin;
            } else {
                r[i.name] = i.bin;
            }
            i.bin = r;
        }
    },
    fixManField: function e(i) {
        if (!i.man) return;
        if (typeof i.man === "string") {
            i.man = [ i.man ];
        }
    },
    fixBundleDependenciesField: function e(i) {
        var r = "bundledDependencies";
        var n = "bundleDependencies";
        if (i[r] && !i[n]) {
            i[n] = i[r];
            delete i[r];
        }
        if (i[n] && !Array.isArray(i[n])) {
            this.warn("nonArrayBundleDependencies");
            delete i[n];
        } else if (i[n]) {
            i[n] = i[n].filter(function(e) {
                if (!e || typeof e !== "string") {
                    this.warn("nonStringBundleDependency", e);
                    return false;
                } else {
                    if (!i.dependencies) {
                        i.dependencies = {};
                    }
                    if (!i.dependencies.hasOwnProperty(e)) {
                        this.warn("nonDependencyBundleDependency", e);
                        i.dependencies[e] = "*";
                    }
                    return true;
                }
            }, this);
        }
    },
    fixDependencies: function e(t, i) {
        var r = !i;
        objectifyDeps(t, this.warn);
        addOptionalDepsToDeps(t, this.warn);
        this.fixBundleDependenciesField(t);
        [ "dependencies", "devDependencies" ].forEach(function(n) {
            if (!(n in t)) return;
            if (!t[n] || _typeof(t[n]) !== "object") {
                this.warn("nonObjectDependencies", n);
                delete t[n];
                return;
            }
            Object.keys(t[n]).forEach(function(e) {
                var i = t[n][e];
                if (typeof i !== "string") {
                    this.warn("nonStringDependency", e, JSON.stringify(i));
                    delete t[n][e];
                }
                var r = hostedGitInfo.fromUrl(t[n][e]);
                if (r) t[n][e] = r.toString();
            }, this);
        }, this);
    },
    fixModulesField: function e(i) {
        if (i.modules) {
            this.warn("deprecatedModules");
            delete i.modules;
        }
    },
    fixKeywordsField: function e(i) {
        if (typeof i.keywords === "string") {
            i.keywords = i.keywords.split(/,\s+/);
        }
        if (i.keywords && !Array.isArray(i.keywords)) {
            delete i.keywords;
            this.warn("nonArrayKeywords");
        } else if (i.keywords) {
            i.keywords = i.keywords.filter(function(e) {
                if (typeof e !== "string" || !e) {
                    this.warn("nonStringKeyword");
                    return false;
                } else {
                    return true;
                }
            }, this);
        }
    },
    fixVersionField: function e(i, r) {
        var n = !r;
        if (!i.version) {
            i.version = "";
            return true;
        }
        if (!semver.valid(i.version, n)) {
            throw new Error('Invalid version: "' + i.version + '"');
        }
        i.version = semver.clean(i.version, n);
        return true;
    },
    fixPeople: function e(i) {
        modifyPeople(i, unParsePerson);
        modifyPeople(i, parsePerson);
    },
    fixNameField: function e(i, r) {
        if (typeof r === "boolean") r = {
            strict: r
        }; else if (typeof r === "undefined") r = {};
        var n = r.strict;
        if (!i.name && !n) {
            i.name = "";
            return;
        }
        if (typeof i.name !== "string") {
            throw new Error("name field must be a string.");
        }
        if (!n) i.name = i.name.trim();
        ensureValidName(i.name, n, r.allowLegacyCase);
        if (isBuiltinModule(i.name)) this.warn("conflictingName", i.name);
    },
    fixDescriptionField: function e(i) {
        if (i.description && typeof i.description !== "string") {
            this.warn("nonStringDescription");
            delete i.description;
        }
        if (i.readme && !i.description) i.description = extractDescription(i.readme);
        if (i.description === undefined) delete i.description;
        if (!i.description) this.warn("missingDescription");
    },
    fixReadmeField: function e(i) {
        if (!i.readme) {
            this.warn("missingReadme");
            i.readme = "ERROR: No README data found!";
        }
    },
    fixBugsField: function e(i) {
        if (!i.bugs && i.repository && i.repository.url) {
            var r = hostedGitInfo.fromUrl(i.repository.url);
            if (r && r.bugs()) {
                i.bugs = {
                    url: r.bugs()
                };
            }
        } else if (i.bugs) {
            var n = /^.+@.*\..+$/;
            if (typeof i.bugs == "string") {
                if (n.test(i.bugs)) i.bugs = {
                    email: i.bugs
                }; else if (url.parse(i.bugs).protocol) i.bugs = {
                    url: i.bugs
                }; else this.warn("nonEmailUrlBugsString");
            } else {
                bugsTypos(i.bugs, this.warn);
                var t = i.bugs;
                i.bugs = {};
                if (t.url) {
                    if (typeof t.url == "string" && url.parse(t.url).protocol) i.bugs.url = t.url; else this.warn("nonUrlBugsUrlField");
                }
                if (t.email) {
                    if (typeof t.email == "string" && n.test(t.email)) i.bugs.email = t.email; else this.warn("nonEmailBugsEmailField");
                }
            }
            if (!i.bugs.email && !i.bugs.url) {
                delete i.bugs;
                this.warn("emptyNormalizedBugs");
            }
        }
    },
    fixHomepageField: function e(i) {
        if (!i.homepage && i.repository && i.repository.url) {
            var r = hostedGitInfo.fromUrl(i.repository.url);
            if (r && r.docs()) i.homepage = r.docs();
        }
        if (!i.homepage) return;
        if (typeof i.homepage !== "string") {
            this.warn("nonUrlHomepage");
            return delete i.homepage;
        }
        if (!url.parse(i.homepage).protocol) {
            i.homepage = "http://" + i.homepage;
        }
    },
    fixLicenseField: function e(i) {
        if (!i.license) {
            return this.warn("missingLicense");
        } else {
            if (typeof i.license !== "string" || i.license.length < 1 || i.license.trim() === "") {
                this.warn("invalidLicense");
            } else {
                if (!validateLicense(i.license).validForNewPackages) this.warn("invalidLicense");
            }
        }
    }
};

function isValidScopedPackageName(e) {
    if (e.charAt(0) !== "@") return false;
    var i = e.slice(1).split("/");
    if (i.length !== 2) return false;
    return i[0] && i[1] && i[0] === encodeURIComponent(i[0]) && i[1] === encodeURIComponent(i[1]);
}

function isCorrectlyEncodedName(e) {
    return !e.match(/[\/@\s\+%:]/) && e === encodeURIComponent(e);
}

function ensureValidName(e, i, r) {
    if (e.charAt(0) === "." || !(isValidScopedPackageName(e) || isCorrectlyEncodedName(e)) || i && !r && e !== e.toLowerCase() || e.toLowerCase() === "node_modules" || e.toLowerCase() === "favicon.ico") {
        throw new Error("Invalid name: " + JSON.stringify(e));
    }
}

function modifyPeople(i, r) {
    if (i.author) i.author = r(i.author);
    [ "maintainers", "contributors" ].forEach(function(e) {
        if (!Array.isArray(i[e])) return;
        i[e] = i[e].map(r);
    });
    return i;
}

function unParsePerson(e) {
    if (typeof e === "string") return e;
    var i = e.name || "";
    var r = e.url || e.web;
    var n = r ? " (" + r + ")" : "";
    var t = e.email || e.mail;
    var s = t ? " <" + t + ">" : "";
    return i + s + n;
}

function parsePerson(e) {
    if (typeof e !== "string") return e;
    var i = e.match(/^([^\(<]+)/);
    var r = e.match(/\(([^\)]+)\)/);
    var n = e.match(/<([^>]+)>/);
    var t = {};
    if (i && i[0].trim()) t.name = i[0].trim();
    if (n) t.email = n[1];
    if (r) t.url = r[1];
    return t;
}

function addOptionalDepsToDeps(e, i) {
    var r = e.optionalDependencies;
    if (!r) return;
    var n = e.dependencies || {};
    Object.keys(r).forEach(function(e) {
        n[e] = r[e];
    });
    e.dependencies = n;
}

function depObjectify(e, i, r) {
    if (!e) return {};
    if (typeof e === "string") {
        e = e.trim().split(/[\n\r\s\t ,]+/);
    }
    if (!Array.isArray(e)) return e;
    r("deprecatedArrayDependencies", i);
    var n = {};
    e.filter(function(e) {
        return typeof e === "string";
    }).forEach(function(e) {
        e = e.trim().split(/(:?[@\s><=])/);
        var i = e.shift();
        var r = e.join("");
        r = r.trim();
        r = r.replace(/^@/, "");
        n[i] = r;
    });
    return n;
}

function objectifyDeps(i, r) {
    depTypes.forEach(function(e) {
        if (!i[e]) return;
        i[e] = depObjectify(i[e], e, r);
    });
}

function bugsTypos(i, r) {
    if (!i) return;
    Object.keys(i).forEach(function(e) {
        if (typos.bugs[e]) {
            r("typo", e, typos.bugs[e], "bugs");
            i[typos.bugs[e]] = i[e];
            delete i[e];
        }
    });
}
