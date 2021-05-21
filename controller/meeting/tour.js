'use strict';

const checkTourName = async (command, sentMessage, tour) => {
  const trip = { ...tour };
  const Ydb = require('../../db/your-tour-bot');
  const Tour = Ydb.conn.models.tour;
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
  const tourDate = new Date(sentMessage);
  if (tourDateValidation(sentMessage)) {
    const Ydb = require('../../db/your-tour-bot');
    const Tour = Ydb.conn.models.tour;
    const journey = await Tour.findOne({ tour_name: trip.name, beginning_date: tourDate }, (err, docs) => {
      if (err) return console.error(err);
      return docs;
    });
    if (journey.ending_date > Date.now()) {
      trip.date = tourDate;
      trip.id = journey._id;
    }
    const state = command === 'Send message' ? 'WAITING MESSAGE' : 'WAITING DAY';
    return trip.date ? [state, command, trip] : ['WAITING COMMAND', 'admin', trip];
  }
  return ['WAITING TOUR DATE AGAIN', command, trip];
};

const tourDateValidation = (date) => {
  const regular = require('../../regular');
  return !!date.match(regular.validDate);
};

const checkDay = async (command, sentMessage, tour) => {
  const trip = { ...tour };
  if (tourDayValidation(sentMessage)) {
    const Ydb = require('../../db/your-tour-bot');
    const Tour = Ydb.conn.models.tour;
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
  const regular = require('../../regular');
  return !!day.match(regular.validDay);
};

module.exports = {
  checkTourName,
  checkTourDate,
  checkDay
};
