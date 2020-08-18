var express = require('express');
var app = express();
var expressSession = require('express-session');
var connectionController = require('./controller/connectionController');
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({extended:false}));

//setting up view engine
app.set('view engine', 'ejs');
app.use('/assets', express.static('assets'));

app.use(expressSession({
    secret: 'logSession',
    resave: false,
    saveUninitialized: true
}))

 app.use('/', connectionController);


app.listen(8080);