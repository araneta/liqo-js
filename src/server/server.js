import path from 'path';
import koa from 'koa';
import serve from 'koa-static';
import mount from 'koa-mount';
import jwt from 'koa-jwt';

import apiAuth from './api/auth';
import apiUsers from './api/users';
import apiIbadahs from './api/ibadahs';
import apiMutabaahs from './api/mutabaahs';

const app = koa();
const port = process.env.PORT || 3000;
const secret = process.env.SIGNING_SECRET || 'secret';

const staticDir = path.join(process.cwd(), './static');
app.use(serve(staticDir));

// unprotected middleware
app.use(mount('/api/auth', apiAuth));

// middleware below is protected unless POST request
app.use(jwt({secret: secret}).unless({method: ['POST']}));
// semi-protected middleware
app.use(mount('/api/users', apiUsers));

// middleware below is protected
app.use(jwt({secret: secret}));
// protected middleware
app.use(mount('/api/ibadahs', apiIbadahs));
app.use(mount('/api/mutabaahs', apiMutabaahs));

app.listen(port);
console.log('Listening on port 3000');
