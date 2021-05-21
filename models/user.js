import bcrypt from 'bcrypt-nodejs';
import axios from 'axios';
import Model from './_model';
import methods from '../config/_methods';
import { gravity } from '../config/gravity';

const logger = require('../utils/logger');

class User extends Model {
  constructor(data, accessPass) {
    // Sets model name and table name
    super({
      data,
      accessPass,
      model: 'user',
      table: 'users',
      model_params: ['id', 'account', 'accounthash', 'email', 'firstname', 'alias',
        'lastname', 'secret_key', 'twofa_enabled', 'twofa_completed', 'api_key', 'encryption_password',
      ],
      prunableOnCreate: true,
      hasDatabase: true,
    },
    accessPass);
    this.public_key = data.public_key;

    // Mandatory method to be called after data
    this.record = this.setRecord();

    this.validation_rules = [
      // We list all validation rules as a list of hashes
      {
        validate: this.record.account,
        attribute_name: 'account',
        rules: {
          required: true,
          dataType: 'String',
        },
      },
      {
        validate: this.record.accounthash,
        attribute_name: 'accounthash',
        rules: {
          required: true,
          dataType: 'String',
        },
      },
      {
        validate: this.record.email,
        attribute_name: 'email',
        rules: {
          required: false,
          dataType: 'Email',
        },
      },
      {
        validate: this.record.alias,
        attribute_name: 'alias',
        rules: {
          required: true,
          dataType: 'String',
        },
      },
      {
        validate: this.record.firstname,
        attribute_name: 'firstname',
        rules: {
          required: false,
          dataType: 'String',
        },
      },
      {
        validate: this.record.lastname,
        attribute_name: 'lastname',
        rules: {
          required: false,
          dataType: 'String',
        },
      },
      {
        validate: this.record.secret_key,
        attribute_name: 'secret_key',
        rules: {
          dataType: 'String',
        },
      },
      {
        validate: this.record.twofa_enabled,
        attribute_name: 'twofa_enabled',
        rules: {
          required: true,
          dataType: 'Boolean',
        },
      },
      {
        validate: this.record.twofa_completed,
        attribute_name: 'twofa_completed',
        rules: {
          required: true,
          dataType: 'Boolean',
        },
      },
      {
        validate: this.record.api_key,
        attribute_name: 'api_key',
        rules: {
          required: true,
          dataType: 'String',
        },
      },
      {
        validate: this.record.encryption_password,
        attribute_name: 'encryption_password',
        rules: {
          required: true,
          dataType: 'String',
        },
      },
    ];
  }

  async setAlias(passphrase) {
    const aliasCheckup = await gravity.getAlias(this.record.alias);
    if (aliasCheckup.accountRS === this.record.account) {
      return { success: false, message: 'Alias already set', fullResponse: aliasCheckup };
    }


    if (aliasCheckup.available) {
      const aliasResponse = await gravity.setAlias({
        passphrase,
        alias: this.record.alias,
        account: this.record.account,
      });

      if (aliasResponse.transaction) {
        return { success: true, message: 'Alias set', fullResponse: aliasResponse };
      }

      return { success: false, message: 'Error setting alias', fullError: aliasResponse };
    }

    aliasCheckup.error = true;
    return aliasCheckup;
  }

  setRecord() {
    // We set default data in this method after calling for the class setRecord method
    const record = super.setRecord(this.data);

    if (record.accounthash === undefined || record.account == null) {
      record.accounthash = this.generateHash(this.data.account);
    }

    if ((this.data.api_key === undefined || this.data.api_key == null || this.data.api_key === '')) {
      record.api_key = this.generateKey();
    } else {
      record.api_key = this.data.api_key;
    }

    return record;
  }

  generateHash(accounthash) {
    return bcrypt.hashSync(accounthash, bcrypt.genSaltSync(8), null);
  }

  validPassword(accounthash) {
    return bcrypt.compareSync(accounthash, this.record.accounthash);
  }

