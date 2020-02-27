const mongoose = require('mongoose')
const {
  Schema
} = mongoose

const logSchema = new Schema({
  timestamp: Number,
  project: {
    type: Schema.Types.ObjectId,
    ref: 'project'
  },
  task: {
    type: Schema.Types.ObjectId,
    ref: 'task'
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'user'
  },
  description: String
})

mongoose.model('log', logSchema)