var parse = require('co-body');
var monk = require('monk');
var wrap = require('co-monk');
var _ = require('koa-route');
var koa = require('koa');

var app = koa();

var dbUri = process.env.MONGODB_URI || 'localhost/liqo';
var db = monk(dbUri);
var mutabaahs = wrap(db.get('mutabaah'));

var routes = {

  // GET all mutabaah
  index: function *(next) {
    if ('GET' != this.method) return yield next;

    var list = yield mutabaahs.find({});
    this.body = list;
  },

  // GET mutabaah by :id
  show: function *(id, next) {
    if ('GET' != this.method) return yield next;

    var mutabaah = yield mutabaahs.findOne({_id: id});

    if (!mutabaah)
      this.throw(404, 'Mutabaah with id=' + id + ' was not found');

    this.body = mutabaah;
  },

  // POST a new mutabaah
  create: function *(next) {
    if ('POST' != this.method) return yield next;

    var body = yield parse(this);
    if (!body.user_id)
      this.throw(400, 'User id is required');

    if (!body.group_id)
      this.throw(400, 'Group id is required');

    if (!body.date)
      this.throw(400, 'Date is required');

    var foundMutabaah = yield mutabaahs.findOne({
      user_id: body.user_id,
      group_id: body.group_id,
      date: body.date
    });
    if (foundMutabaah)
      this.throw(409, 'Mutabaah at date=' + body.date + ' for user_id=' + body.user_id + ' and group_id=' + body.group_id + ' is exists');

    if (!body.records)
      this.throw(400, 'Record data is required');

    for (var record of body.records) {
      if (!record.ibadah_id)
        this.throw(400, 'Record id is required');

      if (record.value == 'undefined')
        this.throw(400, 'Record value is required');
    }

    var createdMutabaah = yield mutabaahs.insert(body);
    if (!createdMutabaah)
      this.throw(405, 'Mutabaah could not be created');

    this.status = 201;
    this.set('Location', this.originalUrl + '/' + createdMutabaah._id);
    this.body = 'Done';
  },

  // PUT a new data to mutabaah by :id
  modify: function *(id, next) {
    if ('PUT' != this.method) return yield next;

    var data = yield parse(this);

    var mutabaah = yield mutabaahs.findOne({_id: id});
    if (!mutabaah)
      this.throw(404, 'Mutabaah with id=' + id + ' was not found');

    var updatedMutabaah = yield mutabaahs.update(mutabaah, {$set: data});
    if (!updatedMutabaah)
      this.throw(405, 'Unable to update');
    else
      this.body = 'Done';
  },

  // REMOVE mutabaah by :id
  remove: function *(id, next) {
    if ('DELETE' != this.method) return yield next;

    var mutabaah = yield mutabaahs.findOne({_id: id});
    if (!mutabaah)
      this.throw(404, 'Mutabaah with id=' + id + ' was not found');

    var removedMutabaah = yield mutabaahs.remove(mutabaah);
    if (!removedMutabaah)
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
