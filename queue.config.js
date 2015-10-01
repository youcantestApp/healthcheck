exports.config = {
  PREFETCH_NUMBER: 1,
  queue: {
    options: {
      durable: true
    },
    consumeOpts: {
      ack: true
    }
  }
};
