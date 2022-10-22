const mongoose  = require('mongoose')
const schema =  mongoose.Schema;

const cause = new schema ({
  image: String,
  nAmount: Number,
  rAmount: Number,
  title: String,
  content: String
})


module.exports = mongoose.model('cause', cause)