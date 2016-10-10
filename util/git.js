'use strict';

const cp = require('child_process');
const moment = require('moment');

module.exports = (function() {
  return { checkout, subtree, push, del }

  function checkout() {
    return new Promise((resolve, reject) => {
      var ps = cp.spawn('git', ['checkout', 'master']);
      callback(ps, resolve, reject);
    });
  }

  function subtree() {
    return new Promise((resolve, reject) => {
      var ps = cp.spawn('git', ['subtree', 'split', '--prefix', 'dist', '-b', 'gh-pages']);
      callback(ps, resolve, reject);
    });
  }

  function push() {
    return new Promise((resolve, reject) => {
      var ps = cp.spawn('git', ['push', '-f', 'origin', 'gh-pages:gh-pages']);
      callback(ps, resolve, reject);
    });
  }

  function del() {
    return new Promise((resolve, reject) => {
      var ps = cp.spawn('git', ['branch', '-D', 'gh-pages']);
      callback(ps, resolve, reject);
    });
  }

  function callback(ps, resolve, reject) {
    ps.stdout.on('data', function(data) { console.log(data.toString()); });
    ps.stderr.on('data', function(data) { console.log(data.toString()); });
    ps.on('close', function(code) {
      code === 0
        ? resolve()
        : reject({
          ok: false,
          code: 500,
          message: 'Failed push changes.'
        });
    });
  }
})();
