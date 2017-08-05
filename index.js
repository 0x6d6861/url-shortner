const express 			= 	require('express');
const bodyParser 		= 	require('body-parser');
const sqlite3 			= 	require('sqlite3').verbose();
const db 				= 	new sqlite3.Database('data/data.db');
const app 				= 	express();
const server            =   require('http').createServer(app);
const io                =   require('socket.io')(server);
const URL 				= 	require('url');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static('/node_modules'));
app.use('/js', express.static('js'))
app.use('/css', express.static('css'))

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
  db.run('CREATE TABLE IF NOT EXISTS links ( id integer PRIMARY KEY, link text NOT NULL UNIQUE, code text NOT NULL UNIQUE, views integer NOT NULL DEFAULT 0, deleted boolean NOT NULL DEFAULT 0, time DATETIME DEFAULT CURRENT_TIMESTAMP)', function(err){
		console.log("Database initialiazed!");
	  });
})

//db.close();

server.listen(3000, function () {
	console.log('Example app listening on port 3000!');
});

app.get('/links', function (req, res) {
    db.all('SELECT * FROM links WHERE deleted = 0', function(err,rows){
        //console.log(rows);
        res.render('partials/links', {'links': rows});
    });
    return true;
});


app.get('/', function (req, res) { 	
	db.all('SELECT * FROM links WHERE deleted = 0', function(err,rows){
		//console.log(rows);
		res.render('index', {'links': rows});
	});
	return true;
});




app.post('/ajax', function(req, res){

    var link = req.body.link;
    var code = req.body.code;
    var action = req.body.action;

    var res_data = req.body;

    if (action == "add"){

        db.get("SELECT * FROM links WHERE link='" + link + "'", function(err, row){

            if((row == null) && (link != null)){
                var stmt = db.prepare('INSERT INTO links (code, link) VALUES (?, ?)');
                code = randomCode();
                stmt.run(code, link);
                stmt.finalize();
                res_data['code'] = code;
                console.log("Link has been ADDED to the database");
            }else {

				if(row.deleted == 1){
                    var stmt = db.prepare('UPDATE links SET deleted=0 WHERE code =(?)');
                    stmt.run(row.code);
                    res_data['code'] = row.code;
                    console.log("Link has been RESTORED to the database");
				}else{
                    res_data['message'] = "The link already exists in the database";
                    console.log("The link exists in the database!");
				}

            }
            res.json(res_data);

        });



    }

    if (action == "edit"){
        var stmt = db.prepare('UPDATE links SET link=(?) WHERE code =(?)');
        stmt.run(link, code);
        console.log("Link has been UPDATED to the database");
        res.json(res_data);
	}

    if (action == "restore"){
        var stmt = db.prepare('UPDATE links SET deleted=0 WHERE code =(?)');
        stmt.run(code);
        console.log("Link has been RESTORED to the database");
        res.json(res_data);
    }

    if (action == "delete"){
        var stmt = db.prepare('UPDATE links SET deleted=1 WHERE code =(?)');
        stmt.run(code);
        console.log("Link has been DELETED to the database");
        res.json(res_data);
    }

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
            row.views += 1;
            row.view_id = "#view_" + row.id;
            io.emit('views', { data: row });
            var stmt = db.prepare('UPDATE links SET views=(?) WHERE code =(?)');
            stmt.run(row.views, linkcode);
            res.redirect(myLink.href);
		}else {
			// reder a 404 page
			res.status(404).send('Sorry, we cannot find that link');
		}
	});
	
});


io.on('connection', function(socket){
    console.log('a user connected');
    socket.on('disconnect', function(){
        console.log('user disconnected');
    });
});

