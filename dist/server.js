"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _express = require("express");

var _express2 = _interopRequireDefault(_express);

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

var _httpProxyMiddleware = require("http-proxy-middleware");

var _httpProxyMiddleware2 = _interopRequireDefault(_httpProxyMiddleware);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @author Erkki Nokso-Koivisto / http://www.vihrearobotti.com/
 */

class Server {

  start() {

    const app = (0, _express2.default)();

    // CORS proxy to access program API
    app.use('/v1', (0, _httpProxyMiddleware2.default)({ target: 'https://external.api.yle.fi/', changeOrigin: true, logLevel: "debug" }));
    // CORS proxy to access program icons for menu grid
    app.use('/image/upload/', (0, _httpProxyMiddleware2.default)({ target: 'http://images.cdn.yle.fi/', changeOrigin: true, logLevel: "debug" }));
    // CORS proxy access video stream, host seems to change per media type
    app.use('/world/', (0, _httpProxyMiddleware2.default)({ target: 'http://areenapmdworld-a.akamaihd.net/', changeOrigin: true, logLevel: "debug" }));
    // to access static HTML/image stuff in dist/ folder
    app.use(_express2.default.static(_path2.default.join(__dirname, '.')));

    app.listen(8080);
  }
}

exports.default = Server;
const server = new Server();
server.start();
