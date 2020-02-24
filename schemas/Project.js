const mongoose = require('mongoose')

const {
  Schema
} = mongoose

const projectSchema = new Schema({
  members: [],
  title: String,
  description: String,
  tasks: [],
  completed: {
    type: Boolean,
    default: false
  }
})

mongoose.model('project', projectSchema)