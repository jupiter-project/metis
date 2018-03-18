var Model = require('../models/_model.js');

class garage extends Model {
    constructor(data={id: null}) {
        //Sets model name and table name
        super({
            model: 'garage',
            table: 'garages',
            model_params:[
                'id', 'make', 'model', 'vintage'      
            ],
            data: data
        });
        this.public_key = data.public_key;

        //Mandatory method to be called after data
        this.record = this.setRecord();


        this.validation_rules = [
            //We list all validation rules as a list of hashes
            {
                validate: this.record.make,
                attribute_name: 'make',
                rules: {
                    required: true,
                    dataType: 'String'
                }
            },
            {
                validate: this.record.model,
                attribute_name: 'model',
                rules: {
                    required: true,
                    dataType: 'String'
                }
            },
            {
                validate: this.record.vintage,
                attribute_name: 'vintage',
                rules: {
                    required: true,
                    dataType: 'Boolean'
                }
            }
        ]
    }

    setRecord() {
        //We set default data in this method after calling for the class setRecord method
        var record = super.setRecord(this.data);

        return record;
    }
}


module.exports = garage;