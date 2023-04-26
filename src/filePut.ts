import fs from 'fs';
import { getGitfhirFilepath } from './gitfhir';

//UPDATE ANY RESOURCE
export const filePut = async (req, res) => {
  var body = "";
  var filePath = "";
  var resourceId = "";
 try{
    filePath = getGitfhirFilepath(req.params.folder, req.params.file);
    resourceId += req.params.file;
    var newbody = req.body;
    newbody['id'] = resourceId;
    //body += JSON.stringify(req.body);
    body += JSON.stringify(newbody);
    console.log(filePath);
    console.log(body);
    fs.writeFile(filePath, body, function () {
      var vid = ""; //Todo get the version of the file
      //todo: add operation outcome
      res.statusCode = 200;
      res.contentType("application/fhir+json");
      res.send(body);
      res.end();
      return;
    });
  }
  catch(err){
    console.log(err);
    res.statusCode = 500;
    res.send("Internal Server Error");
    res.end;
    return;
  }
}
