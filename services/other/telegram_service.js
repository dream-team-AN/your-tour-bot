'use strict';

const getKeyboard = require('./keyboard_service');

const url = 'https://api.telegram.org/bot';
const ask = async (Message, chatId, fastify, keyboard, tour) => {
  const mess = {
    chat_id: chatId,
    text: Message,
    reply_markup: await getKeyboard(keyboard, tour)
  };
  await fastify.httpclient.request(`${url}${process.env.TOKEN}/sendMessage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    content: JSON.stringify(mess)
  });
};

const forward = async (chatId, fromChatId, messageId, fastify) => {
  const mess = {
    chat_id: chatId,
    from_chat_id: fromChatId,
    message_id: messageId
  };
  await fastify.httpclient.request(`${url}${process.env.TOKEN}/forwardMessage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    content: JSON.stringify(mess)
  });
};

const sendLocation = async (chatId, lat, lng, fastify) => {
  const mess = {
    chat_id: chatId,
    latitude: lat,
    longitude: lng
  };
  await fastify.httpclient.request(`${url}${process.env.TOKEN}/sendLocation`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    content: JSON.stringify(mess)
  });
};

module.exports = {
  ask,
  sendLocation,
  forward
};
