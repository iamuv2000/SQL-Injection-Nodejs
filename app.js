var express = require('express');
var bodyParser = require('body-parser');
var serverStatic = require('serve-static');
var app = express();
var db = require('./login');
var crypto = require('crypto');

const sqlInjectionDetection = require('./sqlDetectionMiddleware');

// The body parser middleware handles the HTML form data for us.
app.use(bodyParser.urlencoded({
	extended: false
}));

// The serve static middleware serves up static HTML, CSS, JavaScript, fonts, etc.
app.use(serverStatic(__dirname + '/public'));


app.get('/' , (req,res) => {
	console.log("Requesting insecure page...")
    res.sendFile('views/vunerable.html', {root: __dirname })
})

app.get('/secure' , (req,res) => {
	console.log("Requesting secure page...")
	res.sendFile('views/secureLogin.html', {root: __dirname })
	console.log("Secure page sent")
})

// Handle HTTP POST request to the /login route.
app.post('/login' , function(req, res, next) {

	var username = req.body.username;
	var password = req.body.password;
	var sql = 'SELECT * FROM users WHERE username = "' + username + '" AND password = "' + password + '"';

	db.connection.query(sql, function(error, results) {

		if (error) {
			console.log(error);
			return res.status(500).send('Something bad happened!');
		}

		if (results.length === 0) {
			return res.status(400).send('Invalid username or password.')
		}
		if (username === '" or ""="') {
			console.log(results)
			res.status(200).send(results);		}
		else{
			res.sendFile('views/employees.html', {root: __dirname })
		}
		
	});
});

app.post('/login-secure' , sqlInjectionDetection, function(req, res, next) {

	console.log(req.ip)

	var username = req.body.username;
	var password = req.body.password;
	var hash = crypto.createHash('md5').update(password).digest('hex');
	console.log(username)
	console.log(hash)

	var sql = 'SELECT * FROM userssecure WHERE username = "' + username + '" AND password = "' + hash + '"';

	db.connection.query(sql, function(error, results) {

		if (error) {
			console.log(error);
			return res.status(500).send('Something bad happened!');
		}

		if (results.length === 0) {
			return res.status(400).send('Invalid username or password.')
		}
		res.sendFile('views/employees.html', {root: __dirname })
	});
});



// Tell our express app to listen to localhost on port 3000.
app.listen(3000, function() {
	console.log('Server listening at localhost:3000');
});
