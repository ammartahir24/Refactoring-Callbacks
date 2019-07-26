"use strict";

//https://github.com/electron/electron/blob/master/script/start.js
var cp = require('child_process');

var utils = require('./lib/utils');

var electronPath = utils.getAbsoluteElectronExec();
var child = cp.spawn(electronPath, process.argv.slice(2), {
  stdio: 'inherit'
});
child.on('close', function (code) {
  return process.exit(code);
});

var handleTerminationSignal = function handleTerminationSignal(signal) {
  return process.on(signal, function () {
    if (!child.killed) {
      child.kill(signal);
    }
  });
};

handleTerminationSignal('SIGINT');
handleTerminationSignal('SIGTERM');