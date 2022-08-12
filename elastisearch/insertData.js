const esClient = require('../client');
const fs = require("fs");
function insertElasticData(jsonString) {
    console.log("Json file data:", jsonString);
    const body = jsonString;
    const bulkResponse = esClient.bulk({ refresh: true, body });
 };
