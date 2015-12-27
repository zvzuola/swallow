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
			console.log(result);
		});
		this.data.articleList=[
			{title:'第一篇',author:'zv',time:'2015-12-15'},
			{title:'第二篇',author:'zv',time:'2015-12-15'},
			{title:'第三篇',author:'zv',time:'2015-12-15'}
		]
	}
});

module.exports = About;