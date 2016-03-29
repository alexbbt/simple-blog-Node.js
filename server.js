// server.js

// set up ======================================================================
	var express    = require('express');
	var bodyParser = require('body-parser');
	var passport   = require('passport');
	var app        = express();
	var port       = process.env.PORT || 8080;	

// configuration ===============================================================
	var db = require('./app/database.js')();

	require('./config/passport')(passport); // pass passport for configuration

	// set the view engine to ejs
	app.set('view engine', 'ejs');

	app.use(express.static(__dirname + '/assets'));
	app.use( bodyParser.json() );       // to support JSON-encoded bodies
	app.use( bodyParser.urlencoded({    // to support URL-encoded bodies
	  extended: true
	})); 
	app.use(passport.initialize());

// routes ======================================================================
	require('./app/routes.js')(app, db, passport); 


// launch ======================================================================
	app.listen(port);
	console.log('The magic happens on port ' + port);