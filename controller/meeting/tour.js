'use strict';

const regular = require('../../regular');
const Tour = require('../../models/tour');

const checkTourName = async (command, sentMessage, tour) => {
  const trip = { ...tour };
  const tours = await Tour.find({ tour_name: sentMessage }, (err, docs) => {
    if (err) return console.error(err);
    return docs;
  });
  if (tours.length) {
    trip.name = sentMessage;
  }
  return tours.length ? ['WAITING TOUR DATE', command, trip] : ['WAITING COMMAND', 'admin', trip];
};

const checkTourDate = async (command, sentMessage, tour) => {
  const trip = { ...tour };
  const tourDate = dateParser(sentMessage);
  if (tourDateValidation(sentMessage)) {
    const jorney = await Tour.findOne({ tour_name: trip.name, beginning_date: tourDate }, (err, docs) => {
      if (err) return console.error(err);
      return docs;
    });
    if (jorney.ending_date > Date.now()) {
      trip.date = tourDate;
      trip.id = jorney._id;
    }
    const state = command === 'Send message' ? 'WAITING MESSAGE' : 'WAITING DAY';
    return trip.date ? [state, command, trip] : ['WAITING COMMAND', 'admin', trip];
  }
  return ['WAITING TOUR DATE AGAIN', command, trip];
};

const dateParser = (date) => {
  const dateStr = `${date}T00:00:00.000Z`;
  return new Date(dateStr);
};
const tourDateValidation = (date) => {
  if (date.match(regular.validDate)) {
    return true;
  }
  return false;
};

const checkDay = async (command, sentMessage, tour) => {
  const trip = { ...tour };
  if (tourDayValidation(sentMessage)) {
    let dayFlag = false;
    const tours = await Tour.findOne({ tour_name: trip.name, beginning_date: trip.date }, (err, docs) => {
      if (err) return console.error(err);
      return docs;
    });
    if ((+sentMessage) <= tours.duration) {
      trip.day = Number(sentMessage);
      dayFlag = true;
    }
    if (dayFlag) {
      if (command === 'Set meeting time') return ['WAITING TIME', command, trip];
      if (command === 'Set meeting place') return ['WAITING PLACE', command, trip];
    }
    return ['WAITING COMMAND', 'admin', trip];
  }
  return ['WAITING DAY AGAIN', command, trip];
};

const tourDayValidation = (day) => {
  if (day.match(regular.validDay)) {
    return true;
  }
  return false;
};

module.exports = {
  checkTourName,
  checkTourDate,
  checkDay
};
