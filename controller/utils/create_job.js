'use strict';

const createJob = (min, meetingDate, time, send) => {
  const schedule = require('node-schedule');
  const date = new Date(meetingDate.valueOf());
  date.setUTCHours(Number(time.split(':')[0]) - min);
  date.setUTCMinutes(Number(time.split(':')[1]));
  schedule.scheduleJob(date, () => {
    send(`До встречи осталось ${min} минут.`, 'none');
  });
};

module.exports = createJob;
