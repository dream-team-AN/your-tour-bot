'use strict';

const createJob = async (mins, send, meetingDate, time, tour, users) => {
  const schedule = require('node-schedule');
  const date = new Date(meetingDate.valueOf());
  date.setUTCHours(Number(time.split(':')[0]));
  date.setUTCMinutes(Number(time.split(':')[1]) - mins);
  const chatIDs = [];
  const forwarding = (tourists) => {
    Object.entries(users).forEach(([chat, properties]) => {
      if (tourists.full_name === properties.name) {
        chatIDs.push(chat);
        send(chat, `До встречи осталось ${mins} минут.`, 'none');
      }
    });
  };
  schedule.scheduleJob(date, () => {
    const sendMessageForMany = require('./mailing');
    sendMessageForMany(tour, users, forwarding);
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
  schedule.scheduleJob(date, () => {
    for (const chat of chatIDs) {
      send(chat, `До встречи осталось ${mins} минут.`, 'none');
    }
  });
};

module.exports = {
  createJob,
  initialCreateJob
};
