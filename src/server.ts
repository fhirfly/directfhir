import app from './app';
import app from './app';

const fs = require('fs').promises;
const path = require('path');
const lunr = require('lunr');

let indices = {};  // Indices storage, one per resource type

async function readCapabilityStatement(capabilityStatementPath) {
    // Read and parse the CapabilityStatement file
    let content = await fs.readFile(capabilityStatementPath, 'utf8');
    let capabilityStatement;
    try {
        capabilityStatement = JSON.parse(content);
    } catch (err) {
        console.error(`Error parsing JSON for file ${capabilityStatementPath}: ${err}`);
        return {};
    }

    // Extract a mapping of resource types to search parameters
    let resourceSearchParams = {};
    for (let resource of capabilityStatement.rest[0].resource) {
        resourceSearchParams[resource.type] = resource.searchParam.map(param => param.name);
    }

    return resourceSearchParams;
}

async function indexFhirResources(parentDirectory, resourceSearchParams) {
    // Read all subdirectories (FHIR resourceTypes)
    let resourceTypes = await fs.readdir(parentDirectory, { withFileTypes: true });
    resourceTypes = resourceTypes.filter(dirent => dirent.isDirectory()).map(dirent => dirent.name);

    for (const resourceType of resourceTypes) {
        // Get search parameters for this resource type from the CapabilityStatement mapping
        let searchParams = resourceSearchParams[resourceType];
        if (!searchParams) {
            console.warn(`No search parameters defined for resource type ${resourceType}`);
            continue;
        }

        let currentDirectory = path.join(parentDirectory, resourceType);
        let files = await fs.readdir(currentDirectory, { withFileTypes: true });
        files = files.filter(dirent => dirent.isFile()).map(dirent => dirent.name);

        let documents = [];
        let id = 1;

        for (const file of files) {
            let filePath = path.join(currentDirectory, file);

            // Read and parse the file content
            let content = await fs.readFile(filePath, 'utf8');
            let resourceContent;
            try {
                resourceContent = JSON.parse(content);
            } catch (err) {
                console.error(`Error parsing JSON for file ${filePath}: ${err}`);
                continue;
            }

            resourceContent.id = id++;
            documents.push(resourceContent);
        }

        // Index the documents with Lunr
        indices[resourceType] = lunr(function () {
            this.ref('id');
            searchParams.forEach(param => {
                this.field(param);
            });

            documents.forEach(function (doc) {
                this.add(doc);
            }, this);
        });
    }
}



//START SERVER
app.listen(3000, async () => {
        
        console.log(`Server listening at http://localhost:3000`);
    
        let capabilityStatementPath = "./gitfhir/CapabilityStatement/directfhir.json";
        let resourceSearchParams = await readCapabilityStatement(capabilityStatementPath);
    
        let parentDirectory = "./gitfhir";
        await indexFhirResources(parentDirectory, resourceSearchParams);
    };

console.log("listening on port 3000");
