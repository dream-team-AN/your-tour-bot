'use strict';

const connectionPool = require('./database');
const tourSchema = require('../schemas/tour');
const citySchema = require('../schemas/city');
const touristSchema = require('../schemas/tourist');

class MeetingConnect {
  async connect() {
    try {
      this.conn = await connectionPool(`mongodb+srv://bot:${process.env.BD_PASSWORD}@${process.env.CLUSTER}`, 'yout-tour-bot');
      this.conn.model('tour', tourSchema, 'tour');
      this.conn.model('city', citySchema, 'city');
      this.conn.model('tourist', touristSchema, 'tourist');
    } catch (err) {
      console.error('Error occurred during an attempt to establish connection with the database');
      console.error(err);
    }
  }
}

module.exports = new MeetingConnect();
