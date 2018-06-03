var Model = require('../models/_model.js');
var methods = require('../config/_methods.js');
var bcrypt = require('bcrypt-nodejs');

class User extends Model {
    constructor(data) {
        //Sets model name and table name
        super({
            model: 'user',
            table: 'users',
            model_params: ['id', 'account', 'accounthash', 'email', 'firstname', 'lastname',
                'secret_key', 'twofa_enabled', 'twofa_completed', 'api_key'
            ],
            data: data
        });
        this.public_key = data.public_key;

        //Mandatory method to be called after data
        this.record = this.setRecord();


        this.validation_rules = [
            //We list all validation rules as a list of hashes
            {
                validate: this.record.account,
                attribute_name: 'account',
                rules: {
                    required: true,
                    dataType: 'String'
                }
            },
            {
                validate: this.record.accounthash,
                attribute_name: 'accounthash',
                rules: {
                    required: true,
                    dataType: 'String'
                }
            },
            {
                validate: this.record.email,
                attribute_name: 'email',
                rules: {
                    required: true,
                    dataType: 'Email'
                }
            },
            {
                validate: this.record.firstname,
                attribute_name: 'firstname',
                rules: {
                    required: true,
                    dataType: 'String'
                }
            },
            {
                validate: this.record.lastname,
                attribute_name: 'lastname',
                rules: {
                    required: true,
                    dataType: 'String'
                }
            },
            {
                validate: this.record.secret_key,
                attribute_name: 'secret_key',
                rules: {
                    dataType: 'String'
                }
            },
            {
                validate: this.record.twofa_enabled,
                attribute_name: 'twofa_enabled',
                rules: {
                    required: true,
                    dataType: 'Boolean'
                }
            },
            {
                validate: this.record.twofa_completed,
                attribute_name: 'twofa_completed',
                rules: {
                    required: true,
                    dataType: 'Boolean'
                }
            },
            {
                validate: this.record.api_key,
                attribute_name: 'api_key',
                rules: {
                    required: true,
                    dataType: 'String'
                }
            }
        ]
    }

    setRecord() {
        //We set default data in this method after calling for the class setRecord method
        var record = super.setRecord(this.data);

        if (record.accounthash == undefined || record.account == null) {
            record.accounthash = this.generateHash(this.data.account);
        }

        if ((this.data.api_key == undefined || this.data.api_key == null || this.data.api_key == '')) {
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
        var generated_phrase = methods.generate_keywords();
        return bcrypt.hashSync(generated_phrase, bcrypt.genSaltSync(8), null);
    }

    findById(){
        var self= this;
        return new Promise(function(resolve, reject) {
            if(self.record && self.record.id== process.env.APP_ACCOUNT_ID){
                self.record={
                    id: process.env.APP_ACCOUNT_ID,
                    account: process.env.APP_ACCOUNT_ADDRESS,
                    email: process.env.APP_EMAIL,
                    firstname: 'Admin',
                    lastname: '',
                    secret_key: null,
                    twofa_enabled: false,
                    twofa_completed: false,
                    public_key: process.env.APP_PUBLIC_KEY,
                    api_key: process.env.APP_API_KEY,
                    admin: true
                }
                resolve(true);
            }else{
                self.last()
                .then(res => {
                    var record= res.record;
                    self.record= record;
                    resolve(true);
                })
                .catch(error=>{
                    reject(error);
                });
            }
        });
    }
}

module.exports = User;