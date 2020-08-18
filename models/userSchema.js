var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/musicEvents', {useNewUrlParser: true});

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

/*
    A user schema is created which contains attributes of user. And all the details of users are saved in
    users collection of database
*/
var uSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    address1: String,
    address2: String,
    city: String,
    state: String,
    zip: String,
    country: String,
    password: String

}, {collection: 'user'});

var userData = mongoose.model('userData', uSchema);

module.exports = userData;