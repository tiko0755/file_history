import winston from 'winston';
import morgan from 'morgan';
import { randomUUID } from 'crypto';

// 自定义日志格式
const customFormat = winston.format.printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${timestamp} [${level}]: ${message}`;
  if (Object.keys(metadata).length > 0) {
    msg += ` ${JSON.stringify(metadata)}`;
  }
  return msg;
});

// 创建 logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    customFormat
  ),
  transports: [
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error',
      maxsize: 10485760, // 10MB
      maxFiles: 5,
      format: winston.format.json()
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log',
      maxsize: 10485760,
      maxFiles: 5,
      format: winston.format.json()
    })
  ]
});

// 开发环境添加控制台输出
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// 自定义 morgan token 用于记录请求ID
morgan.token('request-id', (req) => req.id || 'N/A');
morgan.token('body', (req) => JSON.stringify(req.body));

// 创建带请求ID的中间件
const requestIdMiddleware = (req, res, next) => {
  req.id = randomUUID();
  next();
};

// 创建 morgan 中间件（增强版）
const morganMiddleware = morgan(
  ':request-id :method :url :status :response-time ms - :res[content-length] :user-agent',
  { 
    stream: {
      write: (message) => logger.http(message.trim())
    }
  }
);

// 为每个请求创建子 logger
const requestLoggerMiddleware = (req, res, next) => {
  req.logger = logger.child({ requestId: req.id });
  next();
};

export { logger, morganMiddleware, requestIdMiddleware, requestLoggerMiddleware };