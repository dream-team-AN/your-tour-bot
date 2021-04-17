'use strict';

const show = async (req, send) => {
  const chatId = req.body.message.chat.id;
  const sentMessage = req.body.message.text;
  send('show', 'none');
  return 'WAITING COMMAND';
};

const setTime = async (req, tour, send) => {
  const chatId = req.body.message.chat.id;
  send('set time', 'none', chatId);
  return 'WAITING COMMAND';
};

const setPlace = async (req, tour, send) => {
  const chatId = req.body.message.chat.id;
  const sentMessage = req.body.message.text;
  send('set place', 'none', chatId);
  return 'WAITING COMMAND';
};

module.exports = {
  show,
  setPlace,
  setTime
};
