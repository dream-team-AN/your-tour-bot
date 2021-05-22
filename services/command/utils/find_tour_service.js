'use strict';

const withoutTime = require('./date_service');
const Tour = require('../../../repositories/your-tour-bot/tour');

const findTour = async (tourist) => {
  let currentTour;
  const tours = await Tour.getAll();

  tours.forEach((tour) => {
    if (tourist.tours.includes(tour._id)
      && tour.ending_date > withoutTime(new Date())
      && (!currentTour
        || tour.beginning_date < currentTour.beginning_date)) {
      currentTour = tour;
    }
  });
  return currentTour;
};

module.exports = findTour;
