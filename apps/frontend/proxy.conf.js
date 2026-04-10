module.exports = {
  '/api': {
    target: process.env.API_TARGET || 'http://localhost:3030',
    secure: false,
    changeOrigin: true,
  },
};
