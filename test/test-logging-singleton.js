// Copyright IBM Corp. 2016. All Rights Reserved.
// Node module: strong-globalize
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

var g = require('../lib/globalize');
var helper = require('../lib/helper');
var stdout = require('intercept-stdout');
var test = require('tap').test;

helper.setRootDir(__dirname);
g.setDefaultLanguage();

var aliases = [
  {level: 'emergency', err: true, fn: g.emergency},
  {level: 'alert', err: true, fn: g.alert},
  {level: 'critical', err: true, fn: g.critical},
  {level: 'error', err: true, fn: g.error},
  {level: 'warning', err: true, fn: g.warning},
  {level: 'notice', err: false, fn: g.notice},
  {level: 'informational', err: false, fn: g.informational},
  {level: 'debug', err: false, fn: g.debug},
  {level: 'warn', err: true, fn: g.warn},
  {level: 'info', err: false, fn: g.info},
  {level: 'log', err: false, fn: g.log},
  {level: 'help', err: false, fn: g.help},
  {level: 'data', err: false, fn: g.data},
  {level: 'verbose', err: false, fn: g.verbose},
  {level: 'input', err: false, fn: g.input},
  {level: 'prompt', err: false, fn: g.prompt},
];

aliases.forEach(function(alias) {
  var title = alias.level +
    ' (this msg is shown in the console)';
  test(title, function(t) {
    var called = false;
    function myLogCb(level, msg) {
      if (msg.message.indexOf('StrongGlobalize') === 0) return;
      var myLogCbMsg = {level: level, msg: msg};
      t.assert(!called, 'Callback is called once.');
      logTestWithConsoleEnabled(myLogCbMsg, t, alias, title);
      called = true;
    }
    g.setPersistentLogging(myLogCb, false);
    alias.fn(title);
  });
});

function logTestWithConsoleEnabled(myLogCbMsg, t, alias, expectedMsg) {
  var myStdoutMsg = null;
  var myStderrMsg = null;
  function stdoutCb(txt) { myStdoutMsg = txt; }
  function stderrCb(txt) { myStderrMsg = txt; }
  var unhook_intercept = stdout(stdoutCb, stderrCb);
  setTimeout(function() {
    var myStdMsg = alias.err ? myStderrMsg : myStdoutMsg;
    t.comment('myLogCbMsg: %j', myLogCbMsg);
    t.comment('myStdMsg: %s', myStdMsg);
    if (myLogCbMsg && myStdMsg) {
      t.equal(myLogCbMsg.level, alias.level,
        'Persistent logging callback returns the level:' + alias.level);
      t.equal(myLogCbMsg.msg.message, expectedMsg,
        'Persistent logging callback returns the correct message.');
      t.assert(myStdMsg.indexOf(expectedMsg) >= 0,
        (alias.err ? 'Strerr' : 'Stdout') +
        ' shows the correct message for ' + alias.level);
    } else {
      t.fail('Both persistent logging callback and stdout should return.');
    }
    unhook_intercept();
    t.end();
  }, 50);
}

aliases.forEach(function(alias) {
  var title = alias.level + ' (console disabled)';
  test(title, function(t) {
    var called = false;
    function myLogCb(level, msg) {
      if (msg.message.toString().indexOf('StrongGlobalize') === 0) return;
      var myLogCbMsg = {level: level, msg: msg};
      t.assert(!called, 'Callback is called once.');
      logTestWithConsoleDisabled(myLogCbMsg, t, alias, title);
      called = true;
    }
    g.setPersistentLogging(myLogCb, true);
    alias.fn(title);
  });
});

function logTestWithConsoleDisabled(myLogCbMsg, t, alias, expectedMsg) {
  var myStdoutMsg = null;
  var myStderrMsg = null;
  function stdoutCb(txt) { myStdoutMsg = txt; }
  function stderrCb(txt) { myStderrMsg = txt; }
  var unhook_intercept = stdout(stdoutCb, stderrCb);
  setTimeout(function() {
    var myStdMsg = alias.err ? myStderrMsg : myStdoutMsg;
    t.comment('myLogCbMsg: %j', myLogCbMsg);
    t.comment('myStdMsg: %s', myStdMsg);
    if (myLogCbMsg && !myStdMsg) {
      t.equal(myLogCbMsg.level, alias.level,
        'Persistent logging callback returns the level:' + alias.level);
      t.equal(myLogCbMsg.msg.message, expectedMsg,
        'Persistent logging callback returns the correct message.');
      t.assert(!myStdMsg, (alias.err ? 'Strerr' : 'Stdout') +
        ' should not show the message for ' + alias.level);
    } else {
      t.fail('Only persistent logging callback should return.');
    }
    unhook_intercept();
    t.end();
  }, 50);
}
