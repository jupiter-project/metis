var axios = require('axios');
var methods = require('../config/_methods');
var events = require('events');
var crypto = require('crypto');

if (process.env.PRODUCTION != undefined && process.env.PRODUCTION != 'True') {
    let gravity = require('../.gravity.js');
}

class Gravity {
    constructor() {
        this.algorithm = process.env.ENCRYPT_ALGORITHM;
        this.password = process.env.ENCRYPT_PASSWORD;
        this.sender = process.env.APP_ACCOUNT;
        this.jupiter_data = {
            server: process.env.JUPITERSERVER,
            feeNQT: 500,
            deadline: 60,
            minimumTableBalance: 100000,
            minimumAppBalance: 100000,
            moneyDecimals: 8
        };
        this.generate_passphrase = methods.generate_passphrase;
        this.appSchema = {
            appData: {
                name: '',
                address: '',
                description: '',
            },
            tables: []
        }
        this.data = {}
        this.tables = [];
    }

    showTables(return_type = 'app') {
        var self = this;
        return new Promise(function(resolve, reject) {
            self.loadAppData()
                .then(response => {
                    if (return_type = 'console') {
                        console.log('Database tables associated with your app ' + response.app.appData.name + '(' + response.app.address + ')');
                        console.log(response.tables);
                        console.log('If you wish to show table details, run "npm run gravity:db"');
                        console.log('If you wish to add a new table, run "npm run gravity:db:add"');

                    }
                    resolve(response.tables);
                })
                .catch(error => {
                    console.log(error);
                    reject(error)
                })
        });
    }


    loadTables(return_type = 'app') {
        var self = this;
        var current, key;
        return new Promise(function(resolve, reject) {
            self.loadAppData()
                .then(response => {
                    var tables = response.app.tables;

                    if (return_type = 'console') {
                        console.log('Database tables associated with your app ' + response.app.appData.name + '(' + response.app.address + ')');
                        for (var x in tables) {
                            current = tables[x];
                            key = Object.keys(tables[x])[0];
                            console.log('Table => ' + key);
                            console.log('---Table Address');
                            console.log(current[key].address);
                            console.log('---Table Passphrase');
                            console.log(current[key].passphrase);
                            console.log('---Table Public Key');
                            console.log(current[key].public_key);
                            console.log('----------------------------------------------------------------');
                        }
                    }
                    resolve(tables);
                })
                .catch(error => {
                    console.log(error);
                    reject(error);
                })
        });
    }

    encrypt(text) {
        var cipher = crypto.createCipher(this.algorithm, this.password);
        var crypted = cipher.update(text, 'utf8', 'hex');
        crypted += cipher.final('hex');

        return crypted;
    }

    decrypt(text) {
        var decipher = crypto.createDecipher(this.algorithm, this.password);
        var dec = decipher.update(text, 'hex', 'utf8');
        dec += decipher.final('utf8');

        return dec;
    }
    sortByDate(array) {
        return array.sort(function(a, b) {
            var x = a['date'];
            var y = b['date'];

            return ((x > y) ? -1 : ((x < y) ? 1 : 0));
        });
    }

    isSubtable(main_table, subtable) {
        main_table = main_table.sort().join(',');
        subtable = main_table.sort().join(',');

        if (main_table.includes(subtable)) {
            return true;
        } else {
            return false;
        }
    }

    sort_by_date(array, key, subkey) {
        return array.sort(function(a, b) {
            var x = a[key][subkey];
            var y = b[key][subkey];

            return ((x > y) ? -1 : ((x < y) ? 1 : 0));
        });
    }

