const bcrypt = require('bcrypt')

const saltRounds = 10

module.exports = function(fastify, opts, next) {
  fastify.post('/api/auth/register', function(req, res) {
    // Check if username and password field are set...
    if (!req.body.username || !req.body.password) {
      res.code(400)
        .send('Need fields username and password')
      return
    }
    // Check if Username does not exist
    fastify.users.doesUsernameAlreadyExist(req.body.username, (userExists, err) => {
      if (err) {
        res.code(500)
          .send('Internal Server Error', err)
        return
      }
      if (!userExists) {
        // Hash password
        bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
          if (err) {
            res.code(500)
              .send('Internal Server Error (Could not create a password hash)')
            return
          }
          // Create new User
          let newUser = new fastify.users({
            username: req.body.username,
            password: hash,
            token: '',
            validUntil: new Date(0)
          })
          // Save new User
          newUser.save(err => {
            if (err) {
              res.code(500)
                .send('Internval Server Error (Could not save new User to Database)')
              return
            }
            // Respond
            res.code(201)
              .send()
            return
          })
        })
      } else {
        res.code(409)
          .send('Username does already exist')
        return
      }
    })
  })

  fastify.put('/api/auth/login', function(req, res) {
    // Check if username and password are set
    if (!req.body.username || !req.body.password) {
      res.code(400)
        .send('Missing username/password field')
      return
    }
    fastify.users.findOne({
        username: req.body.username
      })
      .then(user => {
        if (!user) {
          res.code(404)
            .send('Username not found')
          return
        }
        // Compare Password
        bcrypt.compare(req.body.password, user.password, (err, passwordValid) => {
          if (err || !res) {
            res.code(401)
              .send('Wrong password')
            return
          }
          user.renewToken(fastify.TOKENSECRET, (success, newToken) => {
            if (!success) {
              res.code(500)
                .send('Internal Server Error (Could not save Token)')
              return
            }
            res.setCookie('sessionToken', newToken, {
              maxAge: 60 * 60 * 24,
              path: '/'
            })
            // Send UserData
            res.send({
              username: req.body.username
            })
            return
          })
        })
      })
      .catch(err => {
        fastify.log.error(err)
        res.code(500)
          .send('Internal Server Error (Failed to Fetch)')
        return
      })
  })

  fastify.get('/api/auth/logout', function(req, res) {
    fastify.users.findOne({
        token: req.cookies.sessionToken
      })
      .then(user => {
        if (!user) {
          res.send()
          return
        }
        user.clearToken((deleted) => {
          if (!deleted) {
            res.code(500)
              .send('Internal Server Error (Unable to Log out)')
            return
          }
          res.clearCookie('sessionToken')
          res.send()
          return
        })
      })
      .catch(err => {
        fastify.log.error(err)
        res.code(500)
          .send('Internal Server Error (Failed to Fetch)')
        return
      })
  })

  next()
}

