'use strict';

async function connect() {
  const dotenv = require('dotenv');
  dotenv.config();
  const host = `mongodb+srv://bot:${process.env.BD_PASSWORD}@${process.env.CLUSTER}`;
  const connectionPool = require('./database');
  const conn = connectionPool.getConnection(host, 'meeting-bot');
  conn.model('city', require('../models/city'), 'city');
  conn.model('tour', require('../models/tour'), 'tour');
  conn.model('tourist', require('../models/tourist'), 'tourist');
  return conn;
}

module.exports = {
  connect
};
