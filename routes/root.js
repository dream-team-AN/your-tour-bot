'use strict';

module.exports = (fastify, next) => {
  fastify.route({
    method: 'GET',
    url: '/',
    handler: async () => ({ root: true })
  });

  next();
};
