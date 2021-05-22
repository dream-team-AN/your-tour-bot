'use strict';

const mongoose = require('mongoose');
const Mdb = require('../../db/meeting-bot');

class Cron {
  constructor() { this.model = Mdb.conn.models.cron; }

  async getOne(parametrs) {
    try {
      return await this.model.findOne(parametrs, (err, docs) => {
        if (err) return console.error(err);
        return docs;
      });
    } catch (error) {
      throw Error(`Can not get given cron: ${error.message}`);
    }
  }

  async getSome(parametrs) {
    try {
      return await this.model.find(parametrs, (err, docs) => {
        if (err) return console.error(err);
        return docs;
      });
    } catch (error) {
      throw Error(`Can not get given crons: ${error.message}`);
    }
  }

  async getAll() {
    try {
      return await this.model.find({}, (err, docs) => {
        if (err) return console.error(err);
        return docs;
      });
    } catch (error) {
      throw Error(`Can not get any cron: ${error.message}`);
    }
  }

  async create(parametrs) {
    // eslint-disable-next-line no-param-reassign
    parametrs._id = new mongoose.Types.ObjectId();
    await this.model.create(parametrs, (err, doc) => {
      if (err) return console.error(err);
      return doc;
    });
  }

  async updateOne(parametrs, info) {
    await this.model.updateOne(parametrs, info, (err, doc) => {
      if (err) return console.error(err);
      return doc;
    });
  }
}

module.exports = new Cron();
