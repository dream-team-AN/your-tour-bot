'use strict';

const findTour = async (tourist, yconn) => {
  const Tour = yconn.models.tour;

  let currentTour;
  const tours = await Tour.find({}, (err, docs) => {
    if (err) return console.error(err);
    return docs;
  });
  const withoutTime = require('./date_func');
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
