'use strict';

const choose = async (tour, ask) => {
  const Ydb = require('../../db/your-tour-bot');
  const Tour = Ydb.conn.models.tour;
  const days = [];
  await Tour.findOne({ _id: tour.id }, (err, doc) => {
    if (err) return console.error(err);
    for (let i = 0; i < doc.duration; i++) {
      days.push(i + 1);
    }
    ask(days);
    return doc;
  });
  return days;
};

module.exports = { choose };
