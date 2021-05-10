'use strict';

const show = async (req, send, users) => {
  const parser = require('./parse');
  const Tourist = require('../../models/tourist');
  const Tour = require('../../models/tour');
  const City = require('../../models/city');

  const chatId = req.body.message.chat.id;
  const tourist = await Tourist.findOne({ full_name: users[chatId].name }, (err, docs) => {
    if (err) return console.error(err);
    return docs;
  });
  let currentTour;
  await Tour.find({}, (err, docs) => {
    if (err) return console.error(err);
    docs.forEach((tour) => {
      if (tourist.tours.includes(tour._id)
      && tour.ending_date > Date.now()
      && (!currentTour
        || tour.beginning_date < currentTour.beginning_date)) {
        currentTour = tour;
      }
    });
    return docs;
  });
  const cities = [];
  await City.find({}, (err, docs) => {
    if (err) return console.error(err);
    docs.forEach((city) => {
      currentTour.cities.forEach((town) => {
        if (String(city._id) === String(town.city_id)) {
          const currentCity = {
            name: city.name,
            day: town.day
          };
          cities.push(currentCity);
        }
      });
    });
    return docs;
  });
  parser.parseDestinations(cities, currentTour.beginning_date, send);
  send('Обработка данных. Подождите, пожалуйста.', 'none');
  return 'WAITING COMMAND';
};

module.exports = {
  show
};
