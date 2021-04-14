'use strict';

const sendMessage = async (req, send) => {
  const chatId = req.body.message.chat.id;
  const sentMessage = req.body.message.text;
  console.log(sentMessage);
  console.log('message');
  return 'WAITING COMMAND';
};

module.exports = {
  sendMessage
};
