var config = require('./server-config'),
  express = require('express'),
  app = express(),
  server = require('http').createServer(app),
  mockFileRoot = config.data_location,
  fs = require('fs');

var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var extendUrl = require('extend-url');
var parseUrl = require("parse-url");
var _ = require('lodash');
var winston = require('winston');

// CONFIG SERVER
//allows us to write cookies
app.use(cookieParser());

//allows server to run as proxy
app.enable('trust proxy');
app.use(bodyParser.json());
app.use(express.static(config.static_site_root));

var responseCache = {};

function getMock(path, cacheResponse) {
  var mockResponse = responseCache[path];

  cacheResponse = cacheResponse || false;

  if (!mockResponse) {
    mockResponse = fs.readFileSync(path);
    mockResponse = JSON.parse(mockResponse);
    mockResponse = JSON.stringify(mockResponse).replace(/https:\/\/api\.github\.com/gi, '/api');
    if(cacheResponse) {
      responseCache[path] = mockResponse;
    }
  }

  return mockResponse;
}

/**
 * Sends `default.json` that matches the path of the request
 * from the data dir. Assumes a rigid directory structure that
 * matches the route exactly.
 *
 * @param req
 * @param res
 */
function sendDefault(req, res) {
  var endpoint,
    splitPath = req.params[0].split('?')[0].split("/"),
    mockPath = mockFileRoot + req.params[0] + '/' + 'default.json',
    mockResponse;

  if (splitPath.length > 2)
    endpoint = splitPath[splitPath.length - 2];

  console.log(endpoint);

  try {
    mockResponse = getMock(mockPath);
    setTimeout(function() {
      res.status(200).send(JSON.parse(mockResponse))
    }, 10)

  } catch (err) {
    console.log(err);
    res.status(500).send(JSON.parse(err));
  }
}

function searchContracts(req, res) {
  var mockPath = mockFileRoot + '/Agreement/Contract/all_contracts.json',
    response = JSON.parse(getMock(mockPath));

  if(req.query['serviceRequesterCd']) {
    response = _.first(_.where(response, {serviceRequesterCd: parseInt(req.query['serviceRequesterCd'], 10)}), 8);
  } else {
    response = _.first(response, 50);
  }

  console.log(req);
  res.status(200).send(response);
}

function loadContract(req,res) {
  var mockPath = mockFileRoot + '/Agreement/Contract/all_contracts.json',
    response = JSON.parse(getMock(mockPath));
console.log(req);
  if (req.query['serviceRequesterCd']) {
    response = _.first(_.where(response, {serviceRequesterCd: parseInt(req.query['serviceRequesterCd'], 10)}), 8);
  } else {
    response = _.first(response, 50);
  }

  res.status(503).send({error:'blahblah'});
}

app.get(config.rest_base_url + '/Agreement/Contract/search', searchContracts);
app.get(config.rest_base_url + '/Agreement/Contract/:id', loadContract);

app.get(config.rest_base_url + '/*', sendDefault);
app.post(config.rest_base_url + '/*', sendDefault);

// FIRE IT UP

server.listen(config.port, function () {
  console.log("Express server listening on port %d", config.port);
});
