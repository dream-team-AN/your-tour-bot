'use strict';

const conn = require('../../db/your-tour-bot');

class City {
  constructor() {
    this.model = conn.models.city;
  }

  async getOne(parametrs) {
    try {
      return await this.model.findOne(parametrs);
    } catch (error) {
      throw Error(`Can not get given city: ${error.message}`);
    }
  }

  async getSome(parametrs) {
    try {
      return await this.model.find(parametrs);
    } catch (error) {
      throw Error(`Can not get given cities: ${error.message}`);
    }
  }

  async getAll() {
    try {
      return await this.model.find({});
    } catch (error) {
      throw Error(`Can not get any city: ${error.message}`);
    }
  }
}

module.exports = new City();
