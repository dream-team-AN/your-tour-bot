'use strict';

const show = async (req, send, users) => {
  const chatId = req.body.message.chat.id;
  const sentMessage = req.body.message.text;
  send('show', 'none');
  return 'WAITING COMMAND';
};

module.exports = {
  show
};
