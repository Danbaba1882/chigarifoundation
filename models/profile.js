const mongoose  = require('mongoose')
const schema =  mongoose.Schema;

const profile = new schema ({
  image: String,
  membershipType: String,
  name: String,
  position: String,
  profile: String
})


module.exports = mongoose.model('profile', profile)