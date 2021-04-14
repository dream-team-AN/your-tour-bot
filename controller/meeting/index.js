'use strict';

const show = async (req, send) => {
  const chatId = req.body.message.chat.id;
  const sentMessage = req.body.message.text;
  console.log('-------------------------');
  console.log(sentMessage);
  console.log(chatId);
  return 'WAITING COMMAND';
};

const setTime = async (req, send) => {
  const chatId = req.body.message.chat.id;
  const sentMessage = req.body.message.text;
  console.log(sentMessage);
  console.log(chatId);
  console.log('-------------------------');
  return 'WAITING COMMAND';
};

const setPlace = async (req, send) => {
  const chatId = req.body.message.chat.id;
  const sentMessage = req.body.message.text;
  console.log('-------------------------');
  console.log(sentMessage);
  console.log(chatId);
  console.log('-------------------------');
  return 'WAITING COMMAND';
};

module.exports = {
  show,
  setPlace,
  setTime
};
