'use strict';

const end = {};
const show = async (req, send, users, sendLocation) => {
  const Mdb = require('../../db/meeting-bot');
  const currentTour = await getTour(req, users);
  if (currentTour) {
    const mconn = await Mdb.connect();
    const Info = mconn.models.info;
    const note = await Info.findOne({ tour_id: currentTour._id }, (err, docs) => {
      if (err) return console.error(err);
      return docs;
    });
    const withoutTime = require('../utils/date_func');
    if (note && note.date >= withoutTime(new Date())) {
      const place = note.place_address;
      send(output(note), 'none');
      await sendMeetingPlace(place, send, sendLocation);
    } else {
      send('Извините, администратор ещё не добавил информацию о встрече группы. Пожалуйста, обратитесь к нему лично.', 'none');
      return 'WAITING COMMAND';
    }
  } else {
    send('Ваш тур ещё не начался.', 'none');
    return 'WAITING COMMAND';
  }
  return 'WAITING GEO';
};

const sendMeetingPlace = async (place, send, sendLocation) => {
  const request = require('request');
  const options = `q=${encodeURIComponent(place)}&key=${process.env.GEO_API_KEY}`;
  const link = `https://api.opencagedata.com/geocode/v1/json?${options}`;
  await request(link, (error, response, body) => {
    if (error) console.error('error:', error);
    try {
      end.lat = JSON.parse(body).results[0].geometry.lat;
      end.lng = JSON.parse(body).results[0].geometry.lng;
      sendLocation(end.lat, end.lng);
      send('Что бы узнать маршрут к месту встречи отправьте боту свою локацию.', 'geo');
    } catch (err) {
      console.error(err);
      send('Ошибка доступа к данным.', 'none');
    }
  });
};

const getTour = async (req, users) => {
  const findTour = require('../utils/find_tour');
  const Ydb = require('../../db/your-tour-bot');
  const yconn = await Ydb.connect();
  const Tourist = yconn.models.tourist;
  const chatId = req.body.message.chat.id;
  const tourist = await Tourist.findOne({ full_name: users[chatId].name }, (err, docs) => {
    if (err) return console.error(err);
    return docs;
  });
  // eslint-disable-next-line sonarjs/prefer-immediate-return
  return await findTour(tourist, yconn);
};

const output = (obj) => {
  const formatDate = require('../utils/format');
  return `❗️ Информация про встречу:\n
📅 Дата: ${formatDate(obj.date)} \r
🕑 Время: ${obj.time} \r
🏛 Место: ${obj.place_name} \r
🗺 Точный адрес: ${obj.place_address}`;
};

const showDirection = (req, send) => {
  const sentMessage = req.body.message.text;

  if (sentMessage !== 'Cancel operation') {
    const start = req.body.message.location;
    const options = `${start.latitude},${start.longitude}/${end.lat},${end.lng}`;
    const link = `https://www.google.com.ua/maps/dir/${options}?hl=ru`;
    send(`📍 Маршрут к месту встречи: \n${link}`, 'none');
  } else {
    send('Операция отменена.', 'none');
  }
  return 'WAITING COMMAND';
};

const setTime = async (req, tour, send, users) => {
  const chatId = req.body.message.chat.id;
  const sentMessage = req.body.message.text;

  if (timeValidation(sentMessage)) {
    const meetDate = new Date(tour.date.valueOf());
    const meetingDate = new Date(meetDate.setUTCDate(meetDate.getUTCDate() + (tour.day - 1)));

    const Mdb = require('../../db/meeting-bot');
    const mconn = await Mdb.connect();
    const Info = mconn.models.info;
    const note = await Info.findOne({ tour_id: tour.id }, (err, docs) => {
      if (err) return console.error(err);
      return docs;
    });
    if (!note) {
      const mongoose = require('mongoose');
      Info.create(
        {
          _id: new mongoose.Types.ObjectId(),
          tour_id: tour.id,
          date: meetingDate,
          time: sentMessage.replace(/\.|-/g, ':')
        },
        (err, doc) => {
          if (err) return console.error(err);
          return doc;
        }
      );
    } else {
      Info.findByIdAndUpdate(note._id,
        {
          date: meetingDate,
          time: sentMessage.replace(/\.|-/g, ':')
        },
        (err, doc) => {
          if (err) return console.error(err);
          return doc;
        });
    }

    const meetingTime = sentMessage.replace(/\.|-/g, ':');
    await settingCron(tour, send, meetingDate, meetingTime, users);

    send(chatId, 'Время успешно задано.', 'admin');
    return 'WAITING COMMAND';
  }
  send(chatId, 'Время введено в некорректном формате. Пожалуйста, введите снова.', 'none');
  return 'WAITING TIME AGAIN';
};

