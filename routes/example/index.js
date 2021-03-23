'use strict';

module.exports = async (fastify) => {
  fastify.get('/', async () => 'some code');
};
