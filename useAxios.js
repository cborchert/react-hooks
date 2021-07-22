/* @flow */
/**
 * How to use useAxios custom hook.
 *
 * [{ isLoading, response, error }, request] = useAxios({
      method: 'get',
      url: 'my-url',
      afterMount: true,
    });
 *
 * @param afterMount set to true will execute the axios call just after the mount. It's false by default.
 * @param others all classic axios config.
 *
 * @return {Function} request is a function that will trigger axios call manually with extended axios config (optional) as parameter.
 * @return {boolean} isLoading is a flag set to true when the axios call is in process, by default 'undefined' to avoid extra renders.
 * @return {Object} response contains the data response if the axios call is successful, by default 'undefined'.
 * @return {Object} error contains the error object if the axios call has failed, by default 'undefined'.
 */

import { useEffect, useRef, useReducer, useCallback } from "react";
import axios from "axios";

type UseAxiosConfigTypes = {
  afterMount?: boolean,
  axiosConfig?: Object,
};

type InitialStateTypes = {
  isLoading: boolean,
  response: Object,
  error: Object,
};

/**
 * useAxios custom hook actions
 *
 * @type {Object}
 */
export const AXIOS_HOOK_ACTIONS = {
  START: "AXIOS_HOOK_ACTIONS_START",
  END: "AXIOS_HOOK_ACTIONS_END",
};

/**
 * request reducer initial state
 *
 * @type {InitialStateTypes}
 */
const initialState: InitialStateTypes = #{
  isLoading: undefined,
  response: undefined,
  error: undefined,
};

/**
 * the request reducer
 *
 * @param {Object} state
 * @param {Object} action
 *
 * @returns {Object} new state
 */
function requestReducer(state: Object = initialState, action: Object) {
  switch (action.type) {
    case AXIOS_HOOK_ACTIONS.START:
      return {
        ...state,
        isLoading: true,
      };
    case AXIOS_HOOK_ACTIONS.END:
      return {
        ...state,
        isLoading: false,
        response: action.payload,
        error: action.error,
      };
    default:
      return state;
  }
}

/**
 * Axios custom hook
 *
 * @param {UseAxiosConfigTypes} config custom hook parameters including axios config
 *
 * @returns {Array} [{ isLoading, response, error }, request]
 */
export default function useAxios<ResponseType, ErrorType>({
  afterMount = false,
  ...axiosConfig
}: UseAxiosConfigTypes = {}): [
  {|
    isLoading?: boolean,
    response: ResponseType,
    error: ErrorType,
  |},
  (any) => any
] {
  const cancelSourceRef = useRef();
  const unMountedRef = useRef(false);
  const configRef = useRef(axiosConfig); // because 'axiosConfig' is primitive, at each render of the parent using this hook, we'll get a new reference.

  const [state, dispatch] = useReducer(requestReducer, initialState);

  /**
   * the request function that calls axios and dispatches actions
   *
   * @param {Object} config
   * @param {Object} source
   *
   * @returns {void}
   */
  const request = useCallback(async (config: Object, source: Object) => {
    try {
      dispatch({ type: AXIOS_HOOK_ACTIONS.START });
      const response = await axios({ ...config, cancelToken: source.token });
      dispatch({ type: AXIOS_HOOK_ACTIONS.END, payload: response });
    } catch (error) {
      if (!unMountedRef.current) {
        dispatch({ type: AXIOS_HOOK_ACTIONS.END, error });
      }
    }
  }, []);

  useEffect(() => {
    cancelSourceRef.current = axios.CancelToken.source();

    if (afterMount) {
      request(configRef.current, cancelSourceRef.current);
    }
  }, [afterMount, request]);

  useEffect(
    () => () => {
      unMountedRef.current = true;

      if (cancelSourceRef.current) {
        cancelSourceRef.current.cancel();
      }
    },
    []
  );

  return [
    state,
    useCallback(
      (newConfig: Object) =>
        request(
          { ...configRef.current, ...newConfig },
          cancelSourceRef.current
        ),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      []
    ),
  ];
}
