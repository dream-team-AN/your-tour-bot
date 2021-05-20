'use strict';

const sendMessage = async (req, tour, send, users, forward) => {
  const messId = req.body.message.message_id;
  const chatId = req.body.message.chat.id;
  const sendMessageForMany = require('../utils/mailing');
  const forwarding = (tourists) => {
    Object.entries(users).forEach(([chat, properties]) => {
      if (tourists.full_name === properties.name) {
        forward(chat, chatId, messId);
      }
    });
  };
  sendMessageForMany(tour, users, forwarding);

  send(chatId, 'Ваше сообщение успешно доставлено.', 'admin');
  return 'WAITING COMMAND';
};

module.exports = {
  sendMessage
};
