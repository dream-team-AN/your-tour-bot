'use strict';

const request = require('request');

const showInfo = async (message, send, sendInfo) => {
  const loc = message.location;
  const sentMessage = message.text;

  if (sentMessage !== 'Cancel operation') {
    const lat = loc.latitude;
    const lng = loc.longitude;
    const options = `key=${process.env.WEATHER_API_KEY}&q=${lat},${lng}&days=2&aqi=no&alerts=no`;
    const link = `https://api.weatherapi.com/v1/forecast.json?${options}`;

    await request(link, (error, response, body) => { // eslint-disable-line no-unused-vars
      if (error) console.error('error:', error);
      try {
        sendInfo(body, send);
      } catch (err) {
        console.error(err);
        send('Ошибка доступа к данным.', 'none');
      }
    });
  } else {
    send('Операция отменена. Чтобы получить данные, пожалуйста, разрешите отправку геолокации.', 'none');
  }
};

module.exports = showInfo;
