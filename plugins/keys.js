const fp = require('fastify-plugin');

module.exports = fp(function(fastify, opts, next) {
  fastify.decorate('MONGOCONNECTION', 'mongodb://localhost:27017/tutorial')
  fastify.decorate('TOKENSECRET', 'poTaToEhEaD')
  fastify.decorate('USERROLES', {
    USER: 'user',
    PROJECTLEADER: 'projectleader',
    DEVELOPER: 'developer',
    STAKEHOLDER: 'stakeholder'
  })
  fastify.decorate('TASKSTATES', {
    NOT_STARTED: 'notstarted',
    STARTED: 'started',
    FINISHED: 'finished',
    WAITING: 'waiting',
    PAUSED: 'paused'
  })
  next()
})