"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendRes = void 0;
const sendRes = (res, data) => {
    const resData = {
        statusCode: data.statusCode,
        success: data.success,
        message: data.message || null,
        result: data.result || null,
    };
    res.status(data.statusCode).send(resData);
};
exports.sendRes = sendRes;
