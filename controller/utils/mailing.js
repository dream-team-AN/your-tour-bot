'use strict';

const sendMessageForMany = async (tour, callback) => {
  const Ydb = require('../../db/your-tour-bot');
  const yconn = await Ydb.connect();
  const Tourist = yconn.models.tourist;
  const Tour = yconn.models.tour;

  const trip = await Tour.findOne({ tour_name: tour.name, beginning_date: tour.date }, (err, docs) => {
    if (err) return console.error(err);
    return docs;
  });
  trip.tourists.forEach(async (tourist) => {
    const tourists = await Tourist.findOne({ _id: tourist }, (err, docs) => {
      if (err) return console.error(err);
      return docs;
    });
    callback(tourists);
  });
};

module.exports = sendMessageForMany;
