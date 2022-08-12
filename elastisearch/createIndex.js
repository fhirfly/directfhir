const esClient = require('./client');
   const createIndex = async function(indexName){
      return await esClient.indices.create({
      index: indexName
  });
}
module.exports = createIndex;
async function index(){
try {
     const resp = await createIndex('Condition-category');
     console.log(resp);
   } catch (e) {
     console.log(e);
   }
}
