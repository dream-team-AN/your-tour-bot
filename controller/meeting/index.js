'use strict';

const end = {};
const show = async (req, send, users, sendLocation) => {
  const Tourist = require('@root/models/tourist');
  const Tour = require('@root/models/tour');
  const request = require('request');
  const secret = require('@root/secret');
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
  try {
    const file = JSON.parse(fs.readFileSync('./controller/meeting/meeting_data.json', 'utf-8'));
    const place = file[currentTour._id].place_address;
    send(output(file[currentTour._id]), 'none');
    const options = `q=${encodeURIComponent(place)}&key=${secret.geoAPIKey}`;
    const link = `https://api.opencagedata.com/geocode/v1/json?${options}`;
    console.log(link);
    await request(link, (error, response, body) => {
      console.error('error:', error);
      end.lat = JSON.parse(body).results[0].geometry.lat;
      end.lng = JSON.parse(body).results[0].geometry.lng;
      sendLocation(end.lat, end.lng);
      send('Что бы узнать маршрут к месту встречи отправьте боту свою локацию.', 'geo');
    });
  } catch (err) {
    send('Извините, администратор ещё не добавил информацию о встрече группы. Пожалуйста, обратитесь к нему лично.', 'none');
  }
  return 'WAITING GEO';
};

const output = (obj) => `❗️ Информация про встречу:\n
📅 Дата: ${obj.date} \r
🏛 Место: ${obj.place_name} \r
🗺 Точный адрес: ${obj.place_address}`;

const showDirection = (req, send, users, sendLocation) => {
  const start = req.body.message.location;
  const sentMessage = req.body.message.text;

  if (sentMessage !== 'Cancel operation') {
    const options = `${start.latitude},${start.longitude}/${end.lat},${end.lng}`;
    const link = `https://www.google.com.ua/maps/dir/${options}?hl=ru`;
    send(`📍 Маршрут к месту встречи: \n${link}`, 'none');
  }
  return 'WAITING COMMAND';
};

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
  setTime,
  showDirection
};
