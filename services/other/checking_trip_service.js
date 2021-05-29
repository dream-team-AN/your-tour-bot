/* eslint-disable no-console */

'use strict';

const Tour = require('../../repositories/your-tour-bot/tour');
const regular = require('../../regular');

const tripChecker = async (sentMessage, user, trip) => {
  const commandAdminFunctions = {
    'WAITING TOUR DATE': checkTourName,
    'WAITING DAY': checkTourDate,
    'WAITING MESSAGE': checkTourDate,
    'WAITING PLACE': checkDay,
    'WAITING TIME': checkDay
  };
  console.log('+++++');
  console.log(user);
  const stateHandler = commandAdminFunctions[user.state];
  console.log(stateHandler);
  return await stateHandler(user.command, sentMessage, trip);
};

const checkTourName = async (command, sentMessage, trip) => {
  const journey = { ...trip };
  const tours = await Tour.getSome({ tour_name: sentMessage });
  if (tours.length) {
    journey.name = sentMessage;
  }
  console.log(tours);
  return tours.length ? ['WAITING TOUR DATE', command, journey] : ['WAITING COMMAND', 'admin', journey];
};

const checkTourDate = async (command, sentMessage, trip) => {
  const journey = { ...trip };
  const tripDate = new Date(sentMessage);
  if (tripDateValidation(sentMessage)) {
    const tour = await Tour.getOne({ tour_name: journey.name, beginning_date: tripDate });
    if (tour.ending_date > Date.now()) {
      journey.date = tripDate;
      journey.id = journey._id;
    }
    const state = command === 'Send message' ? 'WAITING MESSAGE' : 'WAITING DAY';
    return journey.date ? [state, command, journey] : ['WAITING COMMAND', 'admin', journey];
  }
  return ['WAITING TOUR DATE AGAIN', command, journey];
};

const tripDateValidation = (date) => !!date.match(regular.validDate);

const checkDay = async (command, sentMessage, trip) => {
  const journey = { ...trip };
  if (tripDayValidation(sentMessage)) {
    let dayFlag = false;
    const tour = await Tour.getOne({ tour_name: journey.name, beginning_date: journey.date });
    if ((+sentMessage) <= tour.duration) {
      journey.day = Number(sentMessage);
      dayFlag = true;
    }
    if (dayFlag) {
      if (command === 'Set meeting time') return ['WAITING TIME', command, journey];
      if (command === 'Set meeting place') return ['WAITING PLACE', command, journey];
    }
    return ['WAITING COMMAND', 'admin', journey];
  }
  return ['WAITING DAY AGAIN', command, journey];
};

const tripDayValidation = (day) => !!day.match(regular.validDay);

module.exports = tripChecker;
