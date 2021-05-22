'use strict';

const { Schema } = require('mongoose');

const { ObjectId } = Schema.Types;

const touristSchema = new Schema({
  _id: ObjectId,
  full_name: String,
  email: String,
  phone_number: String,
  tours: [ObjectId]
});
module.exports = touristSchema;
