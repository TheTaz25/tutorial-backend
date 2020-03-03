const fp = require('fastify-plugin');

module.exports = fp(function(fastify, opts, next) {
  fastify.decorate('MONGOCONNECTION', 'mongodb://localhost:27017/tutorial')
  fastify.decorate('TOKENSECRET', 'poTaToEhEaD')
  fastify.decorate('USERROLES', {
    USER: 'user', // SEE EVERYTHING
    PROJECTLEADER: 'projectleader', // SEE, WRITE, DELETE EVERYTHING
    DEVELOPER: 'developer', // WRITE, ADD, SEE TASKS && SEE EVERYTHING
  })
  fastify.decorate('TASKSTATES', {
    NOT_STARTED: 'notstarted',
    STARTED: 'started',
    FINISHED: 'finished',
    WAITING: 'waiting',
    TESTING: 'testing',
    PAUSED: 'paused'
  })
  next()
})