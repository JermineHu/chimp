#!/usr/bin/env node
'use strict';

var Chimp = require('../lib/chimp.js'),
    minimist = require('minimist'),
    freeport = require('freeport'),
    exit = require('exit'),
    log = require('../lib/log'),
    fs = require('fs'),
    _ = require('underscore'),
    path = require('path'),
    optionsLoader = require('../lib/options-loader');

// Make babel plugins available to Cucumber and Mocha child processes
process.env.NODE_PATH += path.delimiter + path.resolve(__dirname, '../../node_modules') + path.delimiter + path.resolve(__dirname, '../../../../node_modules');

var argv = minimist(process.argv, {
  default: optionsLoader.getOptions(),
  boolean: [
  // - - - - CHIMP - - - -
  'watch', 'watchWithPolling', 'server', 'sync', 'offline',

  // - - - - CUCUMBER - - - -
  'singleSnippetPerFile', 'chai', 'screenshotsOnError', 'captureAllStepScreenshots', 'saveScreenshotsToDisk', 'saveScreenshotsToReport',

  // - - - - SELENIUM  - - - -

  // - - - - WEBDRIVER-IO  - - - -
  'chromeNoSandbox',

  // - - - - SESSION-MANAGER  - - - -
  'noSessionReuse', 'browserstackLocal',

  // - - - - SIMIAN  - - - -

  // - - - - MOCHA  - - - -
  'mocha',

  // - - - - METEOR  - - - -

  // - - - - DEBUGGING  - - - -
  'debug']
});

if (argv.host && (argv.host.indexOf('sauce') !== -1 || argv.host.indexOf('browserstack') !== -1)) {
  argv.noSessionReuse = true;
}

if (argv.deviceName) {
  argv.browser = '';
}

try {
  if (!argv.port) {
    freeport(function (error, port) {
      if (error) {
        throw error;
      }
      argv.port = port;
      global.chimp = startChimp(argv);
    });
  } else {
    global.chimp = startChimp(argv);
  }
} catch (ex) {
  process.stderr.write(ex.stack + '\n');
  exit(2);
}

function startChimp(options) {
  var chimp = new Chimp(options);
  chimp.init(function (err) {
    if (err) {
      log.error(err);
      log.debug('Error in chimp init', err);
    }
    exit(err ? 2 : 0);
  });
  return chimp;
}