'use strict';

const show = async (req, send, users) => {
  const findTour = require('../utils/find_tour');
  const parser = require('./parse');
  const Ydb = require('../../db/your-tour-bot');
  const Tourist = Ydb.conn.models.tourist;
  const City = Ydb.conn.models.city;
  const chatId = req.body.message.chat.id;
  const tourist = await Tourist.findOne({ full_name: users[chatId].name }, (err, docs) => {
    if (err) return console.error(err);
    return docs;
  });
  const currentTour = await findTour(tourist, Ydb.conn);
  const cities = [];
  await City.find({}, (err, docs) => {
    if (err) return console.error(err);
    docs.forEach((city) => {
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
    return docs;
  });
  send('Обработка данных. Подождите, пожалуйста.', 'none');
  await parser.parseDestinations(cities, currentTour.beginning_date, send);

  return 'WAITING COMMAND';
};

module.exports = {
  show
};