// eslint-disable-next-line no-unused-vars
import React from 'react';
import { shallow } from 'enzyme';
import UserHeader from '../../../../src/components/CustomComponents/UserHeader.jsx';

let wrapper;

const mockEvent = {
  preventDefault: jest.fn(() => true),
};

describe('UserHeadrer', () => {
  describe('<UserHeader />', () => {
    beforeEach(() => {
      wrapper = shallow(<UserHeader />).instance();
    });

    it('should return correct default states', () => {
      const { state } = wrapper;

      expect(state.alias).toBe('');
      expect(state.account).toBe('');
    });

    it('should have componentDidMount, getUserDetails and return methods.', () => {
      expect(wrapper.componentDidMount).not.toBe(undefined);
      expect(wrapper.getUserDetails).not.toBe(undefined);
      expect(wrapper.render).not.toBe(undefined);
    });
  });
});