    loadAppData() {
        var eventEmitter = new events.EventEmitter();

        var self = this;
        var appname, server, passphrase, account, decryption_password, decryption_algorithm, records, number_of_records;
        if (process.env.APP_ACCOUNT != undefined) {
            server = process.env.JUPITERSERVER
            passphrase = process.env.APP_ACCOUNT;
            account = process.env.APP_ACCOUNT_ADDRESS;
            decryption_password = process.env.ENCRYPT_PASSWORD;
            decryption_algorithm = process.env.ENCRYPT_ALGORITHM;
            appname = process.env.APPNAME;

        } else {
            let gravity = require('../.gravity.js');
            server = gravity.JUPITERSERVER;
            passphrase = gravity.APP_ACCOUNT;
            account = gravity.APP_ACCOUNT_ADDRESS;
            decryption_password = gravity.ENCRYPT_PASSWORD;
            decryption_algorithm = gravity.ENCRYPT_ALGORITHM;
            self.jupiter_data.server = server;
            self.algorithm = gravity.ENCRYPT_ALGORITHM;
            self.password = gravity.ENCRYPT_PASSWORD;
            appname = gravity.APPNAME;
        }

        return new Promise(function(resolve, reject) {
            var response_message;

            eventEmitter.on('loaded_records', function() {
                //console.log('Records loaded. Organizing records now.');

                if (records != undefined && records.length > 0) {
                    var table_list = []
                    var tables_retrieved = {};

                    //We first query the records to find the one containing the table_list
                    // We also create push all the remaining tables to the tables_retrieved_variable
                    for (var x in records) {
                        //A tables record must contain a date key along with its tables key
                        if (records[x].tables != undefined && records[x].date != undefined && records[x].date != null) {
                            table_list.push(records[x])
                        }
                        /* else if (records[x].tables != undefined) {
                                                    //
                                                }*/
                        else {
                            var object_key = Object.keys(records[x])[0];
                            if (tables_retrieved[object_key] == undefined) {
                                tables_retrieved[object_key] = []
                                tables_retrieved[object_key].push(records[x])
                            } else {
                                tables_retrieved[object_key].push(records[x])
                            }
                        }
                    }

                    //Once we have separated the records into table list and potentially table object list,
                    // we then retrieve the last table record
                    self.sortByDate(table_list);

                    //This variable will represent the most recent and valid list of tables in the app
                    var current_list = [];

                    for (var y in table_list) {
                        if (table_list[y].tables.length > current_list.length) {
                            if (current_list.length == 0) {
                                current_list = table_list[y].tables;
                            } else {
                                if (self.isSubtable(current_list, table_list[y].tables)) {
                                    current_list = table_list[y].tables;
                                }
                            }
                        }
                    }

                    //Now that we have a list with all the table records and the list of tables 
                    // that the app should be using. We go through the tables_retrieved and get the
                    // latest records of each table that the app is supposed to be using.
                    var tableData = []
                    for (var i in current_list) {
                        var this_key = current_list[i];

                        //We need to sort the the list we are about to call
                        self.sort_by_date(tables_retrieved[this_key], this_key, 'date');

                        //Once we do this, we can obtain the last record and push to the tableData variable
                        // NOTE: We'll expand validation of tables in future releases 
                        tableData.push(tables_retrieved[this_key][0]);
                    }
                    self.appSchema.tables = tableData;
                    self.appSchema.appData.name = appname;
                    self.appSchema.address = account;
                    response_message = { success: true, app: self.appSchema, message: 'Existing record found', tables: current_list };

                    if (process.env.ENV == undefined || process.env.ENV == 'Development') {
                        //console.log(self.tables);
                        //console.log(self.appSchema.tables);
                    }
                    resolve(response_message);
                } else {
                    response_message = { success: true, app: self.appSchema, message: 'No app record' }
                        //if (process.env.ENV == undefined || process.env.ENV == 'Development')
                        //console.log(response_message);
                    resolve(response_message);
                }
            });

            self.get_records(account, account, passphrase)
                .then(function(response) {
                    //console.log(response)
                    records = response.records;
                    number_of_records = response.records_found;

                    var tables = [];
                    var table_list = [];
                    var largest_size = 0;
                    var table_objects = [];
                    eventEmitter.emit('loaded_records');

                })
                .catch(function(error) {
                    console.log(error);
                    reject({ success: false, error: 'There was an error loading records' });
                });
        });
    }

    get_records(user_address, records_address, record_passphrase, scope = { size: 'all', show_pending: null }) {

        var eventEmitter = new events.EventEmitter();
        var self = this;

        return new Promise(function(resolve, reject) {
            var records = [];
            var decrypted_records = [];
            var decrypted_pendings = [];
            var records_found = 0;
            var response_data;
            var database = [];
            var pending_records = [];
            var show_pending = scope.show_pending;
            var completed_number = 0;
            var pending_number = 0;

            eventEmitter.on('set_response_data', function() {
                if (scope.size != 'last') {
                    if (scope.show_pending != undefined && scope.show_pending > 0) {
                        response_data = { pending: decrypted_pendings, records: decrypted_records, records_found: records_found, last_record: decrypted_records[0] }
                    } else {
                        response_data = { records: decrypted_records, records_found: records_found, last_record: decrypted_records[0] }
                    }
                } else if (scope.size == 'last') {
                    response_data = { record: decrypted_records[0] }
                } else {
                    response_data = { records: null, error: 'Invalid scope size' }
                }
                resolve(response_data);
            });

            eventEmitter.on('check_on_pending', function() {
                if (pending_records.length > 0) {
                    var record_counter = 0;

                    pending_records.map(function(p, index) {
                        var this_url = self.jupiter_data.server + '/nxt?requestType=readMessage&transaction=' + p + '&secretPhrase=' + record_passphrase;
                        var current_record = index;
                        axios.get(this_url)
                            .then(function(response) {
                                try {
                                    var decrypted_pending = JSON.parse(response.data.decryptedMessage);
                                    decrypted_pendings.push(decrypted_pending);
                                } catch (e) {

                                }
                                record_counter++;


                                if (record_counter == pending_number) {
                                    eventEmitter.emit('set_response_data')
                                }
                            })
                            .catch(function(error) {
                                resolve(error);
                            });
                    });
                } else {
                    eventEmitter.emit('set_response_data')
                }
            });

            eventEmitter.on('records_retrieved', function() {
                if (records.length <= 0) {
                    eventEmitter.emit('check_on_pending')
                } else {
                    var record_counter = 0;
                    records.map(function(p, index) {
                        var this_url = self.jupiter_data.server + '/nxt?requestType=readMessage&transaction=' + p + '&secretPhrase=' + record_passphrase;
                        var current_record = index;
                        axios.get(this_url)
                            .then(function(response) {
                                try {
                                    //This decrypts the message from the blockchain using native encryption
                                    // as well as the encryption based on encryption variable
                                    var decrypted = JSON.parse(self.decrypt(response.data.decryptedMessage));
                                    decrypted_records.push(decrypted);
                                } catch (e) {

                                }
                                record_counter++;

                                if (record_counter == completed_number) {
                                    eventEmitter.emit('check_on_pending')
                                }
                            })
                            .catch(function(error) {
                                console.log(error);
                                resolve(error);
                            });
                    });
                }
            });

            eventEmitter.on('database_retrieved', function() {
                for (var obj in database) {
                    if (database[obj]['attachment']['encryptedMessage'] && database[obj]['attachment']['encryptedMessage']['data'] != null && database[obj]['senderRS'] == records_address) {
                        if (scope.show_pending != undefined && scope.show_pending > 0) {
                            

                            if (database[obj]['confirmations'] <= scope.show_pending) {
                                pending_records.push(obj['transaction'])
                                pending_number++;
                            } else {
                                records.push(database[obj]['transaction']);
                                completed_number++;
                            }
                        } else {
                            if (scope.size == 'all') {
                                records.push(database[obj]['transaction']);
                                completed_number++;

                            } else if (scope.size == 'last') {
                                records.push(database[obj]['transaction']);
                                records_found++;
                                completed_number++;
                                break;
                            }
                        }
                        records_found++;
                    }

                };
                eventEmitter.emit('records_retrieved');
            });

            axios.get(self.jupiter_data.server + '/nxt?requestType=getBlockchainTransactions&account=' + user_address + '&withMessage=true&type=1')
                .then(function(response) {
                    database = response.data.transactions;
                    eventEmitter.emit('database_retrieved');
                })
                .catch(function(error) {
                    console.log(error)
                    resolve({ success: false, errors: error });
                });
        });
    }

