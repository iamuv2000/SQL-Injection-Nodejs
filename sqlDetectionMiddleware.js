var rawbody = require('raw-body');

function hasSql(value) {

	if (value === null || value === undefined) {
		return false;
	}

	if (value === '" or ""="') {
		return true;
	}

	// sql regex reference: http://www.symantec.com/connect/articles/detection-sql-injection-and-cross-site-scripting-attacks
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

function middleware(req, res, next) {

	console.log("Entered middleware")

	console.log("Has sql: " + hasSql(req.body.username));

	if(hasSql(req.body.username) || hasSql(req.body.password)){
		console.log("SQL Injection attack detected!")

		// BLOCKING IP ADDRESS

	}
	else{
		next();
	}

}

module.exports = middleware;