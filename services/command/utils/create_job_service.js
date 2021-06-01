'use strict';

const schedule = require('node-schedule');
const mongoose = require('mongoose');
const getIDs = require('./mailing_service');
const Cron = require('../../../repositories/meeting-bot/cron');

const createJob = async (mins, send, meetingDate, time, gmt, trip, users) => {
  const date = new Date(meetingDate.valueOf());
  date.setUTCHours(Number(time.split(':')[0]) - gmt - 1);
  date.setUTCMinutes(Number(time.split(':')[1]) - mins);

  const chatIDs = await getIDs(trip, users);
  schedule.scheduleJob(date, () => { sendMessageForMany(chatIDs, mins, send); });

  Cron.create(
    {
      _id: new mongoose.Types.ObjectId(),
      chat_id: chatIDs,
      date,
      mins
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
