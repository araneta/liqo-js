var parse = require('co-body');
var monk = require('monk');
var wrap = require('co-monk');
var _ = require('koa-route');
var koa = require('koa');

var app = koa();

var dbUri = process.env.MONGODB_URI || 'localhost/liqo';
var db = monk(dbUri);
var members = wrap(db.get('members'));

var routes = {

  // GET all members
  index: function *(next) {
    if ('GET' != this.method) return yield next;

    var list = yield members.find({});
    this.body = list;
  },

  // GET members by :id
  show: function *(id, next) {
    if ('GET' != this.method) return yield next;

    var member = yield members.findOne({_id: id});

    if (!member)
      this.throw(404, 'Member with id=' + id + ' was not found');

    this.body = member;
  },

  // POST a new member
  create: function *(next) {
    if ('POST' != this.method) return yield next;

    var body = yield parse(this);
    if (!body.group_id)
      this.throw(400, 'Group id is required');

    if (!body.user_id)
      this.throw(400, 'Member id is required');

    var foundMember = yield members.findOne({
      group_id: body.group_id,
      user_id: body.user_id
    });
    if (foundMember)
      this.throw(409, 'Member with user_id=' + body.user_id + ' in group_id=' + body.group_id + ' is exists');

    var createdMembers = yield members.insert(body);
    if (!createdMembers)
      this.throw(405, 'Member could not be created');

    this.status = 201;
    this.set('Location', this.originalUrl + '/' + createdMembers._id);
    this.body = 'Done';
  },

  // PUT a new data to group by :id
  modify: function *(id, next) {
    if ('PUT' != this.method) return yield next;

    var data = yield parse(this);

    var member = yield members.findOne({_id: id});
    if (!member)
      this.throw (404, 'Group with id=' + id + ' was not found');

    var updatedMember = yield members.update(member, {$set: data});
    if (!updatedMember)
      this.throw(405, 'Unable to update');
    else
      this.body = 'Done';
  },

  // REMOVE group by :id
  remove: function *(id, next) {
    if ('DELETE' != this.method) return yield next;

    var member = yield members.findOne({_id: id});
    if (!member)
      this.throw(404, 'Member with id=' + id + ' was not found');

    var removedMember = yield members.remove(member);
    if (!removedMember)
      this.throw(405, 'Unable to remove');
    else
      this.body = 'Done';
  },

  // HEAD
  head: function *() {
    this.set('Connection', 'Close');
    this.status = 200;
  },

  // OPTIONS
  options: function *() {
    this.set('Allow', 'HEAD,GET,POST,PUT,DELETE,OPTIONS');
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
