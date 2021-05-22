'use strict';

const schedule = require('node-schedule');
const mongoose = require('mongoose');
const getIDs = require('./mailing');
const Mdb = require('../../db/meeting-bot');

const createJob = async (mins, send, meetingDate, time, gmt, tour, users) => {
  const date = new Date(meetingDate.valueOf());
  date.setUTCHours(Number(time.split(':')[0]) - gmt - 1);
  date.setUTCMinutes(Number(time.split(':')[1]) - mins);

  const chatIDs = await getIDs(tour, users);
  schedule.scheduleJob(date, () => { sendMessageForMany(chatIDs, mins, send); });

  const Cron = Mdb.conn.models.cron;
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
