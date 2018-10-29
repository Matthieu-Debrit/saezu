'use strict';

class RequestError extends Error {
    constructor(httpCode = 500, ...params) {
        super(...params);
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, RequestError);
        }
        this.httpCode = httpCode;
        if (!this.message) {
            this.message = 'Unknown error';
        }
    }
}

module.exports = RequestError;