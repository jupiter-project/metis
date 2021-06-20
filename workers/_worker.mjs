import axios from 'axios';
import events from 'events';
import config from '../config.js';

const url = `http://localhost:${config.jobQueue.port}`;

// const config = {
//   server: 'http://localhost:4001',
// };

export default class Worker {
  constructor(jobs, io) {
    this.jobs = jobs;
    this.socket = io;
  }


  loadWorkers(status, queueName = 'all') {
    return new Promise((resolve, reject) => {
      let path = `/jobs/${queueName}/${status}/0..10000/desc`;
      if (status === 'all' && status === 'all') {
        path = '/jobs/0..10000/desc';
      } else if (queueName === 'all') {
        path = `/jobs/${status}/0..10000/desc`;
      }

      axios.get(url + path)
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
          allWorkers = workers;
          const workersSize = allWorkers.length;
          let workersReviewed = 0;

          eventEmitter.on('allworkersReviewed', () => {
            resolve({ completed: true, message: 'Active workers reviewed' });
          });

          workers.forEach((thisWorker) => {
            eventEmitter.on(`worker#${thisWorker.id}_reviewed`, () => {
              if (workersReviewed === workersSize) {
                eventEmitter.emit('allworkersReviewed');
              }
            });

            if (currentTime - thisWorker.data.originalTime > duration) {
              console.log(`Worker#${thisWorker.id} expired!`);
              self.deleteWorker(thisWorker.id)
                .then(() => {
                  console.log(`Worker#${thisWorker.id} deleted.`);
                  const newWorkerData = thisWorker.data;
                  newWorkerData.originalTime = Date.now();
                  self.addToQueue(queueName, newWorkerData);
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
      axios.delete(`${url}/job/${workerId}`)
        .then((response) => {
          resolve(response);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
}
