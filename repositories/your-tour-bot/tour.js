'use strict';

class Tour {
  setModel(model) {
    this.model = model;
  }

  async getOne(parametrs) {
    try {
      return await this.model.findOne(parametrs, (err, docs) => {
        if (err) return console.error(err);
        return docs;
      });
    } catch (error) {
      throw Error(`Can not get given tour: ${error.message}`);
    }
  }

  async getSome(parametrs) {
    try {
      return await this.model.find(parametrs, (err, docs) => {
        if (err) return console.error(err);
        return docs;
      });
    } catch (error) {
      throw Error(`Can not get given tours: ${error.message}`);
    }
  }

  async getAll() {
    try {
      return await this.model.find({}, (err, docs) => {
        if (err) return console.error(err);
        return docs;
      });
    } catch (error) {
      throw Error(`Can not get any tour: ${error.message}`);
    }
  }
}

module.exports = new Tour();
