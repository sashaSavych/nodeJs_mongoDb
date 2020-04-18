const { MongoClient } = require('mongodb');
const assert = require('assert');

const { url, dbName } = require('./config');

const circulationRepo = require('./repo/circulation');
const circulationData = require('./data/circulation');

async function main() {
    const mongoClient = new MongoClient(url);
    await mongoClient.connect();

    try {
        const results = await circulationRepo.loadData(circulationData);
        assert.equal(circulationData.length, results.insertedCount);

        const data = await circulationRepo.getData();
        assert.equal(circulationData.length, data.length);

        const filteredData = await circulationRepo.getData({ Newspaper: data[4].Newspaper });
        assert.deepEqual(filteredData[0], data[4]);

        const limitedData = await circulationRepo.getData({}, 3);
        assert.deepEqual(limitedData.length, 3);

        const id = data[4]._id.toString();
        const byId = await circulationRepo.getDataById(id);
        assert.deepEqual(byId, data[4]);

        const newItem = {
            "Newspaper": "A New Paper",
            "Daily Circulation, 2004": 1,
            "Daily Circulation, 2013": 2,
            "Change in Daily Circulation, 2004-2013": 100,
            "Pulitzer Prize Winners and Finalists, 1990-2003": 0,
            "Pulitzer Prize Winners and Finalists, 2004-2014": 0,
            "Pulitzer Prize Winners and Finalists, 1990-2014": 0
        };
        const addedItem = await circulationRepo.addItem(newItem);
        assert(addedItem._id);
        const addedItemById = await circulationRepo.getDataById(addedItem._id);
        assert.deepEqual(addedItemById, newItem);

        const newItemToUpdate = {
            "Newspaper": "A New Paper 2",
            "Daily Circulation, 2004": 1,
            "Daily Circulation, 2013": 2,
            "Change in Daily Circulation, 2004-2013": 100,
            "Pulitzer Prize Winners and Finalists, 1990-2003": 0,
            "Pulitzer Prize Winners and Finalists, 2004-2014": 0,
            "Pulitzer Prize Winners and Finalists, 1990-2014": 0
        };
        const updatedItem = await circulationRepo.updateItem(addedItem._id, newItemToUpdate);
        assert.equal(updatedItem.Newspaper, 'A New Paper 2');
        const updatedItemById = await circulationRepo.getDataById(updatedItem._id);
        assert.equal(updatedItemById.Newspaper, 'A New Paper 2');

        const removedFlag = await circulationRepo.removeItem(updatedItem._id);
        assert(removedFlag);
        const removedItem = await circulationRepo.getDataById(updatedItem._id);
        assert.equal(removedItem, null);

        const avgFinalists = await circulationRepo.averageFinalists();
        // console.log(avgFinalists);

        const avgFinalistsByChange = await circulationRepo.averageFinalistsByChange();
        assert.equal(avgFinalistsByChange.length, 2);

        console.log('*** CRUD operations have been successfully finished! ***')
    } catch (e) {
        console.error(e);
    } finally {
        await mongoClient.db(dbName).dropDatabase();
        mongoClient.close();
    }
}

main();
