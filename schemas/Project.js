const mongoose = require('mongoose')

const {
  Schema
} = mongoose

const projectSchema = new Schema({
  members: [{
    type: Schema.Types.ObjectId,
    ref: 'member'
  }],
  title: String,
  description: String,
  tasks: [{
    type: Schema.Types.ObjectId,
    ref: 'task'
  }],
  completed: {
    type: Boolean,
    default: false
  },
  lastmodified: Number
})

mongoose.model('project', projectSchema)