'use strict';

const show = async (req, send) => {
  const chatId = req.body.message.chat.id;
  const sentMessage = req.body.message.text;
  return 'WAITING COMMAND';
};

const setTime = async (req, send) => {
  const chatId = req.body.message.chat.id;
  return 'WAITING COMMAND';
};

const setPlace = async (req, send) => {
  const sentMessage = req.body.message.text;
  return 'WAITING COMMAND';
};

module.exports = {
  show,
  setPlace,
  setTime
};
