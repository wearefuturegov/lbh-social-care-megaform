const server = require('restana')();
const app = require('next')({dev: false});
const files = require('serve-static');
const path = require('path');
const bodyParser = require('body-parser');
const nextRequestHandler = app.getRequestHandler();

server.use(files(path.join(__dirname, 'build')));
server.use(files(path.join(__dirname, 'public')));

server.all(
    '/api/*',
    bodyParser.json(),
    bodyParser.urlencoded(),
    (req, res) => {
        console.log(JSON.stringify(req.body));
        return nextRequestHandler(req, res)
    },
);

server.all('*', (req, res) => nextRequestHandler(req, res));

module.exports.handler = require('serverless-http')(server);
