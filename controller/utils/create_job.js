'use strict';

const createJob = async (mins, send, meetingDate, time, tour, users) => {
  const schedule = require('node-schedule');
  const date = new Date(meetingDate.valueOf());
  const currentDate = new Date();
  date.setUTCHours(Number(time.split(':')[0]));
  date.setUTCMinutes(Number(time.split(':')[1]) - mins + currentDate.getTimezoneOffset());

  const getIDs = require('./mailing');
  const chatIDs = await getIDs(tour, users);
  schedule.scheduleJob(date, () => { sendMessageForMany(chatIDs, mins, send); });

  send('435051384', date, 'none');
  send('435051384', new Date(), 'none');
  send('435051384', mins, 'none');
  schedule.scheduleJob(new Date('2021-05-20T21:28:00'), () => {
    sendMessageForMany(chatIDs, mins, send);
  });

  const mongoose = require('mongoose');
  const Mdb = require('../../db/meeting-bot');
  const mconn = await Mdb.connect();
  const Cron = mconn.models.cron;
  Cron.create(
    {
      _id: new mongoose.Types.ObjectId(),
      chat_id: chatIDs,
      date,
      mins
    },
    (err, doc) => {
      if (err) return console.error(err);
      return doc;
    }
  );
};

const initialCreateJob = (mins, send, date, chatIDs) => {
  const schedule = require('node-schedule');
  schedule.scheduleJob(date, () => { sendMessageForMany(chatIDs, mins, send); });
};

const sendMessageForMany = (chatIDs, mins, send) => {
  for (const chat of chatIDs) {
    send(chat, `До встречи осталось ${mins} минут.`, 'none');
  }
};

module.exports = {
  createJob,
  initialCreateJob
};
