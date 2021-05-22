'use strict';

const tripChecker = require('../services/other/checking_trip_service');

// Trip {
//     name:
//     date:
//     day:
//  }

class Trip {
  async getUserStatus(sentMessage, user) {
    const [state, command, trip] = await tripChecker(sentMessage, user, this);
    this.name = trip.name;
    this.date = trip.date;
    this.day = trip.day;
    return [state, command];
  }
}

module.exports = new Trip();
