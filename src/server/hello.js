/*jshint esversion: 6 */

var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res) {
  res.send("Hello, fuckers.");
});



module.exports = router;
