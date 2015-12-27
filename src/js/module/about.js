'use strict';

var Component = require('../component/base/component.js');
var template = require('./about.html');
var _ = require('../component/base/util.js');

var About = Component.extend({
	template: template,
	config: function(){
		_.extend(this.data,{
			
		})
	},
	init: function(){
    	this.supr() // call the super init
  	},
	enter: function() {
		this.$update();
		console.log('enter About');
	}
});

module.exports = About;