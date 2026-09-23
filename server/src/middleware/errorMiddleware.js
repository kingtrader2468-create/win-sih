function notFound(request, response, next) {
  const error = new Error(`Route not found: ${request.method} ${request.originalUrl}`);
  error.statusCode = 404;
  next(error);
}

function errorHandler(error, request, response, next) {
  let statusCode = error.statusCode;
  let message = error.message;

  if (error.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ID format for parameter: ${error.value}`;
  } else if (error.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(error.errors || {})
      .map((e) => e.message)
      .join(', ') || 'Validation error';
  } else if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token.';
  } else if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token expired. Please sign in again.';
  }

  statusCode = statusCode || (response.statusCode === 200 ? 500 : response.statusCode);

  response.status(statusCode).json({
    error: {
      message: message || 'Internal server error'
    }
  });
}

module.exports = { notFound, errorHandler };
