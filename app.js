'use strict';

const path = require('path');
const AutoLoad = require('fastify-autoload');

module.exports = async (fastify, opts) => {
  // This loads all plugins defined in plugins
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'plugins'),
    options: { opts }
  });

  // This loads all plugins defined in routes

  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'routes'),
    options: { opts }
  });
  fastify.register(require('fastify-http-client'));
};
