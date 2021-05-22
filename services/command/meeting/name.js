'use strict';

const Ydb = require('../../db/your-tour-bot');

const choose = async (ask) => {
  const Tour = Ydb.conn.models.tour;
  const names = [];
  await Tour.find({ }, (err, docs) => {
    if (err) return console.error(err);
    docs.forEach((tour) => {
      names.push(tour.tour_name);
    });
    // eslint-disable-next-line no-console
    console.log(names);
    // eslint-disable-next-line no-console
    console.log(docs);
    ask(names);
    return docs;
  });
  return names;
};

module.exports = { choose };
