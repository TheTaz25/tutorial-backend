const fp = require('fastify-plugin');

module.exports = fp(function(fastify, opts, next) {
  fastify.decorate('MONGOCONNECTION', 'mongodb://mongo:27017/tutorial');

  next();
});