    getAppRecords(app_address, app_passphrase) {

        var eventEmitter = new events.EventEmitter();
        var self = this;

        return new Promise(function(resolve, reject) {
            var records = [];
            var decrypted_records = [];
            var decrypted_pendings = [];
            var records_found = 0;
            var response_data;
            var database = [];
            var pending_records = [];
            var completed_number = 0;
            var pending_number = 0;

            eventEmitter.on('set_response_data', function() {

                response_data = { records: decrypted_records, records_found: records_found, last_record: decrypted_records[0] }

                resolve(response_data);
            });

            eventEmitter.on('records_retrieved', function() {
                if (records.length <= 0) {
                    eventEmitter.emit('set_response_data')
                } else {
                    var record_counter = 0;
                    records.map(function(p, index) {
                        var this_url = self.jupiter_data.server + '/nxt?requestType=readMessage&transaction=' + p + '&secretPhrase=' + app_passphrase;
                        var current_record = index;
                        axios.get(this_url)
                            .then(function(response) {
                                try {
                                    //This decrypts the message from the blockchain using native encryption
                                    // as well as the encryption based on encryption variable
                                    var decrypted = JSON.parse(self.decrypt(response.data.decryptedMessage));
                                    decrypted_records.push(decrypted);
                                    console.log(decrypted_records)
                                } catch (e) {

                                }
                                record_counter++;

                                if (record_counter == completed_number) {
                                    eventEmitter.emit('set_response_data')
                                }
                            })
                            .catch(function(error) {
                                console.log(error);
                                resolve(error);
                            });
                    });
                }
            });

            eventEmitter.on('database_retrieved', function() {
                console.log(database)
                for (var obj in database) {

                    if (database[obj]['attachment']['encryptedMessage'] != null) {

                        records.push(database[obj]['transaction']);
                        console.log(database[obj]['transaction']['encryptedMessage'])
                        completed_number++;
                        records_found++;
                    }

                };
                eventEmitter.emit('records_retrieved');
            });

            axios.get(self.jupiter_data.server + '/nxt?requestType=getBlockchainTransactions&account=' + app_address + '&withMessage=true&type=1')
                .then(function(response) {
                    database = response.data.transactions;
                    eventEmitter.emit('database_retrieved');
                })
                .catch(function(error) {
                    console.log(error)
                    resolve({ success: false, errors: error });
                });
        });
    }


