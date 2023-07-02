import fs from 'fs';
import { uuid } from 'uuidv4';
import util from 'util';
import { getGitfhirFilepath, getGitfhirFolderPath, getGitfhirMetadata } from './gitfhir';

//BUNDLE ALL RESOURCES in A FOLDER or READ METADATA
export const folderGet = async (req, res) => {
  console.log("reading file");

  //If its a metadata request
  if (req.params.folder == "metadata") {
    console.log("read metadata ->" + getGitfhirMetadata());
    var raw = await fs.createReadStream(getGitfhirMetadata());
    raw.on("error", function (err) {
      if (err.code === "ENOENT") {
        console.log("File not found!");
        res.contentType("application/fhir+json");
        res.statusCode = 404;
        res.send("File Not Found");
        res.end;
        return;
      } else {
        console.log(err);
        res.statusCode = 500;
        res.send("Internal Server Error");
        res.end;
        return;
      }
    });
    res.contentType("application/fhir+json");
    raw.pipe(res);    
    res.end;
    return;
  }
  //If its a search , we dont support it
  if (Object.keys(req.query).length !== 0) {
    try {
      // Construct a search query from multiple parameters
      let searchQuery = Object.entries(req.query).map(([field, value]) => `${field}:${value}`).join(' ');
      
      let results = searchIndex(req.params.folder, searchQuery);
      res.json(results);
  } catch (err) {
      res.status(400).json({ error: err.message });
  }
    return;
  }
  // If this isn't a search
  // For every file in the directory, roll each up in a bundle
  // dont respect the _count parameter,
  // dont support paging
  try {
    // Get the files as an array
    const files = await fs.promises.readdir(getGitfhirFolderPath(req.params.folder));
    var i = 0; //counter for bundle entries
    var bundle = {
      resourceType: "Bundle",
      id: "",
      meta: {
        lastUpdated: "",
      },
      type: "searchset",
      total: 0,
      entry: [{}],
    };
    bundle.id = uuid();
    for (const file of files) {
      // Get the full paths
      if (file.startsWith(".") == false) {
        //ignore hidden files
        const fromPath = getGitfhirFilepath(req.params.folder, file);
        try {
          const asyncReadFile = util.promisify(fs.readFile);
          //.. this loop goes into some function with async or you can use readFileAsync
          const data = await asyncReadFile(fromPath);
          var entry = JSON.parse(data.toString()); //Add file to a Bundle resource
          bundle.entry[i] = entry;
          console.log(data.toString());
        } catch (err) {
          if (err.code === "ENOENT") {
            console.log("Read file error.  Possible race condition");
          } else {
            console.log(err);
          }
          res.statusCode = 500;
          res.send("Internal Server Error");
          return;
        }
        i++; //increment the file num
      }
    }
    bundle.total = i;
    //bundle.meta.lastUpdated = now;
    res.statusCode = 200;
    res.send(bundle);
    return;
  } catch (e) {
    // Catch anything bad that happens
    console.error("We've thrown! Whoops!", e);
    res.statusCode = 500;
    res.send("Internal Server Error");
    return;
  }
}

function searchIndex(resourceType, query) {
  let index = indices[resourceType];
  if (!index) {
      throw new Error(`No index found for resource type ${resourceType}`);
  }

  return index.search(query);
}