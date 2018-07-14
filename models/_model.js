import axios from 'axios';
import events from 'events';
import gravity from '../config/gravity';
import validate from './_validations';

class Model {
  constructor(data) {
    // Default values of model
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

    return new Promise((resolve, reject) => {
      const call_url = `${gravity.jupiter_data.server}/nxt?requestType=sendMessage&secretPhrase=${table.passphrase}&recipient=${table.address}&messageToEncrypt=${'Generating Id for record'}&feeNQT=${100}&deadline=${gravity.jupiter_data.deadline}&recipientPublicKey=${table.public_key}&compressMessageToEncrypt=true&encryptedMessageIsPrunable=true`;

      axios.post(call_url)
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
          console.log(error);
          reject(error.response);
        });
    });
  }

  verify() {
    const self = this;
    let total_errors = [];
    let error_found = false;

    for (let x = 0; x < Object.keys(self.validation_rules).length; x += 1) {
      const rule = self.validation_rules[x];
      const validation = validate.validate_model(rule.attribute_name, rule.validate, rule.rules);

      if (validation.error === true) {
        error_found = true;
        total_errors.push(validation.messages);
        total_errors = Array.prototype.concat.apply([], total_errors);
      }
    }
    return ({ errors: error_found, messages: total_errors });
  }

  loadTable() {
    const self = this;
    return new Promise((resolve, reject) => {
      gravity.loadAppData()
        .then((response) => {
          const { tables } = response.app;
          for (let x = 0; x < Object.keys(tables).length; x += 1) {
            if (tables[x][self.table] !== undefined) {
              const record_table = tables[x][self.table];
              resolve(record_table);
              break;
            }
          }
          reject('Table could not be found');
        })
        .catch((error) => {
          console.log(error);
          reject(error);
        });
    });
  }

  getAllVersions() {
    const self = this;
    const record_list = [];
    let created_at;

    return new Promise((resolve, reject) => {
      gravity.getAllRecords(self.table)
        .then((response) => {
          const { records } = response;

          for (let x = 0; x < Object.keys(records).length; x += 1) {
            const this_record = records[x];
            if (this_record.id === self.id) {
              const record_record = JSON.parse(this_record[`${self.model}_record`]);
              record_record.date = this_record.date;

              this_record[`${self.model}_record`] = record_record;
              record_list.push(record_record);
            }
          }

          gravity.sortByDate(record_list);

          created_at = record_list[record_list.length - 1].date;

          resolve({
            id: self.id,
            versions: record_list,
            date: created_at,
          });
        })
        .catch((error) => {
          console.log(error);
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

  loadRecords() {
    const self = this;
    const eventEmitter = new events.EventEmitter();
    const final_list = [];
    let table_data;
    let user;

    return new Promise((resolve, reject) => {
      eventEmitter.on('table_data_loaded', () => {
        gravity.get_records(user.record.account, table_data.address, table_data.passphrase)
          .then((res) => {
            const { records } = res;
            const records_breakdown = {};
            for (let x = 0; x < Object.keys(records).length; x += 1) {
              const this_record = records[x];
              if (this_record.id) {
                if (records_breakdown[this_record.id] === undefined) {
                  records_breakdown[this_record.id] = {
                    versions: [],
                    date_first_record: '',
                  };
                }

                const data = JSON.parse(this_record[`${self.model}_record`]);
                data.date = this_record.date;
                records_breakdown[this_record.id].versions.push(data);
              }
            }
            const ids = Object.keys(records_breakdown);

            for (let z = 0; z < ids.length; z += 1) {
              const id = ids[z];
              // console.log(records_breakdown[id]);
              gravity.sortByDate(records_breakdown[id].versions);
              const this_records = records_breakdown[id].versions;
              const last_record = this_records.length - 1;
              // console.log(this_records[0]);
              // console.log(this_records[last_record]);
              const created_at = this_records[last_record].date;
              final_list.push({
                id,
                [`${self.model}_record`]: this_records[0],
                date: created_at,
              });
            }
            // console.log(final_list);

            resolve({ success: true, records: final_list, records_found: final_list.length });
          })
          .catch((err) => {
            reject(err);
          });
      });

      eventEmitter.on('verified_request', () => {
        if (self.user.api_key === user.record.api_key) {
          self.loadTable()
            .then((res) => {
              table_data = res;
              eventEmitter.emit('table_data_loaded');
            })
            .catch((err) => {
              console.log(err);
              reject(err);
            });
        } else {
          reject({ success: false, errors: 'Incorrect api key' });
        }
      });

      if (self.model === 'user') {
        eventEmitter.emit('verified_request');
      } else if (self.user && self.user.id) {
        const User = require('./user.js');

        gravity.findById(self.user.id, 'user')
          .then((response) => {
            user = new User(response.record);
            eventEmitter.emit('verified_request');
          })
          .catch((err) => {
            console.log(err);
            reject({ success: false, errors: 'There was an error in authentication of request/user validation' });
          });
      } else {
        reject({ success: false, errors: 'There was an error in authentication of request/user validation' });
      }
    });
  }

  create() {
    const self = this;
    const eventEmitter = new events.EventEmitter();
    let record_table;
    let user;

    return new Promise((resolve, reject) => {
      if (self.verify().errors === true) {
        reject({ false: false, verification_error: true, errors: self.verify().messages });
      } else {
        eventEmitter.on('id_generated', () => {
          const stringified_record = JSON.stringify(self.record);

          const full_record = {
            id: self.record.id,
            [`${self.model}_record`]: stringified_record,
            date: Date.now(),
          };
          const encrypted_record = gravity.encrypt(JSON.stringify(full_record));
          let call_url;

          if (self.model === 'user') {
            call_url = `${gravity.jupiter_data.server}/nxt?requestType=sendMessage&secretPhrase=${record_table.passphrase}&recipient=${self.record.account}&messageToEncrypt=${encrypted_record}&feeNQT=${gravity.jupiter_data.feeNQT}&deadline=${gravity.jupiter_data.deadline}&recipientPublicKey=${self.data.public_key}&compressMessageToEncrypt=true`;
          } else if (self.user) {
            // console.log('Non user call url');
            call_url = `${gravity.jupiter_data.server}/nxt?requestType=sendMessage&secretPhrase=${record_table.passphrase}&recipient=${self.user.address}&messageToEncrypt=${encrypted_record}&feeNQT=${gravity.jupiter_data.feeNQT}&deadline=${gravity.jupiter_data.deadline}&recipientPublicKey=${self.user.public_key}&compressMessageToEncrypt=true`;
          } else {
            call_url = `${gravity.jupiter_data.server}/nxt?requestType=sendMessage&secretPhrase=${record_table.passphrase}&recipient=${record_table.address}&messageToEncrypt=${encrypted_record}&feeNQT=${gravity.jupiter_data.feeNQT}&deadline=${gravity.jupiter_data.deadline}&recipientPublicKey=${record_table.public_key}&compressMessageToEncrypt=true`;
          }
          // console.log(call_url)
          // console.log(self);
          axios.post(call_url)
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
          self.generateId(record_table)
            .then(() => {
              if (self.record.id === undefined) {
                reject({ success: false, errors: 'Id for model was not generated' });
              }
              eventEmitter.emit('id_generated');
            })
            .catch((err) => {
              console.log(err);
              reject({ success: false, errors: err });
            });
        });
        eventEmitter.on('request_authenticated', () => {
          self.loadTable()
            .then((res) => {
              record_table = res;
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
          const User = require('./user.js');

          gravity.findById(self.user.id, 'user')
            .then((response) => {
              // console.log(user);
              user = new User(response.record);
              // console.log(user.record)
              // console.log(self)
              eventEmitter.emit('authenticate_user_request');
            })
            .catch((err) => {
              console.log(err);
              reject({ success: false, errors: 'There was an error in authentication of request/user validation' });
            });
        } else {
          // eventEmitter.emit('request_authenticated');
          reject({ success: false, errors: 'There was an error in authentication of request/user validation' });
        }
      }
    });
  }

  update() {
    const self = this;
    const eventEmitter = new events.EventEmitter();
    let record_table;
    let user;

    return new Promise((resolve, reject) => {
      if (self.verify().errors === true) {
        reject({ false: false, verification_error: true, errors: self.verify().messages });
      } else {
        eventEmitter.on('id_verified', () => {
          const stringified_record = JSON.stringify(self.record);
          const full_record = {
            id: self.record.id,
            [`${self.model}_record`]: stringified_record,
            date: Date.now(),
          };
          const encrypted_record = gravity.encrypt(JSON.stringify(full_record));
          let call_url;
          if (self.model === 'user') {
            call_url = `${gravity.jupiter_data.server}/nxt?requestType=sendMessage&secretPhrase=${record_table.passphrase}&recipient=${self.record.account}&messageToEncrypt=${encrypted_record}&feeNQT=${gravity.jupiter_data.feeNQT}&deadline=${gravity.jupiter_data.deadline}&recipientPublicKey=${self.data.public_key}&compressMessageToEncrypt=true`;
          } else if (self.user) {
            call_url = `${gravity.jupiter_data.server}/nxt?requestType=sendMessage&secretPhrase=${record_table.passphrase}&recipient=${self.user.address}&messageToEncrypt=${encrypted_record}&feeNQT=${gravity.jupiter_data.feeNQT}&deadline=${gravity.jupiter_data.deadline}&recipientPublicKey=${self.user.public_key}&compressMessageToEncrypt=true`;
          } else {
            call_url = `${gravity.jupiter_data.server}/nxt?requestType=sendMessage&secretPhrase=${record_table.passphrase}&recipient=${record_table.address}&messageToEncrypt=${encrypted_record}&feeNQT=${gravity.jupiter_data.feeNQT}&deadline=${gravity.jupiter_data.deadline}&recipientPublicKey=${record_table.public_key}&compressMessageToEncrypt=true`;
          }
          // console.log(call_url);
          // console.log(self);
          axios.post(call_url)
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
              console.log(error);
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
              record_table = res;
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
          const User = require('./user.js');

          gravity.findById(self.user.id, 'user')
            .then((response) => {
              user = new User(response.record);
              // console.log(user.record)
              // console.log(self)
              eventEmitter.emit('authenticate_user_request');
            })
            .catch((err) => {
              console.log(err);
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

    return new Promise((resolve, reject) => {
      gravity.getAllRecords(self.table)
        .then((response) => {
          const { records } = response;
          const collection = {};
          const collection_list = [];

          for (let x = 0; x < Object.keys(records).length < 0; x += 1) {
            const this_record = records[x];

            if (collection[this_record.id] === undefined) {
              const record_record = JSON.parse(this_record[`${self.model}_record`]);
              record_record.date = this_record.date;

              collection[this_record.id] = {
                id: this_record.id,
                versions: [record_record],
              };
            } else {
              const record_record = JSON.parse(this_record[`${self.model}_record`]);
              record_record.date = this_record.date;

              this_record[`${self.model}_record`] = record_record;
              collection[this_record.id].versions.push(record_record);
            }
          }

          for (let key; key < Object.keys(collection).length; key += 1) {
            const data_object = collection[key];
            // This sorts dates in versions, assigns date to overall record and pushes to final list
            gravity.sortByDate(data_object.versions);
            data_object.date = data_object.versions[data_object.versions.length - 1].date;
            collection_list.push(data_object);
          }
          // This sorts final list by last update
          gravity.sortByDate(collection_list);
          resolve({ success: true, records: collection_list, params: self.model_params });
        })
        .catch((error) => {
          console.log(error);
          reject({ success: false, errors: error });
        });
    });
  }
}

module.exports = Model;
