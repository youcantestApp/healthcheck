'use strict';

import mongoDB from 'mongodb';
import q from 'q';

let mongoURL = Symbol(),
mongoDatabaseName = Symbol(),
instance = Symbol();

let collection = Symbol();

export default class BaseRepository {
  constructor(config) {
    this[mongoURL] = config.connections.nosql;
    this[mongoDatabaseName] = config.nosql.database;
    this[instance] = undefined;

    this.collection = undefined;
  }
  generateObjectIdFromString(str) {
    return mongoDB.ObjectID.createFromHexString(str);
  }
  getConnection() {
  	var defer = q.defer();

  	mongoDB.MongoClient.connect(`${this[mongoURL]}/${this[mongoDatabaseName]}`,
    (err, db) => {
  		if (err != null) {
  			return defer.reject({
            message: 'unable to connect to mongo database',
            error: err
          });
  		}

  		defer.resolve(db);
  	});

  	return defer.promise;
  }

  getById(id) {
  	let defer = q.defer();

  	this.getConnection().then((db) => {
  		let collection = db.collection(this.collection);

  		collection.find({ _id: this.generateObjectIdFromString(id) }).toArray(
      (err, docs) => {
  			if (err != null) {
  				return defer.reject({
            message:`error on find documents for collection ${this.collection}`,
            error: err
          });
  			}

        db.close();
  			return defer.resolve(docs[0]);
  		});
  	}, (err) => {
      defer.reject(err);
    });
  	return defer.promise;
  }
  save(object) {
  	let defer = q.defer();

  	this.getConnection().then((db) => {
  		let collection = db.collection(this.collection);

  		if(object._id) {
  			collection.update({ _id: object._id }, object).then((record) => {
          db.close();

  				defer.resolve(record[0]._id.tostring());
  			}, (err) => {
  				return defer.reject({
            message:`error on update document in collection ${this.collection}`,
            error: err
          });
        });
  		}
  		else {
  			collection.insert(object).then((record) => {
          db.close();

  				return defer.resolve(record);
  			}, (err) => {
  				return defer.reject({
            message:`error on save document in collection ${this.collection}`,
            error: err
          });
        });
  		}
  	});

  	return defer.promise;
  }
  getAllByIds(list) {
  	let defer = q.defer();

  	this.getConnection().then((db) => {
  		let collection = db.collection(this.collection);

  		let objID_list = [];
  		list.forEach((element) => objID_list.push(this.generateObjectIdFromString(element)));

  		collection.find({ _id: { '$in': listOfObjIds } }).toArray((err, docs) => {
  			if (err != null) {
  				return defer.reject({
            message:`error on find documents in collection ${this.collection}`,
            error: err
          });
  			}

        db.close();
  			defer.resolve(docs);
  		});
  	});

  	return defer.promise;
  }
  getLastOne() {
  	let defer = q.defer();

  	this.getConnection().then((db) => {
  		let collection = db.collection(this.collection);

  		collection.find().sort({ 'executionDate': -1 }).toArray((err, docs) => {
  			if (err != null) {
  				return defer.reject({
            message:`error on find documents in collection ${this.collection}`,
            error: err
          });
  			}

        db.close();
  			defer.resolve(docs);
  		});
    });

  	return defer.promise;
  }
  getAll() {
  	let defer = q.defer();

  	this.getConnection().then((db) => {
  		let collection = db.collection(this.collection);

  		collection.find().toArray((err, docs) => {
  			if (err != null) {
  				return defer.reject({
            message:`error on find documents in collection ${this.collection}`,
            error: err
          });
  			}

        db.close();
  			defer.resolve(docs);
  		});
    });

  	return defer.promise;
  }
}
