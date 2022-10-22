const mongoose  = require('mongoose')
const schema =  mongoose.Schema;

const partner = new schema ({
  image: String,
  sitelink: String
})


module.exports = mongoose.model('partner', partner)