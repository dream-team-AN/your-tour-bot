'use strict';

const choose = async (tour, ask) => {
  const Ydb = require('../../db/your-tour-bot');
  const yconn = await Ydb.connect();
  const City = yconn.models.city;
  const Tour = yconn.models.tour;

  const trip = await Tour.findOne({ _id: tour.id }, (err, docs) => {
    if (err) return console.error(err);
    return docs;
  });
  const places = [];
  await City.find({}, (err, docs) => {
    if (err) return console.error(err);
    docs.forEach((city) => {
      trip.cities.forEach((town) => {
        if (String(city._id) === String(town.city_id) && town.day.includes(tour.day)) {
          city.meeting_places.forEach((place) => {
            places.push(place.name);
          });
          ask(places);
        }
      });
    });
    return docs;
  });
  return places;
};
module.exports = { choose };
