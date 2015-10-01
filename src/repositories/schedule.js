'use strict';

import BaseRepository from './base'
import q from 'q'

export default class ScheduleRepository extends BaseRepository {
  constructor(config) {
    super(config);
    this.collection = 'schedules';
  }
}
