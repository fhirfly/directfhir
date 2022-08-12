'use strict'
/**
 * Module dependencies.
 */
var express = require('express');
var logger = require('morgan');
var path = require('path');
const fs = require('fs');
const { uuid } = require('uuidv4');
const util = require('util')

//EXPRESS CONFIG
var app = express();
app.use(logger('dev'));


//  WE DONT CURRENTLY SUPPORT SEARCHPARAMETER
async function executeSearch(req, res){
  return;
};

//BUNDLE ALL RESOURCES in A FOLDER
app.get('/:folder', async function(req, res) {
  console.log('reading file');
  if (req.params.folder=='metadata'){
    console.log('read metadata')
    var raw = await fs.createReadStream('./gitfhir/metadata')  
    raw.on('error', function(err) {
      if (err.code === 'ENOENT') {
        console.log('File not found!');
        res.statusCode = 404;
        res.send('File Not Found');
        res.end;
      } else {
        console.log(err);
        res.statusCode = 500;
        res.send('Internal Server Error');
        res.end;      
      }
    });
    raw.pipe(res);
    res.contentType('application/fhir+json');    
    res.end
  }
    
  if (req.params!=null){
    executeSearch(req, res);
    res.end;
  }
  // If this isn't a search
  // For every file in the directory, roll each up in a bundle
  // dont respect the _count parameter,
  // dont support paging
  try {
    // Get the files as an array
    const files = await fs.promises.readdir( './gitfhir/' + req.params.folder);
    var i = 0; //counter for bundle entries
    var bundle = {
      "resourceType": "Bundle",
      "id": "",
      "meta": {
        "lastUpdated": ""
      },
      "type": "searchset",
      "total": 0,
      "entry": [{}]
    };
    bundle.id = uuid();
    for( const file of files ) {
        // Get the full paths
        if (file.startsWith('.') == false){ //ignore hidden files
          const fromPath = path.join( './gitfhir/' + req.params.folder, file );        
          // Stat the file to see if we have a file or dir
          //const stat = await fs.promises.stat( fromPath );
          //if( stat.isFile() )
          try{
              const asyncReadFile = util.promisify(fs.readFile)
              //.. this loop goes into some function with async or you can use readFileAsync
              const data = await asyncReadFile(fromPath)
              var entry = JSON.parse(data.toString());//Add file to a Bundle resource
              bundle.entry[i] = entry
              console.log(data.toString());
          } 
          catch(err){
            if (err.code === 'ENOENT') {
              console.log('Read file error.  Possible race condition');             
            } else {
              console.log(err);             
            }
          }
          i++; //increment the file num  
        }
             
    }
    bundle.total = i;
    //bundle.meta.lastUpdated = now;
    res.statusCode = 200;
    res.send(bundle);
  }
  catch( e ) {
    // Catch anything bad that happens
    console.error( "We've thrown! Whoops!", e );
    res.statusCode = 500;
    res.send('Internal Server Error');
  }
 
});

//READ ANY RESOURCE
app.get('/:folder/:file', async function(req, res) {
  console.log('reading file');
  if (req.params!=null){
    executeSearch(req, res);
    res.end;
  }
  var raw = await fs.createReadStream('./gitfhir/' + req.params.folder + '/' + req.params.file)
  raw.on('error', function(err) {
    if (err.code === 'ENOENT') {
      console.log('File not found!');
      res.statusCode = 404;
      res.send('File Not Found');
      res.end;
    } else {
      console.log(err);
      res.statusCode = 500;
      res.send('Internal Server Error');
      res.end;      
    }
  });
  raw.pipe(res);
  res.contentType('application/fhir+json');    
  res.end
});

//CREATE ANY RESOURCE
app.post('/:folder', function(req, res) {
  var body = '';  
  var filePath = '';
  var resourceId = '';
  req.on('data', function(data) {
      resourceId = JSON.parse(data).id;
      if (resourceId == null){ //if there is not an id specified in the body, then make one
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
      res.send('Internal Server Error');    
  });
});

/*
DELETE ANY RESOURCE
The resource is removed from the disk, and it will no longer appear in search results.
The version number of the resource is incremented (essentially, a new deleted version is created).
Previous versions of the resource are not physically deleted.
The resource may be un-deleted by updating it again.
*/
app.delete('/:folder/:file', function(req, res) {
  console.log('deleting file');
  var filePath = '';
  var resourceId = '';
  req.on('data', function(data) {
      filePath = './gitfhir/' + req.params.folder + '/' + req.params.file;      
  });
  req.on('end', function (){
    fs.unlink(filePath, (err) => {    
      console.log('deleted file');
      res.statusCode = 200
      //Todo  load operation outcomes
      res.end();
    })
  req.on('error', function(err) {
    if (err.code === 'ENOENT') {
      console.log('File not found!');
      res.statusCode = 404;
      res.send('File Not Found');
    } else {
      console.log(err);
      res.statusCode = 500;
      res.send('Internal Server Error');      
    } 
  });  
  });

});

//UPDATE ANY RESOURCE
app.put('/:folder/:file', function(req, res) {
  var body = '';  
  var filePath = '';
  var resourceId = '';
  req.on('data', function(data) {
        filePath = './gitfhir/' + req.params.folder + '/' + req.params.file;
      body += JSON.stringify(data);
  });
  req.on('end', function (){
      fs.writeFile(filePath, body, function() {
          var vid = '';  //Todo get the version of the file
          //todo: add operation outcome
          res.statusCode = 200
          //res.location(req.params.folder + '/' + resourceId + '/_history/' + vid);         
          res.contentType('application/fhir+json');  
          res.end();
      });
  });
  req.on('error', function(err) {
      console.log(err);
      res.statusCode = 500;
      res.send('Internal Server Error');    
  });
});

//START SERVER
app.listen(3000);
console.log('listening on port 3000');