const settingCron = async (tour, send, meetingDate, meetingTime, users) => {
  const Ydb = require('../../db/your-tour-bot');
  const yconn = await Ydb.connect();
  const Tour = yconn.models.tour;
  const City = yconn.models.city;
  const trip = await Tour.findOne({ _id: tour.id }, (err, docs) => {
    if (err) return console.error(err);
    return docs;
  });
  let currentCityId;
  trip.cities.forEach((city) => {
    if (city.day.includes(tour.day)) currentCityId = city.city_id;
  });
  const currentCity = await City.findOne({ _id: currentCityId }, (err, docs) => {
    if (err) return console.error(err);
    return docs;
  });
  const gmt = +currentCity.timezone.slice(3);
  const cron = require('../utils/create_job');
  await cron.createJob(15, send, meetingDate, meetingTime, gmt, tour, users);
  await cron.createJob(30, send, meetingDate, meetingTime, gmt, tour, users);
  await cron.createJob(60, send, meetingDate, meetingTime, gmt, tour, users);
};

const timeValidation = (day) => {
  const regular = require('../../regular');
  return !!day.match(regular.validTime);
};

const setPlace = async (req, tour, send) => {
  const chatId = req.body.message.chat.id;
  const sentMessage = req.body.message.text;

  const Ydb = require('../../db/your-tour-bot');
  const yconn = await Ydb.connect();
  const Tour = yconn.models.tour;

  const trip = await Tour.findOne({ _id: tour.id }, (err, docs) => {
    if (err) return console.error(err);
    return docs;
  });

  const flag = await cityHandller(trip, tour, sentMessage);
  if (flag) {
    send(chatId, 'Место успешно задано.', 'admin');
    return 'WAITING COMMAND';
  }
  send(chatId, 'Место встречи некорректное. Пожалуйста, попробуйте снова.', 'place');
  return 'WAITING TIME AGAIN';
};

const cityHandller = async (trip, tour, sentMessage) => {
  const Ydb = require('../../db/your-tour-bot');
  const yconn = await Ydb.connect();
  const City = yconn.models.city;

  const cities = await City.find({}, (err, docs) => {
    if (err) return console.error(err);
    return docs;
  });
  let address;
  let cityExist = false;

  cities.forEach((city) => {
    for (const town of trip.cities) {
      if (String(city._id) === String(town.city_id) && town.day.includes(tour.day)) {
        cityExist = true;
        city.meeting_places.forEach((place) => {
          if (place.name === sentMessage) {
            //todo: probably we need to stop looping if we found adress? Use find? refactor
            address = place.address;
          }
        });
      }
    }
  });
  if (cityExist) {
    await writeNote(tour, sentMessage, address);
  }
  return cityExist;
};

const writeNote = async (tour, sentMessage, address) => {
  const Mdb = require('../../db/meeting-bot');
  const mconn = await Mdb.connect();
  const Info = mconn.models.info;
  const note = await Info.findOne({ tour_id: tour.id }, (err, docs) => {
    if (err) return console.error(err);
    return docs;
  });
  if (!note) {
    const mongoose = require('mongoose');
    Info.create(
      {
        _id: new mongoose.Types.ObjectId(),
        tour_id: tour.id,
        place_name: sentMessage,
        place_address: address
      },
      (err, doc) => {
        if (err) return console.error(err);
        return doc;
      }
    );
  } else {
    Info.findByIdAndUpdate(note._id,
      {
        place_name: sentMessage,
        place_address: address
      },
      (err, doc) => {
        if (err) return console.error(err);
        return doc;
      });
  }
};

module.exports = {
  show,
  setPlace,
  setTime,
  showDirection
};
