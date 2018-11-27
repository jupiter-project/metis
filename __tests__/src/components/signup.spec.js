// eslint-disable-next-line no-unused-vars
import React from 'react';
import axios from 'axios';
import toastr from 'toastr';
import { shallow } from 'enzyme';
import { SignupForm } from '../../../src/components/signup.jsx';

let wrapper;
let urlsList;

const mockEvent = {
  preventDefault: jest.fn(() => true),
};

describe('Signup', () => {
  describe('<SignupForm />', () => {
    beforeEach(() => {
      wrapper = shallow(<SignupForm />).instance();
      urlsList = [];
      toastr.success = jest.fn(() => true);
      toastr.error = jest.fn(() => true);
    });

    it('should return correct default states', () => {
      const { state } = wrapper;

      expect(state.new_jup_account).toBe(false);
      expect(state.jup_account_created).toBe(false);
      expect(state.enable_two_fa).toBe(false);
      expect(state.passphrase_confirmation_page).toBe(false);
      expect(state.passphrase_confirmed).toBe(false);
      expect(state.submitted).toBe(false);
    });

    it('should have confirmedPassphrase, generatePassphrase, confirmPassphrase, handleChange, registerAccount, update2FA, handleClick and render methods', () => {
      expect(wrapper.confirmedPassphrase).not.toBe(undefined);
      expect(wrapper.generatePassphrase).not.toBe(undefined);
      expect(wrapper.confirmPassphrase).not.toBe(undefined);
      expect(wrapper.handleChange).not.toBe(undefined);
      expect(wrapper.registerAccount).not.toBe(undefined);
      expect(wrapper.update2FA).not.toBe(undefined);
      expect(wrapper.handleClick).not.toBe(undefined);
      expect(wrapper.render).not.toBe(undefined);
    });

    describe('generatePassphrase', () => {
      it('should call /create_passphrase get endpoint and update state with data.result', async () => {
        axios.get = jest.fn((url) => {
          urlsList.push(url);
          return new Promise((resolve) => {
            resolve({
              data: {
                success: true,
                result: 'this is a test passphrase',
              },
            });
          });
        });
        expect(wrapper.state.jup_account_created).toBe(false);
        expect(wrapper.state.generated_passphrase).toBe('');

        await wrapper.generatePassphrase(mockEvent);

        expect(wrapper.state.jup_account_created).toBe(true);
        expect(wrapper.state.generated_passphrase).toBe('this is a test passphrase');
      });

      it('should call toastr.success if passphrase generation is successfull', async () => {
        await wrapper.generatePassphrase(mockEvent);

        expect(toastr.success).toHaveBeenCalledTimes(1);
        expect(toastr.error).toHaveBeenCalledTimes(0);
      });

      it('should call toastr.error if axios response does not have success key', async () => {
        axios.get = jest.fn((url) => {
          urlsList.push(url);
          return new Promise((resolve) => {
            resolve({
              data: {
                error: true,
                result: 'this is a test passphrase',
              },
            });
          });
        });

        await wrapper.generatePassphrase(mockEvent);
        expect(toastr.success).toHaveBeenCalledTimes(0);
        expect(toastr.error).toHaveBeenCalledTimes(1);
      });
    });

    describe('handleClick', () => {
      it('should call change the state: submitted from false to true', async () => {
        expect(wrapper.state.submitted).toBe(false);
        await wrapper.handleClick();
        expect(wrapper.state.submitted).toBe(true);        
      });
    });
  });
});
