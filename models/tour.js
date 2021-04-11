'use strict';

const { Schema, model } = require('mongoose');

const { ObjectId } = Schema.Types;

const tourSchema = new Schema({
  _id: ObjectId,
  tour_name: String,
  beginning_date: Date,
  ending_date: Date,
  duration: Number,
  tourists_quantity: Number,
  tourists: [ObjectId],
  cities: [String]
});
module.exports = model('tour', tourSchema, 'tour');
