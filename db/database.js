'use strict';

const mongoose = require('mongoose');

module.exports = async function connectionPool(host, db) {
  const opts = {
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
    poolSize: 2
  };
  return await mongoose.createConnection(`${host}/${db}`, opts);
};
