var parse = require('co-body');
var monk = require('monk');
var wrap = require('co-monk');
var _ = require('koa-route');
var koa = require('koa');

var app = koa();

var dbUri = process.env.MONGODB_URI || 'localhost/liqo';
var db = monk(dbUri);
var ibadahs = wrap(db.get('ibadah'));

var routes = {

  // GET all ibadah
  index: function *(next) {
    if ('GET' != this.method) return yield next;

    var list = yield ibadahs.find({});
    this.body = list;
  },

  // GET ibadah by :id
  show: function *(id, next) {
    if ('GET' != this.method) return yield next;

    var ibadah = yield ibadahs.findOne({_id: id});

    if (!ibadah)
      this.throw(404, 'Ibadah with id=' + id + ' was not found');

    this.body = ibadah;
  },

  // POST a new ibadah
  create: function *(next) {
    if ('POST' != this.method) return yield next;

    var body = yield parse(this);
    if (!body.name)
      this.throw(400, 'Name is required');

    if (!body.type)
      this.throw(400, 'Type [yesno | fillnumber] is required');

    var foundIbadah = yield ibadahs.findOne({name: body.name});
    if (foundIbadah)
      this.throw(409, 'Ibadah with name=' + body.name + ' is exists');

    var createdIbadah = yield ibadahs.insert(body);
    if (!createdIbadah)
      this.throw(405, 'Ibadah could not be created');

    this.status = 201;
    this.set('Location', this.originalUrl + '/' + createdIbadah._id);
    this.body = 'Done';
  },

  // PUT a new data to ibadah by :id
  modify: function *(id, next) {
    if ('PUT' != this.method) return yield next;

    var data = yield parse(this);

    var ibadah = yield ibadahs.findOne({_id: id});
    if (!ibadah)
      this.throw(404, 'Ibadah with id=' + id + ' was not found');

    var updatedIbadah = yield ibadahs.update(ibadah, {$set: data});
    if (!updatedIbadah)
      this.throw(405, 'Unable to update');
    else
      this.body = 'Done';
  },

  // REMOVE ibadah by :id
  remove: function *(id, next) {
    if ('DELETE' != this.method) return yield next;

    var ibadah = yield ibadahs.findOne({_id: id});
    if (!ibadah)
      this.throw(404, 'Ibadah with id=' + id + ' was not found');

    var removedIbadah = yield ibadahs.remove(ibadah);
    if (!removedIbadah)
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
