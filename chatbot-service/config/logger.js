// config/logger.js
const winston = require('winston');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.printf(({ level, message, timestamp }) =>
            `${timestamp} [CHATBOT ${level.toUpperCase()}]: ${message}`
        )
    ),
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.printf(({ level, message, timestamp }) =>
                    `${timestamp} [CHATBOT ${level}]: ${message}`
                )
            )
        })
    ]
});

module.exports = logger;
