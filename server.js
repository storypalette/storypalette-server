require('dotenv').config({silent: true});

var config = require('./config');
var express = require('express');
var morgan = require('morgan');
var cors = require('cors');
var bodyParser  = require('body-parser');

var app = express();

var auth = require('./lib/auth');
var fileManager = require('./lib/fileManager')(app);
var db = require('./lib/db').getDb(process.env.MONGO_URI);
var api = require('./lib/api');

// Setup sockets
// And (for now) set up /info/activity endpoint
const server = require('http').Server(app);
require('./routes/ws')(server, app);

app.use(morgan('dev'));

// Init authorization middleware.
auth.init({
  db: db,
  secret: process.env.TOKEN_SECRET,
});

// Enable CORS for everything (for now)
app.use(cors());

// Parse application/json, TODO: Do we need urlencoded?
app.use(bodyParser.json());

var apiBase = '/v1/';

// API status and info
app.all(apiBase, api.info.main);
//app.get(`${apiBase}info/activity`, routes.api.activity);

// Authentication API
app.post(apiBase + 'authenticate', auth.authenticate);

// Media API
app.get(apiBase + 'image/*', fileManager.getImage);
app.get(apiBase + 'sound/:id/:ext', fileManager.getSound);
app.post(apiBase + 'file', fileManager.postFile);

// Palette API
app.get(apiBase + 'palettes', api.palette.all);
app.get(apiBase + 'palettes/:id', api.palette.one);
app.post(apiBase + 'palettes', api.palette.create);
app.put(apiBase + 'palettes/:id', api.palette.update);
app.delete(apiBase + 'palettes/:id', api.palette.destroy);

app.get(apiBase + 'resources', api.resource.all);
app.get(apiBase + 'resources/:id', api.resource.one);
app.post(apiBase + 'resources', api.resource.create);
app.put(apiBase + 'resources/:id', api.resource.update);
app.delete(apiBase + 'resources/:id', api.resource.destroy);

app.get(apiBase + 'users', api.user.all);
app.get(apiBase + 'users/:id', api.user.one);
app.post(apiBase + 'users', api.user.create);
app.delete(apiBase + 'users/:id', api.user.destroy);
app.get(apiBase + 'users/:id/players', api.user.getPlayers);

app.get(apiBase + 'organisations', api.organisation.list);
app.get(apiBase + 'organisations/:id', api.organisation.get);

// Start server.
var port = process.env.PORT || config.port;
server.listen(port, function() {
  console.log('storypalette-server listening on port %d in %s mode', port, app.settings.env);
});
