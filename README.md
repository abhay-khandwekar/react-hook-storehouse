global-hookstore  
================
----------------------------------------------------------------------
Global state management nased on React-hooks, with built-in support for both synchronous & queued-asynchronus(FIFO) actions.

----------------------------------------------------------------------
Table of Contents
-----------------
* [Introduction](#introduction) 
* [Install](#install)
* [Features and Glossary](#features-instruction-and-glossary)
    * [Store](#store)   
    * [Slice](#slice)
    * [Actions](#actions)
    * [Synchronous Actions](#synchronous-actions)
    * [Asynchronous Actions](#asynchronous-actions)
* [Using global-hookstore](#using-global-hookstore) 
* [Example](#example)
* [Live Exapmples](#live-exapmples)

### Introduction:
"global-hookstore" is React-hook based state management library. "global-hookstore" supports both synchronous & queued-asynchronus(FIFO) actions. 

All asynchronous state update operations are guaranteed to change the application state in the order of asynchronous-operation invocation.

The global-state is designed to have multiple independent slices within the global store. Each slice is an independent sandbox which contain "state" as well as "actions". Operations performed in context of a given "slice" does not affect other "slices" within the store.

React-components which subscribes a given "slice" are only re-rendered when only the subscribed slice-state gets any update. React-components using a slice have option to optout re-renders on slice-state updates if the need be.

### Install: 
```sh
npm install global-hookstore
```

## Features, Instruction and Glossary:

### Store:
Store refers to a global object holding application state and available action on the state in a React application. 

Under the hood store maintains multiple slices, and each of the slice independently manages it's state using the actions available on the state.

### Slice:
Slice is a an independent subset of the store. A slice holds a subset of application state and available actions on the state.

Any operation in context of a given slice does not impact other slices within the store. Only the components using (subscribed to) a given slice are notified of the state updates and may perform rerender if required.

### Actions:
Actions are methods responsible to update the state of a slice in context. Each action is identified by an "Action-Identifier" which is unique within a slice.

Actions methods recives parameter "currentState" which is a current snapshot of the slice-state.

Actions should return "updatedState", which can be a subset of the state managed by the slice. The state returned by the Action is merged into the slice-state by the global-hookstore.

Actions are of two kinds:
1. [Synchronous Actions](#synchronous-actions)
2. [Asynchronous Actions](#asynchronous-actions)

### Synchronous Actions:
Synchronous action performs state update in synchronous fashion, and are blocking in nature. All state update operations which do not perform I/O or Network oprations are cadidates for synchronous actions. 

```jsx
// Synchronous Action named "SYNCHRONUS_ACTION_IDENTIFIER"
{
SYNCHRONUS_ACTION_IDENTIFIER: (currentState) => {
      try {
        const updatedStateChunk = { n1: 100 };
        return updatedStateChunk;
      } catch (error) {
        throw new Error(error.message);
      }
    }
}
```
### Asynchronous Actions:
Asynchronous action performs state update in asynchronous fashion, and are non-blocking in nature. All Asynchronous operations are expected to return a "promise". All state update operations which perform I/O or Network oprations are cadidates for asynchronous actions. 

```jsx
// Asynchronous Action named "ASYNCHRONUS_ACTION_IDENTIFIER"
{
    ASYNCHRONUS_ACTION_IDENTIFIER: (currentState) => {
      return new Promise((resolve, reject) => {
        (async () => {
          try {
            setTimeout(() => {
              const updatedStateChunk = { n1: 100 };
              resolve(updatedStateChunk);
            }, 100);
          } catch (error) {
            reject(new Error(error.message));
          }
        })();
      });
    }
}
```
### Using global-hookstore:
Using global-hookstore is straight forward, which requires following steps:

***Initialise store-slice (state and actions belonging to a slice) using "initStoreSlice" method.***

"initStoreSlice" method takes 3 parameters:

1. **sliceIdentifier:** Apllication wide unique string value to identify store-slice.
2. **actions:** An object holding all the "actions" to be performed on slice-state. Each action within the "actions" object need to have string "Action-Identifier" which should be unique within the slice.
3. **initialState:** An object having initial state of the slice. 
```jsx
import { initStoreSlice } from "global-hookstore";

  const actions = {
  SYNCHRONUS_ACTION_IDENTIFIER: (currentState) => {
    try {
      const updatedStateChunk = { n1: 100 };
      return updatedStateChunk;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  ASYNCHRONUS_ACTION_IDENTIFIER: (currentState) => {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          setTimeout(() => {
            const updatedStateChunk = { n2: 200 };
            resolve(updatedStateChunk);
          }, 100);
        } catch (error) {
          reject(new Error(error.message));
        }
      })();
    });
  }
};

initStoreSlice("TEST_STORE", actions, {
  n1: 10,
  n2: 20,
  n3: 30
});
```
***Use global-hookstore in React component for state management.***
1. Import **useStore** hook from global-hookstore.
```jsx
import { useStore } from "global-hookstore";
```
2. Use the **useStore** hook with the slice-name of the slice.
```jsx
const {state, dispatch, dispatchAsync} = useStore("TEST_STORE");
```
**state** represents the current state of the slice-state.
**dispatch** method can be used to perform **synchronous (blocking)** operation on slice-state.
**dispatchasync** method can be used to perform **asynchronous (non-blocking)** operation on slice-state.

***OPTIONAL OPTOUT from rerendering of React-components from slice-state updates.***

There might be cases when React-components are only performing actions but not displaying the state (*such as a FORM only adding new items to state but not displaying existing items.*). In such cases React-components can optout rerenders by passing "false" to the parameter 2nd parameter **shouldTriggerRerender** of **useStore** hook. 

By default value of **shouldTriggerRerender** is **true**, thus all slice-state updates will trigger rerender on React-components which are using **useStore** hook.

```jsx
const { state, dispatch, dispatchAsync } = useStore("TEST_STORE", false);

OR

// Not using "state" at all.
const { dispatch, dispatchAsync } = useStore("TEST_STORE", false);
```

***Delete a store-slice if needed.***

If a store-slice is no more needed in the application, it can be deleted from the global-store. **deleteStoreSlice** method of "global-hookstore" can be used to delete a store-slice.

```jsx
import { deleteStoreSlice } from "global-hookstore";

deleteStoreSlice("SLICE_NAME");
```
### Example:

**1. Configure store slice:**

```jsx
// FILE: testStore.js

import { initStoreSlice } from "global-hookstore";

const init = () => {
  const actions = {
    UPDATE1: (currentState) => {
      try {
        const updatedStateChunk = { n1: 100 };
        return updatedStateChunk;
      } catch (error) {
        throw new Error(error.message);
      }
    },

    UPDATE2: (currentState) => {
      try {
        const updatedStateChunk = { n2: 200 };
        return updatedStateChunk;
      } catch (error) {
        throw new Error(error.message);
      }
    },

    UPDATE3: (currentState) => {
      try {
        const updatedStateChunk = { n3: 300 };
        return updatedStateChunk;
      } catch (error) {
        throw new Error(error.message);
      }
    },

    UPDATE1_ASYNC: (currentState) => {
      return new Promise((resolve, reject) => {
        (async () => {
          try {
            setTimeout(() => {
              const updatedStateChunk = { n1: 1000 };
              resolve(updatedStateChunk);
            }, 100);
          } catch (error) {
            reject(new Error(error.message));
          }
        })();
      });
    },

    UPDATE2_ASYNC: (currentState) => {
      return new Promise((resolve, reject) => {
        (async () => {
          try {
            setTimeout(() => {
              const updatedStateChunk = { n2: 2000 };
              resolve(updatedStateChunk);
            }, 500);
          } catch (error) {
            reject(new Error(error.message));
          }
        })();
      });
    },

    UPDATE3_ASYNC: (currentState) => {
      return new Promise((resolve, reject) => {
        (async () => {
          try {
            setTimeout(() => {
              const updatedStateChunk = { n3: 3000 };
              resolve(updatedStateChunk);
            }, 800);
          } catch (error) {
            reject(new Error(error.message));
          }
        })();
      });
    }
  };

  const initialState = {
    n1: 10,
    n2: 20,
    n3: 30
  };

  initStoreSlice("TEST_STORE", actions, initialState);
};

export default init;
```

**2. Initialise store slice:**

```jsx
// FILE: index.js

import React from "react";
import ReactDOM from "react-dom";

import App from "./App";
import initTestStore from "./store/testStore";

// Initialising "TEST_STORE"
initTestStore();

const rootElement = document.getElementById("root");
ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  rootElement
);
```

**3. Managing state in component:**

```jsx
// FILE: App.js

import React from "react";
import { useStore } from "global-hookstore";
import "./styles.css";

export default function App() {
  const { state, dispatch, dispatchAsync } = useStore("TEST_STORE");
  
  const SyncUpdate = () => {
    dispatch("UPDATE1");
    dispatch("UPDATE2");
    dispatch("UPDATE3");
  };

  const AsyncUpdate = () => {
    dispatchAsync("UPDATE1_ASYNC");
    dispatchAsync("UPDATE2_ASYNC");
    dispatchAsync("UPDATE3_ASYNC");
  };

  return (
    <div className="App">
      <p>1. {state.n1}</p>
      <p>2. {state.n2}</p>
      <p>3. {state.n3}</p>
      <p><button onClick={SyncUpdate}>Synchronous Update</button></p>
      <p><button onClick={AsyncUpdate}>Asynchronous Update</button></p>
    </div>
  );
}
```

### Live Exapmples:

1. **State update with Synchronous and Asynchronous actions -**
[https://codesandbox.io/s/global-statehook-sync-async-actions-rkipy](https://codesandbox.io/s/global-statehook-sync-async-actions-rkipy)
2. **Optout component rerender on state update -**
[https://codesandbox.io/s/global-statehook-optout-rerender-zuvo6](https://codesandbox.io/s/global-statehook-optout-rerender-zuvo6)
3. **Using multiple state-slices -**
[https://codesandbox.io/s/global-statehook-multiple-state-slices-9nec4?file=/src/index.js](https://codesandbox.io/s/global-statehook-multiple-state-slices-9nec4?file=/src/index.js)

### Author:
Abhay Kumar

### License:
This project is licensed under the MIT License.
