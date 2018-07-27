
const axios = require('axios');
const crypto = require('crypto');
const events = require('events');
const methods = require('./_methods');


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

  showTables(returnType = 'app') {
    const self = this;
    return new Promise((resolve, reject) => {
      self.loadAppData()
        .then((response) => {
          if (returnType === 'console') {
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


  loadTables(returnType = 'app') {
    const self = this;
    let current;
    return new Promise((resolve, reject) => {
      self.loadAppData()
        .then((response) => {
          const { tables } = response.app;

          if (returnType === 'console') {
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

  isSubtable(MainTable, SubTable) {
    const mainTable = MainTable.sort().join(',');
    const subtable = SubTable.sort().join(',');
    let returnValue;
    if (mainTable.includes(subtable)) {
      returnValue = true;
    } else {
      returnValue = false;
    }
    return returnValue;
  }

  sortBySubkey(array, key, subkey) {
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
    let numberOfRecords;
    if (process.env.APP_ACCOUNT) {
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
      let responseMessage;

      eventEmitter.on('loaded_records', () => {
        // console.log('Records loaded. Organizing records now.');
        if (records !== undefined && records.length > 0) {
          const tableList = [];
          const tablesRetrieved = {};

          // We first query the records to find the one containing the tableList
          // We also create push all the remaining tables to the tablesRetrieved_variable
          /* Object.keys(records).forEach((x) => {
            // A tables record must contain a date key along with its tables key
            if (records[x].tables && records[x].date && records[x].date) {
              tableList.push(records[x]);
            } else {
              const objectKey = Object.keys(records[x])[0];
              if (tablesRetrieved[objectKey] === undefined) {
                tablesRetrieved[objectKey] = [];
                tablesRetrieved[objectKey].push(records[x]);
              } else {
                tablesRetrieved[objectKey].push(records[x]);
              }
            }
          }); */

          for (let x = 0; x < Object.keys(records).length; x += 1) {
            if (records[x].tables && records[x].date && records[x].date) {
              tableList.push(records[x]);
            } else {
              const objectKey = Object.keys(records[x])[0];
              if (tablesRetrieved[objectKey] === undefined) {
                tablesRetrieved[objectKey] = [];
                tablesRetrieved[objectKey].push(records[x]);
              } else {
                tablesRetrieved[objectKey].push(records[x]);
              }
            }
          }

          // Once we have separated the records into table list and potentially table object list,
          // we then retrieve the last table record
          self.sortByDate(tableList);

          // This variable will represent the most recent and valid list of tables in the app
          let currentList = [];
          /* Object.keys(tableList).forEach((y) => {
            if (tableList[y].tables.length > currentList.length) {
              if (currentList.length === 0) {
                currentList = tableList[y].tables;
              } else if (self.isSubtable(currentList, tableList[y].tables)) {
                currentList = tableList[y].tables;
              }
            }
          }); */

          for (let y = 0; y < Object.keys(tableList).length; y += 1) {
            if (tableList[y].tables.length > currentList.length) {
              if (currentList.length === 0) {
                currentList = tableList[y].tables;
              } else if (self.isSubtable(currentList, tableList[y].tables)) {
                currentList = tableList[y].tables;
              }
            }
          }

          // Now that we have a list with all the table records and the list of tables
          // that the app should be using. We go through the tablesRetrieved and get the
          // latest records of each table that the app is supposed to be using.
          const tableData = [];
          /* Object.keys(currentList).forEach((i) => {
            const thisKey = currentList[i];

            // We need to sort the the list we are about to call
            self.sortBySubkey(tablesRetrieved[thisKey], thisKey, 'date');

            // Once we do this, we can obtain the last record and push to the tableData variable
            // NOTE: We'll expand validation of tables in future releases
            tableData.push(tablesRetrieved[thisKey][0]);
          }); */

          for (let i = 0; i < Object.keys(currentList).length; i += 1) {
            const thisKey = currentList[i];

            // We need to sort the the list we are about to call
            self.sortBySubkey(tablesRetrieved[thisKey], thisKey, 'date');

            // Once we do this, we can obtain the last record and push to the tableData variable
            // NOTE: We'll expand validation of tables in future releases
            tableData.push(tablesRetrieved[thisKey][0]);
          }

          self.appSchema.tables = tableData;
          self.appSchema.appData.name = appname;
          self.appSchema.address = account;
          responseMessage = {
            numberOfRecords,
            success: true,
            app: self.appSchema,
            message: 'Existing record found',
            tables: currentList,
          };

          if (process.env.ENV === undefined || process.env.ENV === 'Development') {
            // console.log(self.tables);
            // console.log(self.appSchema.tables);
          }
          resolve(responseMessage);
        } else {
          responseMessage = {
            numberOfRecords,
            success: true,
            app:
            self.appSchema,
            message: 'No app record',
          };
          // if (process.env.ENV == undefined || process.env.ENV == 'Development')
          // console.log(responseMessage);
          resolve(responseMessage);
        }
      });

      self.getRecords(account, account, passphrase)
        .then((response) => {
          ({ records } = response);
          numberOfRecords = response.recordsFound;
          eventEmitter.emit('loaded_records');
        })
        .catch((error) => {
          console.log(error);
          reject({ success: false, error: 'There was an error loading records' });
        });
    });
  }

  getRecords(userAddress, recordsAddress, recordPassphrase, scope = { size: 'all', show_pending: null }) {
    const eventEmitter = new events.EventEmitter();
    const self = this;

    return new Promise((resolve, reject) => {
      const records = [];
      const decryptedRecords = [];
      const decryptedPendings = [];
      const pendingRecords = [];
      let recordsFound = 0;
      let responseData;
      let database = [];
      let completedNumber = 0;
      let pendingNumber = 0;
      // let show_pending = scope.show_pending;

      eventEmitter.on('set_responseData', () => {
        if (scope.size !== 'last') {
          if (scope.show_pending !== undefined && scope.show_pending > 0) {
            responseData = {
              recordsFound,
              pending: decryptedPendings,
              records: decryptedRecords,
              last_record: decryptedRecords[0],
            };
          } else {
            responseData = {
              recordsFound,
              records: decryptedRecords,
              last_record: decryptedRecords[0],
            };
          }
        } else if (scope.size === 'last') {
          responseData = { record: decryptedRecords[0] };
        } else {
          responseData = { records: null, error: 'Invalid scope size' };
        }
        resolve(responseData);
      });

      eventEmitter.on('check_on_pending', () => {
        if (Object.keys(pendingRecords).length > 0) {
          let recordCounter = 0;

          pendingRecords.forEach((p) => {
            const thisUrl = `${self.jupiter_data.server}/nxt?requestType=readMessage&transaction=${p}&secretPhrase=${recordPassphrase}`;

            axios.get(thisUrl)
              .then((response) => {
                try {
                  const decriptedPending = JSON.parse(response.data.decryptedMessage);
                  decryptedPendings.push(decriptedPending);
                } catch (e) {
                  console.log(e);
                }

                recordCounter += 1;

                if (recordCounter === pendingNumber) {
                  eventEmitter.emit('set_responseData');
                }
              })
              .catch((error) => {
                resolve(error);
              });
          });
        } else {
          eventEmitter.emit('set_responseData');
        }
      });

      eventEmitter.on('records_retrieved', () => {
        if (records.length <= 0) {
          eventEmitter.emit('check_on_pending');
        } else {
          let recordCounter = 0;
          Object.keys(records).forEach((p) => {
            const transactionId = records[p];
            const thisUrl = `${self.jupiter_data.server}/nxt?requestType=readMessage&transaction=${transactionId}&secretPhrase=${recordPassphrase}`;
            axios.get(thisUrl)
              .then((response) => {
                try {
                  // This decrypts the message from the blockchain using native encryption
                  // as well as the encryption based on encryption variable
                  const decrypted = JSON.parse(self.decrypt(response.data.decryptedMessage));
                  decryptedRecords.push(decrypted);
                } catch (e) {
                  // console.log(e);
                  // Error here tend to be trying to decrypt a regular message from Jupiter
                  // rather than a gravity encrypted message
                }
                recordCounter += 1;
                if (recordCounter === completedNumber) {
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
            && database[obj].senderRS === recordsAddress) {
            if (scope.show_pending !== undefined && scope.show_pending > 0) {
              if (database[obj].confirmations <= scope.show_pending) {
                pendingRecords.push(obj.transaction);
                pendingNumber += 1;
              } else {
                records.push(database[obj].transaction);
                completedNumber += 1;
              }
            } else if (scope.size === 'all') {
              records.push(database[obj].transaction);
              completedNumber += 1;
            } else if (scope.size === 'last') {
              records.push(database[obj].transaction);
              recordsFound += 1;
              completedNumber += 1;
              completion = true;
            }
            recordsFound += 1;
          }
          if (completion) {
            break;
          }
        }
        eventEmitter.emit('records_retrieved');
      });

      axios.get(`${self.jupiter_data.server}/nxt?requestType=getBlockchainTransactions&account=${userAddress}&withMessage=true&type=1`)
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

  getAppRecords(appAddress, appPassphrase) {
    const eventEmitter = new events.EventEmitter();
    const self = this;

    return new Promise((resolve, reject) => {
      const records = [];
      const decryptedRecords = [];
      let recordsFound = 0;
      let responseData;
      let database = [];
      let completedNumber = 0;

      eventEmitter.on('set_responseData', () => {
        responseData = {
          recordsFound,
          records: decryptedRecords,
          last_record: decryptedRecords[0],
        };

        resolve(responseData);
      });

      eventEmitter.on('records_retrieved', () => {
        if (records.length <= 0) {
          eventEmitter.emit('set_responseData');
        } else {
          let recordCounter = 0;
          records.forEach((p) => {
            const thisUrl = `${self.jupiter_data.server}/nxt?requestType=readMessage&transaction=${p}&secretPhrase=${appPassphrase}`;
            axios.get(thisUrl)
              .then((response) => {
                try {
                  //  This decrypts the message from the blockchain using native encryption
                  // as well as the encryption based on encryption variable
                  const decrypted = JSON.parse(self.decrypt(response.data.decryptedMessage));
                  decryptedRecords.push(decrypted);
                  // console.log(decryptedRecords);
                } catch (e) {
                  console.log(e);
                }
                recordCounter += 1;

                if (recordCounter === completedNumber) {
                  eventEmitter.emit('set_responseData');
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
            completedNumber += 1;
            recordsFound += 1;
          }
        }
        eventEmitter.emit('records_retrieved');
      });

      axios.get(`${self.jupiter_data.server}/nxt?requestType=getBlockchainTransactions&account=${appAddress}&withMessage=true&type=1`)
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
      const decryptedRecords = [];
      const decryptedPendings = [];
      const pendingRecords = [];
      let recordsFound = 0;
      let responseData;
      let database;
      let recordTable;
      let tableData;
      // let { show_pending } = scope;
      let completedNumber = 0;
      let pendingNumber = 0;

      eventEmitter.on('set_responseData', () => {
        if (scope.size !== 'last') {
          if (scope.show_pending !== undefined && scope.show_pending > 0) {
            responseData = {
              recordsFound,
              pending: decryptedPendings,
              records: decryptedRecords,
              last_record: decryptedRecords[0],
            };
          } else {
            responseData = {
              recordsFound,
              records: decryptedRecords,
              last_record: decryptedRecords[0],
            };
          }
        } else if (scope.size === 'last') {
          responseData = { record: decryptedRecords[0] };
        } else {
          responseData = { records: null, error: 'Invalid scope size' };
        }
        resolve(responseData);
      });

      eventEmitter.on('check_on_pending', () => {
        if (Object.keys(pendingRecords).length > 0) {
          let recordCounter = 0;

          pendingRecords.forEach((p) => {
            const thisUrl = `${self.jupiter_data.server}/nxt?requestType=readMessage&transaction=${p}&secretPhrase=${recordTable.passphrase}`;
            axios.get(thisUrl)
              .then((response) => {
                try {
                  const decriptedPending = JSON.parse(response.data.decryptedMessage);
                  decryptedPendings.push(decriptedPending);
                } catch (e) {
                  console.log(e);
                }
                recordCounter += 1;

                if (recordCounter === pendingNumber) {
                  eventEmitter.emit('set_responseData');
                }
              })
              .catch((error) => {
                reject(error);
              });
          });
        } else {
          eventEmitter.emit('set_responseData');
        }
      });

      eventEmitter.on('records_retrieved', () => {
        if (Object.keys(records).length <= 0) {
          eventEmitter.emit('check_on_pending');
        } else {
          let recordCounter = 0;
          records.forEach((p) => {
            const thisUrl = `${self.jupiter_data.server}/nxt?requestType=readMessage&transaction=${p}&secretPhrase=${recordTable.passphrase}`;
            axios.get(thisUrl)
              .then((response) => {
                try {
                  // This decrypts the message from the blockchain using native encryption
                  // as well as the encryption based on encryption variable
                  const decrypted = JSON.parse(self.decrypt(response.data.decryptedMessage));
                  decryptedRecords.push(decrypted);
                } catch (e) {
                  console.log(e);
                }
                recordCounter += 1;

                if (recordCounter === completedNumber) {
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
        /* Object.keys(tableData).some((position) => {
          const obj = tableData[position];
          let completion = false;
          if (obj.attachment.encryptedMessage.data && obj.recipientRS !== recordTable.address) {
            if (scope.show_pending && scope.show_pending > 0) {
              if (obj.confirmations <= scope.show_pending) {
                pendingRecords.push(obj.transaction);
                pendingNumber += 1;
              } else {
                records.push(obj.transaction);
                completedNumber += 1;
              }
            } else if (scope.size === 'all') {
              records.push(obj.transaction);
              completedNumber += 1;
            } else if (scope.size === 'last') {
              records.push(obj.transaction);
              recordsFound += 1;
              completedNumber += 1;
              completion = true;
            }
            recordsFound += 1;
          }
          return completion;
        }); */

        for (let position = 0; position < Object.keys(tableData).length; position += 1) {
          const obj = tableData[position];
          let completion = false;
          if (obj.attachment.encryptedMessage.data && obj.recipientRS !== recordTable.address) {
            if (scope.show_pending && scope.show_pending > 0) {
              if (obj.confirmations <= scope.show_pending) {
                pendingRecords.push(obj.transaction);
                pendingNumber += 1;
              } else {
                records.push(obj.transaction);
                completedNumber += 1;
              }
            } else if (scope.size === 'all') {
              records.push(obj.transaction);
              completedNumber += 1;
            } else if (scope.size === 'last') {
              records.push(obj.transaction);
              recordsFound += 1;
              completedNumber += 1;
              completion = true;
            }
            recordsFound += 1;
          }
          if (completion) {
            break;
          }
        }
        eventEmitter.emit('records_retrieved');
      });

      eventEmitter.on('table_access_retrieved', () => {
        axios.get(`${self.jupiter_data.server}/nxt?requestType=getBlockchainTransactions&account=${recordTable.address}&withMessage=true&type=1`)
          .then((response) => {
            tableData = response.data.transactions;
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
              recordTable = database[x][table];
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
      const decryptedRecords = [];
      let responseData;
      let database;
      let recordTable;
      let tableData;
      let completedNumber = 0;
      let recordsFound = 0;

      if (account === process.env.APP_ACCOUNT_ADDRESS) {
        const userObject = {
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
        resolve({ user: JSON.stringify(userObject) });
      } else {
        eventEmitter.on('set_responseData', () => {
          if (decryptedRecords[0] === undefined
            || decryptedRecords[0].user_record === undefined) {
            resolve({ error: true, message: 'Account not on file!' });
          } else {
            responseData = { recordsFound, user: decryptedRecords[0].user_record };
            resolve(responseData);
          }
        });

        eventEmitter.on('check_on_pending', () => {
          eventEmitter.emit('set_responseData');
        });

        eventEmitter.on('records_retrieved', () => {
          if (Object.keys(records).length <= 0) {
            eventEmitter.emit('check_on_pending');
          } else {
            let recordCounter = 0;
            records.forEach((p) => {
              const thisUrl = `${self.jupiter_data.server}/nxt?requestType=readMessage&transaction=${p}&secretPhrase=${passphrase}`;

              axios.get(thisUrl)
                .then((response) => {
                  try {
                    // This decrypts the message from the blockchain using native encryption
                    // as well as the encryption based on encryption variable
                    const decrypted = JSON.parse(self.decrypt(response.data.decryptedMessage));
                    decryptedRecords.push(decrypted);
                  } catch (e) {
                    console.log(e);
                  }
                  recordCounter += 1;

                  if (recordCounter === completedNumber) {
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
          Object.keys(tableData).some((position) => {
            const obj = tableData[position];
            let completion = false;
            if (obj.attachment.encryptedMessage.data && obj.recipientRS === account) {
              records.push(obj.transaction);
              recordsFound += 1;
              completedNumber += 1;
              completion = true;
            }
            return completion;
          });
          eventEmitter.emit('records_retrieved');
        });

        eventEmitter.on('table_access_retrieved', () => {
          axios.get(`${self.jupiter_data.server}/nxt?requestType=getBlockchainTransactions&account=${recordTable.address}&withMessage=true&type=1`)
            .then((response) => {
              tableData = response.data.transactions;
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
                recordTable = database[x].users;
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
    const sameId = [];
    let allRecords = [];

    return new Promise((resolve, reject) => {
      const Record = require(`../models/${model}`);
      const record = new Record({ id: null });

      eventEmitter.on('records_retrieved', () => {
        // let userAddress;
        /* Object.keys(allRecords).forEach((x) => {
          if (allRecords[x].id && allRecords[x].id === id) {
            sameId.push(JSON.parse(allRecords[x][`${model}_record`]));
          }
        }); */

        for (let x = 0; x < Object.keys(allRecords).length; x += 1) {
          if (allRecords[x].id && allRecords[x].id === id) {
            sameId.push(JSON.parse(allRecords[x][`${model}_record`]));
          }
        }
        self.sortByDate(sameId);
        resolve({ success: true, record: sameId[0] });
      });

      self.getAllRecords(record.table)
        .then((response) => {
          allRecords = response.records;
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
    let terminalCalled = false;
    let addressOwner;
    let server;

    if (address === 'undefined') {
      if (process.env.JUPITERSERVER === undefined || process.env.JUPITERSERVER == null) {
        const gravity = require('../.gravity.js');
        addressOwner = gravity.APP_ACCOUNT;
        server = gravity.JUPITERSERVER;
        terminalCalled = true;
      } else {
        addressOwner = process.env.APP_ACCOUNT;
        server = process.env.JUPITERSERVER;
      }
    } else if (process.env.JUPITERSERVER === undefined || process.env.JUPITERSERVER == null) {
      const gravity = require('../.gravity.js');
      addressOwner = address;
      server = gravity.JUPITERSERVER;
      terminalCalled = true;
    } else {
      addressOwner = address;
      server = process.env.JUPITERSERVER;
    }

    return new Promise((resolve, reject) => {
      eventEmitter.on('account_retrieved', () => {
        axios.post(`${server}/nxt?requestType=getBalance&account=${account}`)
          .then((response) => {
            if (response.data.errorDescription) {
              reject(response.data);
            } else {
              if (terminalCalled) {
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

              const responseData = {
                minimumAppBalance,
                minimumTableBalance,
                balance: response.data.balanceNQT,
                minAppBalanceAmount: self.jupiter_data.minimumAppBalance,
                minTableBalanceAmount: self.jupiter_data.minimumTableBalance,
              };
              resolve(responseData);
            }
          })
          .catch((error) => {
            console.log(error);
            reject({ success: false, message: 'There was an error obtaining account Jupiter balance' });
          });
      });

      axios.get(`${server}/nxt?requestType=getAccountId&secretPhrase=${addressOwner}`)
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

  sendMoney(recipient, transferAmount = null, sender = this.sender) {
    // This is the variable that will be used to send Jupiter from the app address to the address
    // that will be used as a database table or will serve a purpose in the Gravity infrastructure
    const feeNQT = 100;
    const tableCreation = 500 + 250;
    let amount = transferAmount;
    let senderAddress;
    let server;

    if (amount == null) {
      amount = this.jupiter_data.minimumTableBalance - feeNQT - tableCreation;
    }

    if (this.sender == null || this.sender === undefined) {
      const gravity = require('../.gravity.js');
      senderAddress = gravity.APP_ACCOUNT;
      server = gravity.JUPITERSERVER;
    } else {
      senderAddress = sender;
      server = process.env.JUPITERSERVER;
    }

    return new Promise((resolve, reject) => {
      axios.post(`${server}/nxt?requestType=sendMoney&secretPhrase=${senderAddress}&recipient=${recipient}&amountNQT=${amount}&feeNQT=${feeNQT}&deadline=60`)
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

  createRecord(modelName, data, originalAttributes) {
    const eventEmitter = new events.EventEmitter();
    const self = this;

    return new Promise((resolve, reject) => {
      const RecordClass = require(`../models/${modelName}`);
      const newRecord = new RecordClass(originalAttributes);
      let jupAccount;
      // let model_address;
      let modelPassphrase;
      let recordName;
      const attributes = originalAttributes;

      eventEmitter.on('address_verification', () => {
        let callUrl;
        // If there are no errors, rest of the code is executed
        if (newRecord.verify().errors === false) {
          recordName = `${modelName}_record`;
          attributes.date = Date.now();
          const record = {
            [recordName]: attributes,
          };

          if (data.public_key != null) {
            callUrl = `${self.jupiter_data.server}/nxt?requestType=sendMessage&secretPhrase=${modelPassphrase}&recipient=${jupAccount}&messageToEncrypt=${JSON.stringify(record)}&feeNQT=${self.jupiter_data.feeNQT}&deadline=${self.jupiter_data.deadline}&recipientPublicKey=${data.public_key}&compressMessageToEncrypt=true`;
          } else {
            callUrl = `${self.jupiter_data.server}/nxt?requestType=sendMessage&secretPhrase=${modelPassphrase}&recipient=${jupAccount}&messageToEncrypt=${JSON.stringify(record)}&feeNQT=${self.jupiter_data.feeNQT}&deadline=${self.jupiter_data.deadline}&compressMessageToEncrypt=true`;
          }

          axios.post(callUrl)
            .then((response) => {
              if (response.data.broadcasted != null && response.data.broadcasted === true) {
                resolve({
                  data,
                  success: true,
                  message: `${modelName} record saved`,
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
            [modelName]: attributes,
            validations: newRecord.verify(),
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
          modelPassphrase = process.env.BOOK_RECORD;
          jupAccount = data.address;
          eventEmitter.emit('address_verification');
        }
      });
    });
  }

  createNewAddress(passphrase) {
    const self = this;
    return new Promise((resolve, reject) => {
      axios.get(`${self.jupiter_data.server}/nxt?requestType=getAccountId&secretPhrase=${passphrase}`)
        .then((response) => {
          const address = response.data.accountRS;
          resolve({ address, publicKey: response.data.publicKey, success: true });
        })
        .catch((error) => {
          console.log(error);
          console.log('There was an error in address creation');
          reject({ success: false, message: 'There was an error creating a new Jupiter address' });
        });
    });
  }

  getAccountInformation(passphrase) {
    const self = this;
    return new Promise((resolve, reject) => {
      axios.get(`${self.jupiter_data.server}/nxt?requestType=getAccountId&secretPhrase=${passphrase}`)
        .then((response) => {
          const address = response.data.accountRS;
          resolve({ address, publicKey: response.data.publicKey, success: true });
        })
        .catch((error) => {
          console.log(error);
          console.log('There was an error in address creation');
          reject({ success: false, message: 'There was an error in getting account information' });
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
    const encryptedData = JSON.stringify(records);
    console.log(records);
    console.log(encryptedData);
    console.log(this.encrypt(encryptedData));
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
    let tableList = [];
    // let app;
    let tableName;
    let address;
    let passphrase;
    // let current_tables;
    let record;
    let tableListRecord;
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
            console.log(`Table ${tableName} funded with JUP.`);
            rl.close();
            resolve({
              success: true,
              message: `Table ${tableName} pushed to the blockchain and funded.`,
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
        const encryptedData = self.encrypt(JSON.stringify(record));
        const encryptedTableData = self.encrypt(JSON.stringify(tableListRecord));
        // var decrypted_data = self.decrypt(encryptedData);
        // console.log(decrypted_data);
        // console.log(JSON.parse(decrypted_data));

        const callUrl = `${self.jupiter_data.server}/nxt?requestType=sendMessage&secretPhrase=${gravity.APP_ACCOUNT}&recipient=${gravity.APP_ACCOUNT_ADDRESS}&messageToEncrypt=${encryptedData}&feeNQT=${self.jupiter_data.feeNQT}&deadline=${self.jupiter_data.deadline}&recipientPublicKey=${gravity.APP_PUBLIC_KEY}&compressMessageToEncrypt=true`;


        axios.post(callUrl)
          .then((response) => {
            if (response.data.broadcasted != null && response.data.broadcasted === true) {
              console.log(`Table ${tableName} pushed to the blockchain and linked to your account.`);
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

        const tableListUpdateUrl = `${self.jupiter_data.server}/nxt?requestType=sendMessage&secretPhrase=${gravity.APP_ACCOUNT}&recipient=${gravity.APP_ACCOUNT_ADDRESS}&messageToEncrypt=${encryptedTableData}&feeNQT=${(self.jupiter_data.feeNQT / 2)}&deadline=${self.jupiter_data.deadline}&recipientPublicKey=${gravity.APP_PUBLIC_KEY}&compressMessageToEncrypt=true`;

        axios.post(tableListUpdateUrl)
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
              console.log(encryptedTableData);
            }
          })
          .catch((error) => {
            console.log('There was an error in updating table list');
            console.log(error);
            console.log(encryptedTableData);
          });
      });

      eventEmitter.on('tableName_obtained', () => {
        if (self.tables.indexOf(tableName) >= 0) {
          console.log(`Error: Unable to save table. ${tableName} is already in the database`);
          rl.close();
        } else {
          passphrase = self.generate_passphrase();

          self.createNewAddress(passphrase)
            .then((response) => {
              if (response.success === true && response.address.length > 0) {
                ({ address } = response);
                record = {
                  [tableName]: {
                    address,
                    passphrase,
                    public_key: response.public_key,
                  },
                };
                tableList.push(tableName);
                tableListRecord = {
                  tables: tableList,
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
                tableList = [];
              } else {
                tableList = response.tables;
              }

              console.log('You are about to create a new database table for your Gravity app.');
              console.log('The following tables are already linked to your database:');
              console.log(tableList);
              rl.question('What will be the name of your new table?\n', (answer) => {
                tableName = answer;
                eventEmitter.emit('tableName_obtained');
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
          const currentData = {
            'Name of the app': appname,
            'Password  for encryption': password,
            'Jupiter Server': server,
          };
          console.log('Please verify the data you entered:');
          console.log(currentData);
          console.log('');
          rl.question("You are about to create a Jupiter account which will hold your Gravity app's data. Is the information provided above accurate? If so, press ENTER. If not, press CTRL+C to cancel and rerun command.\n", () => {
            passphrase = methods.generate_passphrase();

            axios.get(`${server}/nxt?requestType=getAccountId&secretPhrase=${passphrase}`)
              .then((response) => {
                const address = response.data.accountRS;
                const { publicKey } = response.data;

                if (address) {
                  const configuration = {
                    APPNAME: appname,
                    JUPITERSERVER: server,
                    APP_ACCOUNT: passphrase,
                    APP_ACCOUNT_ADDRESS: address,
                    APP_PUBLIC_KEY: publicKey,
                    ENCRYPT_ALGORITHM: 'aes-128-cbc',
                    ENCRYPT_PASSWORD: password,
                    APP_ACCOUNT_ID: publicKey,
                  };
                  const envVariables = configuration;
                  let envVariablesInString = '';
                  envVariables.SESSION_SECRET = 'session_secret_key_here';

                  const fs = require('fs');

                  // We prepare the string that will be used to create the .gravity file
                  const objectInString = `module.exports=${JSON.stringify(configuration)}`;
                  const moduleInString = objectInString.replace(/={/g, '={\n').replace(/","/g, '",\n"').replace(/"}/g, '"\n}');

                  // We prepare the string that will be used to create the .env file
                  Object.keys(envVariables).forEach((key) => {
                    envVariablesInString = `${envVariablesInString + key.toUpperCase()}='${envVariables[key]}'\n`;
                  });

                  fs.writeFile('.gravity.js', moduleInString, (err) => {
                    if (err) {
                      return console.log(err);
                    }
                    fs.writeFile('.env', envVariablesInString, (error) => {
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


module.exports = {
  gravity: new Gravity(),
};
