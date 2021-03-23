'use strict';

module.exports = async (fastify) => {
  fastify.get('/', async (request, reply) => 'some code');
};
