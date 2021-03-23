'use strict';

module.exports = (fastify, opts, next) => {
  fastify.route({
    method: 'GET',
    url: '/',
    handler: async () => ({ root: true })
  });
  next();
};
