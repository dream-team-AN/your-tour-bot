'use strict';

const Ydb = require('../../db/your-tour-bot');

class City {
  constructor() { this.model = Ydb.conn.models.city; }

  async getOne(parametrs) {
    try {
      return await this.model.findOne(parametrs, (err, docs) => {
        if (err) return console.error(err);
        return docs;
      });
    } catch (error) {
      throw Error(`Can not get given city: ${error.message}`);
    }
  }

  async getSome(parametrs) {
    try {
      return await this.model.find(parametrs, (err, docs) => {
        if (err) return console.error(err);
        return docs;
      });
    } catch (error) {
      throw Error(`Can not get given cities: ${error.message}`);
    }
  }

  async getAll() {
    try {
      return await this.model.find({}, (err, docs) => {
        if (err) return console.error(err);
        return docs;
      });
    } catch (error) {
      throw Error(`Can not get any city: ${error.message}`);
    }
  }
}

module.exports = new City();