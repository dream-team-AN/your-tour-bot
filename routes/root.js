'use strict';

module.exports = (fastify, next) => {
  fastify.route({
    method: 'GET',
    url: '/',
    handler: async (request, reply) => ({ root: true })
  });
  next();
};
