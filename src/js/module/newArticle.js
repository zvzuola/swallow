'use strict';

var Component = require('../component/base/component.js');
var template = require('./newArticle.html');
var _ = require('../component/base/util.js');
// var serviceHome = require('../service/write.js');

var About = Component.extend({
	template: template,
	config: function(){
		// _.extend(this.data,{
  //           articleList:[]
		// })
	},
	init: function(){
    	this.supr() // call the super init
  	},
	enter: function() {
		console.log('enter App');
	}
	
});

module.exports = About;