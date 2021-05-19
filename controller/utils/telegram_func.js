'use strict';

const url = 'https://api.telegram.org/bot';
const ask = async (Message, chatId, fastify, keyboard, options) => {
  const mess = {
    chat_id: chatId,
    text: Message
  };

  if (keyboard === 'admin') {
    mess.reply_markup = {
      keyboard: [['Set meeting place'], ['Set meeting time'], ['Send message']]
    };
  } else if (keyboard === 'simple') {
    mess.reply_markup = {
      keyboard: [['tourist'], ['admin']]
    };
  } else if (keyboard === 'geo') {
    mess.reply_markup = {
      keyboard: [
        [{
          text: 'Send location',
          request_location: true
        }],
        [{
          text: 'Cancel operation'
        }
        ]
      ]
    };
  } else if (keyboard === 'place') {
    const buttons = [];
    options.forEach((opt) => {
      const button = [{ text: opt }];
      buttons.push(button);
    });
    mess.reply_markup = {
      keyboard: buttons
    };
  } else {
    mess.reply_markup = { remove_keyboard: true };
  }
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
