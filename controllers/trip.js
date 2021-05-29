/* eslint-disable no-console */

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
    console.log('THISSSSSSSSSS');
    console.log(this);
    return [state, command];
  }
}

module.exports = new Trip();
