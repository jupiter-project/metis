import axios from 'axios';
import Model from './_model.mjs';
import { gravity } from '../config/gravity.cjs';


export default class Message extends Model {
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


  sendMessage(userData, tableData) {
    const self = this;
    return new Promise((resolve, reject) => {
      const stringifiedRecord = JSON.stringify(self.record);

      const fullRecord = {
        [`${self.model}_record`]: stringifiedRecord,
        date: Date.now(),
      };

      const encryptedRecord = gravity.encrypt(
        JSON.stringify(fullRecord),
        tableData.password,
      );

      const callUrl = `${gravity.jupiter_data.server}/nxt?requestType=sendMessage&secretPhrase=${userData.passphrase}&recipient=${tableData.account}&messageToEncrypt=${encryptedRecord}&feeNQT=${gravity.jupiter_data.feeNqt}&deadline=${gravity.jupiter_data.deadline}&recipientPublicKey=${tableData.publicKey}&compressMessageToEncrypt=true`;
      // console.log(self);
      axios.post(callUrl)
        .then((response) => {
          if (response.data.broadcasted && response.data.broadcasted === true) {
            resolve({ success: true, message: 'Message sent!' });
          } else if (response.data.errorDescription != null) {
            reject({ success: false, errors: response.data.errorDescription });
          } else {
            reject({ success: false, errors: 'Unable to save data in blockchain' });
          }
        })
        .catch((error) => {
          reject({ success: false, errors: error });
        });
    });
  }
}

// module.exports = Message;
