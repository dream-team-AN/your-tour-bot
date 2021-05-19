'use strict';

async function connect() {
  const dotenv = require('dotenv');
  dotenv.config();
  const host = `mongodb+srv://bot:${process.env.BD_PASSWORD}@${process.env.CLUSTER}`;
  const connectionPool = require('./database');
  const conn = connectionPool.getConnection(host, 'meeting-bot');
  conn.model('info', require('../models/info'), 'info');
  conn.model('traveler', require('../models/traveler'), 'traveler');
  conn.model('cron', require('../models/cron'), 'cron');
  return conn;
}

module.exports = {
  connect
};
