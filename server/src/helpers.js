'use strict';
const RequestError = require('../src/RequestError');


exports.wrapError = function (error) {
    if (error instanceof RequestError) {
        throw error;
    } else if (error instanceof Error) {
        if (error.code === 'ECONNREFUSED') {
            throw new RequestError(500, 'Can\'t connect to database');
        } else {
            console.error(`Server error caught: ${error.toString()}`);
            throw new RequestError(500, 'Server caught an unknown error');
        }
    } else {
        console.error(`Unhandled server error type: ${error.toString()}\nStack: ${error.stack}`);
        throw new RequestError(500, 'Internal Server Error');
    }
};

exports.handleError = function (res, error) {
    if (error instanceof RequestError) {
        res.status(error.httpCode).json({message: error.message});
    } else {
        console.error(`Unhandled server error: ${error.toString()}\nStack: ${error.stack}`);
        res.status(500).json({message: 'Internal Server Error'});
    }
};

exports.handleSuccess = function (res, data, httpCode = 200) {
    res.status(httpCode).json(data);
};