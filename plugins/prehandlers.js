const fp = require('fastify-plugin')

module.exports = fp(function(fastify, opts, next) {

  // Checks if the user is logged in and appends the usermodel to the request object
  fastify.decorate('isUserLoggedIn', (req, res, done) => {
    const token = req.cookies.sessionToken
    if (!token) {
      res.code(401)
      done(new Error('User is not logged in. Action not authorized.'))
    }

    fastify.users.findOne({
        token: req.cookies.sessionToken
      })
      .lean(req.raw.method === "GET")
      .then(user => {
        if (!user) {
          res.code(401)
          done(new Error('User is not logged in. Action not authorized.'))
        } else {
          req.user = user
          done()
        }
      })
      .catch(err => {
        res.code(500)
        done(new Error('Failed to fetch user'))
      })
  })

  // Check if the user is part of the project (or simply an admin) and append the project object to the request
  fastify.decorate('isUserPartOfProject', (req, res, done) => {
    fastify.projects.findOne({
        _id: req.params.projectId
      })
      .lean(req.raw.method === "GET")
      .populate('members')
      .populate('tasks')
      .then(project => {
        if (!project) {
          res.code(404)
          done(new Error('Could not find project'))
        } else {
          const memberInProject = project.members.find(member => member.memberId === req.user._id)
          if (req.user.isAdmin || memberInProject) {
            req.project = project
            req.role = memberInProject.role
            done()
          } else {
            res.code(403)
            done(new Error('User is not part of this project'))
          }
        }
      })
      .catch(err => {
        res.code(500)
        done(new Error('Failed to fetch project'))
      })
  })

  next()
})