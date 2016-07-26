// Copyright IBM Corp. 2015,2016. All Rights Reserved.
// Node module: strong-globalize
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

'use strict';

var fs = require('fs');
var path = require('path');

exports.removeRedundantCldrFiles = removeRedundantCldrFiles;

function removeRedundantCldrFiles(cldrPath, fileTypeToRemove) {
  var files = null;
  try {
    files = fs.readdirSync(cldrPath);
  } catch (e) {
    return;
  }
  files.forEach(function(file) {
    if (file.indexOf('.') === 0) return;
    var fileType = getTrailerAfterDot(file);
    if (fileType === fileTypeToRemove) {
      fs.unlinkSync(path.join(cldrPath, file));
    }
  });
}

function getTrailerAfterDot(name) {
  if (typeof name !== 'string') return null;
  var parts = name.split('.');
  if (parts.length < 2) return null;
  return parts[parts.length - 1].toLowerCase();
}
