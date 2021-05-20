'use strict';

const getIDs = async (tour, users) => {
  const Ydb = require('../../db/your-tour-bot');
  const yconn = await Ydb.connect();
  const Tourist = yconn.models.tourist;
  const Tour = yconn.models.tour;
  const chatIDs = [];
  const trip = await Tour.findOne({ tour_name: tour.name, beginning_date: tour.date }, (err, docs) => {
    if (err) return console.error(err);
    return docs;
  });
  for (const tourist of trip.tourists) {
    const tourists = await Tourist.findOne({ _id: tourist }, (err, docs) => {
      if (err) return console.error(err);
      return docs;
    });
    Object.entries(users).forEach(([chat, properties]) => {
      if (tourists.full_name === properties.name) {
        chatIDs.push(chat);
        // eslint-disable-next-line no-console
        console.log(chatIDs);
      }
    });
  }
  return chatIDs;
};

module.exports = getIDs;
