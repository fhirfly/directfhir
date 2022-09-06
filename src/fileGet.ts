import fs from 'fs';
import { executeSearch } from './app';
import { getGitfhirFilepath } from './gitfhir';

//READ ANY RESOURCE
export const fileGet = async (req, res) => {
  console.log("reading file");
  console.log({
    p: getGitfhirFilepath(req.params.folder, req.params.file),
    r: fs.createReadStream.mock,
  });

  var raw = await fs.createReadStream(getGitfhirFilepath(req.params.folder, req.params.file));
  raw.on("error", function (err) {
    if (err.code === "ENOENT") {
      console.log("File not found!");
      res.statusCode = 404;
      res.send("File Not Found");
      res.end;
    } else {
      console.log(err);
      res.statusCode = 500;
      res.send("Internal Server Error");
      res.end;
    }
  });
  raw.pipe(res);
  res.contentType("application/fhir+json");
  res.end;
}