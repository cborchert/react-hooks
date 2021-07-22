# React Custom Hooks

The useAxios hook for React that automatically handles the request cancellation on unmount, triggers the call after mount or manually, etc.

# How to use useAxios custom hook
 ```javascript 
 const [{ isLoading, response, error }, request] = useAxios({
      method: 'get',
      url: 'my-url',
      afterMount: true,
      axiosConfig
    });
```
 
 Inputs:
 * `{boolean}` _afterMount_: set to true will execute the axios call just after the mount. It's false by default.
 * `{Object}` _axiosConfig_: all classic axios config object.
 
 Outputs
 * `{Function}` _request_: a function that will trigger axios call manually with extended axios config object (optional) as parameter.
 * `{boolean}` isLoading_: a flag set to true when the axios call is in process, by default 'false'.
 * `{Object}` _response_: an object that contains the data response if the axios call is successful, by default 'undefined'.
 * `{Object}`_error_: an object that contains the error object if the axios call has failed, by default 'undefined'.

 ## A note on type annotations

 You may add a generic type annotation to the `useAxios` hook to make it more explicit about the return types. The first parameter `ResponseType` defines the expected type of the response. The second parameter `ErrorType` defines the expected type of the error.

Usage: 

```javascript
type ResponseType = {
  data: { foo: string },
  status: number,
};

type ErrorType = {
  response: {
    status: number,
    data: {
      code: string,
    }
  }
}

const [{ isLoading, response, error }, request] = useAxios<ResponseType, ErrorType>(myAxiosConfig);

// response is of type ResponseType
// error is of type ErrorType
// isLoading is of type ?boolean
// request is of type any => any

```

# How to test your custom Hooks
If you use Enzyme to test your React components, you can use a tiny hook mounter _mountHook_ based on Enzyme mount to test your custom hooks. See **enzymeHelpers.js** for more details.
