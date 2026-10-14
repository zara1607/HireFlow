const getCorsOrigin = (environment = process.env) => {
  if (environment.NODE_ENV !== 'production') return true;
  return environment.CLIENT_URL || 'http://localhost:5173';
};

module.exports = { getCorsOrigin };