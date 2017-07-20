const express 			= 	require('express');
const bodyParser 		= 	require('body-parser');
const sqlite3 			= 	require('sqlite3').verbose();

const db 				= 	new sqlite3.Database('data/data.db');
const app 				= 	express();

const URL 				= 	require('url');

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

app.listen(80, function () { 
	console.log('Example app listening on port 3000!');
});




app.get('/', function (req, res) { 	
	db.all('SELECT * FROM links', function(err,rows){
		console.log(rows);
		res.render('index', {'links': rows});
	});
	return true;
});

app.post('/add', function(req, res){
	
	var code = randomCode();
	var link = req.body.link;
	
	db.get("SELECT * FROM links WHERE link='" + link + "'", function(err,row){
		console.log(row);
		if(row == null){
			var stmt = db.prepare('INSERT INTO links (code, link) VALUES (?, ?)');
			stmt.run(code, link);
			stmt.finalize();
			console.log("The link has been saved in the database!");
		}else {
			console.log("The link exists in the database!");
		}
	});
	res.redirect('/');
});

app.get('/:link_code', function(req, res, next) {
	var linkcode = String(req.params.link_code);
	db.get('SELECT * FROM links WHERE code="' + linkcode + '"', function(err,row){
		console.log(linkcode);
		if(row){
			// redirect with a header
			var myLink = URL.parse(String(row.link), true);
			console.log(myLink);
			res.redirect(myLink.href);
		}else {
			// reder a 404 page
			res.status(404).send('Sorry, we cannot find that link');
		}
	});
	
});

