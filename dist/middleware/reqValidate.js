"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const reqValidate = (schema) => (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Parse and validate - this also applies transforms
        const validatedData = yield schema.parseAsync({
            body: req.body,
            query: req.query,
            params: req.params,
            cookies: req.cookies,
        });
        // Assign transformed values back to request object
        // This ensures transformed query params (like page/limit) are available
        if (validatedData.query) {
            req.query = validatedData.query;
        }
        if (validatedData.body) {
            req.body = validatedData.body;
        }
        if (validatedData.params) {
            req.params = validatedData.params;
        }
        return next();
    }
    catch (error) {
        next(error);
    }
});
exports.default = reqValidate;
