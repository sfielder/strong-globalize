// Copyright IBM Corp. 2016. All Rights Reserved.
// Node module: strong-globalize
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

var async = require('async');
var f = require('util').format;
var helper = require('../lib/helper');
var loadMsgHelper = require('./load-msg-helper');
var test = require('tap').test;

var wellKnownLangs = loadMsgHelper.wellKnownLangs;
var secondaryMgr = loadMsgHelper.secondaryMgr;

var cluster = require('cluster');

test('secondary test on forking', function(t) {
  if (cluster.isMaster && !process.argv[2]) {
    var msg = f('Master is %s', process.pid);
    console.log(msg);
    cluster.setupMaster({
      exec: __filename,
      args: ['second_invoke'],
      silent: false,
    });
    cluster.fork();
    cluster.on('online', function(worker) {
      msg = f('Worker %s has started', worker.process.pid);
      console.log(msg);
    });
    cluster.on('exit', function(worker) {
      msg = f('Worker %s has completed', worker.process.pid);
      console.log(msg);
      t.end();
    });
  } else if (cluster.isWorker) {
    t.equal(process.argv[2], 'second_invoke', 'worker in the second invoke');
    async.forEachOfSeries(wellKnownLangs, function(lang, ix, callback) {
      secondaryMgr(__dirname, lang, t, helper.AML_ALL, true,
        function() {
          t.pass('secondaryMgr succeeds for ' + lang);
          callback();
        });
    }, function(err) {
      if (err) t.fail('language iteration failed.');
      else t.pass('language iteration succeeds.');
      t.end();
      process.exit(0);
    });
  } else {
    t.pass('default case');
    t.end();
  }
});

