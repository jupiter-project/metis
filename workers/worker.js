export default class Worker {
  constructor(jobs) {
    this.jobs = jobs;
  }

  addToQueue(recordId, priority = 'high') {
    const self = this;
  }
}
