'use strict';

const User = require('../controllers/user');

module.exports = async (fastify, opts) => { // eslint-disable-line no-unused-vars
  fastify.get('/', () => ({ root: true }));

  fastify.post('/', async (req, res) => {
    if (!req.body.message || !req.body.message.chat || !req.body.message.chat.id) return;
    const chatId = req.body.message.chat.id;
    const sentMessage = req.body.message.text;
    if (!User[chatId]) {
      await User.init(chatId);
    }
    try {
      User.setStatus(sentMessage, chatId);
      User.setName(chatId, sentMessage);
      User.callCommand(req.body.message, fastify, (answer, code) => { res.status(code).send(answer); });
      res.status(200);
    } catch (err) {
      console.error(err);
      res.status(500).send(err);
    }
  });
};
