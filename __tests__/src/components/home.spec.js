// eslint-disable-next-line no-unused-vars
import React from 'react';
import { shallow, mount } from 'enzyme';
import { HomeComponent } from '../../../src/components/home.jsx';

let wrapper;
let mountWrapper;

const mockEvent = {
  preventDefault: jest.fn(() => true),
};

describe('Home', () => {
  describe('<HomeComponent />', () => {
    beforeEach(() => {
      wrapper = shallow(<HomeComponent />).instance();
    });

    it('should return correct default states', () => {
      const { state } = wrapper;

      expect(state.user).toBe(undefined);
    });

    /* it('should have a props of user and set the state of user to true', () => {
      // mount the HomeComponent with a props of user equal to true
      mountWrapper = mount(<HomeComponent user={true} />);

      // make sure that props.user is true
      expect(mountWrapper.props()).toEqual({ user: true });

      // make sure the HomeComponent user state is true
      expect(mountWrapper.state('user')).toBe(true);
      // expect(mountWrapper.state(mockEvent)).toBeCalledWith(true);
    }); */
  });
});
