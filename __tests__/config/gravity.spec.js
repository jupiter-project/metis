import axios from 'axios';
import { gravity } from '../../config/gravity';

let gravityFile;

try {
  gravityFile = require('../../.gravity');
  jest.mock('../../.gravity', () => ({
    APPNAME: 'Testo',
    JUPITERSERVER: 'http://server_url',
    APP_ACCOUNT: 'test',
    APP_ACCOUNT_ADDRESS: 'JUP-ABCD-EFG-HIJK-LMNOP',
    APP_PUBLIC_KEY: 'private-key',
    ENCRYPT_ALGORITHM: 'aes-128-cbc',
    ENCRYPT_PASSWORD: 'test1234',
    APP_ACCOUNT_ID: 'private-key',
    SESSION_SECRET: 'session_secret_key_here',
  }));
} catch (e) {
  console.log(e);
  gravityFile = false;
}

let encryptedText;
let decryptedText;
gravity.algorithm = 'aes-128-cbc';
gravity.password = 'testpassword123';
gravity.sender = 'JUP-MZW8-TTER-P7BV-DW9XK';

let response;
let tableName = 'tests';
let consoleCalls = [];
let closeCalls = 0;
let questionCalls = [];
// let getCalls = [];
let postCalls = [];
console.log = jest.fn((message) => { consoleCalls.push(message); });

function splitIntoHash(listToSplit) {
  const finalHash = {};
  for (let x = 0; x < listToSplit.length; x += 1) {
    const newList = String(listToSplit[x]).split('=');
    const key = newList[0];
    const val = newList[1];

    finalHash[key] = val;
  }
  return finalHash;
}

