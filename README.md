global-hookstore  
================
----------------------------------------------------------------------
React hook based state management, with built-in support for both synchronous & queued-asynchronus(FIFO) actions.

----------------------------------------------------------------------
Table of Contents
-----------------
* [Introduction](#introduction) 
* [Install](#install)
* [Features and Glossary](#features-and-glossary)
    * [Store](#store)   
    * [Slice](#slice)
    * [Actions](#actions)
    * [Synchronous Actions](#synchronous-actions)
    * [Asynchronous Actions](#asynchronous-actions)
* [Example](#example)

### Introduction:
"global-hookstore" is React-hook based state management library. "global-hookstore" supports both synchronous & queued-asynchronus(FIFO) actions. 

All asynchronous state update operation are guaranteed to edit the application state in the order of asynchronous-operation invocation.

The global-state is designed to have multiple independent slices of the state. Each slice is a sandbox which contain "state" as well as "actions". Operations in context of a given "slice" does not affect other "slices" within the store.

React-components which subscribed (used) a given "slice" are only re-rendered on slice-state update. React-components have oprion to optout re-renders on slice-state updates if the need be.

### Install: 
```sh
npm install global-hookstore
```

or

```sh
yarn add global-hookstore
```

## Features, Instruction and Glossary:

### Store:
Store refers to a global object holding application state and available action on the state in a React application.

### Slice:
Slice is a an independent subset of the store. A slice holds a subset of application state and available actions on the state.

Any operation in context of a given slice does not impact other slices within the store. Only the components using (subscribed to) a given slice are notified of the state updates and may perform rerender if required.

### Actions:
Actions are methods responsible to update the state of a slice in context. Each action is identified by an "Action Identifier" which is unique within a slice.

Actions methods recives parameter "currentState" which is a current snapshot of the slice-state.

Actions should return "updatedState", which can be a subset of the state within a slice. The state returned by the Action is merged into the slice-state by the global-hookstore.

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



### Example:

**1. Create store slice:**
