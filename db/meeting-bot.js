'use strict';

async function connect() {
  const dotenv = require('dotenv');
  dotenv.config();
  const connectionPool = require('./database');
  try {
    const conn = await connectionPool(`mongodb+srv://bot:${process.env.BD_PASSWORD}@${process.env.CLUSTER}`, 'meeting-bot');
    conn.model('city', require('../models/city'), 'city');
    conn.model('tour', require('../models/tour'), 'tour');
    conn.model('tourist', require('../models/tourist'), 'tourist');
    return conn;
  } catch (err) {
    console.error('Error occurred during an attempt to establish connection with the database');
    console.error(err);
  }
  return null;
}

module.exports = {
  connect
};
