"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const winston = require("winston");
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    // defaultMeta: { service: 'userService' },
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'combined.log' }),
    ],
});
exports.default = logger;
//# sourceMappingURL=loggers.js.map