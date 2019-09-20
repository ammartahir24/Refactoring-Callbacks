'use strict';
/* eslint-disable standard/no-callback-literal */

var BB = require('bluebird');

var figgyPudding = require('figgy-pudding');

var libaccess = require('libnpm/access');

var npmConfig = require('./config/figgy-config.js');

var output = require('./utils/output.js');

var otplease = require('./utils/otplease.js');

var path = require('path');

var prefix = require('./npm.js').prefix;

var readPackageJson = BB.promisify(require('read-package-json'));

var usage = require('./utils/usage.js');

var whoami = require('./whoami.js');

module.exports = access;
access.usage = usage('npm access', 'npm access public [<package>]\n' + 'npm access restricted [<package>]\n' + 'npm access grant <read-only|read-write> <scope:team> [<package>]\n' + 'npm access revoke <scope:team> [<package>]\n' + 'npm access 2fa-required [<package>]\n' + 'npm access 2fa-not-required [<package>]\n' + 'npm access ls-packages [<user>|<scope>|<scope:team>]\n' + 'npm access ls-collaborators [<package> [<user>]]\n' + 'npm access edit [<package>]');
access.subcommands = ['public', 'restricted', 'grant', 'revoke', 'ls-packages', 'ls-collaborators', 'edit', '2fa-required', '2fa-not-required'];
var AccessConfig = figgyPudding({
  json: {}
});

function UsageError(msg) {
  if (msg === void 0) {
    msg = '';
  }

  throw Object.assign(new Error((msg ? "\nUsage: " + msg + "\n\n" : '') + access.usage), {
    code: 'EUSAGE'
  });
}

access.completion = function (opts, cb) {
  var argv = opts.conf.argv.remain;

  if (argv.length === 2) {
    return cb(null, access.subcommands);
  }

  switch (argv[2]) {
    case 'grant':
      if (argv.length === 3) {
        return cb(null, ['read-only', 'read-write']);
      } else {
        return cb(null, []);
      }

    case 'public':
    case 'restricted':
    case 'ls-packages':
    case 'ls-collaborators':
    case 'edit':
    case '2fa-required':
    case '2fa-not-required':
      return cb(null, []);

    case 'revoke':
      return cb(null, []);

    default:
      return cb(new Error(argv[2] + ' not recognized'));
  }
};

function access(_ref, cb) {
  var cmd = _ref[0],
      args = _ref.slice(1);

  return BB.try(function () {
    var fn = access.subcommands.includes(cmd) && access[cmd];

    if (!cmd) {
      UsageError('Subcommand is required.');
    }

    if (!fn) {
      UsageError(cmd + " is not a recognized subcommand.");
    }

    return fn(args, AccessConfig(npmConfig()));
  }).then(function (x) {
    return cb(null, x);
  }, function (err) {
    return err.code === 'EUSAGE' ? cb(err.message) : cb(err);
  });
}

access.public = function (_ref2, opts) {
  var pkg = _ref2[0];
  return modifyPackage(pkg, opts, libaccess.public);
};

access.restricted = function (_ref3, opts) {
  var pkg = _ref3[0];
  return modifyPackage(pkg, opts, libaccess.restricted);
};

access.grant = function (_ref4, opts) {
  var perms = _ref4[0],
      scopeteam = _ref4[1],
      pkg = _ref4[2];
  return BB.try(function () {
    if (!perms || perms !== 'read-only' && perms !== 'read-write') {
      UsageError('First argument must be either `read-only` or `read-write.`');
    }

    if (!scopeteam) {
      UsageError('`<scope:team>` argument is required.');
    }

    var _ref5 = scopeteam.match(/^@?([^:]+):(.*)$/) || [],
        scope = _ref5[1],
        team = _ref5[2];

    if (!scope && !team) {
      UsageError('Second argument used incorrect format.\n' + 'Example: @example:developers');
    }

    return modifyPackage(pkg, opts, function (pkgName, opts) {
      return libaccess.grant(pkgName, scopeteam, perms, opts);
    });
  });
};

access.revoke = function (_ref6, opts) {
  var scopeteam = _ref6[0],
      pkg = _ref6[1];
  return BB.try(function () {
    if (!scopeteam) {
      UsageError('`<scope:team>` argument is required.');
    }

    var _ref7 = scopeteam.match(/^@?([^:]+):(.*)$/) || [],
        scope = _ref7[1],
        team = _ref7[2];

    if (!scope || !team) {
      UsageError('First argument used incorrect format.\n' + 'Example: @example:developers');
    }

    return modifyPackage(pkg, opts, function (pkgName, opts) {
      return libaccess.revoke(pkgName, scopeteam, opts);
    });
  });
};

access['2fa-required'] = access.tfaRequired = function (_ref8, opts) {
  var pkg = _ref8[0];
  return modifyPackage(pkg, opts, libaccess.tfaRequired, false);
};

access['2fa-not-required'] = access.tfaNotRequired = function (_ref9, opts) {
  var pkg = _ref9[0];
  return modifyPackage(pkg, opts, libaccess.tfaNotRequired, false);
};

access['ls-packages'] = access.lsPackages = function (_ref10, opts) {
  var owner = _ref10[0];
  return (owner ? BB.resolve(owner) : BB.fromNode(function (cb) {
    return whoami([], true, cb);
  })).then(function (owner) {
    return libaccess.lsPackages(owner, opts);
  }).then(function (pkgs) {
    // TODO - print these out nicely (breaking change)
    output(JSON.stringify(pkgs, null, 2));
  });
};

access['ls-collaborators'] = access.lsCollaborators = function (_ref11, opts) {
  var pkg = _ref11[0],
      usr = _ref11[1];
  return getPackage(pkg, false).then(function (pkgName) {
    return libaccess.lsCollaborators(pkgName, usr, opts);
  }).then(function (collabs) {
    // TODO - print these out nicely (breaking change)
    output(JSON.stringify(collabs, null, 2));
  });
};

access['edit'] = function () {
  return BB.reject(new Error('edit subcommand is not implemented yet'));
};

function modifyPackage(pkg, opts, fn, requireScope) {
  if (requireScope === void 0) {
    requireScope = true;
  }

  return getPackage(pkg, requireScope).then(function (pkgName) {
    return otplease(opts, function (opts) {
      return fn(pkgName, opts);
    });
  });
}

function getPackage(name, requireScope) {
  if (requireScope === void 0) {
    requireScope = true;
  }

  return BB.try(function () {
    if (name && name.trim()) {
      return name.trim();
    } else {
      return readPackageJson(path.resolve(prefix, 'package.json')).then(function (data) {
        return data.name;
      }, function (err) {
        if (err.code === 'ENOENT') {
          throw new Error('no package name passed to command and no package.json found');
        } else {
          throw err;
        }
      });
    }
  }).then(function (name) {
    if (requireScope && !name.match(/^@[^/]+\/.*$/)) {
      UsageError('This command is only available for scoped packages.');
    } else {
      return name;
    }
  });
}