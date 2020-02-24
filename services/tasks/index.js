module.exports = function(fastify, opts, next) {
  // Create a new task and assign it to a project
  fastify.post('/api/tasks', (req, res) => {
    res.send()
  })

  // Get all tasks assigned to a person
  fastify.get('/api/tasks/:userId', (req, res) => {
    res.send()
  })

  // Update Task
  fastify.put('/api/tasks/:taskId', (req, res) => {
    res.send()
  })

  // Delete Task
  fastify.delete('/api/tasks/:taskId', (req, res) => {
    res.send()
  })

  // Add dependent to task (and notify user)
  fastify.put('/api/tasks/:ownTaskId/dependant/:dependantTaskId', (req, res) => {
    res.send()
  })

  // Change state of task
  fastify.put('/api/tasks/:taskId/state/:state', (req, res) => {
    res.send()
  })

  next()
}