// Client-safe logger that works in both browser and server environments
const isServer = typeof window === 'undefined';

let logger, apiLogger, dbLogger, authLogger, deviceLogger;

if (isServer) {
  // Server-side Winston logger
  const winston = require('winston');
  const path = require('path');

  // Define log format
  const logFormat = winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.json(),
    winston.format.prettyPrint()
  );

  // Create logs directory if it doesn't exist
  const logsDir = path.join(process.cwd(), 'logs');

  // Configure Winston logger
  logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: logFormat,
    defaultMeta: { service: 'marelli-dashboard' },
    transports: [
      // Write all logs with importance level of `error` or less to `error.log`
      new winston.transports.File({ 
        filename: path.join(logsDir, 'error.log'), 
        level: 'error',
        maxsize: 5242880, // 5MB
        maxFiles: 10,
        tailable: true
      }),
      
      // Write all logs with importance level of `info` or less to `combined.log`
      new winston.transports.File({ 
        filename: path.join(logsDir, 'combined.log'),
        maxsize: 5242880, // 5MB
        maxFiles: 10,
        tailable: true
      }),

      // Write API access logs
      new winston.transports.File({
        filename: path.join(logsDir, 'access.log'),
        level: 'http',
        maxsize: 5242880, // 5MB
        maxFiles: 10,
        tailable: true
      })
    ],
    
    // Exception handling
    exceptionHandlers: [
      new winston.transports.File({ 
        filename: path.join(logsDir, 'exceptions.log') 
      })
    ],
    
    // Rejection handling
    rejectionHandlers: [
      new winston.transports.File({ 
        filename: path.join(logsDir, 'rejections.log') 
      })
    ]
  });

  // If we're not in production, log to the console as well
  if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          return `${timestamp} [${level}]: ${message} ${
            Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
          }`;
        })
      )
    }));
  }

  // Create specific loggers for different purposes
  apiLogger = logger.child({ component: 'api' });
  dbLogger = logger.child({ component: 'database' });
  authLogger = logger.child({ component: 'auth' });
  deviceLogger = logger.child({ component: 'device' });
} else {
  // Client-side fallback logger using console
  const createConsoleLogger = (level) => ({
    error: (message, meta = {}) => console.error(`[${level}] ${message}`, meta),
    warn: (message, meta = {}) => console.warn(`[${level}] ${message}`, meta),
    info: (message, meta = {}) => console.info(`[${level}] ${message}`, meta),
    debug: (message, meta = {}) => console.debug(`[${level}] ${message}`, meta),
    http: (message, meta = {}) => console.log(`[${level}] ${message}`, meta),
    child: (meta) => createConsoleLogger(level)
  });

  logger = createConsoleLogger('APP');
  apiLogger = createConsoleLogger('API');
  dbLogger = createConsoleLogger('DB');
  authLogger = createConsoleLogger('AUTH');
  deviceLogger = createConsoleLogger('DEVICE');
}

// Request logger middleware (server-side only)
export function requestLogger(req, res, next) {
  if (!isServer) {
    return next();
  }

  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    };

    if (res.statusCode >= 400) {
      apiLogger.warn('HTTP Request', logData);
    } else {
      apiLogger.http('HTTP Request', logData);
    }
  });

  next();
}

// Device data logger
export function logDeviceData(deviceData, action = 'received') {
  const logData = {
    deviceName: deviceData.deviceName,
    devEUI: deviceData.devEUI,
    temperature: deviceData.temperature,
    humidity: deviceData.humidity,
    timestamp: deviceData.timestamp,
    action
  };

  if (isServer) {
    deviceLogger.info(`Device data ${action}`, logData);
  } else {
    console.log(`[DEVICE] Device data ${action}`, logData);
  }
}

// Authentication logger
export function logAuth(user, action, success = true, details = {}) {
  const logData = {
    userId: user?._id,
    username: user?.name,
    action,
    success,
    ip: details.ip,
    userAgent: details.userAgent,
    timestamp: new Date().toISOString(),
    ...details
  };

  if (isServer) {
    if (success) {
      authLogger.info(`Auth ${action} successful`, logData);
    } else {
      authLogger.warn(`Auth ${action} failed`, logData);
    }
  } else {
    console.log(`[AUTH] Auth ${action} ${success ? 'successful' : 'failed'}`, logData);
  }
}

// Database operation logger
export function logDbOperation(operation, collection, query = {}, result = null) {
  const logData = {
    operation,
    collection,
    query: JSON.stringify(query),
    resultCount: Array.isArray(result) ? result.length : result ? 1 : 0,
    timestamp: new Date().toISOString()
  };

  if (isServer) {
    dbLogger.info(`Database ${operation}`, logData);
  } else {
    console.log(`[DB] Database ${operation}`, logData);
  }
}

// Performance logger
export function logPerformance(operation, duration, details = {}) {
  const logData = {
    operation,
    duration: `${duration}ms`,
    ...details,
    timestamp: new Date().toISOString()
  };

  if (isServer) {
    logger.info('Performance metric', logData);
  } else {
    console.log(`[PERF] Performance metric`, logData);
  }
}

// Error logger
export function logError(error, context = {}) {
  const logData = {
    error: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString()
  };

  if (isServer) {
    logger.error('Application Error:', logData);
  } else {
    console.error('[ERROR] Application Error:', logData);
  }
}

export { apiLogger, dbLogger, authLogger, deviceLogger };
export default logger; 