import logger from '../utils/logger.js';

/**
 * Global error handling middleware.
 */
const errorHandler = (err, req, res, _next) => {
  logger.error(`${err.message}`, { stack: err.stack, path: req.path, method: req.method });

  // Validation errors from express-validator
  if (err.type === 'validation') {
    return res.status(400).json({ error: 'Validation failed', details: err.errors });
  }

  // Multer file upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
  }
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({ error: 'Unexpected file field.' });
  }

  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 ? 'Internal server error' : err.message;

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export default errorHandler;
