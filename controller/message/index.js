'use strict';

const sendMessage = async (req, tour, send, users, forward) => {
  const messId = req.body.message.message_id;
  const chatId = req.body.message.chat.id;
  const getIDs = require('../utils/mailing');
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
