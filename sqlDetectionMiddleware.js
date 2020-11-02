const sqlFunctions = require('./database');
const db = require('./login');

function hasSql(value) {

	if (value === null || value === undefined) {
		return false;
	}

	if (value === '" or ""="') {
		return true;
	}

	var sql_meta = new RegExp('(%27)|(\')|(--)|(%23)|(#)', 'i');
	if (sql_meta.test(value)) {
		return true;
	}

	var sql_meta2 = new RegExp('((%3D)|(=))[^\n]*((%27)|(\')|(--)|(%3B)|(;))', 'i');
	if (sql_meta2.test(value)) {
		return true;
	}

	var sql_typical = new RegExp('w*((%27)|(\'))((%6F)|o|(%4F))((%72)|r|(%52))', 'i');
	if (sql_typical.test(value)) {
		return true;
	}

	var sql_union = new RegExp('((%27)|(\'))union', 'i');
	if (sql_union.test(value)) {
		return true;
	}

	return false;
}

async function middleware(req, res, next) {
	console.log("Entered middleware");

	var sql = 'SELECT * FROM blocked WHERE id = "' + req.ip + '"';

	db.connection.query(sql, function(error, results) {

		if (error) {
			console.log("An error occured")
		}

		if (results.length === 0) {
			console.log("IP is safe!")
		}
		else{
			console.log("IP is blocked!")
			console.log(results.length)
			res.sendFile('views/IPAddressBlocked.html', {root: __dirname })
		}
	});

	if(hasSql(req.body.username) || hasSql(req.body.password)){
		console.log("SQL Injection attack detected!")

		// BLOCKING IP ADDRESS
		console.log("Blocking IP Address....")
		console.log(req.ip)
		sqlFunctions.blockIpAddress(req.ip);

		res.sendFile('views/IPAddressBlocked.html', {root: __dirname })
	}
	else{
		req.body.middleware = true;
		next();
	}

}

module.exports = middleware;