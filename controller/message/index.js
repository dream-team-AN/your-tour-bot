'use strict';

const sendMessage = async (req, tour, send, users, forward) => {
  const messId = req.body.message.message_id;
  const chatId = req.body.message.chat.id;
  const Ydb = require('../../db/your-tour-bot');
  const yconn = await Ydb.connect();
  const Tourist = yconn.models.tourist;
  const Tour = yconn.models.tour;

  const trip = await Tour.findOne({ tour_name: tour.name, beginning_date: tour.date }, (err, docs) => {
    if (err) return console.error(err);
    return docs;
  });
  trip.tourists.forEach(async (tourist) => {
    const tourists = await Tourist.findOne({ _id: tourist }, (err, docs) => {
      if (err) return console.error(err);
      return docs;
    });
    await Ydb.disconnect();
    Object.entries(users).forEach(([chat, properties]) => {
      if (tourists.full_name === properties.name) {
        forward(chat, chatId, messId);
      }
    });
  });
  send(chatId, 'Ваше сообщение успешно доставлено.', 'admin');
  return 'WAITING COMMAND';
};

module.exports = {
  sendMessage
};
