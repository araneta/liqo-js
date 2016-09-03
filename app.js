var koa = require('koa');
var mount = require('koa-mount');

var app = koa();
var port = process.env.PORT || 3000;

var apiUsers = require('./api/users');

app.use(mount('/api/users', apiUsers));

app.listen(port);
console.log('Server is listening to ' + port);
