const mongoose = require('mongoose')
const {
  Schema
} = mongoose

const taskSchema = new Schema({
  owner: String,
  title: String,
  description: String,
  state: {
    type: String,
    default: 'notstarted'
  },
  depends: String
})

mongoose.model('task', taskSchema)