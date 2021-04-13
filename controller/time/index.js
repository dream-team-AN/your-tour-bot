'use strict';

const show = async (req, reply) => {
  console.log(req.body.message.text);
  console.log('time');
  const date = new Date();
  console.log(`!!!!!!!!!!!!!!${date.getHours()}${date.getMinutes()}`);
  // const timezone = require('node-google-timezone');

  // const timestamp = Date.now();
  // // time as seconds since midnight, January 1, 1970 UTC

  // console.log(new Date(timestamp * 1000));
  // // => Fri Jun 13 2014 00:15:05 GMT-0300 (BRT)

  // // somewhere in New York
  // const lat = 55.077407;
  // const lng = 22.741957;

  // timezone.key('AIzaSyDgdUIu7gWU4DcMYKG3ENjLjh8okc7ulek'); // optional

  // // timezone.language('es'); // optional: default 'en'

  // timezone.data(lat, lng, timestamp, (err, tz) => {
  //   console.log(tz.raw_response);
  //   //= > { dstOffset: 3600,
  //   //     rawOffset: -18000,
  //   //     status: 'OK',
  //   //     timeZoneId: 'America/New_York',
  //   //     timeZoneName: 'Eastern Daylight Time' }

  //   console.log(tz.local_timestamp);
  //   // => 1402614905

  //   const d = new Date(tz.local_timestamp * 1000);

  //   console.log(`##########${d.toDateString()} - ${d.getHours()}:${d.getMinutes()}`);
  // => Thu Jun 12 2014 - 20:15
  // });
  return ['WAITING COMMAND'];
};

module.exports = {
  show
};
