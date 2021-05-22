'use strict';

const Tour = require('../../../repositories/your-tour-bot/tour');
const Tourist = require('../../../repositories/your-tour-bot/tourist');

const getIDs = async (tour, users) => {
  const chatIDs = [];
  const trip = await Tour.getOne({ tour_name: tour.name, beginning_date: tour.date });
  for (const tourist of trip.tourists) {
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
