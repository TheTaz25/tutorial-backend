module.exports = function(fastify, opts, next) {
  // Create a new project
  fastify.post('/api/projects', {
    schema: {
      body: fastify.projectCreation
    },
    preHandler: [
      fastify.isUserLoggedIn
    ]
  }, (req, res) => {
    // Destruct body
    const {
      members,
      title,
      description
    } = req.body

    // Create new member (leader of project)
    const projectLeader = new fastify.members({
      memberId: members[0],
      role: fastify.USERROLES.PROJECTLEADER
    })

    // Save ProjectLeader
    projectLeader.save(err => {
      if (err) {
        res.code(500)
          .send('Internal Server Error (Could not create new Project-Leader in database)')
        return
      }

      // Create new Project
      const newProject = new fastify.projects({
        title,
        description: description || '',
        members: [projectLeader._id],
        lastmodified: Date.now()
      })

      // Save new project
      newProject.save(err => {
        if (err) {
          // In case of an unsuccessfull project save, delete the created projectleader
          res.code(500)
            .send('Internal Server Error (Could not create new Project in database)')
          fastify.members.deleteOne({
              _id: projectLeader._id
            })
            .then(err => {
              fastify.log.error('Could not delete projectLeader after unsuccessfull project creation with id' + projectLeader._id)
            })
          return
        }
        res.code(201)
          .send()
      })
    })
  })

  // Get a list of all/filtered projects
  fastify.get('/api/projects', {
    preHandler: [
      fastify.isUserLoggedIn
    ]
  }, (req, res) => {
    const {
      query
    } = req

    const narrowToMembers = req.user.isAdmin ? undefined : {
      "members": {
        $in: req.user._id
      }
    }

    fastify.projects
      .find({
        ...narrowToMembers,
        ...query
      })
      .select('-members -tasks')
      .lean()
      .then(projects => {
        res.send(projects)
      })
      .catch(err => {
        fastify.log.warn(err)
        res.code(500)
          .send("Internal Server Error")
      })
  })

  // Get a specific project
  fastify.get('/api/projects/:projectId', {
    preHandler: [
      fastify.isUserLoggedIn,
      fastify.isUserPartOfProject
    ],
    schema: {
      params: fastify.needsProjectId
    }
  }, (req, res) => {
    if (req.project)
      res.send(req.project)
    else
      res.code(404)
      .send("Project not found")
  })

  // Get all tasks in a project
  fastify.get('/api/projects/:projectId/tasks', {
    preHandler: [
      fastify.isUserLoggedIn,
      fastify.isUserPartOfProject
    ],
    schema: {
      params: fastify.needsProjectId
    }
  }, (req, res) => {
    if (req.project)
      res.send({
        tasks: [...req.project.tasks]
      })
    else
      res.code(404)
      .send('Project not found')
  })

  // Set Information on a project
  fastify.put('/api/projects/:projectId', {
    preHandler: [
      fastify.isUserLoggedIn,
      fastify.isUserPartOfProject
    ],
    schema: { // TODO: needs body-schema-validator
      params: fastify.needsProjectId
    }
  }, (req, res) => {
    /*
      CRUD ALL -> PROJECT-LEADER-ONLY
      NEW TASKS -> DEVS
      NO PUT FOR USERS
    */
    res.send()
  })

  // Delete a project forever
  fastify.delete('/api/projects/:projectId', {}, (req, res) => {
    /*
      CRUD ALL -> PROJECT-LEADER-ONLY
    */
    res.send()
  })

  next()
}