module.exports = function(fastify, opts, next) {
  // Create a new project
  fastify.post('/api/projects', {
    schema: {
      body: fastify.projectCreation
    }
  }, (req, res) => {
    res.send()
  })

  // Get a list of all/filtered projects
  fastify.get('/api/projects', {}, (req, res) => {
    res.send()
  })

  // Get a specific project
  fastify.get('/api/projects/:projectId', {}, (req, res) => {
    res.send()
  })

  // Get all tasks in a project
  fastify.get('/api/projects/:projectId/tasks', {}, (req, res) => {
    res.send()
  })

  // Set Information on a project
  fastify.put('/api/projects/:projectId', {}, (req, res) => {
    res.send()
  })

  // Delete a project forever
  fastify.delete('/api/projects/:projectId', {}, (req, res) => {
    res.send()
  })

  next()
}