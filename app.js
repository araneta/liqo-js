var koa = require('koa');
var mount = require('koa-mount');

var app = koa();
var port = process.env.PORT || 3000;

var apiAuth = require('./api/auth');
var apiUsers = require('./api/users');
var apiIbadahs = require('./api/ibadahs');

app.use(mount('/api/auth', apiAuth));
app.use(mount('/api/users', apiUsers));
app.use(mount('/api/ibadahs', apiIbadahs));

app.listen(port);
console.log('Server is listening to ' + port);
