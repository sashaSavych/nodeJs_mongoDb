const { MongoClient, ObjectId } = require('mongodb');
const { url, dbName, collectionName } = require('../config');

function loadData(data) {
    return new Promise(async (resolve, reject) => {
        const client = new MongoClient(url);

        try {
            await client.connect();
            const db = client.db(dbName);

            resolve(await db.collection(collectionName).insertMany(data));
            client.close();
        } catch (e) {
            reject(e);
        }
    })
}

function getData(query, limit) {
    return new Promise(async (resolve, reject) => {
        const client = new MongoClient(url);

        try {
            await client.connect();
            const db = client.db(dbName);

            let items = db.collection(collectionName).find(query);

            if (limit > 0) {
                items = items.limit(limit);
            }

            resolve(await items.toArray());
            client.close();
        } catch (e) {
            reject(e);
        }
    })
}

function getDataById(id) {
    return new Promise(async (resolve, reject) => {
        const client = new MongoClient(url);

        try {
            await client.connect();
            const db = client.db(dbName);

            const result = await db.collection(collectionName).findOne({ _id: ObjectId(id) });
            resolve(result);
            client.close();
        } catch (e) {
            reject(e);
        }
    })
}

function addItem(item) {
    return new Promise(async (resolve, reject) => {
        const client = new MongoClient(url);

        try {
            await client.connect();
            const db = client.db(dbName);
            const addedItem = await db.collection(collectionName).insertOne(item);

            resolve(addedItem.ops[0]);
            client.close();
        } catch (e) {
            reject(e);
        }
    })
}

function updateItem(id, item) {
    return new Promise(async (resolve, reject) => {
        const client = new MongoClient(url);

        try {
            await client.connect();
            const db = client.db(dbName);
            const updatedItem = await db.collection(collectionName)
                .findOneAndReplace({ _id: ObjectId(id) }, item, { returnOriginal: false });

            resolve(updatedItem.value);
            client.close();
        } catch (e) {
            reject(e);
        }
    })
}

function removeItem(id) {
    return new Promise(async (resolve, reject) => {
        const client = new MongoClient(url);

        try {
            await client.connect();
            const db = client.db(dbName);
            const removed = await db.collection(collectionName).deleteOne({ _id: ObjectId(id) });

            resolve(removed.deletedCount === 1);
            client.close();
        } catch (e) {
            reject(e);
        }
    })
}

function averageFinalists() {
    return new Promise(async (resolve, reject) => {
        const client = new MongoClient(url);

        try {
            await client.connect();
            const db = client.db(dbName);
            const average = await db.collection(collectionName)
                .aggregate([
                    { $group: {
                            _id: null,
                            avgFinalists: { $avg: '$Pulitzer Prize Winners and Finalists, 1990-2014' }
                        }}
                ]).toArray();

            resolve(average[0].avgFinalists);
            client.close();
        } catch (e) {
            reject(e);
        }
    })
}

function averageFinalistsByChange() {
    return new Promise(async (resolve, reject) => {
        const client = new MongoClient(url);

        try {
            await client.connect();
            const db = client.db(dbName);
            const average = await db.collection(collectionName)
                .aggregate([
                    { $project: {
                            'Newspaper' : 1,
                            'Pulitzer Prize Winners and Finalists, 1990-2014': 1,
                            'Change in Daily Circulation, 2004-2013': 1,
                            overallChange: {
                                $cond: {
                                    if: {
                                        $gte: ['$Change in Daily Circulation, 2004-2013', 0]
                                    },
                                    then: 'positive',
                                    else: 'negative'
                                }
                            }
                        }},
                    { $group: {
                            _id: '$overallChange',
                            avgFinalists: { $avg: '$Pulitzer Prize Winners and Finalists, 1990-2014' }
                        }}
                ]).toArray();

            resolve(average);
            client.close();
        } catch (e) {
            reject(e);
        }
    })
}

module.exports = { loadData, getData, getDataById, addItem, updateItem, removeItem, averageFinalists, averageFinalistsByChange };