describe('Gravity', () => {
  // The following tests are only executed in a staging or production server
  if (process.env.STAGING || process.env.PRODUCTION) {
    describe('Staging and Production Functions', () => {
      it('should have required environment variables', () => {
        expect(process.env.APPNAME).not.toBe(undefined);
        expect(process.env.JUPITERSERVER).not.toBe(undefined);
        expect(process.env.APP_ACCOUNT).not.toBe(undefined);
        expect(process.env.APP_ACCOUNT_ADDRESS).not.toBe(undefined);
        expect(process.env.APP_PUBLIC_KEY).not.toBe(undefined);
        expect(process.env.ENCRYPT_ALGORITHM).not.toBe(undefined);
        expect(process.env.ENCRYPT_PASSWORD).not.toBe(undefined);
        expect(process.env.APP_ACCOUNT_ID).not.toBe(undefined);
        expect(process.env.SESSION_SECRET).not.toBe(undefined);
      });
    });
  }
  describe('General Functions', () => {
    beforeEach(() => {
      axios.get = jest.fn(() => ({ data: { success: true } }));
    });

    it('should return an object', () => {
      expect(typeof gravity).toBe('object');
    });

    it('should generate a passphrase method is generate_passphrase is called', () => {
      const generatedPassphrase = gravity.generate_passphrase();

      expect(typeof generatedPassphrase).toBe('string');
      expect(generatedPassphrase.split(' ').length).toBe(12);
    });

    describe('encrypt', () => {
      it('should encrypt a string object based on gravity algorithm chosen', () => {
        encryptedText = gravity.encrypt('this_is_a_text');
        expect(encryptedText.length).not.toBe(0);
        expect(encryptedText).not.toBe('this_is_a_text');
      });
    });

    describe('decrypt', () => {
      it('should decrypt an encrypted string based on gravity algorithm chosen', () => {
        decryptedText = gravity.decrypt(encryptedText);

        expect(decryptedText.length).not.toBe(0);
        expect(decryptedText).toBe('this_is_a_text');
      });
    });

    describe('sortByDate', () => {
      it('should sort from newer to oldest an array of objects based on their date parameter', () => {
        const dateArray = [
          {
            id: 'a1',
            date: 1537112168254,
          }, {
            id: 'b2',
            date: 1537112168250,
          }, {
            id: 'c3',
            date: 1537112168257,
          },
        ];

        gravity.sortByDate(dateArray);
        expect(dateArray[0].id).toBe('c3');
        expect(dateArray[1].id).toBe('a1');
        expect(dateArray[2].id).toBe('b2');
      });

      it('should push items without date param to be bottom of the list', () => {
        const dateArray = [
          {
            id: 'a1',
          },
          {
            id: 'b2',
            date: 1537112168254,
          }, {
            id: 'c3',
            date: 1537112168250,
          }, {
            id: 'd4',
            date: 1537112168257,
          },
        ];

        gravity.sortByDate(dateArray);
        expect(dateArray[0].id).toBe('d4');
        expect(dateArray[2].id).toBe('c3');
        expect(dateArray[3].id).toBe('a1');
      });
    });

    describe('sortBySubkey(array, key, subkey)', () => {
      it('should sort from newer to oldest an array of objects based on the subkey parameter', () => {
        const dateArray = [
          {
            id: 'a1',
            record: {
              date: 1537112168254,
            },
          }, {
            id: 'b2',
            record: {
              date: 1537112168250,
            },
          }, {
            id: 'c3',
            record: {
              date: 1537112168257,
            },
          },
        ];

        gravity.sortByDate(dateArray, 'record', 'date');
        expect(dateArray[0].id).toBe('c3');
      });

      it('should push items without subkey to be bottom of the list', () => {
        const dateArray = [
          {
            id: 'a1',
            record: {
              non_date: 1537112168254,
            },
          },
          {
            id: 'b2',
            record: {
              date: 1537112168254,
            },
          }, {
            id: 'c3',
            record: {
              date: 1537112168250,
            },
          }, {
            id: 'd4',
            record: {
              date: 1537112168257,
            },
          },
        ];

        gravity.sortByDate(dateArray);
        expect(dateArray[0].id).toBe('d4');
        expect(dateArray[3].id).toBe('a1');
      });
    });

    /* describe('getBalance', () => {
      it('should get the balance of an account based on account id or passphrase', async () => {
        const Balance = await gravity.getBalance('', testAccountId, jupServer);

        expect(Balance.balance).toBe(testAccountBalance);
      });
    }); */

    describe('createNewAddress', () => {
      it('should should return address and public key from axios response', async () => {
        axios.get.mockResolvedValueOnce({ data: { success: true, accountRS: 'THIS_IS_AN_ADDRESS', publicKey: '123456' } });

        response = await gravity.createNewAddress();

        expect(response.success).toBe(true);
        expect(response.address).toBe('THIS_IS_AN_ADDRESS');
        expect(response.publicKey).toBe('123456');
        expect(axios.get).toHaveBeenCalledTimes(1);
      });
    });

    describe('getAccountInformation', () => {
      it('should should return address and public key from axios response', async () => {
        axios.get.mockResolvedValueOnce({ data: { success: true, accountRS: 'THIS_IS_AN_ADDRESS', publicKey: '123456' } });

        response = await gravity.createNewAddress();

        expect(response.success).toBe(true);
        expect(response.address).toBe('THIS_IS_AN_ADDRESS');
        expect(response.publicKey).toBe('123456');
        expect(axios.get).toHaveBeenCalledTimes(1);
      });
    });
  });

  // The following tests are only executed when there's a .gravity.js file among your files
  if (gravityFile) {
    describe('Development Functions', () => {
      describe('createTable', () => {
        beforeEach(() => {
          if (!gravity.jupiter_data.server) {
            gravity.jupiter_data.server = 'http://server_url';
          }
          tableName = 'tests';
          questionCalls = 0;
          consoleCalls = [];
          // getCalls = [];
          postCalls = [];
          gravity.makeQuestion = (question) => {
            closeCalls += 1;
            consoleCalls.push(question);
            questionCalls += 1;
            return tableName;
          };

          gravity.loadAppData = jest.fn((tableDetails) => {
            const tables = tableDetails || ['users'];
            return new Promise((resolve) => {
              resolve({ tables });
            });
          });

          gravity.sendMoney = jest.fn((address) => {
            const addressValue = address || 'defaultAddressValue';
            return new Promise((resolve) => {
              resolve({
                data: {
                  success: true,
                  address: addressValue,
                },
              });
            });
          });

          // gravity.tables = ['users'];

          gravity.createNewAddress = jest.fn(() => {
            const responseObject = {
              success: true,
              address: 'thisIsTheTableAddress',
              public_key: 'ThisIsTheTablePublicKey',
            };
            return new Promise((resolve) => {
              resolve(responseObject);
            });
          });

          axios.post = jest.fn((postUrl) => {
            postCalls.push(postUrl);
            const responseBalance = {
              data: {
                broadcasted: true,
              },
            };
            return new Promise((resolve) => {
              resolve(responseBalance);
            });
          });

          gravity.getBalance = jest.fn(() => {
            const responseBalance = { minimumAppBalance: true };
            return new Promise((resolve) => {
              resolve(responseBalance);
            });
          });
        });

        it('should call createNewAddress method, make two post calls to Jupiter, call the sendMoney method, return success true value and always close interactive window', async () => {
          try {
            response = await gravity.createTable();
          } catch (e) {
            response = e;
          }
          expect(gravity.createNewAddress).toHaveBeenCalledTimes(1);
          expect(axios.post).toHaveBeenCalledTimes(2);
          expect(gravity.sendMoney).toHaveBeenCalledTimes(1);
          expect(response.success).toBe(true);
          expect(response.message).toBe(`Table ${tableName} pushed to the blockchain and funded.`);
        });

        it('should return data and jupiter response keys in response', async () => {
          try {
            response = await gravity.createTable();
          } catch (e) {
            response = e;
          }
          expect(response.data).not.toBe(undefined);
          expect(response.jupiter_response).not.toBe(undefined);
        });

        it('should display terminal messages six times if no errors occur', async () => {
          try {
            response = await gravity.createTable();
          } catch (e) {
            response = e;
          }
          expect(consoleCalls.length).toBe(6);
          expect(consoleCalls[0]).toBe('You are about to create a new database table for your Gravity app.');
          expect(consoleCalls[1]).toBe('The following tables are already linked to your database:');
          expect(consoleCalls[2]).toEqual(['users', tableName]);
          expect(consoleCalls[3]).toBe('What will be the name of your new table?\n');
          expect(consoleCalls[4]).toBe(`Table ${tableName} pushed to the blockchain and linked to your account.`);
          expect(consoleCalls[5]).toBe(`Table ${tableName} funded with JUP.`);
          expect(questionCalls).toBe(1);
        });

        it('should ask for table name only once', async () => {
          try {
            response = await gravity.createTable();
          } catch (e) {
            response = e;
          }
          expect(questionCalls).toBe(1);
        });

        it('should use a jupiter server of valid format and send proper data when making post requests', async () => {
          try {
            response = await gravity.createTable();
          } catch (e) {
            response = e;
          }
          const serverBegins = ['http:', 'https:'];
          const componentsOne = postCalls[0].split('/');
          const componentsTwo = postCalls[1].split('/');
          const paramsOne = splitIntoHash(componentsOne[3].split('&'));
          const paramsTwo = splitIntoHash(componentsTwo[3].split('&'));

          expect(serverBegins.includes(componentsOne[0])).toBe(true);
          expect(serverBegins.includes(componentsTwo[0])).toBe(true);
          expect(componentsOne[1]).toBe('');
          expect(componentsTwo[1]).toBe('');
          expect(`${componentsOne[0]}//${componentsOne[2]}`).toBe(gravityFile.JUPITERSERVER);
          expect(`${componentsTwo[0]}//${componentsTwo[2]}`).toBe(gravityFile.JUPITERSERVER);
          expect(paramsOne['nxt?requestType']).toBe('sendMessage');
          expect(paramsOne.recipient).toBe(gravityFile.APP_ACCOUNT_ADDRESS);
          expect(paramsOne.recipientPublicKey).toBe(gravityFile.APP_PUBLIC_KEY);
          expect(paramsOne.secretPhrase).toBe(gravityFile.APP_ACCOUNT);
          expect(paramsOne.compressMessageToEncrypt).toBe('true');
          expect(paramsOne.deadline).not.toBe('undefined');
          expect(paramsOne.feeNQT).not.toBe('undefined');

          expect(paramsTwo['nxt?requestType']).toBe('sendMessage');
          expect(paramsTwo.recipient).toBe(gravityFile.APP_ACCOUNT_ADDRESS);
          expect(paramsTwo.recipientPublicKey).toBe(gravityFile.APP_PUBLIC_KEY);
          expect(paramsTwo.secretPhrase).toBe(gravityFile.APP_ACCOUNT);
          expect(paramsTwo.compressMessageToEncrypt).toBe('true');
          expect(paramsTwo.deadline).not.toBe('undefined');
          expect(paramsTwo.feeNQT).not.toBe('undefined');
          expect(paramsTwo.messageToEncrypt).not.toBe('undefined');

          const decryptedDataOne = JSON.parse(gravity.decrypt(paramsOne.messageToEncrypt));
          expect(decryptedDataOne).not.toBe(undefined);
          expect(decryptedDataOne[tableName]).not.toBe(undefined);
          expect(decryptedDataOne[tableName].address).toBe('thisIsTheTableAddress');
          expect(decryptedDataOne[tableName].passphrase.split(' ').length).toBe(12);
          expect(decryptedDataOne[tableName].public_key).toBe('ThisIsTheTablePublicKey');

          const decryptedDataTwo = JSON.parse(gravity.decrypt(paramsTwo.messageToEncrypt));
          expect(decryptedDataTwo.tables).not.toBe(undefined);
          expect(decryptedDataTwo.date).not.toBe(undefined);
          expect(decryptedDataTwo.tables).toEqual(['users', tableName]);
        });

        it('should return two console messages and close interactive screen if balance is insufficient', async () => {
          gravity.getBalance = jest.fn(() => {
            consoleCalls = [];
            return new Promise((resolve) => {
              resolve({ minimumAppBalance: false });
            });
          });

          try {
            response = await gravity.createTable();
          } catch (e) {
            response = e;
          }

          // This scenario does not ask a question so it does not oen the interactive interface
          expect(response).toBe("Please send JUP to your app's address and retry command");
          expect(consoleCalls.length).toBe(2);
          expect(consoleCalls[0]).toBe('Error in creating new table: insufficient app balance.');
          expect(consoleCalls[1]).toBe(`A minimum of ${parseFloat((gravity.jupiter_data.minimumAppBalance)
            / (10 ** gravity.jupiter_data.moneyDecimals))} JUP is required to create a table with Gravity.`);
          expect(questionCalls).toBe(0);
        });

        it('should return an error if table already exists in database', async () => {
          gravity.loadAppData = jest.fn(() => {
            const tables = ['users', tableName, 'others', 'cars', 'animals'];
            return new Promise((resolve) => {
              resolve({ tables });
            });
          });

          try {
            response = await gravity.createTable();
          } catch (e) {
            response = e;
          }

          expect(response).toBe(`Error: Unable to save table. ${tableName} is already in the database`);
        });

        it('should return an error if table name is undefined', async () => {
          tableName = undefined;
          try {
            response = await gravity.createTable();
          } catch (e) {
            response = e;
          }
          expect(response).toBe('Table name cannot be undefined');

          tableName = 'undefined';
          try {
            response = await gravity.createTable();
          } catch (e) {
            response = e;
          }
          expect(response).toBe('Table name cannot be undefined');
        });

        it('should close interactive console every time method is completed', async () => {
          try {
            response = await gravity.createTable();
          } catch (e) {
            response = e;
          }
          expect(closeCalls).toBe(9);
        });
      });
    });
  }
});
