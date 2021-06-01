'use strict';

const conn = require('../../db/your-tour-bot');

class Tourist {
  constructor() {
    this.model = conn.models.tourist;
  }

  async getOne(parametrs) {
    try {
      return await this.model.findOne(parametrs);
    } catch (error) {
      throw Error(`Can not get given tourist: ${error.message}`);
    }
  }

  async getSome(parametrs) {
    try {
      return await this.model.find(parametrs);
    } catch (error) {
      throw Error(`Can not get given tourists: ${error.message}`);
    }
  }

  async getAll() {
    try {
      return await this.model.find({});
    } catch (error) {
      throw Error(`Can not get any tourist: ${error.message}`);
    }
  }
}

module.exports = new Tourist();
