'use strict';

const mongoose = require('mongoose');
const conn = require('../../db/meeting-bot');

class Info {
  constructor() {
    this.model = conn.models.info;
  }

  async getOne(parametrs) {
    try {
      return await this.model.findOne(parametrs);
    } catch (error) {
      throw Error(`Can not get given info: ${error.message}`);
    }
  }

  async getSome(parametrs) {
    try {
      return await this.model.find(parametrs);
    } catch (error) {
      throw Error(`Can not get given infos: ${error.message}`);
    }
  }

  async getAll() {
    try {
      return await this.model.find({});
    } catch (error) {
      throw Error(`Can not get any info: ${error.message}`);
    }
  }

  async create(parametrs) {
    try {
      // eslint-disable-next-line no-param-reassign
      parametrs._id = new mongoose.Types.ObjectId();
      await this.model.create(parametrs);
    } catch (error) {
      throw Error(`Can not create info document: ${error.message}`);
    }
  }

  async updateOne(parametrs, info) {
    try {
      await this.model.updateOne(parametrs, info);
    } catch (error) {
      throw Error(`Can not update info document: ${error.message}`);
    }
  }
}

module.exports = new Info();
