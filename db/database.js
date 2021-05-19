'use strict';

const { ConnectionPool } = require('./mongoose-connection-pool/index');

module.exports = ConnectionPool({
  poolSize: 2
});
