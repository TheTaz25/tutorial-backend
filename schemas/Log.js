const mongoose = require('mongoose')
const {
  Schema
} = mongoose

const logSchema = new Schema({
  timestamp: Number,
  project: String,
  task: String,
  user: String,
  description: String
})

mongoose.model('log', logSchema)