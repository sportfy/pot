// src/utils/errorLogger.js

/**
 * Logs and reports any errors that occur during the GitHub Actions run.
 * @param {Error} error - The error object to be logged and reported.
 */
function logError(error) {
  const errorMessage = error.message;
  const stackTrace = error.stack;
  const additionalDetails = error.additionalDetails || '';

  console.error('Error occurred:');
  console.error(errorMessage);
  console.error('Stack Trace:');
  console.error(stackTrace);
  console.error('Additional Details:');
  console.error(additionalDetails);

  // Optionally, send error information to a remote error reporting service
  // reportErrorToService(errorMessage, stackTrace, additionalDetails);
}

module.exports = {
  logError,
};
