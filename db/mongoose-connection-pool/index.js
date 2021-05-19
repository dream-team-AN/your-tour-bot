/* eslint-disable no-prototype-builtins */
/* eslint-disable sonarjs/cognitive-complexity */

'use strict';

const mongoose = require('mongoose');

const ConnectionPool = (options) => {
  const connections = {};
  const defaults = {
    poolSize: 5,
    expiryPeriod: 300000,
    checkPeriod: 60000
  };
  let opt = {};

  if (typeof options === 'undefined' || options === null) {
    opt = defaults;
  } else {
    for (const key in defaults) {
      if (defaults.hasOwnProperty(key)) {
        opt[key] = (typeof options[key] !== 'undefined'
            && options[key] !== null) ? options[key] : defaults[key];
      }
    }
  }

  const establishConnection = (host, db) => {
    const conn = mongoose.createConnection(`${host}/${db}?poolSize=${
      opt.poolSize}`);
    const now = new Date();

    connections[host] = connections[host] || {};
    connections[host][db] = connections[host][db] || {};

    connections[host][db].created = connections[host][db].created || now;
    connections[host][db].conn = conn;
    connections[host][db].lastUsed = now;

    return conn;
  };

  const cull = () => {
    const now = new Date();
    for (const host in connections) {
      if (connections.hasOwnProperty(host)) {
        for (const db in connections[host]) {
          // Kill any connections that haven't been used in expiryPeriod
          if (connections[host].hasOwnProperty(db)
                && (typeof connections[host][db].lastUsed === 'undefined'
                || connections[host][db].lastUsed === null
                || now - connections[host][db].lastUsed > opt.expiryPeriod)) {
            delete connections[host][db];
          }
        }
      }
    }
  };

  this.getConnection = (host, db) => {
    if (typeof connections[host] === 'undefined'
        || connections[host] === null
        || typeof connections[host][db] === 'undefined'
        || connections[host][db] === null
        || typeof connections[host][db].conn === 'undefined'
        || connections[host][db].conn === null) {
      return establishConnection(host, db);
    }

    const now = new Date();
    connections[host][db].lastUsed = now;

    return connections[host][db].conn;
  };

  // Check for any inactive connections once per checkPeriod
  setInterval(cull, opt.checkPeriod);
  return this;
};

module.exports = {
  ConnectionPool
};
