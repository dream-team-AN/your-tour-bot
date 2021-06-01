'use strict';

const {
  getNames, getDates, getDays, getPlaces
} = require('./getting_tour_info_service');

const getKeyboard = async (keyboard, trip) => {
  let markup;
  switch (keyboard) {
    case 'admin': {
      markup = {
        keyboard: [['Set meeting place'], ['Set meeting time'], ['Send message']]
      };
      break;
    }
    case 'simple': {
      markup = {
        keyboard: [['tourist'], ['admin']]
      };
      break;
    }
    case 'geo': {
      markup = {
        keyboard: [
          [{
            text: 'Send location',
            request_location: true
          }],
          [{
            text: 'Cancel operation'
          }
          ]
        ]
      };
      break;
    }
    case 'place': {
      const buttons = [];
      const places = await getPlaces(trip);
      places.forEach((place) => {
        const button = [{ text: place }];
        buttons.push(button);
      });
      markup = {
        keyboard: buttons
      };
      break;
    }
    case 'name': {
      const buttons = [];
      const names = await getNames();
      names.forEach((name) => {
        const button = [{ text: name }];
        buttons.push(button);
      });
      markup = {
        keyboard: buttons
      };
      break;
    }
    case 'date': {
      const buttons = [];
      const dates = await getDates(trip);
      dates.forEach((date) => {
        const button = [{ text: date }];
        buttons.push(button);
      });
      markup = {
        keyboard: buttons
      };
      break;
    }
    case 'day': {
      const buttons = [];
      const days = await getDays(trip);
      days.forEach((day) => {
        const button = [{ text: day }];
        buttons.push(button);
      });
      markup = {
        keyboard: buttons
      };
      break;
    }
    default: {
      markup = { remove_keyboard: true };
    }
  }

  return markup;
};

module.exports = getKeyboard;
