'use strict';

const showInfo = require('../utils/show_weather_api');

const show = async (message, send) => {
  await showInfo(message, send, sendWeather);
  return 'WAITING COMMAND';
};

const sendWeather = (body, send) => {
  const day1 = output(JSON.parse(body).forecast.forecastday[0]);
  const day2 = output(JSON.parse(body).forecast.forecastday[1]);
  const today = `📅 Сегодня: ${JSON.parse(body).forecast.forecastday[0].date}\n`;
  const tomorrow = `📆 Завтра: ${JSON.parse(body).forecast.forecastday[1].date}\n`;

  send(`${today}${day1}\n${tomorrow}${day2}`, 'none');
};

const output = (d) => `${d.day.condition.text}\n
🌡 Max: ${d.day.maxtemp_c} °C\r
🌡 Min: ${d.day.mintemp_c} °C\r
💨 Ветер: ${d.day.maxwind_kph} км/час\r
☔️ Осадки: ${d.day.totalprecip_mm} мм\r
💦 Влажность: ${d.day.avghumidity}  %\r
🌧 Вероятность дождя: ${d.day.daily_chance_of_rain} %\r
🌨 Вероятность снега: ${d.day.daily_chance_of_snow} %\r
🌅 Рассвет: ${d.astro.sunrise}\r
🌄 Закат: ${d.astro.sunset}\n`;

module.exports = {
  show
};
