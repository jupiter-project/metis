// import { gravity } from '../config/gravity';
import Worker from './_worker.mjs';

export default class UserWorker extends Worker {
  addToQueue() {
    return false;
  }
}
