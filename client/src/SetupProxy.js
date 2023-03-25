const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    ["/login/*", "/socket.io/*", "/api/*"],
    createProxyMiddleware({
      target: 'http://localhost:3840',
      changeOrigin: true,
    })
  );
};