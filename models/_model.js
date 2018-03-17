var axios = require('axios');
var validate = require('../models/_validations.js');
var gravity = require('../config/gravity.js');
var events = require('events');


class Model {
    constructor(data) {
        //Default values of model
        this.id = null;
        this.record = {};
        this.model = data.model;
        this.table = data.table;
        this.model_params = data.model_params;
        this.data = data.data;
        this.validation_rules = [];
        this.record = this.setRecord();
    }

    setRecord() {
        var record = {}
        var self = this;

        for (var x in self.model_params) {
            var key = self.model_params[x];
            if (record[key] == undefined) {
                record[key] =  self.data[key];
            }
        }
        self.id = record.id;
        self.record.date = Date.now();

        if (self.model == 'user') {
            self.user = { id: self.id, api_key: self.record.api_key, public_key: self.data.public_key }
        } else {
            self.user = { id: self.data.user_id, api_key: self.data.user_api_key, public_key: self.data.public_key, address: self.data.user_address }
        }

        return record;
    }

    generateId(table) {
        var self = this;

        return new Promise(function(resolve, reject) {
            var call_url = gravity.jupiter_data.server + '/nxt?requestType=sendMessage&secretPhrase=' + table.passphrase +
                '&recipient=' + table.address + '&messageToEncrypt=' + 'Generating Id for record' + '&feeNQT=' + 100 + '&deadline=' + gravity.jupiter_data.deadline + '&recipientPublicKey=' + table.public_key + '&compressMessageToEncrypt=true&encryptedMessageIsPrunable=true'

            axios.post(call_url)
                .then(function(response) {
                    if (response.data.broadcasted != null && response.data.broadcasted == true) {
                        self.id = response.data.transaction;
                        self.record.id = self.id
                        self.data.id = response.data.transaction;
                        self.record = self.setRecord();

                        resolve({ success: true, message: 'Id generated', id: response.data.transaction });
                    } else if (response.data.errorDescription != null) {
                        reject(response.data.errorDescription);
                    } else {
                        reject('There was an error generating Id for record');
                    }
                })
                .catch(function(error) {
                    console.log(error);
                    reject(error);
                });

        });
    }


    verify() {
        var account_validation, accounthash_validation, email_validation, firstname_validation, lastname_validation, secret_key_validation, twofa_enabled_validation, twofa_completed_validation, api_key_validation;
        var total_errors = [];
        var error_found = false;
        var self = this;

        for (var x in this.validation_rules) {
            var rule = self.validation_rules[x];
            var validation = validate.validate_model(rule.attribute_name, rule.validate, rule.rules);

            if (validation.error == true) {
                error_found = true;
                total_errors.push(validation.messages);
                total_errors = Array.prototype.concat.apply([], total_errors);

            }
        }
        return ({ errors: error_found, messages: total_errors })
    }

    loadTable() {
        var self = this;
        return new Promise(function(resolve, reject) {
            gravity.loadAppData()
                .then(response => {
                    var tables = response.app.tables;
                    for (var x in tables) {
                        if (tables[x][self.table] != undefined) {
                            var record_table = tables[x][self.table];
                            resolve(record_table);
                            break;
                        }
                    }
                    reject('Table could not be found');
                })
                .catch(error => {
                    console.log(error);
                    reject(error);
                });
        });
    }

    getAllVersions(){
        var record_list=[]
        var self= this;
        var created_at;

        return new Promise(function(resolve, reject) {

            gravity.getAllRecords(self.table)
            .then(response=>{
                var records= response.records;
                
                for (var x in records){
                    var this_record= records[x];
                    if(this_record.id==self.id){
                        var record_record= JSON.parse(this_record[self.model+'_record']);
                        record_record.date= this_record.date;

                        this_record[self.model+'_record']=record_record;
                        record_list.push(record_record);
                    }
                }
                gravity.sortByDate(record_list);

                created_at= record_list[record_list.length-1].date

                resolve({
                    id: self.id,
                    versions: record_list,
                    date: created_at
                });
            })
            .catch(error => {
                console.log(error);
                reject(error);
            });    
        });
    }

