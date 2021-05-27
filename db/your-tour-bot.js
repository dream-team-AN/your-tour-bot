/* eslint-disable no-console */

'use strict';

const mongoose = require('mongoose');
const connectionPool = require('./database');
const tourSchema = require('../schemas/your-tour-bot/tour');
const citySchema = require('../schemas/your-tour-bot/city');
const touristSchema = require('../schemas/your-tour-bot/tourist');

const { Admin } = mongoose.mongo;

let conn = null;

try {
  conn = connectionPool(`mongodb+srv://bot:${process.env.BD_PASSWORD}@${process.env.CLUSTER}`, 'yout-tour-bot');
  conn.model('tour', tourSchema, 'tour');
  conn.model('city', citySchema, 'city');
  conn.model('tourist', touristSchema, 'tourist');

  conn.on('open', () => {
    // connection established
    new Admin(conn.db).listDatabases((err, result) => {
      console.log('listDatabases succeeded');
      // database list stored in result.databases
      const allDatabases = result.databases;
      console.log(allDatabases);
    });
    conn.models.tourist.find({}, (err, docs) => {
      if (err) return console.error(err);

      console.log(docs);
      return docs;
    });
  });
} catch (err) {
  console.error('Error occurred during an attempt to establish connection with the database');
  console.error(err);
}

module.exports = conn;
