// eslint-disable-next-line no-unused-vars
import React from 'react';
import axios from 'axios';
import toastr from 'toastr';
import { shallow } from 'enzyme';
import { LoginForm } from '../../../src/components/login.jsx';

let wrapper;
let urlsList;

const mockEvent = {
  preventDefault: jest.fn(() => true),
};

describe('Login', () => {
  describe('<LoginForm />', () => {
    beforeEach(() => {
      wrapper = shallow(<LoginForm />).instance();
      urlsList = [];
      toastr.success = jest.fn(() => true);
      toastr.error = jest.fn(() => true);
    });

    it('should return correct default states', () => {
      const { state } = wrapper;

      expect(state.jup_passphrase).toBe('');
      expect(state.response_message).toBe('');
      expect(state.response_type).toBe('');
      expect(state.confirmation_page).toBe(false);
      expect(state.account).toBe('');
      expect(state.accounthash).toBe('');
      expect(state.public_key).toBe('');
      expect(state.encryptionPassword).toBe('');
    });

    it('should have handleChange, enterPassphrase, logIn and render methods', () => {
      expect(wrapper.handleChange).not.toBe(undefined);
      expect(wrapper.enterPassphrase).not.toBe(undefined);
      expect(wrapper.logIn).not.toBe(undefined);
      expect(wrapper.render).not.toBe(undefined);
    });

    describe('logIn', () => {
      it('should call /get_jupiter_account post endpoint as the first argument. Should pass in {jup_passphrase: ""} as the second argument and should update state with post data.', async () => {
        axios.post = jest.fn((url) => {
          urlsList.push(url);
          return new Promise((resolve) => {
            resolve({
              data: {
                success: true,
                confirmation_page: true,
                account: 'testaccount',
                accounthash: 'testaccounthash',
                public_key: 'testpublickey',
              },
            });
          });
        });
        expect(wrapper.state.confirmation_page).toBe(false);
        expect(wrapper.state.account).toBe('');
        expect(wrapper.state.accounthash).toBe('');
        expect(wrapper.state.public_key).toBe('');

        await wrapper.logIn(mockEvent);

        expect(axios.post).toBeCalledWith('/get_jupiter_account', { jup_passphrase: '' });
        expect(wrapper.state.confirmation_page).toBe(true);
        expect(wrapper.state.account).toBe('testaccount');
        expect(wrapper.state.accounthash).toBe('testaccounthash');
        expect(wrapper.state.public_key).toBe('testpublickey');
      });
      it('should call toastr.error if axios response does not have success key', async () => {
        axios.post = jest.fn((url) => {
          urlsList.push(url);
          return new Promise((resolve) => {
            resolve({
              data: {
                error: true,
                confirmation_page: true,
                account: 'testaccount',
                accounthash: 'testaccounthash',
                public_key: 'testpublickey',
              },
            });
          });
        });

        await wrapper.logIn(mockEvent);
        expect(toastr.success).toHaveBeenCalledTimes(0);
        expect(toastr.error).toHaveBeenCalledTimes(1);
      });
    });
  });
});
