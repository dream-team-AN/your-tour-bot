'use strict';

require('module-alias/register');
const path = require('path');
const AutoLoad = require('fastify-autoload');
const mongoose = require('mongoose');

module.exports = async (fastify, opts) => { // eslint-disable-line no-unused-vars
  require('dotenv').config();
  mongoose.connect(`mongodb+srv://bot:${process.env.BD_PASSWORD}@${process.env.CLUSTER}`, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  });
  mongoose.connection.on('error', (err) => {
    console.error('Error occurred during an attempt to establish connection with the database: %O');
    console.error(err);
  });

  // This loads all plugins defined in plugins
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'plugins')
  });

  // This loads all plugins defined in routes
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'routes')
  });

  fastify.register(require('fastify-http-client'));
};
