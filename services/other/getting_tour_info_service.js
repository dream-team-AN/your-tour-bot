'use strict';

const Tour = require('../../repositories/your-tour-bot/tour');
const City = require('../../repositories/your-tour-bot/city');
const { formatDate } = require('./date_service');

const getNames = async () => {
  const tours = await Tour.getAll();
  const names = [];
  for (const tour of tours) { names.push(tour.tour_name); }
  return names;
};

const getDates = async (trip) => {
  const tours = await Tour.getSome({ tour_name: trip.name });
  const dates = [];
  for (const tour of tours) { dates.push(formatDate(tour.beginning_date, true)); }
  return dates;
};

const getDays = async (trip) => {
  const days = [];
  const tour = await Tour.getOne({ tour_name: trip.name, beginning_date: trip.date });
  for (let i = 0; i < tour.duration; i++) {
    days.push(i + 1);
  }
  return days;
};

const getPlaces = async (trip) => {
  const tour = await Tour.getOne({ tour_name: trip.name, beginning_date: trip.date });
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
