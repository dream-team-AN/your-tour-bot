/* eslint-disable class-methods-use-this */

'use strict';

// User {
//   1: {
//     name:
//     state:
//     command:
//   }
//   2: {
//     name:
//     state:
//     command:
//   }
//  }

class User {
  setStatus(sentMessage, chatId) {
    const getStatus = require('../services/user/status_service');
    [this[chatId].state, this[chatId].command] = getStatus(sentMessage, chatId, this[chatId]);
    const Mdb = require('../db/meeting-bot');
    const Traveler = Mdb.conn.models.traveler;
    Traveler.updateOne({ chat_id: chatId },
      {
        command: this[chatId].command,
        state: this[chatId].state
      },
      (err, doc) => {
        if (err) return console.error(err);
        return doc;
      });
  }

  async init(chatId) {
    const Mdb = require('../db/meeting-bot');
    this[chatId] = {};
    const Traveler = Mdb.conn.models.traveler;
    const voyager = await Traveler.findOne({ chat_id: chatId }, (err, docs) => {
      if (err) return console.error(err);
      return docs;
    });
    if (!voyager) {
      const mongoose = require('mongoose');
      Traveler.create(
        {
          _id: new mongoose.Types.ObjectId(),
          chat_id: chatId,
          command: 'none',
          state: 'WAITING COMMAND',
          name: 'unknown'
        },
        (err, doc) => {
          if (err) return console.error(err);
          return doc;
        }
      );
      this[chatId].command = 'none';
      this[chatId].state = 'WAITING COMMAND';
      this[chatId].name = 'unknown';
    } else {
      this[chatId].command = voyager.command;
      this[chatId].state = voyager.state;
      this[chatId].name = voyager.name;
    }
  }

  async callCommand(req, res, chatId, fastify) {
    const { callingCommand, isAdminCommand } = require('../services/user/calling_command_service');
    const tourChecker = require('../services/user/checking_tour_service');
    const asking = require('../services/user/asking_service');

    if (this[chatId].state === 'WAITING COMMAND'
        && this[chatId].command !== 'none'
        && this[chatId].command !== 'error') {
      callingCommand(req, res, fastify);
    } else {
      if (isAdminCommand(this[chatId].command)
          && this[chatId].state !== 'WAITING TOUR NAME') {
        [this[chatId].state, this[chatId].command, this.tour] = await tourChecker(req, this.tour);
      }
      asking(this[chatId], chatId, fastify, this.tour).then((response) => {
        res.status(200).send(response);
      }).catch((error) => {
        res.send(error);
      });
    }
  }

  async setName(chatId, name) {
    if (this[chatId].command === 'tourist' && this[chatId].state === 'WAITING COMMAND') {
      const Mdb = require('../db/meeting-bot');
      this[chatId].name = name;
      const Traveler = Mdb.conn.models.traveler;
      Traveler.updateOne({ chat_id: chatId },
        {
          name: this[chatId].name
        },
        (err, doc) => {
          if (err) return console.error(err);
          return doc;
        });
    }
  }
}

module.exports = new User();
