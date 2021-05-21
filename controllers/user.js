/* eslint-disable class-methods-use-this */

'use strict';

class User {
  getUserStatus(sentMessage, chatId, user) {
    const getStatus = require('../services/user/status_service');
    getStatus(sentMessage, chatId, user);
  }
}

module.exports = new User();
