'use strict';

const connectionPool = require('./database');
const infoSchema = require('../schemas/meeting-bot/info');
const cronSchema = require('../schemas/meeting-bot/cron');
const travelerSchema = require('../schemas/meeting-bot/traveler');

class YourTourConnect {
  async connect() {
    try {
      this.conn = await connectionPool(`mongodb+srv://bot:${process.env.BD_PASSWORD}@${process.env.CLUSTER}`, 'meeting-bot');
      this.conn.model('info', infoSchema, 'info');
      this.conn.model('cron', cronSchema, 'cron');
      this.conn.model('traveler', travelerSchema, 'traveler');
    } catch (err) {
      console.error('Error occurred during an attempt to establish connection with the database');
      console.error(err);
    }
  }
}

module.exports = new YourTourConnect();
