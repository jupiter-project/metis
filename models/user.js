import bcrypt from 'bcrypt-nodejs';
import Model from './_model';
import methods from '../config/_methods';
import { gravity } from '../config/gravity';


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
          required: true,
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
          required: true,
          dataType: 'String',
        },
      },
      {
        validate: this.record.lastname,
        attribute_name: 'lastname',
        rules: {
          required: true,
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
        && self.accessData.userRecordFound
        && (self.accessData.noUserTables || self.accessData.userNeedsBackup)
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
          console.log(e);
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
}

module.exports = User;
