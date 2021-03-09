"use strict";

module.exports = function (fastify, opts, next) {
  fastify.route({
    method: "GET",
    url: "/",
    handler: async (request, reply) => {
      return { root: true };
    },
  });

  next();
};