    getAllRecords(table, scope = { size: 'all', show_pending: null }) {

        var eventEmitter = new events.EventEmitter();
        var self = this;

        return new Promise(function(resolve, reject) {
            var records = [];
            var decrypted_records = [];
            var decrypted_pendings = [];
            var records_found = 0;
            var response_data;
            var database, record_table;
            var table_data;
            var pending_records = [];
            var show_pending = scope.show_pending;
            var completed_number = 0;
            var pending_number = 0;

            eventEmitter.on('set_response_data', function() {
                if (scope.size != 'last') {
                    if (scope.show_pending != undefined && scope.show_pending > 0) {
                        response_data = { pending: decrypted_pendings, records: decrypted_records, records_found: records_found, last_record: decrypted_records[0] }
                    } else {
                        response_data = { records: decrypted_records, records_found: records_found, last_record: decrypted_records[0] }
                    }
                } else if (scope.size == 'last') {
                    response_data = { record: decrypted_records[0] }
                } else {
                    response_data = { records: null, error: 'Invalid scope size' }
                }
                resolve(response_data);
            });

            eventEmitter.on('check_on_pending', function() {
                if (pending_records.length > 0) {
                    var record_counter = 0;

                    pending_records.map(function(p, index) {
                        var this_url = self.jupiter_data.server + '/nxt?requestType=readMessage&transaction=' + p + '&secretPhrase=' + record_table.passphrase;
                        var current_record = index;
                        axios.get(this_url)
                            .then(function(response) {
                                try {
                                    var decrypted_pending = JSON.parse(response.data.decryptedMessage);
                                    decrypted_pendings.push(decrypted_pending);
                                } catch (e) {

                                }
                                record_counter++;


                                if (record_counter == pending_number) {
                                    eventEmitter.emit('set_response_data')
                                }
                            })
                            .catch(function(error) {
                                reject(error);
                            });
                    });
                } else {
                    eventEmitter.emit('set_response_data')
                }
            });

            eventEmitter.on('records_retrieved', function() {
                if (records.length <= 0) {
                    eventEmitter.emit('check_on_pending')
                } else {
                    var record_counter = 0;
                    records.map(function(p, index) {
                        var this_url = self.jupiter_data.server + '/nxt?requestType=readMessage&transaction=' + p + '&secretPhrase=' + record_table.passphrase;
                        var current_record = index;
                        axios.get(this_url)
                            .then(function(response) {
                                try {
                                    //This decrypts the message from the blockchain using native encryption
                                    // as well as the encryption based on encryption variable
                                    var decrypted = JSON.parse(self.decrypt(response.data.decryptedMessage));
                                    decrypted_records.push(decrypted);
                                } catch (e) {

                                }
                                record_counter++;

                                if (record_counter == completed_number) {
                                    eventEmitter.emit('check_on_pending')
                                }
                            })
                            .catch(function(error) {
                                console.log(error);
                                reject(error);
                            });
                    });
                }
            });

            eventEmitter.on('table_retrieved', function() {

                for (var obj of table_data) {

                    if (obj['attachment']['encryptedMessage']['data'] != null && obj['recipientRS'] != record_table.address) {
                        if (scope.show_pending != undefined && scope.show_pending > 0) {

                            if (obj['confirmations'] <= scope.show_pending) {
                                pending_records.push(obj['transaction'])
                                pending_number++;
                            } else {
                                records.push(obj['transaction']);
                                completed_number++;
                            }
                        } else {
                            if (scope.size == 'all') {
                                records.push(obj['transaction']);
                                completed_number++;

                            } else if (scope.size == 'last') {
                                records.push(obj['transaction']);
                                records_found++;
                                completed_number++;
                                break;
                            }
                        }
                        records_found++;
                    }

                };
                eventEmitter.emit('records_retrieved');
            });

            eventEmitter.on('table_access_retrieved', function() {
                axios.get(self.jupiter_data.server + '/nxt?requestType=getBlockchainTransactions&account=' + record_table.address + '&withMessage=true&type=1')
                    .then(function(response) {
                        table_data = response.data.transactions;
                        //resolve('Data loaded');
                        eventEmitter.emit('table_retrieved');
                    })
                    .catch(function(error) {
                        console.log(error)
                        reject({ success: false, errors: error });
                    });
            });

            self.loadAppData()
                .then(res => {
                    database = res.app.tables;
                    for (var x in database) {
                        if (database[x][table] != undefined) {
                            record_table = database[x][table]
                        }
                    }
                    eventEmitter.emit('table_access_retrieved');
                })
                .catch(err => {
                    console.log(err)
                    reject('There was an error')
                })
        });
    }

