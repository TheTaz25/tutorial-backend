const fp = require('fastify-plugin')
const bcrypt = require('bcrypt')

const saltRounds = 10

module.exports = fp(function(fastify, opts, next) {

  function verifyUserLoggedIn(req, rep, done) {
    if(!req.body || !req.body.username, !req.body.password) {
      return done(new Error('Missing username/password in request body'))
    }
    fastify.users.findOne({ username: req.body.username })
    .then(response => {
      if(!response) {
        fastify.log.warn(`${req.body.username} does not exist`)
        rep.code(404).send(`${req.body.username} does not exist`)
        return done(new Error(`${req.body.username} does not exist`))
      }
      bcrypt.compare(req.body.password, response.password, (err, res) => {
        if(err || !res) {
          return done(new Error("Incorrect password"))
        } else {
          done()
        }
      })
    })
  }

  fastify.decorate('verifyUserLoggedIn', verifyUserLoggedIn)
  // fastify.decorate('verifyUserPassword', verifyUserPassword)

  next()
})
