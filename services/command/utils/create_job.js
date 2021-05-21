'use strict';

const createJob = async (mins, send, meetingDate, time, gmt, tour, users) => {
  const schedule = require('node-schedule');
  const date = new Date(meetingDate.valueOf());
  date.setUTCHours(Number(time.split(':')[0]) - gmt - 1);
  // todo: use date-fns/dat.js to mange dates, do not with dates as with strings
  date.setUTCMinutes(Number(time.split(':')[1]) - mins);
  const getIDs = require('./mailing');
  const chatIDs = await getIDs(tour, users);
  schedule.scheduleJob(date, () => { sendMessageForMany(chatIDs, mins, send); });

  const mongoose = require('mongoose');
  const Mdb = require('../../db/meeting-bot');
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
