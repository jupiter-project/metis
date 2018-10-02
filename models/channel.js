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
        'id', 'passphrase', 'account', 'password', 'name', 'publicKey',
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
