const mongoose  = require('mongoose')
const schema =  mongoose.Schema;

const gallery = new schema ({
  image: String
})


module.exports = mongoose.model('gallery', gallery)