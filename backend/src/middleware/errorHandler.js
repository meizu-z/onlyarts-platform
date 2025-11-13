const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // MySQL errors
  if (err.code) {
    switch (err.code) {
      case 'ER_DUP_ENTRY': // Duplicate entry (unique violation)
        statusCode = 409;
        message = 'Resource already exists';
        break;
      case 'ER_NO_REFERENCED_ROW':
      case 'ER_NO_REFERENCED_ROW_2': // Foreign key violation
        statusCode = 400;
        message = 'Referenced resource does not exist';
        break;
      case 'ER_BAD_FIELD_ERROR': // Unknown column
        statusCode = 400;
        message = 'Invalid field';
        break;
      case 'ER_PARSE_ERROR': // SQL syntax error
        statusCode = 400;
        message = 'Invalid data format';
        break;
      default:
        statusCode = 500;
        message = 'Database error';
    }
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
