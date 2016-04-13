var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var bootprint = require('bootprint');
var fs = require('fs');
var Inliner = require('inliner');
var url = require('url');

var app = express();

app.use(bodyParser.json());

var renderStaticSite = function(req, res) {
	var p = path.join(__dirname + url.parse(req.url).pathname);
	if (/\\$/.test(p)) {
		p = p + "index.html";
	}
	res.sendFile(p);
}

var redirectToStaticSite = function(req, res) {
	res.redirect("/dist/");
}



app.all('/dist/*', renderStaticSite);
app.all('/dist', redirectToStaticSite);
app.all('/', redirectToStaticSite);
app.all('/html/*', renderStaticSite);

app.post('/to-html', function(req, res) {

	var unique = new Date().getTime() + "" + Math.floor(Math.random() * 1000000);
	console.log("un", unique);
	var json = JSON.stringify(req.body);
	var dir = path.join(__dirname + '/dist/html');
	if (!fs.exists(dir)) {
    	fs.mkdir(dir, function(error) {
    		console.log("error creating html dir", error);
    	});
	}
	fs.writeFile(path.join(dir + '/output.' + unique + '.json'), json, function(err) {
		if (err) {
			console.log(err);
		} else {
			require('bootprint')
  				// Load bootprint-swagger
  				.load(require('bootprint-openapi'))
  				// Customize configuration, override any options
  				.merge({ /* Any other configuration */})
  				// Specify build source and target
  				.build(path.join(dir + '/output.' + unique + '.json'), dir + "-" + unique)
  				.generate()
  				.done(function(result) {
  					console.log(result);
  					var ts = new Date().getTime();
  					new Inliner("http://localhost:8080/dist/html-" + unique + "/index.html?" + ts, function (error, html) {
					  // compressed and inlined HTML page
					  res.send(html);
					});
  				});
		}
	});
});

app.listen(8080, function() {
	console.log("Starting server on port:8080");
});