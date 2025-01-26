"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLogger = void 0;
const winston_1 = require("winston");
const createLogger = (name) => {
    return (0, winston_1.createLogger)({
        level: process.env.LOG_LEVEL || 'info',
        format: winston_1.format.combine(winston_1.format.timestamp(), winston_1.format.label({ label: name }), winston_1.format.printf((info) => {
            return `${info.timestamp} [${info.label}] ${info.level}: ${info.message}`;
        })),
        transports: [
            new winston_1.transports.Console(),
            new winston_1.transports.File({ filename: 'error.log', level: 'error' }),
            new winston_1.transports.File({ filename: 'combined.log' })
        ]
    });
};
exports.createLogger = createLogger;
//# sourceMappingURL=logger.js.map