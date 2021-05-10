'use strict';

const sendMessage = async (req, tour, send, users, forward) => {
  const Tour = require('../../models/tour');
  const Tourist = require('../../models/tourist');
  const messId = req.body.message.message_id;
  const chatId = req.body.message.chat.id;
  const Ydb = require('../../db/your-tour-bot');

  Ydb.connect();
  const trip = await Tour.findOne({ tour_name: tour.name, beginning_date: tour.date }, (err, docs) => {
    if (err) return console.error(err);
    return docs;
  });
  trip.tourists.forEach(async (tourist) => {
    await Tourist.find({}, (err, docs) => {
      if (err) return console.error(err);
      return docs;
    });
    await Tourist.findOne({ _id: tourist }, (err, docs) => {
      if (err) return console.error(err);

      Object.entries(users).forEach(([chat, properties]) => {
        if (docs.full_name === properties.name) {
          forward(chat, chatId, messId);
        }
      });
      return docs;
    });
  });
  Ydb.disconnect();
  send(chatId, 'Ваше сообщение успешно доставлено.', 'admin');
  return 'WAITING COMMAND';
};

module.exports = {
  sendMessage
};
