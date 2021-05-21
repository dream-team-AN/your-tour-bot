'use strict';

class MeetingConnect {
  async connect() {
    const connectionPool = require('./database');
    try {
      this.conn = await connectionPool(`mongodb+srv://bot:${process.env.BD_PASSWORD}@${process.env.CLUSTER}`, 'yout-tour-bot');
      this.conn.model('tour', require('../models/tour'), 'tour');
      this.conn.model('city', require('../models/city'), 'city');
      this.conn.model('tourist', require('../models/tourist'), 'tourist');
    } catch (err) {
      console.error('Error occurred during an attempt to establish connection with the database');
      console.error(err);
    }
  }
}

module.exports = new MeetingConnect();
