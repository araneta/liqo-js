var koa = require('koa');
var mount = require('koa-mount');
var jwt = require('koa-jwt');

var app = koa();
var port = process.env.PORT || 3000;
var secret = process.env.SIGNING_SECRET || 'secret';

var apiAuth = require('./api/auth');
var apiUsers = require('./api/users');
var apiUser = require('./api/user');
var apiIbadahs = require('./api/ibadahs');
var apiMutabaahs = require('./api/mutabaahs');
var apiGroups = require('./api/groups');
var apiMembers = require('./api/members');

// unprotected middleware
app.use(mount('/api/auth', apiAuth));

// middleware below is protected unless POST request
app.use(jwt({secret: secret}).unless({method: ['POST']}));
// semi-protected middleware
app.use(mount('/api/users', apiUsers));

// middleware below is protected
app.use(jwt({secret: secret}));
// protected middleware
app.use(mount('/api/user', apiUser));
app.use(mount('/api/ibadahs', apiIbadahs));
app.use(mount('/api/mutabaahs', apiMutabaahs));
app.use(mount('/api/groups', apiGroups));
app.use(mount('/api/members', apiMembers));

app.listen(port);
console.log('Server is listening to ' + port);
