'use strict';

const { Schema } = require('mongoose');

const { ObjectId } = Schema.Types;

const travelerSchema = new Schema({
  _id: ObjectId,
  chat_id: String,
  name: String,
  state: String,
  command: String
}, { versionKey: false });
module.exports = travelerSchema;
