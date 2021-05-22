'use strict';

const getIDs = require('./utils/mailing_service');

const sendMessage = async (message, tour, send, users, forward) => {
  const messId = message.message_id;
  const chatId = message.chat.id;

  const chatIDs = await getIDs(tour, users);

  for (const chat of chatIDs) {
    forward(chat, chatId, messId);
  }

  send(chatId, 'Ваше сообщение успешно доставлено.', 'admin');
  return 'WAITING COMMAND';
};

module.exports = {
  sendMessage
};
