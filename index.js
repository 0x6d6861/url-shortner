const express = require('express');
const app = express();

app.use(express.static(__dirname + '/views'));
app.use(express.static(__dirname + '/Script'));
app.set('view engine', 'ejs'); 

var path    = require("path");
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('data/data.db');

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
	var data = db.all('SELECT * FROM links');
	console.log(data);
	res.render('index', data);
});

app.get('/add', function (req, res) { 	
	//console.log(randomCode());
	res.sendFile(path.join(__dirname+'/views/add.html'));
});

app.post('link', function(res, req){
	var code = randomCode();
	var link = req.body.link;
	
	var stmt = db.prepare('INSERT INTO links (code, link) VALUES (?, ?)');
	stmt.run(code, link);
	stmt.finalize(function(err){
		console.log("The link has been saved in the database!");
		return true;
	});
	
	return false;
});

