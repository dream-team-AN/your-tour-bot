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

    await request(link, (error, response, body) => { // eslint-disable-line no-unused-vars
      console.error('error:', error);
      const region = JSON.parse(body).location.name;
      const state = JSON.parse(body).forecast.forecastday[0].day.condition.text;
      console.log(JSON.parse(body).forecast.forecastday[0]);
      const day1 = output(JSON.parse(body).forecast.forecastday[0]);
      const day2 = output(JSON.parse(body).forecast.forecastday[1]);
      const today = `📅 Today: ${JSON.parse(body).forecast.forecastday[0].date}\n`;
      const tomorrow = `📆 Tomorrow: ${JSON.parse(body).forecast.forecastday[1].date}\n`;

      send(`${today}${day1}\n${tomorrow}${day2}`, 'none');
    });
  } else {
    send('Operation canceled. To receive weather please allow sending location.', 'none');
  }
  return 'WAITING COMMAND';
};

const output = (d) => `${d.day.condition.text}\n
🌡 max: ${d.day.maxtemp_c} °C\r
🌡 min: ${d.day.mintemp_c} °C\r
💨 wind: ${d.day.maxwind_kph} km per hour\r
☔️ total precipitation: ${d.day.totalprecip_mm} mm\r
💦 humidity: ${d.day.avghumidity}  %\r
🌧 chance of rain: ${d.day.daily_will_it_rain} %\r
🌨 chance of snow: ${d.day.daily_chance_of_snow} %\r
🌅 sunrise: ${d.astro.sunrise}\r
🌄 sunset: ${d.astro.sunset}\n`;
module.exports = {
  show
};
