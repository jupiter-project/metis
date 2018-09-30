import Model from './_model';

class Transfer extends Model {
  constructor(data = { id: null }) {
    // Sets model name and table name
    super({
      data,
      model: 'transfer',
      table: 'transfers',
      model_params: [
        'id', 'recipient', 'amount', 'balanceAtTransfer', 'notes',
      ],
    });
    this.public_key = data.public_key;

    // Mandatory method to be called after data
    this.record = this.setRecord();


    this.validation_rules = [
      // We list all validation rules as a list of hashes
      {
        validate: this.record.recipient,
        attribute_name: 'recipient',
        rules: {
          required: true,
          dataType: 'String',
        },
      },
      {
        validate: this.record.amount,
        attribute_name: 'amount',
        rules: {
          required: true,
          dataType: 'Cryptocurrency',
        },
      },
      {
        validate: this.record.balanceAtTransfer,
        attribute_name: 'balanceAtTransfer',
        rules: {
          required: true,
          dataType: 'Cryptocurrency',
        },
      },
      {
        validate: this.record.notes,
        attribute_name: 'notes',
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

  loadRecords() {
    return super.loadRecords({ size: 'all', show_unconfirmed: true });
  }
}

module.exports = Transfer;
