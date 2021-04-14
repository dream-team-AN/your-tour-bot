'use strict';

const show = async (req, send) => {
  const chatId = req.body.message.chat.id;
  const sentMessage = req.body.message.text;
  console.log(sentMessage);
  console.log('excursions');
  return 'WAITING COMMAND';
};

module.exports = {
  show
};
