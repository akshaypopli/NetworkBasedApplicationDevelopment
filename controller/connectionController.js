var express = require('express');
var {getConnections, getConnection, getConnectionCategories} = require('../utility/ConnectionDB');
var getUser = require('../utility/userDB');
var getUserProfile = require('../utility/userProfileDB');
var userProfileData = require('../models/userProfileSchema');
var {conData, conSchema} = require('../models/connectionSchema');
var router = express.Router();
let err = new Array(1);
const date = require('date-and-time');
const { check, validationResult, body } = require('express-validator');

// login page
router.get('/login', function(req, res, next) {
	if (req.session.userSession) {
		res.redirect('/myConnections');
	} else {
		//res.render('login');
		res.render('login', {flagToDisplay: false, unmatched: false});
	}
});

// creating user session
router.post('/login', 
	[check('email').isEmail().withMessage("Invalid Email format, Please try again.")]
, function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		res.render('login', {error: errors.array(), flagToDisplay: true, unmatched: false});
	}else {
		if (req.session.userSession) {
			res.redirect('/myConnections');
		} else {
			getUser(req.body.email).then(u => {
				console.log(u)
				if(u == undefined){
					res.render('login', {flagToDisplay: false, unmatched: true});
				}else{
					if(u.password == req.body.password){
						req.session.userSession=[u.firstName ,u.email];
						console.log(req.session.userSession[0]);
						res.redirect('/myConnections');
					}else {
						res.render('login', {flagToDisplay: false, unmatched: true});
					}	
				}
			})
		}
	}
});

// to open connections page
router.get("/connections", (req, res) => {
	getConnectionCategories().then(categories=>{
		getConnections().then(connections => {
			res.render("connections", {
	  
			  "categories": categories,
			  "connections": connections,
			  "userSession":req.session.userSession
			});
		});
	})
});

// Specific connection page by passing id of perticular connection
router.get("/connection/:connectionId", async (req, res) => {
	getConnection(req.params.connectionId).then(connection => {
		console.log(connection)
	  if (connection === undefined)
		return res.redirect("/connections");
	  else {
		return res.render("connection", {
		  "connection": connection,
		  "userSession": req.session.userSession
		});
	  }
	});
});

// connection specific to user
router.get('/myConnections', function(req, res, next) {
	//Checking session
	if (req.session.userSession) {
		getUserProfile(req.session.userSession[1]).then(uProfile=>{
			req.session.userProfile = uProfile;
			res.render('savedConnections', {
				userConnections: req.session.userProfile,
				userSession: req.session.userSession
			});
		})
	} else {
		res.redirect('/login')
	}
});

// connnection for rsvp
router.get('/myConnections/rsvp', function(req, res, next) {
	var conId = req.query.id;
	if (req.query.rsvp.toUpperCase() == "NO" || req.query.rsvp.toUpperCase() == "YES" || req.query.rsvp.toUpperCase() == "MAYBE") {
		var rsvp = req.query.rsvp;
	}
	if (req.session.userSession) {
		try {
			getConnection(conId).then(connection=>{
				userProfileData.find({uEmail: req.session.userSession[1], "connection.connectionId": conId}).then(function(doc){
					if(doc.length == 0){
						var d = new userProfileData({uEmail: req.session.userSession[1], "connection": connection, rsvp: rsvp});
						d.save(function(err, doc1){
							if(err){
								console.log(err);
							}else{
								res.redirect('/myConnections');
							}
						})
					}else {
						userProfileData.updateOne({uEmail: req.session.userSession[1], "connection.connectionId": conId}, {uEmail: req.session.userSession[1], "connection": connection, rsvp: rsvp}, function(err, doc2){
							if(err){
								console.log(err);
							}else{
								res.redirect('/myConnections');
							}
						})
					}
				})
			})
		} catch (e) {
			err.push(404)
			res.redirect('/connections')
		}
	} else {
		res.redirect('/login');
	}
});

// delete connection, when connectionId in database matched the connectionId selected.
router.get('/myconnections/delete', function(req, res, next) {
	var conId = req.query.conId;
	if (req.session.userSession) {
		try {
			userProfileData.deleteOne({"connection.connectionId": conId}, function(err){
				if(err){
					console.log(err);
				}else {
					res.redirect('/myConnections');
				}
			})
		} catch (e) {
			err.push(404)
			res.redirect('/connections')
		}
	} else {
		res.redirect('/login')
	}
});

// to sign out
router.get('/signout', function(req, res, next) {
	req.session.destroy();

	res.render('index', {
		userSession: undefined
	});
});


