// import { gravity } from '../config/gravity';
import Worker from './_worker';

export default class UserWorker extends Worker {
  addToQueue() {
    return false;
  }
}
