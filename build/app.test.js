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
const request = require("supertest");
const app_1 = require("./src/app");
describe('/users', () => {
    it('Post call for login', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield request(app_1.default).get('/users');
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('User loggedin successfully');
    }));
});
//# sourceMappingURL=app.test.js.map