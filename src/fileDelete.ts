import fs from 'fs';
import path from 'path';
import { config } from './config';

const cwd = process.cwd();

export const getFilepath = (folder: string, file: string) => {
  return path.join(cwd, config.GITFHIR_DIR, folder, file);
}

/*
DELETE ANY RESOURCE
The resource is removed from the disk, and it will no longer appear in search results.
The version number of the resource is incremented (essentially, a new deleted version is created).
Previous versions of the resource are not physically deleted.
The resource may be un-deleted by updating it again.
*/
export const fileDelete = async (req, res) => {
  
  var filePath = "";
  var resourceId = "";
  filePath = getFilepath(req.params.folder, req.params.file);
  console.log("deleting file" + filePath);
  req.on("data", function (data) {
  });
  req.on("end", function () {
    fs.unlink(filePath, (err) => {
      console.log("deleted file" + filePath);
      res.statusCode = 200;
      //Todo  load operation outcomes
      res.end();
      return;
    });
    req.on("error", function (err) {
      if (err.code === "ENOENT") {
        console.log("File not found!");
        res.statusCode = 404;
        res.send("File Not Found");
        return;
      } else {
        console.log(err);
        res.statusCode = 500;
        res.send("Internal Server Error");
        return;
      }
    });
  });
}