'use strict';

const { Schema, model } = require('mongoose');

const { ObjectId } = Schema.Types;

const touristSchema = new Schema({
  _id: ObjectId,
  full_name: String,
  email: String,
  phone_number: String,
  tours: [ObjectId]
});
module.exports = model('tourist', touristSchema, 'tourist');
