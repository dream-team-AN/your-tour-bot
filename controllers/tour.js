'use strict';

const tourChecker = require('../services/other/checking_tour_service');

class Tour {
  async getUserStatus(sentMessage, user) {
    const [state, command, trip] = await tourChecker(sentMessage, user, this);
    this.name = trip.name;
    this.date = trip.date;
    this.day = trip.day;
    return [state, command];
  }
}

module.exports = new Tour();
