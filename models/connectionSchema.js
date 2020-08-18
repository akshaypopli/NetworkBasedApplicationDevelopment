var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/musicEvents', {useNewUrlParser: true});
var autoIncrement = require('mongoose-auto-increment');


var db = mongoose.connection;
autoIncrement.initialize(db);
db.on('error', console.error.bind(console, 'connection error:'));
// attributes in a connection
// created a schema
// All the connections will be saved in connections collection in database
var conSchema = new mongoose.Schema({
    connectionCategory: String,
    connectionName: String,
    connectionId: Number,
    date: String,
    time: String,
    loc: String,
    host: String,
    detail: String,
    image: String
}, {collection: 'connections'});

/* implemented mongoose auto increment, so , when we add a new connection, a new connectionId should be assigned which 
    which will increment by 1.   
*/
conSchema.plugin(autoIncrement.plugin, {
    model: "conData",
    field: "connectionId",
    startAt: 501,
    incrementBy: 1
  });

var conData = mongoose.model('conData', conSchema);

module.exports = {conData, conSchema};