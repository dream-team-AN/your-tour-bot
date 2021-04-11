'use strict';

const show = async (req, reply) => {
  console.log('-------------------------');
  console.log(req.body.message.text);
  console.log(req.body.message.chat.id);
  return 'WAITING COMMAND';
};

const setTime = async (req, reply) => {
  console.log(req.body.message.text);
  console.log(req.body.message.chat.id);
  console.log('-------------------------');
  return 'WAITING COMMAND';
};

const setPlace = async (req, reply) => {
  console.log('-------------------------');
  console.log(req.body.message.text);
  console.log(req.body.message.chat.id);
  console.log('-------------------------');
  return 'WAITING COMMAND';
};

module.exports = {
  show,
  setPlace,
  setTime
};
