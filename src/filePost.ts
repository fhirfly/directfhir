import { uuid } from 'uuidv4';
import fs from 'fs';
import { getGitfhirFilepath } from './gitfhir';

//CREATE ANY RESOURCE
export const folderPost = async (req, res) => {
  var body = "";
  var filePath = "";
  var resourceId = "";
  req.on("data", function (data) {
    resourceId = JSON.parse(data).id;
    if (resourceId == null) {
      //if there is not an id specified in the body, then make one
      resourceId = uuid();
      data = JSON.parse(data);
      data.id = resourceId;
    }
    filePath = getGitfhirFilepath(req.params.folder, resourceId);
    body += JSON.stringify(data);
  });
  req.on("end", function () {
    fs.writeFile(filePath, body, function () {
      var vid = ""; //Todo get the version of the file
      res.statusCode = 201;
      res.location(req.params.folder + "/" + resourceId + "/_history/" + vid);
      res.contentType("application/fhir+json");
      res.send(body);
      res.end();
    });
  });
  req.on("error", function (err) {
    console.log(err);
    res.statusCode = 500;
    res.send("Internal Server Error");
  });
}