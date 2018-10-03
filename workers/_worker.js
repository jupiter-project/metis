import axios from 'axios';
import events from 'events';

const config = {
  server: 'http://localhost:4001',
};

export default class Worker {
  constructor(jobs) {
    this.jobs = jobs;
  }


  loadWorkers(status, queueName = 'all') {
    return new Promise((resolve, reject) => {
      let getUrl;
      if (status === 'all' && status === 'all') {
        getUrl = '/jobs/0..10000/desc';
      } else if (queueName === 'all') {
        getUrl = `/jobs/${status}/0..10000/desc`;
      } else {
        getUrl = `/jobs/${queueName}/${status}/0..10000/desc`;
      }

      axios.get(config.server + getUrl)
        .then((response) => {
          // console.log(response.data)
          resolve(response.data);
        })
        .catch((err) => {
          // console.log(err);
          reject(err);
        });
    });
  }

  reloadActiveWorkers(queueName) {
    const self = this;
    const currentTime = Date.now();
    // One minutes duration
    const duration = (60 * 1000) * 1;
    let allWorkers = [];

    // Event handler variable is created
    const eventEmitter = new events.EventEmitter();

    return new Promise((resolve, reject) => {
      self.loadWorkers('active', queueName)
        .then((workers) => {
          console.log('Workers at reload');
          allWorkers = workers;
          console.log(allWorkers);
          const workersSize = allWorkers.length;
          let workersReviewed = 0;

          eventEmitter.on('allworkersReviewed', () => {
            console.log('All active workers reviewed');
            resolve({ completed: true, message: 'Active workers reviewed' });
          });

          workers.forEach((thisWorker) => {
            eventEmitter.on(`worker#${thisWorker.id}_reviewed`, () => {
              if (workersReviewed === workersSize) {
                eventEmitter.emit('allworkersReviewed');
              }
            });

            if (currentTime - thisWorker.data.time > duration) {
              console.log(`Worker#${thisWorker.id} expired!`);
              self.deleteWorker(thisWorker.id)
                .then(() => {
                  console.log(`Worker#${thisWorker.id} deleted.`);
                  self.addTransferToQueue(thisWorker.data.id);
                  console.log(`New worker issued to replace Worker#${thisWorker.id}`);
                  workersReviewed += 1;
                  eventEmitter.emit(`worker#${thisWorker.id}_reviewed`);
                })
                .catch((err) => {
                  console.log(err);
                  workersReviewed += 1;
                  eventEmitter.emit(`worker#${thisWorker.id}_reviewed`);
                });
            } else {
              workersReviewed += 1;
              eventEmitter.emit(`worker#${thisWorker.id}_reviewed`);
            }
          });
        })
        .catch((error) => {
          console.log(error);
          reject({ error: true, message: `Metis-Error:There was an error loading active workers from queue ${queueName}` });
        });
    });
  }

  addToQueue(queueName, data, priority = 'high') {
    this.jobs.create(queueName, data)
      .priority(priority).attempts(2)
      .removeOnComplete(true)
      .save();
  }

  deleteWorker(workerId) {
    return new Promise((resolve, reject) => {
      axios.delete(`${config.server}/job/${workerId}`)
        .then((response) => {
          resolve(response);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
}