    //This method retrieves user info based on the account and the passphrase given
    getUser(account, passphrase) {
        var eventEmitter = new events.EventEmitter();
        var self = this;

        return new Promise(function(resolve, reject) {
            var records = [];
            var decrypted_records = [];
            var decrypted_pendings = [];
            var records_found = 0;
            var response_data;
            var database, record_table;
            var table_data;
            var pending_records = [];
            var completed_number = 0;
            var pending_number = 0;

            eventEmitter.on('set_response_data', function() {
                if (decrypted_records[0] == undefined || decrypted_records[0].user_record == undefined) {
                    resolve({error: true, message: 'Account not on file!'});
                } else {
                    response_data = { user: decrypted_records[0].user_record }
                    resolve(response_data);
                }
            });

            eventEmitter.on('check_on_pending', function() {
                eventEmitter.emit('set_response_data')
            });

            eventEmitter.on('records_retrieved', function() {
                if (records.length <= 0) {
                    eventEmitter.emit('check_on_pending')
                } else {
                    var record_counter = 0;
                    records.map(function(p, index) {
                        var this_url = self.jupiter_data.server + '/nxt?requestType=readMessage&transaction=' + p + '&secretPhrase=' + passphrase;
                        var current_record = index;
                        axios.get(this_url)
                            .then(function(response) {
                                try {
                                    //This decrypts the message from the blockchain using native encryption
                                    // as well as the encryption based on encryption variable
                                    var decrypted = JSON.parse(self.decrypt(response.data.decryptedMessage));
                                    decrypted_records.push(decrypted);
                                } catch (e) {

                                }
                                record_counter++;

                                if (record_counter == completed_number) {
                                    eventEmitter.emit('check_on_pending')
                                }
                            })
                            .catch(function(error) {
                                console.log(error);
                                reject(error);
                            });
                    });
                }
            });

            eventEmitter.on('table_retrieved', function() {
                for (var obj of table_data) {

                    if (obj['attachment']['encryptedMessage']['data'] != null && obj['recipientRS'] == account) {
                        records.push(obj['transaction']);
                        records_found++;
                        completed_number++;
                        break;
                    }

                };
                eventEmitter.emit('records_retrieved');
            });

            eventEmitter.on('table_access_retrieved', function() {
                axios.get(self.jupiter_data.server + '/nxt?requestType=getBlockchainTransactions&account=' + record_table.address + '&withMessage=true&type=1')
                    .then(function(response) {
                        table_data = response.data.transactions;
                        //resolve('Data loaded');
                        eventEmitter.emit('table_retrieved');
                    })
                    .catch(function(error) {
                        console.log(error)
                        reject({ success: false, errors: error });
                    });
            });

            self.loadAppData()
                .then(res => {
                    database = res.app.tables;
                    for (var x in database) {
                        if (database[x].users != undefined) {
                            record_table = database[x].users;
                        }
                    }
                    eventEmitter.emit('table_access_retrieved');
                })
                .catch(err => {
                    console.log(err)
                    reject('There was an error')
                })
        });
    }

    //This method retrieves record info based on the table and id number given
    findById(id, model) {
        var eventEmitter = new events.EventEmitter();
        var self = this;
        var all_records = [];
        var same_id = [];

        return new Promise(function(resolve, reject) {
            var Record = require('../models/' + model)
            var record = new Record({ id: null });

            eventEmitter.on('records_retrieved', function() {
                var user_address;
                for (var x in all_records) {
                    if (all_records[x].id != undefined && all_records[x].id == id) {
                        same_id.push(JSON.parse(all_records[x][model + '_record']));
                    }
                }
                self.sortByDate(same_id);
                resolve({ success: true, record: same_id[0] });
            });

            self.getAllRecords(record.table)
                .then(function(response) {
                    all_records = response.records;
                    eventEmitter.emit('records_retrieved');
                })
                .catch(function(error) {
                    console.log(error);
                    reject({ success: false, errors: error });
                });
        });
    }

    getBalance(address='undefined'){
        var self = this;
        var account;
        var eventEmitter = new events.EventEmitter();

        if(address=='undefined'){
            if ( process.env.JUPITERSERVER == undefined ||  process.env.JUPITERSERVER == null) {
                let gravity = require('../.gravity.js');
                var address_owner = gravity.APP_ACCOUNT;
                var server = gravity.JUPITERSERVER;
            } else {
                var address_owner = process.env.APP_ACCOUNT;
                var server = process.env.JUPITERSERVER;
            }
        }else{
            if ( process.env.JUPITERSERVER == undefined ||  process.env.JUPITERSERVER == null) {
                let gravity = require('../.gravity.js');
                var address_owner = address;
                var server = gravity.JUPITERSERVER;
            } else {
                var address_owner = address;
                var server = process.env.JUPITERSERVER;
            }    
        }

        return new Promise(function(resolve, reject) {
            eventEmitter.on('account_retrieved', () => {
                axios.post(server + '/nxt?requestType=getBalance&account='+account)
                    .then(response => {
                        if(response.data.errorDescription){
                            reject(response.data);

                        }else{
                            if (process.env.PRODUCTION == undefined || process.env.PRODUCTION != 'True') {
                                console.log('Balance: '+(parseFloat(response.data.balanceNQT)/(10**self.jupiter_data.moneyDecimals))+' JUP');
                                
                            }
                            var minimumAppBalance=false;
                            var minimumTableBalance=false;

                            if(response.data.balanceNQT >= self.jupiter_data.minimumAppBalance){
                                minimumAppBalance= true;
                                
                            }

                            if(response.data.balanceNQT >= self.jupiter_data.minimumTableBalance){
                                minimumTableBalance= true;
                            }

                            var response_data={balance: response.data.balanceNQT, minimumAppBalance: minimumAppBalance, minimumTableBalance: minimumTableBalance}
                            resolve(response_data);
                        }
                    })
                    .catch(error =>{
                        console.log(error);
                        reject({ success: false, message: 'There was an error obtaining account Jupiter balance' });
                    });
            });

                
            axios.get(server+ '/nxt?requestType=getAccountId&secretPhrase=' + address_owner)
                .then(function(response) {
                    account= response.data.account;
                    eventEmitter.emit('account_retrieved');
                })
            .catch(function(error) {
                    console.log(error);
                    reject({ success: false, message: 'There was an error obtaining account Jupiter balance' });
                })

        });
    }

