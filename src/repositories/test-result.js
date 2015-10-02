'use strict';

import BaseRepository from './base'
import q from 'q'

export default class ScheduleRepository extends BaseRepository {
  constructor(config) {
    super(config);
    this.collection = 'testResults';
  }
  getByScheduleId(id) {
  	let defer = q.defer();

  	this.getConnection().then((db) => {
  		let collection = db.collection(this.collection);

  		collection.find({ scheduleId: id }).sort({ executionDate: -1 }).toArray(
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
}
