// fetch.js
/**
 * © 2019 Cast Corporation <https://cast.app>
 *
 * @module
 */

"use strict";

function exponential_backoff(attempt) {
    // exponential backoff
    // https://cloud.google.com/iot/docs/how-tos/exponential-backoff
    // The wait time is min(((2^n)+random_number_milliseconds), MAXIMUM_BACKOFF_MILLISECONDS), with n incremented by 1 for each iteration (request).
    const MAXIMUM_BACKOFF_MILLISECONDS = 64000;
    const random_number_milliseconds = Math.floor(Math.random() * 1000 + 1);
    return Math.min(Math.pow(2, attempt) * 1000 + random_number_milliseconds, MAXIMUM_BACKOFF_MILLISECONDS);
}

const getNetworkRetryInterval = (attempt) => {
    const intervals = [0.1, 0.5, 1, 2, 2, 4];
    const index = attempt % intervals.length;
    return intervals[index] * 1000;
};

function retryOnAnyNetworkError(attempt, error, response) {
    // retry on any network error, or 4xx or 5xx status codes
    // Any falsy value will result in the call to fetch either resolving (in case the last attempt resulted in a response), or rejecting (in case the last attempt resulted in an error).
    if (error !== null || response.status >= 400) {
        // console.log(`retrying, attempt number ${attempt + 1} response: ${JSON.stringify(response)} error: ${error}`);
        return true;
    }
    return false;
}

function castFetch() {
    return function fetchRetry(resource, init) {
        const retryDelay = getNetworkRetryInterval;
        const retryOn = retryOnAnyNetworkError;

        return new Promise((resolve, reject) => {
            const wrappedFetch = (attempt) => {
                fetch(resource, init)
                    .then(function (response) {
                        if (retryOn(attempt, null, response)) {
                            retry(attempt);
                        } else {
                            resolve(response);
                            ErrorHandler.closePopAlert();
                        }
                    })
                    .catch(function (error) {
                        retry(attempt);
                    });
            };

            const retry = (attempt) => {
                if (attempt > 6) {
                    errorEventHandler();
                }
                var delay = retryDelay(attempt);
                setTimeout(() => {
                    wrappedFetch(++attempt);
                }, delay);
            };

            wrappedFetch(0);
        });
    };
}
