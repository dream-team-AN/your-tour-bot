'use strict';

const show = async (req, send) => {
  const request = require('request');
  const secret = require('@root/secret');

  const loc = req.body.message.location;
  const sentMessage = req.body.message.text;

  if (sentMessage !== 'Cancel operation') {
    const lat = loc.latitude;
    const lng = loc.longitude;
    const options = `key=${secret.weatherAPIKey}&q=${lat},${lng}&days=2&aqi=no&alerts=no`;
    const link = `https://api.weatherapi.com/v1/forecast.json?${options}`;

    await request(link, (error, response, body) => {
      console.error('error:', error);
      const region = JSON.parse(body).location.name;
      const state = JSON.parse(body).forecast.forecastday[0].day.condition.text;
      send(`Current weather in ${region} is ${state}`, 'none');
    });
  } else {
    send('Operation canceled. To receive weather please allow sending location.', 'none');
  }
  return 'WAITING COMMAND';
};

module.exports = {
  show
};
