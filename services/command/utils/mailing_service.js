'use strict';

const Tour = require('../../../repositories/your-tour-bot/tour');
const Tourist = require('../../../repositories/your-tour-bot/tourist');

const getIDs = async (trip, users) => {
  const chatIDs = [];
  const tour = await Tour.getOne({ tour_name: trip.name, beginning_date: trip.date });
  for (const tourist of tour.tourists) {
    const tourists = await Tourist.getOne({ _id: tourist });
    Object.entries(users).forEach(([chat, properties]) => {
      if (tourists.full_name === properties.name) {
        chatIDs.push(chat);
      }
    });
  }
  return chatIDs;
};

module.exports = getIDs;
