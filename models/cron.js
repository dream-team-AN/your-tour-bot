'use strict';

const { Schema } = require('mongoose');

const { ObjectId } = Schema.Types;

const cronSchema = new Schema({
  _id: ObjectId,
  date: Date,
  chat_id: String,
  mins: Number

});
module.exports = cronSchema;
