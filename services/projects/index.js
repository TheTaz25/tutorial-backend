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
              req.log.error('Could not delete projectLeader after unsuccessfull project creation with id' + projectLeader._id)
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
        req.log.warn(err)
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
      fastify.isUserPartOfProject,
      fastify.assignUserRole
    ],
    schema: {
      params: fastify.needsProjectId,
      body: fastify.updateProjectPolicy
    }
  }, (req, res) => {
    /*
      CRUD ALL -> PROJECT-LEADER-ONLY
      NEW TASKS -> DEVS (also: not here in this route)
      NO PUT FOR USERS
    */
    // Check if role is Project-Leader
    const {
      USERROLES
    } = fastify

    const {
      project,
      body
    } = req

    if (!(req.role === USERROLES.PROJECTLEADER)) {
      res.code(403)
        .send('Only Projectleader of this project may change project information')
      return
    }
    // Adjust
    if (body.hasOwnProperty('title')) {
      project.title = body.title
    }

    if (body.hasOwnProperty('description')) {
      project.description = body.description
    }

    if (body.hasOwnProperty('completed')) {
      project.completed = body.completed
    }

    const errors = new Set()
    if (body.hasOwnProperty('members')) {
      for (const member in body.members) {
        // Due to the schema validation, we can be sure that it is either delete or add action
        if (member.action === 'DELETE') {
          project.members = project.members
            .filter(projectMember => !(projectMember._id === member.memberid))
        } else { // ADD
          // Role is also taken care of via the schema validation (user, projectleader or developer)
          const newMember = new fastify.members({
            memberId: member.memberid,
            role: member.role
          })

          newMember.save(err => {
            if (err) {
              errors.add('Could not create projectmember with role ' + member.role)
            } else {
              project.members.push(newMember._id)
            }
          })
        }
      }
    }
    if (errors.size) {
      for (const err of errors) {
        req.log.warn(err)
      }
      res.code(500)
        .send('Could not create and assign all new members to this project, please check and try again')
      return
    }

    // Update timestamp
    project.lastmodified = Date.now()
    // Save
    project.save(err => {
      if (err) {
        req.log.error(err)
        res.code(500)
          .send("Could not update project information, please try again")
        return
      } else {
        // Done
        res.send()
      }
    })
  })

  // Delete a project forever
  fastify.delete('/api/projects/:projectId', {
    preHandler: [
      fastify.isUserLoggedIn,
      fastify.isUserPartOfProject,
      fastify.assignUserRole
    ],
    schema: {
      params: fastify.needsProjectId
    }
  }, (req, res) => {
    /*
      CRUD ALL -> PROJECT-LEADER-ONLY
    */
    const {
      USERROLES
    } = fastify

    if (!(req.role === USERROLES.PROJECTLEADER)) {
      req.log.warn(`User ${req.user._id} is of role ${req.role} and therefore not allowed to delete the project`)
      res.code(403)
        .send('Action not allowed')
    }

    // Remember: We are working with a not-lean variant of the ressource (is a mongoose object more or
    // less) due to delete method
    req.project
      .depopulate('members')
      .depopulate('tasks')

    const { members, tasks } = req.project

    fastify.members.deleteMany({ _id: members })
    fastify.tasks.deleteMany({ _id: tasks })

    delete req.project

    fastify.projects.deleteOne({
      _id: req.params.projectId
    }, function(err) {
      if (err) {
        req.log.error('Could not delete project with id ', +req.params.projectId)
        res.code(500)
          .send("Could not delete project")
      } else {
        res.send()
      }
    })
  })

  next()
}
