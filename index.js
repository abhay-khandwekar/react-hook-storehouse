import { useState, useEffect, useCallback } from "react";

const enqueue = function (job) {
  return new Promise((resolve, reject) => {
    this.asyncJobs.push({ job: job, resolve: resolve, reject: reject });
    this.dequeue();
  });
};

const dequeue = function () {
  if (this.workingOnPromise) {
    return false;
  }
  const item = this.asyncJobs.shift();
  if (!item) {
    return false;
  }
  try {
    this.workingOnPromise = true;
    (async () => {
      const result = await item.job();
      this.workingOnPromise = false;
      item.resolve(result);
      this.dequeue();
    })();
  } catch (err) {
    this.workingOnPromise = false;
    item.reject(err);
    this.dequeue();
  }
  return true;
};

let universe = {};

export const useStore = (sliceIdentifier, shouldTriggerRerender = true) => {
  const setState = useState(universe[sliceIdentifier].globalState)[1];

  const dispatchAsync = useCallback(
    (actionIdentifier, payload) => {
      const { globalState, listners, actions } = universe[sliceIdentifier];
      return universe[sliceIdentifier].enqueue(() => {
        return new Promise((resolve, reject) => {
          (async () => {
            try {
              const updatedStateChunk = await actions[actionIdentifier](
                globalState,
                payload
              );
              universe[sliceIdentifier].globalState = {
                ...universe[sliceIdentifier].globalState,
                ...updatedStateChunk
              };
              for (const listner of listners) {
                listner(universe[sliceIdentifier].globalState);
              }
              resolve();
            } catch (error) {
              reject(new Error(error.message));
            }
          })();
        });
      });
    },
    [sliceIdentifier]
  );

  const dispatch = useCallback(
    (actionIdentifier, payload) => {
      const { globalState, listners, actions } = universe[sliceIdentifier];

      try {
        const updatedStateChunk = actions[actionIdentifier](
          globalState,
          payload
        );
        universe[sliceIdentifier].globalState = {
          ...universe[sliceIdentifier].globalState,
          ...updatedStateChunk
        };
        for (const listner of listners) {
          listner(universe[sliceIdentifier].globalState);
        }
      } catch (error) {
        throw new Error(error.message);
      }
    },
    [sliceIdentifier]
  );

  useEffect(() => {
    let { listners } = universe[sliceIdentifier];
    if (shouldTriggerRerender) {
      listners.push(setState);

      return () => {
        listners = listners.filter((listner) => listner !== setState);
      };
    }
  }, [setState, shouldTriggerRerender, sliceIdentifier]);

  return {state: universe[sliceIdentifier].globalState, dispatch: dispatch, dispatchAsync: dispatchAsync};
};

export const initStoreSlice = (sliceIdentifier, actions, initialState) => {
  universe[sliceIdentifier] = {
    globalState: initialState,
    listners: [],
    actions: actions,
    asyncJobs: [],
    workingOnPromise: false,
    enqueue: enqueue,
    dequeue: dequeue
  };
};

export const deleteStoreSlice = (sliceIdentifier) => {
  delete universe[sliceIdentifier];
};