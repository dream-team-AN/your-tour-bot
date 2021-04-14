'use strict';

const show = async (req, reply) => {
  const request = require('request');
  console.log(req.body.message.text);
  console.log('time');

  let tim;
  request('http://api.timezonedb.com/v2.1/get-time-zone?key=UB2JECGE3IYG&format=json&'
  + 'by=position&lat=55.689247&lng=22.044502', (error, response, body) => {
    console.error('error:', error);
    console.log('body:', JSON.parse(body).formatted);
    tim = JSON.parse(body).formatted;
  });
  await console.log(`tim:     ${tim}`);

  return ['WAITING COMMAND'];
};

module.exports = {
  show
};
