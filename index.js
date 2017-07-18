const express = require('express');
const app = express();
const bodyParser = require('body-parser');
//const path    = require("path");
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('data/data.db');

const { URL } = require('url');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs'); 





var randomCode = function(length) {
	if (length === undefined){
		length = 6;
	}
    var code = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for(var i = 0; i < length; i++) {
        code += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return code;
}

db.serialize(function () {
  db.run('CREATE TABLE IF NOT EXISTS links ( id integer PRIMARY KEY, link text NOT NULL UNIQUE, code text NOT NULL UNIQUE, time DATETIME DEFAULT CURRENT_TIMESTAMP)', function(err){
		console.log("Database initialiazed!");
	  });
})

//db.close();

app.listen(3000, function () { 
	console.log('Example app listening on port 3000!');
});




app.get('/', function (req, res) { 	
	db.all('SELECT * FROM links', function(err,rows){
		console.log(rows);
		res.render('index', {'links': rows});
	});
	return true;
});

app.post('/add', function(res, req){
	
	var code = randomCode();
	var link = req.req.body.link;
	
	db.get('SELECT * FROM links WHERE link=' + link, function(err,row){
		if(row == null){
			var stmt = db.prepare('INSERT INTO links (code, link) VALUES (?, ?)');
			stmt.run(code, link);
			stmt.finalize(function(err){
				console.log("The link has been saved in the database!");
			});
			res.redirect(200, '/');
		}
	});
	
	console.log("OOPS! Something happened!");
	db.close();
	return false;
});

app.get('/:code', function(req, res) {
	var code = req.params.code;
	db.get('SELECT * FROM links WHERE code=' + code, function(err,row){
		if(row != null){
			// redirect with a header
			var myLink = new URL(row[link]);
			res.redirect(301, myLink.href);
		}
		// reder a 404 page
	});
	db.close();
	res.status(404).send('Sorry, we cannot find that link');
	
});

