'use strict';

const show = async (req, send, users) => {
  const Tourist = require('@root/models/tourist');
  const Tour = require('@root/models/tour');
  const fs = require('fs');

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
  const file = JSON.parse(fs.readFileSync('@meeting/meeting_data.json', 'utf-8'));
  send(output(file[currentTour._id]), 'none');
  return 'WAITING COMMAND';
};

const output = (obj) => `❗️ Информация про встречу:\n
📅 Дата: ${obj.date} \r
🏛 Место: ${obj.place_name} \r
🗺 Точный адрес: ${obj.place_address}`;

const setTime = async (req, tour, send) => {
  const chatId = req.body.message.chat.id;
  send('set time', 'none', chatId);
  return 'WAITING COMMAND';
};

const setPlace = async (req, tour, send) => {
  const chatId = req.body.message.chat.id;
  const sentMessage = req.body.message.text;
  send('set place', 'none', chatId);
  return 'WAITING COMMAND';
};

module.exports = {
  show,
  setPlace,
  setTime
};
