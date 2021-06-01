'use strict';

const connectionPool = require('./database');
const infoSchema = require('../schemas/meeting-bot/info');
const cronSchema = require('../schemas/meeting-bot/cron');
const travelerSchema = require('../schemas/meeting-bot/traveler');

let conn = null;

try {
  conn = connectionPool(`mongodb+srv://bot:${process.env.BD_PASSWORD}@${process.env.CLUSTER}`, 'meeting-bot');
  conn.model('info', infoSchema, 'info');
  conn.model('cron', cronSchema, 'cron');
  conn.model('traveler', travelerSchema, 'traveler');
} catch (err) {
  console.error('Error occurred during an attempt to establish connection with the database');
  console.error(err);
}

module.exports = conn;
