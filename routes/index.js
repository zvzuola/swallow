var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/ajax/articles',function(req, res) {
	res.json({
		code:200,
		result:[
			{title:'Binaryen 项目进展, 以及一些关于 WebAssembly 的特点',author:'zv',time:'2015-12-19',excerpt:'大概算是一份教程吧, 只不过效果肯定不如视频演示之类的好为了解决简聊当中一些问题, 我消耗了很多时间了解 Webpack, 整理在这里'},
			{title:'Swift 的变化：从 2.2 到 3.0 会带来什么',author:'zv',time:'2015-12-19',excerpt:'如果你还没看过 Swift 发展路线图，我建议你要好好看一看。目前为止，有四个针对 Swift 3 和一个针对 Swift 2.2 的...'}
		]
	});
})

module.exports = router;
