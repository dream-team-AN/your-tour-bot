'use strict';

module.exports = (fastify, opts, next) => { // eslint-disable-line no-unused-vars
  fastify.route({
    method: 'GET',
    url: '/',
    handler: async () => ({ root: true })
  });
  next();
};
