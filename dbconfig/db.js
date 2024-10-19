const mongoose = require('mongoose');
const URI = 'mongodb://127.0.0.1:27017/Chigari';
const MONGODB_URI = 'mongodb+srv://danbaba1882:NAZIR1882@megaincomedb-wqmxa.mongodb.net/Chigari';
const mongoOptions={useNewUrlParser : true, useUnifiedTopology: true};
mongoose.connect(process.env.MONGODB_URI || MONGODB_URI, mongoOptions);
mongoose.connection.on('open',()=>{
    console.log('Server has been connected to database');
    });