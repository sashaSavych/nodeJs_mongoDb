const { MongoClient, ObjectId } = require('mongodb');

function circulationRepo() {
    const url = 'mongodb://localhost:27017';
    const dbName = 'circulation';

    function loadData(data) {
        return new Promise(async (resolve, reject) => {
            const client = new MongoClient(url);

            try {
                await client.connect();
                const db = client.db(dbName);

                resolve(await db.collection('newspapers').insertMany(data));
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

                let items = db.collection('newspapers').find(query);

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

                const result = await db.collection('newspapers').findOne({ _id: ObjectId(id) });
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
                const addedItem = await db.collection('newspapers').insertOne(item);

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
                const updatedItem = await db.collection('newspapers')
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
                const removed = await db.collection('newspapers').deleteOne({ _id: ObjectId(id) });

                resolve(removed.deletedCount === 1);
                client.close();
            } catch (e) {
                reject(e);
            }
        })
    }

    return { loadData, getData, getDataById, addItem, updateItem, removeItem };
}

module.exports = circulationRepo();