    last(){
        var self= this;
        var created_at;

        return new Promise(function(resolve, reject) {
            self.getAllVersions()
            .then(res=>{
                resolve({
                    id: res.id,
                    record:res.versions[0],
                    date:res.date
                });
            })
            .catch(error =>{
                reject(error);
            });
        });
    }

    findById(){
        var self= this;
        return new Promise(function(resolve, reject) {
            self.last()
            .then(res => {
                var record= res.record;
                self.record= record;
                resolve(true);
            })
            .catch(error=>{
                reject(error);
            });
        });
    }

    loadRecords(){
        var self = this;
        var eventEmitter = new events.EventEmitter();
        var records, table_data;
        var final_list=[];
        var user;
        //console.log(self);        
        return new Promise(function(resolve, reject) {

            eventEmitter.on('table_data_loaded', function(){
                gravity.get_records(user.record.account, table_data.address, table_data.passphrase)
                .then(res =>  {
                    var records= res.records;
                    var records_breakdown={}
                    for (var x in records){
                        var this_record= records[x];
                        if(this_record.id != undefined){
                            if (records_breakdown[this_record.id]==undefined){
                                records_breakdown[this_record.id]={
                                    versions: [],
                                    date_first_record:''
                                }
                            }

                            var data= JSON.parse(this_record[self.model+'_record'])
                            data.date= this_record.date
                            records_breakdown[this_record.id].versions.push(data);
                        }
                    }

                    var ids= Object.keys(records_breakdown);
                
                    //console.log(JSON.stringify(records_breakdown));
                    for (var z in ids){
                        var id= ids[z];
                        //console.log(records_breakdown[id]);
                        gravity.sortByDate(records_breakdown[id].versions);
                        var this_records=records_breakdown[id].versions;
                        var last_record= this_records.length-1;
                        //console.log(this_records[0]);
                        //console.log(this_records[last_record]);
                        var created_at=  this_records[last_record].date;
                        final_list.push({
                            id: id,
                            [self.model+'_record']: this_records[0],
                            date: created_at
                        })
                    }
                    //console.log(final_list);

                    resolve({success: true, records: final_list, records_found: final_list.length});
                })
                .catch(err => {
                    reject(err);
                });
            });

            eventEmitter.on('verified_request', function(){
                if(self.user.api_key == user.record.api_key){
                    self.loadTable()
                    .then(res => {
                        table_data= res;
                        eventEmitter.emit('table_data_loaded');
                    })
                    .catch(err => {
                        console.log(err);
                        reject(err);
                    });   
                }else{
                    reject({ success: false, errors: 'Incorrect api key' });
                }
            });

            if (self.model == 'user') {
                eventEmitter.emit('verified_request');
            } else if (self.user != null && self.user != undefined && self.user.id != undefined) {
                var User= require('./user.js');

                gravity.findById(self.user.id, 'user')
                .then(response => {
                    user = new User(response.record);
                    //console.log(user.record)
                    //console.log(self)
                    eventEmitter.emit('verified_request');
                })
                .catch(err => {
                    //console.log(err);
                    reject({ success: false, errors: 'There was an error in authentication of request/user validation' });
                })

            } else {
                // eventEmitter.emit('request_authenticated');
                reject({ success: false, errors: 'There was an error in authentication of request/user validation' });
            }
        });
    }

