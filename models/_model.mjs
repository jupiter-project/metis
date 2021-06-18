import axios from 'axios';
import events from 'events';
import { gravity } from '../config/gravity.cjs';
import validate from './_validations.js';
import config from '../config.js';

// const logger = require('../utils/logger')(module);
import logger from '../utils/logger.js';

export default class Model {
  constructor(data, accessData = null) {
    // Default values of model
    this.id = null;
    this.record = {};
    this.model = data.model;
    this.table = data.table;
    this.dataLink = `${data.model}_record`;
    this.model_params = data.model_params;
    this.data = data.data;
    this.validation_rules = [];
    this.prunableOnCreate = data.prunableOnCreate;
    this.hasDatabase = data.hasDatabase;
    this.record = this.setRecord();
    this.database = data.accessPass ? data.accessPass.database : {};
    this.belongsTo = data.belongsTo;
    this.accessData = accessData;
  }

  setRecord() {
    const record = {};
    const self = this;

    for (let x = 0; x < Object.keys(self.model_params).length; x += 1) {
      const key = self.model_params[x];
      if (record[key] === undefined) {
        record[key] = self.data[key];
      }
    }

    self.id = record.id;
    self.record.date = Date.now();

    if (self.model === 'user') {
      self.user = { id: self.id, api_key: self.record.api_key, public_key: self.data.public_key };
    } else {
      self.user = {
        id: self.data.user_id,
        api_key: self.data.user_api_key,
        public_key: self.data.public_key,
        address: self.data.user_address,
      };
    }
    return record;
  }

  generateId(table) {
    const self = this;
    const eventEmitter = new events.EventEmitter();

    return new Promise((resolve, reject) => {
      let callUrl;

      eventEmitter.on('data_prepared', () => {
        axios.post(callUrl)
          .then((response) => {
            if (response.data.broadcasted != null && response.data.broadcasted === true) {
              self.id = response.data.transaction;
              self.record.id = self.id;
              self.data.id = response.data.transaction;
              self.record = self.setRecord();

              resolve({ success: true, message: 'Id generated', id: response.data.transaction });
            } else if (response.data.errorDescription != null) {
              reject(response.data.errorDescription);
            } else {
              reject('There was an error generating Id for record');
            }
          })
          .catch((error) => {
            logger.error(error);
            reject(error.response);
          });
      });

      if (table.public_key) {
        callUrl = `${gravity.jupiter_data.server}/nxt?requestType=sendMessage&secretPhrase=${table.passphrase}&recipient=${table.address}&messageToEncrypt=${'Generating Id for record'}&feeNQT=${100}&deadline=${gravity.jupiter_data.deadline}&recipientPublicKey=${table.public_key}&compressMessageToEncrypt=true&encryptedMessageIsPrunable=true`;
        eventEmitter.emit('data_prepared');
      } else {
        gravity.getAccountInformation(table.passphrase)
          .then((response) => {
            const { publicKey } = response;
            callUrl = `${gravity.jupiter_data.server}/nxt?requestType=sendMessage&secretPhrase=${table.passphrase}&recipient=${table.address}&messageToEncrypt=${'Generating Id for record'}&feeNQT=${100}&deadline=${gravity.jupiter_data.deadline}&recipientPublicKey=${publicKey}&compressMessageToEncrypt=true&encryptedMessageIsPrunable=true`;
            eventEmitter.emit('data_prepared');
          })
          .catch((error) => {
            logger.error(error);
            reject(error.response);
          });
      }
    });
  }

  verify() {
    const self = this;
    let totalErrors = [];
    let errorFound = false;

    for (let x = 0; x < Object.keys(self.validation_rules).length; x += 1) {
      const rule = self.validation_rules[x];
      const validation = validate.validate_model(rule.attribute_name, rule.validate, rule.rules);

      if (validation.error === true) {
        errorFound = true;
        totalErrors.push(validation.messages);
        totalErrors = Array.prototype.concat.apply([], totalErrors);
      }
    }
    return ({ errors: errorFound, messages: totalErrors });
  }

  loadTable(accessLink = false) {
    const self = this;
    return new Promise((resolve, reject) => {
      gravity.loadAppData(accessLink)
        .then((response) => {
          const { tables } = response.app;

          for (let x = 0; x < Object.keys(tables).length; x += 1) {
            if (tables[x][self.table] !== undefined) {
              const recordTable = tables[x][self.table];
              resolve(recordTable);
              break;
            }
          }
          reject('Table could not be found');
        })
        .catch((error) => {
          logger.error(error);
          reject(error);
        });
    });
  }

