'use strict';

let conn;

async function connect() {
  const connectionPool = require('./database');
  try {
    conn = await connectionPool(`mongodb+srv://bot:${process.env.BD_PASSWORD}@${process.env.CLUSTER}`, 'meeting-bot');
    conn.model('info', require('../models/info'), 'info');
    conn.model('cron', require('../models/cron'), 'cron');
    conn.model('traveler', require('../models/traveler'), 'traveler');
    return conn;
  } catch (err) {
    console.error('Error occurred during an attempt to establish connection with the database');
    console.error(err);
  }
  return null;
}

module.exports = {
  connect,
  conn
};
