'use strict';

module.exports = async function connectionPool(host, db) {
  const mongoose = require('mongoose');
  const opts = {
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  };
  return mongoose.createConnection(`${host}/${db}?poolSize=${2}`, opts);
};
