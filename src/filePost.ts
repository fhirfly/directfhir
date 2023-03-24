import { uuid } from 'uuidv4';
import fs from 'fs';
import { getGitfhirFilepath } from './gitfhir';

//CREATE ANY RESOURCE
export const folderPost = async (req, res) => {
  var body = "";
  console.log("writing file");
  var filePath = "";
  var resourceId = "";
  try{
  body += JSON.stringify(req.body);
  resourceId = JSON.parse(body).id;
    if (resourceId == null) {
      //if there is not an id specified in the body, then make one
      console.log("no resource id in body, creating one");
      resourceId = uuid();     
      JSON.parse(body).id = resourceId;
    }
    filePath = getGitfhirFilepath(req.params.folder, resourceId);
    console.log(body);
    fs.writeFile(filePath, body, function () {
      var vid = ""; //Todo get the version of the file
      res.statusCode = 201;
      res.location(req.params.folder + "/" + resourceId + "/_history/" + vid);
      res.contentType("application/fhir+json");
      res.send(body);
      res.end();
      return;
    });
  }
  catch(err){
    if (err.code === "ENOENT") {
      console.log("File not found!");
      res.statusCode = 404;
      res.send("File Not Found");
    } else {
      console.log(err);
      res.statusCode = 500;
      res.send("Internal Server Error");
    }
    return;
  }
}
   
