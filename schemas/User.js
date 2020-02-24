const mongoose = require('mongoose')
const sha = require('sha.js')
const {
  Schema
} = mongoose

const userSchema = new Schema({
  username: String,
  password: String,
  token: String,
  isAdmin: {
    type: Boolean,
    default: false
  }
})

userSchema.statics.doesUsernameAlreadyExist = function(username, callback) {
  return this.findOne({
      username
    })
    .then((response) => {
      if (!response) {
        callback(false)
      } else {
        callback(true)
      }
    })
    .catch((err) => {
      console.error(err)
      callback(undefined, new Error('Could not fetch database'));
    })
}

userSchema.methods.renewToken = function(secret, callback) {
  const now = new Date();
  const newToken = sha('sha256')
    .update(now.toISOString() + this.username + secret)
    .digest('hex')

  this.token = newToken
  this.save(err => {
    callback(!err, newToken)
  })
}

userSchema.methods.clearToken = function(callback) {
  this.token = ''
  this.save(err => {
    callback(!err)
  })
}

mongoose.model('user', userSchema)