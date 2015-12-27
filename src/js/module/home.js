'use strict';

var Component = require('../component/base/component.js');
var template = require('./home.html');
var _ = require('../component/base/util.js');
var articleList = require('../component/common/articleList.js');
var serviceHome = require('../service/home.js');

var About = Component.extend({
	template: template,
	config: function(){
		_.extend(this.data,{
            articleList:[]
		})
	},
	init: function(){
    	this.supr() // call the super init
  	},
	enter: function() {
		console.log('enter App');
		this.getArticles();
	},
	getArticles: function(){
		serviceHome.getArticleList({}, function(result){
			this.data.articleList=result;
			this.$update();
		}.bind(this));
	}
});

module.exports = About;