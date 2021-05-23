'use strict';

const path = require('path');
const AutoLoad = require('fastify-autoload');
const httpClient = require('fastify-http-client');
const dotenv = require('dotenv');
const request = require('request');
const Ydb = require('./db/your-tour-bot');
const Mdb = require('./db/meeting-bot');
const { initialCreateJob } = require('./services/command/utils/create_job_service');
const { ask } = require('./services/other/telegram_service');
const Cron = require('./repositories/meeting-bot/cron');

module.exports = async (fastify, opts) => { // eslint-disable-line no-unused-vars
  // This loads all plugins defined in plugins
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'plugins')
  });

  // This loads all plugins defined in routes
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'routes')
  });

  dotenv.config();

  fastify.register(httpClient);

  await Ydb.connect();

  await Mdb.connect();

  let jobs = await Cron.getAll();
  // eslint-disable-next-line no-console
  console.log(jobs);
  jobs = jobs.filter((job) => job.date >= Date.now);

  const send = (chat, Message, keyboard) => {
    ask(Message, chat, fastify, keyboard);
  };
  for (const job of jobs) {
    initialCreateJob(job.mins, send, job.date, job.chatId);
  }

  const link = `https://api.telegram.org/bot${process.env.TOKEN}/setWebhook?url=https://01a02f6ab726.ngrok.io/`;
  await request(link);
};
