const winston = require('winston');
const isProduction = process.env.NODE_ENV === 'production';

const logger = winston.createLogger({
    level: isProduction ? 'info' : 'debug', // More verbose in dev
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }), // Handle stack traces
        winston.format.splat(),
        isProduction
            ? winston.format.json() // JSON for prod (easier for log aggregators like ELK)
            : winston.format.simple() // Human-readable for dev
    ),
    transports: [
        new winston.transports.Console({
            format: isProduction ? winston.format.json() : winston.format.colorize({ all: true }), // Colorize in dev console
        }),
        // Add file transport for production (optional: use daily-rotate-file for rotation)
        ...(isProduction
            ? [
                new winston.transports.File({
                    filename: 'error.log',
                    level: 'error', // Only errors to this file
                }),
                new winston.transports.File({
                    filename: 'combined.log', // All logs
                }),
            ]
            : []),
    ],
    // Handle uncaught exceptions and rejections
    exceptionHandlers: [
        new winston.transports.Console(),
        ...(isProduction ? [new winston.transports.File({ filename: 'exceptions.log' })] : []),
    ],
    rejectionHandlers: [
        new winston.transports.Console(),
        ...(isProduction ? [new winston.transports.File({ filename: 'rejections.log' })] : []),
    ],
});

module.exports = logger