  generateKey() {
    const generatedPhrase = methods.generate_keywords();
    const unfilteredKey = bcrypt.hashSync(generatedPhrase, bcrypt.genSaltSync(8), null);

    return unfilteredKey;
  }

  findById() {
    const self = this;
    return new Promise(async (resolve, reject) => {
      if (self.record && self.record.id === process.env.APP_ACCOUNT_ID) {
        self.record = {
          id: process.env.APP_ACCOUNT_ID,
          account: process.env.APP_ACCOUNT_ADDRESS,
          email: process.env.APP_EMAIL,
          alias: 'Admin',
          firstname: 'Admin',
          lastname: '',
          secret_key: null,
          twofa_enabled: false,
          twofa_completed: false,
          public_key: process.env.APP_PUBLIC_KEY,
          api_key: process.env.APP_API_KEY,
          admin: true,
          secret: process.env.APP_ACCOUNT,
        };
        resolve(true);
      } else if (
        self.accessData
      ) {
        try {
          // console.log(self.accessData);
          const accessKey = gravity.decrypt(self.accessData.accessKey);
          // const encryptionKey = gravity.decrypt(self.accessData.encryptionKey);
          const account = gravity.decrypt(self.accessData.account);
          const accountData = JSON.parse(gravity.decrypt(self.accessData.accountData));
          const record = await gravity.getUser(account, accessKey, accountData);
          self.record = JSON.parse(record.user);
          resolve(true);
        } catch (e) {
          logger.error(e);
        }
      } else {
        try {
          const res = await self.last();
          const { record } = res;
          self.record = record;
          resolve(true);
        } catch (error) {
          reject(error);
        }
      }
    });
  }

  update(passphrase) {
    const self = this;

    return new Promise(async (resolve, reject) => {
      if (self.verify().errors === true) {
        reject({ false: false, verification_error: true, errors: self.verify().messages });
      } else {
        const accessKey = gravity.decrypt(self.accessData.accessKey);
        // const encryptionKey = gravity.decrypt(self.accessData.encryptionKey);
        const account = gravity.decrypt(self.accessData.account);
        const accountData = JSON.parse(gravity.decrypt(self.accessData.accountData));
        const record = await gravity.getUser(account, accessKey, accountData);
        const recordTable = gravity.getTableData('users', record.database);


        const stringifiedRecord = JSON.stringify(self.record);
        const fullRecord = {
          id: self.record.id,
          [`${self.model}_record`]: stringifiedRecord,
          date: Date.now(),
        };

        const encryptedRecord = gravity.encrypt(
          JSON.stringify(fullRecord),
          self.record.encryption_password,
        );
        let callUrl = `${gravity.jupiter_data.server}/nxt?requestType=sendMessage&secretPhrase=${recordTable.passphrase}&recipient=${self.record.account}&messageToEncrypt=${encryptedRecord}&feeNQT=${gravity.jupiter_data.feeNQT}&deadline=${gravity.jupiter_data.deadline}`;

        if (self.record.public_key) {
          callUrl += `&recipientPublicKey=${self.record.public_key}&compressMessageToEncrypt=true`;
        } else {
          callUrl += '&compressMessageToEncrypt=true';
        }

        axios.post(callUrl)
          .then((response) => {
            // console.log(response);
            if (response.data.broadcasted && response.data.broadcasted === true) {
              self.setAlias(passphrase)
                .then((aliasSetting) => {
                  if (!aliasSetting.success) {
                    logger.info(aliasSetting);
                  }
                });
              resolve({ success: true, message: 'Record created', record: self.record });
            } else if (response.data.errorDescription != null) {
              reject({ success: false, errors: response.data.errorDescription });
            } else {
              reject({ success: false, errors: 'Unable to save data in blockchain' });
            }
          })
          .catch((error) => {
            logger.error(error);
            reject({ success: false, errors: error.response });
          });
      }
    });
  }
}

module.exports = User;
