'use strict';

const mongoose = require('mongoose');
const conn = require('../../db/meeting-bot');

class Traveler {
  constructor() {
    this.model = conn.models.traveler;
  }

  async getOne(parametrs) {
    try {
      return await this.model.findOne(parametrs);
    } catch (error) {
      throw Error(`Can not get given traveler: ${error.message}`);
    }
  }

  async getSome(parametrs) {
    try {
      return await this.model.find(parametrs);
    } catch (error) {
      throw Error(`Can not get given travelers: ${error.message}`);
    }
  }

  async getAll() {
    try {
      return await this.model.find({});
    } catch (error) {
      throw Error(`Can not get any traveler: ${error.message}`);
    }
  }

  async create(parametrs) {
    try {
      // eslint-disable-next-line no-param-reassign
      parametrs._id = new mongoose.Types.ObjectId();
      await this.model.create(parametrs);
    } catch (error) {
      throw Error(`Can not create traveler document: ${error.message}`);
    }
  }

  async updateOne(parametrs, info) {
    try {
      await this.model.updateOne(parametrs, info);
    } catch (error) {
      throw Error(`Can not update any traveler document: ${error.message}`);
    }
  }
}

module.exports = new Traveler();
