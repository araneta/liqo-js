var parse = require('co-body');
var monk = require('monk');
var wrap = require('co-monk');
var bcrypt = require('bcryptjs');
var _ = require('koa-route');
var koa = require('koa');
var jwt = require('koa-jwt');

var app = koa();

var dbUri = process.env.MONGODB_URI || 'localhost/liqo';
var db = monk(dbUri);
var users = wrap(db.get('users'));
var mutabaahs = wrap(db.get('mutabaahs'));
var members = wrap(db.get('members'));

var secret = process.env.SIGNING_SECRET || 'secret';

var routes = {

  // GET current user
  index: function *(next) {
    if ('GET' != this.method) return yield next;

    var token = resolveAuthorizationHeader(this.header.authorization);
    var profile = jwt.verify(token, secret);

    if (!profile)
      throw(401, 'Invalid session');

    var me = yield users.findOne({_id: profile.id});

    if (!me)
      throw(404, 'User with active session was not found');

    var userMembers = yield members.find({user_id: profile.id}, 'group_id');

    this.body = {
      id: profile.id,
      name: me.username,
      groups: userMembers.map(d => d.group_id),
      session: {
        issued_at: profile.iat,
        expired_at: profile.exp
      }
    };
  },

  // GET all mutabaahs by current user
  mutabaahs: function *(next) {
    if ('GET' != this.method) return yield next;

    var token = resolveAuthorizationHeader(this.header.authorization);
    var profile = jwt.verify(token, secret);

    if (!profile)
      throw(401, 'Invalid session');

    var me = yield users.findOne({_id: profile.id});

    if (!me)
      throw(404, 'User with active session was not found');

    var list = yield mutabaahs.find({user_id: profile.id});
    this.body = list;
  },

};

var resolveAuthorizationHeader = function (authorization) {
  if (!authorization) return;

  var parts = authorization.split(' ');

  if (parts.length === 2) {
    var scheme = parts[0];
    var credentials = parts[1];

    if (/^Bearer$/i.test(scheme)) {
      return credentials;
    }
  }
};

app.use(_.get('/', routes.index));
app.use(_.get('/mutabaahs', routes.mutabaahs));

module.exports = app;
