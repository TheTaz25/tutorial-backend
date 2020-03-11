const mongoose = require('mongoose')
const {
  Schema
} = mongoose

const taskSchema = new Schema({
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'user'
  },
  title: String,
  description: String,
  state: {
    type: String,
    default: 'notstarted'
  },
  dod: [{
    id: Number,
    item: String,
    checked: {
      type: Boolean,
      default: false
    }
  }],
  depends: {
    type: Schema.Types.ObjectId,
    ref: 'task'
  },
  timespent: {
    type: Number,
    default: 0
  },
  lastmodified: Number
})

mongoose.model('task', taskSchema)