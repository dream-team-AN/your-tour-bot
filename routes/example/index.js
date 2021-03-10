module.exports = async function (fastify, opts) {
  fastify.get('/', async (request, reply) => 'this is an example');
};
