'use strict';

module.exports = async (fastify, opts) => { // eslint-disable-line no-unused-vars
  fastify.register(require('fastify-http-client'));
  fastify.get('/', () => ({ root: true }));

  fastify.post('/', async (req, res) => {
    const User = require('../controllers/user');
    if (!req.body.message || !req.body.message.chat || !req.body.message.chat.id) return;
    const chatId = req.body.message.chat.id;
    const sentMessage = req.body.message.text;
    if (!User[chatId]) {
      await User.init(chatId);
    }
    try {
      User.setStatus(sentMessage, chatId);
      User.setName(chatId, sentMessage);
      User.callCommand(req, res, chatId, fastify);
    } catch (err) {
      console.error(err);
      res.status(500).send(err);
    }
  });
};
