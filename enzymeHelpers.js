import React from 'react';
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { act } from 'react-dom/test-utils';

Enzyme.configure({ adapter: new Adapter() });
const { shallow, mount } = Enzyme;

/**
 * Resolve all promises
 */
const flushPromises = () => new Promise(setImmediate);

/**
 * actFlushPromises
 */
const actFlushPromises = () =>
  act(async () => {
    await flushPromises();
  });

/**
 * This is a hook mounter to test custom hooks
 *
 * @param {*} hook
 *
 * @return {Object} hook values
 */
const mountHook = hook => {
  const hookResult = { values: [] };

  /**
   * Component that will be mounted
   */
  const Component = ({ children, ...props }) => children(hook(props));

  return async props => {
    mount(
      <Component {...props}>
        {hookValues => {
          // Mutate to keep updated values in It, hence values array should be re-destrcutured for multiple calls
          Object.assign(hookResult.values, hookValues);
          return null;
        }}
      </Component>,
    );

    await actFlushPromises();

    return hookResult;
  };
};

export {
  mount,
  shallow,
  flushPromises,
  actFlushPromises,
  mountHook,
};
