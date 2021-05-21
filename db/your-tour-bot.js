'use strict';

class MeetingConnect {
  async connect() {
    const connectionPool = require('./database');
    try {
      this.conn = await connectionPool(`mongodb+srv://bot:${process.env.BD_PASSWORD}@${process.env.CLUSTER}`, 'yout-tour-bot');
      this.conn.model('info', require('../models/info'), 'info');
      this.conn.model('cron', require('../models/cron'), 'cron');
      this.conn.model('traveler', require('../models/traveler'), 'traveler');
    } catch (err) {
      console.error('Error occurred during an attempt to establish connection with the database');
      console.error(err);
    }
  }
}

module.exports = new MeetingConnect();
