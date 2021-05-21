'use strict';

const path = require('path');
const AutoLoad = require('fastify-autoload');

module.exports = async (fastify, opts) => { // eslint-disable-line no-unused-vars
  // This loads all plugins defined in plugins
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'plugins')
  });

  // This loads all plugins defined in routes
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'routes')
  });

  fastify.register(require('fastify-http-client'));

  const Ydb = require('./db/your-tour-bot');
  await Ydb.connect();
  const Mdb = require('./db/meeting-bot');
  await Mdb.connect();

  const Cron = Mdb.conn.models.cron;
  let jobs = await Cron.find({}, (err, docs) => {
    if (err) return console.error(err);
    return docs;
  });
  const { initialCreateJob } = require('./controller/utils/create_job');
  jobs = jobs.filter((job) => job.date >= Date.now);
  const { ask } = require('./controller/utils/telegram_func');
  const send = (chat, Message, keyboard) => {
    ask(Message, chat, fastify, keyboard);
  };
  for (const job of jobs) {
    initialCreateJob(job.mins, send, job.date, job.chatId);
  }

  const dotenv = require('dotenv');
  dotenv.config();
  const link = `https://api.telegram.org/bot${process.env.TOKEN}/setWebhook?url=https://api-your-tour-bot.vercel.app/`;
  const request = require('request');
  await request(link);
};
