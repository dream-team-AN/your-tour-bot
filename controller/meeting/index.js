'use strict';

/* eslint-disable no-console */
const end = {};
const show = async (req, send, users, sendLocation) => {
  const Tourist = require('../../models/tourist');
  const Tour = require('../../models/tour');
  const Info = require('../../models/info');
  const request = require('request');
  const Ydb = require('../../db/your-tour-bot');
  const Mdb = require('../../db/meeting-bot');

  console.log('current tour 1');
  Ydb.connect();
  console.log('current tour 2');
  const chatId = req.body.message.chat.id;
  const tourist = await Tourist.findOne({ full_name: users[chatId].name }, (err, docs) => {
    if (err) return console.error(err);
    return docs;
  });
  Ydb.disconnect();
  Ydb.connect();
  let currentTour;
  const tours = await Tour.find({}, (err, docs) => {
    if (err) return console.error(err);
    docs.forEach((tour) => {
      if (tourist.tours.includes(tour._id)
      && tour.ending_date > Date.now()
      && (!currentTour
        || tour.beginning_date < currentTour.beginning_date)) {
        currentTour = tour;
        console.log('AAAAAAAAAAAAA');
        console.log(`current tour${currentTour}1111111`);
      }
      console.log(`current tour${currentTour}222222`);
    });
    console.log(`current tour${currentTour}33333333`);
    return docs;
  });
  console.log(`current tour${tours}4444444`);
  console.log(`current tour${currentTour}3`);
  Ydb.disconnect();
  console.log(`current tour${currentTour}4`);
  Ydb.disconnect();
  if (currentTour) {
    Mdb.connect();
    const note = await Info.findOne({ _id: currentTour._id }, (err, docs) => {
      if (err) return console.error(err);
      return docs;
    });

    const place = note.place_address;
    send(output(note), 'none');
    const options = `q=${encodeURIComponent(place)}&key=${process.env.GEO_API_KEY}`;
    const link = `https://api.opencagedata.com/geocode/v1/json?${options}`;
    await request(link, (error, response, body) => {
      console.error('error:', error);
      end.lat = JSON.parse(body).results[0].geometry.lat;
      end.lng = JSON.parse(body).results[0].geometry.lng;
      sendLocation(end.lat, end.lng);
      send('Что бы узнать маршрут к месту встречи отправьте боту свою локацию.', 'geo');
    });
  } else {
    send('Извините, администратор ещё не добавил информацию о встрече группы. Пожалуйста, обратитесь к нему лично.', 'none');
  }
  Mdb.disconnect();
  return 'WAITING GEO';
};

const output = (obj) => `❗️ Информация про встречу:\n
📅 Дата: ${obj.date} \r
🕑 Время: ${obj.time} \r
🏛 Место: ${obj.place_name} \r
🗺 Точный адрес: ${obj.place_address}`;

const showDirection = (req, send) => {
  const start = req.body.message.location;
  const sentMessage = req.body.message.text;

  if (sentMessage !== 'Cancel operation') {
    const options = `${start.latitude},${start.longitude}/${end.lat},${end.lng}`;
    const link = `https://www.google.com.ua/maps/dir/${options}?hl=ru`;
    send(`📍 Маршрут к месту встречи: \n${link}`, 'none');
  } else {
    send('Операция отменена.', 'none');
  }
  return 'WAITING COMMAND';
};

const setTime = async (req, tour, send) => {
  const Format = require('@utils/format');
  const fs = require('fs');
  const chatId = req.body.message.chat.id;
  const sentMessage = req.body.message.text;

  if (timeValidation(sentMessage)) {
    const file = JSON.parse(fs.readFileSync('./controller/meeting/meeting_data.json', 'utf-8'));
    if (!file[tour.id]) file[tour.id] = {};

    const meetDate = new Date(tour.date.valueOf());
    const meetingDate = new Date(meetDate.setUTCDate(meetDate.getUTCDate() + (tour.day - 1)));
    file[tour.id].date = Format.formatDate(meetingDate);
    file[tour.id].time = sentMessage.replace(/\.|-/g, ':');
    fs.writeFileSync('./controller/meeting/meeting_data.json', JSON.stringify(file, null, 2));

    createJob(60, meetingDate, file[tour.id].time, send);
    createJob(30, meetingDate, file[tour.id].time, send);
    createJob(15, meetingDate, file[tour.id].time, send);

    send(chatId, 'Время успешно задано.', 'admin');
    return 'WAITING COMMAND';
  }
  send(chatId, 'Время введено в некорректном формате. Пожалуйста, введите снова.', 'none');
  return 'WAITING TIME AGAIN';
};

const createJob = (min, meetingDate, time, send) => {
  const schedule = require('node-schedule');
  const date = new Date(meetingDate.valueOf());
  date.setUTCHours(Number(time.split(':')[0]) - min);
  date.setUTCMinutes(Number(time.split(':')[1]));
  schedule.scheduleJob(date, () => {
    send(`До встречи осталось ${min} минут.`, 'none');
  });
};

const timeValidation = (day) => {
  const regular = require('@root/regular');
  if (day.match(regular.validTime)) {
    return true;
  }
  return false;
};

const setPlace = async (req, tour, send) => {
  const chatId = req.body.message.chat.id;
  const sentMessage = req.body.message.text;

  const Tour = require('@root/models/tour');

  const trip = await Tour.findOne({ _id: tour.id }, (err, docs) => {
    if (err) return console.error(err);
    return docs;
  });
  const flag = await cityHandller(trip, tour, sentMessage);
  if (flag) {
    send(chatId, 'Место успешно задано.', 'admin');
    return 'WAITING COMMAND';
  }

  send(chatId, 'Место встречи некорректное. Пожалуйста, попробуйте снова.', 'none');
  return 'WAITING TIME AGAIN';
};

const cityHandller = async (trip, tour, sentMessage) => {
  const City = require('@root/models/city');
  const fs = require('fs');

  let flag = false;
  await City.find({}, (err, docs) => {
    if (err) return console.error(err);
    const file = JSON.parse(fs.readFileSync('./controller/meeting/meeting_data.json', 'utf-8'));
    docs.forEach((city) => {
      trip.cities.forEach((town) => {
        if (String(city._id) === String(town.city_id) && town.day.includes(tour.day)) {
          if (!file[tour.id]) file[tour.id] = {};
          file[tour.id].place_name = sentMessage;
          city.meeting_places.forEach((place) => {
            if (place.name === sentMessage) { file[tour.id].place_address = place.address; }
          });
          flag = true;
        }
      });
    });
    fs.writeFileSync('./controller/meeting/meeting_data.json', JSON.stringify(file, null, 2));
    return docs;
  });
  return flag;
};

module.exports = {
  show,
  setPlace,
  setTime,
  showDirection
};
