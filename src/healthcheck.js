'use strict';

import q from 'q';

import ScheduleRepository from './repositories/schedule';
import ResultRepository from './repositories/test-result';
import HealthcheckRepository from './repositories/healthcheck';
import QueueService from './services/queue';

let configs = Symbol(), resultRepo = Symbol(), scheduleRepo = Symbol(), healthcheckRepo = Symbol(), queueService = Symbol();

export default class HealthCheck {
  constructor(config) {
    this[configs] = config;
    this[scheduleRepo] = new ScheduleRepository(config);
    this[resultRepo] = new ResultRepository(config);
    this[healthcheckRepo] = new HealthcheckRepository(config);
    this[queueService] = new QueueService({
      connection: this[configs].connections.queue,
      queue: this[configs].queues.schedule
    });
  }

  execute() {
    let executions = []


    let result = {};

    //first check queue connnection
    result.queue = {};
    let checkqueue = this[queueService].prepare().then((msg) => {
      console.log('0');
      result.queue.status = true;
      result.queue.err = null;
    }, (err) => {
      result.queue.status = false;
      result.queue.err = err;
    });

    executions.push(checkqueue);

    //then check database connection
    result.database = {};
    let checkdb = this[healthcheckRepo].getConnection().then((db) => {
      console.log('1');
      result.database.status = true;
      result.database.err = null;

      db.close();
    }, (err) => {
      result.database.status = false;
      result.database.err = err;
    });
    executions.push(checkdb);

    //then check if collection is ok
    result.collection= {};
    let checkcollection = this[healthcheckRepo].getLastOne().then((resp) => {
      console.log('2');
      if(resp && resp.length > 0) {
        result.collection.status = true;
        result.collection.err = null;
      }
      else {
        result.collection.status = false;
        result.collection.err = err;
      }
    }, (err) => {
      result.collection.status = false;
      result.collection.err = err;
    });
    executions.push(checkcollection);

    //then check if tests are executated on last 5 minutes
    let schedule_id = '560cab39363465000b6b0000';
    result.testExecution = {};
    let checktest = this[resultRepo].getByScheduleId(schedule_id).then((resp) => {
      console.log('3');
      console.log('resp:', resp);
      if(resp) {
        var execution_date = new Date(result.executionDate.toString());
        if(new Date() - executionDate <= 600000) {
          result.testExecution.status = true;
          result.testExecution.err = null;
        }
        else {
          result.testExecution.status = false;
          result.testExecution.err = 'last execution time is more than 10 minutes ago';
        }

        result.web = resp.testSucceed;
      }
      else {
        result.testExecution.status = false;
        result.testExecution.err = {message:'none found'};
        result.web = undefined;
      }
    }, (err) => {
      result.testExecution.status = false;
      result.testExecution.err = err;
      result.web = undefined;
    });
    executions.push(checktest);


    //now persist results
    return q.all(executions).fin(() => {
      result.executionDate = new Date();
      console.log(result);
      this[healthcheckRepo].save(result).then(() => {
        console.log('finish save');
        return;
      }, () => {
        console.log('error up save healthcheck');
      });
    });
  }
}
