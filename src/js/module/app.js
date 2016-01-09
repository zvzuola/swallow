'use strict';

var Component = require('../component/base/component.js');
var template = require('./app.html');
var _ = require('../component/base/util.js');
var nav = require('../component/common/nav.js');

var App = Component.extend({
	template: template,
	config: function(){
		_.extend(this.data,{
			source:[
                { name: '首页', module: 'home', icon: 'home' },
                { name: '关于我', module: 'about', icon: 'user' },
                { name: '随笔', module: 'essays', icon: 'pencil' },
                { name: '留言板', module: 'message', icon: 'chat' }
            ]
		})
	},
	init: function(){
  	this.supr() // call the super init
	},
	enter: function(){
		
	}
});

module.exports = App;