  getAllVersions() {
    const self = this;
    const recordList = [];
    let createdAt;

    return new Promise((resolve, reject) => {
      gravity.getAllRecords(self.table)
        .then((response) => {
          const { records } = response;

          for (let x = 0; x < Object.keys(records).length; x += 1) {
            const thisRecord = records[x];
            if (thisRecord.id === self.id) {
              const recordRecord = JSON.parse(thisRecord[`${self.model}_record`]);
              recordRecord.date = thisRecord.date;

              thisRecord[`${self.model}_record`] = recordRecord;
              recordList.push(recordRecord);
            }
          }

          gravity.sortByDate(recordList);

          createdAt = recordList[recordList.length - 1]
            ? recordList[recordList.length - 1].date : null;

          resolve({
            id: self.id,
            versions: recordList,
            date: createdAt,
          });
        })
        .catch((error) => {
          logger.error(error);
          reject(error);
        });
    });
  }

  last() {
    const self = this;

    return new Promise((resolve, reject) => {
      self.getAllVersions()
        .then((res) => {
          resolve({
            id: res.id,
            record: res.versions[0],
            date: res.date,
          });
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  findById() {
    const self = this;
    return new Promise((resolve, reject) => {
      self.last()
        .then((res) => {
          const { record } = res;
          self.record = record;
          resolve(true);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  validateRequest() {
    const self = this;
    return new Promise((resolve, reject) => {
      if (self.model === 'user') {
        resolve({ success: true, isUserRecord: true });
      } else if (self.user && self.user.id) {
        const User = require('./user.mjs');

        gravity.findById(self.user.id, 'user')
          .then((response) => {
            const user = new User(response.record);
            resolve({ user, success: true, isUserRecord: true });
          })
          .catch((err) => {
            logger.error(err);
            reject({ success: false, errors: 'There was an error in authentication of request/user validation' });
          });
      } else {
        reject({ success: false, errors: 'There was an error in authentication of request/user validation' });
      }
    });
  }

  loadRecords(accessData = false) {
    const self = this;
    const eventEmitter = new events.EventEmitter();
    const finalList = [];
    let tableData;
    let user;

    return new Promise((resolve, reject) => {
      eventEmitter.on('tableData_loaded', () => {
        gravity.getRecords(
          user.record.account,
          tableData.address,
          tableData.passphrase,
          {
            accessData,
            size: 'all',
            show_pending: null,
            show_unconfirmed: true,
          },
        )
          .then((res) => {
            const { records } = res;
            const recordsBreakdown = {};
            for (let x = 0; x < Object.keys(records).length; x += 1) {
              const thisRecord = records[x];
              if (thisRecord.id) {
                if (recordsBreakdown[thisRecord.id] === undefined) {
                  recordsBreakdown[thisRecord.id] = {
                    versions: [],
                    date_first_record: '',
                  };
                }

                const data = JSON.parse(thisRecord[`${self.model}_record`]);
                data.date = thisRecord.date;
                data.confirmed = thisRecord.confirmed;
                recordsBreakdown[thisRecord.id].versions.push(data);
              }
            }
            const ids = Object.keys(recordsBreakdown);

            for (let z = 0; z < ids.length; z += 1) {
              const id = ids[z];
              // console.log(recordsBreakdown[id]);
              gravity.sortByDate(recordsBreakdown[id].versions);
              const thisRecords = recordsBreakdown[id].versions;
              const lastRecord = thisRecords.length - 1;
              // console.log(thisRecords[0]);
              // console.log(thisRecords[lastRecord]);
              const createdAt = thisRecords[lastRecord].date;
              finalList.push({
                id,
                [`${self.model}_record`]: thisRecords[0],
                date: createdAt,
              });
            }
            // console.log(finalList);

            resolve({ success: true, records: finalList, records_found: finalList.length });
          })
          .catch((err) => {
            reject(err);
          });
      });

      eventEmitter.on('verified_request', () => {
        if ((self.user && self.user.api_key === user.record.api_key) || accessData) {
          self.loadTable(accessData)
            .then((res) => {
              tableData = res;
              eventEmitter.emit('tableData_loaded');
            })
            .catch((err) => {
              logger.error(err);
              reject(err);
            });
        } else {
          reject({ success: false, errors: 'Incorrect api key' });
        }
      });

      if (self.model === 'user') {
        eventEmitter.emit('verified_request');
      } else if (accessData) {
        user = {
          record: {
            account: accessData.account,
          },
        };

        eventEmitter.emit('verified_request');
      } else if (self.user && self.user.id) {
        const User = require('./user.mjs');

        gravity.findById(self.user.id, 'user')
          .then((response) => {
            user = new User(response.record);
            eventEmitter.emit('verified_request');
          })
          .catch((err) => {
            logger.error(err);
            reject({ success: false, errors: 'There was an error in authentication of request/user validation' });
          });
      } else {
        reject({ success: false, errors: 'There was an error in authentication of request/user validation' });
      }
    });
  }

  create(accessLink = false) {
    const self = this;
    const eventEmitter = new events.EventEmitter();
    let recordTable;
    let user;

    // console.log('Access link in create model method');

    return new Promise((resolve, reject) => {
      if (self.verify().errors === true) {
        reject({ false: false, verification_error: true, errors: self.verify().messages });
      } else {
        eventEmitter.on('id_generated', () => {
          const stringifiedRecord = JSON.stringify(self.record);

          const fullRecord = {
            id: self.record.id,
            [`${self.model}_record`]: stringifiedRecord,
            date: Date.now(),
          };

          let encryptedRecord;
          if (accessLink && accessLink.encryptionPassword) {
            encryptedRecord = gravity.encrypt(
              JSON.stringify(fullRecord),
              accessLink.encryptionPassword,
            );
          } else {
            encryptedRecord = gravity.encrypt(JSON.stringify(fullRecord));
          }

          let callUrl;


          if (self.model === 'user') {
            if (self.prunableOnCreate) {
              logger.info('Record is prunable');
              callUrl = `${gravity.jupiter_data.server}/nxt?requestType=sendMessage&secretPhrase=${recordTable.passphrase}&recipient=${self.record.account}&messageToEncrypt=${encryptedRecord}&feeNQT=${gravity.jupiter_data.feeNqt}&deadline=${gravity.jupiter_data.deadline}&recipientPublicKey=${self.data.public_key}&encryptedMessageIsPrunable=true&compressMessageToEncrypt=true`;
            } else {
              callUrl = `${gravity.jupiter_data.server}/nxt?requestType=sendMessage&secretPhrase=${recordTable.passphrase}&recipient=${self.record.account}&messageToEncrypt=${encryptedRecord}&feeNQT=${gravity.jupiter_data.feeNqt}&deadline=${gravity.jupiter_data.deadline}&recipientPublicKey=${self.data.public_key}&compressMessageToEncrypt=true`;
            }
          } else if (self.user) {
            // console.log('Non user call url');
            callUrl = `${gravity.jupiter_data.server}/nxt?requestType=sendMessage&secretPhrase=${recordTable.passphrase}&recipient=${self.user.address}&messageToEncrypt=${encryptedRecord}&feeNQT=${gravity.jupiter_data.feeNqt}&deadline=${gravity.jupiter_data.deadline}&recipientPublicKey=${self.user.public_key}&compressMessageToEncrypt=true`;
          } else {
            callUrl = `${gravity.jupiter_data.server}/nxt?requestType=sendMessage&secretPhrase=${recordTable.passphrase}&recipient=${recordTable.address}&messageToEncrypt=${encryptedRecord}&feeNQT=${gravity.jupiter_data.feeNqt}&deadline=${gravity.jupiter_data.deadline}&recipientPublicKey=${recordTable.public_key}&compressMessageToEncrypt=true`;
          }
          // console.log(callUrl)
          // console.log(self);
          axios.post(callUrl)
            .then((response) => {
              // console.log(response)
              if (response.data.broadcasted && response.data.broadcasted === true) {
                resolve({ success: true, message: 'Record created' });
              } else if (response.data.errorDescription != null) {
                reject({ success: false, errors: response.data.errorDescription });
              } else {
                reject({ success: false, errors: 'Unable to save data in blockchain' });
              }
            })
            .catch((error) => {
              reject({ success: false, errors: error });
            });
        });
        eventEmitter.on('table_loaded', () => {
          self.generateId(recordTable)
            .then(() => {
              if (self.record.id === undefined) {
                reject({ success: false, errors: 'Id for model was not generated' });
              }
              eventEmitter.emit('id_generated');
            })
            .catch((err) => {
              logger.error(err);
              reject({ success: false, errors: err });
            });
        });
        eventEmitter.on('request_authenticated', () => {
          self.loadTable(accessLink)
            .then((res) => {
              recordTable = res;
              eventEmitter.emit('table_loaded');
            })
            .catch((err) => {
              reject({ success: false, errors: err });
            });
        });

        eventEmitter.on('authenticate_user_request', () => {
          if (user.record.api_key === self.user.api_key) {
            eventEmitter.emit('request_authenticated');
          } else {
            resolve({ success: false, errors: 'Wrong user api key in request' });
          }
        });

        if (self.model === 'user') {
          eventEmitter.emit('request_authenticated');
        } else if (accessLink) {
          eventEmitter.emit('request_authenticated');
        } else if (
          (self.user.id === config.app.accountId
          && self.user.api_key !== undefined)
          || (self.appTable)
        ) {
          const User = require('./user.mjs');

          user = new User({
            id: config.app.accountId,
            account: config.app.accountAddress,
            email: config.app.owner.email,
            public_key: config.app.publicKey,
            api_key: config.app.apiKey || undefined,
          });
          eventEmitter.emit('authenticate_user_request');
        } else if (self.user && self.user.id) {
          const User = require('./user.mjs');
          gravity.findById(self.user.id, 'user')
            .then((response) => {
              // console.log(user);
              user = new User(response.record);
              // console.log(user.record)
              // console.log(self)
              eventEmitter.emit('authenticate_user_request');
            })
            .catch((err) => {
              logger.error(err);
              reject({ success: false, errors: 'There was an error in authentication of request/user validation' });
            });
        } else {
          // eventEmitter.emit('request_authenticated');
          reject({ success: false, errors: 'There was an error in authentication of request/user validation' });
        }
      }
    });
  }

  async save(userData, tableData) {
    const self = this;
    const stringifiedRecord = JSON.stringify(self.record);

    const fullRecord = {
      id: self.record.id,
      [`${self.model}_record`]: stringifiedRecord,
      date: Date.now(),
    };
    const encryptedRecord = gravity.encrypt(
      JSON.stringify(fullRecord), userData.encryptionPassword,
    );

    let recipientPublicKey = tableData.publicKey;

    if (!recipientPublicKey) {
      let publicKeyRetrieval;
      try {
        publicKeyRetrieval = await gravity.getAccountInformation(tableData.passphrase);
      } catch (e) {
        publicKeyRetrieval = { error: true, fullError: e };
      }
      if (publicKeyRetrieval.error) {
        return publicKeyRetrieval;
      }

      recipientPublicKey = publicKeyRetrieval.publicKey;
    }

    const callUrl = `${gravity.jupiter_data.server}/nxt?requestType=sendMessage&secretPhrase=${userData.passphrase}&recipient=${tableData.address}&messageToEncrypt=${encryptedRecord}&feeNQT=${gravity.jupiter_data.feeNqt}&deadline=${gravity.jupiter_data.deadline}&recipientPublicKey=${recipientPublicKey}&compressMessageToEncrypt=true`;

    let response;

    try {
      response = await axios.post(callUrl);
    } catch (e) {
      response = { error: true, errors: e };
    }

    if (response.error) {
      return response;
    }

    if (response.data.broadcasted && response.data.broadcasted === true) {
      return ({ success: true, message: 'Record saved!' });
    }
    if (response.data.errorDescription != null) {
      return ({ success: false, errors: response.data.errorDescription });
    }
    return ({ success: false, errors: 'Unable to save data in blockchain' });
  }

  update() {
    const self = this;
    const eventEmitter = new events.EventEmitter();
    let recordTable;
    let user;

    return new Promise((resolve, reject) => {
      if (self.verify().errors === true) {
        reject({ false: false, verification_error: true, errors: self.verify().messages });
      } else {
        eventEmitter.on('id_verified', () => {
          const stringifiedRecord = JSON.stringify(self.record);
          const fullRecord = {
            id: self.record.id,
            [`${self.model}_record`]: stringifiedRecord,
            date: Date.now(),
          };
          const encryptedRecord = gravity.encrypt(JSON.stringify(fullRecord));
          let callUrl;
          if (self.model === 'user') {
            callUrl = `${gravity.jupiter_data.server}/nxt?requestType=sendMessage&secretPhrase=${recordTable.passphrase}&recipient=${self.record.account}&messageToEncrypt=${encryptedRecord}&feeNQT=${gravity.jupiter_data.feeNqt}&deadline=${gravity.jupiter_data.deadline}&recipientPublicKey=${self.data.public_key}&compressMessageToEncrypt=true`;
          } else if (self.user) {
            callUrl = `${gravity.jupiter_data.server}/nxt?requestType=sendMessage&secretPhrase=${recordTable.passphrase}&recipient=${self.user.address}&messageToEncrypt=${encryptedRecord}&feeNQT=${gravity.jupiter_data.feeNqt}&deadline=${gravity.jupiter_data.deadline}&recipientPublicKey=${self.user.public_key}&compressMessageToEncrypt=true`;
          } else {
            callUrl = `${gravity.jupiter_data.server}/nxt?requestType=sendMessage&secretPhrase=${recordTable.passphrase}&recipient=${recordTable.address}&messageToEncrypt=${encryptedRecord}&feeNQT=${gravity.jupiter_data.feeNqt}&deadline=${gravity.jupiter_data.deadline}&recipientPublicKey=${recordTable.public_key}&compressMessageToEncrypt=true`;
          }
          // console.log(callUrl);
          // console.log(self);
          axios.post(callUrl)
            .then((response) => {
              // console.log(response);
              if (response.data.broadcasted && response.data.broadcasted === true) {
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
        });

        eventEmitter.on('table_loaded', () => {
          if (self.record.id === undefined) {
            reject({ success: false, errors: 'Cannot update. Id is missing from  data.' });
          }
          eventEmitter.emit('id_verified');
        });

        eventEmitter.on('request_authenticated', () => {
          self.loadTable()
            .then((res) => {
              recordTable = res;
              eventEmitter.emit('table_loaded');
            })
            .catch((err) => {
              reject({ success: false, errors: err });
            });
        });

        eventEmitter.on('authenticate_user_request', () => {
          if (user.record.api_key === self.user.api_key) {
            eventEmitter.emit('request_authenticated');
          } else {
            resolve({ success: false, errors: 'Wrong user api key in request' });
          }
        });


        if (self.model === 'user') {
          eventEmitter.emit('request_authenticated');
        } else if (self.user && self.user.id) {
          const User = require('./user.mjs');

          gravity.findById(self.user.id, 'user')
            .then((response) => {
              user = new User(response.record);
              // console.log(user.record)
              // console.log(self)
              eventEmitter.emit('authenticate_user_request');
            })
            .catch((err) => {
              logger.error(err);
              reject({ success: false, errors: 'There was an error in authentication of request/user validation' });
            });
        } else {
          // eventEmitter.emit('request_authenticated');
          reject({ success: false, errors: 'There was an error in authentication of request/user validation' });
        }
      }
    });
  }


  findAll() {
    const self = this;
    let containedData;
    if (self.containedDatabase) {
      containedData = {
        address: self.data.account,
        accessPass: self.accessPass,
      };
    }
    const scope = {
      size: 'all',
      containedDatabase: self.hasDatabase ? containedData : null,
    };

    return new Promise((resolve, reject) => {
      gravity.getAllRecords(self.table, scope)
        .then((response) => {
          const { records } = response;
          const collection = {};
          const collectionList = [];

          for (let x = 0; x < Object.keys(records).length; x += 1) {
            const thisRecord = records[x];
            let recordRecord;

            if (collection[thisRecord.id] === undefined) {
              recordRecord = JSON.parse(thisRecord[`${self.model}_record`]);
              recordRecord.date = thisRecord.date;
              recordRecord.confirmed = thisRecord.confirmed;
              recordRecord.user = thisRecord.user;
              recordRecord.user_public_key = thisRecord.public_key;

              collection[thisRecord.id] = {
                id: thisRecord.id,
                versions: [recordRecord],
              };
            } else {
              recordRecord = JSON.parse(thisRecord[`${self.model}_record`]);
              recordRecord.date = thisRecord.date;
              recordRecord.confirmed = thisRecord.confirmed;
              recordRecord.user = thisRecord.user;
              recordRecord.user_public_key = thisRecord.public_key;

              thisRecord[`${self.model}_record`] = recordRecord;
              collection[thisRecord.id].versions.push(recordRecord);
            }
          }

          const collectionIds = Object.keys(collection);

          for (let key = 0; key < collectionIds.length; key += 1) {
            const thisKey = collectionIds[key];
            const dataObject = collection[thisKey];
            // This sorts dates in versions, assigns date to overall record and pushes to final list
            gravity.sortByDate(dataObject.versions);
            dataObject.date = dataObject.versions[dataObject.versions.length - 1].date;
            collectionList.push(dataObject);
          }
          // This sorts final list by last update
          gravity.sortByDate(collectionList);
          resolve({ success: true, records: collectionList, params: self.model_params });
        })
        .catch((error) => {
          logger.error(error);
          reject({ success: false, errors: error });
        });
    });
  }
}

// module.exports = Model;
