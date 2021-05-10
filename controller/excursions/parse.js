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
  JSDOM.fromURL('https://experience.tripster.ru/destinations/').then(async (dom) => {
    const doc = dom.window.document;
    Array.from(doc.getElementsByClassName('allcities__link')).forEach(async (elem) => {
      cities.forEach(async (item) => {
        const city = elem.textContent.slice(29);
        const linkCity = elem.href;
        if (city === item.name) {
          await parseCities(linkCity, city, startDate, item.day, send);
        }
      });
    });
  }).catch((error) => {
    console.error(error);
  });
};

const parseCities = async (linkCity, city, startDate, days, send) => {
  JSDOM.fromURL(linkCity).then(async (dom) => {
    const doc = dom.window.document;
    let counter = 0;
    Array.from(doc.querySelector('.list-wrap').getElementsByClassName('title')).forEach(async (elem) => {
      if (counter < 2) {
        const excursion = elem.textContent;
        const linkExcursion = elem.href;
        counter++;
        await parceExcursions(linkExcursion, city, excursion, startDate, days, send);
      }
    });
  }).catch((error) => {
    console.error(error);
  });
};

const parceExcursions = async (linkExcursion, city, excursion, startDate, days, send) => {
  const Format = require('../utils/format');
  const months = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Ноябрь', 'Декабрь'];
  const excursionDate = [];
  days.forEach((jour) => {
    const exDate = new Date(startDate.valueOf());
    excursionDate.push(new Date(exDate.setUTCDate(exDate.getUTCDate() + (jour - 1))));
  });

  JSDOM.fromURL(linkExcursion).then((dom) => {
    const doc = dom.window.document;
    let flag = false;
    let price = 0;
    const date = [];
    excursionDate.forEach((exDate) => {
      Array.from(doc.getElementsByClassName('calendar-month')).forEach((el) => {
        const calendarTitle = `${months[exDate.getUTCMonth()]} ${exDate.getUTCFullYear()}`;
        if (calendarTitle === el.querySelector('.title').textContent) {
          Array.from(el.getElementsByTagName('td')).forEach((elem) => {
            if (+elem.textContent.split(' ')[0].slice(0, -1) === exDate.getDate()
            && elem.textContent.split(' ')[1] !== undefined) {
              price = +elem.textContent.split(' ')[1];
              flag = true;
              date.push(Format.formatDate(new Date(exDate.getUTCFullYear(), exDate.getUTCMonth(), exDate.getUTCDate())));
            }
          });
        }
      });
    });
    if (flag) {
      const title = excursion;
      const description = doc.querySelector('.expage-content>div').textContent;
      const temp = doc.querySelector('.expage-content').textContent;
      const start = temp.lastIndexOf('Место встречи');
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
      send(output(excurs), 'none');
    }
  }).catch((error) => {
    console.error(error);
  });
};

const output = (ex) => `
✨ ${ex.title} ✨\n

🏙 Город:  ${ex.city} \r
💶 Цена:  ${ex.price} \r
📅 Дата:  ${ex.date} \r
📍 Место:  ${ex.place.replace(/\\n/g, '/n').replace(/\\t/, '/t')} \r
🔗 Ссылка:  ${ex.link} \n\n
🖌 Описание:  ${ex.description.replace(/\\n/g, '/n').replace(/\\t/, '/t')}`;

module.exports = { parseDestinations };
