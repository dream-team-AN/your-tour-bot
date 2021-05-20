'use strict';

module.exports = async function connectionPool(host, db) {
  const mongoose = require('mongoose');
  const opts = {
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
    poolSize: 4
  };
  return mongoose.createConnection(`${host}/${db}`, opts);
};
