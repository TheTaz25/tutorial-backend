const fp = require('fastify-plugin')

module.exports = fp(function(fastify, opts, next) {

  fastify.decorate('isUserLoggedIn', (req, res, done) => {
    const token = req.cookies.sessionToken
    if (!token) {
      res.code(401)
      done(new Error('User is not logged in. Action not authorized.'))
    }

    fastify.users.findOne({
        token: req.cookies.sessionToken
      })
      .then(user => {
        if (!user) {
          res.code(401)
          done(new Error('User is not logged in. Action not authorized.'))
        } else {
          req.user = user
          done()
        }
      })
  })

  next()
})