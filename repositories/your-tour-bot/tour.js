'use strict';

const conn = require('../../db/your-tour-bot');

class Tour {
  constructor() {
    this.model = conn.models.tour;
  }

  async getOne(parametrs) {
    try {
      return await this.model.findOne(parametrs);
    } catch (error) {
      throw Error(`Can not get given tour: ${error.message}`);
    }
  }

  async getSome(parametrs) {
    try {
      return await this.model.find(parametrs);
    } catch (error) {
      throw Error(`Can not get given tours: ${error.message}`);
    }
  }

  async getAll() {
    try {
      return await this.model.find({});
    } catch (error) {
      throw Error(`Can not get any tour: ${error.message}`);
    }
  }
}

module.exports = new Tour();
