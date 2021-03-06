// Copyright IBM Corp. 2016. All Rights Reserved.
// Node module: strong-globalize
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

var SG = require('../index');
var helper = require('../lib/helper');
var md5 = require('md5');
var path = require('path');
var test = require('tap').test;
var translate = require('../lib/translate');

test('language mapping for GPB', function(t) {
  helper.enumerateLanguageSync(function(lang) {
    t.equal(
      translate.reverseAdjustLangFromGPB(
        translate.adjustLangForGPB(lang)), lang,
      'Adjust and reversing the lang gives the original.');
  });
  t.end();
});

SG.SetRootDir(__dirname);
SG.SetDefaultLanguage();
var g = SG();

test('register resource tag', function(t) {
  var rootDir = path.resolve(__dirname);
  var lang = helper.ENGLISH;
  var txtFile = 'test-help.txt';
  var currentPath = path.join(rootDir, 'intl', lang, txtFile);
  var hash = helper.msgFileIdHash(txtFile, rootDir);
  var tagType = 'test_tag';
  t.notOk(helper.resTagExists(hash, txtFile, lang, tagType),
    'Res tag should not exist.');
  t.ok(helper.registerResTag(hash, txtFile, lang, tagType),
    'Res tag should be successfully registered.');
  t.ok(helper.resTagExists(hash, txtFile, lang, tagType),
    'Res tag should exist.');
  t.end();
});

test('load message', function(t) {
  var template = 'Error: {url} or {port} is invalid.';
  var message = g.t(template, {url: 'localhost', port: 8123});
  var targetMsg = 'Error: localhost or 8123 is invalid.';
  t.equal(message, targetMsg,
    'Passing no variables returns the template as-is.');
  t.end();
});

test('remove double curly braces', function(t) {
  var source = {msgError: 'Error: {{HTTP}} err.'};
  var targetMsg = 'Error: HTTP err.';
  translate.removeDoubleCurlyBraces(source);
  t.equal(source.msgError, targetMsg,
    'Remove double curly braces.');
  t.end();
});
