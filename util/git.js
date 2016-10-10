'use strict';

const cp = require('child_process');
const moment = require('moment');

module.exports = (function() {
  return { add, commit, push }

  function add() {
    return new Promise((resolve, reject) => {
      var ps = cp.spawn('git', ['add', '.']);

      ps.stdout.on('data', function(data) { console.log(data.toString()); });
      ps.stderr.on('data', function(data) { console.log(data.toString()); });
      ps.on('close', function(code) {
        code === 0
          ? resolve()
          : reject({
            ok: false,
            code: 500,
            message: 'Failed to add all.'
          });
      });
    });
  }

  function commit() {
    return new Promise((resolve, reject) => {
      var ts = moment().format('YYYY-MM-DD H:mm:ss');
      var ps = cp.spawn('git', ['commit', '-m', ts]);

      ps.stdout.on('data', function(data) { console.log(data.toString()); });
      ps.stderr.on('data', function(data) { console.log(data.toString()); });
      ps.on('close', function(code) {
        code === 0
          ? resolve()
          : reject({
            ok: false,
            code: 500,
            message: 'Failed to commit.'
          });
      });
    });
  }

  function push() {
    return new Promise((resolve, reject) => {
      var ps = cp.spawn('git', ['subtree', 'push', '--prefix', 'dist', 'origin', 'site']);

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
    });
  }
})();
