const MongoClient = require('mongodb').MongoClient;

const circulationRepo = require('./repo/circulation');
const circulationData = require('./data/circulation');


const url = 'mongodb://localhost:27017';
const dbName = 'circulation';

async function main() {
    const client = new MongoClient(url);
    await client.connect();

    const results = await circulationRepo.loadData(circulationData);
    console.log(results.insertedCount, results.ops);

    const admin = client.db(dbName).admin();
    console.log(await admin.serverStatus());
    console.log(await admin.listDatabases());
}

main();
