'use strict';

const createJob = async (mins, send, meetingDate, time, chatId) => {
  // eslint-disable-next-line no-console
  console.log(time);
  const schedule = require('node-schedule');
  const date = new Date(meetingDate.valueOf());
  date.setUTCHours(Number(time.split(':')[0]) - mins);
  date.setUTCMinutes(Number(time.split(':')[1]));
  schedule.scheduleJob(date, () => {
    send(`До встречи осталось ${mins} минут.`, 'none');
  });
  const mongoose = require('mongoose');
  const Mdb = require('../../db/meeting-bot');
  const mconn = await Mdb.connect();
  const Cron = mconn.models.cron;
  Cron.create(
    {
      _id: new mongoose.Types.ObjectId(),
      chat_id: chatId,
      date,
      mins
    },
    (err, doc) => {
      if (err) return console.error(err);
      return doc;
    }
  );
};

const initialCreateJob = (mins, send, date, chatId) => {
  const schedule = require('node-schedule');
  schedule.scheduleJob(date, () => {
    send(chatId, `До встречи осталось ${mins} минут.`, 'none');
  });
};

module.exports = {
  createJob,
  initialCreateJob
};
