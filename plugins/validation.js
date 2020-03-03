const fp = require('fastify-plugin')

module.exports = fp(function(fastify, opts, next) {
  // schema validator for login and register requests in auth-routes
  // makes sure that the request contains username and password properties in body
  fastify.decorate('userAndPassInBody', {
    type: 'object',
    required: ['username', 'password'],
    properties: {
      username: {
        type: 'string'
      },
      password: {
        type: 'string'
      }
    }
  })

  // How the body should look like when creating a new project
  fastify.decorate('projectCreation', {
    type: 'object',
    required: ['members', 'title'],
    properties: {
      members: {
        type: 'array',
        maxItems: 1
      },
      title: {
        type: 'string'
      },
      description: {
        type: 'string'
      }
    }
  })

  // Restrict query parameters when querying for projects
  // TODO: After being sure everyhing works, enable strictmode
  fastify.decorate('needsProjectId', {
    type: 'object',
    required: ['projectId'],
    properties: {
      projectId: {
        type: 'string'
      }
    }
  })

  // On how the response should look like when requesting a task
  fastify.decorate('taskResponse', {
    type: 'object',
    properties: {
      _id: {
        type: 'string'
      }
    }
  })



  // On how the response should look like when requesting a project
  fastify.decorate('projectResponse', {
    type: 'object',
    properties: {
      _id: {
        type: 'string'
      }
    }
  })

  next()
})