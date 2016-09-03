var koa = require('koa');
var app = koa();
var port = process.env.PORT || 3000;

app.listen(port);
console.log('Server is listening to ' + port);