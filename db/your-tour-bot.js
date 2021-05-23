'use strict';

const connectionPool = require('./database');
const tourSchema = require('../schemas/your-tour-bot/tour');
const citySchema = require('../schemas/your-tour-bot/city');
const touristSchema = require('../schemas/your-tour-bot/tourist');

const Tour = require('../repositories/your-tour-bot/tour');
const Tourist = require('../repositories/your-tour-bot/tourist');
const City = require('../repositories/your-tour-bot/city');

class MeetingConnect {
  async connect() {
    try {
      this.conn = await connectionPool(`mongodb+srv://bot:${process.env.BD_PASSWORD}@${process.env.CLUSTER}`, 'yout-tour-bot');
      this.conn.model('tour', tourSchema, 'tour');
      this.conn.model('city', citySchema, 'city');
      this.conn.model('tourist', touristSchema, 'tourist');
      Tour.setModel(this.conn.models.tour);
      Tourist.setModel(this.conn.models.tourist);
      City.setModel(this.conn.models.city);
    } catch (err) {
      console.error('Error occurred during an attempt to establish connection with the database');
      console.error(err);
    }
  }
}

module.exports = new MeetingConnect();
