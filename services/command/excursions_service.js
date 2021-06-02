'use strict';

const findTour = require('./utils/find_tour_service');
const parser = require('./utils/parse_service');
const Tourist = require('../../repositories/your-tour-bot/tourist');
const City = require('../../repositories/your-tour-bot/city');

const show = async (message, send, users) => {
  const chatId = message.chat.id;
  const tourist = await Tourist.getOne({ full_name: users[chatId].name });
  const currentTour = await findTour(tourist);
  const cities = [];
  const towns = await City.getAll();
  towns.forEach((city) => {
    currentTour.cities.forEach((town) => {
      if (JSON.stringify(city._id) === JSON.stringify(town.city_id)) {
        const currentCity = {
          name: city.name,
          day: town.day
        };
        cities.push(currentCity);
      }
    });
  });
  send('Обработка данных. Подождите, пожалуйста.', 'none');
  await parser.parseDestinations(cities, currentTour.beginning_date, send);

  return 'WAITING COMMAND';
};

module.exports = {
  show
};
