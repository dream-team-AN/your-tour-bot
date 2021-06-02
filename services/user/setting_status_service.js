'use strict';

const Traveler = require('../../repositories/meeting-bot/traveler');

const setState = async (chatId, state) => Traveler.updateOne({ chat_id: chatId }, { state });

const setCommand = async (chatId, command) => Traveler.updateOne({ chat_id: chatId }, { command });

const setName = async (chatId, name) => Traveler.updateOne({ chat_id: chatId }, { name });

const setAllNull = async (chatId) => Traveler.create(
  {
    chat_id: chatId,
    command: 'none',
    state: 'WAITING COMMAND',
    name: 'unknown'
  }
);

const get = async (chatId) => await Traveler.getOne({ chat_id: chatId });

module.exports = {
  setState, setCommand, setName, setAllNull, get
};
