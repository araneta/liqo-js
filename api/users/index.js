var parse = require('co-body');
var monk = require('monk');
var wrap = require('co-monk');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var _ = require('koa-route');
var koa = require('koa');

var app = koa();

var dbUri = process.env.MONGODB_URI || 'localhost/liqo';
var db = monk(dbUri);
var users = wrap(db.get('users'));

var routes = {

  // GET all users
  index: function *(next) {
    if ('GET' != this.method) return yield next;

    var list = yield users.find({});
    this.body = list;
  },

  // GET user by :id
  show: function *(id, next) {
    if ('GET' != this.method) return yield next;

    var user = yield users.findOne({_id: id});

    if (!user)
      this.throw(404, 'User with id=' + id + ' was not found');

    this.body = user;
  },

  // POST a new user
  create: function *(next) {
    if ('POST' != this.method) return yield next;

    var body = yield parse(this);
    if (!body.username)
      this.throw(400, 'Username is required');

    if (!body.password)
      this.throw(400, 'Password is required');

    var foundUser = yield users.findOne({username: body.username});
    if (foundUser)
      this.throw(409, 'User with username=' + body.username + ' is exists');

    body.password = bcrypt.hashSync(body.password);
    var createdUser = yield users.insert(body);
    if (!createdUser)
      this.throw(405, 'User could not be created');

    this.status = 201;
    this.set('Location', this.originalUrl + '/' + createdUser._id);
    this.body = 'Done';
  },

  // PUT a new data to user by :id
  modify: function *(id, next) {
    if ('PUT' != this.method) return yield next;

    var data = yield parse(this);

    var user = yield users.findOne({_id: id});
    if (!user)
      this.throw (404, 'User with id=' + id + ' was not found');

    var updatedUser = users.update(user, {$set: data});
    if (!updatedUser)
      this.throw(405, 'Unable to update');
    else
      this.body = 'Done';
  },

  // REMOVE user by :id
  remove: function *(id, next) {
    if ('DELETE' != this.method) return yield next;
  },

  // HEAD
  head: function *() {
    this.set('Connection', 'Close');
    this.status = 200;
  },

  // OPTIONS
  options: function *() {
    this.set('Allow', 'HEAD,GET,PUT,DELETE,OPTIONS');
    this.status = 200;
  },

  // TRACE
  trace: function *() {
    this.body = 'You cannot trace :)';
  }
};

app.use(_.get('/', routes.index));
app.use(_.get('/:id', routes.show));
app.use(_.post('/', routes.create));
app.use(_.put('/:id', routes.modify));
app.use(_.delete('/:id', routes.remove));
app.use(_.options('/', routes.options));
app.use(_.trace('/', routes.trace));
app.use(_.head('/', routes.head));

module.exports = app;
