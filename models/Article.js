var mongodb = require('./mongodb');
var Schema = mongodb.mongoose.Schema;
var ArticleSchema = new Schema({
	title : String,
	excerpt: String,
	author: String,
	time: Date,
	content: String
});
var Article = mongodb.mongoose.model("Article", ArticleSchema);
var ArticleDAO = function(){};
ArticleDAO.prototype.save = function(obj, callback) {
	var instance = new Article(obj);
	instance.save(function(err){
		callback(err);
	});
};

ArticleDAO.prototype.find = function(callback) {
	Article.find(function(err, obj){
		console.log(obj);
		callback(err, obj);
	});
};

module.exports = new ArticleDAO();
