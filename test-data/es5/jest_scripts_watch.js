"use strict";

//https://github.com/facebook/jest/blob/master/scripts/watch.js

/**
 * Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Watch files for changes and rebuild (copy from 'src/' to `build/`) if changed
 */
var fs = require('fs');

var _require = require('child_process'),
    execSync = _require.execSync;

var path = require('path');

var chalk = require('chalk');

var _require2 = require('./buildUtils'),
    getPackages = _require2.getPackages;

var BUILD_CMD = "node ".concat(path.resolve(__dirname, './build.js'));
var filesToBuild = new Map();

var exists = function exists(filename) {
  try {
    return fs.statSync(filename).isFile();
  } catch (e) {}

  return false;
};

var rebuild = function rebuild(filename) {
  return filesToBuild.set(filename, true);
};

var packages = getPackages();
packages.forEach(function (p) {
  var srcDir = path.resolve(p, 'src');

  try {
    fs.accessSync(srcDir, fs.F_OK);
    fs.watch(srcDir, {
      recursive: true
    }, function (event, filename) {
      var filePath = path.resolve(srcDir, filename);

      if ((event === 'change' || event === 'rename') && exists(filePath)) {
        console.log(chalk.green('->'), "".concat(event, ": ").concat(filename));
        rebuild(filePath);
      } else {
        var buildFile = path.resolve(srcDir, '..', 'build', filename);

        try {
          fs.unlinkSync(buildFile);
          process.stdout.write(chalk.red("  \u2022 ") + path.relative(path.resolve(srcDir, '..', '..'), buildFile) + ' (deleted)' + '\n');
        } catch (e) {}
      }
    });
  } catch (e) {// doesn't exist
  }
});
setInterval(function () {
  var files = Array.from(filesToBuild.keys());

  if (files.length) {
    filesToBuild = new Map();

    try {
      execSync("".concat(BUILD_CMD, " ").concat(files.join(' ')), {
        stdio: [0, 1, 2]
      });
    } catch (e) {}
  }
}, 100);
console.log(chalk.red('->'), chalk.cyan('Watching for changes...'));