'use strict';

const jsdom = require('jsdom');
const fs = require('fs');

const { JSDOM } = jsdom;

// const cities = ['Лондон', 'Париж', 'Рим'];

const parseDestinations = async (cities, beginningDate, send) => {
  const startDate = new Date(beginningDate);
  // citiesArrOfObj.forEach((city)=>{

  // })
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
  const months = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Ноябрь', 'Декабрь'];
  const excursionDate = [];
  days.forEach((jour) => {
    excursionDate.push(new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + jour));
  });
  console.log(excursionDate);

  JSDOM.fromURL(linkExcursion).then((dom) => {
    const doc = dom.window.document;
    let flag = false;
    let price = 0;
    const date = [];
    excursionDate.forEach((exDate) => {
      Array.from(doc.getElementsByClassName('calendar-month')).forEach((el) => {
        const calendarTitle = `${months[exDate.getMonth()]} ${exDate.getFullYear()}`;
        if (calendarTitle === el.querySelector('.title').textContent) {
          Array.from(el.getElementsByTagName('td')).forEach((elem) => {
            if (+elem.textContent.split(' ')[0].slice(0, -1) === exDate.getDate()
            && elem.textContent.split(' ')[1] !== undefined) {
              price = +elem.textContent.split(' ')[1];
              flag = true;
              date.push(formatDate(new Date(exDate.getFullYear(), exDate.getMonth(), exDate.getDate())));
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
        description
      };
      send(excurs, 'none');
    }
  }).catch((error) => {
    console.error(error);
  });
};

const formatDate = (date) => {
  let dd = date.getDate();
  if (dd < 10) dd = `0${dd}`;

  let mm = date.getMonth() + 1;
  if (mm < 10) mm = `0${mm}`;

  const yy = date.getFullYear();

  return `${dd}.${mm}.${yy}`;
};

module.exports = { parseDestinations };
