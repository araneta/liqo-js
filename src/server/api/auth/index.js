var parse = require('co-body');
var monk = require('monk');
var wrap = require('co-monk');
var bcrypt = require('bcryptjs');
var jwt = require('koa-jwt');
var _ = require('koa-route');
var koa = require('koa');

var app = koa();

var dbUri = process.env.MONGODB_URI || 'localhost/liqo';
var db = monk(dbUri);
var users = wrap(db.get('users'));

var secret = process.env.SIGNING_SECRET || 'secret';

var routes = {

  check: function *(next) {
    if (this.method == 'POST' ||
        this.method == 'OPTIONS' ||
        this.method == 'HEAD' ||
        this.method == 'TRACE')
    {
      yield next;
    }
    else {
      this.throw(405, 'Method is not allowed');
    }
  },

  // POST a new user
  auth: function *(next) {
    if ('POST' != this.method) return yield next;

    var body = yield parse(this);
    if (!body.username)
      this.throw(400, 'Username is required');

    if (!body.password)
      this.throw(400, 'Password is required');

    var foundUser = yield users.findOne({username: body.username});
    if (!foundUser)
      this.throw(400, 'User with username=' + body.username + ' is not exists');

    var validPassword = bcrypt.compareSync(body.password, foundUser.password);
    if (!validPassword)
      this.throw(401, 'Username or password is incorrect');

    var profile = {
      id: foundUser._id
    };
    var token = jwt.sign(profile, secret, { expiresIn: 60*60*24 });

    this.set('Authorization', 'Bearer ' + token);
    this.body = 'Done';
  },

  // HEAD
  head: function *() {
    this.set('Connection', 'Close');
    this.status = 200;
  },

  // OPTIONS
  options: function *() {
    this.set('Allow', 'HEAD,POST,OPTIONS');
    this.status = 200;
  },

  // TRACE
  trace: function *() {
    this.body = 'You cannot trace :)';
  }
};

app.use(routes.check);
app.use(_.post('/', routes.auth));
app.use(_.options('/', routes.options));
app.use(_.trace('/', routes.trace));
app.use(_.head('/', routes.head));

module.exports = app;
