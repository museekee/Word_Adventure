const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    ["/login", "/myData"],
    createProxyMiddleware({
      target: 'http://localhost:3840',
      changeOrigin: true,
    })
  );
};