module.exports = function(fastify, opts, next) {
  // Create a new task and assign it to a project
  fastify.post('/api/tasks/project/:projectId', {
    schema: {
      params: fastify.needsProjectId,
      body: fastify.taskCreation
    },
    preHandler: [
      fastify.isUserLoggedIn,
      fastify.isUserPartOfProject
    ]
  }, (req, res) => {

    if (!(req.role === fastify.USERROLES.PROJECTLEADER) || !(req.role === fastify.USERROLES.DEVELOPER)) {
      req.log.info(`${req.user._id} is not allowed to create a new task in project ${req.project._id}`)
      res.code(403)
        .send("User is not allowed to create a task in this project")
      return
    }

    const {
      title,
      description,
      state,
      dod,
      depends
    } = req.body

    let {
      owner,
    } = req.body

    // Rule: No tasks without an owner
    if (!owner) {
      owner = req.user._id
    }

    const newTask = new fastify.tasks({
      owner,
      title,
      description,
      state,
      dod,
      depends,
      lastmodified: Date.now()
    })

    newTask.save(err => {
      if (err) {
        req.log.warn('Unable to save new task')
        res.code(500)
          .save()
      } else {
        req.project.tasks.push(newTask._id)
        req.project.save(err => {
          if (err) {
            req.log.warn('Unable to append task to projects tasklist')
            // delete task again and notify user
            fastify.tasks.deleteOne({
              _id: newTask._id
            }, (err) => {
              if (err) {
                // Just write the information into the log for the admin
                req.log.error(`Failed to delete task ${newTask._id}`)
              }
              res.code(500)
                .send('Unkown Error. Could not create new task')
              return
            })
          } else {
            res.send()
            return
          }
        })
      }
    })
  })

  // Get all tasks assigned to a person
  fastify.get('/api/tasks/user/:userId', {
    schema: {
      params: fastify.needsUserId
    },
    preHandler: [
      fastify.isUserLoggedIn
    ]
  }, (req, res) => {
    fastify.tasks.find({
        owner: req.user._id
      })
      .lean(true)
      .select('-owner -dod')
      .then(tasks => {
        res.send({
          tasks
        })
      })
  })

  // Get task information
  fastify.get('/api/tasks/:taskId', {
    schema: {
      params: fastify.needsTaskId
    },
    preHandler: [
      fastiy.isUserLoggedIn,
      fastify.queryTask
    ]
  }, (req, res) => {
    if (!req.task) {
      res.code(404)
        .send('Task not found')
    } else {
      res.send(task)
    }
  })

  // Update Task (title, description, dod, timespent)
  fastify.put('/api/tasks/:taskId', {
    schema: {
      body: fastify.taskUpdateRestrictions,
      params: fastify.needsTaskId
    },
    preHandler: [
      fastify.isUserLoggedIn,
      fastify.queryTask
    ]
  }, (req, res) => {
    // Only the owner may update those
    if (req.task.owner._id !== req.user._id) {
      req.log.warn(`user ${req.user._id} tried to modify non-owned task ${req.task._id}`)
      res.code(403)
        .send('You are not allowed to modify this task')
      return
    }

    const {
      body,
      task
    } = req
    for (const prop in body) {
      switch (prop) {
        case 'title':
        case 'description':
          task[prop] = body[prop]
          break;
        case 'dod':
          task[prop] = [...body[prop]]
          break;
        case 'timespent':
          task[prop] += body[prop]
          break;
        default:
          req.log.warn(`Unkown property ${prop}`)
      }
    }

    task.lastmodified = Date.now()

    task.save(err => {
      if (err) {
        req.log.error('Failed to save updates in task ' + req.params.taskId)
        res.code(500)
          .send('Failed to update task. Please try again')
        return
      }
      res.send()
    })
  })

  // Add dependent to task (and notify user)
  fastify.put('/api/tasks/:taskId/dependant/:dependantTaskId', {
    schema: {
      params: fastify.needsTaskIdAndDependantId
    },
    preHandler: [
      fastify.isUserLoggedIn,
      fastify.queryTask
    ]
  }, (req, res) => {
    if (req.task.owner._id !== req.user._id) {
      req.log.warn(`user ${req.user._id} tried to modify non-owned task ${req.task._id}`)
      res.code(403)
        .send('You are not allowed to modify this task')
      return
    }

    req.task.depends = req.params.dependantTaskId
    req.timespent = Date.now()

    req.task.save(err => {
      if (err) {
        req.log.error('Failed to save dependant on task ' + req.params.taskId)
        res.code(500)
          .send('Failed to update dependant. Please try again')
        return
      }
      res.send()
    })
  })

  // Change state of task
  fastify.put('/api/tasks/:taskId/state/:state', {
    schema: {
      params: fastify.needsTaskIdAndNewState
    },
    preHandler: [
      fastify.isUserLoggedIn,
      fastify.queryTask
    ]
  }, (req, res) => {
    if (req.task.owner._id !== req.user._id) {
      req.log.warn(`user ${req.user._id} tried to modify non-owned task ${req.task._id}`)
      res.code(403)
        .send('You are not allowed to modify this task')
      return
    }

    req.task.state = req.params.state
    req.task.lastmodified = Date.now()

    req.task.save(err => {
      if (err) {
        req.log.error(`Failed to save state on task ${req.params.taskId}`)
        res.code(500)
          .send('Failed to update state. Please try again')
        return
      }
      res.send()
    })
  })

  // Delete Task
  fastify.delete('/api/tasks/:taskId', {
    schema: {
      params: fastify.needsTaskId
    },
    preHandler: [
      fastify.isUserLoggedIn
    ]
  }, (req, res) => {
    fastify.projects.findOne({
        tasks: req.params.taskId
      })
      .then(project => {
        project.tasks = projects.tasks.filter(task => task !== req.params.taskId)
        project.lastmodified = Date.now()
        project.save(err => {
          if (err) {
            req.log.warn(`Could not delete task ${req.params.taskId} from project ${project._id}`)
            res.code(500)
              .send('Failed to delete task. Please try again')
            return
          }
          fastify.projects.deleteOne({
            _id: req.params.taskId
          }, (deleted) => {
            if (deleted.ok !== 1) {
              req.log.warn(`Could not delete task ${req.params.taskId}`)
              res.code(500)
                .send('Error during deletion of task. Please consult an admin')
              return
            }
            res.send()
          })
        })
      })
  })

  next()
}