    create() {
        var self = this;
        var eventEmitter = new events.EventEmitter();
        var record_table, user;

        return new Promise(function(resolve, reject) {
            if (self.verify().errors == true) {
                reject({ false: false, verification_error: true, errors: self.verify().messages });
            } else {
                eventEmitter.on('id_generated', function() {
                    var stringified_record = JSON.stringify(self.record);

                    var full_record = {
                        id: self.record.id,
                        [self.model + "_record"]: stringified_record,
                        date: Date.now()
                    }
                    var encrypted_record = gravity.encrypt(JSON.stringify(full_record));

                    if (self.model == 'user') {
                        var call_url = gravity.jupiter_data.server + '/nxt?requestType=sendMessage&secretPhrase=' + record_table.passphrase +
                            '&recipient=' + self.record.account + '&messageToEncrypt=' + encrypted_record + '&feeNQT=' + gravity.jupiter_data.feeNQT + '&deadline=' + gravity.jupiter_data.deadline + '&recipientPublicKey=' + self.data.public_key + '&compressMessageToEncrypt=true'

                    } else if (self.user != null && self.user != undefined) {
                        //console.log('Non user call url');
                        var call_url = gravity.jupiter_data.server + '/nxt?requestType=sendMessage&secretPhrase=' + record_table.passphrase +
                            '&recipient=' + self.user.address + '&messageToEncrypt=' + encrypted_record + '&feeNQT=' + gravity.jupiter_data.feeNQT + '&deadline=' + gravity.jupiter_data.deadline + '&recipientPublicKey=' + self.user.public_key + '&compressMessageToEncrypt=true'
                    } else {
                        //console.log('Falling in this category')
                        var call_url = gravity.jupiter_data.server + '/nxt?requestType=sendMessage&secretPhrase=' + record_table.passphrase +
                            '&recipient=' + record_table.address + '&messageToEncrypt=' + encrypted_record + '&feeNQT=' + gravity.jupiter_data.feeNQT + '&deadline=' + gravity.jupiter_data.deadline + '&recipientPublicKey=' + record_table.public_key + '&compressMessageToEncrypt=true'
                    }
                    //console.log(call_url)
                    //console.log(self);
                    axios.post(call_url)
                        .then(function(response) {
                            //console.log(response)
                            if (response.data.broadcasted != null && response.data.broadcasted == true) {
                                resolve({ success: true, message: 'Record created' })
                            } else if (response.data.errorDescription != null) {
                                reject({ success: false, errors: response.data.errorDescription });
                            } else {
                                reject({ success: false, errors: 'Unable to save data in blockchain' });
                            }
                        })
                        .catch(function(error) {
                            reject({ success: false, errors: error });
                        });
                });
                eventEmitter.on('table_loaded', function() {
                    self.generateId(record_table)
                        .then(res => {
                            if (self.record.id == undefined) {
                                reject({ success: false, errors: 'Id for model was not generated' })
                            }
                            eventEmitter.emit('id_generated');
                        })
                        .catch(err => {
                            console.log(err)
                            reject({ success: false, errors: err });
                        });
                });
                eventEmitter.on('request_authenticated', function() {
                    self.loadTable()
                        .then(res => {
                            record_table = res;
                            //console.log('Table is being called')
                            eventEmitter.emit('table_loaded');
                        })
                        .catch(err => {
                            reject({ success: false, errors: err });
                        })
                });

                eventEmitter.on('authenticate_user_request', function(){
                    if(user.record.api_key == self.user.api_key){
                        eventEmitter.emit('request_authenticated');   
                        
                    }else{
                        resolve({ success: false, errors: 'Wrong user api key in request' });   
                    }
                });


                if (self.model == 'user') {
                    eventEmitter.emit('request_authenticated');
                } else if (self.user != null && self.user != undefined && self.user.id != undefined) {
                    var User= require('./user.js');

                    gravity.findById(self.user.id, 'user')
                    .then(response => {
                        //console.log(user);
                        user = new User(response.record);
                        //console.log(user.record)
                        //console.log(self)
                        eventEmitter.emit('authenticate_user_request');
                    })
                    .catch(err => {
                        //console.log(err);
                        reject({ success: false, errors: 'There was an error in authentication of request/user validation' });
                    })

                } else {
                    // eventEmitter.emit('request_authenticated');
                    reject({ success: false, errors: 'There was an error in authentication of request/user validation' });
                }
            }
        });
    }

