import axios from 'axios';
import events from 'events';
import Model from './_model';
import Methods from '../config/_methods';
import { gravity } from '../config/gravity';

class Channel extends Model {
  constructor(data = { id: null }) {
    // Sets model name and table name
    super({
      data,
      model: 'channel',
      table: 'channels',
      belongsTo: 'user',
      model_params: [
        'id', 'passphrase', 'account', 'password', 'name', 'publicKey', 'sender',
      ],
    });
    this.public_key = data.public_key;

    // Mandatory method to be called after data
    this.record = this.setRecord();


    this.validation_rules = [
      // We list all validation rules as a list of hashes
      {
        validate: this.record.name,
        attribute_name: 'name',
        rules: {
          required: true,
          dataType: 'String',
        },
      },
    ];
  }

  setRecord() {
    // We set default data in this method after calling for the class setRecord method
    const record = super.setRecord(this.data);

    return record;
  }

  loadRecords(accessData) {
    return super.loadRecords(accessData);
  }

  import(accessLink) {
    const self = this;
    const eventEmitter = new events.EventEmitter();
    let recordTable;

    console.log('Access link in create model method');

    return new Promise((resolve, reject) => {
      if (self.verify().errors === true) {
        reject({ false: false, verification_error: true, errors: self.verify().messages });
      } else {
        eventEmitter.on('id_generated', () => {
          const stringifiedRecord = JSON.stringify(self.record);

          const fullRecord = {
            id: self.record.id,
            [`${self.model}_record`]: stringifiedRecord,
            date: Date.now(),
          };
          const encryptedRecord = gravity.encrypt(JSON.stringify(fullRecord));

          console.log(JSON.stringify(fullRecord));
          console.log(self.user);
          const callUrl = `${gravity.jupiter_data.server}/nxt?requestType=sendMessage&secretPhrase=${recordTable.passphrase}&recipient=${self.user.account}&messageToEncrypt=${encryptedRecord}&feeNQT=${gravity.jupiter_data.feeNQT}&deadline=${gravity.jupiter_data.deadline}&recipientPublicKey=${self.user.publicKey}&compressMessageToEncrypt=true`;

          // console.log(callUrl)
          // console.log(self);
          axios.post(callUrl)
            .then((response) => {
              // console.log(response)
              if (response.data.broadcasted && response.data.broadcasted === true) {
                resolve({ success: true, message: 'Record created' });
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

        eventEmitter.on('request_authenticated', () => {
          self.loadTable(accessLink)
            .then((res) => {
              recordTable = res;
              eventEmitter.emit('id_generated');
            })
            .catch((err) => {
              reject({ success: false, errors: err });
            });
        });

        if (accessLink) {
          eventEmitter.emit('request_authenticated');
        } else {
          reject('Missing access link');
        }
      }
    });
  }

  async create() {
    if (!this.record.passphrase || this.record.password) {
      this.record.passphrase = Methods.generate_passphrase();
      this.record.password = Methods.generate_keywords();
      this.data.passphrase = this.record.passphrase;
      this.data.password = this.record.password;

      const response = await gravity.getAccountInformation(this.record.passphrase);

      this.record.account = response.address;
      this.record.publicKey = response.publicKey;
      this.data.account = response.address;
      this.data.publicKey = response.publicKey;
    }

    if (this.accessLink) {
      return super.create(JSON.parse(gravity.decrypt(this.accessLink)));
    }

    return Promise.reject({ error: true, message: 'Missing user information' });
  }
}

module.exports = Channel;
