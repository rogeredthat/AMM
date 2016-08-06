/*jshint esversion: 6 */
module.exports = function () {
  var express = require('express');
  var router = express.Router();
  var config = require('../../config.json');
  var fs = require('fs');
  var indexer = require('./indexer.js');
  router.get('/index', function (req, res) {
    res.send(indexer.returnIndex());
  });

  router.get('/file/*', function (req, res) {
    var stream = fs.createReadStream(decodeURI(req.url.substring(5)));
    stream.pipe(res);
  });
  router.get('/update', function (req, res) {
    indexer.updateIndex();
    res.send("doing");
  });
  return router;
}();
