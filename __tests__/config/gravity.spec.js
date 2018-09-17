import axios from 'axios';
import { gravity } from '../../config/gravity';

const jupServer = 'https://jpr.sigwo.com';
const testAccountId = '13327555160490770310';
const testAccountBalance = '79985720';
let encryptedText;
let decryptedText;
gravity.algorithm = 'aes-128-cbc';
gravity.password = 'testpassword123';
gravity.sender = 'JUP-MZW8-TTER-P7BV-DW9XK';

describe('Gravity', () => {
  it('it should return an object', () => {
    expect(typeof gravity).toBe('object');
  });
  it('it should generate a passphrase method is generate_passphrase is called', () => {
    const generatedPassphrase = gravity.generate_passphrase();

    expect(typeof generatedPassphrase).toBe('string');
    expect(generatedPassphrase.split(' ').length).toBe(12);
  });
  describe('encrypt', () => {
    it('it should encrypt a string object based on gravity algorithm chosen', () => {
      encryptedText = gravity.encrypt('this_is_a_text');
      expect(encryptedText.length).not.toBe(0);
      expect(encryptedText).not.toBe('this_is_a_text');
    });
  });
  describe('decrypt', () => {
    it('it should decrypt an encrypted string based on gravity algorithm chosen', () => {
      decryptedText = gravity.decrypt(encryptedText);

      expect(decryptedText.length).not.toBe(0);
      expect(decryptedText).toBe('this_is_a_text');
    });
  });
  describe('sortByDate', () => {
    it('it should sort from newer to oldest an array of objects based on their date parameter', () => {
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
    it('it should push items without date param to be bottom of the list', () => {
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
    it('it should sort from newer to oldest an array of objects based on the subkey parameter', () => {
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
    it('it should push items without subkey to be bottom of the list', () => {
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
  describe('getBalance', () => {
    it('it should get the balance of an account based on account id or passphrase', async () => {
      const Balance = await gravity.getBalance('', testAccountId, jupServer);

      expect(Balance.balance).toBe(testAccountBalance);
    });
  });
  describe('createNewAddress', () => {
    it('it should should return address and public key from axios response', async () => {
      axios.get = jest.fn().mockResolvedValue();
      axios.get.mockResolvedValueOnce({ data: { success: true, accountRS: 'THIS_IS_AN_ADDRESS', publicKey: '123456' } });

      const response = await gravity.createNewAddress();

      expect(response.success).toBe(true);
      expect(response.address).toBe('THIS_IS_AN_ADDRESS');
      expect(response.publicKey).toBe('123456');
    });
  });
  describe('getAccountInformation', () => {
    it('it should should return address and public key from axios response', async () => {
      axios.get = jest.fn().mockResolvedValue();
      axios.get.mockResolvedValueOnce({ data: { success: true, accountRS: 'THIS_IS_AN_ADDRESS', publicKey: '123456' } });

      const response = await gravity.createNewAddress();

      expect(response.success).toBe(true);
      expect(response.address).toBe('THIS_IS_AN_ADDRESS');
      expect(response.publicKey).toBe('123456');
    });
  });
});
