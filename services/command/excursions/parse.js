'use strict';

const jsdom = require('jsdom');

const { JSDOM } = jsdom;

const parseDestinations = async (cities, beginningDate, send) => {
  const startDate = new Date(beginningDate);
  const currentDate = new Date();
  if (startDate.getUTCMonth() > (currentDate.getUTCMonth() + 1)) {
    const mes = 'Просмотр экскурсий для даного тура пока не доступен. '
      + 'Пожалуйста, обратитесь к сервису не ранее, чем за месяц до поездки';
    send(mes, 'none');
    return;
  }
  try {
    const dom = await JSDOM.fromURL('https://experience.tripster.ru/destinations/');
    const doc = dom.window.document;
    const destinations = Array.from(doc.getElementsByClassName('allcities__link'));
    for (const elem of destinations) {
      for (const item of cities) {
        const city = elem.textContent.slice(29);
        const linkCity = elem.href;
        if (city === item.name) {
          await parseCities(linkCity, city, startDate, item.day, send);
        }
      }
    }
  } catch (error) {
    console.error(error);
  }
};

const parseCities = async (linkCity, city, startDate, days, send) => {
  try {
    const dom = await JSDOM.fromURL(linkCity);
    const doc = dom.window.document;
    let counter = 0;
    const cities = Array.from(doc.querySelector('.list-wrap').getElementsByClassName('title'));
    for (const elem of cities) {
      if (counter < 2) {
        const excursion = elem.textContent;
        const linkExcursion = elem.href;
        counter++;
        await parseExcursions(linkExcursion, city, excursion, startDate, days, send);
      }
    }
  } catch (error) {
    console.error(error);
  }
};

const parseExcursions = async (linkExcursion, city, excursion, startDate, days, send) => {
  const formatDate = require('../utils/format');
  const months = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Ноябрь', 'Декабрь'];
  const excursionDate = [];
  days.forEach((jour) => {
    const exDate = new Date(startDate.valueOf());
    excursionDate.push(new Date(exDate.setUTCDate(exDate.getUTCDate() + (jour - 1))));
  });

  try {
    const dom = await JSDOM.fromURL(linkExcursion);
    const doc = dom.window.document;
    let flag = false;
    let price = 0;
    const date = [];
    excursionDate.forEach((exDate) => {
      Array.from(doc.getElementsByClassName('calendar-month'))
        .filter((el) => {
          const calendarTitle = `${months[exDate.getUTCMonth()]} ${exDate.getUTCFullYear()}`;
          return calendarTitle === el.querySelector('.title').textContent;
        })
        .map((el) => {
          Array.from(el.getElementsByTagName('td'))
            .filter((elem) => +elem.textContent.split(' ')[0].slice(0, -1) === exDate.getDate()
              && elem.textContent.split(' ')[1] !== undefined)
            .map((elem) => {
              price = +elem.textContent.split(' ')[1];
              flag = true;
              date.push(formatDate(new Date(exDate.getUTCFullYear(), exDate.getUTCMonth(), exDate.getUTCDate())));
              return date;
            });
          return el;
        });
    });
    if (flag) {
      const title = excursion;
      const description = doc.querySelector('.expage-content>div').textContent;
      const temp = doc.querySelector('.expage-content').textContent;
      const start = temp.lastIndexOf('Место встречи') + 14;
      const stop = temp.indexOf('Остались вопросы?');
      const place = doc.querySelector('.expage-content').textContent.slice(start, stop);
      const excurs = {
        title,
        city,
        date,
        place,
        price,
        description,
        link: linkExcursion
      };
      const { escape } = require('html-escaper');
      send(output(excurs, escape), 'none');
    }
  } catch (error) {
    console.error(error);
  }
};

const output = (ex, escape) => `
✨ ${ex.title} ✨\n

🏙 Город:  ${ex.city} \r
💶 Цена:  ${ex.price} €\r
📅 Дата:  ${ex.date} \r
📍 Место:  ${escape(ex.place)} \r
🔗 Ссылка:  ${ex.link} \n\n
🖌 Описание:  ${escape(ex.description)}`;

module.exports = { parseDestinations };
