const http = require('http');
const routes = require('./module/routes')

http.createServer(function(req, res) {
    routes.static(req, res, 'static')

}).listen(3000);

console.log('Server running at http://127.0.0.1:3000/');