    sendMoney(recipient, transfer_amount = null, sender = this.sender) {
        //This is the variable that will be used to send Jupiter from the app address to the address
        // that will be used as a database table or will serve a purpose in the Gravity infrastructure
        var amount= transfer_amount;
        var self = this;
        const feeNQT = 100;
        const table_creation= 500+250;

        if(amount == null){
            amount= this.jupiter_data.minimumTableBalance-feeNQT-table_creation;
        }

        if (this.sender == null || this.sender == undefined) {
            let gravity = require('../.gravity.js');
            var sender_address = gravity.APP_ACCOUNT;
            var server = gravity.JUPITERSERVER;
        } else {
            var sender_address = sender;
            var server = process.env.JUPITERSERVER;
        }

        return new Promise(function(resolve, reject) {
            axios.post(server + '/nxt?requestType=sendMoney&secretPhrase=' + sender_address + '&recipient=' + recipient + '&amountNQT=' + amount + '&feeNQT=' + feeNQT + '&deadline=60')
                .then(function(response) {
                    if (response.data.signatureHash != null) {
                        resolve(true);
                    } else {
                        console.log('Cannot send Jupiter to new account, Jupiter issuer has insufficient balance!')
                        reject(response.data);
                    }
                })
                .catch(function(error) {
                    reject(error);
                });
        });
    }

    create_record(model_name, data, attributes) {

        var eventEmitter = new events.EventEmitter();
        var self = this;

        return new Promise(function(resolve, reject) {
            var events = require('events');
            var eventEmitter = new events.EventEmitter();

            var errors, jup_account;

            var RecordClass = require('../models/' + model_name);

            var new_record = new RecordClass(attributes);
            console.log(new_record);
            var model_address, model_passphrase;

            eventEmitter.on('address_verification', function() {
                console.log('Address verified');
                //If there are no errors, rest of the code is executed
                if (new_record.verify().errors == false) {
                    var record_name = model_name + '_record';
                    attributes.date = Date.now()
                    var record = {
                        [record_name]: attributes
                    }

                    if (data.public_key != null) {
                        var call_url = self.jupiter_data.server + '/nxt?requestType=sendMessage&secretPhrase=' + model_passphrase +
                            '&recipient=' + jup_account + '&messageToEncrypt=' + JSON.stringify(record) + '&feeNQT=' + self.jupiter_data.feeNQT + '&deadline=' + self.jupiter_data.deadline + '&recipientPublicKey=' + data.public_key + '&compressMessageToEncrypt=true'
                    } else {
                        var call_url = self.jupiter_data.server + '/nxt?requestType=sendMessage&secretPhrase=' + model_passphrase +
                            '&recipient=' + jup_account + '&messageToEncrypt=' + JSON.stringify(record) + '&feeNQT=' + self.jupiter_data.feeNQT + '&deadline=' + self.jupiter_data.deadline + '&compressMessageToEncrypt=true'
                    }

                    axios.post(call_url)
                        .then(function(response) {
                            if (response.data.broadcasted != null && response.data.broadcasted == true) {
                                resolve({ success: true, message: (model_name + ' record saved'), data: data, jupiter_response: response.data })
                            } else if (response.data.errorDescription != null) {
                                resolve({ success: false, message: response.data.errorDescription, jupiter_response: response.data });
                            } else {
                                resolve({ success: false, message: 'Unable to save data in blockchain', jupiter_response: response.data });
                            }
                        })
                        .catch(function(error) {
                            console.log(error);
                            reject({ success: false, message: 'There was an error' });
                        });
                } else {
                    resolve({
                        success: false,
                        message: 'There was an error',
                        [model_name]: attributes,
                        validations: new_record.verify()
                    });
                }
            })


            var mongoose = require('mongoose');

            const User = require("../models/user");

            User.findOne({ 'api.generated_key': data.api_key }, (err, user) => {
                if (err) {
                    reject({ success: false, message: 'There was an error validating your account', error: err });
                } else if (data.address != user.record.account) {
                    reject({ success: false, message: 'The api key you provided is not associated with the account number your provided' });
                } else {
                    model_address = process.env.BOOK_RECORD_ADDRESS;
                    model_passphrase = process.env.BOOK_RECORD;
                    jup_account = data.address
                    eventEmitter.emit('address_verification');
                }
            });
        })
    }

    create_new_address(passphrase) {
        var self = this;
        return new Promise(function(resolve, reject) {
            axios.get(self.jupiter_data.server + '/nxt?requestType=getAccountId&secretPhrase=' + passphrase)
                .then(function(response) {
                    var address = response.data.accountRS;
                    var public_key = response.data.publicKey;
                    resolve({ success: true, address: address, public_key: public_key });
                })
                .catch(function(error) {
                    console.log(error);
                    console.log('There was an error in address creation');
                    reject({ success: false, message: 'There was an error creating a new Jupiter address' });
                })

        });
    }

    //------------------------------------------------------------------------------------------
    // CONSOLE COMMANDS: This methods are related to database creation and can only be accessed
    // from the console. They generate files and make calls to Jupiter to record data
    //------------------------------------------------------------------------------------------


