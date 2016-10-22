var parse = require('co-body');
var monk = require('monk');
var wrap = require('co-monk');
var _ = require('koa-route');
var koa = require('koa');

var app = koa();

var dbUri = process.env.MONGODB_URI || 'localhost/liqo';
var db = monk(dbUri);
var groups = wrap(db.get('groups'));
var members = wrap(db.get('members'));
var allibadahs = wrap(db.get('ibadah'));

var routes = {

  // GET all groups
  index: function *(next) {
    if ('GET' != this.method) return yield next;

    var list = yield groups.find({});
    this.body = list;
  },

  // GET groups by :id
  show: function *(id, next) {
    if ('GET' != this.method) return yield next;

    var group = yield groups.findOne({_id: id});

    if (!group)
      this.throw(404, 'Group with id=' + id + ' was not found');

    this.body = group;
  },

  // GET ibadahs for this group
  ibadahs: function *(id, next) {
    if ('GET' != this.method) return yield next;
    
    var group = yield groups.findOne({_id: id});

    if (!group)
      this.throw (404, 'Group with id=' + id + ' was not found');

    var list = yield allibadahs.find({group_id: id});

    this.body = list;
  },

  // GET members for this group
  members: function *(id, next) {
    if ('GET' != this.method) return yield next;

    var group = yield groups.findOne({_id: id});

    if (!group)
      this.throw (404, 'Group with id=' + id + ' was not found');

    var list = yield members.find({group_id: id});

    this.body = list;
  },

  // POST a new group
  create: function *(next) {
    if ('POST' != this.method) return yield next;

    var body = yield parse(this);
    if (!body.owner_id)
      this.throw(400, 'Owner id is required');

    if (!body.name)
      this.throw(400, 'Name is required');

    var foundGroup = yield groups.findOne({
      owner_id: body.owner_id,
      name: body.name
    });
    if (foundGroup)
      this.throw(409, 'Group with name=' + body.name + ' created by owner_id=' + body.owner_id + ' is exists');

    var createdGroup = yield groups.insert(body);
    if (!createdGroup)
      this.throw(405, 'Group could not be created');

    var query = {
      group_id: createdGroup._id.toString(),
      user_id: body.owner_id
    };
    var foundMember = yield members.findOne(query);
    if (!foundMember)
      yield members.insert(query);

    this.status = 201;
    this.set('Location', this.originalUrl + '/' + createdGroup._id);
    this.body = 'Done';
  },

  // PUT a new data to group by :id
  modify: function *(id, next) {
    if ('PUT' != this.method) return yield next;

    var data = yield parse(this);

    var group = yield groups.findOne({_id: id});
    if (!group)
      this.throw (404, 'Group with id=' + id + ' was not found');

    var updatedGroup = yield groups.update(group, {$set: data});
    if (!updatedGroup)
      this.throw(405, 'Unable to update');
    else
      this.body = 'Done';
  },

  // REMOVE group by :id
  remove: function *(id, next) {
    if ('DELETE' != this.method) return yield next;

    var group = yield groups.findOne({_id: id});
    if (!group)
      this.throw(404, 'Group with id=' + id + ' was not found');

    var removedGroup = yield groups.remove(group);
    if (!removedGroup)
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
app.use(_.get('/:id/ibadahs', routes.ibadahs));
app.use(_.get('/:id/members', routes.members));
app.use(_.post('/', routes.create));
app.use(_.put('/:id', routes.modify));
app.use(_.delete('/:id', routes.remove));
app.use(_.options('/', routes.options));
app.use(_.trace('/', routes.trace));
app.use(_.head('/', routes.head));

module.exports = app;
