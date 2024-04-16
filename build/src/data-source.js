"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const User_1 = require("./entity/User");
const dotenv = require("dotenv");
const loggers_1 = require("../util/loggers");
dotenv.config();
exports.AppDataSource = new typeorm_1.DataSource({
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: process.env.USER_NAME,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    synchronize: true,
    logging: false,
    entities: [User_1.User],
    migrations: [],
    subscribers: [],
});
exports.AppDataSource.initialize()
    .then(() => {
    loggers_1.default.info("Data Source has been initialized!");
})
    .catch((err) => {
    loggers_1.default.error("Error during Data Source initialization", err);
});
//# sourceMappingURL=data-source.js.map