    //Encrypt users table
    encryptTableData() {
        this.algorithm = require('../.gravity.js').ENCRYPT_ALGORITHM;
        this.password = require('../.gravity.js').ENCRYPT_PASSWORD;

        var records = {
            "tables": ['users'],
            "date": Date.now()
        }
        var encrypted_data = JSON.stringify(records);
        console.log(records);
        console.log(encrypted_data);
        console.log(this.encrypt(encrypted_data));
    }

    //This method creates a table
    createTable() {
        let gravity = require('../.gravity.js');
        let eventEmitter = new events.EventEmitter();

        const self = this;

        const readline = require('readline');
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        var valid_table = true;
        var table_list = [];

        var app, table_name, address, passphrase, current_tables, record, table_list_record;
        var table_created=true;

        return new Promise(function(resolve, reject) {

            eventEmitter.on('insufficient_balance', function(){
                rl.close()
                reject('Insufficient balance');
            });

            eventEmitter.on('table_created', function() {
                //This code will send Jupiter to the recently created table address so that it is 
                // able to record information
                    self.sendMoney(address)
                        .then(response => {
                            console.log('Table ' + table_name + ' funded with JUP')
                            rl.close();
                            resolve({ success: true, message: ('Table ' + table_name + ' pushed to the blockchain and funded'), data: response.data, jupiter_response: response.data });
                        })
                        .catch(err => {
                            console.log(err)
                            rl.close();
                            reject({ success: false, message: 'Unable to send Jupiter to new table address'});
                        });
            });

            eventEmitter.on('address_retrieved', function() {
                var encrypted_data = self.encrypt(JSON.stringify(record));
                var encrypted_table_data = self.encrypt(JSON.stringify(table_list_record));
                //var decrypted_data = self.decrypt(encrypted_data);
                //console.log(decrypted_data);
                //console.log(JSON.parse(decrypted_data));

                var call_url = self.jupiter_data.server + '/nxt?requestType=sendMessage&secretPhrase=' + gravity.APP_ACCOUNT +
                    '&recipient=' + gravity.APP_ACCOUNT_ADDRESS + '&messageToEncrypt=' + encrypted_data + '&feeNQT=' + self.jupiter_data.feeNQT + '&deadline=' + self.jupiter_data.deadline + '&recipientPublicKey=' + gravity.APP_PUBLIC_KEY + '&compressMessageToEncrypt=true'


                axios.post(call_url)
                    .then(function(response) {
                        if (response.data.broadcasted != null && response.data.broadcasted == true) {
                            console.log('Table ' + table_name + ' pushed to the blockchain and linked to your account');
                            eventEmitter.emit('table_created');
                        } else if (response.data.errorDescription != null) {
                            console.log('There was an Error');
                            console.log(response)
                            console.log(response.data);
                            console.log('Error:' + response.data.errorDescription);
                            rl.close();
                            reject({ success: false, message: response.data.errorDescription, jupiter_response: response.data });
                        } else {
                            console.log('Unable to save data in the blockchain');
                            console.log(response.data)
                            rl.close();
                            reject({ success: false, message: 'Unable to save data in the blockchain', jupiter_response: response.data });
                        }
                    })
                    .catch(function(error) {
                        console.log('There was an error');
                        console.log(error);
                        rl.close();
                        reject({ success: false, message: 'There was an error'});
                    });

                var table_list_update_url = self.jupiter_data.server + '/nxt?requestType=sendMessage&secretPhrase=' + gravity.APP_ACCOUNT +
                    '&recipient=' + gravity.APP_ACCOUNT_ADDRESS + '&messageToEncrypt=' + encrypted_table_data + '&feeNQT=' + (self.jupiter_data.feeNQT / 2) + '&deadline=' + self.jupiter_data.deadline + '&recipientPublicKey=' + gravity.APP_PUBLIC_KEY + '&compressMessageToEncrypt=true'


                axios.post(table_list_update_url)
                    .then(function(response) {
                        if (response.data.broadcasted != null && response.data.broadcasted == true) {
                            //console.log('Table list updated');
                        } else if (response.data.errorDescription != null) {
                            console.log('There was an Error');
                            console.log(response.data);
                            console.log('Error:' + response.data.errorDescription);
                            console.log(response.data);
                        } else {
                            console.log(response.data);
                            console.log(encrypted_table_data)
                        }
                    })
                    .catch(function(error) {
                        console.log('There was an error in updating table list');
                        console.log(error);
                        console.log(encrypted_table_data)
                    });
                    
            });

            eventEmitter.on('table_name_obtained', function() {
                if (self.tables.indexOf(table_name) >= 0) {
                    console.log('Error: Unable to save table. ' + table_name + ' is already in the database')
                    rl.close();
                } else {
                    passphrase = self.generate_passphrase();

                    self.create_new_address(passphrase)
                        .then(function(response) {
                            if (response.success == true && response.address.length > 0) {
                                address = response.address;
                                record = {
                                    [table_name]: {
                                        address: address,
                                        passphrase: passphrase,
                                        public_key: response.public_key
                                    }
                                }
                                table_list.push(table_name);

                                table_list_record = {
                                    tables: table_list,
                                    date: Date.now()
                                }


                                eventEmitter.emit('address_retrieved');
                            } else {
                                console.log('There was an error')
                                console.log(response);
                            }
                        })
                        .catch(function(error) {
                            console.log(error);
                            rl.close();
                        });
                }
            });


            eventEmitter.on('verified_balance', function(){
                if (gravity.APP_ACCOUNT == undefined || gravity.APP_ACCOUNT == '' || gravity.APP_ACCOUNT == null) {
                    console.log('Error: .gravity file does not contain seedphrase for app. Please provide one.');
                } else {
                    self.loadAppData()
                        .then(function(response) {
                            if (response.tables == undefined || response.tables == null || response.tables.length == 0) {
                                table_list = []
                            } else {
                                table_list = response.tables
                            }

                            console.log('You are about to create a new database table for your Gravity app.');
                            console.log('The following are the tables already linked to your database:')
                            console.log(table_list);
                            rl.question('What will be the name of your new table?\n', (answer) => {
                                table_name = answer;
                                eventEmitter.emit('table_name_obtained');
                            });
                        })
                        .catch(function(error) {
                            console.log('Error in creating table');
                            console.log(error);
                        });
                }
            })

            self.getBalance()
            .then(response => {
                if(response.minimumTableBalance==true){
                    eventEmitter.emit('verified_balance');
                }else{
                    console.log('Error in creating new table: Insufficient app balance.');
                    console.log('A minimum of '+parseInt((self.jupiter_data.minimumTableBalance)/(10**self.jupiter_data.moneyDecimals)) +' JUP is required to create a table with Gravity');
                    eventEmitter.emit('insufficient_balance');
                }
            })
            .catch(error => {
                console.log('There was an error trying to create a new table in Jupiter.');
                console.log(error);
                eventEmitter.emit('insufficient_balance');
            });

        });
    }

