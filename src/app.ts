"use strict";
/**
 * Module dependencies.
 */
import express from "express";
import bodyParser from 'body-parser';
import logger from "morgan";
import { folderGet } from './folderGet';
import { fileGet } from './fileGet';
import { folderPost } from './filePost';
import { fileDelete } from './fileDelete';
import { filePut } from './filePut';

//EXPRESS CONFIG
const app = express();
const cors = require('cors');
//START SERVER
var corsOptions = {
    origin: 'http://localhost:3000', // replace with your domain
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
  }
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(logger("dev"));
app.use(express.json());

//  WE DONT CURRENTLY SUPPORT SEARCHPARAMETER
export async function executeSearch(req: any, res: any) {
  return;
}

//BUNDLE ALL RESOURCES in A FOLDER or READ METADATA
app.get("/:folder", folderGet);

//READ ANY RESOURCE
app.get("/:folder/:file", fileGet);

//CREATE ANY RESOURCE
app.post("/:folder", folderPost);

/*
DELETE ANY RESOURCE
The resource is removed from the disk, and it will no longer appear in search results.
The version number of the resource is incremented (essentially, a new deleted version is created).
Previous versions of the resource are not physically deleted.
The resource may be un-deleted by updating it again.
*/
app.delete("/:folder/:file", fileDelete);

//UPDATE ANY RESOURCE
app.put("/:folder/:file", filePut);

export default app;