// create connection 
router.get('/newConnection', function(req, res, next) {
	if (req.session.userSession) {
		res.render('newConnection', {
			userSession: req.session.userSession,
			errorsNewConnectionsflag: false
		});
	} else {
		res.redirect('/login')
	}	
});


/**
 * add new connection will create a new connection and save it in connections collection.
 * checking the input values here
 * 		- topic should be alpha numeric and its length should be atleast 4 characters
 * 		- name should be alpha numeric and its length should be atleast 4 characters
 * 		- details should be alpha numeric and only dot character is allowed and also its maximum length should be 100 characters
 * 		- where fielf should alpha numeric 
 * 		- when means date that should be after today's date
 * 		- end time should after start time
 */
router.post('/addnewconnection', [
	check('topic').matches(/^[\w\-\s]+$/).withMessage("Special Characters are not allowed"),
	check('topic').isLength({min: 4}).withMessage("length of topic should be atleast 4 characters"),
	check('name').matches(/^[\w\-\s]+$/).withMessage("Special Characters are not allowed"),
	check('name').isLength({min: 4}).withMessage("length of topic should be atleast 4 characters"),
	check('details').matches(/^[\w\-\s.]+$/).withMessage("Special Characters are not allowed except dot(.)"),
	check('details').isLength({max: 100}).withMessage("Maximum length shoudl be less than 100 characters"),
	check('where').matches(/^[\w\-\s]+$/).withMessage("Special Characters are not allowed"),
	check('when').matches('^[0-9]{4}-(((0[13578]|(10|12))-(0[1-9]|[1-2][0-9]|3[0-1]))|(02-(0[1-9]|[1-2][0-9]))|((0[469]|11)-(0[1-9]|[1-2][0-9]|30)))$').withMessage("please enter valid date format YYYY-MM-DD"),
	check('when').custom((value, { req }) => {
		if(new Date(value) <= new Date(Date.now())) {
			throw new Error ("Date must be after Today's date");
		}
		return true;
	}),
	check('start').matches('^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$').withMessage("SAFARI users - Use 24 hour format, Time must be between 00:00 - 23:59"),
	check('end').matches('^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$').withMessage("SAFARI users - Use 24 hour format, Time must be between 00:00 - 23:59"),
	check('end').custom((value, { req }) => {
		if(value <= req.body.start) {
			throw new Error ("End Time must be later than Start Time");
		}
		return true;
	}),
	body('text').trim().escape()
],function(req,res){
	if (req.session.userSession) {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			res.render('newConnection', {error: errors.array(), errorsNewConnectionsflag: true, userSession: req.session.userSession,});
		}else{
			console.log("topic "+req.body.topic+ ", name "+ req.body.name + ", details "+ req.body.details+ ", where "+ req.body.where + ", when "+ req.body.when + ", time "+ req.body.start + " " + req.body.end);
			var name = req.body.name.split(" ");
			for(var i=0;i<name.length;i++){
				name[i] = name[i].charAt(0).toUpperCase() + name[i].substring(1);
			}
			name = name.join(" ");
			var topic = req.body.topic.split(" ");
			for(var i=0;i<topic.length;i++){
				topic[i] = topic[i].charAt(0).toUpperCase() + topic[i].substring(1);
			}
			topic = topic.join(" ");
			var newConnection = {
				"connectionCategory": topic,
				"connectionName": name,
				"date": date.format(new Date(req.body.when), 'dddd, MMMM DD, YYYY'),
				"time": req.body.start + " - " + req.body.end,
				"loc": req.body.where,
				"host": req.session.userSession[0],
				"detail": req.body.details,
				"image": "" 
			}
			var data = new conData(newConnection);
			data.save(async function(err, doc){
				var d = new userProfileData({uEmail: req.session.userSession[1], "connection": data, rsvp: "Yes"});
				d.save(function(err1, doc1){
					res.redirect('/connections');
				});
			});	
		}
	} else {
		res.redirect('/login');
	}
})


//about connection
router.get('/about', function(req, res, next) {
	res.render('about', {
		userSession: req.session.userSession
	});
});


//contact connection
router.get('/contact', function(req, res, next) {
	res.render('contact', {
		userSession: req.session.userSession
	});
});

// index connection
router.get('/', function(req, res, next) {
	res.render('index', {
		userSession: req.session.userSession
	});
});

// page not found connection
router.get('/*', function(req, res) {
	res.render('404', {
		userSession: req.session.userSession
	});
});

// check connection validity
function isValidConnectionId(connectionId) {
    console.log(connectionId);
    if (connectionId !== undefined) {
        console.log(connectionId);
        if (Number.isInteger(Number.parseInt(connectionId))) {
        return true;
        } else{
        return false;
        }
    } else{
        return false;
    }
}
  

module.exports = router;