    //This class is meant to be used when creating tables from the command line
    createAppDatabase() {
        const readline = require('readline');
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        var appname, server, password, passphrase;
        var address = null;

        console.log('You are about to create a Gravity app. Please answer the following questions:');

        rl.question('What is the name of the app?\n', (answer) => {
            appname = answer;
            rl.question('Please provide an encryption password for your Jupiter data:\n', (answer) => {
                password = answer;
                rl.question('What is the url/ip address of your Jupiter server?\n', (answer) => {
                    server = answer;

                    var current_data = {
                        "Name of the app": appname,
                        "Password  for encryption": password,
                        "Server URL": server
                    }
                    console.log("Please verify the data you entered:");
                    console.log(current_data);
                    console.log('');
                    rl.question("You are about to create a Jupiter account which will hold your Gravity app's data. Is the information provided above accurate? Is so, press ENTER", (answer) => {
                        passphrase = methods.generate_passphrase();

                        axios.get(server + '/nxt?requestType=getAccountId&secretPhrase=' + passphrase)
                            .then(function(response) {
                                var address = response.data.accountRS;
                                var public_key = response.data.publicKey;

                                if (address != null && address != undefined && address != '') {
                                    var configuration = {
                                        APPNAME: appname,
                                        JUPITERSERVER: server,
                                        APP_ACCOUNT: passphrase,
                                        APP_ACCOUNT_ADDRESS: address,
                                        APP_PUBLIC_KEY: public_key,
                                        ENCRYPT_ALGORITHM: "aes-128-cbc",
                                        ENCRYPT_PASSWORD: password
                                    }
                                    var env_variables_in_string = '';
                                    var env_variables = configuration;
                                    env_variables.SESSION_SECRET = 'session_secret_key_here';

                                    var fs = require('fs');

                                    //We prepare the string that will be used to create the .gravity file
                                    var object_in_string = 'module.exports=' + JSON.stringify(configuration);
                                    var module_in_string = object_in_string.replace(/={/g, '={\n').replace(/","/g, '",\n"').replace(/"}/g, '"\n}');

                                    //We prepare the string that will be used to create the .env file
                                    for (var key in env_variables) {
                                        env_variables_in_string = env_variables_in_string + key.toUpperCase() + '="' + env_variables[key] + '"\n';
                                    }

                                    fs.writeFile('.gravity.js', module_in_string, function(err) {
                                        if (err) {
                                            return console.log(err);
                                        }
                                        fs.writeFile('.env', env_variables_in_string, function(err) {
                                            if (err) {
                                                return console.log(err);
                                            }
                                            console.log('\nSuccess! .gravity and .env files generated!')
                                            console.log('\nPlease write down the passphrase and account number assigned to your app as well as the password assigned for encryption(See .env or .gravity files). If you lose your passphrase or your encryption password, you will loose access to your saved data');
                                            console.log('\nIn order to begin saving data into the Jupiter Blockchain, you will need to obtain Jupiter assets from:', configuration.JUPITERSERVER);
                                            rl.close();
                                        });
                                    });
                                } else {
                                    console.log(response.data.message);
                                    rl.close();
                                }
                            })
                            .catch(function(error) {
                                console.log(error);
                                console.log('There was an error in database creation');
                                rl.close();
                            })
                    });
                });
            });
        });
    }
}


module.exports = new Gravity();
