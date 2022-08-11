'use strict'
/**
 * Module dependencies.
 */
var express = require('express');
var logger = require('morgan');
var path = require('path');
const fs = require('fs');
const { emitWarning } = require('process');
const { uuid } = require('uuidv4');

//var app = express();

// log requests


// express on its own has no notion
// of a "file". The express.static()
// middleware checks for a file matching
// the `req.path` within the directory
// that you pass it. In this case "GET /js/app.js"
// will look for "./public/js/app.js".

//app.use(express.static(path.join(__dirname, 'gitfhir')));

// if you wanted to "prefix" you may use
// the mounting feature of Connect, for example
// "GET /static/js/app.js" instead of "GET /js/app.js".
// The mount-path "/static" is simply removed before
// passing control to the express.static() middleware,
// thus it serves the file correctly by ignoring "/static"
//app.use('/static', express.static(path.join(__dirname, 'public')));

// if for some reason you want to serve files from
// several directories, you can use express.static()
// multiple times! Here we're passing "./public/css",
// this will allow "GET /style.css" instead of "GET /css/style.css":
//app.use(express.static(path.join(__dirname, 'public', 'css')));

var app = express();
app.use(logger('dev'));


app.get('/:folder/:file', function(req, res) {
  console.log('reading file');
  // Note: should use a stream here, instead of fs.readFile
  var raw = fs.createReadStream('./gitfhir/' + req.params.folder + '/' + req.params.file)
  raw.on('error', function(err) {
    if (err.code === 'ENOENT') {
      console.log('File not found!');
      res.statusCode = 404;
      res.send("File Not Found");
    } else {
      console.log(err);
      res.statusCode = 500;
      res.send("Internal Server Error");      
    }
  });
  raw.pipe(res);
  res.contentType('application/fhir+json');    
  res.end
});

app.post('/:folder', function(req, res) {
  var body = '';  
  var filePath = '';
  var resourceId = '';
  req.on('data', function(data) {
      resourceId = JSON.parse(data).id;
      if (resourceId == null){
        resourceId = uuid();
        data = JSON.parse(data);
        data.id = resourceId
      }
      filePath = './gitfhir/' + req.params.folder + '/' + resourceId;
      body += JSON.stringify(data);
  });
  req.on('end', function (){
      fs.writeFile(filePath, body, function() {
          var vid = '';  //Todo get the version of the file
          res.send(body);
          res.statusCode = 201
          res.location(req.params.folder + '/' + resourceId + '/_history/' + vid);         
          res.contentType('application/fhir+json');  
          res.end();
      });
  });
  req.on('error', function(err) {
      console.log(err);
      res.statusCode = 500;
      res.send("Internal Server Error");    
  });
});

app.listen(3000);
console.log('listening on port 3000');