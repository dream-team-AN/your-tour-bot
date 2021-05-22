'use strict';

const Tour = require('../../repositories/your-tour-bot/tour');
const City = require('../../repositories/your-tour-bot/tour');

const getNames = async () => await Tour.getAll();

const getDates = async (trip) => await Tour.getSome({ tour_name: trip.name });

const getDays = async (trip) => {
  const days = [];
  const tour = await Tour.getOne({ _id: trip.id });
  for (let i = 0; i < tour.duration; i++) {
    days.push(i + 1);
  }
  return days;
};

const getPlaces = async (trip) => {
  const tour = await Tour.getOne({ _id: trip.id });
  const places = [];
  const cities = await City.getAll();
  cities.forEach((city) => {
    tour.cities.forEach((town) => {
      if (JSON.stringify(city._id) === JSON.stringify(town.city_id) && town.day.includes(trip.day)) {
        city.meeting_places.forEach((place) => {
          places.push(place.name);
        });
      }
    });
  });
  return places;
};

module.exports = {
  getNames,
  getDates,
  getDays,
  getPlaces
};
