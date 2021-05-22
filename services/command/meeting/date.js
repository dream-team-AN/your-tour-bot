'use strict';

const Ydb = require('../../db/your-tour-bot');

const choose = async (tour, ask) => {
  const Tour = Ydb.conn.models.tour;
  const dates = [];
  await Tour.find({ tour_name: tour.name }, (err, docs) => {
    if (err) return console.error(err);
    docs.forEach((trip) => {
      dates.push(trip.beginning_date);
    });
    ask(dates);
    return docs;
  });
  return dates;
};

module.exports = { choose };
