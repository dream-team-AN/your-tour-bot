'use strict';

const connectionPool = require('./database');
const tourSchema = require('../schemas/your-tour-bot/tour');
const citySchema = require('../schemas/your-tour-bot/city');
const touristSchema = require('../schemas/your-tour-bot/tourist');

let conn = null;

try {
  conn = connectionPool(`mongodb+srv://bot:${process.env.BD_PASSWORD}@${process.env.CLUSTER}`, 'your-tour-bot');
  conn.model('tour', tourSchema, 'tour');
  conn.model('city', citySchema, 'city');
  conn.model('tourist', touristSchema, 'tourist');
} catch (err) {
  console.error('Error occurred during an attempt to establish connection with the database');
  console.error(err);
}

module.exports = conn;
