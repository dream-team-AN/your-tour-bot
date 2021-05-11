'use strict';

const { Schema } = require('mongoose');

const { ObjectId } = Schema.Types;

const infoSchema = new Schema({
  _id: ObjectId,
  tour_id: ObjectId,
  date: Date,
  time: String,
  place_name: String,
  place_address: String
}, { versionKey: false });
module.exports = infoSchema;
