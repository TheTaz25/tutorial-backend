const mongoose = require('mongoose')
const { Schema } = mongoose

const userSchema = new Schema({
  username: String,
  password: String,
  role: String
})

userSchema.statics.doesUserAlreadyExist = function(username) {
  return this.findOne({ username })
  .then((response) => {
    if(!response)
      return false
    return true
  })
  .catch((err) => {
    console.error(err)
    return true
  })
}

mongoose.model('user', userSchema)
