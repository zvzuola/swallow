var express = require('express');
var router = express.Router();
var Article = require('./../models/Article.js');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/post/get_articles',function(req, res) {
	Article.find(function(err, obj){
		console.log(obj);
		res.json({
			code:200,
			result:obj
		});
	});
	
});

router.post('/post/new_article',function(req, res) {
	console.log(req.body.content,req.body);
	var newArticle = req.body;
	newArticle.time = new Date();
	Article.save(newArticle,function(err){
		if(err) {
			res.send({'success':false,'err':err});
		}
		else {
			res.send({'success':true});
		}
	})
});

module.exports = router;
