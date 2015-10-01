'use strict';

import {config as queueConfigs} from  './../../queue.config';
import amqp from 'amqplib';
import q from 'q';

let instanceUrl = Symbol(), instanceConfig = Symbol();

export default class QueueService {
  constructor(instanceConfigs) {
    this[instanceUrl] = instanceConfigs.connection;
    this[instanceConfig] = instanceConfigs.queue;
  }

  prepare() {
    let defer = q.defer();

    amqp.connect(this[instanceUrl]).then((conn) => {
      conn.createChannel().then((channel) => {
          this.channel = channel;
          defer.resolve({message: 'success on create or get queue channel'});
      }, (err) => {
        defer.reject({message: 'error on create or get queue channel', err: err});
      });
    }, (err) => {
      defer.reject({message: 'error on connect to queue', err: err});
    });

    return defer.promise;
  }
}
