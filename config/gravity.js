
import axios from 'axios';
import crypto from 'crypto';
import events from 'events';
import methods from './_methods';

/* if (process.env.PRODUCTION !== undefined && process.env.PRODUCTION !== 'True') {
  let gravity = require('../.gravity.js');
} */

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
      moneyDecimals: 8,
    };
    this.generate_passphrase = methods.generate_passphrase;
    this.appSchema = {
      appData: {
        name: '',
        address: '',
        description: '',
      },
      tables: [],
    };
    this.data = {};
    this.tables = [];
  }

  showTables(return_type = 'app') {
    const self = this;
    return new Promise((resolve, reject) => {
      self.loadAppData()
        .then((response) => {
          if (return_type === 'console') {
            console.log(`Database tables associated with your app ${response.app.appData.name} (${response.app.address})`);
            console.log(response.tables);
            console.log('If you wish to show table details, run "npm run gravity:db"');
            console.log('If you wish to add a new table, run "npm run gravity:db:add"');
          }
          resolve(response.tables);
        })
        .catch((error) => {
          console.log(error);
          reject(error);
        });
    });
  }


  loadTables(return_type = 'app') {
    const self = this;
    let current;
    return new Promise((resolve, reject) => {
      self.loadAppData()
        .then((response) => {
          const { tables } = response.app;

          if (return_type === 'console') {
            console.log(`Database tables associated with your app ${response.app.appData.name}(${response.app.address})`);
            Object.keys(tables).forEach((x) => {
              current = tables[x];
              const [key] = Object.keys(tables[x]);
              console.log(`Table => ${key}`);
              console.log('---Table Address');
              console.log(current[key].address);
              console.log('---Table Passphrase');
              console.log(current[key].passphrase);
              console.log('---Table Public Key');
              console.log(current[key].public_key);
              console.log('----------------------------------------------------------------');
            });
          }
          resolve(tables);
        })
        .catch((error) => {
          console.log(error);
          reject(error);
        });
    });
  }

  encrypt(text) {
    const cipher = crypto.createCipher(this.algorithm, this.password);
    let crypted = cipher.update(text, 'utf8', 'hex');
    crypted += cipher.final('hex');

    return crypted;
  }

  decrypt(text) {
    const decipher = crypto.createDecipher(this.algorithm, this.password);
    let dec = decipher.update(text, 'hex', 'utf8');
    dec += decipher.final('utf8');

    return dec;
  }

  sortByDate(array) {
    return array.sort((a, b) => {
      const x = a.date;
      const y = b.date;
      const result = (x > y) ? -1 : ((x < y) ? 1 : 0);

      return (result);
    });
  }

  isSubtable(mainTable, subTable) {
    const main_table = mainTable.sort().join(',');
    const subtable = subTable.sort().join(',');
    let return_value;
    if (main_table.includes(subtable)) {
      return_value = true;
    } else {
      return_value = false;
    }
    return return_value;
  }

  sort_by_date(array, key, subkey) {
    return array.sort((a, b) => {
      const x = a[key][subkey];
      const y = b[key][subkey];

      return ((x > y) ? -1 : ((x < y) ? 1 : 0));
    });
  }

  loadAppData() {
    const eventEmitter = new events.EventEmitter();

    const self = this;
    let appname;
    let server;
    let passphrase;
    let account;
    // let decryption_password;
    // let decryption_algorithm;
    let records = [];
    let number_of_records;

    if (process.env.APP_ACCOUNT !== undefined) {
      server = process.env.JUPITERSERVER;
      passphrase = process.env.APP_ACCOUNT;
      account = process.env.APP_ACCOUNT_ADDRESS;
      // decryption_password = process.env.ENCRYPT_PASSWORD;
      // decryption_algorithm = process.env.ENCRYPT_ALGORITHM;
      appname = process.env.APPNAME;
    } else {
      const gravity = require('../.gravity.js');
      server = gravity.JUPITERSERVER;
      passphrase = gravity.APP_ACCOUNT;
      account = gravity.APP_ACCOUNT_ADDRESS;
      // decryption_password = gravity.ENCRYPT_PASSWORD;
      // decryption_algorithm = gravity.ENCRYPT_ALGORITHM;
      self.jupiter_data.server = server;
      self.algorithm = gravity.ENCRYPT_ALGORITHM;
      self.password = gravity.ENCRYPT_PASSWORD;
      appname = gravity.APPNAME;
    }

    return new Promise((resolve, reject) => {
      let response_message;

      eventEmitter.on('loaded_records', () => {
        // console.log('Records loaded. Organizing records now.');
        if (records !== undefined && records.length > 0) {
          const table_list = [];
          const tables_retrieved = {};

          // We first query the records to find the one containing the table_list
          // We also create push all the remaining tables to the tables_retrieved_variable
          /* Object.keys(records).forEach((x) => {
            // A tables record must contain a date key along with its tables key
            if (records[x].tables && records[x].date && records[x].date) {
              table_list.push(records[x]);
            } else {
              const object_key = Object.keys(records[x])[0];
              if (tables_retrieved[object_key] === undefined) {
                tables_retrieved[object_key] = [];
                tables_retrieved[object_key].push(records[x]);
              } else {
                tables_retrieved[object_key].push(records[x]);
              }
            }
          }); */

          for (let x = 0; x < Object.keys(records).length; x += 1) {
            if (records[x].tables && records[x].date && records[x].date) {
              table_list.push(records[x]);
            } else {
              const object_key = Object.keys(records[x])[0];
              if (tables_retrieved[object_key] === undefined) {
                tables_retrieved[object_key] = [];
                tables_retrieved[object_key].push(records[x]);
              } else {
                tables_retrieved[object_key].push(records[x]);
              }
            }
          }

          // Once we have separated the records into table list and potentially table object list,
          // we then retrieve the last table record
          self.sortByDate(table_list);

          // This variable will represent the most recent and valid list of tables in the app
          let current_list = [];
          /* Object.keys(table_list).forEach((y) => {
            if (table_list[y].tables.length > current_list.length) {
              if (current_list.length === 0) {
                current_list = table_list[y].tables;
              } else if (self.isSubtable(current_list, table_list[y].tables)) {
                current_list = table_list[y].tables;
              }
            }
          }); */

          for (let y = 0; y < Object.keys(table_list).length; y += 1) {
            if (table_list[y].tables.length > current_list.length) {
              if (current_list.length === 0) {
                current_list = table_list[y].tables;
              } else if (self.isSubtable(current_list, table_list[y].tables)) {
                current_list = table_list[y].tables;
              }
            }
          }

          // Now that we have a list with all the table records and the list of tables
          // that the app should be using. We go through the tables_retrieved and get the
          // latest records of each table that the app is supposed to be using.
          const tableData = [];
          /* Object.keys(current_list).forEach((i) => {
            const this_key = current_list[i];

            // We need to sort the the list we are about to call
            self.sort_by_date(tables_retrieved[this_key], this_key, 'date');

            // Once we do this, we can obtain the last record and push to the tableData variable
            // NOTE: We'll expand validation of tables in future releases
            tableData.push(tables_retrieved[this_key][0]);
          }); */

          for (let i = 0; i < Object.keys(current_list).length; i += 1) {
            const this_key = current_list[i];

            // We need to sort the the list we are about to call
            self.sort_by_date(tables_retrieved[this_key], this_key, 'date');

            // Once we do this, we can obtain the last record and push to the tableData variable
            // NOTE: We'll expand validation of tables in future releases
            tableData.push(tables_retrieved[this_key][0]);
          }

          self.appSchema.tables = tableData;
          self.appSchema.appData.name = appname;
          self.appSchema.address = account;
          response_message = {
            number_of_records,
            success: true,
            app: self.appSchema,
            message: 'Existing record found',
            tables: current_list,
          };

          if (process.env.ENV === undefined || process.env.ENV === 'Development') {
            // console.log(self.tables);
            // console.log(self.appSchema.tables);
          }
          resolve(response_message);
        } else {
          response_message = {
            number_of_records,
            success: true,
            app:
            self.appSchema,
            message: 'No app record',
          };
          // if (process.env.ENV == undefined || process.env.ENV == 'Development')
          // console.log(response_message);
          resolve(response_message);
        }
      });

      self.get_records(account, account, passphrase)
        .then((response) => {
          ({ records } = response);
          number_of_records = response.records_found;
          eventEmitter.emit('loaded_records');
        })
        .catch((error) => {
          console.log(error);
          reject({ success: false, error: 'There was an error loading records' });
        });
    });
  }

  get_records(user_address, records_address, record_passphrase, scope = { size: 'all', show_pending: null }) {
    const eventEmitter = new events.EventEmitter();
    const self = this;

    return new Promise((resolve, reject) => {
      const records = [];
      const decrypted_records = [];
      const decrypted_pendings = [];
      const pending_records = [];
      let records_found = 0;
      let response_data;
      let database = [];
      let completed_number = 0;
      let pending_number = 0;
      // let show_pending = scope.show_pending;

      eventEmitter.on('set_response_data', () => {
        if (scope.size !== 'last') {
          if (scope.show_pending !== undefined && scope.show_pending > 0) {
            response_data = {
              records_found,
              pending: decrypted_pendings,
              records: decrypted_records,
              last_record: decrypted_records[0],
            };
          } else {
            response_data = {
              records_found,
              records: decrypted_records,
              last_record: decrypted_records[0],
            };
          }
        } else if (scope.size === 'last') {
          response_data = { record: decrypted_records[0] };
        } else {
          response_data = { records: null, error: 'Invalid scope size' };
        }
        resolve(response_data);
      });

      eventEmitter.on('check_on_pending', () => {
        if (Object.keys(pending_records).length > 0) {
          let record_counter = 0;

          pending_records.forEach((p) => {
            const this_url = `${self.jupiter_data.server}/nxt?requestType=readMessage&transaction=${p}&secretPhrase=${record_passphrase}`;

            axios.get(this_url)
              .then((response) => {
                try {
                  const decrypted_pending = JSON.parse(response.data.decryptedMessage);
                  decrypted_pendings.push(decrypted_pending);
                } catch (e) {
                  console.log(e);
                }

                record_counter += 1;

                if (record_counter === pending_number) {
                  eventEmitter.emit('set_response_data');
                }
              })
              .catch((error) => {
                resolve(error);
              });
          });
        } else {
          eventEmitter.emit('set_response_data');
        }
      });

      eventEmitter.on('records_retrieved', () => {
        if (records.length <= 0) {
          eventEmitter.emit('check_on_pending');
        } else {
          let record_counter = 0;
          Object.keys(records).forEach((p) => {
            const transaction_id = records[p];
            const this_url = `${self.jupiter_data.server}/nxt?requestType=readMessage&transaction=${transaction_id}&secretPhrase=${record_passphrase}`;
            axios.get(this_url)
              .then((response) => {
                try {
                  // This decrypts the message from the blockchain using native encryption
                  // as well as the encryption based on encryption variable
                  const decrypted = JSON.parse(self.decrypt(response.data.decryptedMessage));
                  decrypted_records.push(decrypted);
                } catch (e) {
                  // console.log(e);
                  // Error here tend to be trying to decrypt a regular message from Jupiter
                  // rather than a gravity encrypted message
                }
                record_counter += 1;

                if (record_counter === completed_number) {
                  eventEmitter.emit('check_on_pending');
                }
              })
              .catch((error) => {
                console.log(error);
                reject(error);
              });
          });
        }
      });

      eventEmitter.on('database_retrieved', () => {
        for (let obj = 0; obj < Object.keys(database).length; obj += 1) {
          let completion = false;
          if (database[obj].attachment.encryptedMessage
            && database[obj].attachment.encryptedMessage.data != null
            && database[obj].senderRS === records_address) {
            if (scope.show_pending !== undefined && scope.show_pending > 0) {
              if (database[obj].confirmations <= scope.show_pending) {
                pending_records.push(obj.transaction);
                pending_number += 1;
              } else {
                records.push(database[obj].transaction);
                completed_number += 1;
              }
            } else if (scope.size === 'all') {
              records.push(database[obj].transaction);
              completed_number += 1;
            } else if (scope.size === 'last') {
              records.push(database[obj].transaction);
              records_found += 1;
              completed_number += 1;
              completion = true;
            }
            records_found += 1;
          }
          if (completion) {
            break;
          }
        }
        eventEmitter.emit('records_retrieved');
      });

      axios.get(`${self.jupiter_data.server}/nxt?requestType=getBlockchainTransactions&account=${user_address}&withMessage=true&type=1`)
        .then((response) => {
          database = response.data.transactions;
          eventEmitter.emit('database_retrieved');
        })
        .catch((error) => {
          console.log(error);
          resolve({ success: false, errors: error });
        });
    });
  }

  getAppRecords(app_address, app_passphrase) {
    const eventEmitter = new events.EventEmitter();
    const self = this;

    return new Promise((resolve, reject) => {
      const records = [];
      const decrypted_records = [];
      let records_found = 0;
      let response_data;
      let database = [];
      let completed_number = 0;

      eventEmitter.on('set_response_data', () => {
        response_data = {
          records_found,
          records: decrypted_records,
          last_record: decrypted_records[0],
        };

        resolve(response_data);
      });

      eventEmitter.on('records_retrieved', () => {
        if (records.length <= 0) {
          eventEmitter.emit('set_response_data');
        } else {
          let record_counter = 0;
          records.forEach((p) => {
            const this_url = `${self.jupiter_data.server}/nxt?requestType=readMessage&transaction=${p}&secretPhrase=${app_passphrase}`;
            axios.get(this_url)
              .then((response) => {
                try {
                  //  This decrypts the message from the blockchain using native encryption
                  // as well as the encryption based on encryption variable
                  const decrypted = JSON.parse(self.decrypt(response.data.decryptedMessage));
                  decrypted_records.push(decrypted);
                  // console.log(decrypted_records);
                } catch (e) {
                  console.log(e);
                }
                record_counter += 1;

                if (record_counter === completed_number) {
                  eventEmitter.emit('set_response_data');
                }
              })
              .catch((error) => {
                console.log(error);
                reject({ success: false, error: error.response });
              });
          });
        }
      });

      eventEmitter.on('database_retrieved', () => {
        for (let obj = 0; obj < Object.keys(database).length; obj += 1) {
          if (database[obj].attachment && database[obj].attachment.encryptedMessages) {
            records.push(database[obj].transaction);
            completed_number += 1;
            records_found += 1;
          }
        }
        eventEmitter.emit('records_retrieved');
      });

      axios.get(`${self.jupiter_data.server}/nxt?requestType=getBlockchainTransactions&account=${app_address}&withMessage=true&type=1`)
        .then((response) => {
          database = response.data.transactions;
          eventEmitter.emit('database_retrieved');
        })
        .catch((error) => {
          console.log(error);
          resolve({ success: false, errors: error });
        });
    });
  }


  getAllRecords(table, scope = { size: 'all', show_pending: null }) {
    const eventEmitter = new events.EventEmitter();
    const self = this;

    return new Promise((resolve, reject) => {
      const records = [];
      const decrypted_records = [];
      const decrypted_pendings = [];
      const pending_records = [];
      let records_found = 0;
      let response_data;
      let database;
      let record_table;
      let table_data;
      // let { show_pending } = scope;
      let completed_number = 0;
      let pending_number = 0;

      eventEmitter.on('set_response_data', () => {
        if (scope.size !== 'last') {
          if (scope.show_pending !== undefined && scope.show_pending > 0) {
            response_data = {
              records_found,
              pending: decrypted_pendings,
              records: decrypted_records,
              last_record: decrypted_records[0],
            };
          } else {
            response_data = {
              records_found,
              records: decrypted_records,
              last_record: decrypted_records[0],
            };
          }
        } else if (scope.size === 'last') {
          response_data = { record: decrypted_records[0] };
        } else {
          response_data = { records: null, error: 'Invalid scope size' };
        }
        resolve(response_data);
      });

      eventEmitter.on('check_on_pending', () => {
        if (Object.keys(pending_records).length > 0) {
          let record_counter = 0;

          pending_records.forEach((p) => {
            const this_url = `${self.jupiter_data.server}/nxt?requestType=readMessage&transaction=${p}&secretPhrase=${record_table.passphrase}`;
            axios.get(this_url)
              .then((response) => {
                try {
                  const decrypted_pending = JSON.parse(response.data.decryptedMessage);
                  decrypted_pendings.push(decrypted_pending);
                } catch (e) {
                  console.log(e);
                }
                record_counter += 1;

                if (record_counter === pending_number) {
                  eventEmitter.emit('set_response_data');
                }
              })
              .catch((error) => {
                reject(error);
              });
          });
        } else {
          eventEmitter.emit('set_response_data');
        }
      });

      eventEmitter.on('records_retrieved', () => {
        if (Object.keys(records).length <= 0) {
          eventEmitter.emit('check_on_pending');
        } else {
          let record_counter = 0;
          records.forEach((p) => {
            const this_url = `${self.jupiter_data.server}/nxt?requestType=readMessage&transaction=${p}&secretPhrase=${record_table.passphrase}`;
            axios.get(this_url)
              .then((response) => {
                try {
                  // This decrypts the message from the blockchain using native encryption
                  // as well as the encryption based on encryption variable
                  const decrypted = JSON.parse(self.decrypt(response.data.decryptedMessage));
                  decrypted_records.push(decrypted);
                } catch (e) {
                  console.log(e);
                }
                record_counter += 1;

                if (record_counter === completed_number) {
                  eventEmitter.emit('check_on_pending');
                }
              })
              .catch((error) => {
                console.log(error);
                reject(error);
              });
          });
        }
      });

      eventEmitter.on('table_retrieved', () => {
        /* Object.keys(table_data).some((position) => {
          const obj = table_data[position];
          let completion = false;
          if (obj.attachment.encryptedMessage.data && obj.recipientRS !== record_table.address) {
            if (scope.show_pending && scope.show_pending > 0) {
              if (obj.confirmations <= scope.show_pending) {
                pending_records.push(obj.transaction);
                pending_number += 1;
              } else {
                records.push(obj.transaction);
                completed_number += 1;
              }
            } else if (scope.size === 'all') {
              records.push(obj.transaction);
              completed_number += 1;
            } else if (scope.size === 'last') {
              records.push(obj.transaction);
              records_found += 1;
              completed_number += 1;
              completion = true;
            }
            records_found += 1;
          }
          return completion;
        }); */

        for (let position = 0; position < Object.keys(table_data).length; position += 1) {
          const obj = table_data[position];
          let completion = false;
          if (obj.attachment.encryptedMessage.data && obj.recipientRS !== record_table.address) {
            if (scope.show_pending && scope.show_pending > 0) {
              if (obj.confirmations <= scope.show_pending) {
                pending_records.push(obj.transaction);
                pending_number += 1;
              } else {
                records.push(obj.transaction);
                completed_number += 1;
              }
            } else if (scope.size === 'all') {
              records.push(obj.transaction);
              completed_number += 1;
            } else if (scope.size === 'last') {
              records.push(obj.transaction);
              records_found += 1;
              completed_number += 1;
              completion = true;
            }
            records_found += 1;
          }
          if (completion) {
            break;
          }
        }
        eventEmitter.emit('records_retrieved');
      });

      eventEmitter.on('table_access_retrieved', () => {
        axios.get(`${self.jupiter_data.server}/nxt?requestType=getBlockchainTransactions&account=${record_table.address}&withMessage=true&type=1`)
          .then((response) => {
            table_data = response.data.transactions;
            eventEmitter.emit('table_retrieved');
          })
          .catch((error) => {
            console.log(error);
            reject({ success: false, errors: error });
          });
      });

      self.loadAppData()
        .then((res) => {
          database = res.app.tables;
          Object.keys(database).forEach((x) => {
            if (database[x][table]) {
              record_table = database[x][table];
            }
          });
          eventEmitter.emit('table_access_retrieved');
        })
        .catch((err) => {
          console.log(err);
          reject('There was an error');
        });
    });
  }

  // This method retrieves user info based on the account and the passphrase given
  getUser(account, passphrase) {
    const eventEmitter = new events.EventEmitter();
    const self = this;

    return new Promise((resolve, reject) => {
      const records = [];
      const decrypted_records = [];
      let response_data;
      let database;
      let record_table;
      let table_data;
      let completed_number = 0;
      let records_found = 0;

      if (account === process.env.APP_ACCOUNT_ADDRESS) {
        const user_object = {
          account,
          id: process.env.APP_ACCOUNT_ID,
          email: process.env.APP_EMAIL,
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
        resolve({ user: JSON.stringify(user_object) });
      } else {
        eventEmitter.on('set_response_data', () => {
          if (decrypted_records[0] === undefined
            || decrypted_records[0].user_record === undefined) {
            resolve({ error: true, message: 'Account not on file!' });
          } else {
            response_data = { records_found, user: decrypted_records[0].user_record };
            resolve(response_data);
          }
        });

        eventEmitter.on('check_on_pending', () => {
          eventEmitter.emit('set_response_data');
        });

        eventEmitter.on('records_retrieved', () => {
          if (Object.keys(records).length <= 0) {
            eventEmitter.emit('check_on_pending');
          } else {
            let record_counter = 0;
            records.forEach((p) => {
              const this_url = `${self.jupiter_data.server}/nxt?requestType=readMessage&transaction=${p}&secretPhrase=${passphrase}`;

              axios.get(this_url)
                .then((response) => {
                  try {
                    // This decrypts the message from the blockchain using native encryption
                    // as well as the encryption based on encryption variable
                    const decrypted = JSON.parse(self.decrypt(response.data.decryptedMessage));
                    decrypted_records.push(decrypted);
                  } catch (e) {
                    console.log(e);
                  }
                  record_counter += 1;

                  if (record_counter === completed_number) {
                    eventEmitter.emit('check_on_pending');
                  }
                })
                .catch((error) => {
                  console.log(error);
                  reject(error);
                });
            });
          }
        });

        eventEmitter.on('table_retrieved', () => {
          Object.keys(table_data).some((position) => {
            const obj = table_data[position];
            let completion = false;
            if (obj.attachment.encryptedMessage.data && obj.recipientRS === account) {
              records.push(obj.transaction);
              records_found += 1;
              completed_number += 1;
              completion = true;
            }
            return completion;
          });
          eventEmitter.emit('records_retrieved');
        });

        eventEmitter.on('table_access_retrieved', () => {
          axios.get(`${self.jupiter_data.server}/nxt?requestType=getBlockchainTransactions&account=${record_table.address}&withMessage=true&type=1`)
            .then((response) => {
              table_data = response.data.transactions;
              eventEmitter.emit('table_retrieved');
            })
            .catch((error) => {
              console.log(error);
              reject({ success: false, errors: error });
            });
        });

        self.loadAppData()
          .then((res) => {
            database = res.app.tables;
            Object.keys(database).forEach((x) => {
              if (database[x].users) {
                record_table = database[x].users;
              }
            });
            eventEmitter.emit('table_access_retrieved');
          })
          .catch((err) => {
            console.log(err);
            reject('There was an error');
          });
      }
    });
  }

  // This method retrieves record info based on the table and id number given
  findById(id, model) {
    const eventEmitter = new events.EventEmitter();
    const self = this;
    const same_id = [];
    let all_records = [];

    return new Promise((resolve, reject) => {
      const Record = require(`../models/${model}`);
      const record = new Record({ id: null });

      eventEmitter.on('records_retrieved', () => {
        // let user_address;
        /* Object.keys(all_records).forEach((x) => {
          if (all_records[x].id && all_records[x].id === id) {
            same_id.push(JSON.parse(all_records[x][`${model}_record`]));
          }
        }); */

        for (let x = 0; x < Object.keys(all_records).length; x += 1) {
          if (all_records[x].id && all_records[x].id === id) {
            same_id.push(JSON.parse(all_records[x][`${model}_record`]));
          }
        }
        self.sortByDate(same_id);
        resolve({ success: true, record: same_id[0] });
      });

      self.getAllRecords(record.table)
        .then((response) => {
          all_records = response.records;
          eventEmitter.emit('records_retrieved');
        })
        .catch((error) => {
          console.log(error);
          reject({ success: false, errors: error });
        });
    });
  }

  getBalance(address = 'undefined') {
    const self = this;
    const eventEmitter = new events.EventEmitter();
    let account;
    let terminal_called = false;
    let address_owner;
    let server;

    if (address === 'undefined') {
      if (process.env.JUPITERSERVER === undefined || process.env.JUPITERSERVER == null) {
        const gravity = require('../.gravity.js');
        address_owner = gravity.APP_ACCOUNT;
        server = gravity.JUPITERSERVER;
        terminal_called = true;
      } else {
        address_owner = process.env.APP_ACCOUNT;
        server = process.env.JUPITERSERVER;
      }
    } else if (process.env.JUPITERSERVER === undefined || process.env.JUPITERSERVER == null) {
      const gravity = require('../.gravity.js');
      address_owner = address;
      server = gravity.JUPITERSERVER;
      terminal_called = true;
    } else {
      address_owner = address;
      server = process.env.JUPITERSERVER;
    }

    return new Promise((resolve, reject) => {
      eventEmitter.on('account_retrieved', () => {
        axios.post(`${server}/nxt?requestType=getBalance&account=${account}`)
          .then((response) => {
            if (response.data.errorDescription) {
              reject(response.data);
            } else {
              if (terminal_called) {
                console.log(`Balance: ${(parseFloat(response.data.balanceNQT) / (10 ** self.jupiter_data.moneyDecimals))} JUP.`);
              }
              let minimumAppBalance = false;
              let minimumTableBalance = false;

              if (response.data.balanceNQT >= self.jupiter_data.minimumAppBalance) {
                minimumAppBalance = true;
              }

              if (response.data.balanceNQT >= self.jupiter_data.minimumTableBalance) {
                minimumTableBalance = true;
              }

              const response_data = {
                minimumAppBalance,
                minimumTableBalance,
                balance: response.data.balanceNQT,
                minAppBalanceAmount: self.jupiter_data.minimumAppBalance,
                minTableBalanceAmount: self.jupiter_data.minimumTableBalance,
              };
              resolve(response_data);
            }
          })
          .catch((error) => {
            console.log(error);
            reject({ success: false, message: 'There was an error obtaining account Jupiter balance' });
          });
      });

      axios.get(`${server}/nxt?requestType=getAccountId&secretPhrase=${address_owner}`)
        .then((response) => {
          ({ account } = response.data);
          eventEmitter.emit('account_retrieved');
        })
        .catch((error) => {
          console.log(error);
          reject({ success: false, message: 'There was an error obtaining account Jupiter balance' });
        });
    });
  }

  sendMoney(recipient, transfer_amount = null, sender = this.sender) {
    // This is the variable that will be used to send Jupiter from the app address to the address
    // that will be used as a database table or will serve a purpose in the Gravity infrastructure
    const feeNQT = 100;
    const table_creation = 500 + 250;
    let amount = transfer_amount;
    let sender_address;
    let server;

    if (amount == null) {
      amount = this.jupiter_data.minimumTableBalance - feeNQT - table_creation;
    }

    if (this.sender == null || this.sender === undefined) {
      const gravity = require('../.gravity.js');
      sender_address = gravity.APP_ACCOUNT;
      server = gravity.JUPITERSERVER;
    } else {
      sender_address = sender;
      server = process.env.JUPITERSERVER;
    }

    return new Promise((resolve, reject) => {
      axios.post(`${server}/nxt?requestType=sendMoney&secretPhrase=${sender_address}&recipient=${recipient}&amountNQT=${amount}&feeNQT=${feeNQT}&deadline=60`)
        .then((response) => {
          if (response.data.signatureHash != null) {
            resolve(true);
          } else {
            console.log('Cannot send Jupiter to new account, Jupiter issuer has insufficient balance!');
            reject(response.data);
          }
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  create_record(model_name, data, original_attributes) {
    const eventEmitter = new events.EventEmitter();
    const self = this;

    return new Promise((resolve, reject) => {
      const RecordClass = require(`../models/${model_name}`);
      const new_record = new RecordClass(original_attributes);
      let jup_account;
      // let model_address;
      let model_passphrase;
      let record_name;
      const attributes = original_attributes;

      eventEmitter.on('address_verification', () => {
        let call_url;
        // If there are no errors, rest of the code is executed
        if (new_record.verify().errors === false) {
          record_name = `${model_name}_record`;
          attributes.date = Date.now();
          const record = {
            [record_name]: attributes,
          };

          if (data.public_key != null) {
            call_url = `${self.jupiter_data.server}/nxt?requestType=sendMessage&secretPhrase=${model_passphrase}&recipient=${jup_account}&messageToEncrypt=${JSON.stringify(record)}&feeNQT=${self.jupiter_data.feeNQT}&deadline=${self.jupiter_data.deadline}&recipientPublicKey=${data.public_key}&compressMessageToEncrypt=true`;
          } else {
            call_url = `${self.jupiter_data.server}/nxt?requestType=sendMessage&secretPhrase=${model_passphrase}&recipient=${jup_account}&messageToEncrypt=${JSON.stringify(record)}&feeNQT=${self.jupiter_data.feeNQT}&deadline=${self.jupiter_data.deadline}&compressMessageToEncrypt=true`;
          }

          axios.post(call_url)
            .then((response) => {
              if (response.data.broadcasted != null && response.data.broadcasted === true) {
                resolve({
                  data,
                  success: true,
                  message: `${model_name} record saved`,
                  jupiter_response: response.data,
                });
              } else if (response.data.errorDescription != null) {
                resolve({
                  success: false,
                  message: response.data.errorDescription,
                  jupiter_response: response.data,
                });
              } else {
                resolve({
                  success: false,
                  message: 'Unable to save data in blockchain',
                  jupiter_response: response.data,
                });
              }
            })
            .catch((error) => {
              console.log(error);
              reject({ success: false, message: 'There was an error' });
            });
        } else {
          resolve({
            success: false,
            message: 'There was an error',
            [model_name]: attributes,
            validations: new_record.verify(),
          });
        }
      });

      const User = require('../models/user');

      User.findOne({ 'api.generated_key': data.api_key }, (err, user) => {
        if (err) {
          reject({ success: false, message: 'There was an error validating your account', error: err });
        } else if (data.address !== user.record.account) {
          reject({ success: false, message: 'The api key you provided is not associated with the account number your provided' });
        } else {
          // model_address = process.env.BOOK_RECORD_ADDRESS;
          model_passphrase = process.env.BOOK_RECORD;
          jup_account = data.address;
          eventEmitter.emit('address_verification');
        }
      });
    });
  }

  create_new_address(passphrase) {
    const self = this;
    return new Promise((resolve, reject) => {
      axios.get(`${self.jupiter_data.server}/nxt?requestType=getAccountId&secretPhrase=${passphrase}`)
        .then((response) => {
          const address = response.data.accountRS;
          const public_key = response.data.publicKey;
          resolve({ address, public_key, success: true });
        })
        .catch((error) => {
          console.log(error);
          console.log('There was an error in address creation');
          reject({ success: false, message: 'There was an error creating a new Jupiter address' });
        });
    });
  }

  //------------------------------------------------------------------------------------------
  // CONSOLE COMMANDS: This methods are related to database creation and can only be accessed
  // from the console. They generate files and make calls to Jupiter to record data
  //------------------------------------------------------------------------------------------


  // Encrypt users table
  encryptTableData() {
    this.algorithm = require('../.gravity.js').ENCRYPT_ALGORITHM;
    this.password = require('../.gravity.js').ENCRYPT_PASSWORD;

    const records = {
      tables: ['users'],
      date: Date.now(),
    };
    const encrypted_data = JSON.stringify(records);
    console.log(records);
    console.log(encrypted_data);
    console.log(this.encrypt(encrypted_data));
  }

  // This method creates a table
  createTable() {
    const gravity = require('../.gravity.js');
    const eventEmitter = new events.EventEmitter();
    const self = this;
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    // let valid_table = true;
    let table_list = [];
    // let app;
    let table_name;
    let address;
    let passphrase;
    // let current_tables;
    let record;
    let table_list_record;
    // let table_created = true;

    return new Promise((resolve, reject) => {
      eventEmitter.on('insufficient_balance', () => {
        rl.close();
        reject('Insufficient balance');
      });

      eventEmitter.on('table_created', () => {
        // This code will send Jupiter to the recently created table address so that it is
        // able to record information
        self.sendMoney(address)
          .then((response) => {
            console.log(`Table ${table_name} funded with JUP.`);
            rl.close();
            resolve({
              success: true,
              message: `Table ${table_name} pushed to the blockchain and funded.`,
              data: response.data,
              jupiter_response: response.data,
            });
          })
          .catch((err) => {
            console.log(err);
            rl.close();
            reject({ success: false, message: 'Unable to send Jupiter to new table address' });
          });
      });

      eventEmitter.on('address_retrieved', () => {
        const encrypted_data = self.encrypt(JSON.stringify(record));
        const encrypted_table_data = self.encrypt(JSON.stringify(table_list_record));
        // var decrypted_data = self.decrypt(encrypted_data);
        // console.log(decrypted_data);
        // console.log(JSON.parse(decrypted_data));

        const call_url = `${self.jupiter_data.server}/nxt?requestType=sendMessage&secretPhrase=${gravity.APP_ACCOUNT}&recipient=${gravity.APP_ACCOUNT_ADDRESS}&messageToEncrypt=${encrypted_data}&feeNQT=${self.jupiter_data.feeNQT}&deadline=${self.jupiter_data.deadline}&recipientPublicKey=${gravity.APP_PUBLIC_KEY}&compressMessageToEncrypt=true`;


        axios.post(call_url)
          .then((response) => {
            if (response.data.broadcasted != null && response.data.broadcasted === true) {
              console.log(`Table ${table_name} pushed to the blockchain and linked to your account.`);
              eventEmitter.emit('table_created');
            } else if (response.data.errorDescription != null) {
              console.log('There was an Error');
              console.log(response);
              console.log(response.data);
              console.log(`Error: ${response.data.errorDescription}`);
              rl.close();
              reject({
                success: false,
                message: response.data.errorDescription,
                jupiter_response: response.data,
              });
            } else {
              console.log('Unable to save data in the blockchain');
              console.log(response.data);
              rl.close();
              reject({ success: false, message: 'Unable to save data in the blockchain', jupiter_response: response.data });
            }
          })
          .catch((error) => {
            console.log('There was an error');
            console.log(error);
            rl.close();
            reject({ success: false, message: 'There was an error', error: error.response });
          });

        const table_list_update_url = `${self.jupiter_data.server}/nxt?requestType=sendMessage&secretPhrase=${gravity.APP_ACCOUNT}&recipient=${gravity.APP_ACCOUNT_ADDRESS}&messageToEncrypt=${encrypted_table_data}&feeNQT=${(self.jupiter_data.feeNQT / 2)}&deadline=${self.jupiter_data.deadline}&recipientPublicKey=${gravity.APP_PUBLIC_KEY}&compressMessageToEncrypt=true`;

        axios.post(table_list_update_url)
          .then((response) => {
            if (response.data.broadcasted && response.data.broadcasted === true) {
              // console.log('Table list updated');
            } else if (response.data.errorDescription != null) {
              console.log('There was an Error');
              console.log(response.data);
              console.log(`Error:${response.data.errorDescription}`);
              console.log(response.data);
            } else {
              console.log(response.data);
              console.log(encrypted_table_data);
            }
          })
          .catch((error) => {
            console.log('There was an error in updating table list');
            console.log(error);
            console.log(encrypted_table_data);
          });
      });

      eventEmitter.on('table_name_obtained', () => {
        if (self.tables.indexOf(table_name) >= 0) {
          console.log(`Error: Unable to save table. ${table_name} is already in the database`);
          rl.close();
        } else {
          passphrase = self.generate_passphrase();

          self.create_new_address(passphrase)
            .then((response) => {
              if (response.success === true && response.address.length > 0) {
                ({ address } = response);
                record = {
                  [table_name]: {
                    address,
                    passphrase,
                    public_key: response.public_key,
                  },
                };
                table_list.push(table_name);
                table_list_record = {
                  tables: table_list,
                  date: Date.now(),
                };

                eventEmitter.emit('address_retrieved');
              } else {
                console.log('There was an error');
                console.log(response);
              }
            })
            .catch((error) => {
              console.log(error);
              rl.close();
            });
        }
      });

      eventEmitter.on('verified_balance', () => {
        if (gravity.APP_ACCOUNT === undefined || gravity.APP_ACCOUNT === '' || gravity.APP_ACCOUNT == null) {
          console.log('Error: .gravity file does not contain seedphrase for app. Please provide one.');
        } else {
          self.loadAppData()
            .then((response) => {
              if (response.tables === undefined
                || response.tables == null
                || response.tables.length === 0) {
                table_list = [];
              } else {
                table_list = response.tables;
              }

              console.log('You are about to create a new database table for your Gravity app.');
              console.log('The following tables are already linked to your database:');
              console.log(table_list);
              rl.question('What will be the name of your new table?\n', (answer) => {
                table_name = answer;
                eventEmitter.emit('table_name_obtained');
              });
            })
            .catch((error) => {
              console.log('Error in creating table');
              console.log(error);
            });
        }
      });

      self.getBalance()
        .then((response) => {
          if (response.minimumTableBalance === true) {
            eventEmitter.emit('verified_balance');
          } else {
            console.log('Error in creating new table: insufficient app balance.');
            console.log(`A minimum of ${parseInt((self.jupiter_data.minimumTableBalance) / (10 ** self.jupiter_data.moneyDecimals), 10)} JUP is required to create a table with Gravity.`);
            eventEmitter.emit('insufficient_balance');
          }
        })
        .catch((error) => {
          console.log('There was an error trying to create a new table in Jupiter.');
          console.log(error);
          eventEmitter.emit('insufficient_balance');
        });
    });
  }

  // This class is meant to be used when creating tables from the command line
  createAppDatabase() {
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    let appname;
    let server;
    let password;
    let passphrase;

    console.log('You are about to create a Gravity app. Please answer the following questions:');

    rl.question('What is the name of the app?\n', (answer1) => {
      appname = answer1;

      rl.question('Please provide an encryption password for your Jupiter data:\n', (answer2) => {
        password = answer2;
        rl.question('What is the IP address/URL of your Jupiter server?\n', (answer) => {
          server = answer;
          const current_data = {
            'Name of the app': appname,
            'Password  for encryption': password,
            'Jupiter Server': server,
          };
          console.log('Please verify the data you entered:');
          console.log(current_data);
          console.log('');
          rl.question("You are about to create a Jupiter account which will hold your Gravity app's data. Is the information provided above accurate? If so, press ENTER. If not, press CTRL+C to cancel and rerun command.\n", () => {
            passphrase = methods.generate_passphrase();

            axios.get(`${server}/nxt?requestType=getAccountId&secretPhrase=${passphrase}`)
              .then((response) => {
                const address = response.data.accountRS;
                const public_key = response.data.publicKey;

                if (address) {
                  const configuration = {
                    APPNAME: appname,
                    JUPITERSERVER: server,
                    APP_ACCOUNT: passphrase,
                    APP_ACCOUNT_ADDRESS: address,
                    APP_PUBLIC_KEY: public_key,
                    ENCRYPT_ALGORITHM: 'aes-128-cbc',
                    ENCRYPT_PASSWORD: password,
                    APP_ACCOUNT_ID: public_key,
                  };
                  const env_variables = configuration;
                  let env_variables_in_string = '';
                  env_variables.SESSION_SECRET = 'session_secret_key_here';

                  const fs = require('fs');

                  // We prepare the string that will be used to create the .gravity file
                  const object_in_string = `module.exports=${JSON.stringify(configuration)}`;
                  const module_in_string = object_in_string.replace(/={/g, '={\n').replace(/","/g, '",\n"').replace(/"}/g, '"\n}');

                  // We prepare the string that will be used to create the .env file
                  Object.keys(env_variables).forEach((key) => {
                    env_variables_in_string = `${env_variables_in_string + key.toUpperCase()}='${env_variables[key]}'\n`;
                  });

                  fs.writeFile('.gravity.js', module_in_string, (err) => {
                    if (err) {
                      return console.log(err);
                    }
                    fs.writeFile('.env', env_variables_in_string, (error) => {
                      if (error) {
                        return console.log(error);
                      }
                      console.log('\nSuccess! .gravity and .env files generated!');
                      console.log('\nPlease write down a 12-word passphrase and account address assigned to your app as well as the password assigned for encryption (See .env or .gravity files). If you lose your passphrase or your encryption password, you will lose access to all your saved data.');
                      console.log('\nIn order to begin saving information into the Jupiter blockchain, you will need to obtain Jupiter tokens from: https://exchange.darcr.us.');
                      rl.close();
                      return null;
                    });
                    return null;
                  });
                } else {
                  console.log(response.data.message);
                  rl.close();
                }
              })
              .catch((error) => {
                console.log(error);
                console.log('There was an error in database creation');
                rl.close();
              });
          });
        });
      });
    });
  }
}


module.exports = new Gravity();
