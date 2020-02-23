const mongoose = require('mongoose');
const fp = require('fastify-plugin');

module.exports = fp(function(fastify, opts, next) {
  mongoose.connect(fastify.MONGOCONNECTION, { useNewUrlParser: true })
  .then(r => {
    fastify.log.info('Connected successfully to MongoDB!');

    next();
  })
  .catch(err => {
    fastify.log.error(err);
    process.exit(1);
  })
});
