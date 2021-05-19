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
};
