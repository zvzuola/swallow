/**
 * ------------------------------------------------------------
 * ContextMenu       上下文菜单组件
 * @author   hzyangzhouzhi(hzyangzhouzhi@corp.netease.com)
 * ------------------------------------------------------------
 */

'use strict';
var Regular = require('regularjs');
var SourceComponent = require('../base/sourceComponent.js');
var template = require('./contextMenu.html');
var _ = require('../base/util.js');
var Menu = require('./menu.js');
var MenuInner = require('./menuInner.js');


var ContextMenu = Menu.extend({
	name: 'contextMenu',
	template: template,
	/**
	 * @protected
	 */
	config: function(){
		_.extend(this.data, {
			source: {},
			show: false,
			x: 0,
			y: 0
		});
		this.supr(false);
	},
	init: function(){
		this.$inject(document.body);
		this.supr();
	},
	showMenu: function(x, y) {
		this.toggle(true);
		var h = document.body.clientHeight,
			w = document.body.clientWidth;
		var offset = this.$refs.inner.$refs.menuEl.getBoundingClientRect();
		if	(x + offset.width > w) {
			x -= offset.width;
		}
		if ((y + offset.height) > h ) {
			y -= offset.height;
		}
		this.$update('x', x);
		this.$update('y', y);
	},
	hideMenu: function() {
		this.toggle(false);
	}
});

module.exports = ContextMenu;