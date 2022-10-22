const mongoose  = require('mongoose')
const schema =  mongoose.Schema;

const event = new schema ({
  image: String,
  date: String,
  time: String,
  title: String,
  content: String,
  venue: String
})


module.exports = mongoose.model('event', event)