// eslint-disable-next-line no-unused-vars
import React from 'react';
import { shallow } from 'enzyme';
import { HomeComponent } from '../../../src/components/home.jsx';

let wrapper;

describe('Home', () => {
  describe('<HomeComponent />', () => {
    beforeEach(() => {
      wrapper = shallow(<HomeComponent />).instance();
    });

    it('should return correct default states', () => {
      const { state, props } = wrapper;

      expect(state.user).toBe(props.user);
    });

    it('should have a render method.', () => {
      expect(wrapper.render).not.toBe(undefined);
    });
  });
});
