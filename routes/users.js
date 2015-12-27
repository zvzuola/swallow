var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('movie', { title: 'users', label: '电影' });
});

module.exports = router;
