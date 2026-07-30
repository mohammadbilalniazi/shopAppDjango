let refreshPromise: Promise<void> | null = null;

/**
 * Returns the current refresh promise if a refresh is in progress.
 */
export const getRefreshPromise = (): Promise<void> | null => refreshPromise;

/**
 * Sets a refresh promise. Useful when a refresh call is started.
 */
export const setRefreshPromise = (promise: Promise<void>): void => {
  refreshPromise = promise;
  // Clear the promise once it resolves or rejects
  promise.finally(() => {
    refreshPromise = null;
  });
};

/**
 * Explicitly clear the refresh promise (optional, usually handled by finally)
 */
export const clearRefreshPromise = (): void => {
  refreshPromise = null;
};
