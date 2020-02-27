const mongoose = require('mongoose')
const {
  Schema
} = mongoose

const memberSchema = new Schema({
  memberId: {
    type: Schema.Types.ObjectId,
    ref: 'user'
  },
  role: String
})

mongoose.model('member', memberSchema)