const mongoose  = require('mongoose')
const schema =  mongoose.Schema;

const news = new schema ({
  image: String,
  title: String,
  content: String,
  datePublished: String
})


module.exports = mongoose.model('news', news)