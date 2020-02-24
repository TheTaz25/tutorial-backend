const mongoose = require('mongoose')
const fp = require('fastify-plugin')

const User = mongoose.model('user')
const Project = mongoose.model('project')
const Task = mongoose.model('task')
const Log = mongoose.model('log')

module.exports = fp(function(fastify, opts, next) {
  mongoose.connect(fastify.MONGOCONNECTION, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    .then(r => {
      fastify.log.info('Connected successfully to MongoDB!')
      fastify.decorate('users', User)
      fastify.decorate('projects', Project)
      fastify.decorate('tasks', Task)
      fastify.decorate('log', Log)
      next()
    })
    .catch(err => {
      fastify.log.error(err)
      process.exit(1)
    })
});