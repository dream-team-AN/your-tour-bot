'use strict';

const { Schema } = require('mongoose');

const { ObjectId } = Schema.Types;

const tourSchema = new Schema({
  _id: ObjectId,
  tour_name: String,
  beginning_date: Date,
  ending_date: Date,
  duration: Number,
  tourists_quantity: Number,
  tourists: [ObjectId],
  cities: [
    {
      city_id: ObjectId,
      day: [Number]
    }]
});
module.exports = tourSchema;
