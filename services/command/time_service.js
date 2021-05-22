'use strict';

const showInfo = require('../utils/show_weather_api');

const show = async (message, send) => {
  await showInfo(message, send, sendTime);
  return 'WAITING COMMAND';
};

const sendTime = (body, send) => {
  const region = JSON.parse(body).location.name;
  const time = JSON.parse(body).location.localtime.split(' ')[1];

  send(`🕑 Текущее время в ${region} : ${time}`, 'none');
};

module.exports = {
  show
};
