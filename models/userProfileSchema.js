const {conSchema} = require('./connectionSchema');

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/musicEvents', {useNewUrlParser: true});

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

/* 
    A user profile schema is created, namely uProfileSchema which consist of user email "uEmail", 
    connection, rsvp value of that connection w.r.t. user. And everything will be saved in "userProfile"
    collection in database.
*/
var uProfileSchema = new mongoose.Schema({
    uEmail: String,
    connection: conSchema,
    rsvp: String
}, {collection: 'userProfile'});

var userProfileData = mongoose.model('userProfileData', uProfileSchema);

module.exports = userProfileData;