    update() {
        var self = this;
        var eventEmitter = new events.EventEmitter();
        var record_table, user;

        return new Promise(function(resolve, reject) {
            if (self.verify().errors == true) {
                reject({ false: false, verification_error: true, errors: self.verify().messages });
            } else {
                eventEmitter.on('id_verified', function() {
                    var stringified_record = JSON.stringify(self.record);

                    var full_record = {
                        id: self.record.id,
                        [self.model + "_record"]: stringified_record,
                        date: Date.now()
                    }
                    var encrypted_record = gravity.encrypt(JSON.stringify(full_record));

                    if (self.model == 'user') {
                        var call_url = gravity.jupiter_data.server + '/nxt?requestType=sendMessage&secretPhrase=' + record_table.passphrase +
                            '&recipient=' + self.record.account + '&messageToEncrypt=' + encrypted_record + '&feeNQT=' + gravity.jupiter_data.feeNQT + '&deadline=' + gravity.jupiter_data.deadline + '&recipientPublicKey=' + self.data.public_key + '&compressMessageToEncrypt=true'

                    } else if (self.user != null && self.user != undefined) {
                        //console.log('Non user call url');
                        var call_url = gravity.jupiter_data.server + '/nxt?requestType=sendMessage&secretPhrase=' + record_table.passphrase +
                            '&recipient=' + self.user.address + '&messageToEncrypt=' + encrypted_record + '&feeNQT=' + gravity.jupiter_data.feeNQT + '&deadline=' + gravity.jupiter_data.deadline + '&recipientPublicKey=' + self.user.public_key + '&compressMessageToEncrypt=true'
                    } else {
                        //console.log('Falling in this category')
                        var call_url = gravity.jupiter_data.server + '/nxt?requestType=sendMessage&secretPhrase=' + record_table.passphrase +
                            '&recipient=' + record_table.address + '&messageToEncrypt=' + encrypted_record + '&feeNQT=' + gravity.jupiter_data.feeNQT + '&deadline=' + gravity.jupiter_data.deadline + '&recipientPublicKey=' + record_table.public_key + '&compressMessageToEncrypt=true'
                    }
                    //console.log(call_url)
                    //console.log(self);
                    axios.post(call_url)
                        .then(function(response) {
                            //console.log(response)
                            if (response.data.broadcasted != null && response.data.broadcasted == true) {
                                resolve({ success: true, message: 'Record created', record: self.record })
                            } else if (response.data.errorDescription != null) {
                                reject({ success: false, errors: response.data.errorDescription });
                            } else {
                                reject({ success: false, errors: 'Unable to save data in blockchain' });
                            }
                        })
                        .catch(function(error) {
                            reject({ success: false, errors: error });
                        });
                });

                eventEmitter.on('table_loaded', function() {
                    if (self.record.id == undefined) {
                        reject({ success: false, errors: 'Cannot update. Id is missing from  data.' })
                    }
                    eventEmitter.emit('id_verified');
                });

                eventEmitter.on('request_authenticated', function() {
                    self.loadTable()
                        .then(res => {
                            record_table = res;
                            eventEmitter.emit('table_loaded');
                        })
                        .catch(err => {
                            reject({ success: false, errors: err });
                        })
                });

                eventEmitter.on('authenticate_user_request', function(){
                    if(user.record.api_key == self.user.api_key){
                        eventEmitter.emit('request_authenticated');   
                        
                    }else{
                        resolve({ success: false, errors: 'Wrong user api key in request' });   
                    }
                });


                if (self.model == 'user') {
                    eventEmitter.emit('request_authenticated');
                } else if (self.user != null && self.user != undefined && self.user.id != undefined) {
                    var User= require('./user.js');

                    gravity.findById(self.user.id, 'user')
                    .then(response => {
                        user = new User(response.record);
                        //console.log(user.record)
                        //console.log(self)
                        eventEmitter.emit('authenticate_user_request');
                    })
                    .catch(err => {
                        //console.log(err);
                        reject({ success: false, errors: 'There was an error in authentication of request/user validation' });
                    })

                } else {
                    // eventEmitter.emit('request_authenticated');
                    reject({ success: false, errors: 'There was an error in authentication of request/user validation' });
                }
            }
        });
    }
}

module.exports = Model;