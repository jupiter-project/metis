import axios from 'axios';
import Model from './_model';
import { gravity } from '../config/gravity';
import { encryptAndSendMessage } from '../services/gravityService';


class Message extends Model {
  constructor(data = { id: null }) {
    // Sets model name and table name
    super({
      data,
      model: 'message',
      table: 'messages',
      belongsTo: 'user',
      model_params: [
        'sender', 'message', 'name',
      ],
    });
    this.public_key = data.public_key;

    // Mandatory method to be called after data
    this.record = this.setRecord();
  }

  setRecord() {
    // We set default data in this method after calling for the class setRecord method
    const record = super.setRecord(this.data);

    return record;
  }

  sendMessage(user, tableData) {
    const rawMessage = JSON.stringify(this.record);
    const key =  this.model + '_record';
    let data = {[key]:rawMessage, date: Date.now()};
    data = JSON.stringify(data);

    encryptAndSendMessage(data,user.passphrase,tableData.account,null, tableData.password ).then ((response) => {
    }).catch((error) => {
    });
  }
}

module.exports = Message;
