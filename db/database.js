'use strict';

module.exports = async function connectionPool(host, db) {
  const mongoose = require('mongoose');
  return mongoose.createConnection(`${host}/${db}?poolSize=${2}`);
};
