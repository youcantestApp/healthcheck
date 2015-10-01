'use strict';

import BaseRepository from './base'
import q from 'q'

export default class HealthcheckRepository extends BaseRepository {
  constructor(config) {
    super(config);
    this.collection = 'healthcheck';
  }
}
