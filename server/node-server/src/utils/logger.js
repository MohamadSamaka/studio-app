const fs = require('fs');
const path = require('path');
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf } = format;
const DailyRotateFile = require('winston-daily-rotate-file');

// Ensure the logs directory exists
const logDir = path.join(__dirname, '../logs');

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Define the log format, including metadata
const logFormat = printf(({ level, message, timestamp, ...metadata }) => {
  let meta = '';
  if (Object.keys(metadata).length !== 0) {
    meta = JSON.stringify(metadata);
  }
  return `${timestamp} [${level}] ${message} ${meta}`;
});

// Create the admin logger
const adminLogger = createLogger({
  level: 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  ),
  transports: [
    // Daily rotating file transport
    new DailyRotateFile({
      filename: path.join(logDir, 'admin-%DATE%.log'),
      datePattern: 'YYYY-MM-DD', // Rotate logs daily
      zippedArchive: true,
      maxFiles: '90d', // Keep logs for the last 90 days (~3 months)
      // Optionally, specify the audit file
      // auditFile: path.join(logDir, '.admin_audit.json'),
    }),
  ],
});

// Add error listener to adminLogger
adminLogger.on('error', (err) => {
  console.error('Admin Logger error:', err);
});

// Create the user logger
const userLogger = createLogger({
  level: 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  ),
  transports: [
    // Daily rotating file transport
    new DailyRotateFile({
      filename: path.join(logDir, 'user-%DATE%.log'),
      datePattern: 'YYYY-MM-DD', // Rotate logs daily
      zippedArchive: true,
      maxFiles: '90d', // Keep logs for the last 90 days (~3 months)
      // Optionally, specify the audit file
      // auditFile: path.join(logDir, '.user_audit.json'),
    }),
  ],
});

// Add error listener to userLogger
userLogger.on('error', (err) => {
  console.error('User Logger error:', err);
});

// Create the error logger
const errorLogger = createLogger({
  level: 'error',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  ),
  transports: [
    // Daily rotating file transport for errors
    new DailyRotateFile({
      filename: path.join(logDir, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD', // Rotate logs daily
      zippedArchive: true,
      maxFiles: '90d', // Keep logs for the last 90 days (~3 months)
      // Optionally, specify the audit file
      // auditFile: path.join(logDir, '.error_audit.json'),
    }),
  ],
});

// Add error listener to errorLogger
errorLogger.on('error', (err) => {
  console.error('Error Logger error:', err);
});

module.exports = {
  adminLogger,
  userLogger,
